// =============================================
//   FreshFoldConfigService.js
//   All environment and app-level config lives
//   here — controller never hardcodes these
// =============================================

; (function () {

  angular.module('laundryApp')
    .service('FreshFoldConfigService', FreshFoldConfigService);

  function FreshFoldConfigService() {

    // ── App Config ─────────────────────────
    var APP_CONFIG = {
      API_BASE: 'http://localhost:5000/api',
      STORAGE_KEY: 'freshfold_user',
    };

    // ── Services List ──────────────────────
    // Add/remove/edit services only here
    // Controller never hardcodes this data
    var SERVICES_LIST = [
      { name: 'Wash & Fold', price: 40 },
      { name: 'Dry Clean', price: 120 },
      { name: 'Iron Only', price: 20 },
      { name: 'Wash & Iron', price: 60 },
      { name: 'Shoe Cleaning', price: 150 },
      { name: 'Curtains', price: 80 },
    ];

    // ── Order Status Steps ─────────────────
    var STATUS_STEPS = ['Received', 'Processing', 'Ready', 'Delivered'];

    // ── Status → CSS class map ─────────────
    var STATUS_CLASS_MAP = {
      Received: 'status-received',
      Processing: 'status-processing',
      Ready: 'status-ready',
      Delivered: 'status-delivered',
    };

    // ── Status → Progress % map ────────────
    var STATUS_PROGRESS_MAP = {
      Received: 8,
      Processing: 40,
      Ready: 72,
      Delivered: 100,
    };

    // ── Payment Methods ────────────────────
    var PAYMENT_METHODS = [
      { label: 'Cash on Delivery', value: 'COD', sub: 'Pay when collected' },
    ];

    // ── Default Booking State ──────────────
    function getDefaultBooking() {
      return { service: '', name: '', phone: '', address: '', date: '', weight: 3, notes: '' };
    }

    // ── Public API ─────────────────────────
    return {
      getApiBase: function () { return APP_CONFIG.API_BASE; },
      getStorageKey: function () { return APP_CONFIG.STORAGE_KEY; },
      getServicesList: function () { return SERVICES_LIST; },
      getStatusSteps: function () { return STATUS_STEPS; },
      getStatusClassMap: function () { return STATUS_CLASS_MAP; },
      getStatusProgressMap: function () { return STATUS_PROGRESS_MAP; },
      getPaymentMethods: function () { return PAYMENT_METHODS; },
      getDefaultBooking: function () { return getDefaultBooking(); },
    };
  }

})();