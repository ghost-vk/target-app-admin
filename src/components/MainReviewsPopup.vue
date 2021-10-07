<template>
  <div class="q-mt-md q-gutter-sm">
    <q-dialog
      :model-value="visibility"
      @update:model-value="
        (val) => {
          if (!val) {
            $emit('unselect')
          }
          updateVisibility(val)
        }
      "
    >
      <q-layout view="Lhh lpR fff" container class="bg-white relative-position">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-toolbar-title>Редактор</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>

        <q-footer>
          <q-toolbar>
            <q-btn
              v-if="id"
              label="Удалить"
              color="red-5"
              @click="
                () => {
                  if (deleteReview()) {
                    $emit('unselect')
                  }
                }
              "
            />
            <q-btn
              label="Обнулить"
              :disable="loaders.dialog"
              color="grey-7"
              class="q-ml-auto"
              @click="resetAll"
            />
            <q-btn
              v-if="action === 'add'"
              :disable="loaders.dialog"
              label="Добавить"
              color="green-5"
              class="q-ml-md"
              @click="addReview"
            />
            <q-btn
              v-if="action === 'edit'"
              :disable="loaders.dialog"
              label="Обновить"
              color="green-5"
              class="q-ml-md"
              @click="editReview"
            />
          </q-toolbar>
        </q-footer>

        <q-page-container>
          <q-page padding>
            <div class="q-pa-md">
              <q-form class="q-gutter-md">
                <q-input
                  outlined
                  :model-value="values.full_name"
                  @update:model-value="updateFullName"
                  label="Полное имя"
                />

                <q-select
                  outlined
                  :model-value="values.category"
                  @update:model-value="updateCategory"
                  input-debounce="0"
                  label="Категория"
                  :options="options"
                  @filter="filterFn"
                  behavior="menu"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <q-input
                  outlined
                  :model-value="values.link"
                  @update:model-value="updateLink"
                  label="Ссылка на профиль в Instagram"
                />

                <q-input
                  outlined
                  :model-value="values.profession"
                  @update:model-value="updateProfession"
                  label="Профессия"
                />

                <q-file
                  outlined
                  clearable
                  bottom-slots
                  :model-value="file"
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="updateFile"
                  label="Фотография"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:hint> Изображение 100x100px </template>
                </q-file>
                <template v-if="preview">
                  <q-img
                    :src="preview"
                    loading="lazy"
                    spinner-color="white"
                    class="rounded-borders"
                    style="height: 140px; max-width: 150px"
                  />
                </template>
                <hr />
                <p class="text-subtitle1">Приоритет: {{ values.order }}</p>
                <div class="row">
                  <q-slider
                    :model-value="values.order"
                    @update:model-value="updateOrder"
                    :min="0"
                    :max="10"
                    class="q-mt-lg col-8"
                  />
                </div>
                <hr />
                <p class="text-subtitle1">Содержание отзыва</p>
                <q-editor :model-value="values.content"
                @update:model-value="updateContent"
                :toolbar='[["left","center","right","justify"],["bold","italic","underline","strike"],["undo","redo"],["viewsource"]]'
                min-height="5rem" />
              </q-form>
            </div>
          </q-page>
        </q-page-container>

        <q-inner-loading :showing="loaders.dialog">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { useQuasar } from 'quasar'

const stringOptions = ['target-setup', 'consultation', 'education', 'free-products', 'telegram-chat']

export default {
  name: 'MainReviewsPopup',
  setup() {
    const $q = useQuasar()
    const moreContent = ref(true)

    const options = ref(stringOptions)

    return {
      moreContent,
      contentSize: computed(() => (moreContent.value ? 100 : 5)),
      stringOptions,
      options,

      filterFn(val, update) {
        if (val === '') {
          update(() => {
            options.value = stringOptions
          })
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          options.value = stringOptions.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          )
        })
      },

      notify(message, type) {
        $q.notify({
          type: type,
          message: message,
        })
      },
    }
  },
  methods: {
    ...mapActions({
      updateVisibility: 'mainReviews/updateVisibility',
      updateFullName: 'mainReviews/updateFullName',
      updateCategory: 'mainReviews/updateCategory',
      updateLink: 'mainReviews/updateLink',
      updateProfession: 'mainReviews/updateProfession',
      updateFile: 'mainReviews/updateFile',
      updateOrder: 'mainReviews/updateOrder',
      updateContent: 'mainReviews/updateContent',
      resetAll: 'mainReviews/resetAll',
      addReview: 'mainReviews/addReview',
      editReview: 'mainReviews/editReview',
      deleteReview: 'mainReviews/deleteCurrentItem',
    }),
  },
  computed: mapGetters({
    visibility: 'mainReviews/visibility',
    values: 'mainReviews/values',
    file: 'mainReviews/file',
    preview: 'mainReviews/preview',
    id: 'mainReviews/id',
    action: 'mainReviews/action',
    loaders: 'mainReviews/loaders',
  }),
}
</script>
