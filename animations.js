
import * as THREE from './utils/three.module.js';


let models = {}; 
var palla,pavimento,giocatore,difensore,tribuna,tribuna2,curva,curva2,terra;
let animationTweens = [];
let activeTweens = [];
const vel=0.5;
var parabolaType;

// Inizializza i personaggi con i modelli caricati e la scena
export function initCharacters(loadedModels, scene) {
    models = loadedModels;
    palla =  models.palla ;
    pavimento = models.basketball_court.getObjectByName('Sketchfab_model');
    giocatore = models.giocatore;
    difensore = models.difensore;
    tribuna = models.tribuna.getObjectByName('Sketchfab_model');
    tribuna2 = models.tribuna2.getObjectByName('Sketchfab_model');
    curva= models.curva;
    curva2= models.curva2;
    terra=models.terra;
    giocatore.bones = {};
    difensore.bones = {};
    //Giocatore che tira
    if (giocatore) {
        giocatore.mesh = new THREE.Object3D();
        giocatore.mesh.name = "giocatore";
        let corpo_giocatore = giocatore.getObjectByName("RootNode");
        corpo_giocatore.scale.set(0.10, 0.10,0.10);
        giocatore.mesh.add(corpo_giocatore);
        giocatore.mesh.position.set(-40, 0.2, -78);
        scene.add(giocatore.mesh);
        CharacterBones(giocatore, boneMappingGiocatore);
        initialPoseGiocatore(giocatore);
    } else {
        console.error("Giocatore model not found in loaded models.");
    }
    //Difensore
    if (difensore) {
        difensore.mesh = new THREE.Object3D();
        difensore.mesh.name = "difensore";
        let corpo_difensore = difensore.getObjectByName("RootNode");
        corpo_difensore.scale.set(0.10, 0.10,0.10);
        difensore.mesh.add(corpo_difensore);
        difensore.mesh.rotation.y = Math.PI ;
        difensore.mesh.position.set(-40, 0.2, -47);
        scene.add(difensore.mesh);
        CharacterBones(difensore, boneMappingDifensore);
        initialPoseDifensore(difensore);
    } else {
        console.error("Difensore model not found in loaded models.");
    }
    //Campo da basket
    if(pavimento){ 
        pavimento.scale.set(0.19, 0.19, 0.19);
        pavimento.rotation.z=Math.PI/2;
        pavimento.position.set(-40, -0.1,-77 );
        scene.add(pavimento); 
    } else {
        console.log("Pavimento not found")
    }
    if (tribuna) {
        tribuna.mesh = new THREE.Object3D();
        tribuna.mesh.name = "tribuna";
        tribuna.scale.set(32, 27, 37);
        tribuna.position.set(330, -15, -455);
        tribuna.rotation.z=-Math.PI/2;
        scene.add(tribuna.mesh);

    } else {
        console.error("tribuna not found in loaded models.");
    }

    if (tribuna2) {
        tribuna2.mesh = new THREE.Object3D();
        tribuna2.mesh.name = "tribuna2";
        tribuna2.scale.set(32, 27, 37);
        tribuna2.position.set(-817, -12, -455);
        tribuna2.rotation.z=Math.PI/2;
        scene.add(tribuna2.mesh);
    } else {
        console.error("tribuna2 not found in loaded models.");
    }
    if (curva) {
        curva.mesh = new THREE.Object3D();
        curva.mesh.name = "curva";
        curva.scale.set(5, 5, 5);
        curva.position.set(-40, -2, 28);
        curva.rotation.y=Math.PI/2;
        scene.add(curva.mesh);
    } else {
        console.error("Curva not found in loaded models.");
    }
    if (curva2) {
        curva2.mesh = new THREE.Object3D();
        curva2.mesh.name = "curva2";
        curva2.scale.set(5, 5, 5);
        curva2.position.set(-40, -2, -180);
        curva2.rotation.y=-Math.PI/2;
        scene.add(curva2.mesh);
    } else {
        console.error("Curva2 not found in loaded models.");
    }
    if (terra) {
        terra.mesh = new THREE.Object3D();
        terra.mesh.name = "terra";
        terra.scale.set(80,40, 80);
        terra.position.set(-40, -5, -50);
        terra.rotation.y=-Math.PI/2;
        scene.add(terra.mesh);
    } else {
        console.error("Terra not found in loaded models.");
    }

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();
    
    const amplitude = 8;  // Altezza massima del rimbalzo
    const baseHeight = 2;  // Altezza minima del rimbalzo
    const speed=3.7;
    const transitionSpeed=4;
    let isAnimating = false; // Variabile di stato per l'animazione
    let isTransitioning= false;
    const initialPosition = new THREE.Vector3(-40, 10, -74); // Posizione iniziale della palla
    // Funzione per avviare l'animazione
            
function startAnimation() {
    if (isAnimating==false) {
        console.log("Starting animation");
        isAnimating = true;
        isTransitioning = false;
        requestAnimationFrame(rimbalzo);
        requestAnimationFrame(palleggio);
    }
}

// Funzione per fermare l'animazione e ripristinare la posizione iniziale
function stopAnimation() {
    if (isAnimating==true) {
        console.log("Stopping animation");
        isAnimating = false;
        isTransitioning = true;
        stopActiveTweens();
    }
}

function stopActiveTweens() {
    // Ferma tutti i tween attivi
    activeTweens.forEach(tween => {
        tween.stop();
    });
    activeTweens = []; // Svuota l'array dopo aver fermato tutti i tween
}
    var canShoot=false;
// Listener per l'evento keydown
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyF') { // Usa il tasto F per start/stop rimbalzo
        if (isAnimating) {
            stopAnimation(); // Ferma l'animazione e ripristina la posizione iniziale
        } else {
            startAnimation(); // Avvia l'animazione
        }
    } else if (event.code === 'KeyT') {
        TiroGiocatore();
        stopAnimation();
        canShoot = true; // Abilita il lancio della palla
    } else if (event.code === 'KeyO' && canShoot) { // Usa il tasto O per il tiro normale
        parabolaType='alta';
        LancioPalla(parabolaType); // Esegui il tiro con parabola alta
        canShoot = false;
    } else if (event.code === 'KeyK' && canShoot) { // Usa il tasto K per il tiro normale
        parabolaType='normale';
        LancioPalla(parabolaType);// Esegui il tiro con parabola normale
        canShoot = false; 
    } else if (event.code === 'KeyH' ) { // Aggiungi il tasto H per il salto del difensore
        if (isDefenderJumping==false && palla.position.z > -52 && palla.position.z< -47 && isTiroInCorso && parabolaType=="normale" ) {
         
            bounceBall(palla.position.y);
            return;
        }
        saltoDifensore(); // Chiama la funzione di salto del difensore
    }
});

