/**
 * icon-manager.js - 图标管理模块
 * 
 * 负责处理图标的上传、管理、搜索和显示
 */

class IconManager {
    constructor() {
        // 图标数据
        this.icons = [];
        // 是否已初始化
        this.initialized = false;
        // 文件系统引用
        this.fs = window.fileSystem;
        // 数据文件名
        this.dataFileName = 'icons.json';
    }
    
    /**
     * 初始化图标管理器
     * @returns {Promise<boolean>} 是否初始化成功
     */
    async initialize() {
        try {
            // 等待文件系统初始化
            if (!this.fs.initialized) {
                await this.fs.initialize();
            }
            
            // 加载图标数据
            await this.loadIcons();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('初始化图标管理器失败:', error);
            return false;
        }
    }
    
    /**
     * 加载图标数据
     * @returns {Promise<void>}
     */
    async loadIcons() {
        try {
            // 从文件系统读取图标数据
            const data = await this.fs.readFile(this.dataFileName);
            
            if (data) {
                const parsed = JSON.parse(data);
                this.icons = parsed.icons || [];
            } else {
                // 如果文件不存在，创建空数据
                this.icons = [];
                await this.saveIcons();
            }
        } catch (error) {
            console.error('加载图标数据失败:', error);
            this.icons = [];
            await this.saveIcons();
        }
    }
    
    /**
     * 保存图标数据
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveIcons() {
        try {
            // 构建数据对象
            const data = {
                icons: this.icons,
                lastUpdated: new Date().toISOString()
            };
            
            // 保存到文件系统
            const json = JSON.stringify(data, null, 2);
            return await this.fs.saveFile(this.dataFileName, json);
        } catch (error) {
            console.error('保存图标数据失败:', error);
            return false;
        }
    }
    
    /**
     * 添加图标
     * @param {Object} iconData 图标数据
     * @param {File|Blob} svgFile SVG文件
     * @returns {Promise<string|null>} 图标ID，失败返回null
     */
    async addIcon(iconData, svgFile) {
        try {
            // 生成唯一ID
            const id = Utils.generateUUID();
            
            // 生成文件名
            const fileName = `${id}.svg`;
            
            // 保存SVG文件
            const saved = await this.fs.saveFile(fileName, svgFile, 'icons');
            
            if (!saved) {
                throw new Error('保存SVG文件失败');
            }
            
            // 创建图标对象
            const icon = {
                id,
                name: iconData.name || 'Unnamed Icon',
                description: iconData.description || '',
                filename: fileName,
                categories: iconData.categories || [],
                tags: iconData.tags || [],
                colors: iconData.colors || ['#000000'],
                multicolor: iconData.multicolor || false,
                created: Utils.formatDateTime(new Date()),
                modified: Utils.formatDateTime(new Date())
            };
            
            // 添加到图标列表
            this.icons.push(icon);
            
            // 保存图标数据
            await this.saveIcons();
            
            return id;
        } catch (error) {
            console.error('添加图标失败:', error);
            return null;
        }
    }
    
    /**
     * 批量添加图标
     * @param {Array<{data: Object, file: File|Blob}>} icons 图标数据和文件数组
     * @returns {Promise<Array<string>>} 成功添加的图标ID数组
     */
    async addIcons(icons) {
        const addedIds = [];
        
        for (const icon of icons) {
            const id = await this.addIcon(icon.data, icon.file);
            if (id) {
                addedIds.push(id);
            }
        }
        
        return addedIds;
    }
    
    /**
     * 更新图标
     * @param {string} id 图标ID
     * @param {Object} iconData 图标数据
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateIcon(id, iconData) {
        try {
            // 查找图标
            const index = this.icons.findIndex(icon => icon.id === id);
            
            if (index === -1) {
                throw new Error('图标不存在');
            }
            
            // 更新图标数据
            const icon = this.icons[index];
            
            icon.name = iconData.name || icon.name;
            icon.description = iconData.description || icon.description;
            icon.categories = iconData.categories || icon.categories;
            icon.tags = iconData.tags || icon.tags;
            icon.colors = iconData.colors || icon.colors;
            icon.multicolor = iconData.multicolor !== undefined ? iconData.multicolor : icon.multicolor;
            icon.modified = Utils.formatDateTime(new Date());
            
            // 保存图标数据
            await this.saveIcons();
            
            return true;
        } catch (error) {
            console.error('更新图标失败:', error);
            return false;
        }
    }
    
    /**
     * 替换图标SVG
     * @param {string} id 图标ID
     * @param {File|Blob} svgFile 新的SVG文件
     * @returns {Promise<boolean>} 是否替换成功
     */
    async replaceIconSVG(id, svgFile) {
        try {
            // 查找图标
            const icon = this.getIconById(id);
            
            if (!icon) {
                throw new Error('图标不存在');
            }
            
            // 保存新的SVG文件
            const saved = await this.fs.saveFile(icon.filename, svgFile, 'icons');
            
            if (!saved) {
                throw new Error('保存SVG文件失败');
            }
            
            // 更新修改时间
            icon.modified = Utils.formatDateTime(new Date());
            
            // 保存图标数据
            await this.saveIcons();
            
            return true;
        } catch (error) {
            console.error('替换图标SVG失败:', error);
            return false;
        }
    }
    
