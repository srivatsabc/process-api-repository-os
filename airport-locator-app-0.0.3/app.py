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

#Overloaded returnError method for error handling
def returnError(httpErrorCode, iata, api, error=None):
    print('httpErrorCode: ' + str(httpErrorCode))
    #endpoint_url = config.get(envType, envType + '.' + api + '.endpoint.url') + iata
    outputroot = json.loads(config.get(envType, str(httpErrorCode) + '.error.message'))
    outputroot['error']['endpoint'] = api
    if not error is None:
        outputroot['error']['message'] = error
    outputroot_json = json.dumps(outputroot)
    return outputroot_json

@app.route('/processapi/v3/airports/iata', methods=['GET'])
def returnAirportError():
    try:
        raise IATAException
    except IATAException:
        error = returnError(400, "<NULL>", "/processapi/v3/airports/iata")
        return Response(error, status=400, mimetype='application/json')

@app.route('/processapi/v3/airports/iata/<string:iata>', methods=['GET'])
def returnAirportInfo(iata):
    outputroot = {}
    #Validate IATA
    try:
        if len(iata) > 3:
            raise IATAException
        elif len(iata) < 3:
            raise IATAException
        elif not iata.isalpha():
            raise IATAException
    except IATAException:
        error = returnError(400, iata)
        return Response(error, status=400, mimetype='application/json')
    else:
        #If IATA Valid - Call the first system API on SAP Hana Cloud
        try:
            api = config.get(envType, envType + '.airport.locator.url') + iata
            print('api_url : ' + api)
            airport_response = requests.get(api, timeout=5.0)
            airport_response_json = json.loads(airport_response.text)

            #Remove unwated medata field from SAP Hana Response
            airport_response_json ["results"][0].pop('__metadata')
        #Handle exceptions
        except requests.exceptions.HTTPError as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.ConnectionError as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.Timeout as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.ConnectTimeoutError as error:
           error = returnError(504, iata, api, str(error))
           return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.RequestException as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except:
            #Error Handler
            error = returnError(airport_response.status_code, iata, api)
            return Response(error, status=airport_response.status_code, mimetype='application/json')

        #If API1 successfull - Call the second system API on IBM APP Connect
        try:
            #Get from country-locator-app-0.0.1
            countryCode = str(airport_response_json ["results"][0]["iso_country"])
            print("Country Code: " + str(airport_response_json ["results"][0]["iso_country"]));
            api = config.get(envType, envType + '.country.locator.url') + countryCode
            print('country_locator_api_url : ' + country_locator_api_url)
            country_response = requests.get(api)
            country_response_json = json.loads(country_response.text)

            #Prepare Response
            outputroot['result'] = airport_response_json ["results"][0];
            outputroot['result']['iso_country'] = country_response_json ["result"]
        #Handle exceptions
        except requests.exceptions.HTTPError as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.ConnectionError as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.Timeout as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except requests.exceptions.ConnectTimeoutError as error:
           error = returnError(504, iata, api, str(error))
        except requests.exceptions.RequestException as error:
            error = returnError(504, iata, api, str(error))
            return Response(error, status=504, mimetype='application/json')
        except:
            #Error Handler
            error = returnError(airport_response.status_code, iata, api)
            return Response(error, status=airport_response.status_code, mimetype='application/json')
        #Convert to JSON
        outputroot_json = json.dumps(outputroot)
        return Response(outputroot_json, mimetype='application/json')

class Error(Exception):
   """Base class for other exceptions"""
   pass

class IATAException(Error):
   """Raised when the input IATA length is greater than 3"""
   pass

if __name__ == "__main__":
    app.run("0.0.0.0", port=9031, debug=True)
