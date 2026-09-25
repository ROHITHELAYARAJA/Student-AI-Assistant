const path=require('node:path');
require('../backend/node_modules/dotenv').config({path:path.join(__dirname,'../backend/.env')});
(async()=>{
 const region=process.env.AWS_REGION;
 const res=await fetch(`https://bedrock.${region}.amazonaws.com/foundation-models`,{headers:{Authorization:`Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`},signal:AbortSignal.timeout(20000)});
 const data=await res.json();
 console.log(JSON.stringify({status:res.status,region,models:data.modelSummaries?.filter(m=>['Anthropic','Amazon','OpenAI'].includes(m.providerName)&&m.outputModalities.includes('TEXT')).map(m=>({id:m.modelId,name:m.modelName,modes:m.inferenceTypesSupported})),error:data.message?.slice(0,300)},null,2));
})().catch(e=>console.log(JSON.stringify({error:e.message})));
