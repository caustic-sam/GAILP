// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Ensure TextEncoder/Decoder exist in the Jest environment
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.Request === 'undefined') {
  class RequestPolyfill {
    constructor(input, init = {}) {
      this.url = input;
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
      this.body = init.body;
    }
  }

  global.Request = RequestPolyfill;
}

if (typeof global.Response === 'undefined') {
  const HeadersImpl =
    typeof global.Headers !== 'undefined'
      ? global.Headers
      : class HeadersPolyfill {
          constructor(init = {}) {
            this.map = new Map();
            Object.entries(init).forEach(([key, value]) => {
              this.set(key, value);
            });
          }

          get(name) {
            return this.map.get(name.toLowerCase()) ?? null;
          }

          set(name, value) {
            this.map.set(name.toLowerCase(), String(value));
          }

          has(name) {
            return this.map.has(name.toLowerCase());
          }

          append(name, value) {
            const existing = this.get(name);
            const nextValue = existing ? `${existing}, ${value}` : String(value);
            this.set(name, nextValue);
          }

          delete(name) {
            this.map.delete(name.toLowerCase());
          }

          forEach(callback, thisArg) {
            this.map.forEach((value, key) => {
              callback.call(thisArg, value, key, this);
            });
          }

          entries() {
            return this.map.entries();
          }
        };

  class ResponsePolyfill {
    constructor(body = null, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
      this.statusText = init.statusText ?? 'OK';
      this.headers = new HeadersImpl(init.headers || {});
    }

    json() {
      return Promise.resolve().then(() => {
        if (typeof this.body === 'string') {
          return JSON.parse(this.body);
        }
        return this.body;
      });
    }

    text() {
      return Promise.resolve().then(() => {
        if (typeof this.body === 'string') {
          return this.body;
        }
        return this.body != null ? JSON.stringify(this.body) : '';
      });
    }

    static json(body, init = {}) {
      const headers = { ...(init.headers || {}) };
      if (!Object.keys(headers).some(key => key.toLowerCase() === 'content-type')) {
        headers['content-type'] = 'application/json';
      }

      const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

      return new ResponsePolyfill(responseBody, { ...init, headers });
    }
  }

  if (typeof global.Headers === 'undefined') {
    global.Headers = HeadersImpl;
  }

  global.Response = ResponsePolyfill;
}
