// ==UserScript==
// @name         Basketball
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for SoftBank Basketball streaming
// @author       toyama0919
// @match        https://basketball.mb.softbank.jp/lives/*
// @match        https://basketball.mb.softbank.jp/videos/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/basket.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/basket.js
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  if(event.code == "KeyD") {
    // 6
    // 15秒進む
    var elm_advance = document.getElementsByClassName("sc-eNQAEJ sc-hMqMXs bHkvyw")[0];
    elm_advance.click();
  } else if(event.code == "KeyA") {
    // 4
    // 15秒戻る
    var elm_rewind = document.getElementsByClassName("sc-eNQAEJ sc-hMqMXs hZcXuz")[0];
    elm_rewind.click();
  } else if(event.code == "KeyF") {
    // +
    // フルスクリーン
    var elm = document.getElementsByClassName("sc-jDwBTQ hzbYqI")[0];
    elm.click();
  } else if(event.code == "Space") {
    // enter
    // 一時停止-再生
    var elm_switch = document.getElementsByClassName("sc-eNQAEJ fXxAzN")[0];
    elm_switch.click();
  }
});
