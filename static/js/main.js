window.onload = async function () {};

var baseLayer = L.tileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    drawControl: true,
    attribution: "...",
    maxZoom: 20,
  }
);
var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  radius: 40,
  maxOpacity: 1,
  // scales the radius based on map zoom
  scaleRadius: false,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  useLocalExtrema: true,
  // which field name in your data represents the latitude - default "lat"
  latField: "lat",
  // which field name in your data represents the longitude - default "lng"
  lngField: "lng",
  // which field name in your data represents the data value - default "value"
  valueField: "score",
  // gradient: {
  //   0.15: "rgb(0,0,255)",
  //   0.35: "rgb(0,255,255)",
  //   0.65: "rgb(0,255,0)",
  //   0.95: "yellow",
  //   0.99: "rgb(255,0,0)",
  // },
};

var heatmapLayer = new HeatmapOverlay(cfg);

var map = new L.Map("map-canvas", {
  center: new L.LatLng(25.6586, -80.3568),
  zoom: 2,
  layers: [baseLayer, heatmapLayer],
});
let data = [];
heatmapLayer.setData(
  (testData = {
    data: data,
  })
);

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
    // check if the coonrdinates list doesnot contain data 
    if(res.alert){
      $("#alertContainer")[0].classList.remove("d-none")
    }else{  
      $("#alertContainer")[0].classList.add("d-none")
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
        color: 'hsl(0deg 0% 100% / 0%)',
        fillColor: 'hsl(0deg 0% 100% / 0%)',
        fillOpacity: 0,
        radius: 20000,
      }).addTo(map);
      circle.bindPopup(text_list[i]);
    }
  });
}

//Fill location inputs by clicking on the map
function onMapClick(e) {
  let latlng = e.latlng;
  $("#lat")[0].value = latlng.lat;
  $("#lng")[0].value = latlng.lng;
}
//Fill location inputs by clicking on the map
map.on("click", onMapClick);

$(document).ready(async function () {
  $("#searchButton")[0].addEventListener("click", getPoints);
    // FeatureGroup is to store editable layers
    // var drawnItems = new L.FeatureGroup();
    // map.addLayer(drawnItems);
    // var drawControl = new L.Control.Draw({
    //     edit: {
    //         featureGroup: drawnItems
    //     }
    // });
    // map.addControl(drawControl);
});


// var map = L.map('map', {}).setView([51.505, -0.09], 13);
// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// /**Display tweet text after clicking on its coordinates */
// let popup = L.popup();

// function onMapClick() {
//   popup
//     .setLatLng([data[i].lng, data[i].lng])
//     .setContent(res[i].text)
//     .openOn(map);
// }
// map.on("click", onMapClick);



/*Draw a circle while chnging the distance input */
//  const distance_value = $('#distance')[0]; 
//  let radius = 0
//  let distance_circle = L.circle([$("#lat")[0].value, $("#lng")[0].value], {
//    color: 'red',
//    fillColor: 'red',
//    fillOpacity: 0.7,
//    radius: radius * 1000,
//  }) 
//  distance_value.addEventListener('input', updateValue);
//  function updateValue(e) {
//    radius = e.target.value 
//    distance_circle.radius = e.target.value
//    .addTo(map); 
//  }
/*Draw a circle while chnging the distance input end*/

