function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function shiftDay(key, n) { const d = new Date(key+'T12:00:00'); d.setDate(d.getDate()+n); return dateKey(d); }
function streak(habit, today = dateKey()) { let day = habit.logs[today] ? today : shiftDay(today,-1), count = 0; while(habit.logs[day]) { count++; day=shiftDay(day,-1); } return count; }
const {DEFAULT_OPENAI_MODEL} = require('./openai.cjs');
const {cleanSetupPrompts}=require('./coach-protocol.js');
const ChatStore=require('./chat-store.js');
function initialState() { return {version:1, identity:'someone who shows up for myself', habits:[], messages:[], provider:'openai', baseUrl:'', model:DEFAULT_OPENAI_MODEL, theme:'dark', soundEnabled:true}; }
function validateState(s) {
 if(!s || s.version!==1 || typeof s.identity!=='string' || s.identity.length>300 || !Array.isArray(s.habits) || s.habits.length>100 || !Array.isArray(s.messages) || s.messages.length>2000) throw Error('Invalid habit data.');
 for(const h of s.habits) { if(!h || typeof h.id!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(h.created) || !h.logs || typeof h.logs!=='object' || Array.isArray(h.logs)) throw Error('Invalid habit.'); for(const k of ['name','tiny','cue','reward','time','icon']) if(typeof h[k]!=='string' || h[k].length>500) throw Error('Invalid habit field.'); for(const [d,v] of Object.entries(h.logs)) if(!/^\d{4}-\d{2}-\d{2}$/.test(d) || !['full','tiny'].includes(v)) throw Error('Invalid check-in.'); }
 for(const m of s.messages) if(!m || !['user','model'].includes(m.role) || typeof m.text!=='string' || m.text.length>20000) throw Error('Invalid message.');
 if(s.journal!==undefined){
  if(!s.journal||typeof s.journal!=='object'||Array.isArray(s.journal)||Object.keys(s.journal).length>20000)throw Error('Invalid reflection journal.');
  for(const [day,entry] of Object.entries(s.journal))if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!entry||typeof entry.note!=='string'||entry.note.length>4000||!['','low','quiet','okay','good','great'].includes(entry.mood))throw Error('Invalid reflection.');
 }
 if(!s.provider) s.provider = (s.model && s.model.startsWith('gemini')) ? 'gemini' : 'groq';
 if(typeof s.provider!=='string' || !/^[a-z0-9\-]{1,50}$/.test(s.provider)) throw Error('Invalid provider.');
 if(s.baseUrl!==undefined && (typeof s.baseUrl!=='string' || s.baseUrl.length>500)) throw Error('Invalid API base URL.');
 if(!s.baseUrl) s.baseUrl = '';
 if(typeof s.model!=='string' || s.model.includes('..') || !/^[a-zA-Z0-9][a-zA-Z0-9._:\-\/@]{0,149}$/.test(s.model)) throw Error('Invalid model name.');
 if(s.provider==='openai')s.model=DEFAULT_OPENAI_MODEL;
 if(s.theme!==undefined && !['light','dark'].includes(s.theme)) throw Error('Invalid theme.');
 if(!s.theme) s.theme = 'dark';
 if(s.soundEnabled!==undefined && typeof s.soundEnabled!=='boolean') throw Error('Invalid sound preference.');
 if(s.soundEnabled===undefined) s.soundEnabled = true;
 for(const key of ['enterToSend','coachOnStartup','includeHabitContext']){if(s[key]!==undefined&&typeof s[key]!=='boolean')throw Error('Invalid preference.');}
 s.enterToSend??=true;s.coachOnStartup??=false;s.includeHabitContext??=true;
 ChatStore.normalize(s);
 for(const chat of s.chats)chat.messages=cleanSetupPrompts(chat.messages);
 s.messages=s.chats.find(c=>c.id===s.activeChatId).messages;
 return s;
}
function migrateToOpenAI(s) {
 validateState(s);
 s.provider='openai';s.model=DEFAULT_OPENAI_MODEL;s.baseUrl='';
 return s;
}
module.exports={dateKey,shiftDay,streak,initialState,validateState,migrateToOpenAI};
