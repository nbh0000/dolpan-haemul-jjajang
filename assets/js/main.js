/* 돌판해물짜장 — 공통 스크립트 (헤더 · 모바일 메뉴 · 등장 애니메이션 · 숫자 카운트 · UTM 저장 · 문의 폼(본문+하단 바) · 전환 이벤트) */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 헤더: 그림자, 아래로 스크롤하면 숨기고 위로 올리면 다시 표시(모바일) ── */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 4);
    var narrow = window.innerWidth < 880;
    if (narrow && !(drawer && !drawer.hidden)) {
      if (y > lastY + 6 && y > 160) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 80) header.classList.remove('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
  }
  if (header) {
    onScroll();
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  if (menuBtn && drawer) {
    var setDrawer = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      drawer.hidden = !open;
      if (open) header.classList.remove('is-hidden');
    };
    menuBtn.addEventListener('click', function () { setDrawer(drawer.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });
    document.addEventListener('click', function (e) { if (!drawer.hidden && !header.contains(e.target)) setDrawer(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 880 && !drawer.hidden) setDrawer(false); }, { passive: true });
  }

  /* ── 스크롤 진행 막대 · 스크롤 확대 · 키워드 띠 (rAF 루프 하나) ── */
  var prog = null;
  if (!reduceMotion) { prog = document.createElement('div'); prog.className = 'scroll-prog'; prog.setAttribute('aria-hidden', 'true'); document.body.appendChild(prog); }
  var scrubImgs = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-scrub] img'));
  var mqRows = [];
  if (!reduceMotion && 'animate' in document.documentElement) {
    document.querySelectorAll('.mq-row').forEach(function (row) {
      var track = row.querySelector('.mq-track'); if (!track) return;
      var dir = parseFloat(row.getAttribute('data-mq')) || 1;
      var frames = dir > 0 ? [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }] : [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }];
      var anim = track.animate(frames, { duration: Math.max(18000, track.scrollWidth / 2 / 70 * 1000), iterations: Infinity, easing: 'linear' });
      mqRows.push({ row: row, anim: anim, rate: 1, visible: true });
    });
    if ('IntersectionObserver' in window && mqRows.length) {
      var mio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { mqRows.forEach(function (m) { if (m.row !== e.target) return; m.visible = e.isIntersecting; if (m.visible) m.anim.play(); else m.anim.pause(); }); });
      });
      mqRows.forEach(function (m) { mio.observe(m.row); });
    }
  }
  if (prog || scrubImgs.length || mqRows.length) {
    var lastSY = window.scrollY, vel = 0, sDir = 1;
    var frame = function () {
      var y = window.scrollY, vh = window.innerHeight, dy = y - lastSY; lastSY = y;
      if (prog) { var max = document.documentElement.scrollHeight - vh; prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')'; }
      scrubImgs.forEach(function (im) {
        var r = im.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        /* 사진 윗변이 화면 아래 끝 → 0, 사진 가운데가 화면 가운데 → 1 */
        var p = Math.max(0, Math.min(1, (vh - r.top) / (vh / 2 + r.height / 2)));
        im.style.transform = 'scale(' + (0.86 + 0.14 * (1 - Math.pow(1 - p, 2))).toFixed(4) + ')';
      });
      if (mqRows.length) {
        /* 스크롤 방향으로 흐르고, 빠르게 스크롤할수록 빨라졌다가 천천히 원래 속도로 */
        if (Math.abs(dy) > 0.5) sDir = dy > 0 ? 1 : -1;
        vel += (Math.min(Math.abs(dy), 80) - vel) * 0.12;
        var target = sDir * (1 + vel / 6);
        mqRows.forEach(function (m) { if (!m.visible) return; m.rate += (target - m.rate) * 0.1; m.anim.playbackRate = m.rate; });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ── 카드 조명: 마우스 위치를 따라 금빛 (마우스 환경만) ── */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.strength, .together-list li, .vs-panel, .benefit-zero li, .cond, .region-support li').forEach(function (card) {
      card.classList.add('spot');
      var g = document.createElement('span'); g.className = 'spot-glow'; g.setAttribute('aria-hidden', 'true'); card.appendChild(g);
      card.addEventListener('pointermove', function (e) { var r = card.getBoundingClientRect(); g.style.transform = 'translate(' + Math.round(e.clientX - r.left) + 'px,' + Math.round(e.clientY - r.top) + 'px)'; });
    });
  }

  /* ── 스크롤 등장 ─────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  var offScreen = function (r) { return r.bottom <= 0 || r.top >= window.innerHeight; };
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      /* 화면에 들어오면 등장, 화면 밖으로 완전히 나가면 되돌려서 다시 올 때 또 재생 */
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add('is-in');
        else if (offScreen(en.boundingClientRect)) en.target.classList.remove('is-in');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 숫자 카운트 업 (숫자 부분만, 한글 단위는 유지) ── */
  var counters = document.querySelectorAll('.count[data-count]');
  function animateCount(el) {
    var raw = el.getAttribute('data-count');
    var m = raw.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var numStr = m[1], suffix = m[2], hasComma = numStr.indexOf(',') >= 0;
    var dec = (numStr.split('.')[1] || '').length;
    var target = parseFloat(numStr.replace(/,/g, '')), start = null, dur = 1500, run = el._countRun = (el._countRun || 0) + 1;
    var fmt = function (n) { var s = n.toFixed(dec); if (hasComma) { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); } return s; };
    function step(ts) {
      if (run !== el._countRun) return;
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (!en.target._counted) { en.target._counted = true; animateCount(en.target); } }
        else if (offScreen(en.boundingClientRect)) en.target._counted = false;
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ── 메인 배너 슬라이더 (자동 전환 · 점 · 화살표 · 스와이프) ── */
  var hero = document.querySelector('.hero-slider');
  if (hero) {
    var slides = hero.querySelectorAll('.hero-slide'), dots = hero.querySelectorAll('.hero-dot');
    var cur = 0, timer = null, INTERVAL = 6500;
    /* 배경 영상: 넓은 화면 + 데이터 절약 아님 + 모션 허용일 때만, 그리고 그 슬라이드가 보일 때 불러온다 (모바일은 사진) */
    var saveData = navigator.connection && navigator.connection.saveData;
    var isPhone = window.matchMedia('(max-width: 719px)').matches;
    var canVideo = !saveData && !reduceMotion;
    var ensureVideo = function (slide) {
      if (!canVideo) return;
      var v = slide.querySelector('video.hero-video');
      if (!v || v.getAttribute('data-loaded')) return;
      var mp4 = v.getAttribute(isPhone ? 'data-mp4-m' : 'data-mp4'), webm = isPhone ? null : v.getAttribute('data-webm');
      if (!mp4 && !webm) return;
      v.setAttribute('data-loaded', '1');
      if (webm) { var s1 = document.createElement('source'); s1.src = webm; s1.type = 'video/webm'; v.appendChild(s1); }
      if (mp4) { var s2 = document.createElement('source'); s2.src = mp4; s2.type = 'video/mp4'; v.appendChild(s2); }
      v.addEventListener('playing', function () { v.classList.add('is-playing'); });
      v.load(); v.play().catch(function () {});
    };
    var go = function (n) {
      n = (n + slides.length) % slides.length;
      slides[cur].classList.remove('is-active'); if (dots[cur]) dots[cur].classList.remove('is-active');
      cur = n;
      slides[cur].classList.add('is-active'); if (dots[cur]) dots[cur].classList.add('is-active');
      ensureVideo(slides[cur]);
      var v = slides[cur].querySelector('video'); if (v) { try { v.currentTime = 0; v.play().catch(function () {}); } catch (e) {} }
      var nx = slides[(cur + 1) % slides.length]; if (nx && !isPhone) ensureVideo(nx);
    };
    var stop = function () { if (timer) clearInterval(timer); timer = null; };
    var start = function () { stop(); if (!reduceMotion && slides.length > 1) timer = setInterval(function () { go(cur + 1); }, INTERVAL); };
    hero.querySelectorAll('[data-dir]').forEach(function (b) { b.addEventListener('click', function () { go(cur + parseInt(b.getAttribute('data-dir'), 10)); start(); }); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); start(); }); });
    hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start);
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); start(); } sx = null; }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
    ensureVideo(slides[cur]);
    if (!isPhone) setTimeout(function () { if (slides[(cur + 1) % slides.length]) ensureVideo(slides[(cur + 1) % slides.length]); }, 4000);
  }

  /* ── 숫자 롤링(오도미터): .odo[data-value] ─────────── */
  document.querySelectorAll('.odo[data-value]').forEach(function (odo) {
    var val = odo.getAttribute('data-value') || '';
    odo.innerHTML = '';
    var cols = [];
    val.split('').forEach(function (ch) {
      if (/\d/.test(ch)) {
        var d = document.createElement('span'); d.className = 'odo-d';
        var col = document.createElement('span'); col.className = 'odo-col';
        for (var i = 0; i < 10; i++) { var s = document.createElement('span'); s.textContent = String(i); col.appendChild(s); }
        d.appendChild(col); odo.appendChild(d); cols.push({ col: col, n: parseInt(ch, 10) });
      } else {
        var sep = document.createElement('span'); sep.className = 'odo-sep'; sep.textContent = ch; odo.appendChild(sep);
      }
    });
    var settle = function (animate) {
      cols.forEach(function (c, i) {
        c.col.style.transition = animate ? '' : 'none';
        c.col.style.transitionDelay = animate ? (i * 90) + 'ms' : '0ms';
        c.col.style.transform = 'translateY(-' + (c.n * 10) + '%)';
      });
    };
    if (reduceMotion || !('IntersectionObserver' in window)) { settle(false); return; }
    var reset = function () { cols.forEach(function (c) { c.col.style.transition = 'none'; c.col.style.transform = 'translateY(0)'; }); };
    var oio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) settle(true);
      else if (offScreen(en[0].boundingClientRect)) reset();
    }, { threshold: 0.5 });
    oio.observe(odo);
  });

  /* ── 패럴랙스: 사진 배경 섹션 · 장식 컷아웃 (넓은 화면, 모션 허용 시) ── */
  var pxEls = document.querySelectorAll('.sec-photo, .page-head, .deco, .has-bg');
  if (pxEls.length && !reduceMotion && window.matchMedia('(min-width: 960px)').matches) {
    var pxTick = false;
    var runParallax = function () {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh;
        var deco = el.classList.contains('deco');
        var px = Math.max(-90, Math.min(90, c * (deco ? -140 : -60)));
        el.style.setProperty(deco ? '--dy' : '--py', px.toFixed(1) + 'px');
      });
      pxTick = false;
    };
    window.addEventListener('scroll', function () { if (!pxTick) { pxTick = true; requestAnimationFrame(runParallax); } }, { passive: true });
    window.addEventListener('resize', runParallax, { passive: true });
    runParallax();
  }

  /* ── 가로로 넘기는 목록의 진행 막대 (.scroller-progress 바로 앞 요소) ── */
  document.querySelectorAll('.scroller-progress').forEach(function (bar) {
    var sc = bar.previousElementSibling;
    while (sc && sc.scrollWidth <= sc.clientWidth + 2 && sc.previousElementSibling && !sc.matches('.menu-scroll, .strength-grid, .gallery')) sc = sc.previousElementSibling;
    if (!sc || !sc.matches('.menu-scroll, .strength-grid, .gallery')) return;
    var fill = bar.firstElementChild;
    var upd = function () {
      var max = sc.scrollWidth - sc.clientWidth;
      if (max <= 2) { bar.style.visibility = 'hidden'; return; }
      bar.style.visibility = '';
      var view = sc.clientWidth / sc.scrollWidth;
      fill.style.width = (view * 100).toFixed(1) + '%';
      fill.style.transform = 'translateX(' + ((sc.scrollLeft / max) * (1 / view - 1) * 100).toFixed(1) + '%)';
    };
    sc.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    upd();
  });

  /* ── UTM·유입경로 (첫 방문 값을 세션 동안 유지) ─── */
  var KEY = 'dj_visit';
  function readVisit() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function saveVisit(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } }
  var params = new URLSearchParams(location.search);
  var visit = readVisit();
  var hasUtm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].some(function (k) { return params.get(k); });
  if (!visit || hasUtm) {
    visit = {
      utm_source: params.get('utm_source') || (visit && visit.utm_source) || '',
      utm_medium: params.get('utm_medium') || (visit && visit.utm_medium) || '',
      utm_campaign: params.get('utm_campaign') || (visit && visit.utm_campaign) || '',
      utm_content: params.get('utm_content') || (visit && visit.utm_content) || '',
      utm_term: params.get('utm_term') || (visit && visit.utm_term) || '',
      referrer: (visit && visit.referrer) || document.referrer || '',
      landing: (visit && visit.landing) || (location.pathname + location.search)
    };
    saveVisit(visit);
  }

  /* ── 전환 이벤트 (설치된 도구만 호출) ──────────── */
  function trackLead() {
    try { if (window.gtag) gtag('event', 'generate_lead', { event_category: 'inquiry' }); } catch (e) {}
    try { if (window.fbq) fbq('track', 'Lead'); } catch (e) {}
    try { if (window.wcs && window.wcs_add) { var _nasa = {}; _nasa.cnv = wcs.cnv('4', '0'); wcs_do(_nasa); } } catch (e) {}
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'inquiry_submit' }); } catch (e) {}
  }
  window.djTrackLead = trackLead;

  /* ── 문의 폼 (본문 폼 #inquiry-form + 하단 바 .qb-form 공통) ── */
  function formatPhone(input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 3 && d.length <= 7) out = d.slice(0, 3) + '-' + d.slice(3);
      else if (d.length > 7) out = d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
      input.value = out;
    });
  }
  var DONE_SVG = '<svg class="ico-check" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function setupForm(form) {
    Object.keys(visit).forEach(function (k) {
      var el = form.querySelector('input[name="' + k + '"]');
      if (el) el.value = visit[k] || '';
    });
    var phone = form.querySelector('input[name="phone"]');
    var name = form.querySelector('input[name="name"]');
    var agree = form.querySelector('input[name="agree"]');
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : '';
    var isQuick = form.classList.contains('qb-form');
    if (phone) formatPhone(phone);

    function showMsg(text, ok) { if (!msg) return; msg.textContent = text; msg.className = msg.className.replace(/\bis-(ok|error)\b/g, '').trim() + (ok ? ' is-ok' : ' is-error'); }
    function validate() {
      name.removeAttribute('aria-invalid'); phone.removeAttribute('aria-invalid');
      if (name.value.trim().length < 2) { name.setAttribute('aria-invalid', 'true'); name.focus(); return '이름을 입력해 주세요.'; }
      var d = phone.value.replace(/\D/g, '');
      if (!/^0\d{8,10}$/.test(d)) { phone.setAttribute('aria-invalid', 'true'); phone.focus(); return '연락처를 정확히 입력해 주세요.'; }
      if (!agree.checked) { agree.focus(); return '개인정보 동의가 필요합니다.'; }
      return '';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = validate();
      if (err) { showMsg(err, false); return; }
      if (window.DJ_STATIC) { showMsg('미리보기 사이트에서는 문의가 전송되지 않습니다. 전화로 문의해 주세요.', false); return; }
      btn.disabled = true; btn.textContent = '보내는 중…';
      showMsg('', true);
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) {
            trackLead();
            if (isQuick) {
              form.innerHTML = '<span class="qb-msg form-msg is-ok">' + DONE_SVG + ' 문의가 접수되었습니다. 담당자가 곧 연락드리겠습니다.</span>';
            } else {
              var done = document.createElement('div');
              done.className = 'form-done';
              done.innerHTML = DONE_SVG + '<h3>문의가 접수되었습니다</h3><p></p>';
              done.querySelector('p').textContent = j.message || '담당자가 확인 후 연락드리겠습니다.';
              form.replaceWith(done);
              done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
          } else {
            showMsg((j && j.message) || '전송에 실패했습니다. 전화로 문의해 주세요.', false);
            btn.disabled = false; btn.textContent = btnText;
          }
        })
        .catch(function () {
          showMsg('네트워크 오류입니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.', false);
          btn.disabled = false; btn.textContent = btnText;
        });
    });
  }
  var mainForm = document.getElementById('inquiry-form');
  if (mainForm) setupForm(mainForm);
  document.querySelectorAll('form.qb-form').forEach(setupForm);
})();

/* 실시간 상담 알림: 지점명을 하나씩 바꿔 가며 깜빡이듯 띄움 */
(function () {
  var box = document.querySelector('.live-toast');
  if (!box) return;
  var items = [];
  try { items = JSON.parse(box.getAttribute('data-items') || '[]'); } catch (e) {}
  if (!items.length) return;
  var place = box.querySelector('.lt-place');
  var i = Math.floor(Math.random() * items.length);
  function show() {
    place.textContent = items[i % items.length];
    i++;
    box.classList.add('is-on');
    setTimeout(function () {
      box.classList.remove('is-on');
      setTimeout(show, 1600);
    }, 4200);
  }
  setTimeout(show, 2500);
})();
