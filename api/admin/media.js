/* Admin image upload: signature-checked, size-capped, random names, served from a separate public path. Client re-encodes to strip EXIF. */
const L=require('../../lib/server.js');
module.exports=L.wrap(async(req,res)=>{await L.needAdmin(req);
 if(req.method==='GET'){const ids=await L.R('LRANGE','media:ids','0','199');return L.send(res,200,{items:ids.map(id=>({id,url:'/api/media?id='+id}))})}
 if(!(await L.limit('up:'+L.ip(req),60,3600)))return L.send(res,429,{error:'Upload limit reached for this hour.'});
 const b=L.body(req)||{},m=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data||''));if(!m)return L.send(res,400,{error:'Send a JPEG, PNG or WebP image.'});
 const buf=Buffer.from(m[2],'base64');if(buf.length>750000)return L.send(res,413,{error:'Image is larger than 750 KB after compression.'});const t=L.sniff(buf);if(!t||t!==m[1])return L.send(res,400,{error:'File content does not match an allowed image type.'});
 const id=L.rid('m',8).toLowerCase();await L.R('SET','media:'+id,buf.toString('base64'));await L.R('SET','media:'+id+':t',t);await L.R('LPUSH','media:ids',id);L.send(res,201,{id,url:'/api/media?id='+id})},['GET','POST']);
