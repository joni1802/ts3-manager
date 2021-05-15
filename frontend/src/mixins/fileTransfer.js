import path from 'path-browserify'

export default {
  methods: {
    getFilePath(filePath, filename) {
      return path.join(filePath, filename)
    },
    getClientFileTransferId() {
      return Math.floor(Math.random() * 10000)
    }
  }
}
