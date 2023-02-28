import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loaded } from './resource.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';
/**
 * Base
 */

// Debug
const gui = new dat.GUI()

// Loader
const textureLoader = new THREE.TextureLoader();
const objLoader = new GLTFLoader();
const updateAllMaterial= ()=>{
    scene.traverse((child)=>{
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
            child.material.needsUpdate = true
        }
    })
}
// Textures
const bakedTexture = textureLoader.load('./public/baked2.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xff0e0c36)

//Materials for model 
const poleLight = new THREE.MeshBasicMaterial({color:0xffEEDB83})
const fenceColor = new THREE.MeshStandardMaterial({
    color:0xff8C7F71,
    metalness:1
});
const coffeeMaterial = new THREE.MeshBasicMaterial({map:bakedTexture})
// Loading model
objLoader.load('coffeshopRaw4096-2.glb', (gltf) => {
    gltf.scene.scale.set(.3,.3,.3);
    const pole = gltf.scene.children.find(child=>child.name === 'pole');
    const windows = gltf.scene.children.find(child=>child.name === 'windows');
    const fence1 = gltf.scene.children.find(child=>child.name === 'fence1');
    const fence2 = gltf.scene.children.find(child=>child.name === 'fence2');
    // console.log(fence1,1);
    pole.material = poleLight;
    // windows.material = poleLight;
    gltf.scene.traverse((child)=>{
        child.material = coffeeMaterial
    })
    pole.material = poleLight;
    windows.material = poleLight;

    fence1.material = fenceColor;
    fence2.material = fenceColor;
    
    scene.add(gltf.scene);

    // updateAllMaterial();

  //   window.dispatchEvent(new Event('resources-loaded'));
  });

//Raycast
const raycaster = new THREE.Raycaster()
/**
 * Floor
 */
// 231e45
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshStandardMaterial({
        color: '0xff0e0c36',
    })
)
// floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -1;
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

// Points of interest
const points = [
    {
      position: new THREE.Vector3(-.8, 2, 1),
      element: document.querySelector(".point-0"),
    },
    {
      position: new THREE.Vector3(0, .5, 0),
      element: document.querySelector(".point-1"),
    },
    // {
    //   position: new THREE.Vector3(1.6,-1.3, -0.7),
    //   element: document.querySelector(".point-2"),
    // },
  ];
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
// RENDERER GUI
gui.add(renderer,"toneMappingExposure").min(0).max(10).step(0.001)
gui.add(renderer,"toneMapping",{
    No:THREE.NoToneMapping,
    Linear:THREE.LinearToneMapping,
    Reinhard:THREE.ReinhardToneMapping,
    Cineon:THREE.CineonToneMapping,
    ACESFilmic:THREE.ACESFilmicToneMapping
})
.onFinishChange(()=>{
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterial()
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    for (const point of points) {
        const screenPosition = point.position.clone();
        screenPosition.project(camera);
  
        raycaster.setFromCamera(screenPosition, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
  
        if (intersects.length === 0) {
            
          point.element.classList.add("visible");

        } else {
        //   const intersectsDistance = intersects[0].distance;
        //   const pointDistance = point.position.distanceTo(camera.position);
        //   if (intersectsDistance < pointDistance) {
        //     point.element.classList.remove("visible");
        //   } else {
        //     point.element.classList.add("visible");
        //   }
        }
  
        const translateX = screenPosition.x * sizes.width * 0.5;
        const translateY = -screenPosition.y * sizes.height * 0.5;
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
  
        // console.log(translateX);
      }
    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()