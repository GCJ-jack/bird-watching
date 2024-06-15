// Function to calculate distance between two geographical coordinates
function distance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;// Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);// Difference in latitude converted to radians
  const dLon = toRadians(lon2 - lon1);// Difference in longitude converted to radians

  // Haversine formula to calculate the great-circle distance between two points on a sphere from their longitudes and latitudes
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;

  return distance;
}

// Function to convert degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Variables to store whether identified and not identified sights should be displayed
let identified = true;
let not_identified = true;

// Object to store the current sorting option for both datetimeSeen and distance
const sortBy = {
  datetimeSeen: null,
  distance: null
}

// Selecting the buttons for sorting and adding click event listeners to them
const sortDatetimeSeenButton = document.querySelector('#sort-datetime-seen');
const sortDatetimeSeenIcon = document.querySelector('#sort-date-time-seen-icon');
sortDatetimeSeenButton.addEventListener('click', () => {
  if (!sortBy.datetimeSeen) {
    sortBy.datetimeSeen = 'desc';
  } else if (sortBy.datetimeSeen === 'desc') {
    sortBy.datetimeSeen = 'asc';
  } else if (sortBy.datetimeSeen === 'asc') {
    sortBy.datetimeSeen = null;
  }
  renderSights();
  renderSortButtons();
});

// Similarly for sorting by distance
const sortDistanceButton = document.querySelector('#sort-distance');
const sortDistanceIcon = document.querySelector('#sort-distance-icon');
sortDistanceButton.addEventListener('click', () => {
  if (!sortBy.distance) {
    sortBy.distance = 'asc';
  } else if (sortBy.distance === 'asc') {
    sortBy.distance = 'desc';
  } else if (sortBy.distance === 'desc') {
    sortBy.distance = null;
  }
  renderSights();
  renderSortButtons();
});

// Function to render sort buttons based on the current sort order
function renderSortButtons() {
  // render datetime seen sort button
  sortDatetimeSeenIcon.classList.remove('bi', 'bi-list', 'bi-sort-down', 'bi-sort-up');
  if (!sortBy.datetimeSeen) {
    sortDatetimeSeenIcon.classList.add('bi', 'bi-list');
  }
  if (sortBy.datetimeSeen === 'desc') {
    sortDatetimeSeenIcon.classList.add('bi', 'bi-sort-down');
  }
  if (sortBy.datetimeSeen === 'asc') {
    sortDatetimeSeenIcon.classList.add('bi', 'bi-sort-up');
  }

  // render distance sort button
  sortDistanceIcon.classList.remove('bi', 'bi-list', 'bi-sort-down', 'bi-sort-up');
  if (!sortBy.distance) {
    sortDistanceIcon.classList.add('bi', 'bi-list');
  }
  if (sortBy.distance === 'asc') {
    sortDistanceIcon.classList.add('bi', 'bi-sort-up');
  }
  if (sortBy.distance === 'desc') {
    sortDistanceIcon.classList.add('bi', 'bi-sort-down');
  }

}

// Selecting the checkboxes and adding change event listeners to them
const identifiedCheckBox = document.querySelector('#identification');
const not_identifiedCheckBox = document.querySelector('#not-identification');
identifiedCheckBox.addEventListener('change', function (e) {
  if (e.target.checked) {
    identified = true;
  } else {
    identified = false;
  }
  renderSights();
});
not_identifiedCheckBox.addEventListener('change', function (e) {
  if (e.target.checked) {
    not_identified = true;
  } else {
    not_identified = false;
  }
  renderSights();
});

function renderSights() {
  let filteredSights = allSights;
  filteredSights = filteredSights.filter(sight => {
    if (identified && sight.identification) {
      return true;
    }
    if (not_identified && !sight.identification) {
      return true;
    }
    return false;
  });


  if (sortBy.datetimeSeen) {
    filteredSights.sort((prev, next) => {
      if (sortBy.datetimeSeen === 'asc') {
        return new Date(prev.datetime).getTime() - new Date(next.datetime).getTime();
      } else {
        return new Date(next.datetime).getTime() - new Date(prev.datetime).getTime();
      }
    });
  }

  if (sortBy.distance) {
    filteredSights.sort((prev, next) => {
      const dis = distance(prev.geolocation.latitude, prev.geolocation.longitude, next.geolocation.latitude, next.geolocation.longitude);

      if (sortBy.distance === 'asc') {
        return dis;
      } else {
        return -dis;
      }
    });
  }

  let innerHTML = '';
  filteredSights.forEach(sight => {
    innerHTML += `
      <a href="/bird_sight/${sight._id}" class="col-12 col-lg-4 mb-2">
           <img class="w-100 rounded rounded-2" src="${sight.photo}"/>
      </a>
    `;
  })

  document.querySelector('#sights').innerHTML = innerHTML;


}
const socket = io(
  {
    transports: ['websocket'], upgrade: false
  }
);
let allSights = [];
let offline = true;
socket.on('connect', () => {
  offline = false;
  console.log('socket online');
})
socket.on("disconnect", () => {
  alert('You are disconnect')
  offline = true;
});

/**
 * Event handler for handling offline
 */
async function handleOffline() {
  const homeSights = await getAllSights();
  const addedSights = await getAllNewSight();
  console.log('news', addedSights)
  const temp = [...homeSights, ...addedSights].reverse();
  allSights.push(...temp);

  renderSights();
}

// Event listener for detecting offline state
window.addEventListener('offline', function () {
  console.log('offline ---------------')
  offline = true;
})

// Event listener for detecting online state
window.addEventListener('online', function () {
  console.log('online -------------------')
  offline = false;
})

/**
 * function to handle the database
 */
function onDBReady() {
  setTimeout(() => {
    if (!offline) {
      fetch('/sights')
        .then(res => res.json())
        .then( async data => {
          allSights = data;
          renderSights();
          await clearAllSights();
          await saveAllSights(allSights);
        })
        .catch(async err => {
          console.log('is offline')
          handleOffline();
        })


      getAllNewSight()
        .then(sights => {
          if (Array.isArray(sights) && sights.length > 0) {
            fetch('/sights/many', {
              method: 'POST',
              body: JSON.stringify(sights),
              headers: {
                'Content-Type': 'application/json'
              }
            }).then(res => {
              if (res.status === 201) {
                alert("Have sync all sight from local to server!");
                window.location.reload();
                clearAllSight()
                  .then(res => {
                    console.log("Clear successfully!");
                  })
              }
            }).catch(err => {
            })
          }

        }).catch(err => {
        console.log(err)
      })
    } else {
      console.log('offline')
      handleOffline();
    }
  }, 1000);

}
