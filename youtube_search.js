// ==UserScript==
// @name         youtube
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/results?search_query=*
// @match        https://youtube.com/results?search_query=*
// @grant        none
// ==/UserScript==

function GM_addStyle (cssStr) {
  var D = document;
  var newNode = D.createElement ('style');
  newNode.textContent = cssStr;

  var targ = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
  targ.appendChild (newNode);
}

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

GM_addStyle ( `
    #video-title:focus {
      background: yellow !important;
      color: red !important;
    }
` );

document.addEventListener("keydown", function(event) {
  elements = filterHaveInnerHTML(document.querySelectorAll("h3>a"));
  var id_str = document.activeElement.id;
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
