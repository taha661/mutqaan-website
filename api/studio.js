/* Optional server-side AI for the Project Studio on the hosted site. Disabled until ANTHROPIC_API_KEY and AI_DAILY_LIMIT are set.
   Per-visitor and global daily caps are reserved before the provider call and released if it fails. Photos are not stored. */
const L=require('../lib/server.js');
module.exports=L.wrap(async(req,res)=>{const key=L.env('ANTHROPIC_API_KEY'),cap=+L.env('AI_DAILY_LIMIT')||0;if(!key||cap<=0)return L.send(res,503,{error:'AI concepts are not enabled on this site.'});
 const b=L.body(req)||{},prompt=L.S(b.prompt,30000),imgs=(Array.isArray(b.images)?b.images:[]).slice(0,3);if(!prompt)return L.send(res,400,{error:'Empty request'});
 const day=new Date().toISOString().slice(0,10),who='ai:'+day+':'+L.ip(req),all='ai:'+day+':all';
 const mine=await L.R('INCR',who);if(mine===1)await L.R('EXPIRE',who,'90000');const g=await L.R('INCR',all);if(g===1)await L.R('EXPIRE',all,'90000');
 const release=async()=>{await L.R('DECR',who);await L.R('DECR',all)};
 if(mine>(+L.env('AI_PER_VISITOR')||4)||g>cap){await release();return L.send(res,429,{error:'Today\'s AI concept limit has been reached. Please request a professional review instead.'})}
 const content=[];for(const d of imgs){const m=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(d||''));if(!m)continue;const buf=Buffer.from(m[2],'base64');if(buf.length>1500000||L.sniff(buf)!==m[1])continue;content.push({type:'image',source:{type:'base64',media_type:m[1],data:m[2]}})}
 content.push({type:'text',text:prompt});
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),55000);let r,j;
 try{r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:ctl.signal,headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:L.env('AI_MODEL')||'claude-sonnet-5-5',max_tokens:4000,messages:[{role:'user',content}]})});j=await r.json()}catch(e){await release();return L.send(res,502,{error:'The AI service did not respond. Your allowance was restored.'})}finally{clearTimeout(t)}
 if(!r.ok){await release();return L.send(res,502,{error:'The AI service could not complete this request. Your allowance was restored.'})}
 const text=(j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');const s=text.indexOf('{'),e=text.lastIndexOf('}');let out=null;try{out=JSON.parse(text.slice(s,e+1))}catch(x){}
 await L.R('LPUSH','usage',JSON.stringify({at:new Date().toISOString(),in:j.usage&&j.usage.input_tokens,out:j.usage&&j.usage.output_tokens,ok:!!out}));await L.R('LTRIM','usage','0','999');
 if(!out){return L.send(res,502,{error:'The AI reply could not be read. Please try again.'})}L.send(res,200,{result:out})},['POST']);
