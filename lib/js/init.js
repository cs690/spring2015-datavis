function Controller()
{
	var charts = [];
     
	this.registerChart = function (chart) { charts.push(chart); }

	this.updateColumn = function (attrName, newOrder) {
		charts.forEach(function (chart){ chart.updateAxis(attrName, newOrder); })
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
		.yLabel("Video Length (seconds)").tooltipYLabel("Video Length");

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

	var size = 200,
		dataHandler = new DataHandler(data.slice()),
		viewsMax = dataHandler.findMaxValue(["ratings","length"], "views"),
		ratingsMax = dataHandler.findMaxValue(["ratings","length"], "category"),
		maxValue = Math.max(viewsMax, ratingsMax),
		categoryLabels = ["Comedy", "Entertainment", "Film & Animation", "Music",
							"News & Politics", "People & Blogs", "Sports", "Others"],
		viewValues = ["<10K","<50K","<100K", "\u2265100K"],
		categValues = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465", "\u2466", "\u2467"],
		//categValues = ["1", "2", "3", "4", "5", "6", "7", "8"],
		starValues = ["\u26051", "\u26052", "\u26053", "\u26054", "\u26055"];


	var barchart1 = barchart().width(size).height(size)
			.numerical("comments").categorical("views").categoryValues(viewValues)
			.tooltipYLabel("Average Comments").tooltipXLabel("Views").svgID("barsvg1").canvasID("cell11")
			.offAxis(true).maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart2 = barchart().width(size).height(size)
			.numerical("comments").categorical("category").categoryValues(categValues)
			.tooltipYLabel("Average Comments").tooltipXLabel("Category").svgID("barsvg2").canvasID("cell12")
			.categoryLabels(categoryLabels).offAxis(true)
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart3 = barchart().width(size).height(size)
			.numerical("comments").categorical("rate").categoryValues(starValues)
			.tooltipYLabel("Average Comments").tooltipXLabel("Stars").svgID("barsvg3").canvasID("cell13")
			.offAxis(true).maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart4 = barchart().width(size).height(size)
			.numerical("ratings").categorical("views").categoryValues(viewValues)
			.tooltipYLabel("Average Ratings").tooltipXLabel("Views").svgID("barsvg4").canvasID("cell16")
			.offAxis(true).maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart5 = barchart().width(size).height(size)
			.numerical("ratings").categorical("category").categoryValues(categValues)
			.tooltipYLabel("Average Ratings").tooltipXLabel("Category").svgID("barsvg5").canvasID("cell17")
			.categoryLabels(categoryLabels).offAxis(true)
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart6 = barchart().width(size).height(size)
			.numerical("ratings").categorical("rate").categoryValues(starValues)
			.tooltipYLabel("Average Ratings").tooltipXLabel("Stars").svgID("barsvg6").canvasID("cell18")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }).offAxis(true),
		barchart7 = barchart().width(size).height(size)
			.numerical("length").categorical("views").categoryValues(viewValues)
			.tooltipYLabel("Average Video Length").tooltipXLabel("Views").svgID("barsvg7").canvasID("cell21")
			.offAxis(true).maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart8 = barchart().width(size).height(size)
			.numerical("length").categorical("category").categoryValues(categValues)
			.tooltipYLabel("Average Video Length").tooltipXLabel("Category").svgID("barsvg8").canvasID("cell22")
			.categoryLabels(categoryLabels).offAxis(true)
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }),
		barchart9 = barchart().width(size).height(size)
			.numerical("length").categorical("rate").categoryValues(starValues)
			.tooltipYLabel("Length").tooltipXLabel("Stars").svgID("barsvg9").canvasID("cell23")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 10, left: 10 }).offAxis(true);

    var heatmap1 = new Heatmap().Canvas("#cell1").ScreenWidth(size).ScreenHeight(size),
		heatmap2 = new Heatmap().Canvas("#cell6").ScreenWidth(size).ScreenHeight(size),
		heatmap3 = new Heatmap().Canvas("#cell7").ScreenWidth(size).ScreenHeight(size),
		scatterplot1 = new ScatterPlot().Canvas("#cell19").ScreenWidth(size).ScreenHeight(size),
		scatterplot2 = new ScatterPlot().Canvas("#cell24").ScreenWidth(size).ScreenHeight(size),
		scatterplot3 = new ScatterPlot().Canvas("#cell25").ScreenWidth(size).ScreenHeight(size);


	heatmap1.Margin(10, 10, 10, 10).DisplayAxis(false, false);
	heatmap2.Margin(10, 10, 10, 10).DisplayAxis(false, false);
	heatmap3.Margin(10, 10, 10, 10).DisplayAxis(false, false);
	scatterplot1.Margin(10, 10, 10, 10).DisplayAxis(false, false);
	scatterplot2.Margin(10, 10, 10, 10).DisplayAxis(false, false);
    scatterplot3.Margin(10, 10, 10, 10).DisplayAxis(false, false);


	//Load data and draw
	d3.select("#cell11").datum(data).call(barchart1);
	d3.select("#cell12").datum(data).call(barchart2);
	d3.select("#cell13").datum(data).call(barchart3);
	d3.select("#cell16").datum(data).call(barchart4);
	d3.select("#cell17").datum(data).call(barchart5);
	d3.select("#cell18").datum(data).call(barchart6);
	d3.select("#cell21").datum(data).call(barchart7);
	d3.select("#cell22").datum(data).call(barchart8);
	d3.select("#cell23").datum(data).call(barchart9);

	heatmap1.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "category", categValues, "ratings").draw();
	heatmap2.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "rate", ["\u26051", "\u26052", "\u26053", "\u26054", "\u26055"], "ratings").draw();
	heatmap3.bindData(data, "category", categValues, "rate", ["\u26051", "\u26052", "\u26053", "\u26054", "\u26055"], "ratings").draw();

	maxValue = dataHandler.findMaxValue(["ratings", "length", "comments"]);
	scatterplot1.bindData(data, "comments", "ratings", "video_ID", ["views", "rate", "category"]).updateAxis("ratings", maxValue).updateAxis("comments", maxValue).draw();
	scatterplot2.bindData(data, "comments", "length", "video_ID", ["views", "rate", "category"]).updateAxis("length", maxValue).updateAxis("comments", maxValue).draw();
	scatterplot3.bindData(data, "ratings", "length", "video_ID", ["views", "rate", "category"]).updateAxis("length", maxValue).updateAxis("ratings", maxValue).draw();

	
	controller.registerChart(barchart1);
	controller.registerChart(barchart2);
	controller.registerChart(barchart3);
	controller.registerChart(barchart4);
	controller.registerChart(barchart5);
	controller.registerChart(barchart6);
	controller.registerChart(barchart7);
	controller.registerChart(barchart8);
	controller.registerChart(barchart9);
	controller.registerChart(heatmap1);
	controller.registerChart(heatmap2);
	controller.registerChart(heatmap3);


	var map = {
	    "#a6cee3": "\u2460 Comedy",
	    "#b2df8a": "\u2461 Entertainment",
	    "#33a02c": "\u2462 Film & Animation",
	    "#fb9a99": "\u2463 Music",
	    "#fdbf6f": "\u2464 News & Politics",
	    "#ff7f00": "\u2465 People & Blogs",
	    "#cab2d6": "\u2466 Sports",
	    "#6a3d9a": "\u2467 Others"
	}

	var drawCategLegends = new CategoryLegends().canvasID("#cell2")
			.margin({top:30, left:20, bottom:0, legend:10, text:10}).isColor(false).colorMap(map),
		drawHeatmapLegends = new HeatmapLegend().canvasID("#cell8")
			.x(30).width(size).height(size).rectHeight(163);

	//Axises for Numerical features
	var drawXAxisCol4 = new Axis().canvasID("#col4label").maxValue(maxValue).isHorizontal(true)
			.height(30).margin({ top: 0, right: 10, bottom: 0, left: 10 }).ticks(5),
		drawXAxisCol5 = new Axis().canvasID("#col5label").maxValue(maxValue).isHorizontal(true)
			.height(30).margin({ top: 0, right: 10, bottom: 0, left: 10 }).ticks(5),
		drawYAxisRow3 = new Axis().canvasID("#row3label").maxValue(maxValue).isHorizontal(false)
			.width(40).margin({ top: 10, right: 1, bottom: 10, left: 20 }).ticks(5),
		drawYAxisRow4 = new Axis().canvasID("#row4label").maxValue(maxValue).isHorizontal(false)
			.width(40).margin({ top: 10, right: 1, bottom: 10, left: 20 }).ticks(5),
		drawYAxisRow5 = new Axis().canvasID("#row5label").maxValue(maxValue).isHorizontal(false)
			.width(40).margin({ top: 10, right: 1, bottom: 10, left: 20 }).ticks(5);

	//Axises for Categorical features
	var drawXAxisCol1 = new Axis().canvasID("#col1label").isCategorical(true)
        	.isHorizontal(true).isColor(false).categoryName("views").height(30)
			.margin({ top: 0, right: 10, bottom: 0, left: 10 }).categoryValues(viewValues),
		drawXAxisCol2 = new Axis().canvasID("#col2label").isCategorical(true)
		.isHorizontal(true).isColor(false).categoryName("category").height(30)
			.margin({ top: 0, right: 10, bottom: 0, left: 10 }).categoryValues(categValues),
		drawXAxisCol3 = new Axis().canvasID("#col3label").isCategorical(true)
			.isHorizontal(true).isColor(false).categoryName("rate").height(30)
			.margin({ top: 0, right: 10, bottom: 0, left: 10 }).categoryValues(starValues),
		drawYAxisRow1 = new Axis().canvasID("#row1label").isCategorical(true)
    		.isHorizontal(false).isColor(false).categoryName("category").width(40)
			.margin({ top: 10, right: 1, bottom: 10, left: 20 }).categoryValues(categValues),
		drawYAxisRow2 = new Axis().canvasID("#row2label").isCategorical(true)
		.isHorizontal(false).isColor(false).categoryName("rate").width(40)
			.margin({ top: 10, right: 1, bottom: 10, left: 20 }).categoryValues(starValues);

	drawCategLegends();
	drawHeatmapLegends();
	drawYAxisRow1();
	drawYAxisRow2();
	drawYAxisRow3();
	drawYAxisRow4();
	drawYAxisRow5();
	drawXAxisCol1();
	drawXAxisCol2();
	drawXAxisCol3();
	drawXAxisCol4();
	drawXAxisCol5();

	controller.registerChart(drawXAxisCol1);
	controller.registerChart(drawXAxisCol2);
	controller.registerChart(drawXAxisCol3);
	controller.registerChart(drawYAxisRow1);
	controller.registerChart(drawYAxisRow2);
}

var controller = new Controller(),
	dataHandler;


d3.csv("./lib/data/youtube.csv", function (csv)
{

	drawGPLOM(csv);


	//Extensive
    //controller.createMatrix(4);

	drawPrototypes(csv);


    //dataHandler = new DataHandler(csv);

	//Example usage
	/*
	console.log(handler.findMaxValue("rate", ["comments","ratings","length"]));
	console.log(handler.findMaxValue("category", ["comments","ratings","length"]));
	console.log(handler.findMaxValue("views", ["comments", "ratings", "length"]));
	*/
});