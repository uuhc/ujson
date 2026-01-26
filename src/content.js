// Content Script - 检测并格式化 JSON 页面
(function() {
  'use strict';

  // 防止重复注入
  if (window.__ujson_injected__) {
    return;
  }
  window.__ujson_injected__ = true;

  // 检测页面内容是否是 JSON
  function detectJson() {
    // 获取页面内容
    let content = '';
    
    // 方式1: 检查 <pre> 标签（浏览器通常把 JSON 放在 pre 里）
    const preElement = document.querySelector('pre');
    if (preElement) {
      content = preElement.textContent || '';
    }
    
    // 方式2: 如果没有 pre，检查 body 的纯文本内容
    if (!content) {
      content = document.body?.innerText || '';
    }
    
    // 清理内容
    content = content.trim();
    
    // 检查是否是有效 JSON
    if (!content) return null;
    
    // 必须以 { 或 [ 开头
    if (!content.startsWith('{') && !content.startsWith('[')) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(content);
      // 确保是对象或数组
      if (typeof parsed === 'object' && parsed !== null) {
        return { content, parsed };
      }
    } catch (e) {
      // 不是有效的 JSON
    }
    
    return null;
  }

  // 检查 URL 是否可能是 JSON
  function isLikelyJsonUrl() {
    const url = window.location.href.toLowerCase();
    // .json 文件
    if (url.endsWith('.json')) return true;
    // API 接口常见模式
    if (url.includes('/api/') || url.includes('/json')) return true;
    return false;
  }

  // 检查 Content-Type（通过 meta 或其他方式）
  function checkContentType() {
    // 检查是否有 JSON 相关的 Content-Type
    // 注意：Content-Type 头部无法直接在 content script 中获取
    // 但我们可以通过页面特征来判断
    const contentTypeTag = document.querySelector('meta[http-equiv="content-type"]');
    if (contentTypeTag) {
      const content = contentTypeTag.getAttribute('content') || '';
      if (content.includes('application/json')) return true;
    }
    return false;
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
