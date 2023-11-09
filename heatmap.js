// JavaScript file: heatmap.js

// Obtain the width of the SVG container dynamically
const svgContainer = document.querySelector("#heatmap");
const svgWidth = svgContainer.clientWidth;

// Adjust the dimensions and margins of the graph based on the container's width
const margin = { top: 30, right: 60, bottom: 80, left: 60 };
const width = svgWidth - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#heatmap")
  .append("svg")
    .attr("width", svgWidth)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the CSV file
d3.csv("major_selection_processed.csv").then(function(data) {
  // Map the data to create a 2D array for the heatmap
  const majors = ["pct_stem_2000", "pct_business_2000", "pct_health_2000", "pct_arthuman_2000", "pct_socialscience_2000", "pct_publicsocial_2000", "pct_multidisci_2000", "pct_tradepersonal_2000"];
  const institutions = Array.from(new Set(data.map(d => d.name)));
  const heatmapData = majors.map(major => {
    return institutions.map(inst => {
      return {
        institution: inst,
        major: major,
        value: +data.find(d => d.name === inst)[major]
      };
    });
  }).flat();

  // Sample data to reduce the number of institutions displayed on the x-axis
  const samplingInterval = 90;  // Adjust this interval as needed
  const sampledInstitutions = institutions.filter((inst, index) => index % samplingInterval === 0);

  // Build X scales and axis with sampled institutions
const x = d3.scaleBand()
.range([0, width])
.domain(sampledInstitutions)  // Use the sampled institutions
.padding(0.05);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x).tickSize(0))
.selectAll("text")  // Select all x-axis labels
  .attr("transform", "rotate(-90)")  // Rotate labels vertically
  .style("text-anchor", "end");  // Adjust text anchor for proper alignment


  // Build Y scales and axis
  const y = d3.scaleBand()
    .range([height, 0])
    .domain(majors)
    .padding(0.05);
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0));

  // Build color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0, 100]);

  // Create a tooltip
  // ...[tooltip setup]...

  // Three functions that change the tooltip when user hover/move/leave a cell
  // ...[event functions]...

  // Add the squares
  svg.selectAll()
    .data(heatmapData, function(d) { return d.institution + ':' + d.major; })
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.institution); })
      .attr("y", function(d) { return y(d.major); })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function(d) { return myColor(d.value); })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      // ...[event listeners]...
}).catch(function(error){
  console.error("Error loading the data:", error);
});
