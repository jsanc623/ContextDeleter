﻿/**
 * workaround as chrome.i18n.getMessage is not available in service workers
 */
const getMessage = async function (message) {
  const locale = navigator.language.split('-')[0];

  // hardcoded locale bounding for the locales we support
  // this must be updated when we add a new locale
  const _locales = ['en', 'es', 'fr', 'gb'];
  if (!_locales.includes(locale)) {
    console.log("ContextDeleter: Locale not found in Locales")
    return "";
  }

  const jsonLocalFile = `_locales/${locale}/messages.json`;
  return await fetch(jsonLocalFile)
    .then(response => response.json())
    .then(data => {
      if (message in data && data[message].message) {
        return data[message].message;
      }
    })
    .catch(error => {
      console.log(`ContextDeleter: Error in localization: ${error}`)
      return ""
    });
}

/**
 * Add creation listeners on installed
 */
chrome.runtime.onInstalled.addListener(async function () {
  chrome.contextMenus.create({
    'id': 'ContextDeleterZap',
    'type': 'normal',
    'title': await getMessage('openContextMenuTitle'),
    'contexts': ['all']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  chrome.tabs.sendMessage(tab.id, {'action': 'deleteElement'}, function (response) {
    console.log("got response", response)
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request.action)
  if (request.action) {
    if (request.action === "deleteElement") {
      $(clickedElement).remove();
      sendResponse({value: "ok"})
    }
  }
});

