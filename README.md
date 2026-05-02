# 天枢的事业

一个简洁的 Windows 桌面日程小组件，用于显示待办任务、按 deadline 排序，并自动管理完成清单。

![待办界面](./demo1.png)

![完成清单界面](./demo2.png)

## 功能

- 待办任务包含任务名称和 deadline。
- 待办列表按照 deadline 自动升序排列。
- 今天及今天之前的待办任务时间会标红。
- 每项任务前有圆圈状态标记。
- 点击圆圈后任务进入完成清单，圆圈内显示对勾。
- 已完成任务保留 5 天后自动清理。
- 默认只显示右上角加号按钮，点击后展开任务名称和 deadline 输入。
- 任务之间使用细横线分割。
- 向上滚轮切换到完成清单，向下滚轮返回待办列表。
- 切换待办/完成清单时使用窗口内部上下滑动动画。
- 支持桌面快捷方式启动。
- 支持 Windows 开机自启动。

## 使用说明

安装依赖：

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

重新创建桌面快捷方式和开机自启动入口：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Dubhe\Documents\New project\scripts\create-windows-shortcuts.ps1"
```
