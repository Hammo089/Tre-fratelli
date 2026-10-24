// Optional background music. Respect browser autoplay policy and saved choice.
const audio=new Audio('assets/music/italian-countryside.mp3');
audio.loop=true;audio.preload='none';audio.volume=.55;
let wanted=true,starting=false,suspended=false;
try{wanted=localStorage.getItem('tf-music')!=='off';}catch{}
const dock=document.createElement('div');dock.className='music-dock';
const button=document.createElement('button');button.type='button';button.className='music-toggle';
const note=document.createElement('span');note.setAttribute('aria-hidden','true');note.textContent='♫';
const label=document.createElement('span');button.append(note,label);dock.append(button);
function update(){
 const ar=document.documentElement.lang==='ar',playing=!audio.paused;
 label.textContent=playing?(ar?'إيقاف الموسيقى':'Music off'):(ar?'تشغيل الموسيقى':'Music on');
 button.setAttribute('aria-label',label.textContent);button.setAttribute('aria-pressed',String(playing));
 dock.dataset.playing=String(playing);
}
function stopRetry(){document.removeEventListener('click',unlock,true);document.removeEventListener('keydown',unlock,true);}
async function start(){
 if(!wanted||starting||document.hidden)return;
 starting=true;
 try{await audio.play();if(!wanted||document.hidden)audio.pause();else stopRetry();}
 catch{if(wanted){document.addEventListener('click',unlock,true);document.addEventListener('keydown',unlock,true);}}
 finally{starting=false;update();}
}
function unlock(event){if(button.contains(event.target)||event.type==='keydown'&&!['Enter',' '].includes(event.key))return;start();}
button.onclick=()=>{
 if(!audio.paused){wanted=false;audio.pause();stopRetry();}
 else{wanted=true;start();}
 try{localStorage.setItem('tf-music',wanted?'on':'off');}catch{}
 update();
};
audio.addEventListener('play',update);audio.addEventListener('pause',update);
audio.addEventListener('error',()=>{stopRetry();wanted=false;update();});
// A modal is in the top layer: move the same control into it to keep it usable.
function place(){
 const dialogs=[...document.querySelectorAll('dialog[open]')],host=dialogs.at(-1)||document.body;
 if(dock.parentElement!==host)host.append(dock);
 dock.dataset.builder=String(host.id==='builder');
}
const modalObserver=new MutationObserver(place);
modalObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){suspended=!audio.paused;audio.pause();}
 else if(suspended&&wanted){suspended=false;start();}
});
window.addEventListener('pagehide',()=>audio.pause());
window.addEventListener('pageshow',()=>{if(wanted)start();});
place();update();if(wanted)start();
