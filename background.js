// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Declare extension default properties
// let downloadsArray = [];
// let initialState = {
//   'savedImages': downloadsArray,
//   'thumbnails': false,
//   'saveImages': true
// };


//workaround bug
//https://stackoverflow.com/questions/25536703/how-to-enable-a-pageaction-icon-for-a-chrome-extension-in-incognito-mode/25537746
function doReplaceRules() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { 
            hostEquals: 'www.zdf.de',
            schemes: ['https']
          },
          css: ['video']
        })
      ],
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
}

if (chrome.extension.inIncognitoContext) {
  doReplaceRules();
} else {
  chrome.runtime.onInstalled.addListener(doReplaceRules);
}



// // Set extension setting on installation
// chrome.runtime.onInstalled.addListener(function() {
//   //chrome.storage.local.set(initialState);
// });
