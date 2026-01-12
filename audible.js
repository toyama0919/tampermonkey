// ==UserScript==
// @name         Audible Library Navigation
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Keyboard shortcuts for Audible Library
// @author       toyama0919
// @match        https://www.audible.co.jp/library/titles*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/audible.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/audible.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;

  const style = document.createElement('style');
  style.textContent = `
    .audible-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  const getArticleLinks = () => {
    // 書籍コンテナを取得して、各コンテナから書籍タイトルのリンクのみを抽出
    const bookRows = Array.from(document.querySelectorAll('.adbl-library-content-row'));

    return bookRows
      .map(row => {
        // 書籍タイトルのリンク（headline3のspanを含むもの）を取得
        return row.querySelector('a.bc-link.bc-color-base[href*="/pd/"] span.bc-size-headline3')?.closest('a');
      })
      .filter(link => link !== null && link !== undefined);
  };

  const selectArticle = (index) => {
    const links = getArticleLinks();
    if (index < 0 || index >= links.length) return;

    // Remove previous selection
    document.querySelectorAll('.audible-nav-selected').forEach(el => {
      el.classList.remove('audible-nav-selected');
    });

    // Add new selection
    const selectedLink = links[index];
    selectedLink.classList.add('audible-nav-selected');
    selectedLink.scrollIntoView({ behavior: 'auto', block: 'center' });
    currentIndex = index;
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
          const selectedLink = links[currentIndex];
          const url = 'https://www.audible.co.jp' + selectedLink.getAttribute('href');

          if (e.metaKey || e.ctrlKey) {
            // Get book title
            const titleElement = selectedLink.querySelector('span.bc-text.bc-size-headline3') || selectedLink;
            const title = titleElement.textContent.trim();

            // Get author name(s)
            const listContainer = selectedLink.closest('ul.bc-list');
            const authorElements = listContainer?.querySelectorAll('.authorLabel a.bc-link') || [];
            const authors = Array.from(authorElements).map(a => a.textContent.trim()).join(', ');

            // Create Gemini query with title and author (with line breaks)
            const query = authors
              ? `タイトル: ${title}\n著者: ${authors}\n\nこの書籍の内容を教えてください。`
              : `タイトル: ${title}\n\nこの書籍の内容を教えてください。`;
            const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}`;
            window.open(geminiUrl, '_blank');
          } else {
            location.href = url;
          }
        }
        break;
    }
  });
})();
