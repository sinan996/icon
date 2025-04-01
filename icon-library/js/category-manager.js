/**
 * category-manager.js - 分类管理模块
 * 
 * 负责处理图标分类的创建、管理和显示
 */

class CategoryManager {
    constructor() {
        // 分类数据
        this.categories = [];
        // 是否已初始化
        this.initialized = false;
        // 文件系统引用
        this.fs = window.fileSystem;
        // 数据文件名
        this.dataFileName = 'categories.json';
    }
    
    /**
     * 初始化分类管理器
     * @returns {Promise<boolean>} 是否初始化成功
     */
    async initialize() {
        try {
            // 等待文件系统初始化
            if (!this.fs.initialized) {
                await this.fs.initialize();
            }
            
            // 加载分类数据
            await this.loadCategories();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('初始化分类管理器失败:', error);
            return false;
        }
    }
    
    /**
     * 加载分类数据
     * @returns {Promise<void>}
     */
    async loadCategories() {
        try {
            // 从文件系统读取分类数据
            const data = await this.fs.readFile(this.dataFileName);
            
            if (data) {
                const parsed = JSON.parse(data);
                this.categories = parsed.categories || [];
            } else {
                // 如果文件不存在，创建默认分类
                this.categories = this.getDefaultCategories();
                await this.saveCategories();
            }
        } catch (error) {
            console.error('加载分类数据失败:', error);
            this.categories = this.getDefaultCategories();
            await this.saveCategories();
        }
    }
    
    /**
     * 获取默认分类
     * @returns {Array<Object>} 默认分类数组
     */
    getDefaultCategories() {
        const now = Utils.formatDateTime(new Date());
        return [
            {
                id: 'cat-001',
                name: '用户界面',
                description: 'UI相关图标',
                parent: null,
                created: now,
                modified: now
            },
            {
                id: 'cat-002',
                name: '导航',
                description: '导航相关图标',
                parent: 'cat-001',
                created: now,
                modified: now
            },
            {
                id: 'cat-003',
                name: '操作',
                description: '操作相关图标',
                parent: 'cat-001',
                created: now,
                modified: now
            }
        ];
    }
    
    /**
     * 保存分类数据
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveCategories() {
        try {
            // 构建数据对象
            const data = {
                categories: this.categories,
                lastUpdated: new Date().toISOString()
            };
            
            // 保存到文件系统
            const json = JSON.stringify(data, null, 2);
            return await this.fs.saveFile(this.dataFileName, json);
        } catch (error) {
            console.error('保存分类数据失败:', error);
            return false;
        }
    }
    
    /**
     * 添加分类
     * @param {Object} categoryData 分类数据
     * @returns {Promise<string|null>} 分类ID，失败返回null
     */
    async addCategory(categoryData) {
        try {
            // 生成唯一ID
            const id = Utils.generateUUID();
            
            // 创建分类对象
            const category = {
                id,
                name: categoryData.name || 'Unnamed Category',
                description: categoryData.description || '',
                parent: categoryData.parent || null,
                created: Utils.formatDateTime(new Date()),
                modified: Utils.formatDateTime(new Date())
            };
            
            // 添加到分类列表
            this.categories.push(category);
            
            // 保存分类数据
            await this.saveCategories();
            
            return id;
        } catch (error) {
            console.error('添加分类失败:', error);
            return null;
        }
    }
    
    /**
     * 更新分类
     * @param {string} id 分类ID
     * @param {Object} categoryData 分类数据
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateCategory(id, categoryData) {
        try {
            // 查找分类
            const index = this.categories.findIndex(category => category.id === id);
            
            if (index === -1) {
                throw new Error('分类不存在');
            }
            
            // 更新分类数据
            const category = this.categories[index];
            
            category.name = categoryData.name || category.name;
            category.description = categoryData.description || category.description;
            category.parent = categoryData.parent !== undefined ? categoryData.parent : category.parent;
            category.modified = Utils.formatDateTime(new Date());
            
            // 保存分类数据
            await this.saveCategories();
            
            return true;
        } catch (error) {
            console.error('更新分类失败:', error);
            return false;
        }
    }
    
    /**
     * 删除分类
     * @param {string} id 分类ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteCategory(id) {
        try {
            // 查找分类
            const index = this.categories.findIndex(category => category.id === id);
            
            if (index === -1) {
                throw new Error('分类不存在');
            }
            
            // 检查是否有子分类
            const hasChildren = this.categories.some(category => category.parent === id);
            
            if (hasChildren) {
                throw new Error('无法删除有子分类的分类');
            }
            
            // 从列表中移除
            this.categories.splice(index, 1);
            
            // 保存分类数据
            await this.saveCategories();
            
            return true;
        } catch (error) {
            console.error('删除分类失败:', error);
            return false;
        }
    }
    
    /**
     * 获取分类
     * @param {string} id 分类ID
     * @returns {Object|null} 分类对象
     */
    getCategoryById(id) {
        return this.categories.find(category => category.id === id) || null;
    }
    
    /**
     * 获取所有分类
     * @returns {Array<Object>} 分类对象数组
     */
    getAllCategories() {
        return [...this.categories];
    }
    
    /**
     * 获取顶级分类
     * @returns {Array<Object>} 顶级分类对象数组
     */
    getTopLevelCategories() {
        return this.categories.filter(category => !category.parent);
    }
    
    /**
     * 获取子分类
     * @param {string} parentId 父分类ID
     * @returns {Array<Object>} 子分类对象数组
     */
    getChildCategories(parentId) {
        return this.categories.filter(category => category.parent === parentId);
    }
    
    /**
     * 获取分类树
     * @returns {Array<Object>} 分类树数组
     */
    getCategoryTree() {
        // 获取顶级分类
        const topLevel = this.getTopLevelCategories();
        
        // 递归构建树
        const buildTree = (categories) => {
            return categories.map(category => {
                const children = this.getChildCategories(category.id);
                return {
                    ...category,
                    children: children.length > 0 ? buildTree(children) : []
                };
            });
        };
        
        return buildTree(topLevel);
    }
    
    /**
     * 获取分类路径
     * @param {string} id 分类ID
     * @returns {Array<Object>} 分类路径数组
     */
    getCategoryPath(id) {
        const path = [];
        let currentId = id;
        
        while (currentId) {
            const category = this.getCategoryById(currentId);
            if (!category) break;
            
            path.unshift(category);
            currentId = category.parent;
        }
        
        return path;
    }
    
    /**
     * 搜索分类
     * @param {string} query 搜索关键词
     * @returns {Array<Object>} 分类对象数组
     */
    searchCategories(query) {
        if (!query) {
            return this.getAllCategories();
        }
        
        const lowerQuery = query.toLowerCase();
        
        return this.categories.filter(category => {
            const nameMatch = category.name.toLowerCase().includes(lowerQuery);
            const descMatch = category.description.toLowerCase().includes(lowerQuery);
            
            return nameMatch || descMatch;
        });
    }
    
    /**
     * 获取分类统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            total: this.categories.length,
            topLevel: this.getTopLevelCategories().length
        };
    }
}

// 创建全局实例
window.categoryManager = new CategoryManager();
