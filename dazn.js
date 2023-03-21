// ==UserScript==
// @name         dazn
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.dazn.com/ja-JP/fixture/ContentId:*
// @match        https://www.dazn.com/ja-JP/schedule
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

function focus_a(number, argElements) {
  var nowElement = argElements[number];
  nowElement.focus();
}

var now = -99;

document.addEventListener("keydown", function(event) {
  // カーソル移動
  if(event.code == "ArrowUp" || event.code == "ArrowDown") {
    var elements = get_elements(document.querySelectorAll("article.rail-tile__tile___Wf2pP>a"));
    if(now == -99) {
      if(event.code == "ArrowUp" || event.code == "ArrowDown") {
        now = 0;
        focus_a(now, elements);
      }
    } else {
      if (event.code == "ArrowUp") {
        if (now > 0) {
          now = now - 1;
          focus_a(now, elements);
        }
      }
      if (event.code == "ArrowDown") {
        if (now < elements.length - 1) {
          now = now + 1;
          focus_a(now, elements);
        }
      }
    }
  }

  // 各種操作
  if(event.code == "KeyF") {
    var elm = document.getElementsByClassName("fullscreen___fullscreen___1OXBx")[0];
    elm.click();
  } else if(event.code == "KeyS") {
    var elm_theatre = document.getElementsByClassName("theatreModeToggle___theatreModeToggle___17W1g")[0];
    elm_theatre.click();
  } else if(event.code == "KeyC") {
    var elm_switch = document.getElementsByClassName("video-switcher__label___k3jwc")[0];
    elm_switch.click();
  } else if(event.code == "KeyA") {
    var elm_rewind = document.getElementsByClassName("playbackButtons___playback-button___2bb6j")[0];
    elm_rewind.click();
  } else if(event.code == "KeyD") {
    var elm_forward = document.getElementsByClassName("playbackButtons___playback-button___2bb6j")[2];
    elm_forward.click();
  }
});
