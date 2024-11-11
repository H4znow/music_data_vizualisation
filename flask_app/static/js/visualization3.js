function updateLimitSlider(min, max, slider_type){
    if (typeof min !== "number" ||  typeof max !== "number"){
      console.log("updateLimitFromSlider::ValueIsNotANumber")
      return;
    }
    currYear = new Date().getFullYear
    if (max > currYear)
      max = currYear
    if (min < 0)
      min = 0
    let slider = "";
    let sliderInput = "";
    let value = min
    if (slider_type == "from"){
        slider = document.querySelector('#fromSlider');
        sliderInput = document.querySelector('#fromInput');
    } else {
        slider = document.querySelector('#toSlider');
        sliderInput = document.querySelector('#toInput');
        value++;
    }
      
    slider.max = max 
    slider.value = value
    slider.min = min 

    sliderInput.max = max 
    sliderInput.value = value
    sliderInput.min = min 
}

function addGenreFilters(genres){
    let div = document.querySelector('#genre_control');
    let children = []
    genres_arr = [...genres].sort();
    for (let i = 0; i < genres_arr.length; i++){
        const inp = document.createElement("input")
        inp.setAttribute("type", "checkbox")
        inp.setAttribute("name", "checkbox")
        inp.setAttribute("value", genres_arr[i])
        const label = document.createElement("label")
        label.setAttribute("class", "form-control-checkbox")
        const container = document.createElement("div")
        container.setAttribute("class", "form_control_checkbox")
        label.appendChild(inp)
        label.appendChild(document.createTextNode(genres_arr[i]))
        container.appendChild(label)
        children.push(container)
    }
    div.append(...children)
}

const UNK_VALUE = "UNK"
// set the dimensions and margins of the graph
var margin = {top: 150, right: 80, bottom: 50, left: 70},
    width = 850 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;
    

