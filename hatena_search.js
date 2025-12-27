// ==UserScript==
// @name         Hatena Search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Hatena Bookmark search
// @author       toyama0919
// @match        https://b.hatena.ne.jp/search/text?safe=on&sort=recent&q=*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena_search.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/hatena_search.js
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

var next_element = document.getElementsByClassName("pager-next")[0];
var prev_element = document.getElementsByClassName("pager-prev")[0];

document.addEventListener("keydown", function(event) {
  var class_str = document.activeElement.className;
  if(now == -99) {
    if(event.keyCode == 38 || event.keyCode == 40) {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.keyCode == 38) {
      if (now == elements.length - 1) {
        if (class_str == "pager-next") {
          if (prev_element) {
            prev_element.focus();
          } else {
            paintSingle(now, elements);
          }
          return;
        }
        if (class_str == "pager-prev") {
          paintSingle(now, elements);
          return;
        }
      }
      if (now > 0) {
        now = now - 1;
        paintSingle(now, elements);
      }
    }
    if (event.keyCode == 40) {
      if (now < elements.length - 1) {
        now = now + 1;
        paintSingle(now, elements);
      } else {
        if (class_str == "pager-prev") {
          next_element.focus();
        } else {
          if (class_str == "pager-next") {
            return;
          }
          if (prev_element) {
            prev_element.focus();
          } else {
            next_element.focus();
          }
        }
      }
    }
  }
});
