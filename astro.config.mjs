// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site. For a custom domain, set `site` to it and drop `base`.
  site: 'https://mbychkowski.github.io',
  base: '/ai-for-developers',
  trailingSlash: 'always',

  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});