    /**
     * 删除图标
     * @param {string} id 图标ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteIcon(id) {
        try {
            // 查找图标
            const index = this.icons.findIndex(icon => icon.id === id);
            
            if (index === -1) {
                throw new Error('图标不存在');
            }
            
            const icon = this.icons[index];
            
            // 删除SVG文件
            await this.fs.deleteFile(icon.filename, 'icons');
            
            // 从列表中移除
            this.icons.splice(index, 1);
            
            // 保存图标数据
            await this.saveIcons();
            
            return true;
        } catch (error) {
            console.error('删除图标失败:', error);
            return false;
        }
    }
    
    /**
     * 获取图标
     * @param {string} id 图标ID
     * @returns {Object|null} 图标对象
     */
    getIconById(id) {
        return this.icons.find(icon => icon.id === id) || null;
    }
    
    /**
     * 获取图标SVG
     * @param {string} id 图标ID
     * @param {string} [returnType='text'] 返回类型 ('text', 'blob', 'url')
     * @returns {Promise<string|Blob|null>} SVG内容
     */
    async getIconSVG(id, returnType = 'text') {
        try {
            const icon = this.getIconById(id);
            
            if (!icon) {
                throw new Error('图标不存在');
            }
            
            return await this.fs.readFile(icon.filename, 'icons', returnType);
        } catch (error) {
            console.error('获取图标SVG失败:', error);
            return null;
        }
    }
    
    /**
     * 获取所有图标
     * @returns {Array<Object>} 图标对象数组
     */
    getAllIcons() {
        return [...this.icons];
    }
    
    /**
     * 获取指定分类的图标
     * @param {string} categoryId 分类ID
     * @returns {Array<Object>} 图标对象数组
     */
    getIconsByCategory(categoryId) {
        if (categoryId === 'all') {
            return this.getAllIcons();
        }
        
        return this.icons.filter(icon => icon.categories.includes(categoryId));
    }
    
    /**
     * 搜索图标
     * @param {string} query 搜索关键词
     * @param {string} [categoryId] 分类ID（可选）
     * @returns {Array<Object>} 图标对象数组
     */
    searchIcons(query, categoryId) {
        if (!query) {
            return categoryId ? this.getIconsByCategory(categoryId) : this.getAllIcons();
        }
        
        const lowerQuery = query.toLowerCase();
        
        // 过滤图标
        let results = this.icons.filter(icon => {
            // 匹配名称、描述、标签
            const nameMatch = icon.name.toLowerCase().includes(lowerQuery);
            const descMatch = icon.description.toLowerCase().includes(lowerQuery);
            const tagMatch = icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            return nameMatch || descMatch || tagMatch;
        });
        
        // 如果指定了分类，进一步过滤
        if (categoryId && categoryId !== 'all') {
            results = results.filter(icon => icon.categories.includes(categoryId));
        }
        
        return results;
    }
    
    /**
     * 获取最近添加的图标
     * @param {number} limit 限制数量
     * @returns {Array<Object>} 图标对象数组
     */
    getRecentIcons(limit = 8) {
        // 按创建时间排序
        const sorted = [...this.icons].sort((a, b) => {
            return new Date(b.created) - new Date(a.created);
        });
        
        return sorted.slice(0, limit);
    }
    
    /**
     * 更新图标颜色
     * @param {string} id 图标ID
     * @param {Array<string>} colors 颜色数组
     * @param {boolean} multicolor 是否多色
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateIconColors(id, colors, multicolor) {
        try {
            // 查找图标
            const icon = this.getIconById(id);
            
            if (!icon) {
                throw new Error('图标不存在');
            }
            
            // 更新颜色
            icon.colors = colors;
            icon.multicolor = multicolor;
            icon.modified = Utils.formatDateTime(new Date());
            
            // 保存图标数据
            await this.saveIcons();
            
            return true;
        } catch (error) {
            console.error('更新图标颜色失败:', error);
            return false;
        }
    }
    
    /**
     * 获取图标统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            total: this.icons.length,
            categories: new Set(this.icons.flatMap(icon => icon.categories)).size,
            recentlyAdded: this.getRecentIcons(5)
        };
    }
}

// 创建全局实例
window.iconManager = new IconManager();
