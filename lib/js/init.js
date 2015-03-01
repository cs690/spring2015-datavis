var chart = barchart().width(800).height(300),
	svg = d3.select("#seimei").append("svg")
		.attr("id", "barchart")
		.attr("height",300)
		.attr("width",1000);

d3.csv("./lib/data/youtube.csv", function(csv){
	
	var views = [],
		lengths = [];
	
	csv.map(function(d){
		views.push(+d.views);
		lengths.push(+d.length);
	})

	d3.select("#seimei").datum(lengths).call(chart);
});

scattorplot = new ScatterPlot();
scattorplot.Margin(20, 20, 30, 40).ScreenWidth(800).ScreenHeight(300);
scattorplot.drawOn("#xihan", "./lib/data/youtube.csv", "ratings", "comments");
