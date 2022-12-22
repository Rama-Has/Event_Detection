//define baselayer the base(first) layer to the map
var baseLayer = L.tileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    drawControl: true, 
    maxZoom: 20,
  }
);

//define configurations 
var configurations = {
  //Set point radius to 40
  radius: 40,
  //Set the maximum opacity to 1 for the point that has the highest score
  maxOpacity: 1,
  // Set scaleRadius to false to prevent scaling the radius based on map zoom
  scaleRadius: false, 
  //Set useLocalExtrema to true to colorize points according to current map boundaries 
  useLocalExtrema: true,   
  //Change default values of the follwing variables according to the data I want to send to the map  
  latField: "lat", 
  lngField: "lng",
  valueField: "score", 
};


//define heatmap layer (a heatmap HeatmapOverlay object) 
//the second layer of the map which will display the points according
//to the retrieved documents coordinates and score based on user's search  
var heatmapLayer = new HeatmapOverlay(configurations);

//Initiate a map object  
var map = new L.Map("map-canvas", {
  center: new L.LatLng(25.6586, -80.3568),
  //Set initial map zoom to 2
  zoom: 2,
  //Add the predefiend two layers to the map 
  layers: [baseLayer, heatmapLayer],
});
//Initiate data, an empty list as a default value.
//date will be used later on sending the retreived coordinates to the heatmap layer
let data = [];  
  
//Define getFormData function to get a dictionary of the required fields and it's values
//which will be sent to the query  
function getFormData() {
  let formData = {
    text: $("#text")[0].value,
    date_gte: $("#date_gte")[0].value,
    date_lte: $("#date_lte")[0].value,
    lat: $("#lat")[0].value,
    lng: $("#lng")[0].value,
    distance: $("#distance")[0].value,
    };
  return formData; 
}

//Define getPoints, a function that will send the request to get the
//coordinates, score and the text of retreived tweets  
async function getPoints() { 
    let formData = getFormData();
    let points = await fetch(
      "/search?text=" +
        formData.text +
        "&date_gte=" +
        formData.date_gte +
        "&date_lte=" +
        formData.date_lte +
        "&lat=" +
        formData.lat +
        "&lng=" +
        formData.lng +
        "&distance=" +
        formData.distance
    ).then(async (response) => {
      res = await response.json();
      data = res.coordinates;
      //Check if alert is true so the query has no result, send an alert message to the user  
      if (res.alert) {
        window.alert(
          "Your query has no results, please try with another fields"
        );
      } else {
        //Pass the data to the heatmap layer so the result will be visible to the user
        heatmapLayer.setData(
          (testData = {
            data: data,
          })
        );
      }
      /**add invisble circles to access tweet content */
      let text_list = res.text_list;
      for (let i = 0; i < text_list.length; i++) {
        var circle = L.circle([data[i].lat, data[i].lng], {
          color: "hsl(0deg 0% 100% / 0%)",
          fillColor: "hsl(0deg 0% 100% / 0%)",
          fillOpacity: 0,
          radius: 20000,
        }).addTo(map);
        circle.bindPopup(text_list[i]);
      }
    }); 
}

//Define onMapClick a function to 
//fill location inputs by clicking on the map
function onMapClick(e) {
  let latlng = e.latlng;
  $("#lat")[0].value = latlng.lat;
  $("#lng")[0].value = latlng.lng;
}
//fill location inputs by clicking on the map
map.on("click", onMapClick);

$(document).ready(async function () { 
  $("#searchButton")[0].addEventListener("click", getPoints); 
});

 