'use strict';


$(function(){

document.write('hello!');


var audioCtx = new window.AudioContext();
var buf, source;

var playing = false;


var url = "audio/piano_sample.ogg";
var convolver = audioCtx.createConvolver();


// function getStream(stream) {
//   var mediaStreamSource = audioCtx.createMediaStreamSource(stream);
//   mediaStreamSource.connect(audioCtx.destination);
// }
loadSound(url);

// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
// navigator.getUserMedia({audio: true}, getStream, error);

// function error() {
//   alert('stream generation failed.');
// }

function loadSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {

    audioCtx.decodeAudioData(request.response, function(buffer) {
      buf = buffer;
      source = audioCtx.createBufferSource();
      source.buffer = buf;
      source.connect(convolver);
      convolver.connect(audioCtx.destination);
    });
  };

    request.send();

}

function playSound(buffer) {

convolver.buffer = source.buffer;

source.start(0);
  // source.connect(audioCtx.destination);
  // source.start(0);

}




$(document).keypress(function(e) {

console.log(e.charCode);
  if (e.charCode == 32 && playing === false) {
    playing = true;
    console.log(playing);
    playSound();
  }

  else if (e.charCode == 32 && playing === true) {
    playing = false;
    console.log(playing);
    source.stop();
  }

  else if (e.charCode == 18) {
    sample.togglePlayback();
  }


});

//effect -- convolver



// source.connect(effect);
//source.connect(audioCtx.destination);



});

