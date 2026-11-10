const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{await L.needAdmin(req);const c=L.cleanContent(L.body(req));const prev=await L.R('GET','content');const n=await L.R('INCR','content:ver');
 if(prev){await L.R('SET','content:v:'+(n-1),prev,'EX',String(90*86400))}await L.R('SET','content',JSON.stringify(c));await L.R('LPUSH','audit',JSON.stringify({at:new Date().toISOString(),what:'content published',ver:n,ip:L.ip(req).replace(/\.\d+$/,'.x')}));await L.R('LTRIM','audit','0','499');L.send(res,200,{ok:true,version:n})},['PUT']);
