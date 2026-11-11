/* Desenho e navegação do roteiro. Os dados (TRIP e PHOTOS) vêm de data.js. */

/* ===== UTILIDADES ===== */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const money = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const mapUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const commonsName = (f) => encodeURIComponent(f.replace(/ /g, "_"));
// Um tamanho só por foto: o mesmo endereço é usado na página e no download para offline.
const photoSrc = (f) => "https://commons.wikimedia.org/wiki/Special:FilePath/" + commonsName(f) + "?width=960";
const photoPage = (f) => "https://commons.wikimedia.org/wiki/File:" + commonsName(f);
const PHOTO_CACHE = "ba-fotos-v1";                     // mesmo nome usado em sw.js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dayIndex = (id) => TRIP.days.findIndex((d) => d.id === id);
const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue sem lembrar */ } }
};

/* ===== CARROSSEL DE FOTOS =====
   Faixa com rolagem horizontal e encaixe por foto: arrasta no celular,
   setas e bolinhas no computador. Foto que não carrega sai do carrossel. */
function carouselHtml(keys, label) {
  keys = (keys || []).filter((k) => PHOTOS[k]);
  if (!keys.length) return "";
  const many = keys.length > 1;
  return '<div class="carousel" data-carousel>' +
    '<div class="slides"' + (many ? ' tabindex="0" role="group" aria-roledescription="carrossel" aria-label="' + esc(label) + '"' : "") + ">" +
    keys.map((k, i) => {
      const p = PHOTOS[k];
      return '<figure class="slide" data-photo><img src="' + photoSrc(p.file) + '" alt="' + esc(p.alt) + '" decoding="async"' +
        (i ? ' loading="lazy"' : "") + '><a class="credit" href="' + photoPage(p.file) + '" target="_blank" rel="noopener">Foto: Wikimedia Commons ↗</a></figure>';
    }).join("") + "</div>" +
    (many ? '<button type="button" class="nav prev" data-step="-1" aria-label="Foto anterior">‹</button>' +
            '<button type="button" class="nav next" data-step="1" aria-label="Próxima foto">›</button>' +
            '<div class="dots"></div>' : "") +
    "</div>";
}

const slidesOf = (car) => car.querySelectorAll(".slide");
const currentSlide = (car) => { const t = car.querySelector(".slides"); return t.clientWidth ? Math.round(t.scrollLeft / t.clientWidth) : 0; };
function goSlide(car, i) {
  const t = car.querySelector(".slides"), n = slidesOf(car).length;
  if (!n) return;
  t.scrollTo({ left: ((i % n) + n) % n * t.clientWidth, behavior: reduceMotion.matches ? "auto" : "smooth" });
}
function syncDots(car) {
  const i = currentSlide(car);
  car.querySelectorAll(".dots button").forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
}
function refreshCarousel(car) {
  const n = slidesOf(car).length;
  car.classList.toggle("empty", n === 0);
  car.classList.toggle("single", n < 2);
  const dots = car.querySelector(".dots");
  if (dots) dots.innerHTML = n < 2 ? "" : Array.from({ length: n }, (_, k) =>
    '<button type="button" data-slide="' + k + '" aria-label="Foto ' + (k + 1) + " de " + n + '"></button>').join("");
  const hero = car.closest(".hero");
  if (hero) hero.classList.toggle("loaded", !!car.querySelector(".slide.loaded"));
  syncDots(car);
}
function wireCarousels(root) {
  root.querySelectorAll("[data-carousel]").forEach((car) => {
    const track = car.querySelector(".slides");
    let frame = 0;
    track.addEventListener("scroll", () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; syncDots(car); });
    }, { passive: true });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); goSlide(car, currentSlide(car) + (e.key === "ArrowRight" ? 1 : -1)); }
    });
    car.querySelectorAll(".slide > img").forEach((img) => {
      const slide = img.parentElement;
      const ok = () => { slide.classList.add("loaded"); refreshCarousel(car); };
      const bad = () => { slide.remove(); refreshCarousel(car); };
      if (img.complete && img.getAttribute("loading") !== "lazy") { if (img.naturalWidth) ok(); else bad(); return; }
      img.addEventListener("load", ok, { once: true });
      img.addEventListener("error", bad, { once: true });
    });
    refreshCarousel(car);
  });
}
document.addEventListener("click", (e) => {
  const nav = e.target.closest(".carousel .nav");
  if (nav) { const car = nav.closest(".carousel"); goSlide(car, currentSlide(car) + Number(nav.dataset.step)); return; }
  const dot = e.target.closest(".carousel .dots button");
  if (dot) goSlide(dot.closest(".carousel"), Number(dot.dataset.slide));
});
window.addEventListener("resize", () => document.querySelectorAll("[data-carousel]").forEach(syncDots));

