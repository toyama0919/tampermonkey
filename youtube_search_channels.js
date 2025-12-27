// ==UserScript==
// @name         YouTube Channels
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for YouTube channels
// @author       toyama0919
// @match        https://www.youtube.com/channel/*/videos
// @match        https://www.youtube.com/c/*/videos
// @match        https://youtube.com/channel/*/videos
// @match        https://youtube.com/c/*/videos
// @match        https://www.youtube.com/
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_search_channels.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/youtube_search_channels.js
// @grant        none
// ==/UserScript==

function filterHaveInnerHTML(argElements) {
  var i;
  var elms = [];
  for(i=0;i < argElements.length;i++){
      var element = argElements[i];
      if(element.innerHTML !== "") {
          elms.push(element);
      }
  }
  return elms;
}

function paintSingle(number, argElements) {
  var nowElement = argElements[number];
  nowElement.focus();
}

var elements = filterHaveInnerHTML(document.querySelectorAll("h3>a"));
var now = -99;

document.addEventListener("keydown", function(event) {
  elements = filterHaveInnerHTML(document.querySelectorAll("h3>a"));
  if(now == -99) {
    if(event.code == "ArrowUp" || event.code == "ArrowDown") {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.code == "ArrowUp") {
      if (now > 0) {
        now = now - 1;
        paintSingle(now, elements);
      }
    }
    if (event.code == "ArrowDown") {
      if (now < elements.length - 1) {
        now = now + 1;
        paintSingle(now, elements);
      }
    }
  }
});
