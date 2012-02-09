(function($, undefined) {
	// Main code for the plugin
	$.notifications = function (element, options, field, value) {
		var settings = {};	// settings that will handle the $.extend of the defualts, passed in options, and data-notification-settings
		var target = {};	// the target element to attach to
		var area = {};		// the notification area to create
		var timerPid = 0;	// the handle ID of the timer if one gets created
		
		// Clear the messages from the notification-area
		var clear = function() {
			area.children('.notification-message').each(function (idx, el) {
				var item = $(this);
				
				item.fadeOut('fast', function () { item.remove(); });
			});
		};
		
		// Add a message to the notification-area
		// Adds a click event to the message to remove it if it's clicked
		// After it's removed it'll check to see if there are any other messages
		// and if there aren't, it'll hide the notification-area
		var notify = function (message) {
			if (settings.appendAlerts === false) clear();
			$('<div></div>', {
				style: 'width:100%;',
				html: message
			}).addClass('notification-message').on('click', function() {	// removes the message and hides the area if it's the only message
				if (timerPid > 0) clearTimeout(timerPid);
				
				var self = $(this),
					parent = self.parent();
					
				self.fadeOut('fast', function () { 	// removes the element from the DOM
					self.remove();
					
					if (parent.children('div').length <= 1) toggle();
				});
			}).appendTo(area);
			if (!area.is(':visible')) toggle();	// only call toggle when it's not visible, otherwise if a second notification comes in it would be hidden
			if (settings.timeout > 0) {
				if (timerPid != 0) clearTimeout(timerPid);
				timerPid = setTimeout(toggle, settings.timeout);
			}
		};
		
		// This is wrapped in a function so there's only one place to adjust the speed
		var toggle = function () {	
			area.slideToggle('slow');
		};
		
		// initialization function
		function init(element, options, field, value) {
			target = element;
			
			if (typeof options === 'object') settings = $.extend({}, $.notifications.defaults, options);	// In case of calling notify
			settings = $.extend({}, $.notifications.defaults, getSettings(), settings);
			saveSettings();
			
			area = getDiv();
			interpretInput(options, field, value);
			
			if (settings.usesJQueryUI === true) {	// Add the jQueryUI classes if needed
				$('.notification-area').each(function (idx, el) {
					if (!$(this).hasClass('ui-widget')) $(this).addClass('ui-widget');
				});
				$('.notification-title').each(function (idx, el) {
					if (!$(this).hasClass('ui-widget-header')) $(this).addClass('ui-widget-header');
				});
				$('.notification-message').each(function (idx, el) {
					if (!$(this).hasClass('ui-widget-content')) $(this).addClass('ui-widget-content');
				});
			}
		}
		
		// Gets the ID of the element, otherwise the tag-name, otherwise either window or doument depending what it actually is
		function getId() {
			return (target.attr && target.attr('id')) || (target.get(0).tagName || (typeof target.get(0) === typeof window && target.get(0).document ? 'window' : 'document'));
		}
		
		// Gets the $().data('?-notification-settings') since if it's a document or window object, they are stored on the body tag
		function getSettings() {
			if (isWindowOrDocument()) return $('body').data(getId() + '-notificationPipe-settings');
			
			return target.data('notification-settings');
		}
		
		// Saves the $().data('?-notification-settings') since if it's a document or window object, they are stored on the body tag
		function saveSettings() {
			if (isWindowOrDocument()) $('body').data(getId() + '-notificationPipe-settings', settings);
			else target.data('notification-settings', settings);
		}
		
		// routes to the appropriate function, also handles updates to the options by passing $().notifications('options', 'optionName', 'optionValue');
		function interpretInput(input, option, value) {
			if (typeof input === 'string') {
				if (input.toLowerCase() === 'options' && option && value) {
					if (settings[option]) {
						settings[option] = value;
						saveSettings();
					} else $.error('Option ' + option + ' does not exist in jQuery.ajaxy.');
				} else {
					switch (input.toLowerCase()) {
						case 'clear':
							return clear();
						case 'notify':
							return notify(option);
						case 'toggle':
							return toggle();
						case 'target':
							return target;
						default:
							$.error('Method ' + input + ' does not exist in jQuery.ajaxy.');
							break;
					}
				}
			};
		}
		
		// Either returns the notification-area for the target if it exists or creates one
		function getDiv() {
			if ($('#' + getId() + '-notification-area').length) return $('#' + getId() + '-notification-area');
			
			var div = $('<div></div>', {
				id: getId() + '-notification-area',
				name: getId() + '-notification-area',
				style: getPosition() + ' display:none; text-align:center; ' + getLocation()
			}).appendTo(isWindowOrDocument() ? $('body') : target).addClass('notification-area');
			
			var title = $('<div></div>', {
				style: 'text-align:left; width:100%;',
				html: settings.title
			}).addClass('notification-title').appendTo(div);
			
			if (!isWindowOrDocument()) target.css('position', 'relative');
			
			return div;
		}
				
		function getPosition() {
			return isWindowOrDocument() ? 'position:fixed;' : 'position:absolute;';
		}
		
		function isWindowOrDocument() {
			if (getId() === 'document' || getId() === 'window') return true;
			return false;
		}
		
		// Gets the style info for the location that was in the settings
		function getLocation() {
			switch (settings.location.toLowerCase()) {
				case 'top-left':
					return 'width:' + settings.width + '; top:0; left:0;';
				case 'top-right':
					return 'width:' + settings.width + '; top:0; right:0;';
				case 'bottom-right':
					return 'width:' + settings.width + '; bottom:0; right:0;';
				case 'bottom-left':
					return 'width:' + settings.width + '; bottom:0; left:0;';
				case 'top':
					return 'width:100%; top:0;';
				case 'bottom':
				default:
					return 'width:100%; bottom:0;';
			}
		}
		
		init(element, options, field, value);	// Always calls init
		
		return {	// Uses revealing module pattern
			area: area,
			settings: settings,
			target: target,
			timerPid: timerPid,
			clear: clear,
			notify: notify,
			toggle: toggle
		};
	};
	
	// Default settings for notifications
	$.notifications.defaults = {
		appendAlerts: true,
		location: 'bottom',
		timeout: 0,
		title: 'Notifications',
		width: '100px',
		usesJQueryUI: false
	};
	
	// jQuery plugin usage
	$.fn.notifications = function (options, field, value) {
		return this.each(function () {
			(new $.notifications($(this), options, field, value));
		});
	};
})(jQuery);