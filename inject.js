import {JSONPath} from './index-es.min.js';

(async function() {


    async function scanJson(formitaeten){

        const links = { high: [], veryhigh: [] };

        links.high     = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
        links.veryhigh = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='veryhigh')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});

        return links;
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
 
    XHR.send = function() {    
        this.addEventListener('load', function() {
          
            if ( regex1.test(this.url) ){
                //save basename and video (content=this.url)
                console.log("intercept url1");
                //find ID
                //find video tag with id

            } else if ( regex2.test(this.url) ){
                console.log("intercept url2");
                scanJson( JSON.parse(this.response));
            }

        });
        return send.apply(this, arguments);
    };



  })();