const API_BASE_URL = window.location.origin; // Using the self-hosted URL

// Translations
const translations = {
    uz: {
        title: "Fayllar",
        newFolder: "Yangi Papka",
        upload: "Yuklash",
        save: "Saqlash",
        emptyState: "Tahrirlash uchun chap tomondan fayl tanlang.",
        promptFolderName: "Yangi papka nomini kiriting:",
        successSave: "Muvaffaqiyatli saqlandi!",
        errorSave: "Saqlashda xatolik yuz berdi.",
        errorRead: "Faylni o'qib bo'lmadi",
        confirmDelete: "O'chirishni xohlaysizmi?"
    },
    ru: {
        title: "Файлы",
        newFolder: "Новая папка",
        upload: "Загрузить",
        save: "Сохранить",
        emptyState: "Выберите файл слева для редактирования.",
        promptFolderName: "Введите имя новой папки:",
        successSave: "Успешно сохранено!",
        errorSave: "Ошибка при сохранении.",
        errorRead: "Не удалось прочитать файл",
        confirmDelete: "Вы уверены, что хотите удалить?"
    },
    en: {
        title: "Files",
        newFolder: "New Folder",
        upload: "Upload",
        save: "Save Changes",
        emptyState: "Select a file from the sidebar to open the editor.",
        promptFolderName: "Enter new folder name:",
        successSave: "Saved successfully!",
        errorSave: "Error saving file.",
        errorRead: "Could not read file",
        confirmDelete: "Are you sure you want to delete?"
    }
};

let currentLang = 'uz';
let pendingUploadFolder = ""; 
let codeEditor;

// i18n Init
function changeLanguage() {
    const selector = document.getElementById('lang-select');
    currentLang = selector.value;
    updateUIStrings();
    localStorage.setItem('filemanager-lang', currentLang);
}

function updateUIStrings() {
    const t = translations[currentLang];
    document.getElementById('sidebar-title').innerHTML = '<i class="fa-solid fa-folder-tree"></i> ' + t.title;
    document.getElementById('text-new-folder').innerText = t.newFolder;
    document.getElementById('text-upload').innerText = t.upload;
    document.getElementById('text-save').innerText = t.save;
    document.getElementById('text-empty-state').innerText = t.emptyState;
}

// Theme Init
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('filemanager-theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Update CodeMirror
    if (codeEditor) {
        codeEditor.setOption("theme", newTheme === 'dark' ? 'dracula' : 'default');
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// Initializing settings on load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('filemanager-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const savedLang = localStorage.getItem('filemanager-lang') || 'uz';
    document.getElementById('lang-select').value = savedLang;
    currentLang = savedLang;
    updateUIStrings();

    // CodeMirror Init
    codeEditor = CodeMirror.fromTextArea(document.getElementById('text-editor'), {
        lineNumbers: true,
        theme: savedTheme === 'dark' ? 'dracula' : 'default',
        mode: 'javascript',
        autoCloseBrackets: true,
        matchBrackets: true
    });

    document.getElementById('btn-upload').onclick = () => {
        pendingUploadFolder = ''; // Umumiy upload doim root (asosiy) papkaga yuklaydi
        document.getElementById('file-upload').click();
    };

    loadRootFolder();
    setupDragDrop();
});

// Drag and drop setup
function setupDragDrop() {
    let dragCounter = 0;
    const wrapper = document.querySelector('.editor-wrapper');
    const overlay = document.getElementById('drop-overlay');

    wrapper.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        overlay.classList.remove('hidden');
    });

    wrapper.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            overlay.classList.add('hidden');
        }
    });

    wrapper.addEventListener('dragover', (e) => e.preventDefault());

    wrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        overlay.classList.add('hidden');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFileList(e.dataTransfer.files);
        }
    });
}

