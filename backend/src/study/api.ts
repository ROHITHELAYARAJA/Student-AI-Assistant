import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { YoutubeTranscript } from 'youtube-transcript';
import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { db, notebook, listNotebooks, saveNotebook, addDocument, getDocuments } from './store';
import { issueSession, logout, passwordHash, readUser, requireUser, session, verifyPassword } from './auth';
import { GenerateRequest, TutorRequest } from './schema';
import { generate, tutor, sourceChunks } from './generation';
import { models } from './model';
export const api = express.Router();
const run = (fn: (req:Request,res:Response)=>Promise<void>|void) => (req:Request,res:Response,next:NextFunction) => Promise.resolve().then(()=>fn(req,res)).catch(next);
const authLimit = rateLimit({ windowMs: 15*60*1000, limit:30, standardHeaders:'draft-7', legacyHeaders:false, message:{message:'Too many sign-in attempts. Please try again later.'} });
api.get('/session', session);
const credentials = z.object({ email:z.string().email().max(254).transform(s=>s.toLowerCase()), password:z.string().min(10).max(128), name:z.string().trim().min(1).max(50).optional() });
api.post('/auth/register', authLimit, run(async(req,res)=>{
  const input=credentials.parse(req.body); const existing=db.prepare('SELECT id FROM users WHERE email=?').get(input.email); if(existing){res.status(409).json({message:'An account with this email already exists.'});return;}
  const current=readUser(req); const id=current&&!current.email?current.id:randomUUID(); const password=await passwordHash(input.password);
  if(current&&!current.email) db.prepare('UPDATE users SET email=?,name=?,password=? WHERE id=?').run(input.email,input.name||'Student',password,id);
  else db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(id,input.email,input.name||'Student',password,new Date().toISOString());
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
  issueSession(res,id);res.json({user:{id,email:input.email,name:input.name||'Student'},guest:false});
}));
api.post('/auth/login', authLimit, run(async(req,res)=>{
  const input=credentials.parse(req.body);const row=db.prepare('SELECT * FROM users WHERE email=?').get(input.email) as any;
  if(!row || !await verifyPassword(input.password,row.password)){res.status(401).json({message:'Email or password is incorrect.'});return;}
  issueSession(res,row.id);res.json({user:{id:row.id,email:row.email,name:row.name},guest:false});
}));
api.post('/auth/logout', logout);
api.use(requireUser);
api.get('/models',(_req,res)=>res.json({models,defaultModel:process.env.BEDROCK_MODEL_ID||models[0].id,region:process.env.AWS_REGION,configured:!!(process.env.AWS_BEARER_TOKEN_BEDROCK||process.env.BEDROCK_API_KEY)}));
api.get('/notebooks',(req,res)=>res.json({notebooks:listNotebooks(req.user.id)}));
const importSchema=z.object({topic:z.string().trim().min(2).max(160),text:z.string().trim().min(1).max(120000),documentIds:z.array(z.string().uuid()).max(8).default([])});
api.post('/notebooks',run((req,res)=>{
  const input=importSchema.parse(req.body);getDocuments(req.user.id,input.documentIds);let ids=input.documentIds;
  if(!ids.length) ids=[addDocument(req.user.id,input.topic,[{page:1,text:input.text}]).id];
  const pack={id:randomUUID(),topic:input.topic,createdAt:new Date().toISOString(),documentIds:ids,notes:{topic:input.topic,title:input.topic,summary:'Your source notes',lastUpdated:new Date().toISOString(),keyTakeaways:[],sections:[{heading:'Your notes',content:input.text}]},roadmap:{topic:input.topic,targetGoal:'',totalStages:0,totalMilestones:0,overallProgress:0,stages:[]},quiz:{topic:input.topic,title:input.topic,timeLimitMinutes:0,questions:[]},flashcards:{topic:input.topic,cards:[]},podcast:{topic:input.topic,title:input.topic,overview:'',audioDurationEstimate:'',segments:[]},sources:[]};
  const sources=sourceChunks(req.user.id,ids).map(c=>({...c,sourceUrl:`/api/documents/${c.documentId}/file#page=${c.page}`,summary:c.excerpt,category:`Uploaded source · page ${c.page}`,keyTakeaways:[],relevance:'Original source excerpt'}));
  const saved={...pack,sources};saveNotebook(req.user.id,saved);res.status(201).json(saved);
}));
api.put('/notebooks/:id',run((req,res)=>{
  const pack=notebook(req.user.id,req.params.id);if(!pack){res.status(404).json({message:'Notebook not found.'});return;}
  const update=z.object({notes:z.object({title:z.string().min(1).max(200),summary:z.string().max(20000),keyTakeaways:z.array(z.string().max(4000)).max(30),sections:z.array(z.object({heading:z.string().max(500),content:z.string().max(120000),bulletPoints:z.array(z.string().max(4000)).optional(),formulas:z.array(z.string().max(4000)).optional(),codeSnippet:z.object({language:z.string(),code:z.string().max(30000)}).optional(),sourceIds:z.array(z.string()).optional()})).max(30)}).optional(),completed:z.array(z.string()).max(50).optional(),favorite:z.boolean().optional(),folder:z.string().trim().max(60).optional()}).parse(req.body);
  if(update.notes)pack.notes={...pack.notes,...update.notes,lastUpdated:new Date().toISOString()};
  if(update.completed){for(const s of pack.roadmap.stages){for(const m of s.milestones)m.completed=update.completed.includes(m.id);s.progressPercent=Math.round(s.milestones.filter((m:any)=>m.completed).length/s.milestones.length*100);}const all=pack.roadmap.stages.flatMap((s:any)=>s.milestones);pack.roadmap.overallProgress=all.length?Math.round(all.filter((m:any)=>m.completed).length/all.length*100):0;}
  if(update.favorite!==undefined)pack.favorite=update.favorite;if(update.folder!==undefined)pack.folder=update.folder;
  saveNotebook(req.user.id,pack);res.json(pack);
}));
api.delete('/notebooks/:id',run((req,res)=>{const id=req.params.id;db.exec('BEGIN');try{db.prepare('DELETE FROM notebooks WHERE owner=? AND id=?').run(req.user.id,id);for(const table of ['messages','reviews','attempts'])db.prepare(`DELETE FROM ${table} WHERE owner=? AND notebook=?`).run(req.user.id,id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}res.json({success:true});}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1,fields:2}});
api.post('/documents',rateLimit({windowMs:60000,limit:10,keyGenerator:req=>req.user.id,standardHeaders:'draft-7',legacyHeaders:false}),upload.single('file'),run(async(req,res)=>{
  if(!req.file){res.status(400).json({message:'Choose a PDF, TXT, or Markdown file.'});return;}
  const file=req.file;let pages:{page:number;text:string}[]=[];let mime='text/plain';
  if(file.buffer.subarray(0,5).toString()==='%PDF-'){
    const parser=new PDFParse({data:new Uint8Array(file.buffer)});
    try{const info=await parser.getInfo();if(info.total>80)throw new Error('Please upload a PDF with at most 80 pages. Split larger books into chapters.');const result=await parser.getText();pages=result.pages.map(p=>({page:p.num,text:p.text.trim()}));mime='application/pdf';}finally{await parser.destroy();}
    if(pages.some(p=>p.text.length<20))throw new Error('This PDF contains scanned or empty pages. OCR is not configured; upload a searchable PDF or paste its transcript so no pages are silently skipped.');
  } else if(/\.(txt|md)$/i.test(file.originalname)){const text=file.buffer.toString('utf8');if(text.includes('\u0000'))throw new Error('This is not a readable text file.');pages=[{page:1,text:text.trim()}];}
  else {res.status(415).json({message:'Supported files: searchable PDF, TXT, and Markdown.'});return;}
  const text=pages.map(p=>p.text).join('\n\n');if(!text.trim()||text.length>120000)throw new Error('Choose readable notes with up to 120,000 extracted characters.');
  const doc=addDocument(req.user.id,file.originalname.slice(0,160),pages,file.buffer,mime);res.status(201).json({...doc,text});
}));
api.get('/documents/:id/file',run((req,res)=>{const row=db.prepare('SELECT original,mime,pages FROM documents WHERE id=? AND owner=?').get(req.params.id,req.user.id) as any;if(!row){res.status(404).json({message:'Document not found.'});return;}res.type(row.mime);res.setHeader('Content-Disposition','inline; filename="source'+(row.mime==='application/pdf'?'.pdf':'.txt')+'"');res.send(row.original?Buffer.from(row.original):JSON.parse(row.pages).map((p:any)=>p.text).join('\n\n'));}));
api.post('/documents/youtube',run(async(req,res)=>{
  const {url}=z.object({url:z.string().url().max(500)}).parse(req.body);const parsed=new URL(url);let id='';
  if(parsed.protocol!=='https:'||!['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(parsed.hostname))throw new Error('Enter an HTTPS YouTube video link.');
  id=parsed.hostname==='youtu.be'?parsed.pathname.slice(1):parsed.searchParams.get('v')||'';
  if(!/^[a-zA-Z0-9_-]{11}$/.test(id))throw new Error('Enter a YouTube watch link with a valid video ID.');
  let transcript;
  try{transcript=await YoutubeTranscript.fetchTranscript(id,{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(20000)})});}
  catch{throw new Error('A public transcript could not be retrieved for this video. Paste the transcript instead; no video content has been guessed.');}
  const text=transcript.map(x=>x.text).join(' ');if(!text.trim()||text.length>120000)throw new Error('This transcript is empty or too long. Import a shorter section.');
  const title=`YouTube lesson ${id}`;const doc=addDocument(req.user.id,title,[{page:1,text}]);res.status(201).json({...doc,title,text});
}));
const aiLimit=rateLimit({windowMs:60*60*1000,limit:30,keyGenerator:req=>req.user.id,standardHeaders:'draft-7',legacyHeaders:false,message:{message:'Study generation limit reached. Please try again later.'}});
let activeJobs=0;
api.post('/jobs',aiLimit,run((req,res)=>{
  const input=GenerateRequest.parse(req.body);getDocuments(req.user.id,input.documentIds);
  if(activeJobs>=2||db.prepare("SELECT id FROM jobs WHERE owner=? AND status IN ('queued','running')").get(req.user.id)){res.status(429).json({message:'Another study set is being created. Please wait for it to finish.'});return;}
  const id=randomUUID(),owner=req.user.id;db.prepare('INSERT INTO jobs VALUES(?,?,?,?,NULL,NULL,?)').run(id,owner,'queued','Getting started',new Date().toISOString());activeJobs++;res.status(202).json({id});
  void generate(owner,input,phase=>{db.prepare("UPDATE jobs SET status='running',phase=? WHERE id=?").run(phase,id);}).then(pack=>db.prepare("UPDATE jobs SET status='complete',phase='Ready',result=? WHERE id=?").run(JSON.stringify(pack),id)).catch(err=>db.prepare("UPDATE jobs SET status='failed',phase='Could not finish',error=? WHERE id=?").run(err instanceof z.ZodError?'The model returned invalid study material. Please retry.':String(err.message||'Generation failed').slice(0,500),id)).finally(()=>activeJobs--);
}));
api.get('/jobs/:id',(req,res)=>{const row=db.prepare('SELECT id,status,phase,result,error FROM jobs WHERE id=? AND owner=?').get(req.params.id,req.user.id) as any;if(!row){res.status(404).json({message:'Study task not found.'});return;}res.json({...row,result:row.result?JSON.parse(row.result):undefined});});
api.get('/notebooks/:id/chat',run((req,res)=>{if(!notebook(req.user.id,req.params.id)){res.status(404).json({message:'Notebook not found.'});return;}res.json({messages:db.prepare('SELECT role,payload FROM messages WHERE owner=? AND notebook=? ORDER BY id').all(req.user.id,req.params.id).map((row:any)=>({role:row.role,...JSON.parse(row.payload)}))});}));
api.post('/notebooks/:id/chat',aiLimit,run(async(req,res)=>{const input=TutorRequest.parse(req.body);res.json(await tutor(req.user.id,req.params.id,input.message));}));
api.get('/notebooks/:id/progress',run((req,res)=>{if(!notebook(req.user.id,req.params.id)){res.status(404).json({message:'Notebook not found.'});return;}const attempt=db.prepare('SELECT payload FROM attempts WHERE owner=? AND notebook=?').get(req.user.id,req.params.id) as any;res.json({answers:attempt?JSON.parse(attempt.payload):{},reviews:db.prepare('SELECT card,interval_days,due,rating FROM reviews WHERE owner=? AND notebook=?').all(req.user.id,req.params.id)});}));
api.put('/notebooks/:id/answers',run((req,res)=>{const pack=notebook(req.user.id,req.params.id);if(!pack){res.status(404).json({message:'Notebook not found.'});return;}const answers=z.record(z.string(),z.number().int().min(0).max(3)).parse(req.body);if(Object.keys(answers).some(id=>!pack.quiz.questions.some((q:any)=>q.id===id)))throw new Error('Unknown quiz question.');db.prepare('INSERT INTO attempts VALUES(?,?,?) ON CONFLICT(owner,notebook) DO UPDATE SET payload=excluded.payload').run(req.user.id,pack.id,JSON.stringify(answers));res.json({answers});}));
api.post('/notebooks/:id/reviews',run((req,res)=>{const pack=notebook(req.user.id,req.params.id);if(!pack){res.status(404).json({message:'Notebook not found.'});return;}const input=z.object({card:z.string(),rating:z.enum(['again','good','easy'])}).parse(req.body);if(!pack.flashcards.cards.some((c:any)=>c.id===input.card))throw new Error('Unknown flashcard.');const previous=db.prepare('SELECT interval_days FROM reviews WHERE owner=? AND notebook=? AND card=?').get(req.user.id,pack.id,input.card) as any;const days=input.rating==='again'?0:Math.min(90,Math.max(input.rating==='easy'?4:1,(previous?.interval_days||0)*(input.rating==='easy'?3:2)));const due=new Date(Date.now()+(days?days*86400000:600000)).toISOString();db.prepare('INSERT INTO reviews VALUES(?,?,?,?,?,?) ON CONFLICT(owner,notebook,card) DO UPDATE SET interval_days=excluded.interval_days,due=excluded.due,rating=excluded.rating').run(req.user.id,pack.id,input.card,days,due,input.rating);res.json({card:input.card,interval_days:days,due,rating:input.rating});}));
api.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{const status=err instanceof z.ZodError?400:err instanceof multer.MulterError?413:err.status||400;res.status(status).json({message:err instanceof z.ZodError?'Some fields are invalid. Check your input and try again.':err instanceof multer.MulterError?'File too large. Choose one file up to 10 MB.':String(err.message||'Could not complete this action.').slice(0,500)});});
