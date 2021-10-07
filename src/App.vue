<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue';
import { mapActions} from 'vuex'
import { Loading } from 'quasar'


export default defineComponent({
  name: 'App',
  methods: mapActions({
    checkAuth: 'auth/checkAuth'
  }),
  async mounted() {
    if (localStorage.getItem('token')) {
      Loading.show()
      try {
        await this.checkAuth()
      } catch (e) {
        console.log(e)
      } finally {
        Loading.hide()
      }
    }
  }
})
</script>
