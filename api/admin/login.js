const L=require('../../lib/server.js'),crypto=require('crypto');
module.exports=L.wrap(async(req,res)=>{if(!(await L.limit('login:'+L.ip(req),8,900)))return L.send(res,429,{error:'Too many attempts. Wait 15 minutes.'});const b=L.body(req)||{};
 if(!L.pwOk(b.password)){await new Promise(r=>setTimeout(r,400));return L.send(res,401,{error:'Incorrect password.'})}
 const n=crypto.randomBytes(12).toString('hex'),tok=L.sign({n,exp:Date.now()+8*3600e3});L.send(res,200,{ok:true},{'Set-Cookie':`mq_s=${tok}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`})},['POST']);
