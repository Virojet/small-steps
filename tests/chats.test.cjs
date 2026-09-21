const test=require('node:test'),assert=require('node:assert/strict');
const {initialState,validateState}=require('../core.cjs'),chats=require('../chat-store.js');
test('legacy chat migrates with messages and proposals preserved',()=>{
 const state=initialState();const message={role:'model',text:'Draft',habitApplied:true,habitProposal:{action:'create'}};state.messages=[message];
 validateState(state);assert.equal(state.chats.length,1);assert.deepEqual(state.messages,[message]);assert.equal(state.activeChatId,'chat-legacy');
 validateState(state);assert.equal(state.chats.length,1);
});
test('conversation histories survive save validation without cross-chat contamination',()=>{
 const s=validateState(initialState());s.messages=[{role:'user',text:'First chat'}];chats.sync(s);
 s.chats.push({id:'two',title:'',updatedAt:0,messages:[{role:'user',text:'Second chat'}],draft:'My draft',attachment:{mode:'new'}});s.activeChatId='two';
 validateState(s);assert.equal(s.messages[0].text,'Second chat');assert.equal(s.chats[0].messages[0].text,'First chat');assert.equal(chats.title(s.chats[1]),'Second chat');
 const copy=validateState(JSON.parse(JSON.stringify(s)));assert.equal(copy.chats[1].draft,'My draft');assert.deepEqual(copy.chats[1].attachment,{mode:'new'});
});
test('malformed histories and invalid preferences are rejected on restore',()=>{
 let s=validateState(initialState());s.chats.push({...s.chats[0]});assert.throws(()=>validateState(s));
 s=validateState(initialState());s.chats[0].messages=[{role:'system',text:'bad'}];assert.throws(()=>validateState(s));
 s=initialState();s.enterToSend='yes';assert.throws(()=>validateState(s));
});
