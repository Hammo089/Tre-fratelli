export const sectionLabels={hero:'الصورة والترحيب / Hero',menu:'الأصناف / Menu',heritage:'الفرن والمكوّنات / Our story',feedback:'رأي الزبون / Feedback'};
export const categoryLabels={Pizza:'بيتزا / Pizza',AmericanPizza:'بيتزا أمريكية / American Pizza',MiniManakish:'مناقيش ميني / Mini Manakish',Manakish:'مناقيش / Manakish',Pastries:'معجنات / Pastries',Drinks:'مشروبات / Drinks',Dessert:'حلويات / Dessert'};
// Owner-added categories (settings.custom_categories) join the built-in ones at runtime.
export function addCustomCategories(list,names={}){for(const c of Array.isArray(list)?list:[]){categoryLabels[c.id]=c.name_ar+' / '+c.name_en;names[c.id]=[c.name_ar,c.name_en];}}
export function normalizeOrder(value,defaults){return [...new Set([...(Array.isArray(value)?value:[]).filter(k=>defaults.includes(k)),...defaults])];}
export function applyLanding(settings){const main=document.querySelector('main'),footer=main?.querySelector('footer');if(!footer)return;for(const key of normalizeOrder(settings.landing_order,Object.keys(sectionLabels))){const node=main.querySelector(`[data-landing-section="${key}"]`);if(node)main.insertBefore(node,footer);}}

export function orderAllItems(items,value){const ids=normalizeOrder(value,items.map(i=>i.id)),rank=new Map(ids.map((id,n)=>[id,n]));return [...items].sort((a,b)=>rank.get(a.id)-rank.get(b.id));}
