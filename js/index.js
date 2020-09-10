import * as THREE from "./three.module.js";
import { GUI } from './dat.gui.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { RGBELoader } from './RGBELoader.js';

window.THREE = THREE;
var scene,
    controls,
    camera,
    renderer,
    loader,
    rig,
    sets,
    skinCanvas,
    skinCtx,
    cSkin = "Triggerman",
    cDye = "None",
    skinCols = JSON.parse(document.getElementById("skins").innerHTML),
    dyeCols = JSON.parse(document.getElementById("dyes").innerHTML);

if (localStorage["hasAlert"] !== "t") alert("This is not the most recommended way for you to make renders, I recommend downloading blender instead at https://blender.org");
localStorage.setItem("hasAlert", "t");


init();
animate();
function init()
{
    skinCanvas = document.createElement("canvas");
    skinCanvas.style = "display: none; image-rendering: pixelated";
    document.body.appendChild(skinCanvas);
    skinCtx = skinCanvas.getContext("2d")
    skinCanvas.height = 1
    skinCanvas.width = 7;
    genTextureSet(skinCols["Triggerman"])


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    scene = new THREE.Scene();
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.imageRendering = "pixelated";
        document.body.appendChild(renderer.domElement);
    } catch (e) {
        alert("this browser has difficulty starting the WebGL context, please use another browser");
    }
    //camera.position.set(0, 20, 40);
    camera.position.set(0, 10, -40);

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    /*
    var geo = new THREE.CylinderBufferGeometry(0,10,30,4,1);
    var mat = new THREE.MeshPhongMaterial({color:0xfff});

    var mesh = new THREE.Mesh(geo,mat);
    */

    createGUI();

    var lig = new THREE.HemisphereLight(0x999999, 0x222222, 1);
    scene.add(lig);
    lig.position.set(10, 0, -5);
    scene.add(lig);

    var ambLight = new THREE.AmbientLight(0x7a7a6e, 1);
    scene.add(ambLight)

    window.addEventListener('resize', onWinResiz, false);

    loader = new GLTFLoader();

    var enMaps = [];
    loader.load('./assets/rig.glb',
        (gltf) =>
        {
            //parse GLTF data
            rig = gltf;

            console.log(rig)

            var tmTex = new THREE.CanvasTexture(skinCanvas)

            tmTex.magFilter = THREE.NearestFilter
            tmTex.minFilter = THREE.NearestFilter

            rig.scene.traverse((key) =>
            {
                try {
                    key.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        map: tmTex,
                        skinning: true
                    })
                    //key.material.map = tmTex;
                } catch (err) {

                }
            })

            scene.add(rig.scene);
            console.log(rig.scene);
            for (var i = 3; i < rig.scene.children[0].children.length; i++) {
                enMaps[enMaps.length] = rig.scene.children[0].children[i].material;
            }

            new RGBELoader()
                .setDataType(THREE.UnsignedByteType)
                .setPath('assets/')
                .load('kloppenheim_06_1k.hdr', (tex) =>
                {
                    var premGenerator = new THREE.PMREMGenerator(renderer);
                    premGenerator.compileEquirectangularShader();

                    let envMap = premGenerator.fromEquirectangular(tex).texture;

                    scene.enviroment = envMap;

                    //console.log(enMaps);

                    for (var i = 0; i < enMaps.length; i++) {
                        enMaps[i].envMap = envMap;
                        //console.log(enMaps[i]);
                    }
                    for (var i = 3; i < rig.scene.children[0].children.length; i++) {
                        rig.scene.children[0].children[i].material.envMap = envMap;
                    }

                    tex.dispose();
                    premGenerator.dispose();
                });
        },
        (xhr) =>
        {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (err) =>
        {
            console.log('error: ' + err);
        });
    /*
        new RGBELoader()
            .setDataType(THREE.UnsignedByteType)
            .setPath('assets/')
            .load('kloppenheim_06_1k.hdr', (tex) => {
                var premGenerator = new THREE.PMREMGenerator(renderer);
                premGenerator.compileEquirectangularShader();
    
                let envMap = premGenerator.fromEquirectangular(tex).texture;
    
                scene.background = envMap;
                scene.enviroment = envMap;
    
                console.log(enMaps);
    
                for(var i=0;i<enMaps.length;i++){
                    enMaps[i].envMap=envMap;
                    console.log(enMaps[i]);
                }
    
                tex.dispose();
                premGenerator.dispose();
            });
    */
}

