function getTargetNode() {
    return document.querySelector('.CasinoLayout_rightSide__LdvqD');
}

function getChatMessagesContainer() {
    return document.querySelector('.MessageList_messageWrapper__8zw1g');
}

function monitorChatInjection() {
    const checkInterval = setInterval(() => {
        const targetNode = getTargetNode();
        const chatMessages = getChatMessagesContainer();

        if (targetNode && chatMessages) {
            clearInterval(checkInterval);
            waitForChatToInject(targetNode);
        }
    }, 500);
}

monitorChatInjection();

function waitForChatToInject(targetNode) {
    const chatObserver = new MutationObserver(() => {
        if (getChatMessagesContainer()) {
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
                return;
            }

            if (isTip) {
                msg.classList.remove("hidden-message");
                msg.style.display = "";
                return;
            }

            if (img) {
                const imgSrc = img.src.split('/').pop();
                const messageRank = imgSrc.split('.')[0].charAt(0).toUpperCase() + imgSrc.slice(1, -4);
                const rankIndex = rankHierarchy[messageRank];

                if (selectedRankValue > 0 && rankIndex <= selectedRankValue) {
                    msg.classList.add("hidden-message");
                    msg.style.display = "none";
                } else {
                    msg.classList.remove("hidden-message");
                    msg.style.display = "";
                }
            } else {
                msg.classList.add("hidden-message");
                msg.style.display = "none";
            }
        });
    }

    function checkAndRunCode() {
        try {
            const chatInputContainer = document.querySelector(".ChatFooter_chatButtonGroup__Fratm");

            if (chatInputContainer) {
                if (!customUIInjected) {
                    injectCustomUI(chatInputContainer);
                }

                if (!pinClicked) {
                    const pinButton = document.querySelector(".pinButton");
                    if (pinButton) {
                        pinButton.click();
                        pinClicked = true;
                    }
                }
            } else {
                monitorChatInjection();
            }
        } catch (e) {
            console.error("Error running content script", e);
        }
    }

    function injectCustomUI(chatInputContainer) {
        const customUIClass = "ce-custom-ui-container";
        let existingUI = document.querySelector(`.${customUIClass}`);
        if (existingUI) {
            if (!document.body.contains(existingUI)) {
                existingUI = null;
            } else {
                return;
            }
        }

        const customUIContainer = document.createElement("div");
        customUIContainer.classList.add(customUIClass);

        const gearButton = document.createElement("button");
        gearButton.classList.add("gear-icon", "ChatFooter_emojiButton__8C6Dn");
        gearButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#686f7c"><path d="M14.037,20.937a1.015,1.015,0,0,1-.518-.145l-3.334-2a2.551,2.551,0,0,1-1.233-2.176V12.091a1.526,1.526,0,0,0-.284-.891L4.013,4.658a1.01,1.01,0,0,1,.822-1.6h14.33a1.009,1.009,0,0,1,.822,1.6h0L15.332,11.2a1.527,1.527,0,0,0-.285.891v7.834a1.013,1.013,0,0,1-1.01,1.012ZM4.835,4.063,9.482,10.62a2.515,2.515,0,0,1,.47,1.471v4.524a1.543,1.543,0,0,0,.747,1.318l3.334,2,.014-7.843a2.516,2.516,0,0,1,.471-1.471l4.654-6.542,0,0Z"></path></svg>';

        const selectElement = document.createElement('select');
        selectElement.style.backgroundColor = '#121418';
        selectElement.style.border = '1px solid #2a2e38';
        selectElement.style.color = '#ffffff';
        selectElement.style.padding = '5px';
        selectElement.style.borderRadius = '5px';
        selectElement.style.cursor = 'pointer';
        selectElement.style.position = 'absolute';
        selectElement.style.zIndex = '1000';
        selectElement.style.left = '-5px';

        for (const rank of Object.keys(rankHierarchy)) {
            const option = document.createElement('option');
            option.value = rank;
            option.textContent = rank;
            selectElement.appendChild(option);
        }

        selectElement.addEventListener('change', function () {
            selectedRankValue = rankHierarchy[this.value];
            filterMessages();
        });

        gearButton.addEventListener('click', function (event) {
            event.stopPropagation();
            selectElement.style.display = selectElement.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', function (event) {
            if (!selectElement.contains(event.target) && event.target !== gearButton) {
                selectElement.style.display = "none";
            }
        });

        customUIContainer.appendChild(gearButton);
        customUIContainer.appendChild(selectElement);
        chatInputContainer.insertBefore(customUIContainer, chatInputContainer.firstChild);

        selectElement.style.display = 'none';
    }

    checkAndRunCode();
    setInterval(checkAndRunCode, 2000);
}
