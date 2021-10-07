import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import mainReviews from 'src/store/mainReviews'
import blogPosts from 'src/store/blogPosts'
import singlePost from 'src/store/singlePost'
import magnets from 'src/store/magnets'
import auth from 'src/store/auth'

export default store(() => {
  const Store = createStore({
    modules: {
      mainReviews,
      blogPosts,
      singlePost,
      magnets,
      auth,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING,
  })
  return Store
})
