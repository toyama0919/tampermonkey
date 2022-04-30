// ==UserScript==
// @name         youtube_channels
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/channel/*/videos
// @match        https://www.youtube.com/c/*/videos
// @match        https://youtube.com/channel/*/videos
// @match        https://youtube.com/c/*/videos
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
    if(event.keyCode == 38 || event.keyCode == 40) {
      now = 0;
      paintSingle(now, elements);
    }
  } else {
    if (event.keyCode == 38) {
      if (now > 0) {
        now = now - 1;
        paintSingle(now, elements);
      }
    }
    if (event.keyCode == 40) {
      if (now < elements.length - 1) {
        now = now + 1;
        paintSingle(now, elements);
      }
    }
  }
});
