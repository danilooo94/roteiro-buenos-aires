/* Desenho e navegação do roteiro. Os dados (TRIP e PHOTOS) vêm de data.js. */

/* ===== UTILIDADES ===== */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const money = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const mapUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const commonsName = (f) => encodeURIComponent(f.replace(/ /g, "_"));
const photoSrc = (f, w) => "https://commons.wikimedia.org/wiki/Special:FilePath/" + commonsName(f) + "?width=" + w;
const photoPage = (f) => "https://commons.wikimedia.org/wiki/File:" + commonsName(f);
function photoHtml(key, small) {
  const p = PHOTOS[key];
  if (!p) return "";
  const a = small ? 500 : 960, b = small ? 960 : 1280;
  return '<img src="' + photoSrc(p.file, a) + '" srcset="' + photoSrc(p.file, a) + " " + a + "w, " + photoSrc(p.file, b) + " " + b + 'w"' +
    ' sizes="(min-width: 44rem) 42rem, 100vw" alt="' + esc(p.alt) + '" decoding="async">' +
    '<a class="credit" href="' + photoPage(p.file) + '" target="_blank" rel="noopener">Foto: Wikimedia Commons ↗</a>';
}
function wirePhotos(root) {
  root.querySelectorAll("[data-photo] > img").forEach((img) => {
    const box = img.parentElement;
    const ok = () => box.classList.add("loaded");
    const bad = () => { box.classList.add("failed"); img.remove(); };
    if (img.complete) { if (img.naturalWidth) ok(); else bad(); return; }
    img.addEventListener("load", ok, { once: true });
    img.addEventListener("error", bad, { once: true });
  });
}
const dayIndex = (id) => TRIP.days.findIndex((d) => d.id === id);
const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: segue sem lembrar */ } }
};

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

/* ===== DESENHO ===== */
let state = tripState(nowBA());
let currentDay = TRIP.days[0].id;

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
}

function renderDays() {
  $("days").innerHTML = TRIP.days.map((d, i) => {
    const today = state.phase === "during" && state.day.id === d.id;
    return '<a class="chip d' + (i + 1) + (today ? " today" : "") + '" href="#' + d.id + '" aria-current="' + (d.id === currentDay) + '"' +
      ' aria-label="' + esc(d.wd + " " + d.date.slice(8)) + '">' +
      '<span class="wd">' + esc(d.abbr) + '</span><span class="num">' + d.date.slice(8) + "</span></a>";
  }).join("");
}

function stopHtml(s, isNext) {
  const meta = [];
  if (isNext) meta.push('<span class="tag next">próxima</span>');
  if (s.price) meta.push('<span class="price">' + money(s.price) + "</span>");
  (s.tags || []).forEach((t) => meta.push('<span class="tag">' + esc(t) + "</span>"));
  if (s.map) meta.push('<a class="map" href="' + mapUrl(s.map) + '" target="_blank" rel="noopener">Mapa ↗</a>');
  return '<li class="stop' + (s.minor ? " minor" : "") + (isNext ? " next" : "") + '">' +
    '<time class="t">' + s.t + '</time><span class="rail" aria-hidden="true"><span class="dot"></span></span>' +
    '<div class="body"><h3>' + esc(s.name) + "</h3>" +
    (s.info ? "<p>" + esc(s.info) + "</p>" : "") +
    (s.list ? '<ul class="sub">' + s.list.map((x) => "<li><b>" + esc(x[0]) + "</b> · " + esc(x[1]) + "</li>").join("") + "</ul>" : "") +
    (s.photo ? '<div class="shot" data-photo>' + photoHtml(s.photo, true) + "</div>" : "") +
    (meta.length ? '<div class="meta">' + meta.join("") + "</div>" : "") +
    "</div></li>";
}

function renderDay() {
  const i = dayIndex(currentDay), d = TRIP.days[i];
  const prev = TRIP.days[i - 1], next = TRIP.days[i + 1];
  const isToday = state.phase === "during" && state.day.id === d.id;
  $("day").className = "wrap d" + (i + 1);
  $("day").innerHTML =
    '<header class="day-head"><div class="banner" data-photo>' + photoHtml(d.photo, false) +
    '<div class="txt"><p class="eyebrow">' + esc(d.wd) + " · " + d.date.slice(8) + "/12" +
    (d.badge ? ' <span class="badge">' + esc(d.badge) + "</span>" : "") + "</p>" +
    "<h2>" + esc(d.title) + "</h2></div></div>" + (d.note ? '<p class="note">' + esc(d.note) + "</p>" : "") + "</header>" +
    '<ol class="stops">' + d.stops.map((s) => stopHtml(s, isToday && state.next === s)).join("") + "</ol>" +
    (d.tip ? '<p class="tip">' + esc(d.tip) + "</p>" : "") +
    '<nav class="pager" aria-label="Outros dias">' +
    (prev ? '<a href="#' + prev.id + '">← ' + esc(prev.wd) + " <span>" + prev.date.slice(8) + "/12</span></a>" : "<span></span>") +
    (next ? '<a href="#' + next.id + '">' + esc(next.wd) + " <span>" + next.date.slice(8) + "/12</span> →</a>" : "<span></span>") +
    "</nav>";
  wirePhotos($("day"));
}

