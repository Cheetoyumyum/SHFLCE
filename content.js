function getTargetNode() {
    return document.querySelector('.CasinoLayout_rightSide__LdvqD');
}

function getChatMessagesContainer() {
    return document.querySelector('.MessageList_messageWrapper__8zw1g');
}

const checkTargetNodeInterval = setInterval(() => {
    const targetNode = getTargetNode();

    if (targetNode) {
        console.log('Target node found!');

        clearInterval(checkTargetNodeInterval);
        waitForChatToInject(targetNode);
    }
}, 500);

function waitForChatToInject(targetNode) {
    const chatObserver = new MutationObserver(() => {
        if (getChatMessagesContainer()) {
            console.log("Chat messages detected!");
            chatObserver.disconnect();
            initializeObserver(targetNode);
        }
    });

    chatObserver.observe(targetNode, { childList: true, subtree: true });
}

function initializeObserver(targetNode) {
    const config = { childList: true, subtree: true };

    let customUIInjected = false;
    let pinClicked = false;
    let selectedRankValue = 0;

    const rankHierarchy = {
        "None": 0, "Wood": 1, "Bronze": 2, "Silver": 3, "Gold": 4, "Platinum": 5, "Jade": 6,
        "Sapphire": 7, "Ruby": 8, "Diamond": 9, "Opal": 10, "Dragon": 11, "Mythic": 12
    };

    const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                console.log('New messages detected.');
                filterMessages();
            }
        }
    });

    observer.observe(targetNode, config);

    function filterMessages() {
        document.querySelectorAll(".MessageList_messageWrapper__8zw1g").forEach(msg => {
            const isExotic = msg.querySelector(".ChatExoticMessage_root__C_hHO");
            const isTip = msg.classList.contains("ChatMessageItemTip_root__Af5F7");
            const img = msg.querySelector("img[src*='vip']");

            if (isExotic) {
                msg.classList.add("visExotic");
                msg.style.display = "";
                console.log("Exotic message detected - Always visible:", msg);
                return;
            }

            if (isTip) {
                msg.classList.remove("hidden-message");
                msg.style.display = "";
                console.log("Tip message detected - Always visible:", msg);
                return;
            }

            if (img) {
                const imgSrc = img.src.split('/').pop();
                const messageRank = imgSrc.split('.')[0].charAt(0).toUpperCase() + imgSrc.slice(1, -4);
                const rankIndex = rankHierarchy[messageRank];

                console.log(`Message rank: ${messageRank}, index: ${rankIndex}`);

                if (selectedRankValue > 0 && rankIndex <= selectedRankValue) {
                    msg.classList.add("hidden-message");
                    msg.style.display = "none";
                    console.log("Message hidden:", msg);
                } else {
                    msg.classList.remove("hidden-message");
                    msg.style.display = "";
                }
            } else {
                msg.classList.add("hidden-message");
                msg.style.display = "none";
                console.log("Message hidden due to no VIP image:", msg);
            }
        });
    }

    function checkAndRunCode() {
        try {
            console.log("Script running...");

            const chatInputContainer = document.querySelector(".chat-input__control");

            if (chatInputContainer) {
                console.log("Chat input container found.");

                if (!customUIInjected) {
                    const customUIContainer = document.createElement("div");
                    customUIContainer.classList.add("ce-custom-ui-container");

                    const style = document.createElement('style');
                    style.textContent = `
                        .ce-custom-ui-container {
                            position: relative;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .ce-rank-dropdown {
                            margin: 5px 0px;
                            padding: 5px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                        }
                        .ce-rank-dropdown:focus {
                            outline: none;
                            box-shadow: 0 0 0 2px #007bff;
                        }
                        .hidden-message {
                            display: none !important;
                        }
                        .visExotic {
                            display: block !important; /* Always visible */
                        }
                        .MessageList_messageWrapper__8zw1g.hidden-message .visExotic {
                            display: none !important; /* Hide if parent is hidden */
                        }
                    `;
                    document.head.appendChild(style);

                    const rankDropdown = document.createElement("select");
                    rankDropdown.classList.add("ce-rank-dropdown");

                    const ranks = [
                        "None", "Wood", "Bronze", "Silver", "Gold", "Platinum", "Jade",
                        "Sapphire", "Ruby", "Diamond", "Opal", "Dragon", "Mythic"
                    ];

                    ranks.forEach(rank => {
                        const option = document.createElement("option");
                        option.value = rank;
                        option.innerText = rank;
                        rankDropdown.appendChild(option);
                    });

                    rankDropdown.value = "None";

                    customUIContainer.appendChild(rankDropdown);
                    chatInputContainer.appendChild(customUIContainer);
                    customUIInjected = true;

                    console.log("Custom UI injected.");

                    rankDropdown.addEventListener("change", () => {
                        selectedRankValue = rankHierarchy[rankDropdown.value];
                        console.log(`Rank changed to: ${rankDropdown.value}, value: ${selectedRankValue}`);
                        filterMessages();
                    });

                    filterMessages();
                }

                if (!pinClicked) {
                    const pinButton = document.querySelector(".pinButton");
                    if (pinButton) {
                        pinButton.click();
                        pinClicked = true;
                        console.log("Pin button clicked for auto-pin.");
                    }
                }
            } else {
                console.log("Chat input container not found.");
            }
        } catch (e) {
            console.error("Error running content script", e);
        }
    }

    checkAndRunCode();
}
