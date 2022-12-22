import json
#get retrieved docs from elasticsearch 
def retrieved_docs(query_fields_value, es_connection):
    """  
    
    """ 
    documents = es_connection.search(
        index = "tweets_with_mapping2",  
        body = { 
            "size": 1000, 
            "query": {
                "bool": {
                    "must":
                    [
                        {
                            "fuzzy":{
                                "text":{
                                    "value": query_fields_value['text'],
                                    "fuzziness": "AUTO",
                                }
                            }
                        }, 
                        {
                            "range": {
                                "created_at": {
                                    "gte": query_fields_value['date_gte'],
                                    "lte": query_fields_value['date_lte'] 
                                }
                            }
                        },      
                        {
                            "geo_distance": {
                                "distance": (str(query_fields_value['distance'])+ "km"),       
                                "coordinates": 
                                    [
                                        float(query_fields_value['lng']),
                                        float(query_fields_value['lat'])
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
    function to take an elasticsearch response and return 
    dictionaries list each dictionary contains the lat, lng, and score for 
    the given documents
    """
    
    # define coordinates_score_list a list of dictionaries each dictionary contains the 
    # coordiantes and the score for each document
    coordinates_score_list = []
    #a loop to get all coordinates and scores 
    for index in range(len(es_response["hits"]['hits'])):  
        # define coordinates_score_dict a dictionry for each document, it will contain the lat, lng and score 
        coordinates_score_dict = {}         
        coordinates_score_dict["score"] = es_response["hits"]['hits'][index]['_score'] 
        coordinates = es_response["hits"]['hits'][index]['_source']['coordinates']['coordinates'] 
        coordinates_score_dict["lat"] = coordinates[1]
        coordinates_score_dict["lng"] = coordinates[0]
        #append the dictionary to the list
        coordinates_score_list.append(coordinates_score_dict)
        index = index + 1  
    return coordinates_score_list 


def get_tweet_text(es_response):
    """
    function to take an elasticsearch response and return 
    a list each item present the text(content) of each tweet 
    """
    #define tweet_text_lis, a list contains tweets text 
    tweet_text_list = [] 
    for index in range(len(es_response["hits"]['hits'])): 
        #get the text(content)   
        tweet_text = es_response["hits"]['hits'][index]['_source']['text']  
        #append the text to tweet_text_list
        tweet_text_list.append(tweet_text)
        index = index + 1 
    # return tweet_text_list    
    return tweet_text_list 