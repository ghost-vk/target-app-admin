<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="column items-center justify-center" style="height: 100vh">
          <div class="q-pa-md" style="max-width: 400px">
            <q-form @submit="onSubmit" autofocus class="q-gutter-md">
              <q-input
                outlined
                :model-value="login"
                @update:model-value="updateLogin"
                label="Login"
              />

              <q-input
                outlined
                :model-value="password"
                type="password"
                @update:model-value="updatePassword"
                label="Password"
              />

              <div>
                <q-btn
                  label="Submit"
                  type="submit"
                  color="primary"
                  style="width: 100%"
                />
              </div>
            </q-form>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  methods: {
    ...mapActions({
      onSubmit: 'auth/login',
      updateLogin: 'auth/updateLogin',
      updatePassword: 'auth/updatePassword',
    }),
  },
  computed: {
    ...mapGetters({
      login: 'auth/login',
      password: 'auth/password',
      isLoading: 'auth/isLoading',
    }),
  },
}
</script>
