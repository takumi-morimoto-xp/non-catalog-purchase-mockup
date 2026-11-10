// カタログ外購入 To-Be の画面の見本（静的）。動く仕組みは無い。
// 画面の一覧（左の帯）・案件の 10 段・見て回る順は、この file の 3 つの表だけに持つ（各 HTML には書かない）。

const PAGES = [
  { group: "はじめに", href: "index.html", title: "画面の一覧と見方", role: "" },
  { group: "依頼する人", href: "request.html", title: "依頼の入力", role: "依頼者" },
  { group: "依頼する人", href: "confirm.html", title: "申請の確認と確定", role: "① 依頼者" },
  { group: "承認する人", href: "approve.html", title: "承認の材料", role: "② 承認者" },
  { group: "承認する人", href: "reconcile.html", title: "突合の確認", role: "② 承認者" },
  { group: "承認する人", href: "exceptions.html", title: "例外の待ち行列", role: "② 承認者" },
  { group: "受け取る人", href: "receive.html", title: "受け取りの確認", role: "④ 受け取る人" },
  { group: "全体を見る", href: "cases.html", title: "案件の一覧と状態", role: "全員" },
  { group: "全体を見る", href: "case.html", title: "案件の詳細と記録", role: "全員" },
  { group: "全体を見る", href: "rules.html", title: "ルールと監査", role: "③ 規程・監査" },
];

// 案件の 10 段（to-be.md 表 4）。h は人が決める段。
const STAGES = [
  { n: 1, name: "受け付け", href: "request.html" },
  { n: 2, name: "見積", href: "confirm.html#quotes" },
  { n: 3, name: "申請の準備", href: "confirm.html#draft" },
  { n: 4, name: "申請の確定 ①", href: "confirm.html", h: true },
  { n: 5, name: "決裁への入力", href: "case.html#rpa" },
  { n: 6, name: "承認 ②", href: "approve.html", h: true },
  { n: 7, name: "発注", href: "case.html#order" },
  { n: 8, name: "納品と検収 ④", href: "receive.html", h: true },
  { n: 9, name: "請求と支払", href: "reconcile.html" },
  { n: 10, name: "格納と記録", href: "case.html#log" },
];

// 1 件の案件を受け付けから支払まで辿る順（下の「前へ・次へ」）。
const TOUR = [
  "index.html", "request.html", "confirm.html", "case.html", "approve.html",
  "receive.html", "reconcile.html", "cases.html", "exceptions.html", "rules.html",
];

const here = location.pathname.split("/").pop() || "index.html";
const page = PAGES.find((p) => p.href === here) || PAGES[0];

function el(tag, attrs = {}, html = "") {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  e.innerHTML = html;
  return e;
}

function renderSide() {
  const side = document.querySelector("[data-shell-sidebar]");
  if (!side) return;
  side.appendChild(el("div", { class: "product" },
    "<b>購入の依頼と決裁</b><span>カタログ外・10 万円以下（見本）</span>"));
  let group = "";
  PAGES.forEach((p) => {
    if (p.group !== group) {
      group = p.group;
      side.appendChild(el("div", { class: "group" }, group));
    }
    const a = el("a", { href: p.href }, `<span>${p.title}</span>${p.role ? `<span class="role">${p.role}</span>` : ""}`);
    if (p.href === here) a.setAttribute("aria-current", "page");
    side.appendChild(a);
  });
}

function renderTop() {
  const top = document.querySelector("[data-shell-header]");
  if (!top) return;
  const who = document.body.dataset.who || "見本 花子（総務部）";
  top.innerHTML = `<div class="crumb">購入の依頼と決裁 / <b>${page.title}</b></div>
    <div class="row"><span class="sample-note">見本です。動きません。データは作り物です</span>
    <div class="who"><span class="avatar">${who.slice(0, 1)}</span><span>${who}</span></div></div>`;
}

function renderFlow() {
  const box = document.querySelector("[data-flow]");
  if (!box) return;
  const now = Number(box.dataset.flow);
  box.classList.add("flow");
  STAGES.forEach((s) => {
    const cls = [s.n < now ? "done" : s.n === now ? "now" : "", s.h ? "h" : ""].join(" ").trim();
    box.appendChild(el("a", { href: s.href, class: cls, title: s.h ? "人が決める段" : "AI・RPA が進める段" },
      `<span class="n">段 ${s.n}${s.n < now ? "・済" : ""}</span><span>${s.name}</span>`));
  });
}

function renderPager() {
  const main = document.querySelector("main");
  const i = TOUR.indexOf(here);
  if (!main || i < 0) return;
  const title = (href) => (PAGES.find((p) => p.href === href) || {}).title;
  const nav = el("nav", { class: "pager", "aria-label": "見て回る順" });
  if (i > 0) nav.appendChild(el("a", { href: TOUR[i - 1] }, `<small>← 前の画面</small><span>${title(TOUR[i - 1])}</span>`));
  if (i < TOUR.length - 1) nav.appendChild(el("a", { href: TOUR[i + 1], class: "next" }, `<small>次の画面 →</small><span>${title(TOUR[i + 1])}</span>`));
  main.appendChild(nav);
}

// 1 操作のボタン: data-done の文を出して、決める枠を「済み」の見た目にする（記録はしない）。
function wireDecide() {
  const toast = el("div", { class: "toast", role: "status" });
  document.body.appendChild(toast);
  document.querySelectorAll("[data-done]").forEach((b) => {
    b.addEventListener("click", () => {
      const box = b.closest(".decide");
      if (box) {
        box.classList.add("done");
        const label = box.querySelector(".label");
        if (label) label.textContent = "済み（見本なので記録はされません）";
      }
      toast.textContent = b.dataset.done;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2400);
    });
  });
}

function wireTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const buttons = tabs.querySelectorAll("button[data-tab]");
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      document.querySelectorAll(`[data-panel^="${tabs.dataset.tabs}:"]`).forEach((p) => {
        p.hidden = p.dataset.panel !== `${tabs.dataset.tabs}:${b.dataset.tab}`;
      });
    }));
  });
}

renderSide();
renderTop();
renderFlow();
renderPager();
wireDecide();
wireTabs();
