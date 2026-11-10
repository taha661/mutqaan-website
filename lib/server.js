/* Shared server helpers for Mutqaan's Vercel functions. No third-party dependencies. */
const crypto=require('crypto');
const WF=require('./workflow.js');
const env=k=>process.env[k]||'';
/* ---------- store: Upstash Redis REST (Vercel Marketplace) or in-memory for tests ---------- */
const MEM=new Map();
function memCmd(c){const [op,...a]=c.map(String),o=op.toUpperCase();const now=Date.now(),get=k=>{const v=MEM.get(k);if(!v)return null;if(v.exp&&v.exp<now){MEM.delete(k);return null}return v};
 switch(o){case 'GET':{const v=get(a[0]);return v?v.val:null}
 case 'SET':{const nx=a.includes('NX'),ex=a.indexOf('EX');if(nx&&get(a[0]))return null;MEM.set(a[0],{val:a[1],exp:ex>0?now+(+a[ex+1])*1000:0});return 'OK'}
 case 'DEL':{return MEM.delete(a[0])?1:0}
 case 'INCR':{const v=get(a[0]);const n=(v?+v.val:0)+1;MEM.set(a[0],{val:String(n),exp:v?v.exp:0});return n}
 case 'DECR':{const v=get(a[0]);const n=(v?+v.val:0)-1;MEM.set(a[0],{val:String(n),exp:v?v.exp:0});return n}
 case 'EXPIRE':{const v=get(a[0]);if(v&&!v.exp)v.exp=now+(+a[1])*1000;return v?1:0}
 case 'LPUSH':{const v=get(a[0])||{val:[]};v.val=[a[1]].concat(v.val);MEM.set(a[0],v);return v.val.length}
 case 'LTRIM':{const v=get(a[0]);if(v)v.val=v.val.slice(+a[1],+a[2]+1);return 'OK'}
 case 'LRANGE':{const v=get(a[0]);return v?v.val.slice(+a[1],+a[2]+1):[]}
 case 'MGET':{return a.map(k=>{const v=get(k);return v?v.val:null})}
 case 'CAS':{const cur=get(a[0]);if(cur){const v=JSON.parse(cur.val).v;if(v!==+a[2])return 0}MEM.set(a[0],{val:a[1],exp:0});return 1}
 default:throw new Error('mem: '+o)}}
