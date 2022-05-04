// ==UserScript==
// @name         basketball
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://basketball.mb.softbank.jp/lives/*
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  // 15秒進む
  if(event.keyCode == 68) {
    var elm_advance = document.getElementsByClassName("sc-dnqmqq dxcVLA sc-htoDjs jGpmvi")[0];
    elm_advance.click();
  }

  // 15秒戻る
  if(event.keyCode == 65) {
    var elm_rewind = document.getElementsByClassName("sc-dnqmqq dxcVLA sc-htoDjs kftMvp")[0];
    elm_rewind.click();
  }

  // フルスクリーン
  if(event.keyCode == 70) {
    var elm = document.getElementsByClassName("sc-jzJRlG cfGAmp")[0];
    elm.click();
  }

  // 一時停止-再生
  if(event.keyCode == 32) {
    var elm_switch = document.getElementsByClassName("sc-htoDjs eBngms")[0];
    elm_switch.click();
  }
});
