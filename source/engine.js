/* Mutqaan 3D engine v2: dependency-free WebGL2 renderer with procedural materials (wood, tile, stone, marble, fabric, grass, concrete),
   sun shadows, glossy reflections, interior point lights, glass and water. Includes a furniture library and the villa / studio-room scenes. */
const M3=(function(){
const hex=h=>{h=String(h).replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]};
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sc:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cr:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],n:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}};
const M4={
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 persp(f,asp,n,fa){const t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o},
 ortho(l,r,b,t,n,f){const o=new Float32Array(16);o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);o[15]=1;return o},
 look(e,c,u){const z=V3.n(V3.sub(e,c)),x=V3.n(V3.cr(u,z)),y=V3.cr(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,e),-V3.dot(y,e),-V3.dot(z,e),1])},
 inv(m){const o=new Float32Array(16),[a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=m;
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  const d=1/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
  o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o}};

/* ---------- materials: 0 plain, 1 wood, 2 tile, 3 stone, 4 grass, 5 marble, 6 fabric, 7 concrete, 8 gloss, 9 slats, 10 metal, 11 leaf ---------- */
const MAT={plain:0,wood:1,tile:2,stone:3,grass:4,marble:5,fabric:6,concrete:7,gloss:8,slats:9,metal:10,leaf:11};
function Mesh(){this.o=[];this.g=[];this.lights=[]}
Mesh.prototype.v=function(arr,p,n,c,e,m){arr.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],e,m)};
const col3=c=>typeof c==='string'?hex(c):c,mid=o=>typeof o.m==='string'?(MAT[o.m]||0):(o.m||0);
Mesh.prototype.box=function(x0,y0,z0,x1,y1,z1,col,o){o=o||{};const c=col3(col),e=o.em||0,mm=mid(o),A=o.glass?this.g:this.o;
 if(x0>x1)[x0,x1]=[x1,x0];if(y0>y1)[y0,y1]=[y1,y0];if(z0>z1)[z0,z1]=[z1,z0];
 const F=[[[1,0,0],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]]],[[-1,0,0],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]],[[0,1,0],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]]],[[0,-1,0],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]],[[0,0,1],[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]],[[0,0,-1],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]]];
 for(const [n,q] of F)for(const i of [0,1,2,0,2,3])this.v(A,q[i],n,c,e,mm);return this};
/* cylinder / cone frustum: r0 bottom, r1 top */
Mesh.prototype.cyl=function(x,z,y0,y1,r0,col,o){o=o||{};const r1=o.r1!=null?o.r1:r0,c=col3(col),e=o.em||0,mm=mid(o),A=o.glass?this.g:this.o,N=o.seg||14,sl=(r0-r1)/Math.max(1e-4,y1-y0);
 for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,p0=[Math.cos(a0),Math.sin(a0)],p1=[Math.cos(a1),Math.sin(a1)];
  const v=(p,y,r)=>[x+p[0]*r,y,z+p[1]*r],n0=V3.n([p0[0],sl,p0[1]]),n1=V3.n([p1[0],sl,p1[1]]);
  this.v(A,v(p0,y0,r0),n0,c,e,mm);this.v(A,v(p1,y0,r0),n1,c,e,mm);this.v(A,v(p1,y1,r1),n1,c,e,mm);this.v(A,v(p0,y0,r0),n0,c,e,mm);this.v(A,v(p1,y1,r1),n1,c,e,mm);this.v(A,v(p0,y1,r1),n0,c,e,mm);
  if(r1>0){this.v(A,[x,y1,z],[0,1,0],c,e,mm);this.v(A,v(p1,y1,r1),[0,1,0],c,e,mm);this.v(A,v(p0,y1,r1),[0,1,0],c,e,mm)}
  if(o.bottom&&r0>0){this.v(A,[x,y0,z],[0,-1,0],c,e,mm);this.v(A,v(p0,y0,r0),[0,-1,0],c,e,mm);this.v(A,v(p1,y0,r0),[0,-1,0],c,e,mm)}}return this};
Mesh.prototype.sph=function(x,y,z,rx,ry,rz,col,o){o=o||{};const c=col3(col),e=o.em||0,mm=mid(o),A=this.o,la=o.la||8,lo=o.lo||12,j=o.jit||0;let seed=o.seed||1;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
 const P=[];for(let i=0;i<=la;i++){P.push([]);for(let k=0;k<=lo;k++){const t=i/la*Math.PI,p=k/lo*Math.PI*2,s=1+(i>0&&i<la&&k<lo?(rnd()-.5)*j:0);P[i].push([Math.sin(t)*Math.cos(p)*s,Math.cos(t)*s,Math.sin(t)*Math.sin(p)*s])}P[i][lo]=P[i][0]}
 const W=q=>[x+q[0]*rx,y+q[1]*ry,z+q[2]*rz],Nn=q=>V3.n([q[0]/rx,q[1]/ry,q[2]/rz]);
 for(let i=0;i<la;i++)for(let k=0;k<lo;k++){const a=P[i][k],b=P[i+1][k],d=P[i+1][k+1],f=P[i][k+1];for(const q of [a,b,d,a,d,f])this.v(A,W(q),Nn(q),c,e,mm)}return this};
Mesh.prototype.light=function(x,y,z,col,k){this.lights.push({p:[x,y,z],c:V3.sc(hex(col),k||1)});return this};
/* oriented local frame: furniture front faces local +z; r = quarter turns (0:+z,1:+x,2:-z,3:-x) */
function F(m,x,z,r,y){y=y||0;const T=(lx,lz)=>{switch(r&3){case 0:return [x+lx,z+lz];case 1:return [x+lz,z-lx];case 2:return [x-lx,z-lz];default:return [x-lz,z+lx]}};
 return {b(x0,y0,z0,x1,y1,z1,c,o){const a=T(x0,z0),bb=T(x1,z1);m.box(a[0],y+y0,a[1],bb[0],y+y1,bb[1],c,o);return this},c(lx,lz,y0,y1,r0,col,o){const p=T(lx,lz);m.cyl(p[0],p[1],y+y0,y+y1,r0,col,o);return this},s(lx,ly,lz,rx,ry,rz,col,o){const p=T(lx,lz);m.sph(p[0],y+ly,p[1],(r&1)?rz:rx,ry,(r&1)?rx:rz,col,o);return this},p:T}}

