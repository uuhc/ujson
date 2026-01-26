// Background Script - 处理插件事件

// 监听插件图标点击
chrome.action.onClicked.addListener((tab) => {
  // 打开编辑器页面
  chrome.tabs.create({
    url: chrome.runtime.getURL('editor.html')
  });
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJsonContent') {
    // 返回存储的 JSON 内容
    chrome.storage.local.get(['ujson_content', 'ujson_url', 'ujson_timestamp'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === 'saveJsonContent') {
    // 保存 JSON 内容
    chrome.storage.local.set({
      ujson_content: request.content,
      ujson_url: request.url || '',
      ujson_timestamp: Date.now()
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  return false;
});
