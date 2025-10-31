import { ribbonCorner } from 'ribbon-corner'
import defaultEnvs from '../src/assets/defaultEnvs.json'
import browser from  'webextension-polyfill'

/**
 * Importing the file below initializes the content script.
 *
 * Warning:
 *   Do not remove the import statement below. It is required for the extension to work.
 *   If you don't need createBridge(), leave it as "import '#q-app/bex/content'".
 */
import { createBridge } from '#q-app/bex/content'

// The use of the bridge is optional.
const bridge = createBridge({ debug: false })
/**
 * bridge.portName is 'content@<path>-<number>'
 *   where <path> is the relative path of this content script
 *   filename (without extension) from /src-bex
 *   (eg. 'my-content-script', 'subdir/my-script')
 *   and <number> is a unique instance number (1-10000).
 */

// Hook into the bridge to listen for events sent from the other BEX parts.
bridge.on('some.event', message => {
  if (message.payload.yourProp) {
    // Access a DOM element from here.
    // Document in this instance is the underlying website the contentScript runs on
    const el = document.getElementById('some-id')
    if (el) {
      el.innerText = 'Quasar Rocks!'
    }
  }
})

/**
 * Leave this AFTER you attach your initial listeners
 * so that the bridge can properly handle them.
 *
 * You can also disconnect from the background script
 * later on by calling bridge.disconnectFromBackground().
 *
 * To check connection status, access bridge.isConnected
 */
bridge.connectToBackground()
  .then(() => {
    console.log('Connected to background')
  })
  .catch(err => {
    console.error('Failed to connect to background:', err)
  })

/*
// More examples:

// Listen to a message from the client
bridge.on('test', message => {
  console.log(message)
  console.log(message.payload)
})

// Send a message and split payload into chunks
// to avoid max size limit of BEX messages.
// Warning! This happens automatically when the payload is an array.
// If you actually want to send an Array, wrap it in an object.
bridge.send({
  event: 'test',
  to: 'app',
  payload: [ 'chunk1', 'chunk2', 'chunk3', ... ]
}).then(responsePayload => { ... }).catch(err => { ... })

// Send a message and wait for a response
bridge.send({
  event: 'test',
  to: 'background',
  payload: { banner: 'Hello from content-script' }
}).then(responsePayload => { ... }).catch(err => { ... })

// Listen to a message from the client and respond synchronously
bridge.on('test', message => {
  console.log(message)
  return { banner: 'Hello from a content-script!' }
})

// Listen to a message from the client and respond asynchronously
bridge.on('test', async message => {
  console.log(message)
  const result = await someAsyncFunction()
  return result
})
bridge.on('test', message => {
  console.log(message)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ banner: 'Hello from a content-script!' })
    }, 1000)
  })
})

// Broadcast a message to background, app & the other content scripts
bridge.portList.forEach(portName => {
  bridge.send({ event: 'test', to: portName, payload: 'Hello from content-script!' })
})

// Find any connected content script and send a message to it
const contentPort = bridge.portList.find(portName => portName.startsWith('content@'))
if (contentPort) {
  bridge.send({ event: 'test', to: contentPort, payload: 'Hello from a content-script!' })
}

// Send a message to a certain content script
bridge
  .send({ event: 'test', to: 'content@my-content-script-2345', payload: 'Hello from a content-script!' })
  .then(responsePayload => { ... })
  .catch(err => { ... })

// Listen for connection events
// (the "@quasar:ports" is an internal event name registered automatically by the bridge)
// --> ({ portList: string[], added?: string } | { portList: string[], removed?: string })
bridge.on('@quasar:ports', ({ portList, added, removed }) => {
  console.log('Ports:', portList)
  if (added) {
    console.log('New connection:', added)
  } else if (removed) {
    console.log('Connection removed:', removed)
  }
})

// Dynamically set debug mode
bridge.setDebug(true) // boolean

// Log a message on the console (if debug is enabled)
bridge.log('Hello world!')
bridge.log('Hello', 'world!')
bridge.log('Hello world!', { some: 'data' })
bridge.log('Hello', 'world', '!', { some: 'object' })
// Log a warning on the console (regardless of the debug setting)
bridge.warn('Hello world!')
bridge.warn('Hello', 'world!')
bridge.warn('Hello world!', { some: 'data' })
bridge.warn('Hello', 'world', '!', { some: 'object' })
*/


function setEnv(env) {
  let horizontalAlign = 'left'
  let verticalAlign = 'top'
  
  // 如果包含 right
  if (env.position && env.position.includes('right')) {
    horizontalAlign = 'right'
  }
  if (env.position && env.position.includes('bottom')) {
    verticalAlign = 'bottom'
  }
  
  var element
  if (env.shape === 'triangle') {
    element = ribbonCorner({
      backgroundColor: env.envBackgroundColor,
      toCorner: 30,
      height: 60,
      horizontalAlign: horizontalAlign,
      verticalAlign: verticalAlign,
      text: env.envName,
      textColor: env.textColor,
      position: 'fixed',
      fontSize: 14
    })
  } else {
    element = ribbonCorner({
      backgroundColor: env.envBackgroundColor,
      toCorner: 60,
      height: 40,
      horizontalAlign: horizontalAlign,
      verticalAlign: verticalAlign,
      text: env.envName,
      textColor: env.textColor,
      position: 'fixed',
      fontSize: 14
    })
    element.style.justifyContent = "center"
  }
}

browser.storage.sync.get(['enable', 'envs']).then(result => {
  // only return on enable is false
  if (result.enable === false) {
    return
  }

  let envs = result.envs
  if (result.envs === undefined) {
    envs = defaultEnvs
    browser.storage.sync.set({
      envs: envs
    }).then(() => {
      console.log('env indicator init default envs success!')
    })
  }

  const url = window.location.href
  const domain = window.location.host
  for (const env of envs) {
    switch (env.ruleType) {
      case 'contains':
        if (url.includes(env.ruleValue.toLowerCase())) {
          setEnv(env)
          return
        }
        break
      case 'prefix':
        if (url.startsWith(env.ruleValue.toLowerCase())) {
          setEnv(env)
          return
        }
        break
      case 'suffix':
        // For suffix, check domain to maintain backward compatibility
        if (domain.endsWith(env.ruleValue.toLowerCase())) {
          setEnv(env)
          return
        }
        break
      case 'regex':
        if (RegExp(env.ruleValue).test(url)) {
          setEnv(env)
          return
        }
    }
  }
})