/* ---------- furniture library ---------- */
const LIB={
 sofa(m,x,z,r,o){o=o||{};const w=o.w||2.4,f=o.fab||'#D9D2C4',d=.95,h=F(m,x,z,r,o.y),hw=w/2,leg='#2B2B2B';
  [[-hw+.08,-d/2+.08],[hw-.08,-d/2+.08],[-hw+.08,d/2-.08],[hw-.08,d/2-.08]].forEach(([a,b])=>h.c(a,b,0,.1,.025,leg));
  h.b(-hw,.1,-d/2,hw,.3,d/2,f,{m:'fabric'});h.b(-hw,.1,-d/2,-hw+.18,.64,d/2,f,{m:'fabric'});h.b(hw-.18,.1,-d/2,hw,.64,d/2,f,{m:'fabric'});h.b(-hw+.18,.3,-d/2,hw-.18,.88,-d/2+.2,f,{m:'fabric'});
  const n=o.seats||3,sw=(w-.36)/n;for(let i=0;i<n;i++){const a=-hw+.18+i*sw;h.b(a+.012,.3,-d/2+.2,a+sw-.012,.46,d/2-.02,f,{m:'fabric'});h.b(a+.02,.46,-d/2+.2,a+sw-.02,.86,-d/2+.38,f,{m:'fabric'})}
  if(o.pillow){h.b(-hw+.24,.46,-d/2+.38,-hw+.66,.8,-d/2+.5,o.pillow,{m:'fabric'});h.b(hw-.66,.46,-d/2+.38,hw-.24,.8,-d/2+.5,o.pillow2||o.pillow,{m:'fabric'})}},
 armchair(m,x,z,r,o){o=o||{};const f=o.fab||'#8C6A4E',h=F(m,x,z,r,o.y);[[-.32,-.32],[.32,-.32],[-.32,.32],[.32,.32]].forEach(([a,b])=>h.c(a,b,0,.14,.022,'#3A2A1E'));
  h.b(-.42,.14,-.4,.42,.4,.4,f,{m:'fabric'});h.b(-.42,.14,-.4,-.32,.62,.4,f,{m:'fabric'});h.b(.32,.14,-.4,.42,.62,.4,f,{m:'fabric'});h.b(-.32,.4,-.4,.32,.84,-.24,f,{m:'fabric'});h.b(-.31,.4,-.24,.31,.5,.38,f,{m:'fabric'})},
 chair(m,x,z,r,o){o=o||{};const f=o.seat||'#C9B79A',fr=o.frame||'#2F2A26',h=F(m,x,z,r,o.y);[[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(([a,b])=>h.c(a,b,0,.44,.018,fr,{seg:8}));
  h.b(-.22,.44,-.22,.22,.5,.22,f,{m:'fabric'});h.b(-.21,.5,-.23,.21,.9,-.19,o.back||f,{m:o.back?'wood':'fabric'})},
 stool(m,x,z,o){o=o||{};const h=F(m,x,z,0,o.y);h.c(0,0,0,.02,.2,'#2B2B2B').c(0,0,.02,.68,.025,'#2B2B2B',{seg:8}).c(0,0,.28,.3,.17,'#3A3A3A',{seg:16}).c(0,0,.68,.75,.19,o.seat||'#8C6A4E',{seg:16,m:'fabric'})},
 table(m,x,z,r,o){o=o||{};const w=o.w||1.8,d=o.d||.9,ht=o.h||.75,t=o.top||'#9A6A42',h=F(m,x,z,r,o.y);h.b(-w/2,ht-.045,-d/2,w/2,ht,d/2,t,{m:o.tm||'wood'});
  if(o.pedestal){h.c(0,0,0,.03,.28,o.leg||'#2B2B2B').c(0,0,.03,ht-.045,.06,o.leg||'#2B2B2B')}else[[-w/2+.07,-d/2+.07],[w/2-.07,-d/2+.07],[-w/2+.07,d/2-.07],[w/2-.07,d/2-.07]].forEach(([a,b])=>h.b(a-.03,0,b-.03,a+.03,ht-.045,b+.03,o.leg||t,{m:o.leg?0:'wood'}))},
 rug(m,x0,z0,x1,z1,y,c,b){m.box(x0,y,z0,x1,y+.012,z1,b||'#8A7458',{m:'fabric'});m.box(x0+.12,y,z0+.12,x1-.12,y+.016,z1-.12,c,{m:'fabric'})},
 floorLamp(m,x,z,y,o){o=o||{};m.cyl(x,z,y,y+.03,.16,'#222222',{seg:16});m.cyl(x,z,y+.03,y+1.5,.012,'#222222',{seg:6});m.cyl(x,z,y+1.32,y+1.62,.22,o.shade||'#F2E8D6',{r1:.15,seg:18,em:.9});if(o.light!==false)m.light(x,y+1.4,z,'#FFE2BC',o.k||1.1)},
 pendant(m,x,yTop,z,o){o=o||{};const L=o.len||.8,y=yTop-L;m.cyl(x,z,y+.18,yTop,.006,'#111111',{seg:4});m.cyl(x,z,y,y+.2,o.r||.2,o.col||'#1E2A3A',{r1:.04,seg:18,m:'metal'});m.sph(x,y+.04,z,.06,.05,.06,'#FFE7C2',{em:2.2})},
 plant(m,x,z,y,s,o){s=s||1;o=o||{};m.cyl(x,z,y,y+.42*s,.2*s,o.pot||'#D9D2C4',{r1:.24*s,seg:16,m:'concrete'});m.cyl(x,z,y+.4*s,y+.42*s,.22*s,'#3B2A1E',{seg:16});
  const g=o.leaf||'#4F7A45';[[0,.95,0,.38,.45],[.18,.75,.1,.28,.3],[-.16,.8,-.08,.3,.34],[.05,1.25,-.05,.25,.3]].forEach(([a,b,c,rr,ry],i)=>m.sph(x+a*s,y+b*s,z+c*s,rr*s,ry*s,rr*s,g,{jit:.35,seed:(x*13+z*7+i)|0||3,la:6,lo:9,m:'leaf'}))},
 shelf(m,x,z,r,o){o=o||{};const w=o.w||1.4,ht=o.h||2,d=.36,wd=o.wood||'#8B5E34',h=F(m,x,z,r,o.y);h.b(-w/2,0,-d,-w/2+.03,ht,0,wd,{m:'wood'}).b(w/2-.03,0,-d,w/2,ht,0,wd,{m:'wood'}).b(-w/2,0,-d,w/2,ht,-d+.02,wd,{m:'wood'});
  const C=['#7A2E22','#1F3B63','#C9A46A','#3E5A3C','#D8CFC0','#2B2B2B','#8C6A4E'];let k=(Math.abs(Math.round(x*31+z*17))%1000)+7;for(let s=0;s<5;s++){const yy=s*(ht/5);h.b(-w/2,yy,-d,w/2,yy+.025,0,wd,{m:'wood'});if(s>0||ht<1.2){let bx=-w/2+.05;while(bx<w/2-.16){k=(k*9301+49297)%233280;const bw=.03+(k%5)*.012,bh=ht/5*(.55+(k%7)*.05);if(k%11===0){bx+=.14;continue}h.b(bx,yy+.025,-d+.04,bx+bw,yy+.025+bh,-d+.27,C[k%C.length]);bx+=bw+.004}}}h.b(-w/2,ht-.025,-d,w/2,ht,0,wd,{m:'wood'})},
 curtains(m,x0,x1,z,y0,y1,c,side){const n=Math.max(4,Math.round(Math.abs(x1-x0)/.09));for(let i=0;i<n;i++){const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n,dz=(i%2?.05:0)*(side||1);m.box(a,y0,z+dz,b,y1,z+dz+.03,c,{m:'fabric'})}},
 tvWall(m,x,z,r,o){o=o||{};const h=F(m,x,z,r,o.y),w=o.w||2.6;h.b(-w/2,0,-.06,w/2,2.7,0,o.wood||'#7A5230',{m:'slats'});h.b(-.85,.95,0,.85,1.92,.05,'#0E0F12',{m:'gloss'});h.b(-1.1,.18,0,1.1,.58,.42,o.unit||'#2A2F38',{m:'gloss'});h.b(-1.1,.0,.05,1.1,.18,.37,'#1A1A1A')},
 kitchen(m,x0,z0,len,o){o=o||{};const y=o.y||0,cab=o.cab||'#EFEBE3',top=o.top||'#E9E6E0',back=o.splash||'#D9D3C7',hd='#9AA0A6',dk='#1A1C20';
  m.box(x0,y,z0,x0+len,y+.1,z0+.58,'#2A2A2A');for(let x=x0;x<x0+len-.59-(o.fridge?.7:0);x+=.6){m.box(x+.004,y+.1,z0+.02,x+.596,y+.86,z0+.6,cab,{m:'gloss'});m.box(x+.2,y+.76,z0+.6,x+.4,y+.775,z0+.62,hd,{m:'metal'});m.box(x+.004,y+.47,z0+.6,x+.596,y+.476,z0+.605,'#B9B4AA')}
  const L=len-(o.fridge?.7:0);m.box(x0-.01,y+.86,z0,x0+L,y+.9,z0+.64,top,{m:'marble'});m.box(x0,y+.9,z0,x0+L,y+1.5,z0+.015,back,{m:'tile'});
  const hx=x0+L*.62;m.box(hx-.32,y+.9,z0+.12,hx+.32,y+.905,z0+.56,dk,{m:'gloss'});[[-.15,.24],[.15,.24],[-.15,.44],[.15,.44]].forEach(([a,b])=>m.cyl(hx+a,z0+b,y+.905,y+.91,.075,'#3A3D42',{seg:16,r1:.06}));
  const sx=x0+L*.25;m.box(sx-.35,y+.85,z0+.15,sx+.35,y+.902,z0+.52,'#8E9399',{m:'metal'});m.box(sx-.31,y+.84,z0+.18,sx+.31,y+.9,z0+.49,'#5E6268');m.cyl(sx,z0+.08,y+.9,y+1.22,.016,hd,{seg:8,m:'metal'});m.box(sx-.012,y+1.2,z0+.06,sx+.012,y+1.23,z0+.26,hd,{m:'metal'});
  for(let x=x0;x<x0+L-.59;x+=.6){m.box(x+.004,y+1.55,z0,x+.596,y+2.3,z0+.36,o.upper||cab,{m:'gloss'});m.box(x+.25,y+1.58,z0+.36,x+.35,y+1.595,z0+.38,hd,{m:'metal'})}
  m.box(x0,y+1.53,z0+.02,x0+L,y+1.55,z0+.34,'#FFF1D6',{em:1.4});
  if(o.fridge){const fx=x0+len-.7;m.box(fx,y,z0,fx+.7,y+2.3,z0+.64,o.tall||cab,{m:'gloss'});m.box(fx+.02,y+.9,z0+.64,fx+.68,y+1.45,z0+.645,dk,{m:'gloss'});m.box(fx+.6,y+1.55,z0+.64,fx+.62,y+2.1,z0+.68,hd,{m:'metal'});m.box(fx+.6,y+.15,z0+.64,fx+.62,y+.8,z0+.68,hd,{m:'metal'})}},
 island(m,x,z,w,d,o){o=o||{};const y=o.y||0,b=o.base||'#2A3446',t=o.top||'#E9E6E0';m.box(x-w/2+.04,y,z-d/2+.04,x+w/2-.04,y+.86,z+d/2-.25,b,{m:'gloss'});m.box(x-w/2,y+.86,z-d/2,x+w/2,y+.92,z+d/2,t,{m:'marble'});m.box(x-w/2,y,z-d/2,x-w/2+.06,y+.86,z+d/2,t,{m:'marble'});m.box(x+w/2-.06,y,z-d/2,x+w/2,y+.86,z+d/2,t,{m:'marble'});
  const n=Math.max(2,Math.floor(w/.62));for(let i=0;i<n;i++)LIB.stool(m,x-w/2+.35+i*((w-.7)/Math.max(1,n-1)),z+d/2+.32,{y,seat:o.stool})},
 bed(m,x,z,r,o){o=o||{};const w=o.w||1.8,l=2.1,h=F(m,x,z,r,o.y),wd=o.wood||'#6B4A2E',f=o.fab||'#E9E3D8';h.b(-w/2-.05,0,-l/2,w/2+.05,.32,l/2,wd,{m:'wood'});h.b(-w/2,.32,-l/2+.05,w/2,.55,l/2-.03,'#F4F1EA',{m:'fabric'});h.b(-w/2-.01,.5,-l/2+.6,w/2+.01,.6,l/2,f,{m:'fabric'});h.b(-w/2-.01,.32,l/2-.02,w/2+.01,.6,l/2,f,{m:'fabric'});
  h.b(-w/2+.12,.55,-l/2+.12,-.06,.72,-l/2+.48,'#F7F4EE',{m:'fabric'}).b(.06,.55,-l/2+.12,w/2-.12,.72,-l/2+.48,'#F7F4EE',{m:'fabric'});h.b(-w/2-.2,0,-l/2-.08,w/2+.2,1.25,-l/2,wd,{m:'slats'});
  [-1,1].forEach(sg=>{h.b(sg*(w/2+.12),0,-l/2,sg*(w/2+.6),.5,-l/2+.42,wd,{m:'wood'});const p=h.p(sg*(w/2+.36),-l/2+.2);m.cyl(p[0],p[1],(o.y||0)+.5,(o.y||0)+.82,.025,'#B08D57',{seg:8});m.cyl(p[0],p[1],(o.y||0)+.78,(o.y||0)+.98,.14,'#F2E8D6',{r1:.11,em:.8})})},
 lounger(m,x,z,r){const h=F(m,x,z,r);h.b(-.32,.1,-.95,.32,.3,.95,'#E8E2D6',{m:'fabric'});h.b(-.32,.3,-.95,.32,.75,-.7,'#E8E2D6',{m:'fabric'});[[-.28,-.9],[.28,-.9],[-.28,.9],[.28,.9]].forEach(([a,b])=>h.b(a-.025,0,b-.025,a+.025,.1,b+.025,'#3A2A1E'))},
 umbrella(m,x,z){m.cyl(x,z,0,.06,.25,'#3A3D42',{seg:12});m.cyl(x,z,.06,2.3,.025,'#D9D2C4',{seg:6});m.cyl(x,z,2.0,2.45,1.35,'#F2EEE6',{r1:.04,seg:16,m:'fabric'})},
 downlights(m,x0,z0,x1,z1,y,step){for(let x=x0;x<=x1;x+=step)for(let z=z0;z<=z1;z+=step)m.cyl(x,z,y-.01,y,.05,'#FFF3DE',{seg:10,em:2.4})}};

/* ---------- shaders ---------- */
const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec3 aC;layout(location=3) in float aE;layout(location=4) in float aM;
uniform mat4 uVP,uLVP;out vec3 vN,vC,vW;out float vE,vM;out vec4 vL;
void main(){vN=aN;vC=aC;vE=aE;vM=aM;vW=aP;vL=uLVP*vec4(aP,1.);gl_Position=uVP*vec4(aP,1.);}`;
const FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vN,vC,vW;in float vE,vM;in vec4 vL;
uniform vec3 uSun,uSunC,uSky,uGnd,uCam,uHor,uTop;uniform float uEmK,uGlass,uFogD,uExp;uniform sampler2DShadow uSh;
uniform vec3 uPL[8];uniform vec3 uPC[8];uniform int uNL;out vec4 o;
vec3 lin(vec3 c){return pow(c,vec3(2.2));}
vec3 aces(vec3 x){x*=uExp;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
vec2 uvp(vec3 w,vec3 n){vec3 a=abs(n);return a.y>a.x&&a.y>a.z?w.xz:(a.x>a.z?w.zy:w.xy);}
vec3 pat(vec3 c,int m,vec3 w,vec3 n,out float gl){gl=0.;vec2 u=uvp(w,n);
 if(m==1){vec2 q=abs(n.y)>.5?u:vec2(u.y,u.x);float row=floor(q.y*5.);float g=fbm(vec2(q.x*1.2+row*7.,q.y*30.));float pl=smoothstep(.0,.02,fract(q.y*5.))*smoothstep(1.,.98,fract(q.y*5.));float tone=.9+.2*h21(vec2(row,floor((q.x+row*.7)/1.8)));c*=tone*(.8+.32*g);c*=mix(.62,1.,pl);gl=.22;}
 else if(m==2){vec2 f=fract(u/.6);float gr=1.-smoothstep(.006,.016,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));c*=(.94+.1*h21(floor(u/.6)))*(.97+.06*fbm(u*3.));c=mix(c,c*.62,gr);gl=.45*(1.-gr);}
 else if(m==3){float row=floor(u.y/.28);float x=u.x+row*.41;float bw=.55+.5*h21(vec2(row,1.));vec2 f=vec2(fract(x/bw),fract(u.y/.28));float j=1.-smoothstep(.015,.04,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));c*=.8+.32*h21(vec2(floor(x/bw),row));c*=.88+.24*fbm(u*7.);c=mix(c,c*.5,j);}
 else if(m==4){c*=.7+.5*fbm(u*2.5)+.12*vn(u*35.);}
 else if(m==5){float v=fbm(u*1.6+vec2(fbm(u*3.)*2.));float vein=pow(1.-abs(sin((u.x*.8+u.y*.6)*4.+v*7.)),10.);c=mix(c*(.97+.05*v),c*.62,vein*.85);gl=.75;}
 else if(m==6){c*=.9+.14*vn(u*160.)+.07*fbm(u*9.);}
 else if(m==7){c*=.86+.2*fbm(u*3.5)+.07*vn(u*90.);gl=.08;}
 else if(m==8){gl=.65;}
 else if(m==9){float s=fract(u.x*12.5);float gp=smoothstep(.0,.08,s)*smoothstep(1.,.92,s);c*=mix(.45,1.,gp)*(.9+.2*fbm(vec2(u.x*12.5,u.y*20.)));gl=.15;}
 else if(m==10){gl=.85;c*=.9+.1*vn(u*60.);}
 else if(m==11){c*=.75+.5*vn(u*9.);}
 return c;}
float sh(){vec3 p=vL.xyz/vL.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;vec2 t=1./vec2(textureSize(uSh,0));float s=0.;
for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++)s+=texture(uSh,vec3(p.xy+vec2(x,y)*t*.9,p.z-.0008));return s/25.;}
void main(){vec3 N=normalize(vN);vec3 V=normalize(uCam-vW);int m=int(vM+.5);float gl;vec3 c=lin(pat(vC,m,vW,N,gl));
float nl=max(dot(N,uSun),0.);float s=nl>0.?sh():0.;vec3 hemi=mix(uGnd,uSky,N.y*.5+.5);
float ao=mix(.5,1.,clamp(vW.y*1.6+.2,0.,1.));
vec3 pl=vec3(0.),ps=vec3(0.);for(int i=0;i<8;i++){if(i>=uNL)break;vec3 d=uPL[i]-vW;float r=length(d);vec3 L=d/r;float at=1./(1.+r*r*.9);pl+=uPC[i]*(max(dot(N,L),0.)*.85+.15)*at;ps+=uPC[i]*pow(max(dot(N,normalize(L+V)),0.),mix(10.,90.,gl))*gl*at;}
float f=pow(1.-max(dot(N,V),0.),5.);vec3 R=reflect(-V,N);vec3 sk=mix(lin(uHor),lin(uTop),clamp(R.y*1.3,0.,1.));
if(uGlass>.5){vec3 g=sk*.75+c*.1+uSunC*pow(max(dot(R,uSun),0.),300.)*3.;float al=mix(.05,.6,f);
 if(vE<0.){vec2 rp=vec2(fbm(vW.xz*2.2),fbm(vW.xz*2.2+9.))-.5;vec3 Nw=normalize(N+vec3(rp.x,0.,rp.y)*.35);vec3 Rw=reflect(-V,Nw);vec3 skw=mix(lin(uHor),lin(uTop),clamp(Rw.y*1.3,0.,1.));float fw=pow(1.-max(dot(Nw,V),0.),4.);g=mix(c*(hemi+uSunC*.3+pl*uEmK*.4),skw,.2+.6*fw)+uSunC*pow(max(dot(Rw,uSun),0.),220.)*2.5;al=.84;}
 o=vec4(pow(aces(g),vec3(1./2.2)),al);return;}
vec3 H=normalize(uSun+V);float spec=pow(max(dot(N,H),0.),mix(8.,140.,gl))*gl*s;
vec3 col=c*(hemi*ao+uSunC*nl*s+pl*uEmK)+uSunC*spec*.6+ps*uEmK*.5+c*vE*uEmK*2.2;
col=mix(col,sk*(hemi.b+.25),gl*f*.35)+f*hemi*.06;
float fg=1.-exp(-length(uCam-vW)*uFogD);col=mix(col,lin(uHor)*1.05,fg);
o=vec4(pow(aces(col),vec3(1./2.2)),1.);}`;
const SVS=`#version 300 es
layout(location=0) in vec3 aP;uniform mat4 uLVP;void main(){gl_Position=uLVP*vec4(aP,1.);}`;
const SFS=`#version 300 es
precision mediump float;out vec4 o;void main(){o=vec4(1.);}`;
const KVS=`#version 300 es
layout(location=0) in vec2 aP;out vec2 vP;void main(){vP=aP;gl_Position=vec4(aP,.99999,1.);}`;
const KFS=`#version 300 es
precision highp float;in vec2 vP;uniform mat4 uInv;uniform vec3 uTop,uHor,uSun,uSunC,uCam;uniform float uExp,uStars;out vec4 o;
vec3 lin(vec3 c){return pow(c,vec3(2.2));}
float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);}
void main(){vec4 w=uInv*vec4(vP,1.,1.);vec3 d=normalize(w.xyz/w.w-uCam);float t=clamp(d.y,0.,1.);
vec3 c=mix(lin(uHor),lin(uTop),pow(t,.45));float s=max(dot(d,uSun),0.);c+=uSunC*(pow(s,900.)*6.+pow(s,12.)*.12);
vec2 cp=d.xz/max(d.y,.08)*.6;float cl=smoothstep(.55,.85,n2(cp*1.3)*.6+n2(cp*3.1)*.3+n2(cp*7.)*.1)*smoothstep(.02,.25,d.y);c=mix(c,mix(lin(uHor)*1.1,vec3(1.)*(.4+.6*dot(uSunC,vec3(.33))),.5),cl*.55*(1.-uStars));
if(uStars>0.){vec3 q=floor(d*260.);float st=step(.9975,h(q))*t;c+=vec3(st*uStars);}
c*=uExp;c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);o=vec4(pow(c,vec3(1./2.2)),1.);}`;

function prog(gl,v,f){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
 const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name.replace('[0]','')]=gl.getUniformLocation(p,a.name)}return {p,u}}

