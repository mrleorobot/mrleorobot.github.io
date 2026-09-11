import { expect, test } from '@playwright/test';

const sections = ['hero','sobre','projetos','projetos-design','tech-stack','game-dev','soft-skills','faq','cta-final'];
async function ready(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.body.classList.contains('loading-locked') && !window.PortfolioScrollLock?.isLocked());
  await page.evaluate(() => document.fonts.ready);
}

test('composição completa em seis proporções e movimento reduzido', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.emulateMedia({reducedMotion:"reduce", colorScheme:"dark"});
  for (const [width,height] of [[360,800],[390,844],[430,932],[768,1024],[1440,900],[844,390]]) {
    await page.setViewportSize({ width, height });
    await ready(page);
    await expect(page.locator('html')).toHaveClass(/visual-motion-static/);
    await expect(page.locator('#hero [data-motion-toggle]')).toBeDisabled();
    for (const id of sections) {
      await page.locator('#'+id).scrollIntoViewIfNeeded();
      const problems = await page.locator('#'+id).evaluate(section => {
        const box=section.getBoundingClientRect();
        const problems=[];
        if (box.width > window.innerWidth+1) problems.push('section width');
        for (const el of section.querySelectorAll('h1,h2,.trajectory-stage__year-number')) {
          const r=el.getBoundingClientRect(), s=getComputedStyle(el);
          if (r.width && (r.left < -1 || r.right > window.innerWidth+1 || el.scrollWidth > el.clientWidth+2 || (['hidden','clip'].includes(s.overflowY) && el.scrollHeight > el.clientHeight+1))) problems.push(el.className);
        }
        if(getComputedStyle(section).backgroundColor !== 'rgb(0, 0, 0)') problems.push('section background');
        return problems;
      });
      expect(problems, `${width} / ${id}`).toEqual([]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    expect(await page.locator('#projetos .project-card__media img, #projetos-design .ux-card__media img').evaluateAll(images => images.every(img=>getComputedStyle(img).objectFit==='contain' && getComputedStyle(img).filter==='none'))).toBe(true);
    if(width===390 || width===1440) {
      await page.locator('#hero').scrollIntoViewIfNeeded();
      await page.screenshot({path:testInfo.outputPath(`hero-${width}.png`)});
      await page.screenshot({path:testInfo.outputPath(`full-${width}.png`),fullPage:true});
    }
  }
});

test('galerias mantêm imagem, fechamento por teclado e foco', async ({page}) => {
  await ready(page);
  const trigger=page.locator('#projetos .project-thumbnail-wrapper[role=button]').first();
  await trigger.focus();
  await trigger.press('Enter');
  const dialog=page.locator('#modal-lightbox');
  await expect(dialog).toBeVisible();
  expect(await dialog.locator('img').evaluate(img=>img.naturalWidth>0)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const design=page.locator('#projetos-design .ux-card').first();
  await design.click();
  await expect(dialog).toBeVisible();
  if (page.viewportSize().width <= 768) {
    const layout=await dialog.evaluate(el=>({image:el.querySelector('.lightbox-image-side').getBoundingClientRect().toJSON(),text:el.querySelector('.lightbox-info-side').getBoundingClientRect().toJSON()}));
    expect(layout.text.top).toBeGreaterThanOrEqual(layout.image.bottom-1);
    expect(layout.image.width).toBeGreaterThan(page.viewportSize().width*.8);
  }
  await dialog.getByRole('button',{name:'Fechar',exact:true}).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(()=>!window.PortfolioScrollLock?.isLocked())).toBe(true);
});

test('pausa de atmosfera e prioridade da seleção manual de ano', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await ready(page);
  await page.locator('#hero [data-motion-toggle]').click();
  await expect(page.locator('html')).toHaveClass(/visual-motion-static/);
  await expect(page.locator('[data-motion-toggle]')).toHaveCount(2);
  const running=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running' && a.effect?.getComputedTiming().iterations===Infinity).length);
  expect(running).toBe(0);
  const trajectory=page.locator('[data-trajectory-root]');
  await trajectory.locator('[data-trajectory-year="2025"]').first().click();
  await expect(trajectory).toHaveAttribute('data-active-year','2025');
  await expect(trajectory.locator('[data-trajectory-cycle-toggle]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.site-footer [data-motion-toggle]').click();
  await expect(page.locator('html')).not.toHaveClass(/visual-motion-static/);
  await expect(trajectory.locator('[data-trajectory-cycle-toggle]')).toHaveAttribute('aria-pressed','true');
});

 test('texto ampliado preserva a leitura e os controles', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await ready(page);
  await page.addStyleTag({content:'html { font-size:200% !important; }'});
  for (const id of ['hero','sobre','tech-stack','cta-final']) {
    await page.locator('#'+id).scrollIntoViewIfNeeded();
    expect(await page.locator('#'+id).evaluate(el=>[...el.querySelectorAll('h1,h2,.trajectory-stage__year-number')].filter(e=>e.getBoundingClientRect().width>0).every(e=>e.scrollWidth<=e.clientWidth+2)),id).toBe(true);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
