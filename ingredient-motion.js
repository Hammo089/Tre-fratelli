// Keep the flying sprite in the dialog's top layer, including on mobile Safari.
export function ingredientSource(button){
 const icon=button.closest('.topping-option')?.querySelector('.topping-add i');
 return {rect:(button.classList.contains('topping-add')?icon||button:button).getBoundingClientRect(),icon:icon?.cloneNode(true)};
}
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function feedback(element){
 if(!element||reduceMotion()||!element.animate)return;
 element.animate([{transform:'scale(1)'},{transform:'scale(1.07)',offset:.4},{transform:'scale(1)'}],{duration:320,easing:'ease-out'});
}
export function flyIngredient(source,dialog,stage,onLand){
 let frame,finished=false;
 const sprite=document.createElement('div');sprite.className='ingredient-flight';sprite.setAttribute('aria-hidden','true');
 if(source.icon)sprite.append(source.icon);
 const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(frame);sprite.remove();onLand();};
 if(reduceMotion()||!source.icon||!dialog.open){finish();return finish;}
 const r=source.rect,size=56,start={x:r.left+r.width/2,y:r.top+r.height/2},started=performance.now();
 const turn=start.x>innerWidth/2?-1:1;
 sprite.style.width=sprite.style.height=size+'px';dialog.append(sprite);
 function tick(now){
  if(!dialog.open||!stage.isConnected){finish();return;}
  const destination=stage.getBoundingClientRect();
  if(!destination.width||!destination.height){finish();return;}
  const progress=Math.min(1,(now-started)/820),t=1-Math.pow(1-progress,2);
  const end={x:destination.left+destination.width*.5,y:destination.top+destination.height*.46};
  const lift=Math.min(130,Math.max(55,Math.abs(end.y-start.y)*.24));
  const x=start.x+(end.x-start.x)*t+Math.sin(Math.PI*t)*turn*36;
  const y=start.y+(end.y-start.y)*t-Math.sin(Math.PI*t)*lift;
  const scale=1+Math.sin(Math.PI*progress)*.28-Math.pow(progress,4)*.6;
  sprite.style.transform=`translate3d(${x-size/2}px,${y-size/2}px,0) rotate(${Math.sin(Math.PI*t)*turn*22}deg) scale(${scale})`;
  sprite.style.opacity=String(progress<.82?1:(1-progress)/.18);
  if(progress<1)frame=requestAnimationFrame(tick);else finish();
 }
 frame=requestAnimationFrame(tick);return finish;
}
