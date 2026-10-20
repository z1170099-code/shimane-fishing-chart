// 島根半島沖 釣り場海図: オフライン用サービスワーカー（09_build_pwa.py が生成）
const VERSION = "81db9191099f";
const CACHE = "chart-" + VERSION;
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("chart-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // 端末に保存した版をすぐ返し、電波があれば裏で最新版を取りに行く
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = (await c.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? await c.match("./index.html") : undefined);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => undefined);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || new Response("オフラインのため読み込めませんでした", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }));
  } else if (/^fonts[.](googleapis|gstatic)[.]com$/.test(url.hostname)) {
    // フォントは一度取れたら保存しておく（取れなくても代わりの字体で表示される）
    e.respondWith(caches.open("fonts").then(async c => (await c.match(req)) ||
      fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => new Response("", { status: 504 }))));
  }
});
