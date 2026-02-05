<template>
    <div class="json-node" :class="{ collapsed: isCollapsed }">
        <div 
            class="json-line" 
            :style="{ paddingLeft: (level * 4 + 6) + 'ch' }" 
            @mouseenter="isHovered = true" 
            @mouseleave="isHovered = false"
        >
            <span class="line-number">{{ currentLineNumber }}</span>
            <!-- 删除按钮容器 -->
            <span 
                v-if="editable && key !== null && level > 0" 
                class="json-delete-container"
            >
                <span 
                    v-if="isHovered" 
                    class="json-delete"
                    @click.stop="handleDelete"
                    title="删除此项"
                >
                    <svg 
                        viewBox="0 0 16 16"
                        width="14"
                        height="14"
                        class="delete-icon"
                    >
                        <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </span>
            </span>
            <span 
                v-if="isObject || isArray" 
                class="json-toggle"
                @click="handleToggle"
            >
                <svg 
                    v-if="isCollapsed"
                    class="toggle-icon toggle-icon-plus"
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                >
                    <rect x="1" y="1" width="14" height="14" rx="2" fill="white" stroke="currentColor" stroke-width="0.8" opacity="0.6" />
                    <line x1="8" y1="4" x2="8" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
                    <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
                </svg>
                <svg 
                    v-else
                    class="toggle-icon toggle-icon-minus"
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                >
                    <rect x="1" y="1" width="14" height="14" rx="2" fill="white" stroke="currentColor" stroke-width="0.8" opacity="0.6" />
                    <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
                </svg>
            </span>
            <span v-else class="json-toggle-placeholder"></span>
            
            <!-- Key -->
            <span v-if="key !== null && !isArrayItem && level > 0" class="json-key">"{{ key }}"</span>
            <span v-if="key !== null && isArrayItem && level > 0" class="json-array-index">{{ key }}</span>
            <span v-if="key !== null && level > 0" class="json-colon">:</span>
            
            <!-- 类型标识 -->
            <span v-if="isObject" class="json-brace json-brace-open">{</span>
            <span v-if="isArray" class="json-bracket json-bracket-open">[</span>
            
            <span v-if="(isObject || isArray) && !isCollapsed" class="json-items-count">
                {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
            </span>
            
            <!-- 普通值 -->
            <template v-if="!isObject && !isArray">
                <JsonValue :value="data" />
                <span v-if="!isLast" class="json-comma">,</span>
            </template>
            
            <!-- 折叠时显示 -->
            <template v-if="isCollapsed">
                <span v-if="isObject" class="json-ellipsis">...</span>
                <span v-if="isArray" class="json-ellipsis">...</span>
                <span class="json-items-count">{{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}</span>
                <span v-if="isObject" class="json-brace json-brace-close">}</span>
                <span v-if="isArray" class="json-bracket json-bracket-close">]</span>
                <span v-if="!isLast" class="json-comma">,</span>
            </template>
        </div>
        
        <!-- 展开的内容 -->
        <div v-if="!isCollapsed" class="json-children" :class="{ 'has-children': isObject || isArray }">
            <div v-if="level >= 0 && (isObject || isArray)" class="json-indent-line" :style="{ left: (level * 4 + 8) + 'ch' }"></div>
            
            <template v-if="isObject">
                <template v-for="(value, k, index) in data" :key="k">
                    <JsonNode
                        :data="value"
                        :key-name="k"
                        :level="level + 1"
                        :path="path + '.' + k"
                        :collapsed="collapsed"
                        :collapsed-version="collapsedVersion"
                        :line-numbers="lineNumbers"
                        :is-last="index === Object.keys(data).length - 1"
                        :editable="editable"
                        @toggle="$emit('toggle', $event)"
                        @delete="$emit('delete', $event)"
                    />
                </template>
                <div 
                    class="json-line json-close-line" 
                    :style="{ paddingLeft: (level * 4 + 6) + 'ch' }"
                >
                    <span class="line-number">{{ closeLineNumber }}</span>
                    <span v-if="editable && key !== null && level > 0" class="json-delete-container-placeholder"></span>
                    <span class="json-toggle-placeholder"></span>
                    <span class="json-brace json-brace-close">}</span>
                    <span v-if="!isLast" class="json-comma">,</span>
                </div>
            </template>
            
            <template v-else-if="isArray">
                <template v-for="(item, index) in data" :key="index">
                    <JsonNode
                        :data="item"
                        :key-name="index"
                        :level="level + 1"
                        :path="path + '[' + index + ']'"
                        :collapsed="collapsed"
                        :collapsed-version="collapsedVersion"
                        :line-numbers="lineNumbers"
                        :is-last="index === data.length - 1"
                        :is-array-item="true"
                        :editable="editable"
                        @toggle="$emit('toggle', $event)"
                        @delete="$emit('delete', $event)"
                    />
                </template>
                <div 
                    class="json-line json-close-line" 
                    :style="{ paddingLeft: (level * 4 + 6) + 'ch' }"
                >
                    <span class="line-number">{{ closeLineNumber }}</span>
                    <span v-if="editable && key !== null && level > 0" class="json-delete-container-placeholder"></span>
                    <span class="json-toggle-placeholder"></span>
                    <span class="json-bracket json-bracket-close">]</span>
                    <span v-if="!isLast" class="json-comma">,</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import JsonValue from './JsonValue.vue'

