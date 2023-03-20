"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var d3 = _interopRequireWildcard(require("d3"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// définir les dimensions de la carte
var width = 960;
var height = 600;
var selectedCountry = null;
var selectedYear = "2021"; // Initialiser la variable pour stocker l'année sélectionnée

// créer une projection pour la carte
var projection = d3.geoOrthographic().scale(250).translate([width / 2, height / 2]).clipAngle(90);

// créer un chemin pour les frontières des pays
var path = d3.geoPath().projection(projection);

// créer un élément SVG pour la carte
var svg = d3.select("#map-container").append("svg").attr("width", width).attr("height", height);

// Étape 2: Créer une échelle de couleur pour les émissions de CO2
// Créer une échelle de couleur du bleu au rouge
var colorScale = d3.scaleSequential(d3.interpolateRgb("blue", "red")).domain([0, 10000]);

// Appliquer une transformation logarithmique à l'échelle de couleur
colorScale = d3.scaleLog().base(10).clamp(true).domain([Math.max(1, 0), 10000]).range([colorScale(0), colorScale(10000)]);

// charger les données CSV et GeoJSON en même temps
Promise.all([d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/main/dataset/GCB2022v27_MtCO2_flat.csv"), d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/feature/globe-3d/src/data/countries-land-10km.geo.json")]).then(function (values) {
  // extraire les données à partir des valeurs résolues
  var co2Emissions = values[0];
  //console.log(co2Emissions)
  var world = values[1];

  // Création de la timeline
  var years = co2Emissions.map(function (e) {
    return e.Year;
  });
  var minYear = Math.min.apply(Math, _toConsumableArray(years));
  var maxYear = Math.max.apply(Math, _toConsumableArray(years));
  createYearInput(minYear, maxYear);

  // créer un groupe pour les frontières des pays
  var countries = svg.append("g").attr("class", "countries");

  // ajouter les frontières des pays au groupe
  countries.selectAll("path").data(world.features).enter().append("path").attr("d", path).attr("class", "country")
  // Mettre à jour la couleur des pays en fonction des émissions de CO2
  .attr("fill", function (d) {
    var emissionData = co2Emissions.find(function (e) {
      return e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === "2021";
    });
    if (emissionData) {
      //console.log(emissionData.Total)
      if (emissionData.Total === "0") {
        return "lightgray"; // Si les données d'émissions sont égales à 0, le pays sera transparent
      } else {
        return colorScale(emissionData.Total);
      }
    } else {
      return "lightgray";
    }
  }).on("click", function (event, d) {
    event.stopPropagation();

    // Modifier l'opacité des autres pays
    svg.selectAll("path").attr("opacity", function (pathD) {
      return pathD === d ? 1 : 0.2;
    });
    if (selectedCountry && selectedCountry === d) {
      return; // Ne fait rien si le pays sélectionné est déjà centré
    }

    // Mise à jour du pays sélectionné
    selectedCountry = d;

    // Obtenir le centre du pays sélectionné
    var center = getCountryCenter(d, projection);

    // Appliquer la rotation à la projection pour centrer le pays
    projection.rotate(center);

    // Obtenir les limites du pays sélectionné
    var bounds = getBounds(d.geometry, projection);
    //console.log(bounds);

    // Obtenir l'échelle optimale pour le pays sélectionné
    var optimalScale = getOptimalScale(bounds, width, height);
    //console.log(optimalScale);

    // Ajuster l'échelle de la projection pour zoomer sur le pays
    projection.scale(optimalScale * 100);

    // Mettre à jour le chemin pour refléter la nouvelle projection
    svg.selectAll("path").attr("d", path);

    // Afficher le graphique des émissions de CO2 pour le pays sélectionné
    updateChart(d.properties.A3, co2Emissions);
  });

  // ajouter une interaction pour faire tourner la carte
  svg.call(d3.drag().on("drag", function (event) {
    var rotate = projection.rotate();
    // Calculer un facteur de vitesse en fonction de l'échelle actuelle de la projection
    var speedFactor = 1 + projection.scale() / 100;
    // Appliquer la rotation en utilisant le facteur de vitesse
    projection.rotate([rotate[0] + event.dx / speedFactor, rotate[1] - event.dy / speedFactor]);
    svg.selectAll("path").attr("d", path);
  }));

  // ajouter une interaction pour zoomer sur la carte
  svg.on("wheel", handleWheel);

  // Gestionnaire d'événements pour le changement de catégorie d'émissions
  d3.select("#emission-category").on("change", function () {
    var selectedCategory = this.value;

    // Mettre à jour la couleur des pays en fonction des émissions de CO2
    svg.selectAll(".country").attr("fill", function (d) {
      var emissionData = co2Emissions.find(function (e) {
        return e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === "2021";
      });
      if (emissionData) {
        //console.log(emissionData.Total)
        if (emissionData.Total === "0") {
          return "lightgray"; // Si les données d'émissions sont égales à 0, le pays sera transparent
        } else {
          return colorScale(emissionData.Total);
        }
      } else {
        return "lightgray";
      }
    });
  });

  // Gestionnaire d'événements pour le changement d'année
  d3.select("#year-input").on("input", function () {
    selectedYear = this.value;
    d3.select("#selected-year").text(selectedYear);

    // Mettre à jour la couleur des pays en fonction des émissions de CO2
    svg.selectAll(".country").attr("fill", function (d) {
      var emissionData = co2Emissions.find(function (e) {
        return e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === selectedYear;
      });
      if (emissionData) {
        //console.log(emissionData.Total)
        if (emissionData.Total === "0") {
          return "lightgray"; // Si les données d'émissions sont égales à 0, le pays sera transparent
        } else {
          return colorScale(emissionData.Total);
        }
      } else {
        return "lightgray";
      }
    });

    // Mettre à jour le graphique si un pays est sélectionné
    if (selectedCountry) {
      updateChart(selectedCountry.properties.A3, co2Emissions);
    }
  });
  d3.select("#animate-btn").on("click", function () {
    animateYears(minYear, maxYear);
  });
});

