/* TRN — catálogo con consulta por WhatsApp.
 * Ruteo por hash, inventario en localStorage, admin con contraseña local. */

(() => {
  const LS = {
    products: "trn-products",
    admin: "trn-admin-auth"
  };

  const state = {
    menuOpen: false,
    adminTab: "inventario",
    adminQ: "",
    formProduct: null,
    catalog: { q: "", cat: "todas", sort: "destacados" }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatARS(n) {
    const value = Math.round(Number(n) || 0);
    const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `$ ${formatted}`;
  }

  function transferPrice(n) {
    return Math.round(Number(n) * (1 - (STORE_CONFIG.transferDiscount || 0)));
  }

  function cuotasOf(n) {
    const parts = STORE_CONFIG.installments || 6;
    return Math.round(Number(n) / parts);
  }

  function pct(n) {
    return Math.round((STORE_CONFIG.transferDiscount || 0) * 100);
  }

  function waIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1A8.8 8.8 0 0 0 5.3 16.7L4 20.5l3.9-1.3A8.8 8.8 0 1 0 12 3.1zm4.9 12.5c-.2.6-1.1 1.1-1.8 1.2-.5.1-1.1.1-1.8-.1-1.5-.5-3.3-1.8-4.5-3.5-1-1.4-1.5-2.8-1.5-3.4 0-.7.4-1.4 1-1.6.2-.1.6-.1.8 0l.6 1.4c.1.3 0 .5-.1.7l-.3.4c-.1.1-.1.3 0 .5.4.7 1.2 1.6 2 2.1.2.1.4.1.5 0l.5-.5c.2-.2.4-.2.7-.1l1.5.8c.2.1.3.3.2.6z"/></svg>`;
  }

  function genericWaMessage() {
    return "Hola TRN! Quiero hacer una consulta.";
  }

  function siteBase() {
    const path = location.pathname.replace(/index\.html$/i, "");
    const dir = path.endsWith("/") ? path : path.replace(/[^/]+$/, "") || "/";
    return `${location.origin}${dir}`;
  }

  function productPermalink(id) {
    return `${siteBase()}#/producto/${encodeURIComponent(id)}`;
  }

  function waHref(text) {
    const msg = text || genericWaMessage();
    return `https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function waLink() {
    return waHref(genericWaMessage());
  }

  function waProductMessage(product, variant, qty) {
    const bits = [`Hola TRN! Quiero consultar por: ${product.name}`];
    if (variant) bits.push(`Color: ${variant}`);
    const n = Number(qty) || 1;
    if (n > 1) bits.push(`Cantidad: ${n}`);
    bits.push(`Precio: ${formatARS(unitPrice(product))}`);
    return `${bits[0]} — ${bits.slice(1).join(" — ")}. ¿Tienen stock?\n${productPermalink(product.id)}`;
  }

  function waProductHref(product, variant, qty) {
    return waHref(waProductMessage(product, variant, qty));
  }

  function bindWhatsAppChrome() {
    const href = waLink();
    $$("[data-header-wa], [data-wa-float]").forEach((el) => {
      el.href = href;
    });
  }

  function refreshProductWa() {
    const a = $("[data-wa-product]");
    if (!a) return;
    const product = getProduct(a.dataset.waProduct);
    if (!product) return;
    const variant = currentVariant() || a.dataset.variant || "";
    const qty = Number($("[data-qty-value]")?.textContent || 1);
    a.href = waProductHref(product, variant, qty);
    a.dataset.variant = variant;
  }


  function estimateShipping(cp, subtotal = 0) {
    const digits = String(cp || "").replace(/\D/g, "");
    if (digits.length !== 4) {
      return { error: "Ingresá un código postal argentino de 4 dígitos." };
    }
    const n = Number(digits);
    let zone, days, cost;
    if (n >= 1000 && n <= 1499) {
      zone = "CABA";
      days = "1 a 2 días hábiles";
      cost = 4990;
    } else if (n >= 1500 && n <= 1999) {
      zone = "GBA y alrededores";
      days = "2 a 4 días hábiles";
      cost = 6990;
    } else if (n >= 2000 && n <= 9420) {
      zone = "Interior del país";
      days = "3 a 7 días hábiles";
      cost = 8990;
    } else {
      return { error: "No reconocimos ese código postal. Revisalo o escribinos y lo estimamos a mano." };
    }
    const free = subtotal >= (STORE_CONFIG.freeShipping || 0);
    return { zone, days, cost: free ? 0 : cost, free };
  }

  function stockCopy(product, variantName) {
    const n = variantName ? variantStock(product, variantName) : totalStock(product);
    if (n <= 0) return { cls: "is-out", text: "Sin stock en este color. Elegí otra variante o avisanos y te avisamos cuando vuelva." };
    if (n <= 5) return { cls: "is-low", text: `Quedan ${n} ${n === 1 ? "unidad" : "unidades"} · si lo querés, conviene consultarnos ahora.` };
    return { cls: "", text: "En stock. Si confirmamos el pago antes de las 13 h, sale el mismo día hábil." };
  }

  function breadcrumbs(items) {
    return `<nav class="breadcrumbs" aria-label="Migas de pan">${items.map((it, i) => {
      const last = i === items.length - 1;
      return last
        ? `<strong>${escapeHtml(it.label)}</strong>`
        : `<a href="${it.href}">${escapeHtml(it.label)}</a><span aria-hidden="true">/</span>`;
    }).join("")}</nav>`;
  }

  function faqHTML(limit) {
    const items = limit ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;
    return `<div class="faq-list">${items.map((f) => `
      <details class="faq-item">
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`).join("")}</div>`;
  }

  function socialIcons() {
    const ig = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;
    const tt = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 3v11.2a3.2 3.2 0 1 1-2.2-3.04V8.6A7.2 7.2 0 0 0 17.4 11V8.2A5.6 5.6 0 0 1 14 6.4V3z"/></svg>`;
    const wa = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1A8.8 8.8 0 0 0 5.3 16.7L4 20.5l3.9-1.3A8.8 8.8 0 1 0 12 3.1zm4.9 12.5c-.2.6-1.1 1.1-1.8 1.2-.5.1-1.1.1-1.8-.1-1.5-.5-3.3-1.8-4.5-3.5-1-1.4-1.5-2.8-1.5-3.4 0-.7.4-1.4 1-1.6.2-.1.6-.1.8 0l.6 1.4c.1.3 0 .5-.1.7l-.3.4c-.1.1-.1.3 0 .5.4.7 1.2 1.6 2 2.1.2.1.4.1.5 0l.5-.5c.2-.2.4-.2.7-.1l1.5.8c.2.1.3.3.2.6z"/></svg>`;
    return `
      <div class="footer-social">
        <a href="${STORE_CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram ${STORE_CONFIG.instagramHandle}">${ig}</a>
        <a href="${STORE_CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok ${STORE_CONFIG.tiktokHandle}">${tt}</a>
        <a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp ${STORE_CONFIG.whatsappDisplay}">${wa}</a>
      </div>`;
  }


  function setFilterSheet(open) {
    const sheet = $("[data-filter-sheet]");
    const overlay = $("[data-sheet-overlay]");
    if (!sheet) return;
    if (open) {
      sheet.hidden = false;
      if (overlay) overlay.hidden = false;
      requestAnimationFrame(() => sheet.classList.add("is-open"));
    } else {
      sheet.classList.remove("is-open");
      setTimeout(() => {
        sheet.hidden = true;
        if (overlay) overlay.hidden = true;
      }, 280);
    }
  }

  function renderChrome() {
    const pctOff = pct();
    const announce = $("[data-announce]");
    if (announce) {
      announce.innerHTML = `Consultá por WhatsApp · ${pctOff}% OFF pagando con transferencia · Envíos a todo el país`;
    }
    const nav = $("[data-nav-links]");
    if (nav) {
      nav.innerHTML = `
        <a href="#/" data-nav="home">Inicio</a>
        <div class="nav-item">
          <a href="#/catalogo" data-nav="catalog" aria-haspopup="true">Catálogo
            <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </a>
          <div class="mega" role="menu">
            ${CATEGORY_INFO.map((c) => `
              <a href="#/catalogo?cat=${encodeURIComponent(c.name)}" role="menuitem">
                <span>${escapeHtml(c.name)}<small>${escapeHtml(c.subtitle)}</small></span>
              </a>`).join("")}
          </div>
        </div>
        <a href="#/catalogo?cat=ofertas" data-nav="ofertas">Ofertas</a>
      `;
    }
    const footer = $("[data-footer]");
    if (footer) {
      footer.innerHTML = `
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <div class="footer-brand">TRN</div>
              <p>Periféricos para jugar en serio. Envíos a todo el país y atención directa por WhatsApp. Después de consultar, pagás con Mercado Pago o transferencia.</p>
              ${socialIcons()}
              <form class="newsletter" data-newsletter>
                <label class="sr-only" for="nl-mail">Tu email para el newsletter</label>
                <input id="nl-mail" type="email" name="email" required placeholder="Tu email" autocomplete="email" />
                <button class="btn btn-solid" type="submit">Suscribirme</button>
              </form>
            </div>
            <div>
              <h3>Tienda</h3>
              <ul>
                <li><a href="#/catalogo">Catálogo</a></li>
                ${CATEGORY_INFO.map((c) => `<li><a href="#/catalogo?cat=${encodeURIComponent(c.name)}">${escapeHtml(c.name)}</a></li>`).join("")}
                <li><a href="#/catalogo?cat=ofertas">Ofertas</a></li>
              </ul>
            </div>
            <div>
              <h3>Ayuda</h3>
              <ul>
                <li><a href="#/envios">Envíos</a></li>
                <li><a href="#/cambios">Cambios y devoluciones</a></li>
                <li><a href="#/garantia">Garantía</a></li>
                <li><a href="#/faq">Preguntas frecuentes</a></li>
                <li><a href="#/contacto">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3>Legal</h3>
              <ul>
                <li><a href="#/terminos">Términos y condiciones</a></li>
                <li><a href="#/privacidad">Política de privacidad</a></li>
                <li><a href="#/arrepentimiento">Botón de arrepentimiento</a></li>
                <li><a href="${STORE_CONFIG.consumerDefense}" target="_blank" rel="noopener">Defensa del consumidor</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-legal">
            <p>© ${new Date().getFullYear()} TRN Periféricos. ${STORE_CONFIG.address}.</p>
          </div>
        </div>`;
    }
    bindWhatsAppChrome();
  }

  function mobileMenuHTML() {
    return `
      <form class="header-search" data-header-search role="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
        <input type="search" name="q" placeholder="Buscar en el catálogo" aria-label="Buscar en el catálogo" value="${escapeHtml(state.catalog.q)}" />
      </form>
      <a href="#/" data-nav="home">Inicio</a>
      <a href="#/catalogo" data-nav="catalog">Catálogo</a>
      <a href="#/catalogo?cat=ofertas" data-nav="ofertas">Ofertas</a>
      ${CATEGORY_INFO.map((c) => `<a href="#/catalogo?cat=${encodeURIComponent(c.name)}">${escapeHtml(c.name)}</a>`).join("")}
      <a href="#/envios">Envíos</a>
      <a href="#/faq">Preguntas frecuentes</a>
      <a href="#/contacto">Contacto</a>
      <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp ${escapeHtml(STORE_CONFIG.whatsappDisplay)}</a>
    `;
  }

  function setDocumentTitle(title) {
    document.title = title ? `${title} — TRN` : "TRN — Periféricos para jugar en serio";
  }


  function activeDiscount(p) {
    const d = Math.min(100, Math.max(0, Number(p && p.discount) || 0));
    if (d <= 0) return 0;
    if (p.discountUntil) {
      const end = new Date(`${p.discountUntil}T23:59:59`);
      if (Number.isNaN(+end) || end < new Date()) return 0;
    }
    return d;
  }

  function unitPrice(p) {
    const d = activeDiscount(p);
    const price = Math.round(Number(p.price) || 0);
    return d ? Math.round(price * (1 - d / 100)) : price;
  }

  function saleBadge(p) {
    const d = activeDiscount(p);
    return d ? `<span class="badge badge-sale">−${d}%</span>` : "";
  }

  function variantList(p) {
    const raw = (p && p.variants && p.variants.length) ? p.variants : ["Único"];
    return raw.map((v) => {
      if (typeof v === "string") return { name: v, images: [], stock: null };
      return {
        name: v.name || "Único",
        images: Array.isArray(v.images) ? v.images.filter(Boolean) : (v.image ? [v.image] : []),
        stock: v.stock == null || v.stock === "" ? null : Number(v.stock)
      };
    });
  }

  function variantOf(p, name) {
    const list = variantList(p);
    return list.find((v) => v.name === name) || list[0];
  }

  function variantImages(p, name) {
    const v = variantOf(p, name);
    if (v && v.images && v.images.length) return v.images;
    if (p && p.image) return [p.image];
    return [];
  }

  function variantStock(p, name) {
    const v = name ? variantOf(p, name) : null;
    if (v && v.stock != null && !Number.isNaN(v.stock)) return v.stock;
    return Number(p.stock) || 0;
  }

  function totalStock(p) {
    const list = variantList(p);
    const numbered = list.filter((v) => v.stock != null && !Number.isNaN(v.stock));
    if (list.length && numbered.length === list.length) {
      return numbered.reduce((s, v) => s + Number(v.stock), 0);
    }
    return Number(p.stock) || 0;
  }

  const VARIANT_COLORS = {
    negro: "#18181b",
    black: "#18181b",
    blanco: "#f4f4f4",
    white: "#f4f4f4",
    hielo: "#e2e8f0",
    gris: "#71717a",
    grafito: "#3f3f46",
    carbón: "#27272a",
    carbon: "#27272a",
    titanio: "#a1a1aa",
    plata: "#d4d4d8",
    transparente: "#ececec",
    claro: "#f4f4f5",
    frost: "#f1f5f9",
    "negro ahumado": "#27272a",
    mixto: "#52525b",
    rosa: "#f472b6",
    rojo: "#ef4444",
    azul: "#3b82f6",
    verde: "#22c55e"
  };

  function colorHex(name) {
    const key = String(name || "negro").trim().toLowerCase();
    return VARIANT_COLORS[key] || "#18181b";
  }

  function isLightColor(hex) {
    const h = hex.replace("#", "");
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 186;
  }

  function swatchStyle(name) {
    const hex = colorHex(name);
    const border = isLightColor(hex) ? "#18181b" : hex;
    return `background:${hex};border:1.5px solid ${border}`;
  }


  function toast(msg) {
    const el = $("[data-toast]");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 2400);
  }

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getProducts() {
    const override = loadJSON(LS.products, null);
    return Array.isArray(override) ? override : structuredClone(PRODUCTS);
  }

  function setProducts(list) {
    saveJSON(LS.products, list);
  }

  function resetProducts() {
    localStorage.removeItem(LS.products);
  }

  function getProduct(id) {
    return getProducts().find((p) => p.id === id) || null;
  }

  function categoryIcon(name) {
    /* Icons: Phosphor Fill (MIT) for Mouse; Material Symbols Rounded filled (Apache 2.0)
       for Teclados and Auriculares in-ear. Glasspads, Mousepads, Mangas and Skates
       are composed with the same filled weight. */
    const MS = '0 -960 960 960';
    const PH = '0 0 256 256';
    const icons = {
      Mouse: { vb: PH, inner: `<path fill="currentColor" d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,64v24H136V32h8A48.05,48.05,0,0,1,192,80ZM112,32h8v72H64V80A48.05,48.05,0,0,1,112,32Z"/>` },
      Teclados: { vb: MS, inner: `<path fill="currentColor" fill-rule="evenodd" d="M160-200q-33 0-56.5-23.5T80-280v-400q0-33 23.5-56.5T160-760h640q33 0 56.5 23.5T880-680v400q0 33-23.5 56.5T800-200H160Zm200-120h240q17 0 28.5-11.5T640-360q0-17-11.5-28.5T600-400H360q-17 0-28.5 11.5T320-360q0 17 11.5 28.5T360-320Zm-91.5-251.5Q280-583 280-600t-11.5-28.5Q257-640 240-640t-28.5 11.5Q200-617 200-600t11.5 28.5Q223-560 240-560t28.5-11.5Zm120 0Q400-583 400-600t-11.5-28.5Q377-640 360-640t-28.5 11.5Q320-617 320-600t11.5 28.5Q343-560 360-560t28.5-11.5Zm120 0Q520-583 520-600t-11.5-28.5Q497-640 480-640t-28.5 11.5Q440-617 440-600t11.5 28.5Q463-560 480-560t28.5-11.5Zm120 0Q640-583 640-600t-11.5-28.5Q617-640 600-640t-28.5 11.5Q560-617 560-600t11.5 28.5Q583-560 600-560t28.5-11.5Zm120 0Q760-583 760-600t-11.5-28.5Q737-640 720-640t-28.5 11.5Q680-617 680-600t11.5 28.5Q703-560 720-560t28.5-11.5Zm-480 120Q280-463 280-480t-11.5-28.5Q257-520 240-520t-28.5 11.5Q200-497 200-480t11.5 28.5Q223-440 240-440t28.5-11.5Zm120 0Q400-463 400-480t-11.5-28.5Q377-520 360-520t-28.5 11.5Q320-497 320-480t11.5 28.5Q343-440 360-440t28.5-11.5Zm120 0Q520-463 520-480t-11.5-28.5Q497-520 480-520t-28.5 11.5Q440-497 440-480t11.5 28.5Q463-440 480-440t28.5-11.5Zm120 0Q640-463 640-480t-11.5-28.5Q617-520 600-520t-28.5 11.5Q560-497 560-480t11.5 28.5Q583-440 600-440t28.5-11.5Zm120 0Q760-463 760-480t-11.5-28.5Q737-520 720-520t-28.5 11.5Q680-497 680-480t11.5 28.5Q703-440 720-440t28.5-11.5Z"/>` },
      Mousepads: { vb: PH, inner: `<path fill="currentColor" fill-rule="evenodd" d="M40 52h176a20 20 0 0 1 20 20v112a20 20 0 0 1-20 20H40a20 20 0 0 1-20-20V72a20 20 0 0 1 20-20zm16 22h144a8 8 0 0 1 8 8v88a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8V82a8 8 0 0 1 8-8z"/>` },
      Glasspads: { vb: PH, inner: `<path fill="currentColor" fill-rule="evenodd" d="M36 52h184a20 20 0 0 1 20 20v112a20 20 0 0 1-20 20H36a20 20 0 0 1-20-20V72a20 20 0 0 1 20-20zm92 116 72-66 8 9-72 66-8-9zm-24 18 80-74 8 9-80 74-8-9z"/>` },
      "Auriculares in-ear": { vb: MS, inner: `<path fill="currentColor" d="M178.5-178.5Q120-237 120-320v-392q0-54 33-91t87-37q54 0 87 33t33 87q0 51-34.5 85.5T240-600h-40v280q0 50 35 85t85 35q50 0 85-35t35-85v-320q0-83 58.5-141.5T640-840q83 0 141.5 58.5T840-640v400q0 51-38.5 85.5T712-120q-51 0-81.5-34.5T600-240q0-51 34.5-85.5T720-360h40v-280q0-50-35-85t-85-35q-50 0-85 35t-35 85v320q0 83-58.5 141.5T320-120q-83 0-141.5-58.5Z"/>` },
      Mangas: { vb: PH, inner: `<path fill="currentColor" d="M56 40h144a20 20 0 0 1 20 20v136a20 20 0 0 1-20 20H56a20 20 0 0 1-20-20V60a20 20 0 0 1 20-20z"/>` },
      Skates: { vb: PH, inner: `<path fill="currentColor" d="M52 28h152a20 20 0 0 1 20 20v160a20 20 0 0 1-20 20H52a20 20 0 0 1-20-20V48a20 20 0 0 1 20-20z"/><circle class="icon-cut" cx="92" cy="84" r="14"/><circle class="icon-cut" cx="128" cy="84" r="14"/><circle class="icon-cut" cx="164" cy="84" r="14"/><circle class="icon-cut" cx="92" cy="128" r="14"/><circle class="icon-cut" cx="128" cy="128" r="14"/><circle class="icon-cut" cx="164" cy="128" r="14"/><circle class="icon-cut" cx="92" cy="172" r="14"/><circle class="icon-cut" cx="128" cy="172" r="14"/><circle class="icon-cut" cx="164" cy="172" r="14"/>` }
    };
    const icon = icons[name] || icons.Mouse;
    return `<svg viewBox="${icon.vb}" role="img" aria-hidden="true">${icon.inner}</svg>`;
  }

  function productArt(product, variantName) {
    const name = variantName || variantList(product)[0]?.name || "";
    const imgs = variantImages(product, name);
    if (imgs[0]) {
      return `<img src="${escapeHtml(imgs[0])}" alt="${escapeHtml(product.name)} — ${escapeHtml(name)}" />`;
    }
    const hex = colorHex(name);
    const light = isLightColor(hex);
    const outline = light ? `filter:drop-shadow(0 0 0 #18181b) drop-shadow(0 0 1.2px #18181b)` : "";
    const svg = categoryIcon(product.category);
    return svg.replace(
      "<svg ",
      `<svg role="img" aria-label="${escapeHtml(product.name)}" style="color:${hex};${outline}" `
    );
  }

  function galleryHTML(product, variantName) {
    const imgs = variantImages(product, variantName);
    if (imgs.length <= 1) return "";
    return `<div class="gallery" data-gallery>
      ${imgs.map((src, i) => `<button type="button" class="gallery-thumb ${i === 0 ? "is-active" : ""}" data-action="gallery" data-src="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt=""></button>`).join("")}
    </div>`;
  }

  
  function stockBadge(product, variantName) {
    const n = variantName ? variantStock(product, variantName) : totalStock(product);
    if (n <= 0) return `<span class="badge badge-out">Sin stock</span>`;
    if (n <= 5) return `<span class="badge badge-warn">Últimas ${n}</span>`;
    return `<span class="badge badge-ok">En stock</span>`;
  }

  function route() {
    const raw = (location.hash || "#/").replace(/^#/, "") || "/";
    const [pathPart, query] = raw.split("?");
    const parts = pathPart.split("/").filter(Boolean);
    const params = new URLSearchParams(query || "");
    const view = parts[0] || "home";

    closeMenus();
    highlightNav(view);
    syncHeaderSearch(view === "catalogo" ? params.get("q") || state.catalog.q : "");

    if (view === "catalogo") {
      state.catalog.cat = params.get("cat") || "todas";
      if (params.has("q")) state.catalog.q = params.get("q") || "";
      renderCatalog();
    } else if (view === "producto" && parts[1]) renderProduct(parts[1]);
    else if (view === "admin") renderAdmin();
    else if (SITE_PAGES[view]) renderPage(view);
    else renderHome();

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function syncHeaderSearch(value) {
    $$("[data-header-search] input").forEach((input) => {
      if (document.activeElement !== input) input.value = value || "";
    });
  }

  function highlightNav(view) {
    const ofertas = view === "catalogo" && (state.catalog.cat === "ofertas");
    $$("[data-nav]").forEach((a) => {
      const nav = a.dataset.nav;
      const on = (nav === "home" && (view === "home" || !view))
        || (nav === "catalog" && (view === "catalogo" || view === "producto") && !ofertas)
        || (nav === "ofertas" && ofertas);
      a.classList.toggle("is-active", on);
    });
  }

  function renderPage(slug) {
    const page = SITE_PAGES[slug];
    if (!page) return renderHome();
    const isFaq = slug === "faq";
    $("#app").innerHTML = `
      ${breadcrumbs([
        { href: "#/", label: "Inicio" },
        { href: `#/${slug}`, label: page.title }
      ])}
      <article class="prose">
        <p class="page-kicker">${escapeHtml(page.kicker || "TRN")}</p>
        <h1>${escapeHtml(page.title)}</h1>
        ${isFaq ? faqHTML() : page.body}
      </article>
    `;
    setDocumentTitle(page.title);
  }

  function closeMenus() {
    state.menuOpen = false;
    const nav = $("[data-mobile-nav]");
    nav.classList.remove("is-open");
    nav.hidden = true;
    const menuBtn = $("[data-action=menu]");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    setFilterSheet(false);
  }

  function renderHome() {
    const featured = getProducts().filter((p) => totalStock(p) > 0).slice(0, 8);
    const offers = getProducts().filter((p) => activeDiscount(p) > 0).slice(0, 4);
    $("#app").innerHTML = `
      <section class="hero">
        <p class="eyebrow">Tienda de periféricos</p>
        <h1>TRN</h1>
        <p class="lead">Periféricos para jugar en serio. Mouse, teclados, pads y audio con especificación clara, envíos a todo el país y soporte que te responde.</p>
        <div class="hero-actions">
          <a class="btn btn-solid" href="#/catalogo">Ver el catálogo</a>
          <a class="btn btn-ghost" href="${waLink()}" target="_blank" rel="noopener">${waIcon()} Consultar por WhatsApp</a>
        </div>
      </section>
      <div class="trust-bar">
        <article><h3>Atención directa por WhatsApp</h3><p>Consultá stock y colores, te confirmamos y te pasamos el link de pago o los datos de transferencia.</p></article>
        <article><h3>Garantía oficial 6 meses</h3><p>Cubrimos fallas de fabricación. Si algo no anda, lo resolvemos.</p></article>
        <article><h3>Envíos a todo el país</h3><p>Despacho el mismo día hábil si el pago entra antes de las 13 h.</p></article>
        <article><h3>Pagá con Mercado Pago o transferencia</h3><p>Hasta ${STORE_CONFIG.installments} cuotas sin interés con Mercado Pago, o ${pct()}% off por transferencia, después de consultarnos.</p></article>
      </div>
      <div class="cat-head">
        <h2>¿Qué buscás?</h2>
        <a class="btn btn-ghost btn-sm" href="#/catalogo">Ver todo</a>
      </div>
      <div class="cat-pills" data-cat-pills>
        <a class="cat-pill" href="#/catalogo?cat=ofertas">Ofertas</a>
        ${CATEGORIES.map((c) => `<a class="cat-pill" href="#/catalogo?cat=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`).join("")}
      </div>
      <div class="section-head">
        <h2>Destacados</h2>
        <a href="#/catalogo">Ver todo el catálogo</a>
      </div>
      <div class="product-grid">${featured.map(productCard).join("")}</div>
      ${offers.length ? `
        <div class="section-head">
          <h2>Ofertas de ahora</h2>
          <a href="#/catalogo?cat=ofertas">Ver todas las ofertas</a>
        </div>
        <div class="product-grid">${offers.map(productCard).join("")}</div>
      ` : ""}
      <div class="section-head"><h2>Por qué TRN</h2></div>
      <div class="why-grid">
        <article>
          <h3>Especificación de verdad</h3>
          <p>Publicamos sensor, peso, polling, materiales y medidas. Lo que ves en la ficha es lo que llega a tu mesa.</p>
        </article>
        <article>
          <h3>Curado para competir</h3>
          <p>No llenamos el catálogo de ruido. Elegimos shapes, pads y audio que se bancan train diario y una ranked.</p>
        </article>
        <article>
          <h3>Soporte en Argentina</h3>
          <p>Garantía oficial, cambios claros y alguien que te responde por mail o WhatsApp, en español y en horario local.</p>
        </article>
      </div>
      <div class="section-head">
        <h2>Preguntas frecuentes</h2>
        <a href="#/faq">Ver todas</a>
      </div>
      ${faqHTML(5)}
    `;
    setDocumentTitle("");
  }

  function productCard(p) {
    const vars = variantList(p);
    const variant = vars[0]?.name || "Único";
    const now = unitPrice(p);
    const d = activeDiscount(p);
    const out = totalStock(p) <= 0;
    return `
      <article class="card${out ? " is-out" : ""}" data-card-id="${escapeHtml(p.id)}">
        <a class="card-link" href="#/producto/${encodeURIComponent(p.id)}">
          <div class="card-media" data-card-media>
            ${stockBadge(p)}
            ${saleBadge(p)}
            ${productArt(p, variant)}
          </div>
          <div class="card-body">
            <div class="card-cat">${escapeHtml(p.category)}</div>
            <h3>${escapeHtml(p.name)}</h3>
            <div class="card-price">
              <div class="amounts">
                ${d ? `<span class="price-old">${formatARS(p.price)}</span>` : ""}
                <span class="amount">${formatARS(now)}</span>
              </div>
              <span class="alt">${formatARS(transferPrice(now))} con transferencia</span>
            </div>
          </div>
        </a>
        <div class="card-actions">
          <a class="btn-wa btn-wa-sm" data-card-wa href="${waProductHref(p, variant, 1)}" target="_blank" rel="noopener" data-id="${escapeHtml(p.id)}" data-variant="${escapeHtml(variant)}">${waIcon()} Consultar</a>
        </div>
        ${vars.length > 1 ? `<div class="color-dots" role="list">
          ${vars.map((v, i) => `<button type="button" class="swatch ${i===0?"is-active":""}" role="listitem" data-action="card-color" data-id="${escapeHtml(p.id)}" data-variant="${escapeHtml(v.name)}" style="${swatchStyle(v.name)}" aria-label="${escapeHtml(v.name)}"></button>`).join("")}
        </div>` : ""}
      </article>`;
  }

  function catalogPills(cat) {
    return `
      <button class="pill ${cat === "todas" ? "is-active" : ""}" type="button" data-action="filter-cat" data-cat="todas">Todas</button>
      <button class="pill ${cat === "ofertas" ? "is-active" : ""}" type="button" data-action="filter-cat" data-cat="ofertas">Ofertas</button>
      ${CATEGORIES.map((c) => `<button class="pill ${cat === c ? "is-active" : ""}" type="button" data-action="filter-cat" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}`;
  }

  function sortSelect(sort) {
    return `<select class="select" data-action="sort" aria-label="Ordenar el catálogo">
      <option value="destacados" ${sort === "destacados" ? "selected" : ""}>Destacados</option>
      <option value="precio-asc" ${sort === "precio-asc" ? "selected" : ""}>Precio: menor a mayor</option>
      <option value="precio-desc" ${sort === "precio-desc" ? "selected" : ""}>Precio: mayor a menor</option>
      <option value="stock" ${sort === "stock" ? "selected" : ""}>Con más stock</option>
    </select>`;
  }

  function filteredCatalog() {
    const { q, cat, sort } = state.catalog;
    let list = getProducts();
    if (cat === "ofertas") list = list.filter((p) => activeDiscount(p) > 0);
    else if (cat && cat !== "todas") list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.description, p.category].join(" ").toLowerCase().includes(needle)
      );
    }
    if (sort === "precio-asc") list = [...list].sort((a, b) => unitPrice(a) - unitPrice(b));
    if (sort === "precio-desc") list = [...list].sort((a, b) => unitPrice(b) - unitPrice(a));
    if (sort === "stock") list = [...list].sort((a, b) => totalStock(b) - totalStock(a));
    return list;
  }

  function renderCatalog() {
    const { q, cat, sort } = state.catalog;
    const list = filteredCatalog();
    const title = cat === "ofertas" ? "Ofertas" : cat && cat !== "todas" ? cat : "Catálogo";
    const info = CATEGORY_INFO.find((c) => c.name === cat);
    $("#app").innerHTML = `
      ${breadcrumbs([{ href: "#/", label: "Inicio" }, { href: "#/catalogo", label: "Catálogo" }, ...(cat && cat !== "todas" ? [{ href: `#/catalogo?cat=${encodeURIComponent(cat)}`, label: title }] : [])])}
      <div class="section-head" style="margin-top:0">
        <div>
          <p class="page-kicker">Tienda</p>
          <h2>${escapeHtml(title)}</h2>
          ${info ? `<p class="results-meta" style="margin:8px 0 0">${escapeHtml(info.subtitle)}</p>` : ""}
        </div>
      </div>
      <div class="catalog-sticky">
        <div class="pill-row pills">${catalogPills(cat)}</div>
        <div class="toolbar">
          <input class="search" type="search" placeholder="Buscar por nombre o tipo…" value="${escapeHtml(q)}" data-action="search" aria-label="Buscar en el catálogo" />
          ${sortSelect(sort)}
          <button class="btn btn-ghost filters-open" type="button" data-action="filters-open">Filtros</button>
        </div>
      </div>
      <p class="results-meta">${list.length} ${list.length === 1 ? "producto" : "productos"}${q.trim() ? ` para “${escapeHtml(q.trim())}”` : ""}</p>
      ${list.length ? `<div class="product-grid">${list.map(productCard).join("")}</div>` : `
        <div class="empty">
          <h2>No encontramos lo que estás buscando</h2>
          <p>Probá con otra palabra, sacá los filtros o mirá el catálogo completo. Si no está, escribinos y te decimos cuándo vuelve.</p>
          <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
            <a class="btn btn-solid" href="#/catalogo">Ver todo el catálogo</a>
            <a class="btn btn-ghost" href="${waLink()}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
          </div>
        </div>`}
    `;
    const sheet = $("[data-filter-sheet-body]");
    if (sheet) {
      sheet.innerHTML = `
        <p class="option-label">Categoría</p>
        <div class="pill-row">${catalogPills(cat)}</div>
        <p class="option-label" style="margin-top:16px">Orden</p>
        ${sortSelect(sort)}
        <button class="btn btn-solid btn-block" style="margin-top:20px" type="button" data-action="filters-close">Ver ${list.length} ${list.length === 1 ? "producto" : "productos"}</button>
      `;
    }
    syncHeaderSearch(q);
    setDocumentTitle(title);
  }

  function renderProduct(id) {
    const p = getProduct(id);
    if (!p) {
      $("#app").innerHTML = `<div class="empty"><h2>No encontramos ese producto</h2><p>Puede que se haya agotado o que el enlace esté vencido.</p><p><a class="btn btn-solid" href="#/catalogo" style="margin-top:16px">Volver al catálogo</a></p></div>`;
      setDocumentTitle("Producto no encontrado");
      return;
    }
    const vars = variantList(p);
    const variant = vars[0]?.name || "Único";
    const now = unitPrice(p);
    const d = activeDiscount(p);
    const stock = variantStock(p, variant);
    const urgency = stockCopy(p, variant);
    const specs = Array.isArray(p.specs) ? p.specs : [];
    const related = getProducts().filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
    const taken = new Set([p.id, ...related.map((x) => x.id)]);
    const fill = related.length < 4
      ? getProducts().filter((x) => !taken.has(x.id) && totalStock(x) > 0).slice(0, 4 - related.length)
      : [];
    const also = [...related, ...fill];
    $("#app").innerHTML = `
      ${breadcrumbs([
        { href: "#/", label: "Inicio" },
        { href: "#/catalogo", label: "Catálogo" },
        { href: `#/catalogo?cat=${encodeURIComponent(p.category)}`, label: p.category },
        { href: `#/producto/${encodeURIComponent(p.id)}`, label: p.name }
      ])}
      <div class="product-view">
        <div>
          <div class="product-art" data-main-art>${productArt(p, variant)}</div>
          ${galleryHTML(p, variant)}
        </div>
        <div class="product-info">
          <div class="card-cat">${escapeHtml(p.category)}</div>
          <h1>${escapeHtml(p.name)}</h1>
          <div class="price-box">
            <div class="price">
              ${d ? `<span class="price-old">${formatARS(p.price)}</span>` : ""}
              <span>${formatARS(now)}</span>
              ${saleBadge(p)}
            </div>
            <p class="cuotas">Hasta ${STORE_CONFIG.installments} cuotas sin interés de ${formatARS(cuotasOf(now))} con Mercado Pago</p>
            <p class="price-alt">${formatARS(transferPrice(now))} pagando con transferencia · ${pct()}% off</p>
          </div>
          <p class="stock-msg ${urgency.cls}" data-stock-msg>${escapeHtml(urgency.text)}</p>
          <div style="margin-top:8px" data-stock-slot>${stockBadge(p, variant)}</div>
          ${vars.length ? `
            <div class="option-label">Color</div>
            <div class="pill-row" data-variants>
              ${vars.map((v, i) => `
                <button class="pill ${i === 0 ? "is-active" : ""}" type="button" data-action="pick-variant" data-variant="${escapeHtml(v.name)}">
                  <span class="swatch swatch-sm" style="${swatchStyle(v.name)}"></span>
                  ${escapeHtml(v.name)}
                </button>
              `).join("")}
            </div>` : ""}
          <div class="option-label">Cantidad</div>
          <div class="qty" data-qty>
            <button type="button" data-action="qty" data-delta="-1" aria-label="Restar cantidad">−</button>
            <span data-qty-value>1</span>
            <button type="button" data-action="qty" data-delta="1" aria-label="Sumar cantidad">+</button>
          </div>
          <div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:8px">
            <a class="btn-wa" data-wa-product="${escapeHtml(p.id)}" data-variant="${escapeHtml(variant)}" href="${waProductHref(p, variant, 1)}" target="_blank" rel="noopener">
              ${waIcon()} Consultar por WhatsApp
            </a>
            <a class="btn btn-ghost" href="#/catalogo?cat=${encodeURIComponent(p.category)}">Seguir mirando</a>
          </div>
          <div class="ship-box">
            <h3>Calcular envío</h3>
            <form class="ship-row" data-ship-form>
              <label class="sr-only" for="ship-cp">Código postal</label>
              <input id="ship-cp" name="cp" inputmode="numeric" maxlength="4" placeholder="Código postal" aria-label="Código postal" />
              <button class="btn btn-ghost" type="submit">Calcular</button>
            </form>
            <p class="ship-result" data-ship-result>Ingresá tu código postal y te decimos plazo y costo estimados. Envío gratis desde ${formatARS(STORE_CONFIG.freeShipping)}.</p>
          </div>
        </div>
      </div>
      <div class="prod-tabs" data-tabs>
        <button type="button" class="is-active" data-action="tab" data-tab="desc">Descripción</button>
        <button type="button" data-action="tab" data-tab="specs">Especificaciones</button>
        <button type="button" data-action="tab" data-tab="ship">Envío y garantía</button>
      </div>
      <div class="tab-panel is-active" data-tab-panel="desc">
        <div class="prose"><p>${escapeHtml(p.description)}</p></div>
      </div>
      <div class="tab-panel" data-tab-panel="specs">
        ${specs.length ? `<table class="spec-table"><tbody>${specs.map((row) => {
          const [label, value] = Array.isArray(row) ? row : [row.label, row.value];
          return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
        }).join("")}</tbody></table>` : `<p class="note">Las especificaciones de este producto se publican en la descripción.</p>`}
      </div>
      <div class="tab-panel prose" data-tab-panel="ship">
        <p>Envíos a todo el país. En CABA, 1 a 2 días hábiles; en GBA, 2 a 4; en el interior, 3 a 7, según la zona. Los pedidos pagos antes de las 13 h salen el mismo día hábil. Envío gratis en compras desde ${formatARS(STORE_CONFIG.freeShipping)}.</p>
        <p>Garantía oficial TRN de 6 meses por fallas de fabricación. Tenés 30 días para cambios o devoluciones si el producto está sin uso y con su embalaje. Más detalle en <a href="#/envios">Envíos</a>, <a href="#/cambios">Cambios</a> y <a href="#/garantia">Garantía</a>.</p>
      </div>
      ${also.length ? `
        <div class="section-head"><h2>También te puede interesar</h2></div>
        <div class="product-grid">${also.map(productCard).join("")}</div>
      ` : ""}
    `;
    setDocumentTitle(p.name);
  }

  function isAdmin() {
    return localStorage.getItem(LS.admin) === "1";
  }

  function renderAdmin() {
    if (!isAdmin()) {
      $("#app").innerHTML = `
        <form class="admin-gate" data-admin-login>
          <p class="eyebrow">Panel</p>
          <h2 style="font-size:1.75rem;letter-spacing:-0.04em;margin-bottom:8px">Administración</h2>
          <p class="note" style="margin-bottom:16px">La contraseña del panel está documentada en el README del proyecto.</p>
          <label class="field"><span>Contraseña</span><input type="password" name="password" required autofocus /></label>
          <button class="btn btn-solid btn-block" style="margin-top:16px" type="submit">Entrar</button>
        </form>`;
      return;
    }

    const tab = state.adminTab;
    $("#app").innerHTML = `
      <div class="admin">
        <div class="section-head" style="margin-top:0">
          <h2>Admin TRN</h2>
          <button class="btn btn-ghost btn-sm" type="button" data-action="admin-logout">Salir</button>
        </div>
        ${adminInventory()}
      </div>
      ${state.formProduct !== null ? productFormModal(state.formProduct) : ""}
    `;
  }

  function adminInventory() {
    const q = state.adminQ.trim().toLowerCase();
    const list = getProducts().filter((p) =>
      !q || [p.name, p.category, p.id].join(" ").toLowerCase().includes(q)
    );
    return `
      <div class="admin-actions">
        <button class="btn btn-solid btn-sm" type="button" data-action="product-new">Cargar producto</button>
        <button class="btn btn-solid btn-sm" type="button" data-action="export-catalog">Exportar catálogo</button>
        <button class="btn btn-ghost btn-sm" type="button" data-action="csv-template">Bajar plantilla CSV</button>
        <label class="btn btn-ghost btn-sm">Importar CSV<input type="file" accept=".csv,text/csv" hidden data-action="csv-import" /></label>
        <button class="btn btn-ghost btn-sm" type="button" data-action="reset-catalog">Restablecer</button>
        <input class="search" type="search" placeholder="Filtrar inventario…" value="${escapeHtml(state.adminQ)}" data-action="admin-search" />
      </div>
      <div class="bulk-row">
        <span>Descuento por categoría</span>
        <select data-bulk-cat aria-label="Categoría">
          ${CATEGORIES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}
        </select>
        <input type="number" min="0" max="100" step="1" placeholder="%" data-bulk-pct aria-label="Porcentaje de descuento" />
        <input type="date" data-bulk-until aria-label="Vence" />
        <button class="btn btn-soft btn-sm" type="button" data-action="bulk-discount">Aplicar a la categoría</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Dto.</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map((p) => `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.category)}</td>
                <td>
                  <span class="price-edit">
                    <input type="number" min="0" step="1" value="${p.price}" aria-label="Precio de ${escapeHtml(p.name)}" data-action="edit-price" data-id="${escapeHtml(p.id)}" />
                  </span>
                </td>
                <td>${activeDiscount(p) ? `−${activeDiscount(p)}%` : "—"}</td>
                <td>
                  <span class="stock-edit">
                    <button type="button" data-action="stock" data-id="${escapeHtml(p.id)}" data-delta="-1" aria-label="Restar stock">−</button>
                    <strong>${totalStock(p)}</strong>
                    <button type="button" data-action="stock" data-id="${escapeHtml(p.id)}" data-delta="1" aria-label="Sumar stock">+</button>
                  </span>
                </td>
                <td style="white-space:nowrap">
                  <button class="btn btn-soft btn-sm" type="button" data-action="product-edit" data-id="${escapeHtml(p.id)}">Editar</button>
                  <button class="btn btn-ghost btn-sm" type="button" data-action="product-del" data-id="${escapeHtml(p.id)}">Borrar</button>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="6">No hay productos con ese filtro.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function productFormModal(product) {
    const p = product && (product.id || product._isNew || product.name != null) ? product : {
      id: "",
      name: "",
      category: CATEGORIES[0],
      price: 0,
      stock: 0,
      discount: 0,
      discountUntil: "",
      description: "",
      variants: [{ name: "Negro", images: [], stock: 0 }],
      image: ""
    };
    const vars = variantList(p);
    return `
      <div class="form-modal">
        <div class="overlay is-open" data-action="form-close"></div>
        <form class="panel product-form-panel" data-product-form>
          <h2>${p.id && getProduct(p.id) && state.formProduct && state.formProduct._isNew !== true ? "Editar producto" : "Nuevo producto"}</h2>
          <input type="hidden" name="id" value="${escapeHtml(p.id || "")}" />
          <div class="form-grid">
            <label class="field span-2"><span>Nombre</span><input name="name" required value="${escapeHtml(p.name || "")}" /></label>
            <label class="field">
              <span>Categoría</span>
              <select name="category">${CATEGORIES.map((c) => `<option ${c === p.category ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select>
            </label>
            <label class="field"><span>Precio (ARS, sin puntos)</span><input type="number" min="0" name="price" required value="${p.price || 0}" /></label>
            <label class="field"><span>Stock general</span><input type="number" min="0" name="stock" required value="${p.stock ?? 0}" /></label>
            <label class="field"><span>Descuento %</span><input type="number" min="0" max="100" name="discount" value="${p.discount || 0}" /></label>
            <label class="field"><span>Vence (opcional)</span><input type="date" name="discountUntil" value="${escapeHtml(p.discountUntil || "")}" /></label>
            <label class="field span-2"><span>Descripción</span><textarea name="description">${escapeHtml(p.description || "")}</textarea></label>
          </div>
          <div class="option-label">Colores e imágenes</div>
          <div class="variant-rows" data-variant-rows>
            ${vars.map((v, i) => variantRowHTML(v, i)).join("")}
          </div>
          <button class="btn btn-ghost btn-sm" type="button" data-action="variant-add">+ Agregar color</button>
          <div style="display:flex;gap:8px;margin-top:24px;justify-content:flex-end">
            <button class="btn btn-ghost" type="button" data-action="form-close">Cancelar</button>
            <button class="btn btn-solid" type="submit">Guardar</button>
          </div>
        </form>
      </div>
    `;
  }

  function variantRowHTML(v, i) {
    const images = v.images || [];
    return `
      <div class="variant-row" data-variant-row>
        <span class="swatch" style="${swatchStyle(v.name)}"></span>
        <label class="field"><span>Color</span><input name="v_name" required value="${escapeHtml(v.name || "")}" /></label>
        <label class="field"><span>Stock</span><input type="number" min="0" name="v_stock" value="${v.stock ?? ""}" placeholder="—" /></label>
        <div class="field span-2">
          <span>Fotos de este color</span>
          <label class="file-pill">
            <input class="sr-only" type="file" accept="image/*" multiple data-action="variant-image" />
            Elegir fotos
          </label>
          <input type="hidden" name="v_images" value="${escapeHtml(JSON.stringify(images))}" />
          <div class="thumbs">
            ${images.map((src, n) => `
              <span class="thumb-wrap">
                <img class="preview-img" src="${escapeHtml(src)}" alt="">
                <button type="button" class="thumb-del" data-action="variant-img-del" data-n="${n}">×</button>
              </span>
            `).join("")}
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-action="variant-remove" aria-label="Quitar color">Quitar</button>
      </div>`;
  }

  function readVariantsFromForm(form) {
    const rows = [...form.querySelectorAll("[data-variant-row]")];
    return rows.map((row) => {
      let images = [];
      try { images = JSON.parse(row.querySelector("[name=v_images]").value || "[]"); } catch {}
      const stockRaw = row.querySelector("[name=v_stock]").value;
      return {
        name: (row.querySelector("[name=v_name]").value || "").trim() || "Único",
        images: Array.isArray(images) ? images : [],
        stock: stockRaw === "" ? null : Number(stockRaw)
      };
    }).filter((v) => v.name);
  }

  function snapshotFormProduct(form) {
    if (!form) return;
    const fd = new FormData(form);
    state.formProduct = {
      ...(state.formProduct || {}),
      id: String(fd.get("id") || ""),
      name: String(fd.get("name") || ""),
      category: String(fd.get("category") || CATEGORIES[0]),
      price: Number(fd.get("price")) || 0,
      stock: Number(fd.get("stock")) || 0,
      discount: Number(fd.get("discount")) || 0,
      discountUntil: String(fd.get("discountUntil") || ""),
      description: String(fd.get("description") || ""),
      variants: readVariantsFromForm(form)
    };
  }

  function exportCatalog() {
    const header = `/* TRN — catálogo exportado desde el panel de administración.
 * Reemplazá js/data.js en el repositorio con este archivo y hacé commit
 * para publicar el inventario en GitHub Pages.
 */

`;
    const parts = [
      `const STORE_CONFIG = ${JSON.stringify(STORE_CONFIG, null, 2)};`,
      `const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};`,
      `const CATEGORY_INFO = ${JSON.stringify(CATEGORY_INFO, null, 2)};`,
      `const FAQ_ITEMS = ${JSON.stringify(FAQ_ITEMS, null, 2)};`,
      `const PRODUCTS = ${JSON.stringify(getProducts(), null, 2)};`,
      `const SITE_PAGES = ${JSON.stringify(SITE_PAGES, null, 2)};`
    ];
    downloadText("data.js", header + parts.join("\n\n") + "\n");
    toast("Descargamos data.js. Reemplazalo en el repo y hacé commit para publicarlo.");
  }

  function csvTemplate() {
    const header = "id,name,category,price,stock,description,discount,discountUntil,variants,variante_color,variante_imagen,variante_stock";
    const sample = [
      'mouse-pulse-x2,TRN Pulse X2 Wireless,Mouse,89990,14,"Mouse inalámbrico liviano de 58 g.",10,2026-12-31,"Negro:8:;Blanco:6:",,,',
      'mouse-pulse-x2,,,,,,,, ,Rosa,https://files.trn.com.ar/pulse-rosa.jpg,4'
    ].join("\n");
    downloadText("trn-plantilla.csv", `${header}\n${sample}\n`);
  }

  function downloadText(name, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function parseVariantToken(token) {
    const raw = String(token || "").trim();
    if (!raw) return null;
    const first = raw.indexOf(":");
    if (first < 0) return { name: raw, images: [], stock: null };
    const name = raw.slice(0, first).trim();
    const rest = raw.slice(first + 1);
    const second = rest.indexOf(":");
    if (second < 0) {
      return { name, stock: rest === "" ? null : Number(rest), images: [] };
    }
    const stockPart = rest.slice(0, second);
    const imgs = rest.slice(second + 1).split("|").map((s) => s.trim()).filter(Boolean);
    return { name, stock: stockPart === "" ? null : Number(stockPart), images: imgs };
  }

  function parseCSV(text) {
    const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const split = (line) => {
      const out = [];
      let cur = "";
      let q = false;
      for (const ch of line) {
        if (ch === '"') q = !q;
        else if (ch === "," && !q) {
          out.push(cur);
          cur = "";
        } else cur += ch;
      }
      out.push(cur);
      return out.map((s) => s.trim());
    };
    const headers = split(lines[0]).map((h) => h.toLowerCase());
    const byId = new Map();
    lines.slice(1).forEach((line) => {
      if (!line.trim()) return;
      const cols = split(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] || ""; });
      const extra = [];
      if (row.variants) {
        if (row.variants.includes(":") || row.variants.includes(";")) {
          row.variants.split(";").forEach((tok) => {
            const v = parseVariantToken(tok);
            if (v && v.name) extra.push(v);
          });
        } else {
          row.variants.split(/[|,]/).forEach((n) => {
            if (n.trim()) extra.push({ name: n.trim(), images: [], stock: null });
          });
        }
      }
      if (row.variante_color) {
        extra.push({
          name: row.variante_color,
          images: (row.variante_imagen || "").split("|").map((s) => s.trim()).filter(Boolean),
          stock: row.variante_stock === "" ? null : Number(row.variante_stock)
        });
      }
      const id = row.id || uid("sku");
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          name: row.name,
          category: CATEGORIES.includes(row.category) ? row.category : row.category || CATEGORIES[0],
          price: Number(row.price) || 0,
          stock: Number(row.stock) || 0,
          description: row.description || "",
          discount: Number(row.discount) || 0,
          discountUntil: row.discountuntil || row.discount_until || "",
          variants: extra.length ? extra : [{ name: "Negro", images: [], stock: null }]
        });
      } else {
        const cur = byId.get(id);
        if (row.name) cur.name = row.name;
        if (row.category) cur.category = row.category;
        if (row.price) cur.price = Number(row.price) || cur.price;
        if (row.stock) cur.stock = Number(row.stock) || cur.stock;
        if (row.description) cur.description = row.description;
        if (row.discount) cur.discount = Number(row.discount) || cur.discount;
        if (row.discountuntil || row.discount_until) cur.discountUntil = row.discountuntil || row.discount_until;
        cur.variants = [...variantList(cur), ...extra];
      }
    });
    return [...byId.values()].filter((p) => p.name);
  }

  function currentVariant() {
    return $("[data-variants] .is-active")?.dataset.variant || "";
  }

  function goCatalog(extra = {}) {
    const q = new URLSearchParams();
    const cat = extra.cat ?? state.catalog.cat;
    const query = extra.q ?? state.catalog.q;
    if (cat && cat !== "todas") q.set("cat", cat);
    if (query) q.set("q", query);
    location.hash = `#/catalogo${q.toString() ? "?" + q : ""}`;
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const action = t.dataset.action;

if (action === "menu") {
      state.menuOpen = !state.menuOpen;
      const nav = $("[data-mobile-nav]");
      nav.classList.toggle("is-open", state.menuOpen);
      t.setAttribute("aria-expanded", String(state.menuOpen));
      nav.hidden = !state.menuOpen;
      nav.innerHTML = mobileMenuHTML();
      highlightNav((location.hash.replace("#/", "").split("?")[0].split("/")[0]) || "home");
    }
if (action === "filter-cat") {
      state.catalog.cat = t.dataset.cat;
      setFilterSheet(false);
      goCatalog();
    }
    if (action === "filters-open") setFilterSheet(true);
    if (action === "filters-close") setFilterSheet(false);
    if (action === "tab") {
      const tab = t.dataset.tab;
      $$("[data-tabs] [data-action=tab]").forEach((b) => b.classList.toggle("is-active", b === t));
      $$("[data-tab-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.tabPanel === tab));
    }
    if (action === "pick-variant") {
      $$("[data-variants] .pill").forEach((p) => p.classList.toggle("is-active", p === t));
      const name = t.dataset.variant;
      const wa = $("[data-wa-product]");
      const product = wa ? getProduct(wa.dataset.waProduct) : null;
      if (product) {
        const art = $("[data-main-art]");
        if (art) art.innerHTML = productArt(product, name);
        const slot = $("[data-stock-slot]");
        if (slot) slot.innerHTML = stockBadge(product, name);
        const msg = $("[data-stock-msg]");
        if (msg) {
          const copy = stockCopy(product, name);
          msg.className = `stock-msg ${copy.cls}`;
          msg.textContent = copy.text;
        }
        const qty = $("[data-qty-value]");
        if (qty) qty.textContent = "1";
        const galHost = $(".gallery");
        if (galHost) {
          const html = galleryHTML(product, name);
          galHost.outerHTML = html || '<div class="gallery" data-gallery></div>';
        }
        refreshProductWa();
      }
    }
    if (action === "gallery") {
      const art = $("[data-main-art]");
      if (art) art.innerHTML = `<img src="${escapeHtml(t.dataset.src)}" alt="">`;
      $$(".gallery-thumb").forEach((el) => el.classList.toggle("is-active", el === t));
    }
    if (action === "card-color") {
      e.preventDefault();
      e.stopPropagation();
      const card = t.closest("[data-card-id]");
      const product = getProduct(t.dataset.id);
      if (card && product) {
        const media = card.querySelector("[data-card-media]");
        if (media) {
          const badges = [...media.querySelectorAll(".badge")].map((b) => b.outerHTML).join("");
          media.innerHTML = badges + productArt(product, t.dataset.variant);
        }
        card.querySelectorAll("[data-action=card-color]").forEach((el) => el.classList.toggle("is-active", el === t));
        const wa = card.querySelector("[data-card-wa]");
        if (wa) {
          wa.dataset.variant = t.dataset.variant;
          wa.href = waProductHref(product, t.dataset.variant, 1);
        }
      }
    }
    if (action === "variant-add") {
      e.preventDefault();
      const form = t.closest("form");
      snapshotFormProduct(form);
      const list = variantList(state.formProduct);
      list.push({ name: "Nuevo", images: [], stock: null });
      state.formProduct.variants = list;
      renderAdmin();
    }
    if (action === "variant-remove") {
      e.preventDefault();
      const form = t.closest("form");
      snapshotFormProduct(form);
      const row = t.closest("[data-variant-row]");
      const rows = [...form.querySelectorAll("[data-variant-row]")];
      const idx = rows.indexOf(row);
      const list = variantList(state.formProduct);
      if (list.length > 1 && idx >= 0) list.splice(idx, 1);
      state.formProduct.variants = list;
      renderAdmin();
    }
    if (action === "variant-img-del") {
      e.preventDefault();
      const row = t.closest("[data-variant-row]");
      const hidden = row.querySelector("[name=v_images]");
      let images = [];
      try { images = JSON.parse(hidden.value || "[]"); } catch {}
      images.splice(Number(t.dataset.n), 1);
      hidden.value = JSON.stringify(images);
      const form = t.closest("form");
      snapshotFormProduct(form);
      renderAdmin();
    }
    if (action === "bulk-discount") {
      const cat = document.querySelector("[data-bulk-cat]")?.value;
      const pct = Number(document.querySelector("[data-bulk-pct]")?.value);
      const until = document.querySelector("[data-bulk-until]")?.value || "";
      if (!cat || Number.isNaN(pct) || pct < 0) {
        toast("Completá la categoría y el porcentaje.");
        return;
      }
      const list = getProducts().map((p) => p.category === cat ? { ...p, discount: Math.min(100, pct), discountUntil: until } : p);
      setProducts(list);
      renderAdmin();
      toast(`Descuento de ${pct}% aplicado a ${cat}`);
    }
    if (action === "qty") {
      const el = $("[data-qty-value]");
      const productId = $("[data-wa-product]")?.dataset.waProduct;
      const product = getProduct(productId);
      let n = Number(el.textContent) + Number(t.dataset.delta);
      const vName = currentVariant() || $("[data-wa-product]")?.dataset.variant;
      n = Math.max(1, Math.min(n, product ? Math.max(1, variantStock(product, vName)) : 1));
      el.textContent = String(n);
      refreshProductWa();
    }
    if (action === "admin-logout") {
      localStorage.removeItem(LS.admin);
      renderAdmin();
    }
    if (action === "admin-tab") {
      state.adminTab = t.dataset.tab;
      renderAdmin();
    }
    if (action === "stock") {
      const list = getProducts();
      const p = list.find((x) => x.id === t.dataset.id);
      if (p) {
        p.stock = Math.max(0, p.stock + Number(t.dataset.delta));
        setProducts(list);
        renderAdmin();
        const input = $("[data-action=admin-search]");
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    }
    if (action === "product-new") {
      state.formProduct = { _isNew: true, category: CATEGORIES[0], variants: [{ name: "Negro", images: [], stock: 0 }], price: 0, stock: 0, discount: 0, discountUntil: "" };
      renderAdmin();
    }
    if (action === "product-edit") {
      state.formProduct = { ...getProduct(t.dataset.id) };
      renderAdmin();
    }
    if (action === "form-close") {
      if (t.closest("[data-product-form]")) return;
      state.formProduct = null;
      renderAdmin();
    }
    if (action === "product-del") {
      if (confirm("¿Borrar este producto del inventario?")) {
        setProducts(getProducts().filter((p) => p.id !== t.dataset.id));
        renderAdmin();
        toast("Producto borrado");
      }
    }
    if (action === "reset-catalog") {
      if (confirm("Esto vuelve el catálogo a los productos de data.js y pierde los cambios locales.")) {
        resetProducts();
        renderAdmin();
        toast("Catálogo restablecido");
      }
    }
    if (action === "csv-template") csvTemplate();
    if (action === "export-catalog") exportCatalog();
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.action === "sort") {
      state.catalog.sort = t.value;
      renderCatalog();
    }
    if (t.dataset.action === "edit-price") {
      const list = getProducts();
      const p = list.find((x) => x.id === t.dataset.id);
      if (p) {
        p.price = Math.max(0, Number(t.value) || 0);
        setProducts(list);
      }
    }
if (t.dataset.action === "csv-import" && t.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const rows = parseCSV(String(reader.result));
        if (!rows.length) {
          toast("El CSV no tiene filas válidas.");
          return;
        }
        const list = getProducts();
        for (const row of rows) {
          const i = list.findIndex((p) => p.id === row.id);
          if (i >= 0) list[i] = { ...list[i], ...row };
          else list.push(row);
        }
        setProducts(list);
        renderAdmin();
        toast(`Importamos ${rows.length} producto${rows.length === 1 ? "" : "s"}`);
      };
      reader.readAsText(t.files[0]);
    }
    if (t.dataset.action === "variant-image" && t.files && t.files.length) {
      const row = t.closest("[data-variant-row]");
      const hidden = row.querySelector("[name=v_images]");
      let images = [];
      try { images = JSON.parse(hidden.value || "[]"); } catch {}
      const files = [...t.files];
      let pending = files.length;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          images.push(reader.result);
          pending -= 1;
          if (pending <= 0) {
            hidden.value = JSON.stringify(images);
            const form = t.closest("form");
            snapshotFormProduct(form);
            renderAdmin();
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (t.dataset.action === "product-image" && t.files[0]) {
      const file = t.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const hidden = t.closest("form").querySelector("[name=image]");
        hidden.value = reader.result;
        let img = t.closest("form").querySelector(".preview-img");
        if (img && img.tagName === "IMG") img.src = reader.result;
        else if (img) {
          const next = document.createElement("img");
          next.className = "preview-img";
          next.alt = "Vista previa";
          next.src = reader.result;
          img.replaceWith(next);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.dataset.action === "search") {
      state.catalog.q = e.target.value;
      clearTimeout(renderCatalog._t);
      renderCatalog._t = setTimeout(() => {
        const start = e.target.selectionStart;
        renderCatalog();
        const input = document.querySelector("[data-action=search]");
        if (input) {
          input.focus();
          const pos = typeof start === "number" ? start : input.value.length;
          input.setSelectionRange(pos, pos);
        }
      }, 160);
    }
    if (e.target.dataset.action === "admin-search") {
      state.adminQ = e.target.value;
      clearTimeout(renderAdmin._t);
      renderAdmin._t = setTimeout(() => {
        const start = e.target.selectionStart;
        renderAdmin();
        const input = document.querySelector("[data-action=admin-search]");
        if (input) {
          input.focus();
          const pos = typeof start === "number" ? start : input.value.length;
          input.setSelectionRange(pos, pos);
        }
      }, 160);
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target.matches("[data-header-search]")) {
      e.preventDefault();
      const q = String(new FormData(e.target).get("q") || "");
      state.catalog.q = q;
      goCatalog({ q });
      closeMenus();
    }
    if (e.target.matches("[data-admin-login]")) {
      e.preventDefault();
      const pass = new FormData(e.target).get("password");
      if (pass === STORE_CONFIG.adminPassword) {
        localStorage.setItem(LS.admin, "1");
        renderAdmin();
      } else toast("Contraseña incorrecta");
    }
    if (e.target.matches("[data-product-form]")) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const list = getProducts();
      const id = (fd.get("id") || uid("sku")).toString();
      const variants = readVariantsFromForm(e.target);
      const stocks = variants.map((v) => v.stock).filter((s) => s != null && !Number.isNaN(s));
      const stock = stocks.length === variants.length && variants.length
        ? stocks.reduce((a, b) => a + b, 0)
        : Number(fd.get("stock")) || 0;
      const product = {
        id,
        name: String(fd.get("name")).trim(),
        category: String(fd.get("category")),
        price: Number(fd.get("price")) || 0,
        stock,
        discount: Math.min(100, Math.max(0, Number(fd.get("discount")) || 0)),
        discountUntil: String(fd.get("discountUntil") || ""),
        description: String(fd.get("description") || ""),
        variants,
        image: (variants[0] && variants[0].images[0]) || ""
      };
      if (!product.name) {
        toast("Poné un nombre al producto.");
        return;
      }
      const i = list.findIndex((p) => p.id === id);
      if (i >= 0) list[i] = { ...list[i], ...product };
      else list.unshift(product);
      setProducts(list);
      state.formProduct = null;
      renderAdmin();
      toast("Producto guardado");
    }
if (e.target.matches("[data-ship-form]")) {
      e.preventDefault();
      const input = e.target.querySelector("[name=cp]");
      const out = $("[data-ship-result]");
      const waBtn = $("[data-wa-product]");
      const product = waBtn ? getProduct(waBtn.dataset.waProduct) : null;
      const est = estimateShipping(input && input.value, product ? unitPrice(product) : 0);
      if (!out) return;
      if (est.error) {
        out.className = "ship-result is-error";
        out.textContent = est.error;
      } else {
        out.className = "ship-result";
        out.innerHTML = est.free
          ? `<strong>Envío gratis</strong> a ${escapeHtml(est.zone)} · ${escapeHtml(est.days)}.`
          : `<strong>${formatARS(est.cost)}</strong> a ${escapeHtml(est.zone)} · ${escapeHtml(est.days)}. Gratis desde ${formatARS(STORE_CONFIG.freeShipping)}.`;
      }
    }
    if (e.target.matches("[data-newsletter]")) {
      e.preventDefault();
      const email = e.target.email && e.target.email.value;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Ingresá un email válido para suscribirte.");
        return;
      }
      e.target.reset();
      toast("Listo. Te vamos a escribir cuando haya novedades y ofertas.");
    }
    if (e.target.matches("[data-regret-form]")) {
      e.preventDefault();
      toast("Recibimos tu solicitud. Te escribimos a ese mail dentro de las 24 horas hábiles.");
      e.target.reset();
    }
  });

  const sheetOverlay = $("[data-sheet-overlay]");
  if (sheetOverlay) sheetOverlay.addEventListener("click", () => setFilterSheet(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.formProduct) {
        state.formProduct = null;
        renderAdmin();
      } else {
        setFilterSheet(false);
      }
    }
  });

  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-action=card-color]");
    if (!t) return;
    const ev = new Event("click", { bubbles: true, cancelable: true });
    // reuse click handler path by dispatching a synthetic... better call same logic
    t.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  document.documentElement.removeAttribute("data-theme");
  try { localStorage.removeItem("trn-theme"); } catch (e) {}
  renderChrome();
  window.addEventListener("hashchange", route);
  route();
})();
