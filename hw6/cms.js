'use strict';
(() => {
 const blank={en:'',ru:'',ky:''};
 window.MERCYMED_DATA={locales:window.MERCYMED,staff:window.MERCYMED_STAFF.map((name,i)=>({name,role:Object.fromEntries(['en','ru','ky'].map(l=>[l,window.MERCYMED[l].staffRoles[i]])),bio:{...blank},photo:'',alt:''})),settings:{instagram:'https://www.instagram.com/mercymed.kg/'},gallery:[],posts:[]};
 function apply(doc){window.MERCYMED_DATA=doc;window.MERCYMED=doc.locales;window.MERCYMED_STAFF=doc.staff.map(x=>x.name);window.dispatchEvent(new Event('mercymed-content'));}
 const preview=new URLSearchParams(location.search).has('preview');
 if(preview)window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===window.parent&&window.parent!==window&&e.data?.type==='mercymed-preview')apply(e.data.document);});
 window.mercymedReady=preview?Promise.resolve():fetch('/api/mercymed?action=published',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(r=>{if(r.document)apply(r.document);}).catch(async()=>{window.MERCYMED_OFFLINE=true;try{const r=await fetch('fallback.json');if(r.ok)apply(await r.json());}catch{}});
})();
