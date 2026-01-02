// ==UserScript==
// @name         NotebookLM Navigation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for NotebookLM
// @author       toyama0919
// @match        https://notebooklm.google.com/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/notebooklm.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/notebooklm.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let currentIndex = -1;
  let lastPathname = location.pathname;

  const style = document.createElement('style');
  style.textContent = `
    .notebooklm-nav-selected {
      outline: 4px solid #ff0000 !important;
      outline-offset: 3px !important;
      background-color: rgba(255, 255, 0, 0.3) !important;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  // URLの変更時にcurrentIndexをリセット
  const resetSelection = () => {
    currentIndex = -1;
    // 選択状態をクリア
    document.querySelectorAll('.notebooklm-nav-selected').forEach(el => {
      el.classList.remove('notebooklm-nav-selected');
    });
  };

  // History APIをフックしてSPAのURL変更を検知
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      resetSelection();
    }
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      resetSelection();
    }
  };

  // ブラウザの戻る/進むボタン対応
  window.addEventListener('popstate', () => {
    if (location.pathname !== lastPathname) {
      lastPathname = location.pathname;
      resetSelection();
    }
  });

  // 現在のページがノートブック詳細画面かどうかを判定
  const isNotebookDetailPage = () => {
    return location.pathname.startsWith('/notebook/');
  };

  // ノートブック一覧画面用：ノートブックカードを取得
  const getNotebookElements = () => {
    const elements = [];

    // 新規作成ボタンを取得
    const createButton = document.querySelector('mat-card.create-new-action-button');
    if (createButton && createButton.offsetParent !== null) {
      elements.push({ element: createButton, type: 'create' });
    }

    // 既存のノートブックのボタンを取得
    const notebookButtons = Array.from(document.querySelectorAll('project-button button.primary-action-button'))
      .filter(btn => btn.offsetParent !== null);

    notebookButtons.forEach(btn => {
      elements.push({ element: btn, type: 'notebook' });
    });

    return elements;
  };

  // ノートブック詳細画面用：質問項目を取得
  const getFollowUpChips = () => {
    return Array.from(document.querySelectorAll('.follow-up-chip'))
      .filter(chip => chip.offsetParent !== null);
  };

  const selectNotebook = (index) => {
    const elements = getNotebookElements();
    if (index < 0 || index >= elements.length) return;

    // Remove previous selection
    document.querySelectorAll('.notebooklm-nav-selected').forEach(el => {
      el.classList.remove('notebooklm-nav-selected');
    });

    // Add new selection
    const { element, type } = elements[index];

    if (type === 'create') {
      // 新規作成ボタンの場合は直接ハイライト
      element.classList.add('notebooklm-nav-selected');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // 既存のノートブックの場合はmat-cardをハイライト
      const card = element.closest('mat-card');
      if (card) {
        card.classList.add('notebooklm-nav-selected');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    currentIndex = index;
  };

  const selectFollowUpChip = (index) => {
    const chips = getFollowUpChips();
    if (index < 0 || index >= chips.length) return;

    // Remove previous selection
    document.querySelectorAll('.notebooklm-nav-selected').forEach(el => {
      el.classList.remove('notebooklm-nav-selected');
    });

    // Add new selection
    const selectedChip = chips[index];
    selectedChip.classList.add('notebooklm-nav-selected');
    selectedChip.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentIndex = index;
  };

  // チャットエリアを取得（スクロール可能な要素を探す）
  const getChatArea = () => {
    // window自体がスクロール対象かチェック
    if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
      return document.documentElement;
    }

    // NotebookLMのチャットエリアを探す（複数のセレクタを試す）
    const selectors = [
      'chat-panel',
      '.chat-panel-content',
      '.chat-message-pair',
      'main',
      '[role="log"]',
      '[class*="chat"]',
      '[class*="conversation"]',
      '[class*="scroll"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.scrollHeight > element.clientHeight) {
        return element;
      }
    }

    return document.documentElement;
  };

  // チャットエリアをスクロール
  const scrollChatArea = (direction) => {
    const chatArea = getChatArea();
    const scrollAmount = window.innerHeight * 0.2;
    const scrollValue = direction === 'up' ? -scrollAmount : scrollAmount;

    if (chatArea === document.documentElement || chatArea === document.body) {
      window.scrollBy({ top: scrollValue, behavior: 'smooth' });
    } else {
      chatArea.scrollBy({ top: scrollValue, behavior: 'smooth' });
    }
  };

  document.addEventListener('keydown', (e) => {
    // PageUp/PageDownでchat欄をスクロール
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      scrollChatArea(e.key === 'PageUp' ? 'up' : 'down');
      return;
    }

    // Endキーでテキストエリア間をトグル
    if (e.key === 'End') {
      e.preventDefault();

      const sourceSearchTextarea = document.querySelector('textarea.query-box-textarea');
      const mainQueryTextarea = document.querySelector('textarea.query-box-input');

      if (!sourceSearchTextarea || !mainQueryTextarea) return;

      // 現在フォーカスされている要素を確認
      const activeElement = document.activeElement;

      if (activeElement === sourceSearchTextarea) {
        // ソース検索からメインクエリボックスへ
        mainQueryTextarea.focus();
      } else if (activeElement === mainQueryTextarea) {
        // メインクエリボックスからソース検索へ
        sourceSearchTextarea.focus();
      } else {
        // どちらでもない場合はメインクエリボックスへ
        mainQueryTextarea.focus();
      }
      return;
    }

    // 入力フィールドにフォーカスがある場合はナビゲーションをスキップ
    const tagName = document.activeElement.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return;
    }

    // ページに応じて要素を取得
    const isDetailPage = isNotebookDetailPage();
    const elements = isDetailPage ? getFollowUpChips() : getNotebookElements();

    if (elements.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex <= 0) {
          if (isDetailPage) {
            selectFollowUpChip(0);
          } else {
            selectNotebook(0);
          }
        } else {
          if (isDetailPage) {
            selectFollowUpChip(currentIndex - 1);
          } else {
            selectNotebook(currentIndex - 1);
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < 0) {
          if (isDetailPage) {
            selectFollowUpChip(0);
          } else {
            selectNotebook(0);
          }
        } else if (currentIndex < elements.length - 1) {
          if (isDetailPage) {
            selectFollowUpChip(currentIndex + 1);
          } else {
            selectNotebook(currentIndex + 1);
          }
        }
        break;

      case 'Enter':
        if (currentIndex >= 0) {
          e.preventDefault();
          if (isDetailPage) {
            // 質問項目をクリック
            const chips = getFollowUpChips();
            chips[currentIndex].click();
          } else {
            // ノートブックを開く
            const notebookElements = getNotebookElements();
            const { element } = notebookElements[currentIndex];
            element.click();
          }
        }
        break;
    }
  });
})();
