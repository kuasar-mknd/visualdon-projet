import "./style.css";

import {graphTop10Country} from "./co2PerCapita.js";
import {globe3d} from "./globe3d";


document.getElementById("chart-container").addEventListener("click", function (event) {
    event.stopPropagation();
});
document.getElementById("chart-container").addEventListener("wheel", function (event) {
    event.stopPropagation();
});

document.addEventListener("DOMContentLoaded", () => {
    const description = document.getElementById("description");
    const globeContainer = document.getElementById("map-container");
    const secondChartContainer = document.getElementById("second-chart-container");

    globeContainer.addEventListener("wheel", function (event) {
        event.stopPropagation();
    });

    globe3d().then(() => {
        console.log("Globe loaded");
        setTimeout(() => {
            description.style.opacity = 1;
        }, 1000);

        setTimeout(() => {
            globeContainer.style.opacity = 1;
        }, 1500);
    });

    graphTop10Country();

    window.addEventListener("wheel", function (event) {
        if (event.deltaY > 0) {
            // Scrolling vers le bas
            description.style.opacity = 0;
            globeContainer.style.opacity = 0;
            setTimeout(() => {
                description.style.visibility = "hidden";
                description.style.display = "none";
                globeContainer.style.visibility = "hidden";
                globeContainer.style.display = "none";
                secondChartContainer.style.visibility = "visible";
                secondChartContainer.style.display = "block";
                setTimeout(() => {
                    secondChartContainer.style.opacity = 1;
                }, 500);
            }, 1000);

        } else {
            // Scrolling vers le haut
            secondChartContainer.style.opacity = 0;
            setTimeout(() => {
                secondChartContainer.style.visibility = "hidden";
                secondChartContainer.style.display = "none";
                description.style.visibility = "visible";
                description.style.display = "block";
                globeContainer.style.visibility = "visible";
                globeContainer.style.display = "block";
                setTimeout(() => {
                    description.style.opacity = 1;
                    globeContainer.style.opacity = 1;
                }, 500);
            }, 1000);

        }
    });


});