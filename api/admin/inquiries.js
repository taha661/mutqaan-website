/* Admin inbox + workflow. Every write re-applies the shared workflow rules server-side with a compare-and-set on the record version. */
const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{await L.needAdmin(req);
 if(req.method==='GET'){const ids=await L.R('LRANGE','inq:ids','0','499');if(!ids.length)return L.send(res,200,{items:[]});const a=await L.R('MGET',...ids.map(i=>'inq:'+i)),w=await L.R('MGET',...ids.map(i=>'wf:'+i));
  return L.send(res,200,{items:ids.map((id,i)=>a[i]?{inq:JSON.parse(a[i]),wf:w[i]?JSON.parse(w[i]):L.WF.fresh(id,null),key:id}:null).filter(Boolean)})}
 const b=L.body(req)||{},id=String(b.id||'').replace(/[^\w-]/g,'');const cur=await L.R('GET','wf:'+id);if(!cur)return L.send(res,404,{error:'Not found'});const rec=JSON.parse(cur);
 let next;try{next=L.WF.apply(rec,b.action||{},'owner',new Date().toISOString())}catch(e){return L.send(res,e.code==='stale'?409:400,{error:e.message})}
 const ok=await L.R('CAS','wf:'+id,JSON.stringify(next),rec.v);if(!ok)return L.send(res,409,{error:'This record changed since you opened it. Reload and try again.'});L.send(res,200,{wf:next})},['GET','POST']);
