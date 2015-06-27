'use strict';


$(function(){

document.write('hello!');


var audioCtx = new window.AudioContext();
var buf, source;
var playing = false;


var url = "audio/piano_sample.ogg";

function loadSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {

    audioCtx.decodeAudioData(request.response, function(buffer) {
      buf = buffer;
      //playSound();
    });
  };

    request.send();

}

function playSound() {
  source = audioCtx.createBufferSource();
  source.buffer = buf;
  source.connect(audioCtx.destination);
  source.start(0);

}

loadSound(url);


$(document).keypress(function(e) {

console.log(e.charCode);
  if (e.charCode == 32 && playing === false) {
    playing = true;
    playSound();
  }

  else if (e.charCode == 32 && playing === true) {
    playing = false;
    source.stop();
  }
});


});

