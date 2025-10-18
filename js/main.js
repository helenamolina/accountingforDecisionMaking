
// Smooth scroll for nav (basic)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Drag & Drop Classification (Module 1)
(function(){
  const items = document.querySelectorAll('#dd-items .dd-item');
  const bins = document.querySelectorAll('.dd-bin .dd-drop');
  if (!items.length || !bins.length) return;

  items.forEach(it => {
    it.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', it.textContent.trim());
      e.dataTransfer.effectAllowed = 'move';
      it.classList.add('opacity-60');
    });
    it.addEventListener('dragend', () => it.classList.remove('opacity-60'));
  });

  document.querySelectorAll('.dd-bin').forEach(binWrap => {
    const drop = binWrap.querySelector('.dd-drop');
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('ring-2','ring-indigo-400'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('ring-2','ring-indigo-400'));
    drop.addEventListener('drop', e => {
      e.preventDefault();
      drop.classList.remove('ring-2','ring-indigo-400');
      const label = e.dataTransfer.getData('text/plain');
      // Find the original li and move it here
      const li = Array.from(document.querySelectorAll('.dd-item')).find(x => x.textContent.trim() === label);
      if (li) drop.appendChild(li);
    });
  });

  const checkBtn = document.querySelector('.dd-check');
  const result = document.querySelector('.dd-result');
  if (checkBtn && result) {
    checkBtn.addEventListener('click', () => {
      // correct bins
      const correct = {
        'Assets': ['Cash','Inventory'],
        'Liabilities': ['Accounts Payable','Bank Loan'],
        'Equity': ['Share Capital','Retained Earnings']
      };
      let score = 0, total = 6;
      document.querySelectorAll('.dd-bin').forEach(bin => {
        const type = bin.getAttribute('data-type');
        const labels = Array.from(bin.querySelectorAll('.dd-item')).map(li => li.textContent.trim());
        labels.forEach(lab => {
          if (correct[type].includes(lab)) score++;
        });
      });
      result.textContent = `Score: ${score}/${total}`;
      result.classList.remove('text-red-600','text-emerald-600');
      result.classList.add( score === total ? 'text-emerald-600' : 'text-red-600');
    });
  }
})();

// Inline quiz logic (supports multiple quizzes on page)
(function(){
  document.querySelectorAll('.quiz-form').forEach((form, i) => {
    const submit = form.parentElement.querySelector('.quiz-submit');
    const result = form.parentElement.querySelector('.quiz-result');
    if (!submit || !result) return;
    submit.addEventListener('click', () => {
      // Answer keys by quiz order: 0->module1, 1->module2, 2->module3, 3->module4
      const keys = [
        { q1:'b', q2:'c', q3:'c' },
        { m2q1:'b', m2q2:'c', m2q3:'a' },
        { m3q1:'a', m3q2:'b', m3q3:'c' },
        { m4q1:'b', m4q2:'c', m4q3:'b' },
      ];
      const key = keys[i] || {};
      let correct = 0, total = 0;
      Object.keys(key).forEach(name => {
        total++;
        const val = (form.querySelector(`input[name="${name}"]:checked`) || {}).value;
        if (val === key[name]) correct++;
      });
      result.textContent = `Score: ${correct}/${total}`;
      result.classList.remove('text-red-600','text-emerald-600');
      result.classList.add( correct === total ? 'text-emerald-600' : 'text-red-600');
    });
  });
})();

// Game reset button
(function(){
  const btn = document.getElementById('gameResetBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (window.__resetBudgetGame) window.__resetBudgetGame();
  });
})();

// /js/main.js  (añade o sustituye este bloque)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('gameResetBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            if (window.startBudgetGame) {
                window.startBudgetGame();   // reinicia/arranca el juego
            }
        });
    }
});



// Dark mode toggle
(function(){
  const btn = document.getElementById('darkToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    localStorage.setItem('prefers-dark', root.classList.contains('dark') ? '1' : '0');
  });
  // Load pref
  if (localStorage.getItem('prefers-dark') === '1') {
    document.documentElement.classList.add('dark');
  }
})();

// Accessibility: larger text toggle
(function(){
  const btn = document.getElementById('a11yToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('text-lg');
  });
})();

// Progress bar on scroll
(function(){
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const ratio = Math.max(0, Math.min(1, window.scrollY / (max || 1)));
    bar.style.width = (ratio * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Scrollspy for sidebar
(function(){
  const links = Array.from(document.querySelectorAll('.side-link'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const activate = (idx) => {
    links.forEach((l,i)=> l.classList.toggle('active', i===idx));
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        if (idx >= 0) activate(idx);
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: [0,1] });
  sections.forEach(sec => observer.observe(sec));
})();

// Mark module completed when its inline quiz is perfect
(function(){
  const map = { 0:1, 1:2, 2:3, 3:4 }; // quiz index -> module number
  document.querySelectorAll('.quiz-form').forEach((form, qIdx) => {
    const parent = form.closest('section[id^="mod"]');
    const modNum = map[qIdx];
    const resultEl = form.parentElement.querySelector('.quiz-result');
    const btn = form.parentElement.querySelector('.quiz-submit');
    if (!btn || !resultEl || !parent) return;
    btn.addEventListener('click', () => {
      // if full marks -> mark sidebar link as done
      const text = resultEl.textContent || '';
      const match = text.match(/Score: (\d+)\/(\d+)/);
      if (match) {
        const got = Number(match[1]), tot = Number(match[2]);
        if (got === tot) {
          const side = document.querySelector(`.side-link[data-mod="${modNum}"]`);
          if (side) {
            side.classList.add('done');
            side.innerHTML = side.innerHTML.replace(
              /<span class="side-badge">\d+<\/span>/,
              '<span class="side-badge"><i class="bi bi-check2"></i></span>'
            );
          }
        }
      }
    });
  });
})();
