function barchart()
{
    var margin = { top: 30, right: 20, bottom: 30, left: 40 },
        yScale = d3.scale.linear().clamp(true),
        xScale = d3.scale.ordinal(),
        yAxis = d3.svg.axis(),
        xAxis = d3.svg.axis(),
        yLabel = "",
        offAxis = false,
        svgID = "barchart",
        canvasID = "seimei",
        numerical = "",
        categorical = "",
        labelFontSize = 11,
        tooltipXLabel = "Length",
        tooltipYLabel = "Category",
        categoryValues = [],
        categoryLabels = undefined,
        width = 1000, // default width
        height = 300, // default height
        xValue = 0, // default x coordinate
        yValue = 0, // default y coordinate
        maxVal = -1,
        svg, labelX, labelY;

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

            var labelPadding = offAxis ? 0 : 20,
                fontSize = 11,
                defaultBarColor = "gray",
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
                        var categVal = categoryLabels === undefined ? d.category
                            : categoryLabels[categoryValues.indexOf(d.category)];
                        return "<strong>" + tooltipYLabel + ": </strong> " +
                            "<span style='color:#4e240e'>" + d.average + "</span><br />" +
                            "<strong>" + tooltipXLabel + ":  </strong>" +
                            "<span style='color:#4e240e'>" + categVal + "</span>";
                    })

            data.forEach(function (d, i)
            {
                //Count frequencies (here, assume that
                // categorical values are integers such that 1 ... n)
                var index = +d[categorical] - 1;
                counts[index] += 1;
                processedData[index] += +d[numerical];
            })


            processedData = processedData.map(function (d, i)
            {
                return {
                    index: i + 1,
                    category: categoryValues[i],
                    average: (d / counts[i]).toFixed(1)
                };
            });


            if (maxVal == -1)
                maxVal = d3.max(processedData, function (d, i) { return d.average; })


            xScale.domain(processedData.map(function (d, i) { return d.category; }))
                .rangeRoundBands([margin.left + labelPadding, width - margin.right], 0.2);


            yScale.domain([0, maxVal])
                .range([height - margin.bottom, margin.top]);

            if (!offAxis)
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
                    top: cboxY + (-18) + "px",
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
                .attr("class", function (d)
                {
                    //e.g., bar, bar1 views1
                    return "bar " +
                            "bar" + d.index + " b_" +
                            categorical + '_' + d.index;
                })
                .on("mouseover", tip.show)
                .on("mouseenter", function (d)
                {
                    commonOnEvent([categorical + '_' + d.index], false, true, false);
                })
                .on("mouseout", function (d)
                {
                    tip.hide();
                    commonLeaveEvent([categorical + '_' + d.index], false, true, false);
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


            if (!offAxis) {
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
                        .map(function (d, i)
                        {
                            return d.category;
                        })).copy()));
            }


            //Set an event (sort bars in descending order) to the checkbox
            d3.select("#checked" + canvasID).on("change", change);


            function change()
            {
                var checked = this.checked;

                processedData.sort(checked
                    ? function (a, b) { return b.average - a.average; }
                    : function (a, b) { return +b.index < +a.index; });

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

    chart.tooltipXLabel = function (value)
    {
        if (!arguments.length) return tooltipXLabel;
        tooltipXLabel = value;
        return chart;
    }

    chart.offAxis = function (value)
    {
        if (!arguments.length) return offAxis;
        offAxis = value;
        return chart;
    }

    chart.tooltipYLabel = function (value)
    {
        if (!arguments.length) return tooltipYLabel;
        tooltipYLabel = value;
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

    chart.categoryLabels = function (values)
    {
        if (!arguments.length) return categoryLabels;
        categoryLabels = values;
        return chart;
    }

    chart.maxValue = function (value)
    {
        if (!arguments.length) return maxVal;
        maxVal = value;
        return chart;
    }

    chart.margin = function (value)
    {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    }

    chart.updateAxis = function (attrName, newOrder)
    {

        if (attrName == categorical) {

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

function ScatterPlot(top, right, bottom, left, screenWidth, screenHeight)
{
    var that = this;

    //Attributes
    this._margin = { top: 20, right: 20, bottom: 30, left: 40 };
    this._width = 900;
    this._height = 450;
    this._screenWidth = 960;
    this._screenHeight = 500;

    this._canvas = {};
    this._axisX = { visible: true, showName: true };
    this._axisY = { visible: true, showName: true };
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
            this._update();
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

        this.DisplayAxis = function (valueX, valueY)
        {
            this._axisX.visible = valueX;
            this._axisY.visible = valueY;
            return this;
        }

        this.DisplayAxisName = function (valueX, valueY)
        {
            this._axisX.showName = valueX;
            this._axisY.showName = valueY;
            return this;
        }

        this.bindData = function (data, attrX, attrY, attrV, attrCats)
        {
            var dg = new DataHandler(data);

            this._id.name = attrV;
            this._id.value = function (d) { return d[attrV]; };

            this._axisX.data = dg.createNumericalAxisData(attrX, [0, this._width]);
            this._axisX.instance = d3.svg.axis().scale(this._axisX.data.scale).orient("bottom").ticks(6);

            this._axisY.data = dg.createNumericalAxisData(attrY, [this._height, 0]);
            this._axisY.instance = d3.svg.axis().scale(this._axisY.data.scale).orient("left").ticks(6);

            this._categories = attrCats;

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
            var tooltip = d3.select(".d3-tip")
                .style("position", "absolute")
                .style("display", "none");

            // draw dots
            svg.selectAll(".scatter")
            .data(this._data)
            .enter().append("circle")
            .attr("class", function (d)
            {
                var result = "scatter";
                for (var i = 0; i < that._categories.length; i++) {
                    result += " s_" + that._categories[i] + '_' + d[that._categories[i]];
                }
                return result;
            })
            .attr("r", 2.5)
            .attr("cx", this._axisX.data.mapFunc)
            .attr("cy", this._axisY.data.mapFunc)
            .style("fill", "gray")
            .on("mouseover", function (d, i)
            {
                commonOnEvent(that._categories.map(function (v) { return v + '_' + d[v]; }), true, false, false);
                d3.select(this).style("fill", "red").style("opacity", "1");

                var bbox = this.getBoundingClientRect();
                var coord = d3.mouse(d3.select("body").node());
                var x = coord[0] + 20;
                var y = coord[1] + 5;

                if (x - window.pageXOffset + bbox.width > window.innerWidth) {
                    x = coord[0] - bbox.width + 5;
                }

                if (y - window.pageYOffset + bbox.height > window.innerHeight) {
                    y = coord[1] - bbox.height + 10;
                }

                tooltip
                .style("display", "block")
                .html("Video ID: <a href=\"https://www.youtube.com/watch?v=" + d[that._id.name] + "\">" + d[that._id.name] + "</a><br/>" + initialToUppercase(that._axisX.data.name) + ": " + that._axisX.data.valueFunc(d) + "<br/>" + initialToUppercase(that._axisY.data.name) + ": " + that._axisY.data.valueFunc(d))
                .style("left", x + "px")
                .style("top", y + "px");
            })
            .on("mouseout", function (d, i)
            {
                d3.select(this).style("fill", "gray");

                tooltip.style("display", "none");

                commonLeaveEvent(that._categories.map(function (v) { return v + d[v]; }), true, false, false);
            })
            .on("click", function (d, i)
            {
                var bbox = this.getBoundingClientRect();
                var coord = d3.mouse(d3.select("body").node());
                var x = coord[0] + 20;
                var y = coord[1] + 5;

                if (x - window.pageXOffset + bbox.width > window.innerWidth) {
                    x = coord[0] - bbox.width + 5;
                }

                if (y - window.pageYOffset + bbox.height > window.innerHeight) {
                    y = coord[1] - bbox.height + 10;
                }

                d3.select("body").append("div").attr('id', 'tipcopy').attr('class', 'd3-tip').style("position", 'absolute').style("display", "block")
                .html("Video ID: <a href=\"https://www.youtube.com/watch?v=" + d[that._id.name] + "\">" + d[that._id.name] + "</a><br/>" + initialToUppercase(that._axisX.data.name) + ": " + that._axisX.data.valueFunc(d) + "<br/>" + initialToUppercase(that._axisY.data.name) + ": " + that._axisY.data.valueFunc(d))
                .style("left", x + "px")
                .style("top", y + "px")
                .on("click", function (d, i)
                {
                    d3.selectAll("#tipcopy").remove();
                });
            })
            .style("opacity", "0")
            .transition()
            .duration(800)
            .style("opacity", "1");

            // x-axis
            if (this._axisX.visible) {
                var axisX = svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + this._height + ")")
                    .call(this._axisX.instance);
                if (this._axisX.showName) {
                    axisX.append("text")
                    .attr("class", "label")
                    .attr("x", this._width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text(this._axisX.data.name);
                }
            }

            // y-axis
            if (this._axisY.visible) {
                var axisY = svg.append("g")
                    .attr("class", "y axis")
                    .call(this._axisY.instance);
                if (this._axisY.showName) {
                    axisY.append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(this._axisY.data.name);
                }
            }
        }

        this.updateAxis = function (attrName, maxValue)
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
            axis.data.scale.domain([0, maxValue]);
            return this;
        }

        this._initialized = true;
    }

    //Call construct
    this.construct(top, right, bottom, left, screenWidth, screenHeight);
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
    this._axisX = { visible: true };
    this._axisY = { visible: true };
    this._selectionX = {};
    this._selectionY = {};
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
            this._update();
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

            var dg = new DataHandler(data);

            this._axisX.data = dg.createCategoricalAxisData(attrX, [0, this._width], catX);
            this._axisX.instance = d3.svg.axis().scale(this._axisX.data.scale).orient("bottom");//.tickFormat(function (d) { return ''; });

            this._axisY.data = dg.createCategoricalAxisData(attrY, [this._height, 0], catY);
            this._axisY.instance = d3.svg.axis().scale(this._axisY.data.scale).orient("left");//.tickFormat(function (d) { return ''; });

            this._heatData = dg.createHeatData(attrX, attrY, attrV);

            this._id.name = attrV;
            this._id.value = function (d) { return "uid_" + d[attrV]; };
            //[this._heatData.maxValue, this._heatData.minValue]
            var colorDomain = DataHandler.prototype.getColorDomain();
            var colorValues = DataHandler.prototype.getColorValues();
            this._id.color = d3.scale.threshold().domain(colorDomain).range(colorValues);
            /*
            <50         #c7e9b4
            50-150      #7fcdbb
            150-250     #41b6c4
            250-400     #1d91c0
            400-700     #225ea8
            >700        #0c2c84
            */

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
            var tooltip = d3.select(".d3-tip")
            .style("position", "absolute")
            .style("display", "none");

            this._selectionX = svg.append("rect").attr("class", "selection x_" + this._axisX.data.name).style("stroke", "red").style("opacity", 0);
            this._selectionY = svg.append("rect").attr("class", "selection y_" + this._axisY.data.name).style("stroke", "red").style("opacity", 0);

            //console.log(this._heatData.data);

            svg.selectAll(".rect")
            .data(this._heatData.data)
            .enter().append("rect")
            .attr("class", function (d) { return "heatmap " + d['classes']; })
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
            .attr("width", function (d)
            {
                if (d['value'] == 0) return 0;
                else return that._axisX.data.scale.rangeBand() * 1.1;
            })
            .attr("height", function (d)
            {
                if (d['value'] == 0) return 0;
                else return that._axisY.data.scale.rangeBand() * 1.1;
            })
            .style("fill", function (d)
            {
                if (d['value'] == 0) return 'white';
                return that._id.color(d['value']);
            })
            .on("mouseover", function (d)
            {
                commonOnEvent([that._axisX.data.name + '_' + d['attrX'], that._axisY.data.name + '_' + d['attrY']], false, false, true, that);

                that.drawSelection(that._axisX.data.name + '_' + d['attrX']);
                that.drawSelection(that._axisY.data.name + '_' + d['attrY']);

                var bbox = this.getBoundingClientRect();
                var coord = d3.mouse(d3.select("body").node());
                var x = coord[0] + 20;
                var y = coord[1] + 5;

                if (x - window.pageXOffset + bbox.width > window.innerWidth) {
                    x = coord[0] - bbox.width + 5;
                }

                if (y - window.pageYOffset + bbox.height > window.innerHeight) {
                    y = coord[1] - bbox.height + 10;
                }

                var labelX = initialToUppercase(that._axisX.data.name);
                var labelXValue = that._axisX.data.categoryValueFunc(d['attrX']);
                if (labelX == 'Rate') {
                    labelX = 'Stars';
                    labelXValue = DataHandler.prototype.mapStars(labelXValue);
                }
                var labelY = initialToUppercase(that._axisY.data.name);
                var labelYValue = that._axisY.data.categoryValueFunc(d['attrY']);
                if (labelY == 'Rate') {
                    labelY = 'Stars';
                    labelYValue = DataHandler.prototype.mapStars(labelYValue);
                }

                tooltip
                .style("display", "block")
                .html(labelX + ": " + labelXValue + "<br>" + labelY + ": " + labelYValue + "<br>Video Count: " + d['count'] + "<br>Average " + initialToUppercase(that._id.name) + ": " + d['value'])
                .style("left", x + "px")
                .style("top", y + "px");
            })
            .on("mouseout", function (d)
            {
                commonLeaveEvent([that._axisX.data.name + d['attrX'], that._axisY.data.name + d['attrY']], false, false, true);
                that.hideSelection();
                tooltip.style("display", "none");
            })
            .style("opacity", "0")
            .transition()
            .duration(800)
            .style("opacity", "1");

            // x-axis
            if (this._axisX.visible) {
                var axisX = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this._height + ")")
                .call(this._axisX.instance);
            }

            // y-axis
            if (this._axisY.visible) {
                var axisY = svg.append("g")
                .attr("class", "y axis")
                .call(this._axisY.instance);
            }
        }

        this.updateAxis = function (attrName, newOrder)
        {
            //console.log(attrName);
            //console.log(this._axisX.data.name);
            //console.log(this._axisY.data.name);
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
            //console.log("!!");
            axis.data.scale.domain(newOrder);
            if (axis.visible) this._canvas.select("." + axisName + ".axis").transition().duration(750).call(axis.instance);//
            this._canvas.selectAll(".heatmap")
                .transition()
                .duration(750)
                .attr(axisName, function (d)
                {
                    return axis.data.scale(axis.data.categories[+d['attr' + axisName.toUpperCase()] - 1]);
                })
                .delay(function (d, i)
                {
                    return Math.round(i / axis.data.categories.length) * 50;
                });
        }

        this.DisplayAxis = function (valueX, valueY)
        {
            this._axisX.visible = valueX;
            this._axisY.visible = valueY;
            return this;
        }

        this.drawSelection = function (name)
        {
            var cinfo = name.split('_');
            var cname = cinfo[0];
            var cvalue = cinfo[1];
            if (cname === this._axisX.data.name) {
                var x = this._axisX.data.categoryMapFunc(cvalue);
                var w = this._axisX.data.scale.rangeBand() * 1.1;
                this._selectionX.attr("x", +x - 1).attr("y", 0).attr("width", +w + 2).attr("height", 182).style("opacity", 1);
            }
            else if (cname === this._axisY.data.name) {
                var y = this._axisY.data.categoryMapFunc(cvalue);
                var h = this._axisY.data.scale.rangeBand() * 1.1;
                this._selectionY.attr("x", 0).attr("y", +y - 1).attr("width", 182).attr("height", +h + 2).style("opacity", 1);
            }
        }

        this.hideSelection = function ()
        {
            that._selectionX.style("opacity", 0);
            that._selectionY.style("opacity", 0);
        }

        this._initialized = true;
    }

    //Call construct
    this.construct(20, 20, 30, 40, 960, 500);
}

