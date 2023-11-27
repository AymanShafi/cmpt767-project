// Load data from CSV
d3.csv("mrc_table10.csv").then(function(data) {
  // Data preprocessing and filtering
  data = data.filter(function(d) {
    return d.grad_rate_150_p_2013 > 0 && d.scorecard_median_earnings_2011 > 0;
  });

  data.forEach(function(d) {
    d.grad_rate_150_p_2013 = +d.grad_rate_150_p_2013;
    d.scorecard_median_earnings_2011 = +d.scorecard_median_earnings_2011;
    d.ipeds_enrollment_2013 = +d.ipeds_enrollment_2013;
    d.diversity = +d.asian_or_pacific_share_fall_2000 +
      +d.black_share_fall_2000 +
      +d.hisp_share_fall_2000 +
      +d.alien_share_fall_2000;
  });

  // Get unique states, new_filter options, and public values from the data
  var uniqueStates = ['All', ...new Set(data.map(d => d.state))];
  var uniqueTiers = ['All', ...new Set(data.map(d => d.tier_name))];
  var uniquePublics = ['All', 'Yes', 'No']; // Updated public filter options

  // Map '0' to 'No' and '1' to 'Yes' in the 'public' field
  data.forEach(function(d) {
    d.public = d.public === '1' ? 'Yes' : 'No';
  });

  // Populate the filter dropdowns with unique values
  var filterDropdowns = {
    state: d3.select("#select-state-income"),
    tier: d3.select("#select-tier-income"),
    public: d3.select("#select-public-income")
  };

  populateDropdown(filterDropdowns.state, uniqueStates);
  populateDropdown(filterDropdowns.tier, uniqueTiers);
  populateDropdown(filterDropdowns.public, uniquePublics);

  // Add event listeners for filter dropdown changes
  Object.values(filterDropdowns).forEach(function(dropdown) {
    dropdown.on("change", function() {
      var selectedFilters = getSelectedFilters(filterDropdowns);

      // Filter the data based on the selected filters
      var filteredData = filterData(data, selectedFilters);

      // Update the visualization with the new filtered data
      updateIncomeMobilityVisualization(filteredData);
    });
  });

  // Set dimensions and margins
  var margin = { top: 20, right: 40, bottom: 80, left: 80 }, // Adjusted bottom margin for axis labels
      width = 1350 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

  // Append the SVG object to the body of the page
  var svg = d3.select("#income-mobility")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis with label
  var x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);
  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .style("font-size", "14px") // Increased font size
      .text("Graduation Rate (%)");

  // Add Y axis with label
  var y = d3.scaleLinear()
      .domain([0, 120000])
      .range([height, 0]);
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .style("font-size", "14px") // Increased font size
      .text("Median Earnings ($)"); 

  // Add a scale for bubble size
  var z = d3.scaleSqrt()
      .domain([0, 40000])
      .range([2, 30]);

  // Add a tooltip
  var tooltip = d3.select("#income-mobility")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "#fff")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "10px");

  // Define the color scale based on diversity
  var colorScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.diversity))
    .range(["#ADD8E6", "#800080"]);

  // Function to call when you mouseover a bubble
  var mouseover = function(event, d) {
      tooltip.style("opacity", 1);
      d3.select(this)
          .style("stroke", "#000")
          .style("opacity", 1);
  };

  // Function to call when you mouseout a bubble
  var mouseout = function(event, d) {
      tooltip.style("opacity", 0);
      d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8);
  };

  // Function to call when you mousemove over a bubble
  var mousemove = function(event, d) {
      tooltip
          .html(d.name +
              "<br>Earnings: $" + d.scorecard_median_earnings_2011 +
              "<br>Grad Rate: " + (d.grad_rate_150_p_2013 * 100).toFixed(2) + "%" +
              "<br>Enrollment: " + d.ipeds_enrollment_2013 +
              "<br>Diversity: " + (d.diversity * 100).toFixed(2)+ "%")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 50) + "px"); // Adjusted top position
  };

  // Add dots
  svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubbles")
      .attr("cx", function(d) { return x(d.grad_rate_150_p_2013 * 100); })
      .attr("cy", function(d) { return y(d.scorecard_median_earnings_2011); })
      .attr("r", function(d) { return z(d.ipeds_enrollment_2013); })
      .style("fill", function(d) { return colorScale(d.diversity); })
      .style("opacity", "0.8")
      .attr("stroke", "white")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseout);

  // Add legend for diversity
  var defs = svg.append("defs");

  var linearGradient = defs.append("linearGradient")
      .attr("id", "legendGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

  linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(0));

  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(1));

  var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width - 150) + "," + (height - 40) + ")");

  legend.append("rect")
      .attr("width", 150)
      .attr("height", 20)
      .style("fill", "url(#legendGradient)");

  legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("dy", "0.32em")
      .attr("fill", "#fff")
      .text("Diversity");

  // Function to update the income mobility visualization based on filtered data
  function updateIncomeMobilityVisualization(filteredData) {
      // Remove existing circles
      svg.selectAll(".bubbles").remove();

      // Redraw circles based on the filtered data
      svg.selectAll("dot")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("class", "bubbles")
          .attr("cx", function(d) { return x(d.grad_rate_150_p_2013 * 100); })
          .attr("cy", function(d) { return y(d.scorecard_median_earnings_2011); })
          .attr("r", function(d) { return z(d.ipeds_enrollment_2013); })
          .style("fill", function(d) { return colorScale(d.diversity); })
          .style("opacity", "0.8")
          .attr("stroke", "white")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseout);
  }

  // Helper function to populate dropdown with options
  function populateDropdown(dropdown, options) {
    dropdown.selectAll("option")
      .data(options)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
  }

  // Helper function to get selected filters
  function getSelectedFilters(dropdowns) {
    var selectedFilters = {};
    Object.keys(dropdowns).forEach(function(key) {
      selectedFilters[key] = dropdowns[key].property("value");
    });
    return selectedFilters;
  }

  // Helper function to filter data based on selected filters
  function filterData(data, filters) {
    return data.filter(function(d) {
      return Object.keys(filters).every(function(key) {
        return filters[key] === 'All' || d[key] === filters[key];
      });
    });
  }
});
