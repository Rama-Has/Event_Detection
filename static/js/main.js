window.onload = async function () {};
function get_suggesstion(e) {
  console.log(e.target.value);
}
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
/**
 * Check if the required field is filled in and other fields is
 * filled if it depends on another field
 */
function checkFilledData() {
  text = $("#text")[0].value;
  date_gte = $("#date_gte")[0].value;
  date_lte = $("#date_lte")[0].value;
  lat = $("#lat")[0].value;
  lng = $("#lng")[0].value;
  distance = $("#distance")[0].value;
    /** check if the text field is empty*/
  if (!text) {
    window.alert("Please fill the field");
    return false;
  }
  /**Check if the range of date has a missing part (upper date or lower data) */
  if ((date_gte && !date_lte) || (!date_gte && date_lte)) {
    window.alert("Please fill the two dates");
    return false;
  }
  /**Check if one of the coordinates is empty */
  if (lat) {  
    // (lat && !lng) || (!lat && lng)
      window.alert("Please fill the lat and lng fields, you can fill them by clicking on the map");
      return false; 
  }
  if(!(distance)){
    /**Check if the distance is empty or not*/
    window.alert("Please fill in the distance field");
    return false;
  }
  return true;
}
function getFormData() {
  // if (checkFilledData()) {
    let formData = {
      text: $("#text")[0].value,
      date_gte: $("#date_gte")[0].value,
      date_lte: $("#date_lte")[0].value,
      lat: $("#lat")[0].value,
      lng: $("#lng")[0].value,
      distance: $("#distance")[0].value,
     };
    return formData;
// }
  // else {
  //   return false;
  // }
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
      if (res.alert) {
        window.alert(
          "Your query has no results, please try with another fields"
        );
      } else {
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

//Fill location inputs by clicking on the map
function onMapClick(e) {
  let latlng = e.latlng;
  $("#lat")[0].value = latlng.lat;
  $("#lng")[0].value = latlng.lng;
}
//Fill location inputs by clicking on the map
map.on("click", onMapClick);

$(document).ready(async function () {
  // event.preventDefault();
  $("#searchButton")[0].addEventListener("click", getPoints);
  $("#text")[0].addEventListener("input", get_suggesstion);
});

 