const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const p=await L.session(req);if(p)await L.R('SET','sess:revoked:'+p.n,'1','EX',28800);L.send(res,200,{ok:true},{'Set-Cookie':'mq_s=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0'})},['POST']);
