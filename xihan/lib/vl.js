var SESSION = 0;

function print(info)
{
	console.log(info);
}

function idGenerator()
{
	return hash(((new Date()).getMilliseconds()*(++SESSION)).toString())
}

function settings()
{
	translate(0.5, 0.5);
}

//Generate hash from string
function hash(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//Local coordinate always starts from [0, 0]
function local2GlobalPoint(globalStartPoint, rotation, localPoint)
{
	result = [];
	result[0] = globalStartPoint[0] + localPoint[0] * Math.cos(rotation) - localPoint[1] * Math.sin(rotation);
    result[1] = globalStartPoint[1] + localPoint[0] * Math.sin(rotation) + localPoint[1] * Math.cos(rotation);
	return result;
}

//Local coordinate always starts from [0, 0]
function global2LocalPoint(localStartPoint, rotation, globalPoint)
{
	result = [];
	result[0] = (globalPoint[0] - localStartPoint[0]) * Math.cos(rotation) - (globalPoint[1] - localStartPoint[1]) * Math.sin(rotation);
	result[1] = (globalPoint[0] - localStartPoint[0]) * Math.sin(rotation) + (globalPoint[1] - localStartPoint[1]) * Math.cos(rotation);
	return result;
}

//Get a list of values from valueStart to valueStop
function valueInterpolate(valueStart, valueStop, count)
{
	var result = [];
	for(var i = 0; i < count + 1; i++)
	{
		result[i] = valueStart + (valueStop - valueStart) / count * i;
	}
	return result;
}

//Class Axis
function Axis(startPoint, length)
{
	//Attributes
	this._startPoint = [0, 0];
	this._length = 0;
	this._rotation = 0;
	
	this._id = "";
	this._type = 'continuous';//'discrete'
	
	this._valueStart = 0;
	this._valueStop = 0;
	this._discreteValues = [];
	this.scaleFactor = 1;
	
	this.marks = [];
	this._markCount = 0;
	this._markStep = 0;
	this.markWidth = 5;
	
	this._labelStep = 0;
	this.labelRotation = 0;
	this.labelOffset = [0, 0];
	this.labelAlign = constants.CENTER;
	this.labels = [];
	
	this.showAxis = true;
	this.showMark = true;
	this.showLabel = true;
	this.showFirstMark = true;
	this.showLastMark = true;
	this.showFirstLabel = true;
	this.showLastLabel = true;
	
	this._localX_ = 0;
	this._localY_ = 0;
	this._h_ = 0;
	this._alpha_ = 0;
	this._beta_ = 0;
	this._currentLength_ = 0;
	this._currentHeight_ = 0;
	this._projectionLength = 0;
	this._projectionHeight = 0;
	this._mouseValue = "";
	this._mouseValueIndex = 0;
	
	//Construction
	this.construct = function (startPoint, length)
	{
		this._startPoint = startPoint;
		this._length = length;
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Axis.prototype.setID = function (id)
		{
			this._id = idGenerator();
		}
		
		Axis.prototype.getID = function ()
		{
			return this._id;
		}		
		
		Axis.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}
		
		Axis.prototype.setLength = function (length)
		{
			this._length = length;
			this._updateMark();
		}
		
		Axis.prototype.getLength = function ()
		{
			return this._length;
		}
		
		Axis.prototype.setRotation = function (rotation)
		{
			this._rotation = rotation;
		}
		
		Axis.prototype.getRotation = function ()
		{
			return this._rotation;
		}
		
		Axis.prototype.setMarkCount = function (count)
		{
			this._markCount = count;
			this._updateMark();
			//this._updateLabel();
		}
		
		Axis.prototype.getMarkCount = function ()
		{
			return this._markCount;
		}
		
		Axis.prototype._updateMark = function ()
		{
			this._markStep = Math.round(this._length / this._markCount);
			this.marks = [];
			for(var i = 0; i < this._markCount; i++)
			{
				this.marks[i] = [i * this._markStep, 0];
			}
			this.marks[this._markCount] = [this._markCount * this._markStep, 0];
		}
		
		Axis.prototype._setValueRange = function (valueStart, valueStop)
		{
			this._valueStart = valueStart;
			this._valueStop = valueStop;
		}
		
		//Continuous values
		Axis.prototype.setContinuousLabels = function (labelStep, valueStart, valueStop)
		{
			this._type = "continuous";
			this._setValueRange(valueStart, valueStop);
			this._createLabel(valueInterpolate(valueStart, valueStop, this._markCount / labelStep) ,labelStep);
		}
		
		Axis.prototype.setDiscreteLabels = function (labelStep, values)
		{
			this._type = "discrete";
			this._discreteValues = values;
			this._createLabel(values ,labelStep);
		}
		
		Axis.prototype._createLabel = function (values, step)
		{
			this._labelStep = step;
			this.labels = [];
			var index = 0;
			for(var i = 0; i < this._markCount + 1; i++)
			{
				if(i % this._labelStep == 0)
				{
					index = Math.floor(i / this._labelStep);
					if(index < values.length)
					{
						this.labels[index] = new Label([0, 0], values[index]);
					}
					else
					{
						this.labels[index] = new Label([0, 0], "");
					}
				}
			}
			this._updateLabel();
		}

		Axis.prototype.setLabelStyle = function (offset, rotation, align)
		{
			this.labelAlign = align;
			this.labelRotation = rotation;
			this.labelOffset = offset;
			this._updateLabel();
		}
		
		Axis.prototype._updateLabel = function ()
		{
			for(var i = 0; i < this.labels.length; i++)
			{
				this.labels[i].setRotation(this.labelRotation);
				this.labels[i].align = this.labelAlign;
				this.labels[i].setStartPoint([this.marks[i * this._labelStep][0] + this.labelOffset[0], this.marks[i * this._labelStep][1] + this.labelOffset[1]]);
			}
		}
		
	
		
		Axis.prototype.draw = function ()
		{
			push();
			translate(this._startPoint[0], this._startPoint[1]);
			rotate(this._rotation);
			this._drawAxis();
			this._drawMark();
			this._drawLabel();
			this._drawMouseValue();
			pop();
		}
		
		//
		Axis.prototype._drawAxis = function ()
		{
			if(this.showAxis)
			{
				stroke();
				strokeWeight(1);
				line(0, 0, this._length, 0);
			}
		}
		
		//
		Axis.prototype._drawMark = function ()
		{
			if(this.showMark)
			{
				for( var i = 0; i < this.marks.length; i++)
				{
					if((i == 0 && !this.showFirstMark) || (i == this.marks.length - 1 && !this.showLastMark))
					{
						continue;
					}
					else
					{
						push();
						strokeWeight(1);
						translate(this.marks[i][0], this.marks[i][1]);
						line(0, 0, 0, this.markWidth);
						pop();
					}
				}
			}
		}
		
		Axis.prototype._drawLabel = function ()
		{
			if(this.showLabel)
			{
				for( var i = 0; i < this.labels.length; i++)
				{
					if((i == 0 && !this.showFirstLabel) || (i == this.marks.length - 1 && !this.showLastLabel))
					{
						continue;
					}
					else
					{
						this.labels[i].draw();
					}
				}
			}			
		}
		
		Axis.prototype._updateMousePosition = function()
		{
			this._localX_ = mouseX - this._startPoint[0];
			this._localY_ = mouseY - this._startPoint[1];
			this._h_ = Math.sqrt(this._localX_*this._localX_ + this._localY_*this._localY_);
			this._alpha_ = Math.acos(this._localX_ / this._h_);
			if(this._localY_ < 0)
			{
				this._beta_ = this._alpha_ + this._rotation;
			}
			else if(this._localY_ > 0)
			{
				this._beta_ = this._alpha_ - this._rotation;
			}
			else
			{
				this._beta_ = this._rotation;
			}
		}
		
		Axis.prototype._updateMouseProjection = function()
		{
			this._updateMousePosition();
			this._projectionLength = Math.cos(this._beta_) * this._h_;
			this._projectionHeight = Math.sin(this._beta_) * this._h_;
		}
		
		Axis.prototype._updateContinuousMouseValue = function()
		{
			this._mouseValue = this._valueStart + (this._valueStop - this._valueStart) * this._projectionLength / this._length;
			this._currentLength_ = this._projectionLength;
		}

		Axis.prototype._updateDiscreteMouseValue = function()
		{
			this._mouseValueIndex = Math.round(this._projectionLength / (this._markStep * this._labelStep));
			this._mouseValue = this.labels[this._mouseValueIndex].info;
			this._currentLength_ = this._mouseValueIndex * this._markStep * this._labelStep;
		}
		
		Axis.prototype._drawMouseValue = function()
		{
			this._updateMouseProjection();
			
			if(this._projectionLength >= 0 && this._projectionLength <= this._length)
			{		
				if(this._type == "continuous")
				{
					this._updateContinuousMouseValue();
					/*
					stroke([0, 0, 0, 50]);
					line(this._currentLength_, 0, this._currentLength_, this._currentHeight_);
					*/
					strokeWeight(1);
					stroke([255, 0, 0, 200]);
					line(this._currentLength_, 0, this._currentLength_, -this.markWidth);		
				}
				else if(this._type == "discrete")
				{
					this._updateDiscreteMouseValue();
					strokeWeight(4);
					stroke([255, 0, 0, 255]);
					if(this._mouseValueIndex != 0 && this._mouseValueIndex != this.labels.length - 1)
					{
						line(this._currentLength_ - this._markStep * this._labelStep / 2, this.markWidth*3/5, this._currentLength_ + this._markStep * this._labelStep / 2, this.markWidth*3/5);
					}						
				}
				/*
				noStroke();
				fill([227, 119, 194, 100]);
				ellipse(this._currentLength_, 0, 10, 10);
				*/
		
			}
			else this._mouseValue = "";
		}
		
		Axis.prototype.scale = function (value)
		{
			if(this._type == "continuous")
			{
				return this._length * (this.scaleFactor * value - this._valueStart) / (this._valueStop - this._valueStart);
				//console.log("continuous");
			}
			else if(this._type == "discrete")
			{
				return this._discreteValues.indexof(value) * this._markStep * this._labelStep;
			}
		}
		
		this._initialized = true;
	}
	
	//Static method
	
	//Call construct
	this.construct(startPoint, length);
}

