import * as THREE from "three";
import { initFPSCam } from "./fpsCamera.js";
import {cannonDebugRenderer} from "./cannonDebugRenderer.js";
import {Stats} from "./stats.js";

let debug = false;

let camera, scene, renderer;
camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene = new THREE.Scene();

let stats = new Stats();
stats.showPanel(0); 
if(debug) document.body.appendChild( stats.dom );

renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.setAttribute("id", "webglcanvas");
document.body.appendChild(renderer.domElement);

// Set up world
let world = new CANNON.World();
world.gravity.set(0, -60, 0);

// Create sphere
let radius = 0.2;
let player = new CANNON.Body({
  mass: 5,
  position: new CANNON.Vec3(4, 2, 15.5), 
  shape: new CANNON.Sphere(radius)
});
world.addBody(player);
camera.position.set(4, 2, 15.5);
camera.rotation.set(0, -Math.PI/2, 0);

let debugRenderer = new cannonDebugRenderer(THREE, scene, world);

function onWindowResize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( "./assets/music.wav", function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
});

let fpsCam = initFPSCam(camera, player, renderer, sound);

onWindowResize();
window.addEventListener("resize", onWindowResize, false);

function render() {
  stats.begin();
  fpsCam.update();
  renderer.render(scene, camera);
  console.log(scene);
  if(debug) console.log(renderer.info.render.calls);
  stats.end();
}

let exports = { THREE, camera, scene, render, world};

// init scene
import { level } from "./level1.js";
level.initLevel(exports);