export const isPizza=cat=>['Pizza','AmericanPizza'].includes(cat);
export const isManakish=cat=>['Manakish','MiniManakish'].includes(cat);

export const extraMatches=(extra,item)=>!!(extra?.enabled&&item&&Array.isArray(extra.categories)&&extra.categories.length===1&&extra.categories[0]===item.cat&&(!extra.allowed_items?.length||extra.allowed_items.includes(item.id)));
