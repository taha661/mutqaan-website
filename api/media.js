const L=require('../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const id=String((req.query&&req.query.id)||'').replace(/[^\w-]/g,'').slice(0,40);if(!id)return L.send(res,400,{error:'Missing id'});const [d,t]=await L.R('MGET','media:'+id,'media:'+id+':t');if(!d||!t)return L.send(res,404,{error:'Not found'});
 res.statusCode=200;res.setHeader('Content-Type',t);res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Disposition','inline');res.end(Buffer.from(d,'base64'))},['GET']);
