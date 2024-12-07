const defaultBlockedWebsites = [
  "*://adsense.google.com/start/*",
  "*://*googleadservices.com/*",
  "*://.doubleclick.net/*",
  "*://partner.googleadservices.com/*",
  "*://.googlesyndication.com/*",
  "*://.google-analytics.com/*",
  "*://creative.ak.fbcdn.net/*",
  "*://.adbrite.com/*",
  "*://.exponential.com/*",
  "*://.quantserve.com/*",
  "*://.scorecardresearch.com/*",
  "*://.zedo.com/*",
  "*://.googletagmanager.com/*",
  "*://.px.ads.linkedin.com/*",
  "*://.twitter.com/*",
];

chrome.runtime.onInstalled.addListener(function () {
  // Load the list from Chrome storage
  chrome.storage.local.get("blockedWebsites", function (data) {
    try {
      let blockedWebsites = JSON.parse(data.blockedWebsites);
      console.log(blockedWebsites);
      formatAndBlockWebsites(blockedWebsites);
    } catch (error) {
      // if first time visit then block default websites
      blockedWebsites = defaultBlockedWebsites;
      chrome.storage.local.set(
        { blockedWebsites: JSON.stringify(defaultBlockedWebsites) },
        () => {
          console.log("default websites stored in localstorage.");
        }
      );
      formatAndBlockWebsites(blockedWebsites);
    }
  });
});

// Listener for reloading the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "reloadExtension") {
    chrome.runtime.reload();
  }
});

async function formatAndBlockWebsites(blockedWebsites) {
  // Format the list into the required JSON format for declarativeNetRequest
  const formattedRules = blockedWebsites.map((website, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "block",
    },
    condition: {
      urlFilter: website,
    },
  }));
  console.log(formattedRules);

  let oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map((rule) => rule.id);
  console.log("oldRules", oldRules);
  // Set up the rules for blocking websites
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds, 
    addRules: formattedRules,
  });
}
