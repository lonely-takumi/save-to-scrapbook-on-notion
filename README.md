# Save to Scrapbook on Notion

WebページをNotionのスクラップブックに保存するChrome拡張機能です。

## 機能

- 現在のWebページをNotionデータベースに保存
- ページのタイトル、URL、カスタムタグを保存
- API KeyとDatabase IDをローカルストレージに安全に保存
- 日本語対応のユーザーフレンドリーなインターフェース

## インストール方法

1. このリポジトリをクローンまたはダウンロード
2. Chromeで `chrome://extensions/` を開く
3. 右上の「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. このプロジェクトのフォルダを選択

## 使用方法

### 1. 初期設定

1. 拡張機能のアイコンをクリック
2. 「設定」セクションで以下を入力：
   - **Notion API Key**: Notionで作成したIntegrationのAPIキー
   - **Database ID**: 保存先のNotionデータベースのID
3. 「設定を保存」をクリック

### 2. ページの保存

1. 保存したいWebページを開く
2. 拡張機能のアイコンをクリック
3. ソースを選択
4. 必要に応じてタグを入力（改行区切り）
5. 「Notionに保存」をクリック

## Notionデータベースの設定

拡張機能を使用する前に、Notionで以下のプロパティを持つデータベースを作成してください：

- **タイトル**: Title プロパティ
- **URL**: URL プロパティ
- **タグ**: Multi-select プロパティ
- **ソース**: Select プロパティ

## API形式

この拡張機能は以下のフォーマットでNotionにデータを送信します：

```json
{
   "parent":{
      "database_id":"{データベースID}"
   },
   "properties":{
      "URL":{
         "url":"{webページのURL}"
      },
      "タグ":{
         "multi_select":[
            {
               "name":"{タグA}"
            },
            {
               "name":"{タグB}"
            }
         ]
      },
      "ソース":{
         "select":{
            "name":"{web or nikkei}"
         }
      },
      "タイトル":{
         "title":[
            {
               "text":{
                  "content":"{webページのタイトル}"
               }
            }
         ]
      }
   }
}
```

## 技術仕様

- Manifest V3対応
- Chrome Extensions API使用
- Notion API v2022-06-28
- ローカルストレージによる設定管理

## ライセンス

MIT License