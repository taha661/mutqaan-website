/* Public inquiry intake: validated, rate-limited, exactly-once per Idempotency-Key, stored before any notification. */
const L=require('../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const b=L.body(req);if(!b)return L.send(res,400,{error:'Invalid request.'});if(b.hp||b.website)return L.send(res,200,{id:'MQ-OK'});
 const admin=await L.session(req).catch(()=>null);
 if(!admin&&!(await L.limit('inq:'+L.ip(req),6,3600)))return L.send(res,429,{error:'Too many inquiries from this connection. Please call or WhatsApp us instead.'});
 const d=L.cleanInquiry(b),key=L.S(req.headers['idempotency-key']||b.key,80).replace(/[^\w-]/g,'');if(key.length<8)return L.send(res,400,{error:'Missing request key.'});
 const id=L.rid('MQ-',4);const claimed=await L.R('SET','idem:'+key,id,'NX','EX',86400);
 if(claimed===null){const prev=await L.R('GET','idem:'+key);return L.send(res,200,{id:prev,duplicate:true})}
 const now=new Date().toISOString();const rec=Object.assign(d,{id,at:now,channel:admin&&b.channel?L.S(b.channel,20):'website'});
 await L.R('SET','inq:'+id,JSON.stringify(rec));await L.R('SET','wf:'+id,JSON.stringify(L.WF.fresh(id,now)));await L.R('LPUSH','inq:ids',id);
 L.send(res,201,{id})},['POST']);
