/**
 * ui-controller.js - UI控制器模块
 * 
 * 负责处理用户界面交互和页面切换
 */

class UIController {
    constructor() {
        // 当前页面
        this.currentPage = 'dashboard';
        // 页面元素缓存
        this.elements = {};
        // 模块引用
        this.fs = window.fileSystem;
        this.iconManager = window.iconManager;
        this.categoryManager = window.categoryManager;
        this.colorCustomizer = window.colorCustomizer;
        this.exportManager = window.exportManager;
    }
    
    /**
     * 初始化UI控制器
     */
    initialize() {
        // 初始化页面元素缓存
        this.cacheElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 显示初始页面
        this.showPage('dashboard');
        
        // 检查文件系统状态
        this.checkFileSystemStatus();
    }
    
    /**
     * 缓存页面元素
     */
    cacheElements() {
        // 页面
        const pages = ['dashboard', 'icons', 'categories', 'upload', 'customize', 'export', 'settings'];
        pages.forEach(page => {
            this.elements[`${page}Page`] = document.getElementById(`${page}-page`);
        });
        
        // 侧边栏菜单项
        this.elements.menuItems = document.querySelectorAll('.sidebar-menu li');
        
        // 统计信息元素
        this.elements.iconCount = document.getElementById('icon-count');
        this.elements.categoryCount = document.getElementById('category-count');
        this.elements.storageUsage = document.getElementById('storage-usage');
        
        // 图标容器
        this.elements.recentIcons = document.getElementById('recent-icons');
        this.elements.iconsContainer = document.getElementById('icons-container');
        
        // 搜索框
        this.elements.iconSearch = document.getElementById('icon-search');
        
        // 分类树
        this.elements.iconCategories = document.getElementById('icon-categories');
        this.elements.categoriesList = document.getElementById('categories-list');
        
        // 上传区域
        this.elements.uploadDropzone = document.getElementById('upload-dropzone');
        this.elements.fileInput = document.getElementById('file-input');
        this.elements.selectFilesBtn = document.getElementById('select-files-btn');
        this.elements.uploadPreview = document.getElementById('upload-preview');
        this.elements.previewList = document.getElementById('preview-list');
        this.elements.previewCount = document.getElementById('preview-count');
        this.elements.batchCategories = document.getElementById('batch-categories');
        this.elements.confirmUploadBtn = document.getElementById('confirm-upload-btn');
        this.elements.cancelUploadBtn = document.getElementById('cancel-upload-btn');
        
        // 颜色自定义
        this.elements.customizeIcons = document.getElementById('customize-icons');
        this.elements.customizePreview = document.getElementById('customize-preview');
        this.elements.colorCustomizer = document.getElementById('color-customizer');
        this.elements.colorPreview = document.getElementById('color-preview');
        this.elements.colorSettings = document.getElementById('color-settings');
        this.elements.resetColorsBtn = document.getElementById('reset-colors-btn');
        this.elements.saveColorsBtn = document.getElementById('save-colors-btn');
        
        // 导出
        this.elements.exportScope = document.getElementById('export-scope');
        this.elements.exportCategorySelector = document.getElementById('export-category-selector');
        this.elements.exportCategory = document.getElementById('export-category');
        this.elements.exportIconSelector = document.getElementById('export-icon-selector');
        this.elements.exportIcons = document.getElementById('export-icons');
        this.elements.exportJson = document.getElementById('export-json');
        this.elements.exportSvg = document.getElementById('export-svg');
        this.elements.exportZip = document.getElementById('export-zip');
        this.elements.generateExportBtn = document.getElementById('generate-export-btn');
        this.elements.exportPreview = document.getElementById('export-preview');
        this.elements.exportResult = document.getElementById('export-result');
        this.elements.usageCode = document.getElementById('usage-code');
        
        // 设置
        this.elements.workingDirInput = document.getElementById('working-dir-input');
        this.elements.selectDirBtn = document.getElementById('select-dir-btn');
        this.elements.dirStatus = document.getElementById('dir-status');
        this.elements.autoSave = document.getElementById('auto-save');
        this.elements.autoBackup = document.getElementById('auto-backup');
        this.elements.storageMode = document.getElementById('storage-mode');
        this.elements.importBackupBtn = document.getElementById('import-backup-btn');
        this.elements.exportBackupBtn = document.getElementById('export-backup-btn');
        this.elements.resetDataBtn = document.getElementById('reset-data-btn');
        
        // 模态框
        this.elements.iconDetailModal = document.getElementById('icon-detail-modal');
        this.elements.categoryEditModal = document.getElementById('category-edit-modal');
        this.elements.confirmModal = document.getElementById('confirm-modal');
        
        // 按钮
        this.elements.exportDataBtn = document.getElementById('export-data-btn');
        this.elements.importDataBtn = document.getElementById('import-data-btn');
        this.elements.addIconBtn = document.getElementById('add-icon-btn');
        this.elements.addCategoryBtn = document.getElementById('add-category-btn');
        this.elements.dashboardUploadBtn = document.getElementById('dashboard-upload-btn');
        this.elements.iconsUploadBtn = document.getElementById('icons-upload-btn');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 侧边栏菜单项点击事件
        this.elements.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                this.showPage(page);
            });
        });
        
        // 搜索框输入事件
        if (this.elements.iconSearch) {
            this.elements.iconSearch.addEventListener('input', Utils.debounce(() => {
                this.searchIcons();
            }, 300));
        }
        
        // 上传相关事件
        if (this.elements.selectFilesBtn) {
            this.elements.selectFilesBtn.addEventListener('click', () => {
                this.elements.fileInput.click();
            });
        }
        
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }
        
        if (this.elements.uploadDropzone) {
            this.elements.uploadDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.uploadDropzone.classList.add('dragover');
            });
            
            this.elements.uploadDropzone.addEventListener('dragleave', () => {
                this.elements.uploadDropzone.classList.remove('dragover');
            });
            
            this.elements.uploadDropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.uploadDropzone.classList.remove('dragover');
                
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileSelect(e.dataTransfer.files);
                }
            });
        }
        
        if (this.elements.confirmUploadBtn) {
            this.elements.confirmUploadBtn.addEventListener('click', () => {
                this.uploadIcons();
            });
        }
        
        if (this.elements.cancelUploadBtn) {
            this.elements.cancelUploadBtn.addEventListener('click', () => {
                this.cancelUpload();
            });
        }
        
        // 颜色自定义相关事件
        if (this.elements.resetColorsBtn) {
            this.elements.resetColorsBtn.addEventListener('click', () => {
                this.resetColors();
            });
        }
        
        if (this.elements.saveColorsBtn) {
            this.elements.saveColorsBtn.addEventListener('click', () => {
                this.saveColors();
            });
        }
        
        // 导出相关事件
        if (this.elements.exportScope) {
            this.elements.exportScope.addEventListener('change', () => {
                this.updateExportUI();
            });
        }
        
        if (this.elements.generateExportBtn) {
            this.elements.generateExportBtn.addEventListener('click', () => {
                this.generateExport();
            });
        }
        
        // 设置相关事件
        if (this.elements.selectDirBtn) {
            this.elements.selectDirBtn.addEventListener('click', () => {
                this.selectWorkingDirectory();
            });
        }
        
        if (this.elements.autoSave) {
            this.elements.autoSave.addEventListener('change', () => {
                this.fs.setAutoSave(this.elements.autoSave.checked);
            });
        }
        
        if (this.elements.storageMode) {
            this.elements.storageMode.addEventListener('change', () => {
                this.fs.setStorageMode(this.elements.storageMode.value);
            });
        }
        
        if (this.elements.importBackupBtn) {
            this.elements.importBackupBtn.addEventListener('click', () => {
                this.importBackup();
            });
        }
        
        if (this.elements.exportBackupBtn) {
            this.elements.exportBackupBtn.addEventListener('click', () => {
                this.exportBackup();
            });
        }
        
        if (this.elements.resetDataBtn) {
            this.elements.resetDataBtn.addEventListener('click', () => {
                this.confirmResetData();
            });
        }
        
        // 其他按钮事件
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        if (this.elements.importDataBtn) {
            this.elements.importDataBtn.addEventListener('click', () => {
                this.importData();
            });
        }
        
        if (this.elements.addIconBtn) {
            this.elements.addIconBtn.addEventListener('click', () => {
                this.showPage('upload');
            });
        }
        
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
        }
        
        if (this.elements.dashboardUploadBtn) {
            this.elements.dashboardUploadBtn.addEventListener('click', () => {
                this.showPage('upload');
            });
        }
        
        if (this.elements.iconsUploadBtn) {
            this.elements.iconsUploadBtn.addEventListener('click', () => {
                this.showPage('upload');
            });
        }
    }
    
    /**
     * 显示页面
     * @param {string} pageName 页面名称
     */
    showPage(pageName) {
        // 隐藏所有页面
        const pages = ['dashboard', 'icons', 'categories', 'upload', 'customize', 'export', 'settings'];
        pages.forEach(page => {
            if (this.elements[`${page}Page`]) {
                this.elements[`${page}Page`].classList.add('hidden');
            }
        });
        
        // 显示指定页面
        if (this.elements[`${pageName}Page`]) {
            this.elements[`${pageName}Page`].classList.remove('hidden');
        }
        
        // 更新菜单项激活状态
        this.elements.menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });
        
        // 更新当前页面
        this.currentPage = pageName;
        
        // 页面特定初始化
        switch (pageName) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'icons':
                this.initIconsPage();
                break;
            case 'categories':
                this.initCategoriesPage();
                break;
            case 'upload':
                this.initUploadPage();
                break;
            case 'customize':
                this.initCustomizePage();
                break;
            case 'export':
                this.initExportPage();
                break;
            case 'settings':
                this.initSettingsPage();
                break;
        }
    }
    
    /**
     * 检查文件系统状态
     */
    async checkFileSystemStatus() {
        // 初始化文件系统
        await this.fs.initialize();
        
        // 更新UI显示
        this.fs.updateDirectoryDisplay();
        
        // 如果未设置工作目录，显示提示
        if (!this.fs.directoryHandle && this.fs.storageMode === 'fs-api') {
            Utils.showToast('请在设置页面选择一个工作目录', 'info');
        }
    }
    
    /**
     * 初始化控制台页面
     */
    async initDashboard() {
        try {
            // 初始化图标管理器和分类管理器
            if (!this.iconManager.initialized) {
                await this.iconManager.initialize();
            }
            
            if (!this.categoryManager.initialized) {
                await this.categoryManager.initialize();
            }
            
            // 更新统计信息
            this.updateStats();
            
            // 加载最近图标
            this.loadRecentIcons();
        } catch (error) {
            console.error('初始化控制台页面失败:', error);
        }
    }
    
    /**
     * 更新统计信息
     */
    async updateStats() {
        try {
            // 获取图标统计
            const iconStats = this.iconManager.getStats();
            if (this.elements.iconCount) {
                this.elements.iconCount.textContent = iconStats.total;
            }
            
            // 获取分类统计
            const categoryStats = this.categoryManager.getStats();
            if (this.elements.categoryCount) {
                this.elements.categoryCount.textContent = categoryStats.total;
            }
            
            // 获取存储使用情况
            const storageStats = await this.fs.getStorageUsage();
            if (this.elements.storageUsage) {
                this.elements.storageUsage.textContent = Utils.formatFileSize(storageStats.total);
            }
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }
    
    /**
     * 加载最近图标
     */
    async loadRecentIcons() {
        try {
            if (!this.elements.recentIcons) return;
            
            // 清空容器
            this.elements.recentIcons.innerHTML = '';
            
            // 获取最近图标
            const recentIcons = this.iconManager.getRecentIcons(8);
            
            // 如果没有图标，显示空状态
            if (recentIcons.length === 0) {
                const emptyState = document.getElementById('recent-icons-empty');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                return;
            }
            
            // 隐藏空状态
            const emptyState = document.getElementById('recent-icons-empty');
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            
            // 渲染图标
            for (const icon of recentIcons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                    <div class="icon-category">${this.getCategoryNames(icon.categories)}</div>
                `;
                
                // 点击事件
                iconElement.addEventListener('click', () => {
                    this.showIconDetail(icon.id);
                });
                
                this.elements.recentIcons.appendChild(iconElement);
            }
        } catch (error) {
            console.error('加载最近图标失败:', error);
        }
    }
    
    /**
     * 获取分类名称
     * @param {Array<string>} categoryIds 分类ID数组
     * @returns {string} 分类名称
     */
    getCategoryNames(categoryIds) {
        if (!categoryIds || categoryIds.length === 0) {
            return '未分类';
        }
        
        const names = categoryIds.map(id => {
            const category = this.categoryManager.getCategoryById(id);
            return category ? category.name : '';
        }).filter(Boolean);
        
        return names.length > 0 ? names.join(', ') : '未分类';
    }
    
    /**
     * 初始化图标页面
     */
    async initIconsPage() {
        try {
            // 初始化图标管理器和分类管理器
            if (!this.iconManager.initialized) {
                await this.iconManager.initialize();
            }
            
            if (!this.categoryManager.initialized) {
                await this.categoryManager.initialize();
            }
            
            // 加载分类树
            this.loadCategoryTree();
            
            // 加载图标
            this.loadIcons();
        } catch (error) {
            console.error('初始化图标页面失败:', error);
        }
    }
    
    /**
     * 加载分类树
     */
    loadCategoryTree() {
        try {
            if (!this.elements.iconCategories) return;
            
            // 保留"所有图标"选项
            const allItem = this.elements.iconCategories.querySelector('[data-category="all"]');
            this.elements.iconCategories.innerHTML = '';
            if (allItem) {
                this.elements.iconCategories.appendChild(allItem);
            }
            
            // 获取分类树
            const categoryTree = this.categoryManager.getCategoryTree();
            
            // 渲染分类树
            this.renderCategoryTree(categoryTree, this.elements.iconCategories);
        } catch (error) {
            console.error('加载分类树失败:', error);
        }
    }
    
    /**
     * 渲染分类树
     * @param {Array<Object>} categories 分类数组
     * @param {HTMLElement} container 容器元素
     */
    renderCategoryTree(categories, container) {
        for (const category of categories) {
            const item = document.createElement('li');
            item.className = 'category-item';
            item.setAttribute('data-category', category.id);
            
            item.innerHTML = `
                <div class="category-item-name">
                    <i class="bi bi-folder"></i> ${category.name}
                </div>
            `;
            
            // 点击事件
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 更新激活状态
                container.querySelectorAll('.category-item').forEach(el => {
                    el.classList.remove('active');
                });
                item.classList.add('active');
                
                // 加载该分类下的图标
                this.loadIcons(category.id);
            });
            
            container.appendChild(item);
            
            // 如果有子分类，递归渲染
            if (category.children && category.children.length > 0) {
                const childContainer = document.createElement('ul');
                childContainer.className = 'category-children';
                item.appendChild(childContainer);
                
                this.renderCategoryTree(category.children, childContainer);
            }
        }
    }
    
    /**
     * 加载图标
     * @param {string} categoryId 分类ID
     */
    async loadIcons(categoryId = 'all') {
        try {
            if (!this.elements.iconsContainer) return;
            
            // 清空容器
            this.elements.iconsContainer.innerHTML = '';
            
            // 获取图标
            const icons = categoryId === 'all' ? 
                this.iconManager.getAllIcons() : 
                this.iconManager.getIconsByCategory(categoryId);
            
            // 如果没有图标，显示空状态
            if (icons.length === 0) {
                const emptyState = document.getElementById('icons-empty');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                return;
            }
            
            // 隐藏空状态
            const emptyState = document.getElementById('icons-empty');
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            
            // 渲染图标
            for (const icon of icons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                    <div class="icon-category">${this.getCategoryNames(icon.categories)}</div>
                    <div class="icon-actions">
                        <div class="icon-action-btn" title="编辑"><i class="bi bi-pencil"></i></div>
                        <div class="icon-action-btn" title="删除"><i class="bi bi-trash"></i></div>
                    </div>
                `;
                
                // 点击事件
                iconElement.addEventListener('click', () => {
                    this.showIconDetail(icon.id);
                });
                
                // 编辑按钮点击事件
                const editBtn = iconElement.querySelector('.icon-action-btn[title="编辑"]');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showIconDetail(icon.id);
                    });
                }
                
                // 删除按钮点击事件
                const deleteBtn = iconElement.querySelector('.icon-action-btn[title="删除"]');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.confirmDeleteIcon(icon.id);
                    });
                }
                
                this.elements.iconsContainer.appendChild(iconElement);
            }
        } catch (error) {
            console.error('加载图标失败:', error);
        }
    }
    
    /**
     * 搜索图标
     */
    async searchIcons() {
        try {
            if (!this.elements.iconSearch || !this.elements.iconsContainer) return;
            
            // 获取搜索关键词
            const query = this.elements.iconSearch.value.trim();
            
            // 获取当前选中的分类
            const activeCategory = this.elements.iconCategories.querySelector('.category-item.active');
            const categoryId = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
            
            // 搜索图标
            const icons = this.iconManager.searchIcons(query, categoryId);
            
            // 清空容器
            this.elements.iconsContainer.innerHTML = '';
            
            // 如果没有图标，显示空状态
            if (icons.length === 0) {
                const emptyState = document.getElementById('icons-empty');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                return;
            }
            
            // 隐藏空状态
            const emptyState = document.getElementById('icons-empty');
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            
            // 渲染图标
            for (const icon of icons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                    <div class="icon-category">${this.getCategoryNames(icon.categories)}</div>
                    <div class="icon-actions">
                        <div class="icon-action-btn" title="编辑"><i class="bi bi-pencil"></i></div>
                        <div class="icon-action-btn" title="删除"><i class="bi bi-trash"></i></div>
                    </div>
                `;
                
                // 点击事件
                iconElement.addEventListener('click', () => {
                    this.showIconDetail(icon.id);
                });
                
                // 编辑按钮点击事件
                const editBtn = iconElement.querySelector('.icon-action-btn[title="编辑"]');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showIconDetail(icon.id);
                    });
                }
                
                // 删除按钮点击事件
                const deleteBtn = iconElement.querySelector('.icon-action-btn[title="删除"]');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.confirmDeleteIcon(icon.id);
                    });
                }
                
                this.elements.iconsContainer.appendChild(iconElement);
            }
        } catch (error) {
            console.error('搜索图标失败:', error);
        }
    }
    
    /**
     * 初始化分类页面
     */
    async initCategoriesPage() {
        try {
            // 初始化分类管理器
            if (!this.categoryManager.initialized) {
                await this.categoryManager.initialize();
            }
            
            // 加载分类列表
            this.loadCategories();
        } catch (error) {
            console.error('初始化分类页面失败:', error);
        }
    }
    
    /**
     * 加载分类列表
     */
    loadCategories() {
        try {
            if (!this.elements.categoriesList) return;
            
            // 清空容器
            this.elements.categoriesList.innerHTML = '';
            
            // 获取所有分类
            const categories = this.categoryManager.getAllCategories();
            
            // 如果没有分类，显示空状态
            if (categories.length === 0) {
                const emptyState = document.getElementById('categories-empty');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                return;
            }
            
            // 隐藏空状态
            const emptyState = document.getElementById('categories-empty');
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            
            // 获取分类树
            const categoryTree = this.categoryManager.getCategoryTree();
            
            // 渲染分类树
            this.renderCategoryList(categoryTree, this.elements.categoriesList);
        } catch (error) {
            console.error('加载分类列表失败:', error);
        }
    }
    
    /**
     * 渲染分类列表
     * @param {Array<Object>} categories 分类数组
     * @param {HTMLElement} container 容器元素
     */
    renderCategoryList(categories, container) {
        for (const category of categories) {
            const item = document.createElement('li');
            item.className = 'category-item';
            item.setAttribute('data-category', category.id);
            
            item.innerHTML = `
                <div class="category-item-name">
                    <i class="bi bi-folder"></i> ${category.name}
                </div>
                <div class="category-actions">
                    <div class="icon-action-btn" title="编辑"><i class="bi bi-pencil"></i></div>
                    <div class="icon-action-btn" title="删除"><i class="bi bi-trash"></i></div>
                </div>
            `;
            
            // 点击事件
            item.addEventListener('click', () => {
                // 更新激活状态
                container.querySelectorAll('.category-item').forEach(el => {
                    el.classList.remove('active');
                });
                item.classList.add('active');
                
                // 显示分类详情
                this.showCategoryDetail(category.id);
            });
            
            // 编辑按钮点击事件
            const editBtn = item.querySelector('.icon-action-btn[title="编辑"]');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditCategoryModal(category.id);
                });
            }
            
            // 删除按钮点击事件
            const deleteBtn = item.querySelector('.icon-action-btn[title="删除"]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.confirmDeleteCategory(category.id);
                });
            }
            
            container.appendChild(item);
            
            // 如果有子分类，递归渲染
            if (category.children && category.children.length > 0) {
                const childContainer = document.createElement('ul');
                childContainer.className = 'category-children';
                item.appendChild(childContainer);
                
                this.renderCategoryList(category.children, childContainer);
            }
        }
    }
    
    /**
     * 显示分类详情
     * @param {string} categoryId 分类ID
     */
    async showCategoryDetail(categoryId) {
        try {
            const categoryDetails = document.getElementById('category-details');
            const categoryIcons = document.getElementById('category-icons');
            const categoryIconsEmpty = document.getElementById('category-icons-empty');
            
            if (!categoryDetails || !categoryIcons || !categoryIconsEmpty) return;
            
            // 获取分类
            const category = this.categoryManager.getCategoryById(categoryId);
            
            if (!category) {
                categoryDetails.innerHTML = `
                    <div class="empty-state">
                        <i class="bi bi-emoji-frown"></i>
                        <h4>分类不存在</h4>
                        <p>请选择一个有效的分类</p>
                    </div>
                `;
                return;
            }
            
            // 获取父分类
            let parentName = '无 (顶级分类)';
            if (category.parent) {
                const parent = this.categoryManager.getCategoryById(category.parent);
                if (parent) {
                    parentName = parent.name;
                }
            }
            
            // 显示分类详情
            categoryDetails.innerHTML = `
                <div class="form-group">
                    <label class="form-label">分类名称</label>
                    <input type="text" class="form-control" value="${category.name}" readonly>
                </div>
                <div class="form-group mt-3">
                    <label class="form-label">描述</label>
                    <textarea class="form-control" rows="2" readonly>${category.description || ''}</textarea>
                </div>
                <div class="form-group mt-3">
                    <label class="form-label">父分类</label>
                    <input type="text" class="form-control" value="${parentName}" readonly>
                </div>
                <div class="form-group mt-3">
                    <label class="form-label">创建时间</label>
                    <input type="text" class="form-control" value="${new Date(category.created).toLocaleString()}" readonly>
                </div>
                <div class="form-group mt-3">
                    <label class="form-label">修改时间</label>
                    <input type="text" class="form-control" value="${new Date(category.modified).toLocaleString()}" readonly>
                </div>
                <div class="mt-4">
                    <button class="btn btn-primary" id="edit-category-btn">
                        <i class="bi bi-pencil"></i> 编辑分类
                    </button>
                </div>
            `;
            
            // 编辑按钮点击事件
            const editBtn = categoryDetails.querySelector('#edit-category-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.showEditCategoryModal(category.id);
                });
            }
            
            // 获取该分类下的图标
            const icons = this.iconManager.getIconsByCategory(category.id);
            
            // 清空图标容器
            categoryIcons.innerHTML = '';
            
            // 如果没有图标，显示空状态
            if (icons.length === 0) {
                categoryIconsEmpty.classList.remove('hidden');
                return;
            }
            
            // 隐藏空状态
            categoryIconsEmpty.classList.add('hidden');
            
            // 渲染图标
            for (const icon of icons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                `;
                
                // 点击事件
                iconElement.addEventListener('click', () => {
                    this.showIconDetail(icon.id);
                });
                
                categoryIcons.appendChild(iconElement);
            }
        } catch (error) {
            console.error('显示分类详情失败:', error);
        }
    }
    
    /**
     * 初始化上传页面
     */
    async initUploadPage() {
        try {
            // 初始化图标管理器和分类管理器
            if (!this.iconManager.initialized) {
                await this.iconManager.initialize();
            }
            
            if (!this.categoryManager.initialized) {
                await this.categoryManager.initialize();
            }
            
            // 加载分类选择器
            this.loadCategorySelector();
        } catch (error) {
            console.error('初始化上传页面失败:', error);
        }
    }
    
    /**
     * 加载分类选择器
     */
    loadCategorySelector() {
        try {
            if (!this.elements.batchCategories) return;
            
            // 清空容器
            this.elements.batchCategories.innerHTML = '';
            
            // 获取所有分类
            const categories = this.categoryManager.getAllCategories();
            
            // 渲染分类选择器
            for (const category of categories) {
                const checkbox = document.createElement('div');
                checkbox.className = 'category-checkbox';
                
                checkbox.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="cat-${category.id}" value="${category.id}">
                        <label class="form-check-label" for="cat-${category.id}">${category.name}</label>
                    </div>
                `;
                
                this.elements.batchCategories.appendChild(checkbox);
            }
        } catch (error) {
            console.error('加载分类选择器失败:', error);
        }
    }
    
    /**
     * 处理文件选择
     * @param {FileList} files 文件列表
     */
    async handleFileSelect(files) {
        try {
            // 过滤SVG文件
            const svgFiles = Array.from(files).filter(file => 
                file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
            );
            
            if (svgFiles.length === 0) {
                Utils.showToast('请选择SVG文件', 'warning');
                return;
            }
            
            // 显示上传预览
            this.elements.uploadDropzone.classList.add('hidden');
            this.elements.uploadPreview.classList.remove('hidden');
            
            // 更新预览数量
            this.elements.previewCount.textContent = svgFiles.length;
            
            // 清空预览列表
            this.elements.previewList.innerHTML = '';
            
            // 处理每个文件
            for (const file of svgFiles) {
                // 读取SVG内容
                const svgContent = await Utils.readFileAsText(file);
                
                // 创建预览项
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.setAttribute('data-file', file.name);
                
                // 提取文件名（不含扩展名）
                const baseName = Utils.getBaseName(file.name);
                
                previewItem.innerHTML = `
                    <div class="preview-item-header">
                        <div class="preview-item-name">${baseName}</div>
                        <div class="icon-action-btn" title="移除"><i class="bi bi-x"></i></div>
                    </div>
                    <div class="preview-item-icon">${svgContent}</div>
                    <div class="preview-item-form">
                        <div class="form-group">
                            <input type="text" class="form-control form-control-sm icon-name-input" placeholder="图标名称" value="${baseName}">
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" class="form-control form-control-sm icon-tags-input" placeholder="标签 (用逗号分隔)">
                        </div>
                    </div>
                `;
                
                // 移除按钮点击事件
                const removeBtn = previewItem.querySelector('.icon-action-btn[title="移除"]');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        previewItem.remove();
                        
                        // 更新预览数量
                        const count = this.elements.previewList.children.length;
                        this.elements.previewCount.textContent = count;
                        
                        // 如果没有文件了，返回上传区域
                        if (count === 0) {
                            this.cancelUpload();
                        }
                    });
                }
                
                // 存储文件引用
                previewItem.file = file;
                
                this.elements.previewList.appendChild(previewItem);
            }
        } catch (error) {
            console.error('处理文件选择失败:', error);
            Utils.showToast('处理文件失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 取消上传
     */
    cancelUpload() {
        // 清空文件输入
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
        
        // 显示上传区域，隐藏预览
        this.elements.uploadDropzone.classList.remove('hidden');
        this.elements.uploadPreview.classList.add('hidden');
        
        // 清空预览列表
        this.elements.previewList.innerHTML = '';
    }
    
    /**
     * 上传图标
     */
    async uploadIcons() {
        try {
            // 获取预览项
            const previewItems = this.elements.previewList.querySelectorAll('.preview-item');
            
            if (previewItems.length === 0) {
                Utils.showToast('没有要上传的图标', 'warning');
                return;
            }
            
            // 获取批量选择的分类
            const selectedCategories = [];
            const categoryCheckboxes = this.elements.batchCategories.querySelectorAll('input[type="checkbox"]:checked');
            categoryCheckboxes.forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            
            // 准备上传数据
            const icons = [];
            const duplicateIcons = [];
            
            // 获取所有现有图标
            const existingIcons = this.iconManager.getAllIcons();
            const existingNamesMap = {};
            
            // 创建名称到图标的映射，方便查找
            existingIcons.forEach(icon => {
                existingNamesMap[icon.name.toLowerCase()] = icon;
            });
            
            // 检查每个图标名称是否重复
            for (const item of previewItems) {
                // 获取文件
                const file = item.file;
                if (!file) continue;
                
                // 获取图标名称
                const nameInput = item.querySelector('.icon-name-input');
                const name = nameInput ? nameInput.value.trim() : Utils.getBaseName(file.name);
                
                // 检查名称是否已存在
                const nameLower = name.toLowerCase();
                if (existingNamesMap[nameLower]) {
                    // 添加到重复列表
                    duplicateIcons.push({
                        name,
                        file,
                        item,
                        nameInput,
                        existingIcon: existingNamesMap[nameLower],
                        previewHTML: item.querySelector('.preview-item-icon').innerHTML
                    });
                    continue;
                }
                
                // 获取标签
                const tagsInput = item.querySelector('.icon-tags-input');
                const tagsText = tagsInput ? tagsInput.value.trim() : '';
                const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                
                // 创建图标数据
                icons.push({
                    data: {
                        name,
                        description: '',
                        categories: selectedCategories,
                        tags,
                        colors: ['#000000'],
                        multicolor: false
                    },
                    file
                });
            }
            
            // 如果有重复图标，显示重复图标列表
            if (duplicateIcons.length > 0) {
                // 创建重复图标列表内容
                const duplicateContent = document.createElement('div');
                duplicateContent.className = 'duplicate-icons-content';
                
                let duplicateHTML = `
                    <div class="alert alert-warning mb-3">
                        <i class="bi bi-exclamation-triangle"></i> 
                        发现 ${duplicateIcons.length} 个图标与库中已有图标重名，请选择处理方式
                    </div>
                    <div class="duplicate-icons-list">
                `;
                
                // 添加每个重复图标的信息
                duplicateIcons.forEach((icon, index) => {
                    duplicateHTML += `
                        <div class="duplicate-item" data-index="${index}">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <strong>上传图标</strong>
                                        </div>
                                        <div class="card-body">
                                            <div class="duplicate-icon">
                                                ${icon.previewHTML}
                                            </div>
                                            <div class="duplicate-info mt-2">
                                                <div class="form-group">
                                                    <label class="form-label">图标名称</label>
                                                    <input type="text" class="form-control duplicate-name-input" 
                                                        value="${icon.name}" data-original="${icon.name}">
                                                    <div class="form-text text-danger">名称已存在，请修改或删除</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <strong>库中已有图标</strong>
                                        </div>
                                        <div class="card-body">
                                            <div class="duplicate-icon existing-icon" data-id="${icon.existingIcon.id}">
                                                <!-- 这里将通过JS加载已有图标的SVG -->
                                            </div>
                                            <div class="duplicate-info mt-2">
                                                <p><strong>名称:</strong> ${icon.existingIcon.name}</p>
                                                <p><strong>分类:</strong> ${(icon.existingIcon.categories || []).join(', ') || '无'}</p>
                                                <p><strong>标签:</strong> ${(icon.existingIcon.tags || []).join(', ') || '无'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="duplicate-actions mt-2 text-center">
                                <button class="btn btn-outline-primary rename-icon-btn" title="修改名称后上传">
                                    <i class="bi bi-pencil"></i> 修改名称后上传
                                </button>
                                <button class="btn btn-outline-danger remove-duplicate-btn" title="不上传此图标">
                                    <i class="bi bi-trash"></i> 不上传此图标
                                </button>
                                <button class="btn btn-outline-warning replace-existing-btn" title="替换库中已有图标">
                                    <i class="bi bi-arrow-repeat"></i> 替换已有图标
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                duplicateHTML += `</div>`;
                
                // 添加操作按钮
                duplicateHTML += `
                    <div class="duplicate-global-actions mt-4">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> 
                            请处理所有重复图标后再继续上传。您也可以选择取消上传。
                        </div>
                    </div>
                `;
                
                duplicateContent.innerHTML = duplicateHTML;
                
                // 创建模态框
                const modal = Utils.createModal('重复图标处理', duplicateContent, async () => {
                    // 检查是否所有重复都已处理
                    const remainingDuplicates = duplicateContent.querySelectorAll('.duplicate-item:not(.removed):not(.renamed):not(.replaced)');
                    
                    if (remainingDuplicates.length > 0) {
                        Utils.showToast('请处理所有重复图标后再继续', 'warning');
                        return false; // 阻止模态框关闭
                    }
                    
                    // 处理重命名的图标
                    const renamedItems = duplicateContent.querySelectorAll('.duplicate-item.renamed');
                    renamedItems.forEach(item => {
                        const index = parseInt(item.getAttribute('data-index'));
                        const duplicateIcon = duplicateIcons[index];
                        if (!duplicateIcon) return;
                        
                        const nameInput = item.querySelector('.duplicate-name-input');
                        const newName = nameInput.value.trim();
                        
                        // 更新原始输入框中的名称
                        if (duplicateIcon.nameInput) {
                            duplicateIcon.nameInput.value = newName;
                        }
                    });
                    
                    // 处理要替换的图标
                    const replacedItems = duplicateContent.querySelectorAll('.duplicate-item.replaced');
                    for (const item of replacedItems) {
                        const index = parseInt(item.getAttribute('data-index'));
                        const duplicateIcon = duplicateIcons[index];
                        if (!duplicateIcon) continue;
                        
                        // 替换已有图标
                        try {
                            const existingId = duplicateIcon.existingIcon.id;
                            const svgContent = await Utils.readFileAsText(duplicateIcon.file);
                            
                            // 更新图标SVG
                            await this.iconManager.updateIconSVG(existingId, svgContent);
                            
                            // 从预览列表中移除
                            duplicateIcon.item.remove();
                        } catch (error) {
                            console.error('替换图标失败:', error);
                        }
                    }
                    
                    // 处理要移除的图标
                    const removedItems = duplicateContent.querySelectorAll('.duplicate-item.removed');
                    removedItems.forEach(item => {
                        const index = parseInt(item.getAttribute('data-index'));
                        const duplicateIcon = duplicateIcons[index];
                        if (!duplicateIcon) return;
                        
                        // 从预览列表中移除
                        duplicateIcon.item.remove();
                    });
                    
                    // 重新尝试上传
                    setTimeout(() => {
                        this.uploadIcons();
                    }, 100);
                    
                    return true;
                });
                
                // 显示模态框
                modal.show();
                
                // 加载已有图标的SVG
                duplicateIcons.forEach(async (icon, index) => {
                    try {
                        const svgContent = await this.iconManager.getIconSVG(icon.existingIcon.id);
                        const existingIconElement = duplicateContent.querySelector(`.duplicate-item[data-index="${index}"] .existing-icon`);
                        if (existingIconElement && svgContent) {
                            existingIconElement.innerHTML = svgContent;
                        }
                    } catch (error) {
                        console.error('加载已有图标失败:', error);
                    }
                });
                
                // 绑定事件
                const duplicateItems = duplicateContent.querySelectorAll('.duplicate-item');
                duplicateItems.forEach(item => {
                    // 名称输入框事件
                    const nameInput = item.querySelector('.duplicate-name-input');
                    if (nameInput) {
                        nameInput.addEventListener('input', () => {
                            const newName = nameInput.value.trim();
                            const originalName = nameInput.getAttribute('data-original');
                            const nameLower = newName.toLowerCase();
                            
                            // 检查新名称是否仍然重复
                            if (newName === originalName || existingNamesMap[nameLower]) {
                                nameInput.classList.add('is-invalid');
                                item.classList.remove('renamed');
                            } else {
                                nameInput.classList.remove('is-invalid');
                                item.classList.add('renamed');
                                item.classList.remove('removed', 'replaced');
                            }
                        });
                    }
                    
                    // 修改名称按钮事件
                    const renameBtn = item.querySelector('.rename-icon-btn');
                    if (renameBtn) {
                        renameBtn.addEventListener('click', () => {
                            const nameInput = item.querySelector('.duplicate-name-input');
                            if (nameInput) {
                                // 生成一个不重复的名称
                                const originalName = nameInput.getAttribute('data-original');
                                let newName = originalName;
                                let counter = 1;
                                
                                while (existingNamesMap[newName.toLowerCase()]) {
                                    newName = `${originalName}_${counter}`;
                                    counter++;
                                }
                                
                                nameInput.value = newName;
                                nameInput.classList.remove('is-invalid');
                                item.classList.add('renamed');
                                item.classList.remove('removed', 'replaced');
                                
                                // 触发输入事件以验证
                                nameInput.dispatchEvent(new Event('input'));
                            }
                        });
                    }
                    
                    // 移除按钮事件
                    const removeBtn = item.querySelector('.remove-duplicate-btn');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', () => {
                            item.classList.add('removed');
                            item.classList.remove('renamed', 'replaced');
                            item.style.opacity = '0.5';
                            
                            const nameInput = item.querySelector('.duplicate-name-input');
                            if (nameInput) {
                                nameInput.disabled = true;
                            }
                            
                            // 禁用所有按钮
                            const buttons = item.querySelectorAll('button');
                            buttons.forEach(button => {
                                button.disabled = true;
                            });
                        });
                    }
                    
                    // 替换按钮事件
                    const replaceBtn = item.querySelector('.replace-existing-btn');
                    if (replaceBtn) {
                        replaceBtn.addEventListener('click', () => {
                            Utils.showConfirm(
                                '确认替换',
                                '替换操作将使用上传的SVG内容替换库中已有图标，但保留原图标的名称、分类和标签等信息。此操作不可撤销，确定要继续吗？',
                                () => {
                                    item.classList.add('replaced');
                                    item.classList.remove('renamed', 'removed');
                                    item.style.opacity = '0.5';
                                    
                                    const nameInput = item.querySelector('.duplicate-name-input');
                                    if (nameInput) {
                                        nameInput.disabled = true;
                                    }
                                    
                                    // 禁用所有按钮
                                    const buttons = item.querySelectorAll('button');
                                    buttons.forEach(button => {
                                        button.disabled = true;
                                    });
                                }
                            );
                        });
                    }
                });
                
                // 添加取消按钮
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn btn-secondary';
                cancelBtn.textContent = '取消上传';
                cancelBtn.addEventListener('click', () => {
                    modal.hide();
                });
                
                // 添加确认按钮文本
                const confirmBtn = modal.element.querySelector('.modal-footer .btn-primary');
                if (confirmBtn) {
                    confirmBtn.textContent = '继续上传';
                }
                
                // 将取消按钮添加到模态框底部
                const footer = modal.element.querySelector('.modal-footer');
                if (footer && confirmBtn) {
                    footer.insertBefore(cancelBtn, confirmBtn);
                }
                
                return;
            }
            
            // 如果没有图标可上传
            if (icons.length === 0) {
                Utils.showToast('没有要上传的图标', 'warning');
                return;
            }
            
            // 显示加载状态
            this.elements.confirmUploadBtn.disabled = true;
            this.elements.confirmUploadBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> 上传中...';
            
            // 批量添加图标
            const addedIds = await this.iconManager.addIcons(icons);
            
            // 显示上传结果
            if (addedIds.length > 0) {
                // 创建结果对话框内容
                const resultContent = document.createElement('div');
                resultContent.className = 'upload-result';
                
                let resultHTML = `
                    <div class="alert alert-success mb-3">
                        <i class="bi bi-check-circle"></i> 
                        成功上传 ${addedIds.length} 个图标
                    </div>
                `;
                
                resultContent.innerHTML = resultHTML;
                
                // 创建模态框
                const modal = Utils.createModal('上传结果', resultContent, () => {
                    // 取消上传
                    this.cancelUpload();
                    
                    // 更新统计信息
                    this.updateStats();
                    
                    // 如果当前在控制台页面，刷新最近图标
                    if (this.currentPage === 'dashboard') {
                        this.loadRecentIcons();
                    }
                    
                    // 如果当前在图标页面，刷新图标列表
                    if (this.currentPage === 'icons') {
                        this.loadIcons();
                    }
                });
                
                // 显示模态框
                modal.show();
            } else {
                Utils.showToast('上传图标失败', 'error');
            }
        } catch (error) {
            console.error('上传图标失败:', error);
            Utils.showToast('上传图标失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            if (this.elements.confirmUploadBtn) {
                this.elements.confirmUploadBtn.disabled = false;
                this.elements.confirmUploadBtn.innerHTML = '<i class="bi bi-check2"></i> 确认上传';
            }
        }
    }
    
    /**
     * 初始化颜色自定义页面
     */
    async initCustomizePage() {
        try {
            // 初始化图标管理器
            if (!this.iconManager.initialized) {
                await this.iconManager.initialize();
            }
            
            // 加载图标
            this.loadCustomizeIcons();
        } catch (error) {
            console.error('初始化颜色自定义页面失败:', error);
        }
    }
    
    /**
     * 加载颜色自定义页面的图标
     */
    async loadCustomizeIcons() {
        try {
            if (!this.elements.customizeIcons) return;
            
            // 清空容器
            this.elements.customizeIcons.innerHTML = '';
            
            // 获取所有图标
            const icons = this.iconManager.getAllIcons();
            
            // 如果没有图标，显示空状态
            if (icons.length === 0) {
                const emptyState = document.getElementById('customize-icons-empty');
                if (emptyState) {
                    emptyState.classList.remove('hidden');
                }
                return;
            }
            
            // 隐藏空状态
            const emptyState = document.getElementById('customize-icons-empty');
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
            
            // 渲染图标
            for (const icon of icons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                `;
                
                // 点击事件
                iconElement.addEventListener('click', () => {
                    this.loadIconForCustomize(icon.id);
                });
                
                this.elements.customizeIcons.appendChild(iconElement);
            }
        } catch (error) {
            console.error('加载颜色自定义页面的图标失败:', error);
        }
    }
    
    /**
     * 加载图标进行颜色自定义
     * @param {string} iconId 图标ID
     */
    async loadIconForCustomize(iconId) {
        try {
            // 加载图标
            const success = await this.colorCustomizer.loadIcon(iconId);
            
            if (!success) {
                Utils.showToast('加载图标失败', 'error');
                return;
            }
            
            // 显示颜色自定义区域
            this.elements.customizePreview.innerHTML = '';
            this.elements.colorCustomizer.classList.remove('hidden');
            
            // 获取颜色
            const colors = this.colorCustomizer.getColors();
            
            // 更新预览
            this.updateColorPreview();
            
            // 更新颜色设置
            this.updateColorSettings(colors);
        } catch (error) {
            console.error('加载图标进行颜色自定义失败:', error);
            Utils.showToast('加载图标失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 更新颜色预览
     */
    updateColorPreview() {
        try {
            if (!this.elements.colorPreview) return;
            
            // 获取预览SVG
            const svgContent = this.colorCustomizer.getPreviewSVG();
            
            // 更新预览
            this.elements.colorPreview.innerHTML = svgContent;
        } catch (error) {
            console.error('更新颜色预览失败:', error);
        }
    }
    
    /**
     * 更新颜色设置
     * @param {Array<{original: string, current: string}>} colors 颜色数组
     */
    updateColorSettings(colors) {
        try {
            if (!this.elements.colorSettings) return;
            
            // 清空容器
            this.elements.colorSettings.innerHTML = '';
            
            // 如果是多色图标，显示提示
            if (colors.length > 1) {
                const multicolorInfo = document.createElement('div');
                multicolorInfo.className = 'alert alert-info';
                multicolorInfo.innerHTML = '<i class="bi bi-info-circle"></i> 这是一个多色图标，您可以分别修改每个颜色';
                this.elements.colorSettings.appendChild(multicolorInfo);
            }
            
            // 渲染颜色设置
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                const colorItem = document.createElement('div');
                colorItem.className = 'color-item';
                
                colorItem.innerHTML = `
                    <div class="color-item-header">
                        <div class="color-item-name">颜色 ${i + 1}</div>
                        <div class="color-item-preview" style="background-color: ${color.current}"></div>
                    </div>
                    <div class="input-group">
                        <input type="color" class="form-control form-control-color" value="${color.current}" data-original="${color.original}">
                        <input type="text" class="form-control" value="${color.current}">
                    </div>
                `;
                
                // 颜色选择器事件
                const colorPicker = colorItem.querySelector('input[type="color"]');
                const colorText = colorItem.querySelector('input[type="text"]');
                
                if (colorPicker && colorText) {
                    // 颜色选择器改变事件
                    colorPicker.addEventListener('input', () => {
                        const newColor = colorPicker.value;
                        colorText.value = newColor;
                        
                        // 更新颜色预览
                        const originalColor = colorPicker.getAttribute('data-original');
                        this.colorCustomizer.updateColor(originalColor, newColor);
                        this.updateColorPreview();
                        
                        // 更新颜色项预览
                        const preview = colorItem.querySelector('.color-item-preview');
                        if (preview) {
                            preview.style.backgroundColor = newColor;
                        }
                    });
                    
                    // 文本框改变事件
                    colorText.addEventListener('input', () => {
                        const newColor = colorText.value;
                        
                        // 验证颜色格式
                        if (/^#[0-9A-F]{6}$/i.test(newColor)) {
                            colorPicker.value = newColor;
                            
                            // 更新颜色预览
                            const originalColor = colorPicker.getAttribute('data-original');
                            this.colorCustomizer.updateColor(originalColor, newColor);
                            this.updateColorPreview();
                            
                            // 更新颜色项预览
                            const preview = colorItem.querySelector('.color-item-preview');
                            if (preview) {
                                preview.style.backgroundColor = newColor;
                            }
                        }
                    });
                }
                
                this.elements.colorSettings.appendChild(colorItem);
            }
        } catch (error) {
            console.error('更新颜色设置失败:', error);
        }
    }
    
    /**
     * 重置颜色
     */
    resetColors() {
        try {
            // 重置颜色
            this.colorCustomizer.resetColors();
            
            // 更新预览
            this.updateColorPreview();
            
            // 更新颜色设置
            this.updateColorSettings(this.colorCustomizer.getColors());
            
            Utils.showToast('颜色已重置', 'info');
        } catch (error) {
            console.error('重置颜色失败:', error);
            Utils.showToast('重置颜色失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 保存颜色设置
     */
    async saveColors() {
        try {
            // 保存颜色设置
            const success = await this.colorCustomizer.saveColorSettings();
            
            if (success) {
                Utils.showToast('颜色设置已保存', 'success');
            } else {
                Utils.showToast('保存颜色设置失败', 'error');
            }
        } catch (error) {
            console.error('保存颜色设置失败:', error);
            Utils.showToast('保存颜色设置失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 初始化导出页面
     */
    async initExportPage() {
        try {
            // 初始化图标管理器和分类管理器
            if (!this.iconManager.initialized) {
                await this.iconManager.initialize();
            }
            
            if (!this.categoryManager.initialized) {
                await this.categoryManager.initialize();
            }
            
            // 加载分类选择器
            this.loadExportCategorySelector();
            
            // 更新导出UI
            this.updateExportUI();
        } catch (error) {
            console.error('初始化导出页面失败:', error);
        }
    }
    
    /**
     * 加载导出页面的分类选择器
     */
    loadExportCategorySelector() {
        try {
            if (!this.elements.exportCategory) return;
            
            // 清空容器
            this.elements.exportCategory.innerHTML = '<option value="all">所有分类</option>';
            
            // 获取所有分类
            const categories = this.categoryManager.getAllCategories();
            
            // 渲染分类选择器
            for (const category of categories) {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                
                this.elements.exportCategory.appendChild(option);
            }
        } catch (error) {
            console.error('加载导出页面的分类选择器失败:', error);
        }
    }
    
    /**
     * 更新导出UI
     */
    updateExportUI() {
        try {
            if (!this.elements.exportScope) return;
            
            // 获取导出范围
            const scope = this.elements.exportScope.value;
            
            // 更新UI
            if (scope === 'category') {
                this.elements.exportCategorySelector.classList.remove('hidden');
                this.elements.exportIconSelector.classList.add('hidden');
            } else if (scope === 'selected') {
                this.elements.exportCategorySelector.classList.add('hidden');
                this.elements.exportIconSelector.classList.remove('hidden');
                
                // 加载图标选择器
                this.loadExportIconSelector();
            } else {
                this.elements.exportCategorySelector.classList.add('hidden');
                this.elements.exportIconSelector.classList.add('hidden');
            }
        } catch (error) {
            console.error('更新导出UI失败:', error);
        }
    }
    
    /**
     * 加载导出页面的图标选择器
     */
    async loadExportIconSelector() {
        try {
            if (!this.elements.exportIcons) return;
            
            // 清空容器
            this.elements.exportIcons.innerHTML = '';
            
            // 获取所有图标
            const icons = this.iconManager.getAllIcons();
            
            // 如果没有图标，显示提示
            if (icons.length === 0) {
                this.elements.exportIcons.innerHTML = '<div class="alert alert-info">没有可选择的图标</div>';
                return;
            }
            
            // 渲染图标
            for (const icon of icons) {
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                const iconElement = document.createElement('div');
                iconElement.className = 'icon-item';
                iconElement.setAttribute('data-id', icon.id);
                
                iconElement.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="export-icon-${icon.id}" value="${icon.id}">
                    </div>
                    <div class="icon-preview">${svgContent}</div>
                    <div class="icon-name">${icon.name}</div>
                `;
                
                this.elements.exportIcons.appendChild(iconElement);
            }
        } catch (error) {
            console.error('加载导出页面的图标选择器失败:', error);
        }
    }
    
    /**
     * 生成导出文件
     */
    async generateExport() {
        try {
            // 获取导出范围
            const scope = this.elements.exportScope.value;
            
            // 获取要导出的图标ID
            let iconIds = [];
            
            if (scope === 'all') {
                // 导出所有图标
                iconIds = this.iconManager.getAllIcons().map(icon => icon.id);
            } else if (scope === 'category') {
                // 导出指定分类的图标
                const categoryId = this.elements.exportCategory.value;
                iconIds = this.iconManager.getIconsByCategory(categoryId).map(icon => icon.id);
            } else if (scope === 'selected') {
                // 导出选定的图标
                const checkboxes = this.elements.exportIcons.querySelectorAll('input[type="checkbox"]:checked');
                iconIds = Array.from(checkboxes).map(checkbox => checkbox.value);
            }
            
            if (iconIds.length === 0) {
                Utils.showToast('没有要导出的图标', 'warning');
                return;
            }
            
            // 获取导出格式
            const exportJson = this.elements.exportJson.checked;
            const exportSvg = this.elements.exportSvg.checked;
            const exportZip = this.elements.exportZip.checked;
            
            if (!exportJson && !exportSvg) {
                Utils.showToast('请选择至少一种导出格式', 'warning');
                return;
            }
            
            // 显示加载状态
            this.elements.generateExportBtn.disabled = true;
            this.elements.generateExportBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> 生成中...';
            
            // 生成导出文件
            if (exportZip) {
                // 导出为ZIP文件
                const zipBlob = await this.exportManager.exportZIP(iconIds, exportJson, exportSvg);
                
                if (zipBlob) {
                    // 下载ZIP文件
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(zipBlob);
                    a.download = 'icon-library.zip';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(a.href);
                    
                    Utils.showToast('导出ZIP文件成功', 'success');
                } else {
                    Utils.showToast('导出ZIP文件失败', 'error');
                }
            } else if (exportJson) {
                // 导出为JSON文件
                const jsonData = await this.exportManager.exportJSON(iconIds);
                
                if (jsonData) {
                    // 下载JSON文件
                    Utils.downloadJSONFile(jsonData, 'icon-library.json');
                    
                    Utils.showToast('导出JSON文件成功', 'success');
                    
                    // 显示导出结果
                    this.showExportResult(jsonData);
                } else {
                    Utils.showToast('导出JSON文件失败', 'error');
                }
            } else if (exportSvg) {
                // 导出为SVG文件
                const svgFiles = await this.exportManager.exportSVG(iconIds);
                
                if (svgFiles && svgFiles.length > 0) {
                    // 如果只有一个文件，直接下载
                    if (svgFiles.length === 1) {
                        const file = svgFiles[0];
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(file.content);
                        a.download = file.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                    } else {
                        // 多个文件，打包为ZIP
                        const zip = new JSZip();
                        
                        for (const file of svgFiles) {
                            zip.file(file.name, file.content);
                        }
                        
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(zipBlob);
                        a.download = 'icons.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                    }
                    
                    Utils.showToast(`导出 ${svgFiles.length} 个SVG文件成功`, 'success');
                } else {
                    Utils.showToast('导出SVG文件失败', 'error');
                }
            }
        } catch (error) {
            console.error('生成导出文件失败:', error);
            Utils.showToast('生成导出文件失败: ' + error.message, 'error');
        } finally {
            // 恢复按钮状态
            if (this.elements.generateExportBtn) {
                this.elements.generateExportBtn.disabled = false;
                this.elements.generateExportBtn.innerHTML = '<i class="bi bi-gear"></i> 生成导出文件';
            }
        }
    }
    
    /**
     * 显示导出结果
     * @param {Object} jsonData JSON数据
     */
    showExportResult(jsonData) {
        try {
            if (!this.elements.exportResult || !this.elements.exportPreview || !this.elements.usageCode) return;
            
            // 隐藏预览，显示结果
            this.elements.exportPreview.classList.add('hidden');
            this.elements.exportResult.classList.remove('hidden');
            
            // 更新使用示例代码
            this.elements.usageCode.textContent = this.exportManager.getUsageExample('react');
            
            // 添加下载按钮事件
            const downloadBtn = this.elements.exportResult.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    Utils.downloadJSONFile(jsonData, 'icon-library.json');
                });
            }
        } catch (error) {
            console.error('显示导出结果失败:', error);
        }
    }
    
    /**
     * 初始化设置页面
     */
    async initSettingsPage() {
        try {
            // 更新工作目录显示
            this.fs.updateDirectoryDisplay();
            
            // 更新存储模式选择器
            if (this.elements.storageMode) {
                this.elements.storageMode.value = this.fs.storageMode;
            }
            
            // 更新自动保存开关
            if (this.elements.autoSave) {
                this.elements.autoSave.checked = this.fs.autoSave;
            }
        } catch (error) {
            console.error('初始化设置页面失败:', error);
        }
    }
    
    /**
     * 选择工作目录
     */
    async selectWorkingDirectory() {
        try {
            // 选择目录
            const success = await this.fs.selectDirectory();
            
            if (success) {
                // 更新UI显示
                this.fs.updateDirectoryDisplay();
                
                // 初始化图标管理器和分类管理器
                await this.iconManager.initialize();
                await this.categoryManager.initialize();
                
                // 更新统计信息
                this.updateStats();
            }
        } catch (error) {
            console.error('选择工作目录失败:', error);
            Utils.showToast('选择工作目录失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 导入备份
     */
    async importBackup() {
        try {
            // 创建文件输入元素
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.zip';
            
            // 监听文件选择事件
            fileInput.addEventListener('change', async (e) => {
                if (e.target.files.length === 0) return;
                
                const file = e.target.files[0];
                
                // 确认导入
                Utils.showConfirm(
                    '确认导入',
                    '导入将覆盖当前数据，确定要继续吗？',
                    async () => {
                        try {
                            // 显示加载状态
                            Utils.showToast('正在导入数据...', 'info');
                            
                            // 导入数据
                            const success = await this.fs.importFromZip(file);
                            
                            if (success) {
                                // 重新初始化
                                await this.iconManager.initialize();
                                await this.categoryManager.initialize();
                                
                                // 更新统计信息
                                this.updateStats();
                                
                                Utils.showToast('数据导入成功', 'success');
                            }
                        } catch (error) {
                            console.error('导入备份失败:', error);
                            Utils.showToast('导入备份失败: ' + error.message, 'error');
                        }
                    }
                );
            });
            
            // 触发文件选择
            fileInput.click();
        } catch (error) {
            console.error('导入备份失败:', error);
            Utils.showToast('导入备份失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 导出备份
     */
    async exportBackup() {
        try {
            // 显示加载状态
            Utils.showToast('正在导出数据...', 'info');
            
            // 导出数据
            const zipBlob = await this.fs.exportAllData();
            
            if (zipBlob) {
                // 下载ZIP文件
                const a = document.createElement('a');
                a.href = URL.createObjectURL(zipBlob);
                a.download = 'icon-library-backup.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
                
                Utils.showToast('数据导出成功', 'success');
            } else {
                Utils.showToast('数据导出失败', 'error');
            }
        } catch (error) {
            console.error('导出备份失败:', error);
            Utils.showToast('导出备份失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 确认重置数据
     */
    confirmResetData() {
        Utils.showConfirm(
            '确认重置',
            '重置将清除所有数据，此操作不可撤销，确定要继续吗？',
            async () => {
                try {
                    // 显示加载状态
                    Utils.showToast('正在重置数据...', 'info');
                    
                    // 清除数据
                    const success = await this.fs.clearAllData();
                    
                    if (success) {
                        // 重新初始化
                        await this.iconManager.initialize();
                        await this.categoryManager.initialize();
                        
                        // 更新统计信息
                        this.updateStats();
                        
                        Utils.showToast('数据已重置', 'success');
                    }
                } catch (error) {
                    console.error('重置数据失败:', error);
                    Utils.showToast('重置数据失败: ' + error.message, 'error');
                }
            }
        );
    }
    
    /**
     * 导出数据
     */
    async exportData() {
        try {
            // 显示加载状态
            Utils.showToast('正在导出数据...', 'info');
            
            // 导出数据
            const zipBlob = await this.fs.exportAllData();
            
            if (zipBlob) {
                // 下载ZIP文件
                const a = document.createElement('a');
                a.href = URL.createObjectURL(zipBlob);
                a.download = 'icon-library-data.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
                
                Utils.showToast('数据导出成功', 'success');
            } else {
                Utils.showToast('数据导出失败', 'error');
            }
        } catch (error) {
            console.error('导出数据失败:', error);
            Utils.showToast('导出数据失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 导入数据
     */
    async importData() {
        try {
            // 创建文件输入元素
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.zip';
            
            // 监听文件选择事件
            fileInput.addEventListener('change', async (e) => {
                if (e.target.files.length === 0) return;
                
                const file = e.target.files[0];
                
                // 确认导入
                Utils.showConfirm(
                    '确认导入',
                    '导入将覆盖当前数据，确定要继续吗？',
                    async () => {
                        try {
                            // 显示加载状态
                            Utils.showToast('正在导入数据...', 'info');
                            
                            // 导入数据
                            const success = await this.fs.importFromZip(file);
                            
                            if (success) {
                                // 重新初始化
                                await this.iconManager.initialize();
                                await this.categoryManager.initialize();
                                
                                // 更新统计信息
                                this.updateStats();
                                
                                // 如果当前在控制台页面，刷新最近图标
                                if (this.currentPage === 'dashboard') {
                                    this.loadRecentIcons();
                                }
                                
                                Utils.showToast('数据导入成功', 'success');
                            }
                        } catch (error) {
                            console.error('导入数据失败:', error);
                            Utils.showToast('导入数据失败: ' + error.message, 'error');
                        }
                    }
                );
            });
            
            // 触发文件选择
            fileInput.click();
        } catch (error) {
            console.error('导入数据失败:', error);
            Utils.showToast('导入数据失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 显示图标详情
     * @param {string} iconId 图标ID
     */
    async showIconDetail(iconId) {
        try {
            // 获取图标信息
            const icon = this.iconManager.getIconById(iconId);
            
            if (!icon) {
                Utils.showToast('图标不存在', 'error');
                return;
            }
            
            // 获取SVG内容
            const svgContent = await this.iconManager.getIconSVG(icon.id);
            if (!svgContent) {
                Utils.showToast('获取图标内容失败', 'error');
                return;
            }
            
            // 获取分类信息
            const categories = this.categoryManager.getAllCategories();
            const iconCategories = icon.categories || [];
            
            // 创建模态框内容
            const modalContent = document.createElement('div');
            modalContent.className = 'icon-detail-content';
            
            modalContent.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="icon-detail-preview">
                            ${svgContent}
                        </div>
                        <div class="icon-detail-actions mt-3">
                            <button class="btn btn-outline-primary btn-sm replace-icon-btn">
                                <i class="bi bi-arrow-repeat"></i> 替换图标
                            </button>
                            <button class="btn btn-outline-danger btn-sm delete-icon-btn">
                                <i class="bi bi-trash"></i> 删除图标
                            </button>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <form id="icon-detail-form">
                            <div class="form-group mb-3">
                                <label class="form-label">图标名称</label>
                                <input type="text" class="form-control" id="icon-name" value="${icon.name}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">描述</label>
                                <textarea class="form-control" id="icon-description" rows="2">${icon.description || ''}</textarea>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">标签 (用逗号分隔)</label>
                                <input type="text" class="form-control" id="icon-tags" value="${(icon.tags || []).join(', ')}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">分类</label>
                                <div class="category-checkboxes" id="icon-categories">
                                    ${categories.map(category => `
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" 
                                                id="cat-${category.id}" value="${category.id}"
                                                ${iconCategories.includes(category.id) ? 'checked' : ''}>
                                            <label class="form-check-label" for="cat-${category.id}">
                                                ${category.name}
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">创建时间</label>
                                <input type="text" class="form-control" value="${new Date(icon.created).toLocaleString()}" readonly>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">修改时间</label>
                                <input type="text" class="form-control" value="${new Date(icon.modified).toLocaleString()}" readonly>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="icon-replace-section mt-4 hidden">
                    <h5>替换图标</h5>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> 替换图标将保留原图标的名称、分类和标签等信息，仅更新SVG内容。
                    </div>
                    
                    <div class="icon-replace-dropzone" id="replace-dropzone">
                        <i class="bi bi-cloud-arrow-up"></i>
                        <p>拖放SVG文件到此处，或点击选择文件</p>
                        <input type="file" id="replace-file-input" accept=".svg" style="display: none;">
                        <button class="btn btn-primary" id="replace-select-btn">选择文件</button>
                    </div>
                    
                    <div class="icon-replace-preview mt-3 hidden" id="replace-preview">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">原图标</div>
                                    <div class="card-body">
                                        <div class="original-icon-preview">
                                            ${svgContent}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">新图标</div>
                                    <div class="card-body">
                                        <div class="new-icon-preview" id="new-icon-preview"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <button class="btn btn-primary" id="confirm-replace-btn">确认替换</button>
                            <button class="btn btn-secondary" id="cancel-replace-btn">取消</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 创建模态框
            const modal = Utils.createModal('图标详情', modalContent, async () => {
                // 获取修改后的数据
                const name = document.getElementById('icon-name').value.trim();
                const description = document.getElementById('icon-description').value.trim();
                const tagsText = document.getElementById('icon-tags').value.trim();
                const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                
                // 获取选中的分类
                const selectedCategories = [];
                const categoryCheckboxes = document.querySelectorAll('#icon-categories input[type="checkbox"]:checked');
                categoryCheckboxes.forEach(checkbox => {
                    selectedCategories.push(checkbox.value);
                });
                
                // 检查是否有修改
                const nameChanged = name !== icon.name;
                const descriptionChanged = description !== (icon.description || '');
                const tagsChanged = JSON.stringify(tags) !== JSON.stringify(icon.tags || []);
                const categoriesChanged = JSON.stringify(selectedCategories.sort()) !== JSON.stringify((icon.categories || []).sort());
                
                // 如果有修改，显示确认对话框
                if (nameChanged || descriptionChanged || tagsChanged || categoriesChanged) {
                    // 创建确认对话框内容
                    const confirmContent = document.createElement('div');
                    confirmContent.className = 'edit-confirm-content';
                    
                    let confirmHTML = '<div class="alert alert-info mb-3"><i class="bi bi-info-circle"></i> 您对图标进行了以下修改：</div><ul>';
                    
                    if (nameChanged) {
                        confirmHTML += `<li>名称: "${icon.name}" → "${name}"</li>`;
                    }
                    
                    if (descriptionChanged) {
                        confirmHTML += `<li>描述已修改</li>`;
                    }
                    
                    if (tagsChanged) {
                        confirmHTML += `<li>标签已修改</li>`;
                    }
                    
                    if (categoriesChanged) {
                        confirmHTML += `<li>分类已修改</li>`;
                    }
                    
                    confirmHTML += '</ul><p>请选择要执行的操作：</p>';
                    
                    confirmContent.innerHTML = confirmHTML;
                    
                    // 创建操作按钮
                    const actionButtons = document.createElement('div');
                    actionButtons.className = 'edit-action-buttons';
                    
                    // 保存修改按钮
                    const saveButton = document.createElement('button');
                    saveButton.className = 'btn btn-primary me-2';
                    saveButton.innerHTML = '<i class="bi bi-check-circle"></i> 保存修改';
                    
                    // 替换图标按钮
                    const replaceButton = document.createElement('button');
                    replaceButton.className = 'btn btn-info me-2';
                    replaceButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> 替换图标';
                    
                    // 取消按钮
                    const cancelButton = document.createElement('button');
                    cancelButton.className = 'btn btn-secondary';
                    cancelButton.innerHTML = '<i class="bi bi-x-circle"></i> 取消';
                    
                    // 添加按钮到容器
                    actionButtons.appendChild(saveButton);
                    actionButtons.appendChild(replaceButton);
                    actionButtons.appendChild(cancelButton);
                    confirmContent.appendChild(actionButtons);
                    
                    // 创建确认对话框
                    const confirmModal = Utils.createModal('确认修改图标', confirmContent);
                    
                    // 显示确认对话框
                    confirmModal.show();
                    
                    // 绑定按钮事件
                    saveButton.addEventListener('click', async () => {
                        confirmModal.hide();
                        
                        // 更新图标数据
                        const iconData = {
                            name,
                            description,
                            tags,
                            categories: selectedCategories
                        };
                        
                        const success = await this.iconManager.updateIcon(icon.id, iconData);
                        
                        if (success) {
                            Utils.showToast('图标信息已更新', 'success');
                            
                            // 刷新图标列表
                            if (this.currentPage === 'icons') {
                                // 获取当前选中的分类
                                const activeCategory = this.elements.iconCategories.querySelector('.category-item.active');
                                const categoryId = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
                                
                                this.loadIcons(categoryId);
                            }
                            
                            // 如果当前在控制台页面，刷新最近图标
                            if (this.currentPage === 'dashboard') {
                                this.loadRecentIcons();
                            }
                            
                            // 关闭详情模态框
                            modal.hide();
                        } else {
                            Utils.showToast('更新图标信息失败', 'error');
                        }
                    });
                    
                    replaceButton.addEventListener('click', () => {
                        confirmModal.hide();
                        
                        // 显示替换区域
                        const replaceSection = modalContent.querySelector('.icon-replace-section');
                        const replaceBtn = modalContent.querySelector('.replace-icon-btn');
                        
                        if (replaceSection && replaceBtn) {
                            replaceSection.classList.remove('hidden');
                            replaceBtn.disabled = true;
                        }
                    });
                    
                    cancelButton.addEventListener('click', () => {
                        confirmModal.hide();
                    });
                    
                    // 阻止详情模态框关闭
                    return false;
                }
                
                // 如果没有修改，直接关闭模态框
                return true;
            });
            
            // 显示模态框
            modal.show();
            
            // 绑定替换图标按钮事件
            const replaceBtn = modalContent.querySelector('.replace-icon-btn');
            const deleteBtn = modalContent.querySelector('.delete-icon-btn');
            const replaceSection = modalContent.querySelector('.icon-replace-section');
            const replaceDropzone = modalContent.querySelector('#replace-dropzone');
            const replaceFileInput = modalContent.querySelector('#replace-file-input');
            const replaceSelectBtn = modalContent.querySelector('#replace-select-btn');
            const replacePreview = modalContent.querySelector('#replace-preview');
            const newIconPreview = modalContent.querySelector('#new-icon-preview');
            const confirmReplaceBtn = modalContent.querySelector('#confirm-replace-btn');
            const cancelReplaceBtn = modalContent.querySelector('#cancel-replace-btn');
            
            // 替换按钮点击事件
            if (replaceBtn) {
                replaceBtn.addEventListener('click', () => {
                    replaceSection.classList.remove('hidden');
                    replaceBtn.disabled = true;
                });
            }
            
            // 删除按钮点击事件
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    modal.hide();
                    this.confirmDeleteIcon(icon.id);
                });
            }
            
            // 选择文件按钮点击事件
            if (replaceSelectBtn && replaceFileInput) {
                replaceSelectBtn.addEventListener('click', () => {
                    replaceFileInput.click();
                });
            }
            
            // 文件输入变化事件
            if (replaceFileInput) {
                replaceFileInput.addEventListener('change', async (e) => {
                    if (e.target.files.length === 0) return;
                    
                    const file = e.target.files[0];
                    
                    // 验证文件类型
                    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
                        Utils.showToast('请选择SVG文件', 'warning');
                        return;
                    }
                    
                    // 读取SVG内容
                    const svgContent = await Utils.readFileAsText(file);
                    
                    // 显示预览
                    replaceDropzone.classList.add('hidden');
                    replacePreview.classList.remove('hidden');
                    
                    // 更新新图标预览
                    if (newIconPreview) {
                        newIconPreview.innerHTML = svgContent;
                    }
                    
                    // 存储文件引用
                    replacePreview.file = file;
                });
            }
            
            // 拖放事件
            if (replaceDropzone) {
                replaceDropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    replaceDropzone.classList.add('dragover');
                });
                
                replaceDropzone.addEventListener('dragleave', () => {
                    replaceDropzone.classList.remove('dragover');
                });
                
                replaceDropzone.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    replaceDropzone.classList.remove('dragover');
                    
                    if (e.dataTransfer.files.length === 0) return;
                    
                    const file = e.dataTransfer.files[0];
                    
                    // 验证文件类型
                    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
                        Utils.showToast('请选择SVG文件', 'warning');
                        return;
                    }
                    
                    // 读取SVG内容
                    const svgContent = await Utils.readFileAsText(file);
                    
                    // 显示预览
                    replaceDropzone.classList.add('hidden');
                    replacePreview.classList.remove('hidden');
                    
                    // 更新新图标预览
                    if (newIconPreview) {
                        newIconPreview.innerHTML = svgContent;
                    }
                    
                    // 存储文件引用
                    replacePreview.file = file;
                });
            }
            
            // 确认替换按钮点击事件
            if (confirmReplaceBtn) {
                confirmReplaceBtn.addEventListener('click', async () => {
                    // 获取文件
                    const file = replacePreview.file;
                    
                    if (!file) {
                        Utils.showToast('请选择要替换的SVG文件', 'warning');
                        return;
                    }
                    
                    // 显示加载状态
                    confirmReplaceBtn.disabled = true;
                    confirmReplaceBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> 替换中...';
                    
                    try {
                        // 替换图标
                        const success = await this.iconManager.replaceIconSVG(icon.id, file);
                        
                        if (success) {
                            Utils.showToast('图标已替换', 'success');
                            
                            // 关闭模态框
                            modal.hide();
                            
                            // 刷新图标列表
                            if (this.currentPage === 'icons') {
                                // 获取当前选中的分类
                                const activeCategory = this.elements.iconCategories.querySelector('.category-item.active');
                                const categoryId = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
                                
                                this.loadIcons(categoryId);
                            }
                            
                            // 如果当前在控制台页面，刷新最近图标
                            if (this.currentPage === 'dashboard') {
                                this.loadRecentIcons();
                            }
                        } else {
                            Utils.showToast('替换图标失败', 'error');
                            
                            // 恢复按钮状态
                            confirmReplaceBtn.disabled = false;
                            confirmReplaceBtn.innerHTML = '确认替换';
                        }
                    } catch (error) {
                        console.error('替换图标失败:', error);
                        Utils.showToast('替换图标失败: ' + error.message, 'error');
                        
                        // 恢复按钮状态
                        confirmReplaceBtn.disabled = false;
                        confirmReplaceBtn.innerHTML = '确认替换';
                    }
                });
            }
            
            // 取消替换按钮点击事件
            if (cancelReplaceBtn) {
                cancelReplaceBtn.addEventListener('click', () => {
                    // 重置替换区域
                    replaceDropzone.classList.remove('hidden');
                    replacePreview.classList.add('hidden');
                    
                    if (replaceFileInput) {
                        replaceFileInput.value = '';
                    }
                    
                    if (newIconPreview) {
                        newIconPreview.innerHTML = '';
                    }
                    
                    // 启用替换按钮
                    if (replaceBtn) {
                        replaceBtn.disabled = false;
                    }
                    
                    // 隐藏替换区域
                    replaceSection.classList.add('hidden');
                });
            }
        } catch (error) {
            console.error('显示图标详情失败:', error);
            Utils.showToast('显示图标详情失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 确认删除图标
     * @param {string} iconId 图标ID
     */
    confirmDeleteIcon(iconId) {
        // 获取图标信息
        const icon = this.iconManager.getIconById(iconId);
        
        if (!icon) {
            Utils.showToast('图标不存在', 'error');
            return;
        }
        
        // 显示确认对话框
        Utils.showConfirm(
            '确认删除',
            `您确定要删除图标 "${icon.name}" 吗？此操作不可撤销。`,
            async () => {
                try {
                    // 显示加载状态
                    Utils.showToast('正在删除图标...', 'info');
                    
                    // 删除图标
                    const success = await this.iconManager.deleteIcon(iconId);
                    
                    if (success) {
                        Utils.showToast('图标已删除', 'success');
                        
                        // 刷新图标列表
                        if (this.currentPage === 'icons') {
                            // 获取当前选中的分类
                            const activeCategory = this.elements.iconCategories.querySelector('.category-item.active');
                            const categoryId = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
                            
                            this.loadIcons(categoryId);
                        }
                        
                        // 如果当前在控制台页面，刷新最近图标
                        if (this.currentPage === 'dashboard') {
                            this.loadRecentIcons();
                        }
                        
                        // 更新统计信息
                        this.updateStats();
                    } else {
                        Utils.showToast('删除图标失败', 'error');
                    }
                } catch (error) {
                    console.error('删除图标失败:', error);
                    Utils.showToast('删除图标失败: ' + error.message, 'error');
                }
            }
        );
    }
    
    /**
     * 显示添加分类模态框
     */
    showAddCategoryModal() {
        // TODO: 实现添加分类模态框
    }
    
    /**
     * 显示编辑分类模态框
     * @param {string} categoryId 分类ID
     */
    showEditCategoryModal(categoryId) {
        // TODO: 实现编辑分类模态框
    }
    
    /**
     * 确认删除分类
     * @param {string} categoryId 分类ID
     */
    confirmDeleteCategory(categoryId) {
        // TODO: 实现确认删除分类
    }
}

// 创建全局实例
window.uiController = new UIController();
