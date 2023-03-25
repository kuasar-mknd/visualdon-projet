import * as d3 from "d3";
import "./style.css";

// définir les dimensions de la carte
const width = 960;
const height = 600;
const scale = 250;
let selectedCountry = null;
let selectedYear = "2021"; // Initialiser la variable pour stocker l'année sélectionnée
let selectedCategory = "Total"; // Initialiser la variable pour stocker la catégorie d'émissions sélectionnée
let prevEmissionData = {};
let animationInterval;


// créer une projection pour la carte
const projection = d3.geoOrthographic()
    .scale(scale)
    .translate([width / 2, height / 2])
    .clipAngle(90)

// créer un chemin pour les frontières des pays
const path = d3.geoPath()
    .projection(projection);

// créer un élément SVG pour la carte
const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("vector-effect", "non-scaling-stroke");


// Étape 2: Créer une échelle de couleur pour les émissions de CO2
// Créer une échelle de couleur du bleu au rouge
let colorScale = d3.scaleSequential(d3.interpolateRgb("blue", "red"))
    .domain([0, 10000]);

// Appliquer une transformation logarithmique à l'échelle de couleur
colorScale = d3.scaleLog().base(10).clamp(true).domain([Math.max(1, 0), 10000]).range([colorScale(0), colorScale(10000)]);


// charger les données CSV et GeoJSON en même temps
Promise.all([
    //d3.csv("./data/GCB2022v27_MtCO2_flat.csv"),
    //d3.json("./data/countries-coastline-10km.geo.json")
    d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/main/dataset/GCB2022v27_MtCO2_flat.csv"),
    d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/develop/src/data/countries-coastline-10km.geo.json")
]).then(function (values) {
    // extraire les données à partir des valeurs résolues
    const co2Emissions = values[0];
    //console.log(co2Emissions)
    const world = values[1];

    // Création de la timeline
    const years = co2Emissions.map(e => e.Year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    createYearInput(minYear, maxYear);

    // créer un groupe pour les frontières des pays
    const countries = svg.append("g")
        .attr("class", "countries")
        .attr("vector-effect", "non-scaling-stroke");

    // ajouter les frontières des pays au groupe
    countries.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country")
        .on("click", function (event, d) {
            event.stopPropagation();

            // Modifier l'opacité des autres pays
            svg.selectAll("path")
                .attr("opacity", function (pathD) {
                    return pathD === d ? 1 : 0.2;
                });

            if (selectedCountry && selectedCountry === d) {
                return; // Ne fait rien si le pays sélectionné est déjà centré
            }

            // Mise à jour du pays sélectionné
            selectedCountry = d;

            // Obtenir le centre du pays sélectionné
            const center = getCountryCenter(d, projection);

            // Appliquer la rotation à la projection pour centrer le pays
            projection.rotate(center);
            projection.scale(scale);

            // Obtenir les limites du pays sélectionné
            const bounds = getBounds(d.geometry, projection);
            //console.log(bounds);

            // Obtenir l'échelle optimale pour le pays sélectionné
            const optimalScale = getOptimalScale(bounds, width, height);
            //console.log(optimalScale);

            // Ajuster l'échelle de la projection pour zoomer sur le pays
            projection.scale(optimalScale * 100);

            // Mettre à jour le chemin pour refléter la nouvelle projection
            svg.selectAll("path").attr("d", path);

            // Afficher le graphique des émissions de CO2 pour le pays sélectionné
            updateChart(d.properties.A3, co2Emissions);
        });

    // Mettre à jour la couleur des pays en fonction des émissions de CO2
    updateColorCountry(co2Emissions);

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
    svg.on("wheel", handleWheel);

    // Gestionnaire d'événements pour le changement de catégorie d'émissions
    d3.select("#emission-category").on("change", function() {
        console.log(this.value);
        selectedCategory = this.value;
        console.log(selectedCategory);
        updateColorCountry(co2Emissions);
    });

    // Gestionnaire d'événements pour le changement d'année
    d3.select("#year-input").on("input", function () {
        selectedYear = this.value;
        requestUpdateCO2Data(selectedYear, co2Emissions);
    });

    // Gestionnaire d'événements pour le bouton de lecture
    d3.select("#play-pause-btn").on("click", function () {
        const button = d3.select(this);
        const currentState = button.attr("data-state");

        if (currentState === "play") {
            button.attr("data-state", "pause");
            button.text("Pause");
            animateYears(minYear, maxYear, co2Emissions);
        } else {
            button.attr("data-state", "play");
            button.text("Play");
            clearInterval(animationInterval);
        }
    });
});

/**
 * Mettre à jour les données d'émissions de CO2 pour une animation
 * @param year L'année sélectionnée
 * @param co2Emissions Les données d'émissions de CO2
 */
function requestUpdateCO2Data(year, co2Emissions) {
    requestAnimationFrame(() => updateCO2Data(year, co2Emissions));
}

/**
 * Mettre à jour les données d'émissions de CO2
 * @param yea L'année sélectionnée
 * @param co2Emissions Les données d'émissions de CO2
 */
function updateCO2Data(yea, co2Emissions) {
    // Mettre à jour l'année sélectionnée
    selectedYear = yea;
    // Mettre à jour l'input id = "year-input"
    d3.select("#year-input").property("value", selectedYear);

    updateColorCountry(co2Emissions);

    // Mettre à jour le graphique si un pays est sélectionné
    if (selectedCountry) {
        updateChart(selectedCountry.properties.A3, co2Emissions);
    }
}

/**
 * Mettre à jour la couleur des pays en fonction des émissions de CO2
 * @param co2Emissions Les données d'émissions de CO2
 */
function updateColorCountry(co2Emissions) {
        d3.select("#selected-year").text(selectedYear);

        // Mettre à jour la couleur des pays en fonction des émissions de CO2
        svg.selectAll(".country")
            .each(function (d) {
                const emissionData = co2Emissions.find(
                    (e) => e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === selectedYear
                );
                // Si les données d'émission ont changé, mettez à jour la couleur du pays
                if (
                    !prevEmissionData[d.properties.A3] ||
                    prevEmissionData[d.properties.A3][selectedCategory] !== emissionData[selectedCategory]
                ) {
                    // Mettre à jour les données d'émission précédentes
                    prevEmissionData[d.properties.A3] = emissionData;

                    // Mettre à jour la couleur du pays en fonction des données d'émission
                    d3.select(this)
                        .attr("fill", function () {
                            if (
                                emissionData &&
                                emissionData[selectedCategory] !== "0" &&
                                emissionData[selectedCategory] !== ""
                            ) {
                                console.log(colorScale(emissionData[selectedCategory]));
                                return colorScale(emissionData[selectedCategory]);
                            } else {
                                console.log("lightgray");
                                return "lightgray";
                            }
                        });
                }
            });
}

/**
 * Mettre à jour le graphique des émissions de CO2 pour le pays sélectionné
 * @param countryCode Code du pays sélectionné
 * @param co2Emissions Données d'émissions de CO2
 */
function updateChart(countryCode, co2Emissions) {
    // Trouver les données d'émission pour le pays et l'année sélectionnés
    const emissionData = co2Emissions.find(e => e["ISO 3166-1 alpha-3"] === countryCode && e.Year === selectedYear);

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

        // Afficher la fenêtre modale
        d3.select("#chart-modal").style("display", "block");

        // Supprimer le graphique précédent
        d3.select("#chart-container").selectAll("svg").remove();


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
            .duration(5000)
            .attr("y", d => yScale(d.value))
            .attr("height", d => chartHeight - chartPadding.bottom - yScale(d.value));
    } else {
            //console.log("Pas de données pour ce pays");
            // Masquer la fenêtre modale
            d3.select("#chart-modal").style("display", "none");

    }
}

