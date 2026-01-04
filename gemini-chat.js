// ==UserScript==
// @name         gemini-chat
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  Gemini Chat UI improvements with keyboard shortcuts
// @author       toyama0919
// @match        https://gemini.google.com/app*
// @match        https://gemini.google.com/search*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/gemini-chat.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/gemini-chat.js
// @grant        none
// ==/UserScript==


// サイドバーの開閉をトグル
let lastClickTime = 0;

// 検索画面かどうかを判定
function isSearchPage() {
  return window.location.pathname.startsWith('/search');
}

// 検索結果の選択管理
let selectedSearchIndex = 0;

// 検索結果の一覧を取得
function getSearchResults() {
  // 検索画面での検索結果（search-snippet要素）
  let results = Array.from(document.querySelectorAll('search-snippet[tabindex="0"]'));

  // 見つからない場合は別のパターンも試す
  if (results.length === 0) {
    results = Array.from(document.querySelectorAll('search-snippet'));
  }

  // それでも見つからない場合は元のパターン（初回読み込み時）
  if (results.length === 0) {
    results = Array.from(document.querySelectorAll('div.conversation-container[role="option"]'));
  }

  if (results.length === 0) {
    results = Array.from(document.querySelectorAll('[role="option"].conversation-container'));
  }

  return results;
}

// 検索結果を選択状態にする（視覚的なハイライト）
function highlightSearchResult(index) {
  const items = getSearchResults();
  if (items.length === 0) return;

  // インデックスを範囲内に収める
  selectedSearchIndex = Math.max(0, Math.min(index, items.length - 1));

  // すべてのハイライトを削除
  items.forEach(item => {
    item.style.outline = '';
    item.style.outlineOffset = '';
  });

  // 選択したアイテムをハイライト
  const selectedItem = items[selectedSearchIndex];
  if (selectedItem) {
    selectedItem.style.outline = '2px solid #1a73e8';
    selectedItem.style.outlineOffset = '-2px';

    // スクロールして表示（即座に）
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }
}

// 検索結果を上に移動
function moveSearchResultUp() {
  highlightSearchResult(selectedSearchIndex - 1);
  // フォーカスを検索入力欄に戻す
  const searchInput = document.querySelector('input[data-test-id="search-input"]');
  if (searchInput) {
    searchInput.focus();
  }
}

// 検索結果を下に移動
function moveSearchResultDown() {
  highlightSearchResult(selectedSearchIndex + 1);
  // フォーカスを検索入力欄に戻す
  const searchInput = document.querySelector('input[data-test-id="search-input"]');
  if (searchInput) {
    searchInput.focus();
  }
}

// 選択した検索結果を開く
function openSelectedSearchResult() {
  const items = getSearchResults();
  if (items.length === 0 || !items[selectedSearchIndex]) return;

  const selectedItem = items[selectedSearchIndex];

  // まず、jslog属性を持つdivを探す（クリック可能な要素）
  const clickableDiv = selectedItem.querySelector('div[jslog]');
  if (clickableDiv) {
    console.log('Gemini Search: Clicking jslog div');
    clickableDiv.click();

    // マウスイベントも発火
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      });
      clickableDiv.dispatchEvent(event);
    });

    // 少し待ってからURLを直接変更（最終手段）
    setTimeout(() => {
      // タイトル要素からテキストを取得してURLを構築
      const titleElement = selectedItem.querySelector('.title');
      if (titleElement) {
        const title = titleElement.textContent;
        console.log('Gemini Search: Opening result -', title);
        // search-snippetがページ遷移しない場合、直接クリックを試みる
        selectedItem.click();
      }
    }, 100);
    return;
  }

  // リンクを探す
  const link = selectedItem.querySelector('a[href]');
  if (link) {
    console.log('Gemini Search: Clicking link', link.href);
    link.click();
    return;
  }

  // どちらもない場合は要素自体をクリック
  console.log('Gemini Search: Clicking element directly');
  selectedItem.click();

  ['mousedown', 'mouseup', 'click'].forEach(eventType => {
    const event = new MouseEvent(eventType, {
      view: window,
      bubbles: true,
      cancelable: true
    });
    selectedItem.dispatchEvent(event);
  });
}