//Class Bar
function Bar(startPoint, width, height)
{
	//Attributes
	this._startPoint = [0, 0];
	this.topPoint = [0, 0];
	this.leftPoint = [0, 0];
	this.rightPoint = [0, 0];
	this.width = 0;
	this.height = 0;
	this._rotation = 0;
	this.color = [255, 255, 255];
	this.selected = true;
	
	//Constructor
	this.construct = function (startPoint, width, height)
	{
		this._startPoint = startPoint;
		this.width = width;
		this.height = height;
		this._updatePoints();
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		Bar.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}
	
		Bar.prototype.setWidth = function (width)
		{
			this.width = width;
			this._updatePoints();
		}
		
		Bar.prototype.setHeight = function (height)
		{
			this.height = height;
			this._updatePoints();
		}
		
		Bar.prototype.setRotation = function (rotation)
		{
			this._rotation = rotation;
		}
		
		Bar.prototype.getRotation = function ()
		{
			return this._rotation;
		}
		
		Bar.prototype._updatePoints = function ()
		{
			this.topPoint = [this.height, 0];
			this.leftPoint = [this.height/2, -this.width/2];
			this.rightPoint = [this.height/2, this.width/2];
		}
		
		/*
		Bar.prototype._mouseInside = function ()
		{
			if(mouseX > this.startX && mouseX < this.startX + this._width && (mouseY > this.startY && mouseY < this.startY + this._height && this._height > 0 || mouseY < this.startY && mouseY > this.startY + this._height && this._height < 0)) return true;
			else return false;
		}
		*/
		
		Bar.prototype.draw = function ()
		{
			/*
			if(this._mouseInside()) fill(127);
			else fill(this.color[0], this.color[1], this.color[2]);
			rect(this.startX, this.startY, this._width, this._height);
			*/
			push();
			translate(this._startPoint[0], this._startPoint[1]);
			rotate(this._rotation);
			noStroke();
			fill(color(this.color));
			rect(0, -this.width/2, this.height, this.width);
			pop();
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint, width, height);
}

