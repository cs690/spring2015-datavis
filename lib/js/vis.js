function barchart() {
    var margin = {top:20, left:70, right:20, bottom:30},
        yScale = d3.scale.linear().clamp(true),
        yAxis = d3.svg.axis(),
        yLabel = "Label",
        feature = "length",
        tooltipLabel = "Length",
        width = 1000, // default width
        height = 300, // default height
        xValue = 0, // default x coordinate
        yValue = 0; // default y coordinate

    function chart(selection) {

        selection.each(function (data){
        	data.forEach(function (d, i) { 
        		data[i][feature] = +d[feature];
        		data[i]["index"] = i;
        	});

			//Add a checkbox
			var checkbox = d3.select("#seimei")
                .append("input")
                .attr("type", "checkbox")
                .attr("id", "checked");
			
            var svg = d3.select("#barchart"),
                maxVal = d3.max(data, function(d) {return d[feature];}),
                barWidth, labelX, labelY,
                barPadding = 0.5,
                labelPadding = 20,
                fontSize = 11,
                defaultBarColor = "teal",
                changedBarColor = "red",
                sortedData = data.slice().sort(function (a, b) {return b[feature] - a[feature];}),
                sortedIndeces = sortedData.slice().map(function(d,i){return d["index"];}),
                cboxX = width - (width / 5) - margin.left - margin.right,
                cboxY = margin.top / 1.5,
                sortStr = "Sort",
                tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-5, 0])
                    .html(function(d) {
                        return "<strong>" + tooltipLabel
                            + ": </strong> <span style='color:#4e240e'>" + d[feature] + "</span>";
                    })


            // Test for new functionality
            var categName = "category",
                contiName = "continuous"
                categValue = "",
                testCategory = ["1", "2", "1", "1"],
                categories = d3.set(testCategory).values().sort(function(a,b){return +a < +b;}),
                counts = categories.map(function(d,i){return 0;}),
                processedData = counts.slice();

            data.forEach(function(d,i){
                //Count frequencies
                var index = +d[categName] - 1;
                counts[index] += 1;
                processedData[index] = +d[feature];
            })

            processedData = processedData.map(function(d,i){return processedData[i] / counts[i];})



            svg.call(tip);

            yScale.domain([0, maxVal])
                .range([height - margin.bottom, margin.top]);

            margin.left += 5 * (Math.log(maxVal) / Math.log(10));
            barWidth = (width - margin.left - margin.right - labelPadding)
                        / data.length - barPadding;

            labelX = margin.left + labelPadding / 2;
            labelY = yScale(maxVal) + fontSize / 2 * yLabel.length;


            //Add a tooltip
            d3.select("#seimei")
                .append("p")
                .attr("class", "tooltip")
                .text("I'm tooltip!")
                .style("display", "none");
			
			checkbox.style({
				position:"absolute",
				top: (cboxY + 41) + "px",
				left: (cboxX + 15) + "px"
			});	
				
            //Add text for the checkbox
            svg.append("text")
                .attr("x", cboxX + (sortStr.length * fontSize) + "px")
                .attr("y", cboxY + "px")
                .style({"text-anchor": "end"})
                .text(sortStr);

            //Draw bars
            svg.selectAll("rect").data(data).enter().append("rect").
                attr("height", 0)
                .attr("y", height - margin.bottom)
                .attr("width", barWidth)
                .attr("x", function (d, i) {
                    return margin.left + labelPadding + i * (barWidth + barPadding);
                })
                .attr("fill", defaultBarColor)
                .attr("class", function(d, i) {
                		return "bar bar" + i;
                	})
                .on("mouseover", tip.show)
                .on("mouseenter", function(d, i){
                    commonOnEvent(i);
                })
                .on("mouseout", function(d, i){
                    tip.hide();
                    commonLeaveEvent(i);
                })
                .transition()
                .duration(800)
                .attr("height", function(d){ return height - margin.bottom - yScale(d[feature]);})
                .attr("y", function(d) {return yScale(d[feature]);});

            //Draw y-axis line
            svg.append("line")
                .attr("x1",margin.left).attr("y1",yScale(0) + 0.5)
                .attr("x2",width - margin.right).attr("y2",yScale(0) + 0.5)
                                .attr("stroke-width",1).attr("stroke", "black");

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




            //Set an event (sort bars in descending order) to the checkbox
            d3.select("input").on("change", change);

            function change() {

                clearTimeout(setTimeout(function() {
                    d3.select("input").property("checked", true).each(change);}, 2000));

                var checked = this.checked;

                svg.transition()
                    .duration(750)
                    .selectAll(".bar")
                    .delay(function(d, i) { return i * 10; })
                    .attr("x", function(d, i){

                    	var offset = checked? sortedIndeces.indexOf(i) : i;
                 
                    	return margin.left + labelPadding + offset * (barWidth + barPadding);
                    
                    });

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

    chart.feature = function(value) {
        if (!arguments.length) return feature;
        feature = value;
        return chart;
    }

    chart.tooltipLabel = function(value) {
        if (!arguments.length) return tooltipLabel;
        tooltipLabel = value;
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
		
		this.bindData = function(data, attrX, attrY, attrV)
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
				.attr("class", "tooltip")
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
			svg.selectAll(".scattor")
			  .data(this._data)
			.enter().append("circle")
			  .attr("class", function(d, i) { return "scattor scatter" + i;})
			  .attr("r", 2.5)
			  .attr("cx", this._axisX.map)
			  .attr("cy", this._axisY.map)
			  .style("fill", "teal")
			  .on("mousemove", function(d, i) {
				commonOnEvent(i);
				//d3.select(this).style("fill", "red");
				tooltip.transition()
				   .duration(200)
				   .style("opacity", 1);
				tooltip.html(that._id.value(d) + "<br/> (" + that._axisX.value(d) + ", " + that._axisY.value(d) + ")")
				   .style("left", that._axisX.map(d) + "px")
				   .style("top", that._axisY.map(d) + "px");
			  })
			  .on("mouseout", function(d, i) {
				//d3.select(this).style("fill", "teal");
				commonLeaveEvent(i);
				tooltip.transition()
				   .duration(500)
				   .style("opacity", 0);

				  
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
            var result = [];
            var resultObject = {};
            for (var i = 0; i < data.length; i++) {
                if (data[i][attr] in resultObject) {
                    resultObject[data[i][attr]] += 1;
                }
                else{
                    resultObject[data[i][attr]] = 1;
                }
            }
            for (var k in resultObject) result.push(k);
            return result;
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
            this._axisX.instance = d3.svg.axis().scale(this._axisX.scale).orient("bottom");

            this._axisY.name = attrY;
            this._axisY.value = function (d) { return d[attrY]; };
            this._axisY.categories = [''];
            this._axisY.categories.push.apply(this._axisY.categories, this.getCategories(data, attrY));
            this._axisY.scale = d3.scale.ordinal().domain(this._axisY.categories).rangePoints([this._height, 0]);
            this._axisY.map = function (d) { return that._axisY.scale(that._axisY.value(d)); };
			this._axisY.instance = d3.svg.axis().scale(this._axisY.scale).orient("left");

			this._data = data;

			var dg = new DataGenerator(data);

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

            // x-axis
            svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + this._height + ")")
			  .call(this._axisX.instance);

            // y-axis
            svg.append("g")
			  .attr("class", "y axis")
			  .call(this._axisY.instance);

            svg.selectAll(".rect")
			  .data(this._heatData.data)
			.enter().append("rect")
			  .attr("class", function (d, i) { return "rect heatmap" + d['attrX'] + d['attrY'] + d['value']; })
			  .attr("x", function (d) { return that._axisX.scale(d['attrX']) - that._axisX.scale.range()[1]; })
			  .attr("y", function (d) { return that._axisY.scale(d['attrY']); })
              .attr("width", this._axisX.scale.range()[1])
              .attr("height", this._axisY.scale.range()[this._axisY.categories.length - 2])
			  .style("fill", function (d)
			  {
			      if (d['value'] == 0) return 'white';
			      return that._id.color(d['value']);
			  });
        }

        this._initialized = true;
    }

    //Call construct
    this.construct(20, 20, 30, 40, 960, 500);
}

function commonOnEvent (i) {
	d3.select(".scatter" + i).style("fill", "red");
	d3.select(".bar" + i).style("fill", "red");
}

function commonLeaveEvent (i) {
	d3.select(".scatter" + i).style("fill", "teal");
	d3.select(".bar" + i).style("fill", "teal");
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
            var result = [];
            var resultObject = {};
            for (var i = 0; i < this._data.length; i++) {
                if (this._data[i][attr] in resultObject) {
                    resultObject[this._data[i][attr]] += 1;
                }
                else {
                    resultObject[this._data[i][attr]] = 1;
                }
            }
            for (var k in resultObject) result.push(k);
            this._categories[attr] = result.sort();
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
                heatCounts = [];
            for (var i = 0; i < xL; i++) {
                heatValues[i] = [];
                heatCounts[i] = [];
                for (var j = 0; j < yL; j++) {
                    heatValues[i][j] = 0;
                    heatCounts[i][j] = 0;
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
                    var row = { attrX: this._categories[attrX][i], attrY: this._categories[attrY][j], value: heatValues[i][j] };
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

        this._initialized = true;
    }

    //Call constructor
    this.constructor(data);
}
