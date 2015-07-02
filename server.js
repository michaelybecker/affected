'use strict';


var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static('app'));

app.listen(port, function() {
  console.log('server available at http://localhost:' + port);
});

app.get('/', function(req, res) {
  res.sendFile('index.html');

});
