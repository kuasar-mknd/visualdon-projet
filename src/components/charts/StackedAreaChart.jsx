import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../../context/LanguageContext';

const StackedAreaChart = ({ 
  years, 
  emissionData, 
  sectors, 
  width, 
  height, 
  padding, 
  colorMapping 
}) => {
  const containerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous
    d3.select(containerRef.current).selectAll("*").remove();

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Prepare stacked data
    const stackData = years.map(year => {
      const yearData = emissionData.find(d => +d.Year === year);
      const obj = { year };
      sectors.forEach(sector => {
        obj[sector] = +(yearData[sector] || 0);
      });
      return obj;
    });

    const stack = d3.stack()
      .keys(sectors)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(stackData);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([padding.left, width - padding.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
      .nice()
      .range([height - padding.bottom, padding.top]);

    // Area generator
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Shared handlers
    const handleInteractionStart = function(event, d) {
        d3.select(this).attr('opacity', 1);

        // Highlight in legend
        svg.selectAll('.legend-row')
          .attr('opacity', row => row === d.key ? 1 : 0.3);
    };

    const handleInteractionEnd = function() {
        d3.select(this).attr('opacity', 0.8);
        svg.selectAll('.legend-row').attr('opacity', 1);
    };

    // Draw areas
    svg.selectAll('.area')
      .data(series)
      .join('path')
      .attr('class', 'area')
      .attr('fill', d => colorMapping[d.key])
      .attr('d', area)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .attr("tabindex", "0")
      .attr("role", "button")
      .attr("aria-label", d => t(`sectors.${d.key}`) || d.key)
      .on('mouseover', handleInteractionStart)
      .on('focus', handleInteractionStart)
      .on('mouseout', handleInteractionEnd)
      .on('blur', handleInteractionEnd);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10);
    svg.append("g")
      .attr("transform", `translate(0, ${height - padding.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll("text")
          .attr("fill", "#64748b")
          .attr("font-size", "12px"))
      .call(g => g.selectAll("line").attr("stroke", "#94a3b8"))
      .call(g => g.select(".domain").attr("stroke", "#94a3b8"));

    const yAxis = d3.axisLeft(yScale).ticks(8);
    svg.append("g")
      .attr("transform", `translate(${padding.left}, 0)`)
      .call(yAxis)
      .call(g => g.selectAll("text")
          .attr("fill", "#64748b")
          .attr("font-size", "12px"))
      .call(g => g.selectAll("line").attr("stroke", "#94a3b8"))
      .call(g => g.select(".domain").attr("stroke", "#94a3b8"));

    // Labels
    svg.append("text")
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

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - padding.right + 20}, ${padding.top})`);
    
    sectors.forEach((sector, i) => {
      const legendRow = legend.append("g")
        .attr("class", "legend-row")
        .attr("transform", `translate(0, ${i * 28})`)
        .datum(sector)
        .style("cursor", "pointer")
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", t(`sectors.${sector}`) || sector)
        .on("mouseover focus", function(event, hoveredSector) {
          // Handle both MouseEvent and FocusEvent (where data is attached to element)
          const key = hoveredSector || d3.select(this).datum();
          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', d => d.key === key ? 1 : 0.2);
        })
        .on("mouseout blur", function() {
          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        })
        .on("keydown", function(event) {
             if (event.key === "Enter" || event.key === " ") {
                 event.preventDefault();
                 // Visual feedback is handled by focus
             }
         });

      legendRow.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", colorMapping[sector])
        .attr("rx", 2);

      legendRow.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .text(t(`sectors.${sector}`) || sector)
        .attr("fill", "#475569")
        .style("font-size", "13px")
        .style("font-weight", "500");
    });

  }, [years, emissionData, sectors, width, height, padding, colorMapping, t]);

  return <div ref={containerRef} className="w-full h-full" />;
};

StackedAreaChart.propTypes = {
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
  emissionData: PropTypes.arrayOf(PropTypes.object).isRequired,
  sectors: PropTypes.arrayOf(PropTypes.string).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  padding: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  }).isRequired,
  colorMapping: PropTypes.object.isRequired
};

// Optimization: Memoize the component to prevent re-renders when parent re-renders but props are same.
export default React.memo(StackedAreaChart);
