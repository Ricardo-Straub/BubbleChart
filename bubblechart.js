
/*
 * D3 Introduction
 * @author: Marco Schäfer
 * @author: Nicolas Brich
 * 
 * TODO:
 * x small bubbles in fornt of big bubbles
 * - hover effects
 * - color continents
 * - search and select countries
 * 
 */

let selCount = 0;



d3.csv("gapminder.csv").then(function(dataset) {
    const svgWidth = 800;
    const svgHeight = 500;
    let paramCountry = "country";
    let paramIncome = "Average Daily Income";
    let paramBabies = "Babies per Woman";
    let minIncome = d3.min(dataset, d => parsePopulation(d[paramIncome]));
    let maxIncome = d3.max(dataset, d => parsePopulation(d[paramIncome])); // equivalent to the function statement above
    let minBabies = d3.min(dataset, function(d) { return d[paramBabies]; });
    let maxBabies = d3.max(dataset, d => d[paramBabies] ); // equivalent to the function statement above
    let scaleX = d3.scaleLog().domain([0.25, 128]).range([0, svgWidth]);
    let scaleY = d3.scaleLinear().domain([maxBabies, minBabies]).range([0, svgHeight]);
    
    let minPop = d3.min(dataset, d => parsePopulation(d["Population"]));
    let maxPop = d3.max(dataset, d => parsePopulation(d["Population"]));
    let scaleBubble = d3.scaleLinear().domain([minPop, maxPop]).range([20, 10000]);
    const margin = {top: 20, right: 30, bottom: 30, left: 100};

    function parsePopulation(value) {
        let res;
        if (value.endsWith("B")) {
            res = parseFloat(value) * 1e9;
        } else if (value.endsWith("M")) {
            res = parseFloat(value) * 1e6; // Convert "M" suffix to millions
        } else if (value.endsWith("k")) {
            res = parseFloat(value) * 1e3; // Convert "k" suffix to thousands
        } else {
            res = parseFloat(value); // Parse as plain number
        }
        //console.log(`Original: ${value}; Result: ${res}`);
        return res;
    }
    
    function handleClick() {
        if (d3.select(this).attr("fill-opacity") === "1") {
            d3.select(this)
            .attr("stroke-opacity", 0.25)
            .attr("fill-opacity", 0.25);
            selCount--;
        } else {
            d3.selectAll("circle")
            // my: use function() {} for this to be circle
            .filter(function() { return d3.select(this).attr("fill-opacity") !== "1" })
            .attr("stroke-opacity", 0.25)
            .attr("fill-opacity", 0.25);
    
            d3.select(this)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
            selCount++;
        }
        if (selCount === 0) {
            d3.selectAll("circle")
            .attr("stroke-opacity", 0.75)
            .attr("fill-opacity", 0.75);
        }
    }
    
    function handleHover(event, d) {
        // Get the current bubble position
        const cx = scaleX(d[paramIncome]) + margin.left; // X position
        const cy = scaleY(d[paramBabies]) + margin.top; // Y position
        const xValue = d[paramIncome]; // X value (income)
        const yValue = d[paramBabies]; // Y value (babies per woman)
        
        // Update the lines to connect to the bubble
        lineX.attr("x1", cx)
        .attr("y1", svgHeight + margin.top) // Start from the bottom of the SVG
        .attr("x2", cx) // Connect to the bubble's X position
        .attr("y2", cy) // Connect to the bubble's Y position
        .style("opacity", 1); // Make the line visible
    
        lineY.attr("x1", margin.left) // Start from the left of the SVG
        .attr("y1", cy) // Connect to the bubble's Y position
        .attr("x2", cx) // Connect to the bubble's X position
        .attr("y2", cy) // Connect to the bubble's Y position
        .style("opacity", 1); // Make the line visible

        xAxisLabel.attr("x", cx) // Align with bubble's X position
        .attr("y", svgHeight + margin.top + 20) // Position below the x-axis
        .text(xValue)
        .style("opacity", 1); // Make visible

        // Update the y-axis label position and content
        yAxisLabel.attr("x", margin.left - 10) // Position near the y-axis
        .attr("y", cy) // Align with bubble's Y position
        .text(yValue)
        .style("opacity", 1); // Make visible
    }

    function handleOut() {
        lineX.style("opacity", 0);
        lineY.style("opacity", 0);
        xAxisLabel.style("opacity", 0);
        yAxisLabel.style("opacity", 0);
    }
  
    // SVG container
    let svg = d3.select("svg")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight + margin.top + margin.bottom)
      .attr("class", "chart");
    
    // x-Axis
    // Source: https://d3js.org/d3-axis
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (svgHeight + margin.top) + ")")
      .attr("class", "tick")
      .call(d3.axisBottom(scaleX)
      .tickValues([0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128])
      .tickFormat(d => d)
      .tickSize(-svgHeight));
  
    // y-Axis
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(scaleY).tickSize(-svgWidth));

    // x-Axis label
    svg.append("text")
      .attr("transform", "translate(" + (svgWidth / 2 + margin.left) + " ," + (svgHeight + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .style("font-size", "14px") // Set font size
      .style("fill", "black") // Set text color
      .text("Average Daily Income");
  
    // y-Axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 40)
      .attr("x", - (svgHeight / 2 + margin.top))
      .style("text-anchor", "middle")
      .style("font-size", "14px") // Set font size
      .style("fill", "black") // Set text color
      .text("Babies per Woman");

    // x-Axis line
    const lineX = svg.append("line")
      .attr("stroke", "grey") // Set line color
      .attr("stroke-width", 1) // Set line width
      .attr("stroke-dasharray", "5,5") // Optional: dashed line style
      .style("opacity", 0); // Start with opacity 0 (invisible)
  
    // y-Axis line 
    const lineY = svg.append("line")
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5") // Optional: dashed line style
      .style("opacity", 0); // Start with opacity 0 (invisible)

    // Current x-value
    const xAxisLabel = svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "12px")
      .style("opacity", 0); // Start hidden
  
    // Current y-value
    const yAxisLabel = svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .style("font-size", "12px")
      .style("opacity", 0); // Start hidden
    
    dataset.forEach(d => {
        if (!d["Population"] || isNaN(parsePopulation(d["Population"]))) {
            console.warn(`Missing or invalid Population for country: ${d[paramCountry]}`);
        }
    });

    // Sort dataset for bubble overlapping
    // Source: https://observablehq.com/@d3/d3-ascending
    dataset.sort((a, b) => parsePopulation(b["Population"]) - parsePopulation(a["Population"]));
    console.log("Sorted dataset:", dataset);

    // Circles
    svg.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("cx", d => scaleX(d[paramIncome]))
      .attr("cy", d => scaleY(d[paramBabies]))
      .attr("r", d => Math.floor(Math.sqrt(scaleBubble(parsePopulation(d["Population"])) / Math.PI)))
      .attr('stroke', 'black')
      .attr("fill-opacity", 0.75)
      .attr('fill', '#69a3b2')
      .on("click", handleClick)
      .on("mouseover", handleHover)
      .on("mouseout", handleOut);

  }, function(reason) {
    console.log(reason); // Error! In many browsers, press F12 to see the console
    d3.select("body")
    .append("p")
    .text("Could not load data set. See console for more information.");
    });