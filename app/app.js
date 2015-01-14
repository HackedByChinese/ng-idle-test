(function(window, angular, undefined) {
	'use strict';
	angular.module('myprojectname', ['ngIdle', 'ui.bootstrap'])
		.factory('Title', ['$document', '$interpolate', function($document, $interpolate) {

			var state = {
				idle: 'Expire in {{minutes}}:{{seconds}}',
				timedout: 'Session Expired',
				original: null
			};

			function padLeft(nr, n, str){
				return Array(n-String(nr).length+1).join(str||'0')+nr;
			}

			return {
				original: function() {
					return state.original;
				},
				store: function(overwrite) {
					if (overwrite || !state.original) state.original = this.value();
				},
				value: function(val) {
					if (angular.isUndefined(val)) return $document[0].title;

					$document[0].title = val;
				},
				idle: function(val) {
					if (angular.isUndefined(val)) return state.idle;

					state.idle = val;
				},
				timedout: function(val) {
					if (angular.isUndefined(val)) return state.timedout;

					state.timedout = val;
				},
				setAsIdle: function(countdown) {
					this.store();

					var remaining = { totalSeconds: countdown };
					remaining.minutes = Math.floor(countdown/60);
					remaining.seconds = padLeft(countdown - remaining.minutes * 60, 2);

					this.value($interpolate(this.idle())(remaining));
				},
				setAsTimedOut: function() {
					this.store();

					this.value(this.timedout());
				},
				restore: function() {
					if (this.original()) this.value(this.original());
				}
			};
		}])
		.directive('title', ['Title', function(Title) {

			return {
				link: function($scope, $element, $attr) {
					Title.store(true);

					$scope.$on('$idleWarn', function(e, countdown) {
						Title.setAsIdle(countdown);
					});

					$scope.$on('$idleEnd', function() {
						Title.restore();
					});

					$scope.$on('$idleTimeout', function() {
						Title.setAsTimedOut();
					});
				}
			};
		}])
		.controller('DemoCtrl', function($scope, $idle, $keepalive, $modal, Title){
			$scope.started = false;

      // you can override the idle and timeout title formats at any time
			Title.idle('In {{minutes}}:{{seconds}}, your session will expire!');
			Title.timedout('Your session has expired!');

			function closeModals() {
				if ($scope.warning) {
					$scope.warning.close();
					$scope.warning = null;
				}

				if ($scope.timedout) {
					$scope.timedout.close();
					$scope.timedout = null;
				}
			}

			$scope.$on('$idleStart', function() {
				closeModals();

				$scope.warning = $modal.open({
					templateUrl: 'warning-dialog.html',
					windowClass: 'modal-warning'
				});
			});

			$scope.$on('$idleEnd', function() {
				closeModals();
			});

			$scope.$on('$idleTimeout', function() {
				closeModals();
				$scope.timedout = $modal.open({
					templateUrl: 'timedout-dialog.html',
					windowClass: 'modal-danger'
				});
			});

			$scope.start = function() {
				closeModals();
				$idle.watch();
				$scope.started = true;
			};

			$scope.stop = function() {
				closeModals();
				$idle.unwatch();
				$scope.started = false;

			};
		})
		.config(function($idleProvider, $keepaliveProvider) {
			$idleProvider.idleDuration(5);
            $idleProvider.warningDuration(5);
            $keepaliveProvider.interval(10);
		});

})(window, window.angular);
