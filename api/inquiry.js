/* Public inquiry intake: validated, rate-limited, exactly-once per Idempotency-Key, stored before any notification.
   Optional photos (max 3) are signature-checked and stored privately: they are only served through the signed-in admin endpoint. */
const L=require('../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const b=L.body(req);if(!b)return L.send(res,400,{error:'Invalid request.'});if(b.hp||b.website)return L.send(res,200,{id:'MQ-OK'});
 const admin=await L.session(req).catch(()=>null);
 if(!admin&&!(await L.limit('inq:'+L.ip(req),6,3600)))return L.send(res,429,{error:'Too many inquiries from this connection. Please call or WhatsApp us instead.'});
 const d=L.cleanInquiry(b),key=L.S(req.headers['idempotency-key']||b.key,80).replace(/[^\w-]/g,'');if(key.length<8)return L.send(res,400,{error:'Missing request key.'});
 const photos=[];for(const p of (Array.isArray(b.photos)?b.photos:[]).slice(0,3)){const m=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(p||''));if(!m)return L.send(res,400,{error:'Photos must be JPEG, PNG or WebP.'});const buf=Buffer.from(m[2],'base64');if(buf.length>900000)return L.send(res,413,{error:'A photo is too large.'});const t=L.sniff(buf);if(!t||t!==m[1])return L.send(res,400,{error:'A photo could not be verified as an image.'});photos.push({t,b64:m[2]})}
 const id=L.rid('MQ-',4);const claimed=await L.R('SET','idem:'+key,id,'NX','EX',86400);
 if(claimed===null){const prev=await L.R('GET','idem:'+key);return L.send(res,200,{id:prev,duplicate:true})}
 for(let i=0;i<photos.length;i++){await L.R('SET','inqimg:'+id+':'+i,photos[i].b64);await L.R('SET','inqimg:'+id+':'+i+':t',photos[i].t)}
 const now=new Date().toISOString();const rec=Object.assign(d,{id,at:now,photos:photos.length,channel:admin&&b.channel?L.S(b.channel,20):'website'});
 await L.R('SET','inq:'+id,JSON.stringify(rec));await L.R('SET','wf:'+id,JSON.stringify(L.WF.fresh(id,now)));await L.R('LPUSH','inq:ids',id);
 L.send(res,201,{id})},['POST']);
