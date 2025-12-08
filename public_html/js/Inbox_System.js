//Parts of the Inbox System

//The Inbox Menu

//How to display each message, each sorted vertically

//The  mouse-over/on-click event of each message

//Creating the server-side database/archive for each user that each verified user can access

//A small option menu in each displayed message that contains the delete message function, the reply function, and a way to forward messges to another user, each containing a form.

//Amir: Edited this because it coinsides with my request system

//Amir:  Improved Inbox System

document.addEventListener("DOMContentLoaded", () => {

    const messageList = document.getElementById("message-list");

    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    const userId = parseInt(params.get("userId"));
    const userType = params.get("userType");

    const filterButtons = document.querySelectorAll(".filter-btn");

    let allMessages = [];
    let currentFilter = "all";

    function setFilter(filter) {
        currentFilter = filter;

        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        renderMessages();
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            setFilter(btn.dataset.filter);
        });
    });

    function renderMessages() {
        messageList.innerHTML = "";

        let filtered = allMessages;
        if (currentFilter === "in") {
            filtered = allMessages.filter(m => m.direction === "in");
        } else if (currentFilter === "out") {
            filtered = allMessages.filter(m => m.direction === "out");
        }

        if (filtered.length === 0) {
            messageList.innerHTML = "<p style='padding:10px;color:#666;'>No messages in this view.</p>";
            return;
        }

        filtered.forEach((m, index) => {
            const item = document.createElement("div");
            item.classList.add("msg-item");
            item.dataset.index = index;

            const isInbox = (m.direction === "in");
            const badgeClass = isInbox ? "badge-in" : "badge-out";
            const badgeText = isInbox ? "Inbox" : "Sent";

            const otherParty =
                (userId === m.senderId)
                    ? (m.recipientName || `User #${m.recipientID}`)
                    : (m.senderName || `User #${m.senderId}`);

            const previewText = m.msgText.replace(/\s+/g, " ").substring(0, 80);

            item.innerHTML = `
                <div class="msg-header-line">
                    <span class="msg-title">
                        ${otherParty} — ${m.petName ? "Regarding: " + m.petName : "Message"}
                    </span>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>

                <div class="msg-meta">
                    From: ${m.senderName || "Unknown"} &nbsp; | &nbsp;
                    To: ${m.recipientName || ("User #" + m.recipientID)}
                </div>

                <div class="msg-preview">${previewText}...</div>

                <div class="msg-body hidden">
                    <p>${m.msgText.replace(/\n/g, "<br>")}</p>

                    <button class="reply-btn">Reply</button>

                    <div class="reply-box hidden">
                        <textarea class="reply-text" placeholder="Write your reply..."></textarea>
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
                if (
                    e.target.classList.contains("reply-btn") ||
                    e.target.classList.contains("send-reply-btn") ||
                    e.target.classList.contains("reply-text")
                ) {
                    return;
                }

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

                const index = parseInt(item.dataset.index);
                const msg = getMessageByFilterIndex(index);

                const replyTextElem = item.querySelector(".reply-text");
                const replyText = replyTextElem.value.trim();

                if (!replyText) {
                    alert("Reply cannot be empty.");
                    return;
                }

                let recipientId;
                if (userId === msg.senderId) {
                    recipientId = msg.recipientID;
                } else {
                    recipientId = msg.senderId;
                }

                const body = new URLSearchParams();
                body.append("senderId", userId);
                body.append("recipientId", recipientId);
                body.append("petId", msg.petId);
                body.append("msgText", replyText);

                try {
                    const res = await fetch("/api/sendReply", {
                        method: "POST",
                        body: body
                    });

                    const resultText = (await res.text()).trim();
                    console.log("Reply result:", resultText);

                    if (resultText === "ok") {
                        alert("Reply sent!");
                        replyTextElem.value = "";
                        item.querySelector(".reply-box").classList.add("hidden");
                        loadInboxFromServer();
                    } else {
                        alert("Reply failed: " + resultText);
                    }
                } catch (err) {
                    console.error("Reply error:", err);
                    alert("Reply failed (network error).");
                }
            });
        });
    }

    function getMessageByFilterIndex(idxInFiltered) {
        let filtered = allMessages;
        if (currentFilter === "in") {
            filtered = allMessages.filter(m => m.direction === "in");
        } else if (currentFilter === "out") {
            filtered = allMessages.filter(m => m.direction === "out");
        }
        return filtered[idxInFiltered];
    }

    function loadInboxFromServer() {
        fetch(`/api/getInbox?username=${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(data => {

                allMessages = data.map(row => ({
                    messageId: row.messageId,
                    msgText: row.msgText,
                    petName: row.petName,
                    petId: row.petId,
                    senderId: row.senderId,
                    recipientID: row.recipientID,
                    senderName: row.senderName,
                    recipientName: row.recipientName,
                    direction: row.direction
                }));

                renderMessages();
            })
            .catch(err => {
                console.error("Inbox load error:", err);
                messageList.innerHTML = "<p style='padding:10px;color:#c00;'>Error loading messages.</p>";
            });
    }

    loadInboxFromServer();
});
