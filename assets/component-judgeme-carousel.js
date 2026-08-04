(function () {
  // Conservative on purpose: must fit in the fixed 96px collapsed height
  // (component-judgeme-carousel.css) even in the narrowest card width the
  // layout produces (5-per-row on wide screens).
  var MAX_CHARS = 110;

  function truncateText(text, maxChars) {
    if (text.length <= maxChars) return text;
    var truncated = text.slice(0, maxChars);
    var lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);
    truncated = truncated.replace(/[.,;:!?…\s]+$/, '');
    return truncated + '…';
  }

  function setupCard(body, i18n) {
    body.dataset.jdgmReadMoreReady = 'true';

    // Every card gets a Read more button and the same collapsed text
    // length, so every card ends up the same size, whether or not its
    // review actually needed truncating.
    var textEl = body.querySelector('p') || body;
    var fullText = textEl.textContent.trim();
    var truncatedText = truncateText(fullText, MAX_CHARS);

    textEl.textContent = truncatedText;

    var expanded = false;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jdgm-carousel-item__read-more';
    btn.textContent = i18n.readMore;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      expanded = !expanded;
      textEl.textContent = expanded ? fullText : truncatedText;
      btn.textContent = expanded ? i18n.readLess : i18n.readMore;
      body.classList.toggle('jdgm-carousel-item__review-body--expanded', expanded);
    });

    body.insertAdjacentElement('afterend', btn);
  }

  function setupAllCards(i18n) {
    document
      .querySelectorAll('.jdgm-carousel-item__review-body:not([data-jdgm-read-more-ready])')
      .forEach(function (body) {
        setupCard(body, i18n);
      });
  }

  function init() {
    var i18nEl = document.getElementById('jdgm-carousel-i18n');
    var i18n = {
      readMore: (i18nEl && i18nEl.dataset.readMore) || 'Read more',
      readLess: (i18nEl && i18nEl.dataset.readLess) || 'Read less'
    };

    setupAllCards(i18n);

    // Judge.me may render carousel items asynchronously depending on
    // plan/version, so keep watching for a while in case none exist yet.
    var wrapper = document.querySelector('.jdgm-carousel-wrapper');
    if (wrapper) {
      var observer = new MutationObserver(function () {
        setupAllCards(i18n);
      });
      observer.observe(wrapper, { childList: true, subtree: true });
      setTimeout(function () {
        observer.disconnect();
      }, 8000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
