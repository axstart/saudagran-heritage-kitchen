/**
 * Rasa-e-Lazzat × Crocherish — Biryani is Love packs.
 * Crocherish names, prices, and photos match https://www.crocherish.com/shop (Aug 2026).
 */
(function (root) {
  const SHOP = "https://www.crocherish.com/shop";
  const SITE = "https://www.crocherish.com/";

  const CROCHET = {
    bow: {
      name: "Powder Blue Bow Keychain",
      price: 18,
      category: "Charms",
      image: "assets/crocherish-bow-keychain.jpg",
      alt: "Crocherish Powder Blue Bow Keychain, handmade crochet charm",
    },
    sunflower: {
      name: "Sunflower Keychain",
      price: 18,
      category: "Charms",
      image: "assets/crocherish-sunflower-keychain.jpg",
      alt: "Crocherish Sunflower Keychain, handmade crochet charm",
    },
    bloom: {
      name: "Bloom Flower Charm",
      price: 22,
      category: "Charms",
      image: "assets/crocherish-bloom-charm.jpg",
      alt: "Crocherish Bloom Flower Charm, handmade crochet flower",
    },
    bea: {
      name: "Bea the Chick Plush",
      price: 38,
      category: "Plushies",
      image: "assets/crocherish-bea-chick.jpg",
      alt: "Crocherish Bea the Chick Plush, handmade crochet plush",
    },
  };

  const OCCASIONS = [
    { id: "hari-raya", label: "Hari Raya" },
    { id: "cny", label: "Chinese New Year" },
    { id: "anniversary", label: "Anniversary" },
    { id: "birthday", label: "Birthday" },
    { id: "thank-you", label: "Thank-you" },
  ];

  const PACKS = {
    "gift-classic": {
      id: "gift-classic",
      shortName: "Classic Keepsake",
      occasions: ["thank-you", "birthday", "anniversary", "hari-raya", "cny"],
      defaultOccasion: "thank-you",
      packaging:
        "Kraft wrap, saffron ribbon, occasion sticker, card: “Biryani is Love — Rasa-e-Lazzat × Crocherish”.",
      crocherishByOccasion: {
        "*": CROCHET.bow,
      },
    },
    "gift-festive": {
      id: "gift-festive",
      shortName: "Festive Hamper",
      occasions: ["hari-raya", "cny"],
      defaultOccasion: "hari-raya",
      packaging:
        "Festive box (green-and-gold sticker for Hari Raya, red-and-gold for Chinese New Year), ribbon, card: “Biryani is Love — Rasa-e-Lazzat × Crocherish”.",
      crocherishByOccasion: {
        "hari-raya": CROCHET.bloom,
        cny: CROCHET.sunflower,
      },
    },
    "gift-celebrate": {
      id: "gift-celebrate",
      shortName: "Keep & Celebrate",
      occasions: ["anniversary", "birthday"],
      defaultOccasion: "birthday",
      packaging:
        "Kraft gift box, ribbon, occasion sticker, card: “Biryani is Love — Rasa-e-Lazzat × Crocherish”. Names on the card if you tell us on WhatsApp.",
      crocherishByOccasion: {
        "*": CROCHET.bea,
      },
    },
  };

  function packMeta(id) {
    return PACKS[id] || null;
  }

  function crocherishFor(packId, occasion) {
    const pack = PACKS[packId];
    if (!pack) return null;
    const map = pack.crocherishByOccasion;
    return map[occasion] || map["*"] || null;
  }

  function occasionLabel(id) {
    const row = OCCASIONS.find((o) => o.id === id);
    return row ? row.label : id;
  }

  function allowedOccasions(packId) {
    const pack = PACKS[packId];
    if (!pack) return OCCASIONS;
    return OCCASIONS.filter((o) => pack.occasions.indexOf(o.id) !== -1);
  }

  function syncFestivePhoto(card) {
    const packId = card.getAttribute("data-gift-pack");
    const select = card.querySelector("[data-gift-occasion]");
    const piece = crocherishFor(packId, select && select.value);
    if (!piece) return;
    const img = card.querySelector("[data-crochet-img]");
    const name = card.querySelector("[data-crochet-name]");
    const price = card.querySelector("[data-crochet-price]");
    if (img) {
      img.src = piece.image;
      img.alt = piece.alt;
    }
    if (name) name.textContent = piece.name;
    if (price) price.textContent = "RM " + piece.price + " on Crocherish";
  }

  function setChipFilter(occasionId) {
    document.querySelectorAll("[data-gift-chip]").forEach((chip) => {
      const on = chip.getAttribute("data-gift-chip") === occasionId;
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-gift-pack]").forEach((card) => {
      const pack = PACKS[card.getAttribute("data-gift-pack")];
      const match = !occasionId || (pack && pack.occasions.indexOf(occasionId) !== -1);
      card.classList.toggle("is-dim", !match);
      const select = card.querySelector("[data-gift-occasion]");
      if (select && occasionId && pack && pack.occasions.indexOf(occasionId) !== -1) {
        select.value = occasionId;
        syncFestivePhoto(card);
      }
    });
  }

  function init() {
    document.querySelectorAll("[data-gift-pack]").forEach((card) => {
      const select = card.querySelector("[data-gift-occasion]");
      if (select) {
        select.addEventListener("change", () => syncFestivePhoto(card));
        syncFestivePhoto(card);
      }
    });

    document.querySelectorAll("[data-gift-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = chip.getAttribute("data-gift-chip");
        const already = chip.classList.contains("is-on");
        setChipFilter(already ? "" : id);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  root.LazzatGifts = {
    SHOP,
    SITE,
    CROCHET,
    OCCASIONS,
    PACKS,
    packMeta,
    crocherishFor,
    occasionLabel,
    allowedOccasions,
  };
})(window);
