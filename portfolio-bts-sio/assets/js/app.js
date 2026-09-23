const DATA = [
  ["data/profile.json", "profile"],
  ["data/skills.json", "skills"],
  ["data/projects.json", "projects"],
  ["data/experiences.json", "experiences"],
  ["data/certifications.json", "certifications"],
  ["data/competencies.json", "competencies"]
];

async function loadData() {
  const out = {};
  await Promise.all(DATA.map(async ([url, key]) => {
    const res = await fetch(url + "?v=" + Date.now());
    if (!res.ok) throw new Error(`Impossible de charger ${url}`);
    out[key] = await res.json();
  }));
  return out;
}

const esc = (value="") => String(value)
  .replaceAll("&","&amp;").replaceAll("<","&lt;")
  .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

const tags = arr => (arr || []).map(x => `<span class="tag">${esc(x)}</span>`).join("");

function render(d) {
  const p = d.profile;
  document.title = `${p.name} — ${p.title}`;
  document.getElementById("hero-title").innerHTML = `${esc(p.firstName)} <span>${esc(p.lastName)}</span>`;
  document.getElementById("hero-role").textContent = p.title;
  document.getElementById("hero-description").textContent = p.shortIntro;
  document.getElementById("about-text").textContent = p.about;
  document.getElementById("contact-text").textContent = p.contactText;

  const facts = [
    ["Formation", p.education],
    ["Localisation", p.location],
    ["Objectif", p.goal],
    ["Disponibilité", p.availability]
  ];
  document.getElementById("profile-facts").innerHTML = facts.map(([a,b]) =>
    `<div class="fact"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("");

  const links = [];
  if (p.github) links.push(`<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>`);
  if (p.linkedin) links.push(`<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>`);
  if (p.email) links.push(`<a href="mailto:${esc(p.email)}">Email ↗</a>`);
  document.getElementById("hero-links").innerHTML = links.join("");
  const cv = document.getElementById("hero-cv");
  cv.href = p.cv || "#";

  document.getElementById("skills-grid").innerHTML = d.skills.map(s => `
    <article class="skill-card reveal">
      <div class="skill-icon">${esc(s.icon)}</div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.description)}</p>
      <div class="skill-tags">${tags(s.items)}</div>
    </article>`).join("");

  const cats = ["Tous", ...new Set(d.projects.flatMap(x => x.categories || []))];
  document.getElementById("project-filters").innerHTML = cats.map((c,i) =>
    `<button class="filter ${i===0?"active":""}" data-filter="${esc(c)}">${esc(c)}</button>`).join("");

  const projectContainer = document.getElementById("projects-grid");
  const renderProjects = filter => {
    const projects = filter === "Tous" ? d.projects : d.projects.filter(x => (x.categories||[]).includes(filter));
    projectContainer.innerHTML = projects.map(x => `
      <article class="project-card reveal">
        <div class="project-top"><span>${esc(x.period)}</span><span>${esc(x.type || "Projet")}</span></div>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.summary)}</p>
        <div class="tags">${tags(x.technologies)}</div>
        <div class="project-bottom">
          <span class="tag">${esc((x.competencies||[]).length)} compétence(s) BTS</span>
          ${x.document ? `<a class="project-link" href="${esc(x.document)}" target="_blank">Voir les preuves ↗</a>` : ""}
        </div>
      </article>`).join("");
    observeReveals();
  };
  renderProjects("Tous");
  document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.filter);
  }));

  document.getElementById("timeline").innerHTML = d.experiences.map(x => `
    <article class="timeline-item reveal">
      <div class="timeline-date">${esc(x.period)}</div>
      <h3>${esc(x.title)} <span>· ${esc(x.organization)}</span></h3>
      <p>${esc(x.description)}</p>
      <div class="tags">${tags(x.tags)}</div>
    </article>`).join("");

  document.getElementById("certifications-grid").innerHTML = d.certifications.map(x => `
    <article class="cert-card reveal">
      <span class="cert-badge">${esc(x.status)}</span>
      <h3>${esc(x.name)}</h3>
      <p>${esc(x.description)}</p>
      ${x.document ? `<a href="${esc(x.document)}" target="_blank">Ouvrir la preuve ↗</a>` : ""}
    </article>`).join("");

  document.getElementById("competency-grid").innerHTML = d.competencies.map(x => `
    <article class="competency reveal">
      <div class="competency-num">0${esc(x.number)}</div>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.description)}</p>
      <div class="tags">${tags(x.evidence)}</div>
    </article>`).join("");

  const contact = [];
  if (p.email) contact.push(`<a href="mailto:${esc(p.email)}">✉ ${esc(p.email)}</a>`);
  if (p.linkedin) contact.push(`<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">in&nbsp;&nbsp; LinkedIn</a>`);
  if (p.github) contact.push(`<a href="${esc(p.github)}" target="_blank" rel="noopener">⌘ GitHub</a>`);
  document.getElementById("contact-actions").innerHTML = contact.join("");
  document.getElementById("year").textContent = new Date().getFullYear();
}

function observeReveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }});
  }, {threshold:.08});
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => io.observe(el));
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    document.querySelector(".progress").style.width = `${(h.scrollTop / (h.scrollHeight-h.clientHeight))*100}%`;
  });
}

loadData().then(render).then(() => { initNav(); observeReveals(); })
  .catch(err => {
    console.error(err);
    document.getElementById("hero-description").textContent = "Le contenu du portfolio n’a pas pu être chargé.";
  });
