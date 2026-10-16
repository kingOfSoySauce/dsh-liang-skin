# 滑动变祖 · DeepSeek Harness 皮肤

## 安装

Web 和官方 Desktop 使用独立的 profile。下面的 `dsh plugin --profile web` 命令只适用于 Web；官方 Desktop 请在桌面应用的「设置 → 皮肤市场」或插件管理器中安装 npm 包 `@leon___/dsh-client-liang-intensity-skin`，安装后完全退出并重新打开 Desktop。不要把 Web profile 的安装结果当成 Desktop 已安装。

- #### 方法一， 提示词安装：
<details>
   <summary>&emsp;&emsp;点击展开提示词</summary>

复制以下提示词给 DSH；会先排查冲突再安装，所以较长：

```text
请把“滑动变祖”皮肤安装到 DSH 的 web profile。必须先检查冲突，确认可以继续后再安装。

1. 安装前只读检查 web profile 的 package.json（dependencies 与 dsh.profile.bundles）、profile 的 cordis.patch.yml 和 $DSH_HOME/cordis.patch.yml（如有）。
2. 从当前启用的 bundles 中识别其他皮肤、主题或外观插件：排除 @deepseek-ai/dsh-base、@deepseek-ai/dsh-web-app、dsh-skin-market 和本次目标 @leon___/dsh-client-liang-intensity-skin；读取候选 package.json 的名称、描述、dsh.client/dsh.bundle 声明，必要时再读 README。
3. 如果发现其他已启用的皮肤插件，列出它们并停在安装前，提醒我先停用；未经我确认不得修改任何 profile 文件，也不得执行安装。
4. 如果没有冲突，明确说“未检测到其他已启用的皮肤插件”，然后执行：

dsh plugin --profile web add 'github:kingOfSoySauce/dsh-liang-skin'

5. 安装后读取 web profile 的 package.json，确认 dependencies 和 dsh.profile.bundles 中都有 @leon___/dsh-client-liang-intensity-skin；再检查目标 package.json 的 dsh.client/dsh.bundle 声明和 liang-intensity-skin loader 注册项。任一缺失都要报告安装或注册失败。
6. 告诉我如何重启 DSH Web。不要替我安装、停用或卸载其他皮肤。
```

</details>

-  #### 方法二(推荐)，安装[皮肤市场](https://github.com/kingOfSoySauce/dsh-skin-market#安装皮肤市场)插件后，搜索“滑动变祖”，一键安装

-  #### 方法三， 或者[命令安装](#cli-install)；运行前请关闭其他皮肤插件，避免冲突

## 更多 DSH 皮肤

更多社区皮肤，点击[在线浏览皮肤市场](https://kingofsoysauce.github.io/dsh-skin-market/)

## 效果展示

<table>
  <tr>
    <td align="center">
      <img src="docs/preview.png" alt="滑动变祖皮肤效果截图" width="100%">
      <br>
    </td>
  </tr>
</table>


## 交互规则

- 档位直接读取当前模型的 `reasoning.efforts`，不写死数量或名称。
- 任意 N 个档位均匀落在 0–30：两档为 `0 / 30`，三档为 `0 / 15 / 30`，五档为 `0 / 7.5 / 15 / 22.5 / 30`。
- 拖动期间只做连续视觉预览；指针松开、键盘操作完成或控件失焦时，才吸附到最近档位并通过官方 ModelDirectory 提交该档位原始 ID。
- 不支持推理或只有一个可选档位的模型不显示滑块。
- addressed subagent 不显示也不提交滑块。

## 外观开关

入口位于 `设置 → 通用设置 → 外观`：

- `滑动变祖`：显示滑块并启用人物、背景和自适应配色。
- 点击原生的 `浅色`、`深色` 或 `跟随系统`：移除背景层、皮肤变量和滑块，切回对应的 Harness 原生外观。
- `滑动变祖绑定思考等级`：使用 DSH 原生开关，关闭后滑块只切换人物和配色，不修改模型的推理等级；仅点击开关切换，标题文字不触发切换。

皮肤保持启用时，人物与背景配色由滑块档位决定；切换 DSH 原生深浅主题不会改变当前档位的背景。

绑定开关保存在当前浏览器本地。切回原生外观只对本次客户端激活有效；刷新页面或重新激活插件后默认开启皮肤。外观选择的跨刷新记忆暂未实现。绑定开启时，滑块会提交模型的推理档位；关闭绑定后只改变外观。

<a id="cli-install"></a>

## 命令安装

需要先安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)；本轮已在 DSH Web `0.1.7-rc.2` 检查原生控件，macOS Desktop 由用户试用；Windows Desktop 仍需更新后的实机反馈。安装本身可以在 DSH 运行时执行（只改动磁盘配置），重启后生效。三种方式任选其一：

