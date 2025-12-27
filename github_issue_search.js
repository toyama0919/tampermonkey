// ==UserScript==
// @name         GitHub Issue Search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keyboard shortcuts for GitHub issue search
// @author       toyama0919
// @match        https://github.com/*/*/issues?utf8=%E2%9C%93&q=*
// @match        https://github.com/*/*/issues?page=*&q=*&utf8=%E2%9C%93
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/github_issue_search.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/github_issue_search.js
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

var elements = filterHaveInnerHTML(document.querySelectorAll(".link-gray-dark.v-align-middle.no-underline.h4.js-navigation-open"));
var now = -99;

var next_element = document.getElementsByClassName("next_page")[0];
var prev_element = document.getElementsByClassName("previous_page")[0];
if (prev_element.className == 'previous_page disabled') {
  prev_element = undefined;
}

document.addEventListener("keydown", function(event) {
  elements = document.querySelectorAll(".link-gray-dark.v-align-middle.no-underline.h4.js-navigation-open");
  var class_str = document.activeElement.className;
  console.log(class_str);
  if (class_str == "logged-in env-production emoji-size-boost") {
    now = -99;
    next_element = document.getElementsByClassName("next_page")[0];
    prev_element = document.getElementsByClassName("previous_page")[0];
  }
  console.log(now);
  if(now == -99) {
    if(event.keyCode == 38 || event.keyCode == 40) {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.keyCode == 38) {
      if (now == elements.length - 1) {
        if (class_str == "next_page") {
          if (prev_element) {
            prev_element.focus();
          } else {
            paintSingle(now, elements);
          }
          return;
        }
        if (class_str == "previous_page") {
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
        if (class_str == "previous_page") {
          next_element.focus();
        } else {
          if (class_str == "next_page") {
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
