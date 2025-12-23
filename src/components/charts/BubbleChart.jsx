import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../../context/LanguageContext';

const BubbleChart = ({ 
  chartData, 
  width, 
  height, 
  padding, 
  split, 
  colorMapping 
}) => {
  const containerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!containerRef.current || !chartData || chartData.length === 0) return;

    // Clear previous
    d3.select(containerRef.current).selectAll("*").remove();

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year))
        .range([padding.left, width - padding.right]);

    const maxValue = d3.max(chartData, d => d.value);
    const yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([height - padding.bottom, padding.top]);

    const sizeScale = d3.scaleSqrt()
        .domain([0, maxValue])
        .range([1.5, 7]); 

    const yScaleSplit = d3.scalePoint()
        .domain(Object.keys(colorMapping))
        .range([padding.top + 50, height - padding.bottom - 50])
        .padding(1.2); 

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(6);
    svg.append("g")
        .attr("transform", `translate(0, ${height - padding.bottom})`)
        .call(xAxis)
        .call(g => g.selectAll("text")
            .attr("fill", "#64748b")
            .attr("font-size", "11px"))
        .call(g => g.selectAll("line").attr("stroke", "#94a3b8"))
        .call(g => g.select(".domain").attr("stroke", "#94a3b8"));

    const yAxis = d3.axisLeft(yScale).ticks(5);
    const yAxisGroup = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${padding.left}, 0)`)
        .style("display", split ? "none" : "block") 
        .call(yAxis)
        .call(g => g.selectAll("text")
            .attr("fill", "#64748b")
            .attr("font-size", "11px"))
        .call(g => g.selectAll("line").attr("stroke", "#94a3b8"))
        .call(g => g.select(".domain").attr("stroke", "#94a3b8"));

    // Labels
    const yAxisLabel = svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", padding.left - 45)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .text("Émissions (MtCO₂)");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#475569")
        .attr("font-size", "13px")
        .attr("font-weight", "500")
        .text("Année");

    // Title
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", 25)
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .style("font-weight", "600")
       .style("fill", "#334155");

    // Add clip path
    svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", padding.left)
      .attr("y", padding.top)
      .attr("width", width - padding.left - padding.right)
      .attr("height", height - padding.top - padding.bottom);

    // Create clipped group
    const bubblesGroup = svg.append("g")
      .attr("clip-path", "url(#chart-clip)");

    // Bubbles
    const bubbles = bubblesGroup.selectAll(".bubble")
        .data(chartData)
        .enter()
        .append("g")
        .attr("class", "bubble-group");

    // Shared handlers for mouse and keyboard interactions
    const handleInteractionStart = function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .attr("stroke-width", 3);

        // Remove existing tooltips to prevent duplicates
        svg.selectAll(".tooltip").remove();

        const tooltip = svg.append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(${xScale(d.year)}, ${yScale(d.value) - sizeScale(d.value) - 10})`);

        const text = `${t(`sectors.${d.sector}`)}: ${d.value.toFixed(1)} MtCO₂`;
        const bbox = {width: text.length * 7, height: 20};

        tooltip.append("rect")
            .attr("x", -bbox.width / 2 - 5)
            .attr("y", -bbox.height - 5)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 10)
            .attr("fill", "#1e293b")
            .attr("rx", 4)
            .attr("stroke", d.color)
            .attr("stroke-width", 2);

        tooltip.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -bbox.height / 2)
            .attr("fill", "white")
            .attr("font-size", "13px")
            .attr("font-weight", "500")
            .text(text);
    };

    const handleInteractionEnd = function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 0.7)
            .attr("stroke-width", 2);

        svg.selectAll(".tooltip").remove();
    };

    bubbles.append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.value))
        .attr("r", d => sizeScale(d.value))
        .attr("fill", d => d.color)
        .attr("opacity", 0.7)
        .attr("stroke", d => d.color)
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", d => `${t(`sectors.${d.sector}`)}: ${d.value.toFixed(1)} MtCO₂`)
        .on("mouseover", handleInteractionStart)
        .on("focus", handleInteractionStart)
        .on("mouseout", handleInteractionEnd)
        .on("blur", handleInteractionEnd);

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - padding.right + 20}, ${padding.top})`);
    
    Object.entries(colorMapping).forEach(([sector, color], i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 28})`)
            .style("cursor", "pointer")
            .attr("tabindex", "0")
            .attr("role", "button")
            .attr("aria-label", t(`sectors.${sector}`) || sector)
            .on("mouseover focus", function() {
                bubbles.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("opacity", d => d.sector === sector ? 1 : 0.2);
            })
            .on("mouseout blur", function() {
                bubbles.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.7);
            })
            .on("keydown", function(event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    // No persistent state to toggle, but prevents scrolling
                }
            });

        legendRow.append("circle")
            .attr("cx", 8)
            .attr("cy", 0)
            .attr("r", 8)
            .attr("fill", color);

        legendRow.append("text")
            .attr("x", 22)
            .attr("y", 4)
            .text(t(`sectors.${sector}`) || sector)
            .attr("fill", "#475569")
            .style("font-size", "13px")
            .style("font-weight", "500");
    });

    // Simulation
    const centerY = (height - padding.top - padding.bottom) / 2 + padding.top;
    const simulation = d3.forceSimulation(chartData)
        .force("x", d3.forceX(d => xScale(d.year)).strength(1))
        .force("y", d3.forceY(split ? d => yScaleSplit(d.sector) : centerY).strength(split ? 0.5 : 0.1))
        .force("collide", d3.forceCollide(d => sizeScale(d.value) + 1.5).strength(0.95))
        .on("tick", () => {
             bubbles.selectAll("circle")
                .attr("cx", d => {
                  const r = sizeScale(d.value);
                  return Math.max(padding.left + r, Math.min(width - padding.right - r, d.x));
                })
                .attr("cy", d => {
                  const r = sizeScale(d.value);
                  return Math.max(padding.top + r, Math.min(height - padding.bottom - r, d.y));
                });
        });

    if (split) {
        simulation.force("y", d3.forceY(d => yScaleSplit(d.sector)).strength(0.5));
        simulation.alpha(1).restart();
        yAxisGroup.style("display", "none");
        yAxisLabel.style("display", "none");
    } else {
        simulation.force("y", d3.forceY(centerY).strength(0.1));
        simulation.alpha(1).restart();
        yAxisGroup.style("display", "block");
        yAxisLabel.style("display", "block");
    }

    return () => simulation.stop();

  }, [chartData, width, height, padding, split, colorMapping, t]);

  return <div ref={containerRef} className="w-full h-full" />;
};

BubbleChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number,
    value: PropTypes.number,
    sector: PropTypes.string,
    color: PropTypes.string
  })).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  padding: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  }).isRequired,
  split: PropTypes.bool.isRequired,
  colorMapping: PropTypes.object.isRequired
};

// Optimization: Memoize the component to prevent re-renders when parent re-renders but props are same.
export default React.memo(BubbleChart);
