// ==UserScript==
// @name         dazn
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.dazn.com/ja-JP/fixture/ContentId:*
// @match        https://www.dazn.com/ja-JP/schedule
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  if(event.code == "KeyF") {
    var elm = document.getElementsByClassName("fullscreen___fullscreen___1OXBx")[0];
    elm.click();
  } else if(event.code == "KeyH") {
    var elm_switch = document.getElementsByClassName("video-switcher__label___1kJP3")[0];
    elm_switch.click();
  } else if(event.code == "KeyA") {
    var elm_rewind = document.getElementsByClassName("playbackButtons___playback-button___2bb6j")[0];
    elm_rewind.click();
  } else if(event.code == "KeyD") {
    var elm_forward = document.getElementsByClassName("playbackButtons___playback-button___2bb6j")[2];
    elm_forward.click();
  }
});