function create(canvas,opt){opt=opt||{};
 const gl=canvas.getContext('webgl2',{antialias:true,preserveDrawingBuffer:!!opt.keep,powerPreference:'high-performance'});if(!gl)return null;
 const P=prog(gl,VS,FS),S=prog(gl,SVS,SFS),K=prog(gl,KVS,KFS);
 const SM=opt.shadow||2048,tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,SM,SM);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE],[gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,tex,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const kv=gl.createVertexArray();gl.bindVertexArray(kv);const kb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,kb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 function vao(){const a=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(a);gl.bindBuffer(gl.ARRAY_BUFFER,b);const st=44;[[0,3,0],[1,3,12],[2,3,24],[3,1,36],[4,1,40]].forEach(([l,s,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s,gl.FLOAT,false,st,o)});return {a,b,n:0}}
 const VO=vao(),VG=vao();let mesh=null,center=[0,0,0],rad=20;
 function up(V,arr){gl.bindVertexArray(V.a);gl.bindBuffer(gl.ARRAY_BUFFER,V.b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);V.n=arr.length/11}
 const api={gl,
  setMesh(m,c,r){mesh=m;up(VO,m.o);up(VG,m.g);if(c)center=c;if(r)rad=r},
  resize(){const d=Math.min(window.devicePixelRatio||1,opt.dpr||2),w=Math.round(canvas.clientWidth*d),h=Math.round(canvas.clientHeight*d);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}},
  render(cam,L){api.resize();const W=canvas.width,H=canvas.height;if(!W||!H)return;
   const sun=V3.n(L.sun),le=V3.add(center,V3.sc(sun,rad*2.2)),LV=M4.mul(M4.ortho(-rad,rad,-rad,rad,1,rad*4.5),M4.look(le,center,Math.abs(sun[1])>.98?[0,0,1]:[0,1,0]));
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,SM,SM);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,3);gl.useProgram(S.p);gl.uniformMatrix4fv(S.u.uLVP,false,LV);gl.bindVertexArray(VO.a);gl.drawArrays(gl.TRIANGLES,0,VO.n);gl.disable(gl.POLYGON_OFFSET_FILL);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const VP=M4.mul(M4.persp((cam.fov||50)*Math.PI/180,W/H,.05,400),M4.look(cam.eye,cam.target,[0,1,0])),sc=hex(L.sunCol).map(x=>x*L.sunK);
   gl.disable(gl.DEPTH_TEST);gl.useProgram(K.p);gl.uniformMatrix4fv(K.u.uInv,false,M4.inv(VP));gl.uniform3fv(K.u.uTop,hex(L.top));gl.uniform3fv(K.u.uHor,hex(L.hor));gl.uniform3fv(K.u.uSun,sun);gl.uniform3fv(K.u.uSunC,sc);gl.uniform3fv(K.u.uCam,cam.eye);gl.uniform1f(K.u.uExp,L.exp||1);gl.uniform1f(K.u.uStars,L.stars||0);gl.bindVertexArray(kv);gl.drawArrays(gl.TRIANGLES,0,3);
   gl.enable(gl.DEPTH_TEST);gl.useProgram(P.p);const u=P.u;gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,LV);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uSunC,sc);gl.uniform3fv(u.uSky,hex(L.sky).map(x=>x*L.amb));gl.uniform3fv(u.uGnd,hex(L.gnd).map(x=>x*L.amb));gl.uniform3fv(u.uCam,cam.eye);gl.uniform3fv(u.uHor,hex(L.hor));gl.uniform3fv(u.uTop,hex(L.top));gl.uniform1f(u.uEmK,L.em);gl.uniform1f(u.uFogD,L.fog||.006);gl.uniform1f(u.uExp,L.exp||1);
   const ls=(mesh&&mesh.lights||[]).slice(0,8),pp=new Float32Array(24),pc=new Float32Array(24);ls.forEach((l,i)=>{pp.set(l.p,i*3);pc.set(l.c,i*3)});gl.uniform3fv(u.uPL,pp);gl.uniform3fv(u.uPC,pc);gl.uniform1i(u.uNL,ls.length);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(u.uSh,0);
   gl.uniform1f(u.uGlass,0);gl.bindVertexArray(VO.a);gl.drawArrays(gl.TRIANGLES,0,VO.n);
   if(VG.n){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(u.uGlass,1);gl.bindVertexArray(VG.a);gl.drawArrays(gl.TRIANGLES,0,VG.n);gl.depthMask(true);gl.disable(gl.BLEND)}
  }};
 return api}

