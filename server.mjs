import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const base=path.resolve(import.meta.dirname,'site');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.pdf':'application/pdf','.md':'text/markdown; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let url;
 try {url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
 if(url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true}');}
 let file=path.resolve(base,'.'+url);
 if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);return res.end();}
 try{
  let stat=fs.statSync(file);
  if(stat.isDirectory()){file=path.join(file,'index.html');stat=fs.statSync(file);}
  const ext=path.extname(file);
  const headers={'Content-Type':types[ext]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'};
  let start=0,end=stat.size-1,code=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
   if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}else if(match[2]){start=Math.max(0,stat.size-Number(match[2]));}
   if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}
   code=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=String(end-start+1);
  res.writeHead(code,headers);
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{
  res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'});
  res.end('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>مرسال — الصفحة غير موجودة</title><body style="font-family:system-ui;padding:10%;background:#f6f7f4;color:#063a66"><h1>الصفحة غير موجودة / Page not found</h1><a href="/">العودة إلى مرسال / Back to Mersal</a></body></html>');
 }
});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Mersal preview listening on 0.0.0.0:'+(process.env.PORT||3000)));
