import { test, expect } from '@playwright/test';

test.describe('Essay page', () => {
  test('renders title, date, description, topic links and prose under the base path', async ({ page }) => {
    await page.goto('essays/tracer-essay/');

    // Heading / title
    await expect(page.getByRole('heading', { level: 1, name: 'Tracer Essay' })).toBeVisible();

    // Description
    await expect(page.getByText('An essay to verify the tracer bullet end to end.')).toBeVisible();

    // Formatted date (published: Nov 4, 2026)
    await expect(page.getByText('Nov 4, 2026')).toBeVisible();

    // Topic links go through base-aware URL helper: /ai-for-developers/topics/<topic>/
    const testingChip = page.getByRole('link', { name: 'Testing' });
    await expect(testingChip).toBeVisible();
    await expect(testingChip).toHaveAttribute('href', '/ai-for-developers/topics/testing/');

    const agenticChip = page.getByRole('link', { name: 'Agentic Engineering' });
    await expect(agenticChip).toBeVisible();
    await expect(agenticChip).toHaveAttribute('href', '/ai-for-developers/topics/agentic-engineering/');

    // Prose body
    await expect(page.getByRole('heading', { level: 2, name: 'Key Section' })).toBeVisible();
    await expect(page.getByText('This is the body of the tracer essay.')).toBeVisible();
  });
});
