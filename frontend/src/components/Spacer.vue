<template>
<div class="spacer" :class="{'spacer--dark': $store.state.settings.darkMode}">
  <svg v-if="specialSpacer" height="10" class="spacer__special">
    <line x1="0" y1="5" x2="100%" y2="5" stroke="rgba(0,0,0,0.54)" stroke-width="0.1rem" :stroke-dasharray="dashArray" />
  </svg>
  <div v-else class="spacer__normal" :style="{textAlign: textPosition}">
    {{ text }}
  </div>
</div>
</template>

<script>
export default {
  props: {
    channelName: String
  },
  data() {
    return {
      specialSpacer: false,
      dashArray: null,
      characterBlocks: ['-..', '___', '-.-', '...', '---'],
      text: '',
      textPosition: ''
    }
  },
  methods: {
    analyzeSpacer(name) {
      let spacer = /\[(.*)(spacer)(.*)\](.*)/i
      let disassembledSpacer = name.match(spacer)
      let alignment = disassembledSpacer[1]
      let text = disassembledSpacer[4]

      if (this.characterBlocks.includes(text)) {
        this.createSpecialSpacer(text)
      } else {
        this.createSpacer(alignment, text)
      }
    },
    createSpecialSpacer(characterBlock) {
      this.specialSpacer = true

      switch (characterBlock) {
        case '-..':
          this.dashArray = '5 2 1 2 1 2';
          break;
        case '___':
          this.dashArray = '0';
          break;
        case '-.-':
          this.dashArray = '5 2 1 2';
          break;
        case '...':
          this.dashArray = '1 2';
          break;
        case '---':
          this.dashArray = '5 2';
      }
    },
    createSpacer(alignment, text) {
      this.specialSpacer = false

      let position = ''

      switch (alignment) {
        case 'l':
          position = 'left';
          break;
        case 'c':
          position = 'center';
          break;
        case 'r':
          position = 'right';
          break;
        default:
          position: 'left';
      }

      this.text = text
      this.textPosition = position
    }
  },
  watch: {
    channelName: {
      immediate: true,
      handler(name) {
        this.analyzeSpacer(name)
      }
    }
  }
}
</script>

<style>
.spacer {
  width: 100%;
}

.spacer__normal {
  min-height: '1rem';
  color: black;
}

.spacer__special {
  width: 100%;
}

.spacer--dark {
  filter: invert(1);
}
</style>
