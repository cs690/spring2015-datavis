function Controller()
{
	var charts = [];
     
	this.registerChart = function (chart) { charts.push(chart); }

	this.updateColumn = function (attrName, newOrder) {
		charts.forEach(function (chart){
				chart.updateAxis(attrName, newOrder);
		})
	}

	this.createMatrix = function(n)
	{
	    var matrix = d3.select("#gplom").append("h3").html("GPLOM");
	    matrixBody = matrix.append("table").append("tbody");
	    var row = undefined;
	    var cell = undefined;
	    var cellNumber = 1;
	    for (var i = 0; i < n; i++) {
	        row = matrixBody.append("tr");
	        row.append("td").append("b").style("font-size", "large").html("A");
	        for (var j = 0; j < n; j++) {
	            cell = row.append("td");
	            if (j <= i) {
	                cell.attr("id", "cell" + cellNumber);
	                cellNumber += 1;
	            }
	        }
	    }
	    row = matrixBody.append("tr");
	    row.append("td");
	    for (var i = 0; i < n; i++) {
	        row.append("td").append("b").style("font-size", "large").html("B");
	    }
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

	
	var dataHandler = new DataHandler(data.slice()),
		viewsMax = dataHandler.findMaxValue("views",["ratings","length"]),
		ratingsMax = dataHandler.findMaxValue("category",["ratings","length"]);
	
	var barchart1 = barchart().width(250).height(250)
			.numerical("ratings").categorical("views").categoryValues(["\u003C10K","\u003C50K","\u003C100K", "\u2265100K"])
			.tooltipLabel("Ratings").svgID("barsvg1").canvasID("cell4")
			.maxValue(viewsMax),
		barchart2 = barchart().width(250).height(250)
			.numerical("ratings").categorical("category").categoryValues(["1","2","3","4","5","6","7","8"])
			.tooltipLabel("Ratings").svgID("barsvg2").canvasID("cell5")
			.maxValue(ratingsMax),
		barchart3 = barchart().width(250).height(250)
			.numerical("ratings").categorical("views").categoryValues(["\u003C10K","\u003C50K","\u003C100K", "\u2265100K"])
			.tooltipLabel("Length").svgID("barsvg3").canvasID("cell7")
			.maxValue(viewsMax),
		barchart4 = barchart().width(250).height(250)
			.numerical("length").categorical("category").categoryValues(["1","2","3","4","5","6","7","8"])
			.tooltipLabel("Length").svgID("barsvg4").canvasID("cell8")
			.maxValue(ratingsMax);
	
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
	d3.select("#cell4").datum(data).call(barchart1);
	d3.select("#cell5").datum(data).call(barchart2);
	d3.select("#cell7").datum(data).call(barchart3);
	d3.select("#cell8").datum(data).call(barchart4);
	

	heatmap1.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "category", undefined, "ratings").draw();
	heatmap2.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "rate", ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"], "ratings").draw();
	heatmap3.bindData(data, "category", undefined, "rate", ["1 star", "2 stars", "3 stars", "4 stars", "5 stars"], "ratings").draw();

	scatterplot1.bindData(data, "ratings", "comments", "video_ID", ["views", "rate", "category"]).draw();
	scatterplot2.bindData(data, "length", "comments", "video_ID", ["views", "rate", "category"]).draw();
	scatterplot3.bindData(data, "length", "ratings", "video_ID", ["views", "rate", "category"]).draw();

	
	controller.registerChart(barchart1);
	controller.registerChart(barchart2);
	controller.registerChart(barchart3);
	controller.registerChart(barchart4);
	controller.registerChart(heatmap1);
	controller.registerChart(heatmap2);
	controller.registerChart(heatmap3);
}

var controller = new Controller(),
	dataHandler;

d3.csv("./lib/data/youtube.csv", function (csv)
{
    //Extensive
    //controller.createMatrix(4);

	drawPrototypes(csv);

    drawGPLOM(csv);

    //dataHandler = new DataHandler(csv);

	//Example usage
	/*
	console.log(handler.findMaxValue("rate", ["comments","ratings","length"]));
	console.log(handler.findMaxValue("category", ["comments","ratings","length"]));
	console.log(handler.findMaxValue("views", ["comments", "ratings", "length"]));
	*/



});