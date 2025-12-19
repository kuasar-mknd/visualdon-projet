import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';

const TopCountriesChart = ({ data, year, category }) => {
  const svgRef = useRef(null);
  const { t, language } = useLanguage();
  const [translatedNames, setTranslatedNames] = useState({});

  // Reset translations when language changes to force re-fetch in new language
  useEffect(() => {
    setTranslatedNames({});
  }, [language]);

  // Fetch translated country names when data changes, but only update state if needed
  useEffect(() => {
    if (!data) return;

    const yearData = data;
    
    // Sort and get top 10
    const topData = yearData
      .filter(d => !isNaN(parseFloat(d[category])) && parseFloat(d[category]) > 0)
      .sort((a, b) => parseFloat(b[category]) - parseFloat(a[category]))
      .slice(0, 10);

    // Identify which countries need translation (not already in cache)
    const neededCodes = topData
      .map(d => d["ISO 3166-1 alpha-3"])
      .filter(code => !translatedNames[code]);

    // Optimization: If all needed codes are already translated, skip processing and re-render
    if (neededCodes.length === 0) return;

    // Fetch missing translations
    const fetchTranslations = async () => {
      const newTranslations = {};
      let hasNewData = false;

      await Promise.all(
        neededCodes.map(async (code) => {
          const name = await fetchCountryDetails(code, language);
          if (name) {
            newTranslations[code] = name;
            hasNewData = true;
          }
        })
      );

      // Only trigger re-render if we actually fetched new data
      if (hasNewData) {
        setTranslatedNames(prev => ({
          ...prev,
          ...newTranslations
        }));
      }
    };

    fetchTranslations();
  }, [data, year, category, language, translatedNames]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // 1. Data Processing - data is already filtered by year and excludes WLD
    const yearData = data;
    
    const topData = yearData
        .filter(d => !isNaN(parseFloat(d[category])) && parseFloat(d[category]) > 0) // Filter NaN for sorting
        .sort((a, b) => parseFloat(b[category]) - parseFloat(a[category]))
        .slice(0, 10);

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight || 400; // Use actual height
    const margin = {top: 40, right: 80, bottom: 40, left: 140}; // Increased bottom margin
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 2. Setup SVG
    const svg = d3.select(svgRef.current);
    
    // Ensure SVG exists and has correct dimensions
    let g = svg.select(".chart-group");
    if (g.empty()) {
        svg.attr("width", width).attr("height", height);
        
        // Add Gradients
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "barGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6"); // Blue-500
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981"); // Emerald-500

        g = svg.append("g")
            .attr("class", "chart-group")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        // Add Title
        svg.append("text")
           .attr("class", "chart-title")
           .attr("x", width / 2)
           .attr("y", 25)
           .attr("text-anchor", "middle")
           .style("font-size", "16px")
           .style("font-weight", "600")
           .style("fill", "#334155"); // Slate-700
    }

    // Update Title
    svg.select(".chart-title")
       .text(`${t('top10')} (${year}) - ${category === 'Total' ? t('total') : t('perCapita')}`);

    // 3. Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(topData, d => parseFloat(d[category])) || 0])
        .range([0, innerWidth]);

    const y = d3.scaleBand()
        .domain(topData.map(d => d["ISO 3166-1 alpha-3"])) // Use ID for tracking
        .range([0, innerHeight])
        .padding(0.2);

    // 4. Drawing Bars (Join Pattern)
    const tTransition = svg.transition().duration(750).ease(d3.easeCubicOut);

    // Bind data using ISO code as key for object constancy
    const bars = g.selectAll(".bar-group")
        .data(topData, d => d["ISO 3166-1 alpha-3"]);

    // EXIT
    bars.exit()
        .transition(tTransition)
        .style("opacity", 0)
        .attr("transform", `translate(0, ${innerHeight})`)
        .remove();

    // ENTER
    const enter = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d["ISO 3166-1 alpha-3"])})`)
        .style("opacity", 0);

    enter.append("rect")
        .attr("class", "bar-rect")
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", "url(#barGradient)")
        .attr("width", 0); // Start width 0

    enter.append("text")
        .attr("class", "country-label")
        .attr("x", -10)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", "#475569") // Slate-600
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(d => translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country);

    enter.append("text")
        .attr("class", "value-label")
        .attr("x", 5) // Initial position
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "#1e293b") // Slate-800
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("opacity", 0);

    // UPDATE (Merge Enter + Update)
    const update = enter.merge(bars);

    update.transition(tTransition)
        .attr("transform", d => `translate(0, ${y(d["ISO 3166-1 alpha-3"])})`)
        .style("opacity", 1);

    update.select(".bar-rect")
        .transition(tTransition)
        .attr("width", d => x(parseFloat(d[category])))
        .attr("height", y.bandwidth());

    update.select(".country-label")
        .text(d => translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country); // Update with translated name

    update.select(".value-label")
        .transition(tTransition)
        .attr("x", d => x(parseFloat(d[category])) + 8)
        .style("opacity", 1)
        .tween("text", function(d) {
            const i = d3.interpolateNumber(parseFloat(this.textContent) || 0, parseFloat(d[category]));
            return function(t) {
                this.textContent = i(t).toFixed(1);
            };
        });

  }, [data, year, category, t, translatedNames]);

  return <svg ref={svgRef} className="w-full h-full rounded-lg" />;
};

TopCountriesChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    Country: PropTypes.string,
    "ISO 3166-1 alpha-3": PropTypes.string,
    // Dynamic access for category, so we can't be too strict here without listing all possible categories
  })).isRequired,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  category: PropTypes.string.isRequired,
};

export default TopCountriesChart;
