/**
 * Weekly-box calorie targets + MyFitnessPal-style macro dials and micro bars.
 * Mifflin-St Jeor BMR. Box macros from LazzatGifts.PLAN_NUTRITION.
 * Estimates only — not medical advice, not affiliated with MyFitnessPal.
 */
(function (root) {
  const STORAGE = "rasa-calc";
  const DEFAULT_KCAL = 2000;
  const RING = 2 * Math.PI * 32;
  const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55 };
  const GOAL_KCAL = { lose: -500, maintain: 0, gain: 400 };
  const MICRO_META = [
    { key: "iron", label: "Iron" },
    { key: "calcium", label: "Calcium" },
    { key: "vita", label: "Vit A" },
    { key: "vitc", label: "Vit C" },
    { key: "sodium", label: "Sodium" },
    { key: "potassium", label: "Potassium" },
    { key: "b12", label: "B12" },
  ];
  const MACRO_META = [
    { key: "kcal", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fat", label: "Fat", unit: "g" },
    { key: "fibre", label: "Fibre", unit: "g" },
  ];

  const MENU_NUTRITION = {
    biryani: { servingG: 380, kcal: 750, protein: 38, carbs: 80, fat: 24, fibre: 4, alias: "chicken-biryani" },
    pulao: { servingG: 350, kcal: 680, protein: 34, carbs: 78, fat: 20, fibre: 3, alias: "chicken-pulao" },
    "chicken-salan": { servingG: 320, kcal: 420, protein: 32, carbs: 12, fat: 26, fibre: 3, dv: { iron: 10, calcium: 8, vita: 4, vitc: 4, sodium: 28, potassium: 10, b12: 32 } },
    "chicken-karhai": { alias: "chicken-karhai" },
    "shahi-tukray": { servingG: 180, kcal: 480, protein: 10, carbs: 56, fat: 22, fibre: 2, dv: { iron: 6, calcium: 16, vita: 6, vitc: 0, sodium: 12, potassium: 6, b12: 8 } },
    kheer: { servingG: 220, kcal: 320, protein: 8, carbs: 48, fat: 10, fibre: 1, dv: { iron: 2, calcium: 18, vita: 6, vitc: 0, sodium: 8, potassium: 6, b12: 10 } },
    zarda: { servingG: 200, kcal: 380, protein: 6, carbs: 62, fat: 12, fibre: 2, dv: { iron: 4, calcium: 2, vita: 4, vitc: 0, sodium: 8, potassium: 4, b12: 0 } },
    panjiri: { servingG: 80, kcal: 420, protein: 8, carbs: 44, fat: 22, fibre: 3, dv: { iron: 8, calcium: 4, vita: 2, vitc: 0, sodium: 4, potassium: 4, b12: 0 } },
    "panjiri-200": { servingG: 80, kcal: 420, protein: 8, carbs: 44, fat: 22, fibre: 3, dv: { iron: 8, calcium: 4, vita: 2, vitc: 0, sodium: 4, potassium: 4, b12: 0 } },
    "suji-halwa": { servingG: 180, kcal: 380, protein: 6, carbs: 52, fat: 16, fibre: 2, dv: { iron: 6, calcium: 8, vita: 4, vitc: 0, sodium: 6, potassium: 4, b12: 4 } },
    "fruit-trifle": { servingG: 250, kcal: 340, protein: 8, carbs: 48, fat: 12, fibre: 2, dv: { iron: 4, calcium: 14, vita: 8, vitc: 12, sodium: 10, potassium: 8, b12: 8 } },
    "beef-biryani": { servingG: 400, kcal: 820, protein: 42, carbs: 78, fat: 32, fibre: 4, alias: "beef-biryani" },
    "beef-pulao": { servingG: 360, kcal: 740, protein: 38, carbs: 76, fat: 26, fibre: 3, alias: "beef-pulao" },
    "beef-salan": { servingG: 340, kcal: 520, protein: 38, carbs: 12, fat: 36, fibre: 3, dv: { iron: 24, calcium: 6, vita: 4, vitc: 4, sodium: 30, potassium: 12, b12: 46 } },
    "beef-karhai": { alias: "beef-karhai" },
    pickle: { servingG: 15, kcal: 50, protein: 1, carbs: 2, fat: 4, fibre: 1, dv: { iron: 2, calcium: 1, vita: 2, vitc: 8, sodium: 18, potassium: 2, b12: 0 } },
    "dahi-baray": { servingG: 280, kcal: 400, protein: 14, carbs: 40, fat: 18, fibre: 6, dv: { iron: 10, calcium: 20, vita: 4, vitc: 6, sodium: 24, potassium: 8, b12: 8 } },
    dumplings: { servingG: 280, kcal: 520, protein: 28, carbs: 52, fat: 18, fibre: 3, dv: { iron: 12, calcium: 4, vita: 4, vitc: 8, sodium: 36, potassium: 10, b12: 24 } },
    "dumplings-frozen": { servingG: 280, kcal: 520, protein: 28, carbs: 52, fat: 18, fibre: 3, dv: { iron: 12, calcium: 4, vita: 4, vitc: 8, sodium: 36, potassium: 10, b12: 24 } },
    "chicken-khao-suey": { servingG: 550, kcal: 720, protein: 38, carbs: 68, fat: 32, fibre: 5, dv: { iron: 18, calcium: 8, vita: 8, vitc: 10, sodium: 48, potassium: 16, b12: 36 } },
    "chicken-pasta": { servingG: 380, kcal: 520, protein: 28, carbs: 48, fat: 20, fibre: 3, dv: { iron: 12, calcium: 16, vita: 10, vitc: 8, sodium: 32, potassium: 10, b12: 20 } },
    "chicken-shami": { servingG: 240, kcal: 480, protein: 36, carbs: 18, fat: 28, fibre: 3, dv: { iron: 14, calcium: 4, vita: 2, vitc: 2, sodium: 30, potassium: 10, b12: 28 } },
    "chicken-kofta": { servingG: 260, kcal: 520, protein: 38, carbs: 16, fat: 32, fibre: 2, dv: { iron: 14, calcium: 4, vita: 2, vitc: 2, sodium: 32, potassium: 10, b12: 30 } },
    "chicken-chapli": { servingG: 280, kcal: 640, protein: 40, carbs: 22, fat: 42, fibre: 3, dv: { iron: 16, calcium: 4, vita: 4, vitc: 4, sodium: 36, potassium: 12, b12: 32 } },
    "beef-shami": { servingG: 240, kcal: 560, protein: 42, carbs: 16, fat: 36, fibre: 3, dv: { iron: 28, calcium: 4, vita: 2, vitc: 2, sodium: 32, potassium: 12, b12: 48 } },
    "beef-kofta": { servingG: 260, kcal: 600, protein: 44, carbs: 14, fat: 40, fibre: 2, dv: { iron: 30, calcium: 4, vita: 2, vitc: 2, sodium: 34, potassium: 12, b12: 50 } },
    "beef-chapli": { servingG: 280, kcal: 720, protein: 46, carbs: 20, fat: 50, fibre: 3, dv: { iron: 32, calcium: 4, vita: 4, vitc: 4, sodium: 38, potassium: 14, b12: 52 } },
    "beef-dum-qeema": { servingG: 300, kcal: 580, protein: 38, carbs: 10, fat: 42, fibre: 2, dv: { iron: 28, calcium: 3, vita: 4, vitc: 4, sodium: 32, potassium: 12, b12: 46 } },
    "beef-khao-suey": { servingG: 550, kcal: 800, protein: 42, carbs: 66, fat: 38, fibre: 5, dv: { iron: 26, calcium: 8, vita: 8, vitc: 10, sodium: 50, potassium: 16, b12: 48 } },
    "beef-pasta": { servingG: 380, kcal: 580, protein: 32, carbs: 46, fat: 26, fibre: 3, dv: { iron: 22, calcium: 16, vita: 10, vitc: 8, sodium: 34, potassium: 12, b12: 36 } },
    "sauce-mint": { servingG: 40, kcal: 25, protein: 1, carbs: 3, fat: 1, fibre: 1, dv: { iron: 2, calcium: 2, vita: 8, vitc: 12, sodium: 8, potassium: 4, b12: 0 } },
    "sauce-imli": { servingG: 40, kcal: 45, protein: 0, carbs: 11, fat: 0, fibre: 1, dv: { iron: 2, calcium: 1, vita: 0, vitc: 2, sodium: 10, potassium: 4, b12: 0 } },
  };

  const MENU_LABELS = {
    biryani: "Chicken biryani",
    pulao: "Chicken pulao",
    "chicken-salan": "Chicken salan",
    "chicken-karhai": "Chicken karhai",
    "shahi-tukray": "Shahi tukray",
    kheer: "Kheer",
    zarda: "Zarda",
    panjiri: "Panjeeri 400 g",
    "panjiri-200": "Panjeeri 200 g",
    "suji-halwa": "Suji halwa",
    "fruit-trifle": "Fruit trifle",
    "beef-biryani": "Beef biryani",
    "beef-pulao": "Beef pulao",
    "beef-salan": "Beef salan",
    "beef-karhai": "Beef karhai",
    pickle: "Sophie’s chilli pickle",
    "dahi-baray": "Dahi baray",
    dumplings: "Fresh chicken dumplings",
    "dumplings-frozen": "Frozen chicken dumplings",
    "chicken-khao-suey": "Chicken khao suey",
    "chicken-pasta": "Chicken pasta",
    "chicken-shami": "Chicken shami",
    "chicken-kofta": "Chicken kofta",
    "chicken-chapli": "Chicken chapli",
    "beef-shami": "Beef shami",
    "beef-kofta": "Beef kofta",
    "beef-chapli": "Fresh beef chapli",
    "beef-dum-qeema": "Fresh beef dum qeema",
    "beef-khao-suey": "Beef khao suey",
    "beef-pasta": "Beef qeema pasta",
    "sauce-mint": "Mint sauce",
    "sauce-imli": "Imli sauce",
  };

  let form;
  let out;
  let sheet;
  let openDishId = "";
  let openDialKey = "";
  let lastPicks = null;

  function gifts() {
    return root.LazzatGifts;
  }

  function emptyDv() {
    return { iron: 0, calcium: 0, vita: 0, vitc: 0, sodium: 0, potassium: 0, b12: 0 };
  }

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function round(n) {
    return Math.round(n);
  }

  function nutritionById(id) {
    const G = gifts();
    const plan = G && G.PLAN_NUTRITION && G.PLAN_NUTRITION[id];
    if (plan) {
      return {
        id: id,
        name: dishName(id),
        servingG: plan.servingG,
        kcal: plan.kcal,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
        fibre: plan.fibre,
        dv: plan.dv || emptyDv(),
      };
    }
    const menu = MENU_NUTRITION[id];
    if (!menu) return null;
    if (menu.alias && G && G.PLAN_NUTRITION && G.PLAN_NUTRITION[menu.alias]) {
      const src = G.PLAN_NUTRITION[menu.alias];
      return {
        id: id,
        name: dishName(id),
        servingG: menu.servingG || src.servingG,
        kcal: menu.kcal || src.kcal,
        protein: menu.protein || src.protein,
        carbs: menu.carbs || src.carbs,
        fat: menu.fat || src.fat,
        fibre: menu.fibre || src.fibre,
        dv: menu.dv || src.dv || emptyDv(),
      };
    }
    return {
      id: id,
      name: dishName(id),
      servingG: menu.servingG || 0,
      kcal: menu.kcal || 0,
      protein: menu.protein || 0,
      carbs: menu.carbs || 0,
      fat: menu.fat || 0,
      fibre: menu.fibre || 0,
      dv: menu.dv || emptyDv(),
    };
  }

  function dishName(id) {
    if (MENU_LABELS[id]) return MENU_LABELS[id];
    const G = gifts();
    if (!G) return id;
    const lists = [G.RICE_OPTIONS, G.VEG_OPTIONS, G.DAAL_OPTIONS, G.QEEMA_OPTIONS];
    for (let i = 0; i < lists.length; i++) {
      const row = lists[i] && lists[i].find((o) => o.id === id);
      if (row) return row.label;
    }
    return id.replace(/-/g, " ");
  }

  function planCard() {
    return document.querySelector("#product-plan-weekly");
  }

  function currentPicks() {
    const G = gifts();
    if (lastPicks) return lastPicks;
    if (G && G.picksFromCard) return G.picksFromCard(planCard());
    return G ? G.defaultPicks() : null;
  }

  function boxTotals() {
    const G = gifts();
    const picks = currentPicks();
    if (G && G.sumNutrition && picks) return G.sumNutrition(picks);
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fibre: 0,
      servingG: 0,
      dv: emptyDv(),
      items: [],
    };
  }

  function readForm() {
    const unit = form.querySelector("[data-height-unit].is-on");
    const heightUnit = unit ? unit.getAttribute("data-height-unit") : "cm";
    const cmIn = form.querySelector('[name="cm"]');
    const ftIn = form.querySelector('[name="ft"]');
    const inchIn = form.querySelector('[name="inch"]');
    const kgIn = form.querySelector('[name="kg"]');
    const ageIn = form.querySelector('[name="age"]');
    const sexBtn = form.querySelector("[data-sex].is-on");
    const actBtn = form.querySelector("[data-activity].is-on");
    const goalBtn = form.querySelector("[data-goal].is-on");
    let cm = 0;
    if (heightUnit === "ft") {
      const ft = parseFloat(ftIn && ftIn.value);
      const inch = parseFloat(inchIn && inchIn.value);
      if (ft > 0) cm = ft * 30.48 + (inch > 0 ? inch : 0) * 2.54;
    } else {
      cm = parseFloat(cmIn && cmIn.value) || 0;
    }
    return {
      heightUnit: heightUnit,
      cm: cm,
      kg: parseFloat(kgIn && kgIn.value) || 0,
      age: parseFloat(ageIn && ageIn.value) || 0,
      sex: sexBtn ? sexBtn.getAttribute("data-sex") : "",
      activity: actBtn ? actBtn.getAttribute("data-activity") : "light",
      goal: goalBtn ? goalBtn.getAttribute("data-goal") : "maintain",
    };
  }

  function saveForm(state) {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function loadForm() {
    try {
      const raw = localStorage.getItem(STORAGE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function applySaved(state) {
    if (!state || !form) return;
    setSeg("[data-height-unit]", state.heightUnit || "cm");
    toggleHeight(state.heightUnit || "cm");
    if (state.heightUnit === "ft" && state.cm) {
      const totalIn = state.cm / 2.54;
      setVal('[name="ft"]', Math.floor(totalIn / 12));
      setVal('[name="inch"]', round(totalIn % 12));
    } else {
      setVal('[name="cm"]', state.cm ? round(state.cm) : "");
    }
    setVal('[name="kg"]', state.kg || "");
    setVal('[name="age"]', state.age || "");
    if (state.sex) setSeg("[data-sex]", state.sex);
    setSeg("[data-activity]", state.activity || "light");
    setSeg("[data-goal]", state.goal || "maintain");
  }

  function setVal(sel, value) {
    const el = form.querySelector(sel);
    if (el) el.value = value === 0 ? "" : value;
  }

  function setSeg(sel, value) {
    const key = sel.match(/\[([^=\]]+)/)[1];
    form.querySelectorAll(sel).forEach((btn) => {
      const onNow = btn.getAttribute(key) === value;
      btn.classList.toggle("is-on", onNow);
      btn.setAttribute("aria-pressed", onNow ? "true" : "false");
    });
  }

  function toggleHeight(unit) {
    const cm = form.querySelector("[data-height-cm]");
    const ft = form.querySelector("[data-height-ft]");
    if (cm) cm.hidden = unit !== "cm";
    if (ft) ft.hidden = unit !== "ft";
  }

  function bmr(kg, cm, age, sex) {
    const years = age > 0 ? age : 30;
    const base = 10 * kg + 6.25 * cm - 5 * years;
    if (sex === "male") return base + 5;
    if (sex === "female") return base - 161;
    return base - 78;
  }

  function dailyGoals(input) {
    const personalized = input.kg >= 35 && input.cm >= 120;
    let kcal = DEFAULT_KCAL;
    if (personalized) {
      const factor = ACTIVITY[input.activity] || ACTIVITY.light;
      kcal = bmr(input.kg, input.cm, input.age, input.sex) * factor + (GOAL_KCAL[input.goal] || 0);
      kcal = clamp(round(kcal), 1200, 4500);
    } else if (input.goal === "lose") {
      kcal = DEFAULT_KCAL - 500;
    } else if (input.goal === "gain") {
      kcal = DEFAULT_KCAL + 400;
    }

    let protein;
    if (input.kg >= 35) {
      protein = input.kg * (input.goal === "maintain" ? 1.2 : 1.6);
    } else {
      protein = (kcal * (input.goal === "maintain" ? 0.25 : 0.28)) / 4;
    }
    protein = clamp(round(protein), 40, 250);

    const fatPct = input.goal === "lose" ? 0.25 : 0.3;
    const fat = clamp(round((kcal * fatPct) / 9), 30, 180);
    const carbs = clamp(round((kcal - protein * 4 - fat * 9) / 4), 80, 600);
    const fibre = 28;

    return {
      kcal: kcal,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fibre: fibre,
      weeklyKcal: kcal * 7,
      weeklyProtein: protein * 7,
      personalized: personalized,
      usedDefaults: !personalized,
      ageAssumed: personalized && !(input.age > 0),
      sexAssumed: personalized && !input.sex,
    };
  }

  function providedOf(src, key) {
    if (key === "kcal" || key === "protein" || key === "carbs" || key === "fat" || key === "fibre") {
      return src[key] || 0;
    }
    return (src.dv && src.dv[key]) || 0;
  }

  function goalOf(goals, key) {
    if (key === "kcal" || key === "protein" || key === "carbs" || key === "fat" || key === "fibre") {
      return goals[key];
    }
    return 100;
  }

  function unitOf(key) {
    if (key === "kcal") return "kcal";
    if (MACRO_META.some((m) => m.key === key)) return "g";
    return "% DV";
  }

  function toneClass(pct) {
    if (pct > 1.5) return "is-high";
    if (pct > 1) return "is-over";
    return "is-ok";
  }

  function dialSvg(pct, tone) {
    const fill = clamp(pct, 0, 1);
    const offset = RING * (1 - fill);
    return (
      '<svg class="calc-ring" viewBox="0 0 80 80" aria-hidden="true">' +
      '<circle class="calc-ring-track" cx="40" cy="40" r="32"></circle>' +
      '<circle class="calc-ring-fill ' +
      tone +
      '" cx="40" cy="40" r="32" stroke-dasharray="' +
      RING.toFixed(2) +
      '" stroke-dashoffset="' +
      offset.toFixed(2) +
      '"></circle>' +
      "</svg>"
    );
  }

  function dialButton(key, label, provided, goal, unit, selected) {
    const pct = goal > 0 ? provided / goal : 0;
    const tone = toneClass(pct);
    const shown = unit === "% DV" ? round(provided) : round(provided);
    const goalShown = unit === "% DV" ? 100 : round(goal);
    const suffix = unit === "% DV" ? "%" : unit === "kcal" ? "" : "g";
    return (
      '<button type="button" class="calc-dial tap' +
      (selected ? " is-open" : "") +
      '" data-dial="' +
      key +
      '">' +
      dialSvg(pct, tone) +
      '<span class="calc-dial-center"><strong>' +
      shown +
      "</strong><em>/" +
      goalShown +
      (suffix ? " " + suffix : "") +
      "</em></span>" +
      '<span class="calc-dial-label">' +
      label +
      "</span></button>"
    );
  }

  function topFor(items, key, n) {
    return items
      .slice()
      .sort((a, b) => providedOf(a.data, key) - providedOf(b.data, key) > 0 ? -1 : 1)
      .slice(0, n)
      .filter((row) => providedOf(row.data, key) > 0);
  }

  function slotTip(picks, G) {
    if (!picks || !G || !G.PLAN_NUTRITION) return "";
    const N = G.PLAN_NUTRITION;
    const style = picks.curryStyle;
    const chicken = N["chicken-" + style];
    const beef = N["beef-" + style];
    const palak = N["palak-paneer"];
    const mix = N["mix-veg"];
    if (!chicken || !beef || !palak || !mix) return "";
    const kcal = beef.kcal - chicken.kcal;
    const pro = beef.protein - chicken.protein;
    return (
      "Non-spicy does not change these numbers. Beef " +
      style +
      " is +" +
      kcal +
      " kcal and +" +
      pro +
      " g protein vs chicken. Palak paneer is " +
      palak.kcal +
      " kcal / " +
      palak.protein +
      " g vs mix veg " +
      mix.kcal +
      " / " +
      mix.protein +
      "."
    );
  }

  function gapCopy(box, goals, goalId) {
    const pct = goals.weeklyKcal > 0 ? box.kcal / goals.weeklyKcal : 0;
    const remain = Math.max(0, goals.weeklyKcal - box.kcal);
    let line =
      "This box covers ~" +
      round(pct * 100) +
      "% of your week. Add ~" +
      remain.toLocaleString("en") +
      " kcal from breakfasts, other meals, and snacks.";
    if (goalId === "gain" || remain > box.kcal * 2) {
      line += " A second box is another ~" + box.kcal.toLocaleString("en") + " kcal. Extra zeera rice is 280 kcal.";
    }
    return line;
  }

  function vsTarget(box, goals, goalId) {
    const dailyFromBox = box.kcal / 7;
    const delta = dailyFromBox - goals.kcal;
    if (goalId === "lose") {
      return (
        "Lose (−500 kcal/day): the box is 6 lunches or dinners, not a full-week deficit. Spread over 7 days it is ~" +
        round(dailyFromBox) +
        " kcal/day vs your " +
        goals.kcal +
        " kcal target — a planned gap."
      );
    }
    if (goalId === "gain") {
      return (
        "Gain (+400 kcal/day): one box is a surplus only if you ate little else. Vs your " +
        goals.kcal +
        " kcal day, the box averages ~" +
        round(dailyFromBox) +
        " kcal/day (" +
        (delta < 0 ? round(-delta) + " short" : "+" + round(delta)) +
        "). Beef slots, palak paneer, or a second box raise it."
      );
    }
    return (
      "Maintain: box ÷ 7 is ~" +
      round(dailyFromBox) +
      " kcal/day vs " +
      goals.kcal +
      " kcal. Fill the rest with breakfasts and the other meals."
    );
  }

  function renderDials(host, provided, goals, selectedKey) {
    if (!host) return;
    host.innerHTML = MACRO_META.map((m) =>
      dialButton(m.key, m.label, providedOf(provided, m.key), goalOf(goals, m.key), m.unit, selectedKey === m.key)
    ).join("");
  }

  function microBarRow(key, label, provided, goal, selected) {
    const pct = goal > 0 ? provided / goal : 0;
    const tone = toneClass(pct);
    const fillPct = round(clamp(pct, 0, 1) * 100);
    const shown = round(provided);
    return (
      '<button type="button" class="calc-micro tap' +
      (selected ? " is-open" : "") +
      '" data-dial="' +
      key +
      '" aria-pressed="' +
      (selected ? "true" : "false") +
      '" aria-label="' +
      escapeHtml(label) +
      ", " +
      shown +
      "% of daily value\">" +
      '<span class="calc-micro-name">' +
      escapeHtml(label) +
      "</span>" +
      '<span class="calc-micro-track" aria-hidden="true">' +
      '<span class="calc-micro-fill ' +
      tone +
      '" style="width:' +
      fillPct +
      '%"></span></span>' +
      '<span class="calc-micro-val">' +
      shown +
      "%</span></button>"
    );
  }

  function renderMicroBars(host, provided, goals, selectedKey) {
    if (!host) return;
    host.innerHTML =
      '<div class="calc-micro-head" aria-hidden="true"><span>Nutrient</span><span></span><span>% DV</span></div>' +
      MICRO_META.map((m) =>
        microBarRow(m.key, m.label, providedOf(provided, m.key), goalOf(goals, m.key), selectedKey === m.key)
      ).join("");
  }

  function detailHtml(key, provided, goal, unit, items, mode) {
    const pct = goal > 0 ? provided / goal : 0;
    const remain = Math.max(0, goal - provided);
    const label = (MACRO_META.concat(MICRO_META).find((m) => m.key === key) || { label: key }).label;
    const tops = items
      ? topFor(items, key, 3)
          .map((row) => {
            const v = providedOf(row.data, key);
            return escapeHtml(row.slot.replace(/^\d+\.\s*/, "")) + " " + round(v) + (unit === "% DV" ? "%" : unit === "kcal" ? " kcal" : " g");
          })
          .join(" · ")
      : "";
    const modeLine =
      mode === "box7"
        ? "Box ÷ 7 days vs daily goal"
        : mode === "dish"
          ? "This serving vs daily goal"
          : "";
    return (
      '<div class="calc-detail-inner">' +
      "<h4>" +
      escapeHtml(label) +
      "</h4>" +
      '<p class="calc-detail-mode">' +
      modeLine +
      "</p>" +
      '<dl class="calc-stat">' +
      "<div><dt>Provided</dt><dd>" +
      round(provided) +
      " " +
      unit +
      "</dd></div>" +
      "<div><dt>Goal</dt><dd>" +
      round(goal) +
      " " +
      unit +
      "</dd></div>" +
      "<div><dt>Left</dt><dd>" +
      round(remain) +
      " " +
      unit +
      "</dd></div>" +
      "<div><dt>Fill</dt><dd>" +
      round(pct * 100) +
      "%</dd></div>" +
      "</dl>" +
      (tops ? "<p class=\"calc-tops\">Mostly: " + tops + "</p>" : "") +
      "</div>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (!form || !out) return;
    const input = readForm();
    saveForm(input);
    const goals = dailyGoals(input);
    const box = boxTotals();
    const perDay = {
      kcal: box.kcal / 7,
      protein: box.protein / 7,
      carbs: box.carbs / 7,
      fat: box.fat / 7,
      fibre: box.fibre / 7,
      dv: {},
    };
    Object.keys(box.dv || emptyDv()).forEach((k) => {
      perDay.dv[k] = (box.dv[k] || 0) / 7;
    });

    const kcalPct = goals.weeklyKcal > 0 ? clamp(box.kcal / goals.weeklyKcal, 0, 1) : 0;
    const proPct = goals.weeklyProtein > 0 ? box.protein / goals.weeklyProtein : 0;

    const setText = (sel, text) => {
      const el = out.querySelector(sel);
      if (el) el.textContent = text;
    };

    out.hidden = false;
    setText("[data-calc-daily]", goals.kcal.toLocaleString("en"));
    setText("[data-calc-weekly]", goals.weeklyKcal.toLocaleString("en"));
    setText("[data-calc-box-kcal]", box.kcal.toLocaleString("en"));
    setText(
      "[data-calc-box-macros]",
      box.protein + " g P · " + box.carbs + " g C · " + box.fat + " g F · " + box.fibre + " g Fi"
    );
    const bar = out.querySelector("[data-calc-bar]");
    if (bar) bar.style.width = round(kcalPct * 100) + "%";
    setText("[data-calc-fill-kcal]", round((box.kcal / goals.weeklyKcal) * 100) + "%");
    setText("[data-calc-fill-pro]", round(proPct * 100) + "%");
    setText("[data-calc-gap]", gapCopy(box, goals, input.goal));
    setText("[data-calc-vs]", vsTarget(box, goals, input.goal));
    setText("[data-calc-tip]", slotTip(currentPicks(), gifts()));
    setText(
      "[data-calc-note]",
      goals.usedDefaults
        ? "Using a 2000 kcal day until you enter height and weight. Approximate; not medical advice."
        : (goals.ageAssumed ? "Age treated as 30. " : "") +
            (goals.sexAssumed ? "Sex midpoint used for BMR. " : "") +
            "Approximate; not medical advice."
    );

    const sixDay = goals.kcal * 6;
    setText(
      "[data-calc-scale]",
      "Box " +
        box.kcal.toLocaleString("en") +
        " kcal · 6 days of goals " +
        sixDay.toLocaleString("en") +
        " · 7-day week " +
        goals.weeklyKcal.toLocaleString("en")
    );

    renderDials(out.querySelector("[data-calc-macros]"), perDay, goals, openDialKey);
    renderMicroBars(out.querySelector("[data-calc-micros]"), perDay, goals, openDialKey);
    renderDialDetail(out.querySelector("[data-calc-detail]"), openDialKey, perDay, goals, box.items, "box7");

    if (openDishId) fillSheet(openDishId, goals);
  }

  function renderDialDetail(host, key, provided, goals, items, mode) {
    if (!host) return;
    if (!key) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    host.hidden = false;
    host.innerHTML = detailHtml(key, providedOf(provided, key), goalOf(goals, key), unitOf(key), items, mode);
  }

  function onDialClick(e, scope) {
    const btn = e.target.closest("[data-dial]");
    if (!btn) return;
    const key = btn.getAttribute("data-dial");
    openDialKey = openDialKey === key ? "" : key;
    if (scope === "box") render();
    else if (openDishId) fillSheet(openDishId, dailyGoals(readForm()));
  }

  function fillSheet(id, goals) {
    const dish = nutritionById(id);
    if (!dish || !sheet) return;
    openDishId = id;
    sheet.hidden = false;
    sheet.classList.add("is-on");
    document.body.classList.add("dish-sheet-open");
    sheet.querySelector("[data-sheet-title]").textContent = dish.name;
    sheet.querySelector("[data-sheet-serve]").textContent =
      (dish.servingG ? "~" + dish.servingG + " g · " : "") + dish.kcal + " kcal";
    const provided = {
      kcal: dish.kcal,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      fibre: dish.fibre,
      dv: dish.dv,
    };
    renderDials(sheet.querySelector("[data-sheet-macros]"), provided, goals, openDialKey);
    renderMicroBars(sheet.querySelector("[data-sheet-micros]"), provided, goals, openDialKey);
    renderDialDetail(sheet.querySelector("[data-sheet-detail]"), openDialKey, provided, goals, null, "dish");
    const proPct = goals.protein > 0 ? dish.protein / goals.protein : 0;
    sheet.querySelector("[data-sheet-stat]").textContent =
      "This plate is " +
      round(proPct * 100) +
      "% of today’s protein target. After it: " +
      Math.max(0, round(goals.kcal - dish.kcal)).toLocaleString("en") +
      " kcal and " +
      Math.max(0, round(goals.protein - dish.protein)) +
      " g protein left.";
  }

  function openDish(id) {
    if (!id || id.indexOf("plan-") === 0 || id.indexOf("addon-") === 0) return;
    const goals = form ? dailyGoals(readForm()) : dailyGoals({ kg: 0, cm: 0, age: 0, sex: "", activity: "light", goal: "maintain" });
    fillSheet(id, goals);
  }

  function closeSheet() {
    openDishId = "";
    if (!sheet) return;
    sheet.hidden = true;
    sheet.classList.remove("is-on");
    document.body.classList.remove("dish-sheet-open");
  }

  function dishIdFromCard(card) {
    const on = card.querySelector("[data-variant-group] .is-on, .opt-chip.is-on");
    if (on && on.getAttribute("data-add-id")) return on.getAttribute("data-add-id");
    const addBtn = card.querySelector("[data-add]");
    return addBtn ? addBtn.getAttribute("data-add") : "";
  }

  function slotDishId(slot, picks) {
    if (!picks) return "";
    if (slot === "rice") return picks.rice;
    if (slot === "veg") return picks.veg;
    if (slot === "daal") return picks.daal;
    if (slot === "curryMeat" || slot === "curryStyle") return picks.curryMeat + "-" + picks.curryStyle;
    if (slot === "qeema") return picks.qeema === "beef" ? "beef-aloo-qeema" : "chicken-aloo-qeema";
    if (slot === "zeera") return "zeera-rice";
    return "";
  }

  function bindForm() {
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    form.addEventListener("click", (e) => {
      const unit = e.target.closest("[data-height-unit]");
      if (unit) {
        setSeg("[data-height-unit]", unit.getAttribute("data-height-unit"));
        toggleHeight(unit.getAttribute("data-height-unit"));
        render();
        return;
      }
      ["sex", "activity", "goal"].forEach((name) => {
        const btn = e.target.closest("[data-" + name + "]");
        if (!btn) return;
        const already = btn.classList.contains("is-on") && name === "sex";
        form.querySelectorAll("[data-" + name + "]").forEach((el) => {
          const on = !already && el === btn;
          el.classList.toggle("is-on", on);
          el.setAttribute("aria-pressed", on ? "true" : "false");
        });
        render();
      });
    });
    out.addEventListener("click", (e) => onDialClick(e, "box"));
  }

  function bindDishes() {
    document.querySelectorAll("article.card-lux").forEach((card) => {
      const targets = [];
      const photo = card.querySelector(".card-photo, .relative.h-56");
      const title = card.querySelector("h2.section-title, h3.section-title");
      if (photo) targets.push(photo);
      if (title) targets.push(title);
      targets.forEach((el) => {
        el.classList.add("dish-open");
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", "Open nutrient dials");
        const go = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openDish(dishIdFromCard(card));
        };
        el.addEventListener("click", go);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") go(e);
        });
      });
    });

    document.querySelectorAll("[data-plan-thumb], [data-dish-slot]").forEach((el) => {
      el.classList.add("dish-open");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      const go = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slot = el.getAttribute("data-plan-thumb") || el.getAttribute("data-dish-slot");
        const id = el.getAttribute("data-dish-id") || slotDishId(slot, currentPicks());
        openDish(id);
      };
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") go(e);
      });
    });

    if (sheet) {
      sheet.addEventListener("click", (e) => {
        if (e.target.closest("[data-sheet-close]") || e.target === sheet.querySelector("[data-sheet-scrim]")) {
          closeSheet();
          return;
        }
        onDialClick(e, "dish");
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSheet();
    });
  }

  function init() {
    form = document.querySelector("[data-calc-form]");
    out = document.querySelector("[data-calc-out]");
    sheet = document.getElementById("dish-sheet");
    if (!form || !out) return;
    const saved = loadForm();
    if (saved) applySaved(saved);
    else toggleHeight("cm");
    bindForm();
    bindDishes();
    const G = gifts();
    if (G && G.picksFromCard) lastPicks = G.picksFromCard(planCard());
    render();
  }

  document.addEventListener("lazzat:plan-picks", (e) => {
    lastPicks = e.detail && e.detail.picks;
    if (form) render();
    if (openDishId && lastPicks) {
      const card = planCard();
      if (card && document.activeElement && document.activeElement.hasAttribute("data-plan-pick")) {
        const slot = document.activeElement.getAttribute("data-plan-pick");
        const id = slotDishId(slot, lastPicks);
        if (id) openDish(id);
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  root.LazzatCalc = {
    dailyGoals: dailyGoals,
    nutritionById: nutritionById,
    openDish: openDish,
    refresh: render,
  };
})(window);
