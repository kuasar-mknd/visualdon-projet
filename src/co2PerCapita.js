import * as d3 from "d3";

const yearSlider = d3.select("#year-slider");
const playPauseButton = d3.select("#play-pause-button-2");
const topCountries = 15;
const waitMs = 200;
const margin = { top: 20, right: 20, bottom: 20, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

/**
 * Create the SVG element and append it to the chart div
 * @returns {*} The SVG element
 */
function createSvg() {
    return d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
}

/**
 * Create the axes and append them to the SVG element
 * @param svg The SVG element
 * @param x The x scale
 * @param y The y scale
 */
function createAxes(svg, x, y) {
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);
}

/**
 * Update the axes
 * @param svg The SVG element
 * @param x The x scale
 * @param y The y scale
 */
function updateAxes(svg, x, y) {
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();
    createAxes(svg, x, y);
}

/**
 * Process the data to get the top countries for a given year
 * @param data The data
 * @param year The year
 * @returns {*} The top countries
 */
function processData(data, year) {
    const yearData = data.filter((d) => d.Year === year.toString());
    const topData = yearData.sort((a, b) => b.Total - a.Total).slice(0, topCountries);
    return topData;
}

/**
 * Update the bars
 * @param svg The SVG element
 * @param x The x scale
 * @param y The y scale
 * @param topData The top countries
 */
function updateBars(svg, x, y, topData) {
    const bars = svg.selectAll(".bar")
        .data(topData, d => d.Country);

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.Total));

    bars.transition()
        .duration(waitMs)
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.Total));

    bars.exit()
        .transition()
        .duration(waitMs)
        .attr("width", 0)
        .remove();
}

/**
 * Create the graph
 * @returns {Promise<void>} The graph
 */
async function graphTop10Country() {
    const data = await d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/develop/src/data/GCB2022v27_percapita_flat-clean.csv");

    const endYear = d3.max(data, d => parseInt(d.Year));
    const startYear = d3.min(data, d => parseInt(d.Year));

    let playing = false;
    let interval;
    let currentYear = endYear;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);

    const svg = createSvg();
    yearSlider.property("min", startYear);
    update(currentYear);

    function update(year) {
        const topData = processData(data, year);

        x.domain([0, d3.max(topData, d => parseFloat(d.Total))]);
        y.domain(topData.map(d => d.Country));

        updateBars(svg, x, y, topData);
        updateAxes(svg, x, y);

        d3.select("#current-year").text(`Année : ${year}`);
        yearSlider.property("value", year);
    }

    playPauseButton.on("click", function () {
        playing = !playing;
        if (playing) {
            playPauseButton.text("Pause");

            interval = setInterval(() => {
                currentYear++;
                if (currentYear > endYear) {
                    currentYear = startYear;
                }
                update(currentYear);
                yearSlider.property("value", currentYear);
            }, waitMs);
        } else {
            playPauseButton.text("Play");
            clearInterval(interval);
        }
    });

    yearSlider.on("input", function () {
        currentYear = parseInt(this.value);
        update(currentYear);
    });
}

export { graphTop10Country };

