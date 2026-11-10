/* Local stand-in for Vercel: serves public/ and routes /api/* to the same handlers (in-memory store). For testing only. */
process.env.MQ_TEST='1';process.env.SESSION_SECRET=process.env.SESSION_SECRET||'dev-'.repeat(10);process.env.ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'local-test-password';
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');const root=path.join(__dirname,'..');
const T={'.html':'text/html; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.txt':'text/plain'};
http.createServer((req,res)=>{const u=url.parse(req.url,true);if(u.pathname.startsWith('/api/')){let f=path.join(root,u.pathname+'.js');if(!fs.existsSync(f))f=path.join(root,u.pathname,'index.js');if(!fs.existsSync(f)){res.statusCode=404;return res.end('{}')}
 let b='';req.on('data',c=>b+=c);req.on('end',()=>{req.query=u.query;try{req.body=b?JSON.parse(b):{}}catch(e){req.body=b}res.setHeader('Strict-Transport-Security','x');require(f)(req,res)});return}
 let p=path.join(root,'public',u.pathname==='/'?'index.html':u.pathname);if(!p.startsWith(path.join(root,'public'))||!fs.existsSync(p)){res.statusCode=404;return res.end('not found')}res.setHeader('Content-Type',T[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res)}).listen(+process.env.PORT||8777,()=>console.log('dev on',process.env.PORT||8777));
