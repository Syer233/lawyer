# 生物医药合同审阅工作台

这是一个可部署为静态网站的 **Local-first** 工作台：合同原件、审阅 HTML、律师反馈都保留在使用者浏览器的本地库中。GitHub 仓库只保存程序、模板和脱敏的审阅规则；不得提交客户文件或导出的反馈包。

## 给朋友使用

将 `docs/` 发布到 GitHub Pages 后，把网址给朋友即可。朋友使用 Chrome 或 Edge 打开页面，导入合同及审阅 HTML；文件只会保存到该浏览器的 IndexedDB 本地存储。页面没有合同上传接口，也不会把文件发送到 GitHub。

律师在审阅 HTML 中填写意见后，点击该审阅页的“导出反馈”按钮下载反馈包，并将其发回给你。你再从本机工作台或后续的 Skill 维护流程导入、脱敏和审核。

## 发布到 GitHub Pages

1. 在 GitHub 仓库 Settings → Pages 中，选择 `Deploy from a branch`。
2. 选择 `main` 分支与 `/docs` 目录并保存。
3. 发布后地址通常为 `https://syer233.github.io/lawyer/`。

## 隐私边界

- 不将 `case/`、`output/`、`data/`、反馈原件、`.doc/.docx/.pdf` 提交到 Git。
- 本地库清除、浏览器数据清除或更换浏览器会移除本地保存的文件；重要材料应另行保存在用户电脑的受控文件夹。
- 审阅 HTML 可能带有“提交至本地服务”的配置。公开网页环境下请使用它的 Word/JSON 导出功能，不要填写第三方接收地址。

## Skill

拟建立的 `biopharma-contract-review` Skill 将只吸收经人工审核、脱敏后的规则：审阅标准、谈判立场和律师偏好；它不会保存或训练于原合同内容。
