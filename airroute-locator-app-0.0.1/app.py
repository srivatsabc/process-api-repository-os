from flask import Flask
from flask import jsonify
from flask import request
from flask import Response
from objdict import ObjDict
import requests
import json
import os
import configparser

app = Flask(__name__)

envType = os.environ['RUNTIME_ENV_TYPE']
print ("RUNTIME_ENV_TIME : " + envType)
config = configparser.RawConfigParser()
config.read('app.properties')

@app.route('/', methods=['GET'])
def hello_world():
    return jsonify({'message' : 'Hello, World!'})

@app.route('/processapi/v1/airroute/<string:city>', methods=['GET'])
def returnAirportInfo(city):
    api_url = config.get(envType, envType + '.airport.locator.url') + city
    print('api_url : ' + api_url)
    airport_response = requests.get(api_url)
    #print("aiport api content : " + str(airport_response.text))
    airport_response_json = json.loads(airport_response.text)

    data = {}
    x = 0;
    for i in airport_response_json:
        print("IATA : " + i["iata"])
        api_url = config.get(envType, envType + '.route.locator.url') +  i["iata"]
        print('api_url : ' + api_url)
        route_response = requests.get(api_url)
        #print("route api content : " + route_response.text)
        route_response_json = json.loads(route_response.text)
        data[x] = {}
        data[x]['airport'] = i;
        data[x]['airport']['routes'] = route_response_json
        x += 1

    x = 0;
    json_data = json.dumps(data)
    return Response(json_data, mimetype='application/json')

    #return jsonify(json_data)

if __name__ == "__main__":
    app.run("0.0.0.0", port=8085, debug=True)
