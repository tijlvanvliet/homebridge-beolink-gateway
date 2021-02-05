# Homebridge Beolink Gateway plugin

## Introduction
Welcome to the Beolink Gateway plugin for [Homebridge](https://github.com/homebridge/homebridge).

This plugin allows you to control your Macro's created on the Beolink Gateway with HomeKit using the Home app and Siri.

## Installation

1. Install Homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-beolink-gateway`
3. Update your Homebridge `config.json` using the sample below.

## Configuration sample

```json
"platforms": [
  {
    "platform": "homebridge-beolink-gateway",
    "gateways": [
      {
        "name": "YourGatewayName",
        "url": "http://192.168.1.XX",
        "prefix": "B&O",
        "username": "YourGatewayUsername",
        "password": "YourGatewayPassword"
      }]
  }
]
```

Fields:

- `name` An internal name of the gateway for loggin.
- `url` The url on which the gateway is available .
- `prefix` Used to prefix the accessories to easily identify them in Homekit (can be left empty).
- `username` The username used to login onto the Beolink Gteway.
- `username` The password used to login onto the Beolink Gateway

## WIP/TODO

1. Dynamically update when new macro's that are added. (Now a reboot of homebridge is needed)
2. See if accessoires can be added for the resources; to display actual status or even change input of the devices.