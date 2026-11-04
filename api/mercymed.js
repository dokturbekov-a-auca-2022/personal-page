import {neon} from '@neondatabase/serverless';
import {createRemoteJWKSet,jwtVerify} from 'jose';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
const authURL=process.env.MERCYMED_AUTH_URL;
const sql=neon(process.env.MERCYMED_DATABASE_URL);
const jwks=createRemoteJWKSet(new URL(authURL+'/.well-known/jwks.json'));
const problem=(status,message)=>Object.assign(new Error(message),{status});
const reply=(res,status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));};
async function staff(req){
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token)throw problem(401,'Please sign in.');
 let payload;
 try {({payload}=await jwtVerify(token,jwks,{issuer:new URL(authURL).origin,audience:new URL(authURL).origin,algorithms:['EdDSA']}));}catch{throw problem(401,'Your sign-in has expired. Please sign in again.');}
 const rows=await sql`SELECT e.email,e.role FROM mm_editors e JOIN neon_auth.user u ON lower(u.email)=e.email WHERE u.id::text=${payload.sub} AND u."emailVerified"=true AND coalesce(u.banned,false)=false AND e.active=true`;
 if(!rows[0])throw problem(403,'This account needs a verified email and staff access. Ask the website owner to add your email.');
 return rows[0];
}
function checkDocument(doc){
 if(!doc||typeof doc!=='object'||Array.isArray(doc)||JSON.stringify(doc).length>350000)throw problem(400,'The website content is too large or invalid.');
 const walk=(v,depth=0)=>{if(depth>8)throw problem(400,'Invalid content structure.');if(typeof v==='string'){if(v.length>12000)throw problem(400,'Please keep each text field under 12,000 characters.');return;}if(Array.isArray(v)){if(v.length>100)throw problem(400,'Use no more than 100 items per list.');v.forEach(x=>walk(x,depth+1));return;}if(v&&typeof v==='object'){for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw problem(400,'Invalid field.');walk(x,depth+1);}return;}throw problem(400,'Every field must contain text.');};walk(doc);
 for(const lang of ['en','ru','ky']){const t=doc.locales?.[lang];if(!t||!Array.isArray(t.nav)||t.nav.length!==6||!Array.isArray(t.services))throw problem(400,'All three language versions and navigation are required.');if(!t.services.every(x=>Array.isArray(x)&&x.length>=3&&['consultation','support'].includes(x[2])))throw problem(400,'Choose a valid service category.');}
 const translated=v=>v&&['en','ru','ky'].every(l=>typeof v[l]==='string');
 if(!Array.isArray(doc.staff)||doc.staff.length>50||!doc.staff.every(p=>typeof p.name==='string'&&p.name.trim()&&translated(p.role)&&translated(p.bio)&&typeof p.alt==='string'))throw problem(400,'Each team member needs a name, role and biography fields.');
 if(!doc.settings||!Array.isArray(doc.gallery)||!Array.isArray(doc.posts))throw problem(400,'Missing website settings.');
 if(!['phone','whatsapp','email','map','instagram','heroPhoto','heroAlt'].every(k=>typeof doc.settings[k]==='string')||!doc.gallery.every(p=>translated(p.caption))||!doc.posts.every(p=>translated(p.caption)))throw problem(400,'Complete the website settings and captions in all languages.');
 for(const key of ['map','instagram']){const v=doc.settings[key];if(v){let u;try{u=new URL(v);}catch{throw problem(400,'Enter a full HTTPS link.');}if(u.protocol!=='https:')throw problem(400,'Links must start with https://');if(key==='instagram'&&!['instagram.com','www.instagram.com'].includes(u.hostname))throw problem(400,'Use an instagram.com profile link.');}}
 if(doc.settings.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doc.settings.email))throw problem(400,'Enter a valid clinic email.');
 if(doc.settings.phone&&!/^\+?[\d ()-]{6,25}$/.test(doc.settings.phone))throw problem(400,'Enter a valid telephone number.');
 if(doc.settings.whatsapp&&!/^\d{7,15}$/.test(doc.settings.whatsapp))throw problem(400,'WhatsApp needs country code and digits only.');
 const image=v=>!v||/^\/api\/mercymed\?action=image&id=[0-9a-f-]{36}$/.test(v);
 if(!image(doc.settings.heroPhoto)||!doc.staff.every(p=>image(p.photo))||!doc.gallery.every(p=>image(p.photo)&&p.photo&&typeof p.alt==='string'&&p.alt.trim()))throw problem(400,'Use uploaded photos and add an image description.');
 if(doc.settings.heroPhoto&&!doc.settings.heroAlt.trim()||doc.staff.some(p=>p.photo&&!p.alt.trim()))throw problem(400,'Add a description for each uploaded image.');
 for(const p of doc.posts){let u;try{u=new URL(p.url);}catch{throw problem(400,'Add a valid Instagram post link.');}if(u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname)||!/^\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname))throw problem(400,'Use an Instagram post or reel link.');}
 return doc;
}
async function body(req){if(req.body!==undefined)return typeof req.body==='string'?JSON.parse(req.body):req.body;let raw='',size=0;for await(const part of req){size+=part.length;if(size>3200000)throw problem(413,'This upload is too large. Use a photo below 2 MB.');raw+=part;}try{return JSON.parse(raw||'{}');}catch{throw problem(400,'Invalid request.');}}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
 const u=new URL(req.url,'http://localhost');const action=u.searchParams.get('action')||'published';
 if(req.method==='GET'&&action==='config')return reply(res,200,{authURL:'/api/auth'});
 if(req.method==='GET'&&action==='published'){const [row]=await sql`SELECT published AS document,published_at FROM mm_content WHERE id=1`;return reply(res,200,row);}
 if(req.method==='GET'&&action==='image'){const id=u.searchParams.get('id');if(!/^[0-9a-f-]{36}$/.test(id||''))throw problem(404,'Photo not found.');const [r]=await sql`SELECT encode(data,'base64') AS data,type FROM mm_media WHERE id=${id}::uuid`;if(!r)throw problem(404,'Photo not found.');res.setHeader('Content-Type',r.type);res.setHeader('Cache-Control','public, max-age=31536000, immutable');return res.end(Buffer.from(r.data,'base64'));}
 const user=await staff(req);
 if(req.method==='GET'&&action==='draft'){const [r]=await sql`SELECT draft AS document,version,updated_at,published_at FROM mm_content WHERE id=1`;return reply(res,200,{...r,user});}
 if(req.method==='GET'&&action==='history')return reply(res,200,await sql`SELECT id,version,action,actor,created_at FROM mm_history ORDER BY id DESC LIMIT 50`);
 if(req.method==='GET'&&action==='editors'){if(user.role!=='owner')throw problem(403,'Only the owner can manage access.');return reply(res,200,await sql`SELECT email,role,active FROM mm_editors ORDER BY role DESC,email`);}
 if(req.method!=='POST')throw problem(405,'This operation requires POST.');
 const b=await body(req);
 if(['save','publish','restore'].includes(action)){
 if(!Number.isSafeInteger(b.version))throw problem(400,'Reload the editor before saving.');
 let doc=b.document;
 if(action==='restore'){const [r]=await sql`SELECT document FROM mm_history WHERE id::text=${String(b.id)}`;if(!r)throw problem(404,'Version not found.');doc=r.document;}
 checkDocument(doc);
 // Preserve required shapes and classroom privacy warnings, even through direct API calls.
 const [old]=await sql`SELECT published FROM mm_content WHERE id=1`;
 const sameShape=(value,template)=>{if(typeof template==='string')return typeof value==='string';if(Array.isArray(template))return Array.isArray(value)&&value.every(x=>sameShape(x,template[0]));return value&&typeof value==='object'&&Object.keys(template).every(k=>sameShape(value[k],template[k]));};
 for(const lang of ['en','ru','ky']){if(!sameShape(doc.locales[lang],old.published.locales[lang]))throw problem(400,'Some required text fields are missing. Reload the editor.');for(const key of ['notice','footerSafety','demoLabel','demoText','demoResultTitle','demoResultText','demoStatus','sampleName','sampleSurname','sampleDate','samplePhone'])doc.locales[lang][key]=old.published.locales[lang][key];for(const key of ['nav','titles','intros','filters','fields','demoResultLabels','heroTitle','artMeta','contactLabels','contactValues'])if(doc.locales[lang][key].length!==old.published.locales[lang][key].length)throw problem(400,'Keep the required page and form labels.');}
 const [r]=await sql`WITH changed AS (UPDATE mm_content SET draft=${JSON.stringify(doc)}::jsonb,published=CASE WHEN ${action}='publish' THEN ${JSON.stringify(doc)}::jsonb ELSE published END,version=version+1,updated_at=now(),published_at=CASE WHEN ${action}='publish' THEN now() ELSE published_at END WHERE id=1 AND version=${b.version} RETURNING *) , logged AS (INSERT INTO mm_history(version,action,actor,document) SELECT version,${action},${user.email},draft FROM changed) SELECT version,updated_at,published_at,draft AS document FROM changed`;
 if(!r)throw problem(409,'Another staff member saved changes. Download your draft, then reload before merging your changes.');return reply(res,200,r);
 }
 if(action==='upload'){
 if(b.permission!==true)throw problem(400,'Confirm permission to publish this photo.');
 if(typeof b.alt!=='string'||!b.alt.trim()||b.alt.length>500)throw problem(400,'Describe the photo in 1–500 characters.');
 if(typeof b.data!=='string'||b.data.length>2800000)throw problem(413,'Choose an image under 2 MB.');
 const input=Buffer.from(b.data,'base64');if(input.length>2097152)throw problem(413,'Choose an image under 2 MB.');
 let output;try{const processor=sharp(input,{limitInputPixels:24000000});const meta=await processor.metadata();if(!['jpeg','png','webp'].includes(meta.format)||meta.pages>1)throw Error();output=await processor.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();}catch{throw problem(400,'Choose a valid, single-frame JPG, PNG or WebP photo.');}
 const [{count}]=await sql`SELECT count(*)::int AS count FROM mm_media WHERE created_by=${user.email} AND created_at > now()-interval '1 hour'`;if(count>=30)throw problem(429,'Photo limit reached. Please try again in an hour.');
 const id=randomUUID();await sql`INSERT INTO mm_media(id,data,type,alt,created_by) VALUES(${id}::uuid,decode(${output.toString('base64')},'base64'),'image/webp',${b.alt.trim()},${user.email})`;return reply(res,201,{url:'/api/mercymed?action=image&id='+id,alt:b.alt.trim()});
 }
 if(action==='access'){
 if(user.role!=='owner')throw problem(403,'Only the owner can manage access.');
 const email=String(b.email||'').toLowerCase().trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw problem(400,'Enter a valid staff email.');if(email===user.email)throw problem(400,'Your owner access cannot be removed here.');if(typeof b.active!=='boolean')throw problem(400,'Choose enable or remove access.');
 await sql`INSERT INTO mm_editors(email,role,active) VALUES(${email},'editor',${b.active}) ON CONFLICT(email) DO UPDATE SET active=EXCLUDED.active WHERE mm_editors.role!='owner'`;
 return reply(res,200,{ok:true});
 }
 throw problem(404,'Operation not found.');
 }catch(e){if(!e.status)console.error('MercyMed request failed:',e.code||e.name);reply(res,e.status||500,{error:e.status?e.message:'The service is temporarily unavailable. Your changes have not been discarded. Please retry.'});}
}
