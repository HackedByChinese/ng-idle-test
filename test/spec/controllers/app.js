'use strict';

describe('Controller: DemoCtrl', function () {

  // load the controller's module
  beforeEach(module('myprojectname'));

  var DemoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DemoCtrl = $controller('DemoCtrl', {
      $scope: scope
    });
  }));

  it('start() should set started to true', function () {
    scope.start();
    expect(scope.started).toBe(true);
  });
});
