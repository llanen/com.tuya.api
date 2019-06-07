"use strict";

const Homey = require("homey");

class MyDriver extends Homey.Driver {
  onInit() {
    this.log("MyDriver has been inited");
  }

  onPairListDevices(data, callback) {
    callback(null, [
      {
        name: "Test Device",
        data: {
          id: "id_found",
          key: "key_found"
        }
      }
    ]);
  }
}

module.exports = MyDriver;
