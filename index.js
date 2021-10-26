const axios = require('axios').default;
const { sendNotification } = require("./notify");

const store = "Boca Raton, FL";
const part = "MLTP3LL/A";
const cppart = "UNLOCKED/US"

const checkAvailability = async () => {
  const { data } = await axios.get(`https://www.apple.com/shop/fulfillment-messages`, { 
    params: {
      cppart, 
      "parts.0":part, 
      location: store,
      pl: true,
      mt: "compact"
    }
  });

  const stores = data.body.content.pickupMessage.stores;
  const bocaStore = stores.find(s => s.storeName === "Boca Raton");
  const availability = bocaStore.partsAvailability[part];
  const available = availability.storeSelectionEnabled;

  return {available, data: availability};
}

let isAvailable = false;

const loop = async () => {
  console.log("Checking availability...");
  const {available, data} = await checkAvailability();
  console.log(`${data.storePickupProductTitle} ${data.pickupDisplay} at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

  if(available && !isAvailable) {
    console.log("Notifying due to availability change");
    await sendNotification({
      title: "Available for pickup", 
      message: `${data.storePickupQuote}: ${data.storePickupProductTitle}`, 
      url: "https://www.apple.com/shop/buy-iphone/iphone-13-pro/6.1-inch-display-128gb-graphite-unlocked",
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
}

setInterval(loop, 10000);
loop();
checkAvailability();
//&cppart=UNLOCKED/US&parts.0=MLTP3LL/A&location=Boca%20Raton,%20FL