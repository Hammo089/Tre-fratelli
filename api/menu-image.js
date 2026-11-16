import {mediaHost} from '../menu-media.js';
const types=new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif']);
export async function GET(request){
 const query=new URL(request.url).searchParams,key=query.get('key');
 if(!key||key.length>240||!/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(key)||query.toString()!==new URLSearchParams({key}).toString())return new Response(null,{status:400});
 try{
  const upstream=await fetch(mediaHost+'/storage/v1/object/public/menu-images/'+key,{redirect:'error',signal:AbortSignal.timeout(9000)});
  const type=upstream.headers.get('content-type')?.split(';')[0];
  if(!upstream.ok||!types.has(type)||!upstream.body){
   await upstream.body?.cancel();
   return new Response(null,{status:upstream.status===404?404:502});
  }
  return new Response(upstream.body,{headers:{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400','Vercel-CDN-Cache-Control':'public, s-maxage=2592000, stale-while-revalidate=86400'}});
 }catch{return new Response(null,{status:502});}
}
