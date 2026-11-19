import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {validateOrder} from './logic.js';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
const customerUser=async(req:Request)=>{
 const token=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');
 if(!token)return null;
 const {data:{user},error}=await db.auth.getUser(token);
 return !error&&user?.phone&&user.phone_confirmed_at?user:null;
};
Deno.serve(async(req:Request)=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return reply({error:'Method not allowed'},405);try{const raw=await req.text();if(raw.length>2900000)return reply({error:'Request too large'},413);const input=JSON.parse(raw);

 if(['claim-owner','staff-list','staff-create','staff-role','staff-remove'].includes(input.action)){
 const token=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');
 const {data:{user},error:authError}=await db.auth.getUser(token);if(authError||!user)return reply({error:'Sign in required'},401);
 if(input.action==='claim-owner'){
  const {data:config}=await db.from('owner_config').select('email').eq('id',1).single();if(!config||user.email?.toLowerCase()!==config.email.toLowerCase()||!user.email_confirmed_at)return reply({error:'Owner email must be verified'},403);
  const {data:owners}=await db.from('staff').select('user_id').eq('role','owner');
  if(owners?.length&&!owners.some(o=>o.user_id===user.id))return reply({error:'Owner already configured'},403);
  const {error}=await db.from('staff').upsert({user_id:user.id,role:'owner'});return error?reply({error:'Could not activate owner'},500):reply({ok:true});
 }
 const {data:actor}=await db.from('staff').select('role').eq('user_id',user.id).single();if(actor?.role!=='owner')return reply({error:'Owner access required'},403);
 if(input.action==='staff-list'){const {data:staff}=await db.from('staff').select('*');const list=[];for(const member of staff||[]){const {data}=await db.auth.admin.getUserById(member.user_id);list.push({...member,email:data.user?.email});}return reply({staff:list});}
 if(input.action==='staff-create'){
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email||'')||typeof input.password!=='string'||input.password.length<12||!['manager','cashier'].includes(input.role))return reply({error:'Valid email, password of 12+ characters, and role required'},400);
  const {data,error}=await db.auth.admin.createUser({email:input.email,password:input.password,email_confirm:true});if(error)return reply({error:error.message},400);
  const {error:insertError}=await db.from('staff').insert({user_id:data.user.id,role:input.role});if(insertError){await db.auth.admin.deleteUser(data.user.id);return reply({error:'Could not add staff'},500);}return reply({ok:true});
 }
 if(input.user_id===user.id)return reply({error:'You cannot remove or change your own owner role'},400);
 const {data:target}=await db.from('staff').select('role').eq('user_id',input.user_id).single();if(!target||target.role==='owner')return reply({error:'Invalid staff member'},400);
 if(input.action==='staff-remove'){const {error}=await db.from('staff').delete().eq('user_id',input.user_id);return error?reply({error:'Could not remove staff'},500):reply({ok:true});}
 if(!['manager','cashier'].includes(input.role))return reply({error:'Invalid role'},400);
 const {error}=await db.from('staff').update({role:input.role}).eq('user_id',input.user_id);return error?reply({error:'Could not update role'},500):reply({ok:true});
 }


 if(input.action==='feedback'){
 const clean=(v:unknown,n:number)=>String(v||'').trim().slice(0,n);const kind=clean(input.kind,20),message=clean(input.message,1500),phone=clean(input.phone,25);
 if(!['review','complaint','suggestion'].includes(kind)||message.length<5)return reply({error:'Please write your feedback / اكتب رأيك أو المشكلة'},400);
 const rating=input.rating===null||input.rating===''||input.rating===undefined?null:Number(input.rating);if(rating!==null&&(!Number.isInteger(rating)||rating<1||rating>5))return reply({error:'Invalid rating'},400);
 if(phone&&!/^\+?[\d\s()-]{8,25}$/.test(phone))return reply({error:'Invalid phone number'},400);
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('cf-connecting-ip')||'unknown';const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));const ip_hash=Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const {error}=await db.rpc('record_feedback',{payload:{kind,rating,customer_name:clean(input.customer_name,100),phone,order_reference:clean(input.order_reference,40),message,ip_hash}});
 if(error)return reply({error:error.message.startsWith('Too many')?error.message:'Could not save feedback'},429);return reply({ok:true});
 }
 if(input.action==='track'){if(!/^[0-9a-f-]{36}$/i.test(input.token||''))return reply({error:'Invalid tracking link'},400);const {data,error}=await db.from('orders').select('order_number,status,total_usd,total_lbp,exchange_rate,fulfillment,payment_confirmed,created_at,estimated_prep_minutes,ready_at,customer_message').eq('tracking_token',input.token).single();if(error)return reply({error:'Order not found'},404);return reply(data);}
 if(input.action==='customer-history'){
  const user=await customerUser(req);if(!user)return reply({error:'Sign in required'},401);
  const {data,error}=await db.from('orders').select('order_number,created_at,status,total_lbp,items,tracking_token').eq('customer_user_id',user.id).order('created_at',{ascending:false}).limit(30);
  return error?reply({error:'Could not load orders'},503):reply({orders:data});
 }
 return reply({error:'Online ordering is disabled. Please complete your order on WhatsApp.'},410);
 }catch(e){return reply({error:e instanceof Error?e.message:'Invalid request'},400);}});
