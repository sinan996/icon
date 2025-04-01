# 离线图标库管理网站系统架构设计

## 1. 系统概述

本系统是一个完全离线的SVG图标库管理网站，使用纯HTML、CSS和JavaScript实现，无需服务器部署。系统支持设计师上传、管理SVG图标，并支持导出前端开发人员可用的JSON文件。系统的特点是将图标数据保存为本地文件，而不仅仅存储在浏览器缓存中。

## 2. 技术栈选择

- **前端框架**：纯原生JavaScript，不依赖任何框架
- **UI组件**：使用Bootstrap 5提供基础UI组件和样式
- **图标处理**：使用原生SVG操作API
- **本地存储**：
  - File System Access API（主要方案）
  - 备选方案：localStorage + 文件下载/上传机制

## 3. 系统模块设计

### 3.1 用户界面模块

- **控制台页面**：显示统计信息和最近添加的图标
- **图标管理页面**：展示、搜索、筛选和管理图标
- **分类管理页面**：创建、编辑和删除分类
- **上传页面**：上传和编辑图标
- **颜色自定义页面**：预览和修改图标颜色
- **导出页面**：导出图标和配置文件

### 3.2 核心功能模块

#### 3.2.1 图标管理模块
- 图标上传（单个/批量）
- 图标预览
- 图标编辑（名称、描述、分类）
- 图标删除
- 图标替换

#### 3.2.2 分类管理模块
- 分类创建
- 分类编辑
- 分类删除
- 分类树结构管理

#### 3.2.3 颜色自定义模块
- SVG解析
- 颜色替换
- 多色图标支持
- 实时预览

#### 3.2.4 导出模块
- JSON格式导出
- SVG文件导出
- 配置文件导出

### 3.3 本地文件存储模块

#### 3.3.1 主要方案：File System Access API
使用现代浏览器支持的File System Access API实现对本地文件系统的读写操作。

**工作流程**：
1. 用户选择一个工作目录作为图标库的存储位置
2. 系统获取该目录的访问权限
3. 在该目录下创建必要的子目录结构
4. 将上传的SVG图标保存到icons目录
5. 将分类和图标元数据保存到data目录下的JSON文件中

**目录结构**：
```
icon-library/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── icon-manager.js
│   ├── category-manager.js
│   ├── color-customizer.js
│   ├── export-manager.js
│   └── file-system.js
├── data/
│   ├── icons.json       # 图标元数据
│   └── categories.json  # 分类数据
└── icons/               # 存储SVG图标文件
    ├── icon1.svg
    ├── icon2.svg
    └── ...
```

#### 3.3.2 备选方案：localStorage + 文件下载/上传机制

对于不支持File System Access API的浏览器，提供备选方案：
1. 使用localStorage存储图标元数据和分类数据
2. 提供数据导出功能，将数据保存为JSON文件
3. 提供数据导入功能，从JSON文件恢复数据
4. SVG图标以Base64编码形式存储在localStorage中

## 4. 数据结构设计

### 4.1 图标元数据 (icons.json)
```json
{
  "icons": [
    {
      "id": "icon-001",
      "name": "用户图标",
      "description": "表示用户或个人账户",
      "filename": "user.svg",
      "categories": ["用户界面", "人物"],
      "tags": ["用户", "人", "账户"],
      "colors": ["#000000"],
      "multicolor": false,
      "created": "2025-03-31T02:00:00Z",
      "modified": "2025-03-31T02:00:00Z"
    }
  ]
}
```

### 4.2 分类数据 (categories.json)
```json
{
  "categories": [
    {
      "id": "cat-001",
      "name": "用户界面",
      "description": "UI相关图标",
      "parent": null,
      "created": "2025-03-31T02:00:00Z",
      "modified": "2025-03-31T02:00:00Z"
    },
    {
      "id": "cat-002",
      "name": "按钮",
      "description": "按钮相关图标",
      "parent": "cat-001",
      "created": "2025-03-31T02:00:00Z",
      "modified": "2025-03-31T02:00:00Z"
    }
  ]
}
```

### 4.3 导出的JSON格式
```json
{
  "name": "icon-library",
  "version": "1.0.0",
  "icons": {
    "user": {
      "path": "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
      "width": 24,
      "height": 24
    }
  }
}
```

## 5. 关键技术实现

### 5.1 SVG处理
- 使用DOMParser解析SVG文件
- 使用XMLSerializer序列化SVG对象
- 通过操作SVG的DOM结构修改颜色属性

### 5.2 多色图标支持
- 解析SVG中的fill和stroke属性
- 识别多个不同颜色的路径
- 为每个颜色路径提供单独的颜色选择器
- 生成颜色映射表用于导出

### 5.3 本地文件存储
- 使用File System Access API获取目录访问权限
- 创建FileSystemDirectoryHandle和FileSystemFileHandle
- 实现文件的读取、写入和删除操作
- 提供数据同步机制，确保文件系统和内存数据的一致性

### 5.4 离线功能支持
- 使用localStorage作为临时缓存
- 实现定期自动保存功能
- 提供数据备份和恢复功能

## 6. 兼容性考虑

- 对于不支持File System Access API的浏览器，提供基于文件下载/上传的备选方案
- 使用特性检测确定使用哪种存储方案
- 提供清晰的兼容性提示和使用指南

## 7. 安全性考虑

- 所有操作都在本地完成，不涉及网络传输
- 使用沙盒模式处理SVG，防止潜在的XSS攻击
- 限制文件大小和数量，防止过度消耗本地资源

## 8. 性能优化

- 延迟加载大量图标
- 使用虚拟滚动技术处理大量图标的展示
- 图标缩略图生成和缓存
- 批量操作优化
