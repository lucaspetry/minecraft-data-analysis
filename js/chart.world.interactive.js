// Necessary: 	d3.min.js,
//				topojson.min.js,
// 				datamaps.world.min.js

// Control
var remaining = 4;

// Data
var regions;
var logins;
var deaths;
var kicks;

// Map variables
var map;
var currentWorldOption = 1;
var defaultFillColor = '#DDDDDD';
var colorRangeMin = '#B2B2F7';
var colorRangeMax = '#010D1A';

// Load the regions data
d3.csv("data/regions_countries.csv", function(error, data) {	
	if (error) throw error;
	regions = getCountriesPerRegion(data);
	console.log("Regions loaded successfully!");
	if (!--remaining) loadMap();
});

// Load the logins data
d3.csv("data/logins.csv", function(error, data) {
	if (error) throw error;
	logins = getInfoPerRegion(data);
	console.log("Logins loaded successfully!");
	if (!--remaining) loadMap();
});

// Load the deaths data
d3.csv("data/deaths.csv", function(error, data) {
	if (error) throw error;
	deaths = getInfoPerRegion(data);
	console.log("Deaths loaded successfully!");
	if (!--remaining) loadMap();
});

// Load the kicks data
d3.csv("data/kicks.csv", function(error, data) { // TODO change file
	if (error) throw error;
	kicks = getInfoPerRegion(data);
	console.log("Kicks loaded successfully!");
	if (!--remaining) loadMap();
});

// Update the map according to the option selected
function updateWorldMap(optionValue) {
	 if(optionValue == currentWorldOption)
		return;
	
	currentWorldOption = optionValue;
	
	// Map Data [contry ISO, data]
	var series = {};
	var seriesAux = {};
	
	switch(optionValue) {
		case 1:
			for(meta in logins) {
				if(regions[meta] in series) {
					series[regions[meta]] += logins[meta];
				} else {
					series[regions[meta]] = logins[meta];
				}
			}
			break;
		case 2:
			for(meta in logins) {
				if(regions[meta] in seriesAux) {
					seriesAux[regions[meta]] += logins[meta];
				} else {
					seriesAux[regions[meta]] = logins[meta];
				}
			}
			
			for(meta in deaths) {
				if(regions[meta] in series) {
					series[regions[meta]] += deaths[meta];
				} else {
					series[regions[meta]] = deaths[meta];
				}
			}
			
			for(key in series) {
				series[key] = (series[key] / seriesAux[key] ).toFixed(5);
			}
			break;
		case 3:
			for(meta in logins) {
				if(regions[meta] in seriesAux) {
					seriesAux[regions[meta]] += logins[meta];
				} else {
					seriesAux[regions[meta]] = logins[meta];
				}
			}
			
			for(meta in kicks) {
				if(regions[meta] in series) {
					series[regions[meta]] += kicks[meta];
				} else {
					series[regions[meta]] = kicks[meta];
				}
			}
			
			for(key in series) {
				series[key] = (series[key] / seriesAux[key] ).toFixed(5);
			}
			break;
		default:
			console.log("Something went wrong!");
			break;
	}
	
	// Dataset {ISO: numberOfThings, fillColor, ISO}
    var dataset = {};
	
    // Get min e max values of the series
	var valuesFrequencies = new Array;
	for(country in series) {
		valuesFrequencies.push(series[country]);
	}
    var minValue = Math.min.apply(null, valuesFrequencies),
        maxValue = Math.max.apply(null, valuesFrequencies);

    // Create color scale
	var paletteScale = d3.scale.log()
			.domain([minValue, maxValue])
			.range([colorRangeMin, colorRangeMax]); // Color range
	
	// Set up empty regions
	for(name in regions) {
        var iso = regions[name];
        dataset[iso] = { numberOfThings: 0, fillColor: colorRangeMin, iso: iso };
	}
	
	// Build dataset
	for(country in series) {
        var iso = country,
            value = series[country];
        dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value), iso: iso };
	}
	
	map.updateChoropleth(dataset);
	
	// Update menu
	document.getElementById("worldOption1").style.backgroundColor = "";
	document.getElementById("worldOption2").style.backgroundColor = "";
	document.getElementById("worldOption3").style.backgroundColor = "";
	
	document.getElementById("worldOption" + optionValue).style.backgroundColor = "#AAAAAA";
}

// Load the map
function loadMap() {
	document.getElementById("worldOption1").style.backgroundColor = "#AAAAAA";
	
	// Map Data [contry ISO, logins]
	var series = {};
	
	for(meta in logins) {
		if(regions[meta] in series) {
			series[regions[meta]] += logins[meta];
		} else {
			series[regions[meta]] = logins[meta];
		}
	}
	
	// Dataset {ISO: numberOfThings, fillColor, ISO}
    var dataset = {};
	
    // Get min e max values of the series
	var valuesFrequencies = new Array;
	for(country in series) {
		valuesFrequencies.push(series[country]);
	}
    var minValue = Math.min.apply(null, valuesFrequencies),
        maxValue = Math.max.apply(null, valuesFrequencies);

    // Create color scale
    var paletteScale = d3.scale.log()
            .domain([minValue, maxValue])
			.range([colorRangeMin, colorRangeMax]); // Color range
	
	// Build dataset
	for(country in series) {
        var iso = country,
            value = series[country];
        dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value), iso: iso };
	}
	
	// Hide loading message after it is complete
	document.getElementById('chart_worldMap_load').style.display = "none";
	
	// Create the map
	map = new Datamap({
		element: document.getElementById('chart_worldMap'),
		fills: {
			defaultFill: defaultFillColor // Default fill color
		},
        data: dataset, // Dataset
		geographyConfig: {
			dataUrl: null, // If not null, datamaps will fetch the map JSON
			hideAntarctica: false,
			borderWidth: 1,
			borderOpacity: 1,
			borderColor: '#FDFDFD',
			popupTemplate: function(geo, data) {
				if(!data)
					return ['<div class="hoverinfo" style="cursor:default; font-family: NerisLight">',
                        '<b>' + geo.properties.name + '</b>',
                        '</div>'].join('');
				else
					return ['<div class="hoverinfo" style="text-align:left; cursor:default; font-family:NerisLight">',
							'<b style="font-size:13px">' + geo.properties.name + '</b><br/>',
							'<b>Data:</b> ' + (currentWorldOption == 1 ? data.numberOfThings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : data.numberOfThings), // Add commas 1,000
							'</div>'].join('');
            },
			popupOnHover: true,
			highlightOnHover: true,
			highlightFillColor: '#A52A2A',
			highlightBorderColor: '#000000',
			highlightBorderWidth: 0,
			highlightBorderOpacity: 1
		}
	});
	console.log("Map loaded successfully!");
}

// Get countries per region
function getCountriesPerRegion(data) {
	var regions_countries = {};
	
	for(var i = 0; i < data.length; i+=1) {
		var row = data[i];
		regions_countries[row.region] = row.country;
	}

	return regions_countries;
}

// Get info per region
function getInfoPerRegion(data) {
	var info_region = {};
	
	for(var i = 0; i < data.length; i+=1) {
		var row = data[i];
		
		if(row.meta in info_region) {
			info_region[row.meta] += 1;
		} else {
			info_region[row.meta] = 1;
		}
	}

	return info_region;
}
