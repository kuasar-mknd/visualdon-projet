import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';

const TopCountriesChart = ({ data, year, category }) => {
  const svgRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Filter data for the selected year
    const yearData = data.filter(d => d.Year === year);
    // Sort by category and take top 10
    const topData = yearData
        .sort((a, b) => parseFloat(b[category]) - parseFloat(a[category]))
        .slice(0, 10);

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 40, left: 150};

    const svg = d3.select(svgRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(topData, d => parseFloat(d[category])) || 0])
        .range([0, width - margin.left - margin.right]);

    const y = d3.scaleBand()
        .range([0, height - margin.top - margin.bottom])
        .domain(topData.map(d => d.Country))
        .padding(0.1);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("color", "white");

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("color", "white")
        .style("font-size", "12px");

    // Title
    svg.append("text")
       .attr("x", (width - margin.left - margin.right) / 2)
       .attr("y", -margin.top / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("fill", "#cbd5e1")
       .text(`${t('top10')} (${year}) - ${category === 'Total' ? t('total') : t('perCapita')}`);

    // Bars
    svg.selectAll(".bar")
        .data(topData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y(d.Country))
        .attr("width", d => x(parseFloat(d[category])))
        .attr("fill", "#4b6cb7");

    // Labels
    svg.selectAll(".label")
        .data(topData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(parseFloat(d[category])) + 5)
        .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 4)
        .text(d => parseFloat(d[category]).toFixed(2))
        .attr("fill", "white")
        .style("font-size", "10px");

  }, [data, year, category]);

  return <div ref={svgRef} className="w-full h-[400px] bg-slate-900 rounded-lg" />;
};

export default TopCountriesChart;
