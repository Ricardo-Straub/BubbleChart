
// Current nr of circles selected / clicked on
let selCount = 0;
d3.csv("gapminder.csv").then(function(dataset) {
    const svgWidth = 800;
    const svgHeight = 500;
    let paramIncome = "Average Daily Income";
    let paramBabies = "Babies per Woman";
    let minBabies = d3.min(dataset, function(d) { return d[paramBabies]; });
    let maxBabies = d3.max(dataset, d => d[paramBabies] );
    let scaleX = d3.scaleLog().domain([0.25, 128]).range([0, svgWidth]);
    let scaleY = d3.scaleLinear().domain([maxBabies, minBabies]).range([0, svgHeight]);
    let minPop = d3.min(dataset, d => parsePopulation(d["Population"]));
    let maxPop = d3.max(dataset, d => parsePopulation(d["Population"]));
    let scaleBubble = d3.scaleLinear().domain([minPop, maxPop]).range([20, 10000]);
    const margin = {top: 20, right: 30, bottom: 30, left: 100};
    const colorScale = d3.scaleOrdinal()
      .domain(["asia", "europe", "africa", "oceania", "americas"]) 
      .range(["#FF6843", "#33EF55", "#3456FF", "#F433B6", "#F1C40F"]); 

    // Parse Population values into numbers
    function parsePopulation(value) {
        let res;
        if (value.endsWith("B")) {
            res = parseFloat(value) * 1e9;
        } else if (value.endsWith("M")) {
            res = parseFloat(value) * 1e6;
        } else if (value.endsWith("k")) {
            res = parseFloat(value) * 1e3;
        } else {
            res = parseFloat(value); 
        }
        //console.log(`Original: ${value}; Result: ${res}`);
        return res;
    }
    
    // Handle click event of circle 
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
    
    // Handle hover event over circle - ignore event param
    function handleHover(event, d) {
        // Get position
        const cx = scaleX(d[paramIncome]) + margin.left; 
        const cy = scaleY(d[paramBabies]) + margin.top; 
        // Value of Income - x-Axis
        const valueX = d[paramIncome];
        // Value of Babies - y-Axis 
        const valueY = d[paramBabies];
        
        // Update lines to connect circle to the axis
        lineX.attr("x1", cx)
        .attr("y1", svgHeight + margin.top)
        .attr("x2", cx) 
        .attr("y2", cy) 
        .style("opacity", 1); 
    
        lineY.attr("x1", margin.left) 
        .attr("y1", cy) 
        .attr("x2", cx) 
        .attr("y2", cy) 
        .style("opacity", 1); 

        // x-Value of circle
        xAxisLabel.attr("x", cx)
        .attr("y", svgHeight + margin.top + 20)
        .text(valueX)
        .style("opacity", 1); 

        // y-Value of circle
        yAxisLabel.attr("x", margin.left - 10) // Position near the y-axis
        .attr("y", cy) // Align with bubble's Y position
        .text(valueY)
        .style("opacity", 1); // Make visible

        // Country descripion of circle
        description.attr("x", cx) 
          .text(`${d.country}: ${parsePopulation(d.Population).toLocaleString()}`)
          .attr("x", cx)
          .attr("y", cy - 10) 
          .style("opacity", 1); 
    }

    // Handle no more hover over circle event
    function handleOut() {
        lineX.style("opacity", 0);
        lineY.style("opacity", 0);
        xAxisLabel.style("opacity", 0);
        yAxisLabel.style("opacity", 0);
        description.style("opacity", 0);
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
      .style("font-size", "14px") 
      .style("fill", "black") 
      .text("Average Daily Income");
  
    // y-Axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 40)
      .attr("x", - (svgHeight / 2 + margin.top))
      .style("text-anchor", "middle")
      .style("font-size", "14px") 
      .style("fill", "black") 
      .text("Babies per Woman");

    // x-Axis line
    const lineX = svg.append("line")
      .attr("stroke", "grey") 
      .attr("stroke-width", 1) 
      .attr("stroke-dasharray", "5,5") 
      .style("opacity", 0); 
  
    // y-Axis line 
    const lineY = svg.append("line")
      .attr("stroke", "grey")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5") 
      .style("opacity", 0); 

    // Current x-value
    const xAxisLabel = svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "12px")
      .style("opacity", 0); 
  
    // Current y-value
    const yAxisLabel = svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .style("font-size", "12px")
      .style("opacity", 0); 

    // Sort dataset for bubble overlapping
    // Source: https://observablehq.com/@d3/d3-ascending
    dataset.sort((a, b) => parsePopulation(b["Population"]) - parsePopulation(a["Population"]));
    console.log("Sorted dataset:", dataset);

    // Circles representing countries 
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
      .attr('fill', d => colorScale(d["world_4region"]))
      .on("click", handleClick)
      .on("mouseover", handleHover)
      .on("mouseout", handleOut);

    // Circle description - can get in the way of the hover effect
    const description = svg.append("text")
      .attr("class", "description")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "16px") 
      .style("background", "white")
      .style("font-weight", "bold") 
      .style("opacity", 0); 

  }, function(reason) {
    console.log(reason);
    d3.select("body")
    .append("p")
    .text("Could not load data set. See console for more information.");
    });