// Capa: as fotos trocam sozinhas; param quando a pessoa mexe, quando a aba fica oculta ou com "reduzir movimento".
function autoplay(car, ms) {
  let pausedUntil = 0;
  const pause = () => { pausedUntil = Date.now() + 20000; };
  ["pointerdown", "wheel", "keydown", "focusin"].forEach((ev) => car.addEventListener(ev, pause, { passive: true }));
  setInterval(() => {
    if (reduceMotion.matches || document.hidden || Date.now() < pausedUntil || slidesOf(car).length < 2) return;
    if (car.getBoundingClientRect().bottom < 0) return;   // capa fora da tela
    goSlide(car, currentSlide(car) + 1);
  }, ms);
}

/* ===== ENTRADA SUAVE AO ROLAR ===== */
const revealer = ("IntersectionObserver" in window && !reduceMotion.matches)
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
    }), { rootMargin: "0px 0px -6% 0px" })
  : null;
if (revealer) document.documentElement.classList.add("anim");
function observeReveal(root) {
  root.querySelectorAll(".reveal:not(.in)").forEach((el) => { if (revealer) revealer.observe(el); else el.classList.add("in"); });
}

/* ===== HOJE, NO FUSO DE BUENOS AIRES ===== */
function nowBA() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TRIP.tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return { date: p.year + "-" + p.month + "-" + p.day, mins: Number(p.hour) * 60 + Number(p.minute) };
}
const dayNum = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const stopMins = (s) => { const [h, m] = s.t.split(":").map(Number); const v = h * 60 + m; return v < 300 ? v + 1440 : v; };
function tripState(now) {
  const first = dayNum(TRIP.days[0].date), last = dayNum(TRIP.days[TRIP.days.length - 1].date);
  let d = dayNum(now.date), mins = now.mins;
  if (mins < 300) { d -= 1; mins += 1440; }            // madrugada ainda conta como o dia anterior
  if (d < first) return { phase: "before", daysLeft: first - dayNum(now.date) };
  if (d > last) return { phase: "after" };
  const day = TRIP.days[d - first];
  return { phase: "during", day, next: day.stops.find((s) => stopMins(s) >= mins) || null };
}
const stateKey = (s) => s.phase + (s.day ? s.day.id : "") + (s.next ? s.next.t : "");

/* ===== MAPA DO DIA =====
   Leaflet com o mapa do OpenStreetMap (no tema escuro, um filtro de CSS escurece os blocos).
   As paradas com "ll" viram marcadores numerados, ligados por uma linha tracejada (reta, não é o trajeto). */
let dayMap = null, dayPins = [];

function mappedStops(d) {
  return d.stops.map((s, i) => ({ s, i })).filter((x) => x.s.ll && !x.s.minor);
}

function mapHtml(d) {
  const pts = mappedStops(d);
  if (!pts.length) return "";
  return '<details class="daymap-box reveal" id="daymap-box"' + (store.get("ba-map-open", true) ? " open" : "") + ">" +
    "<summary><span>Mapa do dia</span><small>" + pts.length + (pts.length === 1 ? " parada" : " paradas") + "</small></summary>" +
    '<div class="daymap" id="daymap" role="region" aria-label="Mapa das paradas do dia"></div>' +
    '<p class="fine">Linhas retas ligam as paradas na ordem do dia, não o trajeto real. Os trechos já vistos ficam guardados para usar sem internet.</p>' +
    "</details>";
}

