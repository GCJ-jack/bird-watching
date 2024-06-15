// Grabbing the form used to add bird sightings
const addForm = document.querySelector('#add-form');
/**
 * Event: Submit
 * Description: Handles the form submission event
 */
addForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Check if photo is uploaded, if not alert the user
  if (!photo) {
    alert("You must upload the bird photo you shoot!");
    return;
  }
  // Check if geolocation is fetched, if not alert the user
  if (!geolocation) {
    alert("You should firstly get your location!");
    return;
  }

  // Construct the data object to be sent to the server
  const data = {
    author: addForm.elements['name'].value,
    datetime: addForm.elements['datetime'].value,
    description: addForm.elements['description'].value,
    identification: addForm.elements['identification'].value,
    DBPediaURL: addForm.elements['DBPediaURL'].value,
    scientificName: addForm.elements['scientificName'].value,
    DBPediaDescription: addForm.elements['DBPediaDescription'].value,
    geolocation,
    photo,
    id: Math.ceil(Math.random() * 1000000)
  };

  /**
   * Make a POST request to the server with the form data.
   * If the request is successful (status 201), alert the user and reload the page.
   * If the request fails, save the new sight data locally and alert the user.
   */
  fetch('/sights', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.status === 201) {
      alert("Add sucessfully!");
      window.location.reload();
    }
  }).catch(err => {
    saveNewSight(data)
      .then(() => {
        alert("Save new sight to local successfully! When you online again, it will sync to server");
        addForm.reset();
      })
      .catch(err => {
        console.log(err);
      })
  })
});

// Define a variable to hold the geolocation
let geolocation;
/**
 * Event: Click
 * Description: Fetches the geolocation when the "get location" button is clicked
 */
const getLocationButton = document.querySelector('#get-location');
getLocationButton.addEventListener('click', () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      geolocation = {
        latitude,
        longitude
      }
      console.log(geolocation)
      renderGeoLocation();
    });
  } else {
    console.log('get position fail')
  }

})


/**
 * Function: renderGeoLocation
 * Description: Displays the fetched geolocation on the UI
 */
function renderGeoLocation() {
  document.querySelector('#geolocation')
    .innerHTML = `Latitude: ${geolocation.latitude}, Longitude: ${geolocation.longitude}`;
}

// Define a variable to hold the photo
let photo;
/**
 * Event: Change
 * Description: Handles the event when a new photo is selected.
 * It reads the file as a data URL, then displays it in the UI.
 */
const photoFileInput = document.querySelector('#photo');
photoFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    photo = reader.result;
    document.querySelector('#photo-placeholder').classList.add('d-none');
    document.querySelector('#photo-result').classList.remove('d-none');
    document.querySelector('#photo-result').src = photo;
  });
  reader.readAsDataURL(file);
});

/**
 * Event: Input
 * Description: Handles the event when the identification input changes.
 * It fetches bird data from the server that matches the input.
 */
let queryTimer = null;
document.querySelector('#identification')
  .addEventListener('input', function (e) {
     clearTimeout(queryTimer);
     queryTimer = setTimeout(() => {
       fetch(`/sights/query/${e.target.value}`)
         .then(res => res.json())
         .then(data => {
            if (data && data.length > 0) {
              const item = data[0];
              document.querySelector('#scientificName')
                .value = item.scientificName;
              document.querySelector('#DBPediaDescription')
                .value = item.description;
              document.querySelector('#DBPediaURL')
                .value = item.uri;
            } else {
              document.querySelector('#scientificName')
                .value = '';
              document.querySelector('#description')
                .value = '';
              document.querySelector('#DBPediaURL')
                .value = '';
            }
         })
     }, 500);
  });

function onDBReady() {

}


