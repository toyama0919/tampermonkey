// ==UserScript==
// @name         YouTube History
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for YouTube history
// @author       toyama0919
// @match        https://www.youtube.com/feed/history
// @match        https://youtube.com/feed/history
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_history.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_history.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;

  const style = document.createElement('style');
  style.textContent = `
    .youtube-history-selected {
      outline: 3px solid #ff0000 !important;
      outline-offset: 2px !important;
      background-color: rgba(255, 255, 0, 0.1) !important;
    }
  `;
  document.head.appendChild(style);

  const getVideoLinks = () => {
    return Array.from(document.querySelectorAll('a.yt-lockup-metadata-view-model__title'))
      .filter(el => el.href && el.href.includes('/watch?v='));
  };

  const selectVideo = (index) => {
    const links = getVideoLinks();
    if (index < 0 || index >= links.length) return;

    // Remove previous selection
    document.querySelectorAll('.youtube-history-selected').forEach(el => {
      el.classList.remove('youtube-history-selected');
    });

    // Add new selection
    const selectedLink = links[index];
    selectedLink.classList.add('youtube-history-selected');
    selectedLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentIndex = index;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('URL copied:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  document.addEventListener('keydown', (e) => {
    const links = getVideoLinks();
    if (links.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex <= 0) {
          selectVideo(0);
        } else {
          selectVideo(currentIndex - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < 0) {
          selectVideo(0);
        } else if (currentIndex < links.length - 1) {
          selectVideo(currentIndex + 1);
        }
        break;

      case 'Enter':
        if (currentIndex >= 0) {
          e.preventDefault();
          const url = links[currentIndex].href;
          if (e.metaKey || e.ctrlKey) {
            copyToClipboard(url);
          } else {
            location.href = url;
          }
        }
        break;
    }
  });
})();
