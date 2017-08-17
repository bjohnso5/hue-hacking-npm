# hue-hacking-npm: Hue Control Library #
[![npm version](https://badge.fury.io/js/hue-hacking-node.svg)](https://badge.fury.io/js/hue-hacking-node)
[![Build Status](https://travis-ci.org/bjohnso5/hue-hacking-npm.svg?branch=master)](https://travis-ci.org/bjohnso5/hue-hacking-npm)
[![Coverage Status](https://coveralls.io/repos/github/bjohnso5/hue-hacking-npm/badge.svg?branch=master)](https://coveralls.io/github/bjohnso5/hue-hacking-npm?branch=master)

hue-hacking is a javascript library designed to control the Philips Hue smart LED bulb system. This version has been modified to be used as a Node module.

For more information on the Philips Hue bulbs and wireless bridge system, visit [meethue.com](http://meethue.com).

_Initial concept and startup work inspired by [Ross McKillop's post](http://rsmck.co.uk/hue)._

## Getting Started ##
Once you've followed the instructions with your Hue starter kit and you have your lamps working through the web interface or smartphone app, it's time to configure your copy of hue.js.

For a full breakdown of what the Philips Hue API/SDK offers, check out the [official developer site](http://developers.meethue.com/). Full details about how to register a new 'user' with the wireless bridge can be found at the SDK [getting started page](http://developers.meethue.com/gettingstarted.html).

1. Generate and save your MD5 hash (any [MD5 generator](http://www.miraclesalad.com/webtools/md5.php) will do). Be sure to save your hash and the passphrase used to generate it in a safe place.

2. Find the IP address of your Hue wireless bridge. This can be gathered in a number of ways, including the meethue.com control panel, https://www.meethue.com/en-US/user/preferencessmartbridge, by clicking on the "Show me more" link. See [screenshot](http://imgur.com/yDhCp) for an example. Alternatively, you can browse to [this URL](http://www.meethue.com/api/nupnp), and use the value displayed in `internalipaddress`. This module now supports a static `search` operation, allowing you to find any Hue bridges attached to the local network (using the same UPNP approach as mentioned previously):
```typescript
import { Hue, HueUPNPResponse } from 'hue-hacking-node';

const foundBridges: HueUPNPResponse[] = await Hue.search();
const validBridgeIPs: string[] = [];
for (let bridge of foundBridges) {
  validBridgeIPs.push(bridge.internalipaddress);
}
```
Or, if you can't use async / await semantics in your module:
```typescript
import { Hue, HueUPNPResponse } from 'hue-hacking-node';

let validBridgeIPs: string[] = [];
Hue.search().then(bridges => {
  for (let bridge of bridges) {
    validBridgeIPs.push(bridge.internalipaddress);
  }
});

```

3. Quick example configuration:
```typescript
import { Hue } from 'hue-hacking-node';

const bridgeIP = '192.168.x.x';
const appname = 'myfirsthueapp'; // This is the hash / name / id that you registered with the bridge previously using the official Hue docs

const hue = new Hue({
  ip: bridgeIP, 
  key: appname,
  numberOfLamps: 3,
  retrieveInitialState: false
});
```

For the best introduction to using this module, please see the `hue-node.spec.ts` file.

&copy; 2013 Bryan Johnson; Licensed MIT.