function rimbalzo() { 
    console.log('Animazione rimbalzo avviata');
    if (isAnimating) {
        const time = clock.getElapsedTime();
        palla.position.y = Math.abs(Math.sin(time * speed)) * amplitude + baseHeight;
        
        TWEEN.update();
        // Renderizza la scena
        renderer.render(scene, camera);
        // Richiama la funzione tic nel prossimo frame
        requestAnimationFrame(rimbalzo);
    } else if (isTransitioning) {
        // Calcola la distanza tra la posizione corrente e la posizione iniziale
        const distance = palla.position.distanceTo(initialPosition);

        if (distance > 0.01) { // Soglia per fermare la transizione
            // Interpola la posizione della palla verso la posizione iniziale
            palla.position.lerp(initialPosition, transitionSpeed * clock.getDelta());
        } else {
            // Assicurati che la palla sia esattamente alla posizione iniziale
            palla.position.copy(initialPosition);
            isTransitioning = false; // Ferma la transizione
        }
        // Renderizza la scena
        renderer.render(scene, camera);
        requestAnimationFrame(rimbalzo);
    }
}



     if (palla) {
        palla.position.copy(initialPosition);
        palla.scale.set(0.3, 0.3, 0.3);
        scene.add(palla);
     } else {
        console.error('Palla non definita');
     }
}


