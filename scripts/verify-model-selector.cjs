const { _electron: electron } = require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { initialState } = require('../core.cjs');

(async () => {
  const profile = path.resolve('.local/model-test-' + Date.now());
  fs.mkdirSync(profile, { recursive: true });
  const seed = { ...initialState(), provider: 'openai', model: 'gpt-5-mini' };
  fs.writeFileSync(path.join(profile, 'habits.json'), JSON.stringify(seed));

  const env = { ...process.env, SMALL_STEPS_TEST: '1', SMALL_STEPS_DATA: profile };
  delete env.ELECTRON_RUN_AS_NODE;

  const app = await electron.launch({
    args: [path.resolve('.')],
    executablePath: require('electron'),
    env
  });

  try {
    const page = await app.firstWindow();
    await page.locator('#chat-model').waitFor();

    // Mock network call and capture the exact outgoing request payload
    await app.evaluate(() => {
      global.capturedRequests = [];
      global.fetch = async (url, options) => {
        const body = JSON.parse(options.body);
        global.capturedRequests.push({ url, model: body.model, body });
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: 'completed',
            output: [{ type: 'message', content: [{ type: 'output_text', text: `Response from ${body.model}` }] }]
          })
        };
      };
    });


    // We can save a key directly via UI settings or setKey
    await page.locator('#settings').click();
    await page.locator('#setting-key').fill('sk-test-model-verification-key');
    await page.getByRole('button', { name: 'Save settings' }).click();

    const modelsToTest = [
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
      { id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
      { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
      { id: 'gpt-6-astra', label: 'GPT-6 Astra' }
    ];

    for (const { id, label } of modelsToTest) {
      console.log(`Selecting model: ${label} (${id})...`);
      await page.locator('#chat-model').selectOption(id);
      await page.getByText(`Model changed to ${id}.`).waitFor();

      // Check on disk
      const onDisk = JSON.parse(fs.readFileSync(path.join(profile, 'habits.json')));
      assert.equal(onDisk.model, id, `Disk state should have model ${id}`);

      // Send a message
      await page.locator('#send:not([disabled])').waitFor();
      await page.locator('#chat-input').fill(`Testing model ${id}`);
      await page.locator('#send').click();
      await page.locator('#chat').getByText(`Response from ${id}`, { exact: false }).waitFor();
      await page.locator('#send:not([disabled])').waitFor();

      // Inspect captured request
      const lastReq = await app.evaluate(() => global.capturedRequests.at(-1));
      assert.equal(lastReq.model, id, `API request body.model should be ${id}`);
      assert.equal(lastReq.url, 'https://api.openai.com/v1/responses');
      console.log(`  ✓ Confirmed: API request dispatched to ${lastReq.url} with model: "${lastReq.model}"`);
    }

    // Now test persistence after app restart
    await app.close();
    const appRestarted = await electron.launch({
      args: [path.resolve('.')],
      executablePath: require('electron'),
      env
    });
    const page2 = await appRestarted.firstWindow();
    await page2.locator('#chat-model').waitFor();
    const persistedModel = await page2.locator('#chat-model').inputValue();
    assert.equal(persistedModel, 'gpt-6-astra', 'Model should persist as gpt-6-astra across app restarts');
    console.log(`  ✓ Confirmed: Model persisted across app restart as "${persistedModel}"`);
    await appRestarted.close();

    console.log('\nALL 5 OPENAI MODELS VERIFIED: Model selector actively switches the API model sent over the wire and persists!');
  } finally {
    try { await app.close(); } catch {}
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
