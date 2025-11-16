//Parts of the Inbox System

//The Inbox Menu

//How to display each message, each sorted vertically

//The  mouse-over/on-click event of each message

//Creating the server-side database/archive for each user that each verified user can access

//A small option menu in each displayed message that contains the delete message function, the reply function, and a way to forward messges to another user, each containing a form.

// Inbox System – Clean Fixed Version


//Amir: Edited this because it coinsides with my request system
document.addEventListener("DOMContentLoaded", () => {

    const messageList = document.getElementById("message-list");

    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    const userId = parseInt(params.get("userId"));
    const userType = params.get("userType");

    let messages = [];

    function renderMessages() {
        messageList.innerHTML = "";

        messages.forEach((m, index) => {
            const item = document.createElement("div");
            item.classList.add("msg-item");
            item.dataset.index = index;

            item.innerHTML = `
                <div class="msg-header">
                    <strong>${m.senderName}</strong>
                    <span>${m.petName ? "Regarding: " + m.petName : ""}</span>
                </div>

                <div class="msg-preview">${m.msgText.substring(0, 60)}...</div>

                <div class="msg-body hidden">
                    <p>${m.msgText.replace(/\n/g, "<br>")}</p>

                    <button class="reply-btn">Reply</button>

                    <div class="reply-box hidden">
                        <textarea class="reply-text" placeholder="Write your reply..." style="width:100%;height:80px;"></textarea>
                        <button class="send-reply-btn">Send Reply</button>
                    </div>
                </div>
            `;

            messageList.appendChild(item);
        });

        attachEvents();
    }

    function attachEvents() {
        const items = document.querySelectorAll(".msg-item");

        items.forEach(item => {

            item.addEventListener("click", (e) => {
                if (e.target.classList.contains("reply-btn") ||
                    e.target.classList.contains("send-reply-btn") ||
                    e.target.classList.contains("reply-text")) return;

                const body = item.querySelector(".msg-body");

                document.querySelectorAll(".msg-body").forEach(b => b.classList.add("hidden"));
                body.classList.remove("hidden");

                document.querySelectorAll(".reply-box").forEach(r => r.classList.add("hidden"));
            });

            item.querySelector(".reply-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".reply-box").forEach(r => r.classList.add("hidden"));
                item.querySelector(".reply-box").classList.remove("hidden");
            });

            item.querySelector(".send-reply-btn").addEventListener("click", async (e) => {
                e.stopPropagation();

                const index = item.dataset.index;
                const msg = messages[index];
                const replyText = item.querySelector(".reply-text").value.trim();

                if (!replyText) {
                    alert("Reply cannot be empty.");
                    return;
                }

                let recipientId;

                if (userType === "Pet Owner") {
                    recipientId = msg.senderId;
                } else {
                    recipientId = msg.ownerId;
                }

                console.log("DEBUG SEND:", {
                    senderId: userId,
                    recipientId: recipientId,
                    petId: msg.petId,
                    msgText: replyText
                });

                const body = new URLSearchParams();
                body.append("senderId", userId);
                body.append("recipientId", recipientId);
                body.append("petId", msg.petId);
                body.append("msgText", replyText);

                const res = await fetch("/api/sendReply", {
                    method: "POST",
                    body: body
                });

                const result = (await res.text()).trim();
                console.log("Reply result:", result);

                if (result === "ok") {
                    alert("Reply sent!");
                    item.querySelector(".reply-text").value = "";
                    item.querySelector(".reply-box").classList.add("hidden");
                    loadInboxFromServer();
                } else {
                    alert("Reply failed: " + result);
                }
            });
        });
    }

    function loadInboxFromServer() {
        fetch(`/api/getInbox?username=${username}`)
            .then(res => res.json())
            .then(data => {

		messages = data.map(row => ({
		    messageId: row.messageId,
		    msgText: row.msgText,
		    petName: row.petName,
		    petId: row.petId,
		    senderId: row.senderId,
		    senderName: row.senderName,
		    ownerId: row.ownerId
		}));

                renderMessages();
            })
            .catch(err => console.error("Inbox load error:", err));
    }

    loadInboxFromServer();
});
