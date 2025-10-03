/**
 * Critical Polyfills for Request/Response
 * MUST be imported FIRST before any other dependencies
 */

// Polyfill Request if not available
if (typeof globalThis.Request === 'undefined') {
  class PolyfillRequest {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : (input?.url || '');
      this.method = init.method || 'GET';
      this.headers = init.headers || {};
      this.body = init.body;
      this.credentials = init.credentials || 'same-origin';
      this.cache = init.cache || 'default';
      this.mode = init.mode || 'cors';
      this.redirect = init.redirect || 'follow';
      this.referrer = init.referrer || 'about:client';
    }
    
    clone() {
      return new PolyfillRequest(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        credentials: this.credentials,
        cache: this.cache,
        mode: this.mode,
        redirect: this.redirect,
        referrer: this.referrer
      });
    }
  }
  
  globalThis.Request = PolyfillRequest;
  window.Request = PolyfillRequest;
}

// Polyfill Response if not available
if (typeof globalThis.Response === 'undefined') {
  class PolyfillResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = init.headers || {};
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'default';
      this.url = '';
    }
    
    clone() {
      return new PolyfillResponse(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers
      });
    }
    
    json() {
      try {
        return Promise.resolve(JSON.parse(this.body));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    
    text() {
      return Promise.resolve(String(this.body));
    }
    
    blob() {
      return Promise.resolve(new Blob([this.body]));
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
  }
  
  globalThis.Response = PolyfillResponse;
  window.Response = PolyfillResponse;
}

// Also ensure Headers is available
if (typeof globalThis.Headers === 'undefined') {
  class PolyfillHeaders {
    constructor(init = {}) {
      this._headers = {};
      if (init) {
        Object.keys(init).forEach(key => {
          this._headers[key.toLowerCase()] = init[key];
        });
      }
    }
    
    append(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
    
    delete(name) {
      delete this._headers[name.toLowerCase()];
    }
    
    get(name) {
      return this._headers[name.toLowerCase()];
    }
    
    has(name) {
      return name.toLowerCase() in this._headers;
    }
    
    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
    
    forEach(callback) {
      Object.keys(this._headers).forEach(key => {
        callback(this._headers[key], key, this);
      });
    }
  }
  
  globalThis.Headers = PolyfillHeaders;
  window.Headers = PolyfillHeaders;
}

console.log('✅ Polyfills loaded successfully');