function renderComer() {
  const open = [];
  TRIP.days.forEach((d, i) => d.stops.forEach((s) => {
    if ((s.tags || []).includes("a definir")) open.push({ d, i, s });
  }));
  $("comer").innerHTML =
    '<header class="view-head"><p class="eyebrow">Por categoria</p><h2>Onde comer e beber</h2>' +
    '<p class="note">Três parrillas de peso em cinco noites: vale preencher as refeições em aberto com outra coisa.</p></header>' +
    TRIP.places.map((c) =>
      '<section class="block"><h3>' + esc(c.cat) + '</h3><ul class="rows">' + c.items.map((p) => {
        const di = p.day ? dayIndex(p.day) : -1;
        return '<li><div class="who"><strong>' + esc(p.name) + "</strong><span>" + esc(p.what) + "</span></div>" +
          '<div class="row-meta">' +
          (di >= 0 ? '<a class="when d' + (di + 1) + '" href="#' + p.day + '">' + esc(p.when) + "</a>" : '<span class="tag">' + esc(p.tag) + "</span>") +
          '<a class="map" href="' + mapUrl(p.name + ", Buenos Aires") + '" target="_blank" rel="noopener">Mapa ↗</a></div></li>';
      }).join("") + "</ul></section>").join("") +
    '<section class="block"><h3>Ainda em aberto</h3><ul class="rows">' + open.map((o) =>
      '<li><div class="who"><strong>' + esc(o.s.name) + "</strong><span>" + esc(o.s.info || "Sem lugar definido.") + "</span></div>" +
      '<div class="row-meta"><a class="when d' + (o.i + 1) + '" href="#' + o.d.id + '">' + esc(o.d.abbr + " " + o.s.t) + "</a></div></li>").join("") +
    "</ul></section>";
}

function renderAntes() {
  const done = store.get("ba-check", {});
  const costs = [];
  TRIP.days.forEach((d) => d.stops.forEach((s) => { if (s.price) costs.push({ d, s }); }));
  const total = costs.reduce((a, c) => a + c.s.price, 0);
  $("antes").innerHTML =
    '<header class="view-head"><p class="eyebrow">Preparação</p><h2>Antes de ir</h2>' +
    '<p class="note">Segunda 07/12 é dia não laborável e terça 08/12 é feriado: a cidade estará cheia de domingo a terça, então vale deixar tudo reservado.</p></header>' +
    '<section class="block"><h3>Voos e hotel</h3><dl class="facts">' +
    "<dt>Chegada</dt><dd>Dom 06/12, 12:40, Aeroparque (AEP)</dd>" +
    "<dt>Hotel</dt><dd>Pleno Madero. Check-in às 15h</dd>" +
    "<dt>Saída</dt><dd>Sáb 12/12, 14:00, Ezeiza (EZE). Sair do hotel às 10h</dd></dl></section>" +
    '<section class="block"><h3>Para resolver</h3><ul class="check">' + TRIP.checklist.map((c) =>
      '<li><input type="checkbox" id="' + c.id + '"' + (done[c.id] ? " checked" : "") + '><label for="' + c.id + '">' + esc(c.text) +
      (c.link ? ' <small><a href="' + c.link[1] + '" target="_blank" rel="noopener">' + esc(c.link[0]) + " ↗</a></small>" : "") +
      "</label></li>").join("") + "</ul>" +
    '<p class="fine">As marcações ficam salvas só neste aparelho.</p></section>' +
    '<section class="block"><h3>Custos anotados</h3><div class="costs-scroll"><table class="costs">' +
    "<thead><tr><th>Dia</th><th>Item</th><th>Valor</th></tr></thead><tbody>" + costs.map((c) =>
      "<tr><td>" + esc(c.d.abbr + " " + c.d.date.slice(8)) + "</td><td>" + esc(c.s.name) + "</td><td>" + money(c.s.price) + "</td></tr>").join("") +
    '</tbody><tfoot><tr><td colspan="2">Soma</td><td>' + money(total) + "</td></tr></tfoot></table></div>" +
    '<p class="fine">Valores como estão no roteiro, sem conversão de moeda.</p></section>' +
    '<section class="block"><h3>Fotos</h3><p class="fine">Fotos da Wikimedia Commons, de licença livre. O autor e a licença de cada uma estão na página do arquivo.</p>' +
    '<ul class="rows">' + Object.keys(PHOTOS).map((k) =>
      '<li><div class="who"><strong>' + esc(PHOTOS[k].alt) + '</strong></div><div class="row-meta">' +
      '<a class="map" href="' + photoPage(PHOTOS[k].file) + '" target="_blank" rel="noopener">Página da foto ↗</a></div></li>').join("") +
    "</ul></section>";
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
  renderDays(); renderDay(); show("roteiro");
  if (fromUser) {
    const top = $("view-roteiro").getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo(0, top);
  }
}

function start() {
  const saved = store.get("ba-day", null);
  if (state.phase === "during") currentDay = state.day.id;
  else if (dayIndex(saved) >= 0) currentDay = saved;
  $("mast").insertAdjacentHTML("afterbegin", photoHtml("obelisco", false)); wirePhotos($("mast"));
  renderStatus(); renderComer(); renderAntes(); route(false);
}

window.addEventListener("hashchange", () => route(true));
$("antes").addEventListener("change", (e) => {
  if (e.target.type !== "checkbox") return;
  const done = store.get("ba-check", {});
  done[e.target.id] = e.target.checked;
  store.set("ba-check", done);
});
setInterval(() => {                                    // mantém "próxima parada" em dia durante a viagem
  state = tripState(nowBA()); renderStatus();
  if (state.phase === "during" && !$("view-roteiro").hidden) { renderDays(); renderDay(); }
}, 60000);

start();
