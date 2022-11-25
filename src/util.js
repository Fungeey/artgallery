import * as THREE from "three";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";

let loadGLB = async (url) => {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, (glb) => {
      resolve(glb);
    });
  });
};

let loadTexture = async (url) => {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (tex) => {
      resolve(tex);
    });
  });
};

export { loadGLB, loadTexture };
