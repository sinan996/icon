/**
 * utils.js - 通用工具函数
 */

// 生成唯一ID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 格式化日期时间
function formatDateTime(date) {
    if (!date) date = new Date();
    if (typeof date === 'string') date = new Date(date);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 安全的HTML编码
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 从文件名中提取名称（不含扩展名）
function getBaseName(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

// 获取文件扩展名
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// 将SVG字符串转换为DOM对象
function svgStringToDOM(svgString) {
    const parser = new DOMParser();
    return parser.parseFromString(svgString, 'image/svg+xml').documentElement;
}

// 将DOM对象转换为SVG字符串
function domToSVGString(domNode) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(domNode);
}

// 读取文件为文本
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

// 读取文件为DataURL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// 解析SVG中的颜色
function extractColorsFromSVG(svgDOM) {
    const colors = new Set();
    const colorElements = svgDOM.querySelectorAll('[fill], [stroke]');
    
    colorElements.forEach(el => {
        const fill = el.getAttribute('fill');
        const stroke = el.getAttribute('stroke');
        
        if (fill && fill !== 'none' && !fill.startsWith('url')) {
            colors.add(fill);
        }
        
        if (stroke && stroke !== 'none' && !stroke.startsWith('url')) {
            colors.add(stroke);
        }
    });
    
    return Array.from(colors);
}

// 修改SVG中的颜色
function changeSVGColors(svgDOM, colorMap) {
    const colorElements = svgDOM.querySelectorAll('[fill], [stroke]');
    
    colorElements.forEach(el => {
        const fill = el.getAttribute('fill');
        const stroke = el.getAttribute('stroke');
        
        if (fill && fill !== 'none' && !fill.startsWith('url') && colorMap[fill]) {
            el.setAttribute('fill', colorMap[fill]);
        }
        
        if (stroke && stroke !== 'none' && !stroke.startsWith('url') && colorMap[stroke]) {
            el.setAttribute('stroke', colorMap[stroke]);
        }
    });
    
    return svgDOM;
}

// 显示提示框
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'bi-info-circle';
    if (type === 'success') iconClass = 'bi-check-circle';
    if (type === 'error') iconClass = 'bi-exclamation-circle';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="bi ${iconClass}"></i></div>
        <div class="toast-content">${message}</div>
        <div class="toast-close"><i class="bi bi-x"></i></div>
    `;
    
    toastContainer.appendChild(toast);
    
    // 关闭按钮事件
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
}

// 显示确认对话框
function showConfirm(title, message, callback) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok-btn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    modal.classList.remove('hidden');
    
    // 取消按钮事件
    const cancelBtns = modal.querySelectorAll('[data-dismiss="modal"]');
    cancelBtns.forEach(btn => {
        btn.onclick = () => {
            modal.classList.add('hidden');
        };
    });
    
    // 确认按钮事件
    okBtn.onclick = () => {
        modal.classList.add('hidden');
        if (typeof callback === 'function') {
            callback();
        }
    };
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 下载文本文件
function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载JSON文件
function downloadJSONFile(obj, filename) {
    const content = JSON.stringify(obj, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 检查浏览器是否支持File System Access API
function isFileSystemAccessSupported() {
    return 'showDirectoryPicker' in window;
}

// 导出工具函数
window.Utils = {
    generateUUID,
    formatDateTime,
    formatFileSize,
    escapeHTML,
    getBaseName,
    getFileExtension,
    svgStringToDOM,
    domToSVGString,
    readFileAsText,
    readFileAsDataURL,
    extractColorsFromSVG,
    changeSVGColors,
    showToast,
    showConfirm,
    debounce,
    throttle,
    downloadTextFile,
    downloadJSONFile,
    isFileSystemAccessSupported
};
