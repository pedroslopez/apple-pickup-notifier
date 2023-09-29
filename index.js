const fs = require('fs');
const yaml = require('yaml')
const axios = require('axios').default;
const { sendNotification } = require("./notify");

const config = yaml.parse(fs.readFileSync('./config.yml', 'utf8'));

const checkAvailability = async () => {
  const partParams = config.parts.map(p => p.partNumber).reduce(
    (acc, val, idx) => {
      acc[`parts.${idx}`] = val; 
      return acc;
    }, {}
  );

  const { data, config: x } = await axios.get(`https://www.apple.com/shop/fulfillment-messages`, { 
    params: {
      cppart: config.cppart, 
      location: config.location,
      pl: true,
      "mts.0": "compact",
      ...partParams
    }
  });

  const stores = data.body.content.pickupMessage.stores;
  const store = stores.find(s => s.storeNumber == config.storeNumber);

  const res = [];
  for(const part of Object.keys(store.partsAvailability)) {
    const availability = {
      ...store.partsAvailability[part],
      ...store.partsAvailability[part].messageTypes.compact
    };

    const available = availability.storeSelectionEnabled;
    res.push({part, available, data: availability});
  }

  return res;
}

const availabilityMap = {};

const loop = async () => {
  console.log("Checking availability...");

  const availabilityList = await checkAvailability();
  for(const {part, available, data} of availabilityList) {
    console.log(`(${part}) ${data.storePickupProductTitle} ${data.pickupDisplay} at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

    let wasAvailable = availabilityMap[part];
    let isAvailable = availabilityMap[part];

    if(available) {
      if(wasAvailable && !config.notifications.alwaysNotify) {
        continue;
      }
      console.log("Notifying due to availability change");
      await sendNotification({
        title: "Available for pickup", 
        message: `${data.storePickupQuote}: ${data.storePickupProductTitle}`, 
        priority: 1
      });
      isAvailable = true;
    } else {
      if(!wasAvailable && !config.notifications.alwaysNotify) {
        continue;
      }
      console.log("Notifying due to availability change");
      await sendNotification({
        title: "Unavailable for pickup", 
        message: `${data.storePickupQuote}: ${data.storePickupProductTitle}`,
      });
      isAvailable = false;
    }

    availabilityMap[part] = isAvailable;
  }
}

setInterval(loop, config.interval);
loop();
//&cppart=UNLOCKED/US&parts.0=MLTP3LL/A&location=Boca%20Raton,%20FL