function initialToUppercase(name)
{
    return name[0].toUpperCase() + name.substring(1);
}

function buildClassString(classes, prefix)
{
    var cstr = '';
    for (var i = 0, l = classes.length; i < l; i++) {
        cstr += '.' + prefix + classes[i];
    }
    return cstr;
}

function getOriginalClasses(classes)
{
    var result = [];
    for (var i = 0, l = classes.length; i < l; i++) {
        result.push(classes[i].split('_')[0]);
    }
    return result;
}

function commonOnEvent(classes, isScatter, isBar, isHeatmap)
{
    //var o_classes = getOriginalClasses(classes);
    var b_cstr = buildClassString(classes, 'b_');
    var s_cstr = buildClassString(classes, 's_');
    var h_cstr = buildClassString(classes, 'h_');
    var l_cstr = buildClassString(classes, 'l_');
    if (isHeatmap) {
        d3.selectAll(".scatter").style("opacity", "0.05");
        d3.selectAll(s_cstr).style("fill", "red").style("opacity", "1");
        d3.selectAll(".bar").style("opacity", "0.1");
        classes.forEach(function (d)
        {
            d3.selectAll(".b_" + d).style("fill", "red").style("opacity", "1");
            d3.selectAll('.l_' + d).style("stroke-width", "0.5px").style("fill", "red").style("stroke", "red");
        });
    }
    else if (isBar) {
        d3.selectAll(".scatter").style("opacity", "0.05");
        d3.selectAll(s_cstr).style("fill", "red").style("opacity", "1");
        d3.selectAll(".bar").style("opacity", "0.1");
        d3.selectAll(b_cstr).style("fill", "red").style("opacity", "1");
        d3.selectAll('.l_' + classes[0]).style("stroke-width", "0.5px").style("fill", "red").style("stroke", "red");
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            heatmaps[i].drawSelection(classes[0]);
        }
    }
    else if (isScatter) {
        d3.selectAll(".bar").style("opacity", "0.1");
        classes.forEach(function (d)
        {
            d3.selectAll(".b_" + d).style("fill", "red").style("opacity", "1");
            d3.selectAll('.l_' + d).style("stroke-width", "0.5px").style("fill", "red").style("stroke", "red");
        });
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            for (var j = 0, k = classes.length; j < k; j++) {
                heatmaps[i].drawSelection(classes[j]);
            }
        }
    }
    else
    {
        d3.selectAll(".scatter").style("opacity", "0.05");
        d3.selectAll(s_cstr).style("fill", "red").style("opacity", "1");
        d3.selectAll(".bar").style("opacity", "0.1");
        d3.selectAll(b_cstr).style("fill", "red").style("opacity", "1");
        d3.selectAll('.l_' + classes[0]).style("stroke-width", "0.5px").style("fill", "red").style("stroke", "red");
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            heatmaps[i].drawSelection(classes[0]);
        }
    }
}

