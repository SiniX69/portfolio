const DATA = [
  ["data/profile.json", "profile"],
  ["data/skills.json", "skills"],
  ["data/projects.json", "projects"],
  ["data/experiences.json", "experiences"],
  ["data/certifications.json", "certifications"],
  ["data/competencies.json", "competencies"]
];

/* =========================
   CHARGEMENT DES DONNÉES
========================= */

async function loadData() {
  const out = {};

  for (const [url, key] of DATA) {
    try {
      const res = await fetch(`${url}?v=${Date.now()}`, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${url}`);
      }

      const text = await res.text();

      try {
        out[key] = JSON.parse(text);
      } catch (jsonError) {
        console.error(`JSON invalide dans ${url}`, jsonError);
        throw new Error(`JSON invalide dans ${url}`);
      }

    } catch (error) {
      console.error(`Erreur lors du chargement de ${url}`, error);
      throw error;
    }
  }

  return out;
}

/* =========================
   OUTILS
========================= */

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const tags = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map(x => `<span class="tag">${esc(x)}</span>`)
    .join("");

const byId = (id) => document.getElementById(id);

/* =========================
   RENDU PRINCIPAL
========================= */

function render(d) {

  /* =========================
     PROFIL
  ========================= */

  const p = d.profile || {};

  document.title = `${p.name || ""} — ${p.title || ""}`;

  if (byId("hero-title")) {
    byId("hero-title").innerHTML =
      `${esc(p.firstName || "")} <span>${esc(p.lastName || "")}</span>`;
  }

  if (byId("hero-role")) {
    byId("hero-role").textContent = p.title || "";
  }

  if (byId("hero-description")) {
    byId("hero-description").textContent = p.shortIntro || "";
  }

  if (byId("about-text")) {
    byId("about-text").textContent = p.about || "";
  }

  if (byId("contact-text")) {
    byId("contact-text").textContent = p.contactText || "";
  }

  /* =========================
     INFORMATIONS PROFIL
  ========================= */

  const facts = [
    ["Formation", p.education],
    ["Localisation", p.location],
    ["Objectif", p.goal],
    ["Disponibilité", p.availability]
  ];

  if (byId("profile-facts")) {
    byId("profile-facts").innerHTML = facts
      .filter(([a, b]) => b)
      .map(([a, b]) =>
        `<div class="fact">
          <b>${esc(a)}</b>
          <span>${esc(b)}</span>
        </div>`
      )
      .join("");
  }

  /* =========================
     LIENS
  ========================= */

  const links = [];

  if (p.github) {
    links.push(
      `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
    );
  }

  if (p.linkedin) {
    links.push(
      `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>`
    );
  }

  if (p.email) {
    links.push(
      `<a href="mailto:${esc(p.email)}">Email ↗</a>`
    );
  }

  if (byId("hero-links")) {
    byId("hero-links").innerHTML = links.join("");
  }

  /* =========================
     CV
  ========================= */

  const cv = byId("hero-cv");

  if (cv) {
    if (p.cv) {
      cv.href = p.cv;
      cv.target = "_blank";
      cv.rel = "noopener noreferrer";
    } else {
      cv.href = "#";
      cv.removeAttribute("target");
    }
  }

  /* =========================
     COMPÉTENCES
  ========================= */

  const skills = Array.isArray(d.skills) ? d.skills : [];

  if (byId("skills-grid")) {
    byId("skills-grid").innerHTML = skills.map(s => `
      <article class="skill-card reveal">
        <div class="skill-icon">${esc(s.icon || "")}</div>

        <h3>${esc(s.name || "")}</h3>

        <p>${esc(s.description || "")}</p>

        <div class="skill-tags">
          ${tags(s.items)}
        </div>
      </article>
    `).join("");
  }

  /* =========================
     PROJETS
  ========================= */

  const projects = Array.isArray(d.projects) ? d.projects : [];

  const cats = [
    "Tous",
    ...new Set(
      projects.flatMap(x =>
        Array.isArray(x.categories) ? x.categories : []
      )
    )
  ];

  if (byId("project-filters")) {
    byId("project-filters").innerHTML = cats.map((c, i) =>
      `<button
        class="filter ${i === 0 ? "active" : ""}"
        data-filter="${esc(c)}">
        ${esc(c)}
      </button>`
    ).join("");
  }

  const projectContainer = byId("projects-grid");

  const renderProjects = (filter) => {

    if (!projectContainer) return;

    const filteredProjects =
      filter === "Tous"
        ? projects
        : projects.filter(x =>
            (x.categories || []).includes(filter)
          );

    projectContainer.innerHTML = filteredProjects.map(x => `

      <article class="project-card reveal">

        <div class="project-top">
          <span>${esc(x.period || "")}</span>
          <span>${esc(x.type || "Projet")}</span>
        </div>

        ${
          x.location
            ? `<div class="project-location">
                ${esc(x.location)}
              </div>`
            : ""
        }

        <h3>${esc(x.title || "")}</h3>

        <p>${esc(x.summary || "")}</p>

        <div class="tags">
          ${tags(x.technologies)}
        </div>

        <div class="project-bottom">

          <span class="tag">
            ${esc((x.competencies || []).length)}
            compétence(s) BTS
          </span>

          ${
            x.document
              ? `<a
                  class="project-link"
                  href="${esc(x.document)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Voir les preuves ↗
                </a>`
              : ""
          }

        </div>

      </article>

    `).join("");

    observeReveals();
  };

  renderProjects("Tous");

  if (byId("project-filters")) {
    document
      .querySelectorAll(".filter")
      .forEach(btn => {

        btn.addEventListener("click", () => {

          document
            .querySelectorAll(".filter")
            .forEach(b =>
              b.classList.remove("active")
            );

          btn.classList.add("active");

          renderProjects(
            btn.dataset.filter
          );
        });

      });
  }

  /* =========================
     EXPÉRIENCES
  ========================= */

  const experiences =
    Array.isArray(d.experiences)
      ? d.experiences
      : [];

  if (byId("timeline")) {

    byId("timeline").innerHTML =
      experiences.map(x => {

        /*
          On accepte :
          organization
          OU
          company

          Cela évite que le portfolio
          casse si le JSON utilise "company".
        */

        const organization =
          x.organization ||
          x.company ||
          "";

        return `

          <article class="timeline-item reveal">

            <div class="timeline-date">
              ${esc(x.period || "")}
            </div>

            <h3>
              ${esc(x.title || "")}

              ${
                organization
                  ? `<span>· ${esc(organization)}</span>`
                  : ""
              }
            </h3>

            <p>
              ${esc(x.description || "")}
            </p>

            <div class="tags">
              ${tags(x.tags)}
            </div>

          </article>

        `;
      }).join("");
  }

  /* =========================
     CERTIFICATIONS
  ========================= */

  const certifications =
    Array.isArray(d.certifications)
      ? d.certifications
      : [];

  if (byId("certifications-grid")) {

    byId("certifications-grid").innerHTML =
      certifications.map(x => `

        <article class="cert-card reveal">

          <span class="cert-badge">
            ${esc(x.status || "")}
          </span>

          <h3>
            ${esc(x.name || "")}
          </h3>

          <p>
            ${esc(x.description || "")}
          </p>

          ${
            x.document
              ? `
                <a
                  href="${esc(x.document)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Ouvrir la preuve ↗
                </a>
              `
              : ""
          }

        </article>

      `).join("");
  }

  /* =========================
     COMPÉTENCES BTS
  ========================= */

  const competencies =
    Array.isArray(d.competencies)
      ? d.competencies
      : [];

  if (byId("competency-grid")) {

    byId("competency-grid").innerHTML =
      competencies.map(x => `

        <article class="competency reveal">

          <div class="competency-num">
            ${esc(String(x.number || "").padStart(2, "0"))}
          </div>

          <h3>
            ${esc(x.title || "")}
          </h3>

          <p>
            ${esc(x.description || "")}
          </p>

          <div class="tags">
            ${tags(x.evidence)}
          </div>

        </article>

      `).join("");
  }

  /* =========================
     CONTACT
  ========================= */

  const contact = [];

  if (p.email) {
    contact.push(
      `<a href="mailto:${esc(p.email)}">
        ✉ ${esc(p.email)}
      </a>`
    );
  }

  if (p.linkedin) {
    contact.push(
      `<a
        href="${esc(p.linkedin)}"
        target="_blank"
        rel="noopener noreferrer">
        in&nbsp;&nbsp; LinkedIn
      </a>`
    );
  }

  if (p.github) {
    contact.push(
      `<a
        href="${esc(p.github)}"
        target="_blank"
        rel="noopener noreferrer">
        ⌘ GitHub
      </a>`
    );
  }

  if (byId("contact-actions")) {
    byId("contact-actions").innerHTML =
      contact.join("");
  }

  /* =========================
     ANNÉE
  ========================= */

  if (byId("year")) {
    byId("year").textContent =
      new Date().getFullYear();
  }
}

/* =========================
   ANIMATIONS
========================= */

function observeReveals() {

  const elements =
    document.querySelectorAll(
      ".reveal:not(.visible)"
    );

  if (!elements.length) return;

  const io =
    new IntersectionObserver(
      entries => {

        entries.forEach(e => {

          if (e.isIntersecting) {

            e.target.classList.add(
              "visible"
            );

            io.unobserve(e.target);
          }

        });

      },
      {
        threshold: 0.08
      }
    );

  elements.forEach(el =>
    io.observe(el)
  );
}

/* =========================
   NAVIGATION
========================= */

function initNav() {

  const toggle =
    document.querySelector(".nav-toggle");

  const links =
    document.querySelector(".nav-links");

  if (toggle && links) {

    toggle.addEventListener(
      "click",
      () => {

        const open =
          links.classList.toggle("open");

        toggle.setAttribute(
          "aria-expanded",
          String(open)
        );

      }
    );

    links
      .querySelectorAll("a")
      .forEach(a => {

        a.addEventListener(
          "click",
          () =>
            links.classList.remove("open")
        );

      });
  }

  /* =========================
     BARRE DE PROGRESSION
  ========================= */

  const progress =
    document.querySelector(".progress");

  if (progress) {

    const updateProgress = () => {

      const h =
        document.documentElement;

      const max =
        h.scrollHeight -
        h.clientHeight;

      const percentage =
        max > 0
          ? (h.scrollTop / max) * 100
          : 0;

      progress.style.width =
        `${percentage}%`;
    };

    window.addEventListener(
      "scroll",
      updateProgress
    );

    updateProgress();
  }
}

/* =========================
   LANCEMENT
========================= */

async function init() {

  try {

    console.log(
      "Chargement du portfolio..."
    );

    const data =
      await loadData();

    console.log(
      "Données chargées :",
      data
    );

    render(data);

    initNav();

    observeReveals();

    console.log(
      "Portfolio chargé avec succès."
    );

  } catch (err) {

    console.error(
      "ERREUR PORTFOLIO :",
      err
    );

    const heroDescription =
      byId("hero-description");

    if (heroDescription) {

      heroDescription.textContent =
        "Une erreur est survenue lors du chargement des données du portfolio. Consulte la console du navigateur pour plus d'informations.";
    }
  }
}

init();
