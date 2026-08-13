/**
 * Special-order extras (charms, roses, flowers) and weekly meal-plan subscriptions.
 * Rasa-e-Lazzat only — no partner brands.
 */
(function (root) {
  const PACKAGING =
    "Kraft wrap, saffron ribbon, occasion sticker. Rasa-e-Lazzat festive wrap — no partner card.";

  const OCCASIONS = [
    { id: "hari-raya", label: "Hari Raya" },
    { id: "cny", label: "Chinese New Year" },
    { id: "anniversary", label: "Anniversary" },
    { id: "birthday", label: "Birthday" },
    { id: "thank-you", label: "Thank-you" },
  ];

  const ADDONS = {
    "addon-charm": {
      id: "addon-charm",
      name: "Charm",
      shortName: "Charm",
      price: 18,
      unit: "piece",
      blurb: "A small keepsake charm to tuck with the biryani. Not food.",
      image: "assets/special-biryani-love.png",
      alt: "Packed Biryani is Love special with charm, roses, and biryani",
    },
    "addon-rose": {
      id: "addon-rose",
      name: "Single rose",
      shortName: "Rose",
      price: 10,
      unit: "stem",
      blurb: "One rose beside the plate. For a birthday, an anniversary, a thank-you.",
      image: "assets/special-biryani-love.png",
      alt: "Packed Biryani is Love special with charm, roses, and biryani",
    },
    "addon-flowers": {
      id: "addon-flowers",
      name: "Small bouquet",
      shortName: "Flowers",
      price: 30,
      unit: "bouquet",
      blurb: "A small mixed bunch. Enough to dress the box, not a florist shop.",
      image: "assets/special-biryani-love.png",
      alt: "Packed Biryani is Love special with charm, roses, and biryani",
    },
  };

  const PLANS = {
    "plan-salan": {
      id: "plan-salan",
      name: "Weekly Salan Box",
      kicker: "7 days · one box a day",
      defaultPeriod: "weekly",
      periods: [{ id: "weekly", label: "Weekly", price: 110 }],
      serving: "7 single-serve salan in disposable boxes. Lunch or dinner — you pick when you eat.",
      dishes: [
        "Chicken Aloo",
        "Chana Masala",
        "Chicken White Karahi",
        "Bhindi Salan",
        "Tadka Daal",
        "Chicken Nihari",
        "Chicken Qorma",
      ],
      notes: [
        "The whole week, covered — family table or a student fridge.",
        "Each salan is one serving.",
        "Homemade, packed fresh, disposable boxes.",
        "The week’s cooking decides the exact pots; this list is a sample.",
        "No bread, roti, or naan in the box. Rice on the side if you ask.",
      ],
    },
    "plan-lunch": {
      id: "plan-lunch",
      name: "Lunch Plan",
      kicker: "Monday to Friday",
      defaultPeriod: "weekly",
      periods: [
        { id: "weekly", label: "Weekly", price: 70 },
        { id: "monthly", label: "Monthly", price: 280 },
      ],
      serving: "Five weekday lunches. Pickup or delivery across KL and Klang Valley.",
      dishes: [
        "Qeema Aloo",
        "Qeema Matar",
        "Palak Chicken",
        "Aloo Ghosht",
        "Rice with chicken or beef",
        "Mix sabzi",
        "Daal",
      ],
      notes: [
        "Monday to Friday.",
        "Pickup or delivery — say which on WhatsApp.",
        "Dishes may vary with the week’s cooking.",
        "Rice with a salan is fine. No bread or roti in the plan.",
      ],
    },
    "plan-dinner": {
      id: "plan-dinner",
      name: "Dinner Plan",
      kicker: "Monday to Friday",
      defaultPeriod: "weekly",
      periods: [
        { id: "weekly", label: "Weekly", price: 85 },
        { id: "monthly", label: "Monthly", price: 340 },
      ],
      serving: "Five weekday dinners. A heavier plate than lunch. Pickup or delivery.",
      dishes: [
        "Chicken sizzling",
        "Aloo Ghosht",
        "Beef salan",
        "Palak chicken",
        "Chicken karahi",
        "Mix sabzi",
        "Daal with rice",
      ],
      notes: [
        "Monday to Friday.",
        "Pickup or delivery — say which on WhatsApp.",
        "Dishes may vary with the week’s cooking.",
        "No bread, roti, or baked items. Rice is included on rice days.",
      ],
    },
  };

  function occasionLabel(id) {
    const row = OCCASIONS.find((o) => o.id === id);
    return row ? row.label : id;
  }

  function addonMeta(id) {
    return ADDONS[id] || null;
  }

  function planMeta(id) {
    return PLANS[id] || null;
  }

  function isAddon(id) {
    return !!ADDONS[id];
  }

  function isPlan(id) {
    return !!PLANS[id];
  }

  function periodOf(planId, periodId) {
    const plan = PLANS[planId];
    if (!plan) return null;
    return plan.periods.find((p) => p.id === periodId) || plan.periods[0] || null;
  }

  function planPrice(planId, periodId) {
    const row = periodOf(planId, periodId);
    return row ? row.price : 0;
  }

  function periodLabel(planId, periodId) {
    const row = periodOf(planId, periodId);
    return row ? row.label : periodId || "";
  }

  function allowedOccasions() {
    return OCCASIONS.slice();
  }

  function setChipFilter(occasionId) {
    document.querySelectorAll("[data-gift-chip]").forEach((chip) => {
      const on = chip.getAttribute("data-gift-chip") === occasionId;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-addon-card]").forEach((card) => {
      const select = card.querySelector("[data-gift-occasion]");
      if (select && occasionId) select.value = occasionId;
    });
  }

  function syncPlanPrice(card) {
    const planId = card.getAttribute("data-plan-card");
    const select = card.querySelector("[data-plan-period]");
    const period = select ? select.value : "";
    const priceEl = card.querySelector("[data-plan-price]");
    if (priceEl) priceEl.textContent = "RM " + planPrice(planId, period);
  }

  function init() {
    document.querySelectorAll("[data-gift-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = chip.getAttribute("data-gift-chip");
        const already = chip.classList.contains("is-on");
        setChipFilter(already ? "" : id);
      });
    });

    document.querySelectorAll("[data-plan-card]").forEach((card) => {
      const select = card.querySelector("[data-plan-period]");
      if (select) {
        select.addEventListener("change", () => syncPlanPrice(card));
        syncPlanPrice(card);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  root.LazzatGifts = {
    PACKAGING,
    OCCASIONS,
    ADDONS,
    PLANS,
    occasionLabel,
    addonMeta,
    planMeta,
    isAddon,
    isPlan,
    periodOf,
    planPrice,
    periodLabel,
    allowedOccasions,
  };
})(window);