function commonLeaveEvent(classes, isScatter, isBar, isHeatmap)
{
    if (isHeatmap) {
        d3.selectAll(".bar").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".scatter").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".legend").style("stroke", "none").style("fill", "black");
    }
    else if (isBar) {
        d3.selectAll(".bar").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".scatter").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".legend").style("stroke", "none").style("fill", "black");
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            heatmaps[i].hideSelection();
        }
    }
    else if (isScatter) {
        d3.selectAll(".bar").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".legend").style("stroke", "none").style("fill", "black");
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            heatmaps[i].hideSelection();
        }
    }
    else
    {
        d3.selectAll(".bar").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".scatter").style("opacity", "1").style("fill", "gray");
        d3.selectAll(".legend").style("stroke", "none").style("fill", "black");
        for (var i = 0, l = heatmaps.length; i < l; i++) {
            heatmaps[i].hideSelection();
        }
    }
}

function DataHandler(data)
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
            result.valueFunc = function (d) { return d[result.name]; };
            result.scale = d3.scale.linear().domain([0, Math.max.apply(null, this._data.map(result.valueFunc))]).range(range);
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
                result.categoryValueFunc = function (d) { return result.categories[+d - 1]; };
                result.categoryMapFunc = function (d) { return result.scale(result.categories[+d - 1]); };
            }
            else {
                result.categories = this._categories[attr];
            }
            result.scale = d3.scale.ordinal().domain(result.categories).rangeRoundBands(range, 0.2);
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
                        heatValues[i][j] = (heatValues[i][j] / heatCounts[i][j]).toFixed(1);
                    }
                }
            }

            var heatData = [];
            for (var i = 0; i < xL; i++) {
                for (var j = 0; j < yL; j++) {
                    var row = { attrX: this._categories[attrX][i], attrY: this._categories[attrY][j], count: heatCounts[i][j], value: heatValues[i][j], classes: 'h_' + attrX + '_' + this._categories[attrX][i] + ' h_' + attrY + '_' + this._categories[attrY][j] };
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

        //Statistic method
        DataHandler.prototype.extendCategories = function (categories)
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

        DataHandler.prototype.getColorDomain = function ()
        {
            return [50, 150, 250, 400, 700, 1847].slice();
        }

        DataHandler.prototype.getColorValues = function ()
        {
            return ['#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'].slice();
        }

        DataHandler.prototype.mapStars = function (value)
        {
            result = ''
            for (var i = 0; i < +value[0]; i++) {
                result += value.slice(1);
            }
            return result;
        }

        //Find the largest numerical value from combinations of
        // one category attribute and different numerical attributes
        this.findMaxValue = function (numericals, categoryName)
        {
            var data = this._data,
                maxList = [];

            numericals.forEach(function (numerical)
            {

                if (categoryName === undefined) {
                    maxList.push(d3.max(data.map(function (d) { return +d[numerical]; })));

                } else {

                    var categories = d3.set(data.map(function (d) { return d[categoryName]; })).values(),
                        counts = categories.map(function () { return 0; }),
                        values = counts.slice();

                    data.forEach(function (d)
                    {

                        var index = categoryName == "category" ?
                            categories.indexOf(d[categoryName]) : +d[categoryName] - 1;
                        counts[index] += 1;
                        values[index] += +d[numerical];
                    });

                    values = values.map(function (d, i)
                    {
                        return d / counts[i];
                    });

                    maxList.push(d3.max(values));
                }
            })

            return d3.max(maxList);
        }
    }

    //Call constructor
    this.constructor(data);
}

