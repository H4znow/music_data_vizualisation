// Sample D3.js code for World Music Distribution
// Global variables
let svg, g, pack, view;
const format = d3.format(",d");
const tooltip = d3.select("#tooltip");

function zoomed() {
    const transform = d3.event.transform;
    view.attr("transform", transform);
    view.selectAll("circle").attr("stroke-width", 1 / transform.k);
    view.selectAll("text").style("font-size", `${10 / transform.k}px`);
}

function showTooltip(d) {
    const [x, y] = d3.mouse(document.body);
    tooltip.style("left", (x + 15) + "px")
           .style("top", (y + 15) + "px")
           .style("opacity", 1);
    tooltip.select(".tooltip-title").text(d.data.name);
    tooltip.select(".tooltip-count").text(`Size: ${format(d.value)}`);
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}

function processData(root) {
    // Clear any existing visualization
    g.selectAll("*").remove();

    const hierarchy = d3.hierarchy(root)
        .sum(d => d.size)
        .sort((a, b) => b.value - a.value);

    const nodes = pack(hierarchy).descendants();

    view = g.append("g");

    const node = view.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", d => d.children ? "node" : "leaf node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add circles with hover interaction
    node.append("circle")
        .attr("r", d => d.r)
        .on("mouseover", function(d) {
            showTooltip(d);
            d3.select(this).style("fill-opacity", 0.7);
        })
        .on("mousemove", function(d) {
            showTooltip(d);
        })
        .on("mouseout", function() {
            hideTooltip();
            d3.select(this).style("fill-opacity", d => d.children ? 0.25 : 1);
        });

    // Add the node name label
    node.append("text")
        .attr("class", "node-label")
        .attr("dy", "-0.3em")
        .text(d => d.data.name)
        .style("display", d => d.r < 20 ? "none" : "block");

    // Add the count label
    node.append("text")
        .attr("class", "node-count")
        .attr("dy", "1em")
        .text(d => format(d.value))
        .style("display", d => d.r < 20 ? "none" : "block");
}

function initVisualization() {
    svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);
    
    g = svg.append("g").attr("transform", "translate(2,2)");

    pack = d3.pack()
        .size([width - 4, height - 4])
        .padding(3);
}

// Fetch and load JSON data from a specific path
async function loadJsonData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load file: ${response.statusText}`);
        const data = await response.json();
        processData(data);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Initialize when page loads
window.onload = function() {
    initVisualization();
    const jsonFilePath = 'static/genre_sousgenre_mapping.json';
    loadJsonData(jsonFilePath);
};