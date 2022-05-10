// ==UserScript==
// @name         youtube
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/watch?v=*
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

function focus_a(number, argElements) {
  var nowElement = argElements[number];
  nowElement.focus();
}

var now = -99;

document.addEventListener("keydown", function(event) {
  var elements = filterHaveInnerHTML(document.querySelectorAll("div.details>div.metadata>a.yt-simple-endpoint"));
  if(now == -99) {
    if(event.code == "ArrowLeft" || event.code == "NumpadDivide") {
      now = 0;
      focus_a(now, elements);
    }
  } else {
    if (event.code == "ArrowLeft") {
      if (now > 0) {
        now = now - 1;
        focus_a(now, elements);
      }
    }
    if (event.code == "NumpadDivide") {
      if (now < elements.length - 1) {
        now = now + 1;
        focus_a(now, elements);
      }
    }
  }
});
