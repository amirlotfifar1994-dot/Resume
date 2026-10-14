const test=require('node:test'),assert=require('node:assert/strict');
const {mount}=require('../assets/work-carousel.js');
class Node{constructor(title=''){this.title=title;this.children=[];this.events={};this.attributes={};this.dataset={};this.style={setProperty:(k,v)=>this.attributes[k]=v};this.hidden=true;this.textContent='';}
 addEventListener(k,fn){this.events[k]=fn;}setAttribute(k,v){this.attributes[k]=v;}append(n){this.children.push(n);}replaceChildren(){this.children=[];}querySelector(k){if(k==='h3')return {textContent:this.title};return this.nodes[k];}contains(n){return this===n||this.children.includes(n);}}
function harness({reduced=false,rtl=false,visible=3}={}){
 const box=new Node(),track=new Node(),events={},timers=new Map();let count=0,intersect;
 const nodes=Object.fromEntries(['.carousel-track','[data-carousel-toggle]','[data-carousel-prev]','[data-carousel-next]','.carousel-dots','.carousel-counter','.carousel-announcement','.carousel-footer'].map(k=>[k,k==='.carousel-track'?track:new Node()]));
 box.nodes=nodes;box.dataset={pause:'Pause',play:'Play',status:'Showing',of:'of'};
 for(let i=0;i<8;i++){const card=new Node('Project '+i);card.getBoundingClientRect=()=>({left:(rtl?-1:1)*i*300});track.append(card);}box.children=[...track.children,...Object.values(nodes)];
 const document={hidden:false,activeElement:null,documentElement:{lang:'en'},createElement:()=>new Node(),addEventListener:(k,fn)=>events['document:'+k]=fn};
 const media={matches:reduced,addEventListener:(_k,fn)=>events.media=fn};const env={document,matchMedia:()=>media,getComputedStyle:()=>({getPropertyValue:()=>String(visible)}),
   setInterval:fn=>{timers.set(++count,fn);return count;},clearInterval:id=>timers.delete(id),setTimeout:fn=>fn(),addEventListener:(k,fn)=>events[k]=fn,
   IntersectionObserver:class{constructor(fn){intersect=fn;}observe(){}}};
 const controller=mount(box,env);return {box,nodes,track,document,media,events,timers,controller,intersect:flag=>intersect([{isIntersecting:flag}]),resize:n=>{visible=n;controller.resize();},advance:()=>[...timers.values()][0]?.()};
}
test('automatic advance hides off-screen links and never announces every timed movement',()=>{
 const h=harness();assert.equal(h.timers.size,1);assert.equal(h.track.children[0].inert,false);assert.equal(h.track.children[3].inert,true);
 h.advance();assert.equal(h.track.attributes['--carousel-shift'],'-300px');assert.equal(h.track.children[0].tabIndex,-1);assert.equal(h.track.children[3].inert,false);assert.equal(h.nodes['.carousel-announcement'].textContent,'');
});
test('RTL advances toward the next item with the opposite physical transform',()=>{
 const h=harness({rtl:true});h.nodes['[data-carousel-next]'].events.click();assert.equal(h.track.attributes['--carousel-shift'],'300px');assert.match(h.nodes['.carousel-announcement'].textContent,/Project 1/);
});
test('hover and keyboard focus pause motion until both have left',()=>{
 const h=harness();h.box.events.mouseenter();assert.equal(h.timers.size,0);h.box.events.focusin();h.document.activeElement=h.track.children[0];h.box.events.mouseleave();assert.equal(h.timers.size,0);
 h.document.activeElement=null;h.box.events.focusout();assert.equal(h.timers.size,1);
});
test('manual pause remains paused after hover and resizing',()=>{
 const h=harness();h.nodes['[data-carousel-toggle]'].events.click();assert.equal(h.nodes['[data-carousel-toggle]'].textContent,'Play');h.box.events.mouseenter();h.box.events.mouseleave();h.resize(1);assert.equal(h.timers.size,0);
 h.nodes['[data-carousel-toggle]'].events.click();assert.equal(h.timers.size,1);
});
test('reduced motion starts paused, keeps manual navigation, and responds to preference changes',()=>{
 const h=harness({reduced:true});assert.equal(h.timers.size,0);h.nodes['[data-carousel-next]'].events.click();assert.equal(h.track.attributes['--carousel-shift'],'-300px');
 h.nodes['[data-carousel-toggle]'].events.click();assert.equal(h.timers.size,1);h.media.matches=true;h.events.media();assert.equal(h.timers.size,0);
});
test('background tabs, offscreen content and page exit stop timers; cached return can resume',()=>{
 const h=harness();h.intersect(false);assert.equal(h.timers.size,0);h.intersect(true);assert.equal(h.timers.size,1);
 h.document.hidden=true;h.events['document:visibilitychange']();assert.equal(h.timers.size,0);h.document.hidden=false;h.events['document:visibilitychange']();assert.equal(h.timers.size,1);
 h.events.pagehide();assert.equal(h.timers.size,0);h.resize(1);assert.equal(h.timers.size,0);h.events.pageshow();assert.equal(h.timers.size,1);
});
test('resizing clamps the final position and preserves a keyboard-focused card',()=>{
 const h=harness({visible:1});for(let i=0;i<7;i++)h.nodes['[data-carousel-next]'].events.click();h.resize(3);assert.equal(h.track.attributes['--carousel-shift'],'-1500px');
 h.document.activeElement=h.track.children[6];h.resize(1);assert.equal(h.track.children[6].inert,false);assert.equal(h.track.attributes['--carousel-shift'],'-1800px');
});
test('previous wraps to the last valid group and next wraps to the first',()=>{
 const h=harness();h.nodes['[data-carousel-prev]'].events.click();assert.equal(h.track.attributes['--carousel-shift'],'-1500px');h.nodes['[data-carousel-next]'].events.click();assert.equal(h.track.attributes['--carousel-shift'],'0px');
});
