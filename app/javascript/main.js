'use strict';

//threeJS
var scene, camera, renderer, cube, hemilight, sphere, pyramid;
var box;
var audioCtx = new window.AudioContext();
var soundBuffer, musicSource, array;
var playing = false;
var liveSoundPlaying = false;
var musicUrl = "audio/piano_sample.ogg";
var conUrl = "audio/IR/EMT 28 Echo Plate.wav";
var convolver, proc, gainNode, audioInput, analyserNode, bufferLength, dataArray;
var startOffset = 0;
var data;

$(function() {


    //var conUrl ='http://thingsinjars.com/lab/web-audio-tutorial/hello.mp3';



    // function getStream(stream) {
    //   var mediaStreamSource = audioCtx.createMediaStreamSource(stream);
    //   mediaStreamSource.connect(audioCtx.destination);
    // }

    // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    // navigator.getUserMedia({audio: true}, getStream, error);

    // function error() {
    //   alert('stream generation failed.');
    // }

    function startSound() {
        var request = new XMLHttpRequest();
        request.open('GET', musicUrl, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            var audioData = request.response;

            audioGraph(audioData);
        };
        request.send();

    }

    function audioGraph(audioData) {

        musicSource = audioCtx.createBufferSource();
        musicSource.loop = true;

        audioCtx.decodeAudioData(audioData, function(soundBuffer) {
            musicSource.buffer = soundBuffer;

            convolver = audioCtx.createConvolver();
            gainNode = audioCtx.createGain();
            analyserNode = audioCtx.createAnalyser();
            proc = audioCtx.createScriptProcessor(1024, 1, 1);
            //analyserNode.fftSize = 256;

            //WIRING


            musicSource.connect(convolver);
            musicSource.connect(gainNode);
            musicSource.connect(analyserNode);
            analyserNode.connect(proc);
            proc.connect(convolver);
            convolver.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            //load convolution response

            setReverbImpulseResponse(conUrl, convolver, playSound);
        });

    }

    function liveSound() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        navigator.getUserMedia({
                audio: true,
                video: false
            },
            function(stream) {
                audioInput = audioCtx.createMediaStreamSource(stream);
                var convolver2 = audioCtx.createConvolver();
                gainNode = audioCtx.createGain();
                analyserNode = audioCtx.createAnalyser();
                proc = audioCtx.createScriptProcessor(1024, 1, 1);

                audioInput.connect(convolver2);
                audioInput.connect(gainNode);
                audioInput.connect(analyserNode);
                analyserNode.connect(proc);
                proc.connect(convolver2);
                convolver2.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                setReverbImpulseResponse(conUrl, convolver2);
                data = new Uint8Array(analyserNode.frequencyBinCount);
                proc.onaudioprocess = function() {
                    analyserNode.getByteFrequencyData(data);
                }
            },

            function(error) {
                alert('Error capturing audio.');
            });


    };

    function playSound() {

        musicSource.start(0, startOffset);
        data = new Uint8Array(analyserNode.frequencyBinCount);
        proc.onaudioprocess = function() {
            analyserNode.getByteFrequencyData(data);
            // console.log(data[5]);
        }
    }

    function stopSound() {

        musicSource.stop();
        startOffset += audioCtx.currentTime;
    }


    //source toggle
    $('.button').click(function(e) {
        // console.log(e);

        if (e.target.innerText === "Microphone" && !liveSoundPlaying) {
            $(this).addClass('switched');
            liveSoundPlaying = true;
            liveSound();
        } else if (e.target.innerText === "Microphone" && liveSoundPlaying) {
            $(this).removeClass('switched');
            liveSoundPlaying = false;
            audioInput.disconnect();
        } else if (e.target.innerText === "Chopin" && !playing) {
            $(this).addClass('switched');
            console.log("start playing");
            playing = true;
            startSound();
            $(".volnum").text(1);
        } else if (e.target.innerText === "Chopin" && playing) {
            $(this).removeClass('switched');
            playing = false;
            stopSound();
        } else if (e.target.innerText === "Softer" && gainNode.gain.value >= 0) {
            $(".volnum").text(gainNode.gain.value.toFixed(1));
            gainNode.gain.value -= 0.1;
        } else if (e.target.innerText === "Louder" && gainNode.gain.value <= 10){
            gainNode.gain.value += 0.1;
            $(".volnum").text(gainNode.gain.value.toFixed(1));
        }

    })

    function setReverbImpulseResponse(conFile, convolver, callback) {

        var request = new XMLHttpRequest();
        request.open('GET', conFile, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            audioCtx.decodeAudioData(request.response, function(convolverBuffer) {
                convolver.buffer = convolverBuffer;

                callback();

            });

        };
        request.send();
    }


    //reverb switch logic

    $('#subIR').submit(function(e) {
        e.preventDefault();
        conUrl = 'audio/IR/' +
            $('select[name="IRs"] option:selected').val();
        //setReverbImpulseResponse(chosen, convolver, playSound);
        console.log(conUrl);
        $("select[name='IRs']").blur();

        //restart liveInput with new IR
        if (liveSoundPlaying) {
            audioInput.disconnect();
            liveSound();
        } else if (playing) {
            stopSound();
            startSound();
        }

    });

    init();
    render();

});


//THREE.js stuff!

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 800);
    scene.add(camera);
    camera.position.set(0, 0, 50);

    //light
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x00ff00, 0.6);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    var pointLight = new THREE.PointLight(0x00FF00, 1);
    pointLight.position.set(0, 300, 200);

    scene.add(pointLight);



    // //cube

    // //test cube
    // var geometry = new THREE.BoxGeometry(15, 15, 15);
    // var material = new THREE.MeshPhongMaterial({
    //     color: 0xFF00FF,

    //     wireframe: true,
    //     opacity: 1
    // });
    // cube = new THREE.Mesh(geometry, material);
    // cube.position.set(40, 0, 0);
    // scene.add(cube);


    // //pyramid
    // var pyraGeo = new THREE.IcosahedronGeometry(13, 1);
    // var pyraMat = new THREE.MeshPhongMaterial({
    //     color: 0xFF00FF,
    //     wireframe: true
    // });
    // pyramid = new THREE.Mesh(pyraGeo, pyraMat);
    // pyramid.position.set(-40, 0, 0);
    // scene.add(pyramid);



    //sphere

    var sphereGeo = new THREE.SphereGeometry(20, 20, 10);
    var sphereMat = new THREE.MeshPhongMaterial({
        color: 0xFF00FF,
        wireframe: true
    });
    sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("threeDiv").appendChild(renderer.domElement);

    //resize helper
    window.addEventListener('resize', function() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    }, false);


}



// var i = 1;

function render() {

    requestAnimationFrame(render);
    renderer.render(scene, camera);
    // cube.rotation.y += 0.01;
    sphere.rotation.y += 0.006;
    // pyramid.rotation.y += 0.01;

    if (typeof(data) !== "undefined" && data !== 0) {
        // cube.scale.z = data[5] / 70;
        sphere.scale.z = data[5] / 70;
        sphere.scale.x = data[5] / 70;
        sphere.scale.y = data[5] / 70;
        // pyramid.scale.x = data[5] / 70;
    }
}
