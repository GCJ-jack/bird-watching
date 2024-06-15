//create the socket connection
const socket = io(
  {
    transports: ['websocket'], upgrade: false
  }
);

// Define a flag to indicate whether the user is offline
let offline = true;

// Get the current URL
const url = window.location.href;

// Split the URL into segments
const urlSplits = url.split('/');
const sightId = urlSplits[urlSplits.length - 1];

// Send a joinSession event to the server with the sight ID
socket.emit('joinSession', sightId);

/**
 * Event: updateMessages
 * Description: Receives updated messages from the server and render them on the page
 */
socket.on('updateMessages', (dataStr) => {
  const messages = JSON.parse(dataStr);

  renderMessages(messages);
});

/**
 * Event handler for the 'connect' event of a socket.
 * Sets the offline flag to false and logs a message indicating that the socket is online.
 */
socket.on('connect', () => {
  offline = false;
  console.log('socket online');
})

/**
 * Event handler for the 'disconnect' event of a socket.
 * Displays an alert indicating that the user is disconnected and sets the offline flag to true.
 */
socket.on("disconnect", () => {
  alert('You are disconnect')
  offline = true;
});

/**
 * Event listener for the 'offline' event of the window object.
 * Sets the offline flag to true when the user goes offline.
 */
window.addEventListener('offline', function () {
  console.log('offline ---------------')
  offline = true;
})
/**
 * Event listener for the 'online' event of the window object.
 * Sets the offline flag to false when the user comes back online.
 */
window.addEventListener('online', function () {
  console.log('online -------------------')
  offline = false;
})

/**
 * Renders the chat history on the web page.
 * @param {Array} messages - The array of messages to render.
 */
function renderMessages(messages) {
  console.log('render messages' ,messages)
  messages = messages.sort((prev, next) => {
    return new Date(next.createdAt).getTime() - new Date(prev.createdAt).getTime();
  });
  let innerHTML = '';
  messages.forEach(message => {
    innerHTML += `
    <li class="list-group-item">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-circle me-2" style="font-size: 30px"></i>
                            <h5 class="m-0">${message.sender}</h5>
                        </div>
                        <p class="mt-3">
                            ${message.message}
                        </p>
                        <cite>Publish at ${new Date(message.createdAt).toLocaleString()}</cite>
                    </li>
    `;
  })
  document.querySelector('#messages').innerHTML = innerHTML;
}

const messageInput = document.querySelector('#message');
const messageSendButton = document.querySelector('#message-send');
const senderInput = document.querySelector('#sender');

// Event listener for the message send button click
messageSendButton.addEventListener('click', () => {
  const message = messageInput.value;
  const sender = senderInput.value || '';
  if (!message.trim()) {
    alert("You must enter an valid message!");
    return;
  }

  console.log('offline', offline);
  if (!offline) {
    socket.emit('sendMessage', JSON.stringify({
      sightId: sightId,
      message,
      sender
    }));
  } else {
    console.log('save to local')
    saveMessage({
      sightId: sightId,
      message,
      sender,
      id: Math.ceil(Math.random() * 100000)
    }).then(() => {
      alert("You are now in offline, the message saved to local, when you retry online, it will be sent to server!");
      onDBReady();
    })
  }


  messageInput.value = '';
  senderInput.value = '';
});


/**
 * Performs necessary operations when the local database is ready.
 * - If online, sends any pending messages to the server and clears the local database.
 * - If offline, renders the messages for the current sight from the local database.
 */
async function onDBReady() {
  const messages = await getAllMessages();

  if (!offline && Array.isArray(messages) && messages.length > 0) {
    messages.forEach(message => {
      socket.emit('sendMessage', JSON.stringify(message));
    });
    clearAllMessages();
  }
  if (offline) {
    const messagesOfSight = messages.filter(message => {
      return message.sightId === sightId;
    })
    renderMessages(messagesOfSight);
  }
}