import axios from 'axios'
import { api, serverUrl } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  namespaced: true,
  state() {
    return {
      selected: [],
      magnets: [],
      current: {
        values: {
          name: '',
          link: '',
          description: '',
          image: null,
        },
        preview: '',
      },
    }
  },
  getters: {
    magnets(state) {
      return state.magnets
    },
    selected(state) {
      return state.selected
    },
    values(state) {
      return state.current.values
    },
    preview(state) {
      return state.current.preview
    },
  },
  actions: {
    async loadAll({ dispatch }, options = null) {
      try {
        const response = await axios.get(`${serverUrl}/api/magnets`)
        dispatch('updateMagnets', response.data)
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось загрузить лид-магниты',
        })
      }
    },
    async loadOne({ commit, dispatch }, magnetID) {
      const id = Number(magnetID)
      if (!id) {
        return
      }
      try {
        const response = await axios.get(`${serverUrl}/api/magnets/${id}`)
        const data = response.data
        dispatch('updateField', { name: 'name', val: data.name })
        dispatch('updateField', { name: 'link', val: data.link })
        dispatch('updateField', { name: 'description', val: data.description })
        dispatch('updateImageFile', data.image)
      } catch (err) {
        console.error('❌ ', err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось загрузить',
        })
      }
    },
    updateMagnets({ commit }, magnets) {
      const newMagnets = Array.isArray(magnets) ? magnets : []
      commit('updateMagnets', newMagnets)
    },
    updateSelected({ commit }, val) {
      commit('updateSelected', val)
    },
    updateField({ commit }, options) {
      if (options.name && options.val) {
        commit('updateValue', options)
      }
    },
    updateImageFile({ commit, dispatch }, val) {
      return new Promise(async (resolve, reject) => {
        if (!val) {
          commit('updateImageFile', null)
          commit('updatePreview', '')
          resolve()
        }
        if (val?.constructor === File) {
          commit('updateImageFile', val)
          dispatch('updatePreviewFromFile', val)
          resolve()
        } else {
          // filepath from database
          try {
            if (!val) {
              commit('updateImageFile', null)
              dispatch('updatePreviewFromFilePath', '')
              resolve()
              return
            }
            const response = await api.get(serverUrl + val)
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
            dispatch('updatePreviewFromFilePath', serverUrl + val)
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
    async addNew({ state, dispatch }) {
      const values = JSON.stringify(state.current.values)
      const data = new FormData()
      data.append('values', values)
      data.append('image', state.current.values.image)
      try {
        const response = await api.post('/api/magnets', data)
        const newItem = response.data
        dispatch('updateMagnets', [newItem, ...state.magnets])
        Notify.create({
          type: 'positive',
          message: 'Успешно добавлено!',
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось добавить',
        })
      }
    },
    async saveChangesInSimpleField({ state, dispatch }, options) {
      if (
        !Object.keys(state.current.values).includes(options.name) ||
        !Number(options.id) ||
        !options.val
      ) {
        return
      }
      try {
        const response = await api.put(
          `/api/magnets/field/${options.id}/${options.name}`,
          { value: options.val }
        )
        const updatedPost = response.data
        const magnets = state.magnets.map((p) =>
          Number(p.id) === Number(updatedPost.id) ? updatedPost : p
        )
        dispatch('updateMagnets', magnets)
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
    async saveChangesInImageField({ state, dispatch }, itemID) {
      const id = Number(itemID)
      if (!id) {
        return
      }
      const data = new FormData()
      data.append('image', state.current.values.image)
      try {
        const response = await api.put(`/api/magnets/image/${id}`, data)
        const updatedItem = response.data
        const magnets = state.magnets.map((m) =>
          Number(m.id) === Number(updatedItem.id) ? updatedItem : m
        )
        dispatch('updateMagnets', magnets)
        Notify.create({
          type: 'positive',
          message: `Изменения в поле "image" успешно сохранены`,
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось сохранить изменения',
        })
      }
    },
    async deleteItem({ commit, getters, dispatch }, magnetID) {
      let id = Number(magnetID)
      if (!id) {
        return
      }
      try {
        const response = await api.delete(`/api/magnets/${id}`)
        const deleted = response.data
        const magnets = getters.magnets.filter(
          (m) => Number(m.id) !== Number(deleted.id)
        )
        commit('updateMagnets', magnets)
        dispatch('updateSelected', [])
        dispatch('reset')
        Notify.create({
          type: 'positive',
          message: `Лид-магнит [ID=${id}] успешно удален!`,
        })
      } catch (err) {
        console.log(err)
        Notify.create({
          type: 'negative',
          message: 'Не удалось удалить',
        })
      }
    },
    reset({ commit }) {
      commit('updateValue', { name: 'name', val: '' })
      commit('updateValue', { name: 'link', val: '' })
      commit('updateValue', { name: 'description', val: '' })
      commit('updateImageFile', null)
    },
  },
  mutations: {
    updateMagnets(state, magnets) {
      state.magnets = magnets
    },
    updateSelected(state, val) {
      state.selected = val
    },
    updateValue(state, options) {
      state.current.values[options.name] = options.val
    },
    updateImageFile(state, file) {
      state.current.values.image = file
    },
    updatePreview(state, value) {
      state.current.preview = value
    },
  },
}
