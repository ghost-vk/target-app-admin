<template>
  <q-page class="q-pl-md q-mx-auto" style="max-width: 768px">
    <h4 class="text-center">
      {{
        postID
          ? `Редактирование поста [ID=${postID}]`
          : 'Добавление нового поста'
      }}
    </h4>
    <q-form
      @submit.prevent="addPost"
      @reset="() => {}"
      class="q-gutter-md overflow-auto q-pb-xl"
      style="padding-bottom: 150px"
    >
      <q-input
        outlined
        :model-value="values.title"
        @update:model-value="
          (val) => {
            updateField({ name: 'title', val: val })
          }
        "
        @blur="
          () => {
            if (postID) {
              saveChangesInSimpleField({
                name: 'title',
                id: postID,
                val: values.title,
              })
            }
          }
        "
        label="Заголовок *"
      />

      <q-input
        outlined
        label="Подзаголовок *"
        :model-value="values.subtitle"
        hide-hint
        :hint="`${values.subtitle.length || 0}/255 символов`"
        @update:model-value="
          (val) => {
            updateField({ name: 'subtitle', val: val })
          }
        "
        @blur="
          () => {
            if (postID) {
              saveChangesInSimpleField({
                name: 'subtitle',
                id: postID,
                val: values.subtitle,
              })
            }
          }
        "
      />

      <div>
        <q-input
          outlined
          :model-value="values.posting_date"
          readonly
          label="Дата публикации (по умолчанию сегодня) *"
          @click="isCalendarShown = !isCalendarShown"
        />
        <div v-show="isCalendarShown" class="q-mt-md">
          <q-date
            :model-value="values.posting_date"
            mask="YYYY-MM-DD"
            @update:model-value="
              (val) => {
                updateField({ name: 'posting_date', val: val })
                if (postID) {
                  saveChangesInSimpleField({
                    name: 'posting_date',
                    id: postID,
                    val: values.posting_date,
                  })
                }
              }
            "
            minimal
          />
        </div>
      </div>

      <q-file
        outlined
        clearable
        bottom-slots
        hint="1280x720px"
        :model-value="image"
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

      <q-editor
        :model-value="values.content"
        max-height="650px"
        @update:model-value="
          (val) => {
            updateField({ name: 'content', val: val })
          }
        "
        @blur="
          () => {
            if (postID) {
              saveChangesInSimpleField({
                name: 'content',
                id: postID,
                val: values.content,
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

      <div class="flex justify-between fixed-bottom q-pa-md bg-blue-1">
        <div></div>
        <div class="flex q-gutter-md">
          <q-btn
            v-if="postID"
            label="Удалить"
            type="button"
            color="red-5"
            @click="() => {
              deletePost(postID)
              $router.push('/blog/posts')
            }"
          />
          <q-btn
            label="Все посты"
            type="button"
            color="blue-5"
            @click="$router.push('/blog/posts')"
          />
          <q-btn
            v-if="!postID"
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
    let postID = ref(null)
    if (route.path.startsWith('/blog/posts/edit/')) {
      postID = route.params.id
    }
    return {
      postID,
      isCalendarShown: ref(false),
    }
  },
  computed: {
    ...mapGetters({
      values: 'singlePost/values',
      image: 'singlePost/image',
      preview: 'singlePost/preview',
    }),
  },
  methods: {
    ...mapActions({
      updateField: 'singlePost/updateField',
      updateImageFile: 'singlePost/updateImageFile',
      addPost: 'singlePost/addPost',
      loadPost: 'singlePost/loadPost',
      saveChangesInSimpleField: 'singlePost/saveChangesInSimpleField',
      saveChangesInThumbnailField: 'singlePost/saveChangesInThumbnailField',
      resetAll: 'singlePost/resetAll',
      deletePost: 'blogPosts/deletePost'
    }),
    async updateFile(val) {
      await this.updateImageFile(val)
      if (this.postID) {
        this.saveChangesInThumbnailField(this.postID)
      }
    },
  },
  mounted() {
    if (this.postID) {
      this.loadPost(this.postID)
    }
  },
  unmounted() {
    this.resetAll()
  },
}
</script>
