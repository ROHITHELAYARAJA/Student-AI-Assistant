import { TurboStudyPack } from '../types/turbo';
export async function request<T=any>(url:string, options:RequestInit={}):Promise<T> {
  let res:Response;
  try { res=await fetch(`/api${url}`,{credentials:'same-origin',...options,headers: options.body instanceof FormData?options.headers:{'Content-Type':'application/json',...options.headers}}); }
  catch { throw new Error('We couldn’t connect to your workspace. Check your connection and try again.'); }
  if(!res.headers.get('content-type')?.includes('application/json'))throw new Error('This preview isn’t connected to Blast. Open the Blast workspace and try again.');
  const data=await res.json().catch(()=>{throw new Error('We couldn’t read this response. Please try again.');});
  if(!res.ok)throw new Error(data.message||'This action could not be completed.');return data;
}
export type StudySettings={questionCount:number;cardCount:number;difficulty:'beginner'|'intermediate'|'advanced';language:string};
export async function createStudy(topic:string,documentIds:string[],settings:StudySettings,onProgress:(s:string)=>void):Promise<TurboStudyPack>{
  const {id}=await request('/jobs',{method:'POST',body:JSON.stringify({topic,documentIds,...settings})});
  // Store the job ID so a refresh can reconnect instead of losing a paid generation.
  sessionStorage.setItem('blast_active_job',id);
  return await followStudy(id,onProgress);
}
export async function followStudy(id:string,onProgress:(s:string)=>void):Promise<TurboStudyPack>{
  for(let n=0;n<180;n++){
    const job=await request(`/jobs/${id}`);onProgress(job.phase);
    if(job.status==='complete'){sessionStorage.removeItem('blast_active_job');return job.result;}
    if(job.status==='failed'){sessionStorage.removeItem('blast_active_job');throw new Error(job.error||'Could not create the study set.');}
    await new Promise(r=>setTimeout(r,1500));
  }
  throw new Error('This task is still processing. Reload to reconnect to it.');
}
export async function saveRemote(pack:TurboStudyPack){return request<TurboStudyPack>(`/notebooks/${pack.id}`,{method:'PUT',body:JSON.stringify({notes:pack.notes,completed:pack.roadmap.stages.flatMap(s=>s.milestones.filter(m=>m.completed).map(m=>m.id)),favorite:pack.favorite,folder:pack.folder})});}

export type ChatResponse = {
  reply: string;
  modelId?: string;
  suggestedTopic?: string;
  suggestedAction?: {
    type: 'create_notebook';
    topic: string;
    label: string;
  };
  quickPrompts?: string[];
};

export async function sendChat(message: string, history: { role: string; text: string }[] = []): Promise<ChatResponse> {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history })
  });
}

