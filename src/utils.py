import json
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
    return coordinates_score_list 


def get_tweet_text(es_response):
    tweet_text_list = []
    #a loop to get all coordinates
    for index in range(len(es_response["hits"]['hits'])):    
        tweet_text = es_response["hits"]['hits'][index]['_source']['text']  
        tweet_text_list.append(tweet_text)
        index = index + 1  
    return tweet_text_list 



# def write_respone_data(coordinates):
#     """
#     write the coordinates and score list to the json file 
#     """
#     with open('./static/mapData/data.json', 'w') as file:
#         json.dump(coordinates, file)

