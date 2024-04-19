// ==UserScript==
// @name         spotvnow
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.spotvnow.jp/player?type=vod&id=*
// @match        https://www.spotvnow.jp/schedule/*
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  if(event.code == "KeyD") {
    // 6
    // ハイライト
    var elm_highlight = document.getElementsByClassName("vod__clip__row-thumnail")[1];
    elm_highlight.click();
  } else if(event.code == "KeyA") {
    // 4
    // フルマッチ
    var elm_fullmatch = document.getElementsByClassName("vod__clip__row-thumnail")[0];
    elm_fullmatch.click();
  } else if(event.code == "KeyF") {
    // +
    // フルスクリーン
    var elm = document.getElementsByClassName("vjs-fullscreen-control")[0];
    elm.click();
  } else if(event.code == "Space") {
    // 一時停止-再生
    var elm_switch = document.getElementsByClassName("big-play-button")[0];
    elm_switch.click();
  } else if(event.code == "KeyS") {
    // 5
    // mute
    var elm_mute = document.getElementsByClassName("vjs-mute-control")[0];
    elm_mute.click();
  }
});
