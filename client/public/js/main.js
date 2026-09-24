/**
 * CLYX MEDIA - APPLICATION LOGIC
 * Theme switcher, 3D laptop tilt, pop-up campaigns carousel, cursor, and photo upload
 */
function initClyxMedia() {
  // 1. Theme Toggle with Light Mode Royal Blue Styling
  const toggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  
  let currentTheme = localStorage.getItem('clyx_standalone_theme') || localStorage.getItem('clyx-theme') || 'dark';
  applyTheme(currentTheme);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      if(themeIcon) themeIcon.textContent = '☀️';
      if(themeLabel) themeLabel.textContent = 'Light';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      if(themeIcon) themeIcon.textContent = '🌙';
      if(themeLabel) themeLabel.textContent = 'Dark';
    }
    localStorage.setItem('clyx-theme', theme);
    localStorage.setItem('clyx_standalone_theme', theme);
    window.dispatchEvent(new CustomEvent('clyx-theme-change', { detail: theme }));
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  // 2. Preloader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 1450);
  }

  // 3. Cursor
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.innerWidth >= 1024) {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    let hasMoved = false;
    window.addEventListener('mousemove', (e) => {
      if (!hasMoved) {
        hasMoved = true;
        dot.classList.add('active');
        ring.classList.add('active');
      }
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`;
    });
    document.addEventListener('mouseleave', () => {
      dot.classList.remove('active');
      ring.classList.remove('active');
    });
    document.addEventListener('mouseenter', () => {
      if (hasMoved) {
        dot.classList.add('active');
        ring.classList.add('active');
      }
    });
    function renderRing() {
      ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15;
      ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`;
      requestAnimationFrame(renderRing);
    }
    renderRing();
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .coverflow-card, .founder-card, .blog-card, .career-card, .search-result-item, .search-tag')) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  // 4. Parallax Hero Clips
  const stack = document.getElementById('clipStack');
  if (stack) {
    const cards = stack.querySelectorAll('.clip-card');
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      cards.forEach((card, idx) => {
        const depth = parseFloat(card.getAttribute('data-depth')) || 0.05;
        const moveX = x * depth * 70; const moveY = y * depth * 70;
        const baseRot = (idx % 2 === 0 ? -1 : 1) * (idx * 3 + 2);
        card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${baseRot}deg)`;
      });
    });
  }

  // 5. 3D Macbook Scroll Perspective
  const section = document.querySelector('.kinetic-section');
  const macbook = document.querySelector('.macbook-container');
  const badges = document.querySelectorAll('.floating-badge');
  if (section && macbook) {
    function onScroll() {
      const rect = section.getBoundingClientRect();
      const totalDistance = section.offsetHeight - window.innerHeight;
      let progress = Math.max(0, Math.min(1, -rect.top / totalDistance));
      const rotateX = 26 * (1 - progress);
      const scale = 0.88 + (0.12 * progress);
      const translateY = (1 - progress) * 35;
      macbook.style.transform = `rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
      badges.forEach((b, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        b.style.transform = `translate3d(${(1 - progress) * 25 * dir}px, ${(1 - progress) * 15}px, 0)`;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 6. Live Oscillating Chart Bars
  // Each bar wobbles around its own starting height, so the weekly shape (Mon low -> Sat high) stays readable
  // instead of every bar drifting towards the same value.
  setInterval(() => {
    document.querySelectorAll('.chart-bar').forEach(bar => {
      if (!bar.dataset.base) bar.dataset.base = parseInt(bar.style.height || '70', 10);
      const base = Number(bar.dataset.base);
      const next = Math.max(20, Math.min(98, base + (Math.random() * 12 - 6)));
      bar.style.height = `${next.toFixed(1)}%`;
    });
  }, 2400);

  // 7. Counters (Count from 0)
  function formatCounter(el, value) {
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    return `${prefix}${value.toFixed(decimals)}${suffix}`;
  }

  function startCounting(el) {
    const duration = 1800;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      // Re-read the target every frame so CMS content arriving mid-animation is not overwritten.
      const target = parseFloat(el.getAttribute('data-target') || '0');
      const p = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCounter(el, p < 1 ? target * ease : target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounting(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  // Values that are not numbers (e.g. "Top 1%") carry data-static and are shown as plain text.
  function observeCounters(root) {
    (root || document).querySelectorAll('.counter:not([data-static])').forEach(c => counterObserver.observe(c));
  }
  observeCounters(document);

  const coverflowWrap = document.getElementById('coverflowWrap');
  const viewport = document.getElementById('coverflowViewport');
  const stage = document.getElementById('coverflowStage');
  const sidePrevBtn = document.getElementById('coverflowNavPrev');
  const sideNextBtn = document.getElementById('coverflowNavNext');
  const captionPanel = document.getElementById('coverflowCaption');
  const dotsWrap = document.getElementById('coverflowDots');
  const tabs = document.querySelectorAll('#portfolioFilterTabs .filter-tab');
  const prevBtn = document.getElementById('portfolioPrevBtn');
  const nextBtn = document.getElementById('portfolioNextBtn');

  if (coverflowWrap && viewport && stage) {
    // 3D Coverflow Physics Parameters (21st.dev spec)
    const rotate = 44;       // Degrees first neighbour tilts
    const depth = 0.6;       // Recession multiple of card width
    const perspective = 3.2; // Perspective multiplier
    const falloff = 0.56;    // Rake distance exponent
    const fade = 0.1;        // Opacity drop per distance step
    const gap = 0.05;        // Space between cards fraction
    const loop = true;       // Ring looping mode

    let currentItems = [];
    let pos = 0;             // Fractional index at center (truth)
    let target = 0;          // Destination index
    let selected = 0;        // Current selected whole card index
    let cardWidth = 0;       // Measured card width in px
    let rafId = null;
    let dragState = null;

    /**
     * Explicit Middle Card Centering Rule:
     * - If 7 items: 4th card (index 3) is middle main
     * - If even items like 6: 3rd card (index 2) is middle main
     * - Formula: count % 2 === 0 ? (count / 2) - 1 : Math.floor(count / 2)
     */
    function getInitialCoverflowIndex(count) {
      if (count <= 0) return 0;
      return count % 2 === 0 ? (count / 2) - 1 : Math.floor(count / 2);
    }

    /** Nearest whole card folded into 0..count-1 */
    function indexAt(p, count) {
      if (count <= 0) return 0;
      return ((Math.round(p) % count) + count) % count;
    }

    function clampPos(p, count) {
      if ((loop && count >= 4) || count <= 1) return p;
      return Math.max(0, Math.min(count - 1, p));
    }

    /** Paint straight to DOM with 3D transforms & depth lighting */
    function paint() {
      const count = currentItems.length;
      if (!count || !cardWidth) return;
      const pitch = cardWidth * (1 + gap);
      const cards = stage.querySelectorAll('.coverflow-card');

      cards.forEach((card, index) => {
        let offset = index - pos;
        if (loop && count >= 4) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }

        const distance = Math.abs(offset);
        const ramp = Math.pow(distance, falloff);
        const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

        card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * cardWidth * ramp}px) rotateY(${-tilt}deg)`;

        const edge = (loop && count >= 4) ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        card.style.zIndex = String(Math.round(100 - distance));

        const isCenter = Math.round(distance) === 0;
        card.classList.toggle('is-active', isCenter);
        card.setAttribute('aria-hidden', (!isCenter).toString());
      });
    }

    function settle(nextTarget) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      const count = currentItems.length;
      target = nextTarget;
      const newSelected = indexAt(nextTarget, count);
      if (newSelected !== selected) {
        selected = newSelected;
        updateActiveDetails(selected);
      }

      function step() {
        const remaining = target - pos;
        if (Math.abs(remaining) < 0.0004) {
          pos = target;
          paint();
          rafId = null;
          return;
        }
        pos += remaining * 0.12;
        paint();
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    function goTo(index) {
      const count = currentItems.length;
      if (!count) return;
      const nextTarget = (loop && count >= 4)
        ? index + Math.round((target - index) / count) * count
        : index;
      settle(clampPos(nextTarget, count));
    }

    function nudge(by) {
      const count = currentItems.length;
      if (!count) return;
      settle(clampPos(Math.round(target) + by, count));
    }

    function updateActiveDetails(idx) {
      const item = currentItems[idx];
      if (!item) return;

      // Update Caption Panel
      if (captionPanel) {
        captionPanel.innerHTML = `
          <div class="coverflow-caption-title">${item.title}</div>
          <div class="coverflow-caption-sub">${item.categoryName} · ${item.deliverables}</div>
          <div class="coverflow-caption-summary">${item.summary}</div>
          <div class="coverflow-caption-metrics">
            <div class="coverflow-metric-item">
              <span class="coverflow-metric-val">${item.results.roas}</span>
              <span class="coverflow-metric-lbl">Blended ROAS</span>
            </div>
            <div class="coverflow-metric-item">
              <span class="coverflow-metric-val">${item.results.revenue}</span>
              <span class="coverflow-metric-lbl">Revenue Growth</span>
            </div>
            <div class="coverflow-metric-item">
              <span class="coverflow-metric-val">${item.results.cpa}</span>
              <span class="coverflow-metric-lbl">CPA Reduction</span>
            </div>
            <div class="coverflow-metric-item">
              <span class="coverflow-metric-val">${item.results.reach}</span>
              <span class="coverflow-metric-lbl">Verified Reach</span>
            </div>
          </div>
          <div>
            <button type="button" class="coverflow-caption-cta" onclick="window.openModal('${item.id}')">
              View Full Case Study & Breakdown ↗
            </button>
          </div>
        `;
      }

      // Update Dots
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll('.coverflow-dot');
        dots.forEach((dot, dIdx) => {
          dot.classList.toggle('active', dIdx === idx);
          dot.setAttribute('aria-current', (dIdx === idx).toString());
        });
      }
    }

    function measureAndPaint() {
      const firstCard = stage.querySelector('.coverflow-card');
      if (firstCard) {
        cardWidth = firstCard.offsetWidth || 280;
      } else {
        cardWidth = 280;
      }
      viewport.style.perspective = `calc(${cardWidth}px * ${perspective})`;
      paint();
    }

    function renderCoverflow(filter = 'all') {
      currentItems = filter === 'all'
        ? [...CLYX_DATA.portfolio]
        : CLYX_DATA.portfolio.filter(p => p.category === filter);

      if (!currentItems.length) {
        stage.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:40px;">No campaigns found in this category.</div>';
        if (captionPanel) captionPanel.innerHTML = '';
        if (dotsWrap) dotsWrap.innerHTML = '';
        return;
      }

      // Render Cards
      stage.innerHTML = currentItems.map((p, idx) => `
        <div class="coverflow-card" data-index="${idx}" data-id="${p.id}" role="group" aria-label="${p.title} (${idx + 1} of ${currentItems.length})">
          <span class="coverflow-card-cat">${p.categoryName.split(' ')[0]}</span>
          <span class="coverflow-card-badge">${p.results.roas} ROAS</span>
          <img src="${p.heroImg}" alt="${p.title}" draggable="false" loading="lazy">
        </div>
      `).join('');

      // Render Pagination Dots
      if (dotsWrap) {
        dotsWrap.innerHTML = currentItems.map((_, idx) => `
          <button type="button" class="coverflow-dot" data-index="${idx}" aria-label="Go to campaign ${idx + 1}"></button>
        `).join('');

        dotsWrap.querySelectorAll('.coverflow-dot').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetIndex = parseInt(btn.getAttribute('data-index'), 10);
            goTo(targetIndex);
          });
        });
      }

      // Explicit middle card selection per rule (e.g. 4th card for 7 items, 3rd card for 6 items)
      const initialIndex = getInitialCoverflowIndex(currentItems.length);
      pos = initialIndex;
      target = initialIndex;
      selected = initialIndex;

      // Card Click Handler
      stage.querySelectorAll('.coverflow-card').forEach(card => {
        card.addEventListener('click', () => {
          if (dragState && dragState.hasMoved) return;
          const cardIdx = parseInt(card.getAttribute('data-index'), 10);
          const currentCenter = indexAt(pos, currentItems.length);
          if (cardIdx === currentCenter) {
            // Already centered: open modal!
            const id = card.getAttribute('data-id');
            window.openModal(id);
          } else {
            // Off-center: rotate to center!
            goTo(cardIdx);
          }
        });
      });

      measureAndPaint();
      updateActiveDetails(initialIndex);
    }

    // Pointer Drag with Controlled Swipe Physics (1 card per swipe)
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
      viewport.classList.add('is-dragging');
      target = pos;
      dragState = {
        id: e.pointerId,
        startX: e.clientX,
        lastX: e.clientX,
        startIndex: selected,
        startPos: pos,
        v: 0,
        startTime: performance.now(),
        t: performance.now(),
        hasMoved: false,
      };
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!dragState || dragState.id !== e.pointerId) return;
      const count = currentItems.length;
      const pitch = cardWidth * (1 + gap);
      if (!pitch) return;

      const now = performance.now();
      const dt = Math.max(now - dragState.t, 1);
      const deltaX = e.clientX - dragState.startX;
      const prevPos = pos;

      // Controlled drag sensitivity (0.75x ratio prevents wild spinning)
      const dragFactor = 0.75;
      pos = clampPos(dragState.startPos - (deltaX * dragFactor) / pitch, count);

      if (Math.abs(deltaX) > 6) {
        dragState.hasMoved = true;
      }

      dragState.v = ((pos - prevPos) / dt) * 1000;
      dragState.t = now;
      dragState.lastX = e.clientX;

      const newIndex = indexAt(pos, count);
      if (newIndex !== selected) {
        selected = newIndex;
        updateActiveDetails(selected);
      }
      paint();
    });

    function endPointerDrag(e) {
      if (!dragState || dragState.id !== e.pointerId) return;
      viewport.classList.remove('is-dragging');
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}

      const count = currentItems.length;
      const totalDeltaX = e.clientX - dragState.startX;
      const totalTime = Math.max(performance.now() - dragState.startTime, 1);
      const velocity = Math.abs(totalDeltaX) / totalTime; // px per ms

      let finalTarget;
      // Controlled swipe: advance at most 1 card forward or backward
      if (Math.abs(totalDeltaX) > 35 || velocity > 0.3) {
        const stepDir = totalDeltaX < 0 ? 1 : -1;
        finalTarget = clampPos(dragState.startIndex + stepDir, count);
      } else {
        // Subtle drag snaps cleanly to the nearest card
        finalTarget = clampPos(Math.round(pos), count);
      }

      setTimeout(() => { dragState = null; }, 80);
      settle(finalTarget);
    }

    viewport.addEventListener('pointerup', endPointerDrag);
    viewport.addEventListener('pointercancel', endPointerDrag);

    // Keyboard & Wheel (Trackpad horizontal swipe throttling)
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudge(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const activeItem = currentItems[selected];
        if (activeItem) window.openModal(activeItem.id);
      }
    });

    // Smooth Trackpad / Mouse horizontal swipe handling with accumulation & lock
    let accumulatedDeltaX = 0;
    let wheelDebounceTimer = null;
    let isWheelLocked = false;
    const WHEEL_THRESHOLD = 45;

    viewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        accumulatedDeltaX += e.deltaX;

        if (!isWheelLocked && Math.abs(accumulatedDeltaX) >= WHEEL_THRESHOLD) {
          nudge(accumulatedDeltaX > 0 ? 1 : -1);
          isWheelLocked = true;
          accumulatedDeltaX = 0;
          setTimeout(() => {
            isWheelLocked = false;
          }, 360);
        }

        clearTimeout(wheelDebounceTimer);
        wheelDebounceTimer = setTimeout(() => {
          accumulatedDeltaX = 0;
          isWheelLocked = false;
        }, 180);
      }
    }, { passive: false });

    // Side Chevrons Overlay (controls card navigation within carousel)
    if (sidePrevBtn) sidePrevBtn.addEventListener('click', () => nudge(-1));
    if (sideNextBtn) sideNextBtn.addEventListener('click', () => nudge(1));

    // Category Tabs & Header Arrows (Category cycling & tab highlighting)
    let currentCategory = 'all';
    const categoryList = Array.from(tabs).map(t => t.getAttribute('data-filter')).filter(Boolean);

    function selectCategory(categoryKey) {
      currentCategory = categoryKey;
      tabs.forEach(t => {
        const isActive = t.getAttribute('data-filter') === categoryKey;
        t.classList.toggle('active', isActive);
      });
      renderCoverflow(categoryKey);
    }

    // Top Section Nav Arrows (cycle through categories)
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const idx = categoryList.indexOf(currentCategory);
        const prevIdx = (idx - 1 + categoryList.length) % categoryList.length;
        selectCategory(categoryList[prevIdx]);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const idx = categoryList.indexOf(currentCategory);
        const nextIdx = (idx + 1) % categoryList.length;
        selectCategory(categoryList[nextIdx]);
      });
    }

    // Filter Tabs Click
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter') || 'all';
        selectCategory(filter);
      });
    });

    // ResizeObserver for dynamic responsiveness
    const resizeObserver = new ResizeObserver(() => {
      measureAndPaint();
    });
    resizeObserver.observe(viewport);

    // Initial render
    selectCategory('all');

    window.handleCardClick = function(id) {
      if (dragState && dragState.hasMoved) return;
      window.openModal(id);
    };

    window.clyxRefreshCoverflow = function() {
      selectCategory(currentCategory || 'all');
    };
  }

  // 9. Case Study Modal
  window.openModal = function(id) {
    const p = CLYX_DATA.portfolio.find(item => item.id === id);
    const backdrop = document.getElementById('modalBackdrop');
    if (!p || !backdrop) return;
    document.getElementById('modalMedia').innerHTML = `<img src="${p.heroImg}" style="width:100%; height:320px; object-fit:cover; border-radius:12px; margin-bottom:24px;">`;
    document.getElementById('modalClient').textContent = p.categoryName;
    document.getElementById('modalCampaign').textContent = p.title;
    document.getElementById('modalResults').innerHTML = `
      <p style="font-size:1.1rem; line-height:1.6; margin-bottom:20px; font-weight:600;">${p.summary}</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:20px 0;">
        <div style="background:var(--bg-card); padding:16px; border-radius:10px; border:1px solid var(--border-subtle);"><strong style="color:var(--clyx-yellow); font-size:0.85rem;">CHALLENGE</strong><p style="font-size:0.9rem; margin-top:4px;">${p.problem}</p></div>
        <div style="background:var(--bg-card); padding:16px; border-radius:10px; border:1px solid var(--border-subtle);"><strong style="color:var(--clyx-yellow); font-size:0.85rem;">STRATEGY</strong><p style="font-size:0.9rem; margin-top:4px;">${p.strategy}</p></div>
      </div>
    `;
    document.getElementById('modalMetrics').innerHTML = `
      <div style="display:flex; justify-content:space-around; padding-top:20px; border-top:1px solid var(--border-subtle);">
        <div style="text-align:center;"><div style="font-size:1.6rem; font-weight:800; color:var(--clyx-yellow);">${p.results.roas}</div><div style="font-size:0.75rem;">ROAS</div></div>
        <div style="text-align:center;"><div style="font-size:1.6rem; font-weight:800;">${p.results.revenue}</div><div style="font-size:0.75rem;">REVENUE</div></div>
        <div style="text-align:center;"><div style="font-size:1.6rem; font-weight:800;">${p.results.cpa}</div><div style="font-size:0.75rem;">CPA</div></div>
      </div>
    `;
    backdrop.classList.add('open');
  };
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn && modalBackdrop) {
    closeBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        modalBackdrop.classList.remove('open');
      }
    });
  }

  // Content now comes from the CMS, so anything interpolated into markup is escaped first.
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  // 10. Founders / Leadership Section
  const teamGrid = document.getElementById('teamGrid');

  function renderTeam() {
    if (!teamGrid || !window.CLYX_DATA || !window.CLYX_DATA.team) return;
    const cards = window.CLYX_DATA.team.map((m) => `
      <div class="team-pill">
        <img src="${esc(m.img)}" alt="${esc(m.name)}" class="team-pill-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'">
        <div class="team-pill-info">
          <h3 class="team-pill-name">${esc(m.name)}</h3>
          <p class="team-pill-role">${esc(m.role || 'CLYX Team')}</p>
        </div>
      </div>
    `).join('');
    // Duplicate for seamless infinite scroll
    teamGrid.innerHTML = `
      <div class="team-marquee-track">
        ${cards}${cards}
      </div>
    `;
  }

  // 11. Testimonials Rendering
  function renderTestimonials() {
    const tTrack = document.getElementById('testimonialTrack');
    if (tTrack && window.CLYX_DATA && window.CLYX_DATA.testimonials) {
      const cards = window.CLYX_DATA.testimonials.map(t => `
        <div class="testimonial-card">
          <p class="testimonial-quote">“${esc(t.quote)}”</p>
          <div class="testimonial-meta">
            <div class="author">${esc(t.author)}</div>
            <div class="brand">${esc([t.role, t.brand].filter(Boolean).join(', '))}${(t.metrics || t.metric) ? ` · <span>${esc(t.metrics || t.metric)}</span>` : ''}</div>
          </div>
        </div>
      `).join('');
      tTrack.innerHTML = cards + cards + cards;
    }
  }

  // 12. Blog Rendering
  function renderBlog() {
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid && window.CLYX_DATA && window.CLYX_DATA.blog) {
      blogGrid.innerHTML = window.CLYX_DATA.blog.map(b => `
        <article class="blog-card" id="${b.id || 'article'}">
          <div class="blog-thumb-wrap">
            <img src="${b.img}" alt="${b.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600'">
          </div>
          <div class="blog-card-body">
            <div class="blog-meta-row">
              <span class="blog-tag">${b.category}</span>
              <span>${b.readTime || '4 min'} · ${b.date || '2026'}</span>
            </div>
            <h3>${b.title}</h3>
            <p>${b.summary}</p>
            <a href="#blog" class="blog-read-link">Read Article →</a>
          </div>
        </article>
      `).join('');
    }
  }

  // 13. Careers Rendering
  function renderCareers() {
    const careersGrid = document.getElementById('careersGrid');
    if (careersGrid && window.CLYX_DATA && window.CLYX_DATA.careers) {
      careersGrid.innerHTML = window.CLYX_DATA.careers.map(c => `
        <div class="career-card">
          <div>
            <div class="career-top-meta">
              <span class="career-tag">${c.tag}</span>
              <span class="career-type">${c.type}</span>
            </div>
            <h3>${c.title}</h3>
            <div class="career-loc">📍 ${c.location}</div>
            <p>${c.description}</p>
          </div>
          <div>
            <div class="career-comp">💰 ${c.compensation}</div>
            <a href="mailto:careers@clyxmedia.com?subject=Application for ${encodeURIComponent(c.title)}" class="btn btn-ghost btn-small" style="width:100%;">Apply Now ↗</a>
          </div>
        </div>
      `).join('');
    }
  }

  // Hydrate Hero & Stat Counters from CLYX_DATA
  function hydrateHeroAndStats() {
    if (!window.CLYX_DATA) return;
    if (window.CLYX_DATA.hero) {
      const eyebrowEl = document.querySelector('.hero-inner .eyebrow');
      const titleEl = document.querySelector('.hero-title');
      const subEl = document.querySelector('.hero-sub');
      if (eyebrowEl && window.CLYX_DATA.hero.eyebrow) {
        eyebrowEl.textContent = window.CLYX_DATA.hero.eyebrow;
      }
      if (titleEl && (window.CLYX_DATA.hero.line1 || window.CLYX_DATA.hero.line2)) {
        const line1 = window.CLYX_DATA.hero.line1;
        const line2 = window.CLYX_DATA.hero.line2;
        titleEl.innerHTML = line2
          ? `<span class="hero-line">${esc(line1)}</span><br><span class="hero-line">into <em class="accent">${esc(line2)}</em></span>`
          : `<span class="hero-line">${esc(line1)}</span>`;
      }
      if (subEl && window.CLYX_DATA.hero.sub) {
        subEl.textContent = window.CLYX_DATA.hero.sub;
      }
    }

    const strip = document.querySelector('.stats-counter-strip');
    if (strip && Array.isArray(window.CLYX_DATA.stats) && window.CLYX_DATA.stats.length) {
      strip.innerHTML = window.CLYX_DATA.stats.map((s) => {
        const counterAttrs = s.isNumeric === false
          ? `data-static="true"`
          : `data-target="${esc(s.target)}" data-prefix="${esc(s.prefix || '')}" data-suffix="${esc(s.suffix || '')}" data-decimals="${esc(s.decimals || 0)}"`;
        const initial = s.isNumeric === false ? esc(s.text) : '0';
        return `<div class="stat-counter-card">
          <div class="counter-number counter" ${counterAttrs}>${initial}</div>
          <div class="counter-label">${esc(s.label)}</div>
          <div class="counter-detail">${esc(s.detail)}</div>
        </div>`;
      }).join('');
      observeCounters(strip);
    }
  }

  // Master Content Refresher
  function refreshAllDynamicContent() {
    hydrateHeroAndStats();
    if (typeof window.clyxRefreshCoverflow === 'function') {
      window.clyxRefreshCoverflow();
    }
    renderTeam();
    renderTestimonials();
    renderBlog();
    renderCareers();
  }

  // Initial render on page load
  refreshAllDynamicContent();

  // The React page calls this whenever fresh content arrives from the backend.
  window.clyxRefreshAll = refreshAllDynamicContent;

  // Listen for storage events across open browser tabs
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === 'clyx_live_data') {
      refreshAllDynamicContent();
    }
  });

  // Cross-tab broadcast receiver
  try {
    const liveChannel = new BroadcastChannel('clyx_media_channel');
    liveChannel.onmessage = () => {
      refreshAllDynamicContent();
    };
  } catch (err) {}

  window.addEventListener('clyx_data_updated', refreshAllDynamicContent);

  // 14. Interactive Right-Aligned Search Widget
  const searchToggle = document.getElementById('searchToggle');
  const searchDropdown = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');
  const searchQuickTags = document.getElementById('searchQuickTags');

  function openSearch() {
    if (!searchDropdown) return;
    searchDropdown.classList.add('open');
    if (searchToggle) searchToggle.classList.add('active');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 60);
    }
    renderSearchResults(searchInput ? searchInput.value.trim() : '');
  }

  function closeSearch() {
    if (!searchDropdown) return;
    searchDropdown.classList.remove('open');
    if (searchToggle) searchToggle.classList.remove('active');
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (searchDropdown && searchDropdown.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  if (searchDropdown) {
    searchDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  document.addEventListener('click', (e) => {
    if (searchDropdown && searchDropdown.classList.contains('open')) {
      if (!searchDropdown.contains(e.target) && e.target !== searchToggle && !searchToggle.contains(e.target)) {
        closeSearch();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchDropdown && searchDropdown.classList.contains('open')) {
      closeSearch();
    }
  });

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        renderSearchResults('');
        searchInput.focus();
      }
    });
  }

  if (searchQuickTags) {
    searchQuickTags.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-query');
        if (searchInput && query) {
          searchInput.value = query;
          if (searchClear) searchClear.classList.add('visible');
          renderSearchResults(query);
        }
      });
    });
  }

  function highlightAndScrollTo(targetSelector, csId = null) {
    closeSearch();
    if (csId && typeof window.openModal === 'function') {
      window.openModal(csId);
      return;
    }
    const target = document.querySelector(targetSelector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.remove('search-highlight-pulse');
      void target.offsetWidth;
      target.classList.add('search-highlight-pulse');
      setTimeout(() => target.classList.remove('search-highlight-pulse'), 1800);
    }
  }

  window.clyxNavigateSearch = function(selector, csId) {
    highlightAndScrollTo(selector, csId || null);
  };

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    const q = (query || '').toLowerCase().trim();
    if (searchClear) {
      if (q.length > 0) searchClear.classList.add('visible');
      else searchClear.classList.remove('visible');
    }

    if (!q) {
      searchResults.innerHTML = `
        <div class="search-empty-state">
          Type to search case studies, services, creators, and team.
        </div>
      `;
      return;
    }

    const matches = [];

    // 1. Search Services (from DOM service cards)
    document.querySelectorAll('#services .service-card').forEach(card => {
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
      const desc = card.querySelector('p') ? card.querySelector('p').textContent.trim() : '';
      if (title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        matches.push({
          badge: 'Service',
          title: title,
          desc: desc,
          selector: '#services'
        });
      }
    });

    // 2. Search Portfolio / Case Studies
    if (window.CLYX_DATA && Array.isArray(CLYX_DATA.portfolio)) {
      CLYX_DATA.portfolio.forEach(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const catMatch = (p.categoryName || '').toLowerCase().includes(q);
        const delivMatch = (p.deliverables || '').toLowerCase().includes(q);
        const summMatch = (p.summary || '').toLowerCase().includes(q);
        const stratMatch = (p.strategy || '').toLowerCase().includes(q);
        if (titleMatch || catMatch || delivMatch || summMatch || stratMatch) {
          const roas = p.results && p.results.roas ? ` (${p.results.roas} ROAS)` : '';
          matches.push({
            badge: 'Case Study',
            title: `${p.title}${roas}`,
            desc: p.summary || p.deliverables,
            selector: '#portfolio',
            csId: p.id
          });
        }
      });
    }

    // 3. Search Leadership / Team
    if (window.CLYX_DATA && Array.isArray(CLYX_DATA.team)) {
      CLYX_DATA.team.forEach(t => {
        if ((t.name || '').toLowerCase().includes(q) || (t.role || '').toLowerCase().includes(q) || (t.bio || '').toLowerCase().includes(q)) {
          matches.push({
            badge: 'Leadership',
            title: `${t.name} — ${t.role}`,
            desc: t.bio,
            selector: '#about'
          });
        }
      });
    }

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty-state">
          No matches found for "<strong>${escapeHtml(query)}</strong>". Try "Whitelisting", "Meta Ads", "Reels UGC", or "Case Studies".
        </div>
      `;
      return;
    }

    searchResults.innerHTML = matches.slice(0, 6).map(m => `
      <div class="search-result-item" onclick="clyxNavigateSearch('${m.selector}', ${m.csId ? `'${m.csId}'` : 'null'})">
        <span class="search-result-badge">${m.badge}</span>
        <div class="search-result-content">
          <div class="search-result-title">${escapeHtml(m.title)}</div>
          <div class="search-result-desc">${escapeHtml(m.desc)}</div>
        </div>
        <span style="color: var(--text-muted); font-size: 0.9rem;">↗</span>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  // 15. Mobile Burger Toggle
  const navBurger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  if (navBurger && mobileNav) {
    navBurger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // 16. Cookie Consent Pop-Up Card (Accept All, Essential Only, and Close)
  const cookieBar = document.getElementById('cookieBar');
  const cookieAcceptAll = document.getElementById('cookieAcceptAll') || document.getElementById('cookieAccept');
  const cookieEssential = document.getElementById('cookieEssential') || document.getElementById('cookieDecline');
  const cookieCloseBtn = document.getElementById('cookieCloseBtn');

  if (cookieBar) {
    const consent = localStorage.getItem('clyx_cookie_consent');
    if (consent) {
      cookieBar.classList.add('hidden');
    }

    if (cookieAcceptAll) {
      cookieAcceptAll.addEventListener('click', () => {
        localStorage.setItem('clyx_cookie_consent', 'all');
        cookieBar.classList.add('hidden');
      });
    }
    if (cookieEssential) {
      cookieEssential.addEventListener('click', () => {
        localStorage.setItem('clyx_cookie_consent', 'essential');
        cookieBar.classList.add('hidden');
      });
    }
    if (cookieCloseBtn) {
      cookieCloseBtn.addEventListener('click', () => {
        localStorage.setItem('clyx_cookie_consent', 'dismissed');
        cookieBar.classList.add('hidden');
      });
    }
  }

  // 17. Newsletter Form Feedback
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value) {
        alert(`Thank you for subscribing! We've sent a confirmation to ${input.value}`);
        input.value = '';
      }
    });
  }
}; initClyxMedia();
