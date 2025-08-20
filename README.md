# 鹦鹉管理系统 (Parrot Management System)

一个现代化的鹦鹉信息管理系统，用于管理鹦鹉基本信息、笼舍分配以及相关统计数据。

## 技术栈

- React 18
- Vite 7
- Ant Design Mobile 5.x
- React Router DOM 7
- Axios
- ECharts (数据可视化)

## 功能特性

- 鹦鹉信息管理
  - 鹦鹉基本信息的增删改查
  - 物种信息管理
  - 鹦鹉搜索功能
- 笼舍管理
  - 笼舍信息维护
  - 鹦鹉-笼舍分配
  - 笼舍使用情况查看
- 品种管理
  - 鹦鹉品种信息维护
- 数据统计
  - 鹦鹉分布统计
  - 可视化数据展示

## 安装说明

确保你的开发环境中已安装 Node.js (推荐使用最新的LTS版本)

1. 克隆项目
```bash
git clone https://github.com/YanhaiSun/parrot-manage.git
cd parrot-react
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 公共组件
└── pages/        # 页面组件
    ├── CageManagement.jsx     # 笼舍管理
    ├── CageParrotList.jsx     # 笼舍鹦鹉列表
    ├── ParrotManagement.jsx   # 鹦鹉管理
    ├── ParrotStatistics.jsx   # 统计信息
    ├── SearchParrot.jsx       # 鹦鹉搜索
    └── SpeciesManagement.jsx  # 物种管理
```

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 运行代码检查
- `npm run preview` - 预览生产构建

## 部署说明

项目使用 Vite 构建，生产版本的文件将会生成在 `dist` 目录中。你可以将该目录下的文件部署到任何静态文件服务器上。

项目的基础路由配置为 `/parrot-web`，如需修改可在 `package.json` 中更改 `homepage` 字段。

## 特性

项目使用了 Ant Design Mobile 5.x 作为 UI 框架，提供了现代化的移动端用户界面。ECharts 用于数据可视化，展示鹦鹉分布和笼舍使用情况等统计信息。
H5页面具有通用性，可以在小程序中使用

## 小程序内嵌H5预览
![c7b4ba40cefc70fc5b705a59d0e770b4.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/c7b4ba40cefc70fc5b705a59d0e770b4.jpg)
![a83b80d087415167b21fa0fa4ccddcd1.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/a83b80d087415167b21fa0fa4ccddcd1.jpg)
![c263b28f373188c1b485f094a89f149a.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/c263b28f373188c1b485f094a89f149a.jpg)
![79fff9e9438ecc00cbeddacaeafe614a.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/79fff9e9438ecc00cbeddacaeafe614a.jpg)
![66c7f2980e5ca94d9fe6cee31af34f92.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/66c7f2980e5ca94d9fe6cee31af34f92.jpg)
![8325289df5fa158fef5de6a10d28b253.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/8325289df5fa158fef5de6a10d28b253.jpg)
![5238144ac10b5bcb99e6c8dd6f21f50a.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/5238144ac10b5bcb99e6c8dd6f21f50a.jpg)
![913bb04593305be4d9ca9ff9c11b2c43.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/913bb04593305be4d9ca9ff9c11b2c43.jpg)
![7f097e24cba9739121eb6f74c2d6add2.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/7f097e24cba9739121eb6f74c2d6add2.jpg)

## 技术支持联系
![e52dbdb6e7db18a6d42bdd48ba8ba625.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/e52dbdb6e7db18a6d42bdd48ba8ba625.jpg)

## 给个Star支持一下
如果你觉得这个项目对你有帮助，欢迎给个 Star ⭐️ 支持一下

## 请作者喝杯咖啡
![b90c1e3ebcc5e0f7fb3eb6d63704ce82.jpg](../../WechatFile/xwechat_files/wxid_p8jean9leucl12_4de9/temp/RWTemp/2025-08/9e20f478899dc29eb19741386f9343c8/b90c1e3ebcc5e0f7fb3eb6d63704ce82.jpg)