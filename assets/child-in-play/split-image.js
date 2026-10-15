(function () {
  'use strict';
  document.querySelectorAll('img[data-asset-parts]').forEach(function (img) {
    let pending;
    async function load() {
      if (img.dataset.assetReady) return;
      if (!pending) pending = Promise.all(img.dataset.assetParts.split(',').map(async function (url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Image request failed: ' + response.status);
        return response.arrayBuffer();
      })).then(function (parts) {
        img.src = URL.createObjectURL(new Blob(parts, {type: 'image/webp'}));
        img.dataset.assetReady = 'true';
      }).catch(function (error) { pending = null; throw error; });
      return pending;
    }
    function activate(event) {
      if (img.dataset.assetReady || (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      load().then(function () { img.click(); }).catch(function () {});
    }
    img.addEventListener('click', activate, true);
    img.addEventListener('keydown', activate, true);
    // Prepare this image for printing as well as on-screen reading.
    load().catch(function () {});
    const print = document.getElementById('printButton');
    if (print) print.addEventListener('click', function (event) {
      if (img.dataset.assetReady) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      load().then(function () { print.click(); }).catch(function () {});
    }, true);
  });
})();
