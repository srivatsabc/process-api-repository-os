var express = require('express');
var app = express();
var swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
var propertiesreader = require('properties-reader');
require('dotenv').config();
var properties = propertiesreader(process.env.APP_PROPERTIES);
var __CACHE_KEY__ = properties.get('global_CACHE_KEY');
const uuidv4 = require('uuid/v4');
var dateFormat = require('dateformat');
var cache = require('memory-cache');
const zlib = require('zlib');
var request = require('request');
let header = require('./utils/header');
let jsonUtils = require('./utils/jsonUtils');

const url = require('url');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/v2/airports', function (req, res) {
  console.log("\n");
  var limit = req.query.limit;
  if (isNaN(limit)) {
    limit = 1000;
  }
  if (limit <= 0){
    limit = 1000;
  }
  geocodeLocator.getEndpoint('no_filter', limit, req, res);
})

app.get('/v2/airports/iata/:iata_code', function (req, res) {
  var __CACHE_TIMEOUT__ = Number(properties.get('iata_filter' + '_CACHE_TIMEOUT'));
  let key = __CACHE_KEY__ + req.originalUrl || req.url;
  var __HTTP_SERVICE_NOT_FOUND__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_CONNECTION_REFUSED__ = Number(properties.get('global_HTTP_CONNECTION_REFUSED'));
  var __HTTP_NOT_FOUND__ = Number(properties.get('global_HTTP_NOT_FOUND'));
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  console.log("\n");
  httpGet('iata_filter', req.params.iata_code.toUpperCase(), req, res, function(formatterResults){
    if(formatterResults.length == 0){
      var body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
      res = header.setHeaders(res, __HTTP_DATA_NOT_FOUND__);
      zlib.gzip(body, function (_, result){
        res.end(result);
      });
    }else if(formatterResults.responseCode == __HTTP_CONNECTION_REFUSED__){
      res = header.setHeaders(res, __HTTP_CONNECTION_REFUSED__);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
      });
    }else if(formatterResults.length !=0 && formatterResults.responseCode != __HTTP_SUCCESS__){
      console.log("Sending Error Status: " + formatterResults.responseCode);
      res = header.setHeaders(res, formatterResults.responseCode);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
      });
    }else{
      res = header.setHeaders(res, formatterResults.responseCode);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
        cache.put(key, result, __CACHE_TIMEOUT__);
      });
    }
  });
})

app.get('/v2/airports/country/:country_code', function (req, res) {
  var __CACHE_TIMEOUT__ = Number(properties.get('iata_filter' + '_CACHE_TIMEOUT'));
  let key = __CACHE_KEY__ + req.originalUrl || req.url;
  var __HTTP_SERVICE_NOT_FOUND__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_CONNECTION_REFUSED__ = Number(properties.get('global_HTTP_CONNECTION_REFUSED'));
  var __HTTP_NOT_FOUND__ = Number(properties.get('global_HTTP_NOT_FOUND'));
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  console.log("\n");
  httpGet('country_filter', req.params.country_code.toUpperCase(), req, res, function(formatterResults){
    if(formatterResults.length == 0){
      var body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
      res = header.setHeaders(res, __HTTP_DATA_NOT_FOUND__);
      zlib.gzip(body, function (_, result){
        res.end(result);
      });
    }else if(formatterResults.responseCode == __HTTP_CONNECTION_REFUSED__){
      res = header.setHeaders(res, __HTTP_CONNECTION_REFUSED__);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
      });
    }else if(formatterResults.length !=0 && formatterResults.responseCode != __HTTP_SUCCESS__){
      console.log("Sending Error Status: " + formatterResults.responseCode);
      res = header.setHeaders(res, formatterResults.responseCode);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
      });
    }else{
      res = header.setHeaders(res, formatterResults.responseCode);
      zlib.gzip(formatterResults.formattedBody, function (_, result){
        res.end(result);
        cache.put(key, result, __CACHE_TIMEOUT__);
      });
    }
  });
})

var server = app.listen(8084, function () {
   console.log("Example app listening at http on tcp/8084")
})

function httpGet(reqType, reqValue, req, res, callback) {
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  let key = __CACHE_KEY__ + req.originalUrl || req.url;
  let cachedBody = cache.get(key)
  if (cachedBody){
    console.log("Responding from cache ..")
    res = header.setHeaders(res, __HTTP_SUCCESS__);
    res.end(cachedBody);
  }else{
    var statusCode = 0;
    console.log("Going to backend ..")
    var __HTTP_SERVICE_NOT_FOUND__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
    var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
    var __HTTP_CONNECTION_REFUSED__ = Number(properties.get('global_HTTP_CONNECTION_REFUSED'));
    var __HTTP_NOT_FOUND__ = Number(properties.get('global_HTTP_NOT_FOUND'));
    var __USERNAME__ = properties.get(reqType + '_user');
    var __PASSWORD__ = properties.get(reqType + '_password');
    var __SOURCE_URL__ = req.protocol + "://" + req.get('host') + req.originalUrl;
    var __TARGET_URL__ = properties.get(reqType + '_endpoint').replace(properties.get(reqType + '_replaceString'), reqValue)
    var start = new Date();
    request.get({
      url: __TARGET_URL__,
      headers: {
        'Authorization': 'Basic ' + new Buffer.from(__USERNAME__ + ':' + __PASSWORD__).toString('base64')
      },
      gzip: true
    }, function(error, response, body) {
          if (!error && response.statusCode == __HTTP_SUCCESS__) {
            //=====================================================
            //Special Formatting Begins
            var formatterResults = jsonUtils.formatter(body)
            //Special Formatting Ends
            //=====================================================
            callback(formatterResults);
          }else {
             var formatterResults = {};
             if(error != null && error.toString().includes(properties.get('HTTP_CONNECTION_REFUSED_Error_Message'))){
                formatterResults.responseCode = __HTTP_CONNECTION_REFUSED__;
                formatterResults.formattedBody = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
                callback(formatterResults);
              }else{
                console.log("Sending Error Status: " + response.statusCode);
                formatterResults.responseCode = response.statusCode;
                formatterResults.formattedBody = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', response.statusCode).replace('MESSAGE', properties.get(response.statusCode + '_msg')).replace('STATUS', properties.get(response.statusCode + '_msg_status'));
                callback(formatterResults);
              }
          }
      }
    );
  }
}
