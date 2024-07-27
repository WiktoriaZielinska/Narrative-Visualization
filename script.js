const widthScatter = 3000;
const heightScatter = 800;
const marginScatter = { top: 20, right: 150, bottom: 200, left: 150 };

const svgWidthScatter = widthScatter + marginScatter.left + marginScatter.right;
const svgHeightScatter = heightScatter + marginScatter.top + marginScatter.bottom;

const widthDiseaseScatter = 1500;
const heightDiseaseScatter = 1000;
const marginDiseaseScatter = { top: 20, right: 30, bottom: 200, left: 150 };
const svgWidthDiseaseScatter = widthDiseaseScatter + marginDiseaseScatter.left + marginDiseaseScatter.right;
const svgHeightDiseaseScatter = heightDiseaseScatter + marginDiseaseScatter.top + marginDiseaseScatter.bottom;

const widthDiseaseCountryScatter = 2250;
const heightDiseaseCountryScatter = 1000;
const marginDiseaseCountryScatter = { top: 20, right: 150, bottom: 200, left: 700 };
const svgWidthDiseaseCountryScatter = widthDiseaseCountryScatter + marginDiseaseCountryScatter.left + marginDiseaseCountryScatter.right;
const svgHeightDiseaseCountryScatter = heightDiseaseCountryScatter + marginDiseaseCountryScatter.top + marginDiseaseCountryScatter.bottom;

let data = [];
let countries = [];
let diseases = [];
let currentSlide = 0;
let selectedCountry = '';
let selectedDisease = ''; // To keep track of selected disease

// Load the data
d3.csv("data.csv").then(loadedData => {
  data = loadedData.map(d => ({
    country: d["Country/Terrain"],
    causes: [
      { cause: "Acute hepatitis", deaths: +d["Acute hepatitis"] },
      { cause: "Alcohol use disorders", deaths: +d["Alcohol use disorders"] },
      { cause: "Alzheimer's/dementias", deaths: +d["Alzheimer's/dementias"] },
      { cause: "Cardiovascular diseases", deaths: +d["Cardiovascular diseases"] },
      { cause: "Conflict/terrorism", deaths: +d["Conflict/terrorismum"] },
      { cause: "Diabetes", deaths: +d["Diabetes"] },
      { cause: "Diarrheal diseases", deaths: +d["Diarrheal diseases"] },
      { cause: "Digestive diseases", deaths: +d["Digestive diseases"] },
      { cause: "Drowning", deaths: +d["Drowning"] },
      { cause: "Tuberculosis", deaths: +d["Tuberculosis"] },
      { cause: "Terrorism (deaths)", deaths: +d["Terrorism (deaths)"] },
      { cause: "Self-harm", deaths: +d["Self-harm"] },
      { cause: "Respiratory diseases", deaths: +d["respiratory diseaseses"] },
      { cause: "Protein-energy malnutrition", deaths: +d["Protein-energy malnutrition"] },
      { cause: "Road injuries", deaths: +d["Road injuries"] },
      { cause: "Poisonings", deaths: +d["Poisonings"] },
      { cause: "Parkinson", deaths: +d["Parkinson"] },
      { cause: "Nutritional deficiencies", deaths: +d["Nutritional deficiencies"] },
      { cause: "Neonatal disorders", deaths: +d["Neonatal disorders"] },
      { cause: "Fire/hot substances", deaths: +d["Fire/hot substances"] },
      { cause: "Neoplasms", deaths: +d["Neoplasms"] },
      { cause: "Meningitis", deaths: +d["Meningitis"] },
      { cause: "Maternal disorders", deaths: +d["Maternal disorders"] },
      { cause: "Malaria", deaths: +d["Malaria"] },
      { cause: "HIV/AIDS", deaths: +d["HIV/AIDS"] },
      { cause: "Drug use disorders", deaths: +d["Drug use disorders"] },
      { cause: "Environmental heat and cold exposure", deaths: +d["Environmental heat and cold exposure"] },
      { cause: "Exposure of nature", deaths: +d["Exposure of nature"] },
      { cause: "Lower respiratory infections", deaths: +d["Lower respiratory infectionses"] },
      { cause: "Liver diseases", deaths: +d["liver diseases"] },
      { cause: "Kidney disease", deaths: +d["kidney disease"] },
      { cause: "Interpersonal violence", deaths: +d["Interpersonal violence"] }
    ]
  }));

  // Populate disease list slide
  const diseaseList = d3.select("#disease-list");
  diseases = data[0].causes.map(cause => cause.cause);
  diseaseList.selectAll("li")
    .data(diseases)
    .enter().append("li")
    .text(d => d);

  // Populate country dropdown for interactive slide
  countries = [...new Set(data.map(d => d.country))];
  const countrySelect = d3.select("#country-select")
    .selectAll("option")
    .data(["", ...countries])
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d || "Select a country");

  // Populate disease dropdown for selection slide with placeholder option
  const diseaseSelect = d3.select("#disease-select");
  diseaseSelect.selectAll("option")
    .data(["", ...diseases])
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d || "Select a disease");

  // Setup event listeners for navigation
  d3.select("#prev").on("click", () => changeSlide(-1));
  d3.select("#next").on("click", () => changeSlide(1));

  // Event listener for country select dropdown
  d3.select("#country-select").on("change", function() {
    selectedCountry = this.value;
    renderCountryDiseaseScatterPlot(selectedCountry);
  });

  // Event listener for disease select dropdown
  diseaseSelect.on("change", function() {
    selectedDisease = this.value; // Update selected disease
    if (selectedDisease) {
      renderDiseaseCountryScatterPlot(selectedDisease);
    }
  });

  // Initial render of general scatter plot and disease scatter plot
  renderScatterPlot();
  renderDiseaseScatterPlot();
});

