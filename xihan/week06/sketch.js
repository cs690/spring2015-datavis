function A(input)
{
	var that = this;
	
	this.a = '';
	
	this.constructor = function(input)
	{
		this.a = input;
	}
	
	if(typeof this._initialized == "undefined")
	{
		this.ty = function()
		{
			B = function(){ return that.a; }
			console.log(B());
		}
		
		this._initialized = true;
	}
	
	this.constructor(input);
}

test1 = new A("1");
test2 = new A("2");

test1.ty();
test2.ty();