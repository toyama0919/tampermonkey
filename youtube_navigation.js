// ==UserScript==
// @name         YouTube Navigation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for YouTube (search, history, playlist)
// @author       toyama0919
// @match        https://www.youtube.com/results?search_query=*
// @match        https://youtube.com/results?search_query=*
// @match        https://www.youtube.com/feed/history
// @match        https://youtube.com/feed/history
// @match        https://www.youtube.com/playlist?list=*
// @match        https://youtube.com/playlist?list=*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_navigation.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_navigation.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;

  const style = document.createElement('style');
  style.textContent = `
    .youtube-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  // ページに応じて適切なセレクタを選択
  const getVideoLinks = () => {
    const path = location.pathname;
    let selector;

    if (path === '/feed/history') {
      // 履歴ページ
      selector = 'a.yt-lockup-metadata-view-model__title';
    } else if (path.startsWith('/playlist')) {
      // プレイリストページ
      selector = 'a#video-title';
    } else if (path === '/results') {
      // 検索結果ページ
      selector = 'h3>a#video-title';
    } else {
      // その他のページでも一般的なセレクタを試す
      selector = 'a#video-title';
    }

    return Array.from(document.querySelectorAll(selector))
      .filter(el => el.href && el.href.includes('/watch?v='));
  };

  const selectVideo = (index) => {
    const links = getVideoLinks();
    if (index < 0 || index >= links.length) return;

    // Remove previous selection
    document.querySelectorAll('.youtube-nav-selected').forEach(el => {
      el.classList.remove('youtube-nav-selected');
    });

    // Add new selection
    const selectedLink = links[index];
    selectedLink.classList.add('youtube-nav-selected');
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
            // Open Gemini chat with the YouTube URL and summarization request
            const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(url + 'を要約')}`;
            window.open(geminiUrl, '_blank');
          } else {
            location.href = url;
          }
        }
        break;
    }
  });
})();
