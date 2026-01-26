<template>
    <span :class="valueClass">{{ formattedValue }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    value: {
        required: true
    }
})

const valueClass = computed(() => {
    const type = typeof props.value
    if (type === 'string') return 'json-value-string'
    if (type === 'number') return 'json-value-number'
    if (type === 'boolean') return 'json-value-boolean'
    if (props.value === null) return 'json-value-null'
    return 'json-value-other'
})

const formattedValue = computed(() => {
    if (typeof props.value === 'string') {
        return JSON.stringify(props.value)
    }
    if (props.value === null) {
        return 'null'
    }
    if (typeof props.value === 'boolean') {
        return props.value.toString()
    }
    return String(props.value)
})
</script>

<style scoped>
.json-value-string {
    color: #50a14f;
}

.json-value-number {
    color: #986801;
}

.json-value-boolean {
    color: #0184bc;
}

.json-value-null {
    color: #a0a1a7;
    font-style: italic;
}

.json-value-other {
    color: var(--text-primary);
}

/* 深色主题适配 */
.dark-theme .json-value-string {
    color: #98c379;
}

.dark-theme .json-value-number {
    color: #d19a66;
}

.dark-theme .json-value-boolean {
    color: #56b6c2;
}

.dark-theme .json-value-null {
    color: #5c6370;
}
</style>
