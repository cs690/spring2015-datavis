function ScatterPlot()
{
	//Attributes
	this._margin = {top: 20, right: 20, bottom: 30, left: 40};
	this._width = 900;
	this._height = 450;
	this._screenWidth = 960;
	this._screenHeight = 500;
	
	//Construction
	this.construct = function (top, right, bottom, left, screenWidth, screenHeight)
	{
		this.Margin(top, right, bottom, left);
		this.ScreenWidth(screenWidth);
		this.ScreenHeight(screenHeight);
		console.log(this._margin);
		console.log(this._width);
		console.log(this._height);
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		ScatterPlot.prototype._update = function()
		{
			this._width = this._screenWidth - this._margin.left - this._margin.right;
			this._height = this._screenHeight - this._margin.top - this._margin.bottom;
		}
		
		ScatterPlot.prototype.Margin = function(top, right, bottom, left)
		{
			if (!arguments.length) return self._margin;
			this._margin.top = top;
			this._margin.right = right;
			this._margin.bottom = bottom;
			this._margin.left = left;
			return this;
		}
		
		ScatterPlot.prototype.ScreenWidth = function(value)
		{
			if (!arguments.length) return self._screenWidth;
			this._screenWidth = value;
			this._update();
			return this;
		}
		
		ScatterPlot.prototype.ScreenHeight = function(value)
		{
			if (!arguments.length) return self._screenHeight;
			this._screenHeight = value;
			this._update();
			return this;
		}		
		
		ScatterPlot.prototype.drawOn = function(tag, path, xAttr, yAttr)
		{
			console.log('In');
			
			// setup x 
			var xValue = function(d) { return d[xAttr];}, // data -> value
				xScale = d3.scale.linear().range([0, this._width]), // value -> display
				xMap = function(d) { return xScale(xValue(d));}, // data -> display
				xAxis = d3.svg.axis().scale(xScale).orient("bottom");

			// setup y
			var yValue = function(d) { return d[yAttr];}, // data -> value
				yScale = d3.scale.linear().range([this._height, 0]), // value -> display
				yMap = function(d) { return yScale(yValue(d));}, // data -> display
				yAxis = d3.svg.axis().scale(yScale).orient("left");

			// setup fill color
			var cValue = function(d) { return d["length"];},
				color = d3.scale.category10();
			
			// add the graph canvas to the body of the webpage
			var svg = d3.select(tag).append("svg")
				.attr("width", this._width + this._margin.left + this._margin.right)
				.attr("height", this._height + this._margin.top + this._margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");
				
			var h = this._height;
			var w = this._width;
			
			
			
			d3.csv(path, function(error, data) {
			
			  // don't want dots overlapping axis, so add in buffer to data domain
			  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
			  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

			  // x-axis
			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + h + ")")
				  .call(xAxis)
				.append("text")
				  .attr("class", "label")
				  .attr("x", w)
				  .attr("y", -6)
				  .style("text-anchor", "end");
				  //.text(xAttr);

			  // y-axis
			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				.append("text")
				  .attr("class", "label")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end");
				  //.text(yAttr);

			  // draw dots
			  svg.selectAll(".dot")
				  .data(data)
				.enter().append("circle")
				  .attr("class", "dot")
				  .attr("r", 3.5)
				  .attr("cx", xMap)
				  .attr("cy", yMap)
				  .style("fill", function(d) { return color(cValue(d));});
			});
		}
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(20, 20, 30, 40, 960, 500);
}