function buildMap(d, nextStop) {
  if (dayMap) { dayMap.remove(); dayMap = null; }
  dayPins = [];
  const el = $("daymap");
  if (!el) return;
  // O OpenStreetMap recusa blocos pedidos sem página de origem (Referer), o que acontece com o arquivo aberto do disco.
  if (location.protocol === "file:") {
    el.innerHTML = '<p class="map-off">O mapa não abre com o arquivo aberto direto do computador: o OpenStreetMap exige que o site esteja publicado. ' +
      "Abra pelo GitHub Pages ou rode <code>python -m http.server</code> na pasta e acesse <code>http://localhost:8000</code>. " +
      "Enquanto isso, use os links do Google Maps em cada parada.</p>";
    return;
  }
  if (!window.L) { el.innerHTML = '<p class="map-off">O mapa precisa de internet para carregar na primeira vez.</p>'; return; }
  const pts = mappedStops(d);
  const color = getComputedStyle($("day")).getPropertyValue("--day").trim() || "#1b6fae";
  dayMap = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, crossOrigin: true, referrerPolicy: "strict-origin-when-cross-origin",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(dayMap);
  if (pts.length > 1) L.polyline(pts.map((x) => x.s.ll), { color, weight: 3, opacity: .85, dashArray: "2 7", lineCap: "round" }).addTo(dayMap);
  pts.forEach((x, k) => {
    const isNext = x.s === nextStop;
    const icon = L.divIcon({ className: "pin-wrap", html: '<span class="pin' + (isNext ? " next" : "") + '"><b>' + (k + 1) + "</b></span>",
      iconSize: [28, 28], iconAnchor: [14, 34], popupAnchor: [0, -32] });
    const m = L.marker(x.s.ll, { icon, title: x.s.t + " " + x.s.name, keyboard: true, zIndexOffset: isNext ? 1000 : 0 }).addTo(dayMap);
    m.bindPopup('<p class="pop-t">' + (k + 1) + " · " + x.s.t + '</p><p class="pop-n">' + esc(x.s.name) + "</p>" +
      '<button type="button" class="pop-go" data-goto="' + stopId(d, x.i) + '">Ver no roteiro ↓</button>');
    dayPins[x.i] = m;
  });
  if (pts.length === 1) dayMap.setView(pts[0].s.ll, 12);
  else dayMap.fitBounds(L.latLngBounds(pts.map((x) => x.s.ll)), { padding: [28, 28], maxZoom: 16 });
}

function showOnMap(i) {
  const box = $("daymap-box"), m = dayPins[i];
  if (!box || !m) return;
  box.open = true;
  box.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
  dayMap.invalidateSize();
  dayMap.setView(m.getLatLng(), Math.max(dayMap.getZoom(), 15));
  m.openPopup();
}

/* ===== DESENHO ===== */
let state = tripState(nowBA());
let currentDay = TRIP.days[0].id;
const stopId = (d, i) => "p-" + d.id + "-" + i;

function renderStatus() {
  let text;
  if (state.phase === "before") {
    text = state.daysLeft <= 0 ? "É hoje: pouso no Aeroparque às 12:40"
         : state.daysLeft === 1 ? "Falta 1 dia para o pouso no Aeroparque"
         : "Faltam " + state.daysLeft + " dias para o pouso no Aeroparque";
  } else if (state.phase === "during") {
    text = state.next ? "Hoje é " + state.day.wd.toLowerCase() + ". Próxima parada às " + state.next.t + ": " + state.next.name
                      : "Hoje é " + state.day.wd.toLowerCase() + ". Todas as paradas do dia já passaram";
  } else {
    text = "Viagem concluída";
  }
  $("status").textContent = text;
  // Letreiro de plataforma: dias que faltam, horário da próxima parada ou "fim".
  let chars, label;
  if (state.phase === "before") {
    chars = state.daysLeft <= 0 ? ["HOJE"] : String(state.daysLeft).padStart(2, "0").split("");
    label = state.daysLeft <= 0 ? "pouso às 12:40 no Aeroparque" : (state.daysLeft === 1 ? "dia" : "dias") + " para o embarque";
  } else if (state.phase === "during") {
    chars = state.next ? state.next.t.split("") : ["FIM"];
    label = state.next ? "próxima parada" : "dia encerrado";
  } else {
    chars = ["FIM"]; label = "até a próxima, Buenos Aires";
  }
  const key = chars.join("") + label;
  if ($("board").dataset.key !== key) {
    $("board").dataset.key = key;
    $("board").innerHTML = chars.map((c, i) => '<span class="flap' + (c.length > 1 ? " wide" : "") + '" style="--i:' + i + '">' + esc(c) + "</span>").join("");
    $("board-label").textContent = label;
  }
}

