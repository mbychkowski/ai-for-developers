import { test, expect } from '@playwright/test';

test.describe('Drafts in production', () => {
  test('a draft essay is absent from production listings and its URL returns 404', async ({ page }) => {
    // Navigating directly to draft essay returns 404
    const response = await page.goto('essays/draft-essay/');
    expect(response?.status()).toBe(404);

    // Draft is absent from index listings
    await page.goto('');
    await expect(page.getByText('Draft Essay')).not.toBeVisible();
  });
});

test.describe('Drafts in development server', () => {
  test('a draft essay is visible and marked Draft under the dev server', async ({ page }) => {
    const devBaseUrl = 'http://localhost:4322/ai-for-developers/';

    // Navigating directly to draft essay renders the page
    const response = await page.goto(`${devBaseUrl}essays/draft-essay/`);
    expect(response?.status()).toBe(200);

    // Title is rendered
    await expect(page.getByRole('heading', { level: 1, name: 'Draft Essay' })).toBeVisible();

    // Marked as "Draft"
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();

    // Draft appears on the dev home page listing marked as Draft
    await page.goto(devBaseUrl);
    const draftItem = page.locator('article', { hasText: 'Draft Essay' });
    await expect(draftItem.getByRole('link', { name: 'Draft Essay' })).toBeVisible();
    await expect(draftItem.getByText('Draft', { exact: true })).toBeVisible();
  });
});