// Étape 4: Créer une fonction pour mettre à jour le graphique
function updateChart(countryCode, co2Emissions) {
  // Trouver les données d'émission pour le pays et l'année sélectionnés
  var emissionData = co2Emissions.find(function (e) {
    return e["ISO 3166-1 alpha-3"] === countryCode && e.Year === selectedYear;
  });
  if (emissionData) {
    // Mettre à jour le graphique avec les données du pays
    var data = [{
      sector: "Coal",
      value: +emissionData.Coal
    }, {
      sector: "Oil",
      value: +emissionData.Oil
    }, {
      sector: "Gas",
      value: +emissionData.Gas
    }, {
      sector: "Cement",
      value: +emissionData.Cement
    }, {
      sector: "Flaring",
      value: +emissionData.Flaring
    }, {
      sector: "Other",
      value: +emissionData.Other
    }];

    // Étape 6: Créer un élément SVG pour le graphique
    var chartWidth = 500;
    var chartHeight = 300;
    var chartPadding = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 50
    };

    // Afficher la fenêtre modale
    d3.select("#chart-modal").style("display", "block");

    // Supprimer le graphique précédent
    d3.select("#chart-container").selectAll("svg").remove();
    var chartSvg = d3.select("#chart-container").append("svg").attr("width", chartWidth).attr("height", chartHeight);

    // Étape 7: Créer des axes pour le graphique
    var xScale = d3.scaleBand().domain(data.map(function (d) {
      return d.sector;
    })).range([chartPadding.left, chartWidth - chartPadding.right]).padding(0.1);
    var yScale = d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.value;
    })]).range([chartHeight - chartPadding.bottom, chartPadding.top]);
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    chartSvg.append("g").attr("transform", "translate(0, ".concat(chartHeight - chartPadding.bottom, ")")).call(xAxis);
    chartSvg.append("g").attr("transform", "translate(".concat(chartPadding.left, ", 0)")).call(yAxis);

    // Créer des barres pour le graphique
    var bars = chartSvg.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar").attr("x", function (d) {
      return xScale(d.sector);
    }).attr("y", function (d) {
      return yScale(d.value);
    }).attr("width", xScale.bandwidth()).attr("height", function (d) {
      return chartHeight - chartPadding.bottom - yScale(d.value);
    }).attr("fill", "steelblue");

    // Étape 9: Ajouter des transitions
    bars.transition().duration(5000).attr("y", function (d) {
      return yScale(d.value);
    }).attr("height", function (d) {
      return chartHeight - chartPadding.bottom - yScale(d.value);
    });
  } else {
    //console.log("Pas de données pour ce pays");
    // Masquer la fenêtre modale
    d3.select("#chart-modal").style("display", "none");
  }
}
function getCountryCenter(feature, projection) {
  var centroid = d3.geoCentroid(feature);
  return [-centroid[0], -centroid[1]];
}
function getOptimalScale(bounds, width, height) {
  var scaleX = (bounds[1][0] - bounds[0][0]) / width,
    scaleY = (bounds[1][1] - bounds[0][1]) / height,
    scale = 1 / Math.max(scaleX, scaleY);
  return scale * 1.2; // Multiplier par 1.2 pour ajouter un peu d'espace autour du pays
}

function getBounds(geometry, projection) {
  var bounds = d3.geoBounds(geometry),
    topLeft = projection(bounds[0]),
    bottomRight = projection(bounds[1]);
  return [[topLeft[0], bottomRight[1]], [bottomRight[0], topLeft[1]]];
}

// Fonction pour gérer l'événement de la molette de la souris
function handleWheel(event) {
  event.preventDefault();
  var zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
  var currentScale = projection.scale();
  var newScale = currentScale * zoomFactor;
  var scaleLimit = 250;

  // Limiter le zoom maximum et minimum
  if (newScale > scaleLimit * 0.5 && newScale < scaleLimit * 10) {
    projection.scale(newScale);
    svg.selectAll("path").attr("d", path);
  }
}
function createYearInput(minYear, maxYear) {
  d3.select("#timeline-container").append("div").html("\n      <label for=\"year-input\">Ann\xE9e:</label>\n      <input type=\"range\" id=\"year-input\" min=\"".concat(minYear, "\" max=\"").concat(maxYear, "\" step=\"1\" value=\"").concat(maxYear, "\" />\n      <span id=\"selected-year\">").concat(maxYear, "</span>\n    "));
}
function animateYears(minYear, maxYear) {
  var intervalDuration = 20; // Durée en ms entre les mises à jour des années
  var yearInput = document.getElementById("year-input");
  var intervalId = setInterval(function () {
    //console.log(minYear, maxYear);
    if (minYear <= maxYear) {
      //console.log("Année : ", minYear);
      // Mettre à jour la valeur de l'input et déclencher l'événement 'change'
      yearInput.value = minYear;
      yearInput.dispatchEvent(new Event("input"));
      minYear++;
    } else {
      clearInterval(intervalId);
    }
  }, intervalDuration);
}

// Gestionnaire d'événements click pour le document entier
document.addEventListener("click", function (event) {
  if (event.target.tagName !== "path") {
    // Réinitialiser le pays sélectionné
    selectedCountry = null;

    // Réinitialiser l'opacité de tous les pays
    svg.selectAll("path").attr("opacity", 1);

    // Masquer la fenêtre modale
    d3.select("#chart-modal").style("display", "none");
  }
});