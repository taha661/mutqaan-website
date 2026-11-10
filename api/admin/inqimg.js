/* Private inquiry photo: signed-in owner only, never cached publicly. */
const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{await L.needAdmin(req);const id=String((req.query&&req.query.id)||'').replace(/[^\w-]/g,'').slice(0,20),n=Math.min(2,Math.max(0,parseInt((req.query&&req.query.n)||'0',10)||0));
 const [d,t]=await L.R('MGET','inqimg:'+id+':'+n,'inqimg:'+id+':'+n+':t');if(!d||!t)return L.send(res,404,{error:'Not found'});
 res.statusCode=200;res.setHeader('Content-Type',t);res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex');res.end(Buffer.from(d,'base64'))},['GET']);
