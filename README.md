# Desktop Schedule Widget

一个简洁的 Windows 桌面日程小组件初版，界面标题为“天枢的事业”。

![image-20260502171250000](C:\Users\Dubhe\Documents\New project\demo1.png)

![image-20260502171207059](C:\Users\Dubhe\Documents\New project\demo2.png)

## 功能

- 待办任务包含任务名称和 deadline。
- 待办列表按照 deadline 自动升序排列。
- 每项任务前有 iPhone 备忘录风格的圆圈状态。
- 点击圆圈后任务进入完成清单，圆圈容器保留并显示对勾。
- 默认只显示右上角圆角矩形加号按钮，点击后展开任务名称和 deadline 输入。
- 任务之间使用细横线分割。
- Schedule 主界面铺满窗口，缩放时不显示额外外层背景。
- 向上滚轮切换到完成清单，向下滚轮返回待办列表。
- 底部使用 `↑ Completed` / `↓ Todo` 提示切换方向。
- 切换待办/完成清单时使用窗口内部上下滑动动画。
- 已完成任务超过 5 天自动清理。
- 数据保存在本地浏览器/Electron 存储中。

## 文档维护

后续每次修改需求或实现，需要同步更新功能文档和程序架构文档。

## 运行

先安装依赖：

```bash
npm.cmd install
```

启动桌面版：

```bash
npm.cmd start
```

也可以直接打开 `src/index.html` 查看静态预览。

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
powershell.exe -ExecutionPolicy Bypass -File scripts/create-windows-shortcuts.ps1
```