// Build Tree View elements
function createTreeItem(item, parentPath) {
    const isFolder = !item.includes('.'); // Simplistic check
    const fullPath = parentPath ? `${parentPath}/${item}` : item;
    
    const div = document.createElement('div');
    
    const row = document.createElement('div');
    row.className = 'tree-item';
    row.setAttribute('data-name', item.toLowerCase()); // for search
    
    const nameExt = escapeHtml(item);
    
    if (isFolder) {
        row.innerHTML = `
            <div class="item-left" onclick="toggleFolder('${fullPath}', this.parentElement)">
                <i class="fa-solid fa-folder"></i>
                <span class="item-name">${nameExt}</span>
            </div>
            <div class="item-actions">
                <button class="action-btn" title="Ushbu papkaga yuklash" onclick="triggerFolderUpload(event, '${fullPath}')"><i class="fa-solid fa-upload"></i></button>
                <button class="action-btn btn-download" title="ZIP Yuklab olish" onclick="triggerDownload(event, '${fullPath}', 'folder')"><i class="fa-solid fa-download"></i></button>
                <button class="action-btn" onclick="deleteItem(event, '${fullPath}', 'folder')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    } else {
        row.innerHTML = `
            <div class="item-left" onclick="openFile('${fullPath}', this.parentElement)">
                <i class="fa-solid fa-file-lines"></i>
                <span class="item-name">${nameExt}</span>
            </div>
            <div class="item-actions">
                <button class="action-btn btn-download" title="Yuklab olish" onclick="triggerDownload(event, '${fullPath}', 'file')"><i class="fa-solid fa-download"></i></button>
                <button class="action-btn" onclick="deleteItem(event, '${fullPath}', 'file')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    }
    
    div.appendChild(row);
    
    if (isFolder) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'folder-children';
        childrenDiv.id = `folder-children-${fullPath}`;
        div.appendChild(childrenDiv);
    }
    
    return div;
}

// Search filter
function filterFiles(query) {
    query = query.toLowerCase();
    const items = document.querySelectorAll('.tree-item');
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name && name.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function triggerDownload(event, path, type) {
    event.stopPropagation();
    let url = type === 'folder' 
        ? `${API_BASE_URL}/api/folder/download-zip?folderPath=${encodeURIComponent(path)}`
        : `${API_BASE_URL}/api/file?filePath=${encodeURIComponent(path)}`;
    window.open(url, '_blank');
}

// API - Load Folders
async function loadRootFolder() {
    const container = document.getElementById('file-list');
    container.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/folder?folderPath=`);
        if(!res.ok) throw new Error("Could not fetch root");
        const data = await res.json();
        
        container.innerHTML = '';
        if(data && data.length) {
            data.forEach(item => {
                container.appendChild(createTreeItem(item, ""));
            });
            // Apply current search if any
            filterFiles(document.getElementById('search-input').value);
        } else {
            container.innerHTML = '<div class="loading">Empty</div>';
        }
    } catch (err) {
        container.innerHTML = `<div class="loading" style="color:var(--danger)">Error loading data</div>`;
        console.error(err);
    }
}

async function toggleFolder(path, element) {
    const childrenDiv = document.getElementById(`folder-children-${path}`);
    const icon = element.querySelector('i');
    
    if (childrenDiv.classList.contains('open')) {
        childrenDiv.classList.remove('open');
        icon.className = 'fa-solid fa-folder';
        childrenDiv.innerHTML = ''; 
    } else {
        childrenDiv.classList.add('open');
        icon.className = 'fa-solid fa-folder-open';
        childrenDiv.innerHTML = '<div style="font-size: 0.8rem; color: gray; padding: 5px;">Loading...</div>';
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/folder?folderPath=${encodeURIComponent(path)}`);
            const data = await res.json();
            
            childrenDiv.innerHTML = '';
            if(data && data.length) {
                data.forEach(itemStr => {
                    const itemName = itemStr.replace(/\\/g, '/').split('/').pop();
                    childrenDiv.appendChild(createTreeItem(itemName, path));
                });
                filterFiles(document.getElementById('search-input').value);
            } else {
                childrenDiv.innerHTML = '<div style="font-size: 0.8rem; color: gray; padding: 5px;">Empty</div>';
            }
        } catch(err) {
            childrenDiv.innerHTML = `<div style="font-size: 0.8rem; color: red;">Error</div>`;
        }
    }
}

