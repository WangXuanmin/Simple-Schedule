# Windows 桌面日程安排表软件程序架构设计

## 1. 架构目标

本架构面向简洁的 Windows 桌面日程安排表小组件，重点支持：

- Windows 桌面小窗口。
- 待办任务展示。
- Deadline 自动排序。
- 点击圆圈完成任务。
- 完成任务进入完成清单。
- 完成任务 5 天后自动删除。
- 向上/向下滚轮切换待办与完成清单。
- 视图切换时有上下滑动动画。
- 折叠式创建任务入口。
- 本地保存任务数据。

初版以单机本地应用为主，不包含账号、多端同步、团队协作和云端服务。

## 2. 当前实现方案

当前初版采用：

- Electron：提供 Windows 桌面窗口。
- 原生 HTML/CSS/JavaScript：实现界面和交互。
- localStorage：保存任务数据。

当前文件结构：

```text
src/
├─ main.cjs       Electron 主进程，负责窗口创建和窗口控制 IPC
├─ preload.cjs    安全暴露窗口控制 API
├─ index.html     渲染进程 HTML 结构
├─ styles.css     小组件样式、展开表单、滑动动画
└─ app.js         任务状态、排序、清理、视图切换和交互逻辑
```

后续如果功能复杂度提升，可迁移为 React + TypeScript + 主进程 JSON 文件存储。

## 3. 总体结构

```text
Electron Main
  - 创建无边框透明窗口
  - 管理最小化、关闭、置顶
  - 通过 preload 暴露安全 API

Electron Renderer
  - Window shell
  - Todo view
  - Completed view
  - Quick add panel
  - Task item

Application Logic
  - Task create/delete/toggle
  - Deadline sorting
  - Completed sorting
  - Completed cleanup after 5 days
  - View switching

Local Storage
  - tasks array
```

## 4. 数据模型

当前实现中的任务结构：

```ts
interface Task {
  id: string;
  name: string;
  deadline: string;
  completedAt: string | null;
  createdAt: string;
}
```

字段说明：

- `id`：任务唯一 ID。
- `name`：任务名称。
- `deadline`：deadline 时间，使用 datetime-local 字符串。
- `completedAt`：完成时间，未完成时为 `null`。
- `createdAt`：创建时间。

状态判断：

- `completedAt === null` 表示待办任务。
- `completedAt !== null` 表示已完成任务。

## 5. 应用状态

当前渲染进程状态：

```ts
interface AppState {
  view: "todo" | "completed";
  isAddOpen: boolean;
  tasks: Task[];
}
```

状态职责：

- `view`：当前展示待办视图还是完成清单视图。
- `isAddOpen`：创建任务表单是否展开。
- `tasks`：所有任务数据。

## 6. 视图结构

视图采用双面板纵向堆叠结构。

```text
widget
├─ titlebar
├─ content-window
│  └─ view-stack
│     ├─ todo view
│     └─ completed view
├─ quick-add
└─ switch-hint
```

职责：

- `content-window`：裁切溢出的视图内容。
- `view-stack`：承载待办和完成两个面板。
- `todo view`：展示未完成任务。
- `completed view`：展示已完成任务。
- `quick-add`：默认加号和展开后的创建表单。
- `switch-hint`：显示当前可用滚轮方向提示。

背景结构：

- `body` 不绘制额外装饰背景。
- `widget` 使用 `100vw` 和 `100vh` 铺满窗口。
- 缩放窗口时只改变 Schedule 主界面的尺寸，不显示外层背景。

## 7. 视图切换动画

视图切换由 CSS transform 驱动。

规则：

```text
view = "todo"       -> view-stack translateY(0)
view = "completed"  -> view-stack translateY(-50%)
```

实现要点：

- `view-stack` 高度为两个视图面板的总高度。
- 两个面板上下排列。
- `content-window` 使用 `overflow: hidden` 裁切。
- CSS transition 控制上下滑动动画。

滚轮方向：

```text
deltaY < 0  -> 向上滚轮 -> completed
deltaY > 0  -> 向下滚轮 -> todo
```

触摸方向：

