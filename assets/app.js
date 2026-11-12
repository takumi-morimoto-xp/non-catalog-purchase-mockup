// カタログ外購入 To-Be の画面の見本（静的）。動く仕組みは無い。
// 画面の題・案件の 10 段・見本の順・役ごとの画面は、この file の 4 つの表だけに持つ（各 HTML には書かない）。

const PAGES = {
  "index.html": "入口",
  "guide.html": "全画面の一覧と見方",
  "request.html": "依頼",
  "confirm.html": "申請の確定",
  "case.html": "案件の記録",
  "approve.html": "購入の承認",
  "receive.html": "受け取り",
  "pay.html": "支払の承認",
  "reconcile.html": "請求の差",
  "exceptions.html": "例外",
  "cases.html": "案件の一覧",
  "rules.html": "任せる範囲",
};

// 案件の 10 段（to-be.md 表 4）。by は担い手（人 か 自動）。
const STAGES = [
  { n: 1, name: "依頼", by: "人", href: "request.html" },
  { n: 2, name: "見積", by: "自動", href: "confirm.html#quotes" },
  { n: 3, name: "申請の準備", by: "自動", href: "confirm.html#draft" },
  { n: 4, name: "申請の確定", by: "人", href: "confirm.html" },
  { n: 5, name: "決裁への入力", by: "自動", href: "case.html" },
  { n: 6, name: "承認", by: "人", href: "approve.html" },
  { n: 7, name: "発注", by: "自動", href: "case.html#log" },
  { n: 8, name: "受け取り", by: "人", href: "receive.html" },
  { n: 9, name: "支払", by: "人", href: "pay.html" },
  { n: 10, name: "格納", by: "自動", href: "case.html#log" },
];

// 1 件の案件（R-0142）を受け付けから支払まで辿る順と、そのあとに見る画面（下の「前へ・次へ」）。
const TOUR = [
  "index.html", "request.html", "confirm.html", "case.html", "approve.html", "receive.html", "pay.html",
  "reconcile.html", "exceptions.html", "cases.html", "rules.html", "guide.html",
];

// 左の帯に出す、役ごとの画面。いまの画面が入る役の画面だけを出す（関係の無い役の画面は出さない）。
const ROLES = [
  { name: "依頼する人", pages: ["request.html", "confirm.html", "case.html", "receive.html"] },
  { name: "承認する人", pages: ["approve.html", "pay.html", "reconcile.html", "exceptions.html"] },
  { name: "総務の人", pages: ["cases.html", "rules.html"] },
];

const here = location.pathname.split("/").pop() || "index.html";

function el(tag, attrs = {}, html = "") {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  e.innerHTML = html;
  return e;
}

function renderTop() {
  const top = document.querySelector("[data-shell-header]");
  if (!top) return;
  const who = document.body.dataset.who || "";
  top.innerHTML = `<a class="home" href="index.html">購入の依頼と決裁</a>
    <div class="row"><span class="sample-note">見本・データは作り物</span>
    ${who ? `<div class="who"><span class="avatar">${who.slice(0, 1)}</span><span>${who}</span></div>` : ""}</div>`;
}

// 左の帯: 入口・いまの役の画面・見方。上の帯の次に置く（外枠の grid の side）。
function renderSide() {
  const top = document.querySelector("[data-shell-header]");
  if (!top) return;
  const link = (href) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${PAGES[href]}</a>`;
  const role = ROLES.find((r) => r.pages.includes(here));
  const nav = el("nav", { class: "side", "aria-label": "画面の移動" },
    link("index.html")
    + (role ? `<h2>${role.name}</h2>${role.pages.map(link).join("")}` : "")
    + `<div class="foot">${link("guide.html")}</div>`);
  top.after(nav);
}

// 段の 1 行: 「いま 6/10 承認・次は 発注（自動）」。押すと 10 段が開く。
function renderStage() {
  const box = document.querySelector("[data-stage]");
  if (!box) return;
  const now = Number(box.dataset.stage);
  const cur = STAGES[now - 1];
  const next = STAGES[now];
  const d = el("details", { class: "stage" });
  d.appendChild(el("summary", {},
    `いま <b>${now}/10 ${cur.name}</b>${next ? `・次は ${next.name}（${next.by}）` : ""}`));
  const ol = el("ol");
  STAGES.forEach((s) => {
    const cls = s.n < now ? "done" : s.n === now ? "now" : "";
    ol.appendChild(el("li", { class: cls }, `<a href="${s.href}"><span>${s.n}・${s.by}</span>${s.name}</a>`));
  });
  d.appendChild(ol);
  box.replaceWith(d);
}

function renderPager() {
  const main = document.querySelector("main");
  const i = TOUR.indexOf(here);
  if (!main || i < 0) return;
  const nav = el("nav", { class: "pager", "aria-label": "見本の順" });
  if (i > 0) nav.appendChild(el("a", { href: TOUR[i - 1] }, `← ${PAGES[TOUR[i - 1]]}`));
  if (i < TOUR.length - 1) nav.appendChild(el("a", { href: TOUR[i + 1], class: "next" }, `見本の次: ${PAGES[TOUR[i + 1]]} →`));
  main.appendChild(nav);
}

// ボタン: data-done の文を出し、決める枠を「済み」の見た目にする（記録はしない）。
function wireDecide() {
  const toast = el("div", { class: "toast", role: "status" });
  document.body.appendChild(toast);
  document.querySelectorAll("[data-done]").forEach((b) => {
    b.addEventListener("click", () => {
      const box = b.closest(".decide");
      if (box) box.classList.add("done");
      toast.textContent = b.dataset.done;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2400);
    });
  });
}

// #anchor が畳んだ枠の中にあるときは開く（段の 1 行や記録の link から来たとき）。
function openTarget() {
  const id = location.hash.slice(1);
  const t = id && document.getElementById(id);
  if (!t) return;
  for (let d = t.closest("details"); d; d = d.parentElement.closest("details")) d.open = true;
  t.scrollIntoView();
}

renderTop();
renderSide();
renderStage();
renderPager();
wireDecide();
openTarget();
