import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));

describe('static host hardening', () => {
  it('ships CSP, framing and permissions headers with the manifest media type', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  });

  it('rewrites only real application routes and serves unknown paths as HTTP 404', () => {
    const rewrites = Object.fromEntries(config.routes.filter((route) => route.rewrite).map((route) => [route.route, route.rewrite]));
    expect(rewrites).toMatchObject({ '/': '/index.html', '/demo': '/index.html', '/privacy': '/index.html', '/terms': '/index.html' });
    const normalizedRoutes = config.routes.map((route) => route.route.replace(/\/$/, '') || '/');
    expect(new Set(normalizedRoutes).size).toBe(normalizedRoutes.length);
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  });

  it('ships the required social and Apple metadata assets at their declared sizes', () => {
    const pngSize = (path) => {
      const png = readFileSync(new URL(path, import.meta.url));
      return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    };
    expect(pngSize('../public/assets/tableclock-social.png')).toEqual({ width: 1200, height: 630 });
    expect(pngSize('../public/icons/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
    for (const page of [index, notFound]) {
      expect(page).toContain('rel="apple-touch-icon" sizes="180x180"');
      expect(page).toContain('property="og:image"');
      expect(page).toContain('name="twitter:card"');
    }
  });

  it('keeps support, licensing, and runtime dependencies explicit and local', () => {
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(packageJson.engines.node).toBe('>=20');
    expect(readFileSync(new URL('../LICENSE', import.meta.url), 'utf8')).toContain('MIT License');

    const runtimeFiles = ['../index.html', '../src/main.ts', '../src/styles.css'];
    for (const path of runtimeFiles) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');
      expect(source).not.toMatch(/https?:\/\/(?!tableclock\.sociobot\.in)/);
    }
  });
});
