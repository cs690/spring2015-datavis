function barchart()
{
    var margin = { top: 60, left: 25, right: 20, bottom: 30 },
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
        yValue = 0, // default y coordinate
        svg, maxVal, labelX, labelY,
        that = this;

    function chart(selection)
    {

        selection.each(function (data)
        {

            data.forEach(function (d, i)
            {
                data[i][numerical] = +d[numerical];
                data[i]["index"] = i;

            });


            //Add a checkbox
            var checkbox = d3.select("#" + canvasID)
                .append("input")
                .attr("type", "checkbox")
                .attr("id", "checked" + canvasID);

            var labelPadding = 20,
                fontSize = 11,
                defaultBarColor = "teal",
                cboxX = width - (width / 5) - margin.left - margin.right,
                cboxY = margin.top / 2,
                sortStr = "Sort",
                counts = categoryValues.map(function () { return 0; }),
                processedData = counts.slice(),
                tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-5, 0])
                    .html(function (d)
                    {
                        return "<strong>" + tooltipLabel
                            + ": </strong> <span style='color:#4e240e'>" + d.average + "</span>";
                    })

            data.forEach(function (d, i)
            {
                //Count frequencies (here, assume that
                // categorical values are integers such that 1 ... n)
                var index = +d[categorical] - 1;
                counts[index] += 1;
                processedData[index] += d[numerical];
            })


            processedData = processedData.map(function (d, i)
            {
                return {
                    categIndex: i + 1,
                    category: categoryValues[i],
                    average: Math.round(processedData[i] / counts[i])
                };
            });


            maxVal = d3.max(processedData, function (d, i) { return d.average; })


            xScale.domain(processedData.map(function (d, i) { return d.category; }))
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
                margin: 0,
                top: cboxY + "px",
                left: cboxX + "px"
            });

            //Add text for the checkbox
            d3.select("#" + canvasID).append("p")
                .style({
                    position: "absolute",
                    left: cboxX + 18 + "px",
                    top: cboxY + (-5) + "px",
                    "text-anchor": "end"
                })
                .text(sortStr);


            //Draw bars
            svg.selectAll("rect").data(processedData).enter().append("rect").
                attr("height", 0)
                .attr("y", height - margin.bottom)
                .attr("width", xScale.rangeBand())
                .attr("x", function (d, i)
                {
                    return xScale(d.category);
                })
                .attr("fill", defaultBarColor)
                .attr("class", function (d, i)
                {

                    return "bar " +
                           "bar" + d.categIndex + " " +
                           categorical + d.categIndex;
                })
                .on("mouseover", tip.show)
                .on("mouseenter", function (d)
                {

                    commonOnEvent([categorical + d.categIndex], false);
                })
                .on("mouseout", function (d)
                {
                    tip.hide();
                    commonLeaveEvent([categorical + d.categIndex], false);
                })
                .transition()
                .duration(800)
                .attr("height", function (d) { return height - margin.bottom - yScale(d.average); })
                .attr("y", function (d) { return yScale(d.average); });


            //Put a label for y-axis
            svg.append("text")
                .attr("x", labelX)
                .attr("y", labelY)
                .attr("text-anchor", "start")
                .text(yLabel)
                .attr("transform", "rotate(-90 " + labelX + "," + labelY + ")")
                .style({
                    "font-family": "sans-serif",
                    "font-size": fontSize + "px"
                });

            //Draw y-axis
            yAxis.scale(yScale).orient("left");
            svg.append("g")
                .attr("transform", "translate(" + margin.left + ", 0)")
                .attr("class", "axis")
                .call(yAxis);


            //Draw x-axis
            xAxis.scale(xScale).orient("bottom");
            svg.append("g")
                .attr("transform", "translate(0," + (height - margin.bottom) + ")")
                .attr("class", "x axis")
                .call(xAxis.scale(xScale.domain(processedData
                    .map(function (d, i) { return d.category; })).copy()));


            //Set an event (sort bars in descending order) to the checkbox
            d3.select("#checked" + canvasID).on("change", change);


            function change()
            {
                var checked = this.checked;

                processedData.sort(checked
                    ? function (a, b) { return b.average - a.average; }
                    : function (a, b) { return +b.categIndex < +a.categIndex; });

                controller.updateColumn(categorical,
                    processedData.map(function (d) { return d.category; }));

                d3.select("#checked" + canvasID).property("checked", checked);
            }


        })



    }

    chart.width = function (value)
    {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function (value)
    {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.x = function (value)
    {
        if (!arguments.length) return xValue;
        xValue = value;
        return chart;
    };

    chart.y = function (value)
    {
        if (!arguments.length) return yValue;
        yValue = value;
        return chart;
    }

    chart.yLabel = function (value)
    {
        if (!arguments.length) return yLabel;
        yLabel = value;
        return chart;
    }

    chart.numerical = function (value)
    {
        if (!arguments.length) return numerical;
        numerical = value;
        return chart;
    }

    chart.categorical = function (value)
    {
        if (!arguments.length) return categorical;
        categorical = value;
        return chart;
    }

    chart.tooltipLabel = function (value)
    {
        if (!arguments.length) return tooltipLabel;
        tooltipLabel = value;
        return chart;
    }

    chart.svgID = function (value)
    {
        if (!arguments.length) return svgID;
        svgID = value;
        return chart;
    }

    chart.canvasID = function (value)
    {
        if (!arguments.length) return canvasID;
        canvasID = value;
        return chart;
    }

    chart.labelFontSize = function (value)
    {
        if (!arguments.length) return labelFontSize;
        labelFontSize = value;
        return chart;
    }

    chart.categoryValues = function (values)
    {
        if (!arguments.length) return categoryValues;
        categoryValues = values;
        return chart;
    }

    chart.updateAxis = function (attrName, newOrder) {

        if (attrName == categorical){

            d3.select("#checked" + canvasID).property("checked", false);

            var transition = svg.transition().duration(750),
                delay = function (d, i) { return i * 50; };

            xScale.domain(newOrder);

            transition.selectAll(".bar")
                .delay(delay)
                .attr("x", function (d) { return xScale(d.category); });

            transition.select(".x.axis")
                .call(d3.svg.axis().scale(xScale).orient("bottom"))
                .selectAll("g")
                .delay(delay);

        }

        return chart;
    }



    return chart;
}

function ScatterPlot()
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
    this._categories = [];

    //Construction
    this.construct = function (top, right, bottom, left, screenWidth, screenHeight)
    {
        this.Margin(top, right, bottom, left);
        this.ScreenWidth(screenWidth);
        this.ScreenHeight(screenHeight);
    };

    //Methods
    if (typeof this._initialized == "undefined") {

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

        this.bindData = function (data, attrX, attrY, attrV, attrC1, attrC2)
        {
            var dg = new DataGenerator(data);

            this._id.name = attrV;
            this._id.value = function (d) { return "uid_" + d[attrV]; };

            this._axisX.data = dg.createNumericalAxisData(attrX, [5, this._width + 5]);
            this._axisX.instance = d3.svg.axis().scale(this._axisX.data.scale).orient("bottom");

            this._axisY.data = dg.createNumericalAxisData(attrY, [this._height - 5, -5]);
			this._axisY.instance = d3.svg.axis().scale(this._axisY.data.scale).orient("left");
            
            this._categories.push(attrC1);
            this._categories.push(attrC2);

            this._data = data;
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
			  .text(this._axisX.data.name);

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
			  .text(this._axisY.data.name);

            // draw dots
            svg.selectAll(".scatter")
			.data(this._data)
			.enter().append("circle")
			.attr("class", function (d) { return "scatter " + "s_" + that._categories[0] + d[that._categories[0]] + " s_" + that._categories[1] + d[that._categories[1]]; })
			.attr("r", 2.5)
			.attr("cx", this._axisX.data.mapFunc)
			.attr("cy", this._axisY.data.mapFunc)
			.style("fill", "teal")
			.on("mousemove", function (d, i)
			{
			    tooltip
                .style("opacity", 1)
                .html(that._id.value(d) + "<br/> (" + that._axisX.data.valueFunc(d) + ", " + that._axisY.data.valueFunc(d) + ")")
                .style("left", that._axisX.data.mapFunc(d) + "px")
                .style("top", (that._axisY.data.mapFunc(d) - 60) + "px");
			    commonOnEvent([that._categories[0] + d[that._categories[0]], that._categories[1] + d[that._categories[1]]], true);
			    d3.select(this).style("opacity", "1");
			})
			.on("mouseout", function (d, i)
			{
			    tooltip
                .style("opacity", 0);
			    commonLeaveEvent([that._categories[0] + d[that._categories[0]], that._categories[1] + d[that._categories[1]]], true);
			})
            .style("opacity", "0")
            .transition()
            .duration(800)
            .style("opacity", "1");
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
    if (typeof this._initialized == "undefined") {

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

        this.bindData = function (data, attrX, catX, attrY, catY, attrV)
        {
            this._data = data;

            var dg = new DataGenerator(data);

            this._axisX.data = dg.createCategoricalAxisData(attrX, [0, this._width], catX);
            this._axisX.instance = d3.svg.axis().scale(this._axisX.data.scale).orient("bottom");

            this._axisY.data = dg.createCategoricalAxisData(attrY, [this._height, 0], catY);
            this._axisY.instance = d3.svg.axis().scale(this._axisY.data.scale).orient("left");

            this._heatData = dg.createHeatData(attrX, attrY, attrV);

            this._id.name = attrV;
            this._id.value = function (d) { return "uid_" + d[attrV]; };
            this._id.color = d3.scale.linear().domain([this._heatData.maxValue, (this._heatData.minValue + this._heatData.maxValue) / 2, this._heatData.minValue]).range(['#d73027', '#ffffbf', '#4575b4']);

            return this;
        }

        this.draw = function ()
        {
            //var sortLabel = this._canvas.append("label");
            //sortLabel.append("input").attr("type", "checkbox");
            //sortLabel.append("p").html(" Sort X");
            //sortLabel.append("input").attr("type", "checkbox");
            //sortLabel.append("p").html(" Sort Y");
            //<label><input type="checkbox"> Sort values</label>

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

            //console.log(this._heatData.data);

            svg.selectAll(".rect")
            .data(this._heatData.data)
            .enter().append("rect")
            .attr("class", function (d) { return "rect " + d['classes']; })
            .attr("x", function (d)
            {
                if (that._axisX.data.categoryMapped) { return that._axisX.data.categoryMapFunc(d['attrX']); }
                else { return that._axisX.data.scale(d['attrX']); }
            })
            .attr("y", function (d)
            {
                if (that._axisY.data.categoryMapped) { return that._axisY.data.categoryMapFunc(d['attrY']); }
                else { return that._axisY.data.scale(d['attrY']); }
            })
            .attr("width", this._axisX.data.scale.rangeBand())
            .attr("height", this._axisY.data.scale.rangeBand())
            .style("fill", function (d)
            {
                if (d['value'] == 0) return 'white';
                return that._id.color(d['value']);
            })
            .on("mousemove", function (d, i)
            {
                commonOnEvent([that._axisX.data.name + d['attrX'], that._axisY.data.name + d['attrY']], false);
                tooltip
                .style("opacity", 1)
                .html("Average " + that._id.name + ": " + d['value'])
                .style("left", (d3.event.x - 460) + "px")
                .style("top", (d3.event.y - 240) + "px");
            })
            .on("mouseout", function (d, i)
            {
                commonLeaveEvent([that._axisX.data.name + d['attrX'], that._axisY.data.name + d['attrY']], false);
                tooltip.style("opacity", 0);
            })
            .style("opacity", "0")
            .transition()
            .duration(800)
            .style("opacity", "1");

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

        this.updateAxis = function (attrName, newOrder)
        {
            var axis = {};
            var axisName = "";
            switch (attrName) {
                case this._axisX.data.name:
                    axis = this._axisX;
                    axisName = "x";
                    break;
                case this._axisY.data.name:
                    axis = this._axisY;
                    axisName = "y";
                    break;
                default:
                    return;
            }

            axis.scale.domain(newOrder);
            this._canvas.select("." + axisName + ".axis").transition().duration(750).call(axis.instance);//
            d3.selectAll(".rect")
                .transition()
                .duration(750)
                .attr(axisName, function (d) {
                    axis.categories.length;
                    return axis.scale(axis.categories[+d['attr' + axisName.toUpperCase()] - 1]);
                })
                .delay(function (d, i) {
                    return Math.round(i / axis.categories.length) * 50;
                });
        }

        this._initialized = true;
    }

    //Call construct
    this.construct(20, 20, 30, 40, 960, 500);
}

function commonOnEvent(classes, isScattor)
{
    d3.selectAll(".bar").style("opacity", "0.1");
    d3.selectAll(".scatter").style("opacity", "0.1");
    classes.forEach(function (d, i)
    {
        d3.selectAll("." + d).style("opacity", "1").style("stroke-width", "1px").style("stroke", "black");
    });
    if (!isScattor) {
        d3.selectAll(".scatter").style("opacity", "0.1");//.style("visibility", "hidden");
        classes.forEach(function (d, i)
        {
            d3.selectAll(".s_" + d).style("opacity", "1");//.style("visibility", "visible");
        });
    }
}

function commonLeaveEvent(classes, isScattor)
{
    d3.selectAll(".bar").style("opacity", "1");
    d3.selectAll(".scatter").style("opacity", "1");
    classes.forEach(function (d, i)
    {
        d3.selectAll("." + d).style("stroke", "none");
    });
    if (!isScattor) {
        d3.selectAll(".scatter").style("opacity", "1");//.style("visibility", "visible");
    }
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

        this.createNumericalAxisData = function (attr, range)
        {
            var result = {}
            result.name = attr;
            result.valueFunc = function (d) { return d[attr]; };
            result.scale = d3.scale.linear().domain([0, d3.max(this._data, result.valueFunc)]).range(range);
            result.mapFunc = function (d) { return result.scale(result.valueFunc(d)); };
            return result;
        }

        this.createCategoricalAxisData = function (attr, range, categories)
        {
            this.generateCategories(attr);
            var result = {}
            result.name = attr;
            result.valueFunc = function (d) { return d[attr]; };
            if (categories) {
                result.categories = categories;
                result.categoryMapped = true;
                result.categoryMapFunc = function (d) { return result.scale(result.categories[+d - 1]); };
            }
            else {
                result.categories = this._categories[attr];
            }
            result.scale = d3.scale.ordinal().domain(result.categories).rangeRoundBands(range, 0.05, 0.05);
            result.mapFunc = function (d) { return result.scale(result.valueFunc(d)); };
            return result;
        }

        this.generateCategories = function (attr)
        {
            this._categories[attr] = d3.set(this._data.map(function (d) { return d[attr]; })).values();
        }

        this.createHeatData = function (attrX, attrY, attrV)
        {
            var result = {};

            if (!(attrX in this._categories)) this.generateCategories(attrX);
            if (!(attrY in this._categories)) this.generateCategories(attrY);
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

        //Statistic method
        DataGenerator.prototype.extendCategories = function (categories)
        {
            var cat = categories.slice();
            var code = 65;
            var result = [String.fromCharCode(code)];
            while (cat.length > 0) {
                result.push(cat.shift());
                result.push(String.fromCharCode(++code));
            }
            return result;
        }
    }

    //Call constructor
    this.constructor(data);
}