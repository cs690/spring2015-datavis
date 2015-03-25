function barchart() {
    var margin = {top:20, left:20, right:20, bottom:30},
        yScale = d3.scale.linear().clamp(true),
        xScale = d3.scale.ordinal(),
        yAxis = d3.svg.axis(),
        xAxis = d3.svg.axis(),
        yLabel = "Label",
        svgID = "barchart",
        canvasID = "seimei",
        numerical = "",
        categorical = "",
        labelFontSize = 11,
        tooltipLabel = "Length",
        categoryValues = [],
        width = 1000, // default width
        height = 300, // default height
        xValue = 0, // default x coordinate
        yValue = 0; // default y coordinate

    function chart(selection) {

        selection.each(function (data){

        	data.forEach(function (d, i) { 
        		data[i][numerical] = +d[numerical];
        		data[i]["index"] = i;

        	});


            //Add a checkbox
			var checkbox = d3.select("#" + canvasID)
                .append("input")
                .attr("type", "checkbox")
                .attr("id", "checked" + canvasID);
			
            var svg, maxVal, labelX, labelY,
                labelPadding = 20,
                fontSize = 11,
                defaultBarColor = "teal",
                cboxX = width - (width / 5) - margin.left - margin.right,
                cboxY = margin.top / 2,
                sortStr = "Sort",
                counts = categoryValues.map(function(){return 0;}),
                processedData = counts.slice(),
                tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-5, 0])
                    .html(function(d) {
                        return "<strong>" + tooltipLabel
                            + ": </strong> <span style='color:#4e240e'>" + d.average + "</span>";
                    })

            data.forEach(function(d,i){
                //Count frequencies (here, assume that
                // categorical values are integers such that 1 ... n)
                var index = +d[categorical] - 1;
                counts[index] += 1;
                processedData[index] += d[numerical];
            })


            processedData = processedData.map(function(d,i){
                return {categIndex: i + 1,
                        category: categoryValues[i],
                        average:Math.round(processedData[i] / counts[i])};
            });


            maxVal = d3.max(processedData, function(d,i){return d.average;})


            xScale.domain(processedData.map(function(d,i){return d.category;}))
                .rangeRoundBands([margin.left + labelPadding, width - margin.right], 0.4);


            yScale.domain([0, maxVal])
                .range([height - margin.bottom, margin.top]);
            margin.left += 5 * (Math.log(maxVal) / Math.log(10));


            labelX = margin.left + labelPadding / 2;
            labelY = yScale(maxVal) + fontSize / 2 * yLabel.length;


            d3.select("#" + canvasID).append("svg")
                .attr("id", svgID).attr("height", height).attr("width", width);
            svg = d3.select("#" + svgID);
            svg.call(tip);


			checkbox.style({
                position: "absolute",
				top: cboxY + "px",
				left: cboxX + "px"
			});
				
            //Add text for the checkbox
            svg.append("text")
                .attr("x", cboxX + (sortStr.length * fontSize) + "px")
                .attr("y", cboxY + "px")
                .style({"text-anchor": "end"})
                .text(sortStr);

            //Draw bars
            svg.selectAll("rect").data(processedData).enter().append("rect").
                attr("height", 0)
                .attr("y", height - margin.bottom)
                .attr("width", xScale.rangeBand())
                .attr("x", function (d, i) {
                    return xScale(d.category);
                })
                .attr("fill", defaultBarColor)
                .attr("class", function(d, i) {

                		return "bar " +
                               "bar" + d.categIndex + " " +
                               categorical + d.categIndex;
                	})
                .on("mouseover", tip.show)
                .on("mouseenter", function(d){

                    commonOnEvent([categorical + d.categIndex]);
                })
                .on("mouseout", function(d){
                    tip.hide();
                    commonLeaveEvent([categorical + d.categIndex]);
                })
                .transition()
                .duration(800)
                .attr("height", function(d){ return height - margin.bottom - yScale(d.average);})
                .attr("y", function(d) {return yScale(d.average);});


            //Put a label for y-axis
            svg.append("text")
                .attr("x", labelX)
                .attr("y", labelY)
                .attr("text-anchor", "start")
                .text(yLabel)
                .attr("transform", "rotate(-90 " + labelX + "," + labelY + ")")
                .style({"font-family": "sans-serif",
                        "font-size": fontSize + "px"});

            //Draw y-axis
            yAxis.scale(yScale).orient("left");
            svg.append("g")
                .attr("transform", "translate(" + margin.left + ", 0)")
                .attr("class", "axis")
                .call(yAxis);


            //Draw x-axis
            xAxis.scale(xScale).orient("bottom");
            svg.append("g")
                .attr("transform", "translate(0,"  + (height - margin.bottom) + ")")
                .attr("class", "x axis")
                .call(xAxis.scale(xScale.domain(processedData
                    .map(function(d,i){return d.category;})).copy()));


            //Set an event (sort bars in descending order) to the checkbox
            d3.select("#checked" + canvasID).on("change", change);

            function change() {

                var transition = svg.transition().duration(750),
                    delay = function(d, i) { return i * 50; };

                clearTimeout(setTimeout(function() {
                    d3.select("#checked" + canvasID).property("checked", true).each(change);}, 2000));

                processedData.sort(this.checked
                    ? function(a, b) { return b.average - a.average; }
                    : function(a, b) { return +b.categIndex < +a.categIndex; });

                xScale.domain(processedData.map(function(d) { return d.category; }));

                transition.selectAll(".bar")
                    .delay(delay)
                    .attr("x", function(d) { return xScale(d.category); });

                transition.select(".x.axis")
                    .call(d3.svg.axis().scale(xScale).orient("bottom"))
                    .selectAll("g")
                    .delay(delay);

            }



        })



    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.x = function(value) {
        if (!arguments.length) return xValue;
        xValue = value;
        return chart;
    };

    chart.y = function(value) {
        if (!arguments.length) return yValue;
        yValue = value;
        return chart;
    }

    chart.yLabel = function(value) {
        if (!arguments.length) return yLabel;
        yLabel = value;
        return chart;
    }

    chart.numerical = function(value) {
        if (!arguments.length) return numerical;
        numerical = value;
        return chart;
    }

    chart.categorical = function(value) {
        if (!arguments.length) return categorical;
        categorical = value;
        return chart;
    }

    chart.tooltipLabel = function(value) {
        if (!arguments.length) return tooltipLabel;
        tooltipLabel = value;
        return chart;
    }

    chart.svgID = function(value) {
        if (!arguments.length) return svgID;
        svgID = value;
        return chart;
    }

    chart.canvasID = function(value) {
        if (!arguments.length) return canvasID;
        canvasID = value;
        return chart;
    }

    chart.labelFontSize = function(value) {
        if (!arguments.length) return labelFontSize;
        labelFontSize = value;
        return chart;
    }

    chart.categoryValues = function(values) {
        if (!arguments.length) return categoryValues;
        categoryValues = values;
        return chart;
    }

    return chart;
}

