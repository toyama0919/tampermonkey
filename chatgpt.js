// ==UserScript==
// @name         ChatGPT
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  ChatGPT UI improvements with keyboard shortcuts
// @author       toyama0919
// @match        https://chatgpt.com/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/chatgpt.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/chatgpt.js
// @grant        none
// ==/UserScript==


// ページ読み込み時にサイドメニューを開く
let lastClickTime = 0;

function ensureSidebarOpen() {
  const sidebar = document.querySelector('nav[aria-label="Chat history"]') ||
                  document.querySelector('nav.flex-col') ||
                  document.querySelector('div[data-testid="history-panel"]');

  // サイドバーが見えているかチェック
  if (sidebar && sidebar.offsetWidth > 100) {
    return true;
  }

  // 最後にクリックしてから1秒以内なら何もしない（アニメーション待ち）
  const now = Date.now();
  if (now - lastClickTime < 1000) {
    return false;
  }

  // 閉じている場合、メニューボタンをクリック
  const menuButton = document.querySelector('button[aria-label*="sidebar"]') ||
                     document.querySelector('button[aria-label*="サイドバー"]') ||
                     document.querySelector('button.h-10.w-10');

  if (menuButton) {
    menuButton.click();
    lastClickTime = now;
  }

  return false;
}

// ページ読み込み後に実行（一度開いたら停止）
let sidebarAttempts = 0;
let sidebarOpened = false;
const sidebarInterval = setInterval(() => {
  sidebarAttempts++;

  if (!sidebarOpened) {
    sidebarOpened = ensureSidebarOpen();
  }

  // 開いたら、または10回試行したら停止
  if (sidebarOpened || sidebarAttempts >= 10) {
    clearInterval(sidebarInterval);
  }
}, 500);

// チャット履歴選択の管理
let selectedHistoryIndex = 0;
let historySelectionMode = false;

// チャット履歴の一覧を取得
function getHistoryItems() {
  return Array.from(document.querySelectorAll('nav a[href*="/c/"]'));
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
    selectedItem.style.outline = '2px solid #10a37f';
    selectedItem.style.outlineOffset = '-2px';

    // スクロールして表示
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// 履歴を開く
function openSelectedHistory() {
  const items = getHistoryItems();
  if (items.length === 0 || !items[selectedHistoryIndex]) return;

  items[selectedHistoryIndex].click();
  historySelectionMode = false;

  // ハイライトをクリア
  items.forEach(item => {
    item.style.outline = '';
    item.style.outlineOffset = '';
  });

  // ページ遷移後に入力欄をクリアしてフォーカス
  clearAndFocusTextarea();
}

// 入力欄をクリアしてフォーカス（ページ遷移後の要素を待つ）
function clearAndFocusTextarea() {
  let attempts = 0;
  const maxAttempts = 10;

  const interval = setInterval(() => {
    attempts++;
    const textarea = document.querySelector('textarea[id="prompt-textarea"]') ||
                     document.querySelector('textarea') ||
                     document.querySelector('div[contenteditable="true"]');

    if (textarea) {
      clearInterval(interval);

      // 内容をクリア
      if (textarea.tagName === 'TEXTAREA') {
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        // contenteditable要素の場合
        while (textarea.firstChild) {
          textarea.removeChild(textarea.firstChild);
        }
        const p = document.createElement('p');
        textarea.appendChild(p);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // フォーカス
      textarea.focus();
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 200);
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
  // ChatGPTの専用属性を使って直接取得
  const scrollRoot = document.querySelector('[data-scroll-root="true"]');
  if (scrollRoot && scrollRoot.scrollHeight > scrollRoot.clientHeight) {
    return scrollRoot;
  }

  // サイドバーを除外するための参照を取得
  const sidebar = document.querySelector('nav[aria-label="Chat history"]') ||
                  document.querySelector('nav[aria-label="チャット履歴"]');

  // ページ全体からスクロール可能な要素を探す
  const allElements = document.querySelectorAll('*');

  for (const elem of allElements) {
    // サイドバー内の要素はスキップ
    if (sidebar && (sidebar === elem || sidebar.contains(elem))) {
      continue;
    }

    const style = window.getComputedStyle(elem);
    const overflowY = style.overflowY;

    // overflow-yがautoかscrollで、実際にスクロール可能な要素
    if ((overflowY === 'auto' || overflowY === 'scroll') &&
        elem.scrollHeight > elem.clientHeight &&
        elem.clientHeight > 100) { // 小さすぎる要素は除外
      return elem;
    }
  }

  // 見つからなければwindowをスクロール
  return document.documentElement;
}

// チャットエリアをスクロール
function scrollChatArea(direction) {
  const chatArea = getChatArea();
  const scrollAmount = window.innerHeight * 0.4;
  const scrollValue = direction === 'up' ? -scrollAmount : scrollAmount;

  if (chatArea === document.documentElement || chatArea === document.body) {
    window.scrollBy({ top: scrollValue, behavior: 'smooth' });
  } else {
    chatArea.scrollBy({ top: scrollValue, behavior: 'smooth' });
  }
}

// 新規チャットを作成
function createNewChat() {
  const newChatButton = document.querySelector('a[href="/"]') ||
                        document.querySelector('a[href*="/?model="]') ||
                        Array.from(document.querySelectorAll('a')).find(a =>
                          a.textContent.includes('New chat') ||
                          a.textContent.includes('新しいチャット')
                        );

  if (newChatButton) {
    newChatButton.click();
  }
}

// テキストエリアにフォーカス
function focusTextarea() {
  const textarea = document.querySelector('textarea[id="prompt-textarea"]') ||
                   document.querySelector('textarea') ||
                   document.querySelector('div[contenteditable="true"]');

  if (!textarea) return;

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

document.addEventListener("keydown", function(event) {
  // PageUp/PageDownは最優先で処理（入力欄にフォーカスがあっても）
  if (event.code === "PageUp" || event.code === "PageDown") {
    // フォーカスがサイドバー内にあるかチェック
    const sidebar = document.querySelector('nav[aria-label="Chat history"]') ||
                    document.querySelector('nav[aria-label="チャット履歴"]') ||
                    document.querySelector('nav.flex-col');

    const activeElement = document.activeElement;
    const isInSidebar = sidebar && (sidebar.contains(event.target) || sidebar.contains(activeElement));

    if (isInSidebar) {
      // サイドバー内の場合はデフォルトの動作を許可（何もしない）
      return;
    }

    // それ以外の場合はチャットエリアをスクロール
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const direction = event.code === "PageUp" ? 'up' : 'down';
    scrollChatArea(direction);
    return;
  }

  // 入力欄にフォーカスがある場合は履歴操作を無効化（履歴選択モード以外）
  const isInInput = event.target.matches('input, textarea, [contenteditable="true"]');

  // Home: 新規チャット作成
  if (event.code === "Home" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    createNewChat();
    return;
  }

  // End: テキストエリア ⇔ 履歴選択モードのトグル
  if (event.code === "End" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();

    if (historySelectionMode) {
      // 履歴選択モード中なら、入力欄にフォーカス
      exitHistorySelectionMode();
      focusTextarea();
    } else if (isInInput) {
      // テキストエリアにいるなら、履歴選択モードに入る
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
    } else {
      // それ以外なら、まずテキストエリアにフォーカス
      focusTextarea();
    }
    return;
  }

  // Esc: 履歴選択モードを解除
  if (historySelectionMode && event.code === "Escape") {
    event.preventDefault();
    exitHistorySelectionMode();
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
}, true); // キャプチャフェーズでイベントを捕捉