function CategoryLegends()
{

    var height = 200,
        width = 200,
        size = 0,
        isColor = true,
        margin = { top: 20, left: 20, bottom: 20, text: 10 },
        canvasID = undefined,
        colorMap = undefined; // { colorValue : Text }, e.g. { #FFFFFF : January }

    function draw()
    {

        var svg = d3.select(canvasID).append("svg").attr("height", height).attr("width", width),
            vScale = d3.scale.ordinal().domain(colorMap.map(function (d) { return d.key; }))
                .rangeRoundBands([margin.top, height - margin.bottom], 0.2),
            rectSize = size <= 0 ? vScale.rangeBand() : size

        if (isColor)
            svg.selectAll("rect")
                .data(colorMap).enter()
                .append("rect")
                .attr("class", function (d, i) { return "legend l_category_" + (i + 1); })
                .attr("height", rectSize)
                .attr("width", rectSize)
                .attr("x", margin.left)
                .attr("y", function (d) { return vScale(d.key) - rectSize + (rectSize / 5); })
                .attr("fill", function (d) { return d.key; })
                .style({
                    "stroke": "black",
                    "stroke-width": 0.8
                });

        svg.selectAll("text")
            .data(colorMap).enter()
            .append("text")
            .attr("class", function (d, i) { return "legend l_category_" + (i + 1); })
            .attr("x", function () { return margin.left + ((isColor) ? rectSize + margin.text : 0); })
            .attr("y", function (d) { return vScale(d.key); })
            .text(function (d) { return d.value; })
            .style("cursor", "default")
            .on("mouseover", function (d, i)
            {
                commonOnEvent(["category_" + (i + 1)], false, false, false);
            })
            .on("mouseout", function (d, i)
            {
                commonLeaveEvent(["category_" + (i + 1)], false, false, false);
            });

    }

    draw.canvasID = function (value) { canvasID = value; return draw; }
    draw.colorMap = function (value) { colorMap = d3.entries(value); return draw; }
    draw.isColor = function (value) { isColor = value; return draw; }
    draw.margin = function (value) { margin = value; return draw; }
    draw.size = function (value) { size = value; return draw; }
    draw.height = function (value) { height = value; return draw; }
    draw.width = function (value) { width = value; return draw; }

    return draw;
}

