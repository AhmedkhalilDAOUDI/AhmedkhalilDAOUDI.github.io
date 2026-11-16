(() => {
  const canvas = document.querySelector('.birthday-ascii');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const flower = new Image();
  const sample = document.createElement('canvas');
  const sampler = sample.getContext('2d', {willReadFrequently:true});
  if (!sampler) return;

  const glyphs = ' .:+xX0S8@';
  const inks = ['#9a3d55', '#c06576', '#e08f99', '#eac1ae', '#fff0d8'];
  let width, height, cellWidth, cellHeight, cells = [], frame, last = -Infinity;

  function draw(now) {
    if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(draw);
    if (now - last < 66) return;
    last = now;
    const time = reducedMotion.matches ? 0 : now / 1000;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `600 ${cellWidth * 1.62}px ui-monospace,Menlo,monospace`;
    ctx.textBaseline = 'top';

    for (const [x, y, light, seed] of cells) {
      const shimmer = Math.sin(time * 1.45 + y * .027 + seed * 6) * .11;
      const tone = Math.min(1, Math.max(0, light + shimmer));
      ctx.fillStyle = inks[Math.min(inks.length - 1, Math.floor(Math.sqrt(tone) * inks.length))];
      ctx.globalAlpha = .53 + .47 * tone;
      ctx.fillText(glyphs[1 + Math.floor(tone * (glyphs.length - 2))], x, y);
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    cancelAnimationFrame(frame);
    if (!flower.naturalWidth || document.hidden) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    cellWidth = width <= 650 ? 8 : 10;
    cellHeight = Math.round(cellWidth * 1.48);
    const cols = Math.ceil(width / cellWidth);
    const rows = Math.ceil(height / cellHeight);
    sample.width = cols;
    sample.height = rows;

    const cover = Math.max(width / flower.naturalWidth, height / flower.naturalHeight);
    const cropWidth = width / cover;
    const cropHeight = height / cover;
    const alignX = width <= 650 ? .78 : .5;
    sampler.drawImage(flower, (flower.naturalWidth - cropWidth) * alignX,
      (flower.naturalHeight - cropHeight) * .5, cropWidth, cropHeight, 0, 0, cols, rows);
    const pixels = sampler.getImageData(0, 0, cols, rows).data;
    cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = (row * cols + col) * 4;
        const luminance = (.28 * pixels[i] + .58 * pixels[i + 1] + .14 * pixels[i + 2]) / 255;
        const seed = (Math.sin(row * 127.1 + col * 311.7) + 1) / 2;
        if (luminance < .102 + seed * .085 || col < cols * (width <= 650 ? .18 : .4)) continue;
        const light = Math.min(1, (luminance - .11) * 1.65);
        cells.push([col * cellWidth, row * cellHeight, light, seed]);
      }
    }
    last = -Infinity;
    frame = requestAnimationFrame(draw);
  }

  flower.addEventListener('load', resize, {once:true});
  flower.src = 'assets/birthday-flowers.webp';
  window.addEventListener('resize', resize);
  reducedMotion.addEventListener('change', resize);
  document.addEventListener('visibilitychange', resize);
})();
