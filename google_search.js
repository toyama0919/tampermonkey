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
  elms.push(document.querySelector("div.WZH4jc.w7LJsc>a"))
  return elms;
}

function focus_element(number, argElements) {
  var nowElement = argElements[number];
  nowElement.focus();
}

// var elements = filterHaveInnerHTML(document.querySelectorAll("div.yuRUbf>div>span>a"));
var elements = filterHaveInnerHTML(document.querySelectorAll("a[jsname='UWckNb']"));
var now = -99;

var next_element = document.querySelector("div.WZH4jc.w7LJsc>a")
document.documentElement.setAttribute('class', "zAoYTe")

document.addEventListener("keydown", function(event) {
  // まだ何もしていない
  if(now == -99) {
    if(event.code == "ArrowUp" || event.code == "ArrowDown") {
      now = 0;
      focus_element(now, elements);
    }
  } else {
    switch (event.key) {
      case "ArrowDown":
        if (now < elements.length - 1) {
          now = now + 1;
          focus_element(now, elements);
        }
        if (now == (elements.length - 1)) {
          next_element.click();
          setTimeout(function() {
            elements = filterHaveInnerHTML(document.querySelectorAll("a[jsname='UWckNb']"));
          }, 1500);
        }
        break;
      case "ArrowUp":
        if (now > 0) {
          now = now - 1;
          focus_element(now, elements);
        }
        break;
      default:
        break;
    }
  }
});
