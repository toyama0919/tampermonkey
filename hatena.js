// ==UserScript==
// @name         Hatena Top
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Hatena Bookmark top page
// @author       toyama0919
// @match        https://b.hatena.ne.jp/
// @match        https://b.hatena.ne.jp/hotentry/*
// @match        https://b.hatena.ne.jp/entrylist/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena.js
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

var elements = filterHaveInnerHTML(document.querySelectorAll("h3.entrylist-contents-title>a"));
var now = -99;

document.addEventListener("keydown", function(event) {
  elements = filterHaveInnerHTML(document.querySelectorAll("h3.entrylist-contents-title>a"));
  var id_str = document.activeElement.id;
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