//class Tag
function Tag(startPoint, width, height, info)
{
	//Attributes
	this._startPoint = [0, 0];
	this.width = 0;
	this.height = 0;
	this._rotation = 0;
	this.color = [210, 210, 210];
	this.centerPoint = [0, 0];
	this.show = true;
	this.showLabel = true;
	this._label = new Label([0,0], "");
	
	//Constructor
	this.construct = function (startPoint, width, height, info)
	{
		this._startPoint = startPoint;
		this.width = width;
		this.height = height;
		this._label.info = info;
		this._label.align = constants.CENTER;
		this._updateLabel();
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Tag.prototype.setStartPoint = function (startPoint)
		{
			this._startPoint = startPoint;
			this._updateLabel();
		}
	
		Tag.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}	
	
		Tag.prototype.setRotation = function (rotation)
		{
			this._rotation = rotation;
			this._updateLabel();
		}
		
		Tag.prototype.getRotation = function ()
		{
			return this._rotation;
		}		
		
		Tag.prototype.setInfo = function (info)
		{
			this._label.info = info;
		}		
		
		Tag.prototype._updateLabel = function ()
		{
			this._label.setStartPoint(local2GlobalPoint(this._startPoint, this._rotation, [12 + this.height/2 - 7, 0]));
			//7 = CharHeight(this._label.info)//Not yet implemented by P5 dev
		}

		Tag.prototype.draw = function ()
		{
			if(this.show)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);
				rotate(this._rotation);
				noStroke();
				fill(color(this.color));
				triangle(6, 0, 12, 5, 12, -5);
				rect(11, -this.width/2, this.height, this.width);
				pop();
				if(this.showLabel)
				{
					this._label.draw();
				}
			}
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint, width, height, info);
}

