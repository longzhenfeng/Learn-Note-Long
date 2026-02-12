import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Learn Note Long",
  description: "Learn Note ",
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '示例', link: '/markdown-examples' }
    ],

    sidebar: [
      // {
      //   text: '示例',
      //   items: [
      //     { text: 'Markdown Examples', link: '/markdown-examples' },
      //     { text: 'Runtime API Examples', link: '/api-examples' }
      //   ]
      // },
      {
        text: 'Node JS',
        items: [
          { text: 'Node JS是什么?', link: '/nodejs/what-is-node' }
        ]
      },
      {
        text: 'Express',
        items: [
          { text: 'Express是什么?', link: '/expressjs/what-is-express' },
          { text: '路由', link: '/expressjs/router' },
          { text: '中间件', link: '/expressjs/middleware' },
          { text: '错误处理', link: '/expressjs/error-handling' },
          { text: '身份验证', link: '/expressjs/authentication' },
          { text: '数据库集成', link: '/expressjs/database' },
          { text: '文件上传', link: '/expressjs/file-upload' },
        ]
      },
      {
        text: 'Vite',
        items: [
          { text: 'Vite是什么?', link: '/vite/what-is-vite' },
          { text: '配置技巧', link: '/vite/config-tips' },
          { text: '开发技巧', link: '/vite/development-tips' },
          { text: '构建优化', link: '/vite/build-tips' },
          { text: '常见问题', link: '/vite/common-issues' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/longzhenfeng/Learn-Note-Long', ariaLabel: 'GitHub'}
    ]
  }
})
