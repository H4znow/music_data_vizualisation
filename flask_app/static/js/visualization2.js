d3.json('/static/genre_listeners_sample.json').then(data => {
  const width = 800, height = 500, margin = { top: 20, right: 20, bottom: 50, left: 60 };

  const svg = d3.select("#visualization2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const xScale = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.2);
  const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  const xAxis = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
  const yAxis = svg.append("g").attr("transform", `translate(${margin.left},0)`);

  let currentYear = d3.min(data, d => d.year);
  const genres = Array.from(new Set(data.map(d => d.genre)));
  const years = Array.from(new Set(data.map(d => d.year)));

  // Populate year filter
  const yearFilter = d3.select("#yearFilter");
  yearFilter.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Populate genre filter with all options selected initially
  const genreFilter = d3.select("#genreFilter");
  genreFilter.selectAll("option")
    .data(genres)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d)
    .property("selected", true); // Set each genre option as selected initially

  // Get selected values from filters
  function getSelectedGenres() {
    return Array.from(genreFilter.node().selectedOptions, option => option.value);
  }

  function getSelectedYear() {
    return +yearFilter.node().value;
  }

  function update(year) {
    const selectedGenres = getSelectedGenres();
    const yearData = data.filter(d => d.year === year && selectedGenres.includes(d.genre));

    console.log("Year:", year);
    console.log("Selected Genres:", selectedGenres);
    console.log("Filtered Data:", yearData);

    xScale.domain(yearData.map(d => d.genre)); // Update xScale only for genres in yearData
    yScale.domain([0, d3.max(yearData, d => d.listeners)] || [0, 1]);

    xAxis.transition().call(d3.axisBottom(xScale));
    yAxis.transition().call(d3.axisLeft(yScale));

    svg.selectAll(".year-label").remove();
    svg.append("text")
      .attr("class", "year-label")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Year: ${year}`);

    const bars = svg.selectAll(".bar")
      .data(yearData, d => d.genre);

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.genre))
      .attr("y", yScale(0))
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .style("fill", "steelblue")
      .transition()
      .duration(1000)
      .attr("y", d => yScale(d.listeners))
      .attr("height", d => yScale(0) - yScale(d.listeners));

    bars.transition()
      .duration(1000)
      .attr("x", d => xScale(d.genre))
      .attr("y", d => yScale(d.listeners))
      .attr("width", xScale.bandwidth()) // Ensure bars adjust width correctly
      .attr("height", d => yScale(0) - yScale(d.listeners));

    bars.exit()
      .transition()
      .duration(1000)
      .attr("height", 0)
      .attr("y", yScale(0))
      .remove();
  }

  yearFilter.on("change", () => update(getSelectedYear()));
  genreFilter.on("change", () => update(getSelectedYear()));

  d3.interval(() => {
    const selectedYear = getSelectedYear();
    update(selectedYear);
    yearFilter.property("value", selectedYear < d3.max(years) ? selectedYear + 1 : d3.min(years));
  }, 2000);
});