/**
 * export-manager.js - 导出管理模块
 * 
 * 负责处理图标的导出功能，支持JSON、SVG和ZIP格式
 */

class ExportManager {
    constructor() {
        // 图标管理器引用
        this.iconManager = window.iconManager;
        // 分类管理器引用
        this.categoryManager = window.categoryManager;
        // 文件系统引用
        this.fs = window.fileSystem;
    }
    
    /**
     * 导出JSON格式
     * @param {Array<string>} iconIds 图标ID数组
     * @returns {Promise<Object>} JSON对象
     */
    async exportJSON(iconIds) {
        try {
            const result = {
                name: "icon-library",
                version: "1.0.0",
                description: "SVG图标库",
                icons: {}
            };
            
            // 获取指定的图标
            const icons = iconIds.map(id => this.iconManager.getIconById(id)).filter(Boolean);
            
            // 处理每个图标
            for (const icon of icons) {
                // 获取SVG内容
                const svgContent = await this.iconManager.getIconSVG(icon.id);
                if (!svgContent) continue;
                
                // 解析SVG
                const svgDOM = Utils.svgStringToDOM(svgContent);
                
                // 获取viewBox
                const viewBox = svgDOM.getAttribute('viewBox') || '0 0 24 24';
                const [, , width, height] = viewBox.split(' ').map(Number);
                
                // 获取路径数据
                const paths = Array.from(svgDOM.querySelectorAll('path')).map(path => path.getAttribute('d')).filter(Boolean);
                
                // 如果是多色图标
                if (icon.multicolor && icon.colors.length > 1) {
                    const pathElements = Array.from(svgDOM.querySelectorAll('path'));
                    const colorPaths = pathElements.map((path, index) => {
                        return {
                            d: path.getAttribute('d'),
                            colorId: `color${index + 1}`,
                            color: path.getAttribute('fill') || '#000000'
                        };
                    });
                    
                    // 创建颜色映射
                    const colorMap = {};
                    icon.colors.forEach((color, index) => {
                        colorMap[`color${index + 1}`] = color;
                    });
                    
                    result.icons[icon.name] = {
                        paths: colorPaths,
                        colors: colorMap,
                        width: width || 24,
                        height: height || 24,
                        multicolor: true
                    };
                } else {
                    // 单色图标
                    result.icons[icon.name] = {
                        path: paths.join(' '),
                        color: icon.colors[0] || '#000000',
                        width: width || 24,
                        height: height || 24,
                        multicolor: false
                    };
                }
            }
            
            return result;
        } catch (error) {
            console.error('导出JSON失败:', error);
            throw error;
        }
    }
    
    /**
     * 导出SVG文件
     * @param {Array<string>} iconIds 图标ID数组
     * @returns {Promise<Array<{name: string, content: Blob}>>} SVG文件数组
     */
    async exportSVG(iconIds) {
        try {
            const result = [];
            
            // 获取指定的图标
            const icons = iconIds.map(id => this.iconManager.getIconById(id)).filter(Boolean);
            
            // 处理每个图标
            for (const icon of icons) {
                // 获取SVG内容
                const svgContent = await this.iconManager.getIconSVG(icon.id, 'blob');
                if (!svgContent) continue;
                
                result.push({
                    name: `${icon.name}.svg`,
                    content: svgContent
                });
            }
            
            return result;
        } catch (error) {
            console.error('导出SVG失败:', error);
            throw error;
        }
    }
    
