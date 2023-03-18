//import d3
import * as d3 from 'd3';

// définir les dimensions de la carte
var width = 960;
var height = 600;

// créer une projection pour la carte
var projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2]);

// créer un chemin pour les frontières des pays
var path = d3.geoPath()
    .projection(projection);

// créer un élément SVG pour la carte
var svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// charger les données GeoJSON des frontières des pays
d3.json("https://unpkg.com/@geo-maps/countries-land-50m/map.geo.json").then(function(world) {

    // créer un groupe pour les frontières des pays
    var countries = svg.append("g")
        .attr("class", "countries");

    // ajouter les frontières des pays au groupe
    countries.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", function(d) {
            // remplir chaque pays avec une couleur différente
            return d3.schemeCategory10[Math.floor(Math.random() * 10)];
        });

    // ajouter une interaction pour faire tourner la carte
    svg.call(d3.drag().on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([rotate[0] + d3.event.dx / 2, rotate[1] - d3.event.dy / 2]);
        svg.selectAll("path").attr("d", path);
    }));
});
