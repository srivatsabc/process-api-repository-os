var express = require('express');
const bodyParser = require('body-parser');
var app = express();
var request = require('request');

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())

app.get('/hello/:name', function (req, res) {
  console.log("name: " + req.params.name.toUpperCase());
  res.status(200).json({'Hello Good Boy': req.params.name.toUpperCase()});
})

var server = app.listen(8080, function () {
   console.log("Example app listening at http on tcp/8080")
})
