import * as d3 from "d3";

// définir les dimensions de la carte
//get width from container
const width = document.getElementById("map-container").clientWidth;
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
const svg = d3.select("#globe-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("id", "map")

// Créer une échelle de couleur du bleu au rouge
let colorScale = d3.scaleSequential(d3.interpolateRgb("blue", "red"))
    .domain([0, 10000]);

// Appliquer une transformation logarithmique à l'échelle de couleur
colorScale = d3.scaleLog().base(10).clamp(true).domain([Math.max(1, 0), 10000]).range([colorScale(0), colorScale(10000)]);

async function globe3d() {
    // charger les données CSV et GeoJSON en même temps
    Promise.all([//d3.csv("./data/GCB2022v27_MtCO2_flat.csv"),
        //d3.json("./data/countries-coastline-10km.geo.json")
        d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/develop/src/data/GCB2022v27_MtCO2_flat-clean.csv"), d3.json("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/develop/src/data/countries-coastline-10km.geo.json")]).then(function (values) {

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

                // Mettre à jour le pourcentage du radial-gradient
                const percentage = getGradientPercentage(optimalScale * 100);
                svg.style("background", `radial-gradient(circle, rgba(166,166,166,1) 0%, rgba(2,0,36,1) ${percentage}%)`);

                // Mettre à jour le chemin pour refléter la nouvelle projection
                svg.selectAll("path").attr("d", path);

                // Afficher le graphique des émissions de CO2 pour le pays sélectionné
                updateCountryChart(d.properties.A3, co2Emissions, true);
            });

        // Mettre à jour la couleur des pays en fonction des émissions de CO2
        updateColorCountry(co2Emissions);

        // Mettre à jour de background de la carte
        svg.style("background", `radial-gradient(circle, rgba(166,166,166,1) 0%, rgba(2,0,36,1) ${getGradientPercentage(scale)}%)`);

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
        d3.select("#emission-category").on("change", function () {
            prevEmissionData = {};
            //console.log(this.value);
            selectedCategory = this.value;
            //console.log(selectedCategory);
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
                button.text("Voyager dans le temps");
                clearInterval(animationInterval);
            }
        });
    });
}

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
        updateCountryChart(selectedCountry.properties.A3, co2Emissions);
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
            const emissionData = co2Emissions.find((e) => e["ISO 3166-1 alpha-3"] === d.properties.A3 && e.Year === selectedYear);

            if (!emissionData) {
                // S'il n'y a pas de données d'émission pour l'année, définissez la couleur sur "lightgray"
                d3.select(this).attr("fill", "lightgray");
                return;
            }

            // Si les données d'émission ont changé, mettez à jour la couleur du pays
            if (!prevEmissionData[d.properties.A3] || prevEmissionData[d.properties.A3][selectedCategory] !== emissionData[selectedCategory]) {
                // Mettre à jour les données d'émission précédentes
                prevEmissionData[d.properties.A3] = emissionData;
                // Mettre à jour la couleur du pays en fonction des données d'émission
                d3.select(this)
                    .attr("fill", function () {
                        if (emissionData && emissionData[selectedCategory] !== "0" && emissionData[selectedCategory] !== "") {
                            //console.log(colorScale(emissionData[selectedCategory]));
                            return colorScale(emissionData[selectedCategory]);
                        } else {
                            //console.log("lightgray");
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
function updateCountryChart(countryCode, co2Emissions) {
    const emissionData = co2Emissions.filter(e => e["ISO 3166-1 alpha-3"] === countryCode);
    const colorMapping = {
        'Coal': '#1f77b4',
        'Oil': '#ff7f0e',
        'Gas': '#2ca02c',
        'Cement': '#d62728',
        'Flaring': '#9467bd',
        'Other': '#8c564b'
    };

    const chartWidth = 800;
    const chartPadding = {top: 50, right: 70, bottom: 50, left: 50}
    const chartHeight = 700;

    const yScaleSplit = d3.scalePoint()
        .domain(Object.keys(colorMapping).filter(sector => sector !== "Year" && sector !== "ISO 3166-1 alpha-3"))
        .range([chartPadding.top + 50, chartHeight - chartPadding.bottom - 50]);


    if (emissionData.length > 0) {
        d3.select("#chart-modal").style("display", "block");
        d3.select("#chart-container").selectAll("svg").remove();

        let data = [];
        emissionData.forEach(yearData => {
            const year = +yearData.Year;
            for (let sector of Object.keys(colorMapping)) {
                if (sector !== 'Year' && sector !== 'ISO 3166-1 alpha-3') {
                    data.push({
                        year: year, sector: sector, value: +yearData[sector], color: colorMapping[sector]
                    });
                }
            }
        });

        const chartSvg = d3.select("#chart-container").append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([chartPadding.left, chartWidth - chartPadding.right - 50]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([chartHeight - chartPadding.bottom, chartPadding.top]);

        const maxSize = chartHeight / 50;

        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, maxSize]);

        const bubbles = chartSvg.selectAll(".bubble")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.value))
            .attr("r", d => sizeScale(d.value))
            .attr("fill", d => d.color);

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale);

        chartSvg.append("g")
            .attr("transform", `translate(0, ${chartHeight - chartPadding.bottom})`)
            .call(xAxis);

        chartSvg.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight})`)
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .attr("fill", "white")
            .text("Années");

        const centerY = (chartHeight - chartPadding.top - chartPadding.bottom) / 2 + chartPadding.top;

        // Ajout des légendes des couleurs
        const colorLegendGroup = chartSvg.append("g")
            .attr("transform", `translate(${chartWidth - chartPadding.right}, ${chartPadding.top})`);

        let colorLegendY = 0;
        for (const [sector, color] of Object.entries(colorMapping)) {
            if (sector !== "Year" && sector !== "ISO 3166-1 alpha-3") {
                colorLegendGroup.append("circle")
                    .attr("cx", 0)
                    .attr("cy", colorLegendY)
                    .attr("r", 6)
                    .attr("fill", color);

                colorLegendGroup.append("text")
                    .attr("x", 10)
                    .attr("y", colorLegendY + 4)
                    .text(sector)
                    .attr("fill", "white")
                    .style("font-size", "12px");

                colorLegendY += 20;
            }
        }


        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(d => xScale(d.year)).strength(1))
            .force("y", d3.forceY(centerY).strength(0.05)) // modifiez la force y ici
            .force("collide", d3.forceCollide(d => sizeScale(d.value) + 1).strength(0.8))
            .on("tick", () => {
                bubbles
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        d3.select("#split-emissions").property("checked", false);

        // Gestionnaire d'événements pour la checkbox
        d3.select("#split-emissions").on("change", function () {
            const checked = d3.select(this).property("checked");
            updateSplit(checked);
        });

        /**
         * Mettre à jour le graphique en fonction de la checkbox
         * @param split Booléen indiquant si la checkbox est cochée
         */
        function updateSplit(split) {
            const sectorOrder = Object.keys(colorMapping).filter(sector => sector !== "Year" && sector !== "ISO 3166-1 alpha-3");

            if (split) {
                simulation.force("y", d3.forceY(d => yScaleSplit(d.sector)).strength(0.2));

                colorLegendGroup.selectAll("circle")
                    .transition()
                    .duration(500)
                    .attr("cy", (d, i) => yScaleSplit(sectorOrder[i]) - chartPadding.top);

                colorLegendGroup.selectAll("text")
                    .transition()
                    .duration(500)
                    .attr("y", (d, i) => yScaleSplit(sectorOrder[i]) - chartPadding.top + 4);

            } else {
                simulation.force("y", d3.forceY(centerY).strength(0.05));

                colorLegendGroup.selectAll("circle")
                    .transition()
                    .duration(1000)
                    .attr("cy", (d, i) => i * 20);

                colorLegendGroup.selectAll("text")
                    .transition()
                    .duration(1000)
                    .attr("y", (d, i) => i * 20 + 4);
            }

            simulation.alpha(1).restart();
        }
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
    const maxScale = 10 * 50;

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
            d3.select("#play-pause-btn").attr("data-state", "play").text("Voyager dans le temps");
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

export {globe3d};