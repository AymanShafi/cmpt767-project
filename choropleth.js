// Initialize the map on the "map-container" div with a given center and zoom level
var map = L.map('map-container').setView([37.8, -96], 4);

var stateAbbreviationsReverse = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Add a tile layer to the map (OpenStreetMap in this case)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

// Load in median earnings data
d3.json('median_earnings_by_full_state_name.json').then(function(earningsData) {
    // Load in GeoJSON data
    d3.json('us-states.geojson.json').then(function(geoJsonData) {
        
        // Function to set the color based on median earnings
        function getColor(d) {
            console.log(d); // To check what values you are getting for earnings
            return d > 50000 ? '#1a9641' : // Green
           d > 45000 ? '#a6d96a' : // Light Green
           d > 40000 ? '#ffffbf' : // Yellow
           d > 35000 ? '#fdae61' : // Orange
           d > 30000 ? '#d7191c' : // Red
           d > 25000 ? '#2c7bb6' : // Blue
           d > 20000 ? '#abd9e9' : // Light Blue
                        '#f7f7f7';  // Very light grey
        }

        // Function to style each feature
        function style(feature) {
            var earnings = earningsData[feature.properties.NAME];
            console.log(feature.properties.NAME, earnings); // This will show you if the earnings data is correctly aligned with the state names
            return {
                fillColor: getColor(earnings),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.6
            };
        }

        // Function for onEachFeature
        function onEachFeature(feature, layer) {
            var earnings = earningsData[feature.properties.NAME];
            layer.on({
                mouseover: function(e) {
                    var layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        fillOpacity: 0.7
                    });
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
                },
                mouseout: function(e) {
                    geojson.resetStyle(e.target);
                },
                click: function(e) {
                    map.fitBounds(e.target.getBounds());
                }
            });
            if (feature.properties && feature.properties.NAME) {
                layer.bindPopup(feature.properties.NAME + ": " + earningsData[feature.properties.NAME]);
            }
            
            // Add the tooltip
            layer.bindTooltip(feature.properties.NAME);
            
            // Add the popup
            if (feature.properties && feature.properties.NAME) {
                var earnings = earningsData[feature.properties.NAME];
                var earningsText = earnings ? `Median Earnings: \$${earnings}` : "Median Earnings: Data not available";
                layer.bindPopup(`<strong>${feature.properties.NAME}</strong><br>${earningsText}`);
            }
        }

        // Create a GeoJSON layer and add it to the map
        var geojson = L.geoJson(geoJsonData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        // Create a legend and add it to the map
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 20000, 25000, 30000, 35000, 40000], // Breakpoints for the color scale
                labels = [];
        
            // Add a legend title
            div.innerHTML = '<h4>Median Earnings ($)</h4>';
        
            // Loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<div><i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' ' : '+') + '</div>';
            }
        
            return div;
        };
        legend.addTo(map);
        
        // Create a dropdown and populate it with states
        var dropdown = L.control({position: 'topright'});

        dropdown.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info dropdown');
        var select = L.DomUtil.create('select', 'state-dropdown', div);
        select.innerHTML = '<option value="">Select a state...</option>';
        for (var key in stateAbbreviationsReverse) {
            var option = document.createElement('option');
            option.value = key;
            option.text = stateAbbreviationsReverse[key];
            select.appendChild(option);
        }

        select.onchange = function(e) {
            var state = select.value;
            geojson.eachLayer(function(layer) {
                if (layer.feature.properties.NAME === stateAbbreviationsReverse[state]) {
                    map.fitBounds(layer.getBounds());
                }
            });
        };
        return div;
    };
    dropdown.addTo(map);
});
});