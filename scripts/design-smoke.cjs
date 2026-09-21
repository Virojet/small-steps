const {_electron:electron}=require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {initialState,dateKey,shiftDay}=require('../core.cjs');
(async()=>{
 const profile=path.resolve('.local/design-test-'+Date.now());fs.mkdirSync(profile,{recursive:true});
 const today=dateKey(),seed=initialState();
 const templates=[['Reading ritual','📖','Morning','read one page','I make coffee'],['A little movement','🌿','Afternoon','stretch for two minutes','I close my laptop'],['Pause and reflect','✍','Evening','write one sentence','I brush my teeth']];
 seed.habits=templates.map(([name,icon,time,tiny,cue],i)=>({id:`test-${i}`,name,icon,time,tiny,cue,reward:'A little moment for you.',created:shiftDay(today,-35),logs:Object.fromEntries(Array.from({length:35},(_,n)=>n).filter(n=>(n+i)%5!==0).map(n=>[shiftDay(today,-n-1),n%3===0?'tiny':'full']))}));
 fs.writeFileSync(path.join(profile,'habits.json'),JSON.stringify(seed));
 const env={...process.env,SMALL_STEPS_TEST:'1',SMALL_STEPS_DATA:profile};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({args:[path.resolve('.')],executablePath:require('electron'),env});
 try{
  const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());
  await page.getByText('Small steps. Real change.').waitFor();assert.equal(await page.locator('.habit').count(),3);
  await page.getByRole('button',{name:'Complete Reading ritual',exact:true}).click();await page.getByRole('button',{name:'Undo Reading ritual',exact:true}).waitFor();
  await page.locator('#toast').getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Complete Reading ritual',exact:true}).waitFor();
  await page.getByRole('button',{name:'Complete Reading ritual',exact:true}).click();await page.locator('[data-filter=todo]').click();assert.equal(await page.locator('.habit').count(),2);
  await page.locator('#habit-search').fill('movement');assert.equal(await page.locator('.habit').count(),1);await page.locator('#habit-search').fill('');await page.locator('[data-filter=all]').click();
  await page.locator('#prev-week').click();assert.notEqual(await page.locator('.day.selected').getAttribute('data-day'),today);await page.locator('#jump-today').click();
  await page.getByRole('button',{name:'Start focus for A little movement',exact:true}).click();await page.getByRole('button',{name:'Start focus',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('button',{name:'Minimize',exact:true}).click();assert.equal(await page.locator('#focus-dock').isVisible(),true);await page.locator('#expand-focus').click();await page.getByRole('button',{name:'Mark tiny step done',exact:true}).click();await page.locator('[data-habit="test-1"] .tiny').getByText('Tiny step done',{exact:false}).waitFor();
  await page.locator('#toast').evaluate(el=>el.style.display='none');await page.locator('main').evaluate(el=>el.scrollTop=0);fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/redesign-today.png',animations:'disabled'});
  await page.locator('[data-view=journal]').click();await page.locator('[data-mood=good]').click();await page.locator('#journal-note').fill('A little progress is still progress.');await page.locator('#save-reflection').click();await page.getByText('A little moment, kept.').waitFor();await page.reload();await page.locator('[data-view=journal]').click();assert.equal(await page.locator('#journal-note').inputValue(),'A little progress is still progress.');
  await page.locator('[data-view=progress]').click();await page.locator('[data-range="30"]').click();assert.equal(await page.locator('.chart-day').count(),30);await page.screenshot({path:'test-results/redesign-progress.png',animations:'disabled'});await page.locator('.heat-cell').first().click();await page.getByText('Small steps. Real change.').waitFor();
  await page.keyboard.press('Control+k');await page.locator('#command-query').fill('library');await page.keyboard.press('Enter');await page.getByText('Good habits start here.').waitFor();assert.equal(await page.locator('.template-card').count(),6);await page.locator('[data-template=water]').click();await page.getByRole('button',{name:'Create habit',exact:true}).click();assert.ok(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).habits.some(h=>h.name==='Start with a glass of water'));
  await page.locator('[data-view=method]').click();await page.screenshot({path:'test-results/redesign-method.png',animations:'disabled'});await page.locator('#toggle-coach').click();assert.equal(await page.locator('.coach').isVisible(),false);await page.keyboard.press('Control+/');assert.equal(await page.locator('.coach').isVisible(),true);
  await page.locator('#chat-context').click();await page.locator('[data-context="test-0"]').click();assert.match(await page.locator('#chat-input').inputValue(),/Reading ritual/);
  await page.locator('#settings').click();await page.locator('#setting-key').waitFor();await page.getByRole('button',{name:'Close',exact:true}).click();
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(980,740));await page.locator('[data-view=today]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'test-results/redesign-compact.png',animations:'disabled'});
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.little-star').evaluate(el=>getComputedStyle(el).animationName),'none');
  const brand=fs.readFileSync('brand.svg','utf8').replace('<svg ','<svg style="display:block;width:256px;height:256px" ');
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${brand}`);
  const png=await page.screenshot({path:'app-icon.png',clip:{x:0,y:0,width:256,height:256},omitBackground:true,animations:'disabled'});const icoHeader=Buffer.alloc(22);icoHeader.writeUInt16LE(1,2);icoHeader.writeUInt16LE(1,4);icoHeader.writeUInt16LE(1,10);icoHeader.writeUInt16LE(32,12);icoHeader.writeUInt32LE(png.length,14);icoHeader.writeUInt32LE(22,18);fs.writeFileSync('app-icon.ico',Buffer.concat([icoHeader,png]));
  assert.deepEqual(errors,[]);console.log('PASS: completion and undo, filters/search, week navigation, focus/pause/minimize/check-in, reflection persistence, chart drill-down, templates, command palette, contextual chat draft, settings, compact layout, reduced motion; no renderer errors.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
