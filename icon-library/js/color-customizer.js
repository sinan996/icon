/**
 * color-customizer.js - 颜色自定义模块
 * 
 * 负责处理SVG图标的颜色自定义功能
 */

class ColorCustomizer {
    constructor() {
        // 当前选中的图标
        this.currentIcon = null;
        // 当前SVG DOM
        this.currentSvgDOM = null;
        // 原始颜色
        this.originalColors = [];
        // 自定义颜色
        this.customColors = {};
        // 图标管理器引用
        this.iconManager = window.iconManager;
    }
    
    /**
     * 加载图标
     * @param {string} iconId 图标ID
     * @returns {Promise<boolean>} 是否加载成功
     */
    async loadIcon(iconId) {
        try {
            // 获取图标数据
            this.currentIcon = this.iconManager.getIconById(iconId);
            
            if (!this.currentIcon) {
                throw new Error('图标不存在');
            }
            
            // 获取SVG内容
            const svgContent = await this.iconManager.getIconSVG(iconId);
            
            if (!svgContent) {
                throw new Error('获取SVG内容失败');
            }
            
            // 解析SVG
            this.currentSvgDOM = Utils.svgStringToDOM(svgContent);
            
            // 提取颜色
            this.originalColors = Utils.extractColorsFromSVG(this.currentSvgDOM);
            
            // 初始化自定义颜色
            this.customColors = {};
            this.originalColors.forEach(color => {
                this.customColors[color] = color;
            });
            
            return true;
        } catch (error) {
            console.error('加载图标失败:', error);
            this.reset();
            return false;
        }
    }
    
    /**
     * 重置
     */
    reset() {
        this.currentIcon = null;
        this.currentSvgDOM = null;
        this.originalColors = [];
        this.customColors = {};
    }
    
    /**
     * 获取当前图标的颜色
     * @returns {Array<{original: string, current: string}>} 颜色数组
     */
    getColors() {
        return this.originalColors.map(color => ({
            original: color,
            current: this.customColors[color] || color
        }));
    }
    
    /**
     * 更新颜色
     * @param {string} originalColor 原始颜色
     * @param {string} newColor 新颜色
     */
    updateColor(originalColor, newColor) {
        if (this.originalColors.includes(originalColor)) {
            this.customColors[originalColor] = newColor;
        }
    }
    
    /**
     * 重置颜色
     */
    resetColors() {
        this.customColors = {};
        this.originalColors.forEach(color => {
            this.customColors[color] = color;
        });
    }
    
    /**
     * 获取预览SVG
     * @returns {string} SVG字符串
     */
    getPreviewSVG() {
        if (!this.currentSvgDOM) return '';
        
        // 克隆SVG DOM
        const clonedSVG = this.currentSvgDOM.cloneNode(true);
        
        // 应用颜色
        Utils.changeSVGColors(clonedSVG, this.customColors);
        
        // 转换为字符串
        return Utils.domToSVGString(clonedSVG);
    }
    
    /**
     * 保存颜色设置
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveColorSettings() {
        try {
            if (!this.currentIcon) {
                throw new Error('未选择图标');
            }
            
            // 更新图标颜色
            const colors = Object.values(this.customColors);
            const multicolor = colors.length > 1;
            
            // 保存到图标管理器
            await this.iconManager.updateIconColors(this.currentIcon.id, colors, multicolor);
            
            return true;
        } catch (error) {
            console.error('保存颜色设置失败:', error);
            return false;
        }
    }
    
    /**
     * 是否是多色图标
     * @returns {boolean} 是否多色
     */
    isMultiColor() {
        return this.originalColors.length > 1;
    }
    
    /**
     * 获取颜色映射
     * @returns {Object} 颜色映射
     */
    getColorMap() {
        return { ...this.customColors };
    }
}

// 创建全局实例
window.colorCustomizer = new ColorCustomizer();
