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
    if (slider_type == "from")
      slider = document.querySelector('#fromSlider');
    else
      slider = document.querySelector('#toSlider');
    slider.setAttribute("min", min)
    slider.setAttribute("max", max)
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
var margin = {top: 100, right: 30, bottom: 20, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    

var svg = d3.select("#my_dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

d3.json("../data/songs_final_saved.json").then(data => {
    let selectedGenres = ["Death Core", "Heavy Metal"]
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

    function computeYMax(){
        maxPerYear = yearAndGenre.map(function (elt) {
            return Math.max(
                ...Object.keys(elt).filter(key => selectedGenres.includes(key))
                .map(goodKey => elt[goodKey])
            )
        })
    
        return Math.max(...maxPerYear)
    }

    function filterGroupElt(object){
        return object.filter(elt => selectedYear.includes(elt["year"]))
    }

    function createOrUpdateLegend(selectedGenres){
        yOffset = -15 * selectedGenres.length
        const legend = svg.append("g")
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
            years.add(year)
        }

        // We create a new key with the album release year if we didn't find a release year and if not present
        if (albumReleaseDate != UNK_VALUE && !yearToGenre.hasOwnProperty(albumReleaseDate)){
            albumReleaseDateToGenre[year] = {}
            albumReleaseDateToGenre[year]["year"] = year
        }


        if (data[i].hasOwnProperty("genres")){
            let genres = data[i]["genres"]
            createOrIncrease(yearToGenre, year, UNK_VALUE)
            for (let j = 0; j < genres.length; j++){
                let genre = genres[j]
                if (genre.length === 0) 
                    continue
                allGenres.add(genre)
                createOrIncrease(yearToGenre, year, genre)

                // we update the number of song with this genre for this year
                if (albumReleaseDate != UNK_VALUE )
                    createOrIncrease(albumReleaseDateToGenre, year, genre)
            }
        } else{
            if (data[i].hasOwnProperty("albumGenre")){
                let genre = data[i]["albumGenre"]
                if (genre.length === 0) 
                    continue
                allGenres.add(genre)
                createOrIncrease(yearToGenre, year, genre)
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

    ymax = computeYMax()

    selectedYearAndGenre = filterGroupElt(yearAndGenre) 
    selectedAlbumReleaseYearGenre = filterGroupElt(albumReleaseYearGenre)

    var x = d3.scaleBand()
        .domain(selectedYear)
        .range([0, width])
        .padding([0.2])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, ymax])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

     // Another scale for subgroup position?
    var xSubgroup = d3.scaleBand()
        .domain(selectedGenres)
        .range([0, x.bandwidth()])
        .padding([0.05])

      // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(selectedGenres)
        .range(['#e41a1c','#377eb8','#4daf4a'])

    console.log("selectedYearAndGenre: ", selectedYearAndGenre)
    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(selectedYearAndGenre)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return selectedGenres.map(function(key) {return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("data-legend", function(d) { return d.key})
        .attr("fill", function(d) { return color(d.key); });

    // Adding legend
    createOrUpdateLegend(selectedGenres)

    minYear = Math.min(...years)
    maxYear = Math.max(...years)
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
        
        // Bind the new subgroup data to the bars
        const bars = svg.selectAll("g")
            .data(selectedYearAndGenre)  // Re-bind the data
            .join("g")   // Update existing groups
                .attr("transform", d => `translate(${x(d.year)},0)`)  // Position groups

        bars.selectAll("rect")
        .data(d => subGroup.map(key => ({ key: key, value: d[key] })))
        .join("rect")  // Update existing rects
            .transition().duration(500)  // Smooth transition
            .attr("x", d => xSubgroup(d.key))
            .attr("y", d => y(d.value))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key));

        ymax = computeYMax()
        y.domain([0, ymax]);
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
        let start = fromSlider.value
        let end = toSlider.value
        for (let j=start; j<=end; j++){
            selectedYear.push(j)
        }
        if (addUnkCheckbox.length > 0)
            selectedYear.push(addUnkCheckbox[0].value)
        
        // Update x scale domain with new group names
        x.domain(selectedYear);
        // Filter data to only include the new groups
        const filteredData = data.filter(d => selectedGenres.includes(d.year));
        
        // Bind the filtered data to group containers
        const bars = svg.selectAll("g.group")
            .data(filteredData, d => d.year);  // Use group name as key
        
        // Enter new group containers if there are additional groups
        const barsEnter = bars.enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x(d.year)}, 0)`);

        // Append rects for each subgroup within each group
        barsEnter.selectAll("rect")
        .data(d => selectedGenres.map(key => ({ key: key, value: d[key] || 0 })))
        .enter().append("rect")
            .attr("x", d => xSubgroup(d.key))
            .attr("y", d => y(d.value))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key));

        // Update existing bars (for existing groups)
        bars.attr("transform", d => `translate(${x(d.year)}, 0)`);

        bars.selectAll("rect")
        .data(d => selectedGenres.map(key => ({ key: key, value: d[key] || 0 })))
        .transition().duration(500)  // Smooth transition for updating values
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

        // Remove old groups
        bars.exit().remove();

        // Update the x-axis to match the new groups
        svg.select(".x-axis")
            .transition().duration(500)
            .call(d3.axisBottom(x));

        // Update the y-axis in case the data range has changed
        ymax = computeYMax()
        y.domain([0, ymax]);

        svg.select(".y-axis")
            .transition().duration(500)
            .call(d3.axisLeft(y));
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

})