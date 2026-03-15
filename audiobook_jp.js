// ==UserScript==
// @name         Audiobook.jp Library Navigation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Audiobook.jp Library
// @author       toyama0919
// @match        https://audiobook.jp/library/audiobooks*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/audiobook_jp.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/audiobook_jp.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;

  const style = document.createElement('style');
  style.textContent = `
    .audiobook-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  const getItems = () => {
    return Array.from(document.querySelectorAll('.audiobook-listitem__content'));
  };

  const selectItem = (index) => {
    const items = getItems();
    if (index < 0 || index >= items.length) return;

    document.querySelectorAll('.audiobook-nav-selected').forEach(el => {
      el.classList.remove('audiobook-nav-selected');
    });

    const selected = items[index];
    selected.classList.add('audiobook-nav-selected');
    selected.scrollIntoView({ behavior: 'auto', block: 'center' });
    currentIndex = index;
  };

  document.addEventListener('keydown', (e) => {
    const items = getItems();
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex <= 0) {
          selectItem(0);
        } else {
          selectItem(currentIndex - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < 0) {
          selectItem(0);
        } else if (currentIndex < items.length - 1) {
          selectItem(currentIndex + 1);
        }
        break;

      case 'Enter':
        if (currentIndex >= 0) {
          e.preventDefault();
          const selected = items[currentIndex];

          const title = selected.querySelector('.audiobook-listitem__title')?.textContent.trim() || '';
          const author = selected.querySelector('.audiobook-listitem__author')?.textContent.trim() || '';

          if (e.metaKey || e.ctrlKey) {
            const query = author
              ? `タイトル: ${title}\n${author}\n\nこの書籍の内容を教えてください。`
              : `タイトル: ${title}\n\nこの書籍の内容を教えてください。`;
            const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}`;
            window.open(geminiUrl, '_blank');
          } else {
            const link = selected.closest('a') || selected.querySelector('a');
            if (link) {
              link.click();
            }
          }
        }
        break;
    }
  });
})();
