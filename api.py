from fastapi import Request, FastAPI, Form 
from fastapi.templating import Jinja2Templates 
from fastapi.staticfiles import StaticFiles
from http import HTTPStatus 
from typing import Dict 
from elasticsearch import Elasticsearch 
from src.utils import retrieved_documents, get_coordinates_list, get_tweet_text 

#connect to elasticsearch
es_connection = Elasticsearch("http://localhost:9200") 

#define a template object           
templates = Jinja2Templates(directory="templates")
  
app = FastAPI() 
app.mount("/static", StaticFiles(directory="static"), name="static")
 

@app.get('/')  
def _search_view(request: Request):
    return templates.TemplateResponse("index.html", {
    "request": request, 
    }) 
  
@app.get('/search')
async def  _get_docs(request: Request) -> Dict:  
    """
    Return a response contains a coordinates list of dictionaries that contains the lat, lng, 
    score for each retrieved documents
    """
    params = request.query_params.items()
    params = dict(params)  
    docs = retrieved_documents(params, es_connection, "tweets_with_mapping2") 
    coordinates = get_coordinates_list(docs)
    tweets_text = get_tweet_text(docs)
    alert = False
    #Check if the query respone has no documents
    if len(coordinates) == 0:
        alert = True
   
    return { 
        "message": HTTPStatus.OK.phrase,
        "status-code": HTTPStatus.OK, 
        "alert": alert,
        "coordinates": coordinates,
        "text_list": tweets_text,
    }  
 