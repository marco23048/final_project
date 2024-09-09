import * as THREE from './utils/three.module.js';
import { GLTFLoader } from './utils/GLTFLoader.js';
import { OrbitControls } from './utils/OrbitControls.js';
import { initCharacters } from './animations.js';

    let scene, renderer, controls;
    let loader;
    let models = {};
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    scene = new THREE.Scene();
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/background_sky.jpg');
    scene.background = texture;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(-80, 40, 150).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff,2.5);
    ambientLight.position.set(-40,10,-55);
    scene.add(ambientLight);

    const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-50, 25, -100);
    window.camera=camera;

    controls = new OrbitControls(camera, renderer.domElement);
    
    controls.target.set(-40, 0.1, -77);
    controls.update(); 

  const modelsToLoad = [
    {name: 'basketball_court', url: 'models/basketball_court/scene.gltf', scale: 0.19, namesToRemove: [
        'Basket Table_basket_table_edges_0',
        'Basket Table_basket_table_0',
        'Basket  Ring Base_basket_ring_0','Basket Ring_basket_ring_0',
        'Net__0',
        'Basket Base_basket_table_edges_0',
        'Basket Base_basket_table_0',
        'Basket Table.001_basket_table_edges_0',
        'Basket Table.001_basket_table_0',
        'Basket  Ring Base.001',
        'Basket  Ring Base.001_basket_ring_0',
        'Basket Ring.001',
        'Basket Ring.001_basket_ring_0',
        'Net.001',
        'Net.001__0',
        'Basket Base.001',
        'Basket Base.001_basket_table_edges_0',
        'Basket Base.001_basket_table_0',
    ]},
    { name: 'giocatore', url: 'models/giocatore/scene.gltf', scale: 1, namesToRemove: [] },
    { name: 'difensore', url: 'models/difensore/scene.gltf', scale: 1, namesToRemove: [] },
    { name: 'tribuna', url: 'models/tribuna/scene.gltf', scale: 0.17, namesToRemove: [] },
    { name: 'tribuna2', url: 'models/tribuna2/scene.gltf', scale: 0.17, namesToRemove: [] },
    { name: 'curva', url: 'models/curva/scene.gltf', scale: 0.17, namesToRemove: [] },
    { name: 'curva2', url: 'models/curva2/scene.gltf', scale: 0.17, namesToRemove: [] },
    { name: 'terra', url: 'models/terra/scene.gltf', scale: 0.17, namesToRemove: [] },
    { name:'palla', url: 'models/palla/scene.gltf', scale: 0.30, namesToRemove: []},
];

    const loadingManager = new THREE.LoadingManager();
    loader = new GLTFLoader(loadingManager);

    for (let i = 0; i < modelsToLoad.length; i++) {
        const model = modelsToLoad[i];
        loader.load(model.url, gltf => {
            const loadedModel = gltf.scene;
            // Aggiungi il modello alla collezione
            models[model.name] = loadedModel;
            // Scala il modello
            loadedModel.scale.set(model.scale, model.scale, model.scale);
            // Rimuovi gli oggetti specificati
            removeObjects(loadedModel, model.namesToRemove);
            // Aggiungi il modello alla scena
            scene.add(loadedModel);
        }, undefined, error => {
            console.error(`Errore durante il caricamento del modello ${model.name}:`, error);
        });
    }
    
    loadingManager.onLoad = () => {
        console.log('Caricamento completato.');
        initCharacters(models, scene);

    };

function removeObjects(gltfScene, namesToRemove) {
    const objectsToRemove = gltfScene.children.filter(child => namesToRemove.includes(child.name));

    for (let i = 0; i < objectsToRemove.length; i++) {
        const object = objectsToRemove[i];
        if (object.parent) {
            object.parent.remove(object);
        } else {
            console.warn(`Il genitore è indefinito per l'oggetto: ${object.name}`);
        }
    }
}

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

function onKeyDown(event) { //Quando il tasto viene premuto
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyS':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyD':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyW':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyA':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) { //Quando il tasto viene lasciato
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyS':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyD':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyW':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyA':
            moveRight = false;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const velocity = new THREE.Vector3();
    if (moveLeft) velocity.x -= 1.5;
    if (moveRight) velocity.x += 1.5;
    if (moveForward) velocity.z -= 1.5;
    if (moveBackward) velocity.z += 1.5;
    camera.position.add(velocity);
    velocity.multiplyScalar(0.8); 
    TWEEN.update(); 

    controls.update();    
    renderer.render(scene, camera);
}

animate()
