require('../backend/dist/config');
const {invoke}=require('../backend/dist/study/model');
(async()=>{for(const id of ['amazon.nova-pro-v1:0','openai.gpt-oss-120b-1:0']){try{const r=await invoke('Return only the JSON object {"ok":true}.',[{role:'user',text:'Check the study service connection.'}],id,100);console.log(JSON.stringify({model:id,text:r.text,usage:r.usage}));}catch(e){console.log(JSON.stringify({model:id,error:e.message}));}}})();