function ScatterPlot()
{
	var that = this;
	
	//Attributes
	this._margin = {top: 20, right: 20, bottom: 30, left: 40};
	this._width = 900;
	this._height = 450;
	this._screenWidth = 960;
	this._screenHeight = 500;
	
	this._canvas = {};
	this._axisX = {};
	this._axisY = {};
	this._id = {};
	this._data = {};
	this._categories = [];
	
	//Construction
	this.construct = function (top, right, bottom, left, screenWidth, screenHeight)
	{
		this.Margin(top, right, bottom, left);
		this.ScreenWidth(screenWidth);
		this.ScreenHeight(screenHeight);
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		this._update = function()
		{
			this._width = this._screenWidth - this._margin.left - this._margin.right;
			this._height = this._screenHeight - this._margin.top - this._margin.bottom;
		}
		
		this.Margin = function(top, right, bottom, left)
		{
			if (!arguments.length) return self._margin;
			this._margin.top = top;
			this._margin.right = right;
			this._margin.bottom = bottom;
			this._margin.left = left;
			return this;
		}
		
		this.ScreenWidth = function(value)
		{
			if (!arguments.length) return self._screenWidth;
			this._screenWidth = value;
			this._update();
			return this;
		}
		
		this.ScreenHeight = function(value)
		{
			if (!arguments.length) return self._screenHeight;
			this._screenHeight = value;
			this._update();
			return this;
		}
		
		this.Canvas = function(tag)
		{
			if (!arguments.length) return self._canvas;
			this._canvas = d3.select(tag);
			return this;
		}
		
		this.bindData = function(data, attrX, attrY, attrV, attrC1, attrC2)
		{
			this._id.name = attrV;
			this._id.value = function(d) { return "uid_" + d[attrV];};
			
			this._axisX.name = attrX;
			this._axisX.value = function(d) { return d[attrX];};
			this._axisX.scale = d3.scale.linear().range([5, this._width+5]);
			this._axisX.map = function(d) { return that._axisX.scale(that._axisX.value(d));};
			this._axisX.instance = d3.svg.axis().scale(this._axisX.scale).orient("bottom");
			
			this._axisY.name = attrY;
			this._axisY.value = function(d) { return d[attrY];},
			this._axisY.scale = d3.scale.linear().range([this._height-5, -5]),
			this._axisY.map = function(d) { return that._axisY.scale(that._axisY.value(d));},
			this._axisY.instance = d3.svg.axis().scale(this._axisY.scale).orient("left");
			
			this._axisX.scale.domain([d3.min(data, this._axisX.value)-1, d3.max(data, this._axisX.value)+1]);
			this._axisY.scale.domain([d3.min(data, this._axisY.value)-1, d3.max(data, this._axisY.value)+1]);		

			this._categories.push(attrC1);
			this._categories.push(attrC2);

			this._data = data;
			return this;
		}

		this.draw = function()
		{
			// add the graph canvas to the body of the webpage
			var svg = this._canvas.append("svg")
				.attr("width", this._width + this._margin.left + this._margin.right)
				.attr("height", this._height + this._margin.top + this._margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");
			
			// add the tooltip area to the webpage
			var tooltip = this._canvas.append("div")
				.attr("class", "d3-tip")
                .style("position", "absolute")
				.style("opacity", 0);

			// x-axis
			svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + this._height + ")")
			  .call(this._axisX.instance)
			.append("text")
			  .attr("class", "label")
			  .attr("x", this._width)
			  .attr("y", -6)
			  .style("text-anchor", "end")
			  .text(this._axisX.name);
			
			// y-axis
			svg.append("g")
			  .attr("class", "y axis")
			  .call(this._axisY.instance)
			.append("text")
			  .attr("class", "label")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .text(this._axisY.name);
			
			// draw dots
			svg.selectAll(".scatter")
			  .data(this._data)
			.enter().append("circle")
			  .attr("class", function (d) { return "scatter " + that._categories[0] + d[that._categories[0]] + ' ' + that._categories[1] + d[that._categories[1]]; })
			  .attr("r", 2.5)
			  .attr("cx", this._axisX.map)
			  .attr("cy", this._axisY.map)
			  .style("fill", "teal")
			  .on("mousemove", function(d, i) {
                tooltip
                .style("opacity", 1)
                .html(that._id.value(d) + "<br/> (" + that._axisX.value(d) + ", " + that._axisY.value(d) + ")")
                .style("left", that._axisX.map(d) + "px")
                .style("top", (that._axisY.map(d) - 60) + "px");
                commonOnEvent([that._categories[0] + d[that._categories[0]], that._categories[1] + d[that._categories[1]]]);
			  })
			  .on("mouseout", function(d, i) {
				tooltip
				.style("opacity", 0);
				commonLeaveEvent([that._categories[0] + d[that._categories[0]], that._categories[1] + d[that._categories[1]]]);
			  });
		}
		this._initialized = true;
	}
	
	//Call construct
	this.construct(20, 20, 30, 40, 960, 500);
}

