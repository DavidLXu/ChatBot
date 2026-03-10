# ChatBot

一个可直接部署到 GitHub Pages 的静态聊天页面。

[https://davidlxu.github.io/ChatBot/](https://davidlxu.github.io/ChatBot/)

## 使用

打开页面后手动填写：

- `Base URL`
- `API Key`
- 点击“加载模型”后选择模型

然后即可开始聊天。

## GitHub Pages

仓库已包含 GitHub Pages 工作流：

- [deploy-pages.yml](/Users/xulixin/ChatBot/.github/workflows/deploy-pages.yml)

推送到 `main` 后会自动部署 `public/` 目录。

## 注意

这是纯前端版本，页面会从浏览器直接请求你填写的 API 服务。

- 你的上游接口必须允许浏览器跨域请求
- API Key 会在浏览器端使用，不再经过本地 Node 代理