function Label(startPoint, info)
{
	//Attributes
	this._startPoint = [0, 0];
	this._rotation = 0;
	this.info = "";
	this.size = 15;
	this.align = constants.LEFT;
	this.color = [0, 0, 0];
	this.show = true;
	
	//Constructor
	this.construct = function (startPoint, info)
	{
		this._startPoint = startPoint;
		this.info = info;
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
	
		Label.prototype.setStartPoint = function (startPoint)
		{
			this._startPoint = startPoint;
		}		
	
		Label.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}		
	
		Label.prototype.setRotation = function (rotation)
		{
			this._rotation = rotation;
		}
		
		Label.prototype.getRotation = function ()
		{
			return this._rotation;
		}		
	
		Label.prototype.draw = function ()
		{
			if(this.show)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);
				rotate(this._rotation);
				noStroke();
				textSize(this.size);
				fill(color(this.color));
				textAlign(this.align);
				text(this.info, 0, 0);
				pop();
			}
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint, info);	
}

function Bar_Graph(startPoint, width, height)
{
    //Attributes
	this.tag1 = null;
	
	this._axises = [];
	this._bars = [];
	this._width = 0;
	this._height = 0;
	this.barWidth = 20;
	
    //Constructor
    this.construct = function (startPoint, width, height)
    {
		this._dataLoadCompleted = false;
		this._table = null;
		
		this._width = width;
		this._height = height;
		
		this.barWidth = 20;
		
		this._axises = [new Axis(startPoint, this._width), new Axis(startPoint, this._height)];
    };

    //Methods
    if (typeof this._initialized == "undefined")
	{
	
		Bar_Graph.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}		
	
		Bar_Graph.prototype.addBars = function (labelAxis, valueAxis, values, color)
		{
			this._bars[this._bars.length] = [];
			if(this._bars.length < 2)
			{
				
				for(var i = 0; i < values.length; i++)
				{
					if(i < labelAxis.marks.length - 1)
					{
						var bar = new Bar(local2GlobalPoint(labelAxis.getStartPoint(), labelAxis.getRotation(), labelAxis.marks[i+1]), this.barWidth, valueAxis.scale(values[i]));
						bar.setRotation(valueAxis.getRotation());
						bar.color = color;
						this._bars[0][this._bars[0].length] = bar;
					}
				}
			}
			else
			{
				for(var i = 0; i < values.length; i++)
				{
					if(i < labelAxis.marks.length - 1)
					{
						var bar = new Bar(local2GlobalPoint(this._bars[this._bars.length - 2][i].getStartPoint(), this._bars[this._bars.length - 2][i].getRotation(), this._bars[this._bars.length - 2][i].topPoint), this.barWidth, valueAxis.scale(values[i]));
						bar.setRotation(valueAxis.getRotation());
						bar.color = color;
						this._bars[this._bars.length - 1][this._bars[this._bars.length - 1].length] = bar;
					}
				}
			}
		}
		
        Bar_Graph.prototype.load = function (table)
        {
			this._table = table;
			this._dataLoadCompleted = true;
			this._precessData(2);
        }
		
        Bar_Graph.prototype._precessData = function (index)
        {
			var colum = null;
			if(this._dataLoadCompleted)
			{
				colum = this._table.getColumn(index);
			}
        }
		
        Bar_Graph.prototype.draw = function ()
        {	
			if(this._dataLoadCompleted)
			{
				for(var level = 0; level < this._bars.length; level++)
				{
					for(var index = 0; index < this._bars[level].length; index++)
					{
						this._bars[level][index].draw();
					}
				}
				for(var i = 0; i < this._axises.length; i++)
				{
					this._axises[i].draw();
				}

			}
        }

        this._initialized = true;
    }

    this.construct(startPoint, width, height);
}

