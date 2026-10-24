// Catalog prices are stored in USD; customers see integer Lebanese pounds.
export function convertToLbp(amount,rate=90000){
 const value=Number(amount),exchange=Number(rate);
 return Math.round((Number.isFinite(value)?value:0)*(Number.isFinite(exchange)&&exchange>0?exchange:90000));
}
export function formatLbp(amount,lang='en'){
 const value=Math.round(Number(amount)||0);
 return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value)+(lang==='ar'?' ل.ل.':' LBP');
}
