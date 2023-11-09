// sankey.js

// Load data from CSV
d3.csv("mrc_table3.csv").then(function (data) {
    // Data parsing
    data.forEach(function (d) {
      d.super_opeid = +d.super_opeid;
      d.cohort = +d.cohort;
      // Add more parsing for other columns if needed
    });
  
    // Set up the Sankey diagram
    var sankey = d3.sankey()
      .nodeId(d => d.name)
      .nodeAlign(d3.sankeyLeft)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);
  
    var { nodes, links } = sankey({
      nodes: data.map(d => ({ name: d.name })),
      links: data.map(d => ({ source: d.cohort, target: d.name, value: 1 }))
    });
  
    // Set dimensions and margins
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  
    // Append the SVG object to the body of the page
    var svg = d3.select("#sankey")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Create nodes
    svg.append("g")
      .selectAll(".node")
      .data(nodes)
      .enter().append("rect")
      .attr("class", "node")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .style("fill", "#69b3a2");
  
    // Create links
    svg.append("g")
      .selectAll(".link")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .style("stroke", function (d) {
        return d3.rgb(0, 0, 0, 0.2);
      })
      .style("stroke-width", function (d) {
        return Math.max(1, d.width);
      })
      .style("fill", "none");
  });