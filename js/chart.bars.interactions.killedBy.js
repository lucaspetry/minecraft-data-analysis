// Necessary: 	d3.min.js

var margin = {top: 10, right: 20, bottom: 30, left: 50},
    widthK = document.getElementById("chart_barsInteractionsKilledBy").clientWidth - margin.left - margin.right,
    heightK = document.getElementById("chart_barsInteractionsKilledBy").clientHeight
			- document.getElementById("chart_barsInteractionsKilledBy_title").clientHeight - margin.top - margin.bottom;

var xK = d3.scale.ordinal()
    .rangeRoundBands([0, widthK], .1, 1);

var yK = d3.scale.linear()
    .range([heightK, 0]);

var xAxisK = d3.svg.axis()
    .scale(xK)
    .orient("bottom");

var yAxisK = d3.svg.axis()
    .scale(yK)
    .orient("left")

var svgK = d3.select("#chart_barsInteractionsKilledBy").append("svg")
    .attr("width", widthK + margin.left + margin.right)
    .attr("height", heightK + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var killedBy;

function getEventsPerServer(data) {
	var frequencies = {};
	
	for(var i = 0; i < data.length; i+=1) {
		var row = data[i];

		if(row.server_id in frequencies)
			frequencies[row.server_id] += 1;
		else
			frequencies[row.server_id] = 1;
	}
	
	//convert to array form
	var frequenciesArray = Object.keys(frequencies).map(function (key) {
		return {
			"server_id": key, 
			"value": frequencies[key]
		};
	});
	
	return frequenciesArray;
}

// Load the killedBy data
d3.csv("data/users_interactions_killedBy.csv", function(error, data) {	
	if (error) throw error;
	killedBy = getEventsPerServer(data);
	console.log("killedBy loaded successfully!");

  xK.domain(killedBy.map(function(d) { return d.server_id; }));
  yK.domain([0, d3.max(killedBy, function(d) { return d.value; })]);

  svgK.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightK + ")")
      .call(xAxisK);

  svgK.append("g")
      .attr("class", "y axis")
      .call(yAxisK)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svgK.selectAll(".bar")
      .data(killedBy)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xK(d.server_id); })
      .attr("width", xK.rangeBand())
      .attr("y", function(d) { return yK(d.value); })
      .attr("height", function(d) { return heightK - yK(d.value); });

  d3.select("[name=sortKilledBy]").on("change", change);

  document.getElementById("chart_barsInteractionsKilledBy").style.display = "none";
  
  var sortTimeout = setTimeout(function() {
    d3.select("[name=sortBars]").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = xK.domain(killedBy.sort(this.checked
        ? function(a, b) { return b.value - a.value; }
        : function(a, b) { return d3.ascending(a.server_id, b.server_id); })
        .map(function(d) { return d.server_id; }))
        .copy();

    svgK.selectAll(".bar")
        .sort(function(a, b) { return x0(a.server_id) - x0(b.server_id); });

    var transition = svgK.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.server_id); });

    transition.select(".x.axis")
        .call(xAxisK)
      .selectAll("g")
        .delay(delay);
  }
});
