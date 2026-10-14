// Separate deployment: secrets and recipient allowlist stay in Worker settings.
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(origin!==env.ALLOWED_ORIGIN)return new Response('Forbidden',{status:403});
  const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Content-Type':'application/json','Cache-Control':'no-store'};
  const reply=(status,error)=>Response.json(error?{error}:{accepted:true},{status,headers});
  if(new URL(request.url).pathname!=='/report')return reply(404,'not_found');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
  if(request.method!=='POST')return reply(405,'method_not_allowed');
  if(!env.RESEND_API_KEY||!env.TURNSTILE_SECRET||!env.MAIL_FROM||!env.PARENT_EMAILS||!env.MAIL_LIMIT)return reply(503,'not_configured');
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,'json_required');
  try{
   // Stream cap also covers chunked requests that omit Content-Length.
   const reader=request.body?.getReader();if(!reader)return reply(400,'invalid_payload');
   const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>18000){await reader.cancel();return reply(413,'too_large');}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   const body=JSON.parse(new TextDecoder().decode(bytes));
   if(typeof body.email!=='string'||typeof body.studentName!=='string'||!body.studentName.trim()||body.studentName.length>80||typeof body.text!=='string'||body.text.length>6000||!body.text.startsWith('9. Atölye — Test Sonuç Raporu')||typeof body.reportId!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(body.reportId)||typeof body.token!=='string'||body.token.length>2048)return reply(400,'invalid_payload');
   const email=body.email.trim().toLowerCase();const allowed=env.PARENT_EMAILS.split(',').map(x=>x.trim().toLowerCase());
   if(!allowed.includes(email))return reply(403,'recipient_not_allowed');
   const {success}=await env.MAIL_LIMIT.limit({key:email});if(!success)return reply(429,'rate_limit');
   const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET,response:body.token,remoteip:request.headers.get('CF-Connecting-IP')||undefined}),signal:AbortSignal.timeout(10000)});
   if(!check.ok)return reply(502,'verification_unavailable');const verified=await check.json();
   if(!verified.success||verified.hostname!==new URL(env.ALLOWED_ORIGIN).hostname||verified.action!=='parent-report')return reply(403,'verification_failed');
   const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'atolye9/0.4.0','Authorization':'Bearer '+env.RESEND_API_KEY,'Idempotency-Key':'atolye9-'+body.reportId},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject:'9. Atölye — Test Sonuç Raporu',text:body.text}),signal:AbortSignal.timeout(15000)});
   if(!sent.ok)return reply(502,'mail_provider_failed');return reply(200);
  }catch{return reply(400,'request_failed');}
 }
};
