const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/main/reviews', component: () => import('pages/MainReviews') },
      { path: '/blog/posts', component: () => import('pages/BlogPosts') },
      {
        path: '/blog/posts/add-new',
        component: () => import('pages/BlogPostsSingle'),
      },
      {
        path: '/blog/posts/edit/:id',
        component: () => import('pages/BlogPostsSingle'),
      },
      {
        path: '/magnets',
        component: () => import('pages/MainMagnets'),
      },
      {
        path: '/magnets/add',
        component: () => import('pages/MainMagnetsEditPage'),
      },
      {
        path: '/magnets/edit/:id',
        component: () => import('pages/MainMagnetsEditPage'),
      },
    ],
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/login',
    component: () => import('pages/LoginFormPage')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
