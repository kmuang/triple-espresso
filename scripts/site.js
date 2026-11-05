(function () {
  // Opening hours: [open, close] in 24h decimal hours, keyed by Date#getDay().
  var WEEKDAY = [10, 21];
  var WEEKEND = [11, 18];

  function hoursFor(date) {
    var day = date.getDay();
    return day === 0 || day === 6 ? WEEKEND : WEEKDAY;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toLocalInputValue(date) {
    return (
      date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) + ":" + pad(date.getMinutes())
    );
  }

  function initNav() {
    document.querySelectorAll(".nav").forEach(function (nav) {
      var toggle = nav.querySelector(".nav__toggle");
      if (!toggle) return;

      function setOpen(open) {
        nav.classList.toggle("nav_open", open);
        toggle.setAttribute("aria-expanded", String(open));
      }

      toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("nav_open"));
      });
      nav.querySelectorAll(".nav__link").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
        });
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
      });
    });
  }

  function initVideos() {
    document.querySelectorAll(".recipes__facade").forEach(function (facade) {
      facade.addEventListener("click", function () {
        var iframe = document.createElement("iframe");
        iframe.className = "recipes__iframe";
        iframe.src =
          "https://www.youtube.com/embed/" + facade.dataset.videoId + "?autoplay=1";
        iframe.title = facade.dataset.title;
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        facade.replaceWith(iframe);
        iframe.focus();
      });
    });
  }

  function initDateTime() {
    var input = document.getElementById("date-time");
    if (!input) return;

    input.min = toLocalInputValue(new Date());

    function validate() {
      input.setCustomValidity("");
      if (!input.value) return;
      var date = new Date(input.value);
      if (isNaN(date)) return;
      if (date < new Date()) {
        input.setCustomValidity("Please choose a time in the future.");
        return;
      }
      var hours = hoursFor(date);
      var decimal = date.getHours() + date.getMinutes() / 60;
      if (decimal < hours[0] || decimal > hours[1] - 0.5) {
        input.setCustomValidity(
          "We're open " + hours[0] + ":00 - " + hours[1] + ":00 that day. " +
            "Please pick a time at least 30 minutes before closing."
        );
      }
    }

    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
  }

  function initForms() {
    document.querySelectorAll("form[action^='https://formspree.io/']").forEach(function (form) {
      var status = form.querySelector(".form__status");
      var button = form.querySelector("button[type='submit']");
      if (!status || !button) return;

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

        var label = button.textContent;
        button.disabled = true;
        button.textContent = "Sending...";
        status.className = "form__status";
        status.textContent = "";

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Request failed");
            form.reset();
            status.classList.add("form__status_success");
            status.textContent = form.dataset.success || "Thanks! We got your message.";
          })
          .catch(function () {
            status.classList.add("form__status_error");
            status.textContent =
              "Sorry, something went wrong. Please try again or email us directly.";
          })
          .finally(function () {
            button.disabled = false;
            button.textContent = label;
          });
      });
    });
  }

  initNav();
  initVideos();
  initDateTime();
  initForms();
})();
