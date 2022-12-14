import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { PointerLockControls } from "./pointerLockControls.js";

let initFPSCam = (camera, player, renderer, sound) => {
  let prevTime = performance.now();

  let playText = document.getElementById("text");

  let pauseScreen = document.getElementById("pauseScreen");
  let resumeButton = document.getElementById("resumeButton");

  let target = new Object3D();

  let controls = new PointerLockControls(camera, target, renderer.domElement);
  resumeButton.onclick = () => controls.lock();
  
  // unlock
  controls.addEventListener("lock", () => {
    pauseScreen.style.display = "none";
    resumeButton.style.visibility = "hidden";

    document.addEventListener("keydown", onDocumentKey, false);
    document.addEventListener("keyup", onDocumentKey, false);
  });

  controls.addEventListener("unlock", () => {
    pauseScreen.style.display = "flex";

    document.removeEventListener("keydown", onDocumentKey, false);
    document.removeEventListener("keyup", onDocumentKey, false);

    setTimeout(() => {
      resumeButton.style.visibility = "visible";
    }, 1000);
  });

  let keyMap = {};
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let run = false;

  let interact = false;
  let canInteract = true;

  function getInteract() {return interact};

  const onDocumentKey = (e) => {
    keyMap[e.key] = e.type === "keydown";

    if (controls.isLocked) {
      moveForward = keyMap["w"] === undefined ? false : keyMap["w"];
      moveBackward = keyMap["s"] === undefined ? false : keyMap["s"];
      moveLeft = keyMap["a"] === undefined ? false : keyMap["a"];
      moveRight = keyMap["d"] === undefined ? false : keyMap["d"];
      run = keyMap["j"] === undefined ? false : keyMap["j"];

      interact = keyMap[" "] === undefined ? false : keyMap[" "] && canInteract;
    }
    //-5, 7, 3
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

    updateMusic();
  }

  function updateMusic(){
    let isClose = camera.position.clone().sub(new Vector3(-5, 7, 3)).length() < 2.5;
    
    if(canInteract && isClose)
      playText.style.display = "block";
    else
      playText.style.display = "none";

    if(canInteract && interact && isClose){
      if(sound.isPlaying){
        sound.pause();
        playText.innerText = "play the music [space]";
        playText.style.display = "none";
      }else {
        sound.play();
        playText.innerText = "pause the music [space]";
        playText.style.display = "none";
      }

      canInteract = false;
      setTimeout(function(){
        canInteract = true;
      }, 1000);
    }
  }

  let fpsCam = {
    update: update
  };

  return fpsCam;
};

export { initFPSCam };
