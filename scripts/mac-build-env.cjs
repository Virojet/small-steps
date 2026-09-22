module.exports=function macBuildEnv(source){
 const env={...source};
 for(const key of ['CSC_LINK','CSC_KEY_PASSWORD','APPLE_ID','APPLE_APP_SPECIFIC_PASSWORD','APPLE_TEAM_ID']){
  if(!env[key]?.trim())delete env[key];
 }
 if(!env.CSC_LINK)env.CSC_IDENTITY_AUTO_DISCOVERY='false';
 return env;
};
