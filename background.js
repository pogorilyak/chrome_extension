chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        var tablink;

        chrome.tabs.getSelected(null,function(tab) {
            tablink = tab.url;
        });

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "checkTabUpdate",
                tablink: tablink,
                tab: tab
            }, function(response) {});
        });
    }
});