import { BedrockRuntimeClient, ConverseCommand, ContentBlock } from '@aws-sdk/client-bedrock-runtime';
export type ModelSpec = { id:string; label:string; contextTokens:number; maxOutput:number; vision:boolean };
export const nemotronSpec: ModelSpec = {
  id: 'nvidia/nemotron-3-ultra-550b-a55b',
  label: 'NVIDIA Nemotron Ultra',
  contextTokens: 500000,
  maxOutput: 8000,
  vision: true
};

export const models: ModelSpec[] = [
  {id:'xai.grok-4.6',label:'Grok 4.6',contextTokens:500000,maxOutput:16000,vision:true},
  {id:'moonshotai.kimi-k3',label:'Kimi K3',contextTokens:1000000,maxOutput:16000,vision:true},
  {id:'zai.glm-5',label:'GLM 5',contextTokens:200000,maxOutput:16000,vision:false},
  {id:'deepseek.v3.2',label:'DeepSeek V3.2',contextTokens:164000,maxOutput:8000,vision:false},
  {id:'qwen.qwen3-coder-next',label:'Qwen3 Coder Next',contextTokens:256000,maxOutput:16000,vision:false},
  {id:'qwen.qwen3-coder-480b-a35b-v1:0',label:'Qwen3 Coder 480B',contextTokens:256000,maxOutput:16000,vision:false},
  {id:'moonshotai.kimi-k2.5',label:'Kimi K2.5',contextTokens:256000,maxOutput:16000,vision:true},
  {id:'qwen.qwen3-vl-235b-a22b',label:'Qwen3 VL',contextTokens:128000,maxOutput:8000,vision:true},
  {id:'openai.gpt-oss-120b-1:0',label:'GPT OSS 120B',contextTokens:128000,maxOutput:16000,vision:false},
  {id:'amazon.nova-pro-v1:0',label:'Nova Pro',contextTokens:300000,maxOutput:10000,vision:true},
  {id:'amazon.nova-lite-v1:0',label:'Nova Lite',contextTokens:300000,maxOutput:10000,vision:true}
];
export type StudyImage={format:'png'|'jpeg';bytes:Uint8Array;sourceId:string};
export type Turn={role:'user'|'assistant';text:string;images?:StudyImage[]};
export class ModelFailure extends Error {
  constructor(public kind:'auth'|'verification'|'quota'|'busy'|'unavailable'|'invalid'|'blocked'|'configuration',public retryable:boolean){super('The study service could not complete this response. Please try again shortly.');}
}
function configuration(){
 const region=process.env.AWS_REGION,token=process.env.AWS_BEARER_TOKEN_BEDROCK||process.env.BEDROCK_API_KEY;
 if(!region||!/^([a-z]{2}-[a-z]+-\d)$/.test(region)||!token)throw new ModelFailure('configuration',false);
 return {region,token};
}
let cached:{region:string;token:string;expires:number;items:ModelSpec[]}|undefined;
let pending:{key:string;promise:Promise<ModelSpec[]>}|undefined;
export async function availableModels():Promise<ModelSpec[]>{
 const nvidiaKey = process.env.NVIDIA_API_KEY;
 if (nvidiaKey && process.env.NODE_ENV !== 'test') {
   return [nemotronSpec, ...models];
 }
 const {region,token}=configuration();
 if(cached?.region===region&&cached.token===token&&cached.expires>Date.now())return cached.items;
 const key=region+token;
 if(pending?.key===key)return pending.promise;
 const promise=(async()=>{
  try{
   const response=await fetch(`https://bedrock.${region}.amazonaws.com/foundation-models`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new ModelFailure(response.status===401||response.status===403?'auth':'unavailable',false);
   const payload=await response.json() as {modelSummaries?:{modelId:string;inferenceTypesSupported:string[];inputModalities:string[];outputModalities:string[];modelLifecycle?:{status:string}}[]};
   if(!Array.isArray(payload.modelSummaries))throw new ModelFailure('unavailable',false);
   const items=models.filter(m=>payload.modelSummaries!.some(s=>s.modelId===m.id&&s.inferenceTypesSupported?.includes('ON_DEMAND')&&s.outputModalities?.includes('TEXT')&&(!m.vision||s.inputModalities?.includes('IMAGE'))&&s.modelLifecycle?.status!=='LEGACY'));
   cached={region,token,expires:Date.now()+300000,items};return items;
  }catch(e){if(e instanceof ModelFailure)throw e;throw new ModelFailure('unavailable',false);}
 })();pending={key,promise};try{return await promise;}finally{if(pending?.promise===promise)pending=undefined;}
}
export function classifyFailure(err:any):ModelFailure{
 if(err instanceof ModelFailure)return err;
 if(['UnrecognizedClientException','ExpiredTokenException','InvalidSignatureException'].includes(err?.name))return new ModelFailure('auth',false);
 if(err?.name==='AccessDeniedException'&&/currently being verified|account.*verif/i.test(err.message||''))return new ModelFailure('verification',false);
 if(err?.name==='AccessDeniedException'&&/invalid.*key|expired.*key/i.test(err.message||''))return new ModelFailure('auth',false);
 if(err?.name==='ThrottlingException')return new ModelFailure(/tokens per day/i.test(err.message)?'quota':'busy',true);
 if(['AccessDeniedException','ResourceNotFoundException','ValidationException'].includes(err?.name))return new ModelFailure('unavailable',true);
 if(['AbortError','TimeoutError','ModelTimeoutException','ServiceUnavailableException','InternalServerException','ModelNotReadyException'].includes(err?.name)||err?.$metadata?.httpStatusCode>=500)return new ModelFailure('busy',true);
 return new ModelFailure('unavailable',false);
}
export async function invoke(system:string,messages:Turn[],selected?:string,maxTokens=6000,timeoutMs=65000){
 const nvidiaKey = process.env.NVIDIA_API_KEY;
 const nvidiaBase = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
 const nvidiaModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
 if (nvidiaKey) {
   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), Math.max(timeoutMs, 85000));
     const res = await fetch(`${nvidiaBase}/chat/completions`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${nvidiaKey}`
       },
       body: JSON.stringify({
         model: nvidiaModel,
         messages: [
           ...(system ? [{ role: 'system', content: system }] : []),
           ...messages.map(m => ({ role: m.role, content: m.text }))
         ],
         temperature: 0.3,
         max_tokens: Math.min(maxTokens, 8192)
       }),
       signal: controller.signal
     });
     clearTimeout(timeoutId);
     if (res.ok) {
       const json = await res.json() as any;
       const text = json?.choices?.[0]?.message?.content || '';
       if (text.trim()) {
         return {
           text,
           modelId: nvidiaModel,
           usage: {
             inputTokens: json?.usage?.prompt_tokens || 0,
             outputTokens: json?.usage?.completion_tokens || 0,
             totalTokens: json?.usage?.total_tokens || 0
           },
           latencyMs: undefined
         };
       }
     } else {
       const errBody = await res.text().catch(() => '');
       console.warn(`NVIDIA call returned status ${res.status}:`, errBody.slice(0, 300));
     }
   } catch (e) {
     console.warn('NVIDIA call failed in invoke, falling back to Bedrock:', e);
   }
 }
 const hasBedrockConfig = process.env.AWS_REGION && (process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.BEDROCK_API_KEY);
 if (!hasBedrockConfig) {
   throw new ModelFailure('unavailable', true);
 }
 const {region,token}=configuration();const spec=models.find(m=>m.id===selected);
 // No arbitrary IDs, inference profiles, external endpoints or cross-Region routing.
 if(!spec)throw new ModelFailure('configuration',false);
 const client=new BedrockRuntimeClient({region,maxAttempts:1,token:{token}});
 try{
  const response=await client.send(new ConverseCommand({modelId:spec.id,system:[{text:system}],messages:messages.map(m=>({role:m.role,content:[{text:m.text},...(m.images||[]).flatMap(i=>[{text:`Image source ID: ${i.sourceId}`},{image:{format:i.format,source:{bytes:i.bytes}}}] as ContentBlock[])]})),inferenceConfig:{maxTokens:Math.min(maxTokens,spec.maxOutput)}}),{abortSignal:AbortSignal.timeout(timeoutMs)});
  if(['guardrail_intervened','content_filtered'].includes(response.stopReason||''))throw new ModelFailure('blocked',false);
  if(response.stopReason==='max_tokens')throw new ModelFailure('invalid',true);
  const text=response.output?.message?.content?.map(c=>c.text||'').join('')||'';
  if(!text.trim())throw new ModelFailure('invalid',true);
  return {text,modelId:spec.id,usage:response.usage,latencyMs:response.metrics?.latencyMs};
 }catch(e){throw classifyFailure(e);}finally{client.destroy();}
}
