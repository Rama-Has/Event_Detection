from fastapi import Request, FastAPI, Form 
from fastapi.templating import Jinja2Templates 
from fastapi.staticfiles import StaticFiles
from http import HTTPStatus 
from typing import Dict 
from elasticsearch import Elasticsearch 
from src.utils import retreived_docs, get_coordinates_list, get_tweet_text 

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
    params = request.query_params.items()
    params = dict(params)  
    docs = retreived_docs(params, es_connection) 
    coordinates = get_coordinates_list(docs)
    tweets_text = get_tweet_text(docs)
    alert = False
    if len(coordinates) == 0:
        alert = True
   
    return { 
        "alert": alert,
        "coordinates": coordinates,
        "text_list": tweets_text,
    }  
 