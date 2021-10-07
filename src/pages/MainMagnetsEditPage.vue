<template>
  <q-page class="q-pl-md q-mx-auto" style="max-width: 768px">
    <h4 class="text-center">
      {{
        magnetID
          ? `Редактирование лид магнита [ID=${magnetID}]`
          : 'Добавление нового лид магнита'
      }}
    </h4>
    <q-form
      @submit.prevent="addNew"
      @reset="() => {}"
      class="q-gutter-md overflow-auto q-pb-xl"
      style="padding-bottom: 150px"
    >
      <q-input
        outlined
        :model-value="values.name"
        @update:model-value="
          (val) => {
            updateField({ name: 'name', val: val })
          }
        "
        @blur="
          () => {
            if (magnetID) {
              saveChangesInSimpleField({
                name: 'name',
                id: magnetID,
                val: values.name,
              })
            }
          }
        "
        label="Название *"
      />

      <q-input
        outlined
        label="Ссылка *"
        :model-value="values.link"
        hide-hint
        @update:model-value="
          (val) => {
            updateField({ name: 'link', val: val })
          }
        "
        @blur="
          () => {
            if (magnetID) {
              saveChangesInSimpleField({
                name: 'link',
                id: magnetID,
                val: values.link,
              })
            }
          }
        "
      />

      <q-editor
        :model-value="values.description"
        placeholder="Описание"
        max-height="650px"
        @update:model-value="
          (val) => {
            updateField({ name: 'description', val: val })
          }
        "
        @blur="
          () => {
            if (magnetID) {
              saveChangesInSimpleField({
                name: 'description',
                id: magnetID,
                val: values.description,
              })
            }
          }
        "
        :dense="$q.screen.lt.md"
        :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['fullscreen'],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7',
              ],
            },
            'removeFormat',
          ],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

          ['undo', 'redo'],
          ['viewsource'],
        ]"
      />

      <q-file
        outlined
        clearable
        bottom-slots
        counter
        hint="Квадратное сжатое изображение"
        :model-value="values.image"
        @update:model-value="updateFile"
        accept=".jpg,.jpeg,.png"
        label="Изображение"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>
      <q-img
        v-if="preview"
        :src="preview"
        class="rounded-borders"
        style="max-width: 150px; max-height: 150px"
      />

      <div class="flex justify-between fixed-bottom q-pa-md bg-blue-1">
        <div></div>
        <div class="flex q-gutter-md">
          <q-btn
            v-if="magnetID"
            label="Удалить"
            type="button"
            color="red-5"
            @click="
              () => {
                deleteItem(magnetID)
                $router.push('/magnets')
              }
            "
          />
          <q-btn
            label="Все лид-магниты"
            type="button"
            color="blue-5"
            @click="
              () => {
                reset()
                $router.push('/magnets')
              }
            "
          />
          <q-btn
            v-if="!magnetID"
            label="Добавить"
            type="submit"
            color="green-6"
          />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    let magnetID = ref(null)
    if (route.path.startsWith('/magnets/edit/')) {
      magnetID = route.params.id
    }
    return {
      magnetID,
      isCalendarShown: ref(false),
    }
  },
  computed: {
    ...mapGetters({
      values: 'magnets/values',
      preview: 'magnets/preview',
    }),
  },
  methods: {
    ...mapActions({
      loadOne: 'magnets/loadOne',
      updateField: 'magnets/updateField',
      updateImageFile: 'magnets/updateImageFile',
      saveChangesInSimpleField: 'magnets/saveChangesInSimpleField',
      saveChangesInImageField: 'magnets/saveChangesInImageField',
      reset: 'magnets/reset',
      addNew: 'magnets/addNew',
      deleteItem: 'magnets/deleteItem'
    }),
    async updateFile(val) {
      await this.updateImageFile(val)
      if (this.magnetID) {
        this.saveChangesInImageField(this.magnetID)
      }
    },
  },
  mounted() {
    if (this.magnetID) {
      this.loadOne(this.magnetID)
    }
  },
  unmounted() {
    this.reset()
  },
}
</script>
