import "./style.css";
import * as d3 from "d3";

import {graphTop10Country} from "./co2PerCapita.js";
import {globe3d} from "./globe3d";

const dropdownBtn = document.getElementById("dropdown-btn");
const dropdownMenu = document.getElementById("dropdown-menu");
const perCapitaCheckbox = document.getElementById("per-capita-checkbox");
let timeoutId;
let startY;

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

    Promise.all([
        d3.csv("./data/GCB2022v27_MtCO2_flat-clean.csv"),
        d3.json("./data/countries-coastline-10km.geo.json"),
        d3.csv("./data/GCB2022v27_percapita_flat-clean.csv")
    ]).then(function (values) {

    globe3d(values[0], values[1], 11400).then(() => {
        console.log("Globe loaded");
        setTimeout(() => {
            description.style.opacity = 1;
        }, 1000);

        setTimeout(() => {
            globeContainer.style.opacity = 1;
        }, 1500);
    });

    graphTop10Country(values[2]);

    perCapitaCheckbox.addEventListener("change", function() {
        //clean div id timeline-container
        document.getElementById("timeline-container").innerHTML = "";
        document.getElementById("globe-container").innerHTML = "";
        
        if (perCapitaCheckbox.checked) {
        globe3d(values[2], values[1], 30)
        } else {
        globe3d(values[0], values[1], 11400)
        }
    });
});



    dropdownBtn.addEventListener("click", function() {
        if (dropdownMenu.style.display === "none" || dropdownMenu.style.display === "") {
          dropdownMenu.style.display = "flex";
        } else {
          dropdownMenu.style.display = "none";
        }
      });
      
      dropdownMenu.addEventListener("mouseleave", function() {
        timeoutId = setTimeout(function() {
          dropdownMenu.style.display = "none";
        }, 3000);
      });
      
      dropdownMenu.addEventListener("mouseenter", function() {
        clearTimeout(timeoutId);
      });


    function handleScroll(event, deltaY) {

        // Hauteur totale du document
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

        // Hauteur de la fenêtre
        const windowHeight = window.innerHeight;

        // Position actuelle du scroll
        const currentScrollY = window.scrollY;

        console.log(event.deltaY > 0 && currentScrollY + windowHeight >= documentHeight)
        console.log(event.deltaY)
        console.log(currentScrollY + windowHeight, documentHeight)

        if (deltaY > 0 && Math.ceil(currentScrollY + windowHeight) >= documentHeight) {
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

        } else if (deltaY < 0 && currentScrollY === 0) {
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
            }, 500);

        }
    }

    window.addEventListener("wheel", function (event) {
        handleScroll(event, event.deltaY);
    });

    window.addEventListener("touchstart", function (event) {

        startY = event.touches[0].clientY;
    });

    window.addEventListener("touchmove", function (event) {
        if (startY === null) {
            return;
        }

        const deltaY = startY - event.touches[0].clientY;
        handleScroll(event, deltaY);
        startY = null;
    });
});