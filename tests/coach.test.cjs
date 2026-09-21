const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../coach-protocol.js');
const fields={name:'Read daily',cue:'I make coffee',tiny:'read one page',reward:'Enjoy tea',time:'Morning',icon:'📖'};
test('setup resumes until saved and repairs only consecutive duplicate introductions',()=>{
 const intro={role:'model',text:coach.setupIntro};
 const user={role:'user',text:'Read daily'};
 assert.deepEqual(coach.cleanSetupPrompts([intro,intro,intro,user,intro]),[intro,user,intro]);
 assert.equal(coach.hasOpenSetup([intro,user]),true);
 assert.equal(coach.hasOpenSetup([intro,{habitApplied:true,habitProposal:{action:'update'}}]),true);
 assert.equal(coach.hasOpenSetup([intro,{habitApplied:true,habitProposal:{action:'create'}}]),false);
 assert.equal(coach.hasOpenSetup([]),false);
 const {initialState,validateState}=require('../core.cjs');const state=initialState();state.messages=[intro,intro,intro];
 assert.deepEqual(validateState(state).messages,[intro]);
});
const reply=(action,habitId,values=fields)=>'Ready to review.\n```habit\n'+JSON.stringify({action,habitId,values})+'\n```';
test('coach proposals validate all form fields and reject malformed replies',()=>{
 assert.deepEqual(coach.parse(reply('create',null),{mode:'new'}).proposal.values,fields);
 assert.equal(coach.parse(reply('create',null,{...fields,time:'Night'})).proposal,undefined);
 assert.equal(coach.parse(reply('create',null,{...fields,name:'x'.repeat(101)})).proposal,undefined);
 assert.equal(coach.parse('```habit\ninvalid\n```').proposal,undefined);
 assert.equal(coach.parse(reply('create',null)+reply('create',null)).proposal,undefined);
});
test('edits can target only the mentioned habit and retain a stale-edit snapshot',()=>{
 const context={mode:'edit',habitId:'a',base:fields};
 assert.equal(coach.parse(reply('update','b'),context).proposal,undefined);
 assert.equal(coach.parse(reply('update','a'),null).proposal,undefined);
 assert.equal(coach.parse(reply('create',null),context).proposal,undefined);
 assert.deepEqual(coach.parse(reply('update','a'),context).proposal.base,fields);
 assert.deepEqual(Object.keys(coach.values({...fields,logs:{bad:'full'},id:'evil'})),coach.fields);
});
test('setup prompt gathers each form field and keeps ordinary guidance available',()=>{
 const prompt=coach.instructions({mode:'new'});
 for(const key of coach.fields)assert.ok(prompt.includes(key));
 assert.deepEqual(coach.icons,['🌱','📖','🌿','✍','💧','☀','🧘','🎨','🎵','💪']);
 for(const icon of coach.icons)assert.ok(prompt.includes(icon));
 assert.match(prompt,/exactly these icons and no others/);assert.match(prompt,/ONE missing question/);assert.match(prompt,/ordinary advice/);
});
