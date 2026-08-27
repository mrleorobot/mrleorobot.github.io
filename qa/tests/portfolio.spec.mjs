import { expect, test } from "@playwright/test";

const sectionOrder = ["hero", "sobre", "projetos", "projetos-design", "tech-stack", "game-dev", "soft-skills", "faq", "cta-final"];
const editorialTitles = [
  "#sobre .trajectory-header__title",
  "#projetos .projects-header__title",
  "#projetos-design .ux-header__title",
  "#tech-stack .tech-header__title",
  "#soft-skills .alumni-header__title",
  "#faq .faq-header__title"
];

async function waitForPortfolio(page) {
  await page.waitForFunction(() => {
    const loaderReleased = !document.body.classList.contains("loading-locked");
    const controllerReleased = !window.PortfolioScrollLock || !window.PortfolioScrollLock.isLocked();
    return loaderReleased && controllerReleased;
  }, undefined, { timeout: 20_000 });
  await expect(page.locator("#hero .hero-editorial__name")).toBeVisible();
}

test("preserva o contrato visual, o conteúdo e a rolagem", async ({ page }, testInfo) => {
  const pageErrors = [];
  const sameOriginFailures = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin === "http://127.0.0.1:4173" && response.status() >= 400) {
      sameOriginFailures.push(`${response.status()} ${url.pathname}`);
    }
  });

  // Mantém a captura completa determinística e prova que a alternativa sem
  // movimento nunca depende dos observers para exibir o conteúdo.
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForPortfolio(page);

  await expect(page.locator('link[rel="stylesheet"][href*="portfolio.css"]')).toHaveCount(1);
  await expect(page.locator('link[rel="stylesheet"][href^="./"]:not([href*="portfolio.css"])')).toHaveCount(0);
  const sourceMarkup = await page.evaluate(async () => {
    const response = await fetch("./index.html", { cache: "no-store" });
    return response.text();
  });
  expect(sourceMarkup).toContain('id="cinematic-loader"');
  expect(sourceMarkup).toContain('id="loader-stars-canvas"');
  await expect(page.locator("#hero canvas#hero-ink-canvas")).toHaveCount(1);

  const renderedOrder = await page.locator("main section[id]").evaluateAll((sections) =>
    sections.map((section) => section.id).filter((id) =>
      ["hero", "sobre", "projetos", "projetos-design", "tech-stack", "game-dev", "soft-skills", "faq", "cta-final"].includes(id)
    )
  );
  expect(renderedOrder).toEqual(sectionOrder);

  const heroFontSize = await page.locator("#hero .hero-editorial__name").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize)
  );
  expect(heroFontSize).toBeGreaterThan(testInfo.project.name.startsWith("mobile") ? 34 : 64);

  for (const selector of editorialTitles) {
    const title = page.locator(selector);
    await expect(title).toBeVisible();
    const fontSize = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(fontSize, selector).toBeGreaterThanOrEqual(48);
  }

  const protectedTextSelectors = [
    "#hero .hero-editorial__name",
    ...editorialTitles,
    "#game-dev .gamedev-hud-header h2",
    "#cta-final .footer-giant-title",
    ".site-footer .footer-brand__name"
  ];
  const textLayoutProblems = await page.locator(protectedTextSelectors.join(",")).evaluateAll((elements) =>
    elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const clipsX = ["hidden", "clip"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
      const clipsY = ["hidden", "clip"].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
      const leavesViewport = rect.left < -1 || rect.right > window.innerWidth + 1;
      return clipsX || clipsY || leavesViewport
        ? [{ selector: element.matches("#hero .hero-editorial__name") ? "hero-name" : element.className, clipsX, clipsY, leavesViewport }]
        : [];
    })
  );
  expect(textLayoutProblems).toEqual([]);

  const sectionRhythmProblems = await page.locator("main section[id]").evaluateAll((sections) =>
    sections.flatMap((section) => {
      const style = getComputedStyle(section);
      const paddingTop = Number.parseFloat(style.paddingTop);
      const paddingBottom = Number.parseFloat(style.paddingBottom);
      return paddingTop > 120 || paddingBottom > 120
        ? [{ id: section.id, paddingTop, paddingBottom }]
        : [];
    })
  );
  expect(sectionRhythmProblems).toEqual([]);

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.evaluate(() => document.activeElement?.blur());
  await page.evaluate(() => window.scrollTo(0, 0));

  const trajectory = page.locator("[data-trajectory-root]");
  await expect(trajectory).toHaveCount(1);
  await expect(trajectory.locator('[role="tab"]')).toHaveCount(4);
  await expect(page.locator("#sobre .ambient-aurora--bridge")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#cta-final .ambient-aurora--closing")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#sobre .trajectory-header__eyebrow")).toHaveCount(0);
  expect(await page.locator("#sobre .trajectory-header").innerText()).not.toMatch(/(^|\n)\s*0[1-9]\b/);
  await expect(trajectory).toHaveAttribute("data-active-year", "2023");

  await trajectory.locator('[data-trajectory-year="2025"]').click();
  await expect(trajectory).toHaveAttribute("data-active-year", "2025");
  await expect(trajectory.locator("[data-trajectory-title]")).toHaveText("Informática e Web Design");
  await expect(trajectory.locator('[data-trajectory-year="2025"]').first()).toHaveAttribute("aria-selected", "true");

  const trajectoryOverflow = await trajectory.evaluate((element) => ({
    right: element.getBoundingClientRect().right,
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth
  }));
  expect(trajectoryOverflow.right).toBeLessThanOrEqual(trajectoryOverflow.viewport + 1);
  expect(trajectoryOverflow.documentWidth).toBeLessThanOrEqual(trajectoryOverflow.viewport + 1);

  const documentOverflow = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  expect(documentOverflow.width).toBeLessThanOrEqual(documentOverflow.viewport + 1);

  const gameTitle = page.locator("#game-dev .gamedev-hud-header h2");
  await expect(gameTitle).toBeVisible();
  expect(await gameTitle.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(45);

  const projectArticles = page.locator("article[data-project-id]");
  await expect(projectArticles).toHaveCount(14);
  const projectAurora = await projectArticles.first().evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return { content: style.content, backgroundImage: style.backgroundImage };
  });
  expect(projectAurora.content).not.toBe("none");
  expect(projectAurora.backgroundImage).toContain("radial-gradient");
  if (testInfo.project.name.startsWith("desktop")) {
    const lastProjectPairAlignment = await projectArticles.evaluateAll((articles) => {
      const pair = articles.slice(-2).map((article) => article.getBoundingClientRect());
      const left = Math.min(...pair.map((rect) => rect.left));
      const right = Math.max(...pair.map((rect) => rect.right));
      return Math.abs((left + right) / 2 - window.innerWidth / 2);
    });
    expect(lastProjectPairAlignment).toBeLessThan(48);
  }
  const projectTriggers = page.locator('.project-thumbnail-wrapper[role="button"]');
  await expect(projectTriggers).toHaveCount(9);
  for (const trigger of await projectTriggers.all()) {
    await expect(trigger).toHaveAttribute("tabindex", "0");
    await expect(trigger).toHaveAttribute("aria-label", /\S+/);
  }

  const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
    const counts = new Map();
    for (const element of elements) counts.set(element.id, (counts.get(element.id) || 0) + 1);
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  expect(duplicateIds).toEqual([]);

  await expect(page.locator('a[href="curriculo.pdf"]')).toHaveCount(1);
  await expect(page.locator('#cta-final a[href^="mailto:"]')).toHaveCount(2);

  const ctaCollision = await page.locator("#cta-final .footer-giant-link").evaluate((link) => {
    const title = link.querySelector(".footer-giant-title").getBoundingClientRect();
    const arrow = link.querySelector(".footer-giant-arrow").getBoundingClientRect();
    const horizontalOverlap = Math.max(0, Math.min(title.right, arrow.right) - Math.max(title.left, arrow.left));
    const verticalOverlap = Math.max(0, Math.min(title.bottom, arrow.bottom) - Math.max(title.top, arrow.top));
    return horizontalOverlap * verticalOverlap;
  });
  expect(ctaCollision).toBe(0);

  if (testInfo.project.name.startsWith("mobile")) {
    const hiddenTouchDescriptions = await page.locator("#projetos-design .ux-card__desc").evaluateAll((descriptions) =>
      descriptions.flatMap((description) => {
        const style = getComputedStyle(description);
        const clipped = ["hidden", "clip"].includes(style.overflowY) && description.scrollHeight > description.clientHeight + 1;
        return Number.parseFloat(style.opacity) < 0.5 || clipped ? [description.textContent.trim()] : [];
      })
    );
    expect(hiddenTouchDescriptions).toEqual([]);
  }

  const lockState = await page.evaluate(() => ({
    bodyClass: document.body.classList.contains("loading-locked"),
    controller: window.PortfolioScrollLock?.isLocked() ?? false,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    touchAction: getComputedStyle(document.body).touchAction
  }));
  expect(lockState.bodyClass).toBe(false);
  expect(lockState.controller).toBe(false);
  expect(["hidden", "clip"]).not.toContain(lockState.htmlOverflowY);
  expect(["hidden", "clip"]).not.toContain(lockState.bodyOverflowY);
  expect(lockState.touchAction).not.toBe("none");

  const initialY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 720);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialY);

  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 24));
    }
    window.scrollTo(0, 0);
  });

  const postRevealOverflow = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  expect(postRevealOverflow.width).toBeLessThanOrEqual(postRevealOverflow.viewport + 1);

  const hiddenSections = await page.locator("main section[id]").evaluateAll((sections) =>
    sections.flatMap((section) => {
      const style = getComputedStyle(section);
      return Number.parseFloat(style.opacity) < 0.99 || style.visibility === "hidden"
        ? [{ id: section.id, opacity: style.opacity, visibility: style.visibility }]
        : [];
    })
  );
  expect(hiddenSections).toEqual([]);

  const faqTitleVisibility = await page.locator('#faq .faq-header__title span[aria-hidden="true"]').evaluate((element) => {
    const hiddenLayers = [];
    let layer = element;
    while (layer) {
      const style = getComputedStyle(layer);
      if (Number.parseFloat(style.opacity) < 0.99 || style.visibility === "hidden") {
        hiddenLayers.push({ className: layer.className, opacity: style.opacity, visibility: style.visibility });
      }
      if (layer.matches(".faq-header__title")) break;
      layer = layer.parentElement;
    }
    const rect = element.getBoundingClientRect();
    return { hiddenLayers, width: rect.width, height: rect.height };
  });
  expect(faqTitleVisibility.hiddenLayers).toEqual([]);
  expect(faqTitleVisibility.width).toBeGreaterThan(0);
  expect(faqTitleVisibility.height).toBeGreaterThan(0);

  const localImageSources = await page.locator('img[src^="./"]').evaluateAll((images) =>
    [...new Set(images.map((image) => image.getAttribute("src")).filter(Boolean))]
  );
  const localImageResponses = await Promise.all(
    localImageSources.map((src) => page.request.get(new URL(src, page.url()).href))
  );
  const unavailableLocalImages = localImageResponses
    .map((response, index) => response.ok() ? null : localImageSources[index])
    .filter(Boolean);
  expect(unavailableLocalImages).toEqual([]);

  const brokenRenderedImages = await page.locator('img[src^="./"]').evaluateAll((images) =>
    images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute("src"))
  );
  expect(brokenRenderedImages).toEqual([]);

  const footerAlignment = await page.locator(".footer-bottom span").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      delta: Math.abs(box.left + box.width / 2 - window.innerWidth / 2),
      textAlign: getComputedStyle(element.parentElement).textAlign,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize)
    };
  });
  expect(footerAlignment.delta).toBeLessThan(8);
  expect(footerAlignment.textAlign).toBe("center");
  expect(footerAlignment.fontSize).toBeGreaterThanOrEqual(12);

  const screenshotScale = await page.evaluate(() => ({ viewport: window.innerWidth, dpr: window.devicePixelRatio }));
  const visualEvidence = await page.screenshot({ path: testInfo.outputPath("home-full.png"), fullPage: true });
  const screenshotWidth = visualEvidence.readUInt32BE(16);
  const expectedScreenshotWidth = Math.ceil(screenshotScale.viewport * screenshotScale.dpr);
  expect(screenshotWidth).toBe(expectedScreenshotWidth);
  expect(sameOriginFailures).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("o loader cinematográfico aparece e sempre libera a página", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Cobertura única no desktop");
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const loader = page.locator("#cinematic-loader");
  await expect(loader).toBeVisible();
  await expect(page.locator("#cinematic-brand")).toBeVisible();
  await expect(page.locator("#loader-stars-canvas")).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath("loader.png"), animations: "disabled" });

  await waitForPortfolio(page);
  await expect(loader).toHaveCount(0);
  expect(await page.evaluate(() => window.PortfolioScrollLock?.isLocked() ?? false)).toBe(false);
});

test("a trajetória avança automaticamente e pode ser pausada", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Cobertura única no desktop");
  await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: "dark" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForPortfolio(page);

  const trajectory = page.locator("[data-trajectory-root]");
  await trajectory.scrollIntoViewIfNeeded();
  await expect(trajectory).toHaveAttribute("data-active-year", "2023");
  await expect.poll(
    () => trajectory.getAttribute("data-active-year"),
    { timeout: 13_000, intervals: [500] }
  ).toBe("2024");

  const toggle = trajectory.locator("[data-trajectory-cycle-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toContainText("Retomar ciclo");
});
