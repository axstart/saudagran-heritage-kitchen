/**
 * Seed menu, recipes (bill of materials), and ingredient stock/cost.
 * KitchenStore copies this into localStorage on first run; admin edits persist.
 */
(function (root) {
  const MENU = {
    pickle: { id: "pickle", name: "Sophie's Chilli Pickle", price: 28, unit: "jar" },
    biryani: {
      id: "biryani",
      name: "Authentic Chicken Biryani",
      price: 15,
      note: "includes free raita",
      unit: "plate",
    },
    "dahi-baray": { id: "dahi-baray", name: "Royal Shahi Dahi Baray", price: 18, unit: "bowl" },
    "shahi-tukray": { id: "shahi-tukray", name: "Shahi Tukray", price: 16, unit: "portion" },
    "gift-classic": {
      id: "gift-classic",
      name: "Biryani is Love Classic Keepsake",
      price: 55,
      unit: "pack",
      kind: "gift",
      note: "biryani, raita, Crocherish Powder Blue Bow Keychain",
    },
    "gift-festive": {
      id: "gift-festive",
      name: "Biryani is Love Festive Hamper",
      price: 95,
      unit: "pack",
      kind: "gift",
      note: "biryani, pickle, shahi tukray, Crocherish charm",
    },
    "gift-celebrate": {
      id: "gift-celebrate",
      name: "Biryani is Love Keep & Celebrate",
      price: 85,
      unit: "pack",
      kind: "gift",
      note: "biryani, dahi baray, Crocherish Bea the Chick Plush",
    },
  };

  /* unitCost is RM per unit (g, ml, or pcs). */
  const INGREDIENTS = {
    basmati: { id: "basmati", name: "Basmati rice", unit: "g", onHand: 5000, unitCost: 0.012, reorderLevel: 1000 },
    chicken: { id: "chicken", name: "Chicken (halal)", unit: "g", onHand: 3000, unitCost: 0.018, reorderLevel: 800 },
    potato: { id: "potato", name: "Potato", unit: "g", onHand: 2000, unitCost: 0.004, reorderLevel: 400 },
    onion: { id: "onion", name: "Onion", unit: "g", onHand: 2000, unitCost: 0.004, reorderLevel: 400 },
    yogurt: { id: "yogurt", name: "Yogurt", unit: "g", onHand: 2500, unitCost: 0.008, reorderLevel: 500 },
    cucumber: { id: "cucumber", name: "Cucumber", unit: "g", onHand: 600, unitCost: 0.006, reorderLevel: 150 },
    ghee: { id: "ghee", name: "Ghee / cooking oil", unit: "ml", onHand: 2000, unitCost: 0.022, reorderLevel: 400 },
    "biryani-masala": { id: "biryani-masala", name: "Biryani masala", unit: "g", onHand: 250, unitCost: 0.08, reorderLevel: 40 },
    saffron: { id: "saffron", name: "Saffron", unit: "g", onHand: 2, unitCost: 40, reorderLevel: 0.4 },
    cilantro: { id: "cilantro", name: "Cilantro / mint", unit: "g", onHand: 200, unitCost: 0.02, reorderLevel: 40 },
    lime: { id: "lime", name: "Lime", unit: "pcs", onHand: 24, unitCost: 0.4, reorderLevel: 6 },
    salt: { id: "salt", name: "Salt", unit: "g", onHand: 1500, unitCost: 0.002, reorderLevel: 200 },
    "green-chilli": { id: "green-chilli", name: "Green chilli", unit: "g", onHand: 1500, unitCost: 0.012, reorderLevel: 300 },
    "mustard-oil": { id: "mustard-oil", name: "Mustard oil", unit: "ml", onHand: 1000, unitCost: 0.025, reorderLevel: 200 },
    "mustard-seed": { id: "mustard-seed", name: "Mustard seed", unit: "g", onHand: 300, unitCost: 0.03, reorderLevel: 50 },
    "pickle-spices": { id: "pickle-spices", name: "Pickle spices (fennel, nigella, fenugreek, turmeric)", unit: "g", onHand: 220, unitCost: 0.045, reorderLevel: 40 },
    "gram-flour": { id: "gram-flour", name: "Urad / gram flour (besan)", unit: "g", onHand: 1500, unitCost: 0.012, reorderLevel: 300 },
    tamarind: { id: "tamarind", name: "Tamarind", unit: "g", onHand: 300, unitCost: 0.02, reorderLevel: 60 },
    "chaat-masala": { id: "chaat-masala", name: "Chaat masala / dahi spices", unit: "g", onHand: 150, unitCost: 0.05, reorderLevel: 30 },
    bread: { id: "bread", name: "Bread", unit: "pcs", onHand: 24, unitCost: 0.4, reorderLevel: 6 },
    milk: { id: "milk", name: "Milk", unit: "ml", onHand: 2000, unitCost: 0.006, reorderLevel: 400 },
    sugar: { id: "sugar", name: "Sugar", unit: "g", onHand: 2000, unitCost: 0.004, reorderLevel: 400 },
    pistachio: { id: "pistachio", name: "Pistachios", unit: "g", onHand: 150, unitCost: 0.12, reorderLevel: 30 },
    cardamom: { id: "cardamom", name: "Cardamom", unit: "g", onHand: 50, unitCost: 0.15, reorderLevel: 8 },
  };

  const RECIPES = {
    biryani: [
      { ingredientId: "basmati", qty: 180 },
      { ingredientId: "chicken", qty: 200 },
      { ingredientId: "potato", qty: 80 },
      { ingredientId: "onion", qty: 50 },
      { ingredientId: "yogurt", qty: 40 },
      { ingredientId: "ghee", qty: 25 },
      { ingredientId: "biryani-masala", qty: 8 },
      { ingredientId: "saffron", qty: 0.05 },
      { ingredientId: "cilantro", qty: 8 },
      { ingredientId: "lime", qty: 1 },
      { ingredientId: "salt", qty: 3 },
      { ingredientId: "yogurt", qty: 80 },
      { ingredientId: "cucumber", qty: 30 },
      { ingredientId: "salt", qty: 1 },
    ],
    pickle: [
      { ingredientId: "green-chilli", qty: 250 },
      { ingredientId: "mustard-oil", qty: 150 },
      { ingredientId: "mustard-seed", qty: 20 },
      { ingredientId: "pickle-spices", qty: 20 },
      { ingredientId: "salt", qty: 12 },
    ],
    "dahi-baray": [
      { ingredientId: "gram-flour", qty: 80 },
      { ingredientId: "yogurt", qty: 250 },
      { ingredientId: "tamarind", qty: 15 },
      { ingredientId: "chaat-masala", qty: 6 },
      { ingredientId: "ghee", qty: 40 },
      { ingredientId: "onion", qty: 20 },
      { ingredientId: "salt", qty: 3 },
    ],
    "shahi-tukray": [
      { ingredientId: "bread", qty: 3 },
      { ingredientId: "milk", qty: 250 },
      { ingredientId: "sugar", qty: 40 },
      { ingredientId: "ghee", qty: 30 },
      { ingredientId: "pistachio", qty: 8 },
      { ingredientId: "saffron", qty: 0.03 },
      { ingredientId: "cardamom", qty: 1 },
    ],
  };

  RECIPES["gift-classic"] = RECIPES.biryani.slice();
  RECIPES["gift-festive"] = RECIPES.biryani.concat(RECIPES.pickle, RECIPES["shahi-tukray"]);
  RECIPES["gift-celebrate"] = RECIPES.biryani.concat(RECIPES["dahi-baray"]);

  root.LazzatData = { MENU, INGREDIENTS, RECIPES };
})(window);
