import axios from 'axios'
import { api, serverUrl } from 'boot/axios'
import { Notify } from 'quasar'

const prepareDate = (date) => {
  const _date = date ? new Date(date) : null
  if (!date) {
    return null
  }
  const prependZeroIfNeed = (val) => {
    return Number(val) < 10 ? `0${val}` : val
  }
  let month = prependZeroIfNeed(_date.getMonth() + 1)
  let day = prependZeroIfNeed(_date.getDate())
  return `${_date.getFullYear()}-${month}-${day}`
}

export default {
  namespaced: true,
  state() {
    return {
      values: {
        posting_date: null,
        title: '',
        subtitle: '',
        content: '',
        category: 1,
      },
      image: null,
      preview: '',
    }
  },
  getters: {
    values(state) {
      return state.values
    },
    image(state) {
      return state.image
    },
    preview(state) {
      return state.preview
    },
  },
  actions: {
    updateField({ commit }, options) {
      if (options.name && options.val) {
        commit('updateValue', options)
      }
    },
    async loadPost({ commit, dispatch, rootGetters }, postID) {
      const id = Number(postID)
      if (!id) {
        return
      }
      try {
        const response = await axios.get(`${serverUrl}/api/posts/${id}`)
        const data = response.data
        dispatch('updateField', {
          name: 'posting_date',
          val: prepareDate(data.posting_date),
        })
        dispatch('updateField', { name: 'title', val: data.title })
        dispatch('updateField', { name: 'subtitle', val: data.subtitle })
        dispatch('updateField', { name: 'content', val: data.content })
        dispatch('updateImageFile', data.thumbnail)
      } catch (err) {
        console.error('❌ ', err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось загрузить пост',
        })
      }
    },
    updateImageFile({ commit, dispatch, rootGetters }, val) {
      return new Promise(async (resolve, reject) => {
        if (!val) {
          commit('updateImageFile', null)
          commit('updatePreview', '')
          resolve(null)
        }
        if (val?.constructor === File) {
          commit('updateImageFile', val)
          dispatch('updatePreviewFromFile', val)
          resolve(null)
        } else {
          // filepath from database
          try {
            const filepath = rootGetters['config/serverHost'] + val
            if (!val) {
              commit('updateImageFile', null)
              dispatch('updatePreviewFromFilePath', '')
              resolve(null)
              return
            }
            const response = await axios.get(filepath)
            if (!response.headers['content-type'].match('image')) {
              commit('updateImageFile', null)
              dispatch('updatePreviewFromFilePath', '')
              resolve(null)
              return
            }
            const blob = new Blob([response.data], {
              type: response.headers['content-type'],
            })
            const file = new File([blob], val.replace(/^.*[\\\/]/, '')) // removing file path, save only filename
            commit('updateImageFile', file)
            dispatch('updatePreviewFromFilePath', filepath)
            resolve(null)
          } catch (err) {
            resolve(null)
            console.log(err)
            if (val) {
              Notify.create({
                type: 'negative',
                message: 'Не удалось загрузить файл',
              })
            }
          }
        }
      })
    },
    updatePreviewFromFile({ commit }, file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        commit('updatePreview', ev.target.result)
      }
      reader.readAsDataURL(file)
    },
    updatePreviewFromFilePath({ commit }, filePath) {
      const previewFilePath = typeof filePath === 'string' ? filePath : ''
      commit('updatePreview', previewFilePath)
    },
    async addPost({ state, rootGetters, dispatch }) {
      const values = JSON.stringify(state.values)
      const data = new FormData()
      data.append('values', values)
      data.append('image', state.image)
      try {
        const response = await api.post('/api/posts', data)
        const newPost = response.data
        const posts = rootGetters['blogPosts/posts']
        dispatch('blogPosts/updatePosts', [newPost, ...posts], { root: true })
        Notify.create({
          type: 'positive',
          message: 'Пост успешно добавлен',
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось добавить пост',
        })
      }
    },
    async saveChangesInSimpleField({ state, rootGetters, dispatch }, options) {
      if (
        !Object.keys(state.values).includes(options.name) ||
        !Number(options.id) ||
        !options.val
      ) {
        return
      }
      try {
        const response = await api.put(
          `/api/posts/field/${options.id}/${options.name}`,
          { value: options.val }
        )
        const updatedPost = response.data
        const posts = rootGetters['blogPosts/posts'].map((p) =>
          Number(p.id) === Number(updatedPost.id) ? updatedPost : p
        )
        dispatch('blogPosts/updatePosts', posts, { root: true })
        Notify.create({
          type: 'positive',
          message: `Изменения в поле "${options.name}" успешно сохранены`,
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось сохранить изменения',
        })
      }
    },
    async saveChangesInThumbnailField(
      { state, rootGetters, dispatch },
      postID
    ) {
      const id = Number(postID)
      if (!id) {
        return
      }
      const data = new FormData()
      data.append('image', state.image)
      try {
        const response = await api.put(`/api/posts/thumbnail/${id}`, data)
        const updatedPost = response.data
        const posts = rootGetters['blogPosts/posts'].map((p) =>
          Number(p.id) === Number(updatedPost.id) ? updatedPost : p
        )
        dispatch('blogPosts/updatePosts', posts, { root: true })
        Notify.create({
          type: 'positive',
          message: `Изменения в поле "thumbnail" успешно сохранены`,
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось сохранить изменения',
        })
      }
    },
    resetAll({ commit, dispatch }) {
      commit('updateValue', { name: 'posting_date', val: null })
      commit('updateValue', { name: 'title', val: '' })
      commit('updateValue', { name: 'subtitle', val: '' })
      commit('updateValue', { name: 'content', val: '' })
      dispatch('updateImageFile', null)
    },
  },
  mutations: {
    updateValue(state, options) {
      state.values[options.name] = options.val
    },
    updateImageFile(state, file) {
      state.image = file
    },
    updatePreview(state, value) {
      state.preview = value
    },
  },
}
