const connections = {}

/*
 * web page -> content-script.js -> **background.js** -> dev tools
 */
chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab) {
    const tabId = sender.tab.id

    if (tabId == null) {
      return
    }

    if (tabId in connections) {
      connections[tabId].postMessage(request)
    }
  }
})

/*
 * dev tools -> **background.js** -> content-script.js -> web page
 */
chrome.runtime.onConnect.addListener((port) => {
  console.info('dev tools onConnect', port)

  const onMessage = (request, sender) => {
    console.info('dev tools port message', request, sender)

    // Register initial connection
    if (request.name === 'init') {
      connections[request.tabId] = port

      port.onDisconnect.addListener(function() {
        delete connections[request.tabId]
      })

      return
    }

    // Otherwise, broadcast to agent
    chrome.tabs.sendMessage(request.tabId, {
      name: request.name,
      data: request.data
    })?.catch?.(err => {
      console.error('error sending message to tab', request.tabId, err)
    })
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(onMessage)

  // remove listener if devtools disconnects
  port.onDisconnect.addListener(() => {
    console.info('removing message listener')
    port.onMessage.removeListener(onMessage)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.info('background.js tab updated', tabId)

  if (tabId in connections && changeInfo.status === 'complete') {
    // TODO: reload connection to page somehow...?
    connections[tabId].postMessage({
      name: 'reloaded'
    })
  }
})
