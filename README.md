# Pixel Quest - 像素大冒险

这是一个基于 React + Vite 的像素风格问答游戏，集成了 Google Sheets 作为后台数据库（通过 Google Apps Script）。

## 📋 功能特点
*   **像素风格 UI**: 使用 NES.css 构建复古游戏体验。
*   **实时问答**: 从 Google Sheets 动态获取题目。
*   **成绩记录**: 自动将玩家成绩、通关状态保存回 Google Sheets。
*   **自适应设计**: 支持桌面和移动端。

---

## 🚀 快速开始

### 1. 安装依赖
确保您的电脑已安装 Node.js。在项目根目录下运行：

```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173`。

---

## ⚙️ 后台设置 (Google Drive & Sheets)

本项目需要配合 Google Sheets 使用。请按照以下步骤操作：

### 1. 创建 Google Sheet
1.  登录 Google Drive，新建一个 Google Sheet。
2.  将表格命名为 `PixelGameDB`（或其他您喜欢的名字）。
3.  **创建“题目”工作表**:
    *   将底部的 Sheet1 重命名为 `题目`。
    *   设置表头（第一行）：
        *   `A1`: ID
        *   `B1`: Question
        *   `C1`: OptionA
        *   `D1`: OptionB
        *   `E1`: OptionC
        *   `F1`: OptionD
        *   `G1`: Answer
    *   **重要**: 请在表格中填入题目数据（见下文“题目範例”）。

### 2. 部署 Layer (Google Apps Script)
1.  在 Google Sheet 界面，点击顶部菜单 `扩展程序` > `Apps Script`。
2.  将项目根目录下的 `google-apps-script.js` 文件内容完整复制并粘贴到 Apps Script 编辑器中（覆盖默认代码）。
3.  点击 `部署` (Deploy) > `新建部署` (New deployment)。
4.  点击左侧齿轮图标，选择 `Web 应用` (Web app)。
5.  配置如下：
    *   **说明**: Pixel Game API
    *   **以...身份执行**: `我 (My email)`
    *   **谁可以访问**: `任何人 (Anyone)` **(重要！否则应用无法读取数据)**
6.  点击 `部署`。如果是第一次，需要授予访问权限（点击 Review permissions -> 选择账号 -> Advanced -> Go to ... (unsafe) -> Allow）。
7.  **复制生成的 Web App URL**（以 `https://script.google.com/macros/s/.../exec` 结尾）。

### 3. 连接前端与后端
1.  在项目根目录找到 `.env` 文件。
2.  修改 `VITE_GOOGLE_APP_SCRIPT_URL` 的值为刚才复制的 URL：
    ```env
    VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/xxxxxxxxxxxxxxxxx/exec
    ```
    *(如果没有 `.env` 文件，请复制 `.env.example` 并重命名)*

### 4. 验证
重新运行 `npm run dev`，游戏现在应该能从您的 Google Sheet 加载题目了。

---

## 📝 题目数据范例 (可以直接复制到 Google Sheet)

请将以下内容复制并粘贴到您的 Google Sheet `题目` 工作表的 A1 单元格（包含表头）。

**主题：生成式 AI 基础知识 (Generative AI Basics)**

| ID | Question | OptionA | OptionB | OptionC | OptionD | Answer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 生成式 AI 的主要功能是什么？ | 分析数据 | 生成新内容 | 存储数据 | 加密文件 | B |
| 2 | 以下哪个是著名的文本生成模型？ | GPT-4 | VGG-16 | ResNet | Random Forest | A |
| 3 | ChatGPT 中的 "GPT" 代表什么？ | General Public Tool | Generative Pre-trained Transformer | Graphic Processing Technology | Global Python Translator | B |
| 4 | Midjourney 主要用于生成什么？ | 代码 | 音乐 | 图像 | 视频 | C |
| 5 | AI生成的内容通常被称为什么？ | UGC | AIGC | PGC | OGC | B |
| 6 | 下列哪项是提示词工程(Prompt Engineering)的目标？ | 优化数据库 | 获得更好的AI输出 | 编写汇编语言 | 清理硬件灰尘 | B |
| 7 | 这种现象指AI生成看似合理但其实错误的回答： | 幻觉 (Hallucination) | 梦游 | 崩溃 | 溢出 | A |
| 8 | 生成式AI主要基于哪种神经网络架构？ | CNN | Transformer | RNN | SVM | B |
| 9 | GitHub Copilot 的主要作用是？ | 聊天 | 辅助编程 | 绘画 | 制作PPT | B |
| 10 | 下列哪个不是生成式AI的应用场景？ | 撰写邮件 | Excel求和公式计算 | AI绘画 | 物理硬盘修复 | D |

---

## 📊 成绩记录说明
当玩家完成游戏后，系统会自动在 Google Sheet 中创建一个名为 `回答` 的工作表（如果不存在），并记录：
*   玩家 ID
*   闯关次数
*   总分 (累积)
*   最高分
*   第一次通关分数
*   通关耗时 (尝试次数)
*   最近游玩时间

---

## 🛠 开发命令
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览构建结果

---

## 🚀 自动部署 (GitHub Pages)

本项目已配置 GitHub Actions，只需简单设置即可自动将更新部署到 GitHub Pages。

### 1. 修改 Base 路径 (重要)
由于 GitHub Pages 通常运行在子目录下（例如 `https://user.github.io/repo/`），你需要修改 `vite.config.ts`：

```typescript
export default defineConfig({
  base: '/你的仓库名称/', // <--- 添加这一行，将“你的仓库名称”替换为实际仓库名
  plugins: [react()],
  // ...
})
```

### 2. 配置 GitHub Secrets (环境变量)
为了让线上环境能连接后端的 Google Sheets，需要将环境变量配置到 GitHub。

1.  进入你的 GitHub 仓库页面。
2.  点击顶部菜单 **Settings**。
3.  在左侧栏找到 **Secrets and variables** > **Actions**。
4.  在 **Secrets** 栏目下，点击 **New repository secret**，添加：
    *   **Name**: `VITE_GOOGLE_APP_SCRIPT_URL`
    *   **Secret**: 填入你的 Google Apps Script Web App URL (以 `/exec` 结尾的那个)。
5.  (可选) 在 **Variables** 栏目下，点击 **New repository variable** 添加配置：
    *   `VITE_PASS_THRESHOLD`: 通关分数 (如 `3`)
    *   `VITE_QUESTION_COUNT`: 题目数量 (如 `5`)

### 3. 开启 GitHub Pages
1.  在 **Settings** 页面，左侧点击 **Pages**。
2.  在 **Build and deployment** 下的 **Source** 下拉框中，选择 **GitHub Actions**。

### 4. 触发部署
当你将代码 `push` 到 `main` 或 `master` 分支时，Action 会自动运行。完成后，你的游戏就可以通过 GitHub Pages URL 访问了！

