(function () {
  const WA_NUMBER = "60176020325";
  const STORAGE_KEY = "rasa-cart";
  const BRAND = "Rasa-e-Lazzat";
  const MENU = window.LazzatData && window.LazzatData.MENU;
  const Gifts = window.LazzatGifts;
  const Kitchen = window.KitchenStore;

  if (!MENU) {
    console.error("LazzatData missing — load js/inventory-data.js first");
    return;
  }

  const els = {
    cartCount: document.querySelectorAll("[data-cart-count]"),
    cartBadges: document.querySelectorAll("[data-cart-badge]"),
    overlay: document.getElementById("cart-overlay"),
    drawer: document.getElementById("cart-drawer"),
    items: document.getElementById("cart-items"),
    empty: document.getElementById("cart-empty"),
    footer: document.getElementById("cart-footer"),
    subtotal: document.getElementById("cart-subtotal"),
    toasts: document.getElementById("toasts"),
    mobileMenu: document.getElementById("mobile-menu"),
    menuToggle: document.getElementById("menu-toggle"),
  };

  let cart = loadCart();
  let lastPlaced = null;
  syncCartFromMenu();
  saveCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function productKind(id) {
    const product = MENU[id];
    return (product && product.kind) || "";
  }

  function isAddon(item) {
    return productKind(item.id) === "addon";
  }

  function isPlan(item) {
    return productKind(item.id) === "plan";
  }

  function lineKey(id, extra) {
    extra = extra || {};
    const kind = productKind(id);
    if (kind === "addon") return id + "::" + (extra.occasion || "unspecified");
    if (kind === "plan") return id + "::" + (extra.period || "weekly");
    return id;
  }

  function addonName(item) {
    if (!isAddon(item)) return "";
    const meta = Gifts && Gifts.addonMeta(item.id);
    return (meta && meta.name) || item.name || "";
  }

  function packagingCopy(item) {
    if (item.packaging) return item.packaging;
    if (isAddon(item) && Gifts) return Gifts.PACKAGING;
    return "";
  }

  function syncCartFromMenu() {
    Object.keys(cart).forEach((key) => {
      const line = cart[key];
      const id = line && line.id ? line.id : key.split("::")[0];
      const product = MENU[id];
      if (!product) {
        delete cart[key];
        return;
      }
      line.id = product.id;
      line.name = product.name;
      line.key = key;
      if (product.kind === "plan") {
        const period = line.period || (Gifts && Gifts.planMeta(id) && Gifts.planMeta(id).defaultPeriod) || "weekly";
        line.period = period;
        line.price = Gifts ? Gifts.planPrice(id, period) : product.price;
      } else {
        line.price = product.price;
      }
      if (product.kind === "addon") {
        line.occasion = line.occasion || "";
        line.packaging = (Gifts && Gifts.PACKAGING) || line.packaging || "";
      }
    });
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* private mode / file protocol */
    }
  }

  function items() {
    return Object.keys(cart).map((key) => {
      const item = cart[key];
      item.key = key;
      return item;
    });
  }

  function totalQty() {
    return items().reduce((sum, item) => sum + item.qty, 0);
  }

  function subtotal() {
    return items().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function addToCart(id, extra) {
    const product = MENU[id];
    if (!product) return;
    lastPlaced = null;
    extra = extra || {};
    const occasion = extra.occasion || "";
    const period = extra.period || "";
    const key = lineKey(id, { occasion: occasion, period: period });
    const packaging = extra.packaging || (product.kind === "addon" && Gifts ? Gifts.PACKAGING : "");
    const price =
      product.kind === "plan" && Gifts ? Gifts.planPrice(id, period || "weekly") : product.price;
    if (cart[key]) {
      cart[key].qty += 1;
      cart[key].price = price;
      cart[key].name = product.name;
      cart[key].occasion = occasion;
      cart[key].period = period;
      cart[key].packaging = packaging;
    } else {
      cart[key] = {
        id: product.id,
        key: key,
        name: product.name,
        price: price,
        qty: 1,
        occasion: occasion,
        period: period,
        packaging: packaging,
      };
    }
    saveCart();
    renderCart();
    const bits = [product.name];
    if (product.kind === "plan" && period && Gifts) bits.push(Gifts.periodLabel(id, period));
    if (product.kind === "addon" && occasion && Gifts) bits.push(Gifts.occasionLabel(occasion));
    toast(bits.join(" · ") + " added to cart" + (product.note ? " — " + product.note : ""));
  }

  function setOccasion(key, occasion) {
    const line = cart[key];
    if (!line) return;
    const nextKey = lineKey(line.id, { occasion: occasion, period: line.period });
    line.occasion = occasion;
    line.packaging = Gifts ? Gifts.PACKAGING : line.packaging || "";
    rekeyLine(key, nextKey, line);
    saveCart();
    renderCart();
  }

  function setPeriod(key, period) {
    const line = cart[key];
    if (!line) return;
    const nextKey = lineKey(line.id, { occasion: line.occasion, period: period });
    line.period = period;
    line.price = Gifts ? Gifts.planPrice(line.id, period) : line.price;
    rekeyLine(key, nextKey, line);
    saveCart();
    renderCart();
  }

  function rekeyLine(key, nextKey, line) {
    if (nextKey === key) return;
    if (cart[nextKey]) {
      cart[nextKey].qty += line.qty;
      delete cart[key];
    } else {
      line.key = nextKey;
      cart[nextKey] = line;
      delete cart[key];
    }
  }

  function setQty(id, qty) {
    if (!cart[id]) return;
    if (qty < 1) delete cart[id];
    else cart[id].qty = qty;
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    delete cart[id];
    saveCart();
    renderCart();
  }

  function toast(msg) {
    const node = document.createElement("div");
    node.className =
      "toast pointer-events-auto rounded-md border border-[#6B3E26]/15 bg-white px-5 py-3 text-sm font-medium text-[#2D1B10] shadow-lg";
    node.setAttribute("role", "status");
    node.textContent = "✓ " + msg;
    els.toasts.appendChild(node);
    setTimeout(() => {
      node.classList.add("out");
      setTimeout(() => node.remove(), 280);
    }, 2800);
  }

  function money(n) {
    return "RM " + Number(n).toFixed(2);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function extraNotes(list) {
    return list
      .filter((item) => isAddon(item) || isPlan(item) || item.occasion)
      .map((item) => {
        const bits = [item.name];
        if (isPlan(item) && item.period) {
          bits.push("subscription: " + (Gifts ? Gifts.periodLabel(item.id, item.period) : item.period));
        }
        if (item.occasion && Gifts) bits.push("occasion: " + Gifts.occasionLabel(item.occasion));
        else if (item.occasion) bits.push("occasion: " + item.occasion);
        return bits.join(" — ");
      })
      .join(" | ");
  }

  function comboLine(list) {
    const biryani = list.find((item) => item.id === "biryani");
    const addons = list.filter(isAddon);
    if (!biryani || !addons.length) return "";
    const names = [biryani.name].concat(addons.map((a) => addonName(a) || a.name));
    return names.join(" + ");
  }

  function waTextFor(order) {
    const list = order.items;
    const lines = list
      .map((item) => {
        const extra = item.id === "biryani" ? " (includes free raita)" : "";
        let block = `• ${item.name} ×${item.qty} — ${money(item.price * item.qty)}${extra}`;
        if (isPlan(item)) {
          const period = Gifts ? Gifts.periodLabel(item.id, item.period) : item.period;
          if (period) block += `\n  Subscription: ${period}`;
          const plan = Gifts && Gifts.planMeta(item.id);
          if (plan) block += `\n  ${plan.serving}`;
        }
        if (isAddon(item) || item.occasion) {
          const occ =
            item.occasion && Gifts ? Gifts.occasionLabel(item.occasion) : item.occasion || "";
          if (occ) block += `\n  Occasion: ${occ}`;
          const pack = packagingCopy(item);
          if (pack) block += `\n  Packaging: ${pack}`;
        }
        return block;
      })
      .join("\n");
    const combo = comboLine(list);
    const comboBit = combo ? `\nSpecial order: ${combo}\n` : "";
    const planBit = list.some(isPlan)
      ? `\nThis is a Rasa-e-Lazzat meal-plan subscription. Dishes may vary with the week’s cooking. No bread or roti in the box.\n`
      : "";
    return (
      `Assalamualaikum! I'd like to order from ${BRAND}:\n\n` +
      `Order ${order.id}\n${lines}\n` +
      comboBit +
      planBit +
      `\nSubtotal: ${money(order.subtotal)}\n\n` +
      `I have paid / will pay via DuitNow to Jabeen Iffat.\n\n` +
      `Kindly confirm delivery across KL / Klang Valley. Shukria!`
    );
  }

  function openWhatsApp(order) {
    window.open(
      "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(waTextFor(order)),
      "_blank",
      "noopener"
    );
  }

  function placeOrder(status) {
    if (!Kitchen) {
      toast("Kitchen ledger unavailable");
      return null;
    }
    const list = items();
    if (!list.length) return lastPlaced;
    const order = Kitchen.createOrder({
      items: list,
      paymentMethod: "duitnow",
      status: status,
      source: "web",
      notes: extraNotes(list),
    });
    if (order.error) {
      toast(order.error);
      return null;
    }
    lastPlaced = order;
    cart = {};
    saveCart();
    renderCart();
    toast("Order " + order.id + " is with the kitchen");
    return order;
  }

  function payQrBlock(amount) {
    return `
      <div class="pay-qr">
        <h3>Pay with DuitNow</h3>
        <p>Scan with any banking app or eWallet (DuitNow / Touch 'n Go). Pay to <strong>Jabeen Iffat</strong>.</p>
        <figure class="pay-qr-frame">
          <img
            src="assets/duitnow-qr.png"
            alt="DuitNow QR poster for Jabeen Iffat — scan with any banking app or eWallet"
            width="560"
            height="720"
          />
        </figure>
        <p class="pay-amount">Amount: ${money(amount)}</p>
      </div>`;
  }

  function renderCart() {
    const qty = totalQty();
    els.cartCount.forEach((el) => {
      el.textContent = String(qty);
    });
    els.cartBadges.forEach((el) => {
      el.dataset.count = String(qty);
      el.textContent = String(qty);
    });

    const list = items();
    if (!list.length && lastPlaced) {
      els.empty.hidden = true;
      els.items.hidden = false;
      els.footer.hidden = false;
      els.subtotal.textContent = money(lastPlaced.subtotal);
      const paidNote =
        lastPlaced.status === "paid"
          ? "Marked paid. Kitchen can Complete / Fulfill if anything is still open."
          : "Sitting with the kitchen as pending. They can Mark paid or Complete even if you close this page.";
      els.items.innerHTML = `
        <div class="cart-confirm">
          <h3>Order ${escapeHtml(lastPlaced.id)}</h3>
          <p class="body-copy text-sm">It’s saved. ${paidNote}</p>
        </div>
        ${payQrBlock(lastPlaced.subtotal)}`;
      els.footer.querySelector("[data-place-paid]").hidden = lastPlaced.status === "paid";
      els.footer.querySelector("[data-whatsapp-checkout]").textContent = "Confirm on WhatsApp";
      return;
    }

    els.footer.querySelector("[data-place-paid]").hidden = false;
    els.footer.querySelector("[data-whatsapp-checkout]").textContent = "Confirm on WhatsApp";

    if (!list.length) {
      els.empty.hidden = false;
      els.items.hidden = true;
      els.footer.hidden = true;
      els.items.innerHTML = "";
      return;
    }

    els.empty.hidden = true;
    els.items.hidden = false;
    els.footer.hidden = false;
    els.subtotal.textContent = money(subtotal());
    const combo = comboLine(list);
    const comboBanner = combo
      ? `<p class="mb-4 rounded-md border border-[#6B3E26]/15 bg-white px-3 py-2 text-xs text-[#6B5E54]">Special order: <strong class="text-[#2D1B10]">${escapeHtml(combo)}</strong></p>`
      : "";
    const rows = list
      .map((item) => {
        const key = item.key || lineKey(item.id, { occasion: item.occasion, period: item.period });
        const addon = isAddon(item);
        const plan = isPlan(item);
        const occOptions =
          addon && Gifts
            ? Gifts.allowedOccasions()
                .map((o) => {
                  const sel = o.id === item.occasion ? " selected" : "";
                  return `<option value="${escapeHtml(o.id)}"${sel}>${escapeHtml(o.label)}</option>`;
                })
                .join("")
            : "";
        const periodOptions =
          plan && Gifts
            ? (Gifts.planMeta(item.id).periods || [])
                .map((p) => {
                  const sel = p.id === item.period ? " selected" : "";
                  return `<option value="${escapeHtml(p.id)}"${sel}>${escapeHtml(p.label)} — RM ${p.price}</option>`;
                })
                .join("")
            : "";
        let meta = "";
        if (addon) {
          meta = `<label class="mt-2 block text-xs font-medium text-[#6B3E26]">Occasion
              <select class="gift-cart-occasion mt-1 w-full" data-cart-occasion="${escapeHtml(key)}" aria-label="Occasion for ${escapeHtml(item.name)}">${occOptions}</select>
            </label>
            <p class="mt-1.5 text-xs text-[#6B5E54]">Add-on for biryani · Rasa-e-Lazzat wrap only</p>`;
        } else if (plan) {
          meta = `<label class="mt-2 block text-xs font-medium text-[#6B3E26]">Subscription
              <select class="gift-cart-occasion mt-1 w-full" data-cart-period="${escapeHtml(key)}" aria-label="Period for ${escapeHtml(item.name)}">${periodOptions}</select>
            </label>
            <p class="mt-1.5 text-xs text-[#6B5E54]">Meal plan · dishes may vary · no bread or roti</p>`;
        }
        const sub =
          item.id === "biryani"
            ? " · includes free raita"
            : addon
              ? " · special-order extra"
              : plan
                ? " · subscription"
                : "";
        return `
      <div class="flex items-start justify-between gap-3 border-b border-[#6B3E26]/10 pb-4">
        <div class="min-w-0">
          <p class="font-semibold text-[#2D1B10]">${escapeHtml(item.name)}</p>
          <p class="mt-0.5 text-xs text-[#6B5E54]">${money(item.price)} each${sub}</p>
          ${meta}
          <div class="mt-3 flex items-center gap-2">
            <button type="button" class="tap grid place-items-center rounded-md border border-[#6B3E26]/25 text-[#6B3E26]" data-qty-delta="${escapeHtml(key)}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="min-w-[1.5rem] text-center text-sm font-semibold">${item.qty}</span>
            <button type="button" class="tap grid place-items-center rounded-md border border-[#6B3E26]/25 text-[#6B3E26]" data-qty-delta="${escapeHtml(key)}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-[#6B3E26]">${money(item.price * item.qty)}</p>
          <button type="button" class="mt-2 min-h-12 text-xs text-[#6B5E54] underline-offset-2 hover:text-[#2D1B10]" data-remove="${escapeHtml(key)}">Remove</button>
        </div>
      </div>`;
      })
      .join("");
    els.items.innerHTML = comboBanner + rows + payQrBlock(subtotal());
  }

  function openCart() {
    els.overlay.classList.remove("hidden");
    els.overlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => els.drawer.classList.add("open"));
    document.body.style.overflow = "hidden";
    document.getElementById("cart-close")?.focus();
  }

  function closeCart() {
    els.drawer.classList.remove("open");
    els.overlay.setAttribute("aria-hidden", "true");
    setTimeout(() => els.overlay.classList.add("hidden"), 280);
    document.body.style.overflow = "";
  }

  function checkoutWhatsApp() {
    let order = lastPlaced;
    if (items().length) {
      order = placeOrder("pending");
    }
    if (!order) return;
    openWhatsApp(order);
  }

  function checkoutPaid() {
    if (lastPlaced && !items().length) {
      if (lastPlaced.status === "pending" && Kitchen) {
        lastPlaced = Kitchen.markPaid(lastPlaced.id) || lastPlaced;
        renderCart();
        toast("Marked paid — " + lastPlaced.id);
      }
      return;
    }
    placeOrder("paid");
  }

  function setEra(id) {
    document.querySelectorAll(".era-btn").forEach((btn) => {
      const on = btn.dataset.era === id;
      btn.setAttribute("aria-expanded", on ? "true" : "false");
    });
    document.querySelectorAll(".era-panel").forEach((panel) => {
      panel.classList.toggle("is-open", panel.id === "era-" + id);
    });
  }

  function occasionFromCard(card) {
    const select = card && card.querySelector("[data-gift-occasion]");
    return select ? select.value : "";
  }

  function periodFromCard(card) {
    const select = card && card.querySelector("[data-plan-period]");
    return select ? select.value : "";
  }

  document.addEventListener("click", (e) => {
    const withBiryani = e.target.closest("[data-add-with-biryani]");
    if (withBiryani) {
      const id = withBiryani.dataset.addWithBiryani;
      const card = withBiryani.closest("[data-addon-card]");
      const occasion = occasionFromCard(card);
      if (!occasion) {
        toast("Pick an occasion first");
        return;
      }
      addToCart("biryani");
      addToCart(id, { occasion: occasion, packaging: Gifts ? Gifts.PACKAGING : "" });
      return;
    }

    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add;
      const addonCard = add.closest("[data-addon-card]");
      const planCard = add.closest("[data-plan-card]");
      if (addonCard) {
        const occasion = occasionFromCard(addonCard);
        if (!occasion) {
          toast("Pick an occasion first");
          return;
        }
        addToCart(id, { occasion: occasion, packaging: Gifts ? Gifts.PACKAGING : "" });
      } else if (planCard) {
        const period = periodFromCard(planCard) || "weekly";
        addToCart(id, { period: period });
      } else {
        addToCart(id);
      }
      return;
    }

    const open = e.target.closest("[data-open-cart]");
    if (open) {
      openCart();
      return;
    }

    const close = e.target.closest("[data-close-cart]");
    if (close) {
      closeCart();
      return;
    }

    const remove = e.target.closest("[data-remove]");
    if (remove) {
      removeItem(remove.dataset.remove);
      return;
    }

    const qtyBtn = e.target.closest("[data-qty-delta]");
    if (qtyBtn) {
      const id = qtyBtn.dataset.qtyDelta;
      const delta = Number(qtyBtn.dataset.delta);
      setQty(id, (cart[id]?.qty || 0) + delta);
      return;
    }

    const era = e.target.closest(".era-btn");
    if (era) {
      setEra(era.dataset.era);
      return;
    }

    if (e.target.closest("[data-place-paid]")) {
      checkoutPaid();
      return;
    }

    if (e.target.closest("[data-whatsapp-checkout]")) {
      checkoutWhatsApp();
    }
  });

  document.addEventListener("change", (e) => {
    const occ = e.target.closest("[data-cart-occasion]");
    if (occ) {
      setOccasion(occ.dataset.cartOccasion, occ.value);
      return;
    }
    const period = e.target.closest("[data-cart-period]");
    if (period) {
      setPeriod(period.dataset.cartPeriod, period.value);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      els.mobileMenu?.classList.add("hidden");
    }
  });

  els.menuToggle?.addEventListener("click", () => {
    const open = els.mobileMenu.classList.toggle("hidden") === false;
    els.menuToggle.setAttribute("aria-expanded", String(open));
  });

  els.mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      els.mobileMenu.classList.add("hidden");
      els.menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("wa-direct")?.addEventListener("click", (e) => {
    if (items().length) {
      e.preventDefault();
      openCart();
    }
  });

  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
    heroVideo.setAttribute("hidden", "");
  }

  setEra("allahabad");
  renderCart();
})();