function Axis()
{
    var maxValue = 0,
        width = 200,
        height = 200,
        ticks = -1,
        margin = { top: 20, left: 20, right: 20, bottom: 20 },
        canvasID = "",
        categoryName = "",
        isCategorical = false,
        isHorizontal = false,
        isColor = false,
        isRotateText = false,
        degree = -90,
        categoryValues = {},
        colorMap = {},
        svg, scale, orient, range, domain, axis;

    function draw()
    {

        svg = d3.select(canvasID).append("svg").attr("height", height).attr("width", width);
        scale = isCategorical ? d3.scale.ordinal() : d3.scale.linear().clamp(true);
        orient = isHorizontal ? "bottom" : "left";
        range = isHorizontal ? [margin.left, width - margin.right] : [height - margin.bottom, margin.top];
        axis = d3.svg.axis();

        if (isCategorical) {
            domain = categoryValues;
            scale.domain(domain).rangeRoundBands(range, 0.2);
        } else {
            domain = [0, maxValue];
            scale.domain(domain).range(range);
        }


        axis.scale(scale).orient(orient);

        if (!isCategorical && ticks != -1)
            axis.ticks(ticks);

        svg.append("g")
            .attr("transform", "translate(" + (isHorizontal ? 0 : width - margin.right) +
            "," + (isHorizontal ? margin.top : 0) + ")")
            .attr("class", "axis")
            .call(axis);

        if (isRotateText && isHorizontal) {
            svg.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.4em")
                .attr("transform", function (d)
                {
                    return "rotate(" + degree + ")";
                });
        }

        // Use colors to show category values instead of actual values
        if (isColor) {
            var size = 10;

            svg.selectAll("text").attr("fill", "white");
            svg.selectAll("rect").data(categoryValues).enter().append("rect")
                .attr("x", isHorizontal ? function (d) { return scale(d) + 3; } : width - margin.right - size * 1.5)
                .attr("y", isHorizontal ? margin.top + size / 1.5 : function (d) { { return scale(d) + 3; } })
                .attr("height", size)
                .attr("width", size)
                .attr("class", "colors")
                .attr("fill", function (d, i) { return colorMap[i].key; })
                .style({
                    "stroke": "black",
                    "stroke-width": 0.8
                });

        }

    }

    draw.maxValue = function (value) { maxValue = value; return draw; }
    draw.canvasID = function (value) { canvasID = value; return draw; }
    draw.margin = function (value) { margin = value; return draw; }
    draw.height = function (value) { height = value; return draw; }
    draw.width = function (value) { width = value; return draw; }
    draw.degree = function (value) { degree = value; return draw; }
    draw.ticks = function (value) { ticks = value; return draw; }
    //draw.fontsize = function (value) { fontsize = value; return draw; }
    draw.categoryName = function (value) { categoryName = value; return draw; }
    draw.isCategorical = function (value) { isCategorical = value; return draw; }
    draw.isHorizontal = function (value) { isHorizontal = value; return draw; }
    draw.isColor = function (value) { isColor = value; return draw; }
    draw.isRotateText = function (value) { isRotateText = value; return draw; }
    draw.categoryValues = function (value) { categoryValues = value; return draw; }
    draw.colorMap = function (value) { colorMap = d3.entries(value); return draw; }
    draw.updateAxis = function (attrName, newOrder)
    {

        if (isCategorical && attrName != categoryName)
            return;

        var transition = svg.transition().duration(750),
            delay = function (d, i)
            {
                return i * 50;
            };

        scale.domain(newOrder);

        transition.selectAll("rect")
            .delay(delay)
            .attr(isHorizontal ? "x" : "y", function (d) { return scale(d) + 3; });

        transition.select(".axis")
            .call(d3.svg.axis().scale(scale).orient(isHorizontal ? "bottom" : "left"))
            .selectAll("g")
            .delay(delay);


    }

    return draw;
}

