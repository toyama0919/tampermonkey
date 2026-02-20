// ==UserScript==
// @name         YouTube Navigation
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Keyboard shortcuts for YouTube (search, history, playlist, channel)
// @author       toyama0919
// @match        https://www.youtube.com/results?search_query=*
// @match        https://youtube.com/results?search_query=*
// @match        https://www.youtube.com/feed/history
// @match        https://youtube.com/feed/history
// @match        https://www.youtube.com/playlist?list=*
// @match        https://youtube.com/playlist?list=*
// @match        https://www.youtube.com/@*/videos
// @match        https://youtube.com/@*/videos
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_navigation.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_navigation.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;
  let selectedVideos = new Set(); // 選択された動画のインデックス

  const style = document.createElement('style');
  style.textContent = `
    .youtube-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
    .youtube-nav-multi-selected {
      outline: 4px solid #00ff00 !important;
      outline-offset: 3px !important;
      background-color: rgba(0, 255, 0, 0.2) !important;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5) !important;
    }
    .youtube-nav-multi-selected::before {
      content: '✓';
      position: absolute;
      top: 8px;
      left: 8px;
      background: #00ff00;
      color: white;
      font-weight: bold;
      font-size: 16px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .youtube-selection-badge {
      position: fixed;
      top: 80px;
      right: 20px;
      background: #00ff00;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
    } else if (path.includes('/@') && path.endsWith('/videos')) {
      // チャンネルの動画一覧ページ
      selector = 'a#video-title-link';
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

    // Remove previous selection highlight
    document.querySelectorAll('.youtube-nav-selected').forEach(el => {
      el.classList.remove('youtube-nav-selected');
    });

    // Add new selection
    const selectedLink = links[index];
    selectedLink.classList.add('youtube-nav-selected');
    selectedLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentIndex = index;
  };

  const updateMultiSelectionUI = () => {
    const links = getVideoLinks();
    
    // Remove all multi-selection classes
    document.querySelectorAll('.youtube-nav-multi-selected').forEach(el => {
      el.classList.remove('youtube-nav-multi-selected');
    });

    // Add multi-selection class to selected videos
    selectedVideos.forEach(index => {
      if (links[index]) {
        const container = links[index].closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer');
        if (container) {
          container.style.position = 'relative';
          container.classList.add('youtube-nav-multi-selected');
        }
      }
    });

    // Update or create badge
    let badge = document.querySelector('.youtube-selection-badge');
    if (selectedVideos.size > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'youtube-selection-badge';
        document.body.appendChild(badge);
      }
      badge.textContent = `${selectedVideos.size}個選択中`;
    } else if (badge) {
      badge.remove();
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

      case ' ':
        // Space: Toggle multi-selection
        if (currentIndex >= 0) {
          e.preventDefault();
          if (selectedVideos.has(currentIndex)) {
            selectedVideos.delete(currentIndex);
          } else {
            selectedVideos.add(currentIndex);
          }
          updateMultiSelectionUI();
        }
        break;

      case 'Escape':
        // Clear all selections
        e.preventDefault();
        selectedVideos.clear();
        updateMultiSelectionUI();
        break;

      case 'Enter':
        if (currentIndex >= 0) {
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            if (selectedVideos.size > 0) {
              // Multiple videos selected: open Gemini with URLs (send=false)
              const urls = Array.from(selectedVideos)
                .sort((a, b) => a - b)
                .map(i => `URL: ${links[i].href}`)
                .join('\n\n');
              const query = `${urls}\n\nこれらの動画の要点をまとめてください。`;
              const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}&send=false`;
              window.open(geminiUrl, '_blank');
              
              // Clear selections after opening
              selectedVideos.clear();
              updateMultiSelectionUI();
            } else {
              // Single video: open Gemini with summarization request (send=true by default)
              const url = links[currentIndex].href;
              const query = `URL: ${url}\n\nこの動画の要点をまとめてください。`;
              const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}`;
              window.open(geminiUrl, '_blank');
            }
          } else {
            location.href = links[currentIndex].href;
          }
        }
        break;
    }
  });
})();
