'use strict';


$(function(){

document.write('hello!');


var audioCtx = new window.AudioContext();
var buf, source;

var playing = false;


var url = "audio/piano_sample.ogg";


function getStream(stream) {
  var mediaStreamSource = audioCtx.createMediaStreamSource(stream);
  mediaStreamSource.connect(audioCtx.destination);
}

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

function playSound(buffer) {
  source = audioCtx.createBufferSource();
  source.buffer = buf;
  source.connect(audioCtx.destination);
  source.start(0);

}

loadSound(url);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia({audio: true}, getStream, error);

function error() {
  alert('stream generation failed.');
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

//effect -- moog filter

var bufferSize = 4096;
var effect = (function() {
    var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    var in1, in2, in3, in4, out1, out2, out3, out4;
    in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
    node.cutoff = 0.065; // between 0.0 and 1.0
    node.resonance = 3.99; // between 0.0 and 4.0
    node.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        var f = node.cutoff * 1.16;
        var fb = node.resonance * (1.0 - 0.15 * f * f);
        for (var i = 0; i < bufferSize; i++) {
            input[i] -= out4 * fb;
            input[i] *= 0.35013 * (f*f)*(f*f);
            out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
            in1 = input[i];
            out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
            in2 = out1;
            out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
            in3 = out2;
            out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
            in4 = out3;
            output[i] = out4;
        }
    }
    return node;
})();
// source.connect(effect);
//source.connect(audioCtx.destination);



});

