//import d3
import * as d3 from 'd3';
import {zoom} from 'd3-zoom';


// définir les dimensions de la carte
const width = 960;
const height = 600;

// créer une projection pour la carte
const projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2]);

// créer un chemin pour les frontières des pays
const path = d3.geoPath()
    .projection(projection);

// créer un élément SVG pour la carte
const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// charger les données GeoJSON des frontières des pays
// countries-50m.json
// https://unpkg.com/@geo-maps/countries-land-50m/map.geo.json
d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/feature/globe-3d/src/data/countries-land-10km.geo.json").then(function (world) {

    // créer un groupe pour les frontières des pays
    const countries = svg.append("g")
        .attr("class", "countries");

    // ajouter les frontières des pays au groupe
    countries.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", function (d) {
            // remplir chaque pays avec une couleur différente
            return d3.schemeCategory10[Math.floor(Math.random() * 10)];
        });

    // ajouter une interaction pour faire tourner la carte
    svg.call(d3.drag().on("drag", function (event) {
        const rotate = projection.rotate();
        // Calculer un facteur de vitesse en fonction de l'échelle actuelle de la projection
        const speedFactor = 1 + projection.scale() / 100;
        // Appliquer la rotation en utilisant le facteur de vitesse
        projection.rotate([rotate[0] + event.dx / speedFactor, rotate[1] - event.dy / speedFactor]);
        svg.selectAll("path").attr("d", path);
    }));


    // ajouter une interaction pour zoomer sur la carte
    svg.call(d3.zoom().on("zoom", function (event) {
        console.log("test");
        projection.scale(projection.scale() * event.transform.k);
        svg.selectAll("path").attr("d", path);
    }));

});
