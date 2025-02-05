const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector("#send-btn"); // Fixed selector to match HTML
const chatbox = document.querySelector(".chatbox");
const chatToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

const API_KEY = ""; // 🚨 Security: Store in backend instead of frontend
const API_URL = "https://api.openai.com/v1/chat/completions";

const inputInitHeight = chatInput.scrollHeight;

// Function to create a chat <li> element
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing"
        ? `<p>${message}</p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

// Function to generate a response from the OpenAI API
const generateResponse = async (incomingChatLi, userMessage) => {
    const messageElement = incomingChatLi.querySelector("p");

    // Define API request options
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

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        // Validate API response
        if (response.ok && data.choices && data.choices[0].message.content) {
            messageElement.textContent = data.choices[0].message.content;
        } else {
            throw new Error(data.error?.message || "Invalid response from API");
        }
    } catch (error) {
        console.error("Error:", error);
        messageElement.classList.add("error");
        messageElement.textContent =
            "Oops! Something went wrong. Please try again later.";
    } finally {
        chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
    }
};

// Function to handle user input and bot responses
const handleChat = () => {
    let userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear the input and reset its height
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append user message
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });

    // Display "Thinking..." message while waiting for the response
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });

        generateResponse(incomingChatLi, userMessage); // ✅ Pass `userMessage` properly
    }, 600);
};

// Adjust textarea height dynamically
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
