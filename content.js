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
        const customUIContainer = document.createElement("div");
        customUIContainer.classList.add("ce-custom-ui-container");

        const gearButton = document.createElement("button");
        gearButton.classList.add("gear-icon", "ChatFooter_emojiButton__8C6Dn");
        gearButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 512 512" fill="#686f7c"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"></path></svg>';

        const filterMenu = createFilterMenu();

        gearButton.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleFilterMenu(filterMenu);
            const rect = gearButton.getBoundingClientRect();
            filterMenu.style.top = `${rect.bottom + window.scrollY}px`;
            filterMenu.style.left = `${rect.left}px`;
        });

        document.addEventListener('click', function (event) {
            if (!filterMenu.contains(event.target) && event.target !== gearButton) {
                filterMenu.style.display = "none";
            }
        });

        chatInputContainer.insertBefore(gearButton, chatInputContainer.firstChild);
        chatInputContainer.appendChild(filterMenu);
        customUIInjected = true;
    }

    function createFilterMenu() {
        const filterMenu = document.createElement('div');
        filterMenu.classList.add('filter-menu', 'ChatFooter_emojiButton__8C6Dn');

        const select = document.createElement('select');
        select.classList.add('rank-selector');

        for (const [rank, value] of Object.entries(rankHierarchy)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = rank;
            select.appendChild(option);
        }

        select.addEventListener('change', function (event) {
            selectedRankValue = Number(event.target.value);
            filterMessages();
        });

        filterMenu.appendChild(select);
        filterMenu.style.display = "none";

        return filterMenu;
    }

    function toggleFilterMenu(filterMenu) {
        if (filterMenu.style.display === "none") {
            filterMenu.style.display = "block";
        } else {
            filterMenu.style.display = "none";
        }
    }

    checkAndRunCode();
    setInterval(checkAndRunCode, 2000);
}
