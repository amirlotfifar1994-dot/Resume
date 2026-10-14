(function(){
  'use strict';
  // Old résumé links continue to reach the page that now owns their section.
  var sectionPages={experience:'overview',services:'overview',skills:'overview','product-projects':'projects',neuroverse:'projects','gold-shop':'projects','assessment-mvp':'projects','kavian-accounting':'projects','poll-system':'projects','energy-intelligence':'projects','content-books':'books','learning-apps':'books','half-life-of-meaning':'books','amar-academy':'books','website-projects':'portfolio',dashboards:'portfolio','design-portfolio':'portfolio',jajrood:'portfolio'};
  function routeLegacyHash(){
    var id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    var route=sectionPages[id];if(!route||document.getElementById(id))return;
    var lang=(document.documentElement.lang||'en').slice(0,2);if(!['fa','en','it'].includes(lang))lang='en';
    var file='professional'+(route==='overview'?'':'-'+route)+'-'+lang+'.html';
    location.replace(new URL(file+location.search+'#'+encodeURIComponent(id),location.href).href);
  }
  routeLegacyHash();window.addEventListener('hashchange',routeLegacyHash);
})();
