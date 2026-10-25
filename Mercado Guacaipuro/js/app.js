/*
 * Mercado Guaicaipuro
 * Renderiza el contenido de config.js y añade las interacciones de la página.
 * Sin JavaScript, index.html muestra un resumen básico en <noscript>.
 */
(function () {
  "use strict";

  var cfg = window.MERCADO_CONFIG;
  if (!cfg) return;

  var root = document.documentElement;
  root.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopMedia = window.matchMedia("(min-width: 1000px)");
  var revealObserver = null;
  var photoSwapObserver = null;
  var photoMotionBound = false;
  var photoViewportBound = false;
  var rateState = { status: "idle", value: null, date: "", source: "" };
  var rateRequested = false;
  var rateBound = false;
  var rateFetchInFlight = false;
  var refreshOrderSummary = null;

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                          */
  /* ------------------------------------------------------------------ */

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  function text(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  function money(value) {
    var amount = Number(value);
    if (!isFinite(amount)) amount = 0;
    var currency = cfg.currency || {};
    var symbol = currency.symbol || "$";
    var locale = currency.locale || "es-VE";
    return (
      symbol +
      " " +
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    );
  }

  function moneyBs(value) {
    var rate = cfg.order.rate || {};
    return (text(rate.currency) || "Bs.") + " " + formatRate(value);
  }

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(values, key)
        ? values[key]
        : "";
    });
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function stripOptional(label) {
    return String(label).replace(/\s*\(opcional\)\s*/i, "");
  }

  function normalizePhone(value) {
    var digits = text(value).replace(/\D/g, "");
    if (digits.length === 12 && digits.slice(0, 2) === "58") {
      digits = "0" + digits.slice(2);
    }
    if (digits.length === 10 && digits.charAt(0) === "4") {
      digits = "0" + digits;
    }
    return digits;
  }

  function normalizeWhatsApp(value) {
    var digits = text(value).replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "0") {
      digits = "58" + digits.slice(1);
    }
    if (digits.length === 10 && digits.charAt(0) === "4") {
      digits = "58" + digits;
    }
    return digits;
  }

  function parsePrice(value) {
    if (typeof value === "number" && isFinite(value)) return value;
    var raw = text(value).replace(/[^\d.,-]/g, "");
    if (!raw) return null;
    var lastComma = raw.lastIndexOf(",");
    var lastDot = raw.lastIndexOf(".");
    if (lastComma !== -1 && lastDot !== -1) {
      if (lastComma > lastDot) {
        raw = raw.replace(/\./g, "").replace(",", ".");
      } else {
        raw = raw.replace(/,/g, "");
      }
    } else if (lastComma !== -1) {
      raw = raw.replace(",", ".");
    }
    var number = parseFloat(raw);
    return isFinite(number) ? number : null;
  }

  function toBool(value, fallback) {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;
    var normalized = text(value).toLowerCase();
    if (!normalized) return fallback;
    return (
      ["true", "verdadero", "sí", "si", "1", "x", "yes"].indexOf(
        normalized
      ) !== -1
    );
  }

  function normalizeHeader(value) {
    return text(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_");
  }

  /* ------------------------------------------------------------------ */
  /* Cabecera                                                            */
  /* ------------------------------------------------------------------ */

  function renderNav() {
    var links = cfg.nav
      .map(function (item) {
        return (
          '<li><a class="site-nav__link" href="' +
          esc(item.href) +
          '">' +
          esc(item.label) +
          "</a></li>"
        );
      })
      .join("");

    byId("site-nav").innerHTML =
      '<a class="wordmark" href="#inicio">' +
      '<span class="wordmark__mark" aria-hidden="true"></span>' +
      "<span>" +
      esc(cfg.brand.name) +
      "</span>" +
      "</a>" +
      '<nav class="site-nav" aria-label="Principal">' +
      "<ul>" +
      links +
      "</ul>" +
      "</nav>" +
      '<a class="site-header__action" href="' +
      esc(cfg.navAction.href) +
      '">' +
      esc(cfg.navAction.label) +
      ' <span aria-hidden="true">→</span></a>';
  }

  /* ------------------------------------------------------------------ */
  /* Portada                                                             */
  /* ------------------------------------------------------------------ */

  function renderHero() {
    var section = byId("inicio");
    section.setAttribute("aria-labelledby", "hero-title");

    var stripes = "";
    for (var i = 0; i < 40; i += 1) stripes += "<span></span>";

    section.innerHTML =
      '<div class="hero__card">' +
      '<div class="hero__stripe" aria-hidden="true">' +
      stripes +
      "</div>" +
      '<div class="hero__card-inner" data-reveal-group>' +
      '<h1 class="hero__title reveal" id="hero-title">' +
      cfg.hero.titleLines.map(esc).join("<br> ") +
      "</h1>" +
      '<p class="hero__lead reveal">' +
      esc(cfg.hero.lead) +
      "</p>" +
      '<div class="hero__actions reveal">' +
      '<a class="btn" href="' +
      esc(cfg.hero.primary.href) +
      '">' +
      esc(cfg.hero.primary.label) +
      "</a>" +
      '<a class="link-arrow" href="' +
      esc(cfg.hero.secondary.href) +
      '">' +
      esc(cfg.hero.secondary.label) +
      ' <span aria-hidden="true">→</span></a>' +
      "</div>" +
      '<p class="hero__note reveal">' +
      esc(cfg.hero.note) +
      "</p>" +
      "</div>" +
      "</div>";
  }

  function renderStageMedia() {
    var media = byId("stage-media");
    if (!media) return;

    media.innerHTML = cfg.hero.photos
      .map(function (photo, index) {
        return (
          '<img class="stage__photo' +
          (index === 0 ? " is-active" : "") +
          '" src="' +
          esc(photo.src) +
          '" width="' +
          esc(photo.width) +
          '" height="' +
          esc(photo.height) +
          '" alt="" data-photo="' +
          esc(photo.key) +
          '"' +
          (index === 0
            ? ' fetchpriority="high"'
            : ' loading="lazy"') +
          ' decoding="async">'
        );
      })
      .join("");
  }

  /* ------------------------------------------------------------------ */
  /* Combos                                                              */
  /* ------------------------------------------------------------------ */

  function renderCombo(combo) {
    var contents = combo.contents
      .map(function (item) {
        return (
          "<li><span>" +
          esc(item.label) +
          '</span><span class="combo__qty">' +
          esc(item.qty) +
          "</span></li>"
        );
      })
      .join("");

    var demoLabel = cfg.combos.priceLabel
      ? '<span class="combo__demo">' + esc(cfg.combos.priceLabel) + "</span>"
      : "";

    return (
      '<article class="combo reveal' +
      (combo.featured ? " combo--featured" : "") +
      '" data-combo="' +
      esc(combo.id) +
      '">' +
      '<span class="combo__flag" aria-hidden="true"></span>' +
      '<div class="combo__media">' +
      '<img src="' +
      esc(combo.image.src) +
      '" width="' +
      esc(combo.image.width) +
      '" height="' +
      esc(combo.image.height) +
      '" alt="' +
      esc(combo.image.alt) +
      '" loading="lazy" decoding="async">' +
      "</div>" +
      '<div class="combo__body">' +
      '<h3 class="combo__name">' +
      esc(combo.name) +
      "</h3>" +
      '<p class="combo__tagline">' +
      esc(combo.tagline) +
      "</p>" +
      '<p class="combo__price"><span class="combo__amount">' +
      money(combo.price) +
      "</span>" +
      demoLabel +
      "</p>" +
      '<ul class="combo__list">' +
      contents +
      "</ul>" +
      '<div class="combo__foot">' +
      '<p class="combo__match" hidden></p>' +
      '<button class="combo__order" type="button" data-order-combo="' +
      esc(combo.id) +
      '">' +
      esc((cfg.combos.orderLabel || "Pedir") + " " + combo.name) +
      "</button>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderCombos() {
    var section = byId("combos");
    section.setAttribute("aria-labelledby", "combos-title");

    var helper = cfg.combos.helper;
    var checks = helper.items
      .map(function (item) {
        return (
          '<label class="check" for="lista-' +
          esc(item.id) +
          '">' +
          '<input id="lista-' +
          esc(item.id) +
          '" type="checkbox" value="' +
          esc(item.id) +
          '">' +
          "<span>" +
          esc(item.label) +
          "</span>" +
          "</label>"
        );
      })
      .join("");

    var cards = cfg.combos.items.map(renderCombo).join("");

    section.innerHTML =
      '<div class="combos__inner">' +
      '<div class="section-head" data-reveal-group>' +
      '<h2 class="section-head__title reveal" id="combos-title">' +
      esc(cfg.combos.title) +
      "</h2>" +
      '<p class="section-head__text reveal">' +
      esc(cfg.combos.intro) +
      "</p>" +
      "</div>" +
      '<div class="list-builder reveal" data-list-builder>' +
      '<div class="list-builder__head">' +
      "<h3>" +
      esc(helper.title) +
      "</h3>" +
      "<p>" +
      esc(helper.text) +
      "</p>" +
      "</div>" +
      '<fieldset class="list-builder__checks">' +
      "<legend>" +
      esc(helper.legend) +
      "</legend>" +
      '<div class="list-builder__grid">' +
      checks +
      "</div>" +
      "</fieldset>" +
      '<div class="list-builder__foot">' +
      '<p class="list-builder__status" role="status" aria-live="polite">' +
      esc(helper.idle) +
      "</p>" +
      '<button class="list-builder__clear" type="button">' +
      esc(helper.clear) +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="combos__track" data-reveal-group>' +
      cards +
      "</div>" +
      '<p class="combos__note">' +
      esc(cfg.combos.note) +
      "</p>" +
      "</div>";
  }

  function initListBuilder() {
    var builder = document.querySelector("[data-list-builder]");
    if (!builder) return;

    var checks = Array.prototype.slice.call(
      builder.querySelectorAll('input[type="checkbox"]')
    );
    var status = builder.querySelector(".list-builder__status");
    var clear = builder.querySelector(".list-builder__clear");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-combo]")
    );
    var helper = cfg.combos.helper;

    function update() {
      var selected = checks
        .filter(function (check) {
          return check.checked;
        })
        .map(function (check) {
          return check.value;
        });

      var total = selected.length;

      cards.forEach(function (card) {
        card.removeAttribute("data-suggested");
        var match = card.querySelector(".combo__match");
        match.hidden = true;
        match.textContent = "";
      });

      if (!total) {
        status.textContent = helper.idle;
        return;
      }

      var best = null;

      cards.forEach(function (card) {
        var combo = cfg.combos.items.find(function (item) {
          return item.id === card.getAttribute("data-combo");
        });
        if (!combo) return;

        var matches = combo.contents.filter(function (item) {
          return selected.indexOf(item.id) !== -1;
        }).length;

        if (
          !best ||
          matches > best.matches ||
          (matches === best.matches &&
            combo.contents.length > best.combo.contents.length)
        ) {
          best = { card: card, combo: combo, matches: matches };
        }
      });

      if (!best || best.matches === 0) {
        status.textContent = helper.none;
        return;
      }

      best.card.setAttribute("data-suggested", "true");
      var match = best.card.querySelector(".combo__match");
      match.hidden = false;
      match.textContent = fill(helper.matchLabel, {
        n: best.matches,
        total: total,
      });

      status.textContent =
        fill(helper.result, {
          combo: best.combo.name,
          n: best.matches,
          total: total,
        }) + (best.matches < total ? " " + helper.extra : "");
    }

    checks.forEach(function (check) {
      check.addEventListener("change", update);
    });

    clear.addEventListener("click", function () {
      checks.forEach(function (check) {
        check.checked = false;
      });
      update();
      checks[0].focus();
    });

    update();
  }

  /* ------------------------------------------------------------------ */
  /* Pedido                                                              */
  /* ------------------------------------------------------------------ */

  function orderField(key, options) {
    options = options || {};
    var field = cfg.order.fields[key];
    var id = "pedido-" + key;
    var hintId = id + "-hint";
    var errorId = id + "-error";
    var describedBy = errorId + (field.hint ? " " + hintId : "");
    var common =
      'id="' +
      id +
      '" name="' +
      key +
      '" aria-describedby="' +
      describedBy +
      '"' +
      (options.required ? " required" : "") +
      (options.autocomplete
        ? ' autocomplete="' + options.autocomplete + '"'
        : "");

    var control;
    if (options.textarea) {
      control =
        "<textarea " +
        common +
        ' rows="' +
        (options.rows || 2) +
        '" maxlength="' +
        (options.maxlength || 500) +
        '" placeholder="' +
        esc(field.placeholder || "") +
        '"></textarea>';
    } else {
      control =
        "<input " +
        common +
        ' type="' +
        (options.type || "text") +
        '"' +
        (options.inputmode
          ? ' inputmode="' + options.inputmode + '"'
          : "") +
        ' maxlength="' +
        (options.maxlength || 100) +
        '" placeholder="' +
        esc(field.placeholder || "") +
        '">';
    }

    return (
      '<div class="field' +
      (options.full ? " field--full" : "") +
      '">' +
      '<label for="' +
      id +
      '">' +
      esc(field.label) +
      "</label>" +
      control +
      (field.hint
        ? '<p class="field__hint" id="' +
          hintId +
          '">' +
          esc(field.hint) +
          "</p>"
        : "") +
      '<p class="field__error" id="' +
      errorId +
      '" hidden></p>' +
      "</div>"
    );
  }

  function rateCardHtml() {
    var rate = cfg.order.rate || {};
    return (
      '<aside class="rate-card reveal" data-rate-card role="status" aria-live="polite">' +
      '<div class="rate-card__top">' +
      '<span class="rate-card__label">' +
      esc(text(rate.label) || "Tasa del día") +
      "</span>" +
      '<span class="rate-card__source" data-rate-source>' +
      esc(text(rate.source) || "Oficial") +
      "</span>" +
      "</div>" +
      '<p class="rate-card__value">' +
      '<span class="rate-card__base">' +
      esc(text(rate.base) || "1$") +
      "</span>" +
      '<span class="rate-card__equals" aria-hidden="true">=</span>' +
      "<strong data-rate-value>—</strong>" +
      "</p>" +
      '<p class="rate-card__meta" data-rate-meta>' +
      esc(text(rate.loading) || "Consultando la tasa…") +
      "</p>" +
      "</aside>"
    );
  }

  function rateNumber(data) {
    if (!data) return null;
    var values = [data.promedio, data.venta, data.compra];
    for (var i = 0; i < values.length; i += 1) {
      var value = Number(values[i]);
      if (isFinite(value) && value > 0) return value;
    }
    return null;
  }

  function rateSource(data, rate) {
    var name = text(data && data.nombre);
    var source = text(data && data.fuente);
    var label = name || source || text(rate.source) || "Oficial";
    if (
      name &&
      source &&
      label.toLowerCase().indexOf(source.toLowerCase()) === -1
    ) {
      label += " " + source;
    }
    return label;
  }

  function formatRate(value) {
    var locale = (cfg.currency && cfg.currency.locale) || "es-VE";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function rateConversionValue() {
    if (rateState.status !== "ready") return 0;
    var value = Number(rateState.value);
    if (!isFinite(value) || value <= 0) return 0;
    return Math.round(value * 100) / 100;
  }

  function formatRateDate(value) {
    var raw = text(value);
    if (!raw) return "";
    var date = new Date(raw);
    if (isNaN(date.getTime())) return "";
    var locale = (cfg.currency && cfg.currency.locale) || "es-VE";
    var rate = cfg.order.rate || {};
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: text(rate.timeZone) || "America/Caracas",
    }).format(date);
  }

  function updateRateCard() {
    var card = document.querySelector("[data-rate-card]");
    if (!card) return;
    var rate = cfg.order.rate || {};
    var valueEl = card.querySelector("[data-rate-value]");
    var metaEl = card.querySelector("[data-rate-meta]");
    var sourceEl = card.querySelector("[data-rate-source]");
    if (!valueEl || !metaEl) return;

    valueEl.textContent = "—";
    metaEl.classList.remove("is-error");
    if (sourceEl) {
      sourceEl.textContent =
        text(rateState.source) || text(rate.source) || "Oficial";
    }

    if (rateState.status === "ready") {
      valueEl.textContent = moneyBs(rateState.value);
      var updated = formatRateDate(rateState.date);
      metaEl.textContent = updated
        ? (text(rate.updatedPrefix) || "Actualizada:") + " " + updated
        : text(rate.updatedFallback) || "Tasa oficial de referencia.";
    } else if (rateState.status === "error") {
      metaEl.textContent =
        text(rate.error) || "No se pudo cargar la tasa. Intenta de nuevo más tarde.";
      metaEl.classList.add("is-error");
    } else {
      metaEl.textContent = text(rate.loading) || "Consultando la tasa…";
    }

    if (refreshOrderSummary) refreshOrderSummary();
  }

  function fetchRate() {
    if (rateFetchInFlight) return;
    var rate = cfg.order.rate || {};
    var endpoint = text(rate.endpoint);
    if (!endpoint) {
      rateState = { status: "error", value: null, date: "", source: "" };
      updateRateCard();
      return;
    }

    rateFetchInFlight = true;
    rateState = { status: "loading", value: null, date: "", source: "" };
    updateRateCard();

    var controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) controller.abort();
    }, Math.max(1000, Number(rate.timeout) || 8000));
    var options = { cache: "no-store" };
    if (controller) options.signal = controller.signal;

    fetch(endpoint, options)
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        var value = rateNumber(data);
        if (value === null) throw new Error("Tasa no disponible");
        rateState = {
          status: "ready",
          value: value,
          date: text(data && data.fechaActualizacion),
          source: rateSource(data, rate),
        };
        updateRateCard();
      })
      .catch(function () {
        rateState = { status: "error", value: null, date: "", source: "" };
        updateRateCard();
      })
      .then(function () {
        window.clearTimeout(timeout);
        rateFetchInFlight = false;
      });
  }

  function initOrderRate() {
    if (!byId("pedido")) return;
    var rate = cfg.order.rate || {};

    if (!rateBound) {
      rateBound = true;
      var refreshMs = Math.max(60000, Number(rate.refreshMs) || 900000);
      window.setInterval(function () {
        if (!document.hidden) fetchRate();
      }, refreshMs);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) fetchRate();
      });
    }

    updateRateCard();

    if (!rateRequested) {
      rateRequested = true;
      fetchRate();
    }
  }

  function renderOrder() {
    var section = byId("pedido");
    if (!section) return;
    section.setAttribute("aria-labelledby", "pedido-title");

    var order = cfg.order;
    var whatsapp = normalizeWhatsApp(order.whatsapp);
    var combos = cfg.combos.items
      .map(function (combo) {
        var qtyLabel = fill(order.qtyLabel, { combo: combo.name });
        return (
          '<div class="order__combo" data-order-row="' +
          esc(combo.id) +
          '">' +
          '<div class="order__combo-info">' +
          '<span class="order__combo-name">' +
          esc(combo.name) +
          "</span>" +
          '<span class="order__combo-tagline">' +
          esc(combo.tagline) +
          "</span>" +
          "</div>" +
          '<span class="order__combo-price">' +
          money(combo.price) +
          "</span>" +
          '<div class="stepper" role="group" aria-label="' +
          esc(qtyLabel) +
          '">' +
          '<button class="stepper__btn" type="button" data-step="-1" aria-label="' +
          esc(fill(order.remove, { combo: combo.name })) +
          '" disabled>−</button>' +
          '<input class="stepper__input" type="number" inputmode="numeric" min="0" max="9" step="1" value="0" data-qty="' +
          esc(combo.id) +
          '" aria-label="' +
          esc(qtyLabel) +
          '">' +
          '<button class="stepper__btn" type="button" data-step="1" aria-label="' +
          esc(fill(order.add, { combo: combo.name })) +
          '">+</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    section.innerHTML =
      '<div class="order__inner" data-reveal-group>' +
      '<div class="section-head" data-reveal-group>' +
      '<h2 class="section-head__title reveal" id="pedido-title">' +
      esc(order.title) +
      "</h2>" +
      '<p class="section-head__text reveal">' +
      esc(order.intro) +
      "</p>" +
      rateCardHtml() +
      "</div>" +
      '<form class="order__form" id="order-form" novalidate>' +
      '<div class="order__layout">' +
      '<div class="order__main">' +
      '<section class="order__block" aria-labelledby="order-combos-title">' +
      '<h3 id="order-combos-title">' +
      esc(order.combosTitle) +
      "</h3>" +
      '<p class="order__hint" id="order-combos-hint">' +
      esc(order.combosHint) +
      "</p>" +
      '<fieldset class="order__combos" id="order-combos" aria-describedby="order-combos-hint combos-error">' +
      '<legend class="sr-only">' +
      esc(order.fields.combos.legend) +
      "</legend>" +
      combos +
      "</fieldset>" +
      '<p class="field__error" id="combos-error" hidden></p>' +
      "</section>" +
      '<section class="order__block" aria-labelledby="order-data-title">' +
      '<h3 id="order-data-title">' +
      esc(order.dataTitle) +
      "</h3>" +
      '<div class="order__fields">' +
      orderField("name", {
        required: true,
        autocomplete: "name",
        maxlength: 80,
      }) +
      orderField("phone", {
        required: true,
        type: "tel",
        inputmode: "tel",
        autocomplete: "tel",
        maxlength: 25,
      }) +
      orderField("id", {
        inputmode: "numeric",
        autocomplete: "off",
        maxlength: 20,
        full: true,
      }) +
      orderField("address", {
        required: true,
        textarea: true,
        rows: 2,
        autocomplete: "street-address",
        maxlength: 300,
        full: true,
      }) +
      orderField("notes", {
        textarea: true,
        rows: 3,
        autocomplete: "off",
        maxlength: 500,
        full: true,
      }) +
      '<div class="field field--full field--consent">' +
      '<label class="check check--consent" for="pedido-consentimiento">' +
      '<input id="pedido-consentimiento" name="consentimiento" type="checkbox" required aria-describedby="pedido-consentimiento-error">' +
      "<span>" +
      esc(order.consent) +
      "</span>" +
      "</label>" +
      '<p class="order__privacy"><a href="#privacidad">' +
      esc(order.privacyLabel) +
      "</a></p>" +
      '<p class="field__error" id="pedido-consentimiento-error" hidden></p>' +
      "</div>" +
      "</div>" +
      "</section>" +
      "</div>" +
      '<aside class="order__summary" aria-labelledby="order-summary-title">' +
      '<h3 id="order-summary-title">' +
      esc(order.summaryTitle) +
      "</h3>" +
      '<p class="order__count" id="order-count" aria-live="polite"></p>' +
      '<ul class="order__selected" id="order-selected"></ul>' +
      '<p class="order__total"><span>' +
      esc(order.totalLabel) +
      '</span><span class="order__total-price"><strong id="order-total">' +
      money(0) +
      '</strong><span id="order-total-bs"></span></span></p>' +
      '<p class="order__rate-note" id="order-rate-note" aria-live="polite"></p>' +
      (order.demoNote
        ? '<p class="order__demo">' + esc(order.demoNote) + "</p>"
        : "") +
      '<button class="btn order__submit" type="submit" aria-describedby="order-whatsapp-note">' +
      esc(order.submit) +
      "</button>" +
      '<p class="order__note" id="order-whatsapp-note">' +
      esc(whatsapp ? order.readyNote : order.pending) +
      "</p>" +
      (order.deliveryNote
        ? '<p class="order__delivery">' + esc(order.deliveryNote) + "</p>"
        : "") +
      '<p class="order__status" id="order-status" role="status" aria-live="polite"></p>' +
      "</aside>" +
      "</div>" +
      "</form>" +
      "</div>";
  }

  function initOrderForm() {
    var form = byId("order-form");
    if (!form) return;

    var order = cfg.order;
    var qtyInputs = Array.prototype.slice.call(
      form.querySelectorAll("[data-qty]")
    );
    var rows = Array.prototype.slice.call(
      form.querySelectorAll("[data-order-row]")
    );
    var selectedList = byId("order-selected");
    var count = byId("order-count");
    var total = byId("order-total");
    var totalBs = byId("order-total-bs");
    var rateNote = byId("order-rate-note");
    var status = byId("order-status");
    var combosError = byId("combos-error");
    var combosFieldset = byId("order-combos");
    var firstQty = qtyInputs[0];
    var fields = {
      name: byId("pedido-name"),
      phone: byId("pedido-phone"),
      id: byId("pedido-id"),
      address: byId("pedido-address"),
      notes: byId("pedido-notes"),
      consent: byId("pedido-consentimiento"),
    };
    var errors = {
      name: byId("pedido-name-error"),
      phone: byId("pedido-phone-error"),
      id: byId("pedido-id-error"),
      address: byId("pedido-address-error"),
      consent: byId("pedido-consentimiento-error"),
    };

    function comboFor(id) {
      return cfg.combos.items.find(function (item) {
        return item.id === id;
      });
    }

    function quantity(input) {
      return clamp(parseInt(input.value, 10) || 0, 0, 9);
    }

    function syncRow(input) {
      var row = input.closest("[data-order-row]");
      if (!row) return;
      var value = quantity(input);
      var minus = row.querySelector('[data-step="-1"]');
      var plus = row.querySelector('[data-step="1"]');
      if (minus) minus.disabled = value <= 0;
      if (plus) plus.disabled = value >= 9;
    }

    function readSelection() {
      var selected = [];
      var totalValue = 0;

      qtyInputs.forEach(function (input) {
        var qty = quantity(input);
        var combo = comboFor(input.getAttribute("data-qty"));
        if (!combo || qty <= 0) return;
        selected.push({ combo: combo, qty: qty });
        totalValue += combo.price * qty;
      });

      return { selected: selected, total: totalValue };
    }

    function updateSummary() {
      var data = readSelection();
      var rateValue = rateConversionValue();
      var rateReady = rateValue > 0;
      var itemCount = data.selected.reduce(function (sum, line) {
        return sum + line.qty;
      }, 0);

      selectedList.innerHTML = data.selected.length
        ? data.selected
            .map(function (line) {
              var lineTotal = line.combo.price * line.qty;
              return (
                '<li><span class="order__selected-name">' +
                line.qty +
                " × " +
                esc(line.combo.name) +
                '</span><span class="order__selected-price"><strong>' +
                money(lineTotal) +
                "</strong>" +
                (rateReady
                  ? "<span>" + moneyBs(lineTotal * rateValue) + "</span>"
                  : "") +
                "</span></li>"
              );
            })
            .join("")
        : '<li class="order__empty">' + esc(order.empty) + "</li>";

      count.textContent = itemCount
        ? fill(order.selectedLabel, { n: itemCount })
        : "";
      total.textContent = money(data.total);
      if (totalBs) {
        totalBs.textContent = rateReady
          ? moneyBs(data.total * rateValue)
          : "";
      }
      if (rateNote) {
        if (rateReady) {
          rateNote.textContent = fill(order.summaryRateNote || "", {
            rate: moneyBs(rateValue),
          });
        } else if (rateState.status === "error") {
          rateNote.textContent = order.summaryRateError || "";
        } else {
          rateNote.textContent = order.summaryRatePending || "";
        }
      }
      qtyInputs.forEach(syncRow);
    }

    function setError(key, message) {
      if (key === "combos") {
        if (!combosError || !combosFieldset) return;
        combosError.textContent = message;
        combosError.hidden = false;
        combosFieldset.setAttribute("aria-invalid", "true");
        return;
      }

      var field = fields[key];
      var error = errors[key];
      if (!field || !error) return;
      error.textContent = message;
      error.hidden = false;
      field.setAttribute("aria-invalid", "true");
    }

    function clearError(key) {
      if (key === "combos") {
        if (!combosError || !combosFieldset) return;
        combosError.textContent = "";
        combosError.hidden = true;
        combosFieldset.removeAttribute("aria-invalid");
        return;
      }

      var field = fields[key];
      var error = errors[key];
      if (!field || !error) return;
      error.textContent = "";
      error.hidden = true;
      field.removeAttribute("aria-invalid");
    }

    function clearAllErrors() {
      ["name", "phone", "id", "address", "consent", "combos"].forEach(
        clearError
      );
    }

    function validate() {
      clearAllErrors();

      var firstInvalid = null;
      var name = fields.name.value.trim();
      var phone = normalizePhone(fields.phone.value);
      var cedula = fields.id.value.trim();
      var address = fields.address.value.trim();
      var data = readSelection();

      function fail(key, message, element) {
        setError(key, message);
        if (!firstInvalid) firstInvalid = element;
      }

      if (name.length < 2) {
        fail("name", order.fields.name.error, fields.name);
      }

      if (!/^0\d{10}$/.test(phone)) {
        fail("phone", order.fields.phone.error, fields.phone);
      }

      if (cedula) {
        var cedulaDigits = cedula.replace(/\D/g, "");
        if (cedulaDigits.length < 6 || cedulaDigits.length > 9) {
          fail("id", order.fields.id.error, fields.id);
        }
      }

      if (address.length < 8) {
        fail("address", order.fields.address.error, fields.address);
      }

      if (!data.selected.length) {
        fail("combos", order.fields.combos.error, firstQty);
      }

      if (!fields.consent.checked) {
        fail("consent", order.fields.consent.error, fields.consent);
      }

      if (firstInvalid) {
        status.textContent = order.review;
        status.classList.add("is-error");
        firstInvalid.focus();
        return null;
      }

      return {
        selected: data.selected,
        total: data.total,
        name: name,
        phone: fields.phone.value.trim(),
        cedula: cedula,
        address: address,
        notes: fields.notes.value.trim(),
      };
    }

    function buildMessage(data) {
      var lines = [order.messageIntro, ""];
      lines.push(order.combosTitle + ":");

      data.selected.forEach(function (line) {
        lines.push(
          "• " +
            line.qty +
            " × " +
            line.combo.name +
            " — " +
            money(line.combo.price * line.qty)
        );
      });

      lines.push("", order.totalLabel + ": " + money(data.total));
      lines.push("", order.fields.name.label + ": " + data.name);
      lines.push(order.fields.phone.label + ": " + data.phone);

      if (data.cedula) {
        lines.push(stripOptional(order.fields.id.label) + ": " + data.cedula);
      }

      lines.push(order.fields.address.label + ": " + data.address);

      if (data.notes) {
        lines.push(
          stripOptional(order.fields.notes.label) + ": " + data.notes
        );
      }

      if (order.demoNote) lines.push("", order.demoNote);
      if (order.messageFooter) lines.push(order.messageFooter);

      return lines.join("\n");
    }

    qtyInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var value = quantity(input);
        if (input.value !== "" && String(value) !== input.value) {
          input.value = value;
        }
        updateSummary();
        clearError("combos");
      });

      input.addEventListener("change", function () {
        input.value = quantity(input);
        updateSummary();
        clearError("combos");
      });

      input.addEventListener("blur", function () {
        if (input.value === "") input.value = "0";
        updateSummary();
      });
    });

    rows.forEach(function (row) {
      row.querySelectorAll("[data-step]").forEach(function (button) {
        button.addEventListener("click", function () {
          var input = row.querySelector("[data-qty]");
          if (!input) return;
          var step = parseInt(button.getAttribute("data-step"), 10) || 0;
          input.value = clamp(quantity(input) + step, 0, 9);
          updateSummary();
          clearError("combos");
        });
      });
    });

    ["name", "phone", "id", "address"].forEach(function (key) {
      if (!fields[key]) return;
      fields[key].addEventListener("input", function () {
        clearError(key);
      });
    });

    if (fields.consent) {
      fields.consent.addEventListener("change", function () {
        clearError("consent");
      });
    }

    Array.prototype.slice
      .call(document.querySelectorAll("[data-order-combo]"))
      .forEach(function (button) {
        button.addEventListener("click", function () {
          var id = button.getAttribute("data-order-combo");
          var input = form.querySelector('[data-qty="' + id + '"]');
          if (!input) return;
          input.value = clamp(quantity(input) + 1, 0, 9);
          updateSummary();
          clearError("combos");
          var section = byId("pedido");
          if (section) {
            section.scrollIntoView({
              behavior: reducedMotion.matches ? "auto" : "smooth",
              block: "start",
            });
          }
          input.focus({ preventScroll: true });
        });
      });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = validate();
      if (!data) return;

      var whatsapp = normalizeWhatsApp(order.whatsapp);
      if (!whatsapp) {
        status.textContent = order.pending;
        status.classList.add("is-error");
        return;
      }

      var url =
        "https://wa.me/" +
        whatsapp +
        "?text=" +
        encodeURIComponent(buildMessage(data));

      status.textContent = order.opening;
      status.classList.remove("is-error");

      var popup = window.open(url, "_blank");
      if (popup) {
        popup.opener = null;
      } else {
        status.innerHTML =
          "<span>" +
          esc(order.opening) +
          '</span> <a href="' +
          esc(url) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(order.openLabel) +
          "</a>";
      }
    });

    refreshOrderSummary = updateSummary;
    updateSummary();
  }

  /* ------------------------------------------------------------------ */
  /* Catálogo de Google Sheets (JSONP de solo lectura)                   */
  /* ------------------------------------------------------------------ */

  function parseSheet(payload) {
    if (!payload || !payload.table || !payload.table.cols) return [];
    var columns = payload.table.cols.map(function (column) {
      return normalizeHeader(column.label || column.id || "");
    });

    return (payload.table.rows || []).map(function (row) {
      var record = {};
      columns.forEach(function (column, index) {
        if (!column) return;
        var cell = row.c && row.c[index];
        record[column] =
          cell && cell.v !== undefined && cell.v !== null ? cell.v : "";
      });
      return record;
    });
  }

  function mergeCatalog(rows) {
    var byId = {};
    rows.forEach(function (row) {
      var id = text(row.id).toLowerCase();
      if (id) byId[id] = row;
    });

    var items = [];
    cfg.combos.items.forEach(function (base, index) {
      var row = byId[base.id];
      if (!row) {
        items.push(base);
        return;
      }

      if (
        row.activo !== "" &&
        row.activo !== undefined &&
        !toBool(row.activo, true)
      ) {
        return;
      }

      var price = parsePrice(row.precio);
      var sheetOrder = parseInt(row.orden, 10);
      var name = text(row.nombre) || base.name;
      var tagline = text(row.descripcion) || base.tagline;

      items.push({
        id: base.id,
        name: name,
        tagline: tagline,
        price: price === null ? base.price : price,
        featured: toBool(row.destacado, !!base.featured),
        order: isFinite(sheetOrder) ? sheetOrder : index + 1,
        image: {
          src: text(row.foto) || base.image.src,
          width: base.image.width,
          height: base.image.height,
          alt: text(row.foto_alt) || base.image.alt,
        },
        contents: base.contents,
      });
    });

    items.sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    return items;
  }

  function loadCatalog() {
    var catalog = cfg.catalog || {};

    if (!catalog.enabled || !text(catalog.sheetId)) {
      return Promise.resolve({ source: "demo", items: cfg.combos.items });
    }

    return new Promise(function (resolve) {
      var callbackName =
        "__mercadoCatalog" + Date.now() + Math.floor(Math.random() * 10000);
      var script = document.createElement("script");
      var settled = false;
      var timer = window.setTimeout(function () {
        finish("tiempo de espera");
      }, catalog.timeout || 7000);

      function cleanup() {
        window.clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
        try {
          delete window[callbackName];
        } catch (error) {
          window[callbackName] = undefined;
        }
      }

      function finish(reason) {
        if (settled) return;
        settled = true;
        cleanup();
        console.warn(
          "Mercado Guaicaipuro: no se pudo cargar el catálogo de Google Sheets (" +
            reason +
            "). Se muestra el catálogo local."
        );
        resolve({ source: "demo", items: cfg.combos.items });
      }

      window[callbackName] = function (payload) {
        if (settled) return;
        settled = true;
        cleanup();

        var items = mergeCatalog(parseSheet(payload));
        if (!items.length) {
          console.warn(
            "Mercado Guaicaipuro: la hoja no devolvió combos válidos. Se muestra el catálogo local."
          );
          resolve({ source: "demo", items: cfg.combos.items });
          return;
        }

        resolve({ source: "sheet", items: items });
      };

      script.onerror = function () {
        finish("error de red");
      };

      var url =
        "https://docs.google.com/spreadsheets/d/" +
        encodeURIComponent(text(catalog.sheetId)) +
        "/gviz/tq?tqx=out:json;responseHandler:" +
        callbackName +
        "&sheet=" +
        encodeURIComponent(text(catalog.sheetName) || "Combos") +
        "&headers=1&_=" +
        Date.now();

      script.src = url;
      script.async = true;
      document.head.appendChild(script);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nosotros                                                            */
  /* ------------------------------------------------------------------ */

  function highlightFirst(paragraph, phrase) {
    if (!phrase) return esc(paragraph);
    var index = paragraph.indexOf(phrase);
    if (index === -1) return esc(paragraph);
    return (
      esc(paragraph.slice(0, index)) +
      "<mark>" +
      esc(phrase) +
      "</mark>" +
      esc(paragraph.slice(index + phrase.length))
    );
  }

  function renderAbout() {
    var section = byId("nosotros");
    section.setAttribute("aria-labelledby", "nosotros-title");

    var paragraphs = cfg.about.paragraphs
      .map(function (textValue, index) {
        var html =
          index === 0
            ? highlightFirst(textValue, cfg.about.highlight)
            : esc(textValue);
        return '<p class="about__paragraph reveal">' + html + "</p>";
      })
      .join("");

    section.innerHTML =
      '<div class="about__inner" data-reveal-group>' +
      '<div class="about__head">' +
      '<h2 class="about__title reveal" id="nosotros-title">' +
      esc(cfg.about.title) +
      "</h2>" +
      '<p class="about__lead reveal">' +
      esc(cfg.about.lead) +
      "</p>" +
      "</div>" +
      '<div class="about__letter">' +
      paragraphs +
      '<p class="about__signature reveal">' +
      esc(cfg.about.signature) +
      "</p>" +
      '<p class="about__role">' +
      esc(cfg.about.role) +
      "</p>" +
      "</div>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Servicios                                                           */
  /* ------------------------------------------------------------------ */

  function renderServices() {
    var section = byId("servicios");
    section.setAttribute("aria-labelledby", "servicios-title");

    var items = cfg.services.items
      .map(function (item) {
        return (
          '<li class="service reveal">' +
          '<h3 class="service__name">' +
          esc(item.name) +
          "</h3>" +
          '<p class="service__text">' +
          esc(item.text) +
          "</p>" +
          "</li>"
        );
      })
      .join("");

    section.innerHTML =
      '<div class="services__rows" data-reveal-group>' +
      '<h2 class="services__heading reveal" id="servicios-title">' +
      esc(cfg.services.title) +
      "</h2>" +
      '<ul class="services__list">' +
      items +
      "</ul>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Ubicación y contacto                                                */
  /* ------------------------------------------------------------------ */

  function renderContact() {
    var section = byId("contacto");
    section.setAttribute("aria-labelledby", "contacto-title");

    var details = cfg.contact.details
      .map(function (item) {
        return (
          '<div class="contact__detail">' +
          "<dt>" +
          esc(item.label) +
          "</dt>" +
          '<dd><span class="contact__value' +
          (item.pending ? " pending" : "") +
          '">' +
          esc(item.value) +
          '</span><span class="contact__note">' +
          esc(item.note) +
          "</span></dd>" +
          "</div>"
        );
      })
      .join("");

    var map = cfg.contact.map;
    var mapHtml = map
      ? '<figure class="contact__map reveal">' +
        '<iframe src="' +
        esc(map.src) +
        '" title="' +
        esc(map.title) +
        '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' +
        '<figcaption class="contact__caption">' +
        esc(map.caption) +
        ' <a href="' +
        esc(map.href) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(map.linkLabel) +
        "</a></figcaption>" +
        "</figure>"
      : "";

    section.innerHTML =
      '<div class="contact__inner" data-reveal-group>' +
      '<div class="section-head" data-reveal-group>' +
      '<h2 class="section-head__title reveal" id="contacto-title">' +
      esc(cfg.contact.title) +
      "</h2>" +
      '<p class="section-head__text reveal">' +
      esc(cfg.contact.intro) +
      "</p>" +
      "</div>" +
      mapHtml +
      '<figure class="contact__figure reveal">' +
      '<img src="' +
      esc(cfg.contact.image.src) +
      '" width="' +
      esc(cfg.contact.image.width) +
      '" height="' +
      esc(cfg.contact.image.height) +
      '" alt="' +
      esc(cfg.contact.image.alt) +
      '" loading="lazy" decoding="async">' +
      '<figcaption class="contact__caption">' +
      esc(cfg.contact.image.caption) +
      ' <a href="' +
      esc(cfg.contact.image.creditHref) +
      '" rel="noopener">' +
      esc(cfg.contact.image.credit) +
      "</a></figcaption>" +
      "</figure>" +
      '<div class="contact__rows">' +
      '<p class="contact__venue reveal">' +
      esc(cfg.contact.venue) +
      "</p>" +
      '<p class="contact__city reveal">' +
      esc(cfg.contact.city) +
      "</p>" +
      '<p class="contact__stall reveal">' +
      esc(cfg.contact.stall.label) +
      ' <span class="pending">' +
      esc(cfg.contact.stall.value) +
      "</span></p>" +
      "</div>" +
      '<dl class="contact__details" data-reveal-group>' +
      details +
      "</dl>" +
      '<p class="contact__disclaimer reveal">' +
      esc(cfg.contact.note) +
      "</p>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Pie de página                                                       */
  /* ------------------------------------------------------------------ */

  function renderFooter() {
    var footer = byId("pie");

    var links = cfg.nav
      .map(function (item) {
        return (
          '<li><a href="' +
          esc(item.href) +
          '">' +
          esc(item.label) +
          "</a></li>"
        );
      })
      .join("");

    var contact = cfg.footer.contact
      .map(function (line) {
        return "<li>" + esc(line) + "</li>";
      })
      .join("");

    var credits = cfg.footer.credits
      .map(function (item) {
        return (
          '<li><a href="' +
          esc(item.href) +
          '" rel="noopener">' +
          esc(item.title) +
          "</a> · " +
          esc(item.creator) +
          " · " +
          esc(item.license) +
          "</li>"
        );
      })
      .join("");

    var year = new Date().getFullYear();

    footer.innerHTML =
      '<img class="footer__bg" src="' +
      esc(cfg.footer.image.src) +
      '" width="' +
      esc(cfg.footer.image.width) +
      '" height="' +
      esc(cfg.footer.image.height) +
      '" alt="" aria-hidden="true" loading="lazy" decoding="async">' +
      '<div class="footer__scrim" aria-hidden="true"></div>' +
      '<div class="footer__inner">' +
      '<div class="footer__top">' +
      '<nav aria-label="Pie de página">' +
      "<ul>" +
      links +
      "</ul>" +
      "</nav>" +
      '<ul class="footer__contact">' +
      contact +
      "</ul>" +
      "</div>" +
      '<p class="footer__mark"><span>Mercado</span><span>Guaicaipuro</span></p>' +
      '<div class="footer__legal">' +
      '<div class="footer__legal-text">' +
      "<p>" +
      esc(cfg.brand.slogan) +
      "</p>" +
      "<p>" +
      esc(fill(cfg.footer.legal, { year: year })) +
      "</p>" +
      "</div>" +
      '<details class="footer__details" id="privacidad">' +
      "<summary>" +
      esc(cfg.footer.privacy.title) +
      "</summary>" +
      "<p>" +
      esc(cfg.footer.privacy.text) +
      "</p>" +
      "</details>" +
      '<details class="footer__details">' +
      "<summary>" +
      esc(cfg.footer.creditsTitle) +
      "</summary>" +
      "<p>" +
      esc(cfg.footer.creditsNote) +
      "</p>" +
      "<ul>" +
      credits +
      "</ul>" +
      "</details>" +
      "</div>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* Movimiento                                                          */
  /* ------------------------------------------------------------------ */

  function initReveal() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    var groups = document.querySelectorAll("[data-reveal-group]");

    groups.forEach(function (group) {
      var items = group.querySelectorAll(".reveal");
      items.forEach(function (item, index) {
        item.style.setProperty("--reveal-delay", index * 70 + "ms");
      });
    });

    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function initPhotoSwap() {
    if (photoSwapObserver) {
      photoSwapObserver.disconnect();
      photoSwapObserver = null;
    }

    var photos = Array.prototype.slice.call(
      document.querySelectorAll(".stage__photo")
    );
    if (!photos.length) return;

    function show(key) {
      photos.forEach(function (photo) {
        photo.classList.toggle(
          "is-active",
          photo.getAttribute("data-photo") === key
        );
      });
    }

    if (!photoMotionBound) {
      photoMotionBound = true;
      reducedMotion.addEventListener("change", initPhotoSwap);
    }

    if (!photoViewportBound) {
      photoViewportBound = true;
      desktopMedia.addEventListener("change", initPhotoSwap);
    }

    if (
      reducedMotion.matches ||
      !desktopMedia.matches ||
      !("IntersectionObserver" in window)
    ) {
      show("facade");
      return;
    }

    var sections = document.querySelectorAll("[data-photo-key]");
    if (!sections.length) return;

    photoSwapObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target.getAttribute("data-photo-key"));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      photoSwapObserver.observe(section);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Arranque                                                            */
  /* ------------------------------------------------------------------ */

  function setPhotoKeys() {
    byId("inicio").setAttribute("data-photo-key", "facade");
    byId("combos").setAttribute("data-photo-key", "plantains");
    byId("pedido").setAttribute("data-photo-key", "corn");
    byId("nosotros").setAttribute("data-photo-key", "coffee");
    byId("servicios").setAttribute("data-photo-key", "beans");
    byId("contacto").setAttribute("data-photo-key", "plantains");
  }

  function renderAll() {
    renderCombos();
    renderOrder();
    setPhotoKeys();
    initListBuilder();
    initOrderForm();
    initOrderRate();
    initReveal();
    initPhotoSwap();
  }

  function init() {
    renderNav();
    renderHero();
    renderStageMedia();
    renderAbout();
    renderServices();
    renderContact();
    renderFooter();

    renderAll();

    loadCatalog().then(function (result) {
      if (result.source !== "sheet" || !result.items) return;
      cfg.combos.items = result.items;
      renderAll();
    });
  }

  init();
})();
