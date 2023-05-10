import * as d3 from "d3";
import updateCountryChart from "./countryChart";

// définir les dimensions de la carte
//get width from container
const width = document.getElementById("map-container").clientWidth;
const height = 600;
const scale = 250;
let selectedCountry = null;
let selectedYear = "2021"; // Initialiser la variable pour stocker l'année sélectionnée
let selectedCategory = "Total"; // Initialiser la variable pour stocker la catégorie d'émissions sélectionnée
let prevEmissionData = {};
const countryCache = {};
let tooltipTimeout;
let countryElements;
let emissionDataByCountryYear;
let animationActive = false;
let animationFrameID;
let lastInteraction;
const autoRotationDelay = 500;



// créer une projection pour la carte
const projection = d3.geoOrthographic()
    .scale(scale)
    .translate([width / 2, height / 2])
    .clipAngle(90)

// créer un chemin pour les frontières des pays
const path = d3.geoPath()
    .projection(projection);

// créer un élément SVG pour la carte
const svg = d3.select("#globe-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("id", "map")

// Créer une échelle de couleur du bleu au rouge
let colorScale = d3.scaleSequential(d3.interpolateRgb("#fee0d2", "#de2d26"))
    .domain([0, 11400]);

// Appliquer une transformation logarithmique à l'échelle de couleur
colorScale = d3.scaleLog().base(10).clamp(true).domain([Math.max(1, 0), 11400]).range([colorScale(0), colorScale(11400)]);

async function globe3d() {
    // charger les données CSV et GeoJSON en même temps
    Promise.all([
        d3.csv("./data/GCB2022v27_MtCO2_flat-clean.csv"),
        d3.json("./data/countries-coastline-10km.geo.json")
    ]).then(function (values) {

        lastInteraction = Date.now();
        // extraire les données à partir des valeurs résolues
        const co2Emissions = values[0];
        emissionDataByCountryYear = co2Emissions.reduce((acc, curr) => {
            acc[`${curr['ISO 3166-1 alpha-3']}_${curr.Year}`] = curr;
            return acc;
        }, {});
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
                    return; // Ne fais rien si le pays sélectionné est déjà centré
                }

                // Mise à jour du pays sélectionné
                selectedCountry = d;

                // Obtenir le centre du pays sélectionné
                const center = getCountryCenter(d);

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

                // Mettre à jour le pourcentage du radial-gradient
                const percentage = getGradientPercentage(optimalScale * 100);
                svg.style("background", `radial-gradient(circle, rgba(166,166,166,1) 0%, rgba(2,0,36,1) ${percentage}%)`);

                // Mettre à jour le chemin pour refléter la nouvelle projection
                svg.selectAll("path").attr("d", path);

                // Afficher le graphique des émissions de CO2 pour le pays sélectionné
                updateCountryChart(d.properties.A3, co2Emissions, true);
            })
            .on("mouseover", function (event, d) {
                showTooltip(event, d.properties.A3, co2Emissions);
            })
            .on("mouseout", function () {
                hideTooltip();
            })
            .on("mousemove", (event) => {
                moveTooltip(event);
            });

        countryElements = svg.selectAll(".country");


        // Mettre à jour la couleur des pays en fonction des émissions de CO2
        updateColorCountry(co2Emissions, world);

        // Mettre à jour de background de la carte
        svg.style("background", `radial-gradient(circle, rgba(166,166,166,1) 0%, rgba(2,0,36,1) ${getGradientPercentage(scale)}%)`);

        // ajouter une interaction pour faire tourner la carte
        svg.call(d3.drag().on("drag", function (event) {
            lastInteraction = Date.now();
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
        d3.select("#emission-category").on("change", function () {
            prevEmissionData = {};
            //console.log(this.value);
            selectedCategory = this.value;
            //console.log(selectedCategory);
            updateColorCountry(co2Emissions, world);
        });

        // Gestionnaire d'événements pour le changement d'année
        d3.select("#year-input").on("input", function () {
            selectedYear = this.value;
            requestUpdateCO2Data(selectedYear, co2Emissions, world);
        });

        // Gestionnaire d'événements pour le bouton de lecture
        d3.select("#play-pause-btn").on("click", function () {
            let button = d3.select(this);
            let currentState = button.attr("data-state");

            if (currentState === "play") {
                button.attr("data-state", "pause");
                button.text("Pause");
                animationActive = true;
                animateYears(minYear, maxYear, co2Emissions, world);
            } else {
                button.attr("data-state", "play");
                button.text("Voyager dans le temps");
                animationActive = false;
            }
        });
    });
    autoRotate();
}

function autoRotate() {
    const now = Date.now();
    const autoRotationCheckbox = document.getElementById('auto-rotation-checkbox');
    if (autoRotationCheckbox && autoRotationCheckbox.checked) {
        console.log("autorotate launched")
        if (now - lastInteraction > autoRotationDelay) {
            console.log("rotating")
            const rotate = projection.rotate();
            const speedFactor = 0.5 + projection.scale() / 1000;
            projection.rotate([rotate[0] + 0.1 / speedFactor, rotate[1]]);
            svg.selectAll("path").attr("d", path);
        }
    }
        requestAnimationFrame(autoRotate);
}

/**
 * Mettre à jour les données d'émissions de CO2 pour une animation
 * @param year L'année sélectionnée
 * @param co2Emissions Les données d'émissions de CO2
 * @param world
 */
function requestUpdateCO2Data(year, co2Emissions, world) {
    requestAnimationFrame(() => updateCO2Data(year, co2Emissions, world));

    // Mettre à jour le tooltip
    const tooltip = d3.select("#tooltip");
    const countryCode = tooltip.attr("data-country");
    if (countryCode) {
        updateTooltip(countryCode, year, co2Emissions);
    }

}

/**
 * Mettre à jour les données d'émissions de CO2
 * @param yea L'année sélectionnée
 * @param co2Emissions Les données d'émissions de CO2
 * @param world
 */
function updateCO2Data(yea, co2Emissions, world) {
    // Mettre à jour l'année sélectionnée
    selectedYear = yea;
    // Mettre à jour l'input id = "year-input"
    d3.select("#year-input").property("value", selectedYear);

    updateColorCountry(co2Emissions, world);

    // Mettre à jour le graphique si un pays est sélectionné
    if (selectedCountry) {
        updateCountryChart(selectedCountry.properties.A3, co2Emissions);
    }
}

/**
 * Mettre à jour la couleur des pays en fonction des émissions de CO2
 * @param co2Emissions Les données d'émissions de CO2
 * @param world
 */
function updateColorCountry(co2Emissions, world) {
    d3.select("#selected-year").text(selectedYear);

    const updateSelection = countryElements
        .data(world.features, (d) => d.properties.A3)
        .join(
            (enter) => enter, // pas d'opération pour les éléments entrants
            (update) => update, // pas d'opération pour les éléments mis à jour
            (exit) => exit.remove() // supprime les éléments sortants, si nécessaire
        );

    updateSelection.each(function (d) {
        const emissionData = emissionDataByCountryYear[`${d.properties.A3}_${selectedYear}`];

        if (!emissionData) {
            d3.select(this).attr("fill", "lightgray");
            return;
        }

        if (!prevEmissionData[d.properties.A3] || prevEmissionData[d.properties.A3][selectedCategory] !== emissionData[selectedCategory]) {
            prevEmissionData[d.properties.A3] = emissionData;
            const newColor = (emissionData && emissionData[selectedCategory] !== "0" && emissionData[selectedCategory] !== "")
                ? colorScale(emissionData[selectedCategory])
                : "lightgray";
            d3.select(this).attr("fill", newColor);
        }
    });
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
    const scaleX = (bounds[1][0] - bounds[0][0]) / width, scaleY = (bounds[1][1] - bounds[0][1]) / height,
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
    const bounds = d3.geoBounds(geometry), topLeft = projection(bounds[0]), bottomRight = projection(bounds[1]);
    //console.log(bounds);
    return [[topLeft[0], bottomRight[1]], [bottomRight[0], topLeft[1]]];
}

/**
 * Permet de gérer le zoom de la carte
 * @param event Événement
 */
function handleWheel(event) {
    lastInteraction = Date.now();
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const currentScale = projection.scale();
    const newScale = currentScale * zoomFactor;
    const scaleLimit = 250;

    // Limiter le zoom maximum et minimum
    if (newScale > scaleLimit * 0.5 && newScale < scaleLimit * 50) {
        projection.scale(newScale);
        //console.log(projection.scale());
        svg.selectAll("path").attr("d", path);

        // Mettre à jour le pourcentage du radial-gradient
        const percentage = getGradientPercentage(newScale);
        svg.style("background", `radial-gradient(circle, rgba(166,166,166,1) 0%, rgba(2,0,36,1) ${percentage}%)`);
    }
}

/**
 * Calculer le pourcentage du radial-gradient du svg
 * @param scale
 * @returns {number}
 */
function getGradientPercentage(scale) {
    // Modifier ces valeurs en fonction de vos préférences
    const minScale = 1;
    const maxScale = 10 * 41;

    const percentage = ((scale - minScale) / (maxScale - minScale)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
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
      <input type="range" class="year-slider" id="year-input" min="${minYear}" max="${maxYear}" step="1" value="${maxYear}"/>
      <span id="selected-year">${maxYear}</span>
    `);
}

/**
 * Permet d'animer le sélecteur d'année
 * @param minYear Année minimale
 * @param maxYear Année maximale
 * @param co2Emissions
 * @param world
 */
function animateYears(minYear, maxYear, co2Emissions, world) {
    const delay = 100;
    function updateYear() {
        const yearInput = d3.select("#year-input").node();
        const currentYear = +yearInput.value;

        if (currentYear < maxYear) {
            yearInput.value = currentYear + 1;
        } else {
            yearInput.value = minYear;
        }
        requestUpdateCO2Data(yearInput.value, co2Emissions, world);

        if (animationActive) {
            setTimeout(() => {
                animationFrameID = requestAnimationFrame(updateYear);
            }, delay);
        } else {
            cancelAnimationFrame(animationFrameID);
        }
    }

    if (animationActive) {
        animationFrameID = requestAnimationFrame(updateYear);
    } else {
        cancelAnimationFrame(animationFrameID);
    }
}

async function showTooltip(event, d, co2Emissions) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(async () => {
        let countryData;

        if (countryCache[d]) {
            countryData = countryCache[d];
        } else {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${d}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des données du pays : ${response.status}`);
            }
            countryData = await response.json();
            countryCache[d] = countryData; // Ajoutez les données dans le cache
        }

        updateTooltip(d, selectedYear, co2Emissions);

        const tooltip = d3.select("#tooltip");
        tooltip.style("visibility", "visible")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .attr("data-country", d)
    }, 100);
}

function updateTooltip(countryCode, year, co2Emissions) {
    const emissionData = co2Emissions.find((e) => e["ISO 3166-1 alpha-3"] === countryCode && e.Year === year);
    const countryData = countryCache[countryCode];

    if (!emissionData) {
        const translatedNameNoneExistant = countryData[0].translations.fra.common || countryData[0].name.common;
        const tooltip = d3.select("#tooltip");
        tooltip.html(`<strong>${translatedNameNoneExistant}</strong><br/>`)
        return;
    }


    if (!countryData) return;


    // Utiliser le nom traduit du pays si disponible, sinon utiliser le nom original
    const translatedName = countryData[0].translations.fra.common || countryData[0].name.common;

    const formattedEmissions = parseFloat(emissionData[selectedCategory]).toFixed(2); // Formate les émissions avec 2 chiffres après la virgule

    const tooltip = d3.select("#tooltip");
    tooltip.html(`
    <strong>${translatedName}</strong><br/>
    Émissions ${selectedCategory} : ${formattedEmissions} MtCO2
  `);
}



function hideTooltip() {
    clearTimeout(tooltipTimeout);
    d3.select("#tooltip").style("visibility", "hidden");
}

function moveTooltip(event) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
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

export {globe3d};