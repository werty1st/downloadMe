
//  inject xhrOverrideScript


function interceptData() {
    const xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'module';
    xhrOverrideScript.src = chrome.runtime.getURL("inject.js");
    document.documentElement.appendChild(xhrOverrideScript);    
}



if (window.location.pathname.indexOf(".html")>-1)
interceptData();
