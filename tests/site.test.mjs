import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('protected hero and GitHub Pages domain remain in place', () => {
  assert.match(html, /class="hero-name"/);
  assert.match(html, /class="portrait" src="assets\/khalil-cutout-v3\.webp"/);
  assert.match(html, /mask-image:linear-gradient/);
  assert.match(html, /burgundy-texture\.png/);
  assert.equal(readFileSync(new URL('../CNAME', import.meta.url), 'utf8').trim(), 'daoudiahmedkhalil.com');
});

test('selected content stays within the approved brief', () => {
  assert.equal((html.match(/class="project"/g) ?? []).length, 4);
  for (const title of ['XRAG / GraphRAG', 'Hermes', 'The Council', 'NAGISEN', 'Personal Training Coach']) assert.ok(html.includes(title));
  for (const removed of ['TRIA GROUP', 'UFC predictor', 'Spotify pipeline', 'Fraud detection', 'calisthenics', 'mailto:']) assert.ok(!html.includes(removed));
  for (const cover of ['meditations', 'brothers-karamazov', 'crime-and-punishment', 'anna-karenina', 'zarathustra']) assert.ok(existsSync(new URL(`../assets/covers/${cover}.webp`, import.meta.url)));
});
