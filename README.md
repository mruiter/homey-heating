# Heating scheduler for Athom Homey

Easily control the temperature of your thermostats.

## Known Issues

* If you change devices, and zones you have to reload the application
* Devices are not checked for inactivity
* Dialogs don't prompt if you exit without saving changes

See [Issue Tracker](https://github.com/mskg/homey-heating/issues)

## Supported Languages

* English

## Notes
* Build
  * __npm run homey:run__ to run the dev build of the App on your homey. 
    * This exposes the API public but does not change thermostat values.
    * Schedules are not read from configuration and are not persisted. You always start with clean values.
  * __npm run start:web__ to run the settings app localy. Don't forget to set your Homey url below.
  * __npm run homey:install__ to drop a propduction build onto your Homey.

* Change environemt variable HOMEY_DEV_URL to point to your Homey's url, e.g. http://192.168.0.1

* If you enable remote logging inside the app, you can watch the live trace of the application via [console.re/yourcategory](console.re)

## Change Log

### v1.0.0
Initial release

## Feedback

Please report issues at the [issues section on GitHub](https://github.com/mskg/homey-heating/issues) or contact me on [Slack](https://athomcommunity.slack.com/team/mskg).