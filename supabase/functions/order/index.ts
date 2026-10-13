import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {validateOrder} from './logic.js';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
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
 if(input.action==='track'){if(!/^[0-9a-f-]{36}$/i.test(input.token||''))return reply({error:'Invalid tracking link'},400);const {data,error}=await db.from('orders').select('order_number,status,total_usd,fulfillment,payment_confirmed,created_at,estimated_prep_minutes,ready_at,customer_message').eq('tracking_token',input.token).single();if(error)return reply({error:'Order not found'},404);return reply(data);}
 const [a,b,c]=await Promise.all([db.from('menu_items').select('*'),db.from('extras').select('*'),db.from('settings').select('*').eq('id',1).single()]);if(a.error||b.error||c.error)return reply({error:'Menu unavailable'},503);
 let receiptBytes:Uint8Array|null=null;let receiptType='';if(input.receipt&&input.payment==='whish'){const m=/^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(input.receipt);if(!m)return reply({error:'Invalid receipt image'},400);receiptType=m[1];receiptBytes=Uint8Array.from(atob(m[3]),c=>c.charCodeAt(0));if(receiptBytes.length>2097152)return reply({error:'Receipt is too large'},400);const b=receiptBytes;const valid=(m[2]==='jpeg'&&b[0]===255&&b[1]===216)||(m[2]==='png'&&b[0]===137&&b[1]===80&&b[2]===78)||(m[2]==='webp'&&String.fromCharCode(...b.slice(0,4))==='RIFF');if(!valid)return reply({error:'Invalid image contents'},400);}
 const payload=validateOrder(input,a.data,b.data,c.data);const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('cf-connecting-ip')||'unknown';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));payload.ip_hash=Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const {data,error}=await db.rpc('record_order',{payload});if(error)return reply({error:error.message.startsWith('Too many')?error.message:'Could not save order. Please try again.'},429);if(receiptBytes&&!data.receipt_path){const path=data.id+'/receipt.'+receiptType.split('/')[1];const {error:uploadError}=await db.storage.from('payment-receipts').upload(path,receiptBytes,{contentType:receiptType,upsert:true});if(!uploadError)await db.from('orders').update({receipt_path:path}).eq('id',data.id);}
 return reply({order_number:data.order_number,tracking_token:data.tracking_token,items:data.items,total_usd:data.total_usd,total_lbp:data.total_lbp,delivery_fee_lbp:data.delivery_fee_lbp,status:data.status,estimated_prep_minutes:data.estimated_prep_minutes,ready_at:data.ready_at});
 }catch(e){return reply({error:e instanceof Error?e.message:'Invalid request'},400);}});
