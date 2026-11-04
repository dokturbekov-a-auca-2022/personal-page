const allowed=new Map([['get-session','GET'],['token','GET'],['email-otp/send-verification-otp','POST'],['sign-in/email-otp','POST'],['sign-in/email','POST'],['sign-out','POST']]);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
 const url=new URL(req.url,'http://localhost'),path=url.searchParams.get('path');
 if(allowed.get(path)!==req.method){res.statusCode=404;return res.end('Not found');}
 const headers=new Headers();for(const key of ['content-type','cookie','origin','user-agent'])if(req.headers[key])headers.set(key,req.headers[key]);
 // Do not forward Vercel's host/forwarded-host headers to the managed auth service.
 const target=new URL(process.env.MERCYMED_AUTH_URL+'/'+path);
 for(const [key,value]of url.searchParams)if(key!=='path')target.searchParams.append(key,value);
 let body;if(req.method==='POST'){body=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});if(body.length>8192){res.statusCode=413;return res.end('Request too large');}}
 const upstream=await fetch(target,{method:req.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(20000)});
 res.statusCode=upstream.status;for(const key of ['content-type','set-auth-jwt','retry-after'])if(upstream.headers.has(key))res.setHeader(key,upstream.headers.get(key));
 const cookies=upstream.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
 res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.statusCode=502;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({message:'Sign-in is temporarily unavailable. Please try again.'}));}
}
