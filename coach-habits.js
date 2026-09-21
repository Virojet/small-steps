// Habit attachments and reviewable coach drafts. Uses the normal local save path.
let attachedHabit=null;
function coachAttachment(){
 if(attachedHabit?.mode==='edit'){
  const habit=state.habits.find(h=>h.id===attachedHabit.habitId);
  if(!habit)throw Error('This habit no longer exists. Remove the mention and choose another habit.');
  return {mode:'edit',habitId:habit.id,base:HabitCoach.snapshot(habit)};
 }
 return attachedHabit;
}
function showHabitAttachment(){
 let chip=$('#habit-attachment');
 if(!chip){chip=document.createElement('div');chip.id='habit-attachment';$('#chat-context').after(chip);}
 chip.hidden=!attachedHabit;
 if(!attachedHabit)return;
 const habit=state?.habits.find(h=>h.id===attachedHabit.habitId);
 const label=attachedHabit.mode==='new'?'New habit':habit?.name||'Habit unavailable';
 chip.innerHTML=`<span title="${esc(label)}">${ico('target')}<span class="mention-label">${esc(label)}</span></span><button type="button" aria-label="Remove habit mention" title="Remove habit mention">${ico('close')}</button>`;
 chip.querySelector('button').onclick=()=>{attachedHabit=null;showHabitAttachment();$('#chat-input').focus();};
}
function mentionHabit(id){
 if(chatBusy)return toast('Wait for the coach to finish.');
 attachedHabit={mode:'edit',habitId:id};toggleCoach(true);showHabitAttachment();$('#chat-input').focus();
}
async function startHabitSetup(){
 if(chatBusy)return toast('Wait for the coach to finish.');
 attachedHabit={mode:'new'};toggleCoach(true);showHabitAttachment();
 if(HabitCoach.hasOpenSetup(state.messages)){renderChat();$('#chat-input').focus();return;}
 const intro={role:'model',text:HabitCoach.setupIntro};
 state.messages.push(intro);
 try{await save();renderChat();$('#chat-input').focus();}catch{state.messages=state.messages.filter(m=>m!==intro);renderChat();}
}
function closeHabitPicker(focus=false){
 $('#habit-picker')?.remove();$('#chat-context').setAttribute('aria-expanded','false');
 if(focus)$('#chat-context').focus();
}
function closeEmojiPicker(focus=false){
 $('#emoji-picker')?.remove();$('#emoji-picker-button').setAttribute('aria-expanded','false');
 if(focus)$('#emoji-picker-button').focus();
}
function toggleEmojiPicker(){
 if($('#emoji-picker'))return closeEmojiPicker(true);
 closeHabitPicker();
 const picker=document.createElement('div');picker.id='emoji-picker';picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Choose an emoji');
 picker.innerHTML=HabitCoach.icons.map(emoji=>`<button type="button" data-composer-emoji="${emoji}" aria-label="Insert ${emoji}">${emoji}</button>`).join('');
 $('#chat-form').append(picker);$('#emoji-picker-button').setAttribute('aria-expanded','true');
 picker.querySelectorAll('[data-composer-emoji]').forEach(button=>button.onclick=()=>{composerEmoji(button.dataset.composerEmoji);closeEmojiPicker();});
 picker.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  event.preventDefault();const buttons=[...picker.querySelectorAll('button')],columns=5;let index=buttons.indexOf(document.activeElement);
  if(event.key==='Home')index=0;else if(event.key==='End')index=buttons.length-1;else index=(index+({ArrowRight:1,ArrowLeft:-1,ArrowDown:columns,ArrowUp:-columns}[event.key])+buttons.length)%buttons.length;
  buttons[index].focus();
 });
 picker.querySelector('button').focus();
}
contextMenu=function(){
 if($('#habit-picker'))return closeHabitPicker(true);
 if(chatBusy)return toast('Wait for the coach to finish.');
 const picker=document.createElement('div');picker.id='habit-picker';picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Choose a habit');
 picker.innerHTML=`<button type="button" id="coach-create">${ico('target')}<span><strong>New habit</strong><small>Set it up with your coach</small></span></button>${state.habits.length?'<div class="picker-label">Mention a habit</div>':''}${state.habits.map(h=>`<button type="button" data-context="${esc(h.id)}">${ico('target')}<span>${esc(h.name)}</span></button>`).join('')}`;
 $('#chat-form').append(picker);$('#chat-context').setAttribute('aria-expanded','true');
 $('#coach-create').onclick=()=>{closeHabitPicker();startHabitSetup();};
 picker.querySelectorAll('[data-context]').forEach(b=>b.onclick=()=>{closeHabitPicker();mentionHabit(b.dataset.context);});
 picker.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const options=[...picker.querySelectorAll('button')];let i=options.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[i].focus();});
 $('#coach-create').focus();
};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#habit-picker, #chat-context'))closeHabitPicker();});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#emoji-picker, #emoji-picker-button'))closeEmojiPicker();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#habit-picker')){e.preventDefault();closeHabitPicker(true);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#emoji-picker')){e.preventDefault();closeEmojiPicker(true);}});
document.addEventListener('focusin',e=>{if($('#habit-picker')&&!e.target.closest('#habit-picker, #chat-context'))closeHabitPicker();});
document.addEventListener('focusin',e=>{if($('#emoji-picker')&&!e.target.closest('#emoji-picker, #emoji-picker-button'))closeEmojiPicker();});
$('#chat-context').onclick=()=>contextMenu();
$('#chat-context').setAttribute('aria-haspopup','dialog');
$('#chat-context').setAttribute('aria-expanded','false');
$('#chat-context').setAttribute('aria-label','Mention a habit or set up a new one');
$('#chat-context').title='Mention or create a habit';
$('#emoji-picker-button').onclick=toggleEmojiPicker;
const manualHabitModal=habitModal;
habitModal=function(h,preset){
 manualHabitModal(h,preset);
 const button=document.createElement('button');button.type='button';button.className='secondary setup-with-coach';
 button.innerHTML=ico('spark')+(h?'Edit with coach':'Set up with coach');
 $('#habit-form').before(button);
 button.onclick=()=>{$('#modal').close();if(h)mentionHabit(h.id);else startHabitSetup();};
};
const originalCoachRender=renderChat;
renderChat=function(){
 originalCoachRender();showHabitAttachment();
 state.messages.forEach((message,index)=>{
  if(message.role!=='model'||!message.habitProposal)return;
  const p=message.habitProposal;
  let fields;try{fields=HabitCoach.values(p.values);if(!['create','update'].includes(p.action))return;}catch{return;}
  const anchor=$(`[data-copy="${index}"]`)?.parentElement;if(!anchor)return;
  const card=document.createElement('section');card.className='coach-habit-draft';card.setAttribute('aria-label','Habit draft');
  const labels={name:'Habit',cue:'After I…',tiny:'I will…',reward:'My reward',time:'Time of day',icon:'Personality'};
  card.innerHTML=`<div class="eyebrow">${message.habitApplied?'SAVED':p.action==='create'?'NEW HABIT':'PROPOSED CHANGES'}</div><h3>${esc(fields.icon)} ${esc(fields.name)}</h3><dl>${HabitCoach.fields.filter(k=>k!=='name'&&k!=='icon').map(k=>`<div><dt>${labels[k]}</dt><dd>${esc(fields[k]||'None')}</dd></div>`).join('')}</dl><button class="primary" ${message.habitApplied?'disabled':''}>${message.habitApplied?'Saved':p.action==='create'?'Create habit':'Save changes'}</button><p class="draft-status" role="status">${message.habitApplied?'Your habit is saved.':'Review the details, or ask the coach to adjust them.'}</p>`;
  anchor.before(card);
  if(!message.habitApplied&&state.messages.slice(index+1).some(m=>m.habitProposal)){
   card.querySelector('button').disabled=true;card.querySelector('.draft-status').textContent='A newer draft is available below.';
  }
  card.querySelector('button').onclick=async()=>{
   const button=card.querySelector('button'),status=card.querySelector('.draft-status');
   if(message.habitApplied||button.disabled)return;
   if(chatBusy){status.textContent='Wait for the coach to finish before saving.';return;}
   const target=state.habits.find(h=>h.id===p.habitId);
   if(p.action==='update'&&(!target||JSON.stringify(HabitCoach.snapshot(target))!==JSON.stringify(p.base))){status.textContent='This habit changed since the draft was made. Mention it again and ask for a fresh draft.';return;}
   if(p.action==='create'&&state.habits.length>=100){status.textContent='Your habit library is full.';return;}
   button.disabled=true;
   const old=target?HabitCoach.snapshot(target):null;
   const created=p.action==='create'?{...fields,id:crypto.randomUUID(),created:dayKey(),logs:{}}:null;
   if(created)state.habits.push(created);else Object.assign(target,fields);
   message.habitApplied=true;
   try{await save();render();renderChat();toast(created?'Habit created.':'Habit updated.');}
   catch{delete message.habitApplied;if(created)state.habits=state.habits.filter(h=>h.id!==created.id);else Object.assign(target,old);button.disabled=false;status.textContent='Could not save. Your habit has not changed. Try again.';}
  };
 });
 $('#chat').scrollTop=$('#chat').scrollHeight;
};
// Attach the exact habit when entering from a habit card.
document.addEventListener('click',e=>{const button=e.target.closest('[data-ask-coach]');if(button)mentionHabit(button.dataset.askCoach);});
if(state)renderChat();
