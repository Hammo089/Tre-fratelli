import test from 'node:test';import assert from 'node:assert/strict';import {validateOrder} from '../supabase/functions/order/logic.js';
const item={id:'pizza',enabled:true,name_ar:'بيتزا',name_en:'Pizza',cat:'Pizza',sizes:[{id:'regular',name_ar:'عادي',name_en:'Regular',price:12}],toppings:['cheese']};const extra={id:'olive',enabled:true,name_ar:'زيتون',name_en:'Olives',categories:['Pizza'],price:1};const settings={accepting_orders:true,delivery_fee_lbp:100000,exchange_rate:100000,minimum_order_usd:0,whish_number:''};
const input=()=>({request_id:crypto.randomUUID(),customer_name:'Test',phone:'03960649',address:'Beirut',fulfillment:'delivery',payment:'cash',channel:'web',items:[{item_id:'pizza',size_id:'regular',qty:2,extras:['olive'],removed:[],unit_price:.01}]});
test('server ignores client prices and computes delivery',()=>{const o=validateOrder(input(),[item],[extra],settings);assert.equal(o.subtotal_usd,26);assert.equal(o.total_usd,27);assert.equal(o.total_lbp,2700000);});
test('pickup needs no address and has no delivery fee',()=>{const p=input();p.fulfillment='pickup';delete p.address;assert.equal(validateOrder(p,[item],[extra],settings).delivery_fee_lbp,0);});
test('invalid extras, sizes, removal and quantities are rejected',()=>{for(const change of [{extras:['fake']},{size_id:'fake'},{removed:['fake']},{qty:0},{qty:1.5},{qty:21}]){const p=input();Object.assign(p.items[0],change);assert.throws(()=>validateOrder(p,[item],[extra],settings));}});
test('paused orders, absent address, unavailable Whish, disabled products are rejected',()=>{assert.throws(()=>validateOrder(input(),[item],[extra],{...settings,accepting_orders:false}));const p=input();p.address='';assert.throws(()=>validateOrder(p,[item],[extra],settings));p.address='Beirut';p.payment='whish';assert.throws(()=>validateOrder(p,[item],[extra],settings));assert.throws(()=>validateOrder(input(),[{...item,enabled:false}],[extra],settings));});
test('two portions of a paid extra are charged twice',()=>{const p=input();p.items[0].extras=['olive','olive'];assert.equal(validateOrder(p,[item],[extra],settings).subtotal_usd,28);});
test('a price entered in LBP is charged exactly in LBP',()=>{const rate=89500,lbpItem={...item,sizes:[{...item.sizes[0],price:450000/rate}]},p=input();p.fulfillment='pickup';p.items[0].extras=[];const o=validateOrder(p,[lbpItem],[],{...settings,exchange_rate:rate});assert.equal(o.total_lbp,900000);assert.equal(Math.round(o.items[0].unit_price*rate),450000);});
test('WhatsApp orders are saved as whatsapp_pending with exact LBP total',()=>{const p=input();p.channel='whatsapp';const o=validateOrder(p,[item],[extra],settings);assert.equal(o.status,'whatsapp_pending');assert.equal(o.channel,'whatsapp');assert.equal(o.total_lbp,2700000);});
test('vegetable bundle is charged once per manoushe at its configured LBP price, including zero',()=>{
 const manoushe={...item,cat:'Manakish'},veg=['mint','tomato'].map(id=>({...extra,id,categories:['Manakish'],group_name:'vegetable'}));
 const p=input();p.fulfillment='pickup';p.items[0].extras=['mint','mint','tomato'];
 for(const fee of [undefined,0,53001]){
  const o=validateOrder(p,[manoushe],veg,{...settings,exchange_rate:90000,vegetable_bundle_lbp:fee});
  assert.equal(o.total_lbp,2*(1080000+(fee??45000)));
  assert.ok(o.items[0].extras.every(x=>x.price===0));
 }
});
test('a hidden custom section cannot be ordered',()=>{
 const p=input();p.items[0].extras=[];
 assert.throws(()=>validateOrder(p,[{...item,cat:'salads'}],[],{...settings,custom_categories:[{id:'salads',enabled:false}]}),/no longer available/);
});
test('LBP prices set by the shop stay fixed when the exchange rate changes',()=>{
 const priced={...item,sizes:[{...item.sizes[0],price_lbp:1000001}]};
 const p=input();p.fulfillment='pickup';
 for(const rate of [90000,98500]){
  const order=validateOrder(p,[priced],[{...extra,price_lbp:45301}],{...settings,exchange_rate:rate});
  assert.equal(order.total_lbp,2090604);
 }
});
