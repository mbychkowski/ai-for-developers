import { test, expect } from '@playwright/test';

test.describe('Essays index and Topic filter', () => {
  test('lists all Essays newest first with date, title, description and Topics', async ({ page }) => {
    await page.goto('essays/');

    // Page title
    await expect(page.getByRole('heading', { level: 1, name: 'Essays' })).toBeVisible();

    // Default active filter is "All"
    const allButton = page.getByRole('button', { name: 'All' });
    await expect(allButton).toHaveAttribute('aria-pressed', 'true');

    // Both fixture essays are displayed (production mode: drafts excluded)
    await expect(page.getByRole('link', { name: 'Newer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();

    // Check order: Newer Essay should appear before Tracer Essay in the DOM
    const essayLinks = page.getByRole('link').filter({ hasText: /Essay$/ });
    await expect(essayLinks.nth(0)).toHaveText('Newer Essay');
    await expect(essayLinks.nth(1)).toHaveText('Tracer Essay');

    // Verify date, description, and topics for Tracer Essay
    await expect(page.getByText('Nov 4, 2026')).toBeVisible();
    await expect(page.getByText('An essay to verify the tracer bullet end to end.')).toBeVisible();
    await expect(page.getByText('Testing').first()).toBeVisible();
    await expect(page.getByText('Agentic Engineering').first()).toBeVisible();
  });

  test('filter controls are buttons with pressed state exposed to assistive technology', async ({ page }) => {
    await page.goto('essays/');

    const group = page.getByRole('group', { name: 'Filter by Topic' });
    await expect(group).toBeVisible();

    const allBtn = page.getByRole('button', { name: 'All' });
    const testingBtn = page.getByRole('button', { name: 'Testing' });
    const agenticBtn = page.getByRole('button', { name: 'Agentic Engineering' });

    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(testingBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(agenticBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('selecting a Topic narrows the list and sets ?topic=<id> without adding a history entry', async ({ page }) => {
    // Start at home page to test history length
    await page.goto('');
    await page.getByRole('link', { name: 'Essays', exact: true }).click();
    await expect(page).toHaveURL(/.*\/essays\//);

    // Select "Agentic Engineering" (only Tracer Essay carries agentic-engineering)
    const agenticBtn = page.getByRole('button', { name: 'Agentic Engineering' });
    await agenticBtn.click();

    // Button states
    await expect(agenticBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');

    // URL contains ?topic=agentic-engineering
    expect(page.url()).toContain('topic=agentic-engineering');

    // Only Tracer Essay carries 'agentic-engineering'; Newer Essay should not be visible
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Newer Essay' })).not.toBeVisible();

    // Select "Testing" (both Newer Essay and Tracer Essay carry testing)
    const testingBtn = page.getByRole('button', { name: 'Testing' });
    await testingBtn.click();
    expect(page.url()).toContain('topic=testing');

    await expect(page.getByRole('link', { name: 'Newer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();

    // History check: replaceState should not push multiple entries to session history.
    // Going back once should navigate back to home page, NOT to ?topic=agentic-engineering.
    await page.goBack();
    await expect(page).toHaveURL(/\/ai-for-developers\/$/);
  });

  test('"All" clears the filter and the query parameter', async ({ page }) => {
    await page.goto('essays/?topic=agentic-engineering');

    const allBtn = page.getByRole('button', { name: 'All' });
    const agenticBtn = page.getByRole('button', { name: 'Agentic Engineering' });

    await expect(agenticBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Newer Essay' })).not.toBeVisible();

    // Click "All"
    await allBtn.click();

    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(agenticBtn).toHaveAttribute('aria-pressed', 'false');

    // Query param is removed
    expect(page.url()).not.toContain('topic=');

    // All essays restored
    await expect(page.getByRole('link', { name: 'Newer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();
  });

  test('opening a URL with ?topic=<id> applies the filter on load; an unknown id is ignored', async ({ page }) => {
    // Valid topic filter on load: agentic-engineering
    await page.goto('essays/?topic=agentic-engineering');

    const agenticBtn = page.getByRole('button', { name: 'Agentic Engineering' });
    await expect(agenticBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Newer Essay' })).not.toBeVisible();

    // Unknown topic filter on load
    await page.goto('essays/?topic=unknown-nonexistent-id');

    const allBtn = page.getByRole('button', { name: 'All' });
    await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Newer Essay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).toBeVisible();
  });

  test('a Topic with no matching Essays shows a "no Essays" message', async ({ page }) => {
    // Topic "Design" in fixtures has no essays
    await page.goto('essays/?topic=design');

    const designBtn = page.getByRole('button', { name: 'Design' });
    await expect(designBtn).toHaveAttribute('aria-pressed', 'true');

    // "no Essays" message is visible
    await expect(page.getByText(/No Essays on this Topic yet\./i)).toBeVisible();

    // No essay links are rendered
    await expect(page.getByRole('link', { name: 'Newer Essay' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Tracer Essay' })).not.toBeVisible();
  });

  test('every internal link on essays index resolves under base path', async ({ page }) => {
    await page.goto('essays/');

    const hrefs = await page.locator('a[href]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')).filter((href): href is string => Boolean(href))
    );

    const visitedHrefs = new Set<string>();
    for (const href of hrefs) {
      if (href.startsWith('http') && !href.startsWith('http://localhost')) {
        continue;
      }
      expect(href).toMatch(/^\/ai-for-developers\//);
      if (!visitedHrefs.has(href)) {
        visitedHrefs.add(href);
        const res = await page.request.get(href);
        expect(res.status(), `Expected ${href} to resolve with 200, got ${res.status()}`).toBe(200);
      }
    }
  });

  test('a draft essay is visible and marked Draft under the dev server on essays index', async ({ page }) => {
    const devBaseUrl = 'http://localhost:4322/ai-for-developers/';
    await page.goto(`${devBaseUrl}essays/`);

    await expect(page.getByRole('link', { name: 'Draft Essay' })).toBeVisible();
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();
  });
});
