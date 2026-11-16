(() => {
  const canvas = document.querySelector('.birthday-orb');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 650px)');
  const tau = 2 * Math.PI;
  const palette = [
    [90, 117, 241], [106, 126, 253], [152, 115, 249], [186, 142, 252],
    [99, 232, 205], [117, 253, 205], [129, 246, 219], [176, 255, 219],
  ];
  const points = [];
  for (let ring = 0; ring < 148; ring++) {
    const u = ring / 148 * tau;
    for (let step = 0; step < 51; step++) {
      const v = (step + (ring % 2) / 2) / 51 * tau;
      points.push([u, v, Math.cos(u), Math.sin(u), Math.cos(v), Math.sin(v)]);
    }
  }

  let width, height;
  let pointerX = 0, pointerY = 0, tiltX = 0, tiltY = 0;
  let frame = 0;
  function draw(now) {
    frame = 0;
    const t = still.matches ? 0 : now / 1000;
    const scale = Math.min(width * (mobile.matches ? .31 : .275), height * .285);
    const centerX = width * (mobile.matches ? .50 : .54);
    const centerY = height * (mobile.matches ? .55 : .51);
    tiltX += (pointerX - tiltX) * .055;
    tiltY += (pointerY - tiltY) * .055;
    const yaw = -.26 + .13 * Math.sin(t * .45) + tiltX * .24;
    const pitch = .35 + .11 * Math.cos(t * .37) + tiltY * .23;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    ctx.clearRect(0, 0, width, height);
    const layers = palette.map(() => [new Path2D(), new Path2D(), new Path2D()]);
    for (const [u, v, cu, su, cv, sv] of points) {
      const swell = .10 * Math.sin(u * 5 - t * .8) + .045 * Math.cos(u * 9 + v * 2 + t * .5);
      const tube = .40 + swell + .04 * Math.sin(v * 3 + u * 3 + t * .7);
      const radius = .96 + tube * cv + .06 * Math.sin(u * 3 + t * .55);
      const x = radius * cu, y = radius * su, z = tube * sv;
      const px = x * cosYaw + z * sinYaw;
      const depth = -x * sinYaw + z * cosYaw;
      const py = y * cosPitch - depth * sinPitch;
      const pz = y * sinPitch + depth * cosPitch;
      const perspective = 3.9 / (3.9 - pz);
      const onSurface = cv * .49 + sv * .30 + pz * .4 - py * .34;
      const light = onSurface > .52 ? 2 : onSurface > -.08 ? 1 : 0;
      const tint = Math.max(0, Math.min(3, Math.floor((px + py * .35 + 1.4) * 1.45)));
      const path = layers[(py < -.12 - px * .26 ? 4 : 0) + tint][light];
      const dx = centerX + px * scale * perspective;
      const dy = centerY + py * scale * perspective;
      const size = Math.max(.78, scale * .0046) * perspective * (light === 2 ? 1.16 : .87);
      path.moveTo(dx + size, dy);
      path.arc(dx, dy, size, 0, tau);
    }
    for (let light = 0; light < 3; light++) {
      palette.forEach(([r, g, b], i) => {
        ctx.fillStyle = `rgba(${r},${g},${b},${[.23, .60, .98][light]})`;
        ctx.fill(layers[i][light]);
      });
    }
    if (!still.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (document.hidden) return;
    const ratio = Math.min(devicePixelRatio, 1.75);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('pointermove', event => {
    if (still.matches) return;
    pointerX = 2 * event.clientX / width - 1;
    pointerY = 2 * event.clientY / height - 1;
  }, {passive: true});
  window.addEventListener('resize', start);
  still.addEventListener('change', start);
  document.addEventListener('visibilitychange', start);
  start();
})();
