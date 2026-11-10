/* Mutqaan mini 3D engine: dependency-free WebGL2 renderer (boxes, cylinders, spheres), sun shadows, sky, interior point lights, glass. */
const M3=(function(){
const hex=h=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]};
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sc:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cr:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],n:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]},lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
const M4={
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 persp(f,asp,n,fa){const t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o},
 ortho(l,r,b,t,n,f){const o=new Float32Array(16);o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);o[15]=1;return o},
 look(e,c,u){const z=V3.n(V3.sub(e,c)),x=V3.n(V3.cr(u,z)),y=V3.cr(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,e),-V3.dot(y,e),-V3.dot(z,e),1])},
 inv(m){const o=new Float32Array(16),[a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=m;
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  const d=1/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
  o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o}};

/* ---------- geometry ---------- */
function Mesh(){this.o=[];this.g=[];this.lights=[]}
Mesh.prototype.v=function(arr,p,n,c,e){arr.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],e)};
Mesh.prototype.box=function(x0,y0,z0,x1,y1,z1,col,o){o=o||{};const c=typeof col==='string'?hex(col):col,e=o.em||0,A=o.glass?this.g:this.o;
 const F=[[[1,0,0],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]]],[[-1,0,0],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]]],[[0,1,0],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]]],[[0,-1,0],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]],[[0,0,1],[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]],[[0,0,-1],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]]];
 for(const [n,q] of F){if(o.skip&&o.skip.includes(n.join()))continue;for(const i of [0,1,2,0,2,3])this.v(A,q[i],n,c,e)}return this};
Mesh.prototype.cyl=function(x,z,y0,y1,r,col,o){o=o||{};const c=typeof col==='string'?hex(col):col,e=o.em||0,A=this.o,N=o.seg||12;
 for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,p0=[Math.cos(a0),Math.sin(a0)],p1=[Math.cos(a1),Math.sin(a1)];
  const v=(p,y)=>[x+p[0]*r,y,z+p[1]*r],n0=[p0[0],0,p0[1]],n1=[p1[0],0,p1[1]];
  this.v(A,v(p0,y0),n0,c,e);this.v(A,v(p1,y0),n1,c,e);this.v(A,v(p1,y1),n1,c,e);this.v(A,v(p0,y0),n0,c,e);this.v(A,v(p1,y1),n1,c,e);this.v(A,v(p0,y1),n0,c,e);
  this.v(A,[x,y1,z],[0,1,0],c,e);this.v(A,v(p1,y1),[0,1,0],c,e);this.v(A,v(p0,y1),[0,1,0],c,e)}return this};
Mesh.prototype.sph=function(x,y,z,rx,ry,rz,col,o){o=o||{};const c=typeof col==='string'?hex(col):col,e=o.em||0,A=this.o,la=o.la||8,lo=o.lo||12,j=o.jit||0;let seed=o.seed||1;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
 const P=[];for(let i=0;i<=la;i++){P.push([]);for(let k=0;k<=lo;k++){const t=i/la*Math.PI,p=k/lo*Math.PI*2,s=1+(i>0&&i<la&&k<lo?(rnd()-.5)*j:0);P[i].push([Math.sin(t)*Math.cos(p)*s,Math.cos(t)*s,Math.sin(t)*Math.sin(p)*s])}P[i][lo]=P[i][0]}
 const W=q=>[x+q[0]*rx,y+q[1]*ry,z+q[2]*rz],Nn=q=>V3.n([q[0]/rx,q[1]/ry,q[2]/rz]);
 for(let i=0;i<la;i++)for(let k=0;k<lo;k++){const a=P[i][k],b=P[i+1][k],d=P[i+1][k+1],f=P[i][k+1];for(const q of [a,b,d,a,d,f])this.v(A,W(q),Nn(q),c,e)}return this};
Mesh.prototype.light=function(x,y,z,col,k){this.lights.push({p:[x,y,z],c:V3.sc(hex(col),k||1)});return this};

