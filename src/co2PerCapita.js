import * as d3 from "d3";

/**
 * Création du graph des émissions de CO2 par habitant
 * @returns {Promise<void>}
 */
async function graphTop10Country() {
    const yearSlider = d3.select("#year-slider");
    const playPauseButton = d3.select("#play-pause-button-2");
    const topCountries = 15;
    const waitMs = 200;
    const data = await d3.csv("https://raw.githubusercontent.com/kuasar-mknd/visualdon-projet/develop/src/data/GCB2022v27_percapita_flat-clean.csv")
    const margin = {top: 20, right: 20, bottom: 20, left: 100};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const endYear = d3.max(data, d => parseInt(d.Year));
    const startYear = d3.min(data, d => parseInt(d.Year));

    let playing = false;
    let interval;
    let currentYear = endYear;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);

    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    yearSlider.property("min", startYear);

    update(currentYear);

    function update(year) {
        // Filtrer les données pour l'année en cours
        const yearData = data.filter((d) => d.Year === year.toString());

        // Trier les données par émissions totales décroissantes et ne conserver que les 10 premières
        const topData = yearData.sort((a, b) => b.Total - a.Total).slice(0, topCountries);

        // Mettre à jour le domaine de l'échelle x avec la valeur maximale des émissions pour l'année en cours
        x.domain([0, d3.max(topData, d => parseFloat(d.Total))]);
        y.domain(topData.map(d => d.Country));

        // 3. Créez les barres
        const bars = svg.selectAll(".bar")
            .data(topData, d => d.Country);

        // Ajouter les nouvelles barres
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.Country))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", d => x(d.Total));

        // Mettre à jour les barres existantes
        bars.transition()
            .duration(waitMs)
            .attr("y", d => y(d.Country))
            .attr("height", y.bandwidth())
            .attr("x", 0)
            .attr("width", d => x(d.Total));

        // Supprimer les barres inutilisées
        bars.exit()
            .transition()
            .duration(waitMs)
            .attr("width", 0)
            .remove();

        svg.selectAll(".x-axis").remove();
        svg.selectAll(".y-axis").remove();

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Mettre à jour l'année en cours dans l'élément HTML
        d3.select("#current-year").text(`Année : ${year}`);

        // Mettre à jour la position du slider
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

export {graphTop10Country};