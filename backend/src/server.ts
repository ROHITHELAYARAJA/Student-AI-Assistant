import './config';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { api } from './study/api';
export const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { 'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], 'font-src': ["'self'", 'https://fonts.gstatic.com'], 'img-src': ["'self'", 'data:', 'blob:'], 'script-src': ["'self'"], 'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null } } }));
app.use(express.json({ limit: '2mb' }));
app.use('/api', (req,res,next) => {
  res.setHeader('Cache-Control','no-store');
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin) {
    const allowed = (process.env.APP_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000').split(',');
    if (!allowed.includes(req.headers.origin)) { res.status(403).json({message:'This request origin is not allowed.'}); return; }
  }
  next();
});
app.get('/api/health',(_req,res)=>res.json({status:'healthy',service:'blast-study'}));
app.use('/api',api);
app.use('/api',(_req,res)=>res.status(404).json({message:'This endpoint is not available.'}));
const frontend = path.resolve(__dirname,'../../frontend/dist');
if (existsSync(frontend)) { app.use(express.static(frontend)); app.get('*',(_req,res)=>res.sendFile(path.join(frontend,'index.html'))); }
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({message:'Invalid request body.'}));
if (require.main === module) app.listen(Number(process.env.PORT || 5000),process.env.HOST || '127.0.0.1',()=>console.log('Blast AI study server is ready.'));
export default app;
