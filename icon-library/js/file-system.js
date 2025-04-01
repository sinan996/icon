/**
 * file-system.js - 文件系统管理模块
 * 
 * 负责处理本地文件系统的读写操作，支持两种模式：
 * 1. File System Access API (主要模式)
 * 2. 本地存储 + 文件导入/导出 (备选模式)
 */

class FileSystemManager {
    constructor() {
        // 工作目录句柄
        this.directoryHandle = null;
        // 子目录句柄
        this.iconsDirectoryHandle = null;
        this.dataDirectoryHandle = null;
        // 存储模式: 'fs-api' 或 'local-storage'
        this.storageMode = 'fs-api';
        // 初始化状态
        this.initialized = false;
        // 自动保存设置
        this.autoSave = true;
        
        // 检查浏览器支持
        this.fsApiSupported = Utils.isFileSystemAccessSupported();
        
        // 如果不支持File System Access API，自动切换到本地存储模式
        if (!this.fsApiSupported) {
            this.storageMode = 'local-storage';
            Utils.showToast('您的浏览器不支持文件系统API，已切换到本地存储模式', 'warning');
        }
    }
    
    /**
     * 初始化文件系统
     * @returns {Promise<boolean>} 是否初始化成功
     */
    async initialize() {
        try {
            if (this.storageMode === 'fs-api') {
                // 尝试恢复之前的目录访问权限
                const savedDirHandle = await this.getStoredDirectoryHandle();
                if (savedDirHandle) {
                    // 验证权限是否仍然有效
                    if (await this.verifyPermission(savedDirHandle, true)) {
                        this.directoryHandle = savedDirHandle;
                        await this.setupDirectoryStructure();
                        this.initialized = true;
                        return true;
                    }
                }
            } else {
                // 本地存储模式不需要特殊初始化
                this.initialized = true;
                return true;
            }
        } catch (error) {
            console.error('初始化文件系统失败:', error);
        }
        
        return false;
    }
    
    /**
     * 选择工作目录
     * @returns {Promise<boolean>} 是否选择成功
     */
    async selectDirectory() {
        try {
            if (!this.fsApiSupported) {
                Utils.showToast('您的浏览器不支持文件系统API，无法选择目录', 'error');
                return false;
            }
            
            // 打开目录选择器
            const dirHandle = await window.showDirectoryPicker({
                id: 'icon-library-workspace',
                mode: 'readwrite',
                startIn: 'documents'
            });
            
            // 保存目录句柄
            this.directoryHandle = dirHandle;
            
            // 保存目录句柄到IndexedDB以便下次使用
            await this.storeDirectoryHandle(dirHandle);
            
            // 设置目录结构
            await this.setupDirectoryStructure();
            
            this.initialized = true;
            this.storageMode = 'fs-api';
            
            // 更新UI显示
            this.updateDirectoryDisplay();
            
            Utils.showToast('工作目录设置成功', 'success');
            return true;
        } catch (error) {
            console.error('选择目录失败:', error);
            if (error.name !== 'AbortError') {
                Utils.showToast('选择目录失败: ' + error.message, 'error');
            }
            return false;
        }
    }
    