const boneMappingGiocatore = {
    'CC_Base_BoneRoot_01': 'base_BoneRoot',
    'CC_Base_Hip_02' : 'base_hip',
    'CC_Base_Pelvis_03' : 'pelvis',
    'CC_Base_Spine01_034' : 'spine',
    'CC_Base_L_Thigh_04' : 'thigh_left',
    'CC_Base_R_Thigh_018' : 'thigh_right',
    'CC_Base_L_Calf_05' : 'calf_left',
    'CC_Base_R_Calf_021' : 'calf_right',
    'CC_Base_L_Foot_06' : 'foot_left',
    'CC_Base_R_Foot_022' : 'foot_right',
    'CC_Base_L_ToeBaseShareBone_07' : 'toebasesharebone_left',
    'CC_Base_R_ToeBaseShareBone_029' : ' toebasesharebone_right',
    'CC_Base_L_ToeBase_08' : 'toebase_left',
    'CC_Base_R_ToeBase_023' : 'toebase_right',
    'CC_Base_L_KneeShareBone_016' : 'knee_sharebone_left',
    'CC_Base_R_KneeShareBone_030' : 'knee_sharebone_right',
    'CC_Base_L_ThighTwist01_00' : 'thigh_twist_left',
    'CC_Base_R_ThighTwist01_019' : 'thigh_twist_right',
    'CC_Base_Waist_033' : 'base_waist',
    'CC_Base_Head_038' : 'head',
    'CC_Base_L_Clavicle_049' : 'clavicle_left',
    'CC_Base_R_Clavicle_073' : 'clavicle_right',
    'CC_Base_L_Upperarm_050' : 'upperarm_left',
    'CC_Base_R_Upperarm_074' : 'upperarm_right',
    'CC_Base_L_Forearm_051' : 'forearm_left',
    'CC_Base_R_Forearm_077' : 'forearm_right',
    'CC_Base_L_ForearmTwist01_052' : 'forearmtwist_left',
    'CC_Base_R_ForearmTwist01_078' : 'forearmtwist_right',
    'CC_Base_L_ElbowShareBone_054' : 'elbowsharebone_left',
    'CC_Base_R_ElbowShareBone_080' : 'elbowsharebone_right',
    'CC_Base_L_Hand_055' : 'hand_left',
    'CC_Base_R_Hand_081' : 'hand_right',
    'CC_Base_L_UpperarmTwist01_071' : 'upperarmtwist_left',
    'CC_Base_R_UpperarmTwist01_075' : 'upperarmtwist_right',
    'CC_Base_Body' : 'body',
    'T_shirt' : 'tshirt',
    'Classic_Shorts' : 'shorts',
    'Boots' : 'boots',
};