const props = defineProps({
    data: {
        required: true
    },
    keyName: {
        type: [String, Number],
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    path: {
        type: String,
        default: ''
    },
    collapsed: {
        type: Set,
        default: () => new Set()
    },
    collapsedVersion: {
        type: Number,
        default: 0
    },
    lineNumbers: {
        type: Map,
        default: () => new Map()
    },
    isLast: {
        type: Boolean,
        default: false
    },
    isArrayItem: {
        type: Boolean,
        default: false
    },
    editable: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['toggle', 'delete'])

const isHovered = ref(false)

const key = computed(() => props.keyName)
const isObject = computed(() => typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data))
const isArray = computed(() => Array.isArray(props.data))
const isCollapsed = computed(() => {
    props.collapsedVersion
    return props.collapsed.has(props.path)
})
const isArrayItem = computed(() => props.isArrayItem)
const itemCount = computed(() => {
    if (isObject.value) {
        return Object.keys(props.data).length
    } else if (isArray.value) {
        return props.data.length
    }
    return 0
})

// 当前行的行号
const currentLineNumber = computed(() => {
    const pathKey = props.path || '_root'
    return props.lineNumbers.get(pathKey) || ''
})

// 闭合括号行的行号
const closeLineNumber = computed(() => {
    const pathKey = (props.path || '_root') + '_close'
    return props.lineNumbers.get(pathKey) || ''
})

const handleToggle = () => {
    emit('toggle', props.path)
}

const handleDelete = () => {
    emit('delete', props.path)
}
</script>

<style scoped>
.json-node {
    user-select: text;
}

.json-line {
    display: flex;
    align-items: center;
    min-height: 22px;
    white-space: pre;
}

/* 行号 */
.line-number {
    position: absolute;
    left: 0;
    width: 5ch;
    text-align: right;
    color: var(--text-tertiary, #999);
    font-size: 12px;
    user-select: none;
    opacity: 0.6;
}

.json-line:hover .line-number {
    opacity: 1;
}

.json-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2ch;
    height: 16px;
    cursor: pointer;
    margin-right: 0;
    color: var(--text-tertiary, #999);
    transition: color 0.2s, opacity 0.2s;
    flex-shrink: 0;
}

.json-toggle:hover {
    color: var(--text-secondary, #666);
    opacity: 1;
}

.toggle-icon {
    display: inline-block;
    flex-shrink: 0;
    transition: transform 0.2s ease, color 0.2s ease;
    color: inherit;
}

.json-toggle-placeholder {
    width: 2ch;
    display: inline-block;
    flex-shrink: 0;
}

.json-delete-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 0;
}

.json-delete-container-placeholder {
    display: inline-block;
    width: 20px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 0;
}

.json-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: var(--error-color, #ff4d4f);
    opacity: 0.7;
    transition: opacity 0.2s, transform 0.2s;
    flex-shrink: 0;
}

.json-delete:hover {
    opacity: 1;
    transform: scale(1.1);
}

.delete-icon {
    display: inline-block;
    flex-shrink: 0;
}

.json-key {
    color: #a626a4;
    font-weight: 500;
    flex-shrink: 0;
    white-space: nowrap;
}

.json-colon {
    margin: 0 4px;
    color: var(--text-primary);
    flex-shrink: 0;
}

.json-brace,
.json-bracket {
    color: var(--text-primary);
    font-weight: 500;
}

.json-brace-open,
.json-bracket-open {
    margin-right: 4px;
}

.json-brace-close,
.json-bracket-close {
    margin-left: 4px;
}

.json-ellipsis {
    color: var(--text-tertiary, #999);
    margin: 0 4px;
}

.json-items-count {
    color: var(--text-tertiary, #999);
    font-size: 12px;
    margin-left: 4px;
    font-style: italic;
}

.json-array-index {
    color: var(--text-tertiary, #999);
    margin-right: 4px;
    flex-shrink: 0;
    white-space: nowrap;
}

.json-comma {
    color: var(--text-primary);
    margin-left: 4px;
}

.json-children {
    position: relative;
}

/* 层级指示线 */
.json-indent-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--primary-color, #1890ff);
    opacity: 0.2;
    pointer-events: none;
    z-index: 0;
}

.json-children > .json-node {
    position: relative;
    z-index: 1;
}

.json-close-line {
    position: relative;
    z-index: 1;
}

/* 深色主题适配 */
.dark-theme .json-key {
    color: #c586c0;
}

.dark-theme .json-items-count {
    color: var(--text-tertiary, #888);
}

.dark-theme .json-toggle {
    color: var(--text-tertiary, #888);
}

.dark-theme .json-toggle:hover {
    color: var(--text-secondary, #aaa);
}

.dark-theme .toggle-icon rect {
    fill: rgba(255, 255, 255, 0.08);
    stroke: var(--text-tertiary, #888);
    opacity: 0.5;
}

.dark-theme .toggle-icon line {
    opacity: 0.6;
}
</style>
