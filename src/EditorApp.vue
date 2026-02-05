<template>
  <div class="editor-app" :class="{ 'dark-theme': isDark }">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">{u}</span>
          <span class="logo-text">uJson</span>
        </div>
        <span class="subtitle">JSON 格式化工具</span>
      </div>
      <div class="header-right">
        <button class="theme-btn" @click="toggleTheme" :title="isDark ? '切换亮色主题' : '切换暗色主题'">
          <svg v-if="isDark" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="toolbar-label">输入 JSON</span>
        <button class="action-btn" @click="pasteFromClipboard" title="粘贴">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        </button>
        <button class="action-btn" @click="clearInput" title="清空">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <div class="toolbar-center">
        <button class="format-btn" :class="{ active: viewMode === 'tree' }" @click="formatJson">
          格式化
        </button>
        <button class="format-btn" :class="{ active: viewMode === 'raw' }" @click="compressJson">压缩</button>
        <button class="format-btn" @click="escapeJson">转义</button>
        <button class="format-btn" @click="unescapeJson">反转义</button>
        <button class="format-btn" @click="copyOutput" :disabled="!outputJson">复制结果</button>
        <button class="format-btn" @click="downloadJson" :disabled="!outputJson">下载</button>
      </div>
      <div class="toolbar-right">
        <span class="toolbar-label">格式化结果</span>
        <!-- 折叠一层 -->
        <button class="action-btn" @click="collapseOneLevel" title="折叠一层">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 14l5-5 5 5" />
          </svg>
        </button>
        <!-- 当前层级 -->
        <span class="level-indicator" :title="`当前展开 ${currentLevel} 层`">{{ currentLevel }}</span>
        <!-- 展开一层 -->
        <button class="action-btn" @click="expandOneLevel" title="展开一层">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </button>
        <span class="actions-divider"></span>
        <!-- 折叠全部 -->
        <button class="action-btn" @click="collapseAll" title="折叠全部">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 11l5-5 5 5" />
            <path d="M7 17l5-5 5 5" />
          </svg>
        </button>
        <!-- 展开全部 -->
        <button class="action-btn" @click="expandAll" title="展开全部">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7l5 5 5-5" />
            <path d="M7 13l5 5 5-5" />
          </svg>
        </button>
        <!-- 复制 -->
        <button class="action-btn" @click="copyOutput" :disabled="!outputJson" title="复制">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <!-- 下载 -->
        <button class="action-btn" @click="downloadJson" :disabled="!outputJson" title="下载">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="app-main">
      <!-- 左侧输入区 -->
      <div class="input-panel" :style="{ width: leftPanelWidth + '%' }">
        <textarea 
          v-model="inputJson" 
          class="json-input"
          placeholder="在此粘贴或输入 JSON 数据..."
          @input="handleInput"
          spellcheck="false"
        ></textarea>
        <div class="input-footer">
          <span v-if="parseError" class="error-msg">{{ parseError }}</span>
          <span v-else-if="outputJson" class="success-msg">✓ 已自动格式化</span>
        </div>
      </div>

      <!-- 拖动分隔条 -->
      <div 
        class="resize-bar"
        @mousedown="startResize"
        title="拖动调整宽度"
      >
        <div class="resize-handle">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <circle cx="9" cy="6" r="1.5"/>
            <circle cx="15" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/>
            <circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>
      </div>

      <!-- 右侧输出区 -->
      <div class="output-panel" :style="{ width: (100 - leftPanelWidth) + '%' }">
        <div class="output-content">
          <!-- 树形视图 -->
          <JsonViewer 
            v-if="viewMode === 'tree'"
            ref="jsonViewerRef"
            :json="outputJson" 
            :default-expand-level="3"
          />
          <!-- 原始文本视图（压缩结果） -->
          <div v-else class="raw-output">
            <pre class="raw-json">{{ outputJson }}</pre>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import JsonViewer from './components/JsonViewer.vue'
import { formatJson as formatJsonUtil, compressJson as compressJsonUtil, escapeJson as escapeJsonUtil, unescapeJson as unescapeJsonUtil, tryParseJson } from './utils/jsonFormat'

const inputJson = ref('')
const outputJson = ref('')
const parseError = ref('')
const isDark = ref(false)
const jsonViewerRef = ref(null)
const currentLevel = ref(3)
const leftPanelWidth = ref(50) // 左侧面板宽度百分比
const isResizing = ref(false)
const viewMode = ref('tree') // 'tree' 树形视图, 'raw' 原始文本

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 显示 Toast
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

// 处理输入
function handleInput() {
  if (!inputJson.value.trim()) {
    parseError.value = ''
    outputJson.value = ''
    return
  }
  
  // 尝试解析（兼容 Python dict、尾随逗号等）
  const result = tryParseJson(inputJson.value)
  if (result.success) {
    parseError.value = ''
    // 自动格式化并显示结果
    outputJson.value = JSON.stringify(result.data, null, 2)
    viewMode.value = 'tree' // 自动解析使用树形视图
    // 更新层级显示
    setTimeout(() => updateCurrentLevel(), 50)
  } else {
    parseError.value = '无法解析为 JSON'
    outputJson.value = ''
  }
}

// 格式化
function formatJson() {
  if (!inputJson.value.trim()) {
    showToast('请输入 JSON', 'error')
    return
  }
  
  const result = formatJsonUtil(inputJson.value)
  if (result.startsWith('JSON格式错误')) {
    showToast(result, 'error')
    return
  }
  
  outputJson.value = result
  viewMode.value = 'tree' // 切换到树形视图
  showToast('格式化成功')
}

