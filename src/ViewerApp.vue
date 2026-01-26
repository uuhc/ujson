<template>
  <div class="viewer-app" :class="{ 'dark-theme': isDark }">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="logo">
          <span class="logo-icon">{u}</span>
          <span class="logo-text">uJson</span>
        </div>
        <span class="url-badge" v-if="sourceUrl">{{ sourceUrl }}</span>
      </div>
      <div class="toolbar-right">
        <!-- 折叠一层 -->
        <button class="toolbar-btn" @click="collapseOneLevel" title="折叠一层">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 14l5-5 5 5" />
          </svg>
        </button>
        <!-- 当前层级 -->
        <span class="level-indicator" :title="`当前展开 ${currentLevel} 层`">{{ currentLevel }}</span>
        <!-- 展开一层 -->
        <button class="toolbar-btn" @click="expandOneLevel" title="展开一层">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </button>
        <span class="toolbar-divider"></span>
        <!-- 折叠全部 -->
        <button class="toolbar-btn" @click="collapseAll" title="折叠全部">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 11l5-5 5 5" />
            <path d="M7 17l5-5 5 5" />
          </svg>
        </button>
        <!-- 展开全部 -->
        <button class="toolbar-btn" @click="expandAll" title="展开全部">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7l5 5 5-5" />
            <path d="M7 13l5 5 5-5" />
          </svg>
        </button>
        <button class="toolbar-btn" @click="copyJson" title="复制 JSON">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="openInEditor" title="在编辑器中打开">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="toggleTheme" :title="isDark ? '切换亮色主题' : '切换暗色主题'">
          <svg v-if="isDark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button class="toolbar-btn close-btn" @click="closeViewer" title="关闭">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- JSON 查看器 -->
    <div class="viewer-content">
      <JsonViewer 
        ref="jsonViewerRef"
        :json="jsonContent" 
        :default-expand-level="3"
      />
    </div>

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

const jsonContent = ref('')
const sourceUrl = ref('')
const isDark = ref(false)
const jsonViewerRef = ref(null)
const currentLevel = ref(0)

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

// 加载 JSON 内容
async function loadContent() {
  try {
    const result = await chrome.storage.local.get(['ujson_content', 'ujson_url'])
    if (result.ujson_content) {
      jsonContent.value = result.ujson_content
      sourceUrl.value = result.ujson_url || ''
    }
  } catch (e) {
    console.error('加载 JSON 内容失败:', e)
  }
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

// 复制 JSON（兼容 iframe 环境）
async function copyJson() {
  const text = jsonContent.value
  
  // 方法1: 尝试使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      showToast('已复制到剪贴板')
      return
    } catch (e) {
      // Clipboard API 失败，尝试备用方案
    }
  }
  
  // 方法2: 使用 execCommand 备用方案
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    
    if (success) {
      showToast('已复制到剪贴板')
    } else {
      showToast('复制失败', 'error')
    }
  } catch (e) {
    showToast('复制失败', 'error')
  }
}

// 在编辑器中打开
function openInEditor() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('editor.html')
  })
}

// 切换主题
function toggleTheme() {
  isDark.value = !isDark.value
  chrome.storage.local.set({ ujson_dark: isDark.value })
}

// 关闭查看器
function closeViewer() {
  // 通知父页面关闭 iframe
  window.parent.postMessage({ type: 'ujson-close' }, '*')
}

// 加载主题设置
async function loadTheme() {
  try {
    const result = await chrome.storage.local.get(['ujson_dark'])
    isDark.value = result.ujson_dark || false
  } catch (e) {}
}

onMounted(() => {
  loadTheme()
  loadContent()
  // 延迟获取初始层级
  setTimeout(() => {
    updateCurrentLevel()
  }, 100)
})
</script>

<style scoped>
.viewer-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.logo-icon {
  color: var(--primary-color);
  font-family: monospace;
  font-size: 18px;
}

.url-badge {
  font-size: 12px;
  color: var(--text-tertiary);
  background: var(--bg-hover);
  padding: 4px 8px;
  border-radius: 4px;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn.close-btn:hover {
  background: #ff4d4f;
  color: #fff;
}

.level-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-color-light, rgba(24, 144, 255, 0.1));
  border-radius: 4px;
  margin: 0 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 8px;
}

/* 内容区域 */
.viewer-content {
  flex: 1;
  overflow: hidden;
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
</style>
