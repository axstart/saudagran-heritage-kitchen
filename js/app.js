(function () {
  const WA_NUMBER = "60176020325";
  const STORAGE_KEY = "rasa-cart";
  const BRAND = "Rasa-e-Lazzat";

  const MENU = {
    pickle: { id: "pickle", name: "Sophie's Chilli Pickle", price: 28 },
    biryani: { id: "biryani", name: "Authentic Chicken Biryani", price: 32 },
    "dahi-baray": { id: "dahi-baray", name: "Royal Shahi Dahi Baray", price: 18 },
    "shahi-tukray": { id: "shahi-tukray", name: "Shahi Tukray", price: 16 },
  };

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

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* private mode / file protocol */
    }
  }

  function items() {
    return Object.values(cart);
  }

  function totalQty() {
    return items().reduce((sum, item) => sum + item.qty, 0);
  }

  function subtotal() {
    return items().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function addToCart(id) {
    const product = MENU[id];
    if (!product) return;
    if (cart[id]) cart[id].qty += 1;
    else cart[id] = { ...product, qty: 1 };
    saveCart();
    renderCart();
    toast(product.name + " added to cart");
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
    return "RM " + n.toFixed(2);
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
    els.items.innerHTML = list
      .map(
        (item) => `
      <div class="flex items-start justify-between gap-3 border-b border-[#6B3E26]/10 pb-4">
        <div class="min-w-0">
          <p class="font-semibold text-[#2D1B10]">${escapeHtml(item.name)}</p>
          <p class="mt-0.5 text-xs text-[#6B5E54]">${money(item.price)} each</p>
          <div class="mt-3 flex items-center gap-2">
            <button type="button" class="tap grid place-items-center rounded-md border border-[#6B3E26]/25 text-[#6B3E26]" data-qty-delta="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="min-w-[1.5rem] text-center text-sm font-semibold">${item.qty}</span>
            <button type="button" class="tap grid place-items-center rounded-md border border-[#6B3E26]/25 text-[#6B3E26]" data-qty-delta="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-[#6B3E26]">${money(item.price * item.qty)}</p>
          <button type="button" class="mt-2 text-xs text-[#6B5E54] underline-offset-2 hover:text-[#2D1B10]" data-remove="${item.id}">Remove</button>
        </div>
      </div>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    const list = items();
    if (!list.length) return;
    const lines = list
      .map((item) => `• ${item.name} ×${item.qty} — ${money(item.price * item.qty)}`)
      .join("\n");
    const text = `Assalamualaikum! I'd like to order from ${BRAND}:\n\n${lines}\n\nSubtotal: ${money(subtotal())}\n\nKindly confirm delivery across KL / Klang Valley. Shukria!`;
    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
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

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
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

    if (e.target.closest("[data-whatsapp-checkout]")) {
      checkoutWhatsApp();
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
      checkoutWhatsApp();
    }
  });

  setEra("allahabad");
  renderCart();
})();