function Heatmap(top, right, bottom, left, screenWidth, screenHeight)
{
    var that = this;

    //Attributes
    this._margin = { top: 20, right: 20, bottom: 30, left: 40 };
    this._width = 900;
    this._height = 450;
    this._screenWidth = 960;
    this._screenHeight = 500;

    this._canvas = {};
    this._axisX = {};
    this._axisY = {};
    this._id = {};
    this._data = {};
    this._heatData = {};

    //Construction
    this.construct = function (top, right, bottom, left, screenWidth, screenHeight)
    {
        this.Margin(top, right, bottom, left);
        this.ScreenWidth(screenWidth);
        this.ScreenHeight(screenHeight);
    }
	
    //Methods
    if (typeof this._initialized == "undefined")
    {

        this._update = function ()
        {
            this._width = this._screenWidth - this._margin.left - this._margin.right;
            this._height = this._screenHeight - this._margin.top - this._margin.bottom;
        }

        this.Margin = function (top, right, bottom, left)
        {
            if (!arguments.length) return self._margin;
            this._margin.top = top;
            this._margin.right = right;
            this._margin.bottom = bottom;
            this._margin.left = left;
            return this;
        }

        this.ScreenWidth = function (value)
        {
            if (!arguments.length) return self._screenWidth;
            this._screenWidth = value;
            this._update();
            return this;
        }

        this.ScreenHeight = function (value)
        {
            if (!arguments.length) return self._screenHeight;
            this._screenHeight = value;
            this._update();
            return this;
        }

        this.Canvas = function (tag)
        {
            if (!arguments.length) return self._canvas;
            this._canvas = d3.select(tag);
            return this;
        }

        this.getCategories = function (data, attr)
        {
            return d3.set(data.map(function(d){ return d[attr]; })).values();
        }

        this.bindData = function (data, attrX, attrY, attrV)
        {

            this._id.name = attrV;
            this._id.value = function (d) { return "uid_" + d[attrV]; };

            this._axisX.name = attrX;
            this._axisX.value = function (d) { return d[attrX]; };
            this._axisX.categories = [''];
            this._axisX.categories.push.apply(this._axisX.categories, this.getCategories(data, attrX));
            this._axisX.scale = d3.scale.ordinal().domain(this._axisX.categories).rangePoints([0, this._width]);
            this._axisX.map = function (d) { return that._axisX.scale(that._axisX.value(d)); };
            this._axisX.instance = d3.svg.axis()
                .scale(this._axisX.scale).orient("bottom");


            this._axisY.name = attrY;
            this._axisY.value = function (d) { return d[attrY]; };
            this._axisY.categories = [''];
            this._axisY.categories.push.apply(this._axisY.categories, this.getCategories(data, attrY));
            this._axisY.scale = d3.scale.ordinal().domain(this._axisY.categories).rangePoints([this._height, 0]);
            this._axisY.map = function (d) { return that._axisY.scale(that._axisY.value(d)); };
			this._axisY.instance = d3.svg.axis().scale(this._axisY.scale).orient("left");

			this._data = data;

			var dg = new DataGenerator(data);


			dg.createClassString('bar', [1, 2, 3, 4, 5]);

			this._heatData = dg.createHeatData(attrX, attrY, attrV);

			this._id.color = d3.scale.linear().domain([this._heatData.minValue, (this._heatData.minValue + this._heatData.maxValue) / 2, this._heatData.maxValue]).range(['#d73027', '#ffffbf', '#4575b4']);

            return this;
        }

        this.draw = function ()
        {
            // add the graph canvas to the body of the webpage
            var svg = this._canvas.append("svg")
				.attr("width", this._width + this._margin.left + this._margin.right)
				.attr("height", this._height + this._margin.top + this._margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");

            // add the tooltip area to the webpage
            var tooltip = this._canvas.append("div")
				.attr("class", "d3-tip")
                .style("position", "absolute")
				.style("opacity", 0);

            svg.selectAll(".rect")
			  .data(this._heatData.data)
			.enter().append("rect")
			  .attr("class", function (d, i) { return "rect " + d['classes']; })
			  .attr("x", function (d) { return that._axisX.scale(d['attrX']) - that._axisX.scale.range()[1]; })
			  .attr("y", function (d) { return that._axisY.scale(d['attrY']); })
              .attr("width", this._axisX.scale.range()[1])
              .attr("height", this._axisY.scale.range()[this._axisY.categories.length - 2])
			  .style("fill", function (d)
			  {
			      if (d['value'] == 0) return 'white';
			      return that._id.color(d['value']);
			  })
            .on("mousemove", function (d, i)
            {
                commonOnEvent([that._axisX.name + d['attrX'], that._axisY.name + d['attrY']]);
                tooltip
                .style("opacity", 1)
                .html("Average " + that._id.name + ": " + d['value'])
                .style("left", (d3.event.x - 460) + "px")
                .style("top", (d3.event.y - 240) + "px");
            })
            .on("mouseout", function (d, i)
            {
                commonLeaveEvent([that._axisX.name + d['attrX'], that._axisY.name + d['attrY']]);
                tooltip
                .style("opacity", 0);
            });

            // x-axis
            svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + this._height + ")")
			  .call(this._axisX.instance);

            // y-axis
            svg.append("g")
			  .attr("class", "y axis")
			  .call(this._axisY.instance);
        }

        this._initialized = true;
    }

    //Call construct
    this.construct(20, 20, 30, 40, 960, 500);
}

