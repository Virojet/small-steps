// Presentation and interaction layer; persistence and provider settings live in renderer.js.
const glyphs={
 pen:'<path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 14c1 2 7 2 8 0"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
 chart:'<path d="M4 19V5m0 14h17M8 15v-4m5 4V7m5 8V3"/>',journal:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18M12 8h5m-5 4h5M3 7h3m-3 5h3m-3 5h3"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 settings:'<path d="m10 3-1 3-3 1-3 3 2 3-1 3 3 2 3-1 2 4 3-1 1-3 3-1 2-3-2-3 1-3-3-2-3 1-1-3Z"/><circle cx="12" cy="12" r="3"/>',keyboard:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.1M10 9h.1M14 9h.1M18 9h.1M6 12h.1M10 12h.1M14 12h.1M18 12h.1M7 15h10"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',newchat:'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M16 3l5 5-9 9-5 1 1-5Z"/>',plus:'<path d="M12 5v14M5 12h14"/>',arrowup:'<path d="M12 19V5m-6 6 6-6 6 6"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',check:'<path d="m5 12 4 4L19 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6m-3 3V2m6 4 2-2m-8 5v5l3 2"/>',play:'<path d="m8 4 12 8-12 8Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',moon:'<path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z"/>',flame:'<path d="M12 2s2 5-1 8c0 0 5-1 5-5 8 8 3 17-4 17S1 14 6 8c-1 6 3 7 4 4 2-4 2-10 2-10Z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',leaf:'<path d="M20 3c-8 0-17 2-17 10a7 7 0 0 0 7 7c8 0 10-9 10-17ZM4 20 15 9"/>',book:'<path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1m0-15c3-2 7-2 10-1v15c-3-1-7-1-10 1V5Z"/>',
 volume:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',volumex:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
};
function ico(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${glyphs[name]||glyphs.spark}</svg>`;}
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=ico(el.dataset.icon);});}
const viewNames={today:'Today',progress:'Progress',journal:'Reflections',library:'Habits',method:'The method'};
let habitFilter='all',habitQuery='',progressDays=7,journalDate=dayKey(),focusSession=null,timerInterval=null;
const habitTemplates=[
 {id:'read',name:'Read every day',tiny:'read one page',cue:'I pour my morning coffee',icon:'📖',time:'Morning',reward:'Enjoy a quiet moment with my coffee.',category:'Mind',description:'A page today. A new perspective tomorrow.'},
 {id:'move',name:'Make time to move',tiny:'stretch for two minutes',cue:'I close my laptop',icon:'🌿',time:'Afternoon',reward:'Play a favorite song.',category:'Body',description:'Reconnect with your body, one stretch at a time.'},
 {id:'reflect',name:'A moment to reflect',tiny:'write one sentence',cue:'I brush my teeth',icon:'✍',time:'Evening',reward:'Take a slow breath and enjoy the pause.',category:'Mind',description:'Leave a little room for your thoughts.'},
 {id:'water',name:'Start with a glass of water',tiny:'drink a glass of water',cue:'I wake up',icon:'💧',time:'Morning',reward:'Open the curtains and enjoy the morning.',category:'Body',description:'A fresh start, before the day gets busy.'},
 {id:'breathe',name:'Find a moment of calm',tiny:'take five slow breaths',cue:'I sit down at my desk',icon:'🧘',time:'Anytime',reward:'Enjoy a moment without a screen.',category:'Mind',description:'A small pause can change the rest of your day.'},
 {id:'create',name:'Make something small',tiny:'sketch for two minutes',cue:'I finish lunch',icon:'🎨',time:'Afternoon',reward:'Save my sketch and notice one thing I like.',category:'Creativity',description:'Show up for the creative person in you.'}
];
function dateLabel(d,options={month:'short',day:'numeric'}){return new Date(d+'T12:00:00').toLocaleDateString('en-US',options);}
function go(next){view=next;habitQuery='';render();$('main').scrollTo({top:0,behavior:'instant'});}
render=function(){
 if(!state)return;
 document.querySelectorAll('[data-view]').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('#view-label').textContent=viewNames[view]||'Today';$('#nav-count').textContent=active(dayKey()).filter(h=>!h.logs[dayKey()]).length;
 ({today:renderToday,progress:renderProgress,journal:renderJournal,library:renderLibrary,method:renderMethod}[view]||renderToday)();
 $('#content').classList.remove('view-enter');void $('#content').offsetWidth;$('#content').classList.add('view-enter');
};
const basicToast=toast;
toast=function(message,undo){basicToast(message);if(undo){const b=document.createElement('button');b.textContent='Undo';b.onclick=async()=>{b.disabled=true;try{await undo();toast('Undone.');}catch(e){toast(e.message);}};$('#toast').append(b);}};
const baseSave=save;
save=function(){const indicator=$('.saved-status');if(indicator)indicator.innerHTML='<i></i> Saving…';return baseSave().then(result=>{if(indicator)indicator.innerHTML='<i></i> All changes saved';return result;},e=>{if(indicator)indicator.textContent='Changes not saved';throw e;});};
const baseOpenModal=openModal;
openModal=function(html){$('#modal').classList.remove('command-dialog','focus-dialog');baseOpenModal(html);};
function rangeStats(days){let possible=0,wins=0;for(let i=0;i<days;i++){const d=shift(dayKey(),-i);const hs=active(d);possible+=hs.length;wins+=hs.filter(h=>h.logs[d]).length;}return {possible,wins,percent:possible?Math.round(wins/possible*100):0};}
function hero(eyebrow,title,subtitle,action=''){return `<div class="title-row"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subheading">${subtitle}</p></div>${action}</div>`;}
renderToday=function(){
 const today=dayKey(),habits=active(selected),completed=habits.filter(h=>h.logs[selected]).length;
 const weekStart=shift(selected,-((new Date(selected+'T12:00:00').getDay()+6)%7));
 const weekEnd=shift(weekStart,6);
 const percent=habits.length?Math.round(completed/habits.length*100):0;
 $('#content').innerHTML=`
 <div class="today-top-bar">
   <div>
     <div class="today-title-row">
       <h1>${selected===today?'Today':'Your day'}</h1>
       <span class="today-date-badge">${dateLabel(selected,{weekday:'short',month:'short',day:'numeric'})}</span>
     </div>
     <p class="subheading">Small steps. Real change.</p>
   </div>
   <div class="today-actions">
     <button class="primary" id="add-habit">${ico('plus')} New habit</button>
   </div>
 </div>
 <section class="daily-overview" aria-label="Your week and daily progress">
 <div class="momentum-card minimal-progress-bar" role="progressbar" aria-label="Habits completed for selected day" aria-valuetext="${completed} of ${habits.length} habits complete" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
   <div class="progress-details">
     <span class="progress-label"><b>${completed} of ${habits.length}</b> complete</span>
     <span class="progress-percent">${habits.length&&completed===habits.length?'You showed up.':habits.length?'One small step at a time.':'A little room to begin.'}</span>
   </div>
   <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
 </div>
 <div class="date-strip-compact">
   <div class="date-controls">
     <button class="icon-button" id="prev-week" aria-label="Previous week" title="Previous week">${ico('back')}</button>
     <span class="date-range-text">${dateLabel(weekStart)} – ${dateLabel(weekEnd)}</span>
     <button class="icon-button" id="next-week" aria-label="Next week" title="Next week" ${weekEnd>=today?'disabled':''}>${ico('chevron')}</button>
     <button class="secondary btn-sm" id="jump-today">Today</button>
   </div>
   <div class="week">${Array.from({length:7},(_,i)=>{const d=shift(weekStart,i),hasWins=active(d).some(h=>h.logs[d]);return `<button class="day ${selected===d?'selected':''} ${d===today?'today':''} ${hasWins?'has-wins':''}" data-day="${d}" aria-label="${dateLabel(d,{weekday:'long',month:'long',day:'numeric'})}" aria-pressed="${selected===d}" ${d>today?'disabled':''}><span>${['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}</span><b>${Number(d.slice(-2))}</b><i></i></button>`;}).join('')}</div>
 </div>
 </section>
 <div class="routine-heading"><h2>${selected===today?'Your daily rhythm':'Your habits'}</h2><span>${habits.length} ${habits.length===1?'habit':'habits'}</span></div>
 <div class="filters">
   <div class="segmented" aria-label="Filter habits">${[['all','All habits'],['todo','To do'],['done','Completed']].map(([id,t])=>`<button data-filter="${id}" class="${habitFilter===id?'active':''}" aria-pressed="${habitFilter===id}">${t}</button>`).join('')}</div>
   <label class="filter-search">${ico('search')}<input id="habit-search" aria-label="Search habits" placeholder="Find a habit…" value="${esc(habitQuery)}"></label>
 </div>
 <div id="habit-list"></div>
 <button class="reflection-nudge" id="reflection-nudge">
   <span>${ico('journal')}</span>
   <div><strong>A moment for yourself</strong><small>${state.journal?.[selected]?'Revisit your reflection for this day.':'What made today a little better?'}</small></div>
   ${ico('arrow')}
 </button>
 <details class="identity-drawer">
   <summary class="identity-drawer-header">
     <span class="identity-summary-icon">${ico('target')}</span>
     <span class="identity-summary-copy"><b>Identity & Mindset</b> · “I’m ${esc(state.identity)}”</span>
     <span class="identity-chevron">${ico('chevron')}</span>
   </summary>
   <div class="identity">
     <div class="identity-icon">${ico('target')}</div>
     <div>
       <div class="eyebrow">THE PERSON I’M BECOMING</div>
       <h2>I’m ${esc(state.identity)}.</h2>
       <p>Every small action is a vote for this person.</p>
     </div>
     <button class="icon-button edit-identity" id="edit-identity" aria-label="Edit identity" title="Edit your identity">${ico('newchat')}</button>
     <span class="little-star" hidden>✳</span>
   </div>
 </details>`;
 $('#add-habit').onclick=()=>habitModal();
 const editIdentity=$('#edit-identity');if(editIdentity)editIdentity.onclick=identityModal;
 $('#prev-week').onclick=()=>{selected=shift(selected,-7);renderToday();};
 $('#next-week').onclick=()=>{selected=shift(selected,7)>today?today:shift(selected,7);renderToday();};
 $('#jump-today').onclick=()=>{selected=today;renderToday();};
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selected=b.dataset.day;renderToday();});
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{habitFilter=b.dataset.filter;renderToday();});
 $('#habit-search').oninput=e=>{habitQuery=e.target.value;renderHabitList();};
 const tipMethod=$('#tip-method');if(tipMethod)tipMethod.onclick=()=>go('method');
 $('#reflection-nudge').onclick=()=>{journalDate=selected;go('journal');};
 renderHabitList();
};
function renderHabitList(){
 const habits=active(selected);const filtered=habits.filter(h=>(habitFilter==='all'||(habitFilter==='done'?!!h.logs[selected]:!h.logs[selected]))&&[h.name,h.cue,h.tiny].some(v=>v.toLowerCase().includes(habitQuery.toLowerCase())));
 $('#habit-list').innerHTML=!habits.length?`<div class="empty"><div class="sprout">✳</div><h3>${state.habits.length?'A quieter day in your story.':'Your next chapter starts small.'}</h3><p>${state.habits.length?'No habits had been created on this date. Go to today to see your current rhythm.':'Pick a starting point. Make it your own. We’ll take it one day at a time.'}</p><div class="starter-buttons"><button class="secondary" data-template="read">📖 Read one page</button><button class="secondary" data-template="move">🌿 Move for 2 minutes</button><button class="secondary" data-template="reflect">✍ Write one sentence</button></div></div>`:!filtered.length?'<div class="empty compact"><div class="sprout">✓</div><h3>Nothing here right now.</h3><p>Try another filter or search.</p></div>':
 ['Morning','Afternoon','Evening','Anytime'].map(time=>{const hs=filtered.filter(h=>h.time===time);return hs.length?`<div class="period">${ico({Morning:'sun',Afternoon:'sun',Evening:'moon',Anytime:'timer'}[time])}${time.toUpperCase()}<span class="period-line"></span><small>${hs.filter(h=>h.logs[selected]).length} / ${hs.length}</small></div>${hs.map(h=>habitRow(h)).join('')}`:'';}).join('');
 document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>checkIn(b.dataset.check,'full'));
 document.querySelectorAll('[data-tiny]').forEach(b=>b.onclick=()=>checkIn(b.dataset.tiny,'tiny'));
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>habitModal(state.habits.find(h=>h.id===b.dataset.edit)));
 document.querySelectorAll('[data-remove-habit]').forEach(b=>b.onclick=()=>removeHabit(b.dataset.removeHabit));
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>openFocus(b.dataset.focus));
 document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>openTemplate(b.dataset.template));
 document.querySelectorAll('[data-ask-coach]').forEach(b=>b.onclick=()=>{
  const h=state.habits.find(x=>x.id===b.dataset.askCoach);
  if(!h)return;
  preparePrompt(`Help me make “${h.name}” easier to start. My current two-minute action is “${h.tiny}”. What is one practical way to lower the friction?`);
 });
}
function habitRow(h){
 const done=h.logs[selected];
 const actionText=h.tiny||h.name;
 const cueText=h.cue?`After ${h.cue}`:'';
 const goalText=h.name;
 return `<div class="habit ${done?'done':''}" data-habit="${esc(h.id)}">
  <div class="habit-primary-row">
    <button class="check ${done?'checked':''}" data-check="${esc(h.id)}" aria-label="${done?'Undo '+h.name:'Complete '+h.name}" aria-pressed="${!!done}">
      <span class="check-box-icon">${done?ico('check'):''}</span>
      <span class="check-label-text">${done?'Done':'Mark done'}</span>
    </button>
    <div class="habit-body">
      <div class="habit-title-line">
        <span class="habit-emoji">${esc(h.icon)}</span>
        <span class="habit-action-name">${esc(actionText)}</span>
      </div>
      <div class="habit-cue-line">
        ${cueText?`<span class="cue-phrase">${esc(cueText)}</span>`:''}
        ${goalText&&goalText!==actionText?`<span class="goal-phrase">${esc(goalText)}</span>`:''}
      </div>
    </div>
    <div class="habit-actions">
      <button class="habit-coach-btn" data-ask-coach="${esc(h.id)}" title="Ask coach how to make this easier">${ico('spark')} <span>Make this easier</span></button>
      <button class="tiny" data-tiny="${esc(h.id)}" title="Complete your two-minute version">${done==='tiny'?'✓ Tiny step done':'↗ 2-minute version'}</button>
      <button class="icon-button" data-focus="${esc(h.id)}" aria-label="Start focus for ${esc(h.name)}" title="Two-minute focus">${ico('timer')}</button>
      <button class="icon-button edit" data-edit="${esc(h.id)}" aria-label="Edit ${esc(h.name)}" title="Edit habit">${ico('pen')}</button>
      <button class="icon-button remove-habit" data-remove-habit="${esc(h.id)}" aria-label="Remove ${esc(h.name)}" title="Remove habit">${ico('trash')}</button>
    </div>
  </div>
 </div>`;
}
async function checkIn(id,kind,date=selected){
 const h=state.habits.find(x=>x.id===id);if(!h)return;const before=h.logs[date];
 if(before&&(kind==='full'||before===kind))delete h.logs[date];else h.logs[date]=kind;
 try{await save();render();if(h.logs[date]){if(typeof playChime==='function')playChime('success');toast(h.reward||'You showed up today.',async()=>{if(before)h.logs[date]=before;else delete h.logs[date];await save();render();});if(active(date).length&&active(date).every(x=>x.logs[date]))celebrate();}else toast('Check-in removed.');}catch{if(before)h.logs[date]=before;else delete h.logs[date];render();}
}
function celebrate(){if(typeof playChime==='function')playChime('celebrate');const el=document.createElement('div');el.className='celebration';el.setAttribute('aria-hidden','true');el.innerHTML=Array.from({length:14},()=>'<i></i>').join('');document.body.append(el);setTimeout(()=>el.remove(),1300);}
function openTemplate(id){const t=habitTemplates.find(t=>t.id===id);if(!t)return;habitModal();for(const key of ['name','tiny','cue','icon','time','reward'])$('#habit-form').elements[key].value=t[key];}
renderProgress=function(){
 const s=rangeStats(progressDays);const current=Math.max(0,...state.habits.map(streak));
 $('#content').innerHTML=hero('YOUR EFFORT, MADE VISIBLE','Look at you, showing up.','A record of your effort. A reason to keep going.',`<div class="segmented">${[7,30,90].map(n=>`<button data-range="${n}" class="${progressDays===n?'active':''}">${n} days</button>`).join('')}</div>`)+`
 <div class="stats"><div class="stat"><div class="stat-label">Small wins ${ico('check')}</div><div class="stat-value">${s.wins}</div><div class="stat-note">In the last ${progressDays} days</div></div><div class="stat"><div class="stat-label">Consistency ${ico('chart')}</div><div class="stat-value">${s.percent}<small>%</small></div><div class="stat-note">${s.wins} of ${s.possible} possible check-ins</div></div><div class="stat"><div class="stat-label">Best current streak ${ico('flame')}</div><div class="stat-value">${current}<small>days</small></div><div class="stat-note">Keep coming back</div></div></div>
 <div class="chart-card"><div class="section-title"><h2>Small wins add up</h2><span>Daily check-ins</span></div><div class="bar-chart">${Array.from({length:progressDays},(_,i)=>{const d=shift(dayKey(),i-progressDays+1),hs=active(d),n=hs.filter(h=>h.logs[d]).length,pct=hs.length?Math.round(n/hs.length*100):0;return `<button class="chart-day" data-inspect="${d}" title="${dateLabel(d)}: ${n}/${hs.length} habits"><div class="bar-track"><div class="bar-fill" data-height="${pct}"></div></div>${progressDays===7?`<span>${dateLabel(d,{weekday:'short'})}</span>`:''}</button>`;}).join('')}</div><div class="chart-axis"><span>${dateLabel(shift(dayKey(),1-progressDays))}</span><span>${dateLabel(dayKey())}</span></div></div>
 <div class="chart-card"><div class="section-title"><h2>Your consistency, day by day</h2><span>Last 8 weeks</span></div><div class="heatmap">${Array.from({length:56},(_,i)=>{const d=shift(dayKey(),i-55),hs=active(d),n=hs.filter(h=>h.logs[d]).length;return `<button class="heat-cell ${n?(n===hs.length?'full':'partial'):''}" data-inspect="${d}" aria-label="${d}: ${n} of ${hs.length} completed" title="${dateLabel(d)}: ${n}/${hs.length}"></button>`;}).join('')}</div><div class="heat-legend"><span>Click a day to see your habits.</span><div>Less <i></i><i></i><i></i> More</div></div></div>
 <div class="chart-card"><div class="section-title"><h2>The habits behind your progress</h2></div>${state.habits.length?state.habits.map(h=>`<button class="milestone-row" data-details="${esc(h.id)}"><span class="habit-emoji">${esc(h.icon)}</span><div><strong>${esc(h.name)}</strong><small>${Object.keys(h.logs).length} total check-ins</small></div><span class="streak">${ico('flame')}${streak(h)} days</span>${ico('chevron')}</button>`).join(''):'<p class="legend">Your story begins with a single check-in. Add a habit to get started.</p>'}</div>`;
 document.querySelectorAll('[data-height]').forEach(el=>el.style.height=el.dataset.height+'%');
 document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{progressDays=Number(b.dataset.range);render();});
 document.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>{selected=b.dataset.inspect;habitFilter='all';go('today');});
 document.querySelectorAll('[data-details]').forEach(b=>b.onclick=()=>habitModal(state.habits.find(h=>h.id===b.dataset.details)));
};
renderMethod=function(){
 const laws=[['01','sun','Make it obvious','Give your habit a cue','Connect your next small action to something you already do. A reliable cue turns “sometime” into a moment you can recognize.','After I make coffee, I will read one page.','read'],['02','spark','Make it attractive','Give yourself a reason to begin','Pair your habit with something you enjoy. Make the process itself something you want to return to.','My favorite playlist goes on when I stretch.','move'],['03','timer','Make it easy','Start smaller than you think','Two minutes is enough to practice showing up. Choose a first step that feels possible, even on the busy days.','Five slow breaths before I open my laptop.','breathe'],['04','check','Make it satisfying','Notice the small win','Check it off as soon as you finish. Enjoy a little reward. Let your brain register that this action was worth doing.','One sentence written. One quiet moment earned.','reflect']];
 $('#content').innerHTML=hero('THE ATOMIC HABITS APPROACH','Better systems. Better days.','Four simple principles. A lifetime of small improvements.')+`<div class="method-intro"><span>01 → 04</span><p>Start with who you want to become.<br>Then make the next action easy to repeat.</p>${ico('layers')}</div><div class="law-grid">${laws.map(([n,i,l,t,p,ex,id])=>`<article class="law-card"><div class="law-top"><span>${n}</span>${ico(i)}</div><div class="eyebrow">${l}</div><h3>${t}</h3><p>${p}</p><blockquote>${ex}</blockquote><button class="text-button" data-template="${id}">Try this habit ${ico('arrow')}</button></article>`).join('')}</div><div class="tip">${ico('leaf')}<div><strong>Never miss twice.</strong>One missed day doesn’t erase your progress. Return with the smallest possible version.</div></div><p class="source-note">Inspired by James Clear’s Atomic Habits. Small Steps is an independent app.</p>`;
 document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>openTemplate(b.dataset.template));
};
function renderLibrary(){
 $('#content').innerHTML=hero('A LITTLE INSPIRATION','Good habits start here.','Ready-to-personalize ideas, designed to take two minutes or less.',`<button class="secondary" id="custom-habit">${ico('plus')} Create your own</button>`)+`<div class="library-callout">${ico('spark')}<div><strong>Small enough to start. Meaningful enough to repeat.</strong><p>Choose an idea, give it a cue, and make it yours.</p></div></div><div class="template-grid">${habitTemplates.map(t=>`<article class="template-card"><div class="template-top"><div class="template-icon">${t.icon}</div><span>${t.category}</span></div><h3>${t.name}</h3><p>${t.description}</p><div class="template-step">${ico('timer')} ${t.tiny}</div><button class="secondary" data-template="${t.id}">Use this habit ${ico('plus')}</button></article>`).join('')}</div>`;
 $('#custom-habit').onclick=()=>habitModal();document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>openTemplate(b.dataset.template));
}
function renderJournal(){
 const entry=state.journal?.[journalDate]||{mood:'',note:''};const entries=Object.entries(state.journal||{}).filter(([d,v])=>d!==journalDate&&(v.note||v.mood)).sort((a,b)=>b[0].localeCompare(a[0]));
 $('#content').innerHTML=hero('ROOM TO REFLECT','How are you, really?','Pause for a moment. There’s more to progress than a checkmark.')+`<div class="journal-card"><div class="section-title"><h2>${dateLabel(journalDate,{weekday:'long',month:'long',day:'numeric'})}</h2><input type="date" id="journal-date" aria-label="Reflection date" value="${journalDate}" max="${dayKey()}"></div><p class="journal-prompt">What did today feel like?</p><div class="moods">${[['low','😞','A tough day'],['quiet','😌','Quiet'],['okay','😐','Okay'],['good','🙂','Good'],['great','😁','Really good']].map(([id,emoji,label])=>`<button class="mood ${entry.mood===id?'selected':''}" data-mood="${id}" aria-pressed="${entry.mood===id}"><span>${emoji}</span>${label}</button>`).join('')}</div><label class="field">One small win. One thing you noticed.<textarea id="journal-note" rows="6" maxlength="4000" placeholder="Today, I’m glad I…">${esc(entry.note)}</textarea></label><div class="journal-bottom"><span>${ico('lock')} Just for you. Saved on this device.</span><button class="primary" id="save-reflection">Save reflection ${ico('check')}</button></div></div><div class="section-title past-title"><h2>Pages from your journey</h2><span>${entries.length} reflections</span></div>${entries.length?entries.map(([d,v])=>`<button class="journal-entry" data-entry="${d}"><div><span>${dateLabel(d,{month:'short',day:'numeric',year:'numeric'})}</span><p>${esc(v.note||'A moment to check in with yourself.')}</p></div><span>${{low:'😞',quiet:'😌',okay:'😐',good:'🙂',great:'😁'}[v.mood]||'✎'}</span></button>`).join(''):'<div class="empty"><span class="sprout">✎</span><h3>A little space for your story.</h3><p>Your past reflections will appear here. Start with a single sentence.</p></div>'}`;
 let mood=entry.mood;
 document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{mood=b.dataset.mood;document.querySelectorAll('[data-mood]').forEach(x=>{x.classList.toggle('selected',x.dataset.mood===mood);x.setAttribute('aria-pressed',x.dataset.mood===mood);});});
 $('#save-reflection').onclick=async()=>{const note=$('#journal-note').value.trim();const before=structuredClone(state.journal||{});state.journal={...before,[journalDate]:{mood,note}};try{await save();toast('A little moment, kept.');renderJournal();}catch{state.journal=before;}};
 $('#journal-date').onchange=e=>{if(e.target.value&&e.target.value<=dayKey()){journalDate=e.target.value;renderJournal();}};
 document.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>{journalDate=b.dataset.entry;renderJournal();window.scrollTo(0,0);});
}
function openFocus(id){
 const h=state.habits.find(h=>h.id===id);if(!h)return;
 if(focusSession&&focusSession.id!==id){toast('Finish or close your current focus session first.');showFocus();return;}
 if(!focusSession)focusSession={id,date:dayKey(),remaining:120,running:false,end:0};showFocus();
}
function focusRemaining(){return focusSession?(focusSession.running?Math.max(0,Math.ceil((focusSession.end-Date.now())/1000)):focusSession.remaining):0;}
function formatSeconds(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function showFocus(){
 const h=state.habits.find(h=>h.id===focusSession?.id);if(!h){focusSession=null;return updateFocus();}
 openModal(`<div class="eyebrow">JUST TWO MINUTES</div><h2>One thing. Right now.</h2><p>${esc(h.name)} · ${esc(h.tiny)}</p><div class="focus-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="80"/><circle id="focus-circle" cx="90" cy="90" r="80"/></svg><div><strong id="focus-time">2:00</strong><span id="focus-label">Make a little space to begin.</span></div></div><div class="focus-controls"><button class="secondary" id="reset-focus">Reset</button><button class="primary" id="start-focus">Start focus</button></div><div class="actions"><button class="secondary" id="end-focus">End session</button><button class="secondary" data-close>Minimize</button><button class="primary" id="finish-focus">Mark tiny step done</button></div>`);$('#modal').classList.add('focus-dialog');
 $('#start-focus').onclick=toggleFocus;$('#reset-focus').onclick=()=>{focusSession.remaining=120;focusSession.running=false;updateFocus();};$('#end-focus').onclick=()=>{focusSession=null;$('#modal').close();updateFocus();};
 $('#finish-focus').onclick=async()=>{const s=focusSession;const target=state.habits.find(x=>x.id===s.id);if(!target)return;if(!target.logs[s.date])await checkIn(s.id,'tiny',s.date);focusSession=null;$('#modal').close();updateFocus();};updateFocus();
}
function toggleFocus(){if(!focusSession)return;if(focusSession.running){focusSession.remaining=focusRemaining();focusSession.running=false;}else{if(!focusSession.remaining)focusSession.remaining=120;focusSession.end=Date.now()+focusSession.remaining*1000;focusSession.running=true;}updateFocus();}
function updateFocus(){
 const dock=$('#focus-dock');dock.hidden=!focusSession;if(!focusSession){clearInterval(timerInterval);timerInterval=null;return;}
 const remaining=focusRemaining();if(focusSession.running&&!remaining){focusSession.running=false;focusSession.remaining=0;toast('Two minutes for you. Mark your step when you’re ready.');}
 if($('#focus-time')){$('#focus-time').textContent=formatSeconds(remaining);$('#focus-label').textContent=remaining?(focusSession.running?'Just this moment. Just this step.':'Whenever you’re ready.'):'You made time for yourself.';$('#start-focus').textContent=focusSession.running?'Pause':remaining===120?'Start focus':remaining?'Resume':'Start again';$('#focus-circle').style.strokeDashoffset=String(503*(1-remaining/120));}
 const h=state.habits.find(x=>x.id===focusSession.id);
 if(dock.dataset.habit!==focusSession.id||!$('#expand-focus')){dock.dataset.habit=focusSession.id;dock.innerHTML=`<button id="expand-focus">${ico('timer')}<span>${esc(h?.name||'Focus')}<small id="dock-time"></small></span></button><button class="icon-button" id="dock-pause"></button>`;$('#expand-focus').onclick=showFocus;$('#dock-pause').onclick=toggleFocus;}
 $('#dock-time').textContent=formatSeconds(remaining);const pause=$('#dock-pause'),label=focusSession.running?'Pause focus':'Resume focus';if(pause.getAttribute('aria-label')!==label){pause.setAttribute('aria-label',label);pause.innerHTML=ico(focusSession.running?'pause':'play');}
 if(!timerInterval)timerInterval=setInterval(updateFocus,250);
}
function commandPalette(){
 openModal(`<div class="command-input">${ico('search')}<input id="command-query" placeholder="Where would you like to go?" aria-label="Search commands" autocomplete="off"><kbd>Esc</kbd></div><div id="command-results"></div><div class="command-footer">↑ ↓ to navigate <span>Enter to select</span></div>`);$('#modal').classList.add('command-dialog');
 const actions=[...Object.entries(viewNames).map(([id,name])=>({id,name:id==='library'?'Go to Habits (Habit library)':`Go to ${name}`,icon:{today:'sun',progress:'chart',journal:'journal',library:'grid',method:'layers'}[id],action:()=>go(id)})),{name:'Toggle light and dark theme',icon:'sun',action:toggleTheme},{name:'Toggle sound effects',icon:'volume',action:toggleSound},{name:'Create a new habit',icon:'plus',action:()=>habitModal()},{name:'Settings & backup',icon:'settings',action:settings},{name:'Show or hide coach',icon:'panel',action:toggleCoach},...state.habits.map(h=>({name:`Focus: ${h.name}`,icon:'timer',action:()=>openFocus(h.id)}))];
 let matches=actions,index=0;function draw(){const q=$('#command-query').value.toLowerCase();matches=actions.filter(x=>x.name.toLowerCase().includes(q)||(x.id&&x.id.toLowerCase().includes(q)));index=Math.min(index,Math.max(0,matches.length-1));$('#command-results').innerHTML=matches.map((a,i)=>`<button class="command-option ${i===index?'selected':''}" data-command="${i}">${ico(a.icon)}${esc(a.name)}<span>↵</span></button>`).join('')||'<p class="command-empty">No matching actions. Try “habit” or “progress”.</p>';document.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>run(Number(b.dataset.command)));}
 function run(i){const a=matches[i];if(a){$('#modal').close();a.action();}}
 $('#command-query').oninput=()=>{index=0;draw();};$('#command-query').onkeydown=e=>{if(['ArrowDown','ArrowUp','Enter'].includes(e.key)){e.preventDefault();if(e.key==='Enter')return run(index);index=(index+(e.key==='ArrowDown'?1:-1)+Math.max(1,matches.length))%Math.max(1,matches.length);draw();$('#command-results .selected')?.scrollIntoView({block:'nearest'});}};draw();$('#command-query').focus();
}
function shortcutsModal(){openModal(`<div class="eyebrow">A LITTLE LESS CLICKING</div><h2>Find your flow.</h2><div class="shortcut-list">${[['Search commands','Ctrl K'],['New habit','N'],['Go to today','T'],['Focus the chat','Ctrl /'],['Toggle theme','M'],['Toggle sound','S'],['Show shortcuts','?'],['Close dialog','Esc']].map(([t,k])=>`<div>${t}<kbd>${k}</kbd></div>`).join('')}</div><div class="actions"><button class="primary" data-close>Got it</button></div>`);}
function toggleCoach(force){const hidden=typeof force==='boolean'?!force:!document.body.classList.contains('coach-hidden');document.body.classList.toggle('coach-hidden',hidden);$('#toggle-coach').setAttribute('aria-expanded',String(!hidden));}
function contextMenu(){openModal(`<div class="eyebrow">A LITTLE MORE PERSONAL</div><h2>Let’s work on a habit.</h2><p>Choose a habit to prepare a question for your coach.</p><div class="context-list">${state.habits.length?state.habits.map(h=>`<button class="command-option" data-context="${esc(h.id)}"><span>${esc(h.icon)}</span>${esc(h.name)}${ico('arrow')}</button>`).join(''):'<p>Add a habit first, or ask your coach to help you find one.</p>'}</div><div class="actions"><button class="secondary" data-close>Close</button></div>`);document.querySelectorAll('[data-context]').forEach(b=>b.onclick=()=>{const h=state.habits.find(h=>h.id===b.dataset.context);$('#modal').close();preparePrompt(`Help me make “${h.name}” easier to stick with. My first step is to ${h.tiny}.`);});}
function preparePrompt(text){toggleCoach(true);$('#chat-input').value=text;$('#chat-input').dispatchEvent(new Event('input'));$('#chat-input').focus();}
function composerEmoji(emoji){
 const input=$('#chat-input'),start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
 const next=input.value.slice(0,start)+emoji+input.value.slice(end);if(next.length>Number(input.maxLength))return;
 input.value=next;input.setSelectionRange(start+emoji.length,start+emoji.length);input.dispatchEvent(new Event('input'));input.focus();
}
function messageHtml(message){
 const raw=message.role==='model'?message.text.replace(/```habit[\s\S]*?(?:```|$)/g,'').trim():message.text;
 let html=esc(raw).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 if(message.role==='model'&&/\b(icon|emoji)\b/i.test(raw))for(const emoji of HabitCoach.icons)html=html.split(emoji).join(`<button type="button" class="inline-emoji" data-emoji="${emoji}" aria-label="Choose ${emoji}">${emoji}</button>`);
 return html;
}
renderChat=function(){
 const chat=$('#chat');chat.innerHTML=state.messages.map((m,i)=>`<div class="message ${m.role==='user'?'user':''}">${messageHtml(m)}</div>${m.role==='model'?`<div class="message-tools"><button data-copy="${i}" aria-label="Copy coach response">${ico('copy')} Copy</button></div>`:''}`).join('');
 document.querySelectorAll('.inline-emoji').forEach(button=>button.onclick=()=>composerEmoji(button.dataset.emoji));
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await api.copyText(state.messages[Number(b.dataset.copy)].text.replace(/```habit[\s\S]*?(?:```|$)/g,'').trim());toast('Response copied.');}catch{toast('Copy is unavailable. Select the response text to copy it.');}});chat.scrollTop=chat.scrollHeight;
};
hydrateIcons();$('.brand-dot').textContent='.';
if($('.brand'))$('.brand').onclick=e=>{e.preventDefault();go('today');};
if($('#command-search'))$('#command-search').onclick=commandPalette;
if($('#shortcuts'))$('#shortcuts').onclick=shortcutsModal;
if($('#toggle-coach'))$('#toggle-coach').onclick=()=>toggleCoach();
if($('#close-coach'))$('#close-coach').onclick=()=>{toggleCoach(false);$('#toggle-coach').focus();};
if($('#chat-context'))$('#chat-context').onclick=contextMenu;
if($('#theme-toggle'))$('#theme-toggle').onclick=()=>toggleTheme();
if($('#sound-toggle'))$('#sound-toggle').onclick=()=>toggleSound();
document.querySelectorAll('[data-kickstart]').forEach(b=>{
 b.onclick=()=>{
  const mode=b.dataset.kickstart;
  const hs=active(dayKey());
  const names=hs.map(h=>`“${h.name}” (${h.tiny})`).join(', ')||'my daily habits';
  const done=hs.filter(h=>h.logs[dayKey()]).length;
  const prompt=mode==='morning'
   ?`Good morning! Here are my habits for today: ${names}. Help me plan an easy rhythm to show up for them effortlessly.`
   :`Good evening! Today I completed ${done} of ${hs.length} habits. Help me celebrate my small wins and do a short reflection on today's progress.`;
  preparePrompt(prompt);
 };
});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>go(b.dataset.view));
$('#chat-input').addEventListener('input',()=>{const el=$('#chat-input');el.style.height='auto';el.style.height=Math.min(160,Math.max(55,el.scrollHeight))+'px';});
document.addEventListener('keydown',e=>{
 const typing=e.target.matches('input,textarea,select,[contenteditable="true"]');
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(state&&!$('#modal').open)commandPalette();return;}
 if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();if(!$('#modal').open){toggleCoach(true);$('#chat-input').focus();}return;}
 if(typing||$('#modal').open||e.ctrlKey||e.metaKey||e.altKey||!state)return;
 if(e.key.toLowerCase()==='n')habitModal();else if(e.key.toLowerCase()==='t'){selected=dayKey();go('today');}else if(e.key.toLowerCase()==='m')toggleTheme();else if(e.key.toLowerCase()==='s')toggleSound();else if(e.key==='?')shortcutsModal();
});
if(state){applyTheme(state.theme||'dark');if(typeof applySoundState==='function')applySoundState(state.soundEnabled);render();renderChat();}
