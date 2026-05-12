// =============================================
//   MainController.js
//   UI logic only — no $http, no hardcoded data
//   Follows EMR patterns:
//     - IIFE
//     - Array DI (minification safe)
//     - $onInit lifecycle
//     - Private functions (no $scope)
//     - Services handle all HTTP + config
// =============================================

; (function () {

  angular.module('laundryApp')
    .controller('FreshFoldMainController', ['$scope', '$timeout', 'FreshFoldService', 'FreshFoldConfigService', FreshFoldMainController]);

  function FreshFoldMainController($scope, $timeout, FreshFoldService, FreshFoldConfigService) {

    // ── Constants ──────────────────────────
    var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var PHONE_REGEX = /^[0-9]{10}$/;
    var STORAGE_KEY = FreshFoldConfigService.getStorageKey();
    var VALID_PAGES = ['home', 'book', 'orders'];

    // ── ENUMs (Object.freeze — EMR pattern) ─
    var AUTH_MODES = Object.freeze({ LOGIN: 'login', REGISTER: 'register' });
    var ROLES = Object.freeze({ ADMIN: 'admin', USER: 'user' });

    // =============================================
    //   $onInit — entry point (EMR pattern)
    // =============================================
    this.$onInit = function () {
      initState();
      loadUserFromStorage();
      handleHashRouting();
    };

    // =============================================
    //   Private — Initialisation
    // =============================================
    function initState() {
      $scope.authMode = AUTH_MODES.LOGIN;
      $scope.authForm = {};
      $scope.authError = null;
      $scope.authEmailError = null;
      $scope.authLoading = false;
      $scope.registerSuccess = false;
      $scope.currentUser = null;
      $scope.page = 'home';
      $scope.services = FreshFoldConfigService.getServicesList();
      $scope.statusSteps = FreshFoldConfigService.getStatusSteps();
      $scope.booking = FreshFoldConfigService.getDefaultBooking();
      $scope.errors = {};
      $scope.paymentMethod = 'COD';
      $scope.paymentStep = false;
      $scope.bookingSuccess = false;
      $scope.lastOrderId = '';
      $scope.lastPaymentMethod = '';
      $scope.bookError = null;
      $scope.submitting = false;
      $scope.orders = [];
      $scope.toast = { show: false, message: '' };
    }

    function loadUserFromStorage() {
      var stored = localStorage.getItem(STORAGE_KEY);
      $scope.currentUser = stored ? JSON.parse(stored) : null;
    }

    function handleHashRouting() {
      var hash = window.location.hash.replace('#', '');
      if (hash && VALID_PAGES.indexOf(hash) > -1) {
        $scope.page = hash;
        if (hash === 'orders') loadOrders();
      }
      window.addEventListener('popstate', function () {
        var h = window.location.hash.replace('#', '');
        $scope.$evalAsync(function () {
          $scope.page = h || 'home';
          if ($scope.page === 'orders') loadOrders();
        });
      });
    }

    // =============================================
    //   Private — Pure Logic (testable, reusable)
    // =============================================
    function getServicePrice(serviceName) {
      var list = FreshFoldConfigService.getServicesList();
      var found = list.find(function (s) { return s.name === serviceName; });
      return found ? found.price : 0;
    }

    function calcTotal(weight, serviceName) {
      return weight * getServicePrice(serviceName);
    }

    function getStatusClass(status) {
      var map = FreshFoldConfigService.getStatusClassMap();
      return map[status] || 'status-received';
    }

    function getStatusProgress(status) {
      var map = FreshFoldConfigService.getStatusProgressMap();
      return map[status] || 0;
    }

    function getStepIndex(step) {
      return FreshFoldConfigService.getStatusSteps().indexOf(step);
    }

    function isStepDone(step, status) {
      return getStepIndex(step) <= getStepIndex(status);
    }

    function getStepClass(step, status) {
      var i = getStepIndex(step);
      var c = getStepIndex(status);
      if (i < c) return 'done';
      if (i === c) return 'active';
      return '';
    }

    function validateEmail(email) {
      return EMAIL_REGEX.test((email || '').trim());
    }

    function validatePhone(phone) {
      return PHONE_REGEX.test((phone || '').trim());
    }

    function buildOrderPayload() {
      return {
        user_id: $scope.currentUser.id,
        name: $scope.booking.name,
        phone: $scope.booking.phone,
        address: $scope.booking.address,
        service: $scope.booking.service,
        weight: $scope.booking.weight,
        date: $scope.booking.date
          ? new Date($scope.booking.date).toISOString().split('T')[0]
          : 'TBD',
        notes: $scope.booking.notes,
        total: calcTotal($scope.booking.weight, $scope.booking.service),
        payment_method: $scope.paymentMethod,
      };
    }

    function showToast(msg) {
      $scope.toast.message = msg;
      $scope.toast.show = true;
      $timeout(function () { $scope.toast.show = false; }, 3000);
    }

    function resetBookingState() {
      $scope.booking = FreshFoldConfigService.getDefaultBooking();
      $scope.errors = {};
      $scope.paymentStep = false;
      $scope.bookError = null;
      $scope.submitting = false;
    }

    function loadOrders() {
      if (!$scope.currentUser) return;
      var userId = $scope.currentUser.role === ROLES.USER ? $scope.currentUser.id : null;
      FreshFoldService.getOrders(userId)
        .then(function (res) { $scope.orders = res.data; })
        .catch(function () { showToast('Failed to load orders.'); });
    }

    function validateBookingForm() {
      $scope.errors = {};
      var valid = true;
      if (!$scope.booking.service) {
        $scope.errors.service = 'Please select a service.'; valid = false;
      }
      if (!$scope.booking.name || !$scope.booking.name.trim()) {
        $scope.errors.name = 'Name is required.'; valid = false;
      }
      if (!$scope.booking.phone || !$scope.booking.phone.trim()) {
        $scope.errors.phone = 'Phone number is required.'; valid = false;
      } else if (!validatePhone($scope.booking.phone)) {
        $scope.errors.phone = 'Enter a valid 10-digit mobile number (numbers only).'; valid = false;
      }
      if (!$scope.booking.address || !$scope.booking.address.trim()) {
        $scope.errors.address = 'Pickup address is required.'; valid = false;
      }
      return valid;
    }

    // =============================================
    //   $scope — Public API (called from HTML)
    //   Thin wrappers — delegates to private fns
    // =============================================

    // Helpers for HTML bindings
    $scope.getServicePrice = function () { return getServicePrice($scope.booking.service); };
    $scope.getTotal = function () { return calcTotal($scope.booking.weight, $scope.booking.service); };
    $scope.getStatusClass = function (status) { return getStatusClass(status); };
    $scope.getProgress = function (status) { return getStatusProgress(status); };
    $scope.isStepDone = function (step, s) { return isStepDone(step, s); };
    $scope.getStepClass = function (step, s) { return getStepClass(step, s); };

    // Live validation
    $scope.liveValidateEmail = function () {
      var email = ($scope.authForm.email || '').trim();
      $scope.authEmailError = (!email) ? null
        : !validateEmail(email) ? 'Enter a valid email (e.g. user@example.com).'
          : null;
    };

    $scope.liveValidatePhone = function () {
      var phone = ($scope.booking.phone || '').trim();
      if (!phone) { $scope.errors.phone = null; }
      else if (!/^[0-9]+$/.test(phone)) { $scope.errors.phone = 'Only numbers are allowed.'; }
      else if (phone.length < 10) { $scope.errors.phone = 'Phone number must be 10 digits.'; }
      else if (phone.length > 10) { $scope.errors.phone = 'Phone number must be exactly 10 digits.'; }
      else { $scope.errors.phone = null; }
    };

    // Auth
    $scope.switchTab = function (mode) {
      $scope.authMode = mode;
      $scope.authError = null;
      $scope.authEmailError = null;
      $scope.registerSuccess = false;
      $scope.authForm = {};
    };

    $scope.register = function () {
      $scope.authError = null;
      if (!$scope.authForm.name || !$scope.authForm.name.trim()) { $scope.authError = 'Full name is required.'; return; }
      if (!$scope.authForm.email || !$scope.authForm.email.trim()) { $scope.authError = 'Email is required.'; return; }
      if (!validateEmail($scope.authForm.email)) { $scope.authError = 'Please enter a valid email address.'; return; }
      if (!$scope.authForm.password || $scope.authForm.password.length < 6) { $scope.authError = 'Password must be at least 6 characters.'; return; }

      $scope.authLoading = true;
      FreshFoldService.register($scope.authForm)
        .then(function () {
          $scope.authMode = AUTH_MODES.LOGIN;
          $scope.authForm = {};
          $scope.registerSuccess = true;
        })
        .catch(function (err) {
          $scope.authError = (err.data && err.data.error) ? err.data.error : 'Registration failed.';
        })
        .finally(function () { $scope.authLoading = false; });
    };

    $scope.login = function () {
      $scope.authError = null;
      if (!$scope.authForm.email || !$scope.authForm.email.trim()) { $scope.authError = 'Email is required.'; return; }
      if (!validateEmail($scope.authForm.email)) { $scope.authError = 'Please enter a valid email address.'; return; }
      if (!$scope.authForm.password) { $scope.authError = 'Password is required.'; return; }

      $scope.authLoading = true;
      FreshFoldService.login($scope.authForm)
        .then(function (res) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
          $scope.currentUser = res.data.user;
          $scope.authForm = {};
          $scope.authEmailError = null;
          $scope.page = $scope.currentUser.role === ROLES.ADMIN ? 'orders' : 'home';
          if ($scope.page === 'orders') loadOrders();
        })
        .catch(function (err) {
          if (err.status === 401) { $scope.authError = 'No account found with this email. Please register first.'; }
          else if (err.status === 0 || err.status === -1) { $scope.authError = 'Cannot connect to server. Make sure backend is running.'; }
          else { $scope.authError = (err.data && err.data.error) ? err.data.error : 'Login failed.'; }
        })
        .finally(function () { $scope.authLoading = false; });
    };

    $scope.logout = function () {
      localStorage.removeItem(STORAGE_KEY);
      $scope.currentUser = null;
      $scope.page = 'home';
      $scope.orders = [];
    };

    // Navigation
    $scope.goTo = function (p) {
      $scope.page = p;
      window.location.hash = p;
      if (p === 'book') { resetBookingState(); $scope.bookingSuccess = false; }
      if (p === 'orders') { loadOrders(); }
    };

    // Booking
    $scope.proceedToPayment = function () {
      if (validateBookingForm()) { $scope.paymentStep = true; }
    };

    $scope.placeOrder = function () {
      $scope.submitting = true;
      $scope.bookError = null;
      FreshFoldService.placeOrder(buildOrderPayload())
        .then(function (res) {
          $scope.lastOrderId = res.data.orderId;
          $scope.lastPaymentMethod = $scope.paymentMethod;
          $scope.bookingSuccess = true;
          $scope.submitting = false;
          resetBookingState();
          showToast('Order #' + res.data.orderId + ' placed!');
        })
        .catch(function (err) {
          $scope.bookError = (err.data && err.data.error) || 'Something went wrong. Try again.';
          $scope.submitting = false;
          $scope.paymentStep = false;
        });
    };

    // Orders
    $scope.loadOrders = function () { loadOrders(); };

    $scope.updateStatus = function (order) {
      FreshFoldService.updateOrderStatus(order.id, order.status)
        .then(function () { showToast('Order #' + order.id + ' updated to ' + order.status); })
        .catch(function () { showToast('Failed to update status.'); });
    };

  }

})();