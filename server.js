var express = require('express');
var app = express();

app.use(express.static('app'));

if (!module.parent) {
  var port = 3000;
  app.listen(port);
  console.log("Express app started on port: " + port);
}