// API - Files
async function openFile(path, element) {
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('editor-overlay').classList.add('hidden');
    document.getElementById('current-path').value = path;
    
    const ext = path.split('.').pop().toLowerCase();
    const isImage = ['png','jpg','jpeg','gif','svg','webp'].includes(ext);
    const isVideo = ['mp4','webm','ogg'].includes(ext);

    const mediaContainer = document.getElementById('media-container');
    const codeContainer = document.getElementById('code-container');
    const mediaImg = document.getElementById('media-img');
    const mediaVid = document.getElementById('media-video');
    const saveBtn = document.getElementById('btn-save');

    if (isImage || isVideo) {
        // Show Media
        codeContainer.classList.add('hidden');
        mediaContainer.classList.remove('hidden');
        saveBtn.style.display = 'none'; // Cannot edit media code

        const fileUrl = `${API_BASE_URL}/api/file?filePath=${encodeURIComponent(path)}`;
        
        if (isImage) {
            mediaVid.classList.add('hidden');
            mediaVid.pause();
            mediaImg.classList.remove('hidden');
            mediaImg.src = fileUrl;
        } else {
            mediaImg.classList.add('hidden');
            mediaVid.classList.remove('hidden');
            mediaVid.src = fileUrl;
            mediaVid.load();
        }
    } else {
        // Show Code
        mediaContainer.classList.add('hidden');
        mediaVid.pause();
        codeContainer.classList.remove('hidden');
        saveBtn.style.display = 'flex';
        
        codeEditor.setValue("Loading...");
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/file/text?filePath=${encodeURIComponent(path)}`);
            if (!response.ok) throw new Error(translations[currentLang].errorRead);
            
            const data = await response.json();
            codeEditor.setValue(data.content);
            
            // Set dynamic mode
            let mode = 'javascript';
            if (ext === 'html') mode = 'htmlmixed';
            else if (ext === 'css') mode = 'css';
            else if (ext === 'xml') mode = 'xml';
            else if (ext === 'cs') mode = 'text/x-csharp';
            else mode = 'javascript';
            
            codeEditor.setOption("mode", mode);
            
            // Refresh editor to fit container
            setTimeout(() => codeEditor.refresh(), 50);
            
        } catch (error) {
            alert(error.message);
            codeEditor.setValue("");
        }
    }
}

async function updateFile() {
    const path = document.getElementById('current-path').value;
    const content = codeEditor.getValue();

    if (!path) {
        alert(translations[currentLang].emptyState);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/file?filePath=${encodeURIComponent(path)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content) 
        });

        if (response.ok) {
            alert(translations[currentLang].successSave);
        } else {
            alert(translations[currentLang].errorSave);
        }
    } catch (error) {
        console.error("Xatolik:", error);
    }
}

function promptCreateFolder() {
    const name = prompt(translations[currentLang].promptFolderName);
    if(name) {
        const currentPath = document.getElementById('current-path').value;
        // Optionally prepend current path context here
        fetch(`${API_BASE_URL}/api/folder?folderPath=${encodeURIComponent(name)}`, { method: 'POST' })
            .then(res => loadRootFolder());
    }
}

function triggerFolderUpload(event, path) {
    event.stopPropagation();
    pendingUploadFolder = path; 
    document.getElementById('file-upload').click();
}

function handleFileUpload(event) {
    uploadFileList(event.target.files);
    event.target.value = null; // Clear input
}

async function uploadFileList(files) {
    if(!files || files.length === 0) return;
    
    const formData = new FormData();
    for(let i=0; i<files.length; i++) {
        formData.append('file', files[i]);
    }
    
    const folder = pendingUploadFolder; 
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/file?folderPath=${encodeURIComponent(folder)}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            alert(translations[currentLang].errorSave);
        } else {
            alert("File(s) uploaded successfully!");
        }

        loadRootFolder();
    } catch(err) {
        console.error(err);
    } finally {
        pendingUploadFolder = "";
    }
}

async function deleteItem(event, path, type) {
    event.stopPropagation(); 
    if(confirm(translations[currentLang].confirmDelete)) {
        const endpoint = type === 'folder' ? 'folder' : 'file';
        const param = type === 'folder' ? 'folderPath' : 'filePath';
        try {
            await fetch(`${API_BASE_URL}/api/${endpoint}?${param}=${encodeURIComponent(path)}`, { method: 'DELETE' });
            if(document.getElementById('current-path').value === path) {
                document.getElementById('current-path').value = '';
                codeEditor.setValue('');
                document.getElementById('editor-overlay').classList.remove('hidden');
                document.getElementById('code-container').classList.remove('hidden');
                document.getElementById('media-container').classList.add('hidden');
            }
            loadRootFolder();
        } catch(err) {
            console.error(err);
        }
    }
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
