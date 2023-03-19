import * as d3 from "d3";

// définir les dimensions de la carte
const width = 960;
const height = 600;

// créer une projection pour la carte
const projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

// créer un chemin pour les frontières des pays
const path = d3.geoPath()
    .projection(projection);

// créer un élément SVG pour la carte
const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);


// Étape 2: Créer une échelle de couleur pour les émissions de CO2
// Créer une échelle de couleur du bleu au rouge
let colorScale = d3.scaleSequential(d3.interpolateRgb("blue", "red"))
    .domain([0, 10000]);

// Appliquer une transformation logarithmique à l'échelle de couleur
colorScale = d3.scaleLog().base(10).clamp(true).domain([Math.max(1, 0), 10000]).range([colorScale(0), colorScale(10000)]);


// charger les données CSV et GeoJSON en même temps
Promise.all([
    d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/main/dataset/GCB2022v27_MtCO2_flat.csv"),
    d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/feature/globe-3d/src/data/countries-land-10km.geo.json")
]).then(function (values) {
    // extraire les données à partir des valeurs résolues
    const co2Emissions = values[0];
    console.log(co2Emissions)
    const world = values[1];

    // créer un groupe pour les frontières des pays
    const countries = svg.append("g")
        .attr("class", "countries");

    // ajouter les frontières des pays au groupe
    countries.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        // Mettre à jour la couleur des pays en fonction des émissions de CO2
        .attr("fill", function (d) {
            const emissionData = co2Emissions.find(e => e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === "2021");
            if (emissionData) {
                console.log(colorScale(emissionData.Total));
                return colorScale(emissionData.Total);
            } else {
                return "lightgray";
            }
        })
        .on("click", function (event, d) {
            // Obtenir le centre du pays sélectionné
            const center = getCountryCenter(d, projection);

            // Appliquer la rotation à la projection pour centrer le pays
            projection.rotate(center);

            // Obtenir les limites du pays sélectionné
            const bounds = getBounds(d.geometry, projection);

            // Obtenir l'échelle optimale pour le pays sélectionné
            const optimalScale = getOptimalScale(bounds, width, height);

            // Ajuster l'échelle de la projection pour zoomer sur le pays
            projection.scale(optimalScale * 100);

            // Mettre à jour le chemin pour refléter la nouvelle projection
            svg.selectAll("path").attr("d", path);

            // Afficher le graphique des émissions de CO2 pour le pays sélectionné
            updateChart(d.properties.A3, co2Emissions);
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
        projection.scale(projection.scale() * event.transform.k);
        console.log(projection.scale());
        svg.selectAll("path").attr("d", path);
    }));
});


// Étape 4: Créer une fonction pour mettre à jour le graphique
function updateChart(countryCode, co2Emissions) {
    // Trouver les données d'émission pour le pays et l'année sélectionnés
    const emissionData = co2Emissions.find(e => e["ISO 3166-1 alpha-3"] === countryCode && e.Year === "2012");

    if (emissionData) {
        // Mettre à jour le graphique avec les données du pays
        const data = [
            {sector: "Coal", value: +emissionData.Coal},
            {sector: "Oil", value: +emissionData.Oil},
            {sector: "Gas", value: +emissionData.Gas},
            {sector: "Cement", value: +emissionData.Cement},
            {sector: "Flaring", value: +emissionData.Flaring},
            {sector: "Other", value: +emissionData.Other},
        ];

        // Étape 6: Créer un élément SVG pour le graphique
        const chartWidth = 500;
        const chartHeight = 300;
        const chartPadding = {top: 20, right: 20, bottom: 50, left: 50};

        const chartSvg = d3.select("#chart-container").append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        // Étape 7: Créer des axes pour le graphique
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.sector))
            .range([chartPadding.left, chartWidth - chartPadding.right])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([chartHeight - chartPadding.bottom, chartPadding.top]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        chartSvg.append("g")
            .attr("transform", `translate(0, ${chartHeight - chartPadding.bottom})`)
            .call(xAxis);

        chartSvg.append("g")
            .attr("transform", `translate(${chartPadding.left}, 0)`)
            .call(yAxis);

        // Créer des barres pour le graphique
        const bars = chartSvg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.sector))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - chartPadding.bottom - yScale(d.value))
            .attr("fill", "steelblue");

        // Étape 9: Ajouter des transitions
        bars.transition()
            .duration(500)
            .attr("y", d => yScale(d.value))
            .attr("height", d => chartHeight - chartPadding.bottom - yScale(d.value));
    } else {
        console.log("Pas de données pour ce pays");
    }
}


function getCountryCenter(feature, projection) {
    const centroid = d3.geoCentroid(feature);
    return [-centroid[0], -centroid[1]];
}

function getOptimalScale(bounds, width, height) {
    const scaleX = (bounds[1][0] - bounds[0][0]) / width,
        scaleY = (bounds[1][1] - bounds[0][1]) / height,
        scale = 1 / Math.max(scaleX, scaleY);

    return scale * 1.2; // Multiplier par 1.2 pour ajouter un peu d'espace autour du pays
}

function getBounds(geometry, projection) {
    const bounds = d3.geoBounds(geometry),
        topLeft = projection(bounds[0]),
        bottomRight = projection(bounds[1]);

    return [
        [topLeft[0], bottomRight[1]],
        [bottomRight[0], topLeft[1]]
    ];
}

