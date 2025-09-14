// background.js - バックグラウンドサービスワーカー

// 拡張機能がインストールされた時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Save to Notion extension installed');
});

// Notion APIにページを保存する関数
async function saveToNotion(pageData, apiKey, databaseId) {
  const { title, url, source, tags } = pageData;
  
  // タグを配列に変換（改行区切り）
  const tagArray = tags
    ? tags.split('\n').map(tag => ({ name: tag.trim() })).filter(tag => tag.name)
    : [];
  
  const requestBody = {
    parent: {
      database_id: databaseId
    },
    properties: {
      "URL": {
        url: url
      },
      "タグ": {
        multi_select: tagArray
      },
      "ソース": {
        select: { name: source }
      },
      "タイトル": {
        title: [{ text: { content: title } }]
      }
    }
  };

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving to Notion:', error);
    throw error;
  }
}

// メッセージハンドラー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToNotion') {
    saveToNotion(request.pageData, request.apiKey, request.databaseId)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 非同期応答を示す
  }
});
