import { Loading } from 'quasar'
import { routerInstance } from 'boot/router'
import { serverUrl } from 'boot/axios'
import AuthService from 'src/services/AuthService'
import axios from 'axios'
export default {
  namespaced: true,
  state() {
    return {
      login: '',
      password: '',
      isLoading: false,
      isAuthorized: false,
    }
  },
  getters: {
    login(state) {
      return state.login
    },
    password(state) {
      return state.password
    },
    isLoading(state) {
      return state.isLoading
    },
    isAuthorized(state) {
      return state.isAuthorized
    },
  },
  actions: {
    updateLogin({ commit }, val) {
      commit('updateLogin', val)
    },
    updatePassword({ commit }, val) {
      commit('updatePassword', val)
    },
    updateLoading({ commit }, val) {
      commit('updateLoading', !!val)
    },
    setAuth({ commit }, bool) {
      commit('updateAuthStatus', !!bool)
    },
    async login({ commit, dispatch, state }) {
      Loading.show()
      try {
        if (!state.login || !state.password) {
          Loading.hide()
          return null
        }
        const response = await AuthService.login(state.login, state.password)
        localStorage.setItem('token', response.data.accessToken)
        dispatch('setAuth', true)
        routerInstance.push('/')
        dispatch('updatePassword', '')
        dispatch('updateLogin', '')
      } catch (e) {
        console.log(e)
        dispatch('updatePassword', '')
      } finally {
        Loading.hide()
      }
    },

    async logout({ state, dispatch }) {
      Loading.show()
      try {
        if (!state.isAuthorized) {
          Loading.hide()
          return null
        }
        const response = await AuthService.logout()
        dispatch('setAuth', false)
        localStorage.removeItem('token')
        routerInstance.push('/login')
      } catch (e) {
        console.log(e?.response?.data?.message)
      } finally {
        Loading.hide()
      }
    },

    checkAuth({ dispatch }) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await axios.get(`${serverUrl}/api/auth/refresh`, {
            withCredentials: true,
          })
          localStorage.setItem('token', response.data.accessToken)
          dispatch('setAuth', true)
          routerInstance.push('/')
        } catch (e) {
          console.log(e)
        } finally {
          resolve()
        }
      })
    },
  },

  mutations: {
    updateLogin(state, val) {
      state.login = val
    },
    updatePassword(state, val) {
      state.password = val
    },
    updateLoading(state, val) {
      state.isLoading = val
    },
    updateAuthStatus(state, bool) {
      state.isAuthorized = bool
    },
  },
}
