(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ChatStore=factory();})(globalThis,()=>{
 function validateMessages(messages){
  if(!Array.isArray(messages)||messages.length>2000)throw Error('Invalid conversation history.');
  for(const m of messages)if(!m||!['user','model'].includes(m.role)||typeof m.text!=='string'||m.text.length>20000)throw Error('Invalid chat message.');
 }
 function normalize(state){
  if(state.chats===undefined){state.chats=[{id:'chat-legacy',title:'',messages:state.messages||[],updatedAt:Date.now(),draft:'',attachment:null}];state.activeChatId='chat-legacy';}
  if(!Array.isArray(state.chats)||!state.chats.length||state.chats.length>200)throw Error('Invalid saved chats.');
  const ids=new Set();
  for(const chat of state.chats){
   if(!chat||typeof chat.id!=='string'||!chat.id||chat.id.length>100||ids.has(chat.id)||typeof chat.title!=='string'||chat.title.length>120||!Number.isFinite(chat.updatedAt)||typeof chat.draft!=='string'||chat.draft.length>4000)throw Error('Invalid saved chat.');
   ids.add(chat.id);validateMessages(chat.messages);
   if(chat.attachment!==null&&chat.attachment!==undefined&&(!['new','edit'].includes(chat.attachment.mode)||(chat.attachment.mode==='edit'&&typeof chat.attachment.habitId!=='string')))throw Error('Invalid habit mention.');
  }
  if(!ids.has(state.activeChatId))throw Error('Active chat is missing.');
  state.messages=state.chats.find(c=>c.id===state.activeChatId).messages;
  return state;
 }
 function title(chat){return chat.title||chat.messages.find(m=>m.role==='user')?.text.replace(/\s+/g,' ').slice(0,60)||'New chat';}
 function sync(state){
  if(!state.chats)normalize(state);
  const active=state.chats.find(c=>c.id===state.activeChatId);
  if(!active)throw Error('Active chat is missing.');
  active.messages=state.messages;active.updatedAt=Date.now();
 }
 return {normalize,sync,title,validateMessages};
});
