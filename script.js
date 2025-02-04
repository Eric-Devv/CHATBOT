const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your OpenAI API key

const inputInitHeight = chatInput.scrollHeight;

// Function to create a chat <li> element
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent =
        className === "outgoing"
            ? `<p>${message}</p>`
            : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

// Function to generate a response from the OpenAI API
const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = incomingChatLi.querySelector("p");

    // Define the request options for the API
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        }),
    };

    // Send POST request to the API
    fetch(API_URL, requestOptions)
        .then((res) => res.json())
        .then((data) => {
            if (data.choices && data.choices[0].message.content) {
                messageElement.textContent = data.choices[0].message.content;
            } else {
                throw new Error("Invalid response from the API");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            messageElement.classList.add("error");
            messageElement.textContent =
                "Oops! Something went wrong. Please try again. Also not to forget that the program is under maintenance";
        })
        .finally(() => {
            chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
        });
};

// Function to handle chat input and responses
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear the input and reset its height
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });

    // Display "Thinking..." message while waiting for the response
    setTimeout(() => {
        const incomingChatLi = createChatLi("Encoding...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
        generateResponse(incomingChatLi);
    }, 600);
};

// Adjust the height of the input textarea based on its content
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Handle Enter key press
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

// Send button click event
sendChatBtn.addEventListener("click", handleChat);

// Toggle chatbot visibility
chatToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
});

// Close chatbot
chatbotCloseBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
});