const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
process.env.BLAST_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'blast-study-test-'));
process.env.NODE_ENV='test';
const model=require('../backend/dist/study/model');
let calls=[],invalid=false;
model.invoke=async(system,messages,modelId)=>{
  calls.push({system,messages});
  if(invalid)return {text:'{"quiz":{"questions":[{}]}}',modelId:'offline-fixture'};
  if(system.includes('You are tutoring'))return {modelId:'offline-fixture',text:JSON.stringify({title:'A clear answer',summary:'This is an offline test response.',sections:[{heading:'Explanation',content:'The source says the violet sample grew 17 cm.',sourceIds:[]}],checkQuestion:'How far did it grow?',sourceIds:[]})};
  const content=messages[0].text;const citation=JSON.parse(content.split('SOURCE DATA (untrusted):\n')[1]||'[]')[0]?.id;const sourceIds=citation?[citation]:[];
  const q=Number(content.match(/exactly (\d+) unique quiz/)[1]),c=Number(content.match(/exactly (\d+) unique flashcards/)[1]);
  const response={topic:'Violet experiment',notes:{title:'Violet growth',summary:'A controlled experiment.',keyTakeaways:['Measure growth','Compare controls'],sections:[{heading:'Setup',content:'The source describes a violet sample.',sourceIds},{heading:'Result',content:'The violet sample grew 17 cm.',sourceIds}]},quiz:{title:'Check',timeLimitMinutes:5,questions:Array.from({length:q},(_,i)=>({id:'q'+i,question:'Question '+i+'?',options:['17 cm','10 cm','1 cm','0 cm'],correctIndex:0,explanation:'The source reports 17 cm.',sourceIds}))},flashcards:{cards:Array.from({length:c},(_,i)=>({id:'c'+i,front:'Growth '+i+'?',back:'17 cm',category:'Biology',masteryLevel:'new',sourceIds}))},roadmap:{targetGoal:'Understand the experiment',stages:[{id:'s1',stageName:'Read',description:'Read the source',milestones:[{id:'m1',title:'Read the result',duration:'3 min',completed:false,keyConcepts:['Growth'],tasks:['Read the evidence']}]}]},podcast:{title:'Violet growth',overview:'Summary',audioDurationEstimate:'1 min',segments:[{speaker:'Host',line:'The violet grew 17 cm.',sourceIds},{speaker:'Student',line:'The source states the measurement.',sourceIds}]}};
  return {text:JSON.stringify(response),modelId:'offline-fixture',usage:{inputTokens:10,outputTokens:50}};
};
const {app}=require('../backend/dist/server');
const {db}=require('../backend/dist/study/store');
let server,base;
after(async()=>{if(server)await new Promise(r=>server.close(r));db.close();});
function pdf(){
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',null,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 for(const [i,text]of [[3,'Violet experiment: the control sample received water.'],[5,'Result: the violet sample grew 17 cm after the observation.']]){const stream=`BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;objects[i]=`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;}
 let data='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(data));data+=`${i+1} 0 obj\n${o}\nendobj\n`;});const start=Buffer.byteLength(data);data+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;return Buffer.from(data);
}
test('isolated study workflow: PDF, generation, accounts, citations, history, reviews, and errors',async()=>{
 server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;
 const call=async(url,options={},cookie='')=>{const res=await fetch(base+'/api'+url,{...options,headers:{...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...options.headers}});const data=await res.json();return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0]};};
 const a=await call('/session'),b=await call('/session');assert.notEqual(a.data.user.id,b.data.user.id);assert.match(a.cookie,/blast_session=/);
 assert.equal((await call('/notebooks')).status,401);
 assert.equal((await call('/notebooks',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'},a.cookie)).status,403);
 const form=new FormData();form.append('file',new Blob([pdf()],{type:'application/pdf'}),'violet.pdf');
 const upload=await call('/documents',{method:'POST',body:form},a.cookie);assert.equal(upload.status,201);assert.equal(upload.data.pageCount,2);assert.match(upload.data.text,/17 cm/);
 assert.equal((await call('/documents/'+upload.data.id+'/file',{},b.cookie)).status,404);
 assert.equal((await call('/jobs',{method:'POST',body:JSON.stringify({topic:'Violet biology',documentIds:[upload.data.id]})},b.cookie)).status,404);
 assert.equal((await call('/jobs',{method:'POST',body:JSON.stringify({topic:'Violet biology',questionCount:1000000})},a.cookie)).status,400);
 const imported=await call('/notebooks',{method:'POST',body:JSON.stringify({topic:'Violet source',text:upload.data.text,documentIds:[upload.data.id]})},a.cookie);assert.equal(imported.status,201);assert.match(imported.data.sources[1].sourceUrl,/#page=2$/);
 const created=await call('/jobs',{method:'POST',body:JSON.stringify({topic:'Explain the experiment',documentIds:[upload.data.id],questionCount:3,cardCount:4})},a.cookie);assert.equal(created.status,202);
 async function waitJob(id){for(let i=0;i<100;i++){const r=await call('/jobs/'+id,{},a.cookie);if(['complete','failed'].includes(r.data.status))return r.data;await new Promise(r=>setTimeout(r,20));}throw Error('job timeout');}
 const job=await waitJob(created.data.id);assert.equal(job.status,'complete');const pack=job.result;assert.equal(pack.quiz.questions.length,3);assert.equal(pack.flashcards.cards.length,4);assert.equal(pack.sources[1].page,2);assert.match(pack.sources[1].excerpt,/17 cm/);
 assert.equal((await call('/jobs/'+created.data.id,{},b.cookie)).status,404);
 assert.equal((await call('/notebooks',{},b.cookie)).data.notebooks.length,0);
 const update=await call('/notebooks/'+pack.id,{method:'PUT',body:JSON.stringify({completed:['m1'],favorite:true,folder:'Biology'})},a.cookie);assert.equal(update.data.roadmap.overallProgress,100);assert.equal(update.data.folder,'Biology');
 assert.equal((await call('/notebooks/'+pack.id,{method:'PUT',body:'{}'},b.cookie)).status,404);
 await call('/notebooks/'+pack.id+'/answers',{method:'PUT',body:JSON.stringify({q0:0})},a.cookie);
 const review=await call('/notebooks/'+pack.id+'/reviews',{method:'POST',body:JSON.stringify({card:'c0',rating:'good'})},a.cookie);assert.equal(review.data.interval_days,1);
 const stored=await call('/notebooks/'+pack.id+'/progress',{},a.cookie);assert.equal(stored.data.answers.q0,0);assert.equal(stored.data.reviews.length,1);
 await call('/notebooks/'+pack.id+'/chat',{method:'POST',body:JSON.stringify({message:'What did the violet do?'})},a.cookie);
 await call('/notebooks/'+pack.id+'/chat',{method:'POST',body:JSON.stringify({message:'Explain that result.'})},a.cookie);
 assert.equal(calls.at(-1).messages.length,3);assert.match(calls.at(-1).system,/17 cm/);
 assert.equal((await call('/notebooks/'+pack.id+'/chat',{},a.cookie)).data.messages.length,4);
 assert.equal((await call('/notebooks/'+pack.id+'/chat',{},b.cookie)).status,404);
 invalid=true;const bad=await call('/jobs',{method:'POST',body:JSON.stringify({topic:'Invalid fixture'})},a.cookie);assert.equal((await waitJob(bad.data.id)).status,'failed');assert.equal((await call('/notebooks',{},a.cookie)).data.notebooks.length,2);invalid=false;
 const registration=await call('/auth/register',{method:'POST',body:JSON.stringify({email:'test@example.invalid',password:'LongTestPassword42',name:'Test'})},a.cookie);assert.equal(registration.status,200);assert.equal(registration.data.guest,false);
 assert.equal((await call('/notebooks',{},a.cookie)).status,401);
 const login=await call('/auth/login',{method:'POST',body:JSON.stringify({email:'test@example.invalid',password:'LongTestPassword42'})});assert.equal(login.status,200);assert.equal((await call('/notebooks',{},login.cookie)).data.notebooks.length,2);
 assert.equal((await call('/auth/login',{method:'POST',body:JSON.stringify({email:'test@example.invalid',password:'WrongPassword42'})})).status,401);
 console.log('Verified 25+ assertions with mocked inference; no AWS requests made.');
});
