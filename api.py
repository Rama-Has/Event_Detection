from fastapi import Request, FastAPI, Form 
from fastapi.templating import Jinja2Templates 
from fastapi.staticfiles import StaticFiles
from http import HTTPStatus
import uvicorn
import json 
from typing import Dict
import logging
from typing import Union
from elasticsearch import Elasticsearch
from pydantic import BaseModel

# logging.config.fileConfig('logging.conf', disable_existing_loggers=False)

#connect to elasticsearch
es_connection = Elasticsearch("http://localhost:9200") 

#define a template object           
templates = Jinja2Templates(directory="templates")
             
#get retreived docs from elasticsearch 
def retreived_docs(query_fields, es_connection):
    """
    """
    documents = es_connection.search(
        body = { 
            "size": 1000, 
            "query": {
                "bool": {
                    "must":
                    [
                        {
                            "fuzzy":{
                                "text":{
                                    "value": query_fields['text'],
                                    "fuzziness": "AUTO",
                                }
                            }
                        }, 
                        {
                            "range": {
                                "created_at": {
                                    "gte": query_fields['date_gte'],
                                    "lte": query_fields['date_lte'] 
                                }
                            }
                        },      
                        {
                            "geo_distance": {
                                "distance": (str(query_fields['distance'])+ "km"),       
                                "coordinates": 
                                    [
                                        float(query_fields['lng']),
                                        float(query_fields['lat'])
                                    ] 
                            }
                        }
                    ]
                }
            }
        },
    )     
    return documents
 
#get the elasticsearch response and return the coordinates matrix 
def get_coordinates_list(es_response):
    """
    a function to take an elasticsearch response and return 
    dictionaries list each dictionary contains the lat, lng, and score for 
    the given document 
    """
    #define coordinates_score_list which will take the coordinates for each index 
    coordinates_score_list = []
    #a loop to get all coordinates
    for index in range(len(es_response["hits"]['hits'])):  

        coordinates_dict = {}            
        coordinates = es_response["hits"]['hits'][index]['_source']['coordinates']['coordinates'] 
        coordinates_dict["score"] = es_response["hits"]['hits'][index]['_score'] 
        coordinates_dict["lat"] = coordinates[1]
        coordinates_dict["lng"] = coordinates[0]
        coordinates_score_list.append(coordinates_dict)
        index = index + 1 
    # [lng, lat] 
    return coordinates_score_list 

def write_respone_data(coordinates):
    """
    write the coordinates and score list to the json file 
    """
    with open('./static/mapData/data.json', 'w') as file:
        json.dump(coordinates, file)

         
app = FastAPI() 
app.mount("/static", StaticFiles(directory="static"), name="static")
 

@app.get('/')  
def _search_view(request: Request):
    return templates.TemplateResponse("index.html", {
    "request": request, 
    }) 
  
@app.get('/search')
async def  _get_docs(request: Request) -> Dict:  
    params = request.query_params.items()
    params = dict(params) 
    # params = await request.body()
    # params = json.load(params)
    docs = retreived_docs(params) 
    coordinates = get_coordinates_list(docs)
    alert = " "
    if len(coordinates) == 0:
        alert = "Your query has no results."

    # write_respone_data(coordinates)  
    # return templates.TemplateResponse( 
    #     "results.html",   
    return {
        # "request": request,
        "alert": alert,
        "coordinates": coordinates
    } 
    # )   
 



 