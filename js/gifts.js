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

  const RICE_OPTIONS = [
    { id: "chicken-biryani", label: "Chicken biryani" },
    { id: "beef-biryani", label: "Beef biryani" },
    { id: "chicken-pulao", label: "Chicken pulao" },
    { id: "beef-pulao", label: "Beef pulao" },
    { id: "shashlik-rice", label: "Shashlik rice" },
    { id: "afghani-pulao", label: "Afghani pulao" },
  ];
  const VEG_OPTIONS = [
    { id: "mix-veg", label: "Mix veg" },
    { id: "aloo-tarkari", label: "Aloo tarkari" },
    { id: "bhindi", label: "Bhindi" },
    { id: "palak-paneer", label: "Palak paneer" },
  ];
  const DAAL_OPTIONS = [
    { id: "daal-tadka", label: "Daal tadka", image: "assets/menu/daal-tadka.png" },
    { id: "karhi-pakora", label: "Karhi pakora", image: "assets/menu/karhi-pakora.png" },
    { id: "chana-salan", label: "Chana salan", image: "assets/menu/chana-salan.png" },
    { id: "khao-suey", label: "Khao suey", image: "assets/menu/khao-suey.png" },
  ];
  const CURRY_MEAT = [
    { id: "chicken", label: "Chicken" },
    { id: "beef", label: "Beef" },
  ];
  const CURRY_STYLE = [
    { id: "qorma", label: "Qorma" },
    { id: "nihari", label: "Nihari" },
    { id: "karhai", label: "Karhai" },
    { id: "handi", label: "Handi" },
  ];
  const QEEMA_OPTIONS = [
    { id: "chicken", label: "Chicken aloo qeema" },
    { id: "beef", label: "Beef aloo qeema" },
  ];

  /* Approximate per serving. kcal nearest 10; macros whole grams. Not lab-tested. */
  function n(servingG, kcal, protein, carbs, fat, fibre, ingredients, micros, benefit, allergens) {
    return {
      servingG: servingG,
      kcal: kcal,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fibre: fibre,
      ingredients: ingredients,
      micros: micros,
      benefit: benefit,
      allergens: allergens,
    };
  }

  const PLAN_NUTRITION = {
    "chicken-biryani": n(
      380, 750, 38, 80, 24, 4,
      "Basmati rice, chicken, potato, onion, tomato, ginger, garlic, spices, oil.",
      "Protein and B12 from chicken. Starch from rice and potato.",
      "Chicken is the protein; rice is the fuel. Potato takes the gravy.",
      "Contains meat. May contain milk if yogurt is in the masala; may contain gluten or mustard in spice mix."
    ),
    "beef-biryani": n(
      390, 820, 42, 78, 32, 4,
      "Basmati rice, beef, potato, onion, tomato, ginger, garlic, spices, oil.",
      "Iron and B12 from beef. Starch from rice and potato.",
      "Beef carries iron; rice fills the plate.",
      "Contains meat. May contain milk, gluten, or mustard in the spice mix."
    ),
    "chicken-pulao": n(
      350, 680, 34, 78, 20, 3,
      "Basmati rice, chicken, onion, whole spices, oil.",
      "Protein from chicken. Little fibre from onion.",
      "Lighter than biryani — rice and chicken, less gravy.",
      "Contains meat. May contain gluten or mustard in spices."
    ),
    "beef-pulao": n(
      360, 740, 38, 76, 26, 3,
      "Basmati rice, beef, onion, whole spices, oil.",
      "Iron and B12 from beef.",
      "Beef and rice in one pot; less masala than biryani.",
      "Contains meat. May contain gluten or mustard in spices."
    ),
    "shashlik-rice": n(
      370, 710, 36, 72, 24, 4,
      "Basmati rice, grilled chicken, onion, capsicum, tomato, oil, spices.",
      "Protein from chicken. Vitamin C from capsicum.",
      "The grill on the meat is flavour; rice is the bulk.",
      "Contains meat. May contain gluten or mustard in spices."
    ),
    "afghani-pulao": n(
      380, 740, 28, 92, 22, 6,
      "Basmati rice, carrot, raisins, onion, oil, mild spices, chicken.",
      "Vitamin A from carrot. Protein from chicken if it is in the pot.",
      "Carrot and raisins sweeten the rice; meat is the protein.",
      "Contains meat. Raisins. May contain gluten in spices."
    ),
    "mix-veg": n(
      280, 220, 6, 22, 12, 7,
      "Mixed seasonal vegetables (carrot, beans, pea, cauliflower), onion, tomato, oil, spices.",
      "Fibre and vitamin C from the vegetables.",
      "The veg is fibre; oil carries the spice.",
      "Vegetarian. May contain mustard in spices. Shared kitchen: dairy, gluten, nuts."
    ),
    "aloo-tarkari": n(
      300, 280, 4, 38, 12, 5,
      "Potato, onion, tomato, turmeric, oil, spices.",
      "Potassium from potato. Little protein.",
      "Potato is starch; the tarkari is onion and oil.",
      "Vegetarian, vegan if cooked in oil. May contain mustard."
    ),
    "bhindi": n(
      250, 210, 5, 16, 14, 6,
      "Okra (bhindi), onion, tomato, oil, spices.",
      "Fibre and vitamin C from okra.",
      "Okra is fibre; oil keeps it from sticking.",
      "Vegetarian, vegan if cooked in oil. May contain mustard."
    ),
    "palak-paneer": n(
      300, 380, 16, 14, 28, 5,
      "Spinach, paneer, onion, tomato, cream or ghee, spices.",
      "Vitamin A from palak. Calcium from paneer (dairy). Some iron from spinach.",
      "Spinach is the greens; paneer is the protein and fat.",
      "Vegetarian, not vegan. Contains dairy."
    ),
    "daal-tadka": n(
      300, 280, 14, 32, 10, 8,
      "Lentils (masoor or moong), onion, tomato, garlic, cumin, ghee or oil.",
      "Iron and folate from lentils.",
      "Lentils bring protein and iron; tadka is ghee and cumin.",
      "Vegetarian. Dairy if ghee. May contain gluten in spices."
    ),
    "karhi-pakora": n(
      320, 360, 12, 28, 20, 4,
      "Yogurt, gram-flour pakora, onion, turmeric, spices, oil.",
      "Calcium from yogurt. Protein from gram flour.",
      "Yogurt is the tang and some protein; pakora drinks the karhi.",
      "Vegetarian, not vegan. Contains dairy. Pakora is usually gram flour — may contain gluten."
    ),
    "chana-salan": n(
      300, 320, 14, 36, 12, 10,
      "Chickpeas, onion, tomato, spices, oil.",
      "Iron and fibre from chickpeas.",
      "Chickpeas are protein and fibre; the salan is onion and spice.",
      "Vegetarian, vegan if cooked in oil. May contain mustard."
    ),
    "khao-suey": n(
      340, 480, 22, 48, 20, 4,
      "Egg noodles, coconut milk, chicken or beef, onion, garlic, ginger, spices, chilli oil, fried onion, lemon.",
      "Protein from the meat. Starch from noodles. Fat from coconut milk.",
      "Noodles carry the broth; coconut milk is the body; meat is the protein. Also called khaosuay / khsosuay.",
      "Contains meat. Contains gluten and egg (noodles). Coconut. Chilli oil may contain sesame."
    ),
    "chicken-qorma": n(
      320, 420, 32, 10, 28, 2,
      "Chicken, yogurt, onion, ground spices, ghee.",
      "Protein and B12 from chicken. Calcium if yogurt is in the gravy.",
      "Yogurt and onion make the gravy; chicken is the protein.",
      "Contains meat. Contains dairy."
    ),
    "chicken-nihari": n(
      320, 430, 34, 8, 28, 2,
      "Chicken, onion, spices, oil or ghee; wheat flour sometimes in the gravy.",
      "Protein and B12 from chicken.",
      "Slow gravy; chicken for protein.",
      "Contains meat. May contain gluten (atta in gravy). Dairy if ghee."
    ),
    "chicken-karhai": n(
      300, 400, 34, 8, 26, 2,
      "Chicken, tomato, green chilli, ginger, garlic, oil.",
      "Protein from chicken. Lycopene from tomato.",
      "Tomato and oil are the pan; chicken is the meat.",
      "Contains meat."
    ),
    "chicken-handi": n(
      310, 410, 32, 10, 26, 2,
      "Chicken, yogurt or cream, onion, tomato, spices, oil.",
      "Protein from chicken. Calcium if dairy is in the gravy.",
      "Handi gravy is dairy and onion; chicken is protein.",
      "Contains meat. Contains dairy."
    ),
    "beef-qorma": n(
      320, 480, 36, 10, 34, 2,
      "Beef, yogurt, onion, ground spices, ghee.",
      "Iron and B12 from beef. Calcium if yogurt.",
      "Yogurt and onion make the gravy; beef is iron and protein.",
      "Contains meat. Contains dairy."
    ),
    "beef-nihari": n(
      330, 510, 38, 10, 34, 2,
      "Beef, onion, spices, oil or ghee; wheat flour sometimes in the gravy.",
      "Iron, B12, and zinc from beef.",
      "Slow gravy on beef; that is the protein and iron.",
      "Contains meat. May contain gluten (atta in gravy). Dairy if ghee."
    ),
    "beef-karhai": n(
      310, 460, 36, 8, 32, 2,
      "Beef, tomato, green chilli, ginger, garlic, oil.",
      "Iron and B12 from beef. Lycopene from tomato.",
      "Tomato and oil are the pan; beef is the meat.",
      "Contains meat."
    ),
    "beef-handi": n(
      320, 470, 34, 10, 32, 2,
      "Beef, yogurt or cream, onion, tomato, spices, oil.",
      "Iron and B12 from beef. Calcium if dairy.",
      "Handi gravy is dairy and onion; beef is protein and iron.",
      "Contains meat. Contains dairy."
    ),
    "chicken-aloo-qeema": n(
      300, 390, 28, 18, 22, 3,
      "Chicken mince, potato, onion, tomato, spices, oil.",
      "Protein from mince. Potassium from potato.",
      "Mince is protein; potato is the starch in the same pan.",
      "Contains meat. May contain mustard in spices."
    ),
    "beef-aloo-qeema": n(
      300, 450, 32, 16, 28, 3,
      "Beef mince, potato, onion, tomato, spices, oil.",
      "Iron and B12 from beef. Potassium from potato.",
      "Beef mince is iron and protein; potato fills it out.",
      "Contains meat. May contain mustard in spices."
    ),
    "zeera-rice": n(
      200, 280, 5, 52, 6, 1,
      "Basmati rice, cumin (zeera), oil or ghee, salt.",
      "Starch from rice. Cumin is aroma, not a vitamin pill.",
      "Cumin is flavour; rice is the carbohydrate next to the salan.",
      "Vegetarian. Dairy if ghee."
    ),
    "veg-biryani": n(
      360, 620, 12, 88, 18, 7,
      "Basmati rice, mixed vegetables, potato, onion, tomato, spices, oil.",
      "Fibre from vegetables. Starch from rice and potato.",
      "Vegetables and rice in one dum pot.",
      "Vegetarian. May contain milk if yogurt is in the masala; may contain gluten or mustard."
    ),
    "bhindi-piyaz": n(
      260, 230, 5, 18, 15, 6,
      "Okra (bhindi), onion (piyaz), tomato, oil, spices.",
      "Fibre and vitamin C from okra.",
      "Okra and onion cooked together.",
      "Vegetarian, vegan if cooked in oil. May contain mustard."
    ),
    "aloo-matar": n(
      300, 290, 8, 36, 12, 7,
      "Potato (aalu), peas (matar), onion, tomato, oil, spices.",
      "Potassium from potato. Some protein from peas.",
      "Peas add a little protein to the potato sabzi.",
      "Vegetarian, vegan if cooked in oil. May contain mustard."
    ),
    "dahi-phulki": n(
      280, 340, 11, 30, 16, 3,
      "Gram-flour phulki, yogurt, tamarind, spices.",
      "Calcium from yogurt. Protein from gram flour.",
      "Yogurt cools the phulki.",
      "Vegetarian, not vegan. Contains dairy. May contain gluten."
    ),
  };

  /* Approx. % of typical adult daily value (FDA-style) per serving. Not lab-tested. */
  function d(iron, calcium, vita, vitc, sodium, potassium, b12) {
    return {
      iron: iron,
      calcium: calcium,
      vita: vita,
      vitc: vitc,
      sodium: sodium,
      potassium: potassium,
      b12: b12,
    };
  }

  const PLAN_DV = {
    "chicken-biryani": d(14, 4, 8, 12, 38, 14, 36),
    "beef-biryani": d(28, 4, 8, 10, 40, 16, 52),
    "chicken-pulao": d(12, 3, 4, 6, 32, 10, 32),
    "beef-pulao": d(24, 3, 4, 6, 34, 12, 48),
    "shashlik-rice": d(14, 4, 12, 28, 34, 14, 34),
    "afghani-pulao": d(12, 4, 45, 8, 30, 12, 22),
    "mix-veg": d(8, 4, 22, 30, 22, 12, 0),
    "aloo-tarkari": d(4, 2, 4, 18, 20, 18, 0),
    "bhindi": d(6, 6, 8, 22, 18, 10, 0),
    "palak-paneer": d(16, 22, 90, 20, 24, 14, 4),
    "daal-tadka": d(20, 4, 6, 8, 22, 12, 0),
    "karhi-pakora": d(10, 18, 4, 4, 28, 8, 6),
    "chana-salan": d(22, 6, 4, 6, 24, 12, 0),
    "khao-suey": d(16, 6, 6, 8, 42, 12, 28),
    "chicken-qorma": d(10, 8, 4, 4, 28, 10, 32),
    "chicken-nihari": d(10, 4, 4, 4, 32, 10, 34),
    "chicken-karhai": d(10, 3, 8, 12, 26, 10, 34),
    "chicken-handi": d(10, 8, 6, 6, 28, 10, 32),
    "beef-qorma": d(24, 8, 4, 4, 30, 12, 48),
    "beef-nihari": d(26, 4, 4, 4, 34, 12, 52),
    "beef-karhai": d(24, 3, 8, 10, 28, 12, 48),
    "beef-handi": d(24, 8, 6, 6, 30, 12, 48),
    "chicken-aloo-qeema": d(10, 3, 4, 8, 26, 14, 24),
    "beef-aloo-qeema": d(22, 3, 4, 6, 28, 14, 40),
    "zeera-rice": d(2, 1, 0, 0, 12, 2, 0),
    "veg-biryani": d(10, 4, 18, 20, 30, 14, 0),
    "bhindi-piyaz": d(6, 6, 8, 22, 18, 10, 0),
    "aloo-matar": d(8, 3, 12, 22, 20, 16, 0),
    "dahi-phulki": d(10, 16, 4, 4, 26, 8, 6),
  };

  Object.keys(PLAN_NUTRITION).forEach(function (id) {
    if (PLAN_DV[id]) PLAN_NUTRITION[id].dv = PLAN_DV[id];
  });

  const PLANS = {
    "plan-weekly": {
      id: "plan-weekly",
      name: "Weekly meal",
      kicker: "6 items",
      defaultPeriod: "weekly",
      periods: [{ id: "weekly", label: "Weekly", price: 100 }],
      serving: "Six homemade dishes. No bread or roti.",
    },
    "plan-veg-weekly": {
      id: "plan-veg-weekly",
      name: "Weekly menu for vegetarians",
      kicker: "6 vegetarian dishes",
      defaultPeriod: "weekly",
      periods: [{ id: "weekly", label: "Weekly", price: 80 }],
      serving: "Six vegetarian dishes. No bread or roti.",
    },
  };

  const VEG_BOX_LINES = [
    "1. Vegetable biryani",
    "2. Bhindi piyaz sabzi",
    "3. Daal tadka",
    "4. Aalu mator sabzi",
    "5. Dahi phulki",
    "6. Zeera rice",
  ];
  const VEG_BOX_KEYS = ["veg-biryani", "bhindi-piyaz", "daal-tadka", "aloo-matar", "dahi-phulki", "zeera-rice"];

  function findLabel(list, id) {
    const row = list.find((o) => o.id === id);
    return row ? row.label : id || "";
  }

  function defaultPicks() {
    return {
      rice: "chicken-biryani",
      veg: "mix-veg",
      daal: "daal-tadka",
      curryMeat: "chicken",
      curryStyle: "qorma",
      qeema: "chicken",
    };
  }

  function defaultVegPicks() {
    return { box: "veg" };
  }

  function isVegBox(picks) {
    return !!(picks && picks.box === "veg");
  }

  function normalizePicks(raw) {
    if (isVegBox(raw)) return defaultVegPicks();
    const base = defaultPicks();
    if (!raw || typeof raw !== "object") return base;
    if (RICE_OPTIONS.some((o) => o.id === raw.rice)) base.rice = raw.rice;
    if (VEG_OPTIONS.some((o) => o.id === raw.veg)) base.veg = raw.veg;
    if (DAAL_OPTIONS.some((o) => o.id === raw.daal)) base.daal = raw.daal;
    if (CURRY_MEAT.some((o) => o.id === raw.curryMeat)) base.curryMeat = raw.curryMeat;
    if (CURRY_STYLE.some((o) => o.id === raw.curryStyle)) base.curryStyle = raw.curryStyle;
    if (QEEMA_OPTIONS.some((o) => o.id === raw.qeema)) base.qeema = raw.qeema;
    return base;
  }

  function picksKey(picks) {
    if (isVegBox(picks)) return "veg";
    const p = normalizePicks(picks);
    return [p.rice, p.veg, p.daal, p.curryMeat, p.curryStyle, p.qeema].join("|");
  }

  function picksLines(picks) {
    if (isVegBox(picks)) return VEG_BOX_LINES.slice();
    const p = normalizePicks(picks);
    const curry = findLabel(CURRY_MEAT, p.curryMeat) + " " + findLabel(CURRY_STYLE, p.curryStyle).toLowerCase();
    return [
      "1. " + findLabel(RICE_OPTIONS, p.rice),
      "2. " + findLabel(VEG_OPTIONS, p.veg),
      "3. " + findLabel(DAAL_OPTIONS, p.daal),
      "4. " + curry,
      "5. " + findLabel(QEEMA_OPTIONS, p.qeema),
      "6. Zeera rice",
    ];
  }

  function nutritionKeyForPicks(picks) {
    if (isVegBox(picks)) return VEG_BOX_KEYS.slice();
    const p = normalizePicks(picks);
    return [
      p.rice,
      p.veg,
      p.daal,
      p.curryMeat + "-" + p.curryStyle,
      p.qeema === "beef" ? "beef-aloo-qeema" : "chicken-aloo-qeema",
      "zeera-rice",
    ];
  }

  function nutritionForPicks(picks) {
    const labels = picksLines(picks);
    const keys = nutritionKeyForPicks(picks);
    return keys.map((id, i) => ({
      id: id,
      slot: labels[i],
      data: PLAN_NUTRITION[id] || null,
    }));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nutritionBlockHtml(entry) {
    const d = entry.data;
    if (!d) return "";
    return (
      '<details class="plan-nutri">' +
      "<summary class=\"tap\">" +
      "<span>" +
      escapeHtml(entry.slot) +
      " · ~" +
      d.servingG +
      " g · " +
      d.kcal +
      " kcal</span>" +
      '<span class="faq-chevron text-saffron-deep" aria-hidden="true">▾</span>' +
      "</summary>" +
      '<div class="nutrition-body">' +
      "<h4>Per serving</h4>" +
      '<p class="kcal-line"><strong>' +
      d.kcal +
      " kcal</strong> <span>~" +
      d.servingG +
      " g</span></p>" +
      '<dl class="macro-grid">' +
      '<div class="macro-cell"><dt>Protein</dt><dd>' +
      d.protein +
      " g</dd></div>" +
      '<div class="macro-cell"><dt>Carbs</dt><dd>' +
      d.carbs +
      " g</dd></div>" +
      '<div class="macro-cell"><dt>Fat</dt><dd>' +
      d.fat +
      " g</dd></div>" +
      '<div class="macro-cell"><dt>Fibre</dt><dd>' +
      d.fibre +
      " g</dd></div>" +
      "</dl>" +
      "<h4>Ingredients</h4><p>" +
      escapeHtml(d.ingredients) +
      "</p>" +
      "<h4>Micronutrients</h4><p>" +
      escapeHtml(d.micros) +
      "</p>" +
      "<h4>Why these ingredients</h4><p>" +
      escapeHtml(d.benefit) +
      "</p>" +
      "<h4>Allergens</h4><p>" +
      escapeHtml(d.allergens) +
      "</p>" +
      '<p class="nutrition-note">Approximate values per serving; portions may vary.</p>' +
      "</div></details>"
    );
  }

  function picksFromCard(card) {
    if (card && card.getAttribute("data-plan-card") === "plan-veg-weekly") {
      return defaultVegPicks();
    }
    const picks = defaultPicks();
    if (!card) return picks;
    card.querySelectorAll("[data-plan-pick]").forEach((el) => {
      const key = el.getAttribute("data-plan-pick");
      if (key && el.value) picks[key] = el.value;
    });
    return normalizePicks(picks);
  }

  function emptyDv() {
    return { iron: 0, calcium: 0, vita: 0, vitc: 0, sodium: 0, potassium: 0, b12: 0 };
  }

  function sumNutrition(picks) {
    const rows = nutritionForPicks(picks);
    const out = {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fibre: 0,
      servingG: 0,
      dv: emptyDv(),
      items: [],
    };
    rows.forEach((row) => {
      const data = row.data;
      if (!data) return;
      out.kcal += data.kcal;
      out.protein += data.protein;
      out.carbs += data.carbs;
      out.fat += data.fat;
      out.fibre += data.fibre;
      out.servingG += data.servingG;
      const dv = data.dv || emptyDv();
      Object.keys(out.dv).forEach((key) => {
        out.dv[key] += dv[key] || 0;
      });
      out.items.push({ id: row.id, slot: row.slot, data: data });
    });
    return out;
  }

  function renderPlanNutrition(card) {
    const host = card.querySelector("[data-plan-nutrition]");
    const picks = picksFromCard(card);
    if (host) {
      const rows = nutritionForPicks(picks);
      host.innerHTML = rows.map(nutritionBlockHtml).join("");
    }
    syncPlanThumbs(card);
    document.dispatchEvent(
      new CustomEvent("lazzat:plan-picks", { detail: { picks: picks, card: card } })
    );
  }

  function syncPlanThumbs(card) {
    card.querySelectorAll("[data-plan-pick]").forEach((el) => {
      const key = el.getAttribute("data-plan-pick");
      const img = card.querySelector('[data-plan-thumb="' + key + '"]');
      if (!img) return;
      const opt = el.options[el.selectedIndex];
      const src = opt && opt.getAttribute("data-thumb");
      if (src) {
        img.src = src;
        img.alt = (opt.textContent || "").trim();
      }
    });
  }

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
      card.querySelectorAll("[data-plan-pick]").forEach((el) => {
        el.addEventListener("change", () => renderPlanNutrition(card));
      });
      renderPlanNutrition(card);
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
    RICE_OPTIONS,
    VEG_OPTIONS,
    DAAL_OPTIONS,
    CURRY_MEAT,
    CURRY_STYLE,
    QEEMA_OPTIONS,
    occasionLabel,
    addonMeta,
    planMeta,
    isAddon,
    isPlan,
    periodOf,
    planPrice,
    periodLabel,
    allowedOccasions,
    defaultPicks,
    defaultVegPicks,
    normalizePicks,
    picksKey,
    picksLines,
    PLAN_NUTRITION,
    PLAN_DV,
    nutritionForPicks,
    picksFromCard,
    sumNutrition,
    renderPlanNutrition,
  };
})(window);
