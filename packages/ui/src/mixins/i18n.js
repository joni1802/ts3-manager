// i18n mixin for common internationalization patterns
export default {
  methods: {
    // Helper method for pluralization
    $tc(key, count, values) {
      return this.$i18n.tc(key, count, values);
    },
    
    // Helper method for date localization
    formatDate(date, options = {}) {
      const locale = this.$i18n.locale;
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
    },
    
    // Helper method for number localization
    formatNumber(number, options = {}) {
      const locale = this.$i18n.locale;
      return new Intl.NumberFormat(locale, options).format(number);
    },
    
    // Helper method for currency localization
    formatCurrency(amount, currency = 'USD') {
      const locale = this.$i18n.locale;
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    }
  }
}
