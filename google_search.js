// ==UserScript==
// @name         Google search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.google.co.jp/search*
// @match       https://www.google.co.jp/?gws_rd=ssl#q=*
// @match        https://www.google.com/search*
// @match       https://www.google.com/?gws_rd=ssl#q=*
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

var elements = filterHaveInnerHTML(document.querySelectorAll("div.yuRUbf>div>a"));
var now = -99;

var next_element = document.getElementById("pnnext");
var prev_element = document.getElementById("pnprev");
document.documentElement.setAttribute('class', "zAoYTe")

document.addEventListener("keydown", function(event) {
  var id_str = document.activeElement.id;
  if(now == -99) {
    if(event.code == "ArrowUp" || event.code == "ArrowDown") {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.code == "ArrowUp") {
      if (now == elements.length - 1) {
        if (id_str == "pnnext") {
          if (prev_element) {
            prev_element.focus();
          } else {
            paintSingle(now, elements);
          }
          return;
        }
        if (id_str == "pnprev") {
          paintSingle(now, elements);
          return;
        }
      }
      if (now > 0) {
        now = now - 1;
        paintSingle(now, elements);
      }
    }
    if (event.code == "ArrowDown") {
      if (now < elements.length - 1) {
        now = now + 1;
        paintSingle(now, elements);
      } else {
        if (id_str == "pnprev") {
          next_element.focus();
        } else {
          if (id_str == "pnnext") {
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
