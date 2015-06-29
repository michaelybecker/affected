'use strict';


$(function(){

var audioCtx = new window.AudioContext();
var soundBuffer, musicSource;
//var conUrl ='http://thingsinjars.com/lab/web-audio-tutorial/hello.mp3';
var playing = false;
var musicUrl = "audio/piano_sample.ogg";
var conUrl = "audio/IR/EMT 28 Echo Plate.wav";


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
  var convolver;

  musicSource = audioCtx.createBufferSource();
  audioCtx.decodeAudioData(audioData, function(soundBuffer){
    musicSource.buffer = soundBuffer;

    convolver = audioCtx.createConvolver();

    //WIRING

    musicSource.connect(convolver);
    convolver.connect(audioCtx.destination);

    //load convolution response

    setReverbImpulseResponse(conUrl, convolver, playSound);

    });

  }


function playSound() {

  musicSource.start();


}

function stopSound() {

  musicSource.stop();
  }



$(document).keypress(function(e) {

console.log(e.charCode);
  if (e.charCode == 32 && !playing) {
    playing = true;
    console.log(playing);
    startSound();
  }

  else {
    playing = false;
    console.log(playing);
    stopSound();
  }

});


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


});



});

