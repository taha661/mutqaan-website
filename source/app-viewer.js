/* ---------- 3D viewer component ---------- */
const VW={};const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const TOURNAMES=['Approach','Garden','Poolside','Into the living room','Living','Dining and kitchen'];
function viewerHTML(id,o){o=o||{};
 if(o.room)return `<div class="viewer" id="${id}" style="position:absolute;inset:0;aspect-ratio:auto;border:0"><canvas role="img" aria-label="Interactive 3D room preview. Drag to look around."></canvas><div class="vw-load"><span class="spin"></span></div></div>`;
 return `<div class="viewer" id="${id}"><img class="poster" src="media/hero.jpg" alt="Still render of the villa model at dusk" loading="lazy"><canvas role="img" aria-label="Interactive 3D model of an illustrative villa. Use the tour, light and facade controls below."></canvas>
<div class="vw-load"><span class="spin"></span><span class="small">Preparing the 3D model…</span></div>
<div class="vw-top"><span class="vw-tag">Real-time 3D · illustrative concept</span><span class="vw-hint" data-hint>Drag to orbit · pinch or use + − to zoom</span></div>
<div class="vw-zoom"><button type="button" data-z="-1" aria-label="Zoom in">+</button><button type="button" data-z="1" aria-label="Zoom out">−</button><button type="button" data-reset aria-label="Reset view">⟲</button></div></div>
<div class="vw-ctrl" data-for="${id}"><span>Tour</span><div class="tour"><button type="button" class="btn sm" data-play>▶ Play tour</button><input type="range" min="0" max="1000" value="0" data-scrub aria-label="Tour position"><span class="tiny muted" data-tl aria-live="polite">Orbit view</span></div>
<span>Light</span><div><div class="seg" role="group" aria-label="Time of day">${['morning','noon','dusk','night'].map(k=>`<button type="button" data-l="${k}" aria-pressed="${k==='dusk'}">${cap(k)}</button>`).join('')}</div></div>
<span>Facade</span><div><div class="seg" role="group" aria-label="Facade material">${Object.entries(M3.FACADE).map(([k,v])=>`<button type="button" data-f="${k}" aria-pressed="${k==='stone'}">${v.label}</button>`).join('')}</div></div></div>
<p class="tiny muted" style="margin-top:14px">Illustrative model built for this website. The tour follows a camera path through the 3D geometry; it is not a film of a built project.</p>`}
function viewersStop(){for(const k in VW){const v=VW[k];v.dead=true;cancelAnimationFrame(v.raf);if(v.io)v.io.disconnect();if(v.ro)v.ro.disconnect();try{const e=v.R&&v.R.gl.getExtension('WEBGL_lose_context');if(e)e.loseContext()}catch(x){}delete VW[k]}}
function mountViewer(id,o){o=o||{};const el=document.getElementById(id);if(!el||VW[id])return;
 const v=VW[id]={el,o,theta:.62,phi:.2,rad:o.room?7.5:31,target:o.room?[0,1.2,0]:[0,2.8,1],light:o.light||(o.room?'morning':'dusk'),facade:'stone',tour:false,t:0,playing:false,dirty:true,visible:false,params:o.params||{layout:'lounge',ceiling:'cove'}};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const start=()=>{if(v.R||v.dead)return;const cv=el.querySelector('canvas');let R=null;try{R=M3.create(cv,{dpr:o.mini?1.5:2,shadow:o.mini?1024:2048})}catch(e){R=null}
  if(!R){el.querySelector('.vw-load').innerHTML='<span class="small">3D needs WebGL 2, which this browser does not offer. The still render is shown instead.</span>';return}
  v.R=R;build();el.classList.add('live');v.dirty=true;loop()};
 function build(){if(o.room){const s=M3.room(v.params);v.R.setMesh(s.mesh,s.center,s.rad);v.target=[0,Math.min(1.3,(v.params.h||3)*.42),0];v.rad=Math.max(5,s.rad*1.1)}else v.R.setMesh(M3.villa({facade:v.facade}),[0,3,1],20)}
 v.update=p=>{v.params=Object.assign({},v.params,p);if(v.R){build();v.dirty=true;loop()}};
 function cam(){if(v.tour&&!o.room){const T=M3.TOUR;return {eye:M3.spline(T.eye,v.t),target:M3.spline(T.target,v.t),fov:52}}
  const cp=Math.cos(v.phi);return {eye:[v.target[0]+v.rad*Math.sin(v.theta)*cp,v.target[1]+v.rad*Math.sin(v.phi),v.target[2]+v.rad*Math.cos(v.theta)*cp],target:v.target,fov:o.room?60:42}}
 let last=0;function loop(){cancelAnimationFrame(v.raf);v.raf=requestAnimationFrame(ts=>{if(v.dead)return;
  if(v.playing){const dt=Math.min(.05,(ts-(last||ts))/1000);v.t=Math.min(1,v.t+dt/28);v.dirty=true;syncTour();if(v.t>=1){v.playing=false;syncTour()}}last=ts;
  if(v.dirty&&v.R&&v.visible){v.R.render(cam(),M3.LIGHT[v.light]);v.dirty=false}
  if(v.playing||v.drag)loop()})}
 const ctl=document.querySelector(`.vw-ctrl[data-for="${id}"]`);
 function syncTour(){if(!ctl)return;const sc=ctl.querySelector('[data-scrub]'),tl=ctl.querySelector('[data-tl]'),pb=ctl.querySelector('[data-play]');sc.value=Math.round(v.t*1000);pb.textContent=v.playing?'❚❚ Pause':(v.t>0&&v.t<1&&v.tour?'▶ Resume':'▶ Play tour');tl.textContent=v.tour?TOURNAMES[Math.min(TOURNAMES.length-1,Math.floor(v.t*TOURNAMES.length))]:'Orbit view'}
 function toOrbit(){if(!v.tour)return;const c=cam(),d=M3.V3.sub(c.eye,v.target),r=Math.hypot(...d);v.rad=Math.min(55,Math.max(8,r));v.phi=Math.min(1.2,Math.max(.04,Math.asin(d[1]/r)));v.theta=Math.atan2(d[0],d[2]);v.tour=false;v.playing=false;syncTour()}
 if(ctl){ctl.querySelector('[data-play]').onclick=()=>{if(!v.R)start();if(!v.tour){v.tour=true;if(v.t>=1)v.t=0}else if(v.t>=1)v.t=0;v.playing=!v.playing;syncTour();v.dirty=true;loop()};
  ctl.querySelector('[data-scrub]').oninput=e=>{v.tour=true;v.playing=false;v.t=e.target.value/1000;syncTour();v.dirty=true;loop()};
  ctl.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{v.light=b.dataset.l;ctl.querySelectorAll('[data-l]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));v.dirty=true;loop()});
  ctl.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{v.facade=b.dataset.f;ctl.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(v.R){build();v.dirty=true;loop()}})}
 el.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{toOrbit();v.rad=Math.min(o.room?14:55,Math.max(o.room?3:9,v.rad*(b.dataset.z>0?1.18:.85)));v.dirty=true;loop()});
 const rs=el.querySelector('[data-reset]');if(rs)rs.onclick=()=>{v.tour=false;v.playing=false;v.theta=.62;v.phi=.2;v.rad=31;syncTour();v.dirty=true;loop()};
 const cv=el.querySelector('canvas');let px=0,py=0,pid=null,pinch=null;const pts=new Map();
 cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),r:v.rad};return}pid=e.pointerId;px=e.clientX;py=e.clientY;v.drag=true;toOrbit();try{cv.setPointerCapture(e.pointerId)}catch(x){}const h=el.querySelector('[data-hint]');if(h)h.style.opacity=0;loop()});
 cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&pts.size===2){const [a,b]=[...pts.values()];v.rad=Math.min(o.room?14:55,Math.max(o.room?3:9,pinch.r*pinch.d/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1]))));v.dirty=true;return}
  if(e.pointerId!==pid)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;v.theta-=dx*.006;if(e.pointerType==='mouse'||e.pointerType==='pen')v.phi=Math.min(o.room?.9:1.2,Math.max(o.room?-.1:.04,v.phi+dy*.004));v.dirty=true});
 const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(e.pointerId===pid){pid=null;v.drag=false}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();toOrbit();v.rad=Math.min(o.room?14:55,Math.max(o.room?3:9,v.rad*(1+e.deltaY*.01)));v.dirty=true;loop()},{passive:false});
 v.io=new IntersectionObserver(es=>{v.visible=es[0].isIntersecting;if(v.visible){start();v.dirty=true;loop()}},{rootMargin:'200px'});v.io.observe(el);
 v.ro=new ResizeObserver(()=>{v.dirty=true;loop()});v.ro.observe(el);
 if(reduce&&ctl){const pb=ctl.querySelector('[data-play]');pb.title='Tour moves the camera; you can also drag the slider step by step.'}
 return v}
