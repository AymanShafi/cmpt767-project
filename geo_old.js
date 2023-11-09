d3.csv("mrc_coords.csv").then(function(data) {
    // Data preprocessing
    data.forEach(function(d) {
        d.ipeds_enrollment_2013 = +d.ipeds_enrollment_2013;
        d.scorecard_median_earnings_2011 = +d.scorecard_median_earnings_2011;    });

    // Set the dimensions and margins of the graph
    var margin = {top: 40, right: 20, bottom: 40, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#geographic-patterns")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        // Initialize the map
        var map = L.map('map').setView([37.8, -96], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add markers to the map
        data.forEach(function(d) {
            if (d.latitude && d.longitude) {
                L.marker([d.latitude, d.longitude]).addTo(map)
                    .bindPopup(d.university_name);
            }
        });

    // Set the dimensions and margins of the graph
    var margin = {top: 40, right: 20, bottom: 40, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#geographic-patterns")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    // X scale for longitude
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Y scale for latitude
    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Bubble size scale
    var z = d3.scaleSqrt()
        .domain([0, d3.max(data, function(d) { return d.ipeds_enrollment_2013; })])
        .range([2, 30]);

    // Color scale for median earnings
    var color = d3.scaleSequential(d3.interpolateCool)
        .domain(d3.extent(data, function(d) { return d.scorecard_median_earnings_2011; }));

    // Tooltip
    var tooltip = d3.select("#geographic-patterns")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Dropdown menu for filtering
    var dropdown = d3.select("#geographic-patterns")
        .insert("select", "svg")
        .on("change", function(event) {
            var selectedType = d3.select(this).property("value");
            update(selectedType);
        });

    dropdown.selectAll("option")
        .data([...new Set(data.map(d => d.name))])
      .enter().append("option")
        .text(d => d);

    // Function to update the chart
    function update(selectedType) {
        var filteredData = selectedType === "All" ? data : data.filter(function(d) { return d.name === selectedType; });
        render(filteredData);
    }

    // Render function
    function render(data) {
        var circles = svg.selectAll("circle")
            .data(data, function(d) { return d.unitid; });

        circles.enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(1000)
            .attr("cx", function(d) { return x(d.longitude); })
            .attr("cy", function(d) { return y(d.latitude); })
            .attr("r", function(d) { return z(d.ipeds_enrollment_2013); })
            .style("fill", function(d) { return color(d.scorecard_median_earnings_2011); })
            .style("opacity", 0.7)
            .attr("stroke", "#fff");

        circles.on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name + "<br/>" + d.ipeds_enrollment_2013 + " students<br/>Median earnings: $" + d.scorecard_median_earnings_2011)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        circles.exit().remove();
    }

    // Call update function with "All" to display all data initially
    update("All");
});
