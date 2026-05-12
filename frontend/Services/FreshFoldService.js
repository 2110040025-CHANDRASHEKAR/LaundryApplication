// =============================================
//   FreshFoldService.js
//   All HTTP calls live here — controller never
//   touches $http directly (EMR pattern)
// =============================================

; (function () {

  angular.module('laundryApp')
    .service('FreshFoldService', ['$http', 'FreshFoldConfigService', FreshFoldService]);

  function FreshFoldService($http, FreshFoldConfigService) {

    var API_BASE = FreshFoldConfigService.getApiBase();

    // ── Auth ───────────────────────────────
    function register(formData) {
      return $http.post(API_BASE + '/auth/register', formData);
    }

    function login(formData) {
      return $http.post(API_BASE + '/auth/login', formData);
    }

    // ── Orders ─────────────────────────────
    function placeOrder(orderData) {
      return $http.post(API_BASE + '/orders', orderData);
    }

    function getOrders(userId) {
      var url = API_BASE + '/orders';
      if (userId) url += '?user_id=' + userId;
      return $http.get(url);
    }

    function updateOrderStatus(orderId, status) {
      return $http.put(API_BASE + '/orders/' + orderId + '/status', { status: status });
    }

    // ── Public API ─────────────────────────
    return {
      register: register,
      login: login,
      placeOrder: placeOrder,
      getOrders: getOrders,
      updateOrderStatus: updateOrderStatus,
    };
  }

})();