import {renderSocialLinks} from './social-links.js';
import {initCustomerAccount} from './customer.js';
import {formatDual,convertToLbp,menuMoney,vegetableBundleLbp,priceUsd} from './currency.js';
import {ingredientSource,flyIngredient,feedback} from './ingredient-motion.js';
import {scheduleOffer} from './offers.js';
import {isPizza,isManakish,extraMatches} from './menu-types.js';
import {applyLanding,normalizeOrder,categoryLabels,orderAllItems,addCustomCategories} from './landing.js';
import {configureMusic} from './music.js';
import {db,esc,safeImage,orderApi} from './shared.js';
import {manakishPhoto,manakishThumb,squeezeLemon} from './manakish.js';
import {pizzaSVG,toppingMeta,photoThumb} from './pizza.js';
const $=s=>document.querySelector(s);let lang=document.body.dataset.routeLang||(location.pathname==='/'||location.pathname==='/index.html'?'en':localStorage.getItem('tf-lang')||'en'),category=document.body.dataset.menuCategory||'All',items=[],extras=[],settings={},current=null,selected=new Map(),removed=new Set(),qty=1,firing=false,cart=[];let requestId=crypto.randomUUID();try{cart=JSON.parse(localStorage.getItem('tf-cart')||'[]');if(!Array.isArray(cart))cart=[];}catch{}
const flyingExtras=new Map(),activeFlights=new Set();let flightGeneration=0;
function clearIngredientFlights(){flightGeneration++;for(const cancel of activeFlights)cancel();activeFlights.clear();flyingExtras.clear();}
$('#builder').addEventListener('close',clearIngredientFlights);
const rate=()=>Number(settings.exchange_rate)||90000;
const money=(n,r=rate())=>menuMoney(n,r,lang);
const lbp=(n,r=rate())=>formatDual(n,Number(n)/r,lang);
const lineLbp=(unit,qty,r=rate())=>convertToLbp(unit,r)*qty;
const bagLbp=()=>cart.reduce((n,row)=>n+lineLbp(row.unit_price,row.qty),0);
const tr=(ar,en)=>lang==='ar'?ar:en;const name=o=>o?.['name_'+lang]||o?.name_en||'';const catNames={All:['الكل','All'],Pizza:['بيتزا','Pizza'],AmericanPizza:['بيتزا أمريكية','American Pizza'],MiniManakish:['مناقيش ميني','Mini Manakish'],Manakish:['مناقيش','Manakish'],Pastries:['معجنات','Pastries'],Drinks:['مشروبات','Drinks'],Dessert:['حلويات','Dessert']};
function notify(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2500);}
function language(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-ar]').forEach(e=>e.innerHTML=e.dataset[lang]);$('#lang').textContent=lang==='ar'?'English':'العربية';$('#search').placeholder=tr('ابحث عن صنف','Find your favorite');renderMenu();renderCart();if(current)renderBuilder();$('#storeState').textContent=settings.accepting_orders?tr('● عم نستقبل طلباتكم','● Taking orders now'):tr('○ المنيو متاحة — استقبال الطلبات متوقف حاليًا','○ Explore the menu — ordering is currently paused');}
function menuPhoto(i){return i.cat==='AmericanPizza'&&String(i.image||'').startsWith('assets/')?`<div class="american-card-preview">${pizzaSVG(i.toppings||[],false,i.id==='am_chicken_bbq','meat',true)}</div>`:`<img src="${esc(safeImage(i.image))}" alt="${esc(name(i))}" loading="lazy">`;}
function renderMenu(){cuisineTheme();const cats=['All',...normalizeOrder(settings.menu_category_order,Object.keys(categoryLabels)),...new Set(items.filter(i=>i.enabled&&!categoryLabels[i.cat]).map(i=>i.cat))];$('#categories').innerHTML=cats.map(c=>`<button class="${category===c?'active':''}" data-cat="${esc(c)}">${esc(catNames[c]?.[lang==='ar'?0:1]||c)}</button>`).join('');const q=$('#search').value.toLowerCase();const shown=(category==='All'?orderAllItems(items,settings.all_item_order):items).filter(i=>i.enabled&&i.sizes?.some(s=>s.enabled!==false)&&(category==='All'||i.cat===category)&&[i.name_ar,i.name_en,i.desc_ar,i.desc_en].some(x=>(x||'').toLowerCase().includes(q)));$('#menu').innerHTML=shown.length?shown.map(i=>`<button class="menu-card" data-item="${esc(i.id)}"><div class="card-photo">${menuPhoto(i)}</div><div class="card-body"><div class="card-heading"><h3>${esc(name(i))}</h3><strong>${money(priceUsd(i.sizes?.find(s=>s.enabled!==false)??i,rate()))}</strong></div><p>${esc(i['desc_'+lang])}</p><span class="card-add">${tr('اختار واعملها على ذوقك','Make it yours')}<b>+</b></span></div></button>`).join(''):`<p class="empty">${tr('ما في أصناف مطابقة','No matching items')}</p>`;}
function openItem(id){clearIngredientFlights();current=items.find(i=>i.id===id&&i.enabled&&i.sizes?.some(s=>s.enabled!==false));if(!current)return;$('#builder').dataset.cuisine=current.cat==='AmericanPizza'?'american':isManakish(current.cat)?'lebanese':current.id==='nutella'?'dessert':'italian';$('#size').value='';selected=new Map();removed=new Set();$('#vegetableMode').checked=false;document.querySelectorAll('.lemon-squeeze-effect').forEach(e=>e.remove());qty=1;$('#itemNotes').value='';renderBuilder();$('#builder').showModal();}
function variant(){return current.sizes.find(v=>v.id===$('#size').value&&v.enabled!==false)||current.sizes.find(v=>v.enabled!==false);}
const isVegetable=e=>isManakish(current?.cat)&&e.group_name==='vegetable';
const selectedIds=()=>[...selected].flatMap(([id,n])=>Array(n).fill(id));
function extraSummary(ids){const counts=new Map();for(const id of ids||[])counts.set(id,(counts.get(id)||0)+1);return [...counts].map(([id,n])=>{const e=extras.find(x=>x.id===id);return e?name(e)+(n>1?' ×'+n:''):'';}).filter(Boolean).join(' · ');}
function price(){return priceUsd(variant(),rate())+(isManakish(current.cat)&&$('#vegetableMode').checked?vegetableBundleLbp(settings)/rate():0)+extras.filter(e=>selected.has(e.id)&&extraMatches(e,current)&&!isVegetable(e)).reduce((t,e)=>t+priceUsd(e,rate())*selected.get(e.id),0);}
const usesOven=item=>isPizza(item.cat)||item.id==='nutella';
function renderBuilder(){$('#addItem').textContent=usesOven(current)?tr('عالفرن… وإلى السلّة','Fire it up & add to bag'):tr('أضف إلى السلّة','Add to bag');const old=$('#size').value;$('#vegetableChoice>span:first-child').textContent=tr('خضرة وإضافات — '+lbp(vegetableBundleLbp(settings))+' للمجموعة كاملة','Vegetables & extras — '+lbp(vegetableBundleLbp(settings))+' total');$('#buildTitle').textContent=name(current);$('#size').innerHTML=current.sizes.map(s=>`<option value="${esc(s.id)}" ${s.enabled===false?'disabled':''}>${esc(name(s))} · ${s.enabled===false?tr('غير متاح حالياً','Currently unavailable'):money(priceUsd(s,rate()))}</option>`).join('');if(current.sizes.some(v=>v.id===old&&v.enabled!==false))$('#size').value=old;$('#baseToppings').innerHTML=(current.toppings||[]).map(t=>`<button class="chip ${removed.has(t)?'removed':''}" data-remove="${esc(t)}">${esc(toppingMeta[t]?.[lang==='ar'?1:2]||t)} ${removed.has(t)?'+':'×'}</button>`).join('');$('#vegetableChoice').hidden=!isManakish(current.cat);const eligible=extras.filter(e=>extraMatches(e,current)&&(!isManakish(current.cat)||((e.group_name!=='vegetable'&&!extras.some(v=>v.enabled&&v.group_name==='vegetable'&&v.visual===e.visual&&v.categories.includes(current.cat)))|| (e.group_name==='vegetable'&&$('#vegetableMode').checked))));$('#toppings').innerHTML=eligible.map(e=>{const count=selected.get(e.id)||0,custom=safeImage(e.image||'');return `<div class="topping-option ${count?'selected':''}"><button class="topping topping-add" data-extra="${esc(e.id)}" aria-label="${esc(tr('أضف ','Add ')+name(e))}" ${count>=2?'disabled':''}><i>${e.image&&custom?`<img class="custom-extra-thumb" src="${esc(custom)}" alt="" loading="lazy">`:isManakish(current.cat)?manakishThumb(e.visual):photoThumb(e.visual)}</i><span>${esc(name(e))}</span><small>${isVegetable(e)?tr('ضمن مجموعة الخضرة','Included in vegetable bundle'):'+'+money(priceUsd(e,rate()))}</small></button><div class="extra-stepper"><button data-extra-minus="${esc(e.id)}" aria-label="${esc(tr('خفّف ','Less ')+name(e))}" ${count?'':'disabled'}>−</button><output aria-live="polite">${count?'×'+count:tr('أضف','Add')}</output><button data-extra="${esc(e.id)}" aria-label="${esc(tr('زِد ','More ')+name(e))}" ${count>=2?'disabled':''}>+</button></div></div>`;}).join('');const extraHeading=$('#toppings').previousElementSibling;extraHeading.hidden=!eligible.length;extraHeading.textContent=tr('إضافات '+(catNames[current.cat]?.[0]||current.cat),(catNames[current.cat]?.[1]||current.cat)+' extras');renderPizza();}
function renderPizza(){
 const stage=$('#pizzaStage'),v=variant(),mini=current.cat==='MiniManakish',american=current.cat==='AmericanPizza',sweet=current.id==='nutella';
 const mesh=isManakish(current.cat)&&/mesh|mach|مشرو/i.test([v?.id,v?.name_en,v?.name_ar].join(' ')),large=isPizza(current.cat)&&(v?.id==='35cm'||/35/.test(v?.name_en||''));
 stage.dataset.size=!(isPizza(current.cat)||isManakish(current.cat))?'large':mini?'mini':american||mesh||large?'large':'regular';
 stage.style.setProperty('--preview-scale',mini?'.50':american||mesh||large||sweet?'.98':'.70');
 $('#sizePreview').textContent=mini?tr('ميني','Mini'):isPizza(current.cat)||sweet?name(v):mesh?tr('مشروحة — عجينة أكبر وأرق','Meshrouha — larger, thinner dough'):tr('عادي','Regular');
 const keys=[...(current.toppings||[]).filter(t=>!removed.has(t))],custom=[];
 for(const e of extras.filter(e=>selected.has(e.id)&&extraMatches(e,current))){const count=Math.max(0,selected.get(e.id)-(flyingExtras.get(e.id)||0));if(!count||e.visual==='lemon')continue;if(e.image)custom.push({image:safeImage(e.image),count,key:e.id});else for(let n=0;n<count;n++)keys.push(e.visual);}
 if(isPizza(current.cat)||isManakish(current.cat))stage.innerHTML=isManakish(current.cat)?manakishPhoto(keys,mesh,['mk6','mini_mk6'].includes(current.id)):pizzaSVG(keys,false,['pz5','am_chicken_bbq'].includes(current.id),current.id==='pz7'?'turkey':'meat',american);
 else if(sweet)stage.innerHTML=`<div class="photo-pizza dessert-photo" role="img" aria-label="${esc(tr('بيتزا نوتيلا مع إضافاتك','Nutella pizza with your toppings'))}"><img class="dessert-base-photo" src="assets/dessert-real/nutella-base.webp" alt="" draggable="false"></div>`;
 else stage.innerHTML=`<img src="${esc(safeImage(current.image))}" alt="${esc(name(current))}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
 const photo=stage.querySelector('.manakish-fill')||stage.querySelector('.photo-pizza');
 if(photo)for(const layer of custom){
  if(!layer.image)continue;
  const seed=[...layer.key].reduce((a,c)=>a+c.charCodeAt(0),0),chip=sweet&&layer.key.endsWith('_chips'),oreo=sweet&&layer.key.endsWith('_oreo'),lotus=sweet&&layer.key.endsWith('_lotus');
  const pieces=chip?26:oreo?18:lotus?14:sweet?16:8,width=chip?2.9:oreo?5.5:lotus?5.8:sweet?4.7:12;
  let source=layer.image;
  if(sweet&&source.includes('/assets/dessert-real/')){if(oreo)source='assets/dessert-real/oreo-crumb.webp';else if(lotus)source='assets/dessert-real/lotus-crumb.webp';else if(layer.key.endsWith('_white_chocolate'))source='assets/dessert-real/white-chocolate-shard.webp';}
  for(let n=0;n<layer.count*pieces;n++){
   const angle=n*2.399963+seed*.137,r=Math.sqrt((n+.55)/(layer.count*pieces))*(sweet?32:28),w=width*(sweet?.82+((n*13+seed)%8)*.045:1);
   photo.insertAdjacentHTML('beforeend',`<img class="custom-real-piece ${sweet?'sweet-piece natural-sweet-piece':''}" src="${esc(source)}" alt="" draggable="false" style="left:${50+Math.cos(angle)*r}%;top:${50+Math.sin(angle)*r}%;width:${w}%;height:${w}%;--custom-turn:${(n*59+seed)%360}deg">`);
  }
 }
 $('#quantity').textContent=qty;$('#buildPrice').textContent=lbp(lineLbp(price(),qty));
}

function saveCart(){localStorage.setItem('tf-cart',JSON.stringify(cart));requestId=crypto.randomUUID();renderCart();}
let account=null,accountUser=null,accountAddress='';
function startCustomerAccount(){
 if(!settings.customer_accounts_enabled)return;
 const phone=$('#checkout [name=phone]');
 account=initCustomerAccount({
  tr,language:()=>lang,money:lbp,
  onSession:session=>{
   const user=session?.user||null;
   if(accountUser?.id!==user?.id){
    requestId=crypto.randomUUID();
    if(accountUser&&phone.value.replace(/\D/g,'')===accountUser.phone?.replace(/\D/g,''))phone.value='';
    if(accountAddress&&addressField.value===accountAddress)addressField.value='';
    accountAddress='';
   }
   accountUser=user;
   if(user?.phone&&!phone.value)phone.value='+'+user.phone.replace(/^\+/,'');
  },
  onUseAddress:value=>{
   accountAddress=value;addressField.value=value;
   $('#checkout [name=fulfillment][value=delivery]').checked=true;renderCart();
   $('#bag').showModal();
  },
  onReorder:reorderItems
 });
}
function reorderItems(rows){
   const data=rows.map(row=>({
    item_id:row.item_id,size_id:row.size_id,qty:row.qty,notes:row.notes||'',
    removed:row.removed||[],with_vegetables:row.with_vegetables===true,
    extras:(row.extras||[]).flatMap(x=>Array(Math.max(1,Math.min(2,Number(x.qty)||1))).fill(x.id)),
    label:row['name_'+lang],sizeLabel:row['size_name_'+lang]
   }));
   const {rows:valid,adjusted}=repriceCart(data);
   if(!valid.length){notify(tr('هالطلب ما عاد متاح.','This order is no longer available.'));return false;}
   if(cart.length+valid.length>40){notify(tr('السلّة ما فيها تتسع لهالطلب.','Your bag cannot fit this order.'));return false;}
   cart.push(...valid);saveCart();
   if(adjusted)notify(tr('بعض الأصناف أو الإضافات تغيّرت. راجع السلّة.','Some items or extras changed. Please review your bag.'));
   setTimeout(()=>$('#mobileCart').click(),0);return true;
  }
const orderHistoryKey='tf-local-orders';
function readLocalOrders(){
 try{const rows=JSON.parse(localStorage.getItem(orderHistoryKey)||'[]');return Array.isArray(rows)?rows.filter(o=>o&&Array.isArray(o.items)&&typeof o.tracking_token==='string').slice(0,20):[];}catch{return [];}
}
function saveLocalOrder(order){
 if(!order.tracking_token||!Array.isArray(order.items))return;
 const items=order.items.map(({item_id,size_id,qty,removed,with_vegetables,name_ar,name_en,size_name_ar,size_name_en,extras})=>({
  item_id,size_id,qty,removed,with_vegetables,name_ar,name_en,size_name_ar,size_name_en,
  extras:(extras||[]).map(({id,qty})=>({id,qty}))
 }));
 const entry={order_number:order.order_number,tracking_token:order.tracking_token,created_at:new Date().toISOString(),total_lbp:order.total_lbp,exchange_rate:order.exchange_rate,items};
 try{localStorage.setItem(orderHistoryKey,JSON.stringify([entry,...readLocalOrders().filter(o=>o.tracking_token!==entry.tracking_token)].slice(0,20)));}catch{}
}
function renderLocalOrders(){
 const root=$('#localOrdersContent'),orders=readLocalOrders();
 let last='';try{last=localStorage.getItem('tf-last-order')||'';}catch{}
 const trackLink=token=>`<a href="/?track=${encodeURIComponent(token)}">${tr('تابع الطلب','Track order')}</a>`;
 root.innerHTML=`<p class="muted">${tr('هيدي الطلبات محفوظة على هالمتصفّح.','These orders are saved on this browser.')}</p>`+
  (orders.length?orders.map((o,i)=>`<article class="customer-row"><strong>#${esc(o.order_number)} · ${esc(lbp(o.total_lbp,o.exchange_rate||rate()))}</strong><p>${esc(new Date(o.created_at).toLocaleDateString(lang==='ar'?'ar-LB':'en-GB'))} · ${esc(o.items.map(x=>x.qty+' × '+name(x)).join('، '))}</p>${trackLink(o.tracking_token)} <button class="secondary" type="button" data-local-repeat="${i}">${tr('اطلب من جديد','Order again')}</button></article>`).join(''):`<p>${tr('الطلبات الجديدة رح تظهر هون.','New orders will appear here.')}</p>`)+
  (last&&!orders.some(o=>o.tracking_token===last)?`<p>${trackLink(last)}</p>`:'')+
  (orders.length||last?`<button type="button" class="quiet" id="clearLocalOrders">${tr('امحِ السجل من هالمتصفّح','Clear history on this browser')}</button>`:'');
 root.onclick=e=>{
  const repeat=e.target.closest('[data-local-repeat]');
  if(repeat&&reorderItems(orders[Number(repeat.dataset.localRepeat)].items))$('#localOrders').close();
  if(e.target.closest('#clearLocalOrders')&&window.confirm(tr('تمحي سجلّ الطلبات المحفوظ هون؟','Clear the order history saved here?'))){
   try{localStorage.removeItem(orderHistoryKey);localStorage.removeItem('tf-last-order');}catch{}
   renderLocalOrders();
  }
 };
}
$('#lastOrder').onclick=()=>{renderLocalOrders();$('#localOrders').showModal();};
const deliveryAddressKey='tf-delivery-address';
const addressField=$('#checkout [name=address]'),rememberAddress=$('#rememberAddress');
try{const saved=localStorage.getItem(deliveryAddressKey);if(saved)addressField.value=saved.slice(0,500);}catch{}
rememberAddress.onchange=()=>{if(!rememberAddress.checked){try{localStorage.removeItem(deliveryAddressKey);}catch{}}};
function rememberDeliveryAddress(data){
 if(data.fulfillment!=='delivery'||!rememberAddress.checked||accountAddress===String(data.address||'').trim())return;
 const value=String(data.address||'').trim().slice(0,500);
 if(value){try{localStorage.setItem(deliveryAddressKey,value);}catch{}}
}
function renderCart(){$('#prepEstimate').textContent=tr('التجهيز تقريباً '+(settings.default_prep_minutes||25)+' دقيقة بعد قبول الطلب — التوصيل إضافي','Preparation: about '+(settings.default_prep_minutes||25)+' minutes after acceptance — delivery takes additional time');const count=cart.reduce((n,c)=>n+c.qty,0);$('#cartCount').textContent=count;$('#mobileCartCount').textContent=count;$('#mobileCartTotal').textContent=count?lbp(bagLbp()):tr('السلّة فاضية','Bag is empty');$('#builderCartCount').textContent=count;$('#bagItems').innerHTML=cart.length?cart.map((c,i)=>{const item=items.find(v=>v.id===c.item_id);return `<div class="bag-row"><img src="${esc(safeImage(item?.image||''))}" alt=""><div class="info"><strong>${esc(item?name(item):c.label)} × ${c.qty}</strong><p>${esc(c.sizeLabel)} ${esc(extraSummary(c.extras))}</p><p>${esc(c.notes)}</p><strong>${lbp(lineLbp(c.unit_price,c.qty))}</strong></div><button data-delete="${i}" aria-label="Remove item">×</button></div>`;}).join(''):`<p class="empty">${tr('السلّة فاضية… شو منخبزلك؟','Your bag is empty. What are we baking?')}</p>`;const delivery=$('#checkout [name=fulfillment]:checked').value==='delivery';const subtotal=bagLbp();const fee=delivery?Number(settings.delivery_fee_lbp??100000):0;$('#bagTotal').innerHTML=`<div class="total-row"><span>${tr('الأصناف','Subtotal')}</span><span>${lbp(subtotal)}</span></div><div class="total-row"><span>${tr('التوصيل','Delivery')}</span><span>${lbp(fee)}</span></div><div class="total-row"><span>${tr('المجموع','Total')}</span><span>${lbp(subtotal+fee)}</span></div>`;$('#checkout').hidden=!cart.length;$('#addressLabel').hidden=!delivery;$('#rememberAddressLabel').hidden=!delivery;$('#checkout [name=address]').required=delivery;const whish=$('#checkout [name=payment]').value==='whish';$('#whishInfo').hidden=!whish;$('#proofLabel').hidden=!whish;$('#whishInfo').textContent=settings.whish_number?tr('حوّل إلى '+settings.whish_number+' وأرسل الإيصال عبر واتساب. الدفع بانتظار تأكيد المطعم.','Transfer to '+settings.whish_number+' and send your receipt on WhatsApp. The restaurant will verify payment.'):tr('الدفع عبر Whish مش متاح حاليًا','Whish is currently unavailable');$('#checkout [value=whish]').disabled=!settings.whish_number;}
$('#lang').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('tf-lang',lang);language();};$('#search').oninput=renderMenu;$('#categories').onclick=e=>{const b=e.target.closest('[data-cat]');if(b){category=b.dataset.cat;renderMenu();}};$('#menu').onclick=e=>{const b=e.target.closest('[data-item]');if(b){e.preventDefault();openItem(b.dataset.item);}};$('#start').onclick=()=>openItem(items.find(i=>i.cat==='Pizza'&&i.enabled)?.id);$('#cartButton').onclick=()=>{renderCart();$('#bag').showModal();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());$('#baseToppings').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){removed.has(b.dataset.remove)?removed.delete(b.dataset.remove):removed.add(b.dataset.remove);renderBuilder();}};$('#toppings').onclick=e=>{
 if(firing)return;
 const minus=e.target.closest('[data-extra-minus]'),plus=e.target.closest('[data-extra]'),button=minus||plus;
 if(!button||button.disabled)return;
 const id=button.dataset[minus?'extraMinus':'extra'],count=selected.get(id)||0,next=minus?Math.max(0,count-1):Math.min(2,count+1);
 if(next===count)return;
 const source=plus?ingredientSource(plus):null;
 if(next)selected.set(id,next);else selected.delete(id);
 if(plus)flyingExtras.set(id,(flyingExtras.get(id)||0)+1);
 renderBuilder();
 const option=[...$('#toppings').querySelectorAll('[data-extra]')].find(b=>b.dataset.extra===id)?.closest('.topping-option');
 feedback(option);feedback($('#buildPrice'));
 if(!plus)return;
 const generation=flightGeneration;
 let cancel,completed=false;
 cancel=flyIngredient(source,$('#builder'),$('#pizzaStage'),()=>{
  completed=true;if(cancel)activeFlights.delete(cancel);
  if(generation!==flightGeneration)return;
  const remaining=(flyingExtras.get(id)||1)-1;
  if(remaining>0)flyingExtras.set(id,remaining);else flyingExtras.delete(id);
  if(!$('#builder').open)return;
  renderPizza();feedback($('#sizePreview'));
  if(extras.find(x=>x.id===id)?.visual==='lemon'&&selected.has(id))squeezeLemon($('.build-stage'),tr('حامضة تنعصر فوق المنقوشة','Squeezing fresh lemon juice'));
 });
 if(!completed)activeFlights.add(cancel);
};$('#size').onchange=renderPizza;$('#less').onclick=()=>{qty=Math.max(1,qty-1);renderPizza();};$('#more').onclick=()=>{qty=Math.min(20,qty+1);renderPizza();};$('#addItem').onclick=async()=>{
 if(firing||!current)return;
 clearIngredientFlights();
 const row={with_vegetables:isManakish(current.cat)&&$('#vegetableMode').checked,item_id:current.id,size_id:variant().id,extras:selectedIds(),removed:[...removed],qty,notes:$('#itemNotes').value,unit_price:price(),label:name(current),sizeLabel:name(variant())};
 const finish=()=>{
  cart.push(row);saveCart();$('#builder').close();
  notify(tr('انضافت للسلّة، صحتين!','Added to your bag. Buon appetito!'));
 };
 if(!usesOven(current)){finish();return;}
 renderPizza();firing=true;
 const controls=document.querySelectorAll('#builder .build-controls button,#builder .build-controls input,#builder .build-controls select,#builder .build-controls textarea,#builder .builder-actions button,#builder [data-close]');
 const previous=[...controls].map(e=>e.disabled);
 controls.forEach(e=>e.disabled=true);
 $('#buildHint').textContent=tr('عالفرن… صحتين!','Into the stone oven… buon appetito!');
 $('.build-stage').classList.add('firing');
 try{await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?500:2800));finish();}
 finally{
  $('.build-stage').classList.remove('firing');
  $('#buildHint').textContent=tr('كل إضافة بتغيّر شكلها… وطعمها.','Every topping makes it a little more you.');
  firing=false;controls.forEach((e,i)=>e.disabled=previous[i]);
 }
};
$('#bagItems').onclick=e=>{const b=e.target.closest('[data-delete]');if(b){cart.splice(Number(b.dataset.delete),1);saveCart();}};$('#checkout').onchange=renderCart;
$('#checkout').onsubmit=async e=>{e.preventDefault();const buttons=[...$('#checkout').querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);$('#checkoutError').textContent='';const channel=e.submitter.value;const wa=channel==='whatsapp'?window.open('about:blank','_blank'):null;try{const data=Object.fromEntries(new FormData(e.target));data.channel=channel;data.items=cart.map(({item_id,size_id,extras,removed,qty,notes,with_vegetables})=>({item_id,size_id,extras,removed,qty,notes,with_vegetables}));data.request_id=requestId;const proof=$('#paymentProof').files[0];if(data.payment==='whish'&&proof){if(proof.size>2097152||!['image/jpeg','image/png','image/webp'].includes(proof.type))throw Error(tr('الإيصال يجب أن يكون صورة أقل من 2MB','Receipt must be an image under 2MB'));data.receipt=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(proof);});}const session=account?await account.getSession():null;if(accountUser&&!session)throw Error(tr('سجّل دخولك من جديد.','Please sign in again.'));if(session)data.customer_account=true;const result=await orderApi(data,session?.access_token);rememberDeliveryAddress(data);saveLocalOrder(result);const token=result.tracking_token;const tracking=location.origin+'/?track='+encodeURIComponent(token);localStorage.setItem('tf-last-order',token);const lines=result.items.map(i=>`${i.qty} × ${i.name_ar} (${i.size_name_ar}) ${i.extras.map(x=>x.name_ar+((x.qty||1)>1?' ×'+x.qty:'')).join(', ')} ${i.removed.length?'بدون '+i.removed.join(', '):''} ${i.notes||''} — ${lbp(lineLbp(i.unit_price,i.qty,result.exchange_rate||rate()),result.exchange_rate||rate())}`);const msg=`Tre Fratelli — طلب #${result.order_number}\n${lines.join('\n')}\nالاسم: ${data.customer_name}\nالهاتف: ${data.phone}\n${data.fulfillment==='delivery'?'دليفري: '+data.address:'استلام من المحل'}\nالدفع: ${data.payment}\nالتوصيل: ${lbp(result.delivery_fee_lbp,result.exchange_rate||rate())}\nالإجمالي: ${lbp(result.total_lbp,result.exchange_rate||rate())}\n${data.map_url||''}\n${data.notes||''}\nمتابعة: ${tracking}`;const waurl='https://wa.me/'+String(settings.whatsapp_number||'9613960649').replace(/\D/g,'')+'?text='+encodeURIComponent(msg);if(wa)wa.location.href=waurl;cart=[];saveCart();$('#bag').close();$('#receiptContent').innerHTML=`<div class="success-mark">✓</div><h2>${tr('وصل طلبك!','Order received!')}</h2><p>#${esc(result.order_number)}</p><p>${channel==='whatsapp'?tr('أرسل الرسالة بواتساب ليأكد المطعم طلبك.','Send the WhatsApp message so the restaurant can confirm.'):tr('طلبك بانتظار قبول المطعم.','Your order is awaiting restaurant confirmation.')}</p><p class="prep-estimate">${tr('التجهيز التقديري: ','Estimated preparation: ')}${result.estimated_prep_minutes||25} ${tr('دقيقة بعد قبول الطلب','minutes after acceptance')}</p><strong>${lbp(result.total_lbp,result.exchange_rate||rate())}</strong><a href="${esc(tracking)}">${tr('تابع طلبك','Track your order')}</a>${channel==='whatsapp'?`<a href="${esc(waurl)}" target="_blank" rel="noopener">WhatsApp ↗</a>`:''}`;$('#receipt').showModal();}catch(err){if(wa)wa.close();$('#checkoutError').textContent=err.message;}finally{buttons.forEach(b=>b.disabled=false);}};
async function track(token){try{const o=await orderApi({action:'track',token});const states={pending:['بانتظار التأكيد','Awaiting confirmation'],whatsapp_pending:['بانتظار رسالة واتساب','Awaiting WhatsApp confirmation'],accepted:['تم قبول الطلب','Accepted'],preparing:['قيد التحضير','Preparing'],ready:['جاهز','Ready'],out_for_delivery:['بالطريق','Out for delivery'],delivered:['تم التسليم','Delivered'],cancelled:['ملغي','Cancelled']};$('#receiptContent').innerHTML=`<div class="success-mark">♨</div><h2>${tr('متابعة طلبك','Track your order')}</h2><p>#${esc(o.order_number)}</p><h3>${esc(states[o.status]?.[lang==='ar'?0:1]||o.status)}</h3>${customerTiming(o)}${o.customer_message?`<p class="customer-message">${esc(o.customer_message)}</p>`:''}<div class="tracking-progress">${['accepted','preparing','ready',...(o.fulfillment==='delivery'?['out_for_delivery']:[]),'delivered'].map((step,i,arr)=>`<span class="${arr.indexOf(o.status)>=i?'done':''}">${esc(states[step][lang==='ar'?0:1])}</span>`).join('')}</div><p>${lbp(o.total_lbp??convertToLbp(o.total_usd,o.exchange_rate||rate()),o.exchange_rate||rate())}</p><p>${tr('تتحدّث الحالة كل ١٥ ثانية','Status updates every 15 seconds')}</p>`;if(!$('#receipt').open)$('#receipt').showModal();}catch(err){notify(err.message);}}
function repriceCart(rows){let cartAdjusted=false;rows=rows.filter(row=>{const valid=items.some(i=>i.id===row.item_id&&i.enabled&&i.sizes?.some(v=>v.id===row.size_id&&v.enabled!==false));if(!valid)cartAdjusted=true;return valid;});rows=rows.map(row=>{const item=items.find(i=>i.id===row.item_id),size=item?.sizes.find(s=>s.id===row.size_id);if(item&&size){const counts=new Map();for(const id of row.extras||[]){const extra=extras.find(e=>e.id===id&&extraMatches(e,item));if(!extra){cartAdjusted=true;continue;}const count=counts.get(id)||0;if(count>=2){cartAdjusted=true;continue;}counts.set(id,count+1);}const keptRemoved=(row.removed||[]).filter(t=>item.toppings?.includes(t));if(keptRemoved.length!==(row.removed||[]).length)cartAdjusted=true;row.removed=keptRemoved;row.extras=[...counts].flatMap(([id,n])=>Array(n).fill(id));const veg=isManakish(item.cat)&&(row.with_vegetables===true||[...counts.keys()].some(id=>extras.find(e=>e.id===id)?.group_name==='vegetable'));row.with_vegetables=veg;row.unit_price=priceUsd(size,rate())+(veg?vegetableBundleLbp(settings)/rate():0)+[...counts].reduce((n,[id,q])=>{const extra=extras.find(e=>e.id===id);return n+(extra&&!(isManakish(item.cat)&&extra.group_name==='vegetable')?priceUsd(extra,rate())*q:0);},0);}return row;});return {rows,adjusted:cartAdjusted};}
async function init(){try{const [a,b,c]=await Promise.all([db.from('menu_items').select('*').order('sort_order'),db.from('extras').select('*').order('sort_order'),db.from('settings').select('*').eq('id',1).single()]);if(a.error||b.error||c.error)throw Error('Could not load live menu');items=a.data;extras=b.data;settings=c.data;$('#storeSocialLinks').innerHTML=renderSocialLinks(settings,esc);items=items.filter(i=>!settings.custom_categories?.some(c=>c.id===i.cat&&c.enabled===false));addCustomCategories(settings.custom_categories?.filter(c=>c.enabled!==false),catNames);configureMusic(settings.music);applyLanding(settings);const normalized=repriceCart(cart);cart=normalized.rows;const cartAdjusted=normalized.adjusted;startCustomerAccount();localStorage.setItem('tf-cart',JSON.stringify(cart));const details=document.createElement('p');details.className='muted';details.textContent=[settings['address_'+lang],settings.hours].filter(Boolean).join(' · ');document.querySelector('footer').append(details);language();scheduleOffer(settings.offer,{getLanguage:()=>lang,onSelect:openItem});if(cartAdjusted)notify(tr('تم تحديث السلّة حسب الأصناف والكميات المتاحة، راجعها قبل الطلب.','Your bag was updated to match available items and quantities. Please review it.'));if(document.body.dataset.initialItem)openItem(document.body.dataset.initialItem);const token=new URLSearchParams(location.search).get('track');if(token){await track(token);setInterval(()=>{if($('#receipt').open)track(token);},15000);}}catch(err){$('#menu').innerHTML=`<p class="empty">${tr('تعذّر تحميل المنيو. جرّب تحديث الصفحة.','Unable to load the menu. Please refresh.')}<br><a href="https://wa.me/9613960649">WhatsApp</a></p>`;language();}}
init();

