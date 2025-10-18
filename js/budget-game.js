// /js/budget-game.js
(function () {
    const canvas = document.getElementById('budgetGame');
    if (!canvas) return;
    const c = canvas.getContext('2d');

    const W = canvas.width, H = canvas.height;
    let running, score, target, player, items;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function spawnItem() {
        // 60% ingresos (▲), 40% gastos (▼)
        const type = Math.random() < 0.6 ? 'rev' : 'exp';
        return { type, x: rand(20, W - 20), y: -20, vy: rand(2, 4), size: 16 };
    }

    function initState() {
        running = true;
        score = 0;
        target = 10;
        player = { x: W / 2, y: H - 40, w: 40, h: 20, vx: 0, speed: 6 };
        items = Array.from({ length: 6 }, spawnItem);
    }

    function aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    const keys = { left: false, right: false };
    window.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
    });
    window.addEventListener('keyup', e => {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
    });

    function update() {
        // mover jugador
        player.vx = (keys.left ? -player.speed : 0) + (keys.right ? player.speed : 0);
        player.x += player.vx;
        player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));

        // mover ítems
        items.forEach(it => {
            it.y += it.vy;
            const box = { x: player.x - player.w / 2, y: player.y - player.h / 2, w: player.w, h: player.h };
            const circ = { x: it.x - it.size, y: it.y - it.size, w: it.size * 2, h: it.size * 2 };
            if (aabb(box, circ)) {
                score += it.type === 'rev' ? 1 : -1;
                Object.assign(it, spawnItem());
            }
            if (it.y - it.size > H) Object.assign(it, spawnItem());
        });

        if (score >= target || score <= -3) running = false;
    }

    function draw() {
        c.fillStyle = '#f8fafc'; c.fillRect(0, 0, W, H);

        c.fillStyle = '#0f172a';
        c.font = '16px system-ui, -apple-system, Segoe UI, Roboto';
        c.fillText(`Surplus (score): ${score}/${target}`, 16, 24);
        c.fillText('Collect ▲ (revenues), avoid ▼ (expenses)', 16, 44);

        // player
        c.fillStyle = '#4f46e5';
        c.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);

        // items
        items.forEach(it => {
            c.fillStyle = it.type === 'rev' ? '#059669' : '#dc2626';
            c.beginPath(); c.arc(it.x, it.y, it.size, 0, Math.PI * 2); c.fill();

            c.fillStyle = '#ffffff';
            c.font = '14px system-ui, -apple-system, Segoe UI, Roboto';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(it.type === 'rev' ? '▲' : '▼', it.x, it.y + 1);
        });

        if (!running) {
            c.fillStyle = 'rgba(2,6,23,0.7)'; c.fillRect(0, 0, W, H);
            c.fillStyle = '#ffffff'; c.textAlign = 'center';
            c.font = '20px system-ui, -apple-system, Segoe UI, Roboto';
            const msg = score >= target ? 'Goal reached! Budget balanced 🎉' : 'Game over! Try again';
            c.fillText(msg, W / 2, H / 2);
        }
    }

    function loop() {
        if (running) { update(); draw(); requestAnimationFrame(loop); }
        else { draw(); }
    }

    // Exponer funciones globales
    window.startBudgetGame = function () { initState(); loop(); };
    window.resetBudgetGame = function () { initState(); };

    // Arrancar al cargar
    window.startBudgetGame();
})();
