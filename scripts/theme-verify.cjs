const {_electron:electron}=require('C:/Users/ltgre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {initialState,dateKey,shiftDay}=require('../core.cjs');

(async()=>{
 const profile=path.resolve('.local/theme-verify-'+Date.now());fs.mkdirSync(profile,{recursive:true});
 const today=dateKey(),seed=initialState();
 seed.theme='dark';
 const templates=[
  ['Morning Meditation','🧘','Morning','take five slow breaths','I sit at my desk'],
  ['Read Atomic Habits','📖','Morning','read one page','I pour my morning coffee'],
  ['Afternoon Stretch','🌿','Afternoon','stretch for two minutes','I close my laptop'],
  ['Reflect & Journal','✍','Evening','write one sentence','I brush my teeth']
 ];
 seed.habits=templates.map(([name,icon,time,tiny,cue],i)=>({
  id:`theme-habit-${i}`,name,icon,time,tiny,cue,
  reward:'A small vote for who you are becoming.',
  created:shiftDay(today,-28),
  logs:Object.fromEntries(Array.from({length:28},(_,n)=>n).filter(n=>(n+i)%4!==0).map(n=>[shiftDay(today,-n-1),n%2===0?'tiny':'full']))
 }));
 seed.habits[0].logs[today]='full';
 seed.journal={[today]:{mood:'good',note:'Feeling energized and consistent.'}};
 fs.writeFileSync(path.join(profile,'habits.json'),JSON.stringify(seed));

 const env={...process.env,SMALL_STEPS_TEST:'1',SMALL_STEPS_DATA:profile};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({args:[path.resolve('.')],executablePath:require('electron'),env});

 try{
  const page=await app.firstWindow();
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());
  fs.mkdirSync('test-results',{recursive:true});

  // 1. Dark Mode Today View
  await page.getByText('Small steps. Real change.').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),'dark');
  await page.screenshot({path:'test-results/theme-dark-today.png'});

  // 2. Dark Mode Progress View
  await page.locator('[data-view=progress]').click();
  await page.locator('.chart-card').first().waitFor();
  await page.screenshot({path:'test-results/theme-dark-progress.png'});

  // 3. Dark Mode Journal View
  await page.locator('[data-view=journal]').click();
  await page.locator('.journal-card').waitFor();
  await page.screenshot({path:'test-results/theme-dark-journal.png'});

  // 4. Toggle to Light Mode via Theme Button
  await page.locator('#theme-toggle').click();
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),'light');
  assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).theme,'light');
  await page.screenshot({path:'test-results/theme-light-journal.png'});

  // 5. Light Mode Today View
  await page.locator('[data-view=today]').click();
  await page.getByText('Small steps. Real change.').waitFor();
  await page.screenshot({path:'test-results/theme-light-today.png'});

  // 6. Light Mode Progress View
  await page.locator('[data-view=progress]').click();
  await page.locator('.chart-card').first().waitFor();
  await page.screenshot({path:'test-results/theme-light-progress.png'});

  // 7. Light Mode Habit Library View
  await page.locator('[data-view=library]').click();
  await page.getByText('Good habits start here.').waitFor();
  await page.screenshot({path:'test-results/theme-light-library.png'});

  // 8. Test reload to ensure Light theme persists
  await page.reload();
  await page.getByText('Small steps. Real change.').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),'light');

  // 9. Toggle back to Dark mode using keyboard shortcut 'M'
  await page.locator('[data-view=today]').click();
  await page.keyboard.press('m');
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),'dark');
  assert.equal(JSON.parse(fs.readFileSync(path.join(profile,'habits.json'))).theme,'dark');

  // 10. Open Command Palette in Dark Mode and take screenshot
  await page.keyboard.press('Control+k');
  await page.locator('.command-dialog').waitFor();
  await page.screenshot({path:'test-results/theme-dark-command.png'});
  await page.keyboard.press('Escape');

  console.log('PASS: All theme toggle, persistence, light/dark styling, and screenshot captures succeeded!');
 }finally{
  await app.close();
 }
})().catch(e=>{
 console.error(e);
 process.exitCode=1;
});
