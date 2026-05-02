# Desktop Schedule Widget

一个简洁的 Windows 桌面日程小组件，界面标题为“天枢的事业”。

![待办界面](./demo1.png)

![完成清单界面](./demo2.png)

## 为什么 GitHub 上图片不显示

README 之前使用的是 Windows 本地绝对路径：

```md
![image](C:\Users\Dubhe\Documents\New project\demo1.png)
```

这类路径只在你的电脑上存在，GitHub 服务器和其他访问者都无法读取，所以 GitHub 不会渲染图片。

正确写法是使用仓库内的相对路径：

```md
![待办界面](./demo1.png)
![完成清单界面](./demo2.png)
```

只要 `demo1.png` 和 `demo2.png` 已经提交并推送到仓库根目录，GitHub 就能正常显示。

## 功能

- 待办任务包含任务名称和 deadline。
- 待办列表按照 deadline 自动升序排列。
- 每项任务前有 iPhone 备忘录风格的圆圈状态。
- 点击圆圈后任务进入完成清单，圆圈容器保留并显示对勾。
- 默认只显示右上角圆角矩形加号按钮，点击后展开任务名称和 deadline 输入。
- 任务之间使用细横线分割。
- 主界面铺满窗口，缩放时不显示额外外层背景。
- 向上滚轮切换到完成清单，向下滚轮返回待办列表。
- 底部使用 `↑ Completed` / `↓ Todo` 提示切换方向。
- 切换待办/完成清单时使用窗口内部上下滑动动画。
- 已完成任务超过 5 天自动清理。
- 数据保存在本地浏览器/Electron 存储中。

## 运行

先安装依赖：

```bash
npm.cmd install
```

启动桌面版：

```bash
npm.cmd start
```

浏览器预览：

```bash
npm.cmd run preview
```

然后打开：

```text
http://127.0.0.1:4173
```

## 桌面图标和开机自启动

项目内提供隐藏控制台的启动脚本：

```text
scripts/start-schedule-widget.vbs
```

桌面快捷方式和开机自启动快捷方式会指向这个脚本。双击桌面图标即可启动；开机登录 Windows 后，启动文件夹中的快捷方式会自动运行该脚本。

快捷方式图标使用 Electron 应用窗口图标，来源为：

```text
node_modules/electron/dist/electron.exe
```

重新创建快捷方式：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Dubhe\Documents\New project\scripts\create-windows-shortcuts.ps1"
```

## 文档维护

后续每次修改需求或实现，需要同步更新功能文档和程序架构文档。
