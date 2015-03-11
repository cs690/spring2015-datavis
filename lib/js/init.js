var chart = barchart().width(800).height(300).feature("length")
		.yLabel("Video Length (seconds)").tooltipLabel("Video Length");
	svg = d3.select("#seimei").append("svg")
		.attr("id", "barchart")
		.attr("height",300)
		.attr("width",1000);

var scattorplot = new ScatterPlot();
scattorplot.Margin(20, 20, 30, 40).ScreenWidth(800).ScreenHeight(300).Canvas("#xihan");		

var heatmap = new Heatmap();
heatmap.Margin(20, 20, 30, 40).ScreenWidth(800).ScreenHeight(300).Canvas("#xihan");

d3.csv("./lib/data/new_sample.csv", function(csv){

	d3.select("#seimei").datum(csv).call(chart);
	
	//scattorplot.bindData(csv, "ratings", "comments", "video_ID").draw();

	heatmap.bindData(csv, "views", "rate", "ratings").draw();

	//console.log(getCategories(csv, "rate"));
});