function renderDays() {
  $("days").innerHTML = TRIP.days.map((d, i) => {
    const today = state.phase === "during" && state.day.id === d.id;
    return '<a class="chip d' + (i + 1) + (today ? " today" : "") + '" href="#' + d.id + '" aria-current="' + (d.id === currentDay) + '"' +
      ' aria-label="' + esc(d.wd + " " + d.date.slice(8)) + '">' +
      '<span class="num">' + d.date.slice(8) + '</span><span class="wd">' + esc(d.abbr) + "</span></a>";
  }).join("");
}

function stopHtml(d, s, i, isNext, pin) {
  const meta = [];
  if (isNext) meta.push('<span class="tag next">próxima</span>');
  if (s.price) meta.push('<span class="price">' + money(s.price) + "</span>");
  (s.tags || []).forEach((t) => meta.push('<span class="tag">' + esc(t) + "</span>"));
  if (pin) meta.push('<button type="button" class="map map-jump" data-stop="' + i + '">No mapa <span class="pin-mini">' + pin + "</span></button>");
  if (s.map) meta.push('<a class="map" href="' + mapUrl(s.map) + '" target="_blank" rel="noopener">Google Maps ↗</a>');
  const shot = carouselHtml(s.photos, "Fotos: " + s.name);
  const inner = (shot ? '<div class="shot">' + shot + "</div>" : "") +
    "<h3>" + esc(s.name) + "</h3>" +
    (s.info ? "<p>" + esc(s.info) + "</p>" : "") +
    (s.list ? '<ul class="sub">' + s.list.map((x) => "<li><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</li>").join("") + "</ul>" : "") +
    (meta.length ? '<div class="meta">' + meta.join("") + "</div>" : "");
  return '<li class="stop' + (s.minor ? " minor" : "") + (isNext ? " next" : "") + '" id="' + stopId(d, i) + '">' +
    '<time class="t">' + s.t + '</time><span class="rail" aria-hidden="true"><span class="dot"></span></span>' +
    '<div class="body">' + (s.minor ? inner : '<div class="card reveal">' + inner + "</div>") + "</div></li>";
}

function dayStats(d) {
  const main = d.stops.filter((s) => !s.minor).length;
  const cost = d.stops.reduce((a, s) => a + (s.price || 0), 0);
  const first = d.stops[0].t, last = d.stops[d.stops.length - 1].t;
  return '<dl class="stats reveal">' +
    "<div><dt>Paradas</dt><dd>" + main + "</dd></div>" +
    "<div><dt>Horário</dt><dd>" + (first === last ? first : first + "<small>–</small>" + last) + "</dd></div>" +
    "<div><dt>Custos</dt><dd>" + (cost ? money(cost).replace(/,00$/, "") : "—") + "</dd></div></dl>";
}

function pagerLink(d, cls, dir) {
  const k = dayIndex(d.id) + 1;
  const badge = '<span class="mini-badge d' + k + '">' + d.date.slice(8) + "</span>";
  const lbl = '<span class="lbl"><small>' + (dir < 0 ? "← dia anterior" : "próximo dia →") + "</small>" + esc(d.title) + "</span>";
  return '<a class="' + cls + " d" + k + '" href="#' + d.id + '">' + (dir < 0 ? badge + lbl : lbl + badge) + "</a>";
}

