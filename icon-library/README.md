# 离线图标库管理网站使用说明

## 简介

这是一个完全离线的SVG图标库管理网站，设计师可以通过它批量上传、管理和导出SVG图标，前端开发人员可以方便地调用这些图标。本应用无需服务器部署，直接在浏览器中运行，所有数据保存在本地文件系统中。

## 主要功能

1. **图标上传**：支持单个或批量上传SVG图标
2. **图标管理**：增加、删除、修改、替换图标
3. **分类管理**：创建分类并对图标进行分类，方便查找
4. **颜色自定义**：修改图标颜色，支持多色图标
5. **导出功能**：导出JSON文件供前端调用，也可导出SVG文件
6. **本地存储**：所有数据保存在本地文件系统，而不仅仅是浏览器缓存

## 系统要求

- 现代浏览器（Chrome 86+、Edge 86+、Firefox 78+、Safari 14+）
- 支持File System Access API的浏览器（用于完整的本地文件存储功能）
- 如果浏览器不支持File System Access API，将自动降级使用localStorage存储

## 使用方法

### 首次使用

1. 双击打开`index.html`文件
2. 在设置页面选择一个工作目录（用于存储图标和数据文件）
3. 系统会自动在该目录下创建必要的文件结构

### 上传图标

1. 点击"上传"页面
2. 拖放SVG文件到上传区域，或点击"选择文件"按钮
3. 为每个图标设置名称和标签
4. 选择分类（可多选）
5. 点击"确认上传"按钮

### 管理图标

1. 在"图标"页面可以查看所有图标
2. 使用搜索框搜索图标
3. 通过左侧分类树筛选图标
4. 点击图标可查看详情，进行编辑或删除操作

### 自定义颜色

1. 在"颜色"页面选择要自定义的图标
2. 使用颜色选择器修改图标颜色
3. 多色图标可分别修改每个部分的颜色
4. 点击"保存"按钮应用更改

### 导出图标

1. 在"导出"页面选择导出范围（全部、分类或选定图标）
2. 选择导出格式（JSON、SVG或ZIP）
3. 点击"生成导出文件"按钮
4. 下载生成的文件

### 前端调用示例

```javascript
// React组件示例
import iconData from './icon-library.json';

function Icon({ name, color, size = 24 }) {
  const icon = iconData.icons[name];
  if (!icon) return null;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${icon.width} ${icon.height}`}
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
      viewBox={`0 0 ${icon.width} ${icon.height}`}
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
}
```

## 数据备份

1. 在"设置"页面可以导出所有数据为ZIP文件
2. 导入备份文件可以恢复之前的数据
3. 建议定期备份数据，以防数据丢失

## 注意事项

1. 本应用完全离线运行，不会将数据上传到任何服务器
2. 使用File System Access API时，浏览器会请求权限访问选定的工作目录
3. 如果更换设备或浏览器，需要手动迁移数据（通过导出/导入功能）
4. 支持的SVG文件大小上限为10MB

## 故障排除

1. **无法选择工作目录**：确保使用支持File System Access API的浏览器，或切换到localStorage模式
2. **上传失败**：检查SVG文件格式是否正确，文件大小是否超过限制
3. **数据丢失**：使用最近的备份恢复数据，或检查工作目录是否被修改
4. **浏览器崩溃**：尝试清除浏览器缓存，或使用其他浏览器

## 技术支持

如有任何问题或建议，请联系开发团队。
