<template>
  <q-page class='q-pa-md page fit column no-wrap justify-center items-center text-blue-10'>
        <div>
          <q-icon name="admin_panel_settings" style='font-size:80px' />
        </div>
        <div class="flex-break"></div>
        <div class='text text-h5'>
          Админ панель
        </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex'
})
</script>

<style lang='scss'>
  .page {
    background: $blue-1;
  }
</style>