var svg = d3.select("#my_dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

d3.json("static/data/songs_with_album_genre.json").then(data => {
    let selectedGenres = ["Deathcore", "Heavy Metal"]
    let selectedYear = [2008, 2010, 2011, UNK_VALUE]
    
    let allGenres = new Set()
    let years = new Set()
    let yearToGenre = {}
    let albumReleaseDateToGenre = {}
    let year = UNK_VALUE

    function createOrIncrease(object, year, genre){
        if (!object[year].hasOwnProperty(genre))
            object[year][genre] = 0
        object[year][genre]++
        return object
    }

    function computeYMax(data){
        maxPerYear = data.map(function (elt) {
            return Math.max(
                ...Object.keys(elt).filter(key => selectedGenres.includes(key))
                .map(goodKey => elt[goodKey])
            )
        })
    
        max = Math.max(...maxPerYear)
        if (max == 0)
            return 1
        if (Number.isFinite(max))
            return max
        else
            return 1
    }

    function filterGroupElt(object){
        return object.filter(elt => selectedYear.includes(elt["year"]))
    }

    function fillMissingResult(data, allGenres){
        genres = Array.from(allGenres)
        data.map(obj => {
            for (let i = 0; i < genres.length; i++){
                if (!obj.hasOwnProperty(genres[i]))
                    obj[genres[i]] = 0
            }
        })
        return data
    }

    function createOrUpdateLegend(selectedGenres){
        svg.selectAll(".legend").remove()

        yOffset = -15 * selectedGenres.length
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 40},${yOffset - 15})`);
    
        selectedGenres.forEach((subgroup, i) => {
            ySpacing = 15
            legend.append("rect")
                .attr("x", 0)
                .attr("y", i * ySpacing) // Space out legend items
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", color(subgroup));
            legend.append("text")
                .attr("x", 15)
                .attr("y", i * ySpacing + 9) // Align text with rectangles
                .text(subgroup)
                .style("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });
    }
      
    for (let i = 0; i < data.length; i++){
        year = UNK_VALUE
        releaseYear = UNK_VALUE
        albumReleaseDate = UNK_VALUE
        if (data[i].hasOwnProperty("releaseDate")){
            releaseYear = new Date(data[i]["releaseDate"][0]).getFullYear()
            year = releaseYear
        } else {
            if (data[i].hasOwnProperty("albumReleaseDate")){
                albumReleaseDate = Number(data[i]["albumReleaseDate"])
                year = albumReleaseDate
            }
        }
        // We create a new key with the year if not present
        if (!yearToGenre.hasOwnProperty(year)){
            yearToGenre[year] = {}
            yearToGenre[year]["year"] = year
            if (year != UNK_VALUE)
                years.add(year)
        }

        // We create a new key with the album release year if we didn't find a release year and if not present
        if (albumReleaseDate != UNK_VALUE && !yearToGenre.hasOwnProperty(albumReleaseDate)){
            albumReleaseDateToGenre[year] = {}
            albumReleaseDateToGenre[year]["year"] = year
        }


        if (data[i].hasOwnProperty("genres") || data[i].hasOwnProperty("albumGenre")){
            let genres = UNK_VALUE
            shouldGetGenreFromAlbum = false
            if(data[i].hasOwnProperty("genres")){
                genres = data[i]["genres"]
                if (Array.isArray(genres) && genres.length > 0)
                    shouldGetGenreFromAlbum = true
                if (typeof genres === "string" && genres.length > 0)
                    shouldGetGenreFromAlbum = true
            }
            if(data[i].hasOwnProperty("albumGenre") && !shouldGetGenreFromAlbum){
                genres = data[i]["albumGenre"]
            }
            if (typeof genres === "string" && genres.length > 0){
                allGenres.add(genres)
                createOrIncrease(yearToGenre, year, genres)
            } else{
                if (Array.isArray(genres) && genres.length > 0){
                    let genre = null;
                    for (let j = 0; j < genres.length; j++){
                        genre = genres[j]
                        allGenres.add(genre)
                        createOrIncrease(yearToGenre, year, genres)
        
                        // we update the number of song with this genre for this year
                        if (albumReleaseDate != UNK_VALUE && shouldGetGenreFromAlbum )
                            createOrIncrease(albumReleaseDateToGenre, year, genre)
                    }
                } else{
                    createOrIncrease(yearToGenre, year, UNK_VALUE)
                    allGenres.add(UNK_VALUE)
                }
            }
        } 
    }

    // Conversion of our object to the good form for d3js
    let yearAndGenre = Object.keys( yearToGenre ).sort(function( a, b ) {
        const yearA = data[a];
        const yearB = data[b];
        
        // Check if year is a string, prioritize strings to the start
        const isYearAString = typeof yearA === 'string';
        const isYearBString = typeof yearB === 'string';

        if (isYearAString && !isYearBString) return -1;
        if (!isYearAString && isYearBString) return 1;

        return yearA - yearB;
    }).map(function( sortedKey ) {
        return yearToGenre[ sortedKey ];
        // We remove object with only year attribute
    }).filter(obj => Object.keys(obj).length > 1);

    let albumReleaseYearGenre = Object.keys( albumReleaseDateToGenre ).sort(function( a, b ) {
        const yearA = data[a].year;
        const yearB = data[b].year;
        
        // Check if year is a string, prioritize strings to the start
        const isYearAString = typeof yearA === 'string';
        const isYearBString = typeof yearB === 'string';

        if (isYearAString && !isYearBString) return -1;
        if (!isYearAString && isYearBString) return 1;

        return yearA - yearB;
    }).map(function( sortedKey ) {
        return data[ sortedKey ];
    });

    yearAndGenre = fillMissingResult(yearAndGenre, allGenres)
    selectedYearAndGenre = filterGroupElt(yearAndGenre) 
    selectedAlbumReleaseYearGenre = filterGroupElt(albumReleaseYearGenre)

    ymax = computeYMax(selectedYearAndGenre)


    var x = d3.scaleBand()
        .domain(selectedYear)
        .range([0, width])
        .padding([0.2])
        
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x-axis")
        .call(d3.axisBottom(x).tickSize(0))
        .append("text")
        .attr("class", "axis-title")
        .attr("x", width/2)
        .attr("y", 40)
        .attr("fill", "black")
        .style("font-size", "14px")
        .text("Période (Année)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, ymax])
        .range([ height, 0 ]);
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -40)
        .attr("fill", "black")
        .style("font-size", "14px")
        .text("Fréquence");

     // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
        .domain(selectedGenres)
        .range([0, x.bandwidth()])
        .padding([0.05])

      // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(selectedGenres)
        .range(['#e41a1c',
            '#377eb8','#4daf4a', "#ff1414", "#c72b2e", "#fbdaf",
            "#a6e1ff", "#0f51b7", "#843ba1", "#439660", "#8b6744",
            "#c9cbce", "#b27569", "#ff7f00", "#981ade", "#f69087",
            "#e23512",
        ])

    // Show the bars
    svg.append("g")
        .attr("id", "graph")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(selectedYearAndGenre)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return selectedGenres.map(function(key) {return {key: key, value: d[key], year: d.year}; }); })
        .enter()
        .append("rect")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("data-legend", function(d) { return d.key})
        .attr("class", "bar")
        .attr("fill", function(d) { return color(d.key); })
        .on('mouseover', function(e, d) {
            d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d.key + ": " + d.value + " (" + d.year + ")")
        })
        .on('mouseout', function(e) {
            d3.select('#tooltip').style('opacity', 0)
        })
        .on('mousemove', function(e) {
            d3.select('#tooltip').style('left', (e.pageX+10) + 'px').style('top', (e.pageY+10) + 'px')
        })
        

    // Adding legend
    createOrUpdateLegend(selectedGenres)

    filterYears = Array.from(years).filter( key => isFinite(key) && key > 1800)
    minYear = Math.min(...filterYears)
    maxYear = Math.max(...filterYears)

    if (!isNaN(minYear) && !isNaN(maxYear)){
        
        // We update the filter for the possible years
        updateLimitSlider(minYear, maxYear, "from")
        updateLimitSlider(minYear, maxYear, "to")
    }

    // Add Genre filters
    addGenreFilters(allGenres)

    // A function that update the chart
    function updateSubGroup(subGroup) {
        selectedGenres = subGroup
        // Update the subgroups domain for the xSubgroup scale
        xSubgroup.domain(subGroup);

        ymax = computeYMax(selectedYearAndGenre)
        y.domain([0, ymax])

        svg.selectAll(".barGroup")
            .remove()
        
        graph = svg.selectAll("#graph")
            .selectAll("g")
            .data(selectedYearAndGenre)
            .enter()
            .append("g")
            .attr("class", "barGroup")
            .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return selectedGenres.map(function(key) {return {key: key, value: d[key], year: d.year}; }); })
            .enter().append("rect")
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("data-legend", function(d) { return d.key})
            .attr("class", "bar")
            .attr("fill", function(d) { return color(d.key); })
            .on('mouseover', function(e, d) {
                d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d.key + ": " + d.value + " (" + d.year + ")")
            })
            .on('mouseout', function(e) {
                d3.select('#tooltip').style('opacity', 0)
            })
            .on('mousemove', function(e) {
                d3.select('#tooltip').style('left', (e.pageX+10) + 'px').style('top', (e.pageY+10) + 'px')
            })


        // Update the x-axis
        svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(x));  // Redraw x-axis

        // Update the y-axis with the new scale
        svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y));
        
        createOrUpdateLegend(subGroup)
    }

    // Initial subgroups to display based on checked checkboxes
    let selectedSubgroups = Array.from(document.querySelectorAll('#genre_control .form-control-checkbox input:checked'))
    .map(cb => cb.value);

    // Function to handle checkbox changes
    function handleCheckboxChange() {
        // Get the currently checked checkboxes
        selectedSubgroups = Array.from(document.querySelectorAll('#genre_control .form-control-checkbox input:checked'))
        .map(cb => cb.value);
        // Update the chart with the selected subgroups
        updateSubGroup(selectedSubgroups);
    }

    // Add event listeners to each checkbox
    document.querySelectorAll('#genre_control .form-control-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // A function that update group of the chart
    function updateGroup() {
        selectedYear = []
        const fromSlider = document.querySelector('#fromSlider');
        const toSlider = document.querySelector('#toSlider');
        const fromInput = document.querySelector('#fromInput');
        const toInput = document.querySelector('#toInput');
        const addUnkCheckbox = document.querySelectorAll(".year_control .form_control_checkbox input:checked")
        let start = Number(fromSlider.value)
        let end = Number(toSlider.value)
        for (let j=start; j<=end; j++){
            selectedYear.push(j)
        }
        if (addUnkCheckbox.length > 0)
            selectedYear.push(addUnkCheckbox[0].value)
        
        // Update x scale domain with new group names
        x.domain(selectedYear);

        selectedYearAndGenre = filterGroupElt(yearAndGenre) 

        ymax = computeYMax(selectedYearAndGenre)
        y.domain([0, ymax])
        
        svg.selectAll(".barGroup")
            .remove()

        graph = svg.selectAll("#graph")
            .selectAll("g")
            .data(selectedYearAndGenre)
            .enter()
            .append("g")
            .attr("class", "barGroup")
            .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return selectedGenres.map(function(key) {return {key: key, value: d[key], year: d.year}; }); })
            .enter().append("rect")
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("data-legend", function(d) { return d.key})
            .attr("class", "bar")
            .attr("fill", function(d) { return color(d.key); })
            .on('mouseover', function(e, d) {
                d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d.key + ": " + d.value + " (" + d.year + ")")
            })
            .on('mouseout', function(e) {
                d3.select('#tooltip').style('opacity', 0)
            })
            .on('mousemove', function(e) {
                d3.select('#tooltip').style('left', (e.pageX+10) + 'px').style('top', (e.pageY+10) + 'px')
            })


        // Update the x-axis
        svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(x));  // Redraw x-axis

        // Update the y-axis with the new scale
        svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y));
        
        createOrUpdateLegend(selectedGenres)
    }

    // Add event listeners to checkbox representing unknown value for groups
    document.querySelectorAll('.year_control .form_control_checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', updateGroup);
    });

    document.querySelector('#fromSlider').addEventListener(
        'change', updateGroup
    );
    document.querySelector('#toSlider').addEventListener(
        'change', updateGroup
    );
    document.querySelector('#fromInput').addEventListener(
        'change', updateGroup
    );
    document.querySelector('#toInput').addEventListener(
        'change', updateGroup
    );

})