<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>{{ $t('demo.title') }}</h1>
        <p>{{ $t('demo.description') }}</p>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>{{ $t('demo.examples') }}</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('demo.current_language') }}: {{ currentLanguageName }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('demo.formatted_date') }}: {{ formattedDate }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ $t('demo.formatted_number') }}: {{ formattedNumber }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>{{ $t('demo.form_example') }}</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                :label="$t('demo.name_field')"
                :placeholder="$t('demo.name_placeholder')"
                v-model="demoForm.name"
              ></v-text-field>
              
              <v-text-field
                :label="$t('demo.email_field')"
                :placeholder="$t('demo.email_placeholder')"
                v-model="demoForm.email"
                type="email"
              ></v-text-field>
              
              <v-btn color="primary">
                {{ $t('common.save') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'I18nDemo',
  mixins: [i18nMixin],
  
  data() {
    return {
      demoForm: {
        name: '',
        email: ''
      }
    }
  },
  
  computed: {
    currentLanguageName() {
      const languageMap = {
        'en': 'English',
        'zh': '中文'
      }
      return languageMap[this.$i18n.locale] || this.$i18n.locale
    },
    
    formattedDate() {
      return this.formatDate(new Date())
    },
    
    formattedNumber() {
      return this.formatNumber(1234567.89)
    }
  }
}
</script>
