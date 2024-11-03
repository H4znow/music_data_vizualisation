d3.json('/static/genre_listeners_sample.json').then(data => {
  // Dimensions and margins
  const width = 800, height = 500, margin = { top: 20, right: 20, bottom: 50, left: 60 };

  // SVG container with responsive settings
  const svg = d3.select("#visualization2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Define scales
  const xScale = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top]);

  // X and Y axes
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`);
  
  const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`);

  // Filter data by year
  let currentYear = d3.min(data, d => d.year);
  const genres = Array.from(new Set(data.map(d => d.genre)));

  function update(year) {
    const yearData = data.filter(d => d.year === year);
    
    xScale.domain(genres);
    yScale.domain([0, d3.max(yearData, d => d.listeners)]);

    xAxis.transition().call(d3.axisBottom(xScale));
    yAxis.transition().call(d3.axisLeft(yScale));

    // Display current year
    svg.selectAll(".year-label").remove();
    svg.append("text")
      .attr("class", "year-label")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Year: ${year}`);

    // Bind data and update bars
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
      .attr("height", d => yScale(0) - yScale(d.listeners));

    bars.exit()
      .transition()
      .duration(1000)
      .attr("height", 0)
      .attr("y", yScale(0))
      .remove();
  }

  // Animation loop for updating the chart each year
  d3.interval(() => {
    update(currentYear);
    currentYear = currentYear < d3.max(data, d => d.year) ? currentYear + 1 : d3.min(data, d => d.year);
  }, 2000); // 2000 ms = 2 seconds for each year update
});