/* ---------- light presets ---------- */
const LIGHT={
 morning:{sun:[.75,.42,.62],sunCol:'#FFD9B0',sunK:2.9,top:'#6FA4D8',hor:'#F2D9BC',sky:'#A9C3E2',gnd:'#7A6A56',amb:.5,em:.3,fog:.0028,exp:1.05},
 noon:{sun:[.45,.85,.5],sunCol:'#FFF3E0',sunK:3.3,top:'#4A8FD4',hor:'#D6E6F4',sky:'#9EBFE6',gnd:'#7D735F',amb:.42,em:.08,fog:.002,exp:.95},
 dusk:{sun:[-.8,.22,.55],sunCol:'#FF9A55',sunK:2.1,top:'#1F2D55',hor:'#EE9A5A',sky:'#56628E',gnd:'#4A3A30',amb:.42,em:1,fog:.0032,exp:1.1},
 studio:{sun:[.85,.42,-.32],sunCol:'#FFE6C8',sunK:2.6,top:'#7FAEDC',hor:'#EFE2CF',sky:'#B4C8E2',gnd:'#8A7A66',amb:.62,em:.55,fog:.002,exp:1.05},
 night:{sun:[.3,.75,-.4],sunCol:'#9DB3E0',sunK:.35,top:'#060B18',hor:'#1A2848',sky:'#2A3A66',gnd:'#141822',amb:.22,em:1.6,fog:.006,exp:1.35,stars:.9}};
