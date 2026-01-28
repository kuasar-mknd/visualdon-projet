import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  select,
  stack,
  stackOrderNone,
  stackOffsetNone,
  scaleLinear,
  extent,
  max,
  area,
  curveMonotoneX,
  axisBottom,
  format,
  axisLeft
} from 'd3';
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
    select(containerRef.current).selectAll("*").remove();

    const svg = select(containerRef.current)
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

    const stackGen = stack()
      .keys(sectors)
      .order(stackOrderNone)
      .offset(stackOffsetNone);

    const series = stackGen(stackData);

    // Scales
    const xScale = scaleLinear()
      .domain(extent(years))
      .range([padding.left, width - padding.right]);

    const yScale = scaleLinear()
      .domain([0, max(series, s => max(s, d => d[1]))])
      .nice()
      .range([height - padding.bottom, padding.top]);

    // Area generator
    const areaGen = area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(curveMonotoneX);

    // Shared handlers
    const handleInteractionStart = function(event, d) {
        select(this)
            .attr('opacity', 1)
            .attr("stroke", "#3b82f6") // Blue focus ring
            .attr("stroke-width", 2);

        // Highlight in legend
        svg.selectAll('.legend-row')
          .attr('opacity', row => row === d.key ? 1 : 0.3);
    };

    const handleInteractionEnd = function() {
        select(this)
            .attr('opacity', 0.8)
            .attr("stroke", null)
            .attr("stroke-width", 0);

        svg.selectAll('.legend-row').attr('opacity', 1);
    };

    // Draw areas
    svg.selectAll('.area')
      .data(series)
      .join('path')
      .attr('class', 'area')
      .attr('fill', d => colorMapping[d.key])
      .attr('d', areaGen)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .style("outline", "none")
      .attr("tabindex", "0")
      .attr("role", "button")
      .attr("aria-label", d => t(`sectors.${d.key}`) || d.key)
      .on('mouseover', handleInteractionStart)
      .on('focus', handleInteractionStart)
      .on('mouseout', handleInteractionEnd)
      .on('blur', handleInteractionEnd);

    // Axes
    const xAxis = axisBottom(xScale).tickFormat(format("d")).ticks(10);
    svg.append("g")
      .attr("transform", `translate(0, ${height - padding.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll("text")
          .attr("fill", "#64748b")
          .attr("font-size", "11px"))
      .call(g => g.selectAll("line").attr("stroke", "#94a3b8"))
      .call(g => g.select(".domain").attr("stroke", "#94a3b8"));

    const yAxis = axisLeft(yScale).ticks(8);
    svg.append("g")
      .attr("transform", `translate(${padding.left}, 0)`)
      .call(yAxis)
      .call(g => g.selectAll("text")
          .attr("fill", "#64748b")
          .attr("font-size", "11px"))
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
        .style("outline", "none")
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", t(`sectors.${sector}`) || sector)
        .on("mouseover focus", function(event, hoveredSector) {
          // Handle both MouseEvent and FocusEvent
          const key = hoveredSector || select(this).datum();

          // Visual feedback for legend item itself
          select(this).select(".legend-bg").attr("opacity", 1);

          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', d => d.key === key ? 1 : 0.2);
        })
        .on("mouseout blur", function() {
          // Reset legend item visual
          select(this).select(".legend-bg").attr("opacity", 0);

          svg.selectAll('.area')
            .transition()
            .duration(200)
            .attr('opacity', 0.8);
        })
        .on("keydown", function(event) {
             if (event.key === "Enter" || event.key === " ") {
                 event.preventDefault();
             }
         });

      // Focus background
      legendRow.append("rect")
        .attr("class", "legend-bg")
        .attr("x", -4)
        .attr("y", -4)
        .attr("width", 140)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("fill", "#f1f5f9") // Slate-100
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 1)
        .attr("opacity", 0);

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

export default React.memo(StackedAreaChart);
