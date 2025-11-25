import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';

const colorMapping = {
    'Coal': '#3b82f6',
    'Oil': '#f97316',
    'Gas': '#10b981',
    'Cement': '#ef4444',
    'Flaring': '#a855f7',
    'Other': '#eab308'
};

const CountryChart = ({ countryCode, year, emissionsData }) => {
  const containerRef = useRef(null);
  const [split, setSplit] = useState(false);
  const [viewMode, setViewMode] = useState('bubbles'); // 'bubbles' or 'lines'
  const [countryName, setCountryName] = useState('');
  const { t, language } = useLanguage();

  // Fetch translated country name
  useEffect(() => {
    if (!countryCode) return;
    
    fetchCountryDetails(countryCode, language).then(name => {
      if (name) setCountryName(name);
    });
  }, [countryCode, language]);

  useEffect(() => {
    if (!countryCode || !emissionsData || !containerRef.current) return;

    const emissionData = emissionsData.filter(e => e["ISO 3166-1 alpha-3"] === countryCode);
    if (emissionData.length === 0) return;

    // Clear previous chart
    d3.select(containerRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;
    const padding = {top: 60, right: 160, bottom: 60, left: 70};

    const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add background
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#0f172a");

    const countryName = emissionData[0].Country;

    if (viewMode === 'bubbles') {
      // ===== BUBBLE CHART MODE =====
      // Process data
      let chartData = [];
      emissionData.forEach(yearData => {
          const yearNum = +yearData.Year;
          for (let sector of Object.keys(colorMapping)) {
              const value = +yearData[sector];
              if (value > 0) {
                  chartData.push({
                      year: yearNum, 
                      sector: sector, 
                      value: value, 
                      color: colorMapping[sector]
                  });
              }
          }
      });

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
          .range([1.5, 7]); // Increased to 7px for better visibility

      const yScaleSplit = d3.scalePoint()
          .domain(Object.keys(colorMapping))
          .range([padding.top + 50, height - padding.bottom - 50])
          .padding(1.2); // Increased from 0.5 for better spacing in split mode

      // Axes
      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(6); // Reduced to 6 to avoid overlap
      svg.append("g")
          .attr("transform", `translate(0, ${height - padding.bottom})`)
          .call(xAxis)
          .call(g => g.selectAll("text")
              .attr("fill", "#cbd5e1")
              .attr("font-size", "11px"))
          .call(g => g.selectAll("line").attr("stroke", "#475569"))
          .call(g => g.select(".domain").attr("stroke", "#475569"));

      const yAxis = d3.axisLeft(yScale).ticks(5);
      const yAxisGroup = svg.append("g")
          .attr("class", "y-axis")
          .attr("transform", `translate(${padding.left}, 0)`)
          .style("display", split ? "none" : "block") // Conditional display
          .call(yAxis)
          .call(g => g.selectAll("text")
              .attr("fill", "#cbd5e1")
              .attr("font-size", "11px"))
          .call(g => g.selectAll("line").attr("stroke", "#475569"))
          .call(g => g.select(".domain").attr("stroke", "#475569"));

      // Labels
      const yAxisLabel = svg.append("text")
          .attr("class", "y-axis-label")
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
         .style("fill", "#e2e8f0")
         .text(`${t('emissionsBySector')} - ${countryName}`);

      // Add clip path to prevent bubbles from overflowing
      svg.append("defs")
        .append("clipPath")
        .attr("id", "chart-clip")
        .append("rect")
        .attr("x", padding.left)
        .attr("y", padding.top)
        .attr("width", width - padding.left - padding.right)
        .attr("height", height - padding.top - padding.bottom);

      // Create clipped group for bubbles
      const bubblesGroup = svg.append("g")
        .attr("clip-path", "url(#chart-clip)");

      // Bubbles
      const bubbles = bubblesGroup.selectAll(".bubble")
          .data(chartData)
          .enter()
          .append("g")
          .attr("class", "bubble-group");

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
          .on("mouseover", function(event, d) {
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("opacity", 1)
                  .attr("stroke-width", 3);
              
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
          })
          .on("mouseout", function() {
              d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("opacity", 0.7)
                  .attr("stroke-width", 2);
              
              svg.selectAll(".tooltip").remove();
          });

      // Legend
      const legend = svg.append("g")
          .attr("transform", `translate(${width - padding.right + 20}, ${padding.top})`);
      
      Object.entries(colorMapping).forEach(([sector, color], i) => {
          const legendRow = legend.append("g")
              .attr("transform", `translate(0, ${i * 28})`)
              .style("cursor", "pointer")
              .on("mouseover", function() {
                  bubbles.selectAll("circle")
                      .transition()
                      .duration(200)
                      .attr("opacity", d => d.sector === sector ? 1 : 0.2);
              })
              .on("mouseout", function() {
                  bubbles.selectAll("circle")
                      .transition()
                      .duration(200)
                      .attr("opacity", 0.7);
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
              .attr("fill", "#cbd5e1")
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
                    // Constrain to chart bounds
                    const r = sizeScale(d.value);
                    return Math.max(padding.left + r, Math.min(width - padding.right - r, d.x));
                  })
                  .attr("cy", d => {
                    // Constrain to chart bounds
                    const r = sizeScale(d.value);
                    return Math.max(padding.top + r, Math.min(height - padding.bottom - r, d.y));
                  });
          });

      if (split) {
          simulation.force("y", d3.forceY(d => yScaleSplit(d.sector)).strength(0.5));
          simulation.alpha(1).restart();
          
          // Hide Y-axis in split mode (sectors are shown by color, not by Y position)
          yAxisGroup.style("display", "none");
          yAxisLabel.style("display", "none");
      } else {
          simulation.force("y", d3.forceY(centerY).strength(0.1));
          simulation.alpha(1).restart();
          
          // Show Y-axis in normal mode
          yAxisGroup.style("display", "block");
          yAxisLabel.style("display", "block");
      }

      return () => simulation.stop();

    } else {
      // ===== LINE CHART MODE =====
      const years = emissionData.map(d => +d.Year).sort((a, b) => a - b);
      const sectors = Object.keys(colorMapping);

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

      // Draw areas
      svg.selectAll('.area')
        .data(series)
        .join('path')
        .attr('class', 'area')
        .attr('fill', d => colorMapping[d.key])
        .attr('d', area)
        .attr('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 1);
          
          // Highlight in legend
          svg.selectAll('.legend-row')
            .attr('opacity', row => row === d.key ? 1 : 0.3);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 0.8);
          svg.selectAll('.legend-row').attr('opacity', 1);
        });

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
        .style("fill", "#e2e8f0")
        .text(`${t('emissionsBySector')} - ${countryName}`);

      // Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - padding.right + 20}, ${padding.top})`);
      
      sectors.forEach((sector, i) => {
        const legendRow = legend.append("g")
          .attr("class", "legend-row")
          .attr("transform", `translate(0, ${i * 28})`)
          .datum(sector)
          .style("cursor", "pointer")
          .on("mouseover", function(event, hoveredSector) {
            svg.selectAll('.area')
              .transition()
              .duration(200)
              .attr('opacity', d => d.key === hoveredSector ? 1 : 0.2);
          })
          .on("mouseout", function() {
            svg.selectAll('.area')
              .transition()
              .duration(200)
              .attr('opacity', 0.8);
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
          .attr("fill", "#cbd5e1")
          .style("font-size", "13px")
          .style("font-weight", "500");
      });
    }

  }, [emissionsData, countryCode, split, viewMode, t]);

  if (!countryCode) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p className="text-lg">Sélectionnez un pays pour voir les détails</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('bubbles')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'bubbles'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            🫧 Bulles
          </button>
          <button
            onClick={() => setViewMode('lines')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'lines'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            📈 Graphique empilé
          </button>
        </div>

        {viewMode === 'bubbles' && (
          <label className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">
            <input 
              type="checkbox" 
              checked={split} 
              onChange={(e) => setSplit(e.target.checked)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Séparer par secteur</span>
          </label>
        )}

        <div className="text-xs text-slate-500 italic ml-auto">
          {viewMode === 'bubbles' ? 'Survolez les bulles ou la légende' : 'Survolez les zones ou la légende'}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default CountryChart;
