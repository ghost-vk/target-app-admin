import axios from 'axios'
import { api, serverUrl } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  namespaced: true,
  state() {
    return {
      selected: [],
      posts: [],
    }
  },
  getters: {
    posts(state) {
      return state.posts
    },
    selected(state) {
      return state.selected
    },
  },
  actions: {
    async loadPosts({ commit, dispatch }, options = null) {
      const limit = options?.limit ? `limit=${options.limit}&` : ''
      const queryParamsStartSymbol = options ? '?' : ''
      try {
        const response = await axios.get(
          `${serverUrl}/api/posts${queryParamsStartSymbol}${limit}`
        )
        dispatch('updatePosts', response.data.data)
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось загрузить посты',
        })
      }
    },
    updatePosts({ commit }, posts) {
      commit('updatePosts', posts)
    },
    async deletePost({ commit, getters, dispatch }, postID) {
      let id = Number(postID)
      if (!id) {
        return
      }
      try {
        const response = await api.delete(`/api/posts/${id}`)
        const deletedPost = response.data
        const posts = getters.posts.filter(
          (p) => Number(p.id) !== Number(deletedPost.id)
        )
        commit('updatePosts', posts)
        dispatch('updateSelected', [])
        Notify.create({
          type: 'positive',
          message: `Пост [ID=${deletedPost.id}] успешно удален!`,
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось удалить',
        })
      }
    },
    updateSelected({ commit }, val) {
      commit('updateSelected', val)
    },
  },
  mutations: {
    updatePosts(state, val) {
      state.posts = val
    },
    updateSelected(state, val) {
      state.selected = val
    },
  },
}
