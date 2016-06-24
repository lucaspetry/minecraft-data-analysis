// Necessary: 	d3.min.js

// set dimensions of the canvas / graph
var margin = {top: 40, right: 20, bottom: 70, left: 80},
			  widthBK = document.getElementById("chart_barsKeys").clientWidth - margin.left - margin.right,
			  heightBK = document.getElementById("chart_barsKeys").clientHeight - margin.top - margin.bottom
						- document.getElementById("chart_barsKeys_title").clientHeight;

// set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, widthBK], .1);
var y = d3.scale.linear().range([heightBK, 0]);

// define the axes
var xAxis = d3.svg.axis()
				.scale(x)
    			.orient("bottom");
var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .ticks(8);

// add the svg canvas to the div with id = barchart
var svgBK = d3.select("#chart_barsKeys").append("svg")
	    	.attr("width", widthBK + margin.left + margin.right)
	    	.attr("height", heightBK + margin.top + margin.bottom)
	    	.attr("class", "barchart_svg")
	  		.append("g")
	    	.attr("class", "chart_g")
	    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// this div is used for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// Variables
var events;

// Load events data
d3.csv("data/events_servers.csv", function(error, data) { // TODO change file
	if (error) throw error;
	events = getEventsPerKey(data);
	console.log("Events loaded successfully!");
	loadBarsChart(events);
});

function loadBarsChart(barsData) {
	// scale the data ranges
	// the x domain goes over the set of keys
	x.domain(barsData.map(function(d) { return d.key; }));
	// y goes from 0 to the max value in times
	y.domain([0, d3.max(barsData, function(d) { return d.value; })]);

	// Hide loading message after it is complete
	document.getElementById('chart_barsKeys_load').style.display = "none";
	console.log("Graph built successfully!");
	
	// add the axes
	svgBK.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + heightBK + ")")
		.call(xAxis)
	.selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(60)")
		.style("text-anchor", "start");
	svgBK.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.attr("y", -25)
		.attr("x", 20)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Events");
	
	// add the bars
	svgBK.selectAll(".bar")
		.data(barsData)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.key); })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return heightBK - y(d.value); })
			.on("mouseover", function(d) {
				updatePieServers(d.key);
				div.transition()
					.duration(0)
					.style("opacity", 1);
				div.html("<b>" + d.key + ":</b> " + d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) // Add commas 1,000
					.style("width", 40 + d.key.length * 8)
					.style("height", 15)
					.style("left", d3.event.pageX + "px")
					.style("top", (d3.event.pageY - 28) + "px")
				})
			.on("mousemove", function(d) {
				if(div.style("opacity") > 0) {
					div.html("<b>" + d.key + ":</b> " + d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) // Add commas 1,000
						.style("width", 40 + d.key.length * 8)
						.style("height", 15)
						.style("left", d3.event.pageX + "px")
						.style("top", (d3.event.pageY - 28) + "px")
				}
			})
			.on("mouseout", function(d) {
				updatePieServers("");
				div.transition()		
					.duration(0)		
					.style("opacity", 0);	
				});
}

function updateBarsKeys(serverId) {
	if(serverId == "") {
		// UPDATE TOTAL
	}
}

function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) { return arc(i(t));    };
}    
		
function getEventsPerKey(data) {
	var frequencies = {};
	for(var i = 0; i < data.length; i+=1) {
		var row = data[i];

		if(row.key in frequencies)
			frequencies[row.key] += 1;
		else
			frequencies[row.key] = 1;
	}

	//convert to array form
	var frequenciesArray = Object.keys(frequencies).map(function (key) {
		return {
			"key": key, 
			"value": frequencies[key]
		};
	});

	return frequenciesArray.sort(function(a, b) { return a.value < b.value });
}