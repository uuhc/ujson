<template>
    <div class="json-viewer" ref="viewerRef" @scroll="handleScroll">
        <div class="json-content" v-if="parsedData !== null">
            <JsonNode 
                :key="`json-node-${collapsedPathsVersion}`"
                :data="parsedData" 
                :level="0" 
                :path="''"
                :collapsed="collapsedPaths"
                :collapsed-version="collapsedPathsVersion"
                :line-numbers="lineNumbers"
                :is-last="true"
                @toggle="handleToggle"
            />
        </div>
        <div v-else class="json-error">
            {{ error || '无效的JSON' }}
        </div>
        
        <!-- 回到顶部按钮 -->
        <transition name="fade">
            <button 
                v-if="showScrollTop" 
                class="scroll-to-top-btn"
                @click="scrollToTop"
                title="回到顶部"
            >
                <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                >
                    <path d="M18 15l-6-6-6 6" />
                </svg>
            </button>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import JsonNode from './JsonNode.vue'

const props = defineProps({
    json: {
        type: String,
        default: ''
    },
    defaultExpandLevel: {
        type: Number,
        default: 2
    }
})

const parsedData = ref(null)
const error = ref('')
const collapsedPaths = ref(new Set())
const collapsedPathsVersion = ref(0)
const lineNumbers = ref(new Map())
const currentExpandLevel = ref(2) // 当前展开层级
const maxDepth = ref(0) // JSON 最大深度

const viewerRef = ref(null)
const showScrollTop = ref(false)

