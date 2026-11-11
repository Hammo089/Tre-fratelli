// Catalog prices are stored in USD; customers see integer Lebanese pounds.
export function convertToLbp(amount,rate=90000){
 const value=Number(amount),exchange=Number(rate);
 return Math.round((Number.isFinite(value)?value:0)*(Number.isFinite(exchange)&&exchange>0?exchange:90000));
}
export function formatLbp(amount,lang='en'){
 const value=Math.round(Number(amount)||0);
 return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value)+(lang==='ar'?' ل.ل.':' LBP');
}

export function formatDual(lbp,usd,lang='en'){
 return formatLbp(lbp,lang)+' / '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(usd)||0);
}
export function menuMoney(usd,rate=90000,lang='en'){
 return formatDual(convertToLbp(usd,rate),usd,lang);
}
export function priceUsd(row,rate=90000){
 return Number.isSafeInteger(row?.price_lbp)&&row.price_lbp>=0?row.price_lbp/rate:Number(row?.price)||0;
}
export function vegetableBundleLbp(settings){
 return settings.vegetable_bundle_lbp??45000;
}