function Scatter(startPoint)
{
	//Attributes
	this._startPoint = [0, 0];
	this.size = 10;
	this.color = [127, 127, 127, 100];
	this.show = true;
	
	//Constructor
	this.construct = function (startPoint)
	{
		this._startPoint = startPoint;
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{

		Scatter.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}
	
		Scatter.prototype.draw = function ()
		{
			if(this.show)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);
				noStroke();
				fill(color(this.color));
				ellipse(0, 0, this.size, this.size);
				pop();
			}
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint);	
}

function Scatter_Graph(startPoint, width, height)
{
	//Attributes
	this._startPoint = [0,0];
	this._width = 0;
	this._height = 0;
	this._axises = [];
	this._scatters = [];
	
    //Constructor
    this.construct = function (startPoint, width, height)
    {
		this._startPoint = startPoint;
		this._width = width;
		this._height = height;
		
		this._axises = [new Axis(startPoint, this._width), new Axis(startPoint, this._height)];
	}

    //Methods
    if (typeof this._initialized == "undefined")
	{
	
		Scatter_Graph.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}		
	
		Scatter_Graph.prototype.AddScatter = function (values)
		{
			var _startPoint_ = [];
			for(var i = 0; i < this._axises.length; i++)
			{
				_startPoint_[_startPoint_.length] = this._axises[i].scale(values[i]);
			}
			this._scatters[this._scatters.length] = new Scatter(local2GlobalPoint(_startPoint_, 0, this._startPoint));
		}
	
        Scatter_Graph.prototype.draw = function ()
        {
			for(var i = 0; i < this._axises.length; i++)
			{
				this._axises[i].draw();
			}

			for(var i = 0; i < this._scatters.length; i++)
			{
				this._scatters[i].draw();
			}
        }

        this._initialized = true;
	}
	
	this.construct(startPoint, width, height);
}

