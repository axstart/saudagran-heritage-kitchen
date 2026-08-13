/**
 * Shared kitchen ledger: orders + inventory in localStorage.
 * Used by the public cart (js/app.js) and admin.html.
 *
 * Stock is deducted once when an order reaches paid / preparing / completed
 * (flag: stockDeducted). Completing or fulfilling a second time is a no-op.
 */
(function (root) {
  const data = root.LazzatData;
  if (!data) {
    console.error("LazzatData missing — load js/inventory-data.js first");
    return;
  }

  const KEYS = {
    orders: "rasa-orders",
    inventory: "rasa-inventory",
    opex: "rasa-opex",
  };

  const STATUSES = ["pending", "paid", "preparing", "completed", "cancelled"];
  const PAYMENTS = ["duitnow", "cash", "whatsapp"];
  const DEDUCT_STATUSES = { paid: true, preparing: true, completed: true };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / quota */
    }
  }

  function seedInventory() {
    return clone(data.INGREDIENTS);
  }

  function getInventory() {
    const stored = readJson(KEYS.inventory, null);
    if (stored && typeof stored === "object") {
      const merged = seedInventory();
      Object.keys(merged).forEach((id) => {
        const row = stored[id];
        if (!row) return;
        if (typeof row.onHand === "number") merged[id].onHand = row.onHand;
        if (typeof row.unitCost === "number") merged[id].unitCost = row.unitCost;
        if (typeof row.reorderLevel === "number") merged[id].reorderLevel = row.reorderLevel;
      });
      return merged;
    }
    const seed = seedInventory();
    writeJson(KEYS.inventory, seed);
    return seed;
  }

  function saveInventory(inv) {
    writeJson(KEYS.inventory, inv);
    return inv;
  }

  function resetInventory() {
    const seed = seedInventory();
    writeJson(KEYS.inventory, seed);
    return seed;
  }

  function getOrders() {
    const list = readJson(KEYS.orders, []);
    return Array.isArray(list) ? list : [];
  }

  function saveOrders(list) {
    writeJson(KEYS.orders, list);
    return list;
  }

  function getOrder(id) {
    return getOrders().find((o) => o.id === id) || null;
  }

  function patchOrder(id, fn) {
    const list = getOrders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    list[idx] = fn(list[idx]);
    saveOrders(list);
    return list[idx];
  }

  function makeId(now) {
    const d = now || new Date();
    const ymd =
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "RL-" + ymd + "-" + rand;
  }

  function normalizeItems(rawItems) {
    if (!Array.isArray(rawItems)) return [];
    const out = [];
    rawItems.forEach((row) => {
      const product = data.MENU[row.id];
      const qty = Number(row.qty);
      if (!product || !qty || qty < 1) return;
      out.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: Math.floor(qty),
        occasion: String(row.occasion || "").trim(),
        crocherish: String(row.crocherish || "").trim(),
        packaging: String(row.packaging || "").trim(),
      });
    });
    return out;
  }

  function subtotalOf(items) {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function recipeLines(dishId) {
    const lines = data.RECIPES[dishId] || [];
    const rolled = {};
    lines.forEach((line) => {
      rolled[line.ingredientId] = (rolled[line.ingredientId] || 0) + Number(line.qty);
    });
    return Object.keys(rolled).map((ingredientId) => ({
      ingredientId,
      qty: rolled[ingredientId],
    }));
  }

  function needsForItems(items) {
    const need = {};
    items.forEach((item) => {
      recipeLines(item.id).forEach((line) => {
        need[line.ingredientId] = (need[line.ingredientId] || 0) + line.qty * item.qty;
      });
    });
    return need;
  }

  function checkStock(items, inv) {
    const inventory = inv || getInventory();
    const need = needsForItems(items);
    const shortages = [];
    Object.keys(need).forEach((id) => {
      const ing = inventory[id];
      if (!ing) return;
      if (ing.onHand + 1e-9 < need[id]) {
        shortages.push({
          id,
          name: ing.name,
          unit: ing.unit,
          need: need[id],
          have: ing.onHand,
        });
      }
    });
    return { ok: shortages.length === 0, shortages, need };
  }

  function deductStock(items) {
    const inv = getInventory();
    const check = checkStock(items, inv);
    Object.keys(check.need).forEach((id) => {
      if (!inv[id]) return;
      inv[id].onHand = roundQty(inv[id].onHand - check.need[id]);
    });
    saveInventory(inv);
    const warning = check.ok
      ? ""
      : "Low / short stock (override allowed): " +
        check.shortages
          .map((s) => s.name + " need " + fmtQty(s.need) + s.unit + ", have " + fmtQty(s.have) + s.unit)
          .join("; ");
    return { warning, shortages: check.shortages };
  }

  function restoreStock(items) {
    const inv = getInventory();
    const need = needsForItems(items);
    Object.keys(need).forEach((id) => {
      if (!inv[id]) return;
      inv[id].onHand = roundQty(inv[id].onHand + need[id]);
    });
    saveInventory(inv);
  }

  function roundQty(n) {
    return Math.round(n * 1000) / 1000;
  }

  function fmtQty(n) {
    const v = Number(n);
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }

  function applyDeductIfNeeded(order) {
    if (order.stockDeducted) return order;
    if (!DEDUCT_STATUSES[order.status]) return order;
    const result = deductStock(order.items);
    order.stockDeducted = true;
    order.stockWarning = result.warning || "";
    return order;
  }

  function createOrder(input) {
    const items = normalizeItems(input.items);
    if (!items.length) return { error: "No menu items" };

    const now = new Date();
    const status = STATUSES.includes(input.status) ? input.status : "pending";
    const paymentMethod = PAYMENTS.includes(input.paymentMethod) ? input.paymentMethod : "duitnow";

    let order = {
      id: makeId(now),
      createdAt: now.toISOString(),
      customerName: String(input.customerName || "").trim(),
      source: input.source === "manual" ? "manual" : "web",
      items,
      subtotal: subtotalOf(items),
      status,
      paymentMethod,
      stockDeducted: false,
      stockWarning: "",
      notes: String(input.notes || "").trim(),
    };

    if (status === "paid" || status === "preparing" || status === "completed") {
      order.paidAt = now.toISOString();
    }
    if (status === "completed") order.completedAt = now.toISOString();

    order = applyDeductIfNeeded(order);
    const list = getOrders();
    list.unshift(order);
    saveOrders(list);
    return order;
  }

  function updateOrderStatus(id, nextStatus) {
    if (!STATUSES.includes(nextStatus)) return null;
    const now = new Date().toISOString();
    return patchOrder(id, (order) => {
      const prev = order.status;
      if (prev === nextStatus) return order;
      if (nextStatus === "cancelled") {
        if (order.stockDeducted) {
          restoreStock(order.items);
          order.stockDeducted = false;
        }
        order.status = "cancelled";
        order.cancelledAt = now;
        return order;
      }
      if (prev === "cancelled") return order;
      order.status = nextStatus;
      if (DEDUCT_STATUSES[nextStatus] && !order.paidAt) order.paidAt = now;
      if (nextStatus === "completed") order.completedAt = now;
      return applyDeductIfNeeded(order);
    });
  }

  function markPaid(id) {
    const order = getOrder(id);
    if (!order || order.status === "cancelled" || order.status === "completed") return order;
    if (order.status === "pending") return updateOrderStatus(id, "paid");
    return patchOrder(id, (o) => {
      if (!o.paidAt) o.paidAt = new Date().toISOString();
      return applyDeductIfNeeded(o);
    });
  }

  function completeOrder(id) {
    const order = getOrder(id);
    if (!order || order.status === "cancelled" || order.status === "completed") return order;
    return updateOrderStatus(id, "completed");
  }

  /** Kitchen speed: paid + stock out + completed in one click. */
  function fulfillOrder(id) {
    const order = getOrder(id);
    if (!order || order.status === "cancelled" || order.status === "completed") return order;
    const now = new Date().toISOString();
    return patchOrder(id, (o) => {
      if (!o.paidAt) o.paidAt = now;
      o.status = "completed";
      o.completedAt = now;
      return applyDeductIfNeeded(o);
    });
  }

  function cancelOrder(id) {
    return updateOrderStatus(id, "cancelled");
  }

  function updateIngredient(id, fields) {
    const inv = getInventory();
    if (!inv[id]) return inv;
    if (fields.onHand != null && Number.isFinite(Number(fields.onHand))) {
      inv[id].onHand = roundQty(Number(fields.onHand));
    }
    if (fields.unitCost != null && Number.isFinite(Number(fields.unitCost))) {
      inv[id].unitCost = Math.max(0, Number(fields.unitCost));
    }
    if (fields.reorderLevel != null && Number.isFinite(Number(fields.reorderLevel))) {
      inv[id].reorderLevel = Math.max(0, Number(fields.reorderLevel));
    }
    return saveInventory(inv);
  }

  function recipeCost(dishId, inv) {
    const inventory = inv || getInventory();
    return recipeLines(dishId).reduce((sum, line) => {
      const ing = inventory[line.ingredientId];
      if (!ing) return sum;
      return sum + line.qty * ing.unitCost;
    }, 0);
  }

  function dishCosting() {
    const inv = getInventory();
    return Object.keys(data.MENU).map((id) => {
      const dish = data.MENU[id];
      const cogs = recipeCost(id, inv);
      const retail = dish.price;
      const profit = retail - cogs;
      const margin = retail > 0 ? (profit / retail) * 100 : 0;
      const lines = recipeLines(id).map((line) => {
        const ing = inv[line.ingredientId];
        const lineCost = ing ? line.qty * ing.unitCost : 0;
        return {
          ingredientId: line.ingredientId,
          name: ing ? ing.name : line.ingredientId,
          unit: ing ? ing.unit : "",
          qty: line.qty,
          unitCost: ing ? ing.unitCost : 0,
          lineCost,
        };
      });
      return { id, name: dish.name, retail, cogs, profit, margin, lines, unit: dish.unit };
    });
  }

  function isToday(iso, now) {
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  function inPeriod(order, period, now) {
    if (period === "today") return isToday(order.createdAt, now);
    return true;
  }

  function countsAsRevenue(order) {
    return order.status === "paid" || order.status === "preparing" || order.status === "completed";
  }

  function orderCogs(order, inv) {
    const inventory = inv || getInventory();
    return order.items.reduce((sum, item) => sum + recipeCost(item.id, inventory) * item.qty, 0);
  }

  function getOpex() {
    const n = Number(readJson(KEYS.opex, 0));
    return Number.isFinite(n) ? n : 0;
  }

  function setOpex(n) {
    const v = Number(n);
    writeJson(KEYS.opex, Number.isFinite(v) ? Math.max(0, v) : 0);
    return getOpex();
  }

  function pnl(period) {
    const now = new Date();
    const inv = getInventory();
    const orders = getOrders().filter((o) => inPeriod(o, period, now) && o.status !== "cancelled");
    const sold = orders.filter(countsAsRevenue);
    const revenue = sold.reduce((sum, o) => sum + o.subtotal, 0);
    const cogs = sold.reduce((sum, o) => sum + orderCogs(o, inv), 0);
    const gross = revenue - cogs;
    const opex = getOpex();
    const dishQty = {};
    sold.forEach((o) => {
      o.items.forEach((item) => {
        dishQty[item.id] = (dishQty[item.id] || 0) + item.qty;
      });
    });
    return {
      period,
      orderCount: orders.length,
      revenueCount: sold.length,
      pendingCount: orders.filter((o) => o.status === "pending").length,
      revenue,
      cogs,
      gross,
      margin: revenue > 0 ? (gross / revenue) * 100 : 0,
      opex,
      net: gross - opex,
      dishQty,
    };
  }

  function lowStock() {
    const inv = getInventory();
    return Object.values(inv).filter((ing) => ing.onHand <= ing.reorderLevel);
  }

  function dashboard(period) {
    const stats = pnl(period);
    return Object.assign({ alerts: lowStock() }, stats);
  }

  root.KitchenStore = {
    MENU: data.MENU,
    RECIPES: data.RECIPES,
    STATUSES,
    PAYMENTS,
    fmtQty,
    getInventory,
    saveInventory,
    resetInventory,
    updateIngredient,
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    markPaid,
    completeOrder,
    fulfillOrder,
    cancelOrder,
    checkStock,
    recipeCost,
    dishCosting,
    recipeLines,
    pnl,
    dashboard,
    lowStock,
    getOpex,
    setOpex,
  };
})(window);