> 安装前请确保已关闭其他皮肤插件，避免冲突。

### 方式一：从 GitHub 安装最新版（推荐）

```sh
dsh plugin --profile web add 'github:kingOfSoySauce/dsh-liang-skin'
dsh --profile web --dump-config | grep -B1 -A2 liang-intensity
```

### 方式二：从 GitHub Release tarball 安装

从本仓库 [Releases](https://github.com/kingOfSoySauce/dsh-liang-skin/releases) 页面下载 `leon___-dsh-client-liang-intensity-skin-0.1.11.tgz`（包内已包含构建好的 `lib/client.js`，安装时不需要执行任何 prepare 脚本），然后：

```sh
dsh plugin --profile web add ./leon___-dsh-client-liang-intensity-skin-0.1.11.tgz
```


适合不方便走 git 的环境；相对路径按你运行命令的目录解析。

### 方式三：克隆后从本地路径安装（开发迭代）

```sh
git clone https://github.com/kingOfSoySauce/dsh-liang-skin.git
cd dsh-liang-skin
dsh plugin --profile web add .
```


`dsh plugin` 会把相对路径锚定到**你运行命令的目录**（而不是 profile 目录），所以在克隆目录里执行 `add .` 装的是指向克隆目录的 link 依赖：改完源码运行 `npm run build`，重启 DSH 即生效，无需重新安装。

### 验证与重启

安装成功后 `dsh plugin` 会自动把插件注册进 profile 的 `dsh.profile.bundles`（见 `~/.dsh/profiles/web/package.json`），无需手动改配置；`--dump-config` 的输出中应出现 `dsh-client-liang-intensity-skin` 配置层（上面命令里的 grep 就是为此准备的）。

如果正式 DSH 正在运行，让执行安装的 agent 给用户两个选择：

- **a. agent 自行重启**：agent 终止旧进程后重新运行 `dsh web`；
- **b. 用户手动重启（推荐）**：在运行 DSH 的终端按 Ctrl+C，再运行 `dsh web`。

重启后浏览器会自动加载新的客户端插件，无需强制刷新。当前会话会中断，但 DSH 会话有磁盘持久化，重启后可以恢复。

### 卸载

```sh
dsh plugin --profile web remove @leon___/dsh-client-liang-intensity-skin
```

`remove` 会自动把插件从 `dsh.profile.bundles` 中摘除；重启后设置入口完全移除。

### 常见问题

- **pnpm 阻止构建脚本**：pnpm ≥ 10 默认不执行第三方依赖的 build/prepare 脚本。当前皮肤没有 prepare 脚本，正常不会触发；若 pnpm 安装失败并给出提示，按 dsh 打印的说明在 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `allowBuilds` 下加入对应 key 后重试。
- **网络**：方式一需要能访问 github.com（pnpm 经 codeload 拉取）；方式二只需能下载 GitHub Release 附件。
- **pnpm 缺失**：`dsh plugin` 依赖 PATH 里的 pnpm，缺失时会明确提示。
- **端口占用**：`dsh web` 默认监听 3080（可用 `--port` 修改），重启前确认旧进程已退出。

## 本地开发

```sh
npm install
npm test
npm run build
npm run test:compatibility
```

修改 client 源码后需要运行 `npm run build`，并一起提交更新后的 `lib/client.js` 和 source map。

浏览器兼容性回归使用本机 Chrome / Chromium；可通过 `CHROME_PATH` 指定浏览器可执行文件，不会自动下载浏览器。测试使用宿主布局夹具，不能代替官方 Desktop 真机验收。本轮兼容性修复的验证步骤见 [兼容性验证说明](docs/compatibility-validation.md)。

## 灵感与素材来源

本插件的“滑动变祖”视觉概念与人物图片素材源自
[Lichtspektrum/liang-intensity-calibrator](https://github.com/Lichtspektrum/liang-intensity-calibrator)。插件在原项目 0–30 强度轴的基础上，将视觉变化接入 DeepSeek Harness 的推理等级选择。

运行时素材已包含在插件中，安装后不需要额外下载。当前接入 24 张经过审核的人像锚点，滑动时直接切换最近锚点，不做图片交叉渐变。