const boneMappingDifensore =  {
    'CC_Base_BoneRoot_01': 'base_BoneRoot',
    'CC_Base_Hip_02' : 'base_hip',
    'CC_Base_Pelvis_03' : 'pelvis',
    'CC_Base_Spine01_034' : 'spine',
    'CC_Base_L_Thigh_04' : 'thigh_left',
    'CC_Base_R_Thigh_018' : 'thigh_right',
    'CC_Base_L_Calf_05' : 'calf_left',
    'CC_Base_R_Calf_021' : 'calf_right',
    'CC_Base_L_Foot_06' : 'foot_left',
    'CC_Base_R_Foot_022' : 'foot_right',
    'CC_Base_L_ToeBaseShareBone_07' : 'toebasesharebone_left',
    'CC_Base_R_ToeBaseShareBone_029' : ' toebasesharebone_right',
    'CC_Base_L_ToeBase_08' : 'toebase_left',
    'CC_Base_R_ToeBase_023' : 'toebase_right',
    'CC_Base_L_KneeShareBone_016' : 'knee_sharebone_left',
    'CC_Base_R_KneeShareBone_030' : 'knee_sharebone_right',
    'CC_Base_L_ThighTwist01_00' : 'thigh_twist_left',
    'CC_Base_R_ThighTwist01_019' : 'thigh_twist_right',
    'CC_Base_Waist_033' : 'base_waist',
    'CC_Base_Head_038' : 'head',
    'CC_Base_L_Clavicle_049' : 'clavicle_left',
    'CC_Base_R_Clavicle_073' : 'clavicle_right',
    'CC_Base_L_Upperarm_050' : 'upperarm_left',
    'CC_Base_R_Upperarm_074' : 'upperarm_right',
    'CC_Base_L_Forearm_051' : 'forearm_left',
    'CC_Base_R_Forearm_077' : 'forearm_right',
    'CC_Base_L_ForearmTwist01_052' : 'forearmtwist_left',
    'CC_Base_R_ForearmTwist01_078' : 'forearmtwist_right',
    'CC_Base_L_ElbowShareBone_054' : 'elbowsharebone_left',
    'CC_Base_R_ElbowShareBone_080' : 'elbowsharebone_right',
    'CC_Base_L_Hand_055' : 'hand_left',
    'CC_Base_R_Hand_081' : 'hand_right',
    'CC_Base_L_UpperarmTwist01_071' : 'upperarmtwist_left',
    'CC_Base_R_UpperarmTwist01_075' : 'upperarmtwist_right',
    'CC_Base_Body' : 'body',
    'T_shirt' : 'tshirt',
    'Classic_Shorts' : 'shorts',
    'Boots' : 'boots',
};

function CharacterBones(character, boneMapping) {
    // Definisci un oggetto per tenere traccia delle ossa trovate
    const bonesFound = {};
    // Funzione di callback per la traversata
    function processBone(bone) {
        if (bone.isBone) {
            // Verifica se l'osso è mappato e, in caso affermativo, memorizza l'osso trovato
            if (boneMapping[bone.name]) {
                bonesFound[boneMapping[bone.name]] = bone;
            }
        }
    }
    // Traversata dell'albero della mesh per processare ogni osso
    character.mesh.traverse(processBone);
    // Aggiorna l'oggetto bones del personaggio con le ossa trovate
    Object.assign(character.bones, bonesFound);
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}


function initialPoseGiocatore(giocatore) {
    if (!giocatore.mesh || !giocatore.bones) {
        console.error('Mesh or bones not defined for giocatore');
        return;
    }
    // Ruota il mesh del personaggio
    giocatore.mesh.rotation.x = degToRad(0);
    // Ruota la spina dorsale
    giocatore.bones.spine.rotation.set(degToRad(0), degToRad(0), degToRad(0));
    // Ruota la testa
    giocatore.bones.head.rotation.set(degToRad(-30), degToRad(0), degToRad(0));

    giocatore.bones.forearm_left.rotation.set(degToRad(0), degToRad(45), degToRad(45)); // Mano orientata verso il basso
    giocatore.bones.forearm_right.rotation.set(degToRad(0), degToRad(-50), degToRad(-45)); // Mano orientata verso il basso

    giocatore.bones.hand_left.rotation.set(degToRad(30), degToRad(0), degToRad(40));
    giocatore.bones.hand_right.rotation.set(degToRad(0), degToRad(70), degToRad(-30));

    giocatore.bones.upperarm_left.rotation.set(degToRad(90), degToRad(0), degToRad(-45)); // Verso il basso
    giocatore.bones.upperarm_right.rotation.set(degToRad(90), degToRad(0), degToRad(50)); // Verso il basso
    }


    function initialPoseDifensore(difensore) {
        if (!difensore.mesh || !difensore.bones) {
            console.error('Mesh or bones not defined for difensore:');
            return;
        }
        // Ruota il mesh del personaggio
        difensore.mesh.rotation.x = degToRad(0);
        
        // Ruota la spina dorsale
        difensore.bones.spine.rotation.set(degToRad(-10), degToRad(0), degToRad(0));
        
        // Ruota la testa
        difensore.bones.head.rotation.set(degToRad(-30), degToRad(0), degToRad(0));
    
        // Ruota il braccio sinistro in avanti, inclinato verso il basso di 30 gradi
        
        difensore.bones.forearm_left.rotation.set(degToRad(0), degToRad(0), degToRad(0)); // Mano orientata verso il basso
        difensore.bones.forearm_right.rotation.set(degToRad(0), degToRad(0), degToRad(0)); // Mano orientata verso il basso
    
        difensore.bones.hand_left.rotation.set(degToRad(0), degToRad(0), degToRad(0));
        difensore.bones.hand_right.rotation.set(degToRad(0), degToRad(0), degToRad(0));
    
        // Upper arm (braccio superiore) destro
        difensore.bones.upperarm_left.rotation.set(degToRad(0), degToRad(0), degToRad(-90));
        difensore.bones.upperarm_right.rotation.set(degToRad(0), degToRad(0), degToRad(90)); 
    
        difensore.bones.foot_left.rotation.set(degToRad(80), degToRad(0), degToRad(-10));
        difensore.bones.foot_right.rotation.set(degToRad(80), degToRad(0), degToRad(-10));        
        }

