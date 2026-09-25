require('../backend/dist/config');
const {routeStructured}=require('../backend/dist/study/modelRouter');
(async()=>{try{const r=await routeStructured({system:'Return only JSON: {"ok":true}.',messages:[{role:'user',text:'Connection check.'}],context:{prompt:'Explain learning'},maxTokens:80,validate:o=>{if(o.ok!==true)throw Error('Invalid check');return o;}});console.log(JSON.stringify({ok:true,modelId:r.modelId,routing:r.routing}));}catch(e){console.log(JSON.stringify({ok:false,message:e.message}));process.exitCode=1;}})();
