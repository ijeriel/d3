//console.log("test hi")
var svgWidth = 960;
var svgHeight = 760;

var margin = { 
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create SVG wrapper
var svg = d3.select("#scatter")
    .classed("chart", true)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Append SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial parameters
var chosenXAxis = "poverty";
//y
// var chosenYAxis = "healthcare";

//function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    //Create scales
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
    d3.max(data, d => d[chosenXAxis]) * 1.2
])
.range([0, width]);

return xLinearScale;
}
//function used for updating y-scale var upon click on axis label
// function yScale(data, chosenYAxis) {
//     //Create scales
//     var yLinearScale = d3.scaleLinear()
//     .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
//     d3.max(data, d => d[chosenYAxis]) * 1.2
// ])
// .range([0, width]);

// return yLinearScale;


//function used for updating xAxis var upon click on axis label
function renderAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}
//function used for updating xAxis var upon click on axis label
// function renderAxes(newYscale, yAxis) {
//     var leftAxis = d3.axisLeft(newYscale);

//     yAxis.transition()
//         .duration(1000)
//         .call(leftAxis);

//     return yAxis;
// }


//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
        //y
        // .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
        //y
        // .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

//function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";
    }
    else if (chosenXAxis === "income") {
        label = "Houshold Income (Median)";
    }
    else {
        label = "Age (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

//Retrieve data from CSV file and execute:
d3.csv("./assets/data/data.csv").then(function(getData, err) {
    console.log(getData)
    if (err) throw err;


    //parse data
    getData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    //xLinearScale function above csv import
    var xLinearScale = xScale(getData, chosenXAxis);

    //Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(getData, d => d.healthcare)])
        .range([height, 0]);

    //Create inital axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    chartGroup.append("g")
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(getData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "purple")
        .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll("stateText")
        .data(getData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .classed("stateText", true)
        .style("font-size", "7px")
        .style("font-weight", "800")
        .text(function(data){
            return`${data.abbr}`
        });
    


    //Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") //value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") //value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") //value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    //append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    //update ToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //x axis labels even listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                //replaces chosenXAxis with value
                chosenXAxis = value;

                //functions here found above csv import
                //updates x scale for new data
                xLinearScale = xScale(getData, chosenXAxis);

                //updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                //updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                //update circles with text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis);

                //updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                //changes classes to change bold text
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty"){
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});
