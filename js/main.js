'use strict';
/*
1. make a filterByYear function

*/

(function() {

  let data = "no data";
  let allCountryData = "no data";
  let svgScatterPlot = ""; // keep SVG reference in global scope
  let svgLineGraph = "";


  // load data and make scatter plot after window loads
  window.onload = function() {
    svgScatterPlot = d3.select('body')
      .append('svg')
      .attr('width', 1500)
      .attr('height', 1000);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/exports2.csv")
      .then((csvData) => {
        data = csvData
        allCountryData = csvData;
        makeScatterPlot();
      });
  }

  // make scatter plot with trend line
  function makeScatterPlot() {

    var parseTime = d3.timeParse("%m/%d/%Y");

    data.forEach(function(d) {
        d.Year = parseTime(d.Year);
    });
    let year = data.map((row) => (row["Year"]));
    let world = data.map((row) => parseFloat(row["World"]));

    // find data limits
    let axesLimits = findMinMax(year, world);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Year", "World", svgScatterPlot, {min: 75, max: 1250}, {min: 50, max: 750});

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);


    // draw title and axes labels
    makeLabels();
  }

  // make title and axes labels
  function makeLabels() {
    svgScatterPlot.append('text')
      .attr('x', 500)
      .attr('y', 30)
      .style('font-size', '20pt')
      .text("Global Exports by Period");

    svgScatterPlot.append('text')
      .attr('x', 600)
      .attr('y', 800)
      .style('font-size', '15pt')
      .text('Period');

    svgScatterPlot.append('text')
      .attr('transform', 'translate(15, 500)rotate(-90)')
      .style('font-size', '15pt')
      .text('Exports (US Dollars, Millions)');

    var legend = svgScatterPlot
      .append('g')
      .attr("class", "legend")
      .attr("transform","translate(1300,100)");

  legend.append('text')
      .attr("x", 0)
      .attr("y", 15)
      .text('Type of Export Data')
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 17)
      .style('font-weight', 'bold');
  
  legend.append('rect')
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "blue")
  
  legend.append('text')
      .attr("x", 25)
      .attr("y", 40)
      .text('World')
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 17);

  legend.append('rect')
      .attr("x", 0)
      .attr("y", 60)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "black")
  
  legend.append('text')
      .attr("x", 20)
      .attr("y", 75)
      .text('Advanced')
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 17);

    legend.append('rect')
      .attr("x", 0)
      .attr("y", 95)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "green")
  
  legend.append('text')
      .attr("x", 20)
      .attr("y", 110)
      .text('Emerging')
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 17);
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    
    var formatTime = d3.timeFormat("%Y-%m-%d")

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

      var mouseG = svgScatterPlot.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

      var lines = document.getElementsByClassName('line');

      var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(data)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
  

        mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

      mouseG.append('svg:rect')
      .attr('width', 1250) 
      .attr('height', 750)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', function() { 
        d3.select(".mouse-line")
          .style("opacity", "1");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "1");
      })
      .on('mousemove', function() { 
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + 1250;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

          d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {            
            d3.select(this).select('text')
              .text(formatTime(map.xScale.invert(mouse[0])));
              
            return "translate(" + mouse[0] + "," + 200 +")";
          });

        });
        
      var valueLine = d3.line()
      .x(function (d) { return map.xScale(d.Year); })
      .y(function (d) { return map.yScale(d.World); })

    svgScatterPlot.append("g")
    .append("path")
    .data(data)
    .attr("class", "line")
    .attr("d", valueLine(data))
    .attr("stroke", "blue")
    .attr("stroke-width", 2);

    var valueLine2 = d3.line()
    .x(function (d) { return map.xScale(d.Year); })
    .y(function (d) { return map.yScale(d.Advanced); })

  svgScatterPlot.append("g")
  .append("path")
  .data(data)
  .attr("class", "line")
  .attr("d", valueLine2(data))
  .attr("stroke", "black")
  .attr("stroke-width", 2);

  var valueLine3 = d3.line()
  .x(function (d) { return map.xScale(d.Year); })
  .y(function (d) { return map.yScale(d.Emerging); })

svgScatterPlot.append("g")
.append("path")
.data(data)
.attr("class", "line")
.attr("d", valueLine3(data))
.attr("stroke", "green")
.attr("stroke-width", 2);


    // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 6)
        .attr('fill', "#4286f4")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", 1);
            div
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
            div.html(
                "<br/> <h2>" + formatTime(d.Year) + "</h2>" + 
                "<b>World Exports:</b> " + numberWithCommas(d["World"]) + " Million US Dollars<br/>" +  
                "<b>Advanced Economy Exports:</b> " + numberWithCommas(d["Advanced"]) + " Million US Dollars<br/>" +
                "<b>Emerging Economy Exports:</b> " + numberWithCommas(d["Emerging"]) + " Million US Dollars<br/>" +
                "<b>Other Economy Exports:</b> " + numberWithCommas(d["Other"]) + " Million US Dollars"
              
              )
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

            // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot2')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', xMap)
      .attr('cy', map.yMap2)
      .attr('r', 6)
      .attr('fill', "black")
      // add tooltip functionality to points
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", 1);
          div
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          div.html(
            "<br/> <h2>" + formatTime(d.Year) + "</h2>" + 
            "<b>World Exports:</b> " + numberWithCommas(d["World"]) + " Million US Dollars<br/>" +  
            "<b>Advanced Economy Exports:</b> " + numberWithCommas(d["Advanced"]) + " Million US Dollars<br/>" +
            "<b>Emerging Economy Exports:</b> " + numberWithCommas(d["Emerging"]) + " Million US Dollars<br/>" +
            "<b>Other Economy Exports:</b> " + numberWithCommas(d["Other"]) + " Million US Dollars"
          
          )
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

          // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot3')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', xMap)
      .attr('cy', map.yMap3)
      .attr('r', 6)
      .attr('fill', "green")
      // add tooltip functionality to points
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", 1);
          div
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          div.html(
            "<br/> <h2>" + formatTime(d.Year) + "</h2>" + 
            "<b>World Exports:</b> " + numberWithCommas(d["World"]) + " Million US Dollars<br/>" +  
            "<b>Advanced Economy Exports:</b> " + numberWithCommas(d["Advanced"]) + " Million US Dollars<br/>" +
            "<b>Emerging Economy Exports:</b> " + numberWithCommas(d["Emerging"]) + " Million US Dollars<br/>" +
            "<b>Other Economy Exports:</b> " + numberWithCommas(d["Other"]) + " Million US Dollars"
          
          )
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) { return d[x]; }

    // function to scale x value
    let xScale = d3.scaleTime()
      .domain([limits.xMin, limits.xMax])
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%Y-%m-%d"));
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}
    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, 400000]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };
    let yMap2 = function (d) { return yScale(+d["Advanced"]); };
    let yMap3 = function (d) { return yScale(+d["Emerging"]); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      yMap2: yMap2,
      yMap3: yMap3,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
