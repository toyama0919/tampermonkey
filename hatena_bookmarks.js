// ==UserScript==
// @name         Hatena Bookmarks Navigation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Hatena Bookmarks
// @author       toyama0919
// @match        https://b.hatena.ne.jp/hotentry*
// @match        https://b.hatena.ne.jp/entrylist*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena_bookmarks.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena_bookmarks.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;

  const style = document.createElement('style');
  style.textContent = `
    .hatena-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  const getArticleLinks = () => {
    // はてなブックマークの記事タイトルのリンクを取得
    return Array.from(document.querySelectorAll('a.js-keyboard-openable'))
      .filter(el => el.href && !el.href.includes('javascript:'));
  };

  const selectArticle = (index) => {
    const links = getArticleLinks();
    if (index < 0 || index >= links.length) return;

    // Remove previous selection
    document.querySelectorAll('.hatena-nav-selected').forEach(el => {
      el.classList.remove('hatena-nav-selected');
    });

    // Add new selection
    const selectedLink = links[index];
    selectedLink.classList.add('hatena-nav-selected');
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
    const links = getArticleLinks();
    if (links.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex <= 0) {
          selectArticle(0);
        } else {
          selectArticle(currentIndex - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < 0) {
          selectArticle(0);
        } else if (currentIndex < links.length - 1) {
          selectArticle(currentIndex + 1);
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
