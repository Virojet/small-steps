const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const version=require(path.join(root,'package.json')).version;
const output=fs.mkdtempSync(path.join(os.tmpdir(),'small-steps-installer-'));
const release=path.join(root,'release');
const builder=path.join(root,'node_modules','electron-builder','out','cli','cli.js');

try{
 const result=spawnSync(process.execPath,[builder,'--win','nsis',`--config.directories.output=${output}`],{cwd:root,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exitCode=result.status||1;
 else{
  fs.mkdirSync(release,{recursive:true});
  for(const suffix of ['.exe','.exe.blockmap']){
   const name=`Small-Steps-Setup-${version}${suffix}`;
   const source=path.join(output,name);
   if(!fs.existsSync(source))throw Error(`Build completed without ${name}.`);
   fs.copyFileSync(source,path.join(release,name));
  }
  console.log(`Installer: ${path.join(release,`Small-Steps-Setup-${version}.exe`)}`);
 }
}finally{
 fs.rmSync(output,{recursive:true,force:true});
}
