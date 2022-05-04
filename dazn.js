// ==UserScript==
// @name         dazn
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.dazn.com/ja-JP/fixture/ContentId:*
// @grant        none
// ==/UserScript==

document.addEventListener("keydown", function(event) {
  if(event.code == "KeyF") {
    var elm = document.getElementsByClassName("fullscreen___fullscreen___1OXBx")[0];
    elm.click();
  } else if(event.code == "KeyH") {
    var elm_switch = document.getElementsByClassName("video-switcher__label___1kJP3")[0];
    elm_switch.click();
  }
});
