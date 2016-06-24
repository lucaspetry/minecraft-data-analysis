// Necessary: 	d3.min.js

var widthPS = document.getElementById("chart_pieServers").clientWidth,
    heightPS = document.getElementById("chart_pieServers").clientHeight
				- document.getElementById("chart_pieServers_title").clientHeight,
	radius = Math.min(widthPS, heightPS) / 2 - 10;
	
var svgPS = d3.select("#chart_pieServers")
	.append("svg")
	.attr("width", widthPS)
	.attr("height", heightPS)
	.on("click", function() {
		window.location.href = "servers.html";
	})
	.append("g")
	.attr("class", "chart_g")

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});
	
// this div2 is used for the tooltip
// var div2 = d3.select("body").append("div2")	
    // .attr("class", "tooltip")				
    // .style("opacity", 0);

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4); // Pie hole size

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

var keysLabels = function(d){ return d.data.label; };

var colorsLabels;

// Variables
var csvData;
var eventsPie;
var eventsData;
var totalEvents;
var labels;
var colors = ["#FAA43A", "#60BD68", "#5DA5DA", "#4D4D4D", "#F17CB0", "#B2912F", "#153D99", "#B276B2", "#659149 ", "#F15854", "#18AB89", "#F2F216", "#994D50", "#8212C7"];

// Load events data
d3.csv("data/events_servers.csv", function(error, data) { // TODO change file
	if (error) throw error;
	csvData = data;
	eventsPie = getEventsPerServer(data);
	console.log("eventsPie loaded successfully!");
	loadServersPieChart();
});

function loadServersPieChart() {
	labels = new Array;
	for(server_id in eventsPie) {
		labels.push(server_id);
	}
	
	colorsLabels = d3.scale.ordinal()
			.domain(labels)
			.range(colors);
			
	svgPS.append("g")
		.attr("class", "slices");
	svgPS.append("g")
		.attr("class", "labels");
	svgPS.append("g")
		.attr("class", "lines");

	svgPS.attr("transform", "translate(" + widthPS / 2 + "," + heightPS / 2 + ")");
	
	eventsData = labels.map(function(label){
		return { label: label, value: eventsPie[label] }
	});
	
	updatePieChart(eventsData);

	// Hide loading message after it is complete
	document.getElementById('chart_pieServers_load').style.display = "none";
	console.log("Pie servers built successfully!");
	
	d3.selectAll(".slice")
		.on("mouseover", function(d){
			d3.select(this)
				.style("fill", "brown");
			div.transition()
				.duration(0)
				.style("opacity", 1);
			div.html("<b>" + d.data.label + ":</b> " + (d.data.value * 100 / totalEvents).toFixed(2) + "\%<br/>" // Add commas 1,000
					+ d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " / "
					+ totalEvents.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
				.style("height", 30)
				.style("left", d3.event.pageX + "px")
				.style("top", (d3.event.pageY - 38) + "px")
		})
		.on("mousemove", function(d) {
			if(div.style("opacity") > 0) {
				div.html("<b>" + d.data.label + ":</b> " + (d.data.value * 100 / totalEvents).toFixed(2) + "\%<br/>" // Add commas 1,000
						+ d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " / "
						+ totalEvents.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
				.style("height", 30)
				.style("left", d3.event.pageX + "px")
				.style("top", (d3.event.pageY - 38) + "px")
			}
		})
		.on("mouseout", function(d) {
			d3.select(this)
				.style("fill", function(d) { return colorsLabels(d.data.label); });
			div.transition()		
				.duration(0)		
				.style("opacity", 0);	
		});
}

function updatePieServers(eventName) {
	if(eventName == "") {
		updatePieChart(eventsData);
		document.getElementById("chart_pieServers_title").innerHTML = "Events by Server";
	} else {
		document.getElementById("chart_pieServers_title").innerHTML = "Events by Server (" + eventName + ")";
		var frequencies = {};
		
		for(item in labels)
			frequencies[labels[item]] = 0;
		
		for(var i = 0; i < csvData.length; i+=1) {
			var row = csvData[i];

			if(row.key == eventName) {
				frequencies[row.server_id] += 1;
			}
		}
		
		var newData = new Array;
		
		for(label in frequencies) {
			if(frequencies[label] > 0)
				newData.push({ label: label, value: frequencies[label] });
		}
		updatePieChart(newData);
	}
}

function updatePieChart(data) {

	/* ------- PIE SLICES -------*/
	var slice = svgPS.select(".slices").selectAll("path.slice")
		.data(pie(data), keysLabels)
		.on("mouseover", function(d){
			d3.select(this)
				.style("fill", "brown");
			updateBarsKeys("");
			div.transition()
				.duration(0)
				.style("opacity", 1);
			div.html("<b>" + d.data.label + ":</b> " + (d.data.value * 100 / totalEvents).toFixed(2) + "\%<br/>" // Add commas 1,000
					+ d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " / "
					+ totalEvents.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
				.style("height", 30)
				.style("left", d3.event.pageX + "px")
				.style("top", (d3.event.pageY - 38) + "px")
		})
		.on("mousemove", function(d) {
			if(div.style("opacity") > 0) {
				div.html("<b>" + d.data.label + ":</b> " + (d.data.value * 100 / totalEvents).toFixed(2) + "\%<br/>" // Add commas 1,000
						+ d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " / "
						+ totalEvents.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
				.style("height", 30)
				.style("left", d3.event.pageX + "px")
				.style("top", (d3.event.pageY - 38) + "px")
			}
		})
		.on("mouseout", function(d) {
			updatePieServers("");
			d3.select(this)
				.style("fill", function(d) { return colorsLabels(d.data.label); });
			div.transition()		
				.duration(0)		
				.style("opacity", 0);	
		});

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return colorsLabels(d.data.label); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svgPS.select(".labels").selectAll("text")
		.data(pie(data), keysLabels);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.92 * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svgPS.select(".lines").selectAll("polyline")
		.data(pie(data), keysLabels);
	
	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.85 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
};

function getEventsPerServer(data) {
	var frequencies = {};
	totalEvents = data.length;
	for(var i = 0; i < data.length; i+=1) {
		var row = data[i];

		if(row.server_id in frequencies)
			frequencies[row.server_id] += 1;
		else
			frequencies[row.server_id] = 1;
	}
	
	return frequencies;//.sort(function(a, b) { return a.value < b.value });
}