
/*
 * D3 Introduction
 * @author: Marco Schäfer
 * @author: Nicolas Brich
 * 
 * TODO:
 * -small bubbles in fornt of big bubbles
 * -hover effects
 * -color continents
 * 
 */

let selCount = 0;

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
    //const features = ["mcg","gvh","aac","alm1","alm2","lip","chg"]; // feature names
    
    //let form = d3.select("#valueSelection"); // select form by id
    
  
    /*
  
    form.append("p") // Add the heading as text paragraph (<p> tag) to the form
      .text("Select data value for X-axis:");
    
    let item = form.selectAll("label") // Add a label for each feature
      .data(features) // Set the data
      .enter() // Join
      .append("label") // Add a label for each data point
      .text(function(d) { return d; }) // Set the feature name as text
      .append("input") // Add the radio button (input type radio)
      .attr("type", "radio")
      .attr("name", "valueSel") // Set the same name for all radio buttons
      .attr("value", function(d) { return d; }) // value == feature name
      */
  
    let svg = d3.select("svg")
      .attr("width", svgWidth + margin.left + margin.right)
      .attr("height", svgHeight + margin.top + margin.bottom)
      .attr("class", "chart");
    
    // Source: https://d3js.org/d3-axis
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (svgHeight + margin.top) + ")")
      .call(d3.axisBottom(scaleX)
      .tickValues([0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128])
      .tickFormat(d => d)
      .tickSize(-svgHeight));
  
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(scaleY).tickSize(-svgWidth));
    
    dataset.forEach(d => {
        if (!d["Population"] || isNaN(parsePopulation(d["Population"]))) {
            console.warn(`Missing or invalid Population for country: ${d[paramCountry]}`);
        }
    });

    // Source: https://observablehq.com/@d3/d3-ascending
    dataset.sort((a, b) => parsePopulation(b["Population"]) - parsePopulation(a["Population"]));
    console.log("Sorted dataset:", dataset);


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
      .on("click", handleClick);

  }, function(reason) {
    console.log(reason); // Error! In many browsers, press F12 to see the console
    d3.select("body")
    .append("p")
    .text("Could not load data set. See console for more information.");
    });