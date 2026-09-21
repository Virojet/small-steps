const fs=require('node:fs');const path=require('node:path');
const electron=path.dirname(require('electron'));const root=path.resolve(__dirname,'..');const dest=path.join(root,'dist','Small Steps');
fs.mkdirSync(dest,{recursive:true});
if(!process.argv.includes('--app-only')){fs.cpSync(electron,dest,{recursive:true});fs.renameSync(path.join(dest,'electron.exe'),path.join(dest,'Small Steps.exe'));}
const app=path.join(dest,'resources','app');fs.mkdirSync(app,{recursive:true});
for(const file of ['package.json','main.cjs','preload.cjs','core.cjs','openai.cjs','index.html','renderer.js','style.css','composer.css','design.css','refinement.css','experience.css','experience.js','coach-protocol.js','chat-store.js','conversations.js','coach-habits.js','brand.svg','app-icon.ico'])fs.copyFileSync(path.join(root,file),path.join(app,file));
console.log('Packaged: '+path.join(dest,'Small Steps.exe'));
