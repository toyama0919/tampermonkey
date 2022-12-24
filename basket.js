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
    // 15秒進む
    var elm_advance = document.getElementsByClassName("sc-dnqmqq dxcVLA sc-htoDjs jGpmvi")[0];
    elm_advance.click();
  } else if(event.code == "KeyA") {
    // 15秒戻る
    var elm_rewind = document.getElementsByClassName("sc-dnqmqq dxcVLA sc-htoDjs kftMvp")[0];
    elm_rewind.click();
  } else if(event.code == "KeyF") {
    // フルスクリーン
    var elm = document.getElementsByClassName("sc-jzJRlG bvlQoG")[0];
    elm.click();
  } else if(event.code == "Space") {
    // 一時停止-再生
    var elm_switch = document.getElementsByClassName("sc-htoDjs eBngms")[0];
    elm_switch.click();
  }
});
