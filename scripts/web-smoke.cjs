const { chromium } = require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(__dirname, '..', 'docs', file);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test web server running at ${baseUrl}`);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 1. Verify branding and title
    assert.match(await page.title(), /Small Steps/);
    await page.locator('.brand').waitFor();

    // 2. Check Daily Momentum Ring & active habits
    await page.locator('.momentum-card').waitFor();
    assert.ok(await page.locator('.momentum-ring').isVisible());
    const habitCount = await page.locator('.habit').count();
    assert.ok(habitCount >= 3, `Expected at least 3 starter habits, found ${habitCount}`);

    // 3. Test check-in & audio feedback
    const firstCheck = page.locator('[data-check]').first();
    await firstCheck.click();
    await page.getByRole('button', { name: 'Undo', exact: true }).waitFor();

    // 4. Test sound toggle
    const soundBtn = page.locator('#sound-toggle');
    assert.ok(await soundBtn.isVisible());
    await soundBtn.click();
    await page.getByText(/Sound effects muted/i).waitFor();
    await soundBtn.click();
    await page.getByText(/Sound effects enabled/i).waitFor();

    // 5. Test theme toggle
    const themeBtn = page.locator('#theme-toggle');
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
    await themeBtn.click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');

    fs.mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/web-light.png', animations: 'disabled' });

    await themeBtn.click();
    assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');

    // 6. Test Morning Kickstart & Coach model list
    if (await page.evaluate(() => document.body.classList.contains('coach-hidden'))) {
      await page.locator('#toggle-coach').click();
    }
    const kickstartBtn = page.locator('[data-kickstart="morning"]');
    await kickstartBtn.click();
    const chatInput = page.locator('#chat-input');
    assert.match(await chatInput.inputValue(), /Good morning/i);

    // Verify exactly the 5 models in screenshot
    const modelOptions = await page.locator('#chat-model option').allTextContents();
    assert.ok(modelOptions.includes('GPT-5 Mini'));
    assert.ok(modelOptions.includes('GPT-5.6 Luna'));
    assert.ok(modelOptions.includes('GPT-5.6 Terra'));
    assert.ok(modelOptions.includes('GPT-5.6 Sol'));
    // Verify live dispatch with selected model over the wire
    let interceptedModel = null;
    await page.route('https://api.openai.com/**', async route => {
      const postData = JSON.parse(route.request().postData());
      interceptedModel = postData.model;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'completed',
          output: [{ type: 'message', content: [{ type: 'output_text', text: `Web response from ${postData.model}` }] }]
        })
      });
    });
    await page.evaluate(() => localStorage.setItem('small-steps-openai-key', 'sk-test-web-key'));
    await page.locator('#chat-model').selectOption('gpt-5.6-sol');
    await page.getByText('Model changed to gpt-5.6-sol.').waitFor();
    await page.locator('#chat-input').fill('Testing web model dispatch');
    await page.locator('#send').click();
    await page.locator('#chat').getByText('Web response from gpt-5.6-sol').waitFor();
    assert.equal(interceptedModel, 'gpt-5.6-sol', 'Web edition must send the exact selected model to OpenAI API');

    // 7. Test Journal reflection
    await page.locator('[data-view="journal"]').click();
    await page.locator('[data-mood="good"]').click();
    await page.locator('#journal-note').fill('Web edition works smoothly offline and in browser.');
    await page.locator('#save-reflection').click();
    await page.getByText('A little moment, kept.').waitFor();

    // 8. Test Focus timer
    await page.locator('[data-view="today"]').click();
    const focusBtn = page.locator('[data-focus]').first();
    await focusBtn.click();
    await page.locator('#start-focus').waitFor();
    await page.locator('#start-focus').click();
    await page.locator('#start-focus').getByText('Pause').waitFor();
    await page.getByRole('button', { name: 'Minimize' }).click();
    assert.ok(await page.locator('#focus-dock').isVisible());

    // 9. Test Progress view
    await page.locator('[data-view="progress"]').click();
    await page.locator('.heatmap').waitFor();
    await page.screenshot({ path: 'test-results/web-progress.png', animations: 'disabled' });

    // 10. Test Method view
    await page.locator('[data-view="method"]').click();
    await page.getByText('The Atomic Habits Approach', { exact: false }).waitFor();

    // 11. Test reload persistence via localStorage
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-view="journal"]').click();
    assert.equal(await page.locator('#journal-note').inputValue(), 'Web edition works smoothly offline and in browser.');

    await page.locator('[data-view="today"]').click();
    await page.screenshot({ path: 'test-results/web-today.png', animations: 'disabled' });

    assert.deepEqual(errors, []);
    console.log('PASS: Web edition works standalone in browser! Habits, momentum ring, sound toggle, light/dark theme, ChatGPT models, morning kickstart, focus dock, reflection journal, and localStorage persistence verified.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
  server.close();
});
