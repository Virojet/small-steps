const {test}=require('node:test');const assert=require('node:assert/strict');
const {callOpenAI}=require('../openai.cjs');const {initialState,migrateToOpenAI}=require('../core.cjs');
const reply=(status,data)=>async()=>({ok:status===200,status,json:async()=>data});
test('Responses request uses official endpoint, maps history, and disables response storage',async()=>{
 const result=await callOpenAI([{role:'user',text:'Start small'},{role:'model',text:'Try one page.'},{role:'user',text:'Thanks'}],'gpt-5-mini','fake-test-key','Coach instructions',async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.Authorization,'Bearer fake-test-key');
  const b=JSON.parse(options.body);assert.equal(b.store,false);assert.deepEqual(b.input.map(x=>x.role),['user','assistant','user']);assert.equal(b.instructions,'Coach instructions');assert.equal(b.reasoning.effort,'low');assert.equal(b.max_tokens,undefined);
  return {ok:true,json:async()=>({status:'completed',output:[{type:'reasoning',summary:[]},{type:'message',content:[{type:'output_text',text:'One page.'},{type:'output_text',text:'You can do it.'}]}]})};
 });assert.equal(result,'One page.\nYou can do it.');
});
test('auth, quota, rate limit, and missing-model errors have distinct next steps',async()=>{
 for(const [status,code,expected] of [[401,'invalid_api_key',/rejected this API key/],[429,'insufficient_quota',/credit or spending limit/],[429,'rate_limit_exceeded',/Wait a moment/],[404,'model_not_found',/model is unavailable/],[403,'forbidden',/permission/]])await assert.rejects(callOpenAI([],'gpt-5-mini','fake','',reply(status,{error:{code,message:'should never echo upstream secrets'}})),expected);
});
test('timeouts, refusal, empty and truncated responses are handled',async()=>{
 await assert.rejects(callOpenAI([],'gpt-5-mini','fake','',async()=>{throw new DOMException('timeout','TimeoutError');}),/too long/);
 await assert.rejects(callOpenAI([],'gpt-5-mini','fake','',reply(200,{output:[]})),/no text/);
 await assert.rejects(callOpenAI([],'gpt-5-mini','fake','',reply(200,{status:'incomplete',output:[]})),/response limit/);
 assert.equal(await callOpenAI([],'gpt-5-mini','fake','',reply(200,{output:[{type:'message',content:[{type:'refusal',refusal:'Cannot help with that.'}]}]})),'Cannot help with that.');
});
test('legacy provider migration preserves habit and conversation data',()=>{
 const original={...initialState(),provider:'gemini',model:'gemini-3.8-flash',messages:[{role:'user',text:'A small step'}]};const migrated=migrateToOpenAI(structuredClone(original));assert.equal(migrated.provider,'openai');assert.equal(migrated.model,'gpt-5-mini');assert.deepEqual(migrated.messages,original.messages);assert.deepEqual(migrated.habits,original.habits);assert.deepEqual(migrateToOpenAI(migrated),migrated);
 const other={...initialState(),provider:'groq',model:'llama-3.3-70b-versatile',baseUrl:'https://api.groq.com/openai/v1'};const normalized=migrateToOpenAI(other);assert.equal(normalized.provider,'openai');assert.equal(normalized.model,'gpt-5-mini');assert.equal(normalized.baseUrl,'');
});
