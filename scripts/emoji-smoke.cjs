const {chromium}=require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');const {initialState}=require('../core.cjs');
const icons=['🌱','📖','🌿','✍','💧','☀','🧘','🎨','🎵','💪'];
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1180,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const seed=initialState();seed.theme='light';
 await page.addInitScript(seed=>{window.desktop={load:async()=>({state:seed,hasKey:true,isTest:true}),save:async()=>true,hasKey:async()=>true,chat:async()=>`Pick an icon for the habit (choose one): ${['🌱','📖','🌿','✍','💧','☀','🧘','🎨','🎵','💪'].join(' ')}`};},seed);
 await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/'));await page.locator('#add-habit').waitFor();
 await page.locator('#add-habit').click();assert.deepEqual(await page.locator('[name=icon] option').allTextContents(),icons);await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.locator('#emoji-picker-button').click();assert.deepEqual(await page.locator('[data-composer-emoji]').allTextContents(),icons);await page.getByRole('button',{name:'Insert 💧'}).click();assert.equal(await page.locator('#chat-input').inputValue(),'💧');
 await page.locator('#send').click();await page.getByText('Pick an icon for the habit',{exact:false}).waitFor();assert.deepEqual(await page.locator('.inline-emoji').allTextContents(),icons);
 await page.getByRole('button',{name:'Choose 🌿'}).click();assert.equal(await page.locator('#chat-input').inputValue(),'🌿');
 await page.locator('#emoji-picker-button').click();await page.screenshot({path:'test-results/emoji-picker.png'});await page.keyboard.press('Escape');assert.equal(await page.locator('#emoji-picker').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: one shared emoji set, composer insertion, clickable coach icons, cursor-safe draft, and Escape dismissal.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
