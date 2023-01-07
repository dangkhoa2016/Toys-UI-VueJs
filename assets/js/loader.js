/*jshint esversion: 9 */

const { loadModule, vueVersion } = window['vue2-sfc-loader'];

window.options = {
  moduleCache: {},
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok)
      throw Object.assign(new Error(url + ' ' + res.statusText), { res });
    return await res.text();
  },

  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },

  log(type, ...args) {
    console[type](...args);
  },
};

(async () => {

  window.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const loadStore = function (file) {
    return loadJs(`/vue/stores/${file}.js`);
  };

  const loadJs = function (file) {
    return new Promise((resolve) => {
      fetch(file)
        .then(res => {
          if (res.status !== 200)
            throw new Error(`File [${file}] does not exists.`);
          return res.text();
        }).then(js => {
          eval(js);
          resolve();
        }).catch(ex => {
          console.log(`Error load js: ${file}`, ex);
          resolve();
        });
    });
  };

  const handleErrors = function (response) {
    return new Promise(async (resolve) => {
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        if (response.status === 422)
          resolve({ status: response.status, error: 'Missing required field.' });

        if (!contentType || contentType.includes('text/html') || contentType.includes('text/plain'))
          resolve({ status: response.status, ...(await response.text()) });
        else
          resolve({ status: response.status, ...(await response.json()) });
        return;
      }

      if (contentType.indexOf('image/') !== -1)
        resolve({ url: response.url });
      else if (contentType.includes('text/html') || contentType.includes('text/plain'))
        resolve(await response.text());
      else
        resolve(await response.json() || {});
    });
  };

  window.handleErrors = handleErrors;
  Vue.prototype.$handleErrors = handleErrors;

  await loadStore('appStore');
  await loadStore('toyStore');
  await loadJs('/assets/js/script.js');
})();
