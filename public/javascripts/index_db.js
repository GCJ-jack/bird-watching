const DB = 'SIGHTINGS';
const STORES = {
  sights: "sights",
  messages: "messages",
  all_sights: "all_sights"
}
let db;
const request = window.indexedDB.open(DB, 3);

/**
 * Handle the error event of indexedDB connection.
 */
request.onerror = function (event) {
  console.log("Database error: " + event.target.errorCode);
}

/**
 * Handle the success event of indexedDB connection.
 * If there is a callback function named onDBReady in window, it will be called.
 */
request.onsuccess = function (event) {
  db = event.target.result;
  if (window.onDBReady) {
    window.onDBReady();
  }
}

/**
 * Handle the upgradeneeded event of indexedDB connection.
 * In this event, it will create object stores defined in STORES constant if they don't exist.
 */
request.onupgradeneeded  = function(event) {
  db = event.target.result;
  for (const key in STORES) {
    if (!db.objectStoreNames.contains(key)) {
      let objectStore = db.createObjectStore(key, {keyPath: 'id'});
      console.log("Created new object store: " + key);
    }
  }

};

/**
 * Function: saveMessage
 * Description: Save a message in the 'messages' object store.
 * Input: A message that need to be saved
 * Output: A Promise which resolves if the operation is successful.
 */
function saveMessage(message) {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.messages], 'readwrite');
    let store = transaction.objectStore(STORES.messages);
    let addRequest = store.add(message);
    addRequest.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    addRequest.onsuccess = function (event) {
      resolve();
    }
  })
}

/**
 * Function: saveMessage
 * Description: try to save a message into the 'message' object.
 * Input: A message object to be saved.
 * Output: A Promise which resolves if the operation is successful.
 */
function getAllMessages() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.messages], 'readonly');
    let store = transaction.objectStore(STORES.messages);
    let cursor = store.openCursor();
    let sightings = [];
    cursor.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    cursor.onsuccess = function (event) {
      let cur = event.target.result;
      if (cur) {
        let data = cur.value;
        sightings.push(data);
        cur.continue();
      } else {
        resolve(sightings);
      }
    }
  })
}

/**
 * function to clear the message
 */
function clearAllMessages() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.messages], 'readwrite');
    let sightingsStore = transaction.objectStore(STORES.messages);
    let clearRequest = sightingsStore.clear();
    clearRequest.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    clearRequest.onsuccess = function (event) {
      resolve();
    }
  })
}

/**
 * Function: clearAllMessages
 * clear all the message from the 'message'
 */
function saveAllSights(sights) {
  sights = sights.map(sight => {
    sight.id = Math.ceil(Math.random() * 100000);
    return sight;
  })
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.all_sights], 'readwrite');
    let sightingsStore = transaction.objectStore(STORES.all_sights);
    let count = 0;
    for (let i = 0; i < sights.length; i ++) {
      let sight = sights[i];
      let addRequest = sightingsStore.add(sight);
      addRequest.onerror = function (event) {
        console.log("Error adding data: " + event.target.errorCode);
        reject(event.target.errorCode);
      }
      addRequest.onsuccess = function (event) {
        count ++;
        if (count === sights.length) {
          resolve();
        }
      }
    }

  })
}

/**
 * Function: clearAllSights
 * clear all the sighting from the 'all_sights' object store
 */
function clearAllSights() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.all_sights], 'readwrite');
    let sightingsStore = transaction.objectStore(STORES.all_sights);
    let clearRequest = sightingsStore.clear();
    clearRequest.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    clearRequest.onsuccess = function (event) {
      resolve();
    }
  })
}

/**
 * Function: getAllSights
 * retrieve all the sighting from the 'all_sight' object store
 */
function getAllSights() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.all_sights], 'readonly');
    let sightingsStore = transaction.objectStore(STORES.all_sights);
    let cursor = sightingsStore.openCursor();
    let sightings = [];
    cursor.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    cursor.onsuccess = function (event) {
      let cur = event.target.result;
      if (cur) {
        let data = cur.value;
        sightings.push(data);
        cur.continue();
      } else {
        resolve(sightings);
      }
    }
  })
}

/**
 * Function: saveNewSight
 * save a new sight from 'all_sight' object store
 */
function saveNewSight(sight) {

  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.sights], 'readwrite');
    let sightingsStore = transaction.objectStore(STORES.sights);
    let addRequest = sightingsStore.add(sight);
    addRequest.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    addRequest.onsuccess = function (event) {
      resolve();
    }
  })
}


/**
 * Function: getAllNewSight
 * Description: Retrieves all new sightings from the 'sights' object store.
 */
function getAllNewSight() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.sights], 'readonly');
    let sightingsStore = transaction.objectStore(STORES.sights);
    let cursor = sightingsStore.openCursor();
    let sightings = [];
    cursor.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    cursor.onsuccess = function (event) {
      let cur = event.target.result;
      if (cur) {
        let data = cur.value;
        sightings.push(data);
        cur.continue();
      } else {
        resolve(sightings);
      }
    }
  })
}

/**
 * function: clearAllSight
 * clear all the new sights from the 'sight' object stoer
 */
function clearAllSight() {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORES.sights], 'readwrite');
    let sightingsStore = transaction.objectStore(STORES.sights);
    let clearRequest = sightingsStore.clear();
    clearRequest.onerror = function (event) {
      console.log("Error adding data: " + event.target.errorCode);
      reject(event.target.errorCode);
    }
    clearRequest.onsuccess = function (event) {
      resolve();
    }
  })
}
