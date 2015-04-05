function Controller()
{
	var charts = [];
     
	this.registerChart = function (chart) { charts.push(chart); }

	this.updateColumn = function (attrName, newOrder) {
		charts.forEach(function (chart){
				chart.updateAxis(attrName, newOrder);
		})
	}

	this.createMatrix = function(nNum, nCat)
	{
	    var matrix = d3.select("#gplom").append("h3").value("GPLOM");

	    matrix.append("table").append("tbody");



        
	}
}

function drawPrototypes (data)
{
    //Init
    var chart = barchart().width(800).height(300)
		.numerical("comments").categorical("rate").categoryValues(["0-1", "1-2", "2-3", "3-4", "4-5"])
		.yLabel("Video Length (seconds)").tooltipLabel("Video Length");

    var scatterplot_prototype = new ScatterPlot();
    scatterplot_prototype.Margin(20, 20, 30, 40).ScreenWidth(500).ScreenHeight(300).Canvas("#xihan1");

    var heatmap_prototype = new Heatmap();
    heatmap_prototype.Margin(20, 20, 30, 40).ScreenWidth(800).ScreenHeight(300).Canvas("#xihan2");

    //Load data and draw
    d3.select("#seimei").datum(data).call(chart);
    scatterplot_prototype.bindData(data, "ratings", "comments", "video_ID", "views", "rate").draw();
    heatmap_prototype.bindData(data, "rate", ["0-1", "1-2", "2-3", "3-4", "4-5"], "views", ["< 10k", "< 50k", "< 100k", ">= 100k"], "ratings").draw();
}

function drawGPLOM(data)
{
    //Init
	var barchart1 = barchart().width(250).height(250)
			.numerical("ratings").categorical("rate").categoryValues(["0-1","1-2","2-3","3-4","4-5"])
			.yLabel("Ratings (average)").tooltipLabel("Ratings").svgID("barsvg1").canvasID("cell4"),
		barchart2 = barchart().width(250).height(250)
			.numerical("ratings").categorical("views").categoryValues(["< 10000", "< 50000","< 100000", ">= 100000"])
			.yLabel("Ratings (average)").tooltipLabel("Ratings").svgID("barsvg2").canvasID("cell5"),
		barchart3 = barchart().width(250).height(250)
			.numerical("comments").categorical("rate").categoryValues(["0-1","1-2","2-3","3-4","4-5"])
			.yLabel("Comments (average)").tooltipLabel("Comments").svgID("barsvg3").canvasID("cell7"),
		barchart4 = barchart().width(250).height(250)
		.numerical("comments").categorical("views").categoryValues(["< 10000", "< 50000","< 100000", ">= 100000"])
		.yLabel("Comments (average)").tooltipLabel("Comments").svgID("barsvg4").canvasID("cell8");

	var heatmap1 = new Heatmap(),
		heatmap2 = new Heatmap(),
		heatmap3 = new Heatmap();

	heatmap1.Margin(20, 20, 30, 60).ScreenWidth(250).ScreenHeight(250).Canvas("#cell1");
	heatmap2.Margin(20, 20, 30, 60).ScreenWidth(250).ScreenHeight(250).Canvas("#cell2");
	heatmap3.Margin(20, 20, 30, 60).ScreenWidth(250).ScreenHeight(250).Canvas("#cell3");

	var scatterplot1 = new ScatterPlot(),
		scatterplot2 = new ScatterPlot(),
		scatterplot3 = new ScatterPlot();

	scatterplot1.Margin(20, 20, 30, 40).ScreenWidth(250).ScreenHeight(250).Canvas("#cell6");
	scatterplot2.Margin(20, 20, 30, 40).ScreenWidth(250).ScreenHeight(250).Canvas("#cell9");
	scatterplot3.Margin(20, 20, 30, 40).ScreenWidth(250).ScreenHeight(250).Canvas("#cell10");

    //Load data and draw
	d3.select("#cell2").datum(data).call(barchart1);
	d3.select("#cell3").datum(data).call(barchart2);
	d3.select("#cell4").datum(data).call(barchart3);
	d3.select("#cell5").datum(data).call(barchart4);
	d3.select("#cell4").datum(data).call(barchart1);
	d3.select("#cell5").datum(data).call(barchart2);
	d3.select("#cell7").datum(data).call(barchart3);
	d3.select("#cell8").datum(data).call(barchart4);

	heatmap1.bindData(data, "rate", ["0-1", "1-2", "2-3", "3-4", "4-5"], "views", ["< 10000", "< 50000", "< 100000", ">= 100000"], "ratings").draw();
	heatmap2.bindData(data, "rate", ["0-1", "1-2", "2-3", "3-4", "4-5"], "views", ["< 10000", "< 50000", "< 100000", ">= 100000"], "ratings").draw();
	heatmap3.bindData(data, "rate", ["0-1", "1-2", "2-3", "3-4", "4-5"], "views", ["< 10000", "< 50000", "< 100000", ">= 100000"], "ratings").draw();

	scatterplot1.bindData(data, "ratings", "comments", "video_ID", "views", "rate").draw();
	scatterplot2.bindData(data, "ratings", "comments", "video_ID", "views", "rate").draw();
	scatterplot3.bindData(data, "ratings", "comments", "video_ID", "views", "rate").draw();

	controller.registerChart(barchart1);
	controller.registerChart(barchart2);
	controller.registerChart(barchart3);
	controller.registerChart(barchart4);
	controller.registerChart(heatmap1);
	controller.registerChart(heatmap2);
	controller.registerChart(heatmap3);
}

var controller = new Controller();

d3.csv("./lib/data/youtube.csv", function (csv)
{


	drawPrototypes(csv);

    drawGPLOM(csv);

    var d = new DataGenerator(csv);


});