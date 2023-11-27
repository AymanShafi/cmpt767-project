
// Initialize the map
var map = L.map('map-container').setView([37.8, -96], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

// Define color array
var colors = [
    '#E63946', // Red
    '#F4A261', // Orange
    '#2A9D8F', // Teal
    '#264653', // Dark Blue
    '#2B2D42', // Darker Blue
    '#8D99AE', // Gray Blue
    '#EF476F', // Pink
    '#06D6A0', // Light Green
    '#118AB2', // Blue
    '#073B4C'  // Dark Cyan
];

// Function to determine circle size
function getSize(value) {
    return value / 1000; // Example size scaling; adjust as needed
}

// Function to determine circle color based on the region
function getColor(region) {
    return colors[region % colors.length];
}

// Function to populate dropdowns
function populateDropdowns(data) {
    var tiers = new Set(data.map(d => d['Tier-name']));
    var states = new Set(data.map(d => d.state));
    var publicOptions = new Set(data.map(d => d.Public));

    var tierSelect = d3.select('#tier-select');
    var stateSelect = d3.select('#state-select');
    var publicSelect = d3.select('#public-select');

    tiers.forEach(function(tier) {
        tierSelect.append('option').text(tier).attr('value', tier);
    });

    states.forEach(function(state) {
        stateSelect.append('option').text(state).attr('value', state);
    });

    publicOptions.forEach(function(option) {
        publicSelect.append('option').text(option === '1' ? 'Public' : 'Private').attr('value', option);
    });
}

// Load the CSV data and add it to the map
d3.csv('mrc_coords.csv').then(function(data) {
    // Populate the dropdowns
    populateDropdowns(data);

    // Initial draw of the map
    drawMap(data);

    // Event listeners for the dropdowns
    d3.select('#tier-select').on('change', function() {
        tierFilter = d3.select(this).property('value');
        drawMap(data);
    });

    d3.select('#state-select').on('change', function() {
        stateFilter = d3.select(this).property('value');
        drawMap(data);
    });

    d3.select('#public-select').on('change', function() {
        publicFilter = d3.select(this).property('value');
        drawMap(data);
    });
});

// Initialize global variables for the filters
var tierFilter = 'all';
var stateFilter = 'all';
var publicFilter = 'all';

// Function to draw the map
function drawMap(data) {
    // Clear existing layers
    map.eachLayer(function(layer) {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });

    // Filter data based on dropdowns
    var filteredData = data.filter(function(d) {
        return (tierFilter === 'all' || d['Tier-name'] === tierFilter) &&
               (stateFilter === 'all' || d['state'] === stateFilter) &&
               (publicFilter === 'all' || d['Public'] === publicFilter);
    });

    // Add circles to the map based on the filtered data
    filteredData.forEach(function(d) {
        var lat = parseFloat(d.latitude);
        var lng = parseFloat(d.longitude);
        var region = parseInt(d.region, 10);

        // Check if coordinates are valid
        if (!isNaN(lat) && !isNaN(lng)) {
            var circle = L.circle([lat, lng], {
                color: getColor(region),
                fillColor: getColor(region),
                fillOpacity: 0.5,
                radius: getSize(d.pct_business_2000)
            }).addTo(map);

            // Add tooltip
            circle.bindTooltip(`Name: ${d.name}<br>Business %: ${d.pct_business_2000}<br>Region: ${d.region}`);
        }
    });
}