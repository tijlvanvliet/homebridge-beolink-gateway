import {AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin, PlatformAccessory} from "homebridge";
import {BeolinkMacroSwitch} from "./beolinkMacroSwitch-accessory";
import { MacroConfig, GatewayConfig } from './beolink-objects'
const PLATFORM_NAME = "homebridge-beolink-gateway";
import * as async from 'async';
import axios from "axios";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;

  api.registerPlatform(PLATFORM_NAME, BeolinkGatewayPlatform);
};

class BeolinkGatewayPlatform implements StaticPlatformPlugin {
  private readonly log: Logging;
  private readonly gateways: GatewayConfig[] = [];

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;

    async.each(config.gateways, ((gateway: any, callback: () => void) => {
      let autorizationHeader = Buffer.from(gateway.username + ":" + gateway.password).toString('base64');
      gateway.authHeader =  "{\"Authorization\": \"Basic "+autorizationHeader+"\"}";
      this.gateways.push(gateway)
      callback();
    }).bind(this));


    log.info("Beolink gateway finished initializing!");
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {

    let accessories: BeolinkMacroSwitch[] = [];
    let log = this.log;

    async.each(this.gateways, function(gateway: GatewayConfig, callbackEnd) {
      axios({
        method: 'get',
        url: gateway.url+"/a/model/zones",
        headers: JSON.parse(gateway.authHeader)
      }).then((response) => {
        if(response.status !== 200) { return; }
        var results = response.data;

        async.reduce(results.zones, {}, function(memo: any, item: any, callback) {
          memo[item.id] = item;
          callback(null, memo);
        }, function(error, zones: any) {
          if(error) { return; }
          axios({
            method: 'get',
            url: gateway.url+"/a/model/macros",
            headers: JSON.parse(gateway.authHeader)
          }).then((response) => {
            if(response.status !== 200) { return; }
            var marcos = response.data;

            async.each(marcos.macros, function(macro: any, callback) {
              accessories.push(new BeolinkMacroSwitch(hap, log, { id: macro.id, name: macro.name, zone: zones[macro.links.zone].address }, gateway));
              callback();
            }, function(err) {
              if(error) { callbackEnd(error); }
              callbackEnd();
            });
          })
        })
      });
    },(error) => {
      if(error) { return; }
      callback(accessories);
    });
  }
}
