/**
 * Kitchen back office. Client-side gate only — not server auth.
 */
(function () {
  const K = window.KitchenStore;
  if (!K) return;

  const GATE_USER = "iffatmirza";
  const GATE_PASS = "Jeddah@1985";
  const AUTH_KEY = "rasa-kitchen-auth";

  const els = {
    gate: document.getElementById("gate"),
    app: document.getElementById("app"),
    view: document.getElementById("view"),
    modal: document.getElementById("modal"),
    modalBody: document.getElementById("modal-body"),
    toasts: document.getElementById("toasts"),
    loginForm: document.getElementById("login-form"),
    user: document.getElementById("login-user"),
    pass: document.getElementById("login-pass"),
    loginError: document.getElementById("login-error"),
  };

  let view = "dashboard";
  let period = "today";
  let orderFilter = "all";
  let draftQty = emptyQty();

  function emptyQty() {
    const q = {};
    Object.keys(K.MENU).forEach((id) => {
      q[id] = 0;
    });
    return q;
  }

  function rm(n) {
    return "RM " + Number(n || 0).toFixed(2);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = msg;
    els.toasts.appendChild(node);
    setTimeout(() => node.remove(), 2800);
  }

  function isAuthed() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "ok";
    } catch {
      return false;
    }
  }

  function setAuthed(on) {
    try {
      if (on) sessionStorage.setItem(AUTH_KEY, "ok");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }

  function showApp() {
    els.gate.style.display = "none";
    els.app.classList.add("is-open");
    render();
  }

  function showGate() {
    els.gate.style.display = "";
    els.app.classList.remove("is-open");
    els.pass.value = "";
    els.loginError.textContent = "";
    closeModal();
  }

  function when(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-MY", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function payLabel(method) {
    if (method === "cash") return "Cash";
    if (method === "whatsapp") return "WhatsApp";
    return "DuitNow";
  }

  function sourceLabel(src) {
    return src === "manual" ? "Walk-in / phone" : "Website";
  }

  function render() {
    document.querySelectorAll(".nav [data-view]").forEach((btn) => {
      btn.setAttribute("aria-current", btn.dataset.view === view ? "page" : "false");
    });
    if (view === "dashboard") els.view.innerHTML = renderDashboard();
    else if (view === "orders") els.view.innerHTML = renderOrders();
    else if (view === "inventory") els.view.innerHTML = renderInventory();
    else if (view === "costing") els.view.innerHTML = renderCosting();
    else els.view.innerHTML = renderPnl();
  }

  function periodToggle() {
    return `
      <div class="seg" role="group" aria-label="Period">
        <button type="button" class="tap" data-period="today" aria-pressed="${period === "today"}">Today</button>
        <button type="button" class="tap" data-period="all" aria-pressed="${period === "all"}">All time</button>
      </div>`;
  }

  function renderDashboard() {
    const d = K.dashboard(period);
    const maxQty = Math.max(1, ...Object.values(d.dishQty));
    const bars = Object.keys(K.MENU)
      .map((id) => {
        const qty = d.dishQty[id] || 0;
        const pct = Math.round((qty / maxQty) * 100);
        return `<div class="bar-row">
          <span>${escapeHtml(K.MENU[id].name)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span>${qty}</span>
        </div>`;
      })
      .join("");
    const alerts =
      d.alerts.length === 0
        ? `<p class="empty">No low-stock alerts.</p>`
        : `<ul class="alert-list">${d.alerts
            .map(
              (a) =>
                `<li><span>${escapeHtml(a.name)}</span><span class="low">${K.fmtQty(a.onHand)} ${a.unit} · reorder ${K.fmtQty(a.reorderLevel)}</span></li>`
            )
            .join("")}</ul>`;
    return `
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>${period === "today" ? "Today’s kitchen board" : "All recorded orders on this device"}</p>
        </div>
        ${periodToggle()}
      </div>
      <dl class="kpis">
        <div class="kpi"><dt>Orders</dt><dd>${d.orderCount}</dd></div>
        <div class="kpi"><dt>Revenue</dt><dd>${rm(d.revenue)}</dd></div>
        <div class="kpi"><dt>Est. COGS</dt><dd>${rm(d.cogs)}</dd></div>
        <div class="kpi"><dt>Gross profit</dt><dd>${rm(d.gross)}</dd></div>
      </dl>
      <div class="panel">
        <h2>Plates sold</h2>
        <div class="bars">${bars}</div>
      </div>
      <div class="panel">
        <h2>Low stock</h2>
        ${alerts}
      </div>`;
  }

  function renderOrders() {
    const all = K.getOrders();
    const list = orderFilter === "all" ? all : all.filter((o) => o.status === orderFilter);
    const chips = ["all", "pending", "paid", "preparing", "completed", "cancelled"]
      .map(
        (s) =>
          `<button type="button" class="chip tap" data-filter="${s}" aria-pressed="${orderFilter === s}">${s === "all" ? "All" : s}</button>`
      )
      .join("");
    const cards = list.length
      ? list.map(orderCard).join("")
      : `<p class="empty">No orders in this filter. Add a walk-in, or wait for a website checkout.</p>`;
    return `
      <div class="page-head">
        <div>
          <h1>Orders</h1>
          <p>Website checkouts land here immediately. Walk-ins and phone orders: Add order.</p>
        </div>
        <button type="button" class="btn-gold tap" data-open-add>Add order</button>
      </div>
      <div class="toolbar"><div class="filters">${chips}</div></div>
      <div class="order-list">${cards}</div>`;
  }

  function orderCard(order) {
    const lines = order.items
      .map((item) => {
          const extra = [
          item.period
            ? "subscription: " +
              (window.LazzatGifts ? window.LazzatGifts.periodLabel(item.id, item.period) : item.period)
            : "",
          item.occasion
            ? "occasion: " + (window.LazzatGifts ? window.LazzatGifts.occasionLabel(item.occasion) : item.occasion)
            : "",
          item.nonSpicy ? "non-spicy" : "",
        ]
          .filter(Boolean)
          .join(" · ");
        return `<li>${escapeHtml(item.name)} ×${item.qty} — ${rm(item.price * item.qty)}${
          extra ? `<span class="line-extra"> · ${escapeHtml(extra)}</span>` : ""
        }</li>`;
      })
      .join("");
    const open = order.status !== "completed" && order.status !== "cancelled";
    const actions = open
      ? `<div class="order-actions">
          ${order.status === "pending" ? `<button type="button" class="btn-outline tap btn-sm" data-paid="${escapeHtml(order.id)}">Mark paid</button>` : ""}
          ${order.status === "paid" ? `<button type="button" class="btn-outline tap btn-sm" data-status="${escapeHtml(order.id)}" data-next="preparing">Preparing</button>` : ""}
          <button type="button" class="btn-gold tap btn-sm" data-complete="${escapeHtml(order.id)}">Complete</button>
          <button type="button" class="btn-outline tap btn-sm" data-fulfill="${escapeHtml(order.id)}">Fulfill</button>
          <button type="button" class="btn-danger tap btn-sm" data-cancel="${escapeHtml(order.id)}">Cancel</button>
        </div>`
      : "";
    const warn = order.stockWarning ? `<p class="warn">${escapeHtml(order.stockWarning)}</p>` : "";
    const name = order.customerName ? ` · ${escapeHtml(order.customerName)}` : "";
    return `<article class="order-card">
      <div class="order-top">
        <span class="order-id">${escapeHtml(order.id)}</span>
        <span class="status status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span>
      </div>
      <p class="order-meta">${when(order.createdAt)} · ${payLabel(order.paymentMethod)} · ${sourceLabel(order.source)}${name} · ${rm(order.subtotal)}${order.stockDeducted ? " · stock out" : ""}</p>
      <ul class="lines">${lines}</ul>
      ${warn}
      ${actions}
    </article>`;
  }

  function renderInventory() {
    const inv = Object.values(K.getInventory()).sort((a, b) => a.name.localeCompare(b.name));
    const rows = inv
      .map((ing) => {
        const low = ing.onHand <= ing.reorderLevel;
        return `<tr class="${low ? "is-low" : ""}">
          <td data-label="Ingredient">${escapeHtml(ing.name)}${low ? ' <span class="low">low</span>' : ""}</td>
          <td data-label="On hand"><input class="cell" type="number" min="0" step="0.001" data-stock="${escapeHtml(ing.id)}" value="${ing.onHand}"></td>
          <td data-label="Unit">${escapeHtml(ing.unit)}</td>
          <td data-label="RM / unit"><input class="cell" type="number" min="0" step="0.001" data-cost="${escapeHtml(ing.id)}" value="${ing.unitCost}"></td>
          <td data-label="Reorder"><input class="cell" type="number" min="0" step="0.001" data-reorder="${escapeHtml(ing.id)}" value="${ing.reorderLevel}"></td>
          <td data-label="Value">${rm(ing.onHand * ing.unitCost)}</td>
        </tr>`;
      })
      .join("");
    return `
      <div class="page-head">
        <div>
          <h1>Ingredient stock</h1>
          <p>On-hand, unit cost (RM per ${"g / ml / pcs"}), reorder level. Completing an order deducts recipe qty once.</p>
        </div>
        <button type="button" class="btn-outline tap" data-reset-stock>Reset seed stock</button>
      </div>
      <div class="panel table-wrap">
        <table class="inventory-table">
          <thead>
            <tr><th>Ingredient</th><th>On hand</th><th>Unit</th><th>RM / unit</th><th>Reorder</th><th>Value</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function renderCosting() {
    const cards = K.dishCosting()
      .map((dish) => {
        const lines = dish.lines
          .map(
            (line) =>
              `<tr><td>${escapeHtml(line.name)}</td><td>${K.fmtQty(line.qty)} ${escapeHtml(line.unit)}</td><td>${rm(line.lineCost)}</td></tr>`
          )
          .join("");
        return `<article class="panel dish-cost">
          <h3>${escapeHtml(dish.name)}</h3>
          <p class="margin-line">Retail ${rm(dish.retail)} · recipe cost ${rm(dish.cogs)} · gross ${rm(dish.profit)} · margin ${dish.margin.toFixed(0)}%</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Ingredient</th><th>Per serving</th><th>Cost</th></tr></thead>
              <tbody>${lines}</tbody>
            </table>
          </div>
        </article>`;
      })
      .join("");
    return `
      <div class="page-head">
        <div>
          <h1>Dish costing</h1>
          <p>Recipe cost = ingredient qty × unit cost. Not shown on the public menu.</p>
        </div>
      </div>
      <div class="cost-grid">${cards}</div>`;
  }

  function renderPnl() {
    const p = K.pnl(period);
    return `
      <div class="page-head">
        <div>
          <h1>P&amp;L simulation</h1>
          <p>Revenue from paid / preparing / completed orders. COGS from recipes × qty sold at current unit costs.</p>
        </div>
        ${periodToggle()}
      </div>
      <div class="panel">
        <div class="pnl-rows">
          <div class="pnl-row"><span>Orders counted</span><span>${p.revenueCount} sold · ${p.pendingCount} pending</span></div>
          <div class="pnl-row"><span>Revenue</span><span>${rm(p.revenue)}</span></div>
          <div class="pnl-row"><span>COGS</span><span>${rm(p.cogs)}</span></div>
          <div class="pnl-row"><span>Gross profit</span><span>${rm(p.gross)} (${p.margin.toFixed(0)}%)</span></div>
          <div class="pnl-row opex-row">
            <label for="opex">Opex (rent / packaging)</label>
            <input id="opex" type="number" min="0" step="0.01" value="${p.opex}">
          </div>
          <div class="pnl-row total"><span>Net (sim)</span><span>${rm(p.net)}</span></div>
        </div>
      </div>`;
  }

  function openAddModal() {
    draftQty = emptyQty();
    const rows = Object.keys(K.MENU)
      .map((id) => {
        const dish = K.MENU[id];
        return `<div class="qty-row">
          <span>${escapeHtml(dish.name)} <small>${rm(dish.price)}</small></span>
          <div class="qty-ctrl">
            <button type="button" class="tap" data-draft-delta="${id}" data-delta="-1" aria-label="Decrease">−</button>
            <span data-draft-qty="${id}">0</span>
            <button type="button" class="tap" data-draft-delta="${id}" data-delta="1" aria-label="Increase">+</button>
          </div>
        </div>`;
      })
      .join("");
    els.modalBody.innerHTML = `
      <h2 id="modal-title">Add order</h2>
      <p style="margin:0 0 0.85rem;font-size:0.85rem;color:var(--muted)">Walk-in, phone, or a WhatsApp that never hit the website cart.</p>
      <div class="field">
        <label for="cust-name">Customer name (optional)</label>
        <input id="cust-name" type="text" maxlength="80" placeholder="e.g. Aunty at the gate">
      </div>
      ${rows}
      <div class="field" style="margin-top:0.85rem">
        <label for="pay-method">Payment</label>
        <select id="pay-method">
          <option value="duitnow">DuitNow</option>
          <option value="cash">Cash</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>
      <div class="field">
        <label for="order-status">Status</label>
        <select id="order-status">
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <p id="add-subtotal" style="font-weight:700;margin:0.4rem 0 0.9rem">${rm(0)}</p>
      <div class="order-actions">
        <button type="button" class="btn-gold tap" data-save-add>Save order</button>
        <button type="button" class="btn-outline tap" data-close-modal>Cancel</button>
      </div>`;
    els.modal.hidden = false;
  }

  function draftItems() {
    return Object.keys(draftQty)
      .filter((id) => draftQty[id] > 0)
      .map((id) => ({ id, qty: draftQty[id] }));
  }

  function draftSubtotal() {
    return draftItems().reduce((sum, row) => sum + K.MENU[row.id].price * row.qty, 0);
  }

  function refreshDraft() {
    Object.keys(draftQty).forEach((id) => {
      const node = els.modalBody.querySelector(`[data-draft-qty="${id}"]`);
      if (node) node.textContent = String(draftQty[id]);
    });
    const sub = document.getElementById("add-subtotal");
    if (sub) sub.textContent = rm(draftSubtotal());
  }

  function closeModal() {
    els.modal.hidden = true;
    els.modalBody.innerHTML = "";
  }

  function saveManualOrder() {
    const items = draftItems();
    if (!items.length) {
      toast("Add at least one dish");
      return;
    }
    const status = document.getElementById("order-status").value;
    const order = K.createOrder({
      items,
      customerName: document.getElementById("cust-name").value,
      paymentMethod: document.getElementById("pay-method").value,
      status,
      source: "manual",
    });
    if (order.error) {
      toast(order.error);
      return;
    }
    if (order.stockWarning) toast("Saved with stock warning");
    else toast("Order " + order.id + " saved");
    closeModal();
    view = "orders";
    render();
  }

  els.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = els.user.value || "";
    const pass = els.pass.value || "";
    const ok = user === GATE_USER && pass === GATE_PASS;
    els.pass.value = "";
    if (!ok) {
      els.loginError.textContent = "Wrong username or password";
      return;
    }
    els.loginError.textContent = "";
    els.user.value = "";
    setAuthed(true);
    showApp();
  });

  document.getElementById("logout").addEventListener("click", () => {
    setAuthed(false);
    showGate();
  });

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-view]");
    if (nav && nav.closest(".nav")) {
      view = nav.dataset.view;
      render();
      return;
    }

    const per = e.target.closest("[data-period]");
    if (per) {
      period = per.dataset.period;
      render();
      return;
    }

    const filter = e.target.closest("[data-filter]");
    if (filter) {
      orderFilter = filter.dataset.filter;
      render();
      return;
    }

    if (e.target.closest("[data-open-add]")) {
      openAddModal();
      return;
    }
    if (e.target.closest("[data-close-modal]") || e.target === els.modal) {
      closeModal();
      return;
    }

    const delta = e.target.closest("[data-draft-delta]");
    if (delta) {
      const id = delta.dataset.draftDelta;
      draftQty[id] = Math.max(0, (draftQty[id] || 0) + Number(delta.dataset.delta));
      refreshDraft();
      return;
    }

    if (e.target.closest("[data-save-add]")) {
      saveManualOrder();
      return;
    }

    const paid = e.target.closest("[data-paid]");
    if (paid) {
      K.markPaid(paid.dataset.paid);
      toast("Marked paid — stock deducted if it wasn’t already");
      render();
      return;
    }

    const complete = e.target.closest("[data-complete]");
    if (complete) {
      K.completeOrder(complete.dataset.complete);
      toast("Order completed");
      render();
      return;
    }

    const fulfill = e.target.closest("[data-fulfill]");
    if (fulfill) {
      K.fulfillOrder(fulfill.dataset.fulfill);
      toast("Fulfilled — paid, stock out, completed");
      render();
      return;
    }

    const next = e.target.closest("[data-status]");
    if (next) {
      K.updateOrderStatus(next.dataset.status, next.dataset.next);
      render();
      return;
    }

    const cancel = e.target.closest("[data-cancel]");
    if (cancel) {
      K.cancelOrder(cancel.dataset.cancel);
      toast("Cancelled — stock restored if it had been deducted");
      render();
      return;
    }

    if (e.target.closest("[data-reset-stock]")) {
      if (confirm("Reset ingredient stock and unit costs to the seed list? Orders stay.")) {
        K.resetInventory();
        toast("Stock reset to seed");
        render();
      }
    }
  });

  els.view.addEventListener("change", (e) => {
    const stock = e.target.closest("[data-stock]");
    const cost = e.target.closest("[data-cost]");
    const reorder = e.target.closest("[data-reorder]");
    const opex = e.target.closest("#opex");
    if (stock) {
      K.updateIngredient(stock.dataset.stock, { onHand: stock.value });
      render();
      return;
    }
    if (cost) {
      K.updateIngredient(cost.dataset.cost, { unitCost: cost.value });
      render();
      return;
    }
    if (reorder) {
      K.updateIngredient(reorder.dataset.reorder, { reorderLevel: reorder.value });
      render();
      return;
    }
    if (opex) {
      K.setOpex(opex.value);
      render();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  if (isAuthed()) showApp();
})();
