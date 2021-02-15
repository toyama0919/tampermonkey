// ==UserScript==
// @name         github search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/search?*
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

var elements = filterHaveInnerHTML(document.querySelectorAll("a.v-align-middle"));
var now = -99;

var next_element = document.getElementsByClassName("next_page")[0];
var prev_element = document.getElementsByClassName("previous_page")[0];
if (prev_element.className == 'previous_page disabled') {
  prev_element = undefined;
}

document.addEventListener("keydown", function(event) {
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
