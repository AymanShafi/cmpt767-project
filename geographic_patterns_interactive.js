d3.csv("mrc_coords.csv").then(function(data) {
    // Data preprocessing
    data.forEach(function(d) {
        d.ipeds_enrollment_2013 = +d.ipeds_enrollment_2013;
        d.scorecard_median_earnings_2011 = +d.scorecard_median_earnings_2011;
    });

    // Initialize the map
    var map = L.map('map').setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create a Leaflet SVG layer
    var svgLayer = L.svg().addTo(map);
    var svg = d3.select("#map").select("svg");
    svg.attr("pointer-events", "auto");

    // Bubble size scale
    var z = d3.scaleSqrt()
        .domain([0, d3.max(data, function(d) { return d.ipeds_enrollment_2013; })])
        .range([2, 30]);

    // Color scale for median earnings
    var color = d3.scaleSequential(d3.interpolateCool)
        .domain(d3.extent(data, function(d) { return d.scorecard_median_earnings_2011; }));

    // Tooltip div for displaying information on hover
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Dropdown menu for filtering
    var dropdown = d3.select("#geographic-patterns")
        .insert("select", "svg")
        .on("change", function(event) {
            update(d3.select(this).property("value"));
        });

    dropdown.selectAll("option")
        .data([...new Set(data.map(d => d.university_name))])
        .enter().append("option")
        .text(d => d);

    // Function to update the visualization
    function update(selectedUniversity) {
        var filteredData = data;
        if (selectedUniversity && selectedUniversity !== "All") {
            filteredData = data.filter(d => d.university_name === selectedUniversity);
        }

        svg.selectAll('circle').remove(); // Clear previous circles
        
        // Convert lat/lng to Leaflet layer point and update circles
        var circles = svg.selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('class', 'data-circle') // Add a class for CSS if needed
            .attr('cx', function(d) { return map.latLngToLayerPoint([d.latitude, d.longitude]).x; })
            .attr('cy', function(d) { return map.latLngToLayerPoint([d.latitude, d.longitude]).y; })
            .attr('r', function(d) { return z(d.ipeds_enrollment_2013); })
            .style('fill', function(d) { return color(d.scorecard_median_earnings_2011); })
            .style('fill-opacity', 0.7)
            .style('stroke', 'white')
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.university_name + "<br/>" + d.ipeds_enrollment_2013 + " students<br/>Median earnings: $" + d.scorecard_median_earnings_2011)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Update position of circles when map is moved
        map.on("moveend", function() {
            svg.selectAll('circle')
                .attr('cx', function(d) { return map.latLngToLayerPoint([d.latitude, d.longitude]).x; })
                .attr('cy', function(d) { return map.latLngToLayerPoint([d.latitude, d.longitude]).y; });
        });
    }

    // Call update function to initially populate the map
    update();
});