// 计算每个路径对应的行号
function calculateLineNumbers(obj, path = '') {
    const lines = new Map()
    let lineNum = 1
    
    function traverse(data, currentPath, isCloseBracket = false) {
        if (isCloseBracket) {
            lines.set(currentPath + '_close', lineNum++)
            return
        }
        
        lines.set(currentPath || '_root', lineNum++)
        
        if (typeof data === 'object' && data !== null) {
            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    const itemPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`
                    traverse(item, itemPath)
                })
            } else {
                Object.keys(data).forEach((key) => {
                    const keyPath = currentPath ? `${currentPath}.${key}` : `.${key}`
                    traverse(data[key], keyPath)
                })
            }
            // 闭合括号行
            lines.set((currentPath || '_root') + '_close', lineNum++)
        }
    }
    
    traverse(obj, path)
    return lines
}

// 递归标记折叠节点
function markCollapsedNodes(obj, level, path, maxLevel, collapsedSet) {
    if (level > maxLevel) {
        if (path) {
            collapsedSet.add(path)
        }
    }
    
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                const itemPath = path ? `${path}[${index}]` : `[${index}]`
                markCollapsedNodes(item, level + 1, itemPath, maxLevel, collapsedSet)
            })
        } else {
            Object.keys(obj).forEach((key) => {
                const keyPath = path ? `${path}.${key}` : `.${key}`
                markCollapsedNodes(obj[key], level + 1, keyPath, maxLevel, collapsedSet)
            })
        }
    }
}

// 解析JSON
const parseJson = () => {
    if (!props.json || !props.json.trim()) {
        parsedData.value = null
        error.value = ''
        return
    }

    try {
        parsedData.value = JSON.parse(props.json)
        error.value = ''
        // 计算行号
        lineNumbers.value = calculateLineNumbers(parsedData.value)
        // 计算最大深度
        maxDepth.value = calculateMaxDepth(parsedData.value)
        // 初始化展开层级
        currentExpandLevel.value = props.defaultExpandLevel
        const newCollapsedPaths = new Set()
        if (props.defaultExpandLevel >= 0) {
            markCollapsedNodes(parsedData.value, 0, '', props.defaultExpandLevel, newCollapsedPaths)
        }
        collapsedPaths.value = newCollapsedPaths
        collapsedPathsVersion.value++
    } catch (e) {
        parsedData.value = null
        error.value = e.message
    }
}

const handleToggle = (path) => {
    if (collapsedPaths.value.has(path)) {
        collapsedPaths.value.delete(path)
    } else {
        collapsedPaths.value.add(path)
    }
    collapsedPaths.value = new Set(collapsedPaths.value)
    collapsedPathsVersion.value++
}

// 处理滚动事件
const handleScroll = () => {
    if (viewerRef.value) {
        showScrollTop.value = viewerRef.value.scrollTop > 300
    }
}

// 滚动到顶部
const scrollToTop = () => {
    if (viewerRef.value) {
        viewerRef.value.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}

// 计算 JSON 最大深度
function calculateMaxDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) {
        return depth
    }
    let max = depth
    if (Array.isArray(obj)) {
        obj.forEach(item => {
            max = Math.max(max, calculateMaxDepth(item, depth + 1))
        })
    } else {
        Object.values(obj).forEach(value => {
            max = Math.max(max, calculateMaxDepth(value, depth + 1))
        })
    }
    return max
}

// 展开全部
const expandAll = () => {
    collapsedPaths.value = new Set()
    currentExpandLevel.value = maxDepth.value
    collapsedPathsVersion.value++
}

// 折叠全部
const collapseAll = () => {
    if (parsedData.value !== null) {
        const newCollapsedPaths = new Set()
        markCollapsedNodes(parsedData.value, 0, '', 0, newCollapsedPaths)
        collapsedPaths.value = newCollapsedPaths
        currentExpandLevel.value = 0
        collapsedPathsVersion.value++
    }
}

// 展开一层
const expandOneLevel = () => {
    if (parsedData.value !== null && currentExpandLevel.value < maxDepth.value) {
        currentExpandLevel.value++
        const newCollapsedPaths = new Set()
        markCollapsedNodes(parsedData.value, 0, '', currentExpandLevel.value, newCollapsedPaths)
        collapsedPaths.value = newCollapsedPaths
        collapsedPathsVersion.value++
    }
}

// 折叠一层
const collapseOneLevel = () => {
    if (parsedData.value !== null && currentExpandLevel.value > 0) {
        currentExpandLevel.value--
        const newCollapsedPaths = new Set()
        markCollapsedNodes(parsedData.value, 0, '', currentExpandLevel.value, newCollapsedPaths)
        collapsedPaths.value = newCollapsedPaths
        collapsedPathsVersion.value++
    }
}

// 获取当前展开层级
const getCurrentLevel = () => {
    return currentExpandLevel.value
}

// 暴露方法给父组件
defineExpose({
    expandAll,
    collapseAll,
    expandOneLevel,
    collapseOneLevel,
    getCurrentLevel
})

watch(() => props.json, parseJson, { immediate: true })
watch(() => props.defaultExpandLevel, (newLevel) => {
    if (parsedData.value !== null) {
        const newCollapsedPaths = new Set()
        if (newLevel >= 0) {
            markCollapsedNodes(parsedData.value, 0, '', newLevel, newCollapsedPaths)
        }
        collapsedPaths.value = newCollapsedPaths
        collapsedPathsVersion.value++
    }
}, { immediate: false })

onMounted(() => {
    parseJson()
    if (viewerRef.value) {
        handleScroll()
    }
})
</script>

<style scoped>
.json-viewer {
    width: 100%;
    height: 100%;
    overflow: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    font-size: 13px;
    line-height: 1.6;
    position: relative;
}

.json-content {
    padding: 16px;
    padding-left: 0;
    background: var(--bg-card);
    color: var(--text-primary);
    min-height: 100%;
}

.json-error {
    padding: 16px;
    color: var(--error-color, #ff4d4f);
    background: var(--bg-card);
}

/* 滚动条样式 */
.json-viewer::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.json-viewer::-webkit-scrollbar-track {
    background: var(--bg-primary);
}

.json-viewer::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

.json-viewer::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
}

/* 回到顶部按钮 */
.scroll-to-top-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--bg-card, #fff);
    border: 1px solid var(--border-color, #e0e0e0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary, #333);
    transition: all 0.3s ease;
    z-index: 9999;
    padding: 0;
}

.scroll-to-top-btn:hover {
    background: var(--primary-color, #1890ff);
    color: #fff;
    border-color: var(--primary-color, #1890ff);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    transform: translateY(-2px);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

/* 深色主题适配 */
.dark-theme .scroll-to-top-btn {
    background: var(--bg-card, #1f1f1f);
    border-color: var(--border-color, #434343);
    color: var(--text-primary, #ccc);
}

.dark-theme .scroll-to-top-btn:hover {
    background: var(--primary-color, #1890ff);
    color: #fff;
    border-color: var(--primary-color, #1890ff);
}
</style>
