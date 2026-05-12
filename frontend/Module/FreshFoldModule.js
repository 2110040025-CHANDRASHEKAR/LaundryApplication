// =============================================
//   FreshFoldModule.js
//   Declares module routes — HTML + files
//   server.js serves all files statically
//   so no manual script injection needed
// =============================================

; (function () {

  // ── Module Route Declaration ──────────────
  // Same pattern as EMR's addAttendeesModuleRoutes
  // templateUrl = the HTML to render
  // files = services + controller (for reference)
  var freshFoldModuleRoutes = [
    {
      name: 'FreshFold',
      templateUrl: 'frontend/Htmls/FreshFold.html',
      files: [
        'frontend/Services/FreshFoldConfigService.js',
        'frontend/Services/FreshFoldService.js',
        'frontend/Controllers/FreshFoldMainController.js',
      ]
    }
  ];

  // ── Module Declaration ────────────────────
  angular.module('laundryApp', []);

})();