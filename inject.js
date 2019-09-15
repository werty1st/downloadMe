//http://jmespath.org/tutorial.html#multiselect
// zip -1 -x "*screens*" -x "*/\.*" x ".*"  -x "*.zip" -r addon.zip .
import * as JME from "./jmespath.js";


(async function() {

    const regex1 = /\.json\?profile=player2$/;
    const regex2 = /^https:\/\/api\.(zdf|3sat)\.de\/tmd\/2\/ngplayer\w*\/\w*\/ptmd/;


    const XHR = XMLHttpRequest.prototype;
    const send = XHR.send; //save original
    const open = XHR.open; //save original
    const store = {};

    function scanJson(response){

        //const links = { high: [], veryhigh: [] };
        const formitaeten = JSON.parse(response);

        // links.high     = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='high')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});
        // links.veryhigh = JSONPath({path: "$..formitaeten[?(@.mimeType=='video/mp4')].qualities[?(@.quality=='veryhigh')].audio.tracks[?(@.language=='deu')].uri", json: formitaeten});

        //test JMSE
        //let t1 = JME.search(formitaeten, "priorityList[*].formitaeten[?mimeType=='video/mp4']");
        //let t1 = JME.search(formitaeten, "priorityList[*].formitaeten[?mimeType=='video/mp4'].qualities[*].quality"); //quality=='veryhigh'
        //let t2 = JME.search(formitaeten, "priorityList[*].formitaeten[?mimeType=='video/mp4'].qualities[*].audio"); //
        let step1 = JME.search(formitaeten, "priorityList[*].formitaeten[?mimeType=='video/mp4'].qualities[*].{audio: audio, quality: quality}").flat(2);


        //2. step because i did figure out how to do it in one
        //todo
        //let videosA = JME.search(step1, "[?quality=='veryhigh'].audio.tracks[].{ uri: uri }");

        let videosA = step1.flat(2).filter( item=>item.quality=="veryhigh").filter( item=>{
            return item.audio.tracks.filter( tracks=>tracks.language=="deu" )
        });
        let videosB = step1.flat(2).filter( item=>item.quality=="high").filter( item=>{
            return item.audio.tracks.filter( tracks=>tracks.language=="deu" )
        });
        
        let urlA = JME.search({videos: videosA}, "videos[*].audio.tracks[0].uri");
        let urlB = JME.search({videos: videosB}, "videos[*].audio.tracks[0].uri");
        //let urlB = 
        
   
        //put veryhigh and high quality links together and return first
        return [...urlA, ...urlB].shift() 
         


        // if (links.veryhigh.length > 0) {
        //     return links.veryhigh[0];
        // } else if (ink.high.length > 0) {
        //     return links.high[0];
        // }
        // return "#noLink";
    }


    XHR.open = function(method, url) {
        this.url = url;         // the request url
        return open.apply(this, arguments);
    }

    //save to find ptmd link and help ptmd link to attach download icon
 
    //todo
    //save links in local storage
    //add link before 2.nd urls return if found in localstorage
    

    //extract video basename from json response
    //store connection between basename to video Element for stage2
    function stage1(url, response){

        //save basename and video (content=this.url)
        const content = JSON.parse(response);
        
        //find ID
        const id = content["mainVideoContent"]["http://zdf.de/rels/target"]["http://zdf.de/rels/streams/ptmd-template"];
        
        //find video tag with id
        //"/tmd/2/{playerId}/vod/ptmd/mediathek/190829_1_1_shs"
        const basename = id.substring(id.lastIndexOf("/")+1);

        //find element
        const video = document.querySelector("div[data-zdfplayer-jsb]");
        const dataJ = video.getAttribute("data-zdfplayer-jsb");
        const data = JSON.parse(dataJ);
        const myurl = data.content;

        if (myurl == url){
            store[basename] = video; //keep ref to video tag for later
        }
    }


    //find mp4 url and add Download link near corresponding video element
    function stage2(url, response){

        const basename = url.substring(url.lastIndexOf("/")+1);

        if (store[basename]){
            const link = scanJson( response );

            //get video element from stage1
            const v1 = store[basename];

            //detect 3sat OR zdf
            if (window.location.hostname.indexOf("zdf.de")>0){
                //zdf style
                const parent = v1.closest( ".x-row");
                const info = parent.querySelector(".teaser-info");
                const info2 = info.cloneNode(true);
                info.parentElement.appendChild(info2);
                const a = document.createElement("a");
                info2.innerHTML = "";
                a.href = link;
                a.text = "💾 Download";
                info2.appendChild(a);
                //info2.innerHTML = "<a href='"+ link + "'>💾 Download</a>";

            } else if (window.location.hostname.indexOf("3sat.de")>0){
                //3sat style
                const parent = window.v1 = v1.closest( ".content-box ");
                const info = parent.querySelector("div.show-for-medium dt.attribute-list-title");
                const info2 = info.cloneNode(true);
                info.parentElement.appendChild(info2);
                //info2.innerHTML = "<a href='"+ link + "'>💾 Download</a>";
                //attribute-list-title
                const a = document.createElement("a");
                info2.innerHTML = "";
                a.href = link;
                a.text = "💾 Download";
                info2.appendChild(a);
            }



        }

    }


    
    XHR.send = function() {    
        this.addEventListener('load', function() {
          
            if ( regex1.test(this.url) ){

                stage1( this.url, this.response );
                

            } else if ( regex2.test(this.url) ){
                
                stage2( this.url, this.response )

            }

        });
        return send.apply(this, arguments);
    };



  })();