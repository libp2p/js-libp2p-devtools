import { DevToolsMessage } from "@libp2p/devtools-metrics";

export function sendMessage (message: DevToolsMessage) {
  Promise.resolve()
    .then(async () => {
      const [
        tab
      ] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

      if (tab == null || tab.id == null) {
        console.info('no active tab')
        return
      }

      await chrome.tabs.sendMessage(tab.id, message);
    })
    .catch(err => {
      console.error('could not send', message.type, 'to page', err)
    })
  }