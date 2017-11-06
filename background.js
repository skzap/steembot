var steemin = false;

chrome.storage.sync.get('enabled', function({enabled}) {
  steemin = enabled;
  updateBtnState();
});

chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
  //console.log(props)
  if (props.status == "complete") {
    InjectBot(tab);
  }
});

chrome.browserAction.onClicked.addListener(function(){
  steemin = !steemin;

  chrome.storage.sync.set({enabled: steemin}, updateBtnState);
});

function InjectBot(tab) {
  var urlSplit = tab.url.split('/');
  if (steemin && tab.url.indexOf('https://steemit.com/') == 0) {
    chrome.tabs.executeScript(tab.id, {
      file: "steembot.js"
    });
  }
}

function updateBtnState() {
  if (steemin) {
    chrome.browserAction.setIcon({path:"steem128a.png"});
  } else {
    chrome.browserAction.setIcon({path:"steem128.png"});
  }
}
