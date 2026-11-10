const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const p=await L.session(req).catch(()=>null);L.send(res,p?200:401,{ok:!!p})},['GET']);
