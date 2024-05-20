# js-libp2p DevTools

> A browser plugin that lets you inspect a running libp2p node

A [DevTools](https://developer.chrome.com/docs/devtools) plugin that adds a "libp2p" tab to your developer tools that contacts a libp2p node running on the current page.

Works with [@libp2p/devtools-metrics](https://www.npmjs.com/package/@libp2p/devtools-metrics) which supplies metrics and allows us to interact with the running node.

<img width="840" alt="image" src="https://github.com/ipfs-shipyard/js-libp2p-devtools/assets/665810/f8f6a7c8-377f-41d6-948f-95d8469f58b8">

## Installation instructions

1. Browser installation

Until this plugin is published on the relevant browser plugin stores, please run this locally.

- Chrome: [How to load an unpacked extension](https://knowledge.workspace.google.com/kb/load-unpacked-extensions-000005962)
- Firefox: [How to install temporary add-ons](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

2. App installation

Configure `@libp2p/devtools-metrics` as your metrics implementation:

```ts
import { createLibp2p } from 'libp2p'
import { createDevToolsMetrics } from '@libp2p/devtools-metrics'

const node = await createLibp2p({
  metrics: createDevToolsMetrics(),
  //... other options here
})
```

3. That's it! Browse to your webapp and open the DevTools, you should see a "libp2p" tab towards the right hand side of the toolbar. Click it to see stats about the running node.

## Running on Firefox

With the move to Manifest v3, users must now opt in to running content scripts on a page.

This tiny green dot shows that granting permissions is required:

More info: https://blog.mozilla.org/addons/2022/11/17/unified-extensions-button-and-how-to-handle-permissions-in-manifest-v3/

## What's next?

1. Tests
  - There aren't a lot of tests here yet
2. Better UI
  - It's quite rough
3. Graphs
  - We don't do much with the collected metrics yet. It would be nice to use Chart.js or similar to show some useful graphs
  - Bonus points for letting the user define their own graphs a la Graphana/Prometheus
  - More bonus points for being able to export/import graph configs
4. Dynamic panels
  - We should be able to inspect the libp2p node's configured services (or protocols?) and, for example, only show a DHT tab if the DHT is configured
5. Light theme support
  - There are partial overrides for light theme font/background/border colours but we need better detection of when it's enabled
6. ??? more features here