function renderDay() {
  const i = dayIndex(currentDay), d = TRIP.days[i];
  const prev = TRIP.days[i - 1], next = TRIP.days[i + 1];
  const isToday = state.phase === "during" && state.day.id === d.id;
  const nextStop = isToday ? state.next : null;
  const pins = {};
  mappedStops(d).forEach((x, k) => { pins[x.i] = k + 1; });
  if (dayMap) { dayMap.remove(); dayMap = null; }
  $("day").className = "wrap d" + (i + 1);
  $("day").innerHTML =
    '<header class="day-head"><div class="banner hero">' + carouselHtml(d.photos, "Fotos do dia: " + d.title) +
    '<div class="txt"><span class="line-badge" aria-hidden="true">' + d.date.slice(8) + "</span>" +
    '<p class="eyebrow">' + esc(d.wd) + " · " + d.date.slice(8) + " de dezembro" +
    (d.badge ? ' <span class="badge">' + esc(d.badge) + "</span>" : "") + "</p>" +
    "<h2>" + esc(d.title) + "</h2></div></div>" + dayStats(d) +
    (d.note ? '<p class="note reveal">' + esc(d.note) + "</p>" : "") + "</header>" +
    mapHtml(d) +
    '<ol class="stops">' + d.stops.map((s, k) => stopHtml(d, s, k, s === nextStop, pins[k])).join("") + "</ol>" +
    (d.tip ? '<p class="tip reveal"><b>Dica</b>' + esc(d.tip) + "</p>" : "") +
    '<nav class="pager" aria-label="Outros dias">' +
    (prev ? pagerLink(prev, "pv", -1) : "") + (next ? pagerLink(next, "nx", 1) : "") +
    "</nav>";
  wireCarousels($("day"));
  observeReveal($("day"));
  const box = $("daymap-box");
  if (box) {
    if (box.open) buildMap(d, nextStop);
    box.addEventListener("toggle", () => {
      store.set("ba-map-open", box.open);
      if (box.open && !dayMap) buildMap(d, nextStop); else if (dayMap) dayMap.invalidateSize();
    });
  }
}

function renderComer() {
  const open = [];
  TRIP.days.forEach((d, i) => d.stops.forEach((s) => {
    if ((s.tags || []).includes("a definir")) open.push({ d, i, s });
  }));
  $("comer-body").innerHTML =
    '<header class="view-head"><p class="eyebrow">Por categoria</p><h2>Onde comer e beber</h2>' +
    '<p class="note">Três parrillas de peso em cinco noites: vale preencher as refeições em aberto com outra coisa.</p></header>' +
    '<nav class="cats" aria-label="Categorias">' + TRIP.places.map((c, k) =>
      '<button type="button" data-cat="cat-' + k + '">' + esc(c.cat) + "</button>").join("") +
    '<button type="button" data-cat="cat-open">Em aberto</button></nav>' +
    TRIP.places.map((c, k) =>
      '<section class="panel reveal" id="cat-' + k + '"><div class="panel-h"><h3>' + esc(c.cat) + '</h3><span class="count">' + c.items.length +
      '</span></div><ul class="rows">' + c.items.map((p) => {
        const di = p.day ? dayIndex(p.day) : -1;
        return '<li><div class="who"><strong>' + esc(p.name) + "</strong><span>" + esc(p.what) + "</span></div>" +
          '<div class="row-meta">' +
          (di >= 0 ? '<a class="when d' + (di + 1) + '" href="#' + p.day + '">' + esc(p.when) + "</a>" : '<span class="tag">' + esc(p.tag) + "</span>") +
          '<a class="map" href="' + mapUrl(p.name + ", Buenos Aires") + '" target="_blank" rel="noopener">Mapa ↗</a></div></li>';
      }).join("") + "</ul></section>").join("") +
    '<section class="panel open reveal" id="cat-open"><div class="panel-h"><h3>Ainda em aberto</h3><span class="count">' + open.length +
    '</span></div><ul class="rows">' + open.map((o) =>
      '<li><div class="who"><strong>' + esc(o.s.name) + "</strong><span>" + esc(o.s.info || "Sem lugar definido.") + "</span></div>" +
      '<div class="row-meta"><a class="when d' + (o.i + 1) + '" href="#' + o.d.id + '">' + esc(o.d.abbr + " " + o.s.t) + "</a></div></li>").join("") +
    "</ul></section>";
}

