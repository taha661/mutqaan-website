/* Mutqaan delivery workflow: shared by the browser admin and the Vercel API. Pure functions, no I/O. */
(function(root,f){const W=f();if(typeof module==='object'&&module.exports)module.exports=W;else root.WF=W})(typeof self!=='undefined'?self:this,function(){
const STAGES=[['intake','Intake'],['triage','HOO triage'],['creative','Creative direction'],['moodboard','Moodboard approval (HOO)'],['design','Designer development'],['final','Final design approval (client)'],['estimate','Estimator'],['estapproval','Estimate approval (client)'],['execution','Execution planning'],['closed','Closed']];
const KEYS=STAGES.map(s=>s[0]);
const GATES={moodboard:{gate:'moodboard',kind:'business',rev:'moodboard',label:'Moodboard',who:'HOO'},final:{gate:'final',kind:'client',rev:'design',label:'Final design',who:'Client'},estapproval:{gate:'estimate',kind:'client',rev:'estimate',label:'Estimate',who:'Client'}};
const DOWN={moodboard:['moodboard','final','estimate'],design:['final','estimate'],estimate:['estimate']};
const QUAL=['Service fit','Scope clarity','Location','Budget readiness','Timing','Capacity'];
function fresh(id,now){return {id,stage:'intake',v:1,rev:{moodboard:1,design:1,estimate:1},approvals:[],history:[{at:now,by:'system',what:'Inquiry received'}],questions:[],qual:{},assigned:'HOO',updated:now}}
function err(code,msg){const e=new Error(msg);e.code=code;return e}
function valid(rec,a){return rec.approvals.some(x=>x.gate===a.gate&&x.rev===rec.rev[a.rev]&&!x.void)}
/* apply(rec, action, actor, now) -> new record. action: {type, v, ...} */
function apply(rec,action,actor,now){if(!rec||typeof rec!=='object')throw err('bad','No record');if(action.v!==rec.v)throw err('stale','This record changed since you opened it. Reload and try again.');
 const r=JSON.parse(JSON.stringify(rec)),log=w=>r.history.push({at:now,by:String(actor||'owner').slice(0,60),what:w}),cur=KEYS.indexOf(r.stage);
 switch(action.type){
 case 'advance':{if(r.stage==='closed')throw err('bad','Closed');const g=GATES[r.stage];if(g&&!valid(r,g))throw err('gate',g.label+' approval for revision '+r.rev[g.rev]+' is required before moving on.');const nx=KEYS[Math.min(cur+1,KEYS.length-1)];log('Moved from '+STAGES[cur][1]+' to '+STAGES[cur+1][1]);r.stage=nx;r.assigned={triage:'HOO',creative:'Creative',moodboard:'HOO',design:'Designer',final:'Client',estimate:'Estimator',estapproval:'Client',execution:'HOO'}[nx]||'HOO';break}
 case 'back':{if(cur<=0)throw err('bad','Already at intake');log('Returned from '+STAGES[cur][1]+' to '+STAGES[cur-1][1]+(action.note?': '+String(action.note).slice(0,300):''));r.stage=KEYS[cur-1];break}
 case 'approve':{const g=GATES[r.stage];if(!g)throw err('bad','This stage has no approval gate.');if(valid(r,g))throw err('bad','Already approved for this revision.');
  const by=String(action.by||'').trim().slice(0,80);if(!by)throw err('bad','Name the approving person.');if(g.kind==='client'&&!action.clientConfirmed)throw err('bad','Confirm the client gave this approval (for example in writing).');
  r.approvals.push({gate:g.gate,kind:g.kind,rev:r.rev[g.rev],by,scope:String(action.scope||g.label+' revision '+r.rev[g.rev]).slice(0,200),at:now,recordedBy:String(actor||'owner').slice(0,60)});log(g.label+' revision '+r.rev[g.rev]+' approved by '+by+(g.kind==='client'?' (client approval recorded)':' (business approval)'));break}
 case 'revise':{const k=action.artifact;if(!DOWN[k])throw err('bad','Unknown artifact');r.rev[k]++;if(k==='moodboard'){r.rev.design++;r.rev.estimate++}if(k==='design')r.rev.estimate++;
  let n=0;r.approvals.forEach(a=>{if(!a.void&&DOWN[k].includes(a.gate)){a.void=true;a.voidedAt=now;n++}});log('New '+k+' revision '+r.rev[k]+(n?'; '+n+' downstream approval(s) reopened':'')+(action.note?': '+String(action.note).slice(0,300):''));
  const back={moodboard:'moodboard',design:'design',estimate:'estimate'}[k];if(KEYS.indexOf(r.stage)>KEYS.indexOf(back)){r.stage=back;log('Moved back to '+STAGES[KEYS.indexOf(back)][1])}break}
 case 'question':{const q=String(action.text||'').trim().slice(0,500);if(!q)throw err('bad','Empty question');r.questions.push({at:now,from:String(action.from||'Designer').slice(0,30),to:'HOO',text:q,status:'open'});log((action.from||'Designer')+' asked HOO a question');break}
 case 'answer':{const q=r.questions[action.i];if(!q)throw err('bad','No such question');q.status=action.toClient?'sent to client':'resolved';q.answer=String(action.text||'').slice(0,500);q.answeredAt=now;log('HOO '+(action.toClient?'forwarded a question to the client':'resolved a question'));break}
 case 'qual':{const o={};QUAL.forEach(k=>{if(action.qual&&action.qual[k]!==undefined)o[k]=!!action.qual[k]});r.qual=o;if(action.note!==undefined)r.qualNote=String(action.note).slice(0,600);log('Qualification updated');break}
 case 'note':{const t=String(action.text||'').trim().slice(0,800);if(!t)throw err('bad','Empty note');log('Note: '+t);break}
 case 'close':{r.stage='closed';log('Closed'+(action.note?': '+String(action.note).slice(0,300):''));break}
 default:throw err('bad','Unknown action')}
 r.v=rec.v+1;r.updated=now;return r}
return {STAGES,KEYS,GATES,QUAL,fresh,apply,valid}});