function HeatmapLegend()
{

    var width = 200,
        height = 200,
        max = 0,
        rectWidth = width / 5,
        rectHeight = height - (height / 10) * 2,
        x = 0,
        y = (height - rectHeight) / 2,
        canvasID = "",
        domain, values, colors;

    function draw()
    {
        var svg = d3.select((canvasID.charAt(0) === "#") ? canvasID : "#" + canvasID)
                .append("svg").attr("height", height).attr("width", width),
            fontsize = 11,
            gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "100%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

        if (domain[0] < domain[domain.length - 1])
            domain.reverse();

        if (values[0] < values[values.length - 1]) {
            values = values.reverse();
            colors = colors.reverse();
        }

        var scale = d3.scale.linear().domain(domain).range([0, 100]);
        values.forEach(function (d, i)
        {
            console.log(colors[i]);
            gradient.append("stop").attr("offset", scale(values[i]) + "%").attr("stop-color", colors[i]);
        });

        svg.append("rect").attr("x", x).attr("y", y)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", "url(#gradient)");

        //Draw max value
        svg.append("text")
            .attr("x", x + rectWidth + (rectWidth / 10))
            .attr("y", y + fontsize / 2)
            .text((max == 0) ? "Max" : max + " (Max)");

        svg.append("text")
            .attr("x", x + rectWidth + (rectWidth / 10))
            .attr("y", y + rectHeight + fontsize / 2 - 2)
            .text("Min");

    }

    draw.x = function (value) { x = value; return draw; }
    draw.y = function (value) { y = value; return draw; }
    draw.max = function (value) { max = value; return draw; }
    draw.canvasID = function (value) { canvasID = value; return draw; }
    draw.height = function (value) { height = value; return draw; }
    draw.width = function (value) { width = value; return draw; }
    draw.rectWidth = function (value) { rectWidth = value; return draw; }
    draw.rectHeight = function (value) { rectHeight = value; return draw; }
    draw.domain = function (value) { domain = value; return draw; }
    draw.values = function (value) { values = value; return draw; }
    draw.colors = function (value) { colors = value; return draw; }

    return draw;
}

function notify(categoryType)
{

    var message = "",
        timeout = 5000;

    switch (categoryType.toLowerCase()) {
        case "category":
            message = "'Category': Video categories";
            break;
        case "views":
            message = "'Views': Views of videos";
            break;
        case "stars":
            message = "'Stars': User ratings of videos (1-5 scale)";
            break;
        case "ratings":
            message = "'Ratings': Number of people's ratings (i.e. How many times people have rated)";
            timeout = 5500;
            break;
        case "comments":
            message = "'Comments': Number of people's comments";
            timeout = 5500;
            break;
        case "length":
            message = "'Length': Video length (Seconds)";
            break;
        case "gplom":
            message = "'GPLOM': Short for Generalized PLot Matrix for multidimensional multivariate data";
            timeout = 6000;
            break;
    }

    UIkit.notify({
        message: message,
        status: 'info',
        timeout: timeout,
        pos: 'top-center'
    });
}