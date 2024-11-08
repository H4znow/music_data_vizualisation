// Sample D3.js code for World Music Distribution
// Global variables
let svg, g, pack, view;
const format = d3.format(",d");


// Create an info block div instead of using tooltip
const infoBlock = d3.select("body")
    .append("div")
    .attr("class", "floating-info")
    .style("display", "none"); // Initially hidden

    
// Create a detail panel for clicked nodes
const detailPanel = d3.select("body")
    .append("div")
    .attr("class", "detail-panel")
    .style("display", "none");

    // Add search input
    const searchContainer = d3.select("body")
    .append("div")
    .attr("class", "search-container")
    .html(`
        <input type="text" id="genre-search" placeholder="Search genres...">
        <div id="search-results" class="search-results"></div>
    `);
// Color scale for super genres
const colorScale = d3.scaleOrdinal()
    .domain([
        "Pop", "Rock", "Hip Hop/Rap", "Electronic", "Jazz", 
        "Blues", "Country", "Folk", "Metal", "Reggae",
        "Soul/R&B", "Latin", "Classical", "Punk", "Gospel/Religious",
        "Dance", "World", "Indie/Alternative", "Comedy/Novelty", 
        "Ambient", "Soundtrack", "Experimental", "Other"
    ])
    .range([
        "#FF69B4", // Pop - Pink
        "#E34234", // Rock - Red
        "#9B59B6", // Hip Hop/Rap - Purple
        "#00CED1", // Electronic - Turquoise
        "#4682B4", // Jazz - Steel Blue
        "#0047AB", // Blues - Cobalt Blue
        "#DAA520", // Country - Goldenrod
        "#228B22", // Folk - Forest Green
        "#2F4F4F", // Metal - Dark Slate Gray
        "#006400", // Reggae - Dark Green
        "#9370DB", // Soul/R&B - Medium Purple
        "#FF8C00", // Latin - Dark Orange
        "#8B4513", // Classical - Saddle Brown
        "#FF1493", // Punk - Deep Pink
        "#FFD700", // Gospel/Religious - Gold
        "#FF00FF", // Dance - Magenta
        "#BA55D3", // World - Medium Orchid
        "#32CD32", // Indie/Alternative - Lime Green
        "#FF6347", // Comedy/Novelty - Tomato
        "#87CEEB", // Ambient - Sky Blue
        "#DDA0DD", // Soundtrack - Plum
        "#FF4500", // Experimental - Orange Red
        "#808080"  // Other - Gray
    ]);

// Add control panel for size filtering
const filterPanel = d3.select("body")
    .append("div")
    .attr("class", "filter-panel")
    .html(`
        <div class="filter-controls">
            <h3>Filter by Size</h3>
            <select id="sizeFilter">
                <option value="none">Show All</option>
                <option value="large">Large Genres (>1000 songs)</option>
                <option value="medium">Medium Genres (100-1000 songs)</option>
                <option value="small">Small Genres (<100 songs)</option>
                <option value="tiny">Tiny Genres (<10 songs)</option>
            </select>
        </div>
    `);

// Add these functions for size filtering and audio
function filterBySize(value) {
    view.selectAll("circle")
        .transition()
        .duration(500)
        .style("opacity", d => {
            if (value === 'none') return d.children ? 0.6 : 0.8;
            if (value === 'large' && d.value > 1000) return d.children ? 0.6 : 0.8;
            if (value === 'medium' && d.value >= 100 && d.value <= 1000) return d.children ? 0.6 : 0.8;
            if (value === 'small' && d.value < 100) return d.children ? 0.6 : 0.8;
            if (value === 'tiny' && d.value < 10) return d.children ? 0.6 : 0.8;
            return 0.1;
        });
}
// Search functionality
function setupSearch(nodes) {
    const searchInput = document.getElementById('genre-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            resetHighlight();
            return;
        }

        const matches = nodes.filter(node => 
            node.data.name.toLowerCase().includes(searchTerm) && node.depth > 0
        );

        displaySearchResults(matches);
    });
}

function displaySearchResults(matches) {
    const searchResults = d3.select("#search-results");
    searchResults.style("display", matches.length ? "block" : "none");
    
    const results = searchResults.selectAll("div")
        .data(matches)
        .join("div")
        .attr("class", "search-result")
        .html(d => `
            <span class="result-name">${d.data.name}</span>
            <span class="result-type">${d.depth === 1 ? 'Super Genre' : 'Sub Genre'}</span>
        `)
        .on("click", (event, d) => {
            highlightNode(d);
            searchResults.style("display", "none");
            document.getElementById('genre-search').value = '';
        });
}

function highlightNode(d) {
    resetHighlight();
    
    // Highlight the path to root
    let current = d;
    while (current.parent) {
        d3.select(current.circleEl)
            .style("stroke", "#ff0")
            .style("stroke-width", 4)
            .style("stroke-opacity", 0.8);
        current = current.parent;
    }

    // Zoom to show the selected node
    zoomToNode(d);
}

