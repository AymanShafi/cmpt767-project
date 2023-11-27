// network_graph.js

// Define the dimensions and margins for the graph
const width = 960;
const height = 600;
const margin = { top: 0, right: 0, bottom: 0, left: 0 };

// Append the svg object to the body of the page
const svg = d3.select("#network-graph-container")
  .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g");

// Add zoom capabilities 
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
        svg.attr('transform', event.transform);
    });

// Apply the zoom to the svg container
d3.select("svg").call(zoom);

// Load the data from the CSV file
d3.csv("data_race_incarceration_income.csv").then(function(rawData) {
  // Create nodes array
  const nodes = rawData.map(d => {
    return {
      id: d.cz,
      name: d.czname,
      income: +d.kfr_pooled_pooled_p25,
      incarceration: +d.jail_pooled_pooled_p25,
      count: +d.pooled_pooled_count
    };
  });

  // Create the dropdown options
  const czSelect = d3.select("#cz-select");
  czSelect.selectAll("option.cz-option")
    .data(nodes)
    .enter()
    .append("option")
    .attr("value", d => d.id)
    .attr("class", "cz-option")
    .text(d => d.name);

  // Dummy links array for illustration (real links would be based on data relationships)
  const links = nodes.map((node, index, arr) => {
    const targetIndex = (index + 1) % arr.length;
    return {
      source: node.id,
      target: arr[targetIndex].id
    };
  });

  // Create the simulation
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Add links
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .style("stroke", "#aaa");

  // Add nodes
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("r", d => Math.sqrt(d.count) / 100)
      .style("fill", "#69b3a2");

  // Define drag behavior
  const drag = d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  // Apply drag behavior to nodes
  node.call(drag);

  // Simulation tick
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

  // Dropdown change event
  czSelect.on("change", event => {
    const selectedCZ = event.target.value;
    const filteredNodes = nodes.filter(d => d.id === selectedCZ || selectedCZ === "all");
    const filteredLinks = links.filter(d => d.source.id === selectedCZ || d.target.id === selectedCZ || selectedCZ === "all");

    // Update the nodes and links with the filtered data
    node.data(filteredNodes, d => d.id).join("circle").attr("visibility", "visible");
    link.data(filteredLinks, d => d.source.id + "-" + d.target.id).join("line").attr("visibility", "visible");

    // Restart the simulation with the new data
    simulation.nodes(filteredNodes);
    simulation.force("link").links(filteredLinks);
    simulation.alpha(1).restart();
  });
});
