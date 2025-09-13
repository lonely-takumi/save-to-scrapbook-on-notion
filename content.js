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
    sendResponse(getPageInfo());
  }
  return true;
});