
/*
 * D3 Introduction
 * @author: Marco Schäfer
 * @author: Nicolas Brich
 */
function parsePopulation(value) {
    let res;
    if (value.endsWith("M")) {
        res = parseFloat(value) * 1e6; // Convert "M" suffix to millions
    } else if (value.endsWith("k")) {
        res = parseFloat(value) * 1e3; // Convert "k" suffix to thousands
    } else {
        res = parseFloat(value); // Parse as plain number
    }
    console.log(`Original: ${value}; Result: ${res}`);
    return res;
}

d3.csv("gapminder.csv").then(function(dataset) {
    const svgWidth = 800;
    const svgHeight = 500;
    let country = "country";
    let paramx = "Average Daily Income";
    let paramy = "Babies per Woman";
    let minVal = d3.min(dataset, function(d) { return d[paramx]; });
    let maxVal = d3.max(dataset, d => d[paramx] ); // equivalent to the function statement above
    let minValy = d3.min(dataset, function(d) { return d[paramy]; });
    let maxValy = d3.max(dataset, d => d[paramy] ); // equivalent to the function statement above
    let scaleX = d3.scaleLinear().domain([minVal, maxVal]).range([0, svgWidth]);
    let scaleY = d3.scaleLinear().domain([maxValy, minValy]).range([0, svgHeight]);
    
    let minPop = d3.max(dataset, d => parsePopulation(d["Population"]));
    let maxPop = d3.min(dataset, d => parsePopulation(d["Population"]));
    let scaleBubble = d3.scaleLinear().domain([minPop, maxPop]).range([20, 1000]);
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
    
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (svgHeight + margin.top) + ")")
      .call(d3.axisBottom(scaleX));
  
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(scaleY));
    
    /* let colorInt = d3.scaleLinear()
      .domain([minVal, ((maxVal-minVal) / 2.0 + minVal), maxVal])
      .range(["blue", "white", "red"])
      .interpolate(d3.interpolateRgb); */
  
    let chart = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("cx", d => scaleX(d[paramx]))
      .attr("cy", d => scaleY(d[paramy]))
      .attr("r", d => Math.sqrt(scaleBubble(parsePopulation(d["Population"])) / Math.PI))
      .attr('stroke', 'black')
      .attr("fill-opacity", 0.75)
      .attr('fill', '#69a3b2');
  
    /* d3.selectAll("input").on("change", changeX);
    function changeX() {
      // update variables: param, min/max values, and scale for x dimension
      let param = this.value;
      let minVal = d3.min(dataset, d => d[param]);
      let maxVal = d3.max(dataset, d => d[param]);
      let scaleX = d3.scaleLinear().domain([minVal, maxVal]).range([0, svgWidth]);
      // make a new transition that takes 750ms and update the cx values
      let sel = d3.select("svg").transition().duration(750)
        .selectAll("rect")
        .attr("width", d => scaleX(d[param])); 
    } */
  }, function(reason) {
    console.log(reason); // Error! In many browsers, press F12 to see the console
    d3.select("body")
    .append("p")
    .text("Could not load data set. See console for more information.");
    });