function renderAntes() {
  const done = store.get("ba-check", {});
  const costs = [];
  TRIP.days.forEach((d) => d.stops.forEach((s) => { if (s.price) costs.push({ d, s }); }));
  const total = costs.reduce((a, c) => a + c.s.price, 0);
  const nDone = TRIP.checklist.filter((c) => done[c.id]).length;
  $("antes-body").innerHTML =
    '<header class="view-head"><p class="eyebrow">Preparação</p><h2>Antes de ir</h2>' +
    '<p class="note">Segunda 07/12 é dia não laborável e terça 08/12 é feriado: a cidade estará cheia de domingo a terça, então vale deixar tudo reservado.</p></header>' +
    '<section class="pass reveal" aria-label="Voos e hotel"><div class="pass-top">' +
    '<div class="leg"><span class="lbl">Chegada</span><span class="code">AEP</span><span class="tm">dom 06/12 · 12:40</span></div>' +
    '<div class="flight" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg></div>' +
    '<div class="leg r"><span class="lbl">Volta</span><span class="code">EZE</span><span class="tm">sáb 12/12 · 14:00</span></div></div>' +
    '<div class="pass-foot"><div><span>Hotel</span><b>Pleno Madero</b></div><div><span>Check-in</span><b>15h</b></div>' +
    "<div><span>Último dia</span><b>Sair às 10h</b></div></div></section>" +
    '<section class="panel reveal" id="app-block"><div class="panel-h"><h3>App no celular</h3></div>' +
    '<p class="note" id="app-state">Instale o roteiro na tela inicial para abrir como app, mesmo sem internet.</p>' +
    '<div class="actions">' +
    '<button type="button" class="btn" id="install" hidden>Instalar app</button>' +
    '<button type="button" class="btn ghost" id="offline">Baixar fotos para usar offline</button></div>' +
    '<p class="fine" id="ios-hint" hidden>No iPhone: abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>' +
    '<p class="fine" id="offline-state" aria-live="polite">O roteiro já fica guardado depois da primeira visita. As fotos e os mapas ficam guardados conforme você os abre; o botão acima baixa todas as fotos de uma vez (cerca de ' +
    Object.keys(PHOTOS).length + " fotos). Para os mapas, abra o mapa de cada dia uma vez com Wi-Fi.</p></section>" +
    '<section class="panel reveal"><div class="panel-h"><h3>Para resolver</h3><span class="count" id="check-count">' + nDone + " de " + TRIP.checklist.length + "</span></div>" +
    '<div class="progress" aria-hidden="true"><span id="check-bar" style="--p:' + Math.round(100 * nDone / TRIP.checklist.length) + '%"></span></div>' +
    '<ul class="check">' + TRIP.checklist.map((c) =>
      '<li><input type="checkbox" id="' + c.id + '"' + (done[c.id] ? " checked" : "") + '><label for="' + c.id + '">' + esc(c.text) +
      (c.link ? ' <small><a href="' + c.link[1] + '" target="_blank" rel="noopener">' + esc(c.link[0]) + " ↗</a></small>" : "") +
      "</label></li>").join("") + "</ul>" +
    '<p class="fine">As marcações ficam salvas só neste aparelho.</p></section>' +
    '<section class="panel reveal"><div class="panel-h"><h3>Custos anotados</h3><span class="count">' + costs.length + " itens</span></div>" +
    '<div class="total"><strong>' + money(total) + '</strong><span class="fine">soma, sem conversão de moeda</span></div>' +
    '<div class="costs-scroll"><table class="costs">' +
    "<thead><tr><th>Dia</th><th>Item</th><th>Valor</th></tr></thead><tbody>" + costs.map((c) =>
      '<tr><td><span class="daydot d' + (dayIndex(c.d.id) + 1) + '"></span>' + esc(c.d.abbr + " " + c.d.date.slice(8)) + "</td><td>" + esc(c.s.name) + "</td><td>" + money(c.s.price) + "</td></tr>").join("") +
    "</tbody></table></div></section>" +
    '<section class="panel reveal"><div class="panel-h"><h3>Fotos e mapas</h3></div><p class="fine">Fotos da Wikimedia Commons, de licença livre. O autor e a licença de cada uma estão na página do arquivo. Mapas © colaboradores do OpenStreetMap.</p>' +
    '<ul class="credits">' + Object.keys(PHOTOS).map((k) =>
      '<li><a href="' + photoPage(PHOTOS[k].file) + '" target="_blank" rel="noopener">' + esc(PHOTOS[k].alt) + " ↗</a></li>").join("") +
    "</ul></section>";
}

/* ===== APP INSTALÁVEL E OFFLINE ===== */
let installEvent = null;
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function renderAppState() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  $("install").hidden = !installEvent || standalone();
  $("ios-hint").hidden = !isIOS || standalone();
  if (standalone()) $("app-state").textContent = "Você está usando o roteiro como app instalado.";
}
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; renderAppState(); });
window.addEventListener("appinstalled", () => { installEvent = null; renderAppState(); });

