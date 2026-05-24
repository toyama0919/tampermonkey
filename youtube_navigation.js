// ==UserScript==
// @name         YouTube Navigation
// @namespace    http://tampermonkey.net/
// @version      0.8
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
    let selectors = [];

    if (path === '/feed/history') {
      // 履歴ページ（新旧両対応）
      selectors = [
        'a.ytLockupMetadataViewModelTitle',       // 新UI (camelCase)
        'a.ytLockupViewModelContentImage',        // 新UI サムネイル (camelCase)
        'a.yt-lockup-view-model__content-image',  // 旧UI
        'a.yt-lockup-metadata-view-model__title'  // 旧UI
      ];
    } else if (path.startsWith('/playlist')) {
      // プレイリストページ
      selectors = ['a#video-title'];
    } else if (path === '/results') {
      // 検索結果ページ
      selectors = ['h3>a#video-title'];
    } else if (path.includes('/@') && path.endsWith('/videos')) {
      // チャンネルの動画一覧ページ
      selectors = [
        'a.ytLockupMetadataViewModelTitle',
        'a#video-title-link',
      ];
    } else {
      // その他のページでも一般的なセレクタを試す
      selectors = ['a#video-title'];
    }

    // 複数のセレクタを試して、マッチするものを返す
    for (const selector of selectors) {
      const links = Array.from(document.querySelectorAll(selector))
        .filter(el => el.href && el.href.includes('/watch?v='));
      if (links.length > 0) return links;
    }

    return [];
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
          if (e.metaKey) {
            const url = links[currentIndex].href;
            const query = `URL: ${url}\n\nこの動画の要点、コメント欄の要約、および動画内容への冷徹な分析をまとめてください。`;
            const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}&mode_id=default`;
            window.open(geminiUrl, '_blank');
          } else if (e.ctrlKey) {
            const url = links[currentIndex].href;
            const query = `URL: ${url}\n\nPlease summarize the key points of this video, summarize the comments section, and give a cold-eyed ruthless analysis of the video content, in English.`;
            const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}&mode_id=english`;
            window.open(geminiUrl, '_blank');
          } else {
            location.href = links[currentIndex].href;
          }
        }
        break;
    }
  });
})();
