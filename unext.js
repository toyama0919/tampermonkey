// ==UserScript==
// @name         unext
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://video.unext.jp/play/*/*
// @grant        none
// ==/UserScript==

function get_elements(argElements) {
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

document.addEventListener("keydown", function(event) {
  // 各種操作
  if(event.code == "Space") {
    document.querySelectorAll("[data-plyr='play']")[0].click();
  } else if(event.code == "KeyF") {
    document.querySelectorAll("[data-plyr='fullscreen']")[0].click();
  }
});
