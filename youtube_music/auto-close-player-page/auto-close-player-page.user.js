// ==UserScript==
// @name         YouTube Music: Auto-close player page (force mini player)
// @namespace    https://github.com/InvestigatorDoofy
// @version      2.0
// @description  On music.youtube.com, watches for ytmusic-player-page gaining the "player-page-open" attribute and immediately clicks the "Close player page" button. This prevents the full player page from staying open when you click Play on browse pages (New Releases, albums, etc.), while keeping playback in the mini-player.
// @author       InvestigatorDoofy
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=music.youtube.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  const LOG_PREFIX = '[YT Music Auto-Close]';
  let lastCloseTime = 0;
  const COOLDOWN_MS = 800; // avoid rapid re-closing loops

  function tryClosePlayerPage() {
    const playerPage = document.querySelector('ytmusic-player-page');
    if (!playerPage) return false;

    // Only act if the full player page is currently open
    if (!playerPage.hasAttribute('player-page-open')) {
      return false;
    }

    // Cooldown to prevent fighting with intentional user expand
    const now = Date.now();
    if (now - lastCloseTime < COOLDOWN_MS) {
      return false;
    }

    // Find the close button
    const closeBtn = playerPage.querySelector('button[aria-label="Close player page"]') ||
                     document.querySelector('button[aria-label="Close player page"]');

    if (closeBtn) {
      console.log(LOG_PREFIX, 'Player page opened → clicking close button');
      closeBtn.click();
      lastCloseTime = now;
      return true;
    } else {
      // Button might not be rendered yet — try again shortly
      setTimeout(() => {
        const btn = document.querySelector('button[aria-label="Close player page"]');
        if (btn && playerPage.hasAttribute('player-page-open')) {
          btn.click();
          lastCloseTime = Date.now();
        }
      }, 120);
      return false;
    }
  }

  function setupObserver() {
    // Initial check (in case it already has the attribute)
    tryClosePlayerPage();

    // Watch for the player page element and its attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check if ytmusic-player-page was added or had attributes changed
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              if (node.matches && node.matches('ytmusic-player-page')) {
                // New player page appeared — check its state
                setTimeout(tryClosePlayerPage, 50);
              } else if (node.querySelector) {
                const pp = node.querySelector('ytmusic-player-page');
                if (pp) setTimeout(tryClosePlayerPage, 50);
              }
            }
          }
        }

        if (mutation.type === 'attributes' &&
            mutation.target.nodeName === 'YTMUSIC-PLAYER-PAGE' &&
            mutation.attributeName === 'player-page-open') {
          // The key attribute changed on the player page
          tryClosePlayerPage();
        }
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['player-page-open']
    });

    // Also listen for YouTube's navigation events (SPA)
    const navigationEvents = ['yt-navigate-finish', 'yt-page-data-updated'];
    navigationEvents.forEach(eventName => {
      document.addEventListener(eventName, () => {
        // Give the DOM a moment to update after navigation
        setTimeout(tryClosePlayerPage, 150);
      }, { passive: true });
    });

    console.log(LOG_PREFIX, 'Observer active — will auto-close player page when it opens');
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver, { once: true });
  } else {
    setupObserver();
  }

  // Expose for manual testing in console
  if (typeof unsafeWindow !== 'undefined') {
    unsafeWindow.__ytMusicForceClosePlayerPage = tryClosePlayerPage;
  }
})();
