/**
 * JSON格式化工具
 */

/**
 * 将Python dict格式转换为JSON格式
 */
function convertPythonDictToJson(pythonStr) {
  let result = pythonStr.trim()
  
  result = result.replace(/\bTrue\b/g, 'true')
  result = result.replace(/\bFalse\b/g, 'false')
  result = result.replace(/\bNone\b/g, 'null')
  
  let converted = ''
  let inString = false
  let stringChar = null
  let escaped = false
  
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    
    if (escaped) {
      converted += char
      escaped = false
      continue
    }
    
    if (char === '\\') {
      escaped = true
      converted += char
      continue
    }
    
    if (!inString && (char === "'" || char === '"')) {
      inString = true
      stringChar = char
      converted += '"'
    } else if (inString && char === stringChar) {
      inString = false
      stringChar = null
      converted += '"'
    } else if (inString && char === '"' && stringChar === "'") {
      converted += '\\"'
    } else if (inString && char === '"' && stringChar === '"') {
      converted += '\\"'
    } else {
      converted += char
    }
  }
  
  return converted
}

/**
 * 检测是否是Python dict格式
 */
function isPythonDictFormat(str) {
  const trimmed = str.trim()
  const hasSingleQuotes = /'[^']*'/.test(trimmed)
  const hasPythonValues = /\b(True|False|None)\b/.test(trimmed)
  const looksLikeDict = trimmed.startsWith('{') || trimmed.startsWith('[')
  
  return looksLikeDict && (hasSingleQuotes || hasPythonValues)
}

/**
 * 尝试多层反转义并解析JSON
 */
function tryUnescapeAndParse(str, maxDepth = 5) {
  let current = str.trim()
  
  if (!current.startsWith('"') && !current.startsWith("'") && current.includes('\\"')) {
    try {
      const withQuotes = '"' + current + '"'
      const parsed = JSON.parse(withQuotes)
      if (typeof parsed === 'string') {
        const trimmed = parsed.trim()
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            const innerObj = JSON.parse(parsed)
            if (typeof innerObj === 'object' && innerObj !== null) {
              return { success: true, result: innerObj, depth: 1 }
            }
          } catch (e) {}
        }
        current = parsed
      } else if (typeof parsed === 'object' && parsed !== null) {
        return { success: true, result: parsed, depth: 1 }
      }
    } catch (e) {}
  }
  
  for (let i = 0; i < maxDepth; i++) {
    try {
      const parsed = JSON.parse(current)
      
      if (typeof parsed === 'object' && parsed !== null) {
        return { success: true, result: parsed, depth: i }
      }
      
      if (typeof parsed === 'string') {
        const trimmed = parsed.trim()
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          current = parsed
          continue
        } else {
          return { success: false, result: null, depth: i }
        }
      } else {
        return { success: false, result: null, depth: i }
      }
    } catch (e) {
      if (i === 0) {
        return { success: false, result: null, depth: 0 }
      }
      return { success: false, result: null, depth: i - 1 }
    }
  }
  
  return { success: false, result: null, depth: maxDepth }
}

/**
 * 清理尾随逗号
 */
function cleanTrailingCommas(str) {
  return str.replace(/,(\s*[}\]])/g, '$1')
}

/**
 * 格式化JSON字符串
 */
