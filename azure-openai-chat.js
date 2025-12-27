// ==UserScript==
// @name         Azure OpenAI Chat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  UI improvements for Azure OpenAI Chat
// @author       toyama0919
// @match        https://ai.azure.com/resource/playground?*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/azure-openai-chat.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/azure-openai-chat.js
// @grant        none
// ==/UserScript==


function hidden() {
  const lines = document.getElementsByClassName("___lg5ij00");
  for( let i = 0 ; i < lines.length ; i ++ ) {
    lines[i].style.display = 'none';
  }

  const toolbar_items = document.querySelectorAll("[role='toolbar']");
  toolbar_items.forEach(element => element.style.display = 'none');

  const stack_item = document.querySelectorAll("[role='banner']");
  stack_item.forEach(element => element.style.display = 'none');

  const help_items = document.querySelectorAll("[data-automation-id='helpButtonV2']");
  help_items.forEach(element => element.style.display = 'none');

  const title_item = document.querySelectorAll("[data-automation-id='pageTitle']");
  title_item.forEach(element => element.style.display = 'none');

  const fui_button = document.getElementsByClassName("fui-Button r1alrhcs default-button ___91yyd40")[0];
  fui_button.click();

  const listitems = document.querySelectorAll("[role='listitem']");
  listitems[listitems.length- 1].click();
}

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
