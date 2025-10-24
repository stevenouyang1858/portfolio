console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

let pages = [
    {url: 'index.html', title: 'Home' },
    {url: 'projects/', title: 'Projects' },
    {url: 'contact/', title: 'Contact' },
    {url: 'resume/', title: 'Resume'},
    {url: 'https://github.com/stevenouyang1858', title: 'GitHub'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);


for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !url.startsWith('http') ? BASE_PATH + url : url;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname,
        );
    }
    
    if (a.host !== location.host && a.pathname !== location.pathname) {
        a.target = "_blank"
    }

    nav.append(a);
}


document.body.insertAdjacentHTML(
    'afterbegin',
    `

            <label class = "color-scheme">
                Theme: 
                <select>
                    <option value = 'light dark'>Automatic</option>
                    <option value = 'light'>Light</option>
                    <option value = 'dark'>Dark</option>
                </select>
            </label>`,

)

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
        document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
        select.value = localStorage.colorScheme;
    }

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

const form = document.querySelector('form');
form?.addEventListener('submit', function(event) {
    
    event.preventDefault();
    const data = new FormData(form);
    const body = data.get('body') || '';

    const mailto = `mailto:hao.ouyang124@gmail.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;

    location.href = mailto;
});


export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    
    for (const pj of projects) {
        const article = document.createElement('article');
        
        const heading = document.createElement(headingLevel);
        heading.textContent = pj.title;

        const img = document.createElement('img');
        img.src = pj.image || '';
        img.alt = pj.title || '';

        const p = document.createElement('p');
        p.textContent = pj.description || '';

        article.appendChild(heading);
        article.appendChild(img);
        article.appendChild(p);

        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

