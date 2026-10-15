import {esc,safeImage} from './shared.js';
const copy=(offer,key,lang)=>String(offer?.[key+'_'+lang]||offer?.[key+'_en']||offer?.[key+'_ar']||'');
export function showOffer(offer,{lang='en',onSelect=()=>{},previewImage=''}={}){
 if(!offer||(!copy(offer,'title',lang)&&!copy(offer,'message',lang)&&!offer.image&&!previewImage)||document.querySelector('.offer-popup'))return;
 const dialog=document.createElement('dialog');dialog.className='offer-popup';dialog.dir=lang==='ar'?'rtl':'ltr';dialog.lang=lang;dialog.setAttribute('aria-labelledby','offerTitle');dialog.setAttribute('aria-describedby','offerMessage');
 const image=previewImage||(offer.image?safeImage(offer.image):'');
 dialog.innerHTML=`<button type="button" class="offer-close" aria-label="${lang==='ar'?'إغلاق العرض':'Close offer'}" autofocus>×</button><div class="offer-inner">${image?`<img class="offer-image" src="${esc(image)}" alt="" decoding="async">`:''}<span class="offer-eyebrow">${lang==='ar'?'عرض خاص إلك':'A LITTLE TREAT FOR YOU'}</span><h2 id="offerTitle">${esc(copy(offer,'title',lang)||(lang==='ar'?'عرض خاص':'Special offer'))}</h2><p id="offerMessage">${esc(copy(offer,'message',lang))}</p>${offer.item_id?`<button type="button" class="primary offer-action">${lang==='ar'?'شوف العرض':'See the offer'} →</button>`:''}<small class="offer-countdown">${lang==='ar'?'بتسكر تلقائيًا بعد ٥ ثواني':'Closes automatically after 5 seconds'}</small></div><div class="offer-timer" aria-hidden="true"></div>`;
 document.body.append(dialog);let timer;
 const close=()=>{if(dialog.open)dialog.close();};
 dialog.querySelector('.offer-close').onclick=close;
 dialog.querySelector('.offer-action')?.addEventListener('click',()=>{close();onSelect(offer.item_id);});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();});
 dialog.addEventListener('close',()=>{clearTimeout(timer);dialog.remove();},{once:true});
 dialog.showModal();timer=setTimeout(close,5000);
 return close;
}
export function scheduleOffer(offer,{getLanguage=()=>document.documentElement.lang,onSelect}={}){
 if(offer?.enabled!==true||new URLSearchParams(location.search).has('track'))return;
 const display=()=>{if(document.hidden){document.addEventListener('visibilitychange',visible);return;}if(!document.querySelector('dialog[open]'))showOffer(offer,{lang:getLanguage(),onSelect});};
 const visible=()=>{if(!document.hidden){document.removeEventListener('visibilitychange',visible);display();}};
 setTimeout(display,Math.max(0,1000-performance.now()));
}