function commonOnEvent(classes)
{
    classes.forEach(function (d, i)
    {
        d3.selectAll("." + d).style("opacity", "0.5");
    })
    /*
	d3.select(".scatter" + i).style("fill", "red");
	d3.select(".bar" + i).style("fill", "red");
	*/
}

function commonLeaveEvent (elements) {
    elements.forEach(function(d,i){
        d3.selectAll("." + d).style("opacity", "1");
    })
    /*
	d3.select(".scatter" + i).style("fill", "teal");
	d3.select(".bar" + i).style("fill", "teal");
	*/
}

function DataGenerator(data)
{
    var that = this;

    //Attributes
    this._data = {};
    this._categories = {};

    //Constructor
    this.constructor = function (data)
    {
        this._data = data;
    }

    //Methods
    if (typeof this._initialized == "undefined") {

        this.createCategories = function (attr)
        {
            this._categories[attr] = d3.set(this._data.map(function (d) { return d[attr]; })).values();
        }

        this.createHeatData = function (attrX, attrY, attrV)
        {
            var result = {};

            if (!(attrX in this._categories)) this.createCategories(attrX);
            if (!(attrY in this._categories)) this.createCategories(attrY);
            var heatData = [];
            var xL = this._categories[attrX].length,
                yL = this._categories[attrY].length;
            var heatValues = [],
                heatCounts = [],
                heatClasses = [];
            for (var i = 0; i < xL; i++) {
                heatValues[i] = [];
                heatCounts[i] = [];
                heatClasses[i] = [];
                for (var j = 0; j < yL; j++) {
                    heatValues[i][j] = 0;
                    heatCounts[i][j] = 0;
                    heatClasses[i][j] = [];
                }
            }

            var indexX = -1,
                indexY = -1;
            for (var i = 0; i < this._data.length; i++) {
                indexX = this._categories[attrX].indexOf(this._data[i][attrX]);
                indexY = this._categories[attrY].indexOf(this._data[i][attrY]);
                if (indexX >= 0 && indexX < xL && indexY >= 0 && indexY < yL) {
                    heatValues[indexX][indexY] += +this._data[i][attrV];
                    heatCounts[indexX][indexY] += 1;
                    heatClasses[indexX][indexY].push(i);
                }
            }

            for (var i = 0; i < xL; i++) {
                for (var j = 0; j < yL; j++) {
                    if (heatCounts[i][j] != 0) {
                        heatValues[i][j] = heatValues[i][j] / heatCounts[i][j];
                    }
                }
            }

            var heatData = [];
            for (var i = 0; i < xL; i++) {
                for (var j = 0; j < yL; j++) {
                    var row = { attrX: this._categories[attrX][i], attrY: this._categories[attrY][j], value: heatValues[i][j], classes: attrX + this._categories[attrX][i] + ' ' + attrY + this._categories[attrY][j] };
                    heatData[heatData.length] = row;
                }
            }

            result.data = heatData;
            heatValues = heatValues.reduce(function (a, b) { return a.concat(b); });
            result.maxValue = Math.max.apply(null, heatValues);
            heatValues.map(function (d) { return d == 0 ? Infinity : d });
            result.minValue = Math.min.apply(null, heatValues);
            return result;
        }

        this.createClassString = function (charttype, classes)
        {
            var result = '';
            result = classes.reduce(function (p, c) { return charttype + classes + ' '; });
            console.log(result);
            return result;
        }

        this._initialized = true;
    }

    //Call constructor
    this.constructor(data);
}

