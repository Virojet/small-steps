// Conversation history, including per-chat composer drafts and habit mentions.
let draftSaveTimer;
function captureChatDraft(){
 ChatStore.sync(state);
 const chat=state.chats.find(c=>c.id===state.activeChatId);
 chat.draft=$('#chat-input').value;
 chat.attachment=attachedHabit?{...attachedHabit}:null;
}
function restoreChatDraft(){
 const chat=state.chats.find(c=>c.id===state.activeChatId);
 attachedHabit=chat.attachment||null;$('#chat-input').value=chat.draft||'';
 $('#chat-input').dispatchEvent(new Event('input'));showHabitAttachment();
 $('.composer-hint').textContent=state.enterToSend===false?'Enter for a new line · Click the arrow to send':'Enter to send · Shift + Enter for a new line';
}
const saveWithHabitChanges=save;
save=function(){captureChatDraft();return saveWithHabitChanges();};
$('#chat-input').addEventListener('input',()=>{
 clearTimeout(draftSaveTimer);
 if(!state)return;
 draftSaveTimer=setTimeout(()=>{if(!chatBusy)save().catch(()=>{});},500);
});
function blankChat(){return {id:crypto.randomUUID(),title:'',messages:[],draft:'',attachment:null,updatedAt:Date.now()};}
async function changeChat(id,removeId){
 if(chatBusy)return toast('Wait for the current response first.');
 clearTimeout(draftSaveTimer);captureChatDraft();const previous=structuredClone(state);
 if(!id&&!removeId&&state.chats.length>=200)return toast('You have 200 saved chats. Delete an old chat before starting another.');
 chatBusy=true;
 try{
  if(removeId)state.chats=state.chats.filter(c=>c.id!==removeId);
  let next=id?state.chats.find(c=>c.id===id):null;
  if(!next){next=blankChat();state.chats.unshift(next);}
  state.activeChatId=next.id;state.messages=next.messages;restoreChatDraft();
  await save();closeHabitPicker();renderChat();$('#modal').close();toggleCoach(true);$('#chat-input').focus();
 }catch(e){state=previous;restoreChatDraft();renderChat();toast('Could not update chats. Please try again.');}
 finally{chatBusy=false;}
}
function newCoachChat(){
 if(chatBusy)return toast('Wait for the current response first.');
 if(!state.messages.length&&!$('#chat-input').value.trim()&&!attachedHabit){$('#modal').close();toggleCoach(true);$('#chat-input').focus();return;}
 return changeChat();
}
function showChatHistory(){
 if(chatBusy)return toast('Wait for the current response first.');
 captureChatDraft();
 openModal(`<h2>Your chats</h2><p>Pick up where you left off.</p><button class="secondary" id="history-new">${ico('newchat')} New chat</button><div class="chat-history">${[...state.chats].sort((a,b)=>b.updatedAt-a.updatedAt).map(c=>`<div class="chat-history-row"><button class="history-open" data-chat="${esc(c.id)}"><strong>${esc(ChatStore.title(c))}</strong><small>${c.id===state.activeChatId?'Current chat · ':''}${new Date(c.updatedAt).toLocaleDateString()} · ${c.messages.length} messages</small></button><button class="icon-button" data-delete-chat="${esc(c.id)}" aria-label="Delete ${esc(ChatStore.title(c))}" title="Delete chat">${ico('close')}</button></div>`).join('')}</div><div class="actions"><button class="secondary" data-close>Close</button></div>`);
 $('#history-new').onclick=newCoachChat;
 document.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>changeChat(b.dataset.chat));
 document.querySelectorAll('[data-delete-chat]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.deleteChat,chat=state.chats.find(c=>c.id===id);
  openModal(`<h2>Delete this chat?</h2><p>“${esc(ChatStore.title(chat))}” will be permanently removed. Your habits and check-ins will stay.</p><div class="actions"><button class="secondary" id="cancel-chat-delete">Cancel</button><button class="primary" id="confirm-chat-delete">Delete chat</button></div>`);
  $('#cancel-chat-delete').onclick=showChatHistory;
  $('#confirm-chat-delete').onclick=async()=>{const next=id===state.activeChatId?state.chats.find(c=>c.id!==id)?.id:state.activeChatId;await changeChat(next,id);};
 });
}
const newChatButton=$('#clear-chat');
newChatButton.setAttribute('aria-label','New chat');newChatButton.title='New chat';newChatButton.onclick=newCoachChat;
const historyButton=document.createElement('button');historyButton.id='chat-history';historyButton.className='icon-button';historyButton.title='Chat history';historyButton.setAttribute('aria-label','Chat history');historyButton.innerHTML=ico('journal');newChatButton.before(historyButton);historyButton.onclick=showChatHistory;
if(state)restoreChatDraft();
