// ==UserScript==
// @name         Google search pager
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Google search pagination improvements
// @author       toyama0919
// @match        https://www.google.co.jp/search*
// @match        https://www.google.co.jp/?gws_rd=ssl#q=*
// @match        https://www.google.com/search*
// @match        https://www.google.com/?gws_rd=ssl#q=*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/google_search_pager.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/google_search_pager.js
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const NOT_INITIALIZED = -99;

  function filterNonEmptyElements(elements) {
    return Array.from(elements).filter(element => element.innerHTML !== "");
  }

  function focusElement(index, elements) {
    elements[index].focus();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('URL copied:', text);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }

  function handleArrowDown(currentIndex, elements, nextElement, prevElement, activeElementId) {
    if (currentIndex < elements.length - 1) {
      return currentIndex + 1;
    }

    // 最後の要素に到達した場合、ページネーション要素にフォーカス
    if (activeElementId === "pnprev") {
      nextElement.focus();
    } else if (activeElementId !== "pnnext") {
      if (prevElement) {
        prevElement.focus();
      } else {
        nextElement.focus();
      }
    }

    return currentIndex;
  }

  function handleArrowUp(currentIndex, elements, nextElement, prevElement, activeElementId) {
    if (currentIndex === elements.length - 1) {
      if (activeElementId === "pnnext") {
        if (prevElement) {
          prevElement.focus();
        } else {
          focusElement(currentIndex, elements);
        }
        return currentIndex;
      }
      if (activeElementId === "pnprev") {
        focusElement(currentIndex, elements);
        return currentIndex;
      }
    }

    if (currentIndex > 0) {
      return currentIndex - 1;
    }

    return currentIndex;
  }

  // 検索結果リンクを取得
  const searchResultElements = filterNonEmptyElements(
    document.querySelectorAll("a[jsname='UWckNb']")
  );

  let currentIndex = NOT_INITIALIZED;

  const nextElement = document.getElementById("pnnext");
  const prevElement = document.getElementById("pnprev");

  document.documentElement.setAttribute('class', "zAoYTe");

  document.addEventListener("keydown", (event) => {
    const activeElementId = document.activeElement.id;

    // 初回の矢印キー入力で最初の要素にフォーカス
    if (currentIndex === NOT_INITIALIZED) {
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        currentIndex = 0;
        focusElement(currentIndex, searchResultElements);
      }
      return;
    }

    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        newIndex = handleArrowDown(
          currentIndex,
          searchResultElements,
          nextElement,
          prevElement,
          activeElementId
        );
        break;

      case "ArrowUp":
        newIndex = handleArrowUp(
          currentIndex,
          searchResultElements,
          nextElement,
          prevElement,
          activeElementId
        );
        break;

      case "Enter":
        // ページネーションボタンにフォーカスがある場合はスキップ
        if (activeElementId === "pnnext" || activeElementId === "pnprev") {
          return;
        }
        if (currentIndex >= 0 && currentIndex < searchResultElements.length) {
          event.preventDefault();
          const url = searchResultElements[currentIndex].href;
          if (event.metaKey || event.ctrlKey) {
            // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux): Copy URL
            copyToClipboard(url);
          } else {
            // Enter: Open link
            location.href = url;
          }
        }
        return;

      default:
        return;
    }

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      focusElement(currentIndex, searchResultElements);
    }
  });
})();
