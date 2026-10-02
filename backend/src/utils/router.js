// Roteador mínimo: converte "/api/sessions/:id" em regex e extrai os parâmetros.
export class Router {
  #routes = [];

  add(method, pattern, handler) {
    const keys = [];
    const source = pattern.replace(/:([A-Za-z]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    this.#routes.push({ method, regex: new RegExp(`^${source}/?$`), keys, handler });
  }

  get(pattern, handler) { this.add('GET', pattern, handler); }
  post(pattern, handler) { this.add('POST', pattern, handler); }
  put(pattern, handler) { this.add('PUT', pattern, handler); }
  delete(pattern, handler) { this.add('DELETE', pattern, handler); }

  match(method, pathname) {
    for (const route of this.#routes) {
      if (route.method !== method) continue;
      const found = route.regex.exec(pathname);
      if (!found) continue;

      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(found[i + 1]);
      });
      return { handler: route.handler, params };
    }
    return null;
  }
}
