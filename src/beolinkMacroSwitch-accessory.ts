import {
  AccessoryPlugin,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes
} from "homebridge";

import axios from 'axios';

import { MacroConfig, GatewayConfig } from './beolink-objects'

export class BeolinkMacroSwitch implements AccessoryPlugin {

  private readonly log: Logging;

  // This property must be existent!!
  name: string;
  url: string;
  urlHeaders: any;
  macro: MacroConfig;
  gateway: GatewayConfig

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(hap: HAP, log: Logging, macro: MacroConfig, gateway: GatewayConfig) {
    this.log = log;
    this.macro = macro;
    this.gateway = gateway;

    this.name = gateway.prefix+" "+macro.name;
    this.url = gateway.url+'/a/exe/'+macro.zone+'/MACRO/'+macro.name+'/FIRE' || "";

    this.switchService = new hap.Service.Switch(this.name);
    this.switchService.getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info("Get state for marco: " + this.name);
        callback(undefined, false);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        log.info("Change state for marco: " + this.name);
        //Should only trigger the macro when it is turned on.
        if(!value) {
          callback(null, false);
          return;
        }

        //Fire and forget the marco on the gateway
        axios({
          method: 'get',
          url: this.url ,
          headers: JSON.parse(gateway.authHeader)
        }).then((response) => {

        }).catch(((error: { message: string; }) => {
          this.log.info("Error for marco: " + this.name + "-" + error.message);
        }).bind(this));


        //Always turn it off after a second.
        setTimeout((() => {
          this.switchService.updateCharacteristic(hap.Characteristic.On, false);
        }).bind(this), 1000);

        callback(null, true);
      });

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "B&O")
      .setCharacteristic(hap.Characteristic.Model, "Beolink macro")
      .setCharacteristic(hap.Characteristic.SerialNumber, this.macro.id);

    log.info("Beolink macro '%s' is created!", this.name);
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
    ];
  }

}
