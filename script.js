/* Three.js scene from previous version, + poster interactions */
gsap.registerPlugin(ScrollTrigger);

// ===== Three.js scene (same core as v1, with modes) =====
const canvas = document.getElementById('bg3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0.9, 6);

const ambient = new THREE.AmbientLight(0xffffff, 0.35); scene.add(ambient);
const point = new THREE.PointLight(0x88ddff, 1.2, 40); point.position.set(4,3,6); scene.add(point);

// Cube camera envmap for reflective logo
const cubeRT = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
const cubeCam = new THREE.CubeCamera(0.1, 100, cubeRT); scene.add(cubeCam);

// Background shader
const bgGeo = new THREE.SphereGeometry(60, 96, 64);
const bgMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uMode: { value: 0 },
    uColorA: { value: new THREE.Color(0x0ea5e9) },
    uColorB: { value: new THREE.Color(0x6ee7f5) },
    uIridescence: { value: 0.0 },
    uOpacity: { value: 1.0 }
  },
  vertexShader:`
    varying vec3 vPos; varying vec3 vNormal;
    void main(){ vPos=position; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
  `,
  fragmentShader:`
    varying vec3 vPos; varying vec3 vNormal;
    uniform float uTime,uMode,uIridescence,uOpacity; uniform vec3 uColorA,uColorB;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
    vec3 iridescent(float t, vec3 A, vec3 B){ vec3 h=mix(A,B,t*t); h+=0.15*vec3(sin(6.283*t),sin(6.283*(t+.33)),sin(6.283*(t+.66))); return clamp(h,0.,1.2); }
    void main(){
      vec3 n=normalize(vPos); float t=uTime*.12;
      float w=0.; w+=noise(n.xz*2.+t*1.2); w+=.5*noise(n.yz*3.-t*.8); w+=.25*noise(n.xy*5.+t*.6); w=smoothstep(.2,.8,w);
      vec3 col=mix(uColorA,uColorB,w);
      if(uMode> .5 && uMode<1.5){ col=mix(col, vec3(.85,.95,1.), .45); }
      if(uMode>=1.5){ float fres=pow(1.-abs(dot(normalize(vNormal), vec3(0,0,1))), 1.5); col=mix(col, iridescent(fres,uColorA,uColorB), uIridescence); }
      float vign=smoothstep(-40.,60.,vPos.z); col*=mix(.9,1.1,vign);
      gl_FragColor=vec4(col,uOpacity);
    }
  `
});
const bgMesh = new THREE.Mesh(bgGeo, bgMat); scene.add(bgMesh);

// Bubbles
const bubbleCount=120, bubbleGeo=new THREE.SphereGeometry(.12,20,16);
const bubbleMat=new THREE.MeshPhysicalMaterial({ color:0xffffff, transmission:1, thickness:1.2, roughness:.15, metalness:0, transparent:true, opacity:0 });
const bubbles=new THREE.InstancedMesh(bubbleGeo,bubbleMat,bubbleCount); const dummy=new THREE.Object3D();
for(let i=0;i<bubbleCount;i++){ dummy.position.set((Math.random()*2-1)*6,(Math.random()*2-1)*3,(Math.random()*2-1)*2); dummy.scale.setScalar(.6+Math.random()*1.8); dummy.updateMatrix(); bubbles.setMatrixAt(i,dummy.matrix); }
scene.add(bubbles);

// 3D Logo
let logoMesh; new THREE.FontLoader().load("https://unpkg.com/three@0.158.0/examples/fonts/helvetiker_bold.typeface.json",(font)=>{
  const geo=new THREE.TextGeometry("BIMAX",{font,size:1.2,height:.28,curveSegments:8, bevelEnabled:true, bevelThickness:.02, bevelSize:.02, bevelSegments:2});
  const mat=new THREE.MeshPhysicalMaterial({ color:new THREE.Color('#7cc6ff'), metalness:1, roughness:.2, reflectivity:1, clearcoat:1, envMap:cubeRT.texture });
  logoMesh=new THREE.Mesh(geo,mat); logoMesh.position.set(-3.4,0,0); scene.add(logoMesh);
});

