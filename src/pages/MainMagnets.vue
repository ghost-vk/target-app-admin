<template>
  <q-page class="q-pa-md">
    <h4>Обзор лид-магнитов</h4>
    <q-table
      title="Лид-магниты"
      :columns="columns"
      :rows="magnets"
      row-key="id"
      selection="single"
      :selected="selected"
      @row-dblclick="onDoubleClickRow"
      @update:selected="updateSelected"
    />
    <div class="q-mt-md q-gutter-sm">
      <q-btn
        label="новый лид-магнит"
        icon="add"
        color="green-5"
        @click="
          () => {
            reset()
            $router.push('/magnets/add')
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
              reset()
              loadOne(selected[0].id)
              $router.push('/magnets/add')
            }
          "
        />
        <q-btn
          label="редактировать"
          icon="edit"
          color="yellow-8"
          @click="$router.push(`/magnets/edit/${selected[0].id}`)"
        />
        <q-btn
          label="Удалить"
          icon="delete"
          color="red-4"
          @click="deleteItem(selected[0].id)"
        />
      </template>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { mapGetters, mapActions } from 'vuex'

const cutTail = (val) => {
  if (typeof val !== 'string' || val?.length < 40) {
    return val
  }
  return val.substr(0, 40) + ' ...'
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
    name: 'name',
    align: 'left',
    label: 'Название',
    field: 'name',
    format: cutTail,
    sortable: true,
  },
  {
    name: 'link',
    align: 'left',
    label: 'Ссылка',
    field: 'link',
    format: cutTail,
  },
  {
    name: 'description',
    required: true,
    label: 'Описание',
    align: 'left',
    field: 'description',
    format: cutTail,
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
      loadAll: 'magnets/loadAll',
      loadOne: 'magnets/loadOne',
      updateSelected: 'magnets/updateSelected',
      deleteItem: 'magnets/deleteItem',
      reset: 'magnets/reset',
    }),
    onDoubleClickRow(evt, row, i) {
      this.$router.push(`/magnets/edit/${row.id}`)
    },
  },
  computed: {
    ...mapGetters({
      magnets: 'magnets/magnets',
      selected: 'magnets/selected',
    }),
  },
  mounted() {
    this.loadAll()
  },
  unmounted() {
    this.reset()
  },
}
</script>
