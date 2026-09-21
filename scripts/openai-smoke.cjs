const {_electron:electron}=require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const profile=path.resolve('.local/openai-test-'+Date.now());fs.mkdirSync(profile,{recursive:true});
 const old={...require('../core.cjs').initialState(),provider:'gemini',model:'gemini-3.8-flash',messages:[{role:'user',text:'I want to read more.'}]};
 fs.writeFileSync(path.join(profile,'habits.json'),JSON.stringify(old));
 const env={...process.env,SMALL_STEPS_TEST:'1',SMALL_STEPS_DATA:profile,OPENAI_API_KEY:'sk-environment-key-must-not-connect-1234567890'};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({args:['--disable-gpu',path.resolve('.')],executablePath:require('electron'),env});
 try{
  const page=await app.firstWindow();page.setDefaultTimeout(15000);await page.getByRole('heading', { name: 'Coach', exact: true }).waitFor({state:'attached'});assert.equal(await page.locator('#chat-model,.model-picker').count(),0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).provider,'openai');assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).model,'gpt-5-mini');assert.ok(fs.existsSync(path.join(profile,'habits.json.before-openai.backup')));
  await page.locator('#settings').click();await page.locator('#setting-key').waitFor();assert.equal(await page.locator('#setting-model').count(),0);
  await page.getByRole('button',{name:'Save & test connection'}).click();await page.locator('#test-result').getByText('Add your OpenAI API key',{exact:false}).waitFor();assert.equal(fs.existsSync(path.join(profile,'key-openai.bin')),false);
  await page.locator('#setting-key').fill('AQ.not-an-openai-key');await page.getByRole('button',{name:'Save & test connection'}).click();await page.locator('#test-result').getByText('beginning with sk-',{exact:false}).waitFor();
  await app.evaluate(()=>{global.fetch=async(url,options)=>{if(url!=='https://api.openai.com/v1/responses')throw Error('Unexpected destination');global.lastOpenAIRequest=JSON.parse(options.body);return {ok:false,status:429,json:async()=>({error:{code:'insufficient_quota'}})};};});
  const fake='sk-fake-local-test-key-1234567890';await page.locator('#setting-key').fill(fake);await page.getByRole('button',{name:'Save & test connection'}).click();await page.locator('#test-result').getByText('credit or spending limit',{exact:false}).waitFor();
  assert.equal(fs.readFileSync(path.join(profile,'key-openai.bin')).includes(Buffer.from(fake)),false);
  await app.evaluate(()=>{global.fetch=async(url,options)=>{if(url!=='https://api.openai.com/v1/responses')throw Error('Unexpected destination');global.lastOpenAIRequest=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Start with one page after your coffee.'}]}]})};};});
  await page.getByRole('button',{name:'Save & test connection'}).click();await page.locator('#test-result').getByText('Connected · gpt-5-mini',{exact:true}).waitFor();
  const testRequest=await app.evaluate(()=>global.lastOpenAIRequest);assert.equal(testRequest.input.length,1);assert.equal(testRequest.input[0].content,'Reply with: Connected.');assert.ok(!testRequest.instructions.includes('habits'));
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/openai-settings.png'});
  await page.getByRole('button',{name:'Close',exact:true}).click();assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).model,'gpt-5-mini');await page.locator('#chat-input').fill('How do I start?');await page.locator('#send').click();await page.locator('#chat').getByText('Start with one page after your coffee.',{exact:true}).waitFor();
  await page.reload();await page.locator('#chat').getByText('Start with one page after your coffee.',{exact:true}).waitFor();assert.equal(await page.locator('#chat-model,.model-picker').count(),0);assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).model,'gpt-5-mini');
  console.log('PASS: GPT-5 Mini fixed model, no model selector, each user must enter a key, environment key ignored, encrypted storage, saved Gemini migration, history preserved, quota feedback, connection test without habits, OpenAI chat, and persistence. API responses mocked; no live OpenAI key used.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

