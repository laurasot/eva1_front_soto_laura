/**
 * ConIngenio — interacciones: navegación móvil, sección activa, validación de formulario
 * y mensaje dinámico de estado tras el envío simulado.
 * Consola: https://developer.mozilla.org/es/docs/Web/API/console/log_static
 */

(function () {
  "use strict";

  console.log("[ConIngenio] Inicialización: script cargado. Use la consola del navegador para seguir eventos.");

  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  var navLinks = mainNav ? mainNav.querySelectorAll(".main-nav__link") : [];
  var sections = document.querySelectorAll("main section[id]");
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function closeMobileNav() {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  }

  function openMobileNav() {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    mainNav.classList.add("is-open");
  }

  function toggleMobileNav() {
    if (!navToggle || !mainNav) return;
    var expanded = navToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMobileNav();
      console.log("[ConIngenio] Evento: menú móvil cerrado.");
    } else {
      openMobileNav();
      console.log("[ConIngenio] Evento: menú móvil abierto.");
    }
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", toggleMobileNav);

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          closeMobileNav();
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /** Resalta el ítem de menú según la sección visible */
  function updateActiveNav() {
    var scrollPos = window.scrollY + 120;
    var current = "";
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var h = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + h) {
        current = section.getAttribute("id") || "";
      }
    });
    if (window.scrollY < 80) {
      current = "home";
    }

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var id = href.replace("#", "");
      if (id === current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  var scrollTimer;
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateActiveNav, 80);
    },
    { passive: true }
  );
  window.addEventListener("load", function () {
    updateActiveNav();
    console.log("[ConIngenio] Evento: load — secciones y navegación listas.");
  });

  /** Validación del formulario de contacto */
  var fields = {
    nombre: {
      el: document.getElementById("nombre"),
      err: document.getElementById("err-nombre"),
      validate: function (v) {
        var t = (v || "").trim();
        if (!t) return "Ingrese su nombre.";
        if (t.length < 2) return "El nombre debe tener al menos 2 caracteres.";
        return "";
      },
    },
    email: {
      el: document.getElementById("email"),
      err: document.getElementById("err-email"),
      validate: function (v) {
        var t = (v || "").trim();
        if (!t) return "Ingrese su correo electrónico.";
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(t)) return "Ingrese un correo electrónico válido.";
        return "";
      },
    },
    telefono: {
      el: document.getElementById("telefono"),
      err: document.getElementById("err-telefono"),
      validate: function (v) {
        var t = (v || "").trim();
        if (!t) return "";
        var re = /^[0-9+()\-\s]{7,30}$/;
        if (!re.test(t)) return "Use solo números y los caracteres + ( ) - espacio.";
        return "";
      },
    },
    mensaje: {
      el: document.getElementById("mensaje"),
      err: document.getElementById("err-mensaje"),
      validate: function (v) {
        var t = (v || "").trim();
        if (!t) return "Escriba su mensaje.";
        if (t.length < 10) return "El mensaje debe tener al menos 10 caracteres.";
        return "";
      },
    },
    privacidad: {
      el: document.getElementById("privacidad"),
      err: document.getElementById("err-privacidad"),
      validate: function (_v, checked) {
        if (!checked) return "Debe aceptar el tratamiento de datos para continuar.";
        return "";
      },
    },
  };

  function showFieldError(key, message) {
    var f = fields[key];
    if (!f || !f.err) return;
    f.err.textContent = message || "";
    if (f.el) {
      f.el.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  function validateAll() {
    var ok = true;
    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      if (!f.el) return;
      var val = f.el.type === "checkbox" ? "" : f.el.value;
      var checked = f.el.type === "checkbox" ? f.el.checked : false;
      var msg = f.validate(val, checked);
      showFieldError(key, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  Object.keys(fields).forEach(function (key) {
    var f = fields[key];
    if (!f.el) return;
    var ev = f.el.type === "checkbox" ? "change" : "blur";
    f.el.addEventListener(ev, function () {
      var val = f.el.type === "checkbox" ? "" : f.el.value;
      var checked = f.el.type === "checkbox" ? f.el.checked : false;
      showFieldError(key, f.validate(val, checked));
    });
    if (f.el.type !== "checkbox") {
      f.el.addEventListener("input", function () {
        if (f.err && f.err.textContent) {
          showFieldError(key, f.validate(f.el.value, false));
        }
      });
    }
  });

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formStatus.textContent = "";
      formStatus.classList.remove("is-success", "is-error");

      console.log("[ConIngenio] Evento: submit del formulario de contacto.");

      if (!validateAll()) {
        formStatus.textContent = "Revise los campos marcados y vuelva a intentar.";
        formStatus.classList.add("is-error");
        console.warn("[ConIngenio] Validación: hay errores en el formulario (HTML5 + JS).");
        var firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      console.log("[ConIngenio] Validación: todos los campos cumplen criterios.");

      /** Simulación de envío: actualización dinámica del mensaje de estado */
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";
      }

      window.setTimeout(function () {
        var emailVal = fields.email.el ? fields.email.el.value.trim() : "";
        formStatus.textContent =
          "¡Gracias! Su consulta fue registrada. Nos contactaremos pronto a " +
          (emailVal || "su correo") +
          ".";
        formStatus.classList.add("is-success");
        console.log(
          "[ConIngenio] Envío simulado correcto. Correo indicado:",
          emailVal || "(no disponible)"
        );
        contactForm.reset();
        Object.keys(fields).forEach(function (key) {
          showFieldError(key, "");
        });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar consulta";
        }
      }, 650);
    });
  }
})();
