// Popup.js

document.getElementById('rank-filter').addEventListener('change', function(event) {
    const selectedRank = event.target.value;

    console.log(`Selected rank: ${selectedRank}`);

    // Send the selected rank to the content script
    chrome.runtime.sendMessage({ action: 'updateRank', rank: selectedRank });
});

document.getElementById('upload-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('emote-upload');
    const file = fileInput.files[0];

    if (file) {
        console.log(`Uploading emote: ${file.name}`);
        document.getElementById('status').textContent = `Emote ${file.name} uploaded successfully.`;
    } else {
        document.getElementById('status').textContent = "Please select a file first.";
    }
});