    /**
     * 设置目录结构
     * @returns {Promise<void>}
     */
    async setupDirectoryStructure() {
        if (!this.directoryHandle) return;
        
        try {
            // 创建icons目录
            this.iconsDirectoryHandle = await this.getOrCreateDirectory('icons');
            
            // 创建data目录
            this.dataDirectoryHandle = await this.getOrCreateDirectory('data');
            
            // 更新UI显示
            this.updateDirectoryDisplay();
        } catch (error) {
            console.error('设置目录结构失败:', error);
            Utils.showToast('设置目录结构失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 获取或创建子目录
     * @param {string} name 目录名
     * @returns {Promise<FileSystemDirectoryHandle>} 目录句柄
     */
    async getOrCreateDirectory(name) {
        if (!this.directoryHandle) return null;
        
        try {
            // 尝试获取现有目录
            try {
                return await this.directoryHandle.getDirectoryHandle(name);
            } catch (error) {
                // 如果目录不存在，则创建
                if (error.name === 'NotFoundError') {
                    return await this.directoryHandle.getDirectoryHandle(name, { create: true });
                }
                throw error;
            }
        } catch (error) {
            console.error(`获取或创建目录 ${name} 失败:`, error);
            throw error;
        }
    }
    
    /**
     * 更新目录显示
     */
    updateDirectoryDisplay() {
        const dirDisplay = document.getElementById('working-directory');
        if (dirDisplay && this.directoryHandle) {
            dirDisplay.textContent = this.directoryHandle.name;
        } else if (dirDisplay) {
            dirDisplay.textContent = '未设置';
        }
        
        const dirInput = document.getElementById('working-dir-input');
        if (dirInput && this.directoryHandle) {
            dirInput.value = this.directoryHandle.name;
        }
        
        const dirStatus = document.getElementById('dir-status');
        if (dirStatus) {
            if (this.directoryHandle) {
                dirStatus.classList.remove('hidden');
            } else {
                dirStatus.classList.add('hidden');
            }
        }
    }
    
    /**
     * 验证目录权限
     * @param {FileSystemDirectoryHandle} dirHandle 目录句柄
     * @param {boolean} askPermission 是否请求权限
     * @returns {Promise<boolean>} 是否有权限
     */
    async verifyPermission(dirHandle, askPermission = false) {
        try {
            // 检查当前权限状态
            const options = { mode: 'readwrite' };
            if (await dirHandle.queryPermission(options) === 'granted') {
                return true;
            }
            
            // 如果需要，请求权限
            if (askPermission) {
                return await dirHandle.requestPermission(options) === 'granted';
            }
            
            return false;
        } catch (error) {
            console.error('验证权限失败:', error);
            return false;
        }
    }
    
    /**
     * 保存目录句柄到IndexedDB
     * @param {FileSystemDirectoryHandle} dirHandle 目录句柄
     * @returns {Promise<void>}
     */
    async storeDirectoryHandle(dirHandle) {
        try {
            // 使用IndexedDB存储目录句柄
            const db = await this.openDatabase();
            const tx = db.transaction('handles', 'readwrite');
            await tx.objectStore('handles').put(dirHandle, 'workingDirectory');
            await tx.done;
        } catch (error) {
            console.error('存储目录句柄失败:', error);
        }
    }
    
    /**
     * 从IndexedDB获取存储的目录句柄
     * @returns {Promise<FileSystemDirectoryHandle|null>} 目录句柄
     */
    async getStoredDirectoryHandle() {
        try {
            const db = await this.openDatabase();
            const tx = db.transaction('handles', 'readonly');
            const dirHandle = await tx.objectStore('handles').get('workingDirectory');
            return dirHandle || null;
        } catch (error) {
            console.error('获取存储的目录句柄失败:', error);
            return null;
        }
    }
    
    /**
     * 打开IndexedDB数据库
     * @returns {Promise<IDBDatabase>} 数据库对象
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('IconLibraryFileSystem', 1);
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles');
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * 保存文件
     * @param {string} fileName 文件名
     * @param {string|Blob} content 文件内容
     * @param {string} directory 目录名 ('icons' 或 'data')
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveFile(fileName, content, directory = 'data') {
        try {
            if (this.storageMode === 'fs-api') {
                // 使用File System Access API保存文件
                const dirHandle = directory === 'icons' ? this.iconsDirectoryHandle : this.dataDirectoryHandle;
                
                if (!dirHandle) {
                    throw new Error('目录未初始化');
                }
                
                // 创建文件句柄
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                
                // 创建可写流
                const writable = await fileHandle.createWritable();
                
                // 写入内容
                await writable.write(content);
                
                // 关闭流
                await writable.close();
                
                return true;
            } else {
                // 使用localStorage保存文件
                const key = `${directory}/${fileName}`;
                let dataToStore;
                
                if (content instanceof Blob) {
                    // 如果是Blob，转换为Base64字符串
                    dataToStore = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(content);
                    });
                } else {
                    // 如果是字符串，直接存储
                    dataToStore = content;
                }
                
                localStorage.setItem(key, dataToStore);
                return true;
            }
        } catch (error) {
            console.error(`保存文件 ${fileName} 失败:`, error);
            Utils.showToast(`保存文件 ${fileName} 失败: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * 读取文件
     * @param {string} fileName 文件名
     * @param {string} directory 目录名 ('icons' 或 'data')
     * @param {string} [returnType='text'] 返回类型 ('text', 'blob', 'url')
     * @returns {Promise<string|Blob|null>} 文件内容
     */
    async readFile(fileName, directory = 'data', returnType = 'text') {
        try {
            if (this.storageMode === 'fs-api') {
                // 使用File System Access API读取文件
                const dirHandle = directory === 'icons' ? this.iconsDirectoryHandle : this.dataDirectoryHandle;
                
                if (!dirHandle) {
                    throw new Error('目录未初始化');
                }
                
                try {
                    // 获取文件句柄
                    const fileHandle = await dirHandle.getFileHandle(fileName);
                    
                    // 获取文件对象
                    const file = await fileHandle.getFile();
                    
                    if (returnType === 'blob') {
                        return file;
                    } else if (returnType === 'url') {
                        return URL.createObjectURL(file);
                    } else {
                        // 默认返回文本
                        return await file.text();
                    }
                } catch (error) {
                    if (error.name === 'NotFoundError') {
                        return null;
                    }
                    throw error;
                }
            } else {
                // 使用localStorage读取文件
                const key = `${directory}/${fileName}`;
                const data = localStorage.getItem(key);
                
                if (!data) return null;
                
                if (returnType === 'blob' || returnType === 'url') {
                    // 如果数据是Base64编码的DataURL
                    if (data.startsWith('data:')) {
                        const response = await fetch(data);
                        const blob = await response.blob();
                        
                        if (returnType === 'url') {
                            return URL.createObjectURL(blob);
                        }
                        return blob;
                    } else {
                        // 如果是普通文本，创建文本Blob
                        const blob = new Blob([data], { type: 'text/plain' });
                        
                        if (returnType === 'url') {
                            return URL.createObjectURL(blob);
                        }
                        return blob;
                    }
                }
                
                return data;
            }
        } catch (error) {
            console.error(`读取文件 ${fileName} 失败:`, error);
            return null;
        }
    }
    
    /**
     * 删除文件
     * @param {string} fileName 文件名
     * @param {string} directory 目录名 ('icons' 或 'data')
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteFile(fileName, directory = 'data') {
        try {
            if (this.storageMode === 'fs-api') {
                // 使用File System Access API删除文件
                const dirHandle = directory === 'icons' ? this.iconsDirectoryHandle : this.dataDirectoryHandle;
                
                if (!dirHandle) {
                    throw new Error('目录未初始化');
                }
                
                await dirHandle.removeEntry(fileName);
                return true;
            } else {
                // 使用localStorage删除文件
                const key = `${directory}/${fileName}`;
                localStorage.removeItem(key);
                return true;
            }
        } catch (error) {
            console.error(`删除文件 ${fileName} 失败:`, error);
            return false;
        }
    }
    
    /**
     * 列出目录中的所有文件
     * @param {string} directory 目录名 ('icons' 或 'data')
     * @returns {Promise<string[]>} 文件名列表
     */
    async listFiles(directory = 'data') {
        try {
            if (this.storageMode === 'fs-api') {
                // 使用File System Access API列出文件
                const dirHandle = directory === 'icons' ? this.iconsDirectoryHandle : this.dataDirectoryHandle;
                
                if (!dirHandle) {
                    throw new Error('目录未初始化');
                }
                
                const fileNames = [];
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file') {
                        fileNames.push(entry.name);
                    }
                }
                
                return fileNames;
            } else {
                // 使用localStorage列出文件
                const prefix = `${directory}/`;
                const fileNames = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(prefix)) {
                        fileNames.push(key.substring(prefix.length));
                    }
                }
                
                return fileNames;
            }
        } catch (error) {
            console.error(`列出目录 ${directory} 中的文件失败:`, error);
            return [];
        }
    }
    
    /**
     * 导出所有数据为ZIP文件
     * @returns {Promise<Blob|null>} ZIP文件Blob
     */
    async exportAllData() {
        try {
            // 创建新的JSZip实例
            const zip = new JSZip();
            
            // 添加icons目录
            const iconsFolder = zip.folder('icons');
            const iconFiles = await this.listFiles('icons');
            
            for (const fileName of iconFiles) {
                const content = await this.readFile(fileName, 'icons', 'blob');
                if (content) {
                    iconsFolder.file(fileName, content);
                }
            }
            
            // 添加data目录
            const dataFolder = zip.folder('data');
            const dataFiles = await this.listFiles('data');
            
            for (const fileName of dataFiles) {
                const content = await this.readFile(fileName, 'data', 'blob');
                if (content) {
                    dataFolder.file(fileName, content);
                }
            }
            
            // 生成ZIP文件
            return await zip.generateAsync({ type: 'blob' });
        } catch (error) {
            console.error('导出数据失败:', error);
            Utils.showToast('导出数据失败: ' + error.message, 'error');
            return null;
        }
    }
    
    /**
     * 导入ZIP文件数据
     * @param {File} zipFile ZIP文件
     * @returns {Promise<boolean>} 是否导入成功
     */
    async importFromZip(zipFile) {
        try {
            // 读取ZIP文件
            const zip = await JSZip.loadAsync(zipFile);
            
            // 导入icons目录
            const iconsFolder = zip.folder('icons');
            if (iconsFolder) {
                const iconFiles = Object.keys(iconsFolder.files)
                    .filter(path => !path.endsWith('/') && path.startsWith('icons/'))
                    .map(path => path.substring('icons/'.length));
                
                for (const fileName of iconFiles) {
                    const content = await zip.file(`icons/${fileName}`).async('blob');
                    await this.saveFile(fileName, content, 'icons');
                }
            }
            
            // 导入data目录
            const dataFolder = zip.folder('data');
            if (dataFolder) {
                const dataFiles = Object.keys(dataFolder.files)
                    .filter(path => !path.endsWith('/') && path.startsWith('data/'))
                    .map(path => path.substring('data/'.length));
                
                for (const fileName of dataFiles) {
                    const content = await zip.file(`data/${fileName}`).async('blob');
                    await this.saveFile(fileName, content, 'data');
                }
            }
            
            Utils.showToast('数据导入成功', 'success');
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            Utils.showToast('导入数据失败: ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * 清除所有数据
     * @returns {Promise<boolean>} 是否清除成功
     */
    async clearAllData() {
        try {
            if (this.storageMode === 'fs-api') {
                // 使用File System Access API清除文件
                if (this.iconsDirectoryHandle) {
                    const iconFiles = await this.listFiles('icons');
                    for (const fileName of iconFiles) {
                        await this.deleteFile(fileName, 'icons');
                    }
                }
                
                if (this.dataDirectoryHandle) {
                    const dataFiles = await this.listFiles('data');
                    for (const fileName of dataFiles) {
                        await this.deleteFile(fileName, 'data');
                    }
                }
            } else {
                // 使用localStorage清除文件
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('icons/') || key.startsWith('data/')) {
                        keys.push(key);
                    }
                }
                
                for (const key of keys) {
                    localStorage.removeItem(key);
                }
            }
            
            Utils.showToast('所有数据已清除', 'success');
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            Utils.showToast('清除数据失败: ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * 获取存储使用情况
     * @returns {Promise<{total: number, icons: number, data: number}>} 存储使用情况（字节）
     */
    async getStorageUsage() {
        try {
            let iconsSize = 0;
            let dataSize = 0;
            
            if (this.storageMode === 'fs-api') {
                // 计算icons目录大小
                if (this.iconsDirectoryHandle) {
                    const iconFiles = await this.listFiles('icons');
                    for (const fileName of iconFiles) {
                        const file = await this.readFile(fileName, 'icons', 'blob');
                        if (file) {
                            iconsSize += file.size;
                        }
                    }
                }
                
                // 计算data目录大小
                if (this.dataDirectoryHandle) {
                    const dataFiles = await this.listFiles('data');
                    for (const fileName of dataFiles) {
                        const file = await this.readFile(fileName, 'data', 'blob');
                        if (file) {
                            dataSize += file.size;
                        }
                    }
                }
            } else {
                // 计算localStorage使用大小
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    const value = localStorage.getItem(key);
                    const size = (key.length + value.length) * 2; // 每个字符占2字节
                    
                    if (key.startsWith('icons/')) {
                        iconsSize += size;
                    } else if (key.startsWith('data/')) {
                        dataSize += size;
                    }
                }
            }
            
            return {
                total: iconsSize + dataSize,
                icons: iconsSize,
                data: dataSize
            };
        } catch (error) {
            console.error('获取存储使用情况失败:', error);
            return { total: 0, icons: 0, data: 0 };
        }
    }
    
    /**
     * 设置存储模式
     * @param {string} mode 存储模式 ('fs-api' 或 'local-storage')
     */
    setStorageMode(mode) {
        if (mode === 'fs-api' && !this.fsApiSupported) {
            Utils.showToast('您的浏览器不支持文件系统API，无法切换到该模式', 'error');
            return;
        }
        
        this.storageMode = mode;
        
        // 如果切换到文件系统API模式，但尚未选择目录，提示用户选择
        if (mode === 'fs-api' && !this.directoryHandle) {
            Utils.showToast('请选择一个工作目录', 'info');
        }
    }
    
    /**
     * 设置自动保存
     * @param {boolean} enabled 是否启用自动保存
     */
    setAutoSave(enabled) {
        this.autoSave = enabled;
    }
}

// 创建全局实例
window.fileSystem = new FileSystemManager();
