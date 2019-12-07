var JSONPARSER = require('json-parser');
var JSONIFY = require('json-stringify');
var propertiesreader = require('properties-reader');
require('dotenv').config();

function formatter (body) {
  //=====================================================
  //Contains special formatting requirements specific to that API
  //=====================================================
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  var result = {};
  var jsonParsedResult = JSONPARSER.parse(body);
  result.length = jsonParsedResult.d.results.toString().length;
  if (result.length != 0){
    result.responseCode = __HTTP_SUCCESS__;
    result.formattedBody = JSONIFY(jsonParsedResult.d);
    console.log("responseCode: " + result.responseCode);
  }else{
    result.responseCode = __HTTP_DATA_NOT_FOUND__;
    console.log("responseCode: " + result.responseCode);
  }
  return result;
}

module.exports.formatter = formatter;
