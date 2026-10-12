const response=await fetch('/api/config',{cache:'no-store'});
if(!response.ok)throw Error('Site configuration unavailable');
const config=await response.json();
export const SUPABASE_URL=config.url;
export const SUPABASE_KEY=config.key;
