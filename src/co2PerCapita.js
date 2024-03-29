import * as d3 from "d3";

const yearSlider = d3.select("#year-input2");
const playPauseButton = d3.select("#play-pause-button-2");
const topCountries = 15;
const waitMs = 200;
const margin = {top: 20, right: 50, bottom: 20, left: 200};
const width = document.getElementById("intro-section").clientWidth - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const emissionCategorySelector = d3.select("#emission-category2");

/**
 * Create the SVG element and append it to the chart div
 * @returns {*} The SVG element
 */
function createSvg() {
    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#020024")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#4b6cb7")
        .attr("stop-opacity", 1);

    return svg;
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
 * @param category The category
 * @param translations The translations
 * @returns {*} The top countries
 */
function processData(data, year, category, translations) {
    //console.log(translations)
    const yearData = data.filter((d) => d.Year === year.toString());
    const sortedData = yearData.sort((a, b) => parseFloat(b[category]) - parseFloat(a[category])).slice(0, topCountries);

    return sortedData.map((d) => {
        return { ...d, Country: translations[d["ISO 3166-1 alpha-3"]] || d.Country };
    });
}



/**
 * Update the bars
 * @param svg The SVG element
 * @param x The x scale
 * @param y The y scale
 * @param topData The top countries
 * @param category The category
 */
function updateBars(svg, x, y, topData, category) {
    const bars = svg.selectAll(".bar")
        .data(topData, d => d.Country);

    const barValueLabels = svg.selectAll(".bar-value")
        .data(topData, d => d.Country);

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(parseFloat(d[category])))
        .attr("fill", "url(#gradient)");

    bars.enter().append("text") // Ajoutez cette partie pour créer les étiquettes de texte
        .attr("class", "bar-value")
        .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 4) // Position verticale centrée sur la barre
        .attr("x", d => x(parseFloat(d[category])) + 5) // Position horizontale juste après la barre
        .attr("fill", "white")
        .text(d => parseFloat(d[category]).toFixed(2)); // Affichez la valeur de la barre avec 2 décimales

    bars.transition()
        .duration(waitMs)
        .attr("y", d => y(d.Country))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(parseFloat(d[category])));

    bars.exit()
        .transition()
        .duration(waitMs)
        .attr("width", 0)
        .remove();

    barValueLabels.enter().append("text")

    barValueLabels.transition() // Ajoutez cette partie pour mettre à jour les étiquettes de texte
        .duration(waitMs)
        .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 4)
        .attr("x", d => x(parseFloat(d[category])) + 5)
        .text(d => parseFloat(d[category]).toFixed(2));

    barValueLabels.exit()
        .transition()
        .duration(waitMs)
        .attr("x", 0)
        .remove();
}

/**
 * Get country translations
 * @param countryCode The country code
 * @returns {Promise<*>} The country translation
 */
async function getCountryTranslation(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await response.json();
        return countryData[0].translations.fra.common;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la traduction pour ${countryCode}:`, error);
        return countryCode;
    }
}

/**
 * Create the graph
 * @returns {Promise<void>} The graph
 */
async function graphTop10Country(dataPerCapita) {
    const data = dataPerCapita;

    const uniqueCountryCodes = new Set(data.map((d) => d['ISO 3166-1 alpha-3']));
    const translations = {};
    const countryCodePromises = Array.from(uniqueCountryCodes).map(async (countryCode) => {
        translations[countryCode] = await getCountryTranslation(countryCode);
    });

    await Promise.all(countryCodePromises);

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
        const selectedCategory = emissionCategorySelector.property("value");
        //console.log(selectedCategory);
        const topData = processData(data, year, selectedCategory, translations);
        //console.log(topData);

        x.domain([0, d3.max(topData, d => parseFloat(d[selectedCategory]))]);
        y.domain(topData.map(d => d.Country));

        updateBars(svg, x, y, topData, selectedCategory);
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
            playPauseButton.text("Voyager dans le temps");
            clearInterval(interval);
        }
    });

    yearSlider.on("input", function () {
        currentYear = parseInt(this.value);
        update(currentYear);
    });

    emissionCategorySelector.on("change", function () {
        //console.log("change")
        update(currentYear);
    });
}


export {graphTop10Country};

