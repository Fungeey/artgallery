import { Camera, MeshBasicMaterial } from "three";
import * as util from "../util.js";
import { usedTextures, artTextures } from "./textures.js";

const { sin, cos, PI, max, min } = Math;

let floorMat;
let initLevel = async ({ THREE, camera, scene, render, world }) => {  
  let ambientLight = new THREE.AmbientLight(0x707070);
  scene.add(ambientLight);

  const light = new THREE.HemisphereLight(0xfaf9f6, 0x707070, 0.2);
  scene.add(light);
  
  async function loadAll(){
    addBounds();
    addLighting();
    await loadGallery();
    await loadFurniture();
    await addCanvases();
    console.log("loaded");
  }
  await loadAll();

  let videoTex = addTVs();

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

    videoTex.needsUpdate = true;
    render();
  })();

  async function addCanvases(){
    let arts = [];
    for(let i = 0; i < usedTextures.length; i++)
      arts[i] = await util.loadTexture("./assets/textures/" + artTextures[usedTextures[i]]);
    
    function getArt(){
      let random = Math.floor(Math.random()*arts.length);
      return arts[random];
    }

    let bannerPng = await util.loadTexture("./assets/banner.png");
    let bannerGeo = new THREE.BoxGeometry(8, bannerPng.image.height / bannerPng.image.width * 8, 0.01);
    let banner = new THREE.Mesh( bannerGeo, new THREE.MeshBasicMaterial( { map: bannerPng, transparent :true } ) );
    banner.position.set(10.9, 1, 13);
    banner.rotation.set(0, Math.PI/2 * 1, 0);
    scene.add(banner);

    function addCanvas(id, pos, rot, scale = 1){
      let tex = arts[id];
      let geo = new THREE.BoxGeometry(2 * scale, tex.image.height / tex.image.width * 2 * scale, 0.1);

      let cubeMaterialArray = [
        floorMat,
        floorMat,
        floorMat,
        floorMat,
        new THREE.MeshBasicMaterial( { map: tex } ),
        new THREE.MeshBasicMaterial( { map: tex } )
      ];
      let canvas = new THREE.Mesh( geo, cubeMaterialArray );
      canvas.position.set(pos[0], pos[1], pos[2]);
      canvas.rotation.set(0, Math.PI/2 * rot, 0);
      scene.add(canvas);

      let cubeGeometry = new THREE.BoxGeometry(2 * scale+0.1, tex.image.height / tex.image.width * 2 * scale+0.1, 0.08);
      let frame = new THREE.Mesh(cubeGeometry, floorMat);
      frame.position.set(pos[0], pos[1], pos[2]);
      frame.rotation.set(0, Math.PI/2 * rot, 0);
      scene.add(frame);

      return canvas;
    }

    let space = 4;
    let smallSpace = 3;
    // - tv area
    // south wall
    addCanvas(1, [15.95, 2.25, 6.5], 1, 1.25);
    addCanvas(0, [15.95, 2.25, 6.5 - 3*1], 1, 1.25);
    addCanvas(2, [15.95, 2.25, 6.5 - 3*2], 1, 1.25);
    addCanvas(26, [15.95, 2.25, 6.5 - 3*3], 1, 1.25);  
    addCanvas(4, [15.95, 2.25, 6.5 - 3*4], 1, 1.25);
    addCanvas(5, [15.95, 2.25, 6.5 - 3*5], 1, 1.25);
    addCanvas(48, [15.95, 2.25, 6.5 - 3*6], 1, 1.25);
    addCanvas(49, [15.95, 2.25, 6.5 - 3*7], 1, 1.25);
    addCanvas(50, [15.95, 2.25, 6.5 - 3*8], 1, 1.25);
    // east
    addCanvas(31, [13, 3, -15.9], 2, 1.75);
    addCanvas(36, [12-space, 3, -15.9], 2, 2);
    addCanvas(20, [11.5-space*2, 3, -15.9], 2, 1.5);
    // west
    addCanvas(9, [13.5, 2, 7.95], 2);
    addCanvas(10, [3.5, 2.25, 7.95], 2, 1.5); // study
    //north
    addCanvas(11, [1.05, 2.25, 5.5], 1, 1.25);
    addCanvas(12, [1.05, 2.25, 2.5], 1, 1.25);
    addCanvas(13, [1.05, 2.25, -10.5], 1, 1.25);
    addCanvas(14, [1.05, 2.25, -13.5], 1, 1.25);

    //-under area
    // east
    addCanvas(19, [-9, 2, -15.9], 2, 1.5);
    addCanvas(16, [-9-space, 2, -15.9], 2, 1.5);
    addCanvas(28, [-9-space*2, 2, -15.9], 2, 1.25); 
    //west
    addCanvas(18, [-9, 2, 7.95], 2, 1.5);
    addCanvas(15, [-9-space, 2, 7.95], 2, 1.25);
    addCanvas(43, [-9-space*2, 2, 7.95], 2, 1.5);
    //north
    addCanvas(32, [-19.8, 5.5, -4], 1, 2.5); // portrait
    addCanvas(22, [-19.8, 2.5, 4.4], 1, 2);
    addCanvas(23, [-19.8, 2.5, -12.25], 1, 2);
    // addCanvas(24, [-19.8, 2, -10.5], 1);
    // addCanvas(25, [-19.8, 2, -10.5-3], 1);
    
    //-upstairs
    // east
    //
    addCanvas(3,  [-14, 7.5, -19.9], 2, 1.5);
    addCanvas(42, [-14-4.5, 7.5, -19.9], 2, 1.5);
    addCanvas(17, [-14-4.5*2, 7.5, -19.9], 2, 1.5);
    addCanvas(30, [-14-4.5*3, 7.5, -19.9], 2, 1.5);
    // addCanvas(29, [-12-3.5*4, 7.5, -19.9], 2, 1.75); 
    // addCanvas(6, [-12-3.5*5, 7.5, -19.9], 2, 1.5);

    addCanvas(34, [-31.9, 7.5, -17.5], 1, 1.5); // study
    addCanvas(7, [-31.9, 7.5, -17.5+3.5], 1, 1.5); 
    addCanvas(35, [-31.9, 7.5, -17.5+3.5*2], 1, 1.5);
    // west
    addCanvas(37, [-12, 7.5, 11.9], 2, 1.5);
    addCanvas(38, [-12-3.5, 7.5, 11.9], 2, 1.25);
    addCanvas(39, [-12-3.5*2, 7.5, 11.9], 2, 1.25);
    addCanvas(40, [-12-3.5*3, 7.5, 11.9], 2, 1.5);
    addCanvas(41, [-12-3.5*4, 7.5, 11.9], 2, 1.25);
    addCanvas(27, [-12-3.5*5, 7.5, 11.9], 2, 1.25);  

    addCanvas(8, [-12-3.5*3-1.5, 7.7, 0.1], 2, 2);
    addCanvas(44, [-12-3.5*3-1.5, 7.7, -8.1], 2, 1.5);

    addCanvas(45, [-31.9, 7.5, 2.5], 1, 1.5);
    addCanvas(46, [-31.9, 7.5, 2.5+3.5], 1, 1.25);
    addCanvas(47, [-31.9, 7.5, 2.5+3.5*2], 1, 1.75);
  }

  function addTVs(){
    let videos = [];
    function addTV(id, x, y, z, aspect, scale){
      let video = document.getElementById(id);
      video.play();
      let videoTex = new THREE.VideoTexture(video);
      let movieMat = new THREE.MeshBasicMaterial({
        map: videoTex, 
        side: THREE.FrontSide,
        toneMapped: false
      })

      let movieGeometry = new THREE.BoxGeometry(scale*aspect, scale, 0.1);
      let movieCube = new THREE.Mesh(movieGeometry, movieMat);
      movieCube.position.set(x, y, z);
      scene.add(movieCube);

      let cubeGeometry = new THREE.BoxGeometry(scale*aspect+0.1, scale+0.1, 0.08);
      let tvCube = new THREE.Mesh(cubeGeometry, new MeshBasicMaterial({color:0x000000}));
      tvCube.position.set(x, y, z);
      scene.add(tvCube);

      videos.push(videoTex);
    }

    addTV("video1", 8.5, 2.3, -4.4, 0.8, 2.5);
    addTV("video2", 8.5, 2.75, -3.79, 1, 3);

    return videos;
  }

  async function loadGallery() {
    let gallery = await util.loadGLB("./assets/models/gallery.glb");
    gallery.scene.position.y += 0.25;

    gallery.scene.traverse((e) => {
      if (e.isMesh) {
        if(e.material.transparent === true){
          e.material.roughness = 0.5;
        }

        if (e.material.map !== null) {
          if (e.material.name === "floor"){
            floorMat = e.material;
            let brightness = 0.13;
            e.material.roughness = 0.6;
            e.material.emissive = {isColor:true, r:brightness, g:brightness, b:brightness};
            return;
          }

          e.material = new THREE.MeshStandardMaterial({
            transparent:true,
            opacity:0,
          });
        }
      }
    });
    scene.add(gallery.scene);
  };
  
  async function loadFurniture(){
    async function addObject(name, x, y, z, rot, scale){
      let obj = await util.loadGLB("./assets/models/" + name);
      obj.scene.scale.set(scale, scale, scale);
      obj.scene.position.set(x, y, z);
      obj.scene.rotation.set(0, Math.PI/2 * rot, 0);
      scene.add(obj.scene);
    }

    addObject("door.glb", 1.25, 0, 15.5, -1, 1.75);
    addObject("table.glb", -5, 5, 3, 1, 1.5);
    addObject("player.glb", -5, 6.4, 3, 3, 15);

    addObject("bench.glb", -19, 5.25, 6, 0, 2);
    addObject("bench.glb", -23, 5.25, 6, 0, 2);
    addObject("bench.glb", -19, 5.25, -14, 0, 2);
    addObject("bench.glb", -23, 5.25, -14, 0, 2);
    
    addObject("bench.glb", -7, 0.25, -4, 0, 2);
    addObject("bench.glb", -13, 0.25, -4, 0, 2);

    addObject("bench.glb", 8.5, 0.25, -8, 0, 2); // downstairs
    addObject("bench.glb", 8.5, 0.25, 0, 0, 2);
  }

  function addLighting(){
    function addBigLight(vector3, intensity){
      const light = new THREE.PointLight(0xfaf9f6, 0.5, 10);
      light.position.set(vector3.x, vector3.y, vector3.z);
      scene.add(light);
    }
    
    function addSmallLight(vector3){
      const light = new THREE.PointLight(0x888888, 0.5, 10);
      light.position.set(vector3.x, vector3.y, vector3.z);
      scene.add(light);
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