// Funzione di animazione
export function palleggio(){
    console.log('Animazione palleggio avviata');
    if (!giocatore || !giocatore.mesh) {
        console.error('Giocatore is not initialized');
        return;
    }
    var animationTime = 470;
    var handMaxAngle = 45;
    var handRotationStart = { z: handMaxAngle };
    var handRotationEnd = { z: -handMaxAngle };

    var handTweenStart = new TWEEN.Tween(handRotationStart)
        .to({ z: -handMaxAngle }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function() {
            giocatore.bones.hand_right.rotation.z = degToRad(handRotationStart.z);
        });

    var handTweenEnd = new TWEEN.Tween(handRotationEnd)
        .to({ z: handMaxAngle }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function() {
            giocatore.bones.hand_right.rotation.z = degToRad(handRotationEnd.z);
        });
    handTweenStart.chain(handTweenEnd);
    handTweenEnd.chain(handTweenStart);
    handTweenStart.start();
    activeTweens.push(handTweenStart, handTweenEnd);
}

let isArmRaised = false; // Variabile per tracciare se le braccia sono alzate
let isBallRaised = false; // Variabile per tracciare se la palla è alzata

export function TiroGiocatore() {
    if (!giocatore || !giocatore.mesh) {
        console.error('Giocatore is not initialized');
        return;
    }
    if (!palla) {
        console.error('Palla is not initialized');
        return;
    }
    var animationTime = 1000;
    var upperarmMaxAngle = 45;
    var upperarmMinAngle = -upperarmMaxAngle;
    // Definisci gli angoli target per la rotazione delle mani
    var handMaxAngle = 30;
    var handMinAngle = -handMaxAngle;
    var targetArmAngle = isArmRaised ? upperarmMinAngle : upperarmMaxAngle;
    var targetHandAngle = isArmRaised ? handMinAngle : handMaxAngle;
    // Salva la posizione iniziale della palla
    var initialPallaPosition = new THREE.Vector3().copy(palla.position);

    // Calcola la posizione target della palla in base allo stato corrente
    var targetPallaPosition = isBallRaised
        ? new THREE.Vector3(initialPallaPosition.x, initialPallaPosition.y - 8, initialPallaPosition.z - 2.5) // Posizione più bassa
        : new THREE.Vector3(initialPallaPosition.x, initialPallaPosition.y + 8, initialPallaPosition.z + 2.5); // Posizione più alta

    // Tween per il braccio sinistro
    var upperarmLeftTween = new TWEEN.Tween({ z: giocatore.bones.upperarm_left.rotation.z })
        .to({ z: degToRad(targetArmAngle) }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(obj) {
            giocatore.bones.upperarm_left.rotation.z = obj.z;
        });

    // Tween per il braccio destro
    var upperarmRightTween = new TWEEN.Tween({ z: giocatore.bones.upperarm_right.rotation.z })
        .to({ z: -degToRad(targetArmAngle) }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(obj) {
            giocatore.bones.upperarm_right.rotation.z = obj.z;
        });

    // Tween per la rotazione della mano sinistra
    var handLeftTween = new TWEEN.Tween({ x: giocatore.bones.hand_left.rotation.x })
        .to({ x: degToRad(targetHandAngle) }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(obj) {
            giocatore.bones.hand_left.rotation.x = obj.x;
        });

    // Tween per la rotazione della mano destra
    var handRightTween = new TWEEN.Tween({ x: giocatore.bones.hand_right.rotation.x })
        .to({ x: degToRad(targetHandAngle) }, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(obj) {
            giocatore.bones.hand_right.rotation.x = obj.x;
        });

    // Tween per la palla
    var pallaTween = new TWEEN.Tween(palla.position)
        .to(targetPallaPosition, animationTime)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(obj) {
            palla.position.set(obj.x, obj.y, obj.z);
        })
        .onComplete(function() {
            // Aggiorna lo stato della palla e del braccio solo alla fine dell'animazione
            isBallRaised = !isBallRaised;
            isArmRaised = !isArmRaised;
        });

    // Avvia tutti i tweens contemporaneamente
    upperarmLeftTween.start();
    upperarmRightTween.start();
    handLeftTween.start();
    handRightTween.start();
    pallaTween.start();

    // Aggiungi tutti i tweens all'array delle animazioni attive
    animationTweens.push(upperarmLeftTween);
    animationTweens.push(upperarmRightTween);
    animationTweens.push(handLeftTween);
    animationTweens.push(handRightTween); 
    animationTweens.push(pallaTween); 
}

    let isTiroInCorso = false;
    let isDefenderJumping = false;
    let pallaTween = null; // Variabile per memorizzare il tween della palla
    let hasPassedDefender; // Variabile per verificare se la palla ha superato il difensore
    const canestroPosition = new THREE.Vector3(-37, 22, -5); // Punto finale della traiettoria

    function fermarePalla() {
        if (pallaTween) {
            pallaTween.stop(); 
            console.log('La palla è stata fermata dal difensore!');
        }
    isTiroInCorso = false; // Consente nuovi tiri
    }

    export function LancioPalla(parabolaType) {
        if (!palla) {
            console.error('Palla non è inizializzata');
            return;
        }
        if (isTiroInCorso) {
            console.warn('Un altro tiro è già in corso');
            return;
    }

    isTiroInCorso = true;

    const animationTime = 2400;
    const initialBounceHeight = 20;
    const initialPallaPosition = new THREE.Vector3().copy(palla.position);

    let controlHeightOffset;
    switch (parabolaType) {
        case 'alta':
            controlHeightOffset = 30;
            break;
        case 'normale':
        default:
            controlHeightOffset = 20;
            break;
    }

    const controlPoint = new THREE.Vector3(
        (initialPallaPosition.x + canestroPosition.x) / 2,
        Math.max(initialPallaPosition.y, canestroPosition.y) + controlHeightOffset,
        (initialPallaPosition.z + canestroPosition.z) / 2
    );

    function interpolateParabola(t, initialPos, controlPos, finalPos) { //Questa funzione calcola la posizione della palla in base ad un valore di interpolazione 
        const x = (1 - t) * (1 - t) * initialPos.x + 2 * (1 - t) * t * controlPos.x + t * t * finalPos.x;
        const y = (1 - t) * (1 - t) * initialPos.y + 2 * (1 - t) * t * controlPos.y + t * t * finalPos.y;
        const z = (1 - t) * (1 - t) * initialPos.z + 2 * (1 - t) * t * controlPos.z + t * t * finalPos.z;
        return new THREE.Vector3(x, y, z);
    }

    let isAboveDefender;
    const rotationSpeed = 0.1;

    pallaTween = new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, animationTime)
        .easing(TWEEN.Easing.Quadratic.InOut) 
        .onUpdate(function (obj) {
            const interpolatedPosition = interpolateParabola(obj.t, initialPallaPosition, controlPoint, canestroPosition);
            palla.position.set(interpolatedPosition.x, interpolatedPosition.y, interpolatedPosition.z);

            palla.rotation.x += rotationSpeed * (TWEEN.now() - pallaTween._startTime) / 1000; //Rotazione palla
            palla.rotation.y += rotationSpeed * (TWEEN.now() - pallaTween._startTime) / 1000;  //Rotazione palla

            console.log(`Posizione palla: X=${Math.round(palla.position.x)}, Y=${Math.round(palla.position.y)}, Z=${Math.round(palla.position.z)}`);

                hasPassedDefender=false
            if (!hasPassedDefender && palla.position.z > difensore.mesh.position.z) {
                hasPassedDefender = true;
            }
            console.log("Ha passato il difensore? "+ hasPassedDefender);

            isAboveDefender=false;
            if(palla.position.z >= -52 && palla.position.z <= -47){
                isAboveDefender=true;
            }
            console.log("La palla è sopra al difensore?" + isAboveDefender);
            
            if (
                isDefenderJumping ==true&&
                isAboveDefender ==true &&
                hasPassedDefender == false &&
                parabolaType =="normale"
            ) {
                fermarePalla();
                palla.position.set(palla.position.x, difensore.mesh.position.y+20, palla.position.z);
                console.log('Palla fermata dal difensore in salto!');
                bounceBall(palla.position.y); // Usa la funzione estratta
            }
        })
        .onComplete(function () {
                console.log('Tiro completato! Inizio animazione di rimbalzo.');
                bounceBall(initialBounceHeight); // Usa la funzione estratta
        })
    pallaTween.start();
    animationTweens.push(pallaTween);
}

