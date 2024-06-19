// script.js

function openWindow(id) {
    const window = document.getElementById(id);
    window.style.display = 'flex';
    window.style.zIndex = 1001;
    // Center the window
    window.style.top = `${(window.innerHeight - window.clientHeight) / 2}px`;
    window.style.left = `${(window.innerWidth - window.clientWidth) / 2}px`;
}

document.querySelectorAll('.close').forEach(closeButton => {
    closeButton.addEventListener('click', function() {
        this.closest('.window').style.display = 'none';
    });
});

document.querySelectorAll('.minimize').forEach(minimizeButton => {
    minimizeButton.addEventListener('click', function() {
        this.closest('.window').style.display = 'none';
    });
});

document.querySelectorAll('.maximize').forEach(maximizeButton => {
    maximizeButton.addEventListener('click', function() {
        const window = this.closest('.window');
        if (window.classList.contains('maximized')) {
            window.style.width = '600px';
            window.style.height = '400px';
            window.style.top = `${(window.innerHeight - window.clientHeight) / 2}px`;
            window.style.left = `${(window.innerWidth - window.clientWidth) / 2}px`;
            window.classList.remove('maximized');
        } else {
            window.style.width = '100%';
            window.style.height = '100%';
            window.style.top = '0';
            window.style.left = '0';
            window.classList.add('maximized');
        }
    });
});

document.getElementById('start-menu-button').addEventListener('click', function() {
    const startMenu = document.getElementById('start-menu-content');
    startMenu.classList.toggle('hidden');
});

document.addEventListener('click', function(event) {
    const startMenuButton = document.getElementById('start-menu-button');
    const startMenu = document.getElementById('start-menu-content');
    if (event.target !== startMenuButton && !startMenu.contains(event.target)) {
        startMenu.classList.add('hidden');
    }
});

// Update time
function updateTime() {
    const timeElem = document.getElementById('time');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeElem.textContent = `${hours}:${minutes}`;
}

setInterval(updateTime, 1000);
updateTime();

// Drag functionality
let draggedWindow = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll('.title-bar').forEach(titleBar => {
    titleBar.addEventListener('mousedown', function(e) {
        draggedWindow = this.closest('.window');
        offsetX = e.clientX - draggedWindow.offsetLeft;
        offsetY = e.clientY - draggedWindow.offsetTop;
        document.addEventListener('mousemove', moveWindow);
        document.addEventListener('mouseup', stopMovingWindow);
    });
});

function moveWindow(e) {
    if (draggedWindow) {
        draggedWindow.style.left = `${e.clientX - offsetX}px`;
        draggedWindow.style.top = `${e.clientY - offsetY}px`;
    }
}

function stopMovingWindow() {
    document.removeEventListener('mousemove', moveWindow);
    document.removeEventListener('mouseup', stopMovingWindow);
    draggedWindow = null;
}
// Function to set the background image
function setBackground(imageUrl) {
    document.getElementById('desktop').style.backgroundImage = `url(${imageUrl})`;
}

// Load background from localStorage or set preset background
window.onload = function() {
    const backgroundImage = localStorage.getItem('backgroundImage');
    if (backgroundImage) {
        setBackground(backgroundImage);
    } else {
        setBackground('icons/cyberpunk.jpg'); // Default wallpaper path
    }
};

// Background upload and save
document.getElementById('bg-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        localStorage.setItem('backgroundImage', dataUrl);
        setBackground(dataUrl);
    };
    reader.readAsDataURL(file);
});

// Tabs functionality
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Initialize first tab
document.querySelector('.tablink').click();
