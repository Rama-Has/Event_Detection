window.onload = async function () {};

var baseLayer = L.tileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
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
/*New heat end*/

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
    heatmapLayer.setData(
      (testData = {
        data: data,
      })
    );
  });
}

$(document).ready(async function () {
  $("#searchButton")[0].addEventListener("click", getPoints);
});
