import { availableModels, invoke, ModelSpec, Turn, ModelFailure, classifyFailure } from './model';
import { parseModelJson } from './schema';
export type TaskType='learning'|'large-document'|'reasoning'|'coding'|'coding-heavy'|'visual';
export type TaskContext={prompt:string;history?:string[];sourceText?:string;sourceCharacters?:number;pageCount?:number;hasImages?:boolean};
const grok='xai.grok-4.6',k3='moonshotai.kimi-k3',glm='zai.glm-5',deep='deepseek.v3.2',qwen='qwen.qwen3-coder-next',qwen480='qwen.qwen3-coder-480b-a35b-v1:0',kimi='moonshotai.kimi-k2.5';
export const routingOrder:Record<TaskType,string[]>={
 learning:[grok,glm,kimi,'amazon.nova-pro-v1:0','openai.gpt-oss-120b-1:0'],
 'large-document':[k3,kimi,grok,glm,'amazon.nova-pro-v1:0'],
 reasoning:[glm,deep,grok,kimi,'openai.gpt-oss-120b-1:0'],
 coding:[deep,qwen,qwen480,glm,kimi],
 'coding-heavy':[qwen,qwen480,deep,glm,kimi],
 visual:[kimi,k3,grok,'qwen.qwen3-vl-235b-a22b','amazon.nova-pro-v1:0','amazon.nova-lite-v1:0']
};
const coding=/\b(code|coding|debug|debugging|programming|typescript|javascript|python|java|compiler|refactor|stack trace|sql|implement|function|repository|unit tests?)\b|```|\b(def|const|let)\s+\w+\s*[=(]/i;
const reasoning=/\b(prove|proof|theorem|integral|derivative|calculus|equation|mathematics|maths?|dsa|dynamic programming|time complexity|big.?o|recurrence|logical reasoning|graph algorithm|eigenvalue)\b|[∫∑√]/i;
export function detectTask(c:TaskContext):TaskType{
 if(c.hasImages)return 'visual';
 if((c.sourceCharacters||0)>60000||(c.pageCount||0)>60)return 'large-document';
 const query=c.prompt.normalize('NFKC');const explicitReasoning=reasoning.test(query), explicitCoding=coding.test(query);
 if(explicitReasoning)return 'reasoning';
 const recent=(c.history||[]).slice(-4);
 if(explicitCoding&&(/\b(codebase|repository|multi.file|refactor|code analysis|programming exercises)\b/i.test(query)||query.length>1800||recent.filter(s=>coding.test(s)).length>=2))return 'coding-heavy';
 if(explicitCoding)return 'coding';
 // Resolve short contextual follow-ups using the user's prior questions, not model prose.
 if(/^(why|how|what about|explain (that|this|it)|continue|show me|and |can you expand)/i.test(query)&&recent.length)return detectTask({...c,prompt:recent.at(-1)!,history:[]});
 if(reasoning.test((c.sourceText||'').slice(0,6000)))return 'reasoning';
 if(coding.test((c.sourceText||'').slice(0,6000)))return 'coding';
 return 'learning';
}
// Conservative UTF-8 byte upper bound: avoids dropping content or assuming English token ratios.
export function inputBudget(system:string,messages:Turn[]){return Buffer.byteLength(system)+messages.reduce((n,m)=>n+Buffer.byteLength(m.text)+(m.images?.length||0)*5000+100,0)+1000;}
export function candidates(task:TaskType,available:ModelSpec[],budget:number,maxOutput:number,hasImages:boolean){return routingOrder[task].map(id=>available.find(m=>m.id===id)).filter((m):m is ModelSpec=>!!m&&(!hasImages||m.vision)&&m.contextTokens>=budget+maxOutput&&m.maxOutput>=maxOutput);}
export type RouteRequest<T>={system:string;messages:Turn[];context:TaskContext;maxTokens:number;validate:(raw:unknown)=>T;onFallback?:()=>void};
const cooldown=new Map<string,number>();
export async function routeStructured<T>(req:RouteRequest<T>,deps={available:availableModels,call:invoke,now:()=>Date.now()}){
 const task=detectTask(req.context),start=deps.now(),deadline=start+205000;
 const available=await deps.available();const hasImages=req.messages.some(m=>!!m.images?.length);
 const images=req.messages.flatMap(m=>m.images||[]);
 if(images.length>20||images.reduce((n,i)=>n+i.bytes.length,0)>12*1024*1024)throw new Error('Please study fewer visual pages at once (up to 20 images).');
 const eligible=candidates(task,available,inputBudget(req.system,req.messages),req.maxTokens,hasImages);
 if(!eligible.length)throw new Error(hasImages?'This visual material cannot be processed by an available study model right now. Please try again later.':'This material is too large for the available study models, or the study service is unavailable. Try a smaller chapter.');
 let attempts=0;const failures:string[]=[];
 for(const model of eligible){
  const key=(process.env.AWS_REGION||'')+':'+model.id;
  if((cooldown.get(key)||0)>deps.now())continue;
  if(attempts>=3||deadline-deps.now()<1000)break;
  if(attempts)req.onFallback?.();attempts++;
  try{
   const response=await deps.call(req.system,req.messages,model.id,req.maxTokens,Math.min(65000,deadline-deps.now()));
   let value:T;try{value=req.validate(parseModelJson(response.text));}catch{throw new ModelFailure('invalid',true);}
   return {value,modelId:response.modelId,usage:response.usage,routing:{task,attempts,fallback:attempts>1}};
  }catch(error){const failure=classifyFailure(error);failures.push(failure.kind);
   // Diagnostics contain no prompt, provider response, document, key or user identifier.
   console.warn(JSON.stringify({event:'study_model_attempt_failed',task,modelId:model.id,kind:failure.kind}));
   if(failure.kind==='verification')throw new Error('Study generation is waiting for service activation. Your notes are saved. Please contact the workspace owner.');
   if(failure.kind==='blocked')throw new Error('This request could not be completed. Try rephrasing it as a study question.');
   if(!failure.retryable)throw new Error('The study service is unavailable. Your notes are saved; please try again later.');
   if(failure.kind!=='invalid')cooldown.set(key,deps.now()+(failure.kind==='unavailable'?300000:60000));
  }
 }
 throw new Error(failures.includes('quota')?'The study service has reached its usage limit. Your notes are saved; please try again later.':'A complete study response could not be created right now. Your notes are saved; please try again shortly.');
}
