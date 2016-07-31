chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
  //console.log(props)
  if (props.status == "complete") {
    InjectBot(tab);
  }
});

function InjectBot(tab) {
  var urlSplit = tab.url.split('/');
  if (tab.url.indexOf('https://steemit.com/created/') == 0) {
    chrome.tabs.executeScript(tab.id, {
      file: "steembot.js"
    });
  }
}
