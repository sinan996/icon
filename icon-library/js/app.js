/**
 * app.js - 主应用程序模块
 * 
 * 负责初始化和协调各个模块的工作
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('初始化应用程序...');
        
        // 初始化文件系统
        await initializeFileSystem();
        
        // 初始化UI控制器
        initializeUIController();
        
        console.log('应用程序初始化完成');
    } catch (error) {
        console.error('应用程序初始化失败:', error);
        showErrorMessage('应用程序初始化失败: ' + error.message);
    }
});

/**
 * 初始化文件系统
 */
async function initializeFileSystem() {
    try {
        console.log('初始化文件系统...');
        
        // 检查浏览器支持
        if (!Utils.isFileSystemAccessSupported()) {
            console.warn('浏览器不支持File System Access API，将使用本地存储模式');
            showWarningMessage('您的浏览器不支持File System Access API，将使用本地存储模式。部分功能可能受限。');
        }
        
        // 初始化文件系统
        await window.fileSystem.initialize();
        
        console.log('文件系统初始化完成');
        return true;
    } catch (error) {
        console.error('文件系统初始化失败:', error);
        throw error;
    }
}

/**
 * 初始化UI控制器
 */
function initializeUIController() {
    try {
        console.log('初始化UI控制器...');
        
        // 初始化UI控制器
        window.uiController.initialize();
        
        console.log('UI控制器初始化完成');
        return true;
    } catch (error) {
        console.error('UI控制器初始化失败:', error);
        throw error;
    }
}

/**
 * 显示错误消息
 * @param {string} message 错误消息
 */
function showErrorMessage(message) {
    try {
        Utils.showToast(message, 'error', 5000);
    } catch (error) {
        // 如果Utils还没有加载，使用alert
        alert('错误: ' + message);
    }
}

/**
 * 显示警告消息
 * @param {string} message 警告消息
 */
function showWarningMessage(message) {
    try {
        Utils.showToast(message, 'warning', 5000);
    } catch (error) {
        // 如果Utils还没有加载，使用alert
        alert('警告: ' + message);
    }
}

// 检测浏览器是否支持所需的API
function checkBrowserSupport() {
    const missingFeatures = [];
    
    // 检查IndexedDB
    if (!window.indexedDB) {
        missingFeatures.push('IndexedDB');
    }
    
    // 检查localStorage
    if (!window.localStorage) {
        missingFeatures.push('localStorage');
    }
    
    // 检查FileReader API
    if (!window.FileReader) {
        missingFeatures.push('FileReader API');
    }
    
    // 检查Blob API
    if (!window.Blob) {
        missingFeatures.push('Blob API');
    }
    
    // 检查URL API
    if (!window.URL || !window.URL.createObjectURL) {
        missingFeatures.push('URL API');
    }
    
    if (missingFeatures.length > 0) {
        const message = `您的浏览器不支持以下功能: ${missingFeatures.join(', ')}。请使用最新版本的Chrome、Firefox、Edge或Safari浏览器。`;
        showWarningMessage(message);
        console.warn(message);
    }
    
    return missingFeatures.length === 0;
}

// 在页面加载时检查浏览器支持
checkBrowserSupport();
