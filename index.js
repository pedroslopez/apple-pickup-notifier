const axios = require('axios').default;
const { sendNotification } = require("./notify");

const store = "Boca Raton, FL";
const parts = ["MLTP3LL/A", "MLTW3LL/A", "MLTT3LL/A", "MLU03LL/A"];
const cppart = "UNLOCKED/US"

const checkAvailability = async () => {
  const partParams = parts.reduce(
    (acc, val, idx) => {
      acc[`parts.${idx}`] = val; 
      return acc;
    }, {}
  );

  const { data } = await axios.get(`https://www.apple.com/shop/fulfillment-messages`, { 
    params: {
      cppart, 
      location: store,
      pl: true,
      mt: "compact",
      ...partParams
    }
  });

  const stores = data.body.content.pickupMessage.stores;
  const bocaStore = stores.find(s => s.storeName === "Boca Raton");

  const res = [];
  for(const part of Object.keys(bocaStore.partsAvailability)) {
    const availability = bocaStore.partsAvailability[part];
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

    let isAvailable = availabilityMap[part];

    if(available && !isAvailable) {
      console.log("Notifying due to availability change");
      await sendNotification({
        title: "Available for pickup", 
        message: `${data.storePickupQuote}: ${data.storePickupProductTitle}`, 
        priority: 1
      });
      isAvailable = true;
    }
  
    if(!available && isAvailable) {
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

setInterval(loop, 10000);
loop();
//&cppart=UNLOCKED/US&parts.0=MLTP3LL/A&location=Boca%20Raton,%20FL