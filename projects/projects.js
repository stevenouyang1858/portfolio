import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

fetchJSON('../lib/projects.json').then(projects => {
    const container = document.querySelector('.projects');
    renderProjects(projects, container, 'h2');

    const title = document.querySelector('.projects-title');
    title.textContent = `${projects.length} Projects`;

});




let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);


let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});


let colors = d3.scaleOrdinal(d3.schemeTableau10);

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
arcs.forEach((arc, idx) => {
    d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d,idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`)
        .attr('class', 'legend-item')
        .html(`<span class = "swatch"></span> ${d.label} <em>(${d.value})</em>`);
});


let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {

    query = event.target.value;

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
});






function renderPieChart(projectsGiven) {
    const svg = d3.select('#projects-pie-plot');
    const legend = d3.select('.legend');

  
    // re-calculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
  // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    // TODO: clear up paths and legends
    svg.selectAll('*').remove();
    legend.selectAll('*').remove();
    // update paths and legends, refer to steps 1.4 and 2.2
    svg.selectAll('path')
        .data(newArcs)
        .enter()
        .append('path')
        .attr('d', (d) => d)
        .attr('fill', (d, i) => colors(i));

    newData.forEach((d, idx) => {
        legend
            .append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class = "swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
});
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

let selectedIndex = -1;
let svg = d3.select('svg');
svg.selectAll('path').remove();
arcs.forEach((arc, i) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        svg
            .selectAll('path')
            .attr('class', (_, idx) => (
      // TODO: filter idx to find correct pie slice and apply CSS from above
        idx === selectedIndex ? 'selected' : null
    ));

    legend
    .selectAll('li')
    .attr('class', (_, idx) => (
      // TODO: filter idx to find correct legend and apply CSS from above
      idx === selectedIndex ? 'selected' : null)
    );

    if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
        } else {
        // TODO: filter projects and project them onto webpage
        // Hint: `.label` might be useful
            let year = data[selectedIndex].label;
            let filteredProjects = projects.filter((project) => project.year === year);
            renderProjects(filteredProjects, projectsContainer, 'h2');
        }
    });
});

