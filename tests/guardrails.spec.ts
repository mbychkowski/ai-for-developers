import { test, expect } from '@playwright/test';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';

const execAsync = promisify(exec);

test.describe('Content guardrails at build time', () => {
  test('a build with an unknown Topic id fails and the error names the offending entry', async () => {
    let failed = false;
    let output = '';
    const outDir = 'dist-test-invalid';

    try {
      await execAsync(`CONTENT_DIR=tests/fixtures/invalid-topic pnpm astro build --outDir ${outDir}`, {
        env: { ...process.env, CONTENT_DIR: 'tests/fixtures/invalid-topic' },
      });
    } catch (err: any) {
      failed = true;
      output = `${err.stdout || ''}\n${err.stderr || ''}`;
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }

    expect(failed).toBe(true);
    // Offending entry is named
    expect(output).toContain('bad-topic-essay');
    // Offending topic reference is named
    expect(output).toMatch(/nonexistent-topic/);
  });

  test('a build with missing required frontmatter fails and the error names the offending entry', async () => {
    let failed = false;
    let output = '';
    const outDir = 'dist-test-missing';

    try {
      await execAsync(`CONTENT_DIR=tests/fixtures/missing-frontmatter pnpm astro build --outDir ${outDir}`, {
        env: { ...process.env, CONTENT_DIR: 'tests/fixtures/missing-frontmatter' },
      });
    } catch (err: any) {
      failed = true;
      output = `${err.stdout || ''}\n${err.stderr || ''}`;
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }

    expect(failed).toBe(true);
    // Offending entry is named
    expect(output).toContain('missing-title-essay');
    // Missing required field is named
    expect(output).toContain('title');
  });
});
