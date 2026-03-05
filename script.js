// Clock initialization
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// Start menu toggle
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if(!e.target.closest('.start-btn') && !e.target.closest('.start-menu')) {
        document.getElementById('start-menu').classList.add('hidden');
    }
});

// Window Management
let zIndexCounter = 10;

function bringToFront(windowId) {
    const win = document.getElementById(windowId);
    if(win) {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
        win.style.display = 'block';
        updateTaskbar();
    }
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    if(win) {
        win.style.display = 'none';
        updateTaskbar();
    }
}

function openWindow(windowId) {
    bringToFront(windowId);
}

// Make windows draggable
const draggables = document.querySelectorAll('.draggable');

draggables.forEach(draggable => {
    const header = draggable.querySelector('.window-header');
    
    // Bring to front on mousedown anywhere on the window
    draggable.addEventListener('mousedown', () => {
        bringToFront(draggable.id);
    });

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        if(e.target.closest('.window-controls')) return; // Don't drag if clicking close button
        isDragging = true;
        offsetX = e.clientX - draggable.getBoundingClientRect().left;
        offsetY = e.clientY - draggable.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        draggable.style.left = `${e.clientX - offsetX}px`;
        draggable.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});

// Taskbar Sync
function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = ''; // Clear current

    const windows = document.querySelectorAll('.win98-window');
    windows.forEach(win => {
        if (win.style.display !== 'none') {
            const title = win.querySelector('.window-title span').textContent;
            const iconSrc = win.querySelector('.window-title img').src;
            
            const taskbarItem = document.createElement('div');
            // Check if it's the highest z-index (active)
            const isActive = parseInt(win.style.zIndex) === zIndexCounter;
            
            taskbarItem.className = `taskbar-item ${isActive ? 'active' : ''}`;
            taskbarItem.innerHTML = `<img src="${iconSrc}" alt="icon"> <span>${title}</span>`;
            
            // Clicking taskbar item brings to front
            taskbarItem.addEventListener('click', () => {
                bringToFront(win.id);
            });
            
            taskbarApps.appendChild(taskbarItem);
        }
    });
}

// Initialize taskbar on load
updateTaskbar();