function Single_Line(startPoint)
{
	//Attributes
	this._startPoint = [0, 0];
	this.color = [127, 127, 127, 100];
	this._values = [];
	this.visable = true;
	
	//Constructor
	this.construct = function (startPoint)
	{
		this._startPoint = startPoint;
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
	
		Single_Line.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}
	
		Single_Line.prototype.load = function (labelAxis, valueAxis, values)
		{
			this._values = [];
			for(var i = 0; i < values.length; i++)
			{
				this._values[this._values.length] = [labelAxis.scale(values[i][0]), valueAxis.scale(values[i][1])];
			}
			
			console.log(this._values);
		}
	
		Single_Line.prototype.draw = function ()
		{
			if(this.visable)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);				
				//Line
				stroke(this.color);
				beginShape(constants.LINES)
				for(var i = 0; i < this._values.length; i++)
				{
					vertex(this._values[i][0], this._values[i][1]);
				}
				endShape();
				
				//Area
				noStroke();
				beginShape();
				fill([this.color[0], this.color[1], this.color[2], 20]);
				vertex(this._values[0][0], 0);
				for(var i = 0; i < this._values.length; i++)
				{
					vertex(this._values[i][0], this._values[i][1]);
				}
				vertex(this._values[this._values.length-1][0], 0);
				endShape(constants.CLOSE);

				pop();
				
				
				
			}
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint);	
}

function Line_Graph(startPoint, width, height)
{
	//Attributes
	this._startPoint = [0,0];
	this._width = 0;
	this._height = 0;
	this._axises = [];
	this._lines = [];
	
    //Constructor
    this.construct = function (startPoint, width, height)
    {
		this._startPoint = startPoint;
		this._width = width;
		this._height = height;
		this._axises = [new Axis(startPoint, this._width), new Axis(startPoint, this._height)];
	}

    //Methods
    if (typeof this._initialized == "undefined")
	{
	
		Line_Graph.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}
		
		Line_Graph.prototype.addLine = function (values, color)
		{
			var l = new Single_Line(this._startPoint);
			l.load(this._axises[0], this._axises[1], values);
			l.color = color;
			this._lines[this._lines.length] = l;
		}
		
		Line_Graph.prototype.getAxises = function ()
		{
			return this._axises;
		}		
		
        Line_Graph.prototype.draw = function ()
        {
			for(var i = 0; i < this._axises.length; i++)
			{
				this._axises[i].draw();
			}

			for(var i = 0; i < this._lines.length; i++)
			{
				this._lines[i].draw();
			}
        }

        this._initialized = true;		
	}
	
	this.construct(startPoint, width, height);
}

function Legend(startPoint)
{
	//Attributes
	this._startPoint = [0, 0];
	this._width = 0;
	this._height = 0;
	this._legends = [];
	this.show = true;
	
	//Constructor
	this.construct = function (startPoint)
	{
		this._startPoint = startPoint;
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Legend.prototype.setStartPoint = function (startPoint)
		{
			this._startPoint = startPoint;
		}
		
		Legend.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}

		Legend.prototype.addLegend = function(info, color)
		{
			this._legends[this._legends.length] = [info, color];
			this._width = Math.max(textWidth(info) + 60, this._width);
			this._height = 20 + this._legends.length * 20 - 7;
		}
		
		Legend.prototype.draw = function ()
		{
			if(this.show)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);
				fill([127,127,127,100]);
				//stroke();
				//strokeWeight(1);
				rect(0, 0, this._width, this._height);
				noStroke();
				textSize(14);
				textAlign(LEFT);
				
				for(var i = 0; i < this._legends.length; i++)
				{
					fill(this._legends[i][1]);
					rect(10, 10 + 20 * i, 15, 15);
					text(this._legends[i][0], 10 + 22, 10 + 12 + 20 * i);
				}
				
				pop();
			}
		};
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(startPoint);
}

//Under dev
function Paralell_Coordinate(startPoint)
{
	//Attributes
	this._startPoint = [0, 0];
	this._width = 0;
	this._height = 0;
	this._axises = [];
	this.show = true;

	//Constructor
    this.construct = function (startPoint, width, height)
    {
		this._startPoint = startPoint;
		this._width = width;
		this._height = height;
	}
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Legend.prototype.setStartPoint = function (startPoint)
		{
			this._startPoint = startPoint;
		}
		
		Legend.prototype.getStartPoint = function ()
		{
			return this._startPoint;
		}

		Legend.prototype.addAxis = function(axis)
		{
			axis.setStartPoint([])
			this. _axises[this._axises.length] = axis;
			
			var currentPos = this._width;
		}
		
		Legend.prototype.draw = function ()
		{
			if(this.show)
			{
				push();
				translate(this._startPoint[0], this._startPoint[1]);
				for(var i =0; i<this._axises.length; i++)
				{
					this._axises[i].draw();
				}
				pop();
			}
		};
		
		this._initialized = true;
	}	
	
	//Call construct
	this.construct(startPoint);
}

