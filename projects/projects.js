import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
fetchJSON('../lib/projects.json').then(projects => {
    const container = document.querySelector('.projects');
    renderProjects(projects, container, 'h2');

    const title = document.querySelector('.projects-title');
    title.textContent = `${projects.length} Projects`;

});

let searchInput = document.querySelector('.searchBar');
let selectedIndex = -1;
let pieData = [];

renderProjects(projects, projectsContainer, 'h2');

const svg = d3.select('svg');
const legend = d3.select('.legend');
const colors = d3.scaleOrdinal(d3.schemeTableau10);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

function getFilteredProjects() {
    const query = searchInput.value.toLowerCase();

    let filtered = projects.filter(p =>
        Object.values(p).join('\n').toLowerCase().includes(query)
    );

    if (selectedIndex !== -1 && pieData[selectedIndex]) {
        const selectedYear = pieData[selectedIndex].label;
        filtered = filtered.filter(p => p.year === selectedYear);
    }

    return filtered;
}



function renderPieChart(projectsGiven) {

  svg.selectAll('*').remove();
  legend.selectAll('*').remove();
  
  // re-calculate rolled data
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
    pieData = rolledData.map(([year, count]) => ({ value: count, label: year }));
    if (pieData.length === 0) return;

  // re-calculate slice generator, arc data, arc, etc.
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(pieData);
  let arcs = arcData.map((d) => arcGenerator(d));
  // TODO: clear up paths and legends


  // update paths and legends, refer to steps 1.4 and 2.2
  svg.selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', (d, i) => colors(i))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const i = arcData.indexOf(d);
        selectedIndex = selectedIndex === i ? -1 : i;

        svg.selectAll('path')
        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

        legend.selectAll('li')
        .attr('class', (_, idx) => idx === selectedIndex ? 'legend-item selected' : 'legend-item');

        const filtered = getFilteredProjects();
        renderProjects(filtered, projectsContainer, 'h2');

      }
      );


        

  pieData.forEach((d, idx) => {
      legend
          .append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item')
          .html(`<span class = "swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();

  if (query === '') {
        selectedIndex = -1;
    }

  const filtered = getFilteredProjects();


    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(filtered);
});



