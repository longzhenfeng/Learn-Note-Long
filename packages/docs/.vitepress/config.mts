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
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/longzhenfeng/Learn-Note-Long', ariaLabel: 'GitHub'}
    ]
  }
})