function createGUI()
{
    var panel = new GUI({ width: 310 });

    var folder1 = panel.addFolder('Right Arm');
    var folder2 = panel.addFolder('Left Arm');
    var folder3 = panel.addFolder('Body');
    var folder4 = panel.addFolder('Right Leg');
    var folder5 = panel.addFolder('Left Leg');

    var skinFolder = panel.addFolder("Skin");
    var classFolderObj = {
        speed: "Triggerman",
        onChange: (skin) =>
        {
            cSkin = skin;
            genTextureSet(skinCols[cSkin]);
            genDyeTextureSet(dyeCols[cDye]);
            updateSkinTextures();
        }
    }
    skinFolder.add(classFolderObj, "speed", Object.keys(skinCols)).name("Class").onChange(classFolderObj.onChange);

    var dyeFolderObj = {
        speed: "None",
        onChange: (dye) =>
        {
            cDye = dye;
            genTextureSet(skinCols[cSkin]);
            genDyeTextureSet(dyeCols[cDye]);
            updateSkinTextures();
        }
    }
    skinFolder.add(dyeFolderObj, "speed", Object.keys(dyeCols)).name("Dye").onChange(dyeFolderObj.onChange);

    var folder1_1 = folder1.addFolder('Upper');
    var folder1_2 = folder1.addFolder('Lower');

    var folder2_1 = folder2.addFolder('Upper');
    var folder2_2 = folder2.addFolder('Lower');

    var folder3_1 = folder3.addFolder('Head');
    var folder3_2 = folder3.addFolder('Main');

    var folder4_1 = folder4.addFolder('Upper');
    var folder4_2 = folder4.addFolder('Lower');

    var folder5_1 = folder5.addFolder('Upper');
    var folder5_2 = folder5.addFolder('Lower');

    sets = {
        'right arm': {
            'upper': {
                'XRot': 0,
                'YRot': 0.25,
                'ZRot': -1.55
            },
            'lower': {
                'XRot': -2.157,
                'YRot': 0,
                'ZRot': 0
            }
        },
        'left arm': {
            'upper': {
                'XRot': 0,
                'YRot': 2.822,
                'ZRot': -1.55
            },
            'lower': {
                'XRot': 2.002,
                'YRot': -0.078,
                'ZRot': -0.023
            }
        },
        'body': {
            'head': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            },
            'main': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0
            }
        },
        'left leg': {
            'upper': {
                'XRot': 3.142,
                'YRot': -1.555,
                'ZRot': -0.128
            },
            'lower': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0.157
            }
        },
        'right leg': {
            'upper': {
                'XRot': -3.142,
                'YRot': -1.555,
                'ZRot': -0.185
            },
            'lower': {
                'XRot': 0,
                'YRot': 0,
                'ZRot': 0.215
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

    folder3_1.add(sets['body']['head'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder3_1.add(sets['body']['head'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder3_1.add(sets['body']['head'], 'ZRot', -3.1415926, 3.1415925, 0.001);

    folder3_2.add(sets['body']['main'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder3_2.add(sets['body']['main'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder3_2.add(sets['body']['main'], 'ZRot', -3.1415926, 3.1415925, 0.001);

    folder4_1.add(sets['right leg']['upper'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder4_1.add(sets['right leg']['upper'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder4_1.add(sets['right leg']['upper'], 'ZRot', -3.1415926, 3.1415925, 0.001);

    folder4_2.add(sets['right leg']['lower'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder4_2.add(sets['right leg']['lower'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder4_2.add(sets['right leg']['lower'], 'ZRot', -3.1415926, 3.1415925, 0.001);

    folder5_1.add(sets['left leg']['upper'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder5_1.add(sets['left leg']['upper'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder5_1.add(sets['left leg']['upper'], 'ZRot', -3.1415926, 3.1415925, 0.001);

    folder5_2.add(sets['left leg']['lower'], 'XRot', -3.1415926, 3.1415925, 0.001);
    folder5_2.add(sets['left leg']['lower'], 'YRot', -3.1415926, 3.1415925, 0.001);
    folder5_2.add(sets['left leg']['lower'], 'ZRot', -3.1415926, 3.1415925, 0.001);


    var takeSS = {
        add: function ()
        {
            render();
            let dataURL = renderer.domElement.toDataURL();
            downloadURL(dataURL);
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
        //console.log(sets);
    }
    if (rig) { //ensures rig is loaded before messing with it :]
        let pelvis = rig.scene.children[0].children[0];
        let armR = pelvis.children[0].children[0].children[2].children[0];
        let armL = pelvis.children[0].children[0].children[1].children[0];

        if (fram % 120 == 0) {
            //console.log(scene);
        }
        armR.rotation.set(sets['right arm']['upper']['XRot'], sets['right arm']['upper']['YRot'], sets['right arm']['upper']['ZRot']);
        armR.children[0].rotation.set(sets['right arm']['lower']['XRot'], sets['right arm']['lower']['YRot'], sets['right arm']['lower']['ZRot']);

        armL.rotation.set(sets['left arm']['upper']['XRot'], sets['left arm']['upper']['YRot'], sets['left arm']['upper']['ZRot']);
        armL.children[0].rotation.set(sets['left arm']['lower']['XRot'], sets['left arm']['lower']['YRot'], sets['left arm']['lower']['ZRot']);

        pelvis.rotation.set(sets['body']['main']['XRot'], sets['body']['main']['YRot'], sets['body']['main']['ZRot']);
        pelvis.children[0].children[0].children[0].rotation.set(sets['body']['head']['XRot'], sets['body']['head']['YRot'], sets['body']['head']['ZRot']);

        rig.scene.children[0].children[1].rotation.set(sets['left leg']['upper']['XRot'], sets['left leg']['upper']['YRot'], sets['left leg']['upper']['ZRot']);

        rig.scene.children[0].children[1].children[0].rotation.set(sets['left leg']['lower']['XRot'], sets['left leg']['lower']['YRot'], sets['left leg']['lower']['ZRot']);

        rig.scene.children[0].children[2].rotation.set(sets['right leg']['upper']['XRot'], sets['right leg']['upper']['YRot'], sets['right leg']['upper']['ZRot']);

        rig.scene.children[0].children[2].children[0].rotation.set(sets['right leg']['lower']['XRot'], sets['right leg']['lower']['YRot'], sets['right leg']['lower']['ZRot']);
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
    anchor.style = "display: none;";
    anchor.download = "render_result.png";
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}

function genTextureSet(colors, isUrl = false)
{
    skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);

    skinCtx.fillStyle = colors[5];
    skinCtx.fillRect(0, 0, 1, 1);

    skinCtx.fillStyle = colors[1];
    skinCtx.fillRect(1, 0, 1, 1);

    skinCtx.fillStyle = colors[2];
    skinCtx.fillRect(2, 0, 1, 1);

    skinCtx.fillStyle = colors[4];
    skinCtx.fillRect(3, 0, 1, 1);

    skinCtx.fillStyle = colors[0];
    skinCtx.fillRect(4, 0, 1, 1);

    skinCtx.fillStyle = colors[3];
    skinCtx.fillRect(5, 0, 1, 1);

    return isUrl ? skinCanvas.toDataURL() : skinCanvas;
}

function genDyeTextureSet(colors, isUrl = false) 
{
    if (!!colors.length) {
        skinCtx.fillStyle = colors[1];
        skinCtx.fillRect(0, 0, 1, 1);

        skinCtx.fillStyle = colors[0];
        skinCtx.fillRect(1, 0, 1, 1);

        skinCtx.fillStyle = colors[2];
        skinCtx.fillRect(2, 0, 1, 1);

        skinCtx.fillStyle = colors[3];
        skinCtx.fillRect(5, 0, 1, 1);

        return isUrl ? skinCanvas.toDataURL() : skinCanvas;
    }
}

function updateSkinTextures()
{
    var tmTex = new THREE.CanvasTexture(skinCanvas);
    tmTex.magFilter = THREE.NearestFilter;
    tmTex.minFilter = THREE.NearestFilter;

    scene.traverse((key) =>
    {
        try {
            key.material.map = tmTex;
        } catch (err) {

        }
    })
}