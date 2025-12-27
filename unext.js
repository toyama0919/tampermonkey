// ==UserScript==
// @name         U-NEXT
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for U-NEXT
// @author       toyama0919
// @match        https://video.unext.jp/play/*/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/unext.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/unext.js
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  // 各種操作
  if(event.code == "Space") {
    document.querySelectorAll("[data-plyr='play']")[0].click();
  } else if(event.code == "KeyF") {
    document.querySelectorAll("[data-plyr='fullscreen']")[0].click();
  }
});
