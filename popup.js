// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict'

import {JSONPath} from './index-es.min.js';

// Script code to inject on page
// Selects images then returns array of their currentSrc
const scriptCode =
  `(function() {
      let box = document.querySelector('.b-playerbox');
      let pcj = box.getAttribute("data-zdfplayer-jsb");      
      return pcj
    })();`;


// Declare add image function to save downloaded images
function addLink(url, quality) {

    let getdiv = document.getElementById(quality);
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = url;
    a.text = "Link";


    
    a.addEventListener('click', function(e) {
        e.preventDefault();
        // Downloads and image when it is clicked on
        chrome.downloads.download({url: url});
    }, {capture:true});

    li.appendChild(a);
    getdiv.appendChild(li);


    //   chrome.storage.local.get('savedImages', function(result) {
//     // Check if storage has exsisting arrays
//     // If array found, blank array is replaced with found array
//     // If no array, we add to created blank array
//     let downloadsArray = result.savedImages || [];
//     // Images are added
//     downloadsArray.push(url);
//     // Chrome stores the new array with the new image
//     chrome.storage.local.set({'savedImages': downloadsArray}, function() {
//       if (chrome.runtime.lastError) {
//         console.log(chrome.runtime.lastError);
//       } else {
//         console.log('Image saved successfully');
//       };
//     });
//   });
};

function addLinks( { high, veryhigh }){
    high.map( url=>addLink(url,"high"));
    veryhigh.map( url=>addLink(url,"veryhigh"));
}



async function getPlayerUrls({apiToken, url}){

    return new Promise((resolve,reject)=>{
        let timeout = setTimeout(reject,3000);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState === 4 && xhr.status === 200) {
                clearTimeout(timeout);
                resolve(xhr.responseText);
            }
        };
        xhr.open("GET", chrome.extension.getURL(url), true);
        xhr.setRequestHeader("Api-Auth", `Bearer ${apiToken}`)
        xhr.send();
    });


}

// Grabs the imageDiv from the popup
async function setUp(pcj) {

    const pc = JSON.parse(pcj);
    const apiToken  = pc.apiToken;
    const playerUrl = pc.content;

    let contentJson = await getPlayerUrls({ apiToken, url: playerUrl});
    let playerInfo = JSON.parse(contentJson);

    //skip no videos
    if (!(playerInfo["mainVideoContent"] && 
    playerInfo["mainVideoContent"]["http://zdf.de/rels/target"] && 
    playerInfo["mainVideoContent"]["http://zdf.de/rels/target"]["http://zdf.de/rels/streams/ptmd-template"])){
        console.warn({"msg":"no video"});
        return;
    }

    const ptmd = playerInfo["mainVideoContent"]["http://zdf.de/rels/target"]["http://zdf.de/rels/streams/ptmd-template"]
    // /tmd/2/{playerId}/vod/ptmd/mediathek/190117_2215_sendung_mil
    // https://api.zdf.de/tmd/2/ngplayer_2_3/vod/ptmd/mediathek/190117_2215_clip_1_mil
    
    //FIXME
    const playerId_hardcoded = "ngplayer_2_3";
    const formitaetenUrl = `https://api.zdf.de${ptmd}`.replace("{playerId}",playerId_hardcoded);
    const formitaetenJson = await getPlayerUrls({ apiToken, url: formitaetenUrl});

    const formitaeten = JSON.parse(formitaetenJson)


    //const mp4 = JSONPath({path: "$..qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaetenJson});
    //const mp4 = JSONPath({path: "$..qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
    const links = { high: [], veryhigh: [] };
    links.high     = JSONPath({path: "$..qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
    links.veryhigh = JSONPath({path: "$..qualities[?(@.quality=='veryhigh')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
    


    addLinks(links);
    return;

    // chrome.storage.local.get(
    //     ['saveImages', 'thumbnails'], function(config) {
    //     for (let src of array) {
    //     let newImage = document.createElement('img');
    //     let lineBreak = document.createElement('br');
    //     newImage.src = src;
    //     console.log(newImage)
    //     // Add an onclick event listener
    //     newImage.addEventListener('click', function() {
    //         // Downloads and image when it is clicked on
    //         chrome.downloads.download({url: newImage.src});
    //         // Checks if extension is set to store images
    //         if (config.saveImages === true) {
    //         // If true, call addImage function
    //         addImage(newImage.src);
    //         };
    //     });
    //     // Checks extension thumbnail settings
    //     if (config.thumbnails === true) {
    //         // If on, popup displays images as thumnails
    //         let newDiv = document.createElement('div');
    //         newDiv.className = 'square';
    //         newDiv.appendChild(newImage);
    //         imageDiv.appendChild(newDiv);
    //     } else {
    //         // If off, images are displayed at full size
    //         imageDiv.appendChild(newImage);
    //     };
    //     imageDiv.appendChild(lineBreak);
    //     };
    // });
};

// Runs script when popup is opened
chrome.tabs.executeScript({code: scriptCode}, function(result) {
  setUp(result[0]);
});

//let optionsButton = document.getElementById('options_button');

// optionsButton.onclick = function() {
//   chrome.tabs.create({ url: "options.html" });
// }
