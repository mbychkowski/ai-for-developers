import { test, expect, type Locator } from '@playwright/test';

async function expectCalloutBorder(callout: Locator) {
  const border = await callout.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      borderLeftWidth: cs.borderLeftWidth,
      borderLeftStyle: cs.borderLeftStyle,
    };
  });
  expect(border.borderLeftWidth).toBe('10px');
  expect(border.borderLeftStyle).toBe('solid');
}

test.describe('Slide layouts and components', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to newer-deck which exercises all layouts and components
    await page.goto('decks/newer-deck/');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();
  });

  test('all four layouts render distinctly on the canvas', async ({ page }) => {
    const slides = page.locator('[data-slide]');
    await expect(slides).toHaveCount(6);

    // 1. Title layout (Slide 1)
    const titleCanvas = slides.nth(0).locator('.slide-canvas');
    await expect(titleCanvas).toHaveAttribute('data-layout', 'title');
    const titleStyles = await titleCanvas.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        justifyContent: cs.justifyContent,
        backgroundImage: cs.backgroundImage,
      };
    });
    expect(titleStyles.justifyContent).toBe('flex-end');
    expect(titleStyles.backgroundImage).toContain('gradient');

    // 2. Default layout (Slide 2)
    const defaultCanvas = slides.nth(1).locator('.slide-canvas');
    await expect(defaultCanvas).toHaveAttribute('data-layout', 'default');
    const defaultStyles = await defaultCanvas.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        justifyContent: cs.justifyContent,
        textAlign: cs.textAlign,
      };
    });
    expect(defaultStyles.justifyContent).toBe('center');

    // 3. Statement layout (Slide 3)
    const statementCanvas = slides.nth(2).locator('.slide-canvas');
    await expect(statementCanvas).toHaveAttribute('data-layout', 'statement');
    const statementStyles = await statementCanvas.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const p = el.querySelector('p');
      const pStyles = p ? window.getComputedStyle(p) : null;
      return {
        alignItems: cs.alignItems,
        textAlign: cs.textAlign,
        pFontSize: pStyles ? parseFloat(pStyles.fontSize) : null,
        pFontWeight: pStyles ? pStyles.fontWeight : null,
      };
    });
    expect(statementStyles.alignItems).toBe('center');
    expect(statementStyles.textAlign).toBe('center');
    expect(statementStyles.pFontSize).toBe(64);
    expect(Number(statementStyles.pFontWeight)).toBeGreaterThanOrEqual(700);

    // 4. Section layout (Slide 5)
    const sectionCanvas = slides.nth(4).locator('.slide-canvas');
    await expect(sectionCanvas).toHaveAttribute('data-layout', 'section');
    const sectionStyles = await sectionCanvas.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
      };
    });
    // Section layout has white text over accent background
    expect(sectionStyles.color).toBe('rgb(255, 255, 255)');
    expect(sectionStyles.backgroundColor).not.toBe('');
    expect(sectionStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('Callout component renders in accent and neutral tones without imports', async ({ page }) => {
    // Slide 2 has an accent Callout
    await page.goto('decks/newer-deck/#2');
    const accentCallout = page.locator('.border-accent');
    await expect(accentCallout).toBeVisible();
    await expect(accentCallout).toContainText('An accent callout without imports.');
    await expectCalloutBorder(accentCallout);

    // Slide 6 has a neutral Callout
    await page.goto('decks/newer-deck/#6');
    const neutralCallout = page.locator('.border-muted');
    await expect(neutralCallout).toBeVisible();
    await expect(neutralCallout).toContainText('A neutral callout without imports.');
    await expectCalloutBorder(neutralCallout);
  });

  test('TwoColumn component renders side-by-side columns without imports', async ({ page }) => {
    // Navigate directly to Slide 4 where TwoColumn is rendered
    await page.goto('decks/newer-deck/#4');

    const twoCol = page.locator('.grid-cols-2');
    await expect(twoCol).toBeVisible();

    // Contains content from both left and right slots
    await expect(twoCol.getByRole('heading', { level: 3, name: 'Left Column' })).toBeVisible();
    await expect(twoCol.getByText('Left side content.')).toBeVisible();
    await expect(twoCol.getByRole('heading', { level: 3, name: 'Right Column' })).toBeVisible();
    await expect(twoCol.getByText('Right side content.')).toBeVisible();

    // Verify grid layout computes to 2 columns
    const gridCols = await twoCol.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return cs.gridTemplateColumns.split(' ').length;
    });
    expect(gridCols).toBe(2);
  });

  test('Slide body text is at least about 32px on the canvas', async ({ page }) => {
    const slides = page.locator('[data-slide]');

    // Slide 2 body paragraph
    const bodyP = slides.nth(1).locator('.slide-canvas > p');
    await expect(bodyP).toBeAttached();
    const fontSize = await bodyP.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    // Canvas base font size is 36px, strictly >= 32px
    expect(fontSize).toBeGreaterThanOrEqual(32);
    expect(fontSize).toBe(36);
  });

  test('sample Deck exercises every layout and component, and static HTML renders all of them', async ({ browser }) => {
    // Test that all slides and components render even with JavaScript disabled
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();
    await noJsPage.goto('decks/newer-deck/');

    const slides = noJsPage.locator('[data-slide]');
    await expect(slides).toHaveCount(6);

    // Slide 1: title layout
    await expect(slides.nth(0).locator('.slide-canvas[data-layout="title"]')).toBeAttached();

    // Slide 2: default layout with Callout
    await expect(slides.nth(1).locator('.slide-canvas[data-layout="default"]')).toBeAttached();
    await expect(slides.nth(1).locator('.border-accent')).toBeAttached();

    // Slide 3: statement layout
    await expect(slides.nth(2).locator('.slide-canvas[data-layout="statement"]')).toBeAttached();

    // Slide 4: TwoColumn
    await expect(slides.nth(3).locator('.grid-cols-2')).toBeAttached();

    // Slide 5: section layout
    await expect(slides.nth(4).locator('.slide-canvas[data-layout="section"]')).toBeAttached();

    // Slide 6: neutral Callout
    await expect(slides.nth(5).locator('.border-muted')).toBeAttached();

    await context.close();
  });
});
