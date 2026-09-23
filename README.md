# 新北有富富玉 B2 3D 格局

> [!IMPORTANT]
> **僅供住戶進行室內設計概念參考，非商業用途。**
> 格局是依建商平面圖判讀建成的，尺寸可能有誤差。實際裝修、訂製家具與施工，請以建商正式圖面及現場丈量為準。

用 Vue 3 + Three.js 把 B2 戶的平面圖轉成可以互動的 3D 模型，在瀏覽器裡就能規劃家具擺設、地板材質和牆面顏色。

- **線上預覽**：<https://nickchen1998.github.io/YuFuFuYu-B2/>（需先啟用 GitHub Pages，見[部署方式](#部署方式)）

## 功能

| 功能 | 說明 |
| --- | --- |
| 3D 鳥瞰 | 左鍵拖曳旋轉、右鍵平移、滾輪縮放；上方「🧱」可以把牆切到 150 公分高，方便看室內 |
| 平面俯視 | 正投影俯視，可以疊上原始平面圖（紅線）比對 |
| 室內漫遊 | 用 WASD 或方向鍵走動、拖曳滑鼠轉頭，會被牆擋住 |
| 家具 | 30 多種台灣常見尺寸的家具，可以拖曳（靠牆自動貼齊）、旋轉、改尺寸和顏色；卡到牆會變紅提醒 |
| 刷油漆 | 可以點單面牆刷，也能一次刷整個房間；同一面牆的兩側分開計算 |
| 地板 | 每個房間可以各自換成超耐磨木地板、磁磚、水磨石等 |
| 量尺寸 | 點兩點量距離，會吸附牆面、自動拉成水平或垂直 |
| 存檔 | 自動存在瀏覽器裡；也可以匯出、匯入 JSON，或截圖存成 PNG |

## 開啟方式（本機）

需要 [Node.js](https://nodejs.org/) 20.19 以上（建議用 LTS 版本）。

```bash
git clone https://github.com/nickchen1998/YuFuFuYu-B2.git
cd YuFuFuYu-B2
npm install
npm run dev
```

然後用瀏覽器打開 <http://localhost:5180>。

### 操作快捷鍵

| 按鍵 | 動作 |
| --- | --- |
| 滑鼠左鍵拖曳家具 | 移動（按住 Alt 可以不吸附、自由移動） |
| `R` / `Shift+R` | 旋轉 ±90° |
| `Q` / `E` | 微轉 15° |
| 方向鍵 | 微調 1 公分（按住 Shift 為 10 公分） |
| `Delete` | 刪除選取的家具 |
| `Esc` | 取消選取、清除量尺 |
| `W` `A` `S` `D` | 室內漫遊時走動（按住 Shift 加速） |

## 部署方式

這是純前端的靜態網站，執行 `npm run build` 後會把檔案輸出到 `dist/`，放到任何靜態主機都能用。

### GitHub Pages（已經設定好自動部署）

repo 裡已經有 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，推送到 `main` 分支就會自動建置並部署。

第一次使用要先啟用 Pages：

1. 到 repo 的 **Settings → Pages**
2. **Source** 選 **GitHub Actions**
3. 到 **Actions** 分頁，手動執行一次 **Deploy to GitHub Pages**（之後每次推送都會自動部署）

部署完成後，網址是 `https://<帳號>.github.io/<repo 名稱>/`。

### 其他靜態主機（Zeabur、Vercel、Netlify、Cloudflare Pages 等）

| 設定 | 值 |
| --- | --- |
| 建置指令 | `npm run build` |
| 輸出資料夾 | `dist` |
| Node 版本 | 20.19 以上 |

如果網站不是放在網域根目錄，而是放在子路徑（例如 `https://example.com/house/`），建置時要指定子路徑：

```bash
npm run build -- --base=/house/
```

### 本機預覽正式版

```bash
npm run build
npm run preview
```

## 修改格局資料

所有牆、門窗、房間都寫在 [`src/data/house.ts`](src/data/house.ts)，單位是公分：

- 原點是客餐廳室內的左上角（大門那面牆的內側）
- x 往右、y 往下，跟平面圖的方向一樣

預設的家具擺設在 [`src/data/catalog.ts`](src/data/catalog.ts)，地板和油漆顏色在 [`src/data/materials.ts`](src/data/materials.ts)。

### 格局判讀說明

平面圖上有標註的尺寸是照標註建的：客餐廳 288 × 665、主臥 271.5 × 339.5、次臥 241.5 × 554、衛浴寬約 270。牆厚、門窗位置、衛浴設備則是依圖面比例量出來的，誤差大約 ±10 公分。

**住戶已確認**

- 衛浴為 1.5 套：全套（淋浴間＋馬桶＋洗手台，沒有浴缸），加上主臥內的半套（馬桶＋洗臉盆）
- 主臥是左側 271.5 × 339.5 那間（主臥套房）
- 工作陽台 188.5 × 172.5
- 陽台門開在瓦斯爐正對面（客餐廳右牆）

**待確認**

- 主臥進半套衛浴的門：目前判讀為 80 公分拉門
- 次臥與陽台之間：目前設為一扇窗（寬 150、窗台高 90）
- 陽台門的寬度與開門方向：目前是 80 公分、往陽台外開
- 各窗戶的窗台高度與寬度
- 天花板淨高：目前設 280 公分（可以在「空間材質」分頁調整）

## 技術架構

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)：介面與狀態管理
- [Three.js](https://threejs.org/)：3D 繪製（牆面依門窗開口切塊、家具用參數化幾何建模、地板材質用 Canvas 程式產生）
- [Vite](https://vite.dev/)：開發伺服器與建置

```
src/
├── data/            格局、家具目錄、材質等資料
├── three/           Three.js 場景：Viewer（相機、互動、漫遊）、牆、家具、材質
├── components/      右側面板（家具、空間材質、顯示）
├── geometry.ts      牆塊切割、碰撞、坪數計算
└── store.ts         設計資料（自動存到瀏覽器）
```

## 授權

- **程式碼**：採用 [MIT License](LICENSE)
- **平面圖與格局資料**：[`public/floorplan.jpg`](public/floorplan.jpg) 以及 [`src/data/house.ts`](src/data/house.ts) 中的格局尺寸，是依建商平面圖判讀而來，**著作權屬原建商所有，不在 MIT 授權範圍內**，僅供住戶進行室內設計概念參考，**不得作為商業用途**
