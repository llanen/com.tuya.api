"use strict";

const Homey = require("homey");
const TuyAPI = require("tuyapi");

let device;

class MyDevice extends Homey.Device {
  onInit() {
    this.log("Device init");
    this.log("Name:", this.getName());
    this.log("Class:", this.getClass());
    this.log("id:", this.getData().id);
    this.log("ip:", this.getData().ip);

    this.device = new TuyAPI({
      id: this.getData().id,
      key: this.getData().key
    });

    this.setUnavailable(Homey.__("device.connecting"));

    // Add event listeners
    this.device.on("connected", () => {
      console.log("Connected to device!");
      this.setAvailable();

      // Disconnect after 5 minutes seconds
      setTimeout(() => {
        this.device.disconnect();
      }, 300000);
    });

    this.device.on("disconnected", () => {
      console.log("Disconnected from device.");
      this.setUnavailable(Homey.__("device.disconnected"));
      this.connectToDevice();
    });

    this.device.on("error", error => {
      console.log("Error!", error);
    });

    this.device.on("data", data => {
      console.log("Data from device:", data);

      if (data && data.dps) {
        const status = data.dps["1"];
        console.log(`Boolean status of default property: ${status}.`);
        this.setCapabilityValue("onoff", status).catch(this.error);
      }
    });

    this.connectToDevice();

    // register a capability listener
    this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));
  }

  // this method is called when the Device has requested a state change (turned on or off)
  async onCapabilityOnoff(value, opts) {
    console.log("onCapabilityOnoff value:" + value);

    this.device.set({ set: value });
  }

  connectToDevice() {
    // Find device on network
    this.device
      .find()
      .then(() => {
        // Connect to device
        this.device.connect();
      })
      .catch(err => {
        // Handle any error that occurred in any of the previous
        // promises in the chain.
        console.log("couldn't find device");
        console.log(err);
        this.setUnavailable(Homey.__("device.not_found"));

        // Retry after 10 seconds
        setTimeout(() => {
          this.connectToDevice();
        }, 10000);
      });
  }

  onDeInit() {
    console.log("DeInit disconnect from device");
    this.device.disconnect();
  }
}

module.exports = MyDevice;
