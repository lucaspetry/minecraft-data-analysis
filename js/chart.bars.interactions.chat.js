// Necessary: 	d3.min.js

var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = document.getElementById("chart_barsInteractionsChat").clientWidth - margin.left - margin.right,
    height = document.getElementById("chart_barsInteractionsChat").clientHeight
			- document.getElementById("chart_barsInteractionsChat_title").clientHeight - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

var svg = d3.select("#chart_barsInteractionsChat").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chat;

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

function changeBarChart(chart) {
	if(chart == "Chat") {
		document.getElementById("chart_barsInteractionsChat").style.display = "";
		document.getElementById("chart_barsInteractionsKilledBy").style.display = "none";
		d3.select("[name=sortChat]").style("display", "");
		d3.select("[name=sortKilledBy]").style("display", "none");
	} else {
		document.getElementById("chart_barsInteractionsChat").style.display = "none";
		document.getElementById("chart_barsInteractionsKilledBy").style.display = "";
		d3.select("[name=sortChat]").style("display", "none");
		d3.select("[name=sortKilledBy]").style("display", "");
	}
}

// Load the Chat data
d3.csv("data/users_interactions_chat.csv", function(error, data) {	
	if (error) throw error;
	chat = getEventsPerServer(data);
	console.log("Chat loaded successfully!");

  x.domain(chat.map(function(d) { return d.server_id; }));
  y.domain([0, d3.max(chat, function(d) { return d.value; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svg.selectAll(".bar")
      .data(chat)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.server_id); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });

  d3.select("[name=sortChat]").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("[name=sortBars]").property("checked", true).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(chat.sort(this.checked
        ? function(a, b) { return b.value - a.value; }
        : function(a, b) { return d3.ascending(a.server_id, b.server_id); })
        .map(function(d) { return d.server_id; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.server_id) - x0(b.server_id); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.server_id); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }
});