function renderScatterPlot() {
    const svg = d3.select("#countries-chart").append("svg")
      .attr("width", svgWidthScatter)
      .attr("height", svgHeightScatter)
      .append("g")
      .attr("transform", `translate(${marginScatter.left},${marginScatter.top})`);
  
    const x = d3.scaleBand()
      .domain(countries)
      .range([0, widthScatter])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.causes, c => c.deaths))])
      .nice()
      .range([heightScatter, 0]);
  
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.country))
      .attr("y", d => y(d3.max(d.causes, c => c.deaths)))
      .attr("width", x.bandwidth())
      .attr("height", d => heightScatter - y(d3.max(d.causes, c => c.deaths)))
      .on("mouseover", (event, d) => {
        d3.select(".tooltip")
          .style("display", "block")
          .html(`Country: ${d.country}<br>Total Number of Deaths for the Most Common Disease: ${d3.max(d.causes, c => c.deaths)}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        d3.select(".tooltip").style("display", "none");
      });
  
    // Annotations for China and India
    const annotationData = [
      { country: "China", x: x("China") + x.bandwidth() / 2, y: y(d3.max(data.find(d => d.country === "China").causes, c => c.deaths)) },
      { country: "India", x: x("India") + x.bandwidth() / 2, y: y(d3.max(data.find(d => d.country === "India").causes, c => c.deaths)) },
      { country: "Russia", x: x("Russia") + x.bandwidth() / 2, y: y(d3.max(data.find(d => d.country === "Russia").causes, c => c.deaths)) },
      { country: "United States", x: x("United States") + x.bandwidth() / 2, y: y(d3.max(data.find(d => d.country === "United States").causes, c => c.deaths)) }

    ];
  
    svg.selectAll(".annotation")
      .data(annotationData)
      .enter().append("text")
      .attr("class", "annotation")
      .attr("x", d => d.x + 10)
      .attr("y", d => d.y - 10)
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text(d => `Country: ${d.country}`);
  
    svg.selectAll(".annotation-line")
      .data(annotationData)
      .enter().append("line")
      .attr("class", "annotation-line")
      .attr("x1", d => d.x)
      .attr("y1", d => d.y)
      .attr("x2", d => d.x + 10)
      .attr("y2", d => d.y - 10)
      .attr("stroke", "black");
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${heightScatter})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .attr("dx", "-0.8em")
      .attr("dy", "0.5em");
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  }

function renderDiseaseScatterPlot() {
  const svg = d3.select("#disease-country-chart").append("svg")
    .attr("width", svgWidthDiseaseScatter)
    .attr("height", svgHeightDiseaseScatter)
    .append("g")
    .attr("transform", `translate(${marginDiseaseScatter.left},${marginDiseaseScatter.top})`);

  const x = d3.scaleBand()
    .domain(diseases)
    .range([0, widthDiseaseScatter])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.flatMap(d => d.causes.map(c => c.deaths)))])
    .nice()
    .range([heightDiseaseScatter, 0]);

  svg.selectAll(".bar")
    .data(diseases)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d))
    .attr("y", d => y(d3.max(data.flatMap(dd => dd.causes.filter(c => c.cause === d)), c => c.deaths)))
    .attr("width", x.bandwidth())
    .attr("height", d => heightDiseaseScatter - y(d3.max(data.flatMap(dd => dd.causes.filter(c => c.cause === d)), c => c.deaths)))
    .on("mouseover", (event, d) => {
      d3.select(".tooltip")
        .style("display", "block")
        .html(`Disease: ${d}<br>Max Deaths: ${d3.max(data.flatMap(dd => dd.causes.filter(c => c.cause === d)), c => c.deaths)}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      d3.select(".tooltip").style("display", "none");
    });

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${heightDiseaseScatter})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .attr("dx", "-0.8em")
    .attr("dy", "0.5em");

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
}

