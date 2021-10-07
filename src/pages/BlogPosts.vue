<template>
  <q-page class="q-pa-md">
    <h4>Обзор постов</h4>
    <q-table
      title="Отзывы"
      :columns="columns"
      :rows="posts"
      row-key="id"
      selection="single"
      :selected="selected"
      @row-dblclick="onDoubleClickRow"
      @update:selected="updateSelected"
    />
    <div class="q-mt-md q-gutter-sm">
      <q-btn
        label="новый пост"
        icon="add"
        color="green-5"
        @click="
          () => {
            resetSinglePostValues()
            $router.push('/blog/posts/add-new')
          }
        "
      />
      <template v-if="selected.length">
        <q-btn
          label="копировать"
          icon="content_copy"
          color="blue-5"
          @click="
          () => {
            resetSinglePostValues()
            loadSinglePost(selected[0].id)
            $router.push('/blog/posts/add-new')
          }
        "
        />
        <q-btn
          label="редактировать"
          icon="edit"
          color="yellow-8"
          @click="() => {
            resetSinglePostValues()
            $router.push(`/blog/posts/edit/${selected[0].id}`)
          }"
        />
        <q-btn
          label="Удалить"
          icon="delete"
          color="red-4"
          @click="deletePost(selected[0].id)"
        />
      </template>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { mapGetters, mapActions } from 'vuex'

const cutTail = (val) => {
  if (typeof val !== 'string' || val?.length < 24) {
    return val
  }
  return val.substr(0, 24) + ' ...'
}

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

const columns = [
  {
    name: 'id',
    required: 'true',
    label: 'ID',
    align: 'left',
    field: 'id',
    sortable: true,
  },
  {
    name: 'title',
    align: 'left',
    label: 'Заголовок',
    field: 'title',
    format: cutTail,
    sortable: true,
  },
  {
    name: 'subtitle',
    align: 'left',
    label: 'Подзаголовок',
    field: 'subtitle',
    format: cutTail,
  },
  {
    name: 'posting_date',
    required: true,
    label: 'Дата публикации',
    align: 'left',
    field: 'posting_date',
    format: prepareDate,
    sortable: true,
  },
]

export default {
  setup() {
    return {
      columns: ref(columns),
    }
  },
  methods: {
    ...mapActions({
      loadPosts: 'blogPosts/loadPosts',
      loadSinglePost: 'singlePost/loadPost',
      deletePost: 'blogPosts/deletePost',
      updateSelected: 'blogPosts/updateSelected',
      resetSinglePostValues: 'singlePost/resetAll'
    }),
    onDoubleClickRow(evt, row, i) {
      this.$router.push(`/blog/posts/edit/${row.id}`)
    },
  },
  computed: {
    ...mapGetters({
      posts: 'blogPosts/posts',
      selected: 'blogPosts/selected',
    }),
  },
  mounted() {
    this.loadPosts()
  },
  // $router.push(`/blog/posts/edit/${selected[0].id}`)
}
</script>