export function formatJson(jsonStr, indent = 2) {
  if (!jsonStr || !jsonStr.trim()) return ''
  
  try {
    let processedStr = jsonStr.replace(/\\'/g, "'")
    processedStr = cleanTrailingCommas(processedStr)
    
    try {
      const obj = JSON.parse(processedStr)
      if (typeof obj === 'object' && obj !== null) {
        return JSON.stringify(obj, null, indent)
      }
    } catch (e) {}
    
    if (isPythonDictFormat(processedStr)) {
      try {
        const converted = convertPythonDictToJson(processedStr)
        const obj = JSON.parse(converted)
        if (typeof obj === 'object' && obj !== null) {
          return JSON.stringify(obj, null, indent)
        }
      } catch (e) {}
    }
    
    const unescapeResult = tryUnescapeAndParse(processedStr)
    if (unescapeResult.success) {
      return JSON.stringify(unescapeResult.result, null, indent)
    }
    
    return 'JSON格式错误：无法解析JSON字符串'
  } catch (e) {
    return 'JSON格式错误：' + e.message
  }
}

/**
 * 压缩JSON字符串
 */
export function compressJson(jsonStr) {
  if (!jsonStr || !jsonStr.trim()) return ''
  
  try {
    let processedStr = jsonStr.replace(/\\'/g, "'")
    processedStr = cleanTrailingCommas(processedStr)
    
    try {
      const obj = JSON.parse(processedStr)
      if (typeof obj === 'object' && obj !== null) {
        return JSON.stringify(obj)
      }
    } catch (e) {}
    
    if (isPythonDictFormat(processedStr)) {
      try {
        const converted = convertPythonDictToJson(processedStr)
        const obj = JSON.parse(converted)
        if (typeof obj === 'object' && obj !== null) {
          return JSON.stringify(obj)
        }
      } catch (e) {}
    }
    
    const unescapeResult = tryUnescapeAndParse(processedStr)
    if (unescapeResult.success) {
      return JSON.stringify(unescapeResult.result)
    }
    
    return 'JSON格式错误：无法解析JSON字符串'
  } catch (e) {
    return 'JSON格式错误：' + e.message
  }
}

/**
 * 验证JSON字符串是否有效
 */
export function validateJson(jsonStr) {
  if (!jsonStr || !jsonStr.trim()) {
    return { valid: false, error: 'JSON字符串为空' }
  }
  
  try {
    const cleaned = cleanTrailingCommas(jsonStr)
    JSON.parse(cleaned)
    return { valid: true, error: null }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}

/**
 * JSON转义
 */
export function escapeJson(jsonStr) {
  if (!jsonStr) return ''
  return JSON.stringify(jsonStr)
}

/**
 * JSON反转义
 */
export function unescapeJson(escapedStr, multiLayer = true) {
  if (!escapedStr || !escapedStr.trim()) return ''
  
  try {
    if (multiLayer) {
      const unescapeResult = tryUnescapeAndParse(escapedStr)
      if (unescapeResult.success) {
        if (typeof unescapeResult.result === 'object' && unescapeResult.result !== null) {
          return JSON.stringify(unescapeResult.result, null, 2)
        }
        return String(unescapeResult.result)
      }
    }
    
    try {
      const result = JSON.parse(escapedStr)
      if (typeof result === 'object' && result !== null) {
        return JSON.stringify(result, null, 2)
      }
      return String(result)
    } catch (e) {
      return '反转义失败：' + e.message
    }
  } catch (e) {
    return '反转义失败：' + e.message
  }
}

/**
 * 检测字符串是否是有效的JSON
 */
export function isValidJson(str) {
  if (!str || !str.trim()) return false
  try {
    JSON.parse(str.trim())
    return true
  } catch (e) {
    return false
  }
}

/**
 * 尝试解析为 JSON 对象（兼容 Python dict、尾随逗号等）
 * 返回 { success: boolean, data: object|null }
 */
export function tryParseJson(str) {
  if (!str || !str.trim()) {
    return { success: false, data: null }
  }
  
  let processedStr = str.trim()
  
  // 检查是否以 { 或 [ 开头
  if (!processedStr.startsWith('{') && !processedStr.startsWith('[')) {
    return { success: false, data: null }
  }
  
  // 1. 先尝试直接解析
  try {
    const obj = JSON.parse(processedStr)
    if (typeof obj === 'object' && obj !== null) {
      return { success: true, data: obj }
    }
  } catch (e) {}
  
  // 2. 清理尾随逗号后再试
  processedStr = cleanTrailingCommas(processedStr)
  try {
    const obj = JSON.parse(processedStr)
    if (typeof obj === 'object' && obj !== null) {
      return { success: true, data: obj }
    }
  } catch (e) {}
  
  // 3. 尝试 Python dict 格式
  if (isPythonDictFormat(str)) {
    try {
      const converted = convertPythonDictToJson(processedStr)
      const cleaned = cleanTrailingCommas(converted)
      const obj = JSON.parse(cleaned)
      if (typeof obj === 'object' && obj !== null) {
        return { success: true, data: obj }
      }
    } catch (e) {}
  }
  
  // 4. 尝试反转义
  const unescapeResult = tryUnescapeAndParse(processedStr)
  if (unescapeResult.success) {
    return { success: true, data: unescapeResult.result }
  }
  
  return { success: false, data: null }
}
