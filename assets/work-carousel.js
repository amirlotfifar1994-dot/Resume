(function(root){
 'use strict';
 function mount(box,env){
  const document=env.document,track=box.querySelector('.carousel-track'),cards=[...track.children],toggle=box.querySelector('[data-carousel-toggle]'),prev=box.querySelector('[data-carousel-prev]'),next=box.querySelector('[data-carousel-next]'),dots=box.querySelector('.carousel-dots'),counter=box.querySelector('.carousel-counter'),announcement=box.querySelector('.carousel-announcement');
  if(cards.length<2)return;
  const reduced=env.matchMedia('(prefers-reduced-motion: reduce)');let index=0,visible=1,maximum=0,timer=null,playing=!reduced.matches,hovered=false,focused=false,inView=true,exited=false;
  box.setAttribute('data-ready','');[toggle,prev,next].forEach(b=>b.hidden=false);box.querySelector('.carousel-footer').hidden=false;
  const language=(document.documentElement.lang||'en').slice(0,2),number=n=>new Intl.NumberFormat(language).format(n);
  function stop(){if(timer!==null){env.clearInterval(timer);timer=null;}}
  function schedule(){stop();if(playing&&!hovered&&!focused&&inView&&!document.hidden&&!exited&&maximum>0)timer=env.setInterval(()=>move(1,false),6000);}
  function paint(announce){
   const first=cards[0].getBoundingClientRect(),current=cards[index].getBoundingClientRect();
   track.style.setProperty('--carousel-shift',String(first.left-current.left)+'px');
   cards.forEach((card,i)=>{const shown=i>=index&&i<index+visible;card.inert=!shown;card.setAttribute('aria-hidden',String(!shown));card.tabIndex=shown?0:-1;});
   [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
   const label=box.dataset.status+' '+number(index+1)+(visible>1?'–'+number(Math.min(index+visible,cards.length)):'')+' '+box.dataset.of+' '+number(cards.length);
   counter.textContent=label;if(announce)announcement.textContent=label+' · '+cards[index].querySelector('h3').textContent;
   toggle.textContent=playing?box.dataset.pause:box.dataset.play;toggle.setAttribute('aria-pressed',String(playing));
  }
  function go(value,announce=true){index=Math.max(0,Math.min(maximum,value));paint(announce);schedule();}
  function move(delta,announce=true){go(index+delta<0?maximum:index+delta>maximum?0:index+delta,announce);}
  function resize(){
   visible=Math.max(1,Math.min(cards.length,parseInt(env.getComputedStyle(box).getPropertyValue('--carousel-cards'),10)||1));maximum=Math.max(0,cards.length-visible);
   index=Math.min(index,maximum);const focusedIndex=cards.findIndex(card=>card.contains(document.activeElement));
   if(focusedIndex>=0&&(focusedIndex<index||focusedIndex>=index+visible))index=Math.min(focusedIndex,maximum);
   dots.replaceChildren();for(let i=0;i<=maximum;i++){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',box.dataset.status+' '+cards[i].querySelector('h3').textContent);button.addEventListener('click',()=>go(i));dots.append(button);}
   paint(false);schedule();
  }
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));toggle.addEventListener('click',()=>{playing=!playing;paint(false);schedule();});
  box.addEventListener('mouseenter',()=>{hovered=true;schedule();});box.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  box.addEventListener('focusin',()=>{focused=true;schedule();});box.addEventListener('focusout',()=>{env.setTimeout(()=>{focused=box.contains(document.activeElement);schedule();},0);});
  document.addEventListener('visibilitychange',schedule);env.addEventListener('resize',resize);
  env.addEventListener('pagehide',()=>{exited=true;stop();});env.addEventListener('pageshow',()=>{exited=false;resize();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches)playing=false;paint(false);schedule();});
  if(env.IntersectionObserver){const observer=new env.IntersectionObserver(entries=>{inView=entries.some(entry=>entry.isIntersecting);schedule();},{threshold:0});observer.observe(box);}
  resize();return {resize};
 }
 if(typeof module!=='undefined')module.exports={mount};else document.querySelectorAll('.work-carousel').forEach(box=>mount(box,root));
})(typeof window!=='undefined'?window:globalThis);
