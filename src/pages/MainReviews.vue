<template>
  <q-page class="q-pa-md">
    <h4>Редактирование отзывов</h4>
    <q-table
      title="Отзывы"
      :rows="reviews"
      :columns="columns"
      :loading="loaders.reviews"
      row-key="id"
      selection="single"
      v-model:selected="selected"
      @update:selected="val => updateCurrentItemID(val[0].id)"
    />
    <div class="q-mt-md q-gutter-sm">
      <q-btn
        label="добавить"
        icon="add"
        color="green-5"
        @click="
          () => {
            resetAll()
            toggleForm(true)
            updateAction('add')
          }
        "
      />
      <template v-if="selected.length > 0 && currentID > 0">
        <q-btn
          label="копировать"
          icon="content_copy"
          color="blue-5"
          @click="
            () => {
              toggleForm(true)
              updateAction('add')
              setFieldsFromSelected()
            }
          "
        />
        <q-btn
          label="редактировать"
          icon="edit"
          color="yellow-8"
          @click="
            () => {
              toggleForm(true)
              updateAction('edit')
              setFieldsFromSelected()
            }
          "
        />
        <q-btn
          label="Удалить"
          icon="delete"
          color="red-4"
          @click="deleteReview"
        />
      </template>
    </div>
    <MainReviewsPopup @unselect="selected = []" />
  </q-page>
</template>

<script>
import MainReviewsPopup from 'components/MainReviewsPopup'
import { ref } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { serverUrl } from 'boot/axios'

const cutTail = (val) => {
  if (typeof val !== 'string' || val?.length < 24) {
    return val
  }
  return val.substr(0, 24) + ' ...'
}

const columns = [
  {
    name: 'id',
    required: 'true',
    label: 'ID',
    align: 'left',
    field: 'id',
    sortable: true
  },
  {
    name: 'full_name',
    required: true,
    label: 'Имя',
    align: 'left',
    field: 'full_name',
    format: cutTail,
    sortable: true,
  },
  {
    name: 'category',
    align: 'center',
    label: 'Категория',
    field: 'category',
    format: cutTail,
    sortable: true,
  },
  {
    name: 'link',
    align: 'center',
    label: 'Ссылка на Instagram',
    field: 'link',
    format: cutTail,
  },
  {
    name: 'profession',
    label: 'Род деятельности',
    field: 'profession',
    format: cutTail,
    sortable: true,
  },
  { name: 'image', label: 'Картинка', field: 'image', format: cutTail },
  {
    name: 'review_order',
    label: 'Приоритет (0 - 10)',
    field: 'review_order',
    sortable: true,
  },
  {
    name: 'content',
    label: 'Содержание отзыва',
    field: 'content',
    sortable: true,
    format: cutTail,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
]

export default {
  name: 'MainReviews',
  setup() {
    return {
      confirmStatus: ref(false),
      isConfirmVisible: ref(false),
      popupAction: ref('add'),
      selected: ref([]),
      columns,
    }
  },
  components: {
    MainReviewsPopup,
  },
  computed: {
    ...mapGetters({
      isFormVisible: 'mainReviews/visibility',
      reviews: 'mainReviews/reviews',
      loaders: 'mainReviews/loaders',
      currentAction: 'mainReviews/action',
      currentID: 'mainReviews/id'
    })
  },
  mounted() {
    this.getReviews()
  },
  methods: {
    ...mapActions({
      getReviews: 'mainReviews/getReviews',
      toggleForm: 'mainReviews/updateVisibility',
      resetAll: 'mainReviews/resetAll',
      updateCurrentItemID: 'mainReviews/updateCurrentItemID',
      updateFullName: 'mainReviews/updateFullName',
      updateCategory: 'mainReviews/updateCategory',
      updateLink: 'mainReviews/updateLink',
      updateProfession: 'mainReviews/updateProfession',
      updateFile: 'mainReviews/updateFile',
      updateImage: 'mainReviews/updateImage',
      updatePreview: 'mainReviews/updatePreviewFromPath',
      updateOrder: 'mainReviews/updateOrder',
      updateContent: 'mainReviews/updateContent',
      deleteCurrentItem: 'mainReviews/deleteCurrentItem',
      updateAction: 'mainReviews/updateAction',
      updateLoader: 'mainReviews/updateLoader'
    }),
    deleteReview() {
      if (this.deleteCurrentItem()) {
        this.selected = []
      }
    },
    setFieldsFromSelected() {
      const s = this.selected[0]
      this.updateCurrentItemID(s.id)
      this.updateFullName(s.full_name)
      this.updateCategory(s.category)
      this.updateLink(s.link)
      this.updateProfession(s.profession)
      this.updateImage(serverUrl + s.image)
      const filePath = s.image ? serverUrl + s.image : null
      this.updateFile(filePath)
      this.updateOrder(s.review_order)
      this.updateContent(s.content)
    }
  },
}
</script>
