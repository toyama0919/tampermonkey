// ==UserScript==
// @name         basketball
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://basketball.mb.softbank.jp/lives/*
// @match        https://basketball.mb.softbank.jp/videos/*
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
