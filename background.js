// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Declare extension default properties
let downloadsArray = [];
let initialState = {
  'savedImages': downloadsArray,
  'thumbnails': false,
  'saveImages': true
};

// Set extension setting on installation
chrome.runtime.onInstalled.addListener(function() {
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
  chrome.storage.local.set(initialState);
});
