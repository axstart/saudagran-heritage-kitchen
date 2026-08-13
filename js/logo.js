/**
 * Native Rasa-e-Lazzat logo components.
 * Custom elements: <logo-seal>, <logo-wordmark>, <logo-lockup>
 * Defined before body parse (load this file from <head> without defer).
 */
(function () {
  const TAGLINE = "The Taste of Home in Every Bite";
  const BRAND = "Rasa-e-Lazzat";

  function bowlMarkup() {
    return `
      <g class="logo-bowl" transform="translate(100 102)">
        <circle r="36" fill="#6B3E26"/>
        <circle r="32.2" fill="#8A5330"/>
        <circle r="29.4" fill="#F3E2A6"/>
        <ellipse cx="-6" cy="-4" rx="10" ry="6" fill="#E8A23D" opacity="0.55"/>
        <ellipse cx="8" cy="3" rx="9" ry="5.5" fill="#F0B445" opacity="0.5"/>
        <ellipse cx="2" cy="-8" rx="7" ry="4" fill="#E8A23D" opacity="0.4"/>
        <ellipse cx="-10" cy="6" rx="6" ry="3.5" fill="#F6C85A" opacity="0.45"/>
        <ellipse cx="-12" cy="4" rx="5.5" ry="4" fill="#E8C97A" stroke="#C4A05A" stroke-width="0.4"/>
        <ellipse cx="11" cy="8" rx="5" ry="3.6" fill="#E0C070" stroke="#C4A05A" stroke-width="0.4"/>
        <g transform="rotate(-28) translate(-8 -6)">
          <ellipse cx="0" cy="4" rx="5.5" ry="9" fill="#C17A3A"/>
          <ellipse cx="0" cy="-5" rx="3.2" ry="3.8" fill="#E8C9A0"/>
          <ellipse cx="0" cy="-5" rx="1.6" ry="2.2" fill="#F5E6D0"/>
        </g>
        <g transform="rotate(22) translate(9 -3)">
          <ellipse cx="0" cy="4" rx="5" ry="8.5" fill="#B56B32"/>
          <ellipse cx="0" cy="-5" rx="3" ry="3.6" fill="#E8C9A0"/>
          <ellipse cx="0" cy="-5" rx="1.5" ry="2" fill="#F5E6D0"/>
        </g>
        <g fill="#77A047">
          <ellipse cx="-3" cy="-10" rx="2.2" ry="1.3" transform="rotate(-20)"/>
          <ellipse cx="1" cy="-11" rx="2" ry="1.2" transform="rotate(25)"/>
          <ellipse cx="8" cy="-6" rx="2.1" ry="1.2" transform="rotate(10)"/>
          <ellipse cx="-8" cy="10" rx="1.8" ry="1.1"/>
          <ellipse cx="4" cy="11" rx="1.7" ry="1"/>
        </g>
        <g fill="#5B8A32">
          <ellipse cx="6" cy="-9" rx="1.6" ry="1"/>
          <ellipse cx="-6" cy="-8" rx="1.5" ry="0.9"/>
        </g>
        <g transform="translate(22 12) rotate(40)">
          <path d="M0 0 A8 8 0 0 1 8 8 L0 8 Z" fill="#D4E05A"/>
          <path d="M1 7 L7 7 M1 7 Q4 3 7 7" stroke="#EEF6C8" stroke-width="0.45" fill="none"/>
        </g>
      </g>`;
  }

  function sealSvg(uid) {
    const top = uid + "-top";
    const bot = uid + "-bot";
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-seal-svg" viewBox="0 0 200 200" role="img" aria-label="${BRAND}" fill="none">
        <defs>
          <path id="${top}" d="M22,100 A78,78 0 0 0 178,100" fill="none"/>
          <path id="${bot}" d="M178,100 A78,78 0 0 1 22,100" fill="none"/>
        </defs>
        <circle cx="100" cy="100" r="99" fill="#ffffff"/>
        <circle cx="100" cy="100" r="96.5" fill="none" stroke="#E8A23D" stroke-width="3.4"/>
        <circle cx="100" cy="100" r="91.5" fill="none" stroke="#E8A23D" stroke-width="0.9" opacity="0.55"/>
        <circle cx="100" cy="100" r="73" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.35"/>
        <text class="logo-seal-text" fill="currentColor">
          <textPath href="#${top}" xlink:href="#${top}" startOffset="50%" text-anchor="middle">${BRAND}</textPath>
        </text>
        <text class="logo-seal-tagline" fill="currentColor">
          <textPath href="#${bot}" xlink:href="#${bot}" startOffset="50%" text-anchor="middle">${TAGLINE}</textPath>
        </text>
        ${bowlMarkup()}
      </svg>`;
  }

  let sealCount = 0;

  class LogoSeal extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      const size = this.getAttribute("size") || "md";
      this.classList.add("logo-seal", "logo-seal--" + size);
      this.setAttribute("aria-label", BRAND);
      this.innerHTML = sealSvg("seal" + ++sealCount);
    }
  }

  class LogoWordmark extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      const size = this.getAttribute("size") || "md";
      this.classList.add("logo-wordmark-wrap");
      this.innerHTML = `<span class="logo-wordmark logo-wordmark--${size}" translate="no">${BRAND}</span>`;
    }
  }

  class LogoLockup extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      const size = this.getAttribute("size") || "hero";
      const align = this.getAttribute("align") || "center";
      this.classList.add("logo-lockup", "logo-lockup--" + size, "logo-lockup--" + align);
      this.innerHTML = `
        <span class="logo-wordmark logo-wordmark--${size}" translate="no">${BRAND}</span>
        <span class="logo-tagline">${TAGLINE}</span>`;
    }
  }

  if (!customElements.get("logo-seal")) customElements.define("logo-seal", LogoSeal);
  if (!customElements.get("logo-wordmark")) customElements.define("logo-wordmark", LogoWordmark);
  if (!customElements.get("logo-lockup")) customElements.define("logo-lockup", LogoLockup);
})();