/**
 * Permet d'obtenir le centre du pays
 * @param feature Caractéristiques du pays
 * @returns {number[]} Coordonnées du centre du pays
 */
function getCountryCenter(feature) {
    const centroid = d3.geoCentroid(feature);
    return [-centroid[0], -centroid[1]];
}

/**
 * Permet d'obtenir l'échelle optimale pour afficher le pays
 * @param bounds Frontières du pays
 * @param width Largeur de la carte
 * @param height Hauteur de la carte
 * @returns {number} Échelle optimale
 */
function getOptimalScale(bounds, width, height) {
    const scaleX = (bounds[1][0] - bounds[0][0]) / width,
        scaleY = (bounds[1][1] - bounds[0][1]) / height,
        scale = 1 / Math.max(scaleX, scaleY);

    return scale * 1.2; // Multiplier par 1.2 pour ajouter un peu d'espace autour du pays
}

/**
 * Permet d'obtenir les frontières du pays
 * @param geometry Géométrie du pays
 * @param projection Projection de la carte
 * @returns {*[][]} Frontières du pays
 */
function getBounds(geometry, projection) {
    const bounds = d3.geoBounds(geometry),
        topLeft = projection(bounds[0]),
        bottomRight = projection(bounds[1]);
    //console.log(bounds);
    return [
        [topLeft[0], bottomRight[1]],
        [bottomRight[0], topLeft[1]]
    ];
}

/**
 * Permet de gérer le zoom de la carte
 * @param event Événement
 */
function handleWheel(event) {
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const currentScale = projection.scale();
    const newScale = currentScale * zoomFactor;
    const scaleLimit = 250;

    // Limiter le zoom maximum et minimum
    if (newScale > scaleLimit * 0.5 && newScale < scaleLimit * 50) {
        projection.scale(newScale);
        console.log(projection.scale());
        svg.selectAll("path").attr("d", path);
    }
}

/**
 * Permet de créer le sélecteur d'année
 * @param minYear Année minimale
 * @param maxYear Année maximale
 */
function createYearInput(minYear, maxYear) {
    d3.select("#timeline-container")
        .append("div")
        .html(`
      <label for="year-input">Année:</label>
      <input type="range" id="year-input" min="${minYear}" max="${maxYear}" step="1" value="${maxYear}" />
      <span id="selected-year">${maxYear}</span>
    `);
}

/**
 * Permet d'animer le sélecteur d'année
 * @param minYear Année minimale
 * @param maxYear Année maximale
 * @param co2Emissions
 */
function animateYears(minYear, maxYear, co2Emissions) {
    clearInterval(animationInterval);

    animationInterval = setInterval(function () {
        const yearInput = d3.select("#year-input").node();
        const currentYear = +yearInput.value;

        if (currentYear < maxYear) {
            //console.log("currentYear", currentYear);
            yearInput.value = currentYear + 1;
            requestUpdateCO2Data(yearInput.value, co2Emissions);
        } else {
            clearInterval(animationInterval);
            d3.select("#play-pause-btn").attr("data-state", "play").text("Play");
        }
    }, 10);
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