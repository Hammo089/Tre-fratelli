import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
export const db=createClient(SUPABASE_URL,SUPABASE_KEY);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const usd=n=>'$'+(Number(n)||0).toFixed(2);
export function safeImage(url){try{const u=new URL(url,location.origin);return u.protocol==='https:'||u.origin===location.origin?u.href:'';}catch{return '';}}
export async function orderApi(body){const r=await fetch(SUPABASE_URL+'/functions/v1/order',{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY},body:JSON.stringify(body)});const result=await r.json();if(!r.ok)throw Error(result.error||'Request failed');return result;}
