'use strict';


$(function(){

document.write('hello!');
var audioCtx = new window.AudioContext();
var soundBuffer, soundSource;
//var conUrl ='http://thingsinjars.com/lab/web-audio-tutorial/hello.mp3';
var playing = false;
var musicUrl = "audio/piano_sample.ogg";
var conUrl = 'audio/Church-Schellingwoude.mp3';


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

function playSound() {

  soundSource.start();


}

function stopSound() {

  soundSource.stop();
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

function audioGraph(audioData) {
  var convolver;

  soundSource = audioCtx.createBufferSource();
  audioCtx.decodeAudioData(audioData, function(soundBuffer){
    soundSource.buffer = soundBuffer;

    convolver = audioCtx.createConvolver();

    //WIRING

    soundSource.connect(convolver);
    convolver.connect(audioCtx.destination);

    //load convolution response

    setReverbImpulseResponse(conUrl, convolver, playSound);

    });

  }

function setReverbImpulseResponse(url, convolver, callback) {

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = "arraybuffer";

  request.onload = function(){
    audioCtx.decodeAudioData(request.response, function(convolverBuffer) {
      convolver.buffer = convolverBuffer;
      callback();

    });

  };
  request.send();
}




});

