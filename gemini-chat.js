// ==UserScript==
// @name         gemini-chat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Gemini Chat UI improvements with keyboard shortcuts
// @author       toyama0919
// @match        https://gemini.google.com/app*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/gemini-chat.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/gemini-chat.js
// @grant        none
// ==/UserScript==


// チャット履歴選択の管理
let selectedHistoryIndex = 0;
let historySelectionMode = false;

// チャット履歴の一覧を取得
function getHistoryItems() {
  return Array.from(document.querySelectorAll('.conversation-items-container .conversation[data-test-id="conversation"]'));
}

// 履歴を選択状態にする（視覚的なハイライト）
function highlightHistory(index) {
  const items = getHistoryItems();
  if (items.length === 0) return;

  // インデックスを範囲内に収める
  selectedHistoryIndex = Math.max(0, Math.min(index, items.length - 1));

  // すべてのハイライトを削除
  items.forEach(item => {
    item.style.outline = '';
    item.style.outlineOffset = '';
  });

  // 選択したアイテムをハイライト
  const selectedItem = items[selectedHistoryIndex];
  if (selectedItem) {
    selectedItem.style.outline = '2px solid #1a73e8';
    selectedItem.style.outlineOffset = '-2px';

    // スクロールして表示
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// 履歴を開く
function openSelectedHistory() {
  const items = getHistoryItems();
  if (items.length > 0 && items[selectedHistoryIndex]) {
    items[selectedHistoryIndex].click();
    historySelectionMode = false; // モード解除
    // ハイライトをクリア
    items.forEach(item => {
      item.style.outline = '';
      item.style.outlineOffset = '';
    });

    // ページ遷移後に入力欄にフォーカス
    setTimeout(() => {
      focusTextarea();
    }, 500);
  }
}

// 履歴選択モードを解除
function exitHistorySelectionMode() {
  historySelectionMode = false;
  const items = getHistoryItems();
  items.forEach(item => {
    item.style.outline = '';
    item.style.outlineOffset = '';
  });
}

// 履歴を上に移動
function moveHistoryUp() {
  highlightHistory(selectedHistoryIndex - 1);
}

// 履歴を下に移動
function moveHistoryDown() {
  highlightHistory(selectedHistoryIndex + 1);
}

// チャットエリアを取得
function getChatArea() {
  // Geminiのチャット履歴のスクロールコンテナを探す
  const chatHistory = document.querySelector('infinite-scroller.chat-history');
  if (chatHistory && chatHistory.scrollHeight > chatHistory.clientHeight) {
    return chatHistory;
  }

  // スクロール可能な要素を探す
  // まずwindow自体がスクロール対象かチェック
  if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
    return document.documentElement;
  }

  // 複数のパターンでチャットエリアを探す
  const selectors = [
    'infinite-scroller',
    'main[class*="main"]',
    '.conversation-container',
    '[class*="chat-history"]',
    '[class*="messages"]',
    'main',
    '[class*="scroll"]',
    'div[class*="conversation"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.scrollHeight > element.clientHeight) {
      return element;
    }
  }

  // 見つからない場合はbodyかdocumentElementを返す
  return document.documentElement;
}

// チャットエリアをスクロール
function scrollChatArea(direction) {
  const chatArea = getChatArea();

  // ビューポートの高さの80%くらいスクロール
  const scrollAmount = window.innerHeight * 0.6;

  if (direction === 'up') {
    if (chatArea === document.documentElement || chatArea === document.body) {
      window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    } else {
      chatArea.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    }
  } else if (direction === 'down') {
    if (chatArea === document.documentElement || chatArea === document.body) {
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    } else {
      chatArea.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }
}

// 新規チャットを作成
function createNewChat() {
  // 新規チャットボタンを探してクリック
  const buttonContent = document.querySelector('[data-test-id="side-nav-action-button-content"]');

  if (buttonContent) {
    // 親要素のボタンを探す
    const button = buttonContent.closest('button') ||
                   buttonContent.closest('side-nav-action-button');
    if (button) {
      button.click();
      return;
    }
  }

  // 代替方法：テキストで探す
  const buttons = Array.from(document.querySelectorAll('side-nav-action-button'));
  const newChatButton = buttons.find(btn =>
    btn.textContent.includes('新規') ||
    btn.textContent.includes('New chat')
  );

  if (newChatButton) {
    newChatButton.click();
  }
}

// テキストエリアにフォーカス
function focusTextarea() {
  const textarea = document.querySelector('rich-textarea[aria-label*="Enter"]') ||
                   document.querySelector('textarea') ||
                   document.querySelector('[contenteditable="true"]') ||
                   document.querySelector('div[role="textbox"]');

  if (textarea) {
    textarea.focus();
    // contenteditable要素の場合、カーソルを末尾に移動
    if (textarea.contentEditable === 'true') {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textarea);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

document.addEventListener("keydown", function(event) {
  // 入力欄にフォーカスがある場合は履歴操作を無効化（履歴選択モード以外）
  const isInInput = event.target.matches('input, textarea, [contenteditable="true"]');

  // Home: 新規チャット作成
  if (event.code === "Home" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    createNewChat();
    return;
  }

  // End: 履歴選択モードと入力欄フォーカスのトグル
  if (event.code === "End" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();

    if (historySelectionMode) {
      // 履歴選択モード中なら、入力欄にフォーカス
      exitHistorySelectionMode();
      focusTextarea();
    } else {
      // それ以外なら、履歴選択モードに入る
      historySelectionMode = true;
      // 前回の位置を保持（初回のみ0にする）
      if (selectedHistoryIndex === undefined) {
        selectedHistoryIndex = 0;
      }
      // テキストエリアからフォーカスを外す
      if (document.activeElement) {
        document.activeElement.blur();
      }
      highlightHistory(selectedHistoryIndex);
    }
    return;
  }

  // Esc: 履歴選択モードを解除
  if (historySelectionMode && event.code === "Escape") {
    event.preventDefault();
    exitHistorySelectionMode();
    return;
  }

  // PageUp: チャットエリアを上にスクロール
  if (event.code === "PageUp") {
    event.preventDefault();
    scrollChatArea('up');
    return;
  }

  // PageDown: チャットエリアを下にスクロール
  if (event.code === "PageDown") {
    event.preventDefault();
    scrollChatArea('down');
    return;
  }

  // 履歴選択モード中は常に矢印キーとEnterを処理
  if (historySelectionMode) {
    if (event.code === "ArrowUp") {
      event.preventDefault();
      moveHistoryUp();
      return;
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      moveHistoryDown();
      return;
    } else if (event.code === "Enter") {
      event.preventDefault();
      openSelectedHistory();
      return;
    }
  }

  // 履歴選択モード外で入力欄以外にいる時の矢印キー操作
  if (!historySelectionMode && !isInInput) {
    if (event.code === "ArrowUp") {
      event.preventDefault();
      moveHistoryUp();
      return;
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      moveHistoryDown();
      return;
    } else if (event.code === "Enter") {
      event.preventDefault();
      openSelectedHistory();
      return;
    }
  }
});
