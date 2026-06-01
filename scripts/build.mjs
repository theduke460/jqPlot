#!/usr/bin/env node
/**
 * jqPlot build script
 * Replaces legacy Gruntfile.js with esbuild + clean-css pipeline.
 *
 * Outputs:
 *   dist/jquery.jqplot.js          - concatenated core (unminified)
 *   dist/jquery.jqplot.min.js      - minified core
 *   dist/jquery.jqplot.css         - CSS (token-substituted)
 *   dist/jquery.jqplot.min.css     - minified CSS
 *   dist/plugins/jqplot.*.js       - individual plugins (unminified)
 *   dist/plugins/jqplot.*.min.js   - individual plugins (minified)
 *   jquery.jqplot.<version>.zip    - release archive
 */

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'fs';
import { join } from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const pkg     = JSON.parse(readFileSync('package.json', 'utf8'));
const VERSION = pkg.version;
const DIST    = 'dist';
const PLUGINS = join(DIST, 'plugins');

// Core files concatenated in order (matches original Gruntfile concat sequence)
const CORE_FILES = [
  'src/jqplot.core.js',
  'src/jqplot.axisLabelRenderer.js',
  'src/jqplot.axisTickRenderer.js',
  'src/jqplot.canvasGridRenderer.js',
  'src/jqplot.divTitleRenderer.js',
  'src/jqplot.linePattern.js',
  'src/jqplot.lineRenderer.js',
  'src/jqplot.linearAxisRenderer.js',
  'src/jqplot.linearTickGenerator.js',
  'src/jqplot.markerRenderer.js',
  'src/jqplot.shadowRenderer.js',
  'src/jqplot.shapeRenderer.js',
  'src/jqplot.tableLegendRenderer.js',
  'src/jqplot.themeEngine.js',
  'src/jqplot.toImage.js',
  'src/jsdate.js',
  'src/jqplot.sprintf.js',
  'src/jqplot.effects.core.js',
  'src/jqplot.effects.blind.js',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ${msg}`); }

function substituteTokens(src) {
  return src
    .replace(/@VERSION/g, VERSION);
}

/**
 * Strip the per-file IIFE wrapper that each non-core source file uses.
 * Core keeps its own outer wrapper; inner files just contribute their body.
 *   Opens with:  (function($) {
 *   Closes with: })(jQuery);
 */
function stripIIFE(src, filename) {
  // core.js owns the single outer IIFE - leave it intact
  if (filename.endsWith('jqplot.core.js')) return src;
  // effects.blind.js has a different closure pattern - leave intact
  if (filename.endsWith('jqplot.effects.blind.js')) return src;

  // Remove opening IIFE: everything up to and including (function($) {
  src = src.replace(/[\s\S]*?\(function\(\$\) \{/, '');
  // Remove closing IIFE: last occurrence of })(jQuery);
  src = src.replace(/\}\)\(jQuery\);(?![\s\S]*\}\)\(jQuery\);)/g, '');
  return src;
}

function ensureDirs() {
  mkdirSync(DIST,    { recursive: true });
  mkdirSync(PLUGINS, { recursive: true });
}

// ── Core build ────────────────────────────────────────────────────────────────

async function buildCore() {
  log('Building core...');

  // Read, substitute tokens, strip inner IIFEs, concatenate
  const combined = CORE_FILES
    .map(f => substituteTokens(stripIIFE(readFileSync(f, 'utf8'), f)))
    .join('\n');

  // Write unminified
  const unminPath = join(DIST, 'jquery.jqplot.js');
  writeFileSync(unminPath, combined);

  // Minify via esbuild
  const result = await build({
    stdin: {
      contents: combined,
      sourcefile: 'jquery.jqplot.js',
      loader: 'js',
    },
    minify: true,
    bundle: false,
    write: false,
    banner: {
      js: `/* jqplot ${VERSION} | (c) 2009-${new Date().getFullYear()} Chris Leonello | jqplot.com */`
    },
  });

  writeFileSync(join(DIST, 'jquery.jqplot.min.js'), result.outputFiles[0].text);
  log(`  core → dist/jquery.jqplot.js + .min.js`);
}

// ── Plugin builds ─────────────────────────────────────────────────────────────

async function buildPlugins() {
  log('Building plugins...');

  const pluginFiles = readdirSync('src/plugins')
    .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));

  for (const filename of pluginFiles) {
    const srcPath  = join('src/plugins', filename);
    const destPath = join(PLUGINS, filename);
    const minPath  = join(PLUGINS, filename.replace(/\.js$/, '.min.js'));

    const src = substituteTokens(readFileSync(srcPath, 'utf8'));
    writeFileSync(destPath, src);

    const result = await build({
      stdin: {
        contents: src,
        sourcefile: filename,
        loader: 'js',
      },
      minify: true,
      bundle: false,
      write: false,
      banner: {
        js: `/* jqplot ${VERSION} plugin | (c) 2009-${new Date().getFullYear()} Chris Leonello | jqplot.com */`
      },
    });

    writeFileSync(minPath, result.outputFiles[0].text);
  }

  log(`  ${pluginFiles.length} plugins → dist/plugins/`);
}

// ── CSS build ─────────────────────────────────────────────────────────────────

function buildCSS() {
  log('Building CSS...');

  const src = substituteTokens(readFileSync('src/jquery.jqplot.css', 'utf8'));
  writeFileSync(join(DIST, 'jquery.jqplot.css'), src);

  // Minify with clean-css-cli
  execSync(
    `./node_modules/.bin/cleancss -o ${DIST}/jquery.jqplot.min.css ${DIST}/jquery.jqplot.css`,
    { stdio: 'inherit' }
  );

  log(`  CSS → dist/jquery.jqplot.css + .min.css`);
}

// ── Copy static assets ────────────────────────────────────────────────────────

function copyStatics() {
  log('Copying static assets...');

  for (const f of ['README.md', 'copyright.txt', 'version.txt']) {
    try {
      copyFileSync(f, join(DIST, f));
    } catch (_) { /* optional files */ }
  }

  // Copy option/usage docs from src
  for (const f of readdirSync('src').filter(f => f.endsWith('.txt'))) {
    copyFileSync(join('src', f), join(DIST, f));
  }
}

// ── Release zip ───────────────────────────────────────────────────────────────

function createZip() {
  const zipName = `jquery.jqplot.${VERSION}.zip`;
  log(`Creating ${zipName}...`);
  try { execSync(`rm -f ${zipName}`); } catch(_) {}
  execSync(`cd ${DIST} && zip -r ../${zipName} . -x "*.DS_Store"`, { stdio: 'pipe' });
  log(`  ${zipName} done`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const doZip = args.includes('--zip');

  console.log(`\njqPlot ${VERSION} build\n`);

  ensureDirs();
  await buildCore();
  await buildPlugins();
  buildCSS();
  copyStatics();

  if (doZip) {
    createZip();
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
