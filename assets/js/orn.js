/* 돌판해물짜장 — 양쪽 여백 중식풍 장식 (화면 폭 1400px 이상에서만 보임)
 * 섹션에 data-orn-l / data-orn-r 로 장식을 고른다. 쉼표로 여러 개, "이름:값@위치" 형식.
 *   lanterns  홍등 2~3개가 줄에 매달려 흔들림     knot     중국 매듭 1개
 *   plum      수묵 매화 가지 (바깥 위 모서리)      clouds   금색 상운 2개 (@low / @high)
 *   petals    매화 꽃잎이 떨어짐                    embers   불티가 올라감 (어두운 섹션)
 *   vtext:n   세로 문구 + 붉은 낙관 (@low)          han:火   아주 큰 흐린 붓글씨 한자 (@low)
 *   fret      회문(回紋) 세로 띠
 * 지정이 없으면 섹션 순서대로 기본 조합을 돌려 쓴다. 장식 이미지는 /assets/img/orn/
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var IMG = me && me.src ? new URL('../img/orn/', me.src).href : '/assets/img/orn/';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHRASES = ['불맛으로 완성한 특별한 한 그릇', '돌판의 불맛이 다르다', '질리지 않는 돌판요리', '좋은 음식이 좋은 사람을 만듭니다', '불맛 가득한 진짜 중화요리'];
  var HANJA = ['火', '味', '石', '板', '香', '海', '炒'];
  var LIGHT = [
    ['lanterns,petals', 'han:味,clouds@low'],
    ['han:香,clouds', 'plum,petals'],
    ['plum,petals', 'han:火,lanterns'],
    ['vtext', 'han:石,clouds@low,petals']
  ];
  var DARK = [['lanterns,embers', 'han:火,knot,embers'], ['han:炒,embers', 'lanterns,embers']];

  /* 섹션마다 같은 배치가 나오도록 고정 시드 난수 */
  function seeded(n) {
    var s = (n + 1) * 2654435761 >>> 0;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
  }
  function f(v, d) { return (+v).toFixed(d == null ? 2 : d); }
  function pic(file, cls, style) {
    return '<img class="' + cls + '" src="' + IMG + file + '" alt="" loading="lazy" decoding="async"' + (style ? ' style="' + style + '"' : '') + '>';
  }

  var B = {
    lanterns: function (r) {
      var xs = r() < 0.5 ? [14, 54] : [6, 38, 68], h = '';
      xs.forEach(function (x) {
        var file = r() < 0.6 ? 'lantern-round.webp' : 'lantern-long.webp';
        h += '<span class="o-lantern" style="--x:' + x + '%;--len:' + Math.round(26 + r() * 150) + 'px;--w:' + Math.round(19 + r() * 9) +
          ';--d:' + f(3.4 + r() * 2.6) + 's;--dl:-' + f(r() * 4) + 's;--a:' + f(2.2 + r() * 2.6, 1) + 'deg"><span class="o-lbody">' + pic(file, '') + '</span></span>';
      });
      return h;
    },
    knot: function (r) {
      return '<span class="o-lantern o-knot" style="--x:' + Math.round(34 + r() * 26) + '%;--len:' + Math.round(40 + r() * 70) + 'px;--w:' + Math.round(20 + r() * 7) +
        ';--d:' + f(4 + r() * 2) + 's;--dl:-' + f(r() * 3) + 's;--a:3deg"><span class="o-lbody">' + pic('knot.webp', '') + '</span></span>';
    },
    plum: function (r, mod, arg, side) { return pic(side === 'r' ? 'plum-branch-r.webp' : 'plum-branch.webp', 'o-plum'); },
    clouds: function (r, mod) {
      var lo = mod === 'low' ? 0.52 : mod === 'high' ? 0.05 : 0.14, span = mod ? 0.32 : 0.62, h = '';
      for (var i = 0; i < 2; i++) {
        var y = lo + (span / 2) * i + r() * (span / 2 - 0.08);
        h += pic(i ? 'cloud-b.webp' : 'cloud-a.webp', 'o-cloud', '--y:' + f(y * 100, 1) + '%;--x:' + Math.round(r() * 34) + '%;--w:' + Math.round(50 + r() * 24) +
          ';--d:' + f(9 + r() * 6) + 's;--dl:-' + f(r() * 6) + 's;--o:' + f(0.6 + r() * 0.3));
      }
      return h;
    },
    petals: function (r, mod, arg) {
      var h = '<span class="o-fallbox">';
      for (var i = 0, cnt = +arg || 9; i < cnt; i++) {
        h += '<span class="o-fall" style="--x:' + Math.round(4 + r() * 86) + '%;--d:' + f(12 + r() * 10) + 's;--dl:-' + f(r() * 22) + 's"><span style="--sd:' + f(2.4 + r() * 2.2) +
          's;--sx:' + Math.round(10 + r() * 24) + 'px"><i class="' + (r() < 0.45 ? 'pt' : 'pf') + '" style="--sz:' + Math.round(12 + r() * 12) + 'px;--rd:' + f(4 + r() * 5) + 's"></i></span></span>';
      }
      return h + '</span>';
    },
    embers: function (r, mod, arg) {
      var h = '<span class="o-fallbox">';
      for (var i = 0, cnt = +arg || 16; i < cnt; i++) {
        h += '<span class="o-rise" style="--x:' + Math.round(4 + r() * 88) + '%;--d:' + f(6 + r() * 7) + 's;--dl:-' + f(r() * 13) + 's"><span style="--sd:' + f(1.4 + r() * 1.8) +
          's;--sx:' + Math.round(6 + r() * 16) + 'px"><i style="--sz:' + f(3 + r() * 5, 1) + 'px"></i></span></span>';
      }
      return h + '</span>';
    },
    vtext: function (r, mod, arg, side, idx) {
      var t = PHRASES[(arg !== undefined && arg !== '' ? +arg : idx) % PHRASES.length];
      var chars = t.split('').map(function (c, i) { return c === ' ' ? '<i class="sp"></i>' : '<i style="--i:' + i + '">' + c + '</i>'; }).join('');
      return '<span class="o-vtext" style="--y:' + (mod === 'low' ? 32 : 9) + '%"><span class="o-seal">불맛</span><span class="o-chars">' + chars + '</span><span class="o-vline"></span></span>';
    },
    han: function (r, mod, arg, side, idx) {
      var ch = arg || HANJA[idx % HANJA.length];
      return '<span class="o-han" style="--y:' + (mod === 'low' ? 46 : 4 + Math.round(r() * 10)) + '%;--rot:' + f(-8 + r() * 10, 1) + 'deg">' + ch + '</span>';
    },
    fret: function () { return '<span class="o-fret"></span>'; }
  };

  function build(spec, r, side, idx) {
    if (!spec) return '';
    return spec.split(',').map(function (s) {
      s = s.trim(); if (!s) return '';
      var mod = '', arg;
      var at = s.indexOf('@'); if (at > -1) { mod = s.slice(at + 1); s = s.slice(0, at); }
      var c = s.indexOf(':'); if (c > -1) { arg = s.slice(c + 1); s = s.slice(0, c); }
      return B[s] ? B[s](r, mod, arg, side, idx) : '';
    }).join('');
  }

  var secs = document.querySelectorAll('main section.sec');
  var li = 0, di = 0, built = [];
  secs.forEach(function (sec, n) {
    if (sec.classList.contains('no-orn') || sec.classList.contains('sec-tight') || sec.querySelector('.prose')) return;
    var dark = sec.classList.contains('sec-green') || sec.classList.contains('sec-photo') || sec.classList.contains('on-dark');
    var L = sec.getAttribute('data-orn-l'), R = sec.getAttribute('data-orn-r');
    if (L === null && R === null) { var p = dark ? DARK[di++ % DARK.length] : LIGHT[li++ % LIGHT.length]; L = p[0]; R = p[1]; }
    var r = seeded(n + 3);
    var wrap = document.createElement('div');
    wrap.className = 'orn' + (dark ? ' is-dark' : '');
    wrap.setAttribute('aria-hidden', 'true');
    var hm = (L + ',' + R).match(/han:([^,@]+)/);
    var mob = '<span class="om-han" style="--rot:' + (-10 + r() * 8).toFixed(1) + 'deg">' + (hm ? hm[1] : HANJA[n % HANJA.length]) + '</span>';
    if (!reduce) mob += (dark ? B.embers : B.petals)(seeded(n + 11), '', dark ? '8' : '6');
    wrap.innerHTML = '<div class="orn-side orn-l">' + build(L, r, 'l', n) + '</div><div class="orn-side orn-r">' + build(R, r, 'r', n + 2) + '</div><div class="orn-mob">' + mob + '</div>';
    sec.insertBefore(wrap, sec.firstChild);
    built.push(wrap);
  });
  if (!built.length) return;

  /* 보일 때만 움직이고, 보일 때마다 세로 문구·낙관·회문 띠가 나타남 */
  if (reduce || !('IntersectionObserver' in window)) {
    built.forEach(function (w) { w.classList.add('orn-on', 'orn-seen'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      e.target.classList.toggle('orn-on', e.isIntersecting);
      if (e.isIntersecting) e.target.classList.add('orn-seen');
      else if (e.boundingClientRect.bottom <= 0 || e.boundingClientRect.top >= window.innerHeight) e.target.classList.remove('orn-seen');
    });
  }, { rootMargin: '60px 0px', threshold: 0.02 });
  built.forEach(function (w) { io.observe(w); });
})();
