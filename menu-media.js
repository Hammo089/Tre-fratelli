// Legacy originals are unavailable while the former project's storage is restricted.
// Keep their source URLs in the database so the originals can be recovered later.
export const mediaHost='https://detkeajmzrhhgihxbsqn.supabase.co';
const legacyHost='https://ziurncpynrsibzspsnnz.supabase.co';
const legacyFallbacks={
  "425b89be-3bc2-4bc1-a052-9de90ac2e7e2.JPG": "assets/items/mk-zaatar.jpg",
  "b4b9e4ea-6c4c-4586-a09b-85733fd6d30c.JPG": "assets/items/mk-meat.jpg",
  "81756ed7-f525-4850-8992-570654bc1caa.JPG": "assets/items/pz-bresaola.jpg",
  "e77380f6-1bf8-439e-a364-efcaa3ba9d23.JPG": "assets/items/pz-pepperoni.jpg",
  "fa2e49db-1be2-4f42-b07d-269de3cddf55.JPG": "assets/items/pz-margherita.jpg",
  "67940329-84f6-4744-be2a-1f98bccf32c4.JPG": "assets/items/mk-keshek.jpg",
  "b0278da5-1ae2-4761-a274-baee696c97c8.JPG": "assets/items/pz-vegetarian.jpg",
  "363cf0e3-8468-4b84-8e1f-0ddd250c7315.JPG": "assets/items/mk-cheese.jpg",
  "cdf67249-7e83-4684-aeab-f8e07670aaca.jpeg": "assets/items/dr-pepsi.svg",
  "54319db0-4bcf-486f-bb6a-f4d7087f72e3.jpeg": "assets/logo.png",
  "bb9a5570-bf7c-4518-aa86-e03963390820.jpeg": "assets/items/mk-spinach.svg",
  "a40e510b-3eb0-472d-9c6a-77deb9162dbc.jpeg": "assets/items/dr-yogurt.svg",
  "80f9fc7e-4047-408e-989f-b48c6de3e4b3.JPG": "assets/items/pz-marinara.svg",
  "846c4997-83d4-4393-b838-eee4c1a1e106.jpeg": "assets/logo.png",
  "fd3818c3-bd00-4779-8474-cb76006bfd36.JPG": "assets/items/mk-tomato-onion.svg",
  "665074d8-edc3-45ff-ae6b-aeb7196b502b.JPG": "assets/items/pz-truffle.jpg",
  "f1a7b59c-041c-44f7-98eb-d503804ef073.jpeg": "assets/dessert-real/nutella-base.webp",
  "afdd85aa-af3d-4098-af96-fb273b6675b7.jpeg": "assets/items/dr-pepsi-diet.svg",
  "679e24e9-d8ba-4393-913b-5a6276d78543.jpeg": "assets/items/dr-7up-diet.svg",
  "fb8f16e1-0507-4bd2-8dc4-08d10ee68394.jpeg": "assets/items/dr-mirinda.svg",
  "bc17c865-cdd4-4881-8b4d-d395562303d3.jpeg": "assets/items/dr-7up.svg",
  "5e07cf60-450f-404f-a5e8-4b28f8f66c48.JPG": "assets/pizza-real/american-square-cheese.webp",
  "80a16c85-dfb3-45f0-96fa-73643bac5967.JPG": "assets/logo.png",
  "18f788a5-e15c-4306-830a-b6d38c62a03f.JPG": "assets/pizza-real/american-square-cheese.webp",
  "d075543c-ffb3-466b-95e0-7ceb51949466.jpeg": "assets/logo.png",
  "bc72a78a-c130-45f8-a8b6-1a9079136441.jpeg": "assets/logo.png",
  "81199f53-e3e6-44bb-8b8c-3faed8e07c2e.jpeg": "assets/items/mk-cocktail.svg",
  "8f54f2da-23cf-47ec-81fd-80850cd7820b.JPG": "assets/pizza-real/american-square-cheese.webp",
  "3fe0026a-7d29-4cb9-bb64-6b9d68f8bd8a.JPG": "assets/logo.png",
  "363f9bd8-2491-42c2-833a-6156e2f5c791.JPG": "assets/logo.png",
  "836b8805-c452-4d9f-8253-79a123081e5b.jpeg": "assets/logo.png",
  "5b5c4ee4-4b93-4393-b50d-96c15fd42783.JPG": "assets/logo.png",
  "cd4f0030-0ac8-4ba3-bd24-bb5a60ec95a2.jpeg": "assets/logo.png",
  "074ec898-65a9-4b60-9139-f6c4a844bf5a.JPG": "assets/logo.png",
  "6980ac5e-fd70-460a-bbb1-89391ca82198.jpeg": "assets/items/dr-mirinda-diet.svg",
  "6ec79130-a198-4456-a7d2-dd4e4d6da599.jpeg": "assets/logo.png",
  "273edb39-7e22-4670-92fc-0615dd71fa44.JPG": "assets/logo.png",
  "a11e0aa4-4419-4f07-adc1-632915f00bb4.JPG": "assets/logo.png",
  "9ac24f05-faf3-4aac-884e-48c1f4f5842e.jpeg": "assets/logo.png",
  "6a86c12f-26cc-4b33-9143-6dce2b904c44.jpeg": "assets/logo.png",
  "4b970405-9ffa-47e3-b571-9703a0a85d54.JPG": "assets/logo.png",
  "87018bbd-0c24-467f-b8b8-5e2735d88de3.JPG": "assets/pizza-real/american-square-cheese.webp",
  "160e55a3-8091-4738-828b-b3a49d0c0113.JPG": "assets/pizza-real/american-square-cheese.webp",
  "landing/04b63f2a-2d86-46c3-97b9-dea5237f8227.jpeg": "assets/items/pz-pepperoni.jpg"
};
export function menuMedia(value){
 if(!value)return '';
 if(/^\/?assets\/[a-z0-9_./-]+$/i.test(value))return '/'+value.replace(/^\//,'');
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password)return '';
  const match=u.pathname.match(/^\/storage\/v1\/object\/public\/menu-images\/([a-z0-9_./-]+)$/i);
  if(u.origin===legacyHost&&match)return '/'+(legacyFallbacks[match[1]]||'assets/logo.png');
  if(u.origin===mediaHost&&match)return '/api/menu-image?key='+encodeURIComponent(match[1]);
  return u.href;
 }catch{return '';}
}
