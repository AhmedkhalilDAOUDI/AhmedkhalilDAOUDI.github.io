(() => {
  const canvas = document.querySelector('.birthday-light');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['62,131,255', '125,204,255', '120,164,255', '255,158,157', '255,191,171'];
  let width, height, frame;
  let pointer = 0, bend = 0;

  function draw(now) {
    const t = reducedMotion.matches ? 0 : now / 1000;
    const compact = width < 650;
    const center = width * (compact ? .78 : .51);
    const spread = Math.min(width * (compact ? .26 : .16), height * .27);
    bend += (pointer - bend) * .045;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let strand = 0; strand < 28; strand++) {
      const offset = strand / 27 * 2 - 1;
      const phase = strand * 1.31;
      const color = colors[strand % colors.length];
      ctx.beginPath();
      for (let step = 0; step <= 54; step++) {
        const y = step / 54;
        const envelope = .09 + .93 * Math.pow(1 - y, 1.65) + .27 * y ** 3;
        const wave = Math.sin(y * 7.1 + phase + t * .48) * .49 +
          Math.cos(y * 12.2 - phase * .62 - t * .32) * .25;
        const x = center + spread * envelope * (offset + wave) +
          spread * (.18 * Math.sin(y * 6 + t * .6) + bend * Math.sin(Math.PI * y) * .42);
        if (step === 0) ctx.moveTo(x, -12);
        else ctx.lineTo(x, y * height);
      }

      const glow = ctx.createLinearGradient(0, 0, 0, height);
      glow.addColorStop(0, `rgba(${color},.55)`);
      glow.addColorStop(.38, `rgba(${color},.78)`);
      glow.addColorStop(.78, `rgba(${color},.22)`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.strokeStyle = glow;
      for (const [lineWidth, opacity] of [[24, .045], [10, .09], [4, .19], [1.25, .40]]) {
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (document.hidden) return;
    const ratio = Math.min(devicePixelRatio, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    frame = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', event => {
    if (!reducedMotion.matches) pointer = 2 * event.clientX / width - 1;
  }, {passive: true});
  window.addEventListener('resize', start);
  reducedMotion.addEventListener('change', () => {
    pointer = bend = 0;
    start();
  });
  document.addEventListener('visibilitychange', start);
  start();
})();
