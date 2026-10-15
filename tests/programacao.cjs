const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + url.pathname + (url.pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
    const types = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    const base = 'http://127.0.0.1:' + server.address().port;
    await page.goto(base + '/belo-horizonte/');
    assert.equal(await page.locator('.agenda-sessao').count(), 14);
    assert.equal(await page.locator('.agenda-intervalo').count(), 5);
    assert.equal(await page.locator('#agenda-baixar').isDisabled(), true);
    await page.locator('input[value="arcelormittal"]').check();
    await page.locator('input[value="durable-functions"]').check();
    assert.equal(await page.locator('input[value="arcelormittal"]').isChecked(), false);
    assert.match(await page.locator('#agenda-status').textContent(), /substituída/);
    await page.locator('input[value="carreira-ti"]').check();
    await page.reload();
    assert.equal(await page.locator('#agenda-escolhas input:checked').count(), 2);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#agenda-baixar').click();
    const download = await downloadPromise;
    fs.mkdirSync(path.join(root, '.build'), { recursive: true });
    const output = path.join(root, '.build', download.suggestedFilename());
    await download.saveAs(output);
    const png = fs.readFileSync(output);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1080);
    // Long titles and all eight available time slots must render without overflow.
    for (const id of ['abertura', 'arcelormittal', 'carreira-ti', 'kubernetes', 'produto', 'multi-regiao', 'carreira-estrategica', 'encerramento']) {
      await page.locator('input[value="' + id + '"]').check();
    }
    assert.equal(await page.locator('#agenda-escolhas input:checked').count(), 8);
    await page.locator('#agenda-imagem').screenshot({ path: path.join(root, '.build', 'agenda-preview.png') });
    await page.locator('#programacao').screenshot({ path: path.join(root, '.build', 'agenda-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('#programacao').screenshot({ path: path.join(root, '.build', 'agenda-mobile.png') });
    await page.locator('#agenda-limpar').click();
    assert.equal(await page.locator('#agenda-baixar').isDisabled(), true);
    assert.equal(await page.locator('#agenda-imagem').isHidden(), true);
    await page.reload();
    assert.equal(await page.locator('#agenda-escolhas input:checked').count(), 0);
    // Storage failure must not break selection or generation.
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
      Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    });
    await page.reload();
    await page.locator('input[value="abertura"]').check();
    assert.equal(await page.locator('#agenda-baixar').isEnabled(), true);
    await page.goto(base + '/atibaia/');
    assert.equal(await page.locator('#programacao').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: grade, conflitos, persistência, PNG, seleção completa, mobile, limpeza, storage indisponível e Atibaia.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
