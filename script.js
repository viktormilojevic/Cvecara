/* ============================================================
   BLOOMHAUS — script.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Product data ---------- */
  /* Each product carries a tiny inline SVG "photo" so the shop never
     depends on external hotlinked images. Swap `art` for a real
     <img src="..."> if you have your own product photography. */
  const PRODUCTS = [
    {
      id: "p1", name: "Sunday Peony", price: 42, cat: "everyday", badge: "Bestseller",
      desc: "Blush peonies, ranunculus, eucalyptus.",
      art: bloomSVG(["#EFC9CC", "#E2A6AC", "#F6ECD9"])
    },
    {
      id: "p2", name: "Garden Rose Bundle", price: 58, cat: "everyday",
      desc: "Garden roses with trailing jasmine.",
      art: bloomSVG(["#E9B7BB", "#C6A15B", "#EFE6D4"])
    },
    {
      id: "p3", name: "Ivory & Vine", price: 96, cat: "wedding", badge: "New",
      desc: "White ranunculus, olive branch, ivory ribbon.",
      art: bloomSVG(["#F6ECD9", "#EFE6D4", "#4B6B4A"])
    },
    {
      id: "p4", name: "Bridal Trail", price: 140, cat: "wedding",
      desc: "Cascading bouquet, garden rose and stock.",
      art: bloomSVG(["#F3D8DA", "#EFC9CC", "#33502F"])
    },
    {
      id: "p5", name: "Quiet White", price: 68, cat: "sympathy",
      desc: "White lily, tuberose, soft greenery.",
      art: bloomSVG(["#F6ECD9", "#EFE6D4", "#2F4B37"])
    },
    {
      id: "p6", name: "Still Waters", price: 74, cat: "sympathy",
      desc: "Hydrangea, eucalyptus, dusty miller.",
      art: bloomSVG(["#E7ECE4", "#C7D2C3", "#3E5D3A"])
    },
    {
      id: "p7", name: "Big Occasion", price: 88, cat: "celebration", badge: "Bestseller",
      desc: "Dahlia, celosia, ranunculus, in berry tones.",
      art: bloomSVG(["#A6344B", "#C6A15B", "#7E2436"])
    },
    {
      id: "p8", name: "Confetti Bunch", price: 54, cat: "celebration",
      desc: "Mixed brights — tulip, anemone, spray rose.",
      art: bloomSVG(["#C6A15B", "#A6344B", "#4B6B4A"])
    }
  ];

  function bloomSVG(colors) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 78 C 58 92, 56 104, 58 116" stroke="#4B6B4A" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="48" cy="52" r="20" fill="${colors[0]}"/>
      <circle cx="72" cy="54" r="17" fill="${colors[1]}"/>
      <circle cx="60" cy="36" r="16" fill="${colors[2]}"/>
      <circle cx="60" cy="52" r="8" fill="${colors[1]}" opacity="0.7"/>
    </svg>`;
  }

  /* ---------- Render products ---------- */
  const productGrid = document.getElementById("productGrid");

  function renderProducts(filter) {
    const list = filter && filter !== "all" ? PRODUCTS.filter(p => p.cat === filter) : PRODUCTS;
    productGrid.innerHTML = list.map(p => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
          ${p.art}
        </div>
        <div class="product-body">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-row">
            <span class="product-price">$${p.price}</span>
            <button class="add-btn" data-id="${p.id}">Add to cart</button>
          </div>
        </div>
      </article>
    `).join("");
    observeCards();
  }

  renderProducts("all");

  /* Reveal product cards as they scroll into view */
  function observeCards() {
    const cards = productGrid.querySelectorAll(".product-card");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("is-visible"), i * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(c => io.observe(c));
  }

  /* ---------- Filters ---------- */
  const filterRow = document.getElementById("filterRow");
  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    filterRow.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderProducts(btn.dataset.filter);
  });

  /* Occasion cards also filter the shop grid */
  document.querySelectorAll(".occasion-card").forEach(card => {
    card.addEventListener("click", () => {
      const target = card.dataset.filter;
      const chip = filterRow.querySelector(`[data-filter="${target}"]`);
      if (chip) chip.click();
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Cart ---------- */
  let cart = {}; // id -> qty

  const cartCountEl = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");

  function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    cartCountEl.classList.remove("bump");
    void cartCountEl.offsetWidth; // restart animation
    cartCountEl.classList.add("bump");
    showToast(`${findProduct(id).name} added to cart`);
  }

  function removeFromCart(id) {
    delete cart[id];
    renderCart();
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const totalQty = ids.reduce((sum, id) => sum + cart[id], 0);
    cartCountEl.textContent = totalQty;

    if (!ids.length) {
      cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty — flowers won't add themselves.</p>`;
      cartTotalEl.textContent = "$0";
      return;
    }

    let total = 0;
    cartItemsEl.innerHTML = ids.map(id => {
      const p = findProduct(id);
      const qty = cart[id];
      total += p.price * qty;
      return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item-media">${p.art}</div>
          <div class="cart-item-info">
            <h5>${p.name}</h5>
            <span>${qty} × $${p.price}</span>
          </div>
          <button class="cart-item-remove" data-id="${id}">Remove</button>
        </div>
      `;
    }).join("");
    cartTotalEl.textContent = `$${total}`;
  }

  productGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    addToCart(btn.dataset.id);
    btn.classList.add("is-added");
    const original = btn.textContent;
    btn.textContent = "Added ✓";
    setTimeout(() => { btn.textContent = original; btn.classList.remove("is-added"); }, 1200);
  });

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cart-item-remove");
    if (!btn) return;
    removeFromCart(btn.dataset.id);
  });

  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartOverlay.classList.add("is-open");
    cartToggle.setAttribute("aria-expanded", "true");
  }
  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartOverlay.classList.remove("is-open");
    cartToggle.setAttribute("aria-expanded", "false");
  }
  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (!Object.keys(cart).length) { showToast("Add a bouquet before checking out"); return; }
    showToast("This is a demo — checkout isn't wired up yet");
  });

  renderCart();

  /* ---------- Toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  /* ---------- Header: scroll shrink ---------- */
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Search panel ---------- */
  const searchToggle = document.getElementById("searchToggle");
  const searchPanel = document.getElementById("searchPanel");
  searchToggle.addEventListener("click", () => {
    const open = searchPanel.classList.toggle("is-open");
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open) searchPanel.querySelector("input").focus();
  });

  /* ---------- Testimonial carousel ---------- */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  const slides = track.children.length;
  let current = 0;
  let autoTimer;

  for (let i = 0; i < slides; i++) {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function goTo(i) {
    current = (i + slides) % slides;
    track.style.transform = `translateX(-${current * 100}%)`;
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle("is-active", idx === current));
    restartAuto();
  }
  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }
  document.getElementById("testPrev").addEventListener("click", () => goTo(current - 1));
  document.getElementById("testNext").addEventListener("click", () => goTo(current + 1));
  restartAuto();

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterNote = document.getElementById("newsletterNote");
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsletterNote.textContent = "You're on the list — first email lands Monday.";
    newsletterForm.reset();
  });

  /* ---------- Back to top ---------- */
  document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Scroll reveal for sections ---------- */
  const revealTargets = document.querySelectorAll(".occasions, .shop, .studio, .testimonials, .newsletter");
  revealTargets.forEach(el => el.classList.add("reveal"));
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => revealIO.observe(el));

  /* ---------- Ambient falling petals (one orchestrated moment) ---------- */
  const petalLayer = document.getElementById("petalLayer");
  const petalColors = ["#EFC9CC", "#C6A15B", "#A6344B", "#F3D8DA"];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const petalCount = window.innerWidth < 700 ? 8 : 14;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement("span");
      const size = 8 + Math.random() * 10;
      petal.className = "petal";
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.7}px`;
      petal.style.background = petalColors[i % petalColors.length];
      petal.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
      petal.style.animationDuration = `${9 + Math.random() * 6}s`;
      petal.style.animationDelay = `${Math.random() * 6}s`;
      petalLayer.appendChild(petal);
    }
    // Remove the ambient layer after the initial sequence settles, so it
    // never becomes a distracting, indefinite background effect.
    setTimeout(() => petalLayer.classList.add("is-done"), 20000);
  }

})();