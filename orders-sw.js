self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const admin=windows.find(client=>['/admin','/admin.html'].includes(new URL(client.url).pathname));
  if(admin){await admin.focus();if(event.notification.tag==='tre-fratelli-orders')admin.postMessage('show-orders');}
  else await self.clients.openWindow('/admin.html');
 })());
});
