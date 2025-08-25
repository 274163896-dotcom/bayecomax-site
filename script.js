import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { FontLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.158.0/examples/jsm/geometries/TextGeometry.js";

import gsap from "https://cdn.skypack.dev/gsap";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Renderer
const canvas = document.getElementById("bg3d");
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0,0,6);

// Lights
scene.add(new THREE.AmbientLight(0xffffff,0.5));
const point = new THREE.PointLight(0x88ddff,1.2,50);
point.position.set(3,3,6);
scene.add(point);

// Logo Text
let logoMesh;
const loader = new FontLoader();
loader.load("https://unpkg.com/three@0.158.0/examples/fonts/helvetiker_bold.typeface.json", font=>{
  const geo = new TextGeometry("BIMAX",{ font,size:1,height:0.2 });
  const mat = new THREE.MeshStandardMaterial({ color:0x7cc6ff, metalness:0.7, roughness:0.2 });
  logoMesh = new THREE.Mesh(geo,mat);
  logoMesh.position.set(-2.5,0,0);
  scene.add(logoMesh);
});

// Background sphere
const bgGeo = new THREE.SphereGeometry(60,64,64);
const bgMat = new THREE.MeshBasicMaterial({ color:0x0ea5e9, side:THREE.BackSide });
const bgMesh = new THREE.Mesh(bgGeo,bgMat);
scene.add(bgMesh);

// Scroll effects
const toWater = ()=> gsap.to(bgMat.color,{ r:0.05,g:0.65,b:0.9,duration:1 });
const toBubbles=()=> gsap.to(bgMat.color,{ r:0.48,g:0.76,b:1,duration:1 });
const toSilk  = ()=> gsap.to(bgMat.color,{ r:1,g:0.85,b:0.75,duration:1 });

ScrollTrigger.create({ trigger:"#s1", start:"top center", onEnter:toWater });
ScrollTrigger.create({ trigger:"#s2", start:"top center", onEnter:toBubbles });
ScrollTrigger.create({ trigger:"#s3", start:"top center", onEnter:toSilk });

// Resize
window.addEventListener("resize",()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animate
function animate(){
  requestAnimationFrame(animate);
  if(logoMesh) logoMesh.rotation.y += 0.01;
  renderer.render(scene,camera);
}
animate();