// ==UserScript==
// @name         gemini-chat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://gemini.google.com/app?*
// @grant        none
// ==/UserScript==


document.addEventListener("keydown", function(event) {
  // 各種操作
  if(event.code == "ArrowUp") {
    const main_area = document.querySelectorAll("[role='list']")[0];
    main_area.scrollBy(0, -100);
  } else if(event.code == "ArrowDown") {
    const main_area = document.querySelectorAll("[role='list']")[0];
    main_area.scrollBy(0, 100);
  }
});

setTimeout(hidden, 3000);