function toggleSidebar() {
  // 最後にクリックしてから1秒以内なら何もしない（アニメーション待ち）
  const now = Date.now();
  if (now - lastClickTime < 1000) {
    return;
  }

  // メニューボタンをクリックしてトグル
  const menuButton = document.querySelector('button[data-test-id="side-nav-menu-button"]');

  if (menuButton) {
    menuButton.click();
    lastClickTime = now;
  }
}

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

    // スクロールして表示（即座に）
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
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
    const textarea = document.querySelector('div[contenteditable="true"][role="textbox"]');

    if (textarea) {
      clearInterval(interval);

      // 内容をクリア（DOM操作で安全に）
      while (textarea.firstChild) {
        textarea.removeChild(textarea.firstChild);
      }

      // Geminiの空状態の構造を再作成
      const p = document.createElement('p');
      const br = document.createElement('br');
      p.appendChild(br);
      textarea.appendChild(p);

      // フォーカス
      textarea.focus();

      // inputイベントを発火
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
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

// チャットエリアのキャッシュ
let cachedChatArea = null;
let chatAreaCacheTime = 0;
const CHAT_AREA_CACHE_DURATION = 5000; // 5秒間キャッシュ

// チャットエリアを取得
function getChatArea() {
  const now = Date.now();

  // キャッシュが有効な場合はそれを返す
  if (cachedChatArea && (now - chatAreaCacheTime) < CHAT_AREA_CACHE_DURATION) {
    return cachedChatArea;
  }

  // Geminiのチャット履歴のスクロールコンテナを探す
  const chatHistory = document.querySelector('infinite-scroller.chat-history');
  if (chatHistory && chatHistory.scrollHeight > chatHistory.clientHeight) {
    cachedChatArea = chatHistory;
    chatAreaCacheTime = now;
    return chatHistory;
  }

  // window自体がスクロール対象かチェック
  if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
    cachedChatArea = document.documentElement;
    chatAreaCacheTime = now;
    return document.documentElement;
  }

  // その他のパターンでチャットエリアを探す
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
      cachedChatArea = element;
      chatAreaCacheTime = now;
      return element;
    }
  }

  cachedChatArea = document.documentElement;
  chatAreaCacheTime = now;
  return document.documentElement;
}

// チャットエリアをスクロール
function scrollChatArea(direction) {
  const chatArea = getChatArea();
  const scrollAmount = window.innerHeight * 0.2;
  const scrollValue = direction === 'up' ? -scrollAmount : scrollAmount;

  // 速度優先で常にアニメーションなし
  if (chatArea === document.documentElement || chatArea === document.body) {
    window.scrollBy({ top: scrollValue, behavior: 'auto' });
  } else {
    chatArea.scrollBy({ top: scrollValue, behavior: 'auto' });
  }
}

// 新規チャットを作成
function createNewChat() {
  const buttonContent = document.querySelector('[data-test-id="side-nav-action-button-content"]');

  if (buttonContent) {
    const button = buttonContent.closest('button') || buttonContent.closest('side-nav-action-button');
    if (button) {
      button.click();
      return;
    }
  }

  // 代替方法：テキストで探す
  const buttons = Array.from(document.querySelectorAll('side-nav-action-button'));
  const newChatButton = buttons.find(btn =>
    btn.textContent.includes('新規') || btn.textContent.includes('New chat')
  );

  if (newChatButton) {
    newChatButton.click();
  }
}

