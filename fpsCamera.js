import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { PointerLockControls } from "./pointerLockControls.js";

let initFPSCam = (camera, player, renderer) => {
  let prevTime = performance.now();

  let pauseScreen = document.getElementById("pauseScreen");
  let resumeButton = document.getElementById("resumeButton");

  let target = new Object3D();

  let controls = new PointerLockControls(camera, target, renderer.domElement);
  resumeButton.onclick = () => controls.lock();
  
  // unlock
  controls.addEventListener("lock", () => {
    pauseScreen.style.display = "none";
    resumeButton.style.display = "none";

    document.addEventListener("keydown", onDocumentKey, false);
    document.addEventListener("keyup", onDocumentKey, false);
  });

  controls.addEventListener("unlock", () => {
    pauseScreen.style.display = "flex";

    document.removeEventListener("keydown", onDocumentKey, false);
    document.removeEventListener("keyup", onDocumentKey, false);

    setTimeout(() => {
      resumeButton.style.display = "block";
    }, 1000);
  });

  let keyMap = {};
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;
  let run = false;
  const onDocumentKey = (e) => {
    keyMap[e.key] = e.type === "keydown";

    if (controls.isLocked) {
      moveForward = keyMap["w"] === undefined ? false : keyMap["w"];
      moveBackward = keyMap["s"] === undefined ? false : keyMap["s"];
      moveLeft = keyMap["a"] === undefined ? false : keyMap["a"];
      moveRight = keyMap["d"] === undefined ? false : keyMap["d"];
      run = keyMap["j"] === undefined ? false : keyMap["j"];
    }
  };

  const direction = new THREE.Vector3();
  let spd = 5;
  function update() {
    const velocity = new THREE.Vector3();

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z = direction.z;
    if (moveLeft || moveRight) velocity.x = direction.x;

    if (run) spd = 15;
    else spd = 4;

    controls.moveRight(velocity.x * spd * delta);
    controls.moveForward(velocity.z * spd * delta);

    let lerpSpeed = 20;
    player.velocity = new CANNON.Vec3(
      (target.position.x - player.position.x)*lerpSpeed,
      player.velocity.y,
      (target.position.z - player.position.z)*lerpSpeed
    );
    
    // velocity can continue to build up when walking towards a wall.
    // target position continues to move into and past the wall
    // therefore, if target position is too far out of bounds, snap it back to the player's position
    let threshold = 0.5;
    if(Math.abs(player.position.x - target.position.x) > threshold) target.position.x = player.position.x;
    if(Math.abs(player.position.z - target.position.z) > threshold) target.position.z = player.position.z;

    camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 1.75, player.position.z), 0.1);

    prevTime = time;
  }

  let fpsCam = {
    update: update,
  };

  return fpsCam;
};

export { initFPSCam };
