// ==UserScript==
// @name         Atlassian Confluence
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for Atlassian Confluence search
// @author       toyama0919
// @match        https://wiki.dena.jp/dosearchsite.action?queryString=*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/dena_confluence.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/dena_confluence.js
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

var next_element = document.getElementsByClassName("pagination-next")[0];
var prev_element = document.getElementsByClassName("pagination-prev")[0];

document.addEventListener("keydown", function(event) {
  var class_str = document.activeElement.className;
  if (class_str == "theme-default  aui-layout aui-theme-default") {
    now = -99;
    elements = filterHaveInnerHTML(document.querySelectorAll("h3>a"));
    next_element = document.getElementsByClassName("pagination-next")[0];
    prev_element = document.getElementsByClassName("pagination-prev")[0];
  }
  if(now == -99) {
    if(event.keyCode == 38 || event.keyCode == 40) {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.keyCode == 38) {
      if (now == elements.length - 1) {
        if (class_str == "pagination-next") {
          if (prev_element) {
            prev_element.focus();
          } else {
            paintSingle(now, elements);
          }
          return;
        }
        if (class_str == "pagination-prev") {
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
        if (class_str == "pagination-prev") {
          next_element.focus();
        } else {
          if (class_str == "pagination-next") {
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