// 压缩
function compressJson() {
  if (!inputJson.value.trim()) {
    showToast('请输入 JSON', 'error')
    return
  }
  
  const result = compressJsonUtil(inputJson.value)
  if (result.startsWith('JSON格式错误')) {
    showToast(result, 'error')
    return
  }
  
  outputJson.value = result
  viewMode.value = 'raw' // 切换到原始文本模式
  showToast('压缩成功')
}

// 转义
function escapeJson() {
  if (!inputJson.value.trim()) {
    showToast('请输入内容', 'error')
    return
  }
  
  outputJson.value = escapeJsonUtil(inputJson.value)
  showToast('转义成功')
}

// 反转义
function unescapeJson() {
  if (!inputJson.value.trim()) {
    showToast('请输入内容', 'error')
    return
  }
  
  const result = unescapeJsonUtil(inputJson.value)
  if (result.startsWith('反转义失败')) {
    showToast(result, 'error')
    return
  }
  
  outputJson.value = result
  showToast('反转义成功')
}

// 复制输出
// 复制到剪贴板（兼容方案）
async function copyToClipboard(text) {
  // 方法1: Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {}
  }
  
  // 方法2: execCommand 备用方案
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (e) {
    return false
  }
}

async function copyOutput() {
  if (!outputJson.value) return
  
  const success = await copyToClipboard(outputJson.value)
  if (success) {
    showToast('已复制到剪贴板')
  } else {
    showToast('复制失败', 'error')
  }
}

// 下载 JSON 文件
function downloadJson() {
  if (!outputJson.value) return
  
  try {
    const blob = new Blob([outputJson.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('下载成功')
  } catch (e) {
    showToast('下载失败', 'error')
  }
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    inputJson.value = text
    handleInput()
    showToast('已粘贴')
  } catch (e) {
    // 粘贴 API 不可用时提示用户手动粘贴
    showToast('请使用 Ctrl+V 粘贴', 'error')
  }
}

// 清空输入
function clearInput() {
  inputJson.value = ''
  outputJson.value = ''
  parseError.value = ''
}

// 更新当前层级显示
function updateCurrentLevel() {
  currentLevel.value = jsonViewerRef.value?.getCurrentLevel() || 0
}

// 展开全部
function expandAll() {
  jsonViewerRef.value?.expandAll()
  updateCurrentLevel()
}

// 折叠全部
function collapseAll() {
  jsonViewerRef.value?.collapseAll()
  updateCurrentLevel()
}

// 展开一层
function expandOneLevel() {
  jsonViewerRef.value?.expandOneLevel()
  updateCurrentLevel()
}

// 折叠一层
function collapseOneLevel() {
  jsonViewerRef.value?.collapseOneLevel()
  updateCurrentLevel()
}

// 切换主题
function toggleTheme() {
  isDark.value = !isDark.value
  chrome.storage.local.set({ ujson_dark: isDark.value })
}

// 开始拖动调整宽度
function startResize(e) {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  const startX = e.clientX
  const startWidth = leftPanelWidth.value
  
  function onMouseMove(e) {
    if (!isResizing.value) return
    const mainEl = document.querySelector('.app-main')
    if (!mainEl) return
    
    const rect = mainEl.getBoundingClientRect()
    const resizeBarWidth = 8
    const availableWidth = rect.width - resizeBarWidth
    const deltaX = e.clientX - startX
    const deltaPercent = (deltaX / availableWidth) * 100
    
    let newWidth = startWidth + deltaPercent
    // 限制范围 20% - 80%
    newWidth = Math.max(20, Math.min(80, newWidth))
    leftPanelWidth.value = newWidth
  }
  
  function onMouseUp() {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}


// 加载保存的内容
async function loadSavedContent() {
  try {
    const result = await chrome.storage.local.get(['ujson_content', 'ujson_dark'])
    if (result.ujson_content) {
      inputJson.value = result.ujson_content
      handleInput()
    }
    isDark.value = result.ujson_dark || false
  } catch (e) {}
}

onMounted(() => {
  loadSavedContent()
})
</script>

<style scoped>
.editor-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* 头部 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
}

.logo-icon {
  font-family: monospace;
  font-size: 24px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 主内容 */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 操作工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 4px;
}

.format-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.format-btn:hover {
  background: var(--bg-hover);
}

.format-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.format-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.format-btn.active:hover {
  background: var(--primary-hover);
}

.format-btn .shortcut {
  font-size: 11px;
  opacity: 0.7;
}

/* 拖动分隔条 */
.resize-bar {
  width: 8px;
  cursor: col-resize;
  background: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}

.resize-bar:hover {
  background: var(--primary-color-light);
}

.resize-bar .resize-handle {
  color: var(--text-tertiary);
}

.resize-bar:hover .resize-handle {
  color: var(--primary-color);
}

/* 输入面板 */
.input-panel,
.output-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.level-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-color-light);
  border-radius: 6px;
}

.actions-divider {
  width: 1px;
  height: 16px;
  background: var(--border-color);
  margin: 0 4px;
  color: var(--text-primary);
}

.json-input {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-card);
  color: var(--text-primary);
  outline: none;
}

.json-input::placeholder {
  color: var(--text-tertiary);
}

.input-footer {
  padding: 8px 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  min-height: 36px;
}

.error-msg {
  color: #ff4d4f;
}

.success-msg {
  color: #52c41a;
}


/* 输出区域 */
.output-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-card);
}

/* 原始文本视图 */
.raw-output {
  height: 100%;
  overflow: auto;
  padding: 16px;
  background: var(--bg-card);
}

.raw-json {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-all;
  white-space: pre-wrap;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #52c41a;
  color: #fff;
}

.toast.error {
  background: #ff4d4f;
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 深色主题 */
.dark-theme .app-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
}
</style>
