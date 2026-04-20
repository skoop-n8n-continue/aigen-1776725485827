// animation.js

// Ensure plugins are registered
if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
if (typeof CustomEase !== "undefined") gsap.registerPlugin(CustomEase);

// Configuration
const PRODUCTS_PER_CYCLE = 3;

let PRODUCTS = [];
let isFirstCycle = true;

// Custom easing for high-end feel
CustomEase.create("smoothOut", "M0,0 C0.07,0.82 0.16,1 1,1");
CustomEase.create("bounceSoft", "M0,0 C0.14,0 0.24,1 0.43,1 0.56,1 0.65,0.88 0.77,0.88 0.86,0.88 0.92,1 1,1");

async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    const data = await response.json();
    PRODUCTS = data.products || [];
  } catch (error) {
    console.error('Failed to load products.json, using fallback data:', error);
    // Fallback data if JSON fails to load
    PRODUCTS = [
      {
        "id": "prod_1",
        "name": "Standard Tier",
        "price": "$29",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=standard&backgroundColor=transparent",
        "meta": "Basic Features | 1 User"
      },
      {
        "id": "prod_2",
        "name": "Pro Tier",
        "price": "$79",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=pro&backgroundColor=transparent",
        "meta": "Advanced Tools | 5 Users"
      },
      {
        "id": "prod_3",
        "name": "Enterprise Tier",
        "price": "$199",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=enterprise&backgroundColor=transparent",
        "meta": "Full Access | Unlimited"
      },
      {
        "id": "prod_4",
        "name": "Creator Pack",
        "price": "$49",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=creator&backgroundColor=transparent",
        "meta": "Content Tools | 2 Users"
      },
      {
        "id": "prod_5",
        "name": "Agency Pack",
        "price": "$249",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=agency&backgroundColor=transparent",
        "meta": "Client Management | 10 Users"
      },
      {
        "id": "prod_6",
        "name": "Lifetime Deal",
        "price": "$999",
        "image_url": "https://api.dicebear.com/9.x/shapes/svg?seed=lifetime&backgroundColor=transparent",
        "meta": "One-time Payment | All Features"
      }
    ];
  }

  // Wait a moment for background video to be ready before starting
  setTimeout(() => {
    startCycle();
  }, 500);
}

function getBatch(batchIndex) {
  const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
  const batch = [];
  for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
    if (PRODUCTS.length > 0) {
      batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
    }
  }
  return batch;
}

function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  products.forEach((product, index) => {
    const productEl = document.createElement('div');
    productEl.className = 'product';
    productEl.dataset.index = index;

    // We construct the HTML structure
    productEl.innerHTML = `
      <div class="product-card-bg"></div>
      <div class="product-content">
        <div class="product-image-container">
          <img class="product-image" src="${product.image_url}" alt="${product.name}">
        </div>
        <h2 class="product-name">${product.name}</h2>
        <div class="feature-line"></div>
        <div class="product-price">${product.price}</div>
        <div class="product-meta">${product.meta || ''}</div>
      </div>
    `;

    container.appendChild(productEl);
  });
}

function animateHeader() {
  const tl = gsap.timeline();

  if (typeof SplitText !== "undefined") {
    const titleSplit = new SplitText(".header-title", { type: "chars" });
    const subtitleSplit = new SplitText(".header-subtitle", { type: "chars, words" });

    tl.to(".logo-container", { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
      .set(".header-title", { opacity: 1 }, "-=0.8")
      .from(titleSplit.chars, {
        duration: 0.8,
        y: 40,
        opacity: 0,
        rotationX: -90,
        transformOrigin: "0% 50% -50",
        ease: "back.out(1.5)",
        stagger: 0.05
      }, "-=0.5")
      .set(".header-subtitle", { opacity: 1 }, "-=0.6")
      .from(subtitleSplit.words, {
        duration: 0.6,
        y: 20,
        opacity: 0,
        ease: "power2.out",
        stagger: 0.1
      }, "-=0.4");
  } else {
    // Fallback if SplitText isn't available
    tl.fromTo(".logo-container", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
      .fromTo(".header-title", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(".header-subtitle", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5");
  }

  return tl;
}

function animateCycle(batchIndex) {
  const batch = getBatch(batchIndex);
  renderBatch(batch);

  // Define total duration of the cycle for the progress bar
  const entranceDuration = 1.5;
  const idleDuration = 5.0;
  const exitDuration = 1.0;
  const totalCycleTime = entranceDuration + idleDuration + exitDuration;

  const tl = gsap.timeline({
    onComplete: () => {
      isFirstCycle = false;
      animateCycle(batchIndex + 1);
    }
  });

  // Progress Bar for this cycle
  gsap.fromTo("#progress-bar",
    { width: "0%" },
    { width: "100%", duration: totalCycleTime, ease: "none" }
  );

  // If this is the very first cycle, animate the header in
  if (isFirstCycle) {
    tl.add(animateHeader(), 0);
  }

  // --- Phase 1: ENTRANCE ---
  tl.addLabel("entrance", isFirstCycle ? "+=0.5" : 0);

  // Staggered entrance of product cards
  tl.fromTo(".product",
    {
      y: 150,
      opacity: 0,
      scale: 0.9,
      rotationY: 15,
      z: -100
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      rotationY: 0,
      z: 0,
      duration: entranceDuration,
      ease: "power3.out",
      stagger: 0.15
    }, "entrance");

  // Animate inner content
  tl.fromTo(".product-image",
    { y: -30, opacity: 0, scale: 0.8 },
    { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.2)", stagger: 0.15 },
    "entrance+=0.3"
  );

  tl.fromTo([".product-name", ".feature-line", ".product-price", ".product-meta"],
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: { amount: 0.4, grid: "auto", from: "start" } },
    "entrance+=0.5"
  );


  // --- Phase 2: LIVING MOMENT (Idle) ---
  tl.addLabel("living", "+=0");

  // Continuous floating effect for the cards
  gsap.to(".product", {
    y: "-=15",
    duration: 2.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    stagger: {
      each: 0.2,
      from: "center"
    }
  });

  // Slight subtle floating for images
  gsap.to(".product-image", {
    y: "-=10",
    rotation: "random(-2, 2)",
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.3
  });

  // Wait for the idle duration
  tl.to({}, { duration: idleDuration });


  // --- Phase 3: EXIT ---
  tl.addLabel("exit");

  // Kill the continuous floating animations before exit to prevent conflicts
  tl.call(() => {
    gsap.killTweensOf(".product");
    gsap.killTweensOf(".product-image");
  }, null, "exit");

  tl.to(".product-content", {
    y: -20,
    opacity: 0,
    duration: 0.6,
    ease: "power2.in",
    stagger: 0.1
  }, "exit");

  tl.to(".product", {
    y: -100,
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: "power3.in",
    stagger: 0.1
  }, "exit+=0.2");
}

function startCycle() {
  // Set initial states
  gsap.set(".logo-container", { opacity: 0, y: 30 });
  gsap.set(".header-title", { opacity: 0 });
  gsap.set(".header-subtitle", { opacity: 0 });

  animateCycle(0);
}

// Start everything when DOM is ready
window.addEventListener('DOMContentLoaded', loadProducts);
