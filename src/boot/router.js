import { boot } from 'quasar/wrappers'

let routerInstance

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!store.getters['auth/isAuthorized']) {
        next('/login')
      } else {
        next()
      }
    } else {
      next()
    }
  })

  routerInstance = router
})

export { routerInstance }
