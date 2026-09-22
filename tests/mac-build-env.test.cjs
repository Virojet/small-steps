const test=require('node:test');
const assert=require('node:assert/strict');
const macBuildEnv=require('../scripts/mac-build-env.cjs');

test('empty GitHub signing secrets do not trigger macOS signing',()=>{
 const source={CSC_LINK:'',CSC_KEY_PASSWORD:'',APPLE_ID:'',APPLE_APP_SPECIFIC_PASSWORD:'',APPLE_TEAM_ID:'',PATH:'example'};
 const env=macBuildEnv(source);
 assert.equal(env.CSC_LINK,undefined);
 assert.equal(env.CSC_KEY_PASSWORD,undefined);
 assert.equal(env.APPLE_ID,undefined);
 assert.equal(env.CSC_IDENTITY_AUTO_DISCOVERY,'false');
 assert.equal(env.PATH,'example');
 assert.equal(source.CSC_LINK,'');
});

test('configured signing credentials remain available to the builder',()=>{
 const env=macBuildEnv({CSC_LINK:'certificate.p12',CSC_KEY_PASSWORD:'password',APPLE_ID:'id',APPLE_APP_SPECIFIC_PASSWORD:'app-password',APPLE_TEAM_ID:'team'});
 assert.equal(env.CSC_LINK,'certificate.p12');
 assert.equal(env.CSC_KEY_PASSWORD,'password');
 assert.equal(env.APPLE_ID,'id');
 assert.equal(env.CSC_IDENTITY_AUTO_DISCOVERY,undefined);
});
