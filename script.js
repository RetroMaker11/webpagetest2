// API key de Google Drive
const API_KEY = 'AIzaSyCC0SvC3CQiDFStxQq0efuQvXFOILoAocs';

// IDs de las carpetas de Google Drive
const FOLDER_IDS = [
    '1YjZbVqIIOlGjm_wk4zKBDPJKLNBz9RYM',
    '1Jr6qQsrWXPWYohwKxJH7uRJbFtwCfjVW'
];

const videoGallery = document.getElementById('video-gallery');
const modal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const closeBtn = document.getElementsByClassName('close')[0];
const downloadLink = document.getElementById('download-link');

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    }).then(function () {
        loadVideos();
    }, function(error) {
        console.error('Error initializing Google API client', error);
    });
}

function loadVideos() {
    Promise.all(FOLDER_IDS.map(getFolderContents))
        .then(results => {
            const allFiles = results.flat();
            allFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));
            allFiles.forEach((file, index) => {
                const videoItem = createVideoItem(file, index);
                videoGallery.appendChild(videoItem);
            });
        })
        .catch(error => console.error('Error loading videos', error));
}

function getFolderContents(folderId) {
    return gapi.client.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'video/'`,
        fields: 'files(id, name)',
        orderBy: 'name'
    }).then(response => response.result.files);
}

function createVideoItem(file, index) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
        <img src="https://via.placeholder.com/250x140.png?text=Penn+Zero+Ep+${index + 1}" alt="Miniatura del episodio ${index + 1}">
        <p>${file.name}</p>
    `;
    videoItem.addEventListener('click', () => openModal(file.id));
    return videoItem;
}

function openModal(fileId) {
    modal.style.display = 'block';
    modalVideo.src = `https://drive.google.com/file/d/${fileId}/preview`;
    downloadLink.href = `https://drive.google.com/file/d/${fileId}/view`;
    downloadLink.target = '_blank';
}

function closeModal() {
    modal.style.display = 'none';
    modalVideo.src = '';
}

closeBtn.onclick = closeModal;
window.onclick = (event) => {
    if (event.target == modal) {
        closeModal();
    }
};

// Mejora de accesibilidad
closeBtn.setAttribute('aria-label', 'Cerrar video');
downloadLink.setAttribute('aria-label', 'Abrir video en Google Drive');

// Inicializar el cliente de Google API
gapi.load('client', initClient);