import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
import {esc,orderApi} from './shared.js';

export function normalizeCustomerPhone(input){
 const raw=String(input).trim().replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)-(c<='٩'?0x660:0x6f0))).replace(/[\s().-]/g,'');
 const phone=raw.startsWith('00')?'+'+raw.slice(2):raw.startsWith('+')?raw:/^(?:0[137-9]\d{6}|(?:70|71|76|78|79|81)\d{6})$/.test(raw)?'+961'+raw.replace(/^0/,''):'';
 return /^\+[1-9]\d{7,14}$/.test(phone)?phone:'';
}

export function initCustomerAccount({tr,language,onUseAddress,onReorder,onSession,money}){
 const client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storageKey:'tf-customer-auth',flowType:'pkce'}});
 const dialog=document.querySelector('#customerAccount'),button=document.querySelector('#customerAccountButton');
 const content=dialog.querySelector('.customer-content');
 let session=null,mode='signin',generation=0;
 const authError=()=>tr('تعذّر إنشاء الحساب. إذا سبق وسجّلت، جرّب تسجيل الدخول.','Could not create the account. If you already registered, try signing in.');
 const show=async()=>{
  const run=++generation;
  if(!session){
   content.innerHTML=`<h2>${mode==='signup'?tr('حساب جديد','Create account'):tr('حسابي','My account')}</h2><form id="customerLogin"><label>${tr('رقم الهاتف','Phone number')}<input name="phone" type="tel" autocomplete="username" placeholder="+961 …" required maxlength="25"></label><label>${tr('كلمة المرور','Password')}<input name="password" type="password" autocomplete="${mode==='signup'?'new-password':'current-password'}" minlength="8" maxlength="72" required></label><button class="primary full">${mode==='signup'?tr('إنشاء الحساب','Create account'):tr('تسجيل الدخول','Sign in')}</button></form><button type="button" class="quiet" id="customerMode">${mode==='signup'?tr('عندك حساب؟ سجّل دخول','Already registered? Sign in'):tr('جديد هون؟ اعمل حساب','New here? Create an account')}</button><p class="error" role="status" id="customerError"></p>`;
   content.querySelector('#customerMode').onclick=()=>{mode=mode==='signin'?'signup':'signin';show();};
   const form=content.querySelector('form');form.onsubmit=async e=>{
    e.preventDefault();const submit=form.querySelector('button'),status=content.querySelector('#customerError');
    const f=new FormData(form),phone=normalizeCustomerPhone(f.get('phone'));if(!phone){status.textContent=tr('أدخل رقم هاتف صالح مع رمز البلد إذا لزم.','Enter a valid phone number with country code if needed.');return;}
    const signup=mode==='signup';submit.disabled=true;status.textContent='';
    try{
     const auth=signup?await client.auth.signUp({phone,password:f.get('password')}):await client.auth.signInWithPassword({phone,password:f.get('password')});
     if(auth.error||!auth.data.session)throw Error(signup?authError():tr('رقم الهاتف أو كلمة المرور غير صحيحة.','Phone number or password is incorrect.'));
     session=auth.data.session;onSession(session);await show();
    }catch(err){status.textContent=err.message;}finally{submit.disabled=false;}
   };return;
  }
  const user=session.user.id;
  content.innerHTML=`<div class="customer-heading"><h2>${tr('حسابي','My account')}</h2><button type="button" class="quiet" id="customerLogout">${tr('تسجيل الخروج','Sign out')}</button></div><h3>${tr('عناويني','My addresses')}</h3><div id="customerAddresses"></div><form id="customerAddressForm"><label>${tr('اسم العنوان (البيت، الشغل…)','Address label (Home, Work…)')}<input name="label" required maxlength="40"></label><label>${tr('العنوان، المبنى والطابق','Address, building & floor')}<textarea name="address" autocomplete="street-address" required maxlength="500"></textarea></label><button class="secondary">${tr('حفظ العنوان','Save address')}</button></form><p id="customerError" class="error" role="status"></p><h3>${tr('طلباتي السابقة','Past orders')}</h3><div id="customerHistory" aria-live="polite">${tr('عم نحمّل الطلبات…','Loading orders…')}</div>`;
  const fail=()=>{content.querySelector('#customerError').textContent=tr('تعذّر حفظ التغيير. جرّب مرّة تانية.','Could not save the change. Try again.');};
  content.querySelector('#customerLogout').onclick=async()=>{const {error}=await client.auth.signOut({scope:'local'});if(error){fail();return;}session=null;onSession(null);mode='signin';show();};
  const form=content.querySelector('#customerAddressForm');form.onsubmit=async e=>{
   e.preventDefault();const f=new FormData(form),submit=form.querySelector('button');
   const label=String(f.get('label')).trim(),address=String(f.get('address')).trim();if(!label||!address){fail();return;}
   submit.disabled=true;
   try{const {error}=await client.from('customer_addresses').insert({label,address});if(error)fail();else show();}catch{fail();}finally{submit.disabled=false;}
  };
  const [addresses,history]=await Promise.allSettled([client.from('customer_addresses').select('id,label,address').eq('user_id',user).order('created_at',{ascending:false}).limit(50),orderApi({action:'customer-history'},session.access_token)]);
  if(run!==generation||session?.user.id!==user)return;
  const ar=addresses.status==='fulfilled'?addresses.value:null;
  const list=ar?.data||[];
  const addressRoot=content.querySelector('#customerAddresses');
  addressRoot.innerHTML=ar?.error||!ar?tr('تعذّر تحميل العناوين.','Could not load addresses.'):list.length?list.map((a,i)=>`<article class="customer-row"><strong>${esc(a.label)}</strong><p>${esc(a.address)}</p><button type="button" class="secondary" data-use="${i}">${tr('استعمل هالعنوان','Use this address')}</button> <button type="button" class="quiet" data-remove="${i}">${tr('حذف','Remove')}</button></article>`).join(''):tr('ما عندك عناوين محفوظة.','No saved addresses yet.');
  addressRoot.onclick=async e=>{const use=e.target.closest('[data-use]'),remove=e.target.closest('[data-remove]');if(use){dialog.close();onUseAddress(list[use.dataset.use].address);}if(remove){remove.disabled=true;const {error}=await client.from('customer_addresses').delete().eq('id',list[remove.dataset.remove].id);if(error){fail();remove.disabled=false;}else show();}};
  const rows=history.status==='fulfilled'?history.value.orders:[];
  const h=content.querySelector('#customerHistory'),lang=language();
  h.innerHTML=history.status==='rejected'?tr('تعذّر تحميل الطلبات.','Could not load orders.'):rows.length?rows.map((o,i)=>`<article class="customer-row"><strong>#${esc(o.order_number)} · ${esc(money(o.total_lbp))}</strong><p>${esc(new Date(o.created_at).toLocaleDateString(lang==='ar'?'ar-LB':'en-GB'))} · ${esc(o.items.map(x=>x.qty+' × '+(x['name_'+lang]||x.name_en)).join('، '))}</p><a href="/?track=${encodeURIComponent(o.tracking_token)}">${tr('تابع الطلب','Track order')}</a> <button type="button" class="secondary" data-reorder="${i}">${tr('اطلب نفس الطلب','Order again')}</button></article>`).join(''):tr('طلباتك من هالحساب بتظهر هون.','Orders placed from this account appear here.');
  h.onclick=e=>{const b=e.target.closest('[data-reorder]');if(!b)return;if(onReorder(rows[b.dataset.reorder].items))dialog.close();};
 };
 button.hidden=false;
 button.onclick=()=>{dialog.showModal();show();};
 client.auth.onAuthStateChange((event,newSession)=>{const changed=session?.user.id!==newSession?.user.id;session=newSession;onSession(session);if(changed&&dialog.open)setTimeout(show,0);});
 return {getSession:async()=>(await client.auth.getSession()).data.session};
}
