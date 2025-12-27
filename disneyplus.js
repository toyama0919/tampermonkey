// ==UserScript==
// @name         Disney+
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Disney+
// @author       toyama0919
// @match        https://www.disneyplus.com/ja-jp/video/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/disneyplus.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/disneyplus.js
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  if(event.code == "KeyD") {
    // 10秒進む
    var elm_advance = document.getElementsByClassName("ff-10sec-icon")[0];
    elm_advance.click();
  } else if(event.code == "KeyA") {
    // 10秒戻る
    var elm_rewind = document.getElementsByClassName("rwd-10sec-icon")[0];
    elm_rewind.click();
  }
});
