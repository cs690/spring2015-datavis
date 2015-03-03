function barchart() {
    var margin = {top:20, left:70, right:20, bottom:30},
        yScale = d3.scale.linear().clamp(true),
        yAxis = d3.svg.axis(),
        yLabel = "Label",
        width = 1000, // default width
        height = 300, // default height
        xValue = 0, // default x coordinate
        yValue = 0; // default y coordinate


    function chart(selection) {

        selection.each(function (data){

            var svg = d3.select("#barchart"),
                maxVal = d3.max(data, function(d) {return d;}),
                barWidth, labelX, labelY,
                barPadding = 0.5,
                labelPadding = 20,
                fontSize = 11,
                defaultBarColor = "teal",
                changedBarColor = "red",
                sortedData = data.slice().sort(function (a, b) {return b - a;})
                cboxX = width - (width / 5) - margin.left - margin.right,
                cboxY = margin.top / 1.5,
                sortStr = "Sort";


            yScale.domain([0, maxVal])
                .range([height - margin.bottom, margin.top]);

            margin.left += 5 * (Math.log(maxVal) / Math.log(10));
            barWidth = (width - margin.left - margin.right - labelPadding)
                        / data.length - barPadding;

            labelX = margin.left + labelPadding / 2;
            labelY = yScale(maxVal) + fontSize / 2 * yLabel.length;

            //Add a checkbox
            d3.select("#vis")
                .append("input")
                .attr("type", "checkbox")
                .attr("id", "checked")
                .style({
                    position:"absolute",
                    left: cboxX + "px"
                });

            //Add a tooltip
            d3.select("#vis")
                .append("p")
                .attr("class", "tooltip")
                .text("I'm tooltip!")
                .style("display", "none");

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
                .attr("class", "bar")
                .on("mousemove", function(d, i){

                    var pos = d3.mouse(this);
                    d3.select(this).style("fill", changedBarColor);
                    d3.select(".tooltip")
                        .classed("bar_tooltip", true)
                        .text(function () {
                            return d3.select("input").property("checked")? sortedData[i] : data[i];
                        })
                        .style({
                            display: "",
                            top : pos[1] - 20 + "px",
                            left : pos[0] + "px"
                        })
                        ;
                })
                .on("mouseleave", function(d, i){
                    d3.select(this).style("fill", defaultBarColor);
                    d3.select(".tooltip").classed("bar_tooltip", false).style("display", "none");
                })
                .transition()
                .duration(800)
                .attr("height", function(d){ return height - margin.bottom - yScale(d);})
                .attr("y", function(d) {return yScale(d);});

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

                var _data = this.checked? sortedData : data;

                svg.transition()
                    .duration(750)
                    .selectAll(".bar")
                    .delay(function(d, i) { return i * 10; })
                    .attr("y", function(d, i) {
                        return yScale(_data[i]);
                    })
                    .attr("height", function(d, i){
                        return height - margin.bottom - yScale(_data[i]);
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
    return chart;
}
