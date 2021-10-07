import axios from 'axios'
import { api, serverUrl } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  namespaced: true,
  state() {
    return {
      loaders: {
        reviews: false,
        dialog: false,
      },
      reviews: [],
      action: '',
      isShown: false,
      reviewID: '', // review which is working at moment, need for editing or deleting
      values: {
        full_name: '',
        category: '',
        link: '',
        profession: '',
        image: '',
        order: 0,
        content: '',
      },
      touchedFields: [],
      file: null,
      preview: '',
    }
  },
  getters: {
    loaders(state) {
      return state.loaders
    },
    reviews(state) {
      return state.reviews
    },
    visibility(state) {
      return state.isShown
    },
    values(state) {
      return state.values
    },
    file(state) {
      return state.file
    },
    preview(state) {
      return state.preview
    },
    id(state) {
      return state.reviewID
    },
    action(state) {
      return state.action
    },
  },
  actions: {
    updateLoader({ commit, state }, data) {
      if (data.name in state.loaders) {
        commit('updateLoader', data)
      }
    },
    async getReviews({ commit, dispatch }) {
      dispatch('updateLoader', { name: 'reviews', val: true })
      try {
        const { data } = await axios.get(`${serverUrl}/api/reviews?limit=1000`)
        commit('updateReviews', data)
      } catch (err) {
        console.log('')
        Notify.create({
          type: 'negative',
          message: 'Не удалось загрузить отзывы',
        })
      } finally {
        dispatch('updateLoader', { name: 'reviews', val: false })
      }
    },
    updateCurrentItemID({ commit }, val) {
      if (typeof val === 'string') {
        val = Number(val) || ''
      }
      commit('updateCurrentItemID', val)
    },
    updateVisibility({ commit, dispatch }, val) {
      if (!val) {
        dispatch('resetAll')
      }
      commit('updateVisibility', val)
    },
    touchField({ commit, state }, fieldName) {
      if (
        state.action !== 'edit' ||
        typeof fieldName !== 'string' ||
        state.touchedFields.includes(fieldName)
      ) {
        return
      }
      commit('updateTouchedFields', [...state.touchedFields, fieldName])
    },
    updateFullName({ commit, dispatch }, val) {
      dispatch('touchField', 'full_name')
      commit('updateFullName', val)
    },
    updateCategory({ commit, dispatch }, val) {
      dispatch('touchField', 'category')
      commit('updateCategory', val)
    },
    updateImage({ commit }, val) {
      commit('updateImage', val)
    },
    updateLink({ commit, dispatch }, val) {
      dispatch('touchField', 'link')
      commit('updateLink', val)
    },
    updateProfession({ commit, dispatch }, val) {
      dispatch('touchField', 'profession')
      commit('updateProfession', val)
    },
    async updateFile({ commit, dispatch, state }, val) {
      dispatch('touchField', 'image')
      if (!val) {
        commit('updateFile', null)
        commit('updatePreview', false)
        return
      }
      // Get File object from front-end
      if (val.constructor === File) {
        commit('updateFile', val)
        if (!val.type.match('image')) {
          Notify.create({
            type: 'warning',
            message: 'Файл должен представлять из себя изображение',
          })
          dispatch('updatePreviewFromPath', '')
          return
        }
        dispatch('updatePreviewFromFile', val)
        // Get string from server
      } else if (typeof val === 'string') {
        try {
          const response = await axios.get(val)
          if (!response.headers['content-type'].match('image')) {
            dispatch('updatePreviewFromPath', false)
            return
          }
          const blob = new Blob([response.data], {
            type: response.headers['content-type'],
          })
          const file = new File([blob], val.replace(/^.*[\\\/]/, ''))
          commit('updateFile', file)
          dispatch('updatePreviewFromPath', state.values.image)
        } catch (err) {
          console.log(err)
          Notify.create({
            type: 'negative',
            message: 'Не удалось загрузить файл',
          })
        }
      }
    },
    updatePreviewFromFile({ commit }, file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        commit('updatePreview', ev.target.result)
      }
      reader.readAsDataURL(file)
    },
    updatePreviewFromPath({ commit }, val) {
      commit('updatePreview', val)
    },
    updateOrder({ commit, dispatch }, val) {
      dispatch('touchField', 'review_order')
      commit('updateOrder', val)
    },
    updateContent({ commit, dispatch }, val) {
      dispatch('touchField', 'content')
      commit('updateContent', val)
    },
    resetAll({ commit }) {
      commit('updateAction', '')
      commit('updateCurrentItemID', '')
      commit('updateFullName', '')
      commit('updateCategory', '')
      commit('updateLink', '')
      commit('updateProfession', '')
      commit('updateFile', null)
      commit('updatePreview', '')
      commit('updateOrder', 0)
      commit('updateContent', '')
      commit('updateTouchedFields', [])
    },
    async deleteCurrentItem({ state, dispatch }) {
      try {
        await api.delete(`/api/reviews/${state.reviewID}`)
        dispatch('getReviews')
        Notify.create({
          type: 'positive',
          message: `Отзыв [ID=${state.reviewID}] успешно удален`,
        })
        if (state.isShown) {
          dispatch('updateVisibility', false)
        }
        return true
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: `Не удалось удалить Отзыв [ID=${state.reviewID}]`,
        })
        return false
      } finally {
        dispatch('resetAll')
      }
    },
    updateAction({ commit, state }, val) {
      if (['add', 'edit'].includes(val)) {
        if (val !== 'edit' && state.touchedFields.length) {
          commit('updateTouchedFields', [])
        }
        commit('updateAction', val)
      }
    },
    async addReview({ commit, state, dispatch }) {
      const values = {
        name: state.values.full_name || null,
        link: state.values.link || null,
        profession: state.values.profession || null,
        content: state.values.content || null,
        category: state.values.category || null,
        review_order: state.values.order || null,
      }
      const data = new FormData()
      data.append('image', state.file)
      data.append('values', JSON.stringify(values))
      dispatch('updateLoader', { name: 'dialog', val: true })
      try {
        commit('updateVisibility', false)
        await api.post('/api/reviews', data)
        Notify.create({
          type: 'positive',
          message: `Отзыв успешно добавлен`,
        })
        dispatch('getReviews')
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: `Не удалось добавить отзыв`,
        })
        console.log(err)
      } finally {
        dispatch('updateLoader', { name: 'dialog', val: false })
      }
    },
    async editReview({ commit, state, rootGetters, dispatch }) {
      const id = state.reviewID
      const values = {
        full_name: state.values.full_name,
        category: state.values.category,
        link: state.values.link,
        profession: state.values.profession,
        review_order: state.values.order,
        content: state.values.content,
      }
      dispatch('updateLoader', { name: 'dialog', val: true })
      const data = new FormData()
      data.append('values', JSON.stringify(values))
      data.append('touchedFields', JSON.stringify(state.touchedFields))
      data.append('image', state.file)
      if (!state.touchedFields.length) {
        Notify.create({
          type: 'info',
          message: 'Никакие поля не были изменены',
        })
        dispatch('updateLoader', { name: 'dialog', val: false })
        return
      }
      try {
        const response = await api.put(`/api/reviews/${id}`, data)
        if (response.status === 200) {
          Notify.create({
            type: 'positive',
            message: `Отзыв [ID=${state.reviewID}] успешно обновлен`,
          })
        }
        dispatch('getReviews')
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: `Не удалось обновить отзыв`,
        })
      } finally {
        dispatch('updateLoader', { name: 'dialog', val: false })
      }
    },
  },
  mutations: {
    updateLoader(state, data) {
      state.loaders[data.name] = data.val
    },
    updateCurrentItemID(state, val) {
      state.reviewID = val
    },
    updateVisibility(state, val) {
      state.isShown = val
    },
    updateFullName(state, val) {
      state.values.full_name = val
    },
    updateCategory(state, val) {
      state.values.category = val
    },
    updateLink(state, val) {
      state.values.link = val
    },
    updateProfession(state, val) {
      state.values.profession = val
    },
    updateImage(state, val) {
      state.values.image = val
    },
    updateFile(state, val) {
      state.file = val
    },
    updatePreview(state, val) {
      state.preview = val
    },
    updateOrder(state, val) {
      state.values.order = val
    },
    updateContent(state, val) {
      state.values.content = val
    },
    updateReviews(state, val) {
      state.reviews = val
    },
    updateAction(state, val) {
      state.action = val
    },
    updateTouchedFields(state, val) {
      state.touchedFields = val
    },
  },
}
