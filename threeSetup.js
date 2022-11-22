import * as THREE from "three";
import { initFPSCam } from "./fpsCamera.js";
import {cannonDebugRenderer} from "./cannonDebugRenderer.js";

let camera, scene, renderer, controls;
camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setClearColor("lightBlue", 1);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Set up world
let world = new CANNON.World();
world.gravity.set(0, -60, 0);

// Create sphere
let radius = 0.2;
let player = new CANNON.Body({
  mass: 5,
  position: new CANNON.Vec3(0, 2, -2), 
  shape: new CANNON.Sphere(radius)
});
world.addBody(player);

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
  fpsCam.update();
  // debugRenderer.update();
  renderer.render(scene, camera);
}

let exports = { THREE, camera, scene, render, world};

// init scene
import { level } from "./levels/level1.js";
level.initLevel(exports);