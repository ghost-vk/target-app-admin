<template>
  <q-page class="q-pa-md page">
    <h4>Media Library</h4>
    <hr />
    <h5>Upload photo</h5>
    <div class="upload-file q-mb-md">
      <q-form @submit="onSubmit">
        <q-file
          filled
          multiple
          bottom-slots
          v-model="files"
          accept=".jpg,.jpeg,.png,.webp,.svg,.gif"
          label="Pick files"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" @click.stop />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              @click.stop="files = null"
              class="cursor-pointer"
            />
          </template>
        </q-file>
        <q-btn label="Submit" type="submit" color="primary" />
      </q-form>
    </div>
    <hr />
    <h5>Photos</h5>
    <div v-if="photos" class="row">
      <div v-for="p in photos" :key="p.path" class="ic col-3">
        <q-img :src="serverUrl + p.path" fit="cover">
          <q-icon
            @click="copyFilePath(p.path)"
            class="absolute all-pointer-events icon"
            size="28px"
            name="content_copy"
            color="grey-3"
            style="top: 8px; right: 8px"
          >
            <q-tooltip>Copy file path</q-tooltip>
          </q-icon>
          <q-icon
            class="absolute all-pointer-events icon"
            size="28px"
            name="info"
            color="grey-3"
            style="top: 8px; left: 8px"
          >
            <q-tooltip class="text-right">
              {{ p.size }}<br />{{ p.path }}
            </q-tooltip>
          </q-icon>
          <q-icon
            @click="confirmDeleting(p.path)"
            class="absolute all-pointer-events icon"
            size="28px"
            name="delete"
            color="red-4"
            style="bottom: 8px; left: 8px"
          >
            <q-tooltip class="text-right"> Delete </q-tooltip>
          </q-icon>
        </q-img>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar, copyToClipboard, format } from 'quasar'
import { api, serverUrl } from 'boot/axios'
const { humanStorageSize } = format

const sortPhotos = (a, b) => {
  const aNum = a.path.match(/(?<=\-).+?(?=\.)/)
  const bNum = b.path.match(/(?<=\-).+?(?=\.)/)
  const result = Number(aNum[0]) > Number(bNum[0]) ? -1 : 1
  return result
}

export default defineComponent({
  name: 'MediaLibrary',
  setup() {
    const $q = useQuasar()

    const files = ref(null)

    const photos = ref(null)

    onMounted(async () => {
      const response = await api.get('/api/media-library')
      if (response.data.ok) {
        if (
          Array.isArray(response.data.photos) &&
          response.data.photos.length === 0
        ) {
          $q.notify('No photos in folder')
        }
        const unsorted = response.data.photos.map((p) => {
          return { path: p.path, size: humanStorageSize(p.size) }
        })
        photos.value = unsorted.sort(sortPhotos)
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.message,
        })
      }
    })

    const copyFilePath = async (filePath) => {
      try {
        await copyToClipboard(filePath)
        $q.notify('Copied')
      } catch (e) {
        console.log(e)
      }
    }

    const onSubmit = () => {
      console.log('submit form')
      confirm()
    }

    const confirm = () => {
      if (!files.value) {
        $q.notify('Files is empty')
        return
      }
      $q.dialog({
        dark: true,
        title: 'Confirm',
        message: 'Would you like to upload files?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          const data = new FormData()
          files.value.forEach((f) => {
            data.append('photos', f)
          })
          const response = await api.post('/api/media-library', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          if (response.data.ok) {
            $q.notify({
              type: 'positive',
              message: 'Files uploaded',
            })
          }
          if (response.data.files) {
            response.data.files.forEach((f) => {
              photos.value.unshift({
                path: f.path,
                size: humanStorageSize(f.size),
              })
            })
          }
          return response
        } catch (e) {
          $q.notify('Error occurs when uploading photos')
        }
      })
    }

    const confirmDeleting = (file) => {
      if (typeof file !== 'string') {
        $q.notify('Error occurs when delete file. File path is not string.')
        return
      }
      $q.dialog({
        dark: true,
        title: 'Confirm',
        message: 'Would you like to delete file?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          const response = await api.delete(`/api/media-library`, {
            data: {
              file,
            },
          })
          if (response.data.ok) {
            $q.notify({
              type: 'positive',
              message: 'File deleted',
            })
          }
          if (response.data.file) {
            photos.value = photos.value.filter(
              (p) => p.path !== response.data.file
            )
          }
        } catch (e) {
          $q.notify({
            type: 'negative',
            message: 'Error occurs when delete file',
          })
        }
      })
    }

    return { photos, copyFilePath, files, onSubmit, serverUrl, confirmDeleting }
  },
})
</script>

<style lang="scss" scoped>
.ic {
  height: 160px;
  overflow: hidden;
  padding: 5px;
  margin-bottom: 5px;
  .q-img {
    border-radius: 4px;
    height: 100%;
  }
}
.icon {
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}
.ic:hover {
  .icon {
    opacity: 1;
  }
}

.upload-file {
  max-width: 400px;
}
</style>
