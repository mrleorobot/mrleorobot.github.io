import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = resolve(root, "index.html");
const data = JSON.parse(await readFile(resolve(root, "projects.json"), "utf8"));

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://mrleorobot.github.io/#person",
      name: "Leonilson Souza",
      jobTitle: "Desenvolvedor Front-end e Designer de Interfaces",
      url: "https://mrleorobot.github.io/",
      sameAs: [
        "https://github.com/mrleorobot",
        "https://www.linkedin.com/in/leonilsonsouza/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://mrleorobot.github.io/#website",
      url: "https://mrleorobot.github.io/",
      name: "Leonilson Souza - Portfólio",
      inLanguage: "pt-BR",
      author: { "@id": "https://mrleorobot.github.io/#person" }
    },
    {
      "@type": "ItemList",
      "@id": "https://mrleorobot.github.io/#projetos",
      name: "Projetos de Front-end e Design de Interfaces",
      numberOfItems: data.projects.length,
      itemListElement: data.projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          ...(project.image ? { image: new URL(project.image.replace(/^\.\//, ""), data.source).href } : {}),
          url: project.url,
          keywords: project.technologies.join(", "),
          creator: { "@id": "https://mrleorobot.github.io/#person" }
        }
      }))
    }
  ]
};

const card = (project, index) => {
  const tier = ["case", "experimental", "archive"].includes(project.tier) ? project.tier : "archive";
  const tierClass = tier === "archive" ? "project-card--archive" : "project-card--featured";
  const titleId = `projeto-${project.id}-titulo`;
  const descriptionId = `projeto-${project.id}-descricao`;
  const statusLabel = tier === "case"
    ? "Case selecionado"
    : tier === "experimental"
      ? "Experimento selecionado"
      : "Projeto ao vivo";
  const tech = project.technologies.map((item, techIndex) =>
    `<span class="project-card__tech-tag${techIndex === project.technologies.length - 1 ? " project-card__tech-tag--accent" : ""}">${escapeHtml(item)}</span>`
  ).join("\n                    ");

  const media = project.image
    ? `<div class="project-thumbnail-wrapper" title="Ampliar imagem" role="button" tabindex="0" aria-label="Ampliar: ${escapeHtml(project.imageAlt)}">
                    <span class="project-case__status"><span aria-hidden="true"></span> ${statusLabel}</span>
                    <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}" class="project-lightbox-trigger project-thumbnail-image" loading="lazy" width="800" height="500" decoding="async" />
                    <div class="project-thumbnail-overlay" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </div>
                  </div>`
    : `<span class="project-case__status"><span aria-hidden="true"></span> ${statusLabel}</span>
                  <div class="project-card__placeholder"><span class="project-card__placeholder-name">${escapeHtml(project.title)}</span></div>`;

  const brief = tier !== "archive" && project.challenge && project.delivery
    ? `<dl class="project-card__brief" aria-label="Resumo do problema e da entrega">
                    <div>
                      <dt>Problema</dt>
                      <dd>${escapeHtml(project.challenge)}</dd>
                    </div>
                    <div>
                      <dt>Entrega</dt>
                      <dd>${escapeHtml(project.delivery)}</dd>
                    </div>
                  </dl>`
    : "";

  const actions = project.caseUrl
    ? `<div class="project-card__actions">
                    <a href="${escapeHtml(project.caseUrl)}" class="project-card__cta btn-arcane btn-motion motion-shine" aria-label="Ler case do projeto ${escapeHtml(project.title)}">
                      <span>Ver case</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                    <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="project-card__live-link" aria-label="Abrir projeto ${escapeHtml(project.title)} ao vivo">Ao vivo <span aria-hidden="true">↗</span></a>
                  </div>`
    : `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="project-card__cta btn-arcane btn-motion motion-shine" aria-label="Abrir projeto ${escapeHtml(project.title)} ao vivo">
                    <span>Abrir projeto</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>`;

  return `              <article class="project-card project-case ${tierClass} reveal-item stagger-${index % 3 + 1}" id="projeto-${escapeHtml(project.id)}" data-project-id="${escapeHtml(project.id)}" data-project-tier="${tier}" data-case-status="live" role="listitem" aria-labelledby="${titleId}" aria-describedby="${descriptionId}">
                <div class="project-card__media">
                  ${media}
                </div>
                <div class="project-card__body">
                  <div class="project-card__tech">${tech}</div>
                  <p class="project-case__role">${escapeHtml(project.role)}</p>
                  <h3 class="project-card__title" id="${titleId}">${escapeHtml(project.title)}</h3>
                  <p class="project-card__desc" id="${descriptionId}">${escapeHtml(project.summary)}</p>
${brief ? `                  ${brief}\n` : ""}
                  ${actions}
                </div>
              </article>`;
};

let html = await readFile(indexPath, "utf8");
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n    </script>`
);

const projectsStart = html.includes("          <!-- Vitrine editorial gerada de projects.json -->")
  ? "          <!-- Vitrine editorial gerada de projects.json -->"
  : "          <!-- Vitrine editorial: 4 projetos reais -->";
const projectsEnd = "          <div class=\"swipe-dots\"";
const startIndex = html.indexOf(projectsStart);
const endIndex = html.indexOf(projectsEnd, startIndex);
if (startIndex < 0 || endIndex < 0) throw new Error("Marcadores da vitrine de projetos não encontrados.");

const projectMarkup = `          <!-- Vitrine editorial gerada de projects.json -->
          <div class="projects-track" id="projects-track">
            <div class="projects-viewport" id="projects-viewport" role="list">
${data.projects.map(card).join("\n")}
            </div>
          </div>
`;

html = html.slice(0, startIndex) + projectMarkup + html.slice(endIndex);
await writeFile(indexPath, html, "utf8");
console.log(`Sincronizados ${data.projects.length} cases em index.html.`);
