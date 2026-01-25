import React, { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';

const TopCountriesChart = ({ data, year, category, isPlaying, onCountrySelect, displayCategory }) => {
  const svgRef = useRef(null);
  const { t, language } = useLanguage();
  const [translatedNames, setTranslatedNames] = useState({});

  // Reset translations when language changes to force re-fetch in new language
  useEffect(() => {
    setTranslatedNames({});
  }, [language]);

  // Optimization: Memoize the filtered and sorted topData calculation
  const topData = useMemo(() => {
    if (!data) return [];
    
    // Optimization: Data is pre-sorted by 'Total' in App.jsx.
    // Since category is 'Total' (or mapped to it), we can take a fast path O(K) instead of O(N log N) + O(N).
    // This is significant during animation frames.
    if (category === 'Total') {
        const result = [];
        // Iterate until we find 10 positive items or exhaust the list
        // Since it's sorted descending, we can stop early.
        for (let i = 0; i < data.length && result.length < 10; i++) {
            const val = data[i].Total || 0;
            if (val > 0) {
                result.push(data[i]);
            } else if (val <= 0) {
                 // Optimization: sorted descending, so no more positive values exist
                 break;
            }
        }
        return result;
    }

    // Fallback for other categories (if any in future)
    return data
      .filter(d => (d[category] || 0) > 0)
      .sort((a, b) => (b[category] || 0) - (a[category] || 0))
      .slice(0, 10);
  }, [data, category]);

  // Fetch translated country names when topData changes
  useEffect(() => {
    const neededCodes = topData
      .map(d => d["ISO 3166-1 alpha-3"])
      .filter(code => !translatedNames[code]);

    if (neededCodes.length === 0) return;

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

      if (hasNewData) {
        setTranslatedNames(prev => ({
          ...prev,
          ...newTranslations
        }));
      }
    };

    fetchTranslations();
  }, [topData, language, translatedNames]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight || 400;
    const margin = {top: 40, right: 80, bottom: 40, left: 140};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Determine the display title based on displayCategory prop (fallback to category logic)
    const isPerCapita = displayCategory === 'Per Capita' || category === 'Per Capita';
    const titleText = `${t('top10')} (${year}) - ${isPerCapita ? t('perCapita') : t('total')}`;

    svg.attr("role", "graphics-document")
       .attr("aria-label", titleText);

    if (svg.select("title").empty()) {
        svg.append("title").text(titleText);
        svg.append("desc").text(t('subtitle'));
    } else {
        svg.select("title").text(titleText);
    }
    
    let g = svg.select(".chart-group");
    if (g.empty()) {
        svg.attr("width", width).attr("height", height);
        
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "barGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981");

        g = svg.append("g")
            .attr("class", "chart-group")
            .attr("role", "list")
            .attr("aria-label", t('top10'))
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        svg.append("text")
           .attr("class", "chart-title")
           .attr("x", width / 2)
           .attr("y", 25)
           .attr("text-anchor", "middle")
           .style("font-size", "16px")
           .style("font-weight", "600")
           .style("fill", "#334155")
           .attr("aria-hidden", "true");
    }

    svg.select(".chart-title")
       .text(titleText);

    if (topData.length === 0) {
        g.selectAll("*").remove();
        g.append("text")
         .attr("class", "no-data-message")
         .attr("role", "status")
         .attr("x", innerWidth / 2)
         .attr("y", innerHeight / 2)
         .attr("text-anchor", "middle")
         .attr("fill", "#64748b")
         .text(t('noData'));
        return;
    }

    g.selectAll(".no-data-message").remove();

    const x = d3.scaleLinear()
        .domain([0, d3.max(topData, d => d[category] || 0) || 0])
        .range([0, innerWidth]);

    const y = d3.scaleBand()
        .domain(topData.map(d => d["ISO 3166-1 alpha-3"]))
        .range([0, innerHeight])
        .padding(0.2);

    // Optimization: Adjust transition duration based on playback state
    // When playing, we need faster transitions (200ms) to match the tick rate and avoid "lag"
    // When paused, we use a smoother, longer transition (750ms)
    const transitionDuration = isPlaying ? 200 : 750;
    const tTransition = svg.transition().duration(transitionDuration).ease(d3.easeCubicOut);

    const bars = g.selectAll(".bar-group")
        .data(topData, d => d["ISO 3166-1 alpha-3"]);

    bars.exit()
        .transition(tTransition)
        .style("opacity", 0)
        .attr("transform", `translate(0, ${innerHeight})`)
        .remove();

    const handleInteractionStart = function() {
        g.selectAll(".bar-group")
         .transition()
         .duration(200)
         .style("opacity", 0.5);

        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .select(".bar-rect")
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 2);
    };

    const handleInteractionEnd = function() {
        g.selectAll(".bar-group")
         .transition()
         .duration(200)
         .style("opacity", 1);

        d3.select(this)
          .select(".bar-rect")
          .attr("stroke", "none");
    };

    const enter = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d["ISO 3166-1 alpha-3"])})`)
        .style("opacity", 0)
        .style("cursor", "pointer")
        .style("outline", "none")
        .attr("tabindex", "0")
        .attr("role", "listitem")
        .attr("aria-label", d => {
            const name = translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country;
            const val = (d[category] || 0).toFixed(1);
            return `${name}: ${val}`;
        })
        .on("mouseover", handleInteractionStart)
        .on("mouseout", handleInteractionEnd)
        .on("focus", handleInteractionStart)
        .on("blur", handleInteractionEnd)
        .on("click", (event, d) => {
          if (onCountrySelect) onCountrySelect(d["ISO 3166-1 alpha-3"]);
        })
        .on("keydown", (event, d) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (onCountrySelect) onCountrySelect(d["ISO 3166-1 alpha-3"]);
          }
        });

    // UX: Add a transparent hit area to make the entire row clickable, not just the bar/text
    enter.append("rect")
        .attr("width", innerWidth)
        .attr("height", y.bandwidth())
        .attr("fill", "transparent");

    enter.append("rect")
        .attr("class", "bar-rect")
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", "url(#barGradient)")
        .attr("width", 0);

    enter.append("text")
        .attr("class", "country-label")
        .attr("x", -10)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", "#475569")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text(d => translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country);

    enter.append("text")
        .attr("class", "value-label")
        .attr("x", 5)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "#1e293b")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("opacity", 0);

    const update = enter.merge(bars);

    update.transition(tTransition)
        .attr("transform", d => `translate(0, ${y(d["ISO 3166-1 alpha-3"])})`)
        .style("opacity", 1);

    update.select(".bar-rect")
        .transition(tTransition)
        .attr("width", d => x(d[category] || 0))
        .attr("height", y.bandwidth());

    update.select(".country-label")
        .text(d => translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country);

    update.attr("aria-label", d => {
        const name = translatedNames[d["ISO 3166-1 alpha-3"]] || d.Country;
        const val = (d[category] || 0).toFixed(1);
        return `${name}: ${val}`;
    });

    update.select(".value-label")
        .transition(tTransition)
        .attr("x", d => x(d[category] || 0) + 8)
        .style("opacity", 1)
        .tween("text", function(d) {
            const i = d3.interpolateNumber(parseFloat(this.textContent) || 0, d[category] || 0);
            return function(t) {
                this.textContent = i(t).toFixed(1);
            };
        });

  }, [data, topData, year, category, t, translatedNames, isPlaying, onCountrySelect, displayCategory]);

  return <svg ref={svgRef} className="w-full h-full rounded-lg" />;
};

TopCountriesChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    Country: PropTypes.string,
    "ISO 3166-1 alpha-3": PropTypes.string,
    Total: PropTypes.number, // Required for optimized sorting
  })).isRequired,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  category: PropTypes.string.isRequired,
  isPlaying: PropTypes.bool,
  onCountrySelect: PropTypes.func,
  displayCategory: PropTypes.string,
};

TopCountriesChart.defaultProps = {
  isPlaying: false,
  onCountrySelect: () => {},
};

export default React.memo(TopCountriesChart);
