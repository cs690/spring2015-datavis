function drawPrototypes (data)
{
    //Init
    var chart = barchart().width(800).height(300)
		.numerical("comments").categorical("rate").categoryValues(["0-1", "1-2", "2-3", "3-4", "4-5"])
		.yLabel("Video Length (seconds)").tooltipLabel("Video Length");

    var scattorplot_prototype = new ScatterPlot();
    scattorplot_prototype.Margin(20, 20, 30, 40).ScreenWidth(500).ScreenHeight(300).Canvas("#xihan1");

    var heatmap_prototype = new Heatmap();
    heatmap_prototype.Margin(20, 20, 30, 40).ScreenWidth(800).ScreenHeight(300).Canvas("#xihan2");

    //Load data and draw
    d3.select("#seimei").datum(data).call(chart);
    scattorplot_prototype.bindData(data, "ratings", "comments", "video_ID").draw();
    heatmap_prototype.bindData(data, "views", "rate", "ratings").draw();
}

function drawGPLOM(data)
{
    //Init
	var barchart1 = barchart().width(350).height(350)
			.numerical("ratings").categorical("rate").categoryValues(["0-1","1-2","2-3","3-4","4-5"])
			.yLabel("Ratings (average)").tooltipLabel("Ratings").svgID("barsvg1").canvasID("cell2"),
		barchart2 = barchart().width(350).height(350)
			.numerical("ratings").categorical("views").categoryValues(["< 10000", "< 50000","< 100000", ">= 100000"])
			.yLabel("Ratings (average)").tooltipLabel("Ratings").svgID("barsvg2").canvasID("cell3"),
		barchart3 = barchart().width(350).height(350)
			.numerical("comments").categorical("rate").categoryValues(["0-1","1-2","2-3","3-4","4-5"])
			.yLabel("Comments (average)").tooltipLabel("Comments").svgID("barsvg3").canvasID("cell4"),
		barchart4 = barchart().width(350).height(350)
		.numerical("comments").categorical("views").categoryValues(["< 10000", "< 50000","< 100000", ">= 100000"])
		.yLabel("Comments (average)").tooltipLabel("Comments").svgID("barsvg4").canvasID("cell5");

	var heatmap = new Heatmap();
	heatmap.Margin(20, 20, 30, 40).ScreenWidth(350).ScreenHeight(350).Canvas("#cell1");

	var scattorplot = new ScatterPlot();
	scattorplot.Margin(20, 20, 30, 40).ScreenWidth(350).ScreenHeight(350).Canvas("#cell6");

    //Load data and draw
	d3.select("#cell2").datum(data).call(barchart1);
	d3.select("#cell3").datum(data).call(barchart2);
	d3.select("#cell4").datum(data).call(barchart3);
	d3.select("#cell5").datum(data).call(barchart4);
	scattorplot.bindData(data, "ratings", "comments", "video_ID").draw();
	heatmap.bindData(data, "views", "rate", "ratings").draw();

}

d3.csv("./lib/data/new_sample.csv", function(csv){

    drawPrototypes(csv);

    drawGPLOM(csv);

});