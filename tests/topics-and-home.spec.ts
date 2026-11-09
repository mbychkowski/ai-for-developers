import { test, expect } from '@playwright/test';

test.describe('Topic pages', () => {
  test('renders topic name, description, and essays newest first', async ({ page }) => {
    await page.goto('topics/testing/');

    // Topic heading and description
    await expect(page.getByRole('heading', { level: 1, name: 'Testing' })).toBeVisible();
    await expect(
      page.getByText('High-confidence testing strategies for modern applications.')
    ).toBeVisible();

    // Canonical tag
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      'https://mbychkowski.github.io/ai-for-developers/topics/testing/'
    );

    // Essays list: newest first (Newer Essay Nov 8, 2026 before Tracer Essay Nov 4, 2026)
    const essayHeadings = page.locator('section[aria-labelledby="essays"] article h3 a');
    await expect(essayHeadings).toHaveCount(2);
    await expect(essayHeadings.nth(0)).toHaveText('Newer Essay');
    await expect(essayHeadings.nth(1)).toHaveText('Tracer Essay');
  });

  test('multi-topic essay appears on each topic page it carries', async ({ page }) => {
    // Tracer Essay has [testing, agentic-engineering]
    // 1. Appears on /topics/testing/
    await page.goto('topics/testing/');
    await expect(page.getByRole('heading', { level: 3, name: 'Tracer Essay' })).toBeVisible();

    // 2. Appears on /topics/agentic-engineering/
    await page.goto('topics/agentic-engineering/');
    await expect(page.getByRole('heading', { level: 1, name: 'Agentic Engineering' })).toBeVisible();
    await expect(
      page.getByText('Principles and patterns for building software with autonomous AI agents.')
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Tracer Essay' })).toBeVisible();
  });

  test('topic with no essays shows an empty-state message', async ({ page }) => {
    await page.goto('topics/design/');

    await expect(page.getByRole('heading', { level: 1, name: 'Design' })).toBeVisible();
    await expect(
      page.getByText('Systems and interface design for human and agent developers.')
    ).toBeVisible();
    await expect(page.getByText('No Essays on this Topic yet.')).toBeVisible();
  });
});

test.describe('Home page', () => {
  test('lists recent essays, links to essays index, and lists all topics in list order', async ({ page }) => {
    await page.goto('');

    // Site heading and description
    await expect(page.getByRole('heading', { level: 1, name: 'AI for Developers' })).toBeVisible();
    await expect(page.getByText('Decks and Essays on building software with AI.', { exact: true })).toBeVisible();

    // Recent essays section
    await expect(page.getByRole('heading', { level: 2, name: 'Recent Essays' })).toBeVisible();
    const allEssaysLink = page.getByRole('link', { name: 'All Essays →' });
    await expect(allEssaysLink).toBeVisible();
    await expect(allEssaysLink).toHaveAttribute('href', '/ai-for-developers/essays/');

    // Recent essays ordered newest first
    const essayHeadings = page.locator('section[aria-labelledby="essays"] article h3 a');
    await expect(essayHeadings).toHaveCount(2);
    await expect(essayHeadings.nth(0)).toHaveText('Newer Essay');
    await expect(essayHeadings.nth(1)).toHaveText('Tracer Essay');

    // Topics section lists topics in curated list order (testing, agentic-engineering, design)
    await expect(page.getByRole('heading', { level: 2, name: 'Topics' })).toBeVisible();
    const topicLinks = page.locator('section[aria-labelledby="topics"] ul li a');
    await expect(topicLinks).toHaveCount(3);

    await expect(topicLinks.nth(0)).toHaveAttribute('href', '/ai-for-developers/topics/testing/');
    await expect(topicLinks.nth(0).locator('span').first()).toHaveText('Testing');
    await expect(topicLinks.nth(0)).toContainText('High-confidence testing strategies for modern applications.');

    await expect(topicLinks.nth(1)).toHaveAttribute('href', '/ai-for-developers/topics/agentic-engineering/');
    await expect(topicLinks.nth(1).locator('span').first()).toHaveText('Agentic Engineering');
    await expect(topicLinks.nth(1)).toContainText('Principles and patterns for building software with autonomous AI agents.');

    await expect(topicLinks.nth(2)).toHaveAttribute('href', '/ai-for-developers/topics/design/');
    await expect(topicLinks.nth(2).locator('span').first()).toHaveText('Design');
    await expect(topicLinks.nth(2)).toContainText('Systems and interface design for human and agent developers.');
  });

  test('shared site layout renders header nav, footer, meta and canonical tags', async ({ page }) => {
    await page.goto('');

    // Header nav
    const homeNav = page.locator('header a', { hasText: 'AI for Developers' });
    await expect(homeNav).toBeVisible();
    await expect(homeNav).toHaveAttribute('href', '/ai-for-developers/');

    const essaysNav = page.locator('header nav a', { hasText: 'Essays' });
    await expect(essaysNav).toBeVisible();
    await expect(essaysNav).toHaveAttribute('href', '/ai-for-developers/essays/');

    // Footer
    const footer = page.locator('footer');
    await expect(footer).toContainText('AI for Developers: Decks and Essays on building software with AI.');

    // Canonical link tag
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://mbychkowski.github.io/ai-for-developers/');

    // Meta description and OpenGraph tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Decks and Essays on building software with AI.'
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'AI for Developers'
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'Decks and Essays on building software with AI.'
    );
  });
});

test.describe('Link resolution', () => {
  test('every internal link on home page and topic pages resolves under base path', async ({ page }) => {
    const pagesToCheck = [
      '',
      'topics/testing/',
      'topics/agentic-engineering/',
      'topics/design/',
    ];

    const visitedHrefs = new Set<string>();

    for (const path of pagesToCheck) {
      await page.goto(path);

      // Collect all <a> links
      const hrefs = await page.locator('a[href]').evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')).filter((href): href is string => Boolean(href))
      );

      for (const href of hrefs) {
        // Only test internal links
        if (href.startsWith('http') && !href.startsWith('http://localhost')) {
          continue;
        }

        // Must start with base path
        expect(href).toMatch(/^\/ai-for-developers\//);

        if (!visitedHrefs.has(href)) {
          visitedHrefs.add(href);
          // Verify link resolves with HTTP 200
          const res = await page.request.get(href);
          expect(res.status(), `Expected ${href} to resolve with 200, got ${res.status()}`).toBe(200);
        }
      }
    }
  });
});
