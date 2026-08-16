// @ts-check
import { defineConfig } from 'astro/config';

// BASE_PATH/SITE_URL kommen im deploy-workflow von actions/configure-pages:
// github pages ohne eigene domain -> base '/moepwellingtonxyz', sonst '/'.
export default defineConfig({
  site: process.env.SITE_URL || 'https://moepwellington.xyz',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
