import { getBrowserInstance } from './utils/get-browser.js'

const browser = getBrowserInstance()

/**
Listen for messages from our devtools panel.
*/
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.info('sender.url', sender.url)

   if (sender.url != browser.runtime.getURL('/public/panel.html')) {
    return;
  }

  console.info('loading', request.script, 'in tab', request.tabId)
  browser.tabs.executeScript(request.tabId, {
    file: request.script
  })
})
