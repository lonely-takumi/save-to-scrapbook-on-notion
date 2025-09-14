// popup.js - ポップアップのメイン機能

document.addEventListener('DOMContentLoaded', async () => {
  // DOM要素の取得
  const apiKeyInput = document.getElementById('api-key');
  const databaseIdInput = document.getElementById('database-id');
  const saveSettingsBtn = document.getElementById('save-settings');
  const pageTitleDiv = document.getElementById('page-title');
  const pageUrlDiv = document.getElementById('page-url');
  const sourceSelect = document.getElementById('source');
  const tagsInput = document.getElementById('tags');
  const savePageBtn = document.getElementById('save-page');
  const statusDiv = document.getElementById('status');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // タブ切り替え機能
  function switchTab(targetTabId) {
    // すべてのタブボタンとコンテンツから active クラスを削除
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 選択されたタブボタンにactiveクラスを追加
    const activeButton = document.querySelector(`[data-tab="${targetTabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
    
    // 選択されたタブコンテンツにactiveクラスを追加
    const activeContent = document.getElementById(targetTabId);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  // タブボタンのクリックイベント
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // 設定ボタンの状態を更新
  function updateSettingsButtonState() {
    const apiKey = apiKeyInput.value.trim();
    const databaseId = databaseIdInput.value.trim();
    const hasValidInputs = apiKey && databaseId;
    
    saveSettingsBtn.disabled = !hasValidInputs;
  }

  // ストレージから設定を読み込み
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['notionApiKey', 'notionDatabaseId']);
      if (result.notionApiKey) {
        apiKeyInput.value = result.notionApiKey;
      }
      if (result.notionDatabaseId) {
        databaseIdInput.value = result.notionDatabaseId;
      }
      updateSettingsButtonState();
    } catch (error) {
      showStatus('設定の読み込みに失敗しました', 'error');
    }
  }

  // 現在のページ情報を取得
  async function loadPageInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 特別なページ（chrome://, chrome-extension://など）の場合はフォールバック
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        pageTitleDiv.textContent = tab.title || 'タイトル取得不可';
        pageUrlDiv.textContent = tab.url || 'URL取得不可';
        return;
      }
      
      // コンテンツスクリプトからページ情報を取得を試行
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' });
        if (response && response.title && response.url) {
          pageTitleDiv.textContent = response.title;
          pageUrlDiv.textContent = response.url;
          return;
        }
      } catch (messageError) {
        console.log('コンテンツスクリプトからの取得に失敗:', messageError);
      }
      
      // フォールバック: chrome.tabs.executeScript を使用
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => ({
            title: document.title || '',
            url: window.location.href
          })
        });
        
        if (results && results[0] && results[0].result) {
          const result = results[0].result;
          pageTitleDiv.textContent = result.title || tab.title || 'タイトル取得不可';
          pageUrlDiv.textContent = result.url || tab.url || 'URL取得不可';
          return;
        }
      } catch (scriptError) {
        console.log('スクリプト実行からの取得に失敗:', scriptError);
      }
      
      // 最終フォールバック: タブ情報を使用
      pageTitleDiv.textContent = tab.title || 'タイトル取得不可';
      pageUrlDiv.textContent = tab.url || 'URL取得不可';
      
    } catch (error) {
      console.error('ページ情報取得エラー:', error);
      pageTitleDiv.textContent = 'ページ情報を取得できませんでした';
      pageUrlDiv.textContent = '';
    }
  }

  // ステータスメッセージを表示
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  // 設定入力フィールドの変更イベント
  apiKeyInput.addEventListener('input', updateSettingsButtonState);
  databaseIdInput.addEventListener('input', updateSettingsButtonState);

  // 設定の保存
  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const databaseId = databaseIdInput.value.trim();

    if (!apiKey || !databaseId) {
      showStatus('API KeyとDatabase IDの両方を入力してください', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({
        notionApiKey: apiKey,
        notionDatabaseId: databaseId
      });
      showStatus('設定を保存しました', 'success');
    } catch (error) {
      showStatus('設定の保存に失敗しました', 'error');
    }
  });

  // ページの保存
  savePageBtn.addEventListener('click', async () => {
    // 設定を確認
    const result = await chrome.storage.local.get(['notionApiKey', 'notionDatabaseId']);
    const apiKey = result.notionApiKey;
    const databaseId = result.notionDatabaseId;

    if (!apiKey || !databaseId) {
      showStatus('まず設定でAPI KeyとDatabase IDを入力してください', 'error');
      return;
    }

    // ページ情報を取得
    const title = pageTitleDiv.textContent;
    const url = pageUrlDiv.textContent;
    const source = sourceSelect.value;
    const tags = tagsInput.value.trim();

    if (!title || !url) {
      showStatus('ページ情報が取得できませんでした', 'error');
      return;
    }

    // 保存処理
    savePageBtn.disabled = true;
    savePageBtn.textContent = '保存中...';
    showStatus('Notionに保存しています...', 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveToNotion',
        pageData: { title, url, source, tags },
        apiKey,
        databaseId
      });

      if (response.success) {
        showStatus('Notionに保存しました！', 'success');
        tagsInput.value = ''; // タグ入力をクリア
      } else {
        showStatus(`保存に失敗しました: ${response.error}`, 'error');
      }
    } catch (error) {
      showStatus('保存中にエラーが発生しました', 'error');
    } finally {
      savePageBtn.disabled = false;
      savePageBtn.textContent = 'Notionに保存';
    }
  });

  // 初期化
  await loadSettings();
  await loadPageInfo();
});