async function saveOffline() {
  const btn = $("offline"), out = $("offline-state");
  if (!("caches" in window)) { out.textContent = "Este navegador não permite guardar arquivos para usar offline."; return; }
  btn.disabled = true;
  const urls = Object.values(PHOTOS).map((p) => photoSrc(p.file));
  const cache = await caches.open(PHOTO_CACHE);
  let done = 0, failed = 0, next = 0;
  const step = async () => {
    while (next < urls.length) {
      const u = urls[next++];
      try {
        if (!(await cache.match(u))) await cache.put(u, await fetch(u, { mode: "no-cors" }));
        done++;
      } catch (e) { failed++; }
      out.textContent = "Baixando fotos: " + (done + failed) + " de " + urls.length + "…";
    }
  };
  await Promise.all([step(), step(), step(), step()]);
  out.textContent = failed ? done + " fotos guardadas; " + failed + " falharam. Tente de novo com uma conexão melhor."
                           : "Pronto: as " + done + " fotos estão guardadas neste aparelho.";
  btn.disabled = false;
}

/* ===== NAVEGAÇÃO ===== */
function show(view) {
  $("view-roteiro").hidden = view !== "roteiro";
  $("view-comer").hidden = view !== "comer";
  $("view-antes").hidden = view !== "antes";
  ["roteiro", "comer", "antes"].forEach((v) => {
    if (v === view) $("tab-" + v).setAttribute("aria-current", "page"); else $("tab-" + v).removeAttribute("aria-current");
  });
  $("tab-roteiro").setAttribute("href", "#" + currentDay);
}

function route(fromUser) {
  const h = location.hash.slice(1);
  if (h === "comer" || h === "antes") { show(h); if (fromUser) window.scrollTo(0, 0); return; }
  if (dayIndex(h) >= 0) { currentDay = h; store.set("ba-day", h); }
  show("roteiro"); renderDays(); renderDay();           // visível antes de desenhar, para o mapa medir o tamanho certo
  if (fromUser) {
    const top = $("view-roteiro").getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo(0, top);
  }
}

function start() {
  const saved = store.get("ba-day", null);
  if (state.phase === "during") currentDay = state.day.id;
  else if (dayIndex(saved) >= 0) currentDay = saved;
  $("mast").insertAdjacentHTML("afterbegin", carouselHtml(["obelisco", "caminito2", "puente", "colon2", "rosedal"], "Fotos de Buenos Aires"));
  wireCarousels($("mast")); autoplay($("mast").querySelector("[data-carousel]"), 6500);
  renderStatus(); renderComer(); renderAntes(); renderAppState(); route(false);
  observeReveal($("comer-body")); observeReveal($("antes-body"));
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* sem service worker: o site funciona, só não fica offline */ });
  }
}

window.addEventListener("hashchange", () => route(true));
$("antes-body").addEventListener("change", (e) => {
  if (e.target.type !== "checkbox") return;
  const done = store.get("ba-check", {});
  done[e.target.id] = e.target.checked;
  store.set("ba-check", done);
  const n = TRIP.checklist.filter((c) => done[c.id]).length;
  $("check-count").textContent = n + " de " + TRIP.checklist.length;
  $("check-bar").style.setProperty("--p", Math.round(100 * n / TRIP.checklist.length) + "%");
});
$("comer-body").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (b) $(b.dataset.cat).scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
});
$("cue").addEventListener("click", () => {
  $("main").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
});
$("antes-body").addEventListener("click", (e) => {
  if (e.target.id === "offline") saveOffline();
  if (e.target.id === "install" && installEvent) {
    installEvent.prompt();
    installEvent.userChoice.finally(() => { installEvent = null; renderAppState(); });
  }
});
$("day").addEventListener("click", (e) => {
  const jump = e.target.closest(".map-jump");
  if (jump) { showOnMap(Number(jump.dataset.stop)); return; }
});
document.addEventListener("click", (e) => {                // botão dentro do balão do mapa
  const go = e.target.closest(".pop-go");
  if (!go) return;
  const el = $(go.dataset.goto);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
});
let lastKey = stateKey(state);
setInterval(() => {                                    // mantém "próxima parada" em dia durante a viagem
  state = tripState(nowBA()); renderStatus();
  const key = stateKey(state);
  if (key !== lastKey && !$("view-roteiro").hidden) { renderDays(); renderDay(); }  // só redesenha quando a próxima parada muda
  lastKey = key;
}, 60000);

start();
