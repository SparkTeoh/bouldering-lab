# 攀岩动作实验室

一个互动式的攀岩教学网页：看动画学手法脚法，自己拖动手、脚、腰做实验，再用关卡检验。
内容依照《攀岩技术教本》的教学方式编排，文字和图都是重新写、重新画的。

线上版本：https://bouldering.sparkliang.com

## 怎么跑

没有构建步骤，纯 HTML / CSS / JS。

```bash
node tools/serve.js
```

然后打开 http://localhost:8765 。

## 结构

| 路径 | 内容 |
|---|---|
| `index.html` | 页面骨架，四个分页：课程、实验室、挑战、图鉴 |
| `css/style.css` | 样式，含深色模式和手机版 |
| `js/engine.js` | 姿势与受力计算：两段骨骼 IK、重心、各支撑点的负担、开门旋转 |
| `js/render.js` | 把姿势画成 SVG（从攀岩者背后看墙） |
| `js/lessons.js` `lessons2.js` `lessons3.js` | 课程与挑战的数据 |
| `js/coach.js` | 新手第一课、学习路线、口诀与练习建议、自动生成的课后练习 |
| `js/guide.js` | 图鉴：抓法、踩法、塞法、原理与专栏 |
| `js/app.js` | 界面与互动 |
| `tools/check-lessons.js` | 逐帧检查每一课：够不够得到、会不会旋转、各点负担几公斤 |
| `tools/audit.js` | 找课程设计漏洞：不用技巧也能过关的地方 |

## 改完课程后

```bash
node tools/check-lessons.js
node tools/audit.js
```

## 说明

- 画面上的公斤数是用 60kg 的人、简化的静力模型估算的，用来比较哪种做法比较省力，不是精确测量。
- 「到岩馆这样练」的练习建议是本项目补充的，不是教本原文。
- 教本 PDF 不在仓库里。
