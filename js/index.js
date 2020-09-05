import * as THREE from "./three.module.js"
import { GUI } from './dat.gui.module.js'
import { GLTFLoader } from './GLTFLoader.js'
import { OrbitControls } from './OrbitControls.js'

var scene, controls, camera, renderer, loader, rig, sets;

alert("This is not the most recommended way for you to make renders, I reccomend downloading blender instead at https://blender.org");

init();
animate();
function init()
{
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(40, 20, 0);

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    /*
    var geo = new THREE.CylinderBufferGeometry(0,10,30,4,1);
    var mat = new THREE.MeshPhongMaterial({color:0xfff});

    var mesh = new THREE.Mesh(geo,mat);
    */

    createGUI();

    var lig = new THREE.AmbientLight(0x999999);
    scene.add(lig);

    var lig = new THREE.PointLight(0xffffff, 1, 100);
    lig.position.set(10, 0, -5);
    scene.add(lig);

    window.addEventListener('resize', onWinResiz, false);

    loader = new GLTFLoader();

    loader.load('./assets/rig.glb',
        (gltf) =>
        {
            //parse GLTF data
            rig = gltf;
            scene.add(rig.scene);
            console.log(rig.scene);
        },
        (xhr) =>
        {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (err) =>
        {
            console.log('error: ' + err);
        });
}

function createGUI()
{
    var panel = new GUI({ width: 310 });

    var folder1 = panel.addFolder('Right Arm');
    var folder2 = panel.addFolder('Left Arm');
    var folder3 = panel.addFolder('Body');
    var folder4 = panel.addFolder('Right Leg');
    var folder5 = panel.addFolder('Left Leg');

    var folder1_1 = folder1.addFolder('Upper');
    var folder1_2 = folder1.addFolder('Lower');

    var folder2_1 = folder2.addFolder('Upper');
    var folder2_2 = folder2.addFolder('Lower');

    sets = {
        'right arm': {
            'upper': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            },
            'lower': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            }
        },
        'left arm': {
            'upper': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            },
            'lower': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            }
        }
    };

    folder1_1.add(sets['right arm']['upper'], 'XRot', -3.1415926, 3.1415926, 0.001);
    folder1_1.add(sets['right arm']['upper'], 'YRot', -3.1415926, 3.1415926, 0.001);
    folder1_1.add(sets['right arm']['upper'], 'ZRot', -3.1415926, 3.1415926, 0.001);

    folder1_2.add(sets['right arm']['lower'], 'XRot', -3.1415926, 3.1415926, 0.001);
    folder1_2.add(sets['right arm']['lower'], 'YRot', -3.1415926, 3.1415926, 0.001);
    folder1_2.add(sets['right arm']['lower'], 'ZRot', -3.1415926, 3.1415926, 0.001);

    folder2_1.add(sets['left arm']['upper'], 'XRot', -3.1415926, 3.1415926, 0.001);
    folder2_1.add(sets['left arm']['upper'], 'YRot', -3.1415926, 3.1415926, 0.001);
    folder2_1.add(sets['left arm']['upper'], 'ZRot', -3.1415926, 3.1415926, 0.001);

    folder2_2.add(sets['left arm']['lower'], 'XRot', -3.1415926, 3.1415926, 0.001);
    folder2_2.add(sets['left arm']['lower'], 'YRot', -3.1415926, 3.1415926, 0.001);
    folder2_2.add(sets['left arm']['lower'], 'ZRot', -3.1415926, 3.1415926, 0.001);

    var takeSS = {
        add: function ()
        {
            render();
            let dataURL = renderer.domElement.toDataURL();
            downloadURL(dataURL)
        }
    };

    panel.add(takeSS, "add").name("Take a Screenshot");
}

function onWinResiz()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

var fram = 0;

function animate()
{
    fram++;
    if (fram % 120 == 0) {
        console.log(sets);
    }
    if (rig) { //ensures rig is loaded before messing with it :]
        let pelvis = rig.scene.children[0].children[0];
        let armR = pelvis.children[0].children[0].children[2].children[0];
        let armL = pelvis.children[0].children[0].children[1].children[0];

        if (fram % 120 == 0) {
            console.log(rig);
        }
        armR.rotation.set(sets['right arm']['upper']['XRot'], sets['right arm']['upper']['YRot'], sets['right arm']['upper']['ZRot']);
        armR.children[0].rotation.set(sets['right arm']['lower']['XRot'], sets['right arm']['lower']['YRot'], sets['right arm']['lower']['ZRot']);

        armL.rotation.set(sets['left arm']['upper']['XRot'], sets['left arm']['upper']['YRot'], sets['left arm']['upper']['ZRot']);
        armL.children[0].rotation.set(sets['left arm']['lower']['XRot'], sets['left arm']['lower']['YRot'], sets['left arm']['lower']['ZRot']);
    }
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render()
{
    renderer.render(scene, camera);
}

function downloadURL(url) 
{
    let anchor = document.createElement("a");
    anchor.style = "display: none;"
    anchor.download = "render_result.png"
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}