function renderCountryDiseaseScatterPlot(country) {
  if (!country) {
    d3.select("#country-disease-chart").selectAll("*").remove();
    return;
  }

  const countryData = data.find(d => d.country === country).causes;

  const svg = d3.select("#country-disease-chart").append("svg")
    .attr("width", svgWidthDiseaseScatter)
    .attr("height", svgHeightDiseaseScatter)
    .append("g")
    .attr("transform", `translate(${marginDiseaseScatter.left},${marginDiseaseScatter.top})`);

  const x = d3.scaleBand()
    .domain(countryData.map(d => d.cause))
    .range([0, widthDiseaseScatter])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(countryData, d => d.deaths)])
    .nice()
    .range([heightDiseaseScatter, 0]);

  svg.selectAll(".bar")
    .data(countryData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.cause))
    .attr("y", d => y(d.deaths))
    .attr("width", x.bandwidth())
    .attr("height", d => heightDiseaseScatter - y(d.deaths))
    .on("mouseover", (event, d) => {
      d3.select(".tooltip")
        .style("display", "block")
        .html(`Cause: ${d.cause}<br>Deaths: ${d.deaths}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      d3.select(".tooltip").style("display", "none");
    });

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${heightDiseaseScatter})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .attr("dx", "-0.8em")
    .attr("dy", "0.5em");

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
}

function renderDiseaseSelectionSlide() {
  const diseaseSelect = d3.select("#disease-select");
  diseaseSelect.selectAll("option")
    .data(["", ...diseases])
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d || "Select a disease");

  diseaseSelect.on("change", function() {
    selectedDisease = this.value; // Update selected disease
    if (selectedDisease) {
      renderDiseaseCountryScatterPlot(selectedDisease);
    }
  });
}

function renderDiseaseCountryScatterPlot(disease) {
    if (!disease) {
      d3.select("#disease-country-chart").selectAll("*").remove();
      return;
    }
  
    const diseaseData = data.flatMap(d => d.causes
      .filter(cause => cause.cause === disease)
      .map(cause => ({
        country: d.country,
        cause: cause.cause,
        deaths: cause.deaths
      }))
    );
  
    d3.select("#disease-country-chart").selectAll("*").remove();
  
    const svg = d3.select("#disease-country-chart").append("svg")
      .attr("width", svgWidthDiseaseCountryScatter)
      .attr("height", svgHeightDiseaseCountryScatter)
      .append("g")
      .attr("transform", `translate(${marginDiseaseCountryScatter.left},${marginDiseaseCountryScatter.top})`);
  
    const x = d3.scaleBand()
      .domain(diseaseData.map(d => d.country))
      .range([0, widthDiseaseCountryScatter])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(diseaseData, d => d.deaths)])
      .nice()
      .range([heightDiseaseCountryScatter, 0]);
  
    svg.selectAll(".bar")
      .data(diseaseData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.country))
      .attr("y", d => y(d.deaths))
      .attr("width", x.bandwidth())
      .attr("height", d => heightDiseaseCountryScatter - y(d.deaths))
      .on("mouseover", (event, d) => {
        d3.select(".tooltip")
          .style("display", "block")
          .html(`Country: ${d.country}<br>Deaths: ${d.deaths}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        d3.select(".tooltip").style("display", "none");
      });
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${heightDiseaseCountryScatter})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .attr("dx", "-0.8em")
      .attr("dy", "0.5em");
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  }
  

function changeSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  slides[currentSlide].style.display = 'none';
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].style.display = 'block';

  // Render charts only when on the respective slides
  if (currentSlide === 1 && selectedDisease) {
    renderDiseaseCountryScatterPlot(selectedDisease);
  } else if (currentSlide === 2) {
    renderDiseaseSelectionSlide();
  }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.slide')[currentSlide].style.display = 'block';
});
