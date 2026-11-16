(() => {
  const form = document.querySelector('#birthday-form');
  const accessKey = 'birthday-answered';

  if (!form) {
    if (sessionStorage.getItem(accessKey) === 'yes') {
      document.documentElement.classList.remove('birthday-locked');
    } else {
      const next = location.pathname + location.search + location.hash;
      location.replace('/birthday.html?' + new URLSearchParams({next}));
    }
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const { month, day } = form.elements;
    if (month.valueAsNumber !== 12 || day.valueAsNumber !== 12) {
      location.replace('https://www.friv.com/');
      return;
    }

    sessionStorage.setItem(accessKey, 'yes');
    const next = new URLSearchParams(location.search).get('next') ?? '/';
    const sitePage = /^\/(?:index\.html|personal\.html)?(?:[?#].*)?$/.test(next);
    location.replace(sitePage ? next : '/');
  });

  const audio = document.querySelector('#birthday-audio');
  const retry = new AbortController();

  function startSoundtrack() {
    audio.play().then(
      () => retry.abort(),
      error => {
        if (error.name !== 'NotAllowedError') retry.abort();
      }
    );
  }

  for (const event of ['click', 'keydown']) {
    document.addEventListener(event, startSoundtrack, {signal: retry.signal});
  }
  startSoundtrack();
})();
