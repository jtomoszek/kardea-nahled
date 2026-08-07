/* Kardea — interakce */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------- navigace: stav po scrollu */
  var navWrap = document.getElementById('navWrap');
  var onScroll = function () {
    navWrap.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------- mobilní menu */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');

  var setMenu = function (open) {
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('is-open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ------------------------------------------------------ FAQ akordeon */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var panel = item.querySelector('.faq__a');

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq__item.is-open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq__a').style.height = '0px';
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });

  window.addEventListener('resize', function () {
    var open = document.querySelector('.faq__item.is-open .faq__a');
    if (open) open.style.height = open.scrollHeight + 'px';
  });

  /* ============================== FORMULÁŘ — žádost o předpis léku ===== */
  var form = document.getElementById('rxForm');

  if (form) {
    // datum narození nemůže být v budoucnu
    var bday = document.getElementById('rxDate');
    if (bday) bday.max = new Date().toISOString().slice(0, 10);

    var status = document.getElementById('rxStatus');
    var consentWrap = document.getElementById('rxConsentWrap');

    var setStatus = function (kind, msg) {
      status.className = 'form-status is-visible form-status--' + kind;
      status.textContent = msg;
    };

    var markField = function (input, ok) {
      var field = input.closest('.field');
      if (field) field.classList.toggle('has-error', !ok);
      return ok;
    };

    // e-mail i telefon ověřujeme volně — jde o kontakt, ne o striktní formát
    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); };
    var isPhone = function (v) { return v.replace(/[^\d]/g, '').length >= 9; };

    var validate = function () {
      var f = form.elements;
      var ok = true;

      ok = markField(f.jmeno, f.jmeno.value.trim().length >= 3) && ok;
      ok = markField(f.datum, !!f.datum.value) && ok;
      ok = markField(f.telefon, isPhone(f.telefon.value)) && ok;
      ok = markField(f.email, isEmail(f.email.value)) && ok;
      ok = markField(f.lek, f.lek.value.trim().length >= 2) && ok;

      var consentOk = f.souhlas.checked;
      consentWrap.classList.toggle('has-error', !consentOk);
      ok = consentOk && ok;

      return ok;
    };

    // chybu schovej, jakmile uživatel pole opraví
    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('has-error');
        if (input.name === 'souhlas') consentWrap.classList.remove('has-error');
      });
      input.addEventListener('change', function () {
        if (input.name === 'souhlas' && input.checked) consentWrap.classList.remove('has-error');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validate()) {
        setStatus('err', 'Zkontrolujte prosím zvýrazněná pole.');
        var firstBad = form.querySelector('.has-error input');
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {
        _subject: 'Žádost o předpis léku — ' + form.elements.jmeno.value.trim(),
        _honey: form.elements._honey ? form.elements._honey.value : '',
        'Jméno a příjmení': form.elements.jmeno.value.trim(),
        'Datum narození': form.elements.datum.value,
        'Telefon': form.elements.telefon.value.trim(),
        'E-mail': form.elements.email.value.trim(),
        'Název léku': form.elements.lek.value.trim(),
        'Souhlas se zpracováním': 'ano'
      };

      var endpoint = (form.dataset.endpoint || '').trim();
      var btn = form.querySelector('button[type="submit"]');

      // A) je nastavený backend → pošli JSON
      if (endpoint) {
        btn.disabled = true;
        setStatus('ok', 'Odesílám žádost…');

        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (res) {
            // služba vrací úspěch i v těle odpovědi, samotný stav 200 nestačí
            if (res.success === false || res.success === 'false') throw new Error(res.message || 'odmítnuto');
            setStatus('ok', 'Žádost jsme přijali. Ozveme se vám zpravidla do jednoho pracovního dne.');
            form.reset();
          })
          .catch(function () {
            setStatus('err', 'Žádost se nepodařilo odeslat. Zavolejte nám prosím na 606 727 444.');
          })
          .finally(function () { btn.disabled = false; });

        return;
      }

      // bez nastaveného endpointu nemá formulář kam odeslat
      setStatus('err', 'Formulář není nastavený. Zavolejte nám prosím na 606 727 444.');
    });
  }

  /* ============ nadpisy: rozpad na písmena (blur + zdvih, zleva doprava) ===== */
  var STEP = 22; // ms mezi písmeny

  var splitHeading = function (el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';

    // původní znění si schováme pro odečítačky — aria-label přebije rozsekaný obsah.
    // <br> nemá vlastní text, takže ho před odečtem nahradíme mezerou, ať slova nesplynou.
    var clone = el.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('br'), function (br) {
      br.parentNode.replaceChild(document.createTextNode(' '), br);
    });
    var original = clone.textContent.replace(/\s+/g, ' ').trim();

    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          if (!child.textContent.trim()) return;
          var frag = document.createDocumentFragment();

          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }

            // celé slovo držíme pohromadě, ať se neláme uprostřed
            var word = document.createElement('span');
            word.className = 'word';
            part.split('').forEach(function (chr) {
              var s = document.createElement('span');
              s.className = 'ch';
              s.textContent = chr;
              word.appendChild(s);
            });
            frag.appendChild(word);
          });

          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };

    walk(el);

    Array.prototype.forEach.call(el.querySelectorAll('.ch'), function (s, i) {
      s.style.animationDelay = (i * STEP) + 'ms';
    });

    el.setAttribute('aria-label', original);
    el.classList.add('split');
    el.classList.remove('reveal');
  };

  // jen hlavní nadpisy — H3 a níž zůstávají bez animace
  var headings = [].slice.call(document.querySelectorAll('h1, h2'));
  headings.forEach(splitHeading);

  /* --------------------------------------------- postupné odkrývání obsahu */
  var startPageAnimations = function () {
    var reveals = [].slice.call(document.querySelectorAll('.reveal'));

    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
      headings.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        if (el.classList.contains('split')) {
          el.classList.add('is-revealed');
          // až animace doběhne, sundat filtry docela — jinak na mobilu
          // občas zůstane písmeno rozmazané
          var pocet = el.querySelectorAll('.ch').length;
          setTimeout(function () { el.classList.add('is-done'); }, pocet * STEP + 700);
        } else {
          var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(sibs, 5) * 70 + 'ms';
          el.classList.add('is-in');
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.concat(headings).forEach(function (el) { io.observe(el); });
  };

  /* ==================== úvodní vrstva při načtení stránky ===== */
  var intro = document.getElementById('intro');
  var introText = document.getElementById('introText');

  var runIntro = function (done) {
    // jednou za návštěvu; při vypnutých animacích vůbec
    var seen = false;
    try { seen = sessionStorage.getItem('kardea-intro') === '1'; } catch (e) {}

    if (!intro || reduced || seen) {
      if (intro) intro.classList.add('is-off');
      done();
      return;
    }

    try { sessionStorage.setItem('kardea-intro', '1'); } catch (e) {}

    document.body.classList.add('is-intro');
    splitHeading(introText);
    var letters = introText.querySelectorAll('.ch').length;

    requestAnimationFrame(function () {
      introText.classList.add('is-revealed');
      intro.classList.add('is-typed');
    });

    var writing = letters * STEP + 520;   // než dopíše poslední písmeno

    setTimeout(function () {
      intro.classList.add('is-done');
      document.body.classList.remove('is-intro');
      done();
      setTimeout(function () { intro.classList.add('is-off'); }, 950);
    }, writing + 420);
  };

  runIntro(startPageAnimations);

  /* ============ magnetické tečky v úvodní sekci ===== */
  (function () {
    var canvas = document.getElementById('dotfield');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;

    var GRID = 19;          // rozteč — shodná s rastrem na body
    var DOT = 1.1;          // poloměr tečky
    var COLOR = 'rgba(19, 19, 16, .10)';
    var REACH = 145;        // dosah kurzoru
    var PULL = 15;          // o kolik se tečka přitáhne
    var STRETCH = 8;        // jak moc se protáhne

    var w = 0, h = 0, dpr = 1;
    var still = null;       // předkreslený klidový rastr
    var cols = 0, rows = 0;

    var mx = -9999, my = -9999;   // kam míří kurzor
    var cx = -9999, cy = -9999;   // kam se tečky doháněly (tlumené)
    var power = 0, wantPower = 0; // síla efektu 0–1
    var running = false, visible = true;

    var buildStill = function () {
      var rect = hero.getBoundingClientRect();
      w = Math.ceil(rect.width);
      h = Math.ceil(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / GRID) + 1;
      rows = Math.ceil(h / GRID) + 1;

      still = document.createElement('canvas');
      still.width = canvas.width;
      still.height = canvas.height;
      var s = still.getContext('2d');
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.fillStyle = COLOR;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          s.beginPath();
          s.arc(i * GRID, j * GRID, DOT, 0, 6.2832);
          s.fill();
        }
      }
    };

    // jedna tečka — buď klidová, nebo přitažená a protažená ke kurzoru
    var drawDot = function (x, y) {
      var dx = cx - x, dy = cy - y;
      var d = Math.sqrt(dx * dx + dy * dy);

      if (d > REACH || d < 0.001 || power < 0.001) {
        ctx.beginPath();
        ctx.arc(x, y, DOT, 0, 6.2832);
        ctx.fill();
        return;
      }

      var t = (1 - d / REACH);
      t = t * t * power;                 // měkký náběh k okraji dosahu

      var ux = dx / d, uy = dy / d;
      var px = x + ux * PULL * t;
      var py = y + uy * PULL * t;
      var half = (STRETCH * t) / 2;

      ctx.beginPath();
      ctx.moveTo(px - ux * half, py - uy * half);
      ctx.lineTo(px + ux * half, py + uy * half);
      ctx.stroke();
    };

    var frame = function () {
      // dotažení kurzoru i síly — dává tomu setrvačnost
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      power += (wantPower - power) * 0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(still, 0, 0, w, h);

      if (power > 0.002) {
        var pad = REACH + PULL + STRETCH;
        ctx.clearRect(cx - pad, cy - pad, pad * 2, pad * 2);

        ctx.fillStyle = COLOR;
        ctx.strokeStyle = COLOR;
        ctx.lineWidth = DOT * 2;
        ctx.lineCap = 'round';

        var i0 = Math.max(0, Math.floor((cx - pad) / GRID));
        var i1 = Math.min(cols - 1, Math.ceil((cx + pad) / GRID));
        var j0 = Math.max(0, Math.floor((cy - pad) / GRID));
        var j1 = Math.min(rows - 1, Math.ceil((cy + pad) / GRID));

        for (var i = i0; i <= i1; i++) {
          for (var j = j0; j <= j1; j++) drawDot(i * GRID, j * GRID);
        }
        requestAnimationFrame(frame);
      } else {
        running = false;   // usadilo se, přestáváme kreslit
      }
    };

    var kick = function () {
      if (!running && visible) { running = true; requestAnimationFrame(frame); }
    };

    buildStill();
    ctx.drawImage(still, 0, 0, w, h);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildStill();
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(still, 0, 0, w, h);
        kick();
      }, 150);
    });

    // interakce jen tam, kde dává smysl — myš, ne dotyk
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced || !fine) return;

    // nekreslit, když je sekce mimo obraz
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) kick();
      }, { threshold: 0 }).observe(hero);
    }

    hero.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (wantPower === 0) { cx = mx; cy = my; }   // ať to neletí přes celou plochu
      wantPower = 1;
      kick();
    });

    hero.addEventListener('mouseleave', function () {
      wantPower = 0;
      kick();
    });
  })();

  /* ------------------------------------------------------------- rok */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
