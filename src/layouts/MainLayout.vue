<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Target App </q-toolbar-title>

        <div class="row items-center">
          <q-btn
            @click="logout"
            color="indigo-2"
            text-color="grey-8"
            size="sm"
            class="q-mr-md"
            >Выйти</q-btn
          >
          <a
            class="text-subtitle2 text-white"
            href="https://anastasi-target.ru"
            target="_blank"
            >anastasi-target.ru</a
          >
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8"> Админ панель </q-item-label>
        <q-expansion-item
          expand-separator
          icon="home"
          label="Основной сайт"
          header-class="text-grey-9"
        >
          <q-item to="/main/reviews" clickable v-ripple class="text-purple-6">
            <q-item-section avatar>
              <q-icon color="purple-6" name="star" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Отзывы</q-item-label>
            </q-item-section>
          </q-item>
          <q-item to="/magnets" clickable v-ripple class="text-grey-8">
            <q-item-section avatar>
              <q-icon color="grey-8" name="file_present" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Лид-магниты</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-expansion-item
          expand-separator
          icon="edit"
          label="Блог"
          header-class="text-grey-9"
        >
          <q-item to="/blog/posts" clickable v-ripple class="text-blue-6">
            <q-item-section avatar>
              <q-icon color="blue-6" name="article" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Посты</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-item
          to="/uploads"
          clickable
          v-ripple
          header-class="text-grey-9"
          class="text-grey-9"
        >
          <q-item-section avatar>
            <q-icon name="perm_media" />
          </q-item-section>

          <q-item-section> Медиатека </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'MainLayout',
  methods: {
    ...mapActions({
      logout: 'auth/logout',
    }),
  },
  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>