// Mouse light
window.addEventListener('mousemove',e=>{ point.position.x=(e.clientX/window.innerWidth-.5)*10; point.position.y=-(e.clientY/window.innerHeight-.5)*6 + 2.5; });

// Transitions
const toWater=()=>{ gsap.to(bgMat.uniforms.uMode,{value:0,duration:1.2}); gsap.to(bgMat.uniforms.uColorA.value,{r:.1,g:.65,b:.91,duration:1.2}); gsap.to(bgMat.uniforms.uColorB.value,{r:.45,g:.9,b:.96,duration:1.2}); gsap.to(bubbleMat,{opacity:0,duration:.8}); if(logoMesh) gsap.to(logoMesh.material.color,{r:.40,g:.78,b:1.,duration:1.2}); };
const toBubbles=()=>{ gsap.to(bgMat.uniforms.uMode,{value:1,duration:1.2}); gsap.to(bgMat.uniforms.uColorA.value,{r:.48,g:.76,b:1.,duration:1.2}); gsap.to(bgMat.uniforms.uColorB.value,{r:.86,g:.95,b:1.,duration:1.2}); gsap.to(bubbleMat,{opacity:.35,duration:1}); if(logoMesh) gsap.to(logoMesh.material.color,{r:.76,g:.85,b:1.,duration:1.2}); };
const toSilk = ()=>{ gsap.to(bgMat.uniforms.uMode,{value:2,duration:1.2}); gsap.to(bgMat.uniforms.uIridescence,{value:1.,duration:1.2}); gsap.to(bgMat.uniforms.uColorA.value,{r:.70,g:.80,b:1.,duration:1.2}); gsap.to(bgMat.uniforms.uColorB.value,{r:1.,g:.85,b:.75,duration:1.2}); gsap.to(bubbleMat,{opacity:0,duration:.8}); if(logoMesh) gsap.to(logoMesh.material.color,{r:.92,g:.96,b:1.,duration:1.2}); };

ScrollTrigger.create({ trigger:"#s1", start:"top center", onEnter:toWater });
ScrollTrigger.create({ trigger:"#s2", start:"top center", onEnter:toBubbles });
ScrollTrigger.create({ trigger:"#s3", start:"top center", onEnter:toSilk });

// Resize & loop
addEventListener('resize',()=>{ renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });
let t=0; function animate(){ requestAnimationFrame(animate); t+=.016; bgMat.uniforms.uTime.value=t; if(logoMesh){ logoMesh.rotation.y=Math.sin(t*.2)*.08; logoMesh.rotation.x=Math.sin(t*.15)*.03; } for(let i=0;i<bubbleCount;i++){ bubbles.getMatrixAt(i,dummy.matrix); dummy.position.y+=0.003+(i%10)*0.0003; if(dummy.position.y>4) dummy.position.y=-3.5; dummy.updateMatrix(); bubbles.setMatrixAt(i,dummy.matrix); } bubbles.instanceMatrix.needsUpdate=true; cubeCam.update(renderer,scene); renderer.render(scene,camera); } animate();
toWater();

// ===== Posters interactions (parallax + ripple) =====
document.querySelectorAll('.poster').forEach(card=>{
  card.addEventListener('mousemove', e=>{
    const r=card.getBoundingClientRect();
    const mx=(e.clientX-r.left)/r.width*100, my=(e.clientY-r.top)/r.height*100;
    card.style.setProperty('--mx', mx+'%'); card.style.setProperty('--my', my+'%');
    const dx=(mx-50)/50, dy=(my-50)/50;
    card.style.transform=`rotateX(${-dy*4}deg) rotateY(${dx*6}deg) translateY(-6px)`;
    card.style.setProperty('--parallax', (1+Math.hypot(dx,dy)*.03));
    card.style.setProperty('--blur', Math.hypot(dx,dy)*1+'px');
    card.style.setProperty('--s', '1.06');
    card.style.setProperty('--o', '0.7');
  });
  card.addEventListener('mouseleave', ()=>{
    card.style.transform='translateY(0)'; card.style.removeProperty('--o');
  });
});
