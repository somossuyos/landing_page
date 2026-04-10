(function () {
  var header = document.getElementById("header");

  document.querySelectorAll(".media-frame img").forEach(function (img) {
    function usePlaceholder() {
      var frame = img.closest(".media-frame");
      if (frame) frame.classList.add("is-placeholder");
      img.remove();
    }
    if (img.complete && img.naturalWidth === 0) usePlaceholder();
    else img.addEventListener("error", usePlaceholder);
  });

  function onScroll() {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var target = new Date("2026-07-18T07:00:00-05:00");
  var els = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    var now = new Date();
    var diff = target.getTime() - now.getTime();
    if (diff <= 0) {
      if (els.days) els.days.textContent = "00";
      if (els.hours) els.hours.textContent = "00";
      if (els.minutes) els.minutes.textContent = "00";
      if (els.seconds) els.seconds.textContent = "00";
      return;
    }
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var minutes = Math.floor((s % 3600) / 60);
    var seconds = s % 60;
    if (els.days) els.days.textContent = String(days);
    if (els.hours) els.hours.textContent = pad(hours);
    if (els.minutes) els.minutes.textContent = pad(minutes);
    if (els.seconds) els.seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