    /**
     * 导出ZIP文件
     * @param {Array<string>} iconIds 图标ID数组
     * @param {boolean} includeJSON 是否包含JSON
     * @param {boolean} includeSVG 是否包含SVG
     * @returns {Promise<Blob>} ZIP文件Blob
     */
    async exportZIP(iconIds, includeJSON = true, includeSVG = true) {
        try {
            // 创建新的JSZip实例
            const zip = new JSZip();
            
            // 添加JSON文件
            if (includeJSON) {
                const jsonData = await this.exportJSON(iconIds);
                zip.file('icon-library.json', JSON.stringify(jsonData, null, 2));
            }
            
            // 添加SVG文件
            if (includeSVG) {
                const svgFiles = await this.exportSVG(iconIds);
                const svgFolder = zip.folder('svg');
                
                for (const file of svgFiles) {
                    svgFolder.file(file.name, file.content);
                }
            }
            
            // 生成ZIP文件
            return await zip.generateAsync({ type: 'blob' });
        } catch (error) {
            console.error('导出ZIP失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取使用示例代码
     * @param {string} format 格式 ('react', 'vue', 'vanilla')
     * @returns {string} 示例代码
     */
    getUsageExample(format = 'react') {
        if (format === 'react') {
            return `// React组件示例
import iconData from './icon-library.json';

// 单色图标组件
function Icon({ name, color, size = 24 }) {
  const icon = iconData.icons[name];
  if (!icon) return null;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={\`0 0 \${icon.width} \${icon.height}\`}
      fill={color || icon.color}
    >
      <path d={icon.path} />
    </svg>
  );
}

// 多色图标组件
function MultiColorIcon({ name, colors = {}, size = 24 }) {
  const icon = iconData.icons[name];
  if (!icon || !icon.multicolor) return null;
  
  // 合并默认颜色和自定义颜色
  const finalColors = { ...icon.colors, ...colors };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={\`0 0 \${icon.width} \${icon.height}\`}
    >
      {icon.paths.map((path, index) => (
        <path 
          key={index} 
          d={path.d} 
          fill={finalColors[path.colorId] || path.color} 
        />
      ))}
    </svg>
  );
}`;
        } else if (format === 'vue') {
            return `<!-- Vue组件示例 (Vue 2 Options API) -->
<template>
  <svg 
    :width="size" 
    :height="size" 
    :viewBox="\`0 0 \${icon.width} \${icon.height}\`"
    v-if="icon && !icon.multicolor"
    :fill="color || icon.color"
  >
    <path :d="icon.path" />
  </svg>
  
  <svg 
    :width="size" 
    :height="size" 
    :viewBox="\`0 0 \${icon.width} \${icon.height}\`"
    v-else-if="icon && icon.multicolor"
  >
    <path 
      v-for="(path, index) in icon.paths" 
      :key="index" 
      :d="path.d" 
      :fill="finalColors[path.colorId] || path.color" 
    />
  </svg>
</template>

<script>
import iconData from './icon-library.json';

export default {
  name: 'IconComponent',
  props: {
    name: {
      type: String,
      required: true
    },
    color: String,
    colors: {
      type: Object,
      default: () => ({})
    },
    size: {
      type: Number,
      default: 24
    }
  },
  computed: {
    icon() {
      return iconData.icons[this.name];
    },
    finalColors() {
      return { ...this.icon?.colors, ...this.colors };
    }
  }
}
</script>

<!-- Vue 3 Composition API 示例 -->
<script setup>
import { computed } from 'vue';
import iconData from './icon-library.json';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  color: String,
  colors: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: Number,
    default: 24
  }
});

const icon = computed(() => iconData.icons[props.name]);
const finalColors = computed(() => ({ ...icon.value?.colors, ...props.colors }));
</script>

<template>
  <svg 
    :width="size" 
    :height="size" 
    :viewBox="\`0 0 \${icon?.width || 24} \${icon?.height || 24}\`"
    v-if="icon && !icon.multicolor"
    :fill="color || icon.color"
  >
    <path :d="icon.path" />
  </svg>
  
  <svg 
    :width="size" 
    :height="size" 
    :viewBox="\`0 0 \${icon?.width || 24} \${icon?.height || 24}\`"
    v-else-if="icon && icon.multicolor"
  >
    <path 
      v-for="(path, index) in icon.paths" 
      :key="index" 
      :d="path.d" 
      :fill="finalColors[path.colorId] || path.color" 
    />
  </svg>
</template>

<!-- 全局注册示例 (Vue 3) -->
<script>
// 在main.js中
import { createApp } from 'vue';
import App from './App.vue';
import iconData from './icon-library.json';

const app = createApp(App);

// 注册全局图标组件
app.component('Icon', {
  props: {
    name: {
      type: String,
      required: true
    },
    color: String,
    size: {
      type: Number,
      default: 24
    }
  },
  computed: {
    icon() {
      return iconData.icons[this.name];
    }
  },
  template: \`
    <svg 
      :width="size" 
      :height="size" 
      :viewBox="'0 0 ' + (icon?.width || 24) + ' ' + (icon?.height || 24)"
      v-if="icon && !icon.multicolor"
      :fill="color || icon.color"
    >
      <path :d="icon.path" />
    </svg>
    <span v-else></span>
  \`
});

app.mount('#app');
</script>

<!-- 使用示例 -->
<template>
  <div>
    <Icon name="user" color="#ff0000" :size="32" />
    <Icon name="settings" />
  </div>
</template>`;
        } else {
            return `// 原生JavaScript示例
// 加载图标数据
const iconData = /* 导入的JSON数据 */;

// 创建单色图标
function createIcon(name, color, size = 24) {
  const icon = iconData.icons[name];
  if (!icon) return null;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', \`0 0 \${icon.width} \${icon.height}\`);
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', icon.path);
  path.setAttribute('fill', color || icon.color);
  
  svg.appendChild(path);
  return svg;
}

// 创建多色图标
function createMultiColorIcon(name, colors = {}, size = 24) {
  const icon = iconData.icons[name];
  if (!icon || !icon.multicolor) return null;
  
  // 合并默认颜色和自定义颜色
  const finalColors = { ...icon.colors, ...colors };
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', \`0 0 \${icon.width} \${icon.height}\`);
  
  icon.paths.forEach(pathData => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData.d);
    path.setAttribute('fill', finalColors[pathData.colorId] || pathData.color);
    svg.appendChild(path);
  });
  
  return svg;
}

// 使用示例
const iconElement = document.getElementById('icon-container');
iconElement.appendChild(createIcon('user', '#ff0000', 32));`;
        }
    }
}

// 创建全局实例
window.exportManager = new ExportManager();
