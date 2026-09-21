const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{load:()=>ipcRenderer.invoke('load'),save:s=>ipcRenderer.invoke('save',s),saveKey:(k,p)=>ipcRenderer.invoke('key',k,p),hasKey:p=>ipcRenderer.invoke('hasKey',p),testOpenAI:()=>ipcRenderer.invoke('testOpenAI'),openExternal:u=>ipcRenderer.invoke('openExternal',u),chat:(m,attachment)=>ipcRenderer.invoke('chat',m,attachment),exportData:()=>ipcRenderer.invoke('export'),importData:()=>ipcRenderer.invoke('import')});