function resetHighlight() {
    svg.selectAll("circle")
        .style("stroke", d => d.depth === 1 ? getNodeColor(d) : "#fff")
        .style("stroke-width", d => d.depth === 1 ? 2 : 1)
        .style("stroke-opacity", 1);
}

function zoomToNode(d) {
    // Get the SVG dimensions from the existing svg element
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    
    const scale = Math.min(4, 800 / (2 * d.r));
    const [x, y] = [d.x, d.y];
    
    view.transition()
        .duration(750)
        .attr("transform", `translate(${width/2},${height/2})scale(${scale})translate(${-x},${-y})`);
}

function showDetailPanel(d) {
    if (d.depth === 0) return;

    const details = getNodeDetails(d);
    detailPanel.html(details)
        .style("display", "block")
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1);
}

function getNodeDetails(d) {
    const parentInfo = d.depth === 2 ? `<div class="detail-parent">Parent Genre: ${d.parent.data.name}</div>` : '';
    const subgenres = d.children ? `
        <div class="detail-subgenres">
            <h3>Subgenres (${d.children.length})</h3>
            <div class="subgenre-list">
                ${d.children.map(child => `<div class="subgenre-item">${child.data.name}</div>`).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div class="detail-header" style="border-left: 4px solid ${getNodeColor(d)}">
            <h2>${d.data.name}</h2>
            <div class="detail-type">${d.depth === 1 ? 'Super Genre' : 'Sub Genre'}</div>
            <div class="detail-count">${format(d.value)} songs</div>
            ${parentInfo}
        </div>
        ${subgenres}
        <button class="close-details">×</button>
    `;
}
    function updateInfoBlock(event, d) {
        // Get cursor position
        const mouseX = event.pageX;
        const mouseY = event.pageY;
    
        // Get genre type based on depth
        let genreType = d.depth === 1 ? "Super Genre" : "Sub Genre";
    
        // Create info content
        let content = `
            <div class="info-name">${d.data.name}</div>
            <div class="info-type">${genreType}</div>
            <div class="info-count">${format(d.value)} songs</div>
        `;
    
        // Add parent info only for subgenres
        if (d.depth === 2) {
            content += `<div class="info-parent">Part of ${d.parent.data.name}</div>`;
        }
    
        // Update info block position and content
        infoBlock
            .html(content)
            .style("left", (mouseX + 15) + "px")
            .style("top", (mouseY + 15) + "px")
            .style("display", "block");
    }
    
    function hideInfoBlock() {
        infoBlock.style("display", "none");
    }
    
    function getNodeColor(d) {
        if (d.depth === 0) return "transparent";
        if (d.depth === 1) return colorScale(d.data.name);
        if (d.depth === 2) {
            const parentColor = d3.color(colorScale(d.parent.data.name));
            return parentColor.brighter(0.5);
        }
        return "#ccc";
    }
    let selectedNode = null;
    function processData(root) {
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
    
        // Add circles with enhanced interactions
        node.append("circle")
            .attr("r", d => d.r)
            .style("fill", d => getNodeColor(d))
            .style("fill-opacity", d => d.children ? 0.6 : 0.8)
            .style("stroke", d => d.depth === 1 ? getNodeColor(d) : "#fff")
            .style("stroke-width", d => d.depth === 1 ? 2 : 1)
            .each(function(d) { d.circleEl = this; }) // Store reference for highlighting
            .on("mouseover", function(event, d) {
                if (d.depth === 0) return;
                
                d3.select(this)
                    .style("fill-opacity", 1)
                    .style("stroke-width", 3);
                updateInfoBlock(event, d);
            })
            .on("mousemove", function(event, d) {
                if (d.depth === 0) return;
                updateInfoBlock(event, d);
            })
            .on("mouseout", function(event, d) {
                // Reset styles if this node isn't the selected one
                if (!selectedNode || selectedNode !== d) {
                    d3.select(this)
                        .style("fill-opacity", d.children ? 0.6 : 0.8)
                        .style("stroke-width", d.depth === 1 ? 2 : 1);
                }
                hideInfoBlock();
            })
            .on("click", function(event, d) {
                event.stopPropagation();
                if (d.depth === 0) return;
    
                selectedNode = d;
                showDetailPanel(d);
                highlightNode(d);
            });
    
        // Setup search functionality
        setupSearch(nodes);
    
        // Add click handler to close detail panel when clicking outside
        svg.on("click", () => {
            detailPanel.style("display", "none");
            selectedNode = null;
            resetHighlight();
            view.transition()
                .duration(750)
                .attr("transform", "translate(2,2)");
        });
    
        // Add close button handler
        detailPanel.on("click", ".close-details", () => {
            detailPanel.style("display", "none");
            selectedNode = null;
            resetHighlight();
            view.transition()
                .duration(750)
                .attr("transform", "translate(2,2)");
        });
        document.getElementById("sizeFilter").addEventListener('change', (e) => {
            filterBySize(e.target.value);
        });
    }
    
    function initVisualization() {
        svg = d3.select("svg");
        const width = +svg.attr("width");
        const height = +svg.attr("height");
        
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
    const jsonFilePath = './data/genre_supergenre_structure.json';
    loadJsonData(jsonFilePath);
}