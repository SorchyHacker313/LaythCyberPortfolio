(function () {
  "use strict";

  /** Formspree form id (endpoint: https://formspree.io/f/mvzdpzdl) */
  var FORMSPREE_FORM_ID = "mvzdpzdl";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = localStorage.getItem("layth-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", storedTheme);
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("layth-theme", next);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  /* ---------- Scan overlay ---------- */
  var scanOverlay = document.getElementById("scanOverlay");
  var scanFill = document.getElementById("scanFill");
  var scanStatus = document.getElementById("scanStatus");

  function runScan() {
    if (!scanOverlay || prefersReducedMotion) {
      if (scanOverlay) scanOverlay.classList.add("is-done");
      return;
    }
    var steps = [
      { p: 22, t: "Verifying integrity..." },
      { p: 55, t: "Loading defensive modules..." },
      { p: 88, t: "Handshake OK · MEL node" },
      { p: 100, t: "System ready." },
    ];
    var i = 0;
    function tick() {
      if (i >= steps.length) {
        setTimeout(function () {
          scanOverlay.classList.add("is-done");
        }, 280);
        return;
      }
      if (scanFill) scanFill.style.width = steps[i].p + "%";
      if (scanStatus) scanStatus.textContent = steps[i].t;
      i++;
      setTimeout(tick, 420);
    }
    tick();
  }

  runScan();

  /* ---------- Nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Hero typing ---------- */
  var phrases = [
    "Analysing network traffic...",
    "Detecting threats...",
    "Securing systems...",
  ];
  var typingEl = document.getElementById("typingText");
  var phraseIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function typeLoop() {
    if (!typingEl || prefersReducedMotion) {
      if (typingEl) typingEl.textContent = phrases[0];
      return;
    }
    var full = phrases[phraseIndex];
    if (!deleting) {
      typingEl.textContent = full.slice(0, ++charIndex);
      if (charIndex === full.length) {
        deleting = true;
        setTimeout(typeLoop, 2200);
        return;
      }
    } else {
      typingEl.textContent = full.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 28 : 42);
  }

  typeLoop();

  /* ---------- Particles canvas ---------- */
  var canvas = document.getElementById("particleCanvas");
  var ctx = canvas && canvas.getContext("2d");
  var particles = [];
  var mouse = { x: -1e9, y: -1e9 };
  var W = 0;
  var H = 0;
  var PARTICLE_COUNT = 55;
  var LINK_DIST = 120;
  var MOUSE_DIST = 160;

  function resizeCanvas() {
    if (!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.8 + 0.6;
  }

  Particle.prototype.step = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < MOUSE_DIST) {
      var f = (MOUSE_DIST - d) / MOUSE_DIST * 0.08;
      this.x -= (dx / d) * f * 8;
      this.y -= (dy / d) * f * 8;
    }
  };

  function initParticles() {
    particles.length = 0;
    var n = prefersReducedMotion ? 18 : PARTICLE_COUNT;
    for (var i = 0; i < n; i++) particles.push(new Particle());
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var isLight = document.documentElement.getAttribute("data-theme") === "light";
    var g = isLight ? "rgba(0,140,100," : "rgba(0,232,168,";
    var b = isLight ? "rgba(0,120,200," : "rgba(46,196,255,";
    for (var i = 0; i < particles.length; i++) {
      particles[i].step();
    }
    for (var a = 0; a < particles.length; a++) {
      for (var bidx = a + 1; bidx < particles.length; bidx++) {
        var p1 = particles[a];
        var p2 = particles[bidx];
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var alpha = (1 - dist / LINK_DIST) * 0.22;
          ctx.strokeStyle = (a + bidx) % 2 ? g + alpha + ")" : b + alpha * 0.9 + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = k % 3 === 0 ? "rgba(0,232,168,0.55)" : k % 3 === 1 ? "rgba(46,196,255,0.45)" : "rgba(167,139,250,0.35)";
      ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }

  if (canvas && ctx && !prefersReducedMotion) {
    resizeCanvas();
    initParticles();
    window.addEventListener("resize", function () {
      resizeCanvas();
      initParticles();
    });
    window.addEventListener(
      "mousemove",
      function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true }
    );
    window.addEventListener(
      "mouseleave",
      function () {
        mouse.x = -1e9;
        mouse.y = -1e9;
      },
      { passive: true }
    );
    drawParticles();
  } else if (canvas) {
    canvas.style.display = "none";
  }

  /* ---------- Live logs ---------- */
  var logFeed = document.getElementById("logFeed");
  var logTemplates = [
    "[INFO] iface eth0 · RX 12.4 Mbps",
    "[OK] suricata · ruleset refresh",
    "[WARN] auth fail · 192.168.0.x",
    "[INFO] dhcp ACK · lease 3600s",
    "[OK] wazuh agent · heartbeat",
    "[INFO] dns query · resolved",
    "[SCAN] nmap · topology update",
  ];

  function pushLog() {
    if (!logFeed) return;
    var li = document.createElement("li");
    var ts = new Date().toISOString().slice(11, 19);
    li.textContent = ts + " " + logTemplates[Math.floor(Math.random() * logTemplates.length)];
    logFeed.insertBefore(li, logFeed.firstChild);
    while (logFeed.children.length > 8) logFeed.removeChild(logFeed.lastChild);
  }

  if (logFeed && !prefersReducedMotion) {
    for (var L = 0; L < 5; L++) pushLog();
    setInterval(pushLog, 3200 + Math.random() * 2000);
  }

  /* ---------- Terminal ---------- */
  var terminalBody = document.getElementById("terminalBody");
  var terminalForm = document.getElementById("terminalForm");
  var terminalInput = document.getElementById("terminalInput");

  function termLine(html, cls) {
    if (!terminalBody) return;
    var div = document.createElement("div");
    div.className = "terminal-line " + (cls || "");
    div.innerHTML = html;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  var projectSummaries = {
    lab: "SYS-01 Cybersecurity Lab\nIsolated VMs (VirtualBox/VMware). Attack/defence drills.",
    monitor: "SYS-02 Network Monitoring\nWireshark PCAP review, Nmap discovery, Suricata + Wazuh IDS.",
    infra: "SYS-03 Infrastructure\nDNS/DHCP/NAT, port forwarding, uptime-minded config.",
    ir: "SYS-04 Incident Response\nTriage, malware removal, hardening checklist applied.",
    dev: "SYS-05 Development\nPython/C++/JS tools, small UIs, debug workflows.",
  };

  function runCommand(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    termLine("<span style='color:#8b92a8'>$</span> " + escapeHtml(raw), "");
    if (cmd === "help") {
      termLine(
        "Commands: <strong>help</strong> · <strong>projects</strong> · <strong>skills</strong> · <strong>contact</strong> · <strong>clear</strong>",
        "out"
      );
      termLine("Resume: use the <strong>Download Resume</strong> button (add <kbd>resume.pdf</kbd> next to index.html).", "out");
      return;
    }
    if (cmd === "clear") {
      terminalBody.querySelectorAll(".terminal-line").forEach(function (el) {
        if (!el.classList.contains("terminal-welcome")) el.remove();
      });
      return;
    }
    if (cmd === "projects") {
      termLine(Object.keys(projectSummaries).map(function (k) { return projectSummaries[k]; }).join("\n\n"), "out");
      return;
    }
    if (cmd === "skills") {
      termLine(
        "Defence stack: Wireshark, Nmap, Suricata, Wazuh, firewalls, segmentation.\nInfra: Linux, VirtualBox, VMware, DNS/DHCP/NAT.\nCode: Python, C++, JavaScript.",
        "out"
      );
      return;
    }
    if (cmd === "contact") {
      termLine("layth.alrahal@outlook.com · +61 411 173 106", "out");
      return;
    }
    termLine("Unknown command. Type <kbd>help</kbd>.", "err");
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      runCommand(terminalInput.value);
      terminalInput.value = "";
    });
  }

  /* ---------- Skill bars observer ---------- */
  document.querySelectorAll(".metric-bar").forEach(function (bar) {
    var v = bar.getAttribute("data-value");
    var fill = bar.querySelector(".metric-fill");
    if (fill && v) fill.style.setProperty("--fill-width", v + "%");
  });

  var skillPanels = document.querySelectorAll(".skill-panel");
  var ioSkills = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add("is-visible");
      });
    },
    { threshold: 0.2 }
  );
  skillPanels.forEach(function (p) {
    ioSkills.observe(p);
  });

  /* ---------- Reveal timeline / leadership ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var ioReveal = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach(function (el) {
    ioReveal.observe(el);
  });

  /* ---------- Project modal ---------- */
  var modal = document.getElementById("projectModal");
  var modalTerminal = document.getElementById("modalTerminal");

  function openModal(key) {
    var text = projectSummaries[key];
    if (!text || !modal || !modalTerminal) return;
    modalTerminal.textContent =
      "layth@portfolio:~$ cat /opt/briefs/" + key + ".log\n\n" + text + "\n\n[END OF BRIEF — ESC or close to dismiss]";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".project-open").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-open"));
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------- Contact form (Formspree) ---------- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  var contactSubmit = document.getElementById("contactSubmit");

  function setFormNote(msg, isError) {
    if (!formNote) return;
    formNote.textContent = msg || "";
    formNote.classList.toggle("is-error", !!isError);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (!FORMSPREE_FORM_ID) {
        setFormNote(
          "Set FORMSPREE_FORM_ID in js/app.js (create a form at https://formspree.io/). Or email layth.alrahal@outlook.com directly.",
          true
        );
        return;
      }

      var url = "https://formspree.io/f/" + FORMSPREE_FORM_ID;
      var fd = new FormData(contactForm);
      var base = window.location.href.split("#")[0];
      fd.append("_next", base + "#contact");
      fd.append("_subject", "[Portfolio] Message from layth.alrahal site");

      var btnLabel = contactSubmit ? contactSubmit.textContent : "";
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending…";
      }
      setFormNote("", false);

      fetch(url, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: res.ok, status: res.status, data: data };
            });
        })
        .then(function (result) {
          if (result.ok) {
            setFormNote("Message sent. I’ll get back to you soon.", false);
            contactForm.reset();
          } else {
            var err =
              (result.data && result.data.error) ||
              (result.data && result.data.errors && result.data.errors[0] && result.data.errors[0].message) ||
              "Could not send. Try email or check your Formspree dashboard.";
            setFormNote(String(err), true);
          }
        })
        .catch(function () {
          setFormNote("Network error. Email layth.alrahal@outlook.com directly.", true);
        })
        .finally(function () {
          if (contactSubmit) {
            contactSubmit.disabled = false;
            contactSubmit.textContent = btnLabel || "Send message";
          }
        });
    });
  }
})();
