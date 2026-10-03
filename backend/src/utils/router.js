// Roteador mínimo: converte "/api/sessions/:id" em regex e extrai os parâmetros.
// `public: true` marca uma rota que não exige login; `skipProfileCheck: true` marca uma
// rota protegida que não exige o perfil da instituição completo (ver server.js) — toda
// rota protegida exige as duas coisas por padrão.
export class Router {
  #routes = [];

  add(method, pattern, handler, { public: isPublic = false, skipProfileCheck = false } = {}) {
    const keys = [];
    const source = pattern.replace(/:([A-Za-z]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    this.#routes.push({
      method,
      regex: new RegExp(`^${source}/?$`),
      keys,
      handler,
      public: isPublic,
      skipProfileCheck,
    });
  }

  get(pattern, handler, options) { this.add('GET', pattern, handler, options); }
  post(pattern, handler, options) { this.add('POST', pattern, handler, options); }
  put(pattern, handler, options) { this.add('PUT', pattern, handler, options); }
  delete(pattern, handler, options) { this.add('DELETE', pattern, handler, options); }

  match(method, pathname) {
    for (const route of this.#routes) {
      if (route.method !== method) continue;
      const found = route.regex.exec(pathname);
      if (!found) continue;

      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(found[i + 1]);
      });
      return { handler: route.handler, params, public: route.public, skipProfileCheck: route.skipProfileCheck };
    }
    return null;
  }
}