const FACADE={plaster:{w:'#ECE6D9',m:0,a:'#B9A88C',am:'stone',label:'White plaster'},concrete:{w:'#B8B5AD',m:'concrete',a:'#6F6A62',am:'concrete',label:'Exposed concrete'},stone:{w:'#E8E1D3',m:0,a:'#C9B79A',am:'stone',label:'Natural stone'},timber:{w:'#B07C4F',m:'wood',a:'#3C3A38',am:'concrete',label:'Timber cladding'}};

/* ---------- villa scene ---------- */
function villa(o){o=o||{};const FA=FACADE[o.facade||'plaster'],m=new Mesh(),W=FA.w,WM={m:FA.m},G={glass:true},gl='#9FB8C8',dark='#2B3442',slab='#E9E4DA',wood='#9A6A42',IW='#ECE6DA',Y=.35,CH=3.38;
 // site
 m.box(-70,-.2,-70,70,0,70,'#557A43',{m:'grass'});
 m.box(-9,0,-6,10,.3,5.2,'#D9D2C4',{m:'tile'});m.box(-8,0,5.2,9,.22,6.6,wood,{m:'wood'});
 m.box(-7.2,0,6.6,4.8,.26,6.9,'#E3DDD0',{m:'stone'});m.box(-7.2,0,10.3,4.8,.26,10.6,'#E3DDD0',{m:'stone'});m.box(-7.2,0,6.6,-6.9,.26,10.6,'#E3DDD0',{m:'stone'});m.box(4.5,0,6.6,4.8,.26,10.6,'#E3DDD0',{m:'stone'});
 m.box(-6.9,-.6,6.9,4.5,-.55,10.3,'#4FB3C8',{m:'tile',em:o.clay?0:.0});m.box(-6.9,-.6,6.9,-6.85,.1,10.3,'#6CC0CF',{m:'tile'});m.box(4.45,-.6,6.9,4.5,.1,10.3,'#6CC0CF',{m:'tile'});m.box(-6.9,-.6,10.25,4.5,.1,10.3,'#6CC0CF',{m:'tile'});
 m.box(-6.9,.05,6.9,4.5,.06,10.3,'#2E9DB8',{glass:true,em:-1});
 m.box(4.8,0,6.6,9,.05,11,'#D9D2C4',{m:'tile'});m.box(10,0,-4,16,.04,14,'#C9C1B1',{m:'concrete'});
 for(let i=0;i<4;i++)m.box(8.9+i*.0,.0,5.4-i*.0,9.6,.08+i*.07,5.9-i*.0,'#D9D2C4');
 // ground floor slab, walls, linings
 m.box(-7.2,.3,-4.2,4.2,Y,4.2,'#B48E66',{m:'wood'});
 m.box(-7.2,.3,-4.2,4.2,3.5,-3.95,W,WM);m.box(-7.2,.3,-4.2,-6.95,3.5,4.2,W,WM);m.box(3.95,.3,-4.2,4.2,3.5,1.2,W,WM);m.box(-6.95,.3,3.9,-6.4,3.5,4.2,W,WM);
 m.box(-6.95,Y,-3.95,3.95,CH,-3.92,IW);m.box(-6.95,Y,-3.92,-6.92,CH,3.9,IW);m.box(3.92,Y,-3.92,3.95,CH,1.2,IW);m.box(-6.95,CH,-3.95,3.95,3.5,3.95,'#F1ECE3');
 for(let x=-6.4;x<3.9;x+=2.06)m.box(x,Y,4.02,x+.06,3.5,4.1,dark,{m:'metal'});
 m.box(-6.4,3.38,4,3.95,3.5,4.12,dark,{m:'metal'});m.box(-6.4,Y,4.0,3.95,3.38,4.06,gl,G);m.box(3.98,Y,1.2,4.04,3.38,4.0,gl,G);
 m.box(-7.3,3.5,-4.3,4.4,3.85,4.3,slab);
 // first floor cantilever
 m.box(-4,3.85,-3.6,8,7,-3.35,W,WM);m.box(-4,3.85,-3.6,-3.75,7,4.6,W,WM);m.box(7.75,3.85,-3.6,8,7,4.6,W,WM);
 m.box(-3.75,3.85,4.35,-3,7,4.6,W,WM);m.box(5.1,3.85,4.35,7.75,7,4.6,W,WM);m.box(-3,3.85,4.35,5.1,4.6,4.6,W,WM);m.box(-3,6.45,4.35,5.1,7,4.6,W,WM);
 m.box(-3,4.6,4.45,5.1,6.45,4.5,gl,G);for(let x=-3;x<5.1;x+=2.7)m.box(x,4.6,4.42,x+.06,6.45,4.52,dark,{m:'metal'});
 m.box(-3.75,3.85,-3.35,7.75,3.9,4.35,'#B48E66',{m:'wood'});
 for(let i=0;i<10;i++){const x=5.25+i*.25;m.box(x,3.95,4.62,x+.09,6.95,4.8,wood,{m:'wood'})}
 m.box(-4.6,7,-4.1,8.6,7.35,5.2,dark);m.box(-4.6,7.35,-4.1,8.6,7.5,-3.95,dark);m.box(-4.6,7.35,5.05,8.6,7.5,5.2,dark);
 // stair core accent
 m.box(-9,0,-2.5,-7.2,8.2,2,FA.a,{m:FA.am});m.box(-8.95,1.2,2,-7.25,7.4,2.06,gl,G);for(let i=0;i<9;i++)m.box(-8.9,.3+i*.8,1.2-i*.0,-7.3,.36+i*.8,1.95,'#D9D2C4');
 // ---- living ----
 LIB.rug(m,-6.2,-2.2,-2.2,1.6,Y,'#D8CDB8','#8A7458');
 LIB.sofa(m,-4.2,-2.75,0,{y:Y,w:2.6,fab:'#E2DBCE',pillow:'#1F3B63',pillow2:'#C08A3E'});
 LIB.armchair(m,-5.5,.85,2,{y:Y,fab:'#8C6A4E'});LIB.armchair(m,-2.9,.85,2,{y:Y,fab:'#8C6A4E'});
 m.box(-4.9,Y,-1.5,-3.5,Y+.36,-.6,'#3A3D42');m.box(-4.95,Y+.36,-1.55,-3.45,Y+.4,-.55,'#EFEBE3',{m:'marble'});m.box(-4.4,Y+.4,-1.2,-4.15,Y+.48,-1,'#C08A3E');
 LIB.floorLamp(m,-6.35,-3.3,Y,{k:.9});LIB.tvWall(m,-6.9,-.6,1,{y:Y,w:3.2});LIB.shelf(m,-6.54,2.6,1,{y:Y,w:1.5,h:2.2});
 LIB.plant(m,-6.3,3.4,Y,1.2);LIB.plant(m,-1.6,-3.4,Y,1);LIB.curtains(m,-6.35,-5.6,3.88,Y+.02,CH,'#EDE6DA',-1);LIB.curtains(m,3.1,3.88,3.88,Y+.02,CH,'#EDE6DA',-1);
 // ---- dining ----
 LIB.table(m,1.5,1.9,0,{y:Y,w:2.2,d:1,top:'#8A5E3A'});[[.85,1.25,0],[1.5,1.25,0],[2.15,1.25,0],[.85,2.55,2],[1.5,2.55,2],[2.15,2.55,2]].forEach(([x,z,r])=>LIB.chair(m,x,z,r,{y:Y,seat:'#C9B79A',frame:'#2F2A26',back:'#8A5E3A'}));
 m.box(.25,CH-.04,1.7,2.75,CH,2.1,'#2B2B2B');[.85,1.5,2.15].forEach(x=>LIB.pendant(m,x,CH,1.9,{len:.85,r:.16,col:'#C9A46A'}));
 // ---- kitchen ----
 LIB.kitchen(m,-.3,-3.92,4.25,{y:Y,cab:'#EFEBE3',upper:'#EFEBE3',top:'#ECE9E3',splash:'#D6D0C4',fridge:true,tall:'#2A3446'});
 LIB.island(m,1.75,-1.65,2.5,1,{y:Y,base:'#2A3446',top:'#ECE9E3',stool:'#8C6A4E'});
 [1.05,1.75,2.45].forEach(x=>LIB.pendant(m,x,CH,-1.65,{len:.9,r:.13,col:'#1E2A3A'}));
 LIB.downlights(m,-6.2,-3.2,3.4,3.2,CH,1.6);
 // first floor (visible through ribbon window)
 m.box(-3.6,3.9,-3.3,7.6,6.9,-3.25,'#E6D8C2');LIB.bed(m,.8,-2.2,0,{y:3.9,w:1.8,fab:'#E1D9CB'});LIB.rug(m,-.6,-1.1,2.2,1.6,3.9,'#CBBFA8');
 LIB.shelf(m,4.5,-2.9,0,{y:3.9,w:1.4,h:2.1});LIB.plant(m,-3.2,3.8,3.9,1);LIB.curtains(m,-2.95,-2.1,4.4,4.62,6.42,'#EDE6DA',-1);m.box(-3.6,6.88,-3,7.6,6.92,4.2,'#F3EEE6');LIB.downlights(m,-2.6,-2.4,6.6,3.4,6.88,2.2);
 // terrace under cantilever + pool furniture
 LIB.sofa(m,6,-1,0,{y:Y,w:2.2,fab:'#D8D2C6',seats:2});m.box(5.4,Y,.3,6.6,Y+.32,.9,'#8A5E3A',{m:'wood'});LIB.plant(m,7.4,-3,Y,1.1);LIB.plant(m,4.6,3.6,Y,.9);
 LIB.lounger(m,5.6,8.3,2);LIB.lounger(m,6.6,8.3,2);LIB.umbrella(m,7.7,7.4);
 // landscape
 const tr=[[-14,-6,1.1],[-16,4,1.3],[-12,12,1],[16,-8,1.4],[18,2,1.2],[-4,-10,1.2],[6,-10,1],[13,10,.9],[-18,-14,1.5],[20,-16,1.3]];
 tr.forEach(([x,z,s],i)=>{const g=i%2?'#3F6436':'#4B7340';m.cyl(x,z,0,2.4*s,.16*s,'#5B4632',{r1:.11*s});m.sph(x,3*s+.5,z,1.5*s,1.7*s,1.5*s,g,{jit:.3,seed:i+2,la:7,lo:11,m:'leaf'});m.sph(x+.9*s,2.5*s+.4,z+.4*s,1.1*s,1.2*s,1.1*s,g,{jit:.3,seed:i+7,la:6,lo:9,m:'leaf'});m.sph(x-.7*s,3.6*s+.4,z-.5*s,1*s,1.1*s,1*s,g,{jit:.3,seed:i+13,la:6,lo:9,m:'leaf'})});
 for(let x=-10;x<10;x+=1.2)m.sph(x,.45,-6.8,.7,.5,.5,'#4F7A45',{jit:.2,seed:Math.round(x*7+50),la:5,lo:8,m:'leaf'});
 m.box(-12,0,-13,14,1.4,-12.6,'#CFC6B6',{m:'stone'});
 for(const x of [-6,-2,2]){m.cyl(x,6.75,.24,.6,.03,'#333333');m.sph(x,.65,6.75,.08,.06,.08,'#FFC47A',{em:1.5})}
 m.sph(-8.2,.6,4.6,.7,.6,.7,'#58804A',{jit:.3,seed:9,m:'leaf'});m.sph(5.6,.55,5.8,.6,.5,.6,'#4A6E3E',{jit:.3,seed:11,m:'leaf'});
 // lights: living lamp, dining, island, bedroom, terrace, pool (max 8)
 m.light(-6.2,1.8,-3,'#FFE2BC',1.1).light(1.5,2.4,1.9,'#FFE2BC',1.3).light(1.75,2.3,-1.65,'#FFF0DA',1.1).light(-3.5,2.9,-.5,'#FFE9CC',.8).light(1,6.3,-.5,'#FFD9A8',1.6).light(6,3.2,0,'#FFC27A',1.2).light(-2,.8,6.2,'#FFC27A',1).light(-1,-.3,8.6,'#9FE4FF',1.4);
 if(o.clay){for(let i=6;i<m.o.length;i+=11){const g=m.o[i+1]>m.o[i]*1.15&&m.o[i+1]>m.o[i+2]?.82:.9;m.o[i]=m.o[i+1]=m.o[i+2]=g;m.o[i+3]=0;m.o[i+4]=0}m.lights=[]}
 return m}

