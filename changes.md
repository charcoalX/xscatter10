# changes.md

记录本次对话中对代码库所做的全部改动。

---

## 1. Bug 修复：载入 cifar10.txt 后仍显示 X 光数据

**文件**：`static/js/dom/dom-events.js`

原 `initFileInput` 在文件载入后只更新 `embedding.labels`，未同步 `Data type`、图片路径和图片格式。修复后，根据文件名判断数据集类型，并同步更新以下三个状态：

- `embedding.options['Data type']`
- `main.imagePath` / `main.imageFileType`
- `dom.options.dataType`（下拉框 UI）

---

## 2. "Load Feature Names" 改为下拉菜单模式

### 2a. 后端：新增文件列表与文件内容接口

**文件**：`modules.py`
- Flask 导入加入 `send_from_directory`

**文件**：`main.py`
- 新增 `GET /GetFeatureFiles`：列出 `resources/data/` 目录下的所有文件名，返回 JSON 数组
- 新增 `GET /GetFeatureFile/<filename>`：返回指定文件的纯文本内容

### 2b. 前端：替换按钮+文件选择框为原生 `<select>`

**文件**：`templates/index.html`
- 删除 `<input type="file" id="file-input">` 和原按钮
- 改为 `<label>` + `<select id="feature-file-select" class="navbar-selects">`
- select 含一个占位符 `<option value="">-- select --</option>`，用于支持重复选择同一文件

**文件**：`static/css/style.css`
- `#navbar-file` 改为行内布局（`line-height`、`font-size`、`color`），与 `#navbar-options` 风格一致
- 移除原自定义下拉菜单的 CSS（`.feature-dropdown`、`.feature-dropdown-item`）

**文件**：`static/js/dom/dom-elements.js`
- 删除 `dom.inputs`（原 `#file-input` 引用）
- 删除 `dom.buttons.file`（原按钮引用）
- 新增 `dom.options.featureFile`（指向 `#feature-file-select`）

**文件**：`static/js/dom/dom-events.js`
- 提取 `dom.loadFeatureFile(embedding, filename)`：独立函数，负责 AJAX 拉取文件内容、设置 labels、同步 data type 与图片路径、加载完成后将 select 重置为占位符、调用 `main.start()`
- 重写 `dom.initFileInput(embedding)`：先注册 `change` 事件监听，再异步请求 `/GetFeatureFiles` 填充选项，完成后自动选中 `17tags_meta.txt` 并 `.trigger('change')` 触发初始加载

---

## 3. Navbar 标题样式优化

**文件**：`static/css/style.css`

`#navbar-title` 改为深色背景白色文字，与后面的功能选项明显区分：

```css
#navbar-title {
    color: #f0f0f0;
    font-weight: bold;
    background-color: #252525;
    padding: 0 12px;
    margin-right: 8px;
}
```

---

## 4. 修复初始加载时 scatterplot 不显示

**文件**：`static/js/index.js`

`main.start()` 最终回调中，用 `requestAnimationFrame` 包裹 `main.visualize()`：

```js
requestAnimationFrame(function () {
    main.visualize();
});
```

**原因**：`window.onload` 触发时浏览器 layout reflow 可能尚未完成首次提交，`vis.scatterplot()` 用 `container.width()` / `container.height()` 取容器尺寸时会得到 `0`，导致 SVG 为 0×0 不可见。`requestAnimationFrame` 将渲染推迟到下一帧，确保尺寸已正确计算。

---

## 5. 修复重复选择同一文件无效

**文件**：`static/js/dom/dom-events.js`、`templates/index.html`

`<select>` 的 `change` 事件在当前值未变化时不触发。修复方案：文件加载成功后将 select 重置为占位符 `''`，使后续每次选择都被视为新的值变化，从而始终触发 `change`。