function customerTiming(o){if(['ready','out_for_delivery','delivered','cancelled'].includes(o.status))return '';if(!o.ready_at)return `<p class="prep-estimate">${tr('مدة التجهيز التقديرية: ','Estimated preparation: ')}${o.estimated_prep_minutes||25} ${tr('دقيقة بعد قبول المطعم للطلب','minutes after the restaurant accepts your order')}</p>`;const mins=Math.max(0,Math.ceil((Date.parse(o.ready_at)-Date.now())/60000));return `<div class="eta-display"><strong>${mins>0?mins:tr('قريباً','Soon')}</strong><span>${mins>0?tr('دقيقة تقريباً ليجهز طلبك','minutes until your order is ready'):tr('وصلنا للوقت المقدّر، بانتظار تأكيد المطعم','Estimated time reached — awaiting restaurant update')}</span><small>${tr('جاهز تقريباً الساعة ','Estimated ready time: ')}${esc(new Date(o.ready_at).toLocaleTimeString(lang==='ar'?'ar-LB':'en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Beirut'}))}</small></div>`;}
function cuisineTheme(){const lebanese=isManakish(category),american=category==='AmericanPizza',italian=category==='Pizza';document.body.dataset.cuisine=lebanese?'lebanese':italian?'italian':'fusion';const banner=$('#cuisineBanner');banner.innerHTML=american?`<span class="cuisine-symbol">♨</span><div><small>AMERICAN PIZZA · MADE YOUR WAY</small><h3>${tr('بيتزا أمريكية… على ذوقك','American pizza. Made your way.')}</h3><p>${tr('اختار المكوّنات والإضافات اللي بتحبها','Choose your favorite toppings and extras')}</p></div>`:lebanese?`<span class="cuisine-symbol">✦</span><div><small>MIN AL FORN. MIN LEBNEN.</small><h3>${tr('صباح بيروت… ريحة زعتر وسخونة فرن','Beirut mornings. Zaatar & warm bread.')}</h3><p>${tr('مناقيش لبنانية، مخبوزة عالأصول','Lebanese manakish, baked with tradition')}</p></div>`:italian?`<span class="cuisine-symbol">♨</span><div><small>DAL CUORE DI NAPOLI</small><h3>${tr('من قلب نابولي… على طاولتك','From the heart of Napoli, to your table')}</h3><p>${tr('فرن حجر ومكوّنات إيطالية ١٠٠٪، من الطحين للجبنة','Stone oven. 100% Italian pizza ingredients, from flour to cheese')}</p></div>`:`<span class="cuisine-symbol">✦</span><div><small>NAPOLI × BEIRUT</small><h3>${tr('قلب إيطالي… وروح لبنانية','An Italian heart. A Lebanese soul.')}</h3><p>${tr('نكهتين، فرن واحد، وحب بكل لقمة','Two traditions. One oven. Amore in every bite.')}</p></div>`;const photo=document.querySelector('.hero-art>img');photo.src=(settings.hero_image&&safeImage(settings.hero_image))|| (lebanese?'assets/items/mk-zaatar.jpg':'assets/items/pz-pepperoni.jpg');photo.alt=settings.hero_image?'Tre Fratelli · Wake & Bake':lebanese?'Lebanese zaatar manoushe':'Neapolitan pepperoni pizza';document.querySelector('.round-seal').innerHTML=lebanese?'من قلب<br><b>بيروت</b><br>عالأصول':'FATTA CON<br><b>AMORE</b><br>NAPOLI';}

$('#feedbackForm').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;$('#feedbackResult').textContent='';try{await orderApi({action:'feedback',...Object.fromEntries(new FormData(e.target))});e.target.reset();$('#feedbackResult').textContent=tr('وصلت رسالتك، شكراً إلك. فريق المطعم رح يراجعها.','Thank you. Your message was received and our team will review it.');}catch(err){$('#feedbackResult').textContent=err.message;}finally{button.disabled=false;}};

$('#vegetableMode').onchange=()=>{if(!$('#vegetableMode').checked)for(const e of extras.filter(e=>e.group_name==='vegetable'))selected.delete(e.id);renderBuilder();};

$('#builder').addEventListener('cancel',e=>{if(firing)e.preventDefault();});

$('#mobileCart').onclick=()=>{renderCart();$('#bag').showModal();};
$('#builderCart').onclick=()=>{if(firing)return;$('#builder').close();$('#mobileCart').focus({preventScroll:true});$('#mobileCart').click();};
