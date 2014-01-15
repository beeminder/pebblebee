var initialized = false;
var configUrl = 'https://www.beeminder.com/pebblebee-config.html';

Pebble.addEventListener("ready", function(e) {
  console.log("Connect! " + e.ready);
  initialized = true;
});

Pebble.addEventListener("showConfiguration", function(e) {
  console.log("Configuration window launching");
  Pebble.openURL(configUrl + '?_=' + new Date().getTime() );
});

Pebble.addEventListener("appmessage", function(e) {
  console.log("Received message: type " + e.payload.message_type);
  switch(e.payload.message_type) {
  case 100:
    saveBatteryValue(e);
    break;
  case 103:
    sendTimezoneToWatch();
    break;
  }
});

function saveBatteryValue(e) {
  console.log("Battery: "   + e.payload.send_batt_percent + 
              "%, Charge: " + e.payload.send_batt_charging + 
              ", Plugged: " + e.payload.send_batt_plugged);
  // store these in localStorage along with a date object in some useful manner?
}

// better version at 
// https://developer.getpebble.com/blog/2013/12/20/Pebble-Javascript-Tips-and-Tricks/
function sendTimezoneToWatch() {
  var offsetHours = new Date().getTimezoneOffset() / 60;
  // 5 means GMT-5, -5 means GMT+5 ... -12 through +14 are the valid options
  Pebble.sendAppMessage({ message_type: 103, timezone_offset: offsetHours },
    function(e) {
      console.log("Sent TZ message (" + offsetHours + ") with transactionId=" + 
                  e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver TZ message with transactionId=" + 
                  e.data.transactionId + " Error is: " + e.error.message);
    }
  );
}

Pebble.addEventListener("webviewclosed", function(e) {
  console.log("Configuration closed");
  var options = JSON.parse(decodeURIComponent(e.response));
  console.log("Options = " + JSON.stringify(options));
  var transactionId = Pebble.sendAppMessage(options,
    function(e) {
      console.log("Successfully delivered message with transactionId=" + 
                  e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver message with transactionId=" + 
                  e.data.transactionId + " Error is: " + e.error.message);
    }
  );
});
