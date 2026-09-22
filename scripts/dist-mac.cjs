const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const macBuildEnv=require('./mac-build-env.cjs');

if(process.platform!=='darwin')throw Error('The macOS installer must be built on macOS. Use the macOS GitHub Actions workflow or run this command on a Mac.');

const root=path.resolve(__dirname,'..');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'small-steps-macos-'));
const release=path.join(root,'release');
const icon=path.join(output,'app-icon-mac.png');
const builder=path.join(root,'node_modules','electron-builder','out','cli','cli.js');

function run(command,args,env=process.env){
 const result=spawnSync(command,args,{cwd:root,stdio:'inherit',env});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(`${command} failed with exit code ${result.status}.`);
}

try{
 run('sips',['-z','1024','1024',path.join(root,'app-icon.png'),'--out',icon]);
 const buildEnv=macBuildEnv(process.env);
 run(process.execPath,[builder,'--mac','dmg','zip','--universal','--publish','never',`--config.directories.output=${output}`,`--config.mac.icon=${icon}`],buildEnv);
 const artifacts=fs.readdirSync(output,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.(dmg|zip)$/i.test(entry.name));
 if(artifacts.length!==2)throw Error('Build completed without both macOS distribution files.');
 fs.mkdirSync(release,{recursive:true});
 for(const artifact of artifacts)fs.copyFileSync(path.join(output,artifact.name),path.join(release,artifact.name));
 console.log(`macOS installers: ${artifacts.map(artifact=>path.join(release,artifact.name)).join(', ')}`);
}finally{
 fs.rmSync(output,{recursive:true,force:true});
}
