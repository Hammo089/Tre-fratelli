export const mediaHost='https://ziurncpynrsibzspsnnz.supabase.co';
export function menuMedia(value){
 if(!value)return '';
 if(/^\/?assets\/[a-z0-9_./-]+$/i.test(value))return '/'+value.replace(/^\//,'');
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password)return '';
  const match=u.pathname.match(/^\/storage\/v1\/object\/public\/menu-images\/([a-z0-9_./-]+)$/i);
  if(u.origin===mediaHost&&match)return '/api/menu-image?key='+encodeURIComponent(match[1]);
  return u.href;
 }catch{return '';}
}
