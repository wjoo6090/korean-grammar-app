import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {evaluate} from './api/evaluate.js';
const files={'/':'index.html','/index.html':'index.html','/config.js':'config.js'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname==='/api/evaluate'){
   const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
   const response=await evaluate(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  const filename=files[url.pathname];if(!filename){res.writeHead(404);res.end('Not found');return;}
  const content=await readFile(new URL('./public/'+filename,import.meta.url));res.writeHead(200,{'Content-Type':filename.endsWith('.js')?'text/javascript;charset=utf-8':'text/html;charset=utf-8'});res.end(content);
 }catch{res.writeHead(500);res.end('Server error');}
}).listen(3000,'127.0.0.1',()=>console.log('Open http://localhost:3000'));
