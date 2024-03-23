// Function to handle download button click
function handleDownloadButtonClick() {
    const url = document.getElementById('urlInput').value;
    const name = document.getElementById('nameInput').value;
    
    // Make an API request to download the file
    fetch(`http://localhost:3000/download?url=${url}&name=${name}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Download successful. File saved at: ' + data.filePath);
                mapFiles()
            } else {
                alert('Download failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Download failed. Please check your connection.');
        });
}

// Event listener for download button click
document.getElementById('downloadButton').addEventListener('click', handleDownloadButtonClick);

function mapFiles() {
    fetch(`http://localhost:3000/files`)
        .then(response => response.json())
        .then(data => {
            // Function to create and append list items
            function createListItem(item, listId) {
                const listItem = document.createElement("li");
                const span = document.createElement("span");
                listItem.textContent = item; // Assuming each item has a 'name' property
                

                span.textContent = item;

    // Add click event listeners for renaming and deletion
   

                // Add event listener for item click
                span.addEventListener('click', () => {
                    const newName = prompt("Enter new name or leave blank to delete:");
                    if (newName !== null) {
                        if (newName === "") {
                            // Delete item
                            listItem.remove();
                            fetch(`http://localhost:3000/delete?name=${item}`)
                        } else {
                            // Rename item
                            listItem.textContent = newName;
                            fetch(`http://localhost:3000/rename?oldName=${item}&newName=${newName}`)
                        }
                    }
                });

                document.getElementById(listId).appendChild(listItem);
            }

            const uniqueVideos = new Set(data.videos);
            const uniquePhotos = new Set(data.photos);
            const uniqueDocuments = new Set(data.documents);

            // Mapping videos
            if (uniqueVideos.size > 0) {
                uniqueVideos.forEach(video => {
                    createListItem(video, "videosList");
                });
            } else {
                document.getElementById("videosList").innerText = "no Videos";
            }

            // Mapping photos
            if (uniquePhotos.size > 0) {
                uniquePhotos.forEach(photo => {
                    createListItem(photo, "photosList");
                });
            } else {
                document.getElementById("photosList").innerText = "no Photos";
            }

            // Mapping documents
            if (uniqueDocuments.size > 0) {
                uniqueDocuments.forEach(document => {
                    createListItem(document, "documentsList");
                });
            } else {
                document.getElementById("documentsList").innerText = "no Documents";
            }

            fetch(`http://localhost:3000/resize`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Download failed. Please check your connection.');
        });
}



mapFiles()