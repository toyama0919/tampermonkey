// ==UserScript==
// @name         amazon_prime_video
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.amazon.co.jp/gp/video/detail/*
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  // 各種操作
  if(event.code == "KeyF") {
    var elm = document.getElementsByClassName("atvwebplayersdk-fullscreen-button")[0];
    elm.click();
  } else if(event.code == "KeyS") {
    var elm_switch = document.getElementsByClassName("subtitles_fll_open_close_button_container")[0];
    elm_switch.click();
  } else if(event.code == "KeyX") {
    var elm_off = document.querySelector('[aria-label="オフ"]');
    if(elm_off.checked) {
      var elm_jp = document.querySelector('[aria-label="日本語"]');
      elm_off.checked = false;
      elm_jp.checked = true;
    } else {
      elm_off.checked = true;
    }
  }
});