- 手势上滑进入完成清单。
- 手势下滑返回待办视图。

## 8. 创建任务架构

创建任务入口分为两个状态：

默认状态：

```text
quick-add-button
```

按钮位置和形态：

- 位于窗口右上区域。
- 使用绝对定位固定到右侧，避免隐藏表单参与布局时把按钮挤到左侧。
- 使用圆角矩形按钮。
- 内部显示加号。
- 不使用绿色圆形悬浮按钮。

展开状态：

```text
add-panel
├─ task name input
├─ deadline input
├─ submit button
└─ cancel button
```

关键函数：

- `openAddPanel()`：展开创建表单，必要时切回待办视图。
- `closeAddPanel()`：收起创建表单并清空输入。
- `addTask()`：创建任务、保存数据、收起表单、刷新列表。

约束：

- 完成清单视图不展示创建入口。
- 创建表单提交成功后自动收起。
- 创建表单不常驻占用列表空间。

## 8.1 任务分割线

任务列表通过 CSS 为相邻任务增加横线分割。

实现规则：

```css
.task-item:not(:last-child) {
  border-bottom: 1px solid var(--line);
}
```

注意事项：

- 最后一项不显示底部分割线。
- hover 背景不能破坏分割线的轻量感。
- 分割线颜色使用全局 `--line`，便于后续统一调整。

## 9. 业务规则

### 9.1 待办排序

待办任务按 deadline 从早到晚排序：

```ts
todoTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
```

### 9.2 完成排序

完成任务按完成时间从晚到早排序：

```ts
completedTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
```

### 9.3 完成任务清理

清理规则：

```text
当前时间 - completedAt >= 5 天
```

满足条件的任务从本地数据中删除。

当前触发时机：

- 应用初始化。
- 列表刷新。
- 切换视图。

## 10. Electron 主进程

主进程职责：

- 创建窗口。
- 设置窗口大小。
- 设置无边框、透明背景。
- 管理窗口生命周期。
- 处理最小化、关闭、置顶 IPC。

当前 IPC：

```text
window:minimize
window:close
window:toggle-always-on-top
```

## 11. 后续可迁移架构

如果后续加入编辑任务、提醒、开机自启、搜索、导出或多端同步，建议迁移为：

```text
Electron + React + TypeScript + JSON/SQLite
```

建议模块：

```text
src/main/window.ts
src/main/ipc.ts
src/main/storage/taskRepository.ts
src/renderer/App.tsx
src/renderer/views/TodoView.tsx
src/renderer/views/CompletedView.tsx
src/renderer/components/TaskItem.tsx
src/renderer/components/QuickAdd.tsx
src/shared/services/taskService.ts
src/shared/services/completedCleanupService.ts
src/shared/services/dateFormatter.ts
```

## 12. 文档维护规则

后续每次修改需求、交互或实现结构时，必须同步更新：

- `schedule-desktop-functional-spec.md`
- `schedule-desktop-architecture.md`

如果修改涉及运行方式、依赖或开发命令，也需要同步更新 `README.md`。

## 13. 2026-05-02 变更记录

- Deadline 标红规则从“具体 deadline 时间早于当前时刻”调整为“deadline 日期是今天或今天之前”。
- 已完成任务 5 天自动清理的触发时机明确为应用初始化和列表刷新；当前初版不使用后台定时器。
- 主标题文案改为“天枢的事业”。
- HTML 页面标题同步改为“天枢的事业”。
- 底部提示文案改为箭头形式：`↑ Completed` / `↓ Todo`。
- 新增 `isAddOpen` 状态，用于控制创建任务表单展开/收起。
- 创建任务从常驻表单改为 `quick-add` 折叠入口。
- 视图结构从单列表重绘改为 `content-window + view-stack + 双面板`。
- 通过 CSS transform 实现上下滑动切换动画。
- 滚轮方向调整为：`deltaY < 0` 进入完成清单，`deltaY > 0` 返回待办。
- 加号按钮从绿色圆形悬浮按钮调整为右上角圆角矩形按钮。
- 任务项增加轻量横线分割。
- `body` 移除外层背景，`widget` 改为铺满窗口。
