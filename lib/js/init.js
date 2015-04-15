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

	var dataHandler = new DataHandler(data.slice()),
		viewsMax = dataHandler.findMaxValue(["ratings","length"], "views"),
		ratingsMax = dataHandler.findMaxValue(["ratings","length"], "category"),
		maxValue = Math.max(viewsMax, ratingsMax);

	
	var barchart1 = barchart().width(200).height(200)
			.numerical("ratings").categorical("views").categoryValues(["<10K","<50K","<100K", "\u2265100K"])
			.tooltipYLabel("Ratings").tooltipXLabel("Views").svgID("barsvg1").canvasID("cell4")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 30, left: 20 }),
		barchart2 = barchart().width(200).height(200)
			.numerical("ratings").categorical("category").categoryValues(["1","2","3","4","5","6","7","8"])
			.tooltipYLabel("Ratings").tooltipXLabel("Category").svgID("barsvg2").canvasID("cell5")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 30, left: 20 }),
		barchart3 = barchart().width(200).height(200)
			.numerical("length").categorical("views").categoryValues(["<10K","<50K","<100K", "\u2265100K"])
			.tooltipYLabel("Length").tooltipXLabel("Views").svgID("barsvg3").canvasID("cell7")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 30, left: 20 }),
		barchart4 = barchart().width(200).height(200)
			.numerical("length").categorical("category").categoryValues(["1","2","3","4","5","6","7","8"])
			.tooltipYLabel("Length").tooltipXLabel("Category").svgID("barsvg4").canvasID("cell8")
			.maxValue(maxValue).margin({ top: 40, right: 10, bottom: 30, left: 20 });
	
    var heatmap1 = new Heatmap().Canvas("#cell1").ScreenWidth(200).ScreenHeight(200),
		heatmap2 = new Heatmap().Canvas("#cell2").ScreenWidth(200).ScreenHeight(200),
		heatmap3 = new Heatmap().Canvas("#cell3").ScreenWidth(200).ScreenHeight(200);

	heatmap1.Margin(30, 20, 20, 30);
	heatmap2.Margin(30, 20, 20, 30);
    heatmap3.Margin(30, 20, 20, 30);
    //heatmap1.Margin(5, 5, 5, 5).DisplayAxis(false, false);
    //heatmap2.Margin(5, 5, 5, 5).DisplayAxis(false, false);
    //heatmap3.Margin(5, 5, 5, 5).DisplayAxis(false, false);

    var scatterplot1 = new ScatterPlot().Canvas("#cell6").ScreenWidth(200).ScreenHeight(200),
		scatterplot2 = new ScatterPlot().Canvas("#cell9").ScreenWidth(200).ScreenHeight(200),
		scatterplot3 = new ScatterPlot().Canvas("#cell10").ScreenWidth(200).ScreenHeight(200);

	scatterplot1.Margin(40, 20, 30, 40).DisplayAxisName(false, false);
	scatterplot2.Margin(40, 20, 30, 40).DisplayAxisName(false, false);
	scatterplot3.Margin(40, 20, 30, 40).DisplayAxisName(false, false);

    //Load data and draw
	d3.select("#cell4").datum(data).call(barchart1);
	d3.select("#cell5").datum(data).call(barchart2);
	d3.select("#cell7").datum(data).call(barchart3);
	d3.select("#cell8").datum(data).call(barchart4);
	
	heatmap1.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "category", undefined, "ratings").draw();
	heatmap2.bindData(data, "views", ["\u003C10K", "\u003C50K", "\u003C100K", "\u2265100K"], "rate", ["\u26051", "\u26052", "\u26053", "\u26054", "\u26055"], "ratings").draw();
	heatmap3.bindData(data, "category", undefined, "rate", ["\u26051", "\u26052", "\u26053", "\u26054", "\u26055"], "ratings").draw();

	maxValue = dataHandler.findMaxValue(["ratings", "length", "comments"]);
	scatterplot1.bindData(data, "ratings", "comments", "video_ID", ["views", "rate", "category"]).updateAxis("ratings", maxValue).updateAxis("comments", maxValue).draw();
	scatterplot2.bindData(data, "length", "comments", "video_ID", ["views", "rate", "category"]).updateAxis("length", maxValue).updateAxis("comments", maxValue).draw();
	scatterplot3.bindData(data, "length", "ratings", "video_ID", ["views", "rate", "category"]).updateAxis("length", maxValue).updateAxis("ratings", maxValue).draw();

	
	controller.registerChart(barchart1);
	controller.registerChart(barchart2);
	controller.registerChart(barchart3);
	controller.registerChart(barchart4);
	controller.registerChart(heatmap1);
	controller.registerChart(heatmap2);
	controller.registerChart(heatmap3);


	var drawLegends = new colorLegends().canvasID("#cell11")
		.margin({top:30, left:20, bottom:0, legend:10, text:10})
		.colorMap({"#e41a1c": "Comedy",
			       "#377eb8": "Entertainment",
			       "#4daf4a": "Film & Animation",
		  		   "#984ea3": "Music",
				   "#ff7f00": "News & Politics",
				   "#ffff33": "People & Blogs",
			       "#a65628": "Sports",
				   "#f781bf": "Others"});
	drawLegends();
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