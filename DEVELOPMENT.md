# 本地开发指南

本文档说明如何在 ledgerjs-for-tron-dev 项目中使用本地的 hw-app-trx SDK 进行开发和测试。

## 目录结构

```
/projects/
├── ledger-live/                    # 主 SDK 项目
│   └── libs/ledgerjs/packages/
│       └── hw-app-trx/            # SDK 源码目录
└── ledgerjs-for-tron-dev/         # 调试/测试项目
```

## 配置说明

### 1. 依赖配置

在 `ledgerjs-for-tron-dev/package.json` 中，hw-app-trx 使用 `file:` 协议引用本地包：

```json
{
  "dependencies": {
    "@ledgerhq/hw-app-trx": "file:../ledger-live/libs/ledgerjs/packages/hw-app-trx"
  },
  "pnpm": {
    "overrides": {
      "@ledgerhq/hw-transport": "^6.31.12"
    }
  }
}
```

> `overrides` 的作用是防止 `file:` 方式引用 `hw-app-trx` 时，`hw-app-trx` 的 `workspace` 配置对 `ledgerjs-for-tron-dev` 的影响。

### 2. SDK 构建脚本

hw-app-trx 支持以下构建命令：

- `pnpm build` - 一次性构建

## 开发流程

手动构建

```bash
# 终端1: 在 SDK 中开发并构建
cd /projects/ledger-live/libs/ledgerjs/packages/hw-app-trx
pnpm build

# 终端2: 在测试项目中运行
cd /projects/ledgerjs-for-tron-dev
pnpm dev
```

修改 hw-app-trx 的源码后，Next.js 会自动重新编译并刷新浏览器。

## 工作流程

1. **修改 SDK 源码**
   - 编辑 `/projects/ledger-live/libs/ledgerjs/packages/hw-app-trx/src/*.ts`

2. **构建 SDK**
   - 运行 `pnpm build`

3. **验证更改**
   - 在 `http://localhost:3000` 中测试功能
   - Next.js 会自动检测文件变化并重新加载

4. **提交代码**
   - 在 ledger-live 项目中提交修改
   - 确保 `lib/` 和 `lib-es/` 目录已更新

## 故障排除

### 问题：依赖冲突错误

**错误信息：**
```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND
```

**解决方案：**
确保已在 `package.json` 中添加了 `pnpm.overrides` 配置。

### 问题：修改 SDK 后测试项目未更新

**可能原因：**
1. SDK 未重新构建（运行 `pnpm build`）
2. Next.js 缓存问题

**解决方案：**
```bash
# 清除 Next.js 缓存
cd /projects/ledgerjs-for-tron-dev
rm -rf .next
pnpm dev
```

### 问题：类型错误

**可能原因：**
SDK 的类型定义文件未更新

**解决方案：**
确保 SDK 编译时生成了 `lib/*.d.ts` 文件。

## 注意事项

1. **不要提交 hw-app-trx 的编译产物**
   - `lib/` 和 `lib-es/` 目录应该在 ledger-live 项目中被 git 忽略

2. **依赖版本一致性**
   - 使用 `pnpm overrides` 确保依赖版本统一
   - 避免使用 `workspace:*` 在测试项目中

3. **构建产物**
   - 每次修改后必须重新构建 SDK
   - watch 模式方便开发但可能不适用于所有场景

## 相关命令

```bash
# 检查 SDK 版本
cd /projects/ledger-live/libs/ledgerjs/packages/hw-app-trx
cat package.json | grep '"version"'

# 查看 SDK 依赖
pnpm list @ledgerhq/hw-transport

# 清理并重新安装
cd /projects/ledgerjs-for-tron-dev
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
