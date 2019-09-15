import {JSONPath} from './index-es.min.js';

(async function() {


    function scanJson(formitaeten){

        const links = { high: [], veryhigh: [] };

        links.high     = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
        links.veryhigh = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='veryhigh')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});

        if (links.veryhigh.length > 0) {
            return links.veryhigh[0];
        } else if (ink.high.length > 0) {
            return links.high[0];
        }
        return "#noLink";
    }


    

    var regex1 = /\.json\?profile=player2$/;
    var regex2 = /^https:\/\/api\.zdf\.de\/tmd\/2\/ngplayer\w*\/\w*\/ptmd/;


    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send; //save original
    var open = XHR.open; //save original

    XHR.open = function(method, url) {
        this.url = url;         // the request url
        return open.apply(this, arguments);
    }


    //save to find ptmd link and help ptmd link to attach download icon
 
    //todo
    //save links in local storage
    //add link before 2.nd urls return if found in localstorage
    
    var store = {};
    XHR.send = function() {    
        this.addEventListener('load', function() {
          
            if ( regex1.test(this.url) ){
                //save basename and video (content=this.url)
                let content = JSON.parse(this.response);
                //find ID
                let id = content["mainVideoContent"]["http://zdf.de/rels/target"]["http://zdf.de/rels/streams/ptmd-template"];
                //find video tag with id
                //"/tmd/2/{playerId}/vod/ptmd/mediathek/190829_1_1_shs"
                let basename = id.substring(id.lastIndexOf("/")+1);

                //find element
                let video = document.querySelector("div[data-zdfplayer-jsb]");
                let dataJ = video.getAttribute("data-zdfplayer-jsb");
                let data = JSON.parse(dataJ);
                let url = data.content;

                if (url == this.url){
                    store[basename] = video; //keep ref to video tag for later
                }
                

            } else if ( regex2.test(this.url) ){
                
                let basename = this.url.substring(this.url.lastIndexOf("/")+1);
                if (store[basename]){
                    let link = scanJson( JSON.parse(this.response));
                    //add download link to video
                    let v1 = store[basename];
                    let parent = v1.closest( ".x-row");
                    let info = parent.querySelector(".teaser-info");
                    let info2 = info.cloneNode(true);
                    info.parentElement.appendChild(info2);
                    info2.innerHTML = "<a href='"+ link + "'>Download 💾</a>";
                }
            }

        });
        return send.apply(this, arguments);
    };



  })();