/* ---------- parametric interior room (Project Studio) ---------- */
function room(p){p=p||{};const w=Math.max(2.6,Math.min(p.w||4.2,12)),l=Math.max(2.6,Math.min(p.l||5,14)),h=p.h||3,m=new Mesh();
 const wall=p.wall||'#E9E2D4',acc=p.accent||'#1F3B63',fl=p.floor||'#B98A5B',wd=p.wood||'#8B5E34',fab=p.fabric||'#D9D2C4',rug=p.rug||'#C9B79A',warm=p.warmth==='cool'?'#E6F0FF':'#FFD9A8';
 const x0=-w/2,x1=w/2,z0=-l/2,z1=l/2,fm=p.floorMat||(p.layout==='cafe'||p.layout==='kitchen'?'tile':'wood');
 m.box(x0-.2,-.2,z0-.2,x1+.2,0,z1+.2,fl,{m:fm});
 m.box(x0-.2,0,z0-.2,x1+.2,h,z0,wall);m.box(x0-.2,0,z0,x0,h,z1,wall);
 m.box(x1,0,z0,x1+.2,h,z0+l*.25,wall);m.box(x1,0,z0+l*.75,x1+.2,h,z1,wall);m.box(x1,0,z0+l*.25,x1+.2,.6,z0+l*.75,wall);m.box(x1,2.4,z0+l*.25,x1+.2,h,z0+l*.75,wall);
 m.box(x1+.08,.6,z0+l*.25,x1+.12,2.4,z0+l*.75,'#BCD3E0',{glass:true});m.box(x1+.02,.6,z0+l*.5-.02,x1+.12,2.4,z0+l*.5+.02,'#2B3442',{m:'metal'});
 m.box(x0-.2,0,z0,x1,.08,z0+.015,'#F4F1EA');m.box(x0,0,z0,x0+.015,.08,z1,'#F4F1EA');
 m.box(x0-.2,h,z0-.2,x1+.2,h+.2,z1,'#F2EEE6');
 if(p.feature!=='none'&&p.layout!=='kitchen'&&p.layout!=='cafe')m.box(x0+w*.18,0,z0,x1-w*.18,h,z0+.05,acc,{m:p.layout==='bedroom'?0:'slats'});
 if(p.ceiling==='cove'){m.box(x0,h-.32,z0,x1,h-.28,z1,'#F4F1EA');m.box(x0+.35,h-.28,z0+.35,x1-.35,h-.26,z1-.35,warm,{em:1.1});m.box(x0+.45,h-.26,z0+.45,x1-.45,h,z1-.45,'#F4F1EA')}
 else if(p.ceiling==='beams'){for(let x=x0+.6;x<x1;x+=1.1)m.box(x,h-.25,z0,x+.16,h,z1,wd,{m:'wood'})}
 LIB.curtains(m,x1-.1,x1-.04,z0+l*.25-.4,0,h-.05,'#EDE6DA');m.box(x1-.14,0,z0+l*.25-.5,x1-.04,h-.05,z0+l*.25-.05,'#EDE6DA',{m:'fabric'});m.box(x1-.14,0,z0+l*.75+.05,x1-.04,h-.05,z0+l*.75+.5,'#EDE6DA',{m:'fabric'});
 const L=p.layout||'lounge';
 if(L==='lounge'){LIB.rug(m,-1.5,z0+1.1,1.5,z0+3.4,0,rug,'#8A7458');LIB.sofa(m,0,z0+.75,0,{w:Math.min(2.6,w-1.2),fab,pillow:acc,pillow2:'#C08A3E'});LIB.armchair(m,x1-.9,z0+2.6,3,{fab:wd});m.box(-.55,0,z0+1.9,.55,.36,z0+2.6,wd,{m:'wood'});LIB.floorLamp(m,x0+.45,z0+.45,0,{light:false});LIB.shelf(m,x0+.38,z0+l*.62,1,{w:1.2,h:2,wood:wd});LIB.plant(m,x0+.5,z1-.7,0,1)}
 if(L==='dining'){LIB.table(m,0,0,0,{w:Math.min(2,w-1.4),d:.95,top:wd});const tw=Math.min(2,w-1.4);[-tw/3,0,tw/3].forEach(x=>{LIB.chair(m,x,-.68,0,{seat:fab,back:wd});LIB.chair(m,x,.68,2,{seat:fab,back:wd})});LIB.pendant(m,0,h,0,{len:1.1,r:.28,col:acc});m.box(x0+.02,0,z0+.5,x0+.48,.8,z0+2.3,wd,{m:'wood'});LIB.plant(m,x0+.5,z1-.7,0,1)}
 if(L==='bedroom'){LIB.bed(m,0,z0+1.15,0,{w:Math.min(1.8,w-1.6),wood:wd,fab});LIB.rug(m,-1.3,z0+1.6,1.3,z0+3.2,0,rug);m.box(x0+.02,0,z1-1.9,x0+.62,2.3,z1-.5,wd,{m:'wood'});LIB.plant(m,x1-.5,z0+.5,0,.85)}
 if(L==='office'){LIB.table(m,0,z0+.9,0,{w:1.6,d:.75,top:wd,leg:'#2B2B2B'});LIB.chair(m,0,z0+1.55,2,{seat:'#2F2F33',frame:'#2B2B2B'});LIB.shelf(m,x0+.38,z0+1.6,1,{w:1.6,h:2.1,wood:wd});m.box(-.25,.75,z0+.65,.25,1.05,z0+.68,'#0E0F12',{m:'gloss'});LIB.plant(m,x1-.6,z1-.6,0,1)}
 if(L==='kitchen'){LIB.kitchen(m,x0+.1,z0,Math.min(w-.3,4.2),{cab:p.cabinets||'#EFEBE3',upper:p.cabinets||'#EFEBE3',top:'#ECE9E3',splash:wall,fridge:w>3.4,tall:acc});if(l>3.8)LIB.island(m,0,z0+2.2,Math.min(2.2,w-1.4),.9,{base:acc,stool:fab})}
 if(L==='cafe'){m.box(x0+.6,0,z0+.1,x1-1.2,1.05,z0+.8,acc,{m:'gloss'});m.box(x0+.55,1.05,z0+.05,x1-1.15,1.1,z0+.85,'#E9E6E0',{m:'marble'});for(const y of [1.6,2.1])m.box(x0+.6,y,z0,x1-1.2,y+.04,z0+.3,wd,{m:'wood'});
  for(let i=0;i<4;i++){const x=x0+1.2+i*((w-2.4)/3);LIB.pendant(m,x,h,z0+.45,{len:.95,r:.14,col:'#1E2A3A'});LIB.stool(m,x,z0+1.15,{seat:fab})}
  for(const [x,z] of [[-w*.25,.4],[w*.15,.4],[-w*.25,l*.3],[w*.15,l*.3]]){LIB.table(m,x,z,0,{w:.7,d:.7,top:wd,pedestal:true});LIB.chair(m,x-.55,z,1,{seat:fab});LIB.chair(m,x+.55,z,3,{seat:fab})}}
 m.light(0,h-.7,0,warm,1.2).light(x0+w*.3,h-.5,z1-1,warm,.7).light(x1-.6,1.6,0,'#FFF4E0',.5);
 return {mesh:m,center:[0,h/2,0],rad:Math.max(w,l)*.9}}

function spline(pts,t){const n=pts.length-1,s=Math.min(Math.max(t,0),.9999)*n,i=Math.floor(s),f=s-i,p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[Math.min(i+1,n)],p3=pts[Math.min(i+2,n)];
 return [0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*f+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*f*f+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*f*f*f))}
const TOUR={eye:[[24,10,26],[6,6,24],[-12,3.2,17],[-3,1.9,9.5],[-1.5,1.65,3.2],[-3.4,1.6,.2],[-.4,1.65,.4],[.9,1.6,.6]],target:[[0,3,0],[0,3,2],[-1,2.4,3],[-1.5,1.8,0],[-3.4,1.2,-2.4],[-6.5,1.4,-.6],[1.9,1.2,-2.2],[2.2,1.25,-3.6]],names:['Approach','Garden','Poolside','Into the living room','Living room','Media wall','Dining and island','Kitchen']};
return {create,villa,room,LIB,LIGHT,FACADE,spline,TOUR,V3,hex}})();
