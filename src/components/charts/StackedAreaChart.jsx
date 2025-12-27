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
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        // Highlight in legend
        svg.selectAll('.legend-row')
          .attr('opacity', row => row === d.key ? 1 : 0.3);
    };

    const handleInteractionEnd = function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');
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
          .attr("fill", "#cbd5e1")
          .attr("font-size", "12px"))
      .call(g => g.selectAll("line").attr("stroke", "#475569"))
      .call(g => g.select(".domain").attr("stroke", "#475569"));

    const yAxis = d3.axisLeft(yScale).ticks(8);
    svg.append("g")
      .attr("transform", `translate(${padding.left}, 0)`)
      .call(yAxis)
      .call(g => g.selectAll("text")
          .attr("fill", "#cbd5e1")
          .attr("font-size", "12px"))
      .call(g => g.selectAll("line").attr("stroke", "#475569"))
      .call(g => g.select(".domain").attr("stroke", "#475569"));

    // Labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", padding.left - 45)
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .text("Émissions (MtCO₂)");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
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
      .style("fill", "#e2e8f0");

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
        .on("keydown", function(event) {
             if (event.key === "Enter" || event.key === " ") {
                 event.preventDefault();
                 // Visual feedback is handled by focus
             }
         });

      // Focus indicator
      legendRow.append("rect")
        .attr("class", "focus-indicator")
        .attr("x", -5)
        .attr("y", -4)
        .attr("width", 120)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("fill", "none")
        .attr("stroke", "none")
        .attr("stroke-width", 2);

      legendRow.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", colorMapping[sector])
        .attr("rx", 2);

      legendRow.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .text(t(`sectors.${sector}`) || sector)
        .attr("fill", "#cbd5e1")
        .style("font-size", "13px")
        .style("font-weight", "500");

      // Interaction listeners must be attached after elements are created to reference them if needed,
      // but here we attach to the group.
      legendRow.on("mouseover focus", function(event, hoveredSector) {
          // Handle both MouseEvent and FocusEvent (where data is attached to element)
          const key = hoveredSector || d3.select(this).datum();

          d3.select(this).select(".focus-indicator").attr("stroke", "#3b82f6");

          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', d => d.key === key ? 1 : 0.2);
        })
        .on("mouseout blur", function() {
          d3.select(this).select(".focus-indicator").attr("stroke", "none");

          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        });
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