const URLR=()=>env('KV_REST_API_URL')||env('UPSTASH_REDIS_REST_URL'),TOK=()=>env('KV_REST_API_TOKEN')||env('UPSTASH_REDIS_REST_TOKEN');
const hasStore=()=>env('MQ_TEST')==='1'||!!(URLR()&&TOK());
const CAS_LUA="local c=redis.call('GET',KEYS[1]) if c then local v=cjson.decode(c).v if v~=tonumber(ARGV[2]) then return 0 end end redis.call('SET',KEYS[1],ARGV[1]) return 1";
async function R(...c){if(env('MQ_TEST')==='1')return memCmd(c);if(!hasStore())throw Object.assign(new Error('store'),{status:503,public:'The inquiry inbox is not connected yet.'});
 if(String(c[0]).toUpperCase()==='CAS')c=['EVAL',CAS_LUA,'1',c[1],c[2],String(c[3])];
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);try{const r=await fetch(URLR(),{method:'POST',headers:{Authorization:'Bearer '+TOK(),'Content-Type':'application/json'},body:JSON.stringify(c.map(String)),signal:ctl.signal});const j=await r.json();if(j.error)throw new Error('redis');return j.result}finally{clearTimeout(t)}}
/* ---------- http helpers ---------- */
function send(res,code,obj,headers){res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');for(const k in (headers||{}))res.setHeader(k,headers[k]);res.end(JSON.stringify(obj))}
function ip(req){return String((req.headers['x-forwarded-for']||'').split(',')[0]||req.headers['x-real-ip']||req.socket&&req.socket.remoteAddress||'?').trim().slice(0,64)}
function sameOrigin(req){const o=req.headers.origin;if(!o)return true;try{return new URL(o).host===req.headers.host}catch(e){return false}}
function body(req){if(req.body&&typeof req.body==='object')return req.body;try{return JSON.parse(req.body||'{}')}catch(e){return null}}
async function limit(key,max,sec){const n=await R('INCR','rl:'+key);if(n===1)await R('EXPIRE','rl:'+key,sec);return n<=max}
function wrap(fn,methods){return async(req,res)=>{try{if(!methods.includes(req.method)){res.setHeader('Allow',methods.join(', '));return send(res,405,{error:'Method not allowed'})}
 if(req.method!=='GET'){if(!sameOrigin(req))return send(res,403,{error:'Cross-origin request refused'});if(!/application\/json/.test(req.headers['content-type']||''))return send(res,415,{error:'JSON required'})}
 await fn(req,res)}catch(e){const s=e.status||500;if(s>=500&&env('MQ_TEST')!=='1')console.error('mq_error',e.code||e.message);send(res,s,{error:e.public||(s===500?'Something went wrong. Please try again or contact us directly.':e.message)})}}}
/* ---------- sessions ---------- */
const b64u=b=>Buffer.from(b).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
function secret(){const s=env('SESSION_SECRET');if(s.length<32)throw Object.assign(new Error('cfg'),{status:503,public:'Admin sign-in is not configured.'});return s}
function sign(p){const d=b64u(JSON.stringify(p));return d+'.'+b64u(crypto.createHmac('sha256',secret()).update(d).digest())}
function verify(tok){if(!tok||typeof tok!=='string')return null;const [d,s]=tok.split('.');if(!d||!s)return null;const exp=b64u(crypto.createHmac('sha256',secret()).update(d).digest());const a=Buffer.from(s),b=Buffer.from(exp);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
 try{const p=JSON.parse(Buffer.from(d.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());return p.exp>Date.now()?p:null}catch(e){return null}}
function cookie(req,n){const m=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(n+'='));return m?decodeURIComponent(m.slice(n.length+1)):null}
async function session(req){const p=verify(cookie(req,'mq_s'));if(!p)return null;const rev=await R('GET','sess:revoked:'+p.n);return rev?null:p}
async function needAdmin(req){const p=await session(req);if(!p)throw Object.assign(new Error('auth'),{status:401,public:'Please sign in.'});return p}
function pwOk(given){const want=env('ADMIN_PASSWORD');if(want.length<12)throw Object.assign(new Error('cfg'),{status:503,public:'Admin sign-in is not configured.'});const h=x=>crypto.createHash('sha256').update(String(x)).digest();return crypto.timingSafeEqual(h(given||''),h(want))}
/* ---------- validation ---------- */
const S=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n):'';
const SVC=['','construction','interiors','renovation','drawings','estimation','consultancy','visualisation'];
function cleanInquiry(b){const o={name:S(b.name,120),contact:S(b.contact,160),svc:SVC.includes(b.svc)?b.svc:'',loc:S(b.loc,160),ptype:S(b.ptype,30),timing:S(b.timing,40),budget:S(b.budget,60),msg:S(b.msg,4000),brief:S(b.brief,8000),marketing:b.marketing===true};
 if(!o.name||!o.contact||!o.msg)throw Object.assign(new Error('v'),{status:400,public:'Name, contact and message are required.'});return o}
const SAFE_SRC=s=>typeof s==='string'&&(/^media\/[\w.\-\/]+$/.test(s)&&!s.includes('..')||/^\/api\/media\?id=[\w\-]+$/.test(s));
function cleanContent(c){if(!c||typeof c!=='object'||!Array.isArray(c.services)||!Array.isArray(c.projects)||!Array.isArray(c.materials)||!c.settings)throw Object.assign(new Error('v'),{status:400,public:'Content is not in the expected format.'});
 const txt=JSON.stringify(c);if(txt.length>900000)throw Object.assign(new Error('v'),{status:413,public:'Content is too large.'});
 for(const p of c.projects){for(const m of (p.media||[]))if(!SAFE_SRC(m.src))throw Object.assign(new Error('v'),{status:400,public:'Image source not allowed in project '+S(p.title,60)});if(p.pub&&(p.media||[]).length&&!S(p.provenance,2000))throw Object.assign(new Error('v'),{status:400,public:'Project "'+S(p.title,60)+'" needs media permission and provenance before publishing.'})}
 for(const s of c.services){if(s.img&&!SAFE_SRC(s.img))throw Object.assign(new Error('v'),{status:400,public:'Image source not allowed in service '+S(s.name,60)})}
 const a=c.settings.ai||{};if(!(a.maxPhotos>=0&&a.maxPhotos<=3&&a.directions>=2&&a.directions<=3&&a.refinements>=0&&a.refinements<=2))throw Object.assign(new Error('v'),{status:400,public:'AI limits are out of range.'});return c}
function sniff(buf){if(buf.length>3&&buf[0]===0xFF&&buf[1]===0xD8&&buf[2]===0xFF)return 'image/jpeg';if(buf.length>8&&buf.slice(0,8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])))return 'image/png';if(buf.length>12&&buf.slice(0,4).toString()==='RIFF'&&buf.slice(8,12).toString()==='WEBP')return 'image/webp';return null}
const rid=(p,n)=>p+crypto.randomBytes(n||5).toString('hex').toUpperCase();
module.exports={R,hasStore,send,ip,body,limit,wrap,sign,verify,session,needAdmin,pwOk,cleanInquiry,cleanContent,sniff,rid,WF,S,env,MEM};