export function bounceBall(initialBounceHeight, callback) {
    const groundY = 2;
    const gravity = 9.81;
    const damping = 0.5;
    function simulateBounce() {
        let currentHeight = initialBounceHeight;

        function bounce() {
            if (currentHeight < 0.1) {
                isTiroInCorso = false;
                console.log('Rimbalzi completati. La palla si ferma.');
                if (callback) callback(); // Chiama il callback se fornito
                return;
            }
            // Calcola i tempi di salita e discesa
            let timeUp = Math.sqrt((2 * currentHeight) / gravity);
            let timeDown = timeUp;

            let bounceUp = new TWEEN.Tween({ y: groundY })
                .to({ y: groundY + currentHeight }, timeUp * 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(function (object) {
                    palla.position.y = object.y;
                });

            let bounceDown = new TWEEN.Tween({ y: groundY + currentHeight })
                .to({ y: groundY }, timeDown * 500)
                .easing(TWEEN.Easing.Quadratic.In)
                .onUpdate(function (object) {
                    palla.position.y = object.y;
                });

            bounceUp.chain(bounceDown);
            bounceUp.start();

            currentHeight *= damping;
            bounceDown.onComplete(() => bounce());
        }
        bounce();
    }
    simulateBounce();
    }

    export function saltoDifensore() {
    if (!difensore || !difensore.mesh || !difensore.bones) {
        console.error('Difensore o sue ossa non sono inizializzati');
        return;
    }

    if (isDefenderJumping) {
        console.warn('Il difensore è già in aria');
        return;
    }

    isDefenderJumping = true;
    console.log('Difensore inizia a saltare');

    const animationTime = 700;
    const jumpHeight = 5;
    const initialPosition = difensore.mesh.position.clone();

    const targetPosition = new THREE.Vector3(
        initialPosition.x,
        initialPosition.y + jumpHeight,
        initialPosition.z
    );

    // Rotazioni iniziali e finali delle braccia
    const initialArmRotation = { left: { z: degToRad(-90) }, right: { z: degToRad(90) } };
    const targetArmRotation = { left: { z: degToRad(90) }, right: { z: degToRad(-90) } };

    // Rotazioni iniziali e finali delle mani
    const initialHandRotation = { left: { y: degToRad(0) }, right: { y: degToRad(0) } };
    const targetHandRotation = { left: { y: degToRad(-90) }, right: { y: degToRad(90) } };

    // Rotazioni iniziali e finali dei piedi
    const initialFootRotation = { left: { x: degToRad(80) }, right: { x: degToRad(80) } };
    const targetFootRotation = { left: { x: degToRad(45) }, right: { x: degToRad(45) } };

    // Tween per il salto del difensore
    const jumpTween = new TWEEN.Tween(difensore.mesh.position)
        .to(targetPosition, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.Out);

    // Tween per riportare il difensore alla posizione iniziale
    const returnTween = new TWEEN.Tween(difensore.mesh.position)
        .to(initialPosition, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(function () {
            isDefenderJumping = false;
            console.log('Difensore torna alla posizione originale');
        });

    // Tween per portare le braccia in alto
    const armTweenUp = new TWEEN.Tween({ z: initialArmRotation.left.z })
        .to({ z: targetArmRotation.left.z }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function (rotation) {
            difensore.bones.upperarm_left.rotation.z = rotation.z;
            difensore.bones.upperarm_right.rotation.z = -rotation.z;
        });

    // Tween per riportare le braccia in basso
    const armTweenDown = new TWEEN.Tween({ z: targetArmRotation.left.z })
        .to({ z: initialArmRotation.left.z }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(function (rotation) {
            difensore.bones.upperarm_left.rotation.z = rotation.z;
            difensore.bones.upperarm_right.rotation.z = -rotation.z;
        });

    // Tween per portare le mani in alto
    const handTweenUp = new TWEEN.Tween({ y: initialHandRotation.left.y })
        .to({ y: targetHandRotation.left.y }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function (rotation) {
            difensore.bones.hand_left.rotation.y = rotation.y;
            difensore.bones.hand_right.rotation.y = -rotation.y;
        });

    // Tween per riportare le mani in basso
    const handTweenDown = new TWEEN.Tween({ y: targetHandRotation.left.y })
        .to({ y: initialHandRotation.left.y }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(function (rotation) {
            difensore.bones.hand_left.rotation.y = rotation.y;
            difensore.bones.hand_right.rotation.y = -rotation.y;
        });

    // Tween per portare i piedi in alto
    const footTweenUp = new TWEEN.Tween({ x: initialFootRotation.left.x })
        .to({ x: targetFootRotation.left.x }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function (rotation) {
            difensore.bones.foot_left.rotation.x = rotation.x;
            difensore.bones.foot_right.rotation.x = rotation.x;
        });

    // Tween per riportare i piedi in basso
    const footTweenDown = new TWEEN.Tween({ x: targetFootRotation.left.x })
        .to({ x: initialFootRotation.left.x }, animationTime / 2)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(function (rotation) {
            difensore.bones.foot_left.rotation.x = rotation.x;
            difensore.bones.foot_right.rotation.x = rotation.x;
        });


    // Sincronizzazione e avvio dei tween
    jumpTween.chain(returnTween);
    armTweenUp.chain(armTweenDown);
    handTweenUp.chain(handTweenDown);
    footTweenUp.chain(footTweenDown);
    jumpTween.start(); // Avvia il salto
    armTweenUp.start(); // Avvia il movimento delle braccia
    handTweenUp.start(); // Avvia il movimento delle mani
    footTweenUp.start(); // Avvia il movimento dei piedi
}