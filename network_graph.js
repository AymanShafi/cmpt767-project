
// Load the data
d3.csv("mrc_coords.csv").then(function(data) {
    // Convert strings to numbers
    data.forEach(function(d) {
        d.md_earn_wne_p10 = +d.md_earn_wne_p10;
        d.cdr3 = +d.cdr3;
    });

    // Filter data to avoid undefined and extreme values for better visualization
    data = data.filter(d => d.md_earn_wne_p10 && d.cdr3 && d.md_earn_wne_p10 > 0 && d.cdr3 >= 0 && d.cdr3 <= 1);

    // Width and height of the graph
    var width = 960,
        height = 600;

    // Create SVG element
    var svg = d3.select("#network-graph")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    // Scales for node sizes and colors
    var sizeScale = d3.scaleSqrt()
                      .domain(d3.extent(data, d => d.md_earn_wne_p10))
                      .range([3, 20]);
    
    var colorScale = d3.scaleQuantize()
                       .domain(d3.extent(data, d => d.cdr3))
                       .range(d3.schemeBlues[9]);

    // Tooltip for node hover information
    var tooltip = d3.select("#network-graph").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    // Force simulation for positioning nodes
    var simulation = d3.forceSimulation(data)
                       .force("link", d3.forceLink().id(d => d.unitid))
                       .force("charge", d3.forceManyBody().strength(-50))
                       .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw nodes
    var node = svg.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(data)
                  .enter().append("circle")
                  .attr("r", d => sizeScale(d.md_earn_wne_p10))
                  .attr("fill", d => colorScale(d.cdr3))
                  .call(d3.drag()
                          .on("start", dragstarted)
                          .on("drag", dragged)
                          .on("end", dragended))
                  .on("mouseover", function(event, d) {
                      tooltip.transition()
                             .duration(200)
                             .style("opacity", .9);
                      tooltip.html(d.instnm + "<br/> Median Earnings: $" + d.md_earn_wne_p10 +
                                   "<br/> Cohort Default Rate: " + (d.cdr3 * 100).toFixed(2) + "%")
                             .style("left", (event.pageX) + "px")
                             .style("top", (event.pageY - 28) + "px");
                  })
                  .on("mouseout", function(d) {
                      tooltip.transition()
                             .duration(500)
                             .style("opacity", 0);
                  });

    // Add legend for color scale
    // ...

    // Simulation tick function
    simulation.on("tick", function() {
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Drag functions for nodes
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});

// Legend for color scale
// ...
