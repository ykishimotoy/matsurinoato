/**
 * Language Switching & Scroll Animations
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'preferred-language';
  const DEFAULT_LANG = 'ja';

  const langJaBtn = document.getElementById('lang-ja');
  const langEnBtn = document.getElementById('lang-en');
  const contentJa = document.getElementById('content-ja');
  const contentEn = document.getElementById('content-en');

  // ============================================
  // Language Switching
  // ============================================

  function setLanguage(lang) {
    if (lang === 'en') {
      contentJa.style.display = 'none';
      contentEn.style.display = 'block';
      langJaBtn.classList.remove('active');
      langEnBtn.classList.add('active');
      document.documentElement.lang = 'en';
      document.title = 'After the Festival | Sapporo Sugoi AI Festival';
    } else {
      contentJa.style.display = 'block';
      contentEn.style.display = 'none';
      langJaBtn.classList.add('active');
      langEnBtn.classList.remove('active');
      document.documentElement.lang = 'ja';
      document.title = 'まつりのあと | 札幌すごいAIまつり';
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    // Re-trigger animations for new content
    setTimeout(initScrollAnimations, 50);
  }

  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ja' || saved === 'en') return saved;
    } catch (e) {}
    return DEFAULT_LANG;
  }

  langJaBtn.addEventListener('click', () => setLanguage('ja'));
  langEnBtn.addEventListener('click', () => setLanguage('en'));

  // ============================================
  // Scroll Animations
  // ============================================

  function initScrollAnimations() {
    const activeWrapper = document.querySelector('.content-wrapper[style*="block"], .content-wrapper:not([style*="none"])');
    if (!activeWrapper) return;

    // Select sections that should animate
    const sections = activeWrapper.querySelectorAll('.hero, .flowchart, .results, .community-info, .ending, .next-event, .contact');

    if (!('IntersectionObserver' in window)) {
      sections.forEach(section => section.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
      section.classList.remove('visible');
      observer.observe(section);
    });

    // Hero is always visible immediately
    const hero = activeWrapper.querySelector('.hero');
    if (hero) hero.classList.add('visible');
  }

  // ============================================
  // Number Tooltip Toggle
  // ============================================

  function initTooltipToggle() {
    const numberItems = document.querySelectorAll('.number-item');

    numberItems.forEach(item => {
      item.addEventListener('click', function(e) {
        const wasActive = this.classList.contains('active');

        // Close all other tooltips
        numberItems.forEach(other => other.classList.remove('active'));

        // Toggle this one
        if (!wasActive) {
          this.classList.add('active');
        }
      });
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.number-item')) {
        numberItems.forEach(item => item.classList.remove('active'));
      }
    });
  }

  // ============================================
  // Flowchart Result Click
  // ============================================

  function initFlowchartClick() {
    // Handle result button clicks (both rect and a elements)
    function handleResultClick(element, resultId) {
      const wrapper = element.closest('.content-wrapper');
      const lang = wrapper.id === 'content-ja' ? 'ja' : 'en';
      const template = document.getElementById('result-data-' + lang);
      const detailBox = wrapper.querySelector('.flow-result-detail');
      const contentBox = detailBox.querySelector('.result-content');

      // Get template content
      const resultData = template.content.querySelector('[data-result="' + resultId + '"]');
      if (resultData) {
        contentBox.innerHTML = resultData.innerHTML;
        detailBox.classList.add('active');
        // Scroll to detail - position at top with small offset
        const flowHint = wrapper.querySelector('.flow-hint');
        if (flowHint) {
          const hintRect = flowHint.getBoundingClientRect();
          const scrollTarget = window.scrollY + hintRect.bottom + 16;
          window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        } else {
          detailBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    // Handle clicks on a.flow-result-link (SVG wrapper)
    document.querySelectorAll('.flow-result-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const resultId = this.dataset.result;
        handleResultClick(this, resultId);
      });
    });

    // Handle clicks on rect.flow-result-btn (fallback for non-wrapped buttons)
    document.querySelectorAll('.flow-result-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        // Skip if already handled by parent link
        if (this.closest('.flow-result-link')) return;
        const resultId = this.dataset.result;
        handleResultClick(this, resultId);
      });
    });

    // Handle close button
    document.querySelectorAll('.result-close').forEach(btn => {
      btn.addEventListener('click', function() {
        this.closest('.flow-result-detail').classList.remove('active');
      });
    });
  }

  // ============================================
  // Scroll Hint for Mobile
  // ============================================

  function initScrollHint() {
    // Only on mobile
    if (window.innerWidth > 800) return;

    const flowcharts = document.querySelectorAll('.flowchart');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const overlay = entry.target.querySelector('.scroll-hint-overlay');
          if (overlay && !overlay.classList.contains('shown')) {
            overlay.classList.add('active', 'shown');
            // Remove after animation completes
            setTimeout(() => {
              overlay.classList.remove('active');
            }, 2500);
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    flowcharts.forEach(flowchart => {
      observer.observe(flowchart);
    });
  }

  // ============================================
  // Init
  // ============================================

  function init() {
    setLanguage(getSavedLanguage());
    initTooltipToggle();
    initFlowchartClick();
    initScrollHint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
