const { _electron:electron }=require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const env={...process.env,SMALL_STEPS_TEST:'1',SMALL_STEPS_DATA:path.resolve('.local/test-profile-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE;
const app=await electron.launch({args:[path.resolve('.')],executablePath:require('electron'),env});
try{const page=await app.firstWindow();await page.getByRole('button',{name:'New habit'}).waitFor();
await page.getByRole('button',{name:'Read one page'}).click();await page.getByRole('button',{name:'Create habit'}).click();
await page.getByRole('button',{name:'Complete Read every day',exact:true}).click();await page.getByRole('button',{name:'Undo Read every day',exact:true}).waitFor();
await page.reload();await page.getByRole('button',{name:'Undo Read every day',exact:true}).waitFor();
await page.getByRole('button',{name:'Undo Read every day',exact:true}).click();await page.getByRole('button',{name:'2-minute version'}).click();await page.getByRole('button',{name:'Tiny step done'}).waitFor();
await page.locator('[data-view=progress]').click();assert.equal(await page.locator('.heat-cell').count(),56);
await page.locator('[data-view=method]').click();await page.getByText('Give your habit a cue').waitFor();
await page.locator('[data-view=today]').click();
await page.getByRole('button',{name:'Edit identity'}).click();await page.locator('[name=identity]').fill('someone who makes time to learn');await page.getByRole('button',{name:'Save identity'}).click();await page.getByText('I’m someone who makes time to learn.').waitFor();
await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/desktop.png',fullPage:true});
console.log('PASS: create, full check-in, persistence, undo, tiny check-in, progress, method, identity.');
}finally{await app.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