function Data_Entry(value)
{
	//Attributes
	this._value = 0;
	this._id = "";
	this._source = {};
	
	this._screenPoint = [0,0];
	this._representation = {};
	this.selected = false;
	
	this._tag = {};
	
	//Constructor
	this.construct = function (value)
	{
		this._id = idGenerator();
		this._value = value;
		this._tag = new Tag(this._screenPoint, 50, 40, this._value.toString());
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Data_Entry.prototype.getIndex = function ()
		{
			return this._index;
		}		
		
		Data_Entry.prototype.getID = function ()
		{
			return this._id;
		}
		
		Data_Entry.prototype.getValue = function ()
		{
			return this._value;
		}

		Data_Entry.prototype.setValue = function (value)
		{
			this._value = value;
			this.onValueChange(this._id);
		}
		
		Data_Entry.prototype.onValueChange = function (id)
		{
			/*
			this._source.updateRawData(id);
			this.screenMapping();
			this.updateTag();
			*/
		}
		
		Data_Entry.prototype.screenMapping = function ()
		{
			this._screenPoint = this._source.mappingFunction(this._value);
		}

		Data_Entry.prototype.updateTag = function ()
		{
			this._tag.setInfo(this._value.toString());
			this._tag.setStartPoint(this._screenPoint);
			this._tag.setRotation(-Math.PI / 2);
		}
		
		Data_Entry.prototype.getTag = function ()
		{
			return this._tag;
		}		
		
		Data_Entry.prototype.link = function (source)
		{
			this._source = source;
		}
		
		Data_Entry.prototype.getGlobalX = function ()
		{
			return this._screenPoint[0];
		}
		
		Data_Entry.prototype.getGlobalY = function ()
		{
			return this._screenPoint[1];
		}
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(value);
}

function Data_Source(type)
{
	//Attributes
	this._type = "static";//"dynamic"
	this._rawData = [];
	this._entries = [];
	this._entries_hashtable = {};
	this._currentEntryID = -1;
	this._graph = {};
	
	this.color = [0,0,0, 127];
	
	//Constructor
	this.construct = function (type)
	{
		this._type = type;
		this.color = [random(255), random(255), random(255), 200]
	};
	
	//Methods
	if (typeof this._initialized == "undefined")
	{
		
		Data_Source.prototype.setRawData = function (data)
		{
			this._rawData = data;
		}
		
		Data_Source.prototype.getRawData = function ()
		{
			return this._rawData;
		}
		
		Data_Source.prototype.getEntries = function ()
		{
			return this._entries;
		}
		
		Data_Source.prototype.setType = function (type)
		{
			if(this._type != type)
			{
				this._type = type;
				this._updateType();
			}
		}
		
		Data_Source.prototype.getType = function ()
		{
			return this._type;
		}
		
		Data_Source.prototype._updateType = function ()
		{
			if(this._type == "static")
			{
				this._reloadRawData();
				this._clearEntries();
			}
			else if(this._type = "dynamic")
			{
				this._createEntries();
			}
			else
			{
				console.log("TYPE ERROR!");
			}
		}
		
		Data_Source.prototype._clearEntries = function ()
		{
			this._entries = [];
			this._entries_hashtable = {};
		}
		
		Data_Source.prototype._createEntry = function (value)
		{
			var result = new Data_Entry(value);
			result.link(this);
			result.screenMapping();
			result.updateTag();
			return result;
		}
		
		Data_Source.prototype._createEntries = function ()
		{
			this._clearEntries();
			for(var i = 0; i < this._rawData.length; i++)
			{
				var entry = this._createEntry(this._rawData[i]);
				this._entries_hashtable[entry.getID()] = entry;
				this._entries[this._entries.length] = entry;
			}
		}
		
		Data_Source.prototype.updateRawData = function (id)
		{
			/*
			this._rawData[this._entries_hashtable[id].getIndex()] = this._entries_hashtable[id].getValue();
			*/
		}
		
		Data_Source.prototype._reloadRawData = function ()
		{
			this._rawData = [];
			for(var i = 0; i < this._entries.length; i++)
			{
				this._rawData[this._rawData.length] = this._entries[i].getValue();
			}
			return this._rawData;
		}
		
		
		///////////////////
		Data_Source.prototype._getEntry = function (globalX, globalY)
		{
			var minDist = Number.MAX_VALUE;
			for(var id in this._entries_hashtable)
			{
				var xDiff = globalX - this._entries_hashtable[id].getGlobalX();
				var yDiff = globalY - this._entries_hashtable[id].getGlobalY();
				var currentDist = (xDiff * xDiff) + (yDiff * yDiff);
				if(currentDist < minDist)
				{
					minDist = currentDist;
					this._currentEntryID = id;
				}
			}
		}
		
		Data_Source.prototype.selectEntry = function (globalX, globalY)
		{
			this._getEntry(globalX, globalY);
			if(this._currentEntryID in this._entries_hashtable)
			{
				this._entries_hashtable[this._currentEntryID].selected = !this._entries_hashtable[this._currentEntryID].selected;
			}
		}
		
		Data_Source.prototype.mappingFunction = function (value)
		{
			if(value instanceof Array)
			{
				var result = [];
				for(var i = 0; i < value.length; i++)
				{
					result[result.length] = this._graph.getAxises()[i].scale(value[i]);
				}
				return result;
			}
			else
			{
				return this._graph.getAxises()[0].scale(value);
			}
		}
		
		Data_Source.prototype.bindGraph = function (graph)
		{
			this._graph = graph;
			this._updateType();
		}
		
		Data_Source.prototype.draw = function ()
		{
			for(var id in this._entries_hashtable)
			{
				var v = this._entries_hashtable[id];
				var tx = v.getGlobalX();
				var ty = v.getGlobalY();
				push();
				translate(this._graph.getAxises()[0].getStartPoint()[0], this._graph.getAxises()[1].getStartPoint()[1]);
				noStroke();
				if(v.selected)
				{
					fill([255,0,0,100]);
					v.getTag().draw();
				}
				else
				{
					fill(this.color);
				}
				ellipse(tx, ty, 8, 8);
				pop();
			}
		}
		
		this._initialized = true;
	}
	
	//Call construct
	this.construct(type);	
}

function Graph_Prototype()
{
	//Attributes
	this._dataSources = [];
	this._axises = [];
	this._representations = [];
	
    //Constructor
    this.construct = function ()
    {
	}

    //Methods
    if (typeof this._initialized == "undefined")
	{
	
		Graph_Prototype.prototype.addDataSource = function (data)
		{
			data.bindGraph(this);
			this._dataSources[this._dataSources.length] = data;
		}
		
		Graph_Prototype.prototype.getDataSources = function (data)
		{
			return this._dataSources;
		}		

		Graph_Prototype.prototype.clearDataSources = function (data)
		{
			this._dataSources = [];
		}
		
		Graph_Prototype.prototype.addAxis = function (axis)
		{
			this._axises[this._axises.length] = axis;
		}
		
		Graph_Prototype.prototype.getAxises = function ()
		{
			return this._axises;
		}
		
		Graph_Prototype.prototype._link = function ()
		{
			
		}
		
        Graph_Prototype.prototype.draw = function ()
        {
			for(var i = 0; i < this._axises.length; i++)
			{
				this._axises[i].draw();
			}
			
			for(var i = this._dataSources.length - 1; i >= 0; i--)
			{
				this._dataSources[i].draw();
			}			
			
			for(var i = 0; i < this._representations.length; i++)
			{
				this._representations[i].draw();
			}
        }
		
        this._initialized = true;
	}
	
	this.construct();
}

