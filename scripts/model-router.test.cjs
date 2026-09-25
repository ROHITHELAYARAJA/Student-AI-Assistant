const {test}=require('node:test');const assert=require('node:assert/strict');
const {detectTask,candidates,routeStructured,inputBudget}=require('../backend/dist/study/modelRouter');
const {models,ModelFailure}=require('../backend/dist/study/model');
const cases=[['Explain photosynthesis','learning'],['Prove the recurrence for this DSA problem','reasoning'],['Debug this Python function','coding'],['Refactor this multi-file repository','coding-heavy'],['Explain active recall','learning'],['How does DNA encode proteins?','learning']];
for(const [prompt,expected]of cases)test('routes '+prompt,()=>assert.equal(detectTask({prompt}),expected));
test('large inputs and real visual attachments take priority',()=>{assert.equal(detectTask({prompt:'Explain this',sourceCharacters:70000}),'large-document');assert.equal(detectTask({prompt:'Debug this function',hasImages:true}),'visual');assert.equal(detectTask({prompt:'Explain this image without an attachment'}),'learning');});
test('follow-ups use history but explicit subject changes win',()=>{assert.equal(detectTask({prompt:'Explain that',history:['Debug my Python code']}),'coding');assert.equal(detectTask({prompt:'Explain photosynthesis',history:['Debug Python code']}),'learning');assert.equal(detectTask({prompt:'Write Python code',history:['Debug Python','Refactor my code']}),'coding-heavy');});
test('availability, image capability and context are mandatory',()=>{const region=models.filter(m=>!['xai.grok-4.6','moonshotai.kimi-k3','qwen.qwen3-coder-next'].includes(m.id));assert.equal(candidates('learning',region,1000,2500,false)[0].id,'zai.glm-5');assert.equal(candidates('coding-heavy',region,1000,2500,false)[0].id,'qwen.qwen3-coder-480b-a35b-v1:0');assert.ok(candidates('visual',models,1000,2500,true).every(m=>m.vision));assert.equal(candidates('coding',models,2000000,2500,false).length,0);assert.ok(inputBudget('',[{role:'user',text:'தமிழ்'}])>5);});
const base={system:'Return JSON.',messages:[{role:'user',text:'Explain memory'}],context:{prompt:'Explain memory'},maxTokens:100,validate:o=>{if(o.answer!=='valid')throw Error('bad schema');return o;}};
let tick=Date.now()+10000000;
function deps(call,available=models){tick+=1000000;return {call,available:async()=>available,now:()=>tick};}
test('transient failure uses next eligible model',async()=>{const ids=[];const r=await routeStructured(base,deps(async(_s,_m,id)=>{ids.push(id);if(ids.length===1)throw Object.assign(Error('private provider message'),{name:'ServiceUnavailableException'});return {text:'{"answer":"valid"}',modelId:id};}));assert.equal(r.routing.attempts,2);assert.deepEqual(ids,['xai.grok-4.6','zai.glm-5']);});
test('invalid raw output is never returned; fallback is validated',async()=>{let n=0;const r=await routeStructured(base,deps(async(_s,_m,id)=>({text:++n===1?'secret invalid text':'{"answer":"valid"}',modelId:id})));assert.equal(r.value.answer,'valid');assert.equal(n,2);assert.equal(r.text,undefined);});
test('three-attempt budget and sanitized quota errors',async()=>{let n=0;await assert.rejects(routeStructured(base,deps(async()=>{n++;throw Object.assign(Error('Too many tokens per day private'),{name:'ThrottlingException'});})),e=>/usage limit/.test(e.message)&&!e.message.includes('private'));assert.equal(n,3);});
test('invalid credential and content filtering do not trigger fallback',async()=>{for(const kind of ['auth','blocked']){let n=0;await assert.rejects(routeStructured(base,deps(async()=>{n++;throw new ModelFailure(kind,false);})));assert.equal(n,1);}});
test('vision failures never fall through to text-only models',async()=>{const seen=[];await assert.rejects(routeStructured({...base,context:{prompt:'Read figure',hasImages:true},messages:[{role:'user',text:'Read figure',images:[{format:'png',bytes:Buffer.from([1]),sourceId:'p1'}]}]},deps(async(_s,m,id)=>{seen.push(id);assert.equal(m[0].images.length,1);throw new ModelFailure('busy',true);},models.filter(m=>m.id==='moonshotai.kimi-k2.5'||!m.vision))));assert.deepEqual(seen,['moonshotai.kimi-k2.5']);});
test('oversized text is rejected before invocation, not truncated',async()=>{let n=0;await assert.rejects(routeStructured({...base,messages:[{role:'user',text:'x'.repeat(1100000)}]},deps(async()=>{n++;})));assert.equal(n,0);});

test('catalog excludes cross-Region-only models and preserves in-Region IDs',async()=>{
 const provider=require('../backend/dist/study/model');const oldFetch=global.fetch,oldRegion=process.env.AWS_REGION,oldKey=process.env.AWS_BEARER_TOKEN_BEDROCK;
 process.env.AWS_REGION='ap-south-1';process.env.AWS_BEARER_TOKEN_BEDROCK='offline-test-key';
 global.fetch=async()=>({ok:true,json:async()=>({modelSummaries:[{modelId:'xai.grok-4.6',inferenceTypesSupported:['INFERENCE_PROFILE'],inputModalities:['TEXT','IMAGE'],outputModalities:['TEXT']},{modelId:'zai.glm-5',inferenceTypesSupported:['ON_DEMAND'],inputModalities:['TEXT'],outputModalities:['TEXT']} ]})});
 try{assert.deepEqual((await provider.availableModels()).map(m=>m.id),['zai.glm-5']);}
 finally{global.fetch=oldFetch;if(oldRegion===undefined)delete process.env.AWS_REGION;else process.env.AWS_REGION=oldRegion;if(oldKey===undefined)delete process.env.AWS_BEARER_TOKEN_BEDROCK;else process.env.AWS_BEARER_TOKEN_BEDROCK=oldKey;}
});
test('AWS verification restriction is account-wide and not retried',()=>{
 const {classifyFailure}=require('../backend/dist/study/model');const failure=classifyFailure({name:'AccessDeniedException',message:'Your account is currently being verified.'});assert.equal(failure.kind,'auth');assert.equal(failure.retryable,false);
});
