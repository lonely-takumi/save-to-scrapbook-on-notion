// content.js - コンテンツスクリプト：ページ情報を取得

// ページ情報を取得する関数
function getPageInfo() {
  return {
    title: document.title || '',
    url: window.location.href
  };
}

// 拡張機能からのメッセージを受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    try {
      const pageInfo = getPageInfo();
      sendResponse(pageInfo);
    } catch (error) {
      console.error('コンテンツスクリプトでエラー:', error);
      sendResponse(null);
    }
  }
  return true;
});

// ページが読み込まれた時にコンテンツスクリプトが動作していることを確認
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Save to Notion content script loaded');
  });
} else {
  console.log('Save to Notion content script loaded');
}