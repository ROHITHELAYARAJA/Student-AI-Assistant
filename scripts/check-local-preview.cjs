const http=require('node:http');
(async()=>{for(const p of ['/api/health','/dashboard','/notes/blast-example']){const r=await fetch('http://127.0.0.1:5000'+p);const body=await r.text();console.log(JSON.stringify({path:p,status:r.status,expected:p.startsWith('/api')?body.includes('blast-study'):body.includes('Blast AI')}));}})();
