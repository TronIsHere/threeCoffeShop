import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export var loaded = {};

export const objLoader = new GLTFLoader();
objLoader.load('coffeshop.glb', (gltf) => {
  loaded.coffeshop = gltf.scene;
//   window.dispatchEvent(new Event('resources-loaded'));
});
