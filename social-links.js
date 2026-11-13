const channels=[
 ['google_maps_url','Google Maps'],
 ['instagram_url','Instagram'],
 ['tiktok_url','TikTok'],
 ['facebook_url','Facebook']
];
export function socialUrl(value){
 try{
  const url=new URL(String(value??'').trim());
  return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:'';
 }catch{return '';}
}
export function renderSocialLinks(settings,esc){
 return channels.flatMap(([key,label])=>{
  const href=socialUrl(settings[key]);
  return href?[`<a href="${esc(href)}" target="_blank" rel="noopener">${label} ↗</a>`]:[];
 }).join(' · ');
}
