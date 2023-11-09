
d3.csv("mrc_coords.csv").then(function(data) {
    // Data preprocessing
    data.forEach(function(d) {
        d.grad_rate_150_p_2013 = +d.grad_rate_150_p_2013;
        d.scorecard_median_earnings_2011 = +d.scorecard_median_earnings_2011;
        d.ipeds_enrollment_2013 = +d.ipeds_enrollment_2013;
    });

    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#income_mobility")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 120000])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleSqrt()
        .domain([0, 40000])
        .range([ 2, 30]);

    // Add a tooltip
    var tooltip = d3.select("#income_mobility")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Function to call when you mouseover a bubble
    var mouseover = function(event, d) {
        tooltip
          .style("opacity", 1)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
    }

    // Function to call when you mouseout a bubble
    var mouseout = function(event, d) {
        tooltip
          .style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8)
    }

    // Function to call when you mousemove over a bubble
    var mousemove = function(event, d) {
        tooltip
          .html("Earnings: $" + d.scorecard_median_earnings_2011 + "<br>Grad Rate: " + d.grad_rate_150_p_2013*100 + "%<br>Enrollment: " + d.ipeds_enrollment_2013)
          .style("left", (event.x)/2 + "px")
          .style("top", (event.y)/2 - 30 + "px")
    }

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) { return x(d.grad_rate_150_p_2013*100); })
        .attr("cy", function (d) { return y(d.scorecard_median_earnings_2011); })
        .attr("r", function (d) { return z(d.ipeds_enrollment_2013); })
        .style("fill", "#69b3a2")
        .style("opacity", "0.3")
        .attr("stroke", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseout)
});