// テキストエリアにフォーカス
function focusTextarea() {
  const textarea = document.querySelector('div[contenteditable="true"][role="textbox"]') ||
                   document.querySelector('[contenteditable="true"]');

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

// URLパラメータからクエリを取得してテキストエリアに設定
function setQueryFromUrl() {
  // URLパスが /app のみの場合のみ処理（既存の会話IDがある場合は処理しない）
  const path = window.location.pathname;
  if (path !== '/app' && path !== '/app/') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (!query) return;

  let attempts = 0;
  const maxAttempts = 20;

  const interval = setInterval(() => {
    attempts++;
    const textarea = document.querySelector('div[contenteditable="true"][role="textbox"]');

    if (textarea) {
      clearInterval(interval);

      // 内容をクリア
      while (textarea.firstChild) {
        textarea.removeChild(textarea.firstChild);
      }

      // クエリテキストを設定
      const p = document.createElement('p');
      p.textContent = query;
      textarea.appendChild(p);

      // フォーカス
      textarea.focus();

      // カーソルを末尾に移動
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textarea);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      // inputイベントを発火してGeminiのUIを更新
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      // 送信ボタンを探してクリック
      setTimeout(() => {
        const sendButton = document.querySelector('button[aria-label*="送信"]') ||
                          document.querySelector('button[aria-label*="Send"]') ||
                          document.querySelector('button.send-button') ||
                          Array.from(document.querySelectorAll('button')).find(btn =>
                            btn.getAttribute('aria-label')?.includes('送信') ||
                            btn.getAttribute('aria-label')?.includes('Send')
                          );

        if (sendButton && !sendButton.disabled) {
          sendButton.click();
        }
      }, 500);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 200);
}

// ページ読み込み時にクエリパラメータをチェック
setTimeout(() => {
  setQueryFromUrl();
}, 1000);

// 検索画面で最初の検索結果をハイライト
if (isSearchPage()) {
  let attempts = 0;
  const maxAttempts = 10;

  const highlightInterval = setInterval(() => {
    attempts++;
    const searchResults = getSearchResults();

    if (searchResults.length > 0) {
      selectedSearchIndex = 0;
      highlightSearchResult(0);
      clearInterval(highlightInterval);
      console.log('Gemini Search: Found', searchResults.length, 'results');
    } else if (attempts >= maxAttempts) {
      clearInterval(highlightInterval);
      console.log('Gemini Search: No results found after', maxAttempts, 'attempts');
    }
  }, 500);
}

// コピーボタンを取得してフォーカス
function focusCopyButton(direction) {
  const copyButtons = Array.from(document.querySelectorAll('button[aria-label*="コピー"], button[aria-label*="Copy"], button.copy-button'));

  // 最後の出力のコピーボタンを探す
  if (copyButtons.length === 0) return false;

  if (direction === 'up') {
    // 上キー：最後のコピーボタンにフォーカス
    copyButtons[copyButtons.length - 1].focus();
  } else {
    // 下キー：最初のコピーボタンにフォーカス
    copyButtons[0].focus();
  }

  return true;
}

// コピーボタン間を移動
function moveBetweenCopyButtons(direction) {
  const copyButtons = Array.from(document.querySelectorAll('button[aria-label*="コピー"], button[aria-label*="Copy"], button.copy-button'));
  const currentIndex = copyButtons.findIndex(btn => btn === document.activeElement);

  if (currentIndex === -1) return false;

  if (direction === 'up') {
    if (currentIndex > 0) {
      // 前のコピーボタンにフォーカス
      copyButtons[currentIndex - 1].focus();
      return true;
    } else {
      // 最初のコピーボタンなのでテキストエリアに戻る
      focusTextarea();
      return true;
    }
  } else {
    if (currentIndex < copyButtons.length - 1) {
      // 次のコピーボタンにフォーカス
      copyButtons[currentIndex + 1].focus();
      return true;
    } else {
      // 最後のコピーボタンなのでテキストエリアに戻る
      focusTextarea();
      return true;
    }
  }
}

document.addEventListener("keydown", function(event) {
  // 検索画面の場合は専用の処理
  if (isSearchPage()) {
    // 上下キーで検索結果を選択（入力欄にフォーカスがあっても動作）
    if (event.code === "ArrowUp" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      moveSearchResultUp();
      return;
    }

    if (event.code === "ArrowDown" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      moveSearchResultDown();
      return;
    }

    // Enterキーで選択した検索結果を開く
    if (event.code === "Enter" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      // IME入力中（日本語変換中）の場合はスキップ
      if (event.isComposing) {
        return;
      }

      // テキストエリアで複数行入力中（Shiftなし）の場合は検索結果を開く
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openSelectedSearchResult();
      return;
    }

    // PageUp/PageDownのみ通常のスクロール処理
    if (event.code === "PageUp") {
      event.preventDefault();
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'auto' });
      return;
    }

    if (event.code === "PageDown") {
      event.preventDefault();
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'auto' });
      return;
    }

    // その他のショートカットキー（Home, End, Delete）は無効化
    if (['Home', 'End', 'Delete'].includes(event.code)) {
      return;
    }

    // それ以外のキーは通常動作（入力など）
    return;
  }

  // 以下は通常のチャット画面の処理
  // 入力欄にフォーカスがある場合は履歴操作を無効化（履歴選択モード以外）
  const isInInput = event.target.matches('input, textarea, [contenteditable="true"]');

  // Insert: 検索画面に移動
  if (event.code === "Insert" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();

    // SPAなのでHistory APIを使用
    const searchUrl = '/search?hl=ja';
    history.pushState(null, '', searchUrl);

    // popstateイベントを発火してSPAルーターに通知
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

    return;
  }

  // Delete: サイドバーの開閉をトグル
  if (event.code === "Delete" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    toggleSidebar();
    return;
  }

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

  // テキストエリアが空で上下キーが押された場合、コピーボタンにフォーカス
  if (!historySelectionMode && isInInput && (event.code === "ArrowUp" || event.code === "ArrowDown") && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    const textarea = document.querySelector('div[contenteditable="true"][role="textbox"]');

    if (textarea && textarea.textContent.trim() === '') {
      event.preventDefault();
      const direction = event.code === "ArrowUp" ? 'up' : 'down';
      focusCopyButton(direction);
      return;
    }
  }

  // 履歴選択モード外で入力欄以外にいる時の矢印キー操作
  if (!historySelectionMode && !isInInput) {
    // コピーボタンにフォーカスがある場合の処理
    const focusedElement = document.activeElement;
    const isCopyButton = focusedElement &&
                        (focusedElement.getAttribute('aria-label')?.includes('コピー') ||
                         focusedElement.getAttribute('aria-label')?.includes('Copy') ||
                         focusedElement.classList?.contains('copy-button'));

    if (isCopyButton) {
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        event.preventDefault();
        const direction = event.code === "ArrowUp" ? 'up' : 'down';
        moveBetweenCopyButtons(direction);
        return;
      } else if (event.code === "Enter") {
        // Enterキーでコピーボタンを明示的にクリック
        event.preventDefault();
        focusedElement.click();
        return;
      }
    }

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
