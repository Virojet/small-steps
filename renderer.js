const $=s=>document.querySelector(s); const api=window.desktop;
let state,hasKey=false,selected=dayKey(),view='today',chatBusy=false;
function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function shift(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function streak(h){let d=h.logs[dayKey()]?dayKey():shift(dayKey(),-1),n=0;while(h.logs[d]){n++;d=shift(d,-1);}return n;}
function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',4500);}
let saveQueue=Promise.resolve();
function save(){ChatStore.sync(state);const snapshot=structuredClone(state);saveQueue=saveQueue.catch(()=>{}).then(()=>api.save(snapshot));return saveQueue.catch(e=>{toast('Could not save: '+e.message);throw e;});}
function active(date){return state.habits.filter(h=>h.created<=date);}
function rate(days){let total=0,done=0;for(let i=0;i<days;i++){const d=shift(dayKey(),-i);for(const h of active(d)){total++;if(h.logs[d])done++;}}return total?Math.round(done/total*100):0;}
function render(){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#view-label').textContent={today:'TODAY',progress:'YOUR PROGRESS',method:'THE METHOD'}[view];if(view==='today')renderToday();if(view==='progress')renderProgress();if(view==='method')renderMethod();}
function renderToday(){const today=dayKey(),habits=active(selected),done=habits.filter(h=>h.logs[selected]).length;const weekStart=shift(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
 $('#content').innerHTML=`<div class="eyebrow">${new Date(selected+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase()}</div><div class="title-row"><div><h1>A little better, every day.</h1><p class="subheading">Small actions. Stronger habits. A more intentional you.</p></div><button class="primary" id="add-habit">＋ New habit</button></div><div class="identity"><div class="identity-icon">◎</div><div><div class="eyebrow">THE PERSON I’M BECOMING</div><h2>I’m ${esc(state.identity)}.</h2></div><button class="icon-button" id="edit-identity" aria-label="Edit identity">↗</button></div><div class="stats"><div class="stat"><div class="stat-label">${selected===today?'Today’s':'Day’s'} small wins <span>↗</span></div><div class="stat-value">${done} <small>/ ${habits.length}</small></div><div class="stat-note">${done&&done===habits.length?'You showed up. Take it in.':'Every check-in is a vote for you'}</div></div><div class="stat"><div class="stat-label">Longest current streak</div><div class="stat-value">${Math.max(0,...state.habits.map(streak))} <small>days</small></div><div class="stat-note">Build momentum, one day at a time</div></div><div class="stat"><div class="stat-label">Last 7 days</div><div class="stat-value">${rate(7)}<small>%</small></div><div class="stat-note">Consistency over perfection</div></div></div><div class="section-title"><h2>Your daily rhythm</h2><span>${new Date(weekStart+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(shift(weekStart,6)+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div><div class="week">${Array.from({length:7},(_,i)=>{const d=shift(weekStart,i);return `<button class="day ${selected===d?'selected':''}" data-day="${d}" ${d>today?'disabled':''}><span>${['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}</span><b>${Number(d.slice(-2))}</b></button>`;}).join('')}</div>${habits.length?['Morning','Afternoon','Evening','Anytime'].map(time=>{const hs=habits.filter(h=>h.time===time);return hs.length?`<div class="period">${{Morning:'☀',Afternoon:'◷',Evening:'☾',Anytime:'◌'}[time]} &nbsp; ${time.toUpperCase()}</div>${hs.map(h=>`<div class="habit ${h.logs[selected]?'done':''}"><div class="habit-emoji">${esc(h.icon)}</div><div class="habit-copy"><div class="habit-name">${esc(h.name)}</div><div class="habit-cue">After ${esc(h.cue)}, I will ${esc(h.tiny)}.</div><div class="habit-meta"><button class="tiny" data-tiny="${esc(h.id)}" title="Check in with your two-minute version">${h.logs[selected]==='tiny'?'✓ Tiny step done':'↗ 2-minute version'}</button><span class="streak">${streak(h)?'✦ '+streak(h)+' day streak':'A fresh start'}</span></div>${!h.logs[selected]&&h.created<selected&&!h.logs[shift(selected,-1)]?'<div class="recovery">Missed yesterday? Make today’s step tiny.</div>':''}</div><button class="icon-button edit" data-edit="${esc(h.id)}" aria-label="Edit ${esc(h.name)}">⋯</button><button class="check" data-check="${esc(h.id)}" aria-label="${h.logs[selected]?'Undo':'Complete'} ${esc(h.name)}" aria-pressed="${!!h.logs[selected]}">✓</button></div>`).join('')}`:'';}).join(''):`<div class="empty"><div class="sprout">✳</div><h3>Your next chapter starts small.</h3><p>Add your first habit, or start with a little inspiration.</p><div class="starter-buttons"><button class="secondary" data-starter="read">📖 Read one page</button><button class="secondary" data-starter="move">🌿 Move for 2 minutes</button><button class="secondary" data-starter="reflect">✍ Write one sentence</button></div></div>`}<div class="tip"><span>☼</span><div><strong>Make showing up the goal.</strong>Your two-minute version counts. Establish the habit first; build on it later.</div></div>`;
 $('#add-habit').onclick=()=>habitModal();$('#edit-identity').onclick=identityModal;
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selected=b.dataset.day;render();});
 document.querySelectorAll('[data-check],[data-tiny]').forEach(b=>b.onclick=async()=>{const h=state.habits.find(h=>h.id===(b.dataset.check||b.dataset.tiny));const tiny=!!b.dataset.tiny;if(h.logs[selected]&&(!tiny||h.logs[selected]==='tiny'))delete h.logs[selected];else h.logs[selected]=tiny?'tiny':'full';await save();render();if(h.logs[selected])toast(h.reward||'A small vote for the person you’re becoming.');});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>habitModal(state.habits.find(h=>h.id===b.dataset.edit)));
 document.querySelectorAll('[data-starter]').forEach(b=>b.onclick=()=>habitModal(null,b.dataset.starter));
}
function renderProgress(){$('#content').innerHTML=`<div class="eyebrow">THE BIGGER PICTURE</div><h1>Look how far you’ve come.</h1><p class="subheading">A record of showing up, not a measure of your worth.</p><div class="cards"><div class="method-card"><div class="section-title"><h2>The last 8 weeks</h2><span>${rate(56)}% completion</span></div><div class="heatmap">${Array.from({length:56},(_,i)=>{const d=shift(dayKey(),i-55),hs=active(d),n=hs.filter(h=>h.logs[d]).length;return `<div class="heat-cell ${n?(n===hs.length?'full':'partial'):''}" title="${d}: ${n}/${hs.length} habits completed" aria-label="${d}: ${n} of ${hs.length} completed"></div>`;}).join('')}</div><div class="legend">Pale: no check-ins · Light green: some · Dark green: all habits</div></div><div class="method-card"><h3>Your habit milestones</h3>${state.habits.length?state.habits.map(h=>`<div class="progress-row"><span>${esc(h.icon)} ${esc(h.name)}</span><span>${Object.keys(h.logs).length} check-ins · ${streak(h)} day streak</span></div>`).join(''):'<p>Your first check-in is the beginning of your story.</p>'}</div></div>`;}
function renderMethod(){$('#content').innerHTML=`<div class="eyebrow">A SYSTEM FOR SHOWING UP</div><h1>Build habits that stick.</h1><p class="subheading">Practical ideas inspired by James Clear’s Atomic Habits.</p><div class="cards">${[['01 · Make it obvious','Give your habit a cue','Attach a new action to something you already do: “After I make coffee, I will read one page.” Put what you need in plain sight.'],['02 · Make it attractive','Give yourself something to look forward to','Pair a habit with something you enjoy. Save a favorite playlist for your walk or choose a book you actually want to read.'],['03 · Make it easy','Start with two minutes','Shrink the first step until it feels approachable. Opening your journal and writing one sentence is a real check-in.'],['04 · Make it satisfying','Notice your small wins','Check off the habit right after you do it. Pick a simple reward and let yourself enjoy the progress.'],['Keep returning','Never miss twice','A missed day is information, not a failure. Return with the smallest possible version. You don’t need to make up for yesterday.']].map(([n,t,p])=>`<div class="method-card"><div class="eyebrow">${n}</div><h3>${t}</h3><p>${p}</p></div>`).join('')}<p class="legend">Independent app, not affiliated with James Clear. Reference: jamesclear.com/habit-tracker and jamesclear.com/habit-stacking.</p></div>`;}
function openModal(html){$('#modal-body').innerHTML=html;$('#modal').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#modal').close());}
// Dismiss only a deliberate backdrop click, not a drag out of the dialog.
let modalBackdropPress=false;
function isModalBackdrop(event){
 const modal=$('#modal'),box=modal.getBoundingClientRect();
 return event.target===modal&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom);
}
$('#modal').addEventListener('pointerdown',event=>{modalBackdropPress=event.button===0&&isModalBackdrop(event);});
$('#modal').addEventListener('click',event=>{
 const dismiss=modalBackdropPress&&isModalBackdrop(event);modalBackdropPress=false;
 if(dismiss&&$('#modal').dispatchEvent(new Event('cancel',{cancelable:true})))$('#modal').close();
});
$('#modal').addEventListener('close',()=>{modalBackdropPress=false;});
function habitModal(h,preset){const presets={read:{name:'Read every day',tiny:'read one page',cue:'I pour my morning coffee',icon:'📖',time:'Morning',reward:'Enjoy your coffee and a quiet moment.'},move:{name:'Make time to move',tiny:'stretch for two minutes',cue:'I close my laptop',icon:'🌿',time:'Afternoon',reward:'Play a favorite song.'},reflect:{name:'A moment to reflect',tiny:'write one sentence',cue:'I brush my teeth',icon:'✍',time:'Evening',reward:'Take a slow breath and enjoy the pause.'}};const v=h||presets[preset]||{name:'',tiny:'',cue:'',reward:'',icon:'🌱',time:'Morning'};
 openModal(`<div class="eyebrow">START SMALL. KEEP GOING.</div><h2>${h?'Shape your habit':'Plant a new habit'}</h2><form id="habit-form"><label class="field">What habit do you want to build?<input name="name" value="${esc(v.name)}" placeholder="Read every day" maxlength="100" required></label><label class="field">Make it obvious · After I…<input name="cue" value="${esc(v.cue)}" placeholder="pour my morning coffee" maxlength="200" required></label><label class="field">Make it easy · I will…<input name="tiny" value="${esc(v.tiny)}" placeholder="read one page" maxlength="200" required><small>Choose a first step that takes two minutes or less.</small></label><label class="field">Make it attractive & satisfying · My little reward<input name="reward" value="${esc(v.reward)}" placeholder="Enjoy my favorite cup of tea" maxlength="200"></label><div class="form-grid"><label class="field">Time of day<select name="time">${['Morning','Afternoon','Evening','Anytime'].map(t=>`<option ${t===v.time?'selected':''}>${t}</option>`).join('')}</select></label><label class="field">A little personality<select name="icon">${HabitCoach.icons.map(i=>`<option ${i===v.icon?'selected':''}>${i}</option>`).join('')}</select></label></div><div class="actions">${h?'<button type="button" class="secondary danger" id="delete-habit">Delete habit</button>':''}<button type="button" class="secondary" data-close>Cancel</button><button class="primary">${h?'Save changes':'Create habit'}</button></div></form>`);
 $('#habit-form').onsubmit=async e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));for(const k of Object.keys(values))values[k]=values[k].trim();if(!values.name||!values.cue||!values.tiny)return toast('Add a habit, a cue, and a small first step.');if(h)Object.assign(h,values);else state.habits.push({...values,id:crypto.randomUUID(),created:dayKey(),logs:{}});await save();selected=dayKey();$('#modal').close();render();};
 if(h)$('#delete-habit').onclick=()=>removeHabit(h.id);
}
function removeHabit(id){
 const habit=state.habits.find(h=>h.id===id);if(!habit)return;
 openModal('<h2>Remove this habit?</h2><p>Removing “'+esc(habit.name)+'” will permanently delete the habit and all its check-in history. This cannot be undone.</p><div class="actions"><button class="secondary" data-close autofocus>Keep habit</button><button class="primary" id="confirm-delete">Remove habit</button></div><p id="remove-error" role="status"></p>');
 $('#modal [data-close]').focus();
 $('#confirm-delete').onclick=async()=>{
  const button=$('#confirm-delete');if(button.disabled)return;button.disabled=true;
  const previous=state.habits;state.habits=state.habits.filter(h=>h.id!==id);
  try{await save();$('#modal').close();render();if(typeof showHabitAttachment==='function')showHabitAttachment();toast('Habit removed.');}
  catch{state.habits=previous;button.disabled=false;const error=$('#remove-error');if(error)error.textContent='Could not remove the habit. Please try again.';}
 };
}
function identityModal(){openModal(`<h2>Who are you becoming?</h2><p>Focus on the kind of person you want to be. Each small action is a vote for that identity.</p><form id="identity-form"><label class="field">I’m…<input name="identity" maxlength="200" value="${esc(state.identity)}" required></label><div class="actions"><button type="button" class="secondary" data-close>Cancel</button><button class="primary">Save identity</button></div></form>`);$('#identity-form').onsubmit=async e=>{e.preventDefault();const v=new FormData(e.target).get('identity').trim();if(!v)return;state.identity=v;await save();$('#modal').close();render();};}
function applyTheme(theme){
 const t=(theme==='light'||theme==='dark')?theme:'dark';
 document.documentElement.setAttribute('data-theme',t);
 const btn=$('#theme-toggle');
 if(btn){
  if(typeof ico==='function')btn.innerHTML=ico(t==='dark'?'sun':'moon');
  btn.title=t==='dark'?'Switch to Light mode (M)':'Switch to Dark mode (M)';
 }
}
async function toggleTheme(){
 const current=state?.theme||document.documentElement.getAttribute('data-theme')||'dark';
 const next=current==='dark'?'light':'dark';
 if(state)state.theme=next;
 applyTheme(next);
 if(state){try{await save();toast(`Switched to ${next==='dark'?'Dark':'Light'} theme.`);}catch{}}
}
let audioCtx=null;
function playChime(type='success'){
 if(state&&state.soundEnabled===false)return;
 try{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;
  if(!audioCtx)audioCtx=new AudioCtx();
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime;
  const freqs=type==='celebrate'?[523.25,659.25,783.99,1046.50]:[523.25,659.25,783.99];
  freqs.forEach((freq,i)=>{
   const osc=audioCtx.createOscillator();
   const gain=audioCtx.createGain();
   osc.type='sine';
   osc.frequency.setValueAtTime(freq,now+i*0.07);
   gain.gain.setValueAtTime(0,now+i*0.07);
   gain.gain.linearRampToValueAtTime(0.12,now+i*0.07+0.02);
   gain.gain.exponentialRampToValueAtTime(0.0001,now+i*0.07+0.42);
   osc.connect(gain);
   gain.connect(audioCtx.destination);
   osc.start(now+i*0.07);
   osc.stop(now+i*0.07+0.45);
  });
 }catch{}
}
function applySoundState(enabled){
 const btn=$('#sound-toggle');
 if(!btn)return;
 const on=enabled!==false;
 if(typeof ico==='function')btn.innerHTML=ico(on?'volume':'volumex');
 btn.title=on?'Mute sounds (S)':'Unmute sounds (S)';
 btn.setAttribute('aria-pressed',String(on));
}
async function toggleSound(){
 if(!state)return;
 const next=state.soundEnabled===false?true:false;
 state.soundEnabled=next;
 applySoundState(next);
 if(next)playChime();
 try{await save();toast(`Sound effects ${next?'enabled':'muted'}.`);}catch{}
}
function updateCoachBanner(){
 const banner=$('#coach-key-banner');
 if(!banner)return;
 const needsKey=(state?.provider==='openai'||!state?.provider)&&!hasKey;
 if(!needsKey){banner.hidden=true;banner.innerHTML='';return;}
 banner.hidden=false;
 banner.innerHTML=`<h4>Add your OpenAI API key</h4><p>Habit Coach uses your own key, stored securely on this device.</p><div class="coach-key-banner-row"><input type="password" id="quick-key" placeholder="Paste your sk-... API key" autocomplete="off"><button class="primary" id="save-quick-key">Connect</button></div>`;
 $('#save-quick-key').onclick=async()=>{
  const k=$('#quick-key').value.trim();
  if(!k)return toast('Please enter an OpenAI API key.');
  try{
   await api.saveKey(k,'openai');
   hasKey=true;
   banner.hidden=true;
   toast('Habit coach connected and ready.');
   updateCoachBadges();
  }catch(e){toast(e.message);}
 };
}
const PROVIDERS={
 groq:{name:'Groq Cloud (Fastest & Generous Free Quota)',badge:'GROQ CLOUD',models:['llama-3.3-70b-versatile','llama-3.1-8b-instant','mixtral-8x7b-32768','gemma2-9b-it'],defaultModel:'llama-3.3-70b-versatile',url:'https://console.groq.com/keys',hint:'Free API key at console.groq.com (no card required). Huge daily limits, instant replies.'},
 gemini:{name:'Google Gemini (Free 1,500 req/day on Flash)',badge:'GOOGLE GEMINI',models:['gemini-2.0-flash','gemini-1.5-flash','gemini-1.5-pro'],defaultModel:'gemini-2.0-flash',url:'https://aistudio.google.com/',hint:'Free API key at aistudio.google.com. 1,500 requests per day on Flash models.'},
 openrouter:{name:'OpenRouter (Free Community Models)',badge:'OPENROUTER',models:['meta-llama/llama-3.3-70b-instruct:free','google/gemini-2.0-flash-exp:free','mistralai/mistral-7b-instruct:free','deepseek/deepseek-chat'],defaultModel:'meta-llama/llama-3.3-70b-instruct:free',url:'https://openrouter.ai/keys',hint:'API key from openrouter.ai. Access free models ending in :free.'},
 github:{name:'GitHub Models (Free with GitHub Account)',badge:'GITHUB MODELS',models:['gpt-4o-mini','meta-llama-3.3-70b-instruct','mistral-large-2407','gpt-4o'],defaultModel:'gpt-4o-mini',url:'https://github.com/settings/tokens',hint:'Free with a GitHub Personal Access Token (PAT).'},
 openai:{name:'OpenAI',badge:'POWERED BY OPENAI',models:['gpt-5-mini'],defaultModel:'gpt-5-mini',url:'https://platform.openai.com/api-keys',hint:'Create a project API key named Small Steps at platform.openai.com/api-keys. Paste it here; it is encrypted on this PC.'},
 anthropic:{name:'Anthropic Claude',badge:'ANTHROPIC CLAUDE',models:['claude-3-5-haiku-latest','claude-3-5-sonnet-latest'],defaultModel:'claude-3-5-haiku-latest',url:'https://console.anthropic.com/',hint:'API key from console.anthropic.com.'},
 custom:{name:'Custom (Any OpenAI-Compatible API / Ollama / Local)',badge:'CUSTOM API',models:['llama3.2','deepseek-chat','qwen2.5:7b','mistral'],defaultModel:'llama3.2',defaultBaseUrl:'http://localhost:11434/v1',hint:'Works with any OpenAI endpoint. Leave key empty for local servers like Ollama.'}
};
function updateCoachBadges(){
 const p=PROVIDERS[state?.provider]||{name:state?.provider||'AI',badge:'POWERED BY OPENAI'};
 const badge=$('#coach-provider-badge');if(badge)badge.textContent='';
 const note=$('#coach-privacy-note');
 if(note){
  const isLocal=state.provider==='custom'&&(state.baseUrl||'').includes('localhost');
  note.textContent=state.includeHabitContext===false?'Messages and explicitly mentioned habits are sent to OpenAI.':'Messages and habit context are sent to OpenAI when you chat.';
 }
 updateCoachBanner();
}
async function settings(){
 if(chatBusy)return toast('Wait for the current reply before opening settings.');
 const configured=await api.hasKey('openai');
 openModal('<h2>Settings</h2><p>Make Small Steps feel right for you.</p><form id="settings-form">'+
 '<section class="settings-section"><h3>Appearance & sound</h3><label class="field">Theme<select name="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label><label class="preference"><span>Completion sounds<small>A gentle sound when you check in.</small></span><input type="checkbox" name="soundEnabled"></label></section>'+
 '<section class="settings-section"><h3>Coach</h3><label class="preference"><span>Enter to send<small>Turn off to use Enter for a new line.</small></span><input type="checkbox" name="enterToSend"></label><label class="preference"><span>Show coach on startup</span><input type="checkbox" name="coachOnStartup"></label><label class="preference"><span>Share habit context<small>Include your habits and identity with messages. A habit you explicitly mention is always included.</small></span><input type="checkbox" name="includeHabitContext"></label></section>'+
 '<section class="settings-section"><h3>OpenAI connection</h3><p id="prov-status">'+(configured?'Your API key is connected':'Your API key is required')+'</p><label class="field">Your OpenAI API key<input type="password" name="key" id="setting-key" autocomplete="off" placeholder="'+(configured?'Leave blank to keep your saved key':'Paste your sk-... API key')+'"></label><p class="settings-note">Enter your own OpenAI API key. It stays encrypted on this device, and Habit Coach uses GPT-5 Mini.</p><button class="secondary" type="button" id="test-openai">Save & test connection</button><p class="settings-note">The test sends one short message to GPT-5 Mini.</p><p id="test-result" role="status"></p></section>'+
 '<div class="actions"><button class="secondary" type="button" data-close>Close</button><button class="primary" type="submit">Save settings</button></div></form><section class="settings-section"><h3>Your data</h3><p>Back up all habits, check-ins, reflections, saved chats, and preferences. API keys are not included.</p><button class="secondary" id="export">Export backup</button> <button class="secondary" id="import">Restore backup</button></section>');
 const form=$('#settings-form');form.elements.theme.value=state.theme;
 for(const k of ['soundEnabled','enterToSend','coachOnStartup','includeHabitContext'])form.elements[k].checked=state[k]===undefined?k!=='coachOnStartup':state[k];
 async function persist(){
  const key=form.elements.key.value.trim();if(key)await api.saveKey(key,'openai');
  const before={};for(const k of ['theme','soundEnabled','enterToSend','coachOnStartup','includeHabitContext','provider','baseUrl'])before[k]=state[k];
  state.provider='openai';state.baseUrl='';state.theme=form.elements.theme.value;
  for(const k of ['soundEnabled','enterToSend','coachOnStartup','includeHabitContext'])state[k]=form.elements[k].checked;
  try{await save();}catch(e){Object.assign(state,before);throw e;}
  state.model='gpt-5-mini';hasKey=await api.hasKey('openai');form.elements.key.value='';applyTheme(state.theme);applySoundState(state.soundEnabled);updateCoachBadges();
  $('.composer-hint').textContent=state.enterToSend?'Enter to send · Shift + Enter for a new line':'Enter for a new line · Click the arrow to send';
  $('#prov-status').textContent=hasKey?'API key connected':'No API key saved';
 }
 async function run(test){
  form.inert=true;$('#modal').oncancel=e=>e.preventDefault();
  try{await persist();if(test){$('#test-result').textContent='Testing connection…';const result=await api.testOpenAI();$('#test-result').textContent='Connected · '+result.model;}else{$('#modal').close();toast('Settings saved.');}}
  catch(e){$('#test-result').textContent=e.message;}
  finally{form.inert=false;$('#modal').oncancel=null;}
 }
 form.onsubmit=e=>{e.preventDefault();run(false);};$('#test-openai').onclick=()=>run(true);
 $('#export').onclick=async()=>{try{await save();if(await api.exportData())toast('Backup exported.');}catch(e){toast(e.message);}};
 $('#import').onclick=async()=>{try{await save();const restored=await api.importData();if(restored){state=ChatStore.normalize(restored);state.provider='openai';state.model='gpt-5-mini';state.baseUrl='';hasKey=await api.hasKey('openai');applyTheme(state.theme);applySoundState(state.soundEnabled);updateCoachBadges();restoreChatDraft();$('#modal').close();render();renderChat();toast('Backup restored.');}}catch(e){toast('Could not restore backup: '+e.message);}};
}
function renderChat(){const chat=$('#chat');chat.innerHTML='<div class="chat-date">A LITTLE SUPPORT, WHEN YOU NEED IT</div><div class="message-label">✧ YOUR COACH</div><div class="message">Hey, welcome to your next small step. 🌱\n\nI’m here to help you build habits that fit your life. We can find your two-minute version, design a better cue, or reset after a tricky day.\n\nWhat would you like to work on?</div>'+state.messages.map(m=>`<div class="message ${m.role==='user'?'user':''}">${esc(m.text)}</div>`).join('');chat.scrollTop=chat.scrollHeight;}
async function send(text){
 if(chatBusy||!text.trim())return;
 if(state.messages.length>=1998)return toast('This chat is full. Start a new chat to continue.');
 chatBusy=true;$('#send').disabled=true;
 let pending;
 let attachment;
 try{
  attachment=typeof coachAttachment==='function'?coachAttachment():null;
  const isLocal=state.provider==='custom'&&(state.baseUrl||'').includes('localhost');
  const has=await api.hasKey(state.provider);
  if(!has&&!isLocal){
   const pName=(PROVIDERS[state.provider]?.name||'AI').split(' (')[0];
   toast(`Add your ${pName} API key in Settings to start coaching.`);
   chatBusy=false;await settings();return;
  }
  $('#chat-input').value='';$('#chat-input').dispatchEvent(new Event('input'));
  const last=state.messages.at(-1);
  if(last?.role!=='user'||last.text!==text.trim())state.messages.push({role:'user',text:text.trim()});
  renderChat();
  pending=document.createElement('div');pending.className='message thinking';pending.textContent='Finding your next small step';
  $('#chat').append(pending);$('#chat').scrollTop=$('#chat').scrollHeight;
  await save();const reply=await api.chat(state.messages.slice(-40),attachment);
  const parsed=HabitCoach.parse(reply,attachment);state.messages.push({role:'model',text:parsed.proposal?reply:parsed.text,...(parsed.proposal?{habitProposal:parsed.proposal}:{})});await save();renderChat();
 }catch(e){
  const error=e.message.replace(/^Error invoking remote method '[^']+': Error: /,'');
  if(pending){pending.className='message error';pending.textContent=error;const retry=document.createElement('button');retry.type='button';retry.className='retry-message';retry.textContent='Try again ↗';retry.onclick=()=>send(text);pending.append(retry);}else toast(error);
  $('#chat-input').value=text;
 }finally{chatBusy=false;$('#send').disabled=false;}
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});$('#settings').onclick=settings;if($('#theme-toggle'))$('#theme-toggle').onclick=toggleTheme;if($('#sound-toggle'))$('#sound-toggle').onclick=toggleSound;$('#chat-form').onsubmit=e=>{e.preventDefault();send($('#chat-input').value);};$('#chat-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&state.enterToSend!==false){e.preventDefault();send(e.target.value);}};document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>send(b.dataset.prompt));$('#clear-chat').onclick=()=>{if(typeof newCoachChat==='function')newCoachChat();};
api.load().then(data=>{state=ChatStore.normalize(data.state);state.provider='openai';state.model='gpt-5-mini';state.baseUrl='';hasKey=data.hasKey;applyTheme(state.theme||'dark');applySoundState(state.soundEnabled);updateCoachBadges();render();renderChat();if(!data.isTest&&typeof toggleCoach==='function')toggleCoach(state.coachOnStartup===true);if(typeof restoreChatDraft==='function')restoreChatDraft();if(data.showSetup)settings();}).catch(e=>{$('#content').textContent=e.message;});
let lastDay=dayKey();setInterval(()=>{if(dayKey()!==lastDay){lastDay=dayKey();selected=lastDay;if(state)render();}},30000);
