//Parts of the Inbox System

//The Inbox Menu

//How to display each message, each sorted vertically

//The  mouse-over/on-click event of each message

//Creating the server-side database/archive for each user that each verified user can access

//A small option menu in each displayed message that contains the delete message function, the reply function, and a way to forward messges to another user, each containing a form.


document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messageList = document.getElementById('message-list');

    let messages = []; // Array to store messages (in-memory)

    // Function to render all messages
    function renderMessages() {
        messageList.innerHTML = ''; // Clear current list
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `
                <strong>${message.sender}</strong>
                <p>${message.text}</p>
                <span>${new Date(message.timestamp).toLocaleTimeString()}</span>
            `;
            messageList.appendChild(messageElement);
        });
        // Optional: auto-scroll to the latest message
        messageList.scrollTop = messageList.scrollHeight;
    }

    // Function to add a new message
    function addMessage(text, sender = 'You') {
        const newMessage = {
            id: Date.now(), // Simple unique ID
            text,
            sender,
            timestamp: new Date()
        };
        messages.push(newMessage);
        renderMessages(); // Re-render the list
    }

    // Handle form submission
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText) {
            addMessage(messageText);
            messageInput.value = ''; // Clear input field
        }
    });

    // Add some initial dummy messages
    addMessage('Welcome to your inbox!', 'Admin');
    addMessage('How are you today?', 'Friend');
});
