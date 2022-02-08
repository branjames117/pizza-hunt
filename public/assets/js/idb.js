// create variable to hold db connection
let db;

// establish connection to IndexedDB database called 'pizza_hunt' and set to version 1
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the db version changes (nonexistent to v1 ,v1 to v2, etc.)
request.onupgradeneeded = function (e) {
  // save a reference to the database
  const db = e.target.result;

  // create an object store (table) called `new_pizza`, set it to have an autoincrementing primary key of sorts
  db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    uploadPizza();
  }
};

request.onerror = function (e) {
  console.log(e.target.errorCode);
};

// execute if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the db with read/write permissions
  const transaction = db.transaction(['new_pizza'], 'readwrite');

  // access the object store for `new_pizza`
  const pizzaObjectStore = transaction.objectStore('new_pizza');

  // add record to your store with add method
  pizzaObjectStore.add(record);
}

function uploadPizza() {
  // open a transaction on your db
  const transaction = db.transaction(['new_pizza'], 'readwrite');

  // access object store
  const pizzaObjectStore = transaction.objectStore('new_pizza');

  // get all records from store and set to a variable
  const getAll = pizzaObjectStore.getAll();

  // upon a succesful .getAll() execution...
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, send to api server
    if (getAll.result.length > 0) {
      fetch('/api/pizzas', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_pizza'], 'readwrite');

          // access the new pizza object store
          const pizzaObjectStore = transaction.objectStore('new_pizza');

          // clear all items in the store
          pizzaObjectStore.clear();

          alert('All saved pizzas have been submitted!');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);
