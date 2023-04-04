import * as d3 from "d3";
import "./style.css";

import {graphTop10Country} from "./co2PerCapita.js";
import {globe3d} from "./globe3d";


document.getElementById("chart-container").addEventListener("click", function (event) {
    event.stopPropagation();
});

document.addEventListener("DOMContentLoaded", () => {
    const description = document.getElementById("description");
    const globeContainer = document.getElementById("map-container");

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
});