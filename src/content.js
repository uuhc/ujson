// Content Script - 检测并格式化 JSON 页面
(function() {
  'use strict';

  // 防止重复注入
  if (window.__ujson_injected__) {
    return;
  }
  window.__ujson_injected__ = true;

  // 检查字符串是否是有效的 JSON
  function isValidJsonString(str) {
    if (!str || typeof str !== 'string') return false;

    const trimmed = str.trim();

    // 必须以 { 或 [ 开头
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return false;
    }

    // 必须以 } 或 ] 结尾（对称匹配）
    if (!trimmed.endsWith('}') && !trimmed.endsWith(']')) {
      return false;
    }

    // 尝试解析
    try {
      const parsed = JSON.parse(trimmed);
      // 必须是对象或数组
      return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
      return false;
    }
  }

  // 检测页面内容是否是 JSON（统一入口）
  function detectJson() {
    const body = document.body;
    if (!body) return null;

    // 获取页面的纯文本内容
    const bodyText = (body.innerText || '').trim();
    if (!bodyText) return null;

    let content = '';
    let isValidJson = false;

    // 策略：检查页面的核心内容是否是一个有效的 JSON

    // 优先检查 pre 标签（浏览器通常把 JSON 响应放在 pre 里）
    const preElement = document.querySelector('pre');
    if (preElement) {
      const preText = (preElement.textContent || '').trim();

      // 检查 pre 内容是否构成有效 JSON
      if (preText && isValidJsonString(preText)) {
        // pre 内容是有效的 JSON，检查它是否是页面的主要部分
        const ratio = preText.length / bodyText.length;

        // pre 内容至少占页面内容的 80%
        if (ratio >= 0.8) {
          content = preText;
          isValidJson = true;
        }
      }
    }

    // 如果 pre 标签不是主要部分，检查整个页面
    if (!content && isValidJsonString(bodyText)) {
      content = bodyText;
      isValidJson = true;
    }

    // 如果没有找到有效 JSON，返回 null
    if (!content || !isValidJson) {
      return null;
    }

    // 解析 JSON
    try {
      const parsed = JSON.parse(content);
      return { content, parsed };
    } catch (e) {
      return null;
    }
  }

  // 创建格式化视图
  function createViewer(jsonContent) {
    // 保存原始内容到 storage
    chrome.storage.local.set({
      ujson_content: jsonContent,
      ujson_url: window.location.href,
      ujson_timestamp: Date.now()
    });

    // 创建 wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'ujson-viewer-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      background: #fff;
    `;

    // 创建 iframe 加载预览页面
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('viewer.html?auto=true');
    iframe.allow = 'clipboard-write';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;

    wrapper.appendChild(iframe);
    
    // 隐藏原始内容
    document.body.style.overflow = 'hidden';
    document.body.appendChild(wrapper);

    // 监听关闭消息
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'ujson-close') {
        // 移除 wrapper
        wrapper.remove();
        // 恢复原始内容
        document.body.style.overflow = '';
      }
    });
  }

  // 主函数
  function main() {
    // 检测是否是 JSON 页面
    const jsonData = detectJson();
    
    if (jsonData) {
      // 是 JSON 内容，创建格式化视图
      createViewer(jsonData.content);
    }
  }

  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    // 延迟执行，确保页面完全渲染
    setTimeout(main, 100);
  }
})();
