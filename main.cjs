const {app,BrowserWindow,ipcMain,safeStorage,dialog,session,shell,clipboard}=require('electron');
const fs=require('node:fs'); const path=require('node:path'); const {pathToFileURL}=require('node:url');
const {initialState,validateState}=require('./core.cjs');
const {migrateToOpenAI}=require('./core.cjs');
const {callOpenAI}=require('./openai.cjs');
const HabitCoach=require('./coach-protocol.js');

if(process.env.SMALL_STEPS_TEST==='1'&&process.env.SMALL_STEPS_DATA) app.setPath('userData',path.resolve(process.env.SMALL_STEPS_DATA));
let win; let busy=false;
const file=()=>path.join(app.getPath('userData'),'habits.json');
const secretFile=p=>{if(typeof p!=='string'||!/^[a-z0-9-]{1,50}$/.test(p))throw Error('Invalid provider.');return path.join(app.getPath('userData'),`key-${p}.bin`);};
function writeAtomic(target,data){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target+'.tmp',data);fs.renameSync(target+'.tmp',target);}
function readState(){try{return validateState(JSON.parse(fs.readFileSync(file(),'utf8')));}catch(e){if(e.code==='ENOENT')return initialState();throw Error('Your saved data could not be read. It has been preserved; restore a backup or repair habits.json.');}}
function getKey(){
 const sf=secretFile('openai');
 if(fs.existsSync(sf)){try{return safeStorage.decryptString(fs.readFileSync(sf));}catch{}}
 return '';
}
function setKey(key){
 if(typeof key!=='string')throw Error('Invalid API key.');
 const trimmed=key.trim();
 if(trimmed.length>500||/[\r\n]/.test(trimmed))throw Error('Invalid API key.');
 if(trimmed&&!/^sk-[A-Za-z0-9_-]{10,}$/.test(trimmed))throw Error('Enter an OpenAI API key beginning with sk-.');
 const sf=secretFile('openai');
 if(!trimmed){if(fs.existsSync(sf))fs.unlinkSync(sf);return;}
 if(!safeStorage.isEncryptionAvailable())throw Error('Secure storage is unavailable on this device.');
 writeAtomic(sf,safeStorage.encryptString(trimmed));
}
function getProviderLabel(p){const m={groq:'Groq',gemini:'Gemini',openrouter:'OpenRouter',github:'GitHub Models',openai:'OpenAI',anthropic:'Anthropic',custom:'Custom'};return m[p]||p;}
function getBaseUrl(p,customUrl){if(p==='groq')return 'https://api.groq.com/openai/v1';if(p==='openrouter')return 'https://openrouter.ai/api/v1';if(p==='github')return 'https://models.inference.ai.azure.com';if(p==='openai')return 'https://api.openai.com/v1';if(customUrl&&customUrl.trim())return customUrl.trim();return 'http://localhost:11434/v1';}
async function callGemini(messages,state,key,systemInstruction){
 let response;
 try{response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:systemInstruction}]},contents:messages.map(m=>({role:m.role==='model'?'model':'user',parts:[{text:m.text}]})),generationConfig:{maxOutputTokens:1200}}),signal:AbortSignal.timeout(45000)});}catch(e){throw Error(e.name==='TimeoutError'?'Gemini took too long. Please try again.':'Could not reach Gemini. Check your internet connection.');}
 if(!response.ok){if([400,401,403].includes(response.status))throw Error('Gemini rejected the API key or request. Update the key in Settings and verify its Gemini API access.');if(response.status===429)throw Error('Gemini quota or rate limit reached. Check your Google AI Studio quota or switch to Groq in Settings.');if(response.status===404)throw Error('This Gemini model is unavailable. Choose another model in Settings.');throw Error('Gemini is unavailable right now. Please try again later.');}
 const data=await response.json();const text=(data.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');if(!text)throw Error('Gemini did not return a response. Try rephrasing your message.');return text;
}
async function callAnthropic(messages,state,key,systemInstruction){
 let response;
 try{response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:state.model,max_tokens:1200,system:systemInstruction,messages:messages.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text}))}),signal:AbortSignal.timeout(45000)});}catch(e){throw Error(e.name==='TimeoutError'?'Anthropic took too long. Please try again.':'Could not reach Anthropic. Check your internet connection.');}
 if(!response.ok){const errData=await response.json().catch(()=>null);const msg=errData?.error?.message||`Anthropic returned status ${response.status}.`;if([401,403].includes(response.status))throw Error('Anthropic rejected the API key. Verify your key in Settings.');if(response.status===429)throw Error('Anthropic rate limit reached. Please try again shortly.');throw Error(msg);}
 const data=await response.json();const text=(data.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');if(!text)throw Error('Anthropic did not return a response. Try rephrasing your message.');return text;
}
async function callOpenAICompatible(messages,state,key,systemInstruction,provider){
 const base=getBaseUrl(provider,state.baseUrl).replace(/\/chat\/completions\/?$/,'').replace(/\/+$/,'');
 const url=`${base}/chat/completions`;
 const headers={'Content-Type':'application/json'};
 if(key)headers['Authorization']=`Bearer ${key}`;
 if(provider==='openrouter'){headers['HTTP-Referer']='https://smallsteps.app';headers['X-Title']='Small Steps Habit Tracker';}
 let response;
 try{response=await fetch(url,{method:'POST',headers,body:JSON.stringify({model:state.model,messages:[{role:'system',content:systemInstruction},...messages.map(m=>({role:m.role==='model'?'assistant':'user',content:m.text}))],max_tokens:1200}),signal:AbortSignal.timeout(45000)});}catch(e){throw Error(e.name==='TimeoutError'?`${getProviderLabel(provider)} took too long. Please try again.`:`Could not reach ${getProviderLabel(provider)} at ${base}. Check connection or URL.`);}
 if(!response.ok){const errData=await response.json().catch(()=>null);const detail=errData?.error?.message||errData?.message;if([401,403].includes(response.status))throw Error(`${getProviderLabel(provider)} rejected the API key. Please verify your key in Settings.`);if(response.status===429)throw Error(`${getProviderLabel(provider)} rate limit or quota exceeded. ${detail||'Please try again in a moment.'}`);if(response.status===404)throw Error(`Model "${state.model}" was not found on ${getProviderLabel(provider)}. Check the model name in Settings.`);throw Error(detail?`${getProviderLabel(provider)} error: ${detail}`:`${getProviderLabel(provider)} returned HTTP ${response.status}.`);}
 const data=await response.json();const text=data.choices?.[0]?.message?.content||'';if(!text)throw Error(`${getProviderLabel(provider)} returned an empty response. Try rephrasing your message.`);return text;
}
async function callAI(messages,state,attachment){
 const key=getKey();
 if(!key)throw Error('Add your OpenAI API key in Settings to start coaching.');
 const context=state.includeHabitContext===false?{}:{identity:state.identity,habits:state.habits};
 const attached=attachment?.mode==='edit'?state.habits.find(h=>h.id===attachment.habitId):null;
 if(attachment?.mode==='edit'&&!attached)throw Error('This habit no longer exists. Choose another habit.');
 const contextAttachment=attached?{mode:'edit',habitId:attached.id,values:HabitCoach.snapshot(attached)}:attachment?.mode==='new'?{mode:'new'}:null;
 const systemInstruction=HabitCoach.instructions(contextAttachment)+' Today is '+new Date().toDateString()+'. User context: '+JSON.stringify(context);
 return await callOpenAI(messages,'gpt-5-mini',key,systemInstruction);
}
function handle(name,fn){ipcMain.handle(name,async(event,...args)=>{if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame)throw Error('Unauthorized request');return fn(...args);});}
function createWindow(){
 const icon=path.join(__dirname,process.platform==='win32'?'app-icon.ico':'app-icon.png');
 win=new BrowserWindow({width:1440,height:940,minWidth:980,minHeight:700,title:'Small Steps',icon,backgroundColor:'#171918',autoHideMenuBar:true,show:!process.env.SMALL_STEPS_TEST,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(details=>{if(details.url.startsWith('http://')||details.url.startsWith('https://'))shell.openExternal(details.url);return {action:'deny'};});
 win.webContents.on('will-navigate',(e,url)=>{if(url!==win.webContents.getURL()){e.preventDefault();if(url.startsWith('http://')||url.startsWith('https://'))shell.openExternal(url);}});
 return win.loadFile('index.html');
}
app.whenReady().then(async()=>{
 fs.mkdirSync(app.getPath('userData'),{recursive:true});
 const savedState=readState();
 const migrateSavedState=savedState.provider!=='openai'||savedState.model!=='gpt-5-mini'||savedState.baseUrl!=='';
 if(migrateSavedState) {
  if(fs.existsSync(file()))writeAtomic(file()+'.before-openai.backup',fs.readFileSync(file()));
  writeAtomic(file(),JSON.stringify(migrateToOpenAI(savedState),null,2));
 }
 session.defaultSession.setPermissionRequestHandler((w,p,cb)=>cb(false));
 handle('load',()=>{const s=readState();return {state:s,hasKey:Boolean(getKey()),showSetup:process.argv.includes('--setup-openai'),isTest:Boolean(process.env.SMALL_STEPS_TEST)};});
 handle('save',s=>{writeAtomic(file(),JSON.stringify(migrateToOpenAI(validateState(s)),null,2));return true;});
 handle('key',k=>{setKey(k);return true;});
 handle('hasKey',()=>Boolean(getKey()));
 handle('testOpenAI',async()=>{const s=migrateToOpenAI(readState());if(busy)throw Error('Wait for the current reply before testing.');busy=true;try{await callOpenAI([{role:'user',text:'Reply with: Connected.'}],s.model,getKey(),'This is a connection test. Respond in a single short sentence.');return {model:s.model};}finally{busy=false;}});
 handle('openExternal',async url=>{if(typeof url==='string'&&(url.startsWith('https://')||url.startsWith('http://'))){await shell.openExternal(url);return true;}return false;});
 handle('copyText',text=>{if(typeof text!=='string'||text.length>20000)throw Error('Invalid text to copy.');clipboard.writeText(text);return true;});
 handle('chat',async (messages,attachment)=>{if(busy)throw Error('A response is already on its way.');if(!Array.isArray(messages)||!messages.length||messages.length>40||messages.some(m=>!['user','model'].includes(m.role)||typeof m.text!=='string'||m.text.length>20000))throw Error('Invalid conversation.');busy=true;try{return await callAI(messages,readState(),attachment);}finally{busy=false;}});
 handle('export',async()=>{const r=await dialog.showSaveDialog(win,{defaultPath:'small-steps-backup.json',filters:[{name:'JSON backup',extensions:['json']}]});if(r.canceled)return false;writeAtomic(r.filePath,JSON.stringify(readState(),null,2));return true;});
 handle('import',async()=>{const r=await dialog.showOpenDialog(win,{filters:[{name:'JSON backup',extensions:['json']}],properties:['openFile']});if(r.canceled)return null;const s=migrateToOpenAI(validateState(JSON.parse(fs.readFileSync(r.filePaths[0],'utf8'))));const answer=await dialog.showMessageBox(win,{type:'question',buttons:['Cancel','Restore backup'],defaultId:0,message:'Replace current habits and chat with this backup?'});if(answer.response!==1)return null;writeAtomic(file()+'.backup',JSON.stringify(readState()));writeAtomic(file(),JSON.stringify(s,null,2));return s;});
 await createWindow();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
