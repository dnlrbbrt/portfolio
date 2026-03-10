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
    const win = document.getElementById(windowId);
    if (win && window.innerWidth <= 768) {
        win.style.left = '10px';
        win.style.top = '50px';
        win.style.width = (window.innerWidth - 20) + 'px';
        win.style.height = '';
    }
    bringToFront(windowId);
}

// Make windows draggable (mouse + touch) and resizable
const draggables = document.querySelectorAll('.draggable');

draggables.forEach(draggable => {
    const header = draggable.querySelector('.window-header');

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    draggable.appendChild(resizeHandle);

    // Bring to front on any interaction
    draggable.addEventListener('mousedown', () => bringToFront(draggable.id));
    draggable.addEventListener('touchstart', () => bringToFront(draggable.id), { passive: true });

    let isDragging = false, isResizing = false;
    let offsetX, offsetY, startW, startH, startX, startY;

    // --- Drag ---
    function dragStart(cx, cy) {
        isDragging = true;
        offsetX = cx - draggable.getBoundingClientRect().left;
        offsetY = cy - draggable.getBoundingClientRect().top;
    }

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        dragStart(e.clientX, e.clientY);
    });
    header.addEventListener('touchstart', (e) => {
        if (e.target.closest('.window-controls')) return;
        dragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // --- Resize ---
    function resizeStart(cx, cy) {
        isResizing = true;
        startW = draggable.offsetWidth;
        startH = draggable.offsetHeight;
        startX = cx;
        startY = cy;
        bringToFront(draggable.id);
    }

    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        resizeStart(e.clientX, e.clientY);
    });
    resizeHandle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        resizeStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // --- Move / Resize ---
    function onMove(cx, cy) {
        if (isDragging) {
            draggable.style.left = `${cx - offsetX}px`;
            draggable.style.top = `${cy - offsetY}px`;
        }
        if (isResizing) {
            draggable.style.width = `${Math.max(200, startW + cx - startX)}px`;
            draggable.style.height = `${Math.max(120, startH + cy - startY)}px`;
        }
    }

    document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        if (isDragging || isResizing) {
            e.preventDefault();
            onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    function onEnd() { isDragging = false; isResizing = false; }
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
});

// Taskbar Sync
function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';

    const windows = document.querySelectorAll('.win98-window');
    windows.forEach(win => {
        if (win.style.display !== 'none') {
            const title = win.querySelector('.window-title span').textContent;
            const iconSrc = win.querySelector('.window-title img').src;

            const taskbarItem = document.createElement('div');
            const isActive = parseInt(win.style.zIndex) === zIndexCounter;

            taskbarItem.className = `taskbar-item ${isActive ? 'active' : ''}`;
            taskbarItem.innerHTML = `<img src="${iconSrc}" alt="icon"> <span>${title}</span>`;

            taskbarItem.addEventListener('click', () => bringToFront(win.id));
            taskbarApps.appendChild(taskbarItem);
        }
    });
}

// Initialize taskbar on load
updateTaskbar();
