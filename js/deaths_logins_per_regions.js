// Necessary: 	d3.min.js

// set dimensions of the canvas / graph
var margin = {top: 30, right: 30, bottom: 130, left: 60},
			  width = 1000 - margin.left - margin.right,
			  height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height, 0]);

// define the axes
var xAxis = d3.svg.axis()
				.scale(x)
    			.orient("bottom");
var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .ticks(10);

// add the svg canvas to the div with id = barchart
var svg = d3.select("#barchart").append("svg")
	    	.attr("width", width + margin.left + margin.right)
	    	.attr("height", height + margin.top + margin.bottom)
	    	.attr("class", "barchart_svg")
	  		.append("g")
	    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// this div is used for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// Variables
var deaths;
var logins;
var deathsLoginsRelation;
var remaining = 2;

// Load the logins data
d3.csv("data/logins.csv", function(error, data) {
	if (error) throw error;
	logins = getLoginsPerRegion(data);
	console.log(logins);
	console.log("Logins loaded successfully!");
	if (!--remaining) f1();
});

// Load the data, process it, and display it with a bar chart.
d3.csv("data/deathsPerRegion.csv", function(error, data) {
	if (error) throw error;
	deaths = getDeathsPerRegion(data);
	console.log(deaths);
	console.log("Deaths loaded successfully!");
	if (!--remaining) f1();
});

function f1() {
	deathsLoginsRelation = getDeathsLoginsRelation();
	deathsLoginsRelation = deathsLoginsRelation.slice(0, 1 + 30);

	// scale the data ranges
	// the x domain goes over the set of keys
	x.domain(deathsLoginsRelation.map(function(d) { return d.meta; }));
	// y goes from 0 to the max value in times
	y.domain([0, 1.1]);

	// add the axes
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	.selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(60)")
		.style("text-anchor", "start");
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.attr("y", -20)
		.attr("x", 20)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Deaths/Logins");

	// add the bars
	svg.selectAll(".bar")
		.data(deathsLoginsRelation)
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.meta); })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d.logins); })
			.attr("height", function(d) { return height - y(d.logins); })
			.on("mouseover", function(d) {
				div.transition()
					.duration(200)
					.style("opacity", .9);
				div.html(d.meta + " = " + d.logins + "<br> D/L = " + deaths[d.meta] + "/" + logins[d.meta])
					.style("width", 40 + d.meta.length * 10)
					.style("height", 45)
					.style("left", (x(d.meta) + 130 + x.rangeBand() + x.rangeBand()/2) + "px")
					.style("top", (d3.event.pageY - 28) + "px")
				})
			.on("mouseout", function(d) {
				div.transition()		
					.duration(500)		
					.style("opacity", 0);	
				});

	console.log("Graph built successfully!");
}

function getDeathsLoginsRelation() {
	var dlRatio = {};
	var key;
	
	for(key in deaths)
	{
		if(key != " NoInfo")
			dlRatio[key] = Math.round(deaths[key] / logins[key] * 100) / 100;
	}

	//convert to array form
	var dlRatioArray = Object.keys(dlRatio).map(function(meta) {
		return {
			"meta": meta, 
			"logins": dlRatio[meta]
		};
	});
  
	dlRatioArray.sort(function(a, b){return b.logins - a.logins});
	return dlRatioArray;
}

// this gets the total time spent on each key 
// from on the loaded file and adds
// it to a javascript object called time_per_key.
function getLoginsPerRegion(data) {
  var logins_per_meta = {};
  for(var i = 0; i < data.length; i+=1)
  {
    var row = data[i];
		if(row.meta in logins_per_meta)
    {
			logins_per_meta[row.meta] += 1;
    }
    else
    {
			logins_per_meta[row.meta] = 1;
    }
  }
  
  //convert to array form
  var logins_per_meta_array = Object.keys(logins_per_meta).map(function (meta) {
    return {
    	"meta": meta, 
      	"logins": logins_per_meta[meta]
    };
  });
  
  return logins_per_meta;
}

function getDeathsPerRegion(data) {
  var time_per_key = {};
  for(var i = 0; i < data.length; i+=1)
  {
    var row = data[i];
		if(row.meta in time_per_key)
    {
			time_per_key[row.meta] += 1;
    }
    else
    {
			time_per_key[row.meta] = 1;
    }
  }
  
  //convert to array form
  var time_per_key_array = Object.keys(time_per_key).map(function (meta) {
    return {
    	"meta": meta, 
      	"logins": time_per_key[meta]
    };
  });
  
  return time_per_key;
}