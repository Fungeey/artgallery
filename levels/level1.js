import * as util from "../util.js";
import { artTextures } from "./textures.js";

const { sin, cos, PI, max, min } = Math;

let initLevel = ({ THREE, camera, scene, render, world }) => {  
  let ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  // load textures
  let arts = [];
  function getArt(){
    let random = Math.floor(Math.random()*arts.length);
    return arts[random];
  }
  
  let addMarker = async (vector3, size) => {
    return;
    const geometry = new THREE.SphereGeometry( size, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(vector3.x, vector3.y, vector3.z);
    scene.add( sphere );
  };

  function addCanvas(canvasPos){
    let geo = new THREE.PlaneGeometry(2, 2);
    let mat = new THREE.MeshBasicMaterial({ map:getArt(), side: THREE.DoubleSide });
    let plane = new THREE.Mesh(geo, mat);
    plane.position.set(canvasPos.x, canvasPos.y, canvasPos.z);
    scene.add(plane);
    return plane;
  }
  
  loadGallery();
  addLighting();
  addBounds();

  let fixedTimeStep = 1.0 / 60.0;
  let maxSubSteps = 3;
  let lastTime;
  (function animate(time) {
    requestAnimationFrame(animate);
    if(lastTime !== undefined){
      let dt = (time - lastTime) / 1000;
      world.step(fixedTimeStep, dt, maxSubSteps)
    }
    lastTime = time;
    render();
  })();

  async function loadArt(){
    for(let i = 0; i < artTextures.length; i++){
      arts[i] = await util.loadTexture("./assets/textures/" + artTextures[i]);
    }
  }

  async function loadGallery() {
    await loadArt();
    let gallery = await util.loadGLB("./assets/models/gallery.glb");
    gallery.scene.position.y += 0.25;

    gallery.scene.traverse((e) => {
      if (e.isMesh) {
        if(e.material.transparent === true){
          e.material.roughness = 0.5;
        }

        if (e.material.map !== null) {
          if (e.material.name === "floor"){
            let brightness = 0.13;
            e.material.roughness = 0.6;
            e.material.emissive = {isColor:true, r:brightness, g:brightness, b:brightness};
            return;
          }

          e.material = new THREE.MeshStandardMaterial({
            color:0xffffff,
            transparent:true,
            opacity:0,
            side: THREE.DoubleSide
          });
        }
      }
    });

    {
      var geo = new THREE.PlaneGeometry(5, 5);
      var mat = new THREE.MeshBasicMaterial({ map:arts[99], side: THREE.DoubleSide });
      var plane = new THREE.Mesh(geo, mat);
      plane.position.set(-19.7, 4, -4);
      plane.rotateY(PI / 2);
      scene.add(plane);
    }

    scene.add(gallery.scene);
  };

  function addLighting(){
    function addBigLight(vector3, intensity){
      const light = new THREE.PointLight(0xffffff, 0.5, 10);
      light.position.set(vector3.x, vector3.y, vector3.z);
      scene.add(light);
      addMarker(vector3, 0.2);
    }
    
    function addSmallLight(vector3){
      const light = new THREE.PointLight(0x888888, 0.5, 10);
      light.position.set(vector3.x, vector3.y, vector3.z);
      scene.add(light);
      addMarker(vector3, 0.1);
    }

    addBigLight({x:8.5, y:5, z:1});
    addBigLight({x:8.5, y:5, z:-10});
    addSmallLight({x:8.5, y:5, z:15});

    // atrium
    addBigLight({x:-7, y:5, z:-4});
    addBigLight({x:-14, y:5, z:-4});

    // left
    addSmallLight({x:-10, y:8, z:6});
    addSmallLight({x:-17, y:8, z:6});
    addSmallLight({x:-25, y:8, z:6});

    addSmallLight({x:-13, y:3, z:6});
    addSmallLight({x:-5, y:3, z:6});

    // right
    addSmallLight({x:-10, y:8, z:-14});
    addSmallLight({x:-17, y:8, z:-14});
    addSmallLight({x:-25, y:8, z:-14});

    addSmallLight({x:-13, y:3, z:-14});
    addSmallLight({x:-5, y:3, z:-14});
  }

  function addBounds() {
    function makeBoundingBox(position, rotation, size) {
      // Create a bounding box
      let groundBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(position[0], position[1], position[2]),
        shape: new CANNON.Box(new CANNON.Vec3(size[0], size[1], size[2]))
      });
      groundBody.quaternion.setFromEuler(rotation[0], rotation[1], rotation[2]);
      world.addBody(groundBody);
    }

    // ground plane
    makeBoundingBox([-2, 0.05, 0], [0, 0, 0], [36, 0.5, 35]);

    //main walls
    makeBoundingBox([16, 7, -4], [0, 0, 0], [0.5, 15, 25]);
    makeBoundingBox([-20, 1, -4], [0, 0, 0], [0.5, 3, 25]);
    makeBoundingBox([5, 1, -19], [0, 0, 0], [15, 10, 3]); // left bottom 
    makeBoundingBox([-14, 1, -16.5], [0, 0, 0], [7, 3, 0.5]); // left bottom 2

    makeBoundingBox([-18, 8, -20.5], [0, 0, 0], [15, 10, 0.5]); // left top 
    makeBoundingBox([-18, 8, 12], [0, 0, 0], [15, 10, 0.5]); // right top 
    makeBoundingBox([0.5, 1, -12.8], [0, 0, 0], [0.5, 10, 5]); // right bump
    makeBoundingBox([0.5, 1, 4.4], [0, 0, 0], [0.5, 10, 4.5]); // left bump
    makeBoundingBox([-5, 1, 11], [0, 0, 0], [5, 10, 3]); // left stair bound

    // focus wall
    makeBoundingBox([8.5, 2, -4], [0, 0, 0], [2.5, 4, 0.4]);

    //hallway
    makeBoundingBox([15.8, 2.5, 17.8], [0, 0, 0], [5, 5, 10]);
    makeBoundingBox([-8.8, 1, 10.6], [0, 0, 0], [15, 4, 2.8]);
    makeBoundingBox([6, 2.5, 18.4], [0, 0, 0], [6, 5, 0.5]);
    makeBoundingBox([0.4, 2, 14.4], [0, 0, 0], [0.5, 5, 4]);

    // right stair
    makeBoundingBox([-1, 1.5, -11.5], [Math.PI / 7.5, 0, 0], [2, 0.5, 8]);
    makeBoundingBox([-4, 3.7, -15.6], [Math.PI / 7.5, 0, -Math.PI / 7.5], [3.5, 0.5, 2]);

    // left stair
    makeBoundingBox([-1, 1.5, 4], [-Math.PI / 7.5, 0, 0], [2, 0.5, 8]);
    makeBoundingBox([-4, 3.7, 8], [-Math.PI / 7.5, 0, -Math.PI / 7.5], [3.5, 0.5, 2]);

    // right top floor 
    makeBoundingBox([-17, 4.8, -11], [0, 0, 0], [15, 0.5, 3]); // longer
    makeBoundingBox([-22, 4.8, -18], [0, 0, 0], [15, 0.5, 4]); // shorter


    // left top floor 
    makeBoundingBox([-17, 4.8, 3], [0, 0, 0], [15, 0.5, 3]); // longer
    makeBoundingBox([-22, 4.8, 9.5], [0, 0, 0], [15, 0.5, 4]); // shorter


    // main center rails
    makeBoundingBox([-15, 9, -4], [0, 0, 0], [13, 4, 4]);
    makeBoundingBox([-32, 9, -4], [0, 0, 0], [0.5, 4, 17]); // back wall
    makeBoundingBox([-2, 9, -4], [0, 0, 0], [0.1, 4, 10]); // south rails
    makeBoundingBox([-29, 4.8, -4], [0, 0, 0], [3, 0.5, 4]);
  }
};

let level = { initLevel: initLevel };
export { level };
