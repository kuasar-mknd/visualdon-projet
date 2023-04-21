import * as d3 from "d3";

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

/**
 * Create the scales
 * @param data The data
 * @param chartWidth The width of the chart
 * @param chartHeight The height of the chart
 * @param chartPadding The padding of the chart
 * @returns The scales
 */
function createScales(data, chartWidth, chartHeight, chartPadding) {
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

    const yScaleSplit = d3.scalePoint()
        .domain(Object.keys(colorMapping).filter(sector => sector !== "Year" && sector !== "ISO 3166-1 alpha-3"))
        .range([chartPadding.top + 50, chartHeight - chartPadding.bottom - 50]);

    return {xScale, yScale, sizeScale, yScaleSplit};
}

/**
 * Create the svg
 * @param chartWidth The width of the chart
 * @param chartHeight The height of the chart
 * @param countryName The name of the country
 * @returns {Selection<ElementTagNameMap[string], unknown, HTMLElement, any>}
 */
function createSvg(chartWidth, chartHeight, countryName) {
    const chartSvg = d3.select("#chart-container").append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight);

    chartSvg.append("text")
        .attr("id", "country-name")
        .attr("x", chartWidth / 2)
        .attr("y", chartPadding.top)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "24px")
        .text(countryName);

    return chartSvg;
}

/**
 * Draw the axes
 * @param chartSvg The svg element
 * @param xScale The x scale
 * @param yScale The y scale
 * @param chartHeight The height of the chart
 * @param chartPadding The padding of the chart
 */
function drawAxes(chartSvg, xScale, yScale, chartHeight, chartPadding) {
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    d3.axisLeft(yScale);

    chartSvg.append("g")
        .attr("transform", `translate(0, ${chartHeight - chartPadding.bottom})`)
        .call(xAxis);

    chartSvg.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight})`)
        .attr("dy", "-0.5em")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text("Années");
}

/**
 * Create the bubbles
 * @param chartSvg The svg element
 * @param data The data
 * @param xScale The x scale
 * @param yScale The y scale
 * @param sizeScale The size scale
 * @returns {*} The bubbles
 */
function createBubbles(chartSvg, data, xScale, yScale, sizeScale) {
    return chartSvg.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.value))
        .attr("r", d => sizeScale(d.value))
        .attr("fill", d => d.color);
}

/**
 * Create the color legend
 * @param chartSvg The svg element
 * @param chartWidth The width of the chart
 * @param chartPadding The padding of the chart
 * @param colorMapping The color mapping
 * @returns {*} The color legend group
 */
function createColorLegend(chartSvg, chartWidth, chartPadding, colorMapping) {
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
    return colorLegendGroup;
}

/**
 * Create the simulation
 * @param data The data
 * @param xScale The x scale
 * @param yScaleSplit The y scale
 * @param sizeScale The size scale
 * @param chartHeight The height of the chart
 * @param chartPadding The padding of the chart
 * @param bubbles The bubbles
 * @returns The simulation
 */
function createSimulation(data, xScale, yScaleSplit, sizeScale, chartHeight, chartPadding, bubbles) {
    const centerY = (chartHeight - chartPadding.top - chartPadding.bottom) / 2 + chartPadding.top;

    return d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d.year)).strength(1))
        .force("y", d3.forceY(centerY).strength(0.05))
        .force("collide", d3.forceCollide(d => sizeScale(d.value) + 1).strength(0.8))
        .on("tick", () => {
            bubbles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
}

/**
 * Create the tooltip
 * @param bubbles The bubbles
 */
function setupTooltip(bubbles) {
    const tooltip = d3.select("#tooltip");

    bubbles.on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
            .html(`Année: ${d.year}<br>Secteur: ${d.sector}<br>Émissions (MtCO2): ${d.value.toFixed(2)}`);
    })
        .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
}

/**
 * Update the split
 * @param split The split
 * @param simulation The simulation
 * @param yScaleSplit The y scale
 * @param colorLegendGroup The color legend group
 * @param colorMapping The color mapping
 * @param chartPadding The padding of the chart
 */
function updateSplit(split, simulation, yScaleSplit, colorLegendGroup, colorMapping, chartPadding) {
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
        simulation.force("y", d3.forceY((chartHeight - chartPadding.top - chartPadding.bottom) / 2 + chartPadding.top).strength(0.05));

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

/**
 * Update the country chart
 * @param countryCode The country code
 * @param co2Emissions The co2 emissions
 */
function updateCountryChart(countryCode, co2Emissions) {
    const emissionData = co2Emissions.filter(e => e["ISO 3166-1 alpha-3"] === countryCode);
    const countryName = emissionData[0].Country;

    // Créer et mettre à jour le graphique avec le nom original du pays
    createAndUpdateChart(countryName, emissionData);

    // Faire une requête à l'API pour obtenir les informations sur le pays
    async function fetchAndTranslateCountryName() {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des données du pays : ${response.status}`);
            }
            const countryData = await response.json();
            console.log(countryData)
            // Utiliser le nom traduit du pays si disponible, sinon utiliser le nom original
            const translatedName = countryData[0].translations.fra.common || countryName;
            console.log(translatedName)
            // Mettre à jour le nom du pays dans le graphique
            d3.select("#country-name").text(translatedName);
        } catch (error) {
            console.error("Erreur lors de la récupération des données du pays :", error);
            // Ne rien faire en cas d'échec de la requête, car le nom original du pays est déjà utilisé
        }
    }

    // Appeler la fonction asynchrone pour effectuer la traduction en arrière-plan
    fetchAndTranslateCountryName();
}

function createAndUpdateChart(countryName, emissionData) {
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

        const {xScale, yScale, sizeScale, yScaleSplit} = createScales(data, chartWidth, chartHeight, chartPadding);
        const chartSvg = createSvg(chartWidth, chartHeight, countryName);
        drawAxes(chartSvg, xScale, yScale, chartHeight, chartPadding);
        const bubbles = createBubbles(chartSvg, data, xScale, yScale, sizeScale);
        const colorLegendGroup = createColorLegend(chartSvg, chartWidth, chartPadding, colorMapping);
        const simulation = createSimulation(data, xScale, yScaleSplit, sizeScale, chartHeight, chartPadding, bubbles);
        setupTooltip(bubbles);

        d3.select("#split-emissions").property("checked", false);

        // Gestionnaire d'événements pour la checkbox
        d3.select("#split-emissions").on("change", function () {
            const checked = d3.select(this).property("checked");
            updateSplit(checked, simulation, yScaleSplit, colorLegendGroup, colorMapping, chartPadding);
        });
    }
}

export default updateCountryChart;