/* ---------- shaders ---------- */
const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec3 aC;layout(location=3) in float aE;
uniform mat4 uVP,uLVP;out vec3 vN,vC,vW;out float vE;out vec4 vL;
void main(){vN=aN;vC=aC;vE=aE;vW=aP;vL=uLVP*vec4(aP,1.);gl_Position=uVP*vec4(aP,1.);}`;
const FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vN,vC,vW;in float vE;in vec4 vL;
uniform vec3 uSun,uSunC,uSky,uGnd,uCam,uHor,uTop;uniform float uEmK,uGlass,uFogD,uExp;uniform sampler2DShadow uSh;
uniform vec3 uPL[8];uniform vec3 uPC[8];uniform int uNL;out vec4 o;
vec3 lin(vec3 c){return pow(c,vec3(2.2));}
vec3 aces(vec3 x){x*=uExp;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float sh(){vec3 p=vL.xyz/vL.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;vec2 t=1./vec2(textureSize(uSh,0));float s=0.;
for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++)s+=texture(uSh,vec3(p.xy+vec2(x,y)*t*.9,p.z-.0009));return s/25.;}
void main(){vec3 N=normalize(vN);vec3 V=normalize(uCam-vW);vec3 c=lin(vC);
float nl=max(dot(N,uSun),0.);float s=nl>0.?sh():0.;vec3 hemi=mix(uGnd,uSky,N.y*.5+.5);
float ao=mix(.55,1.,clamp(vW.y*1.4+.25,0.,1.));
vec3 pl=vec3(0.);for(int i=0;i<8;i++){if(i>=uNL)break;vec3 d=uPL[i]-vW;float r=length(d);pl+=uPC[i]*(max(dot(N,d/r),0.)*.85+.15)/(1.+r*r*.9);}
float f=pow(1.-max(dot(N,V),0.),5.);
if(uGlass>.5){vec3 R=reflect(-V,N);vec3 sk=mix(lin(uHor),lin(uTop),clamp(R.y*1.3,0.,1.));vec3 g=sk*.75+c*.1+uSunC*pow(max(dot(R,uSun),0.),300.)*3.;
 float al=mix(.05,.6,f);if(vE<0.){g=mix(c*(hemi+uSunC*.25),sk,.25+.5*f);al=.82;}
 o=vec4(pow(aces(g),vec3(1./2.2)),al);return;}
vec3 col=c*(hemi*ao+uSunC*nl*s+pl*uEmK)+c*vE*uEmK*2.2+f*hemi*.08;
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
void main(){vec4 w=uInv*vec4(vP,1.,1.);vec3 d=normalize(w.xyz/w.w-uCam);float t=clamp(d.y,0.,1.);
vec3 c=mix(lin(uHor),lin(uTop),pow(t,.45));float s=max(dot(d,uSun),0.);c+=uSunC*(pow(s,900.)*6.+pow(s,12.)*.12);
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
 function vao(){const a=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(a);gl.bindBuffer(gl.ARRAY_BUFFER,b);const st=40;[[0,3,0],[1,3,12],[2,3,24],[3,1,36]].forEach(([l,s,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s,gl.FLOAT,false,st,o)});return {a,b,n:0}}
 const VO=vao(),VG=vao();let mesh=null,center=[0,0,0],rad=20;
 function up(V,arr){gl.bindVertexArray(V.a);gl.bindBuffer(gl.ARRAY_BUFFER,V.b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);V.n=arr.length/10}
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
 morning:{sun:[.75,.42,.62],sunCol:'#FFD9B0',sunK:2.9,top:'#6FA4D8',hor:'#F2D9BC',sky:'#A9C3E2',gnd:'#7A6A56',amb:.5,em:.25,fog:.0028,exp:1.05},
 noon:{sun:[.45,.85,.5],sunCol:'#FFF3E0',sunK:3.3,top:'#4A8FD4',hor:'#D6E6F4',sky:'#9EBFE6',gnd:'#7D735F',amb:.42,em:0,fog:.002,exp:.95},
 dusk:{sun:[-.8,.22,.55],sunCol:'#FF9A55',sunK:2.1,top:'#1F2D55',hor:'#EE9A5A',sky:'#56628E',gnd:'#4A3A30',amb:.42,em:1,fog:.0032,exp:1.1},
 night:{sun:[.3,.75,-.4],sunCol:'#9DB3E0',sunK:.35,top:'#060B18',hor:'#1A2848',sky:'#2A3A66',gnd:'#141822',amb:.22,em:1.6,fog:.006,exp:1.35,stars:.9}};
const FACADE={plaster:{w:'#ECE6D9',a:'#A08B6E',label:'White plaster'},concrete:{w:'#B8B5AD',a:'#6F6A62',label:'Exposed concrete'},stone:{w:'#D3C2A2',a:'#7E6A50',label:'Natural stone'},timber:{w:'#B07C4F',a:'#3C3A38',label:'Timber cladding'}};

/* ---------- villa scene ---------- */
function villa(o){o=o||{};const F=FACADE[o.facade||'plaster'],m=new Mesh(),W=F.w,A=F.a,G={glass:true},gl='#9FB8C8',dark='#2B3442',slab='#E9E4DA',wood='#9A6A42',warm='#FFC47A';
 // ground, lawn, paths
 m.box(-70,-.2,-70,70,0,70,'#557A43');
 m.box(-9,0,-6,10,.3,5.2,'#D9D2C4');                       // plinth
 m.box(-8,0,5.2,9,.22,6.6,wood);                            // deck
 m.box(-7.2,0,6.6,4.8,.24,6.9,'#E3DDD0');m.box(-7.2,0,10.3,4.8,.24,10.6,'#E3DDD0');m.box(-7.2,0,6.6,-6.9,.24,10.6,'#E3DDD0');m.box(4.5,0,6.6,4.8,.24,10.6,'#E3DDD0');
 m.box(-6.9,-.6,6.9,4.5,-.55,10.3,'#3E9FB5');m.box(-6.9,-.6,6.9,-6.85,.1,10.3,'#5DB3C4');m.box(4.45,-.6,6.9,4.5,.1,10.3,'#5DB3C4');m.box(-6.9,-.6,10.25,4.5,.1,10.3,'#5DB3C4');
 m.box(-6.9,.05,6.9,4.5,.06,10.3,'#2E9DB8',{glass:true,em:-1});              // water
 m.box(10,0,-4,16,.05,14,'#CFC6B6');m.box(4.8,0,6.6,9,.05,14,'#D9D2C4');   // drive + path
 // ground floor slab + walls
 m.box(-7.2,.3,-4.2,4.2,.35,4.2,'#B4936C');
 m.box(-7.2,.3,-4.2,4.2,3.5,-3.95,W);                       // back wall
 m.box(-7.2,.3,-4.2,-6.95,3.5,4.2,W);                       // left wall
 m.box(3.95,.3,-4.2,4.2,3.5,1.2,W);                         // right wall part
 m.box(-6.95,.3,3.9,-6.4,3.5,4.2,W);                        // front pier
 for(let x=-6.4;x<3.9;x+=2.06)m.box(x,.35,4.02,x+.06,3.5,4.1,dark);
 m.box(-6.4,3.38,4,3.95,3.5,4.12,dark);m.box(-6.4,.35,4.0,3.95,3.38,4.06,gl,G);           // glazing front
 m.box(3.98,.35,1.2,4.04,3.38,4.0,gl,G);                   // side glazing
 const IW='#ECE6DA';m.box(-6.95,.35,-3.95,3.95,3.5,-3.92,IW);m.box(-6.95,.35,-3.92,-6.92,3.5,3.9,IW);m.box(3.92,.35,-3.92,3.95,3.5,1.2,IW);m.box(-6.95,3.38,-3.92,3.95,3.5,3.95,'#F1ECE3');
 m.box(-7.3,3.5,-4.3,4.4,3.85,4.3,slab);                    // first floor slab
 // first floor cantilever
 m.box(-4,3.85,-3.6,8,7,-3.35,W);m.box(-4,3.85,-3.6,-3.75,7,4.6,W);m.box(7.75,3.85,-3.6,8,7,4.6,W);
 m.box(-3.75,3.85,4.35,-3,7,4.6,W);m.box(5.1,3.85,4.35,7.75,7,4.6,W);m.box(-3,3.85,4.35,5.1,4.6,4.6,W);m.box(-3,6.45,4.35,5.1,7,4.6,W);
 m.box(-3,4.6,4.45,5.1,6.45,4.5,gl,G);for(let x=-3;x<5.1;x+=2.7)m.box(x,4.6,4.42,x+.06,6.45,4.52,dark);
 m.box(-3.75,3.85,-3.35,7.75,3.9,4.35,'#D8CDBB');            // ff floor
 for(let i=0;i<10;i++){const x=5.25+i*.25;m.box(x,3.95,4.62,x+.09,6.95,4.8,wood)}
 m.box(-4.6,7,-4.1,8.6,7.35,5.2,dark);                      // roof slab
  // stair core accent
 m.box(-9,0,-2.5,-7.2,8.2,2,A);m.box(-8.95,1.2,2,-7.25,7.4,2.06,gl,G);
 // interior: ground floor living
 m.box(-6,.35,-1,-0.6,.37,2.4,'#D8CDB8');m.box(-4.9,.8,-3.15,-4.1,1.15,-3,'#1F3B63');m.box(-2.6,.8,-3.15,-1.8,1.15,-3,'#C08A3E');                   // rug
 m.box(-5.4,.37,-3.2,-1.4,.8,-2.3,'#E7E1D6');m.box(-5.4,.8,-3.6,-1.4,1.25,-3.2,'#E7E1D6');m.box(-5.6,.37,-3.6,-5.4,1,-2.3,'#E7E1D6');m.box(-1.4,.37,-3.6,-1.2,1,-2.3,'#E7E1D6'); // sofa
 m.box(-4.2,.37,-1.6,-2.4,.75,-.6,wood);                    // coffee table
 m.box(-5.8,.37,.6,-4.9,.85,1.5,'#8C6A4E');m.box(-1.9,.37,.6,-1,.85,1.5,'#8C6A4E'); // armchairs
 m.box(-6.9,1.1,-3.9,-5.9,1.9,-3.86,'#9A3F2B');m.box(-3.9,1.3,-3.94,-1.9,2.5,-3.9,'#1F3B63');   // art
 m.cyl(-5.9,-1.6,.37,1.7,.03,'#222222');m.sph(-5.9,1.85,-1.6,.25,.2,.25,warm,{em:1});
 // dining + kitchen
 m.box(.4,.37,-1.6,3,1.05,.2,wood);for(const [x,z] of [[.7,-2.1],[1.6,-2.1],[2.5,-2.1],[.7,.7],[1.6,.7],[2.5,.7]])m.box(x-.22,.37,z-.2,x+.22,.85,z+.2,'#2F2F33');
 for(const x of [1,2.4]){m.cyl(x,-.7,2.5,3.5,.01,'#111111');m.sph(x,2.42,-.7,.22,.16,.22,warm,{em:1.2})}
 m.box(.2,.37,-3.95,3.9,1.25,-3.35,'#EFEBE3');m.box(.2,1.25,-3.95,3.9,1.3,-3.35,'#3A3A3A');m.box(.2,1.9,-3.95,3.9,2.8,-3.6,'#EFEBE3');
 m.box(1,.37,-2.9,3.4,1.25,-2.3,'#2A3446');m.box(.95,1.25,-2.95,3.45,1.3,-2.25,'#E9E6E0');
 m.box(-6.9,3.42,-3.9,3.9,3.46,-3.8,warm,{em:1.4});m.box(-6.9,3.42,3.8,3.9,3.46,3.9,warm,{em:.9});        // cove lights
 m.cyl(-.3,3,.37,.75,.22,'#D9D2C4');m.sph(-.3,1.25,3,.5,.6,.5,'#4F7A45',{jit:.3,seed:3});
 // first floor glow rooms
 m.box(-3.6,3.9,-3.3,5,6.8,-3.25,'#E6D2B0');m.box(-1,3.9,-2.5,3,4.5,1,'#E7E1D6');m.box(-1,4.5,-2.6,3,5.2,-2.4,'#B88F6A');
 m.box(-3.6,6.88,-3,7.6,6.92,4.2,warm,{em:.8});
 // landscape
 const tr=[[-14,-6,1.1],[-16,4,1.3],[-12,12,1],[16,-8,1.4],[18,2,1.2],[-4,-10,1.2],[6,-10,1],[13,10,.9],[-18,-14,1.5],[20,-16,1.3]];
 tr.forEach(([x,z,s],i)=>{const g=i%2?'#3F6436':'#4B7340';m.cyl(x,z,0,2.4*s,.16*s,'#5B4632');m.sph(x,3*s+.5,z,1.5*s,1.7*s,1.5*s,g,{jit:.3,seed:i+2,la:7,lo:11});m.sph(x+.9*s,2.5*s+.4,z+.4*s,1.1*s,1.2*s,1.1*s,g,{jit:.3,seed:i+7,la:6,lo:9});m.sph(x-.7*s,3.6*s+.4,z-.5*s,1*s,1.1*s,1*s,g,{jit:.3,seed:i+13,la:6,lo:9})});
 for(let x=-10;x<10;x+=1.2)m.sph(x,.45,-6.8,.7,.5,.5,'#4F7A45',{jit:.2,seed:Math.round(x*7+50),la:5,lo:8});
 m.box(-12,0,-13,14,1.4,-12.6,'#CFC6B6');
 for(const x of [-6,-2,2]){m.cyl(x,6.75,.24,.6,.03,'#333333');m.sph(x,.65,6.75,.08,.06,.08,warm,{em:1.5})}
 m.sph(-8.2,.6,4.6,.7,.6,.7,'#58804A',{jit:.3,seed:9});m.sph(5.6,.55,5.8,.6,.5,.6,'#4A6E3E',{jit:.3,seed:11});
 // interior & terrace lights
 m.light(-3.5,2.6,-1,'#FFE2BC',1.3).light(1.7,2.3,-.7,'#FFE2BC',1.2).light(2,2.6,-3,'#FFF0DA',.9).light(1,6.2,0,'#FFD9A8',1.8).light(-2,.8,6.2,'#FFC27A',1.2).light(6.5,3.5,2.5,'#FFC27A',1.6);
 if(o.clay){for(let i=6;i<m.o.length;i+=10){const g=m.o[i+1]>m.o[i]*1.15&&m.o[i+1]>m.o[i+2]?.82:.9;m.o[i]=m.o[i+1]=m.o[i+2]=g;m.o[i+3]=0}m.lights=[]}
 return m}

/* ---------- parametric interior room (Project Studio) ---------- */
function room(p){p=p||{};const w=Math.max(2.4,Math.min(p.w||4.2,12)),l=Math.max(2.4,Math.min(p.l||5,14)),h=p.h||3,m=new Mesh();
 const wall=p.wall||'#E9E2D4',acc=p.accent||'#1F3B63',fl=p.floor||'#B98A5B',wood=p.wood||'#8B5E34',fab=p.fabric||'#D9D2C4',warm=p.warmth==='cool'?'#E2EEFF':'#FFC98A';
 const x0=-w/2,x1=w/2,z0=-l/2,z1=l/2;
 m.box(x0-.2,-.2,z0-.2,x1+.2,0,z1+.2,fl);
 m.box(x0-.2,0,z0-.2,x1+.2,h,z0,wall);m.box(x0-.2,0,z0,x0,h,z1,wall);
 m.box(x1,0,z0,x1+.2,h,z0+l*.25,wall);m.box(x1,0,z0+l*.75,x1+.2,h,z1,wall);m.box(x1,0,z0+l*.25,x1+.2,.6,z0+l*.75,wall);m.box(x1,2.4,z0+l*.25,x1+.2,h,z0+l*.75,wall);
 m.box(x1+.05,.6,z0+l*.25,x1+.12,2.4,z0+l*.75,'#BCD3E0',{glass:true});
 m.box(x0-.2,h,z0-.2,x1+.2,h+.2,z1,'#F2EEE6');
 if(p.feature!=='none')m.box(x0+w*.2,0,z0,x1-w*.2,h,z0+.06,acc);
 if(p.ceiling==='cove'){m.box(x0,h-.35,z0,x1,h-.3,z1,'#F4F1EA');m.box(x0+.4,h-.3,z0+.4,x1-.4,h-.28,z1-.4,warm,{em:1.1});m.box(x0+.5,h-.28,z0+.5,x1-.5,h,z1-.5,'#F4F1EA')}
 else if(p.ceiling==='beams'){for(let x=x0+.6;x<x1;x+=1.1)m.box(x,h-.25,z0,x+.16,h,z1,wood)}
 const sofaZ=z0+.9,cx=0;
 if(p.layout==='lounge'||!p.layout){m.box(cx-1.3,0,sofaZ-.45,cx+1.3,.42,sofaZ+.45,fab);m.box(cx-1.3,.42,sofaZ-.45,cx+1.3,.85,sofaZ-.2,fab);m.box(x0+.1,0,z0+l*.55,x0+.6,.8,z0+l*.55+1.6,wood);m.box(cx-.6,0,sofaZ+1,cx+.6,.38,sofaZ+1.7,wood);m.box(cx-1.6,0,sofaZ+.5,cx+1.6,.01,sofaZ+2.4,p.rug||'#C9B79A')}
 if(p.layout==='dining'){m.box(cx-.9,.72,-.5,cx+.9,.77,.5,wood);for(const x of [-.6,0,.6])for(const z of [-.85,.85])m.box(cx+x-.2,0,z-.2,cx+x+.2,.45,z+.2,fab);m.cyl(cx-.9+.1,-.4,0,.72,.04,wood);m.cyl(cx+.8,.4,0,.72,.04,wood);m.cyl(cx-.8,.4,0,.72,.04,wood);m.cyl(cx+.8,-.4,0,.72,.04,wood)}
 if(p.layout==='bedroom'){m.box(cx-.9,0,z0+.05,cx+.9,.5,z0+2.1,fab);m.box(cx-1,.5,z0+.05,cx+1,1.2,z0+.18,wood);m.box(cx-.85,.5,z0+1.2,cx+.85,.58,z0+2.05,'#F4F1EA')}
 if(p.layout==='office'){m.box(cx-.8,.72,sofaZ-.4,cx+.8,.76,sofaZ+.4,wood);m.box(cx-.25,0,sofaZ+.5,cx+.25,.48,sofaZ+.9,'#2F2F33');m.box(x0+.05,0,z0+.3,x0+.4,2.2,z0+2.5,wood)}
 if(p.layout==='cafe'){m.box(x0+.6,0,z0+.1,x1-1.2,1.05,z0+.8,acc);m.box(x0+.55,1.05,z0+.05,x1-1.15,1.1,z0+.85,'#E9E6E0');for(const y of [1.6,2.1])m.box(x0+.6,y,z0,x1-1.2,y+.04,z0+.3,wood);
  for(let i=0;i<4;i++){const x=x0+1.2+i*((w-2.4)/3);m.cyl(x,z0+.45,h-.9,h,.01,'#111111');m.sph(x,h-.95,z0+.45,.2,.16,.2,warm,{em:1.3});m.box(x-.2,0,z0+1.1,x+.2,.75,z0+1.4,'#2F2F33')}
  for(const [x,z] of [[-w*.25,.4],[w*.15,.4],[-w*.25,l*.3],[w*.15,l*.3]]){m.cyl(x,z,.72,.75,.45,wood,{seg:16});m.cyl(x,z,0,.72,.05,'#2F2F33');for(const d of [-.7,.7])m.box(x+d-.2,0,z-.2,x+d+.2,.46,z+.2,fab)}
  m.light(0,h-1,z0+.6,warm,1.6).light(0,h-.6,l*.2,warm,1);}
 m.sph(x0+.6,.9,z1-.8,.45,.6,.45,'#4F7A45',{jit:.3,seed:5});m.cyl(x0+.6,z1-.8,0,.45,.22,'#D9D2C4');
 m.cyl(cx,sofaZ+1.3,h-.6,h,.01,'#111111');m.sph(cx,h-.65,sofaZ+1.3,.25,.18,.25,warm,{em:1.2});
 m.light(cx,h-.8,sofaZ+1.3,warm,1.3).light(x0+w*.3,h-.5,z1-1,warm,.8);
 return {mesh:m,center:[0,h/2,0],rad:Math.max(w,l)*.9}}

function spline(pts,t){const n=pts.length-1,s=Math.min(Math.max(t,0),.9999)*n,i=Math.floor(s),f=s-i,p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[Math.min(i+1,n)],p3=pts[Math.min(i+2,n)];
 return [0,1,2].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*f+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*f*f+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*f*f*f))}
const TOUR={eye:[[24,10,26],[6,6,24],[-12,3.2,17],[-3,1.9,9.5],[-1.5,1.65,3],[-3,1.65,.4],[-1,1.65,1.2]],target:[[0,3,0],[0,3,2],[-1,2.4,3],[-1.5,1.8,0],[-2.8,1.3,-2.2],[1.5,1.3,-1],[2.5,1.2,-3.4]]};
return {create,villa,room,LIGHT,FACADE,spline,TOUR,V3,hex}})();
