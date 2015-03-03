var svg1 = d3.select("#chart1").append("svg");
var svg2 = d3.select("#chart2").append("svg");

svg1.append("circle")
	.attr("class", "bar abc")
	.attr("r", 3.5)
	.attr("cx", 50)
	.attr("cy", 50)
	.style("fill", function(d) { return "rgb(255, 0, 0)"; })
	.style({opacity:'0.2',})
	.on('mouseover', function(d){
		d3.selectAll(".abc").style({opacity:'1.0',});
	});
	
svg2.append("circle")
	.attr("class", "scattor abc")
	.attr("r", 3.5)
	.attr("cx", 50)
	.attr("cy", 50)
	.style("fill", function(d) { return "rgb(0, 255, 0)"; })
	.style({opacity:'0.2',})
	.on('mouseover', function(d){
		d3.selectAll(".abc").style({opacity:'1.0',});
	});