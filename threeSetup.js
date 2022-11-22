import * as THREE from "three";
import { initFPSCam } from "./fpsCamera.js";
import {cannonDebugRenderer} from "./cannonDebugRenderer.js";
import {Stats} from "./stats.js";

let camera, scene, renderer, controls;
camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene = new THREE.Scene();

let stats = new Stats();
stats.showPanel(0); 
// document.body.appendChild( stats.dom );

renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
// renderer.setClearColor(0xffffff, 1);
renderer.antialias = false;
renderer.setPixelRatio(window.devicePixelRatio);
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

let fpsCam = initFPSCam(camera, player, renderer);

function onWindowResize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

onWindowResize();
window.addEventListener("resize", onWindowResize, false);

function render() {
  stats.begin();
  fpsCam.update();
  // debugRenderer.update();
  renderer.render(scene, camera);
  stats.end();
}

let exports = { THREE, camera, scene, render, world};

// init scene
import { level } from "./levels/level1.js";
level.initLevel(exports);