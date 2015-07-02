'use strict';

  //threeJS
  var scene, renderer, camera;
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

$(function(){


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

    audioCtx.decodeAudioData(audioData, function(soundBuffer){
      musicSource.buffer = soundBuffer;

      convolver = audioCtx.createConvolver();
      gainNode = audioCtx.createGain();
      analyserNode = audioCtx.createAnalyser();
      proc = audioCtx.createScriptProcessor(1024,1,1);
      //analyserNode.fftSize = 256;

      //WIRING

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
  navigator.getUserMedia  = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

  navigator.getUserMedia({audio: true, video: false},
    function(stream){
      audioInput = audioCtx.createMediaStreamSource(stream);
      var convolver2 = audioCtx.createConvolver();
      audioInput.connect(convolver2)
      convolver2.connect(audioCtx.destination);
      setReverbImpulseResponse(conUrl, convolver2);
    },

    function(error){
      alert('Error capturing audio.');
    });


  };

  function playSound() {

    musicSource.start(0, startOffset);
    data = new Uint8Array(analyserNode.frequencyBinCount);
    proc.onaudioprocess = function(){
      analyserNode.getByteFrequencyData(data);
      console.log(data[5]);
    }
}
  function stopSound() {

    musicSource.stop();
    startOffset += audioCtx.currentTime;
    }



  $(document).keypress(function(e) {



  //+ and - for volume
     if (e.charCode == 61){
      gainNode.gain.value += 0.1;
      console.log(e.charCode);
    }

    else if (e.charCode == 45){
      gainNode.gain.value-= 0.1;

    }


  });

//source toggle
$('.inToggle').click(function(e){

  // console.log(e);
  console.log(e.target.innerText);
  if (e.target.innerText === "Live Input" && !liveSoundPlaying) {
    $(this).addClass('switched');
    liveSoundPlaying = true;
    liveSound();
    }
  else if (e.target.innerText === "Live Input" && liveSoundPlaying) {
    $(this).removeClass('switched');
    liveSoundPlaying = false;
    audioInput.disconnect();
    }

  else if (e.target.innerText === "Short Clip" && !playing) {
    $(this).addClass('switched');
    playing = true;
    startSound();
    }
  else if (e.target.innerText === "Short Clip" && playing) {
    $(this).removeClass('switched');
    playing = false;
    stopSound();
    }

  else if (e.target.innerText === "-") {
    // $(this).addClass('switched');
    gainNode.gain.value -= 0.1;
    }
  else if (e.target.innerText === "+") {
    gainNode.gain.value += 0.1;
    }

  })

  function setReverbImpulseResponse(conFile, convolver, callback) {

    var request = new XMLHttpRequest();
    request.open('GET', conFile, true);
    request.responseType = "arraybuffer";

    request.onload = function(){
      audioCtx.decodeAudioData(request.response, function(convolverBuffer) {
        convolver.buffer = convolverBuffer;

        callback();

      });

    };
    request.send();
  }


//reverb switch logic

  $('#subIR').submit(function(e){
    e.preventDefault();
    conUrl = 'audio/IR/' +
    $('select[name="IRs"] option:selected').val();
    //setReverbImpulseResponse(chosen, convolver, playSound);
    console.log(conUrl);
    $("select[name='IRs']").blur();

    //restart liveInput with new IR
    if(liveSoundPlaying) {
    audioInput.disconnect();
    liveSound();
    }

    else if(playing) {
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
camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 2000 );
scene.add(camera);


//light
var hemiLight = new THREE.HemisphereLight(0xffffff, 0x00ff00, 0.6);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

var pointLight = new THREE.PointLight(0x00FF00, 1);
pointLight.position.set(0, 300, 200);

scene.add(pointLight);
//cube

var cubeGeo = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
var cube = new THREE.Mesh(cubeGeo, cubeMaterial);
scene.add(cube);
camera.lookAt(cube);
camera.position.z = -30;

//sphere

var sphereGeo = new THREE.SphereGeometry( 10,10,10 );
var sphereMat = new THREE.MeshBasicMaterial( {color:0xFF00FF});
var sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);

renderer = new THREE.WebGLRenderer( {antialias: true, alpha:false} );
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("threeDiv").appendChild(renderer.domElement);

//renderer.setClearColor(0xFF45FF);
}

function render() {
requestAnimationFrame(render);
renderer.render(scene, camera);

}




