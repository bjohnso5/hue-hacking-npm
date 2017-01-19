# hue-hacking-npm: Hue Control Library #

hue-hacking is a javascript library designed to control the Philips Hue smart LED bulb system. This version has been modified to be used as a Node module.

For more information on the Philips Hue bulbs and wireless bridge system, visit [meethue.com](http://meethue.com).

_Initial concept and startup work inspired by [Ross McKillop's post](http://rsmck.co.uk/hue)._

## Getting Started ##
Once you've followed the instructions with your Hue starter kit and you have your lamps working through the web interface or smartphone app, it's time to configure your copy of hue.js.

For a full breakdown of what the Philips Hue API/SDK offers, check out the [official developer site](http://developers.meethue.com/). Full details about how to register a new 'user' with the wireless bridge can be found at the SDK [getting started page](http://developers.meethue.com/gettingstarted.html).

1. Generate and save your MD5 hash (any [MD5 generator](http://www.miraclesalad.com/webtools/md5.php) will do). Be sure to save your hash and the passphrase used to generate it in a safe place.

2. Find the IP address of your Hue wireless bridge. This can be gathered in a number of ways, including the meethue.com control panel, https://www.meethue.com/en-US/user/preferencessmartbridge, by clicking on the "Show me more" link. See [screenshot](http://imgur.com/yDhCp) for an example. Alternatively, you can browse to [this URL](http://www.meethue.com/api/nupnp), and use the value displayed in `internalipaddress`.

3. To use the Hue library in a web application, make sure to call the 
```javascript 
setConfig({
        ip: <ipAddress>, 
        key: <hash>
});
``` 
function, passing in the IP address and the API key value generated and registered with the hub.

4. __Optional:__ If you have more than 3 bulbs (the number included in the Hue starter kit), call the setNumberOfLamps() function, passing in the total number of lamps available, prior to using the lamp control functions.

## Included Files ##

### src/hue-colors.ts ###
Provides convenience functions to convert between CSS-style hex color values, their corresponding RGB color values, and the CIE 1931 X,Y color coordinates supported by the Hue lamp system.

### src/hue-css-colors.ts ###
Provides a map of CSS named colors and their corresponding hex color values.

### src/hue-node.ts ###
Provides control functions to control either single lamps, groups of lamps, or all available lamps. Lamps can be toggled (on/off), flashed for a short or long time, and have their color changed.

### test/hue-test-constants.js ###
Provides some simple properties to match JSON state responses.

### test/** ###
nodeunit test suites.

## Badges ##
[![Coverage Status](https://coveralls.io/repos/github/bjohnso5/hue-hacking-npm/badge.svg?branch=master)](https://coveralls.io/github/bjohnso5/hue-hacking-npm?branch=master)

&copy; 2013 Bryan Johnson; Licensed MIT.
