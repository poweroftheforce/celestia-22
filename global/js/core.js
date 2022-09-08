function clog() {
	if ( console ) {
		if ( arguments && arguments.length ) {
			console.log(arguments);
		}
	}
};


(function($) {
var matched, browser;

jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;
	
$.widget('ui.combobox', {
	
	options : {
		callback : null
	},
	
	_create: function() {
		var input,
			that = this,
			wasOpen = false,
			select = this.element.hide(),
			selected = select.children( ':selected' ),
			value = this.options.value != undefined ? this.options.value : selected.val() ? selected.text() : '',
			wrapper = this.wrapper = $( '<span>' )
				.addClass( 'ui-combobox' )
				.insertAfter( select );

		function removeIfInvalid( element ) {
			var value = $( element ).val(),
				matcher = new RegExp('^' + $.ui.autocomplete.escapeRegex( value ) + '$', 'i'),
				valid = false;
			select.children( 'option' ).each(function() {
				if ( $( this ).text().match( matcher ) ) {
					this.selected = valid = true;
					return false;
				}
			});

			if ( !valid ) {
				// remove invalid value, as it didn't match anything
				$( element )
					.val( '' )
					.attr( 'title', value + ' didn\'t match any item' )
				select.val( '' );
				input.data( 'ui-autocomplete' ).term = '';
			}
		}

		input = $('<input/>')
			.appendTo(wrapper)
			.val(value)
			.attr('title', '')
			.addClass('ui-state-default ui-combobox-input')
			.autocomplete({
				appendTo	: wrapper,
				delay		: 0,
				minLength	: 0,
				source		: function( request, response ) {
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), 'i');
					response( select.children( 'option' ).map(function() {
						var text = $( this ).text();
						if ( this.value && ( !request.term || matcher.test(text) ) ) {
							return {
								label: text.replace(
									new RegExp(
										"(?![^&;]+;)(?!<[^<>]*)(" +
										$.ui.autocomplete.escapeRegex(request.term) +
										")(?![^<>]*>)(?![^&;]+;)", 'gi'
									), '<strong>$1</strong>' ),
								value: text,
								option: this
							};
						}
					}));
				},
				select : function( event, ui ) {
					
					if ( that.options.callback != undefined ) {
						that.options.callback.call(that, $(ui.item.option).val() != 'cnone' ? $(ui.item.option).val() : '');
					}
					
					ui.item.option.selected = true;
					that._trigger( 'selected', event, {
						item : ui.item.option
					});
				},
				change : function( event, ui ) {
					if ( !ui.item ) {
						removeIfInvalid( this );
					}
				}
			})
			.keyup(function(e) {
				//if ( e.keyCode == 13 ) {
					if ( that.options.callback != undefined ) {
						that.options.callback.call(that, $(this).val());
					}
				//}
			})
			.addClass('ui-widget ui-widget-content ui-corner-left');

		input.data('ui-autocomplete')._renderItem = function( ul, item ) {
			return $('<li>')
				.append('<a>' + item.label + '</a>')
				.appendTo(ul);
		};

		$('<a/>')
			.attr('tabIndex', -1)
			.appendTo(wrapper)
			.button({
				icons : {
					primary : 'ui-icon-triangle-1-s'
				},
				text : false
			})
			.removeClass('ui-corner-all')
			.addClass('ui-corner-right ui-combobox-toggle')
			.mousedown(function() {
				wasOpen = input.autocomplete('widget').is(':visible');
			})
			.click(function() {
				input.focus();
				
				/* close if already visible */
				if ( wasOpen ) {
					return;
				}

				/* pass empty string as value to search for, displaying all results */
				input.autocomplete( 'search', '' );
			});
	},

	_destroy: function() {
		this.wrapper.remove();
		this.element.show();
	}
});
})(jQuery);

/*
 * Treeview 1.5pre - jQuery plugin to hide and show branches of a tree
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 * http://docs.jquery.com/Plugins/Treeview
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.treeview.js 5759 2008-07-01 07:50:28Z joern.zaefferer $
 *
 */

;(function($) {

	// TODO rewrite as a widget, removing all the extra plugins
	$.extend($.fn, {
		swapClass: function(c1, c2) {
			var c1Elements = this.filter('.' + c1);
			this.filter('.' + c2).removeClass(c2).addClass(c1);
			c1Elements.removeClass(c1).addClass(c2);
			return this;
		},
		replaceClass: function(c1, c2) {
			return this.filter('.' + c1).removeClass(c1).addClass(c2).end();
		},
		hoverClass: function(className) {
			className = className || 'hover';
			return this.hover(function() {
				$(this).addClass(className);
			}, function() {
				$(this).removeClass(className);
			});
		},
		heightToggle: function(animated, callback) {
			animated ?
				this.animate({ height: 'toggle' }, animated, callback) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(':hidden') ? 'show' : 'hide' ]();
					if(callback)
						callback.apply(this, arguments);
				});
		},
		heightHide: function(animated, callback) {
			if (animated) {
				this.animate({ height: 'hide' }, animated, callback);
			} else {
				this.hide();
				if (callback)
					this.each(callback);				
			}
		},
		prepareBranches: function(settings) {
			if (!settings.prerendered) {
				// mark last tree items
				this.filter(':last-child:not(ul)').addClass(CLASSES.last);
				// collapse whole tree, or only those marked as closed, anyway except those marked as open
				this.filter((settings.collapsed ? '' : '.' + CLASSES.closed) + ':not(.' + CLASSES.open + ')').find('>ul').hide();
			}
			// return all items with sublists
			return this.filter(':has(>ul)');
		},
		applyClasses: function(settings, toggler) {
			// TODO use event delegation
			this.filter(':has(>ul):not(:has(>a))').find('>span').unbind('click.treeview').bind('click.treeview', function(event) {
				// don't handle click events on children, eg. checkboxes
				if ( this == event.target )
					toggler.apply($(this).next());
			}).add( $('a', this) ).hoverClass();
			
			if (!settings.prerendered) {
				// handle closed ones first
				this.filter(':has(>ul:hidden)')
						.addClass(CLASSES.expandable)
						.replaceClass(CLASSES.last, CLASSES.lastExpandable);
						
				// handle open ones
				this.not(':has(>ul:hidden)')
						.addClass(CLASSES.collapsable)
						.replaceClass(CLASSES.last, CLASSES.lastCollapsable);
						
	            // create hitarea if not present
				var hitarea = this.find('div.' + CLASSES.hitarea);
				if (!hitarea.length)
					hitarea = this.prepend('<div class="' + CLASSES.hitarea + '"/>').find('div.' + CLASSES.hitarea);
				hitarea.removeClass().addClass(CLASSES.hitarea).each(function() {
					var classes = '';
					$.each($(this).parent().attr('class').split(' '), function() {
						classes += this + '-hitarea ';
					});
					$(this).addClass( classes );
				})
			}
			
			// apply event to hitarea
			this.find('div.' + CLASSES.hitarea).click( toggler );
		},
		treeview: function(settings) {
			
			settings = $.extend({
				cookieId: 'treeview'
			}, settings);
			
			if ( settings.toggle ) {
				var callback = settings.toggle;
				settings.toggle = function() {
					return callback.apply($(this).parent()[0], arguments);
				};
			}
		
			// factory for treecontroller
			function treeController(tree, control) {
				// factory for click handlers
				function handler(filter) {
					return function() {
						// reuse toggle event handler, applying the elements to toggle
						// start searching for all hitareas
						toggler.apply( $('div.' + CLASSES.hitarea, tree).filter(function() {
							// for plain toggle, no filter is provided, otherwise we need to check the parent element
							return filter ? $(this).parent('.' + filter).length : true;
						}) );
						return false;
					};
				}
				// click on first element to collapse tree
				$('a:eq(0)', control).click( handler(CLASSES.collapsable) );
				// click on second to expand tree
				$('a:eq(1)', control).click( handler(CLASSES.expandable) );
				// click on third to toggle tree
				$('a:eq(2)', control).click( handler() ); 
			}
		
			// handle toggle event
			function toggler() {
				$(this)
					.parent()
					// swap classes for hitarea
					.find('>.hitarea')
						.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
						.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
					.end()
					// swap classes for parent li
					.swapClass( CLASSES.collapsable, CLASSES.expandable )
					.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
					// find child lists
					.find( '>ul' )
					// toggle them
					.heightToggle( settings.animated, settings.toggle );
				if ( settings.unique ) {
					$(this).parent()
						.siblings()
						// swap classes for hitarea
						.find('>.hitarea')
							.replaceClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
							.replaceClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
						.end()
						.replaceClass( CLASSES.collapsable, CLASSES.expandable )
						.replaceClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
						.find( '>ul' )
						.heightHide( settings.animated, settings.toggle );
				}
			}
			this.data('toggler', toggler);
			
			function serialize() {
				function binary(arg) {
					return arg ? 1 : 0;
				}
				var data = [];
				branches.each(function(i, e) {
					data[i] = $(e).is(':has(>ul:visible)') ? 1 : 0;
				});
				$.cookie(settings.cookieId, data.join(''), settings.cookieOptions );
			}
			
			function deserialize() {
				var stored = $.cookie(settings.cookieId);
				if ( stored ) {
					var data = stored.split('');
					branches.each(function(i, e) {
						$(e).find('>ul')[ parseInt(data[i]) ? 'show' : 'hide' ]();
					});
				}
			}
			
			// add treeview class to activate styles
			this.addClass('treeview');
			
			// prepare branches and find all tree items with child lists
			var branches = this.find('li').prepareBranches(settings);
			
			switch(settings.persist) {
			case 'cookie':
				var toggleCallback = settings.toggle;
				settings.toggle = function() {
					serialize();
					if (toggleCallback) {
						toggleCallback.apply(this, arguments);
					}
				};
				deserialize();
				break;
			case 'location':
				var current = this.find('a').filter(function() {
					return this.href.toLowerCase() == location.href.toLowerCase();
				});
				if ( current.length ) {
					// TODO update the open/closed classes
					var items = current.addClass('selected').parents('ul, li').add( current.next() ).show();
					if (settings.prerendered) {
						// if prerendered is on, replicate the basic class swapping
						items.filter('li')
							.swapClass( CLASSES.collapsable, CLASSES.expandable )
							.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
							.find('>.hitarea')
								.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
								.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea );
					}
				}
				break;
			}
			
			branches.applyClasses(settings, toggler);
				
			/* if control option is set, create the treecontroller and show it */
			if ( settings.control ) {
				treeController(this, settings.control);
				$(settings.control).show();
			}
			
			return this;
		}
	});
	
	/*
		classes used by the plugin
		need to be styled via external stylesheet, see first example
	*/
	$.treeview = {};
	var CLASSES = ($.treeview.classes = {
		open					: 'open',
		closed					: 'closed',
		expandable				: 'expandable',
		expandableHitarea		: 'expandable-hitarea',
		lastExpandableHitarea	: 'lastExpandable-hitarea',
		collapsable				: 'collapsable',
		collapsableHitarea		: 'collapsable-hitarea',
		lastCollapsableHitarea	: 'lastCollapsable-hitarea',
		lastCollapsable			: 'lastCollapsable',
		lastExpandable			: 'lastExpandable',
		last					: 'last',
		hitarea					: 'hitarea'
	});
	
})(jQuery);

(function($) {
	var CLASSES = $.treeview.classes;
	var proxied = $.fn.treeview;
	
	$.fn.treeview = function(settings) {
		settings = $.extend({}, settings);
		
		if (settings.add) {
			return this.trigger("add", [settings.add]);
		}
		
		if (settings.remove) {
			return this.trigger("remove", [settings.remove]);
		}
		
		return proxied.apply(this, arguments).bind("add", function(event, branches) {
			$(branches).prev()
				.removeClass(CLASSES.last)
				.removeClass(CLASSES.lastCollapsable)
				.removeClass(CLASSES.lastExpandable)
			.find(">.hitarea")
				.removeClass(CLASSES.lastCollapsableHitarea)
				.removeClass(CLASSES.lastExpandableHitarea);
			$(branches).find("li").andSelf().prepareBranches(settings).applyClasses(settings, $(this).data("toggler"));
		}).bind("remove", function(event, branches) {
			var prev = $(branches).prev();
			var parent = $(branches).parent();
			
			$(branches).remove();
			prev.filter(":last-child").addClass(CLASSES.last)
				.filter("." + CLASSES.expandable).replaceClass(CLASSES.last, CLASSES.lastExpandable).end()
				.find(">.hitarea").replaceClass(CLASSES.expandableHitarea, CLASSES.lastExpandableHitarea).end()
				.filter("." + CLASSES.collapsable).replaceClass(CLASSES.last, CLASSES.lastCollapsable).end()
				.find(">.hitarea").replaceClass(CLASSES.collapsableHitarea, CLASSES.lastCollapsableHitarea);
			
			if (parent.is(":not(:has(>))") && parent[0] != this) {
				parent.parent().removeClass(CLASSES.collapsable).removeClass(CLASSES.expandable)
				parent.siblings(".hitarea").andSelf().remove();
			}
		});
	};
	
})(jQuery);

/*
*	Extension of JQuery UI Dialog widget to add custom minimizing capabilities
*	Written by: Ryan Curtis
*
*/
;(function($) {
	var def_options = {
		'minimizable'	: false,
		'maximizable'	: false,
		'closable'		: true
	};
	
	$.extend($.ui.dialog.prototype.options, def_options);
	var _init = $.ui.dialog.prototype._init;
	
	/* Optional top margin for page, wont let a user move a dialog into this spot */
	var topMargin = 0;
	
	/* Custom Dialog Init */
	$.ui.dialog.prototype._init = function() {
		var self = this;
		
		_init.apply(this, arguments);
		uiDialogTitlebar = this.uiDialogTitlebar;
		
		/* we need two variables to preserve the original width and height so that can be restored */
		this.options.originalWidth = this.options.width;
		this.options.originalHeight = this.options.height;
		
		/* save a reference to the resizable handle so we can hide it when necessary */
		this.resizeableHandle =  this.uiDialog.resizable().find('.ui-resizable-se');
		this.buttonPane =  this.uiDialog.find('.ui-dialog-buttonpane');
		this.content =  this.uiDialog.find('.ui-dialog-content');
		
		/* Save the height of the titlebar for the minimize operation */
		this.titlebarHeight = parseInt(uiDialogTitlebar.css('height')) + parseInt(uiDialogTitlebar.css('padding-top')) + parseInt(uiDialogTitlebar.css('padding-bottom')) + parseInt(this.uiDialog.css('padding-top')) + parseInt(this.uiDialog.css('padding-bottom')) ;
		
		if ( self.options.minimizable ) {
			uiDialogTitlebar.append('<a href="#"class="dialog-restore ui-dialog-titlebar-rest"><span class="ui-icon ui-icon-newwin"></span></a>');
			uiDialogTitlebar.append('<a href="#" id="dialog-minimize" class="dialog-minimize ui-dialog-titlebar-min"><span class="ui-icon ui-icon-minusthick"></span></a>');
		}
		
		/* Minimize Button */
		this.uiDialogTitlebarMin = $('.dialog-minimize', uiDialogTitlebar).hover(function(){
			$(this).addClass('ui-state-hover');
		}, function(){
			$(this).removeClass('ui-state-hover');
		}).click(function(){
			self.minimize();
			return false;
		});
		
		/* Restore Button */
		this.uiDialogTitlebarRest = $('.dialog-restore', uiDialogTitlebar).hover(function(){
			$(this).addClass('ui-state-hover');
		}, function(){
			$(this).removeClass('ui-state-hover');
		}).click(function(){
			self.restore();
			self.moveToTop(true);
			return false;
		}).hide();
		
		this.uiDialogTitlebar.dblclick(function() {
			self.restore();
			self.moveToTop(true);
			return false;
		});
		
		/* restore the minimize button on close */
		this.uiDialog.bind('dialogbeforeclose', function(event, ui) {
			self.uiDialogTitlebarRest.hide();
			self.uiDialogTitlebarMin.show();
		});

		/* should this dialog be closable? */
		if ( !self.options.closable ) {
			/* hide the close [X] button for dlg Main Menu */
			this.content.prev().find('.ui-dialog-titlebar-close').css('display', 'none');
			this.content.prev().find('.dialog-minimize, .dialog-restore').css('right', '0.6em');
		}

		
	};
	
	/* Custom Dialog Functions */
	$.extend($.ui.dialog.prototype, {
		restore: function() {
			this.uiDialog.resizable( "option", "disabled", false );
			/* We want to prevent the dialog from expanding off the screen */
			var windowHeight = $(window).height();
			var dialogHeight = this.options.originalHeight;
			var dialogTop = parseInt(this.uiDialog.css('top'));
			if(dialogHeight+dialogTop > windowHeight)
			{
				/* there is 22 pixels of padding at the bottom of a dialog per css file */
				var newTop = windowHeight-dialogHeight-22;
				this.uiDialog.css('top',newTop);
			}			
			var windowWidth = $(window).width();
			var dialogWidth = this.options.originalWidth;
			var dialogLeft = parseInt(this.uiDialog.css('left'));
			if(dialogWidth+dialogLeft > windowWidth)
			{
				/* there are 2 pixels of padding per css */
				var newLeft = windowWidth-dialogWidth-2;
				this.uiDialog.css('left',newLeft);
			}
			//this.uiDialog.css({width: this.options.originalWidth, height:this.options.originalHeight});
			this.uiDialog.css({height:this.options.originalHeight});
			this.element.show();
			
			this.resizeableHandle.show();
			this.uiDialogTitlebarRest.hide();
			this.uiDialogTitlebarMin.show();
		},
		minimize: function() { 
			/* Store the original height/width */
			this.uiDialog.resizable( "option", "disabled", true );
			this.options.originalWidth = this.options.width;
			this.options.originalHeight = this.options.height;
			
			//this.uiDialog.animate({width: 200, height:this.titlebarHeight},200);
			this.uiDialog.animate({height:this.titlebarHeight},200);
			this.element.hide();
			
			this.uiDialogTitlebarMin.hide();
			this.uiDialogTitlebarRest.show();
			this.resizeableHandle.hide();
		}
	});
})(jQuery);

/**@preserve jPaq - A fully customizable JavaScript/JScript library
 * http://jpaq.org/
 *
 * Copyright (c) 2011 Christopher West
 * Licensed under the MIT license.
 * http://jpaq.org/license/
 *
 * Version: 1.0.6.1008
 * Revised: April 6, 2011
 */
(function() {
/* The object used to retrieve private data. */
var jPaqKey = {};

/* The function responsible for making private data accessible to internal functions. */
function _(obj, privateData) {
	obj._ = function(aKey) {
		if(jPaqKey === aKey)
			return privateData;
	};
}
jPaq = {
	toString : function() {
		/// <summary>
		///   Get a brief description of this library.
		/// </summary>
		/// <returns type="String">
		///   Returns a brief description of this library.
		/// </returns>
		return "jPaq - A fully customizable JavaScript/JScript library created by Christopher West.";
	}
};
// A class to represent a color.
(Color = function(rValue, gValue, bValue) {
	/// <summary>Creates mutable 24-bit color object.</summary>
	/// <param name="rValue" type="Object" optional="true">
	///   Optional.  This may either be a number or a string.  If this is a string
	///   it must be a three or six digit hexadecimal code, or a CSS
	///   representation of a RGB parameters.  If this is a string and the
	///   "gValue" or "bValue" parameters are set, this parameter will default to
	///   0.  If this is a number, it must be an integer representing how much red
	///   will be in the color.  If this is a number, it must be greater than or
	///   equal to zero and less than or equal to 255.  Otherwise, this value will
	///   default to 0.
	/// </param>
	/// <param name="gValue" type="Number" optional="true">
	///   Optional.  The amount of green that will compose the color.  This value
	///   must be an integer greater than or equal to 0 and less than or equal to
	///   255.  If omitted, this value will be inferred from the "rValue".
	///   value.
	/// </param>
	/// <param name="bValue" type="Number" optional="true">
	///   Optional.  The amount of blue that will compose the color.  This value
	///   must be an integer greater than or equal to 0 and less than or equal to
	///   255.  If omitted, this value will be inferred from "rValue".
	/// </param>
	// Initialize the color.
	_(this, {r : 0, g : 0, b : 0});
	this.setTo.apply(this, arguments);
}).prototype = {
	setTo : function(rValue, gValue, bValue) {
		/// <summary>Creates mutable 24-bit color object.</summary>
		/// <param name="rValue" type="Object" optional="true">
		///   Optional.  This may either be a number or a string.  If this is a
		///   string, it must be a three or six digit hexadecimal code, or a CSS
		///   representation of a RGB parameters.  If this is a string and the
		///   "gValue" or "bValue" parameters are set, this parameter will default
		///   to 0. If this is a number, it must be an integer representing how much
		///   red will be in the color.  If this is a number, it must be greater
		///   than or equal to zero and less than or equal to 255.  Otherwise, this
		///   value will default to 0.
		/// </param>
		/// <param name="gValue" type="Number" optional="true">
		///   Optional.  The amount of green that will compose the color.  This
		///   value must be an integer greater than or equal to 0 and less than or
		///   equal to 255.  If omitted, this value will be inferred from "rValue".
		/// </param>
		/// <param name="bValue" type="Number" optional="true">
		///   Optional.  The amount of blue that will compose the color.  This value
		///   must be an integer greater than or equal to 0 and less than or equal
		///   to 255.  If omitted, this value will be inferred from "rValue".
		/// </param>
		var me = this;
		if(arguments.length == 1) {
			var m = /^#?(([\dA-F]{3}){1,2})$/i.exec(rValue + "");
			if(m) {
				var hexCode = m[1];
				if(hexCode.length == 3)
					hexCode = hexCode.replace(/(.)/g, "$1$1");
				me.r(parseInt(hexCode.substring(0, 2), 16))
					.g(parseInt(hexCode.substring(2, 4), 16))
					.b(parseInt(hexCode.substring(4, 6), 16));
			}
			else if(m = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(rValue + ""))
				me.r(m[1]).g(m[2]).b(m[3]);
			else
				me.r(rValue);
		}
		else
			me.r(rValue).g(gValue).b(bValue);
		return me;
	},
	getHexCode : function() {
		/// <summary>
		///   Gives the six digit hexadecimal code for the color that this object
		///   represents.
		/// </summary>
		/// <returns type="String">
		///   Returns the six digit hexadecimal code for the color that this object
		///   represents.  This string will start with the "#" characters.
		/// </returns>
		return "#" + [
			this.r().toString(16),
			this.g().toString(16),
			this.b().toString(16)
		].join(",").replace(/\b(\w)\b/gi, "0$1").toUpperCase().replace(/,/g, "");
	},
	combine : function(secondColor, strength) {
		/// <summary>Merges this color the the specified color.</summary>
		/// <param name="secondColor" type="Color">
		///   The color that will be merged or combined with this one.
		/// </param>
		/// <param name="strength" type="Number" optional="true">
		///   Optional.  A number inclusively ranging from 0 to 100 which represents
		///   how much of "secondColor" will appear in the new color.  If this is
		///   omitted, this will default to 50.
		/// </param>
		/// <returns type="Color">
		///   Returns a new color object which represents the merging of this color
		///   with "secondColor".
		/// </returns>
		if(isNaN(strength = +strength))
			strength = 50;
		var percent2 = Math.max(Math.min(strength, 100), 0) / 100;
		var percent1 = 1 - percent2;
		return new Color((this.r() * percent1 + secondColor.r() * percent2),
			this.g() * percent1 + secondColor.g() * percent2,
			this.b() * percent1 + secondColor.b() * percent2);
	},
	/* Returns a color that can be displayed well on the specified color */
	getSafeColor : function() {
		/// <summary>
		///   Produces a new color object representing black or white.  If this
		///   color is closer to white, black will be returned.  If this color is
		///   closer to black, white will be returned.
		/// </summary>
		/// <returns type="Color">
		///   Returns a new color object which represents black or white.
		/// </returns>
		var i = this.getLuminance() < 128 ? 255 : 0;
		return new Color(i, i, i);
	},
	getLuminance : function() {
		/// <summary>Gets the luminance of the color.</summary>
		/// <returns type="Number">
		///   Returns a number inclusively ranging from 0 to 255 which represents
		///   the luminance of the color.
		/// </returns>
		with(this){return .299 * r() + .587 * g() + .114 * b();}
	},
	/* Gets an approximation of the grayscale version of the color */
	toGrayscale : function() {
		/// <summary>
		///   Gets an approximation of the grayscale version of the color.
		/// </summary>
		/// <returns type="Color">
		///   Returns an approximation of the grayscale version of this color as a
		///   new color object.
		/// </returns>
		var i = Math.round(this.getLuminance());
		return new Color(i, i, i);
	},
	/* Gets the opposite color */
	getOpposite : function() {
		/// <summary>Gets the opposite color.</summary>
		/// <returns type="Color">
		///   Returns a new color object that represents the opposite of this color.
		/// </returns>
		with(this){return new Color(255 - r(), 255 - g(), 255 - b());}
	},
	/* Gives the user the ability to get a lighter version of a color */
	getLighter : function(strength) {
		/// <summary>
		///   Gets a lighter version of this color by mixing it with white.
		/// </summary>
		/// <param name="strength" type="Number" optional="true">
		///   Optional.  A number inclusively ranging from 0 to 100 which represents
		///   how much white will appear in the new color.  If this is omitted, this
		///   will default to 30.
		/// </param>
		/// <returns type="Color">
		///   Returns a lighter version of this color as a new color object.
		/// </returns>
		return this.combine(white, strength != null ? strength >>> 0 : 30);
	},
	/* Gives the user the ability to get a darker version of a color */
	getDarker : function(strength) {
		/// <summary>
		///   Gets a darker version of this color by mixing it with white.
		/// </summary>
		/// <param name="strength" type="Number" optional="true">
		///   Optional.  A number inclusively ranging from 0 to 100 which represents
		///   how much black will appear in the new color.  If this is omitted, this
		///   will default to 30.
		/// </param>
		/// <returns type="Color">
		///   Returns a darker version of this color as a new color object.
		/// </returns>
		return this.combine(black, strength != null ? strength >>> 0 : 30);
	}
};
/* Create the jQuery-like getter/setter functions for the RGB values */
for(var arr = ["r","g","b"], i = 0; i < 3; i++) {
	(function(name) {
		Color.prototype[name] = function(value) {
			var privateData = this._(jPaqKey);
			if(!arguments.length)
				return privateData[name];
			privateData[name] = Math.min(Math.max(value >>> 0, 0), 255);
			return this;
		};
	})(arr[i]);
}
/* Shortcuts for black and white */
var black = new Color(), white = new Color(255, 255, 255);
// Gives the user the ability to see the color in the form of a string.
// This is an alias for getHexCode().
Color.prototype.toString = Color.prototype.getHexCode;
Color.random = function(r, g, b) {
	/// <summary>
	///   Produces a random color based on the specified criteria.  Each of the
	///   parameters may be a number or an array of numbers.  To specify a
	///   specific value, the numeric value must be in an array by itself.  To
	///   specify a range, the values must be given in an array where the first
	///   element is the minimum value and the second element is the maximum
	///   value.  To produce an independently random value, 0 or null should be
	///   specified.  To produce a random value that must be greater than one or
	///   both of the other two non-zero parameters, you must enter a larger
	///   number.  To produce a random value that is smaller than one or both of
	///   the other two non-zero parameters, you must enter a smaller number.
	/// </summary>
	/// <param name="r" type="Object" optional="true">
	///   Optional.  Used to specify the amount of red that may appear in the
	///   color.
	/// </param>
	/// <param name="g" type="Object" optional="true">
	///   Optional.  Used to specify the amount of green that may appear in the
	///   color.
	/// </param>
	/// <param name="b" type="Object" optional="true">
	///   Optional.  Used to specify the amount of blue that may appear in the
	///   color.
	/// </param>
	/// <returns type="Color">
	///   A color object based on the specified parameters.
	/// </returns>
	for(var c = [[r || 0, 0], [g || 0, 1], [b || 0, 2]].sort(function(a, b) {
		return a[0] <= b[0] ? a[0] < b[0] ? -1 : 0 : 1;
	}), ret = [], lastIndex, lastVal, i = 0; i < 3; i++) {
		if(c[i][0] instanceof Array)
			ret[c[i][1]] = c[i][0].length == 1
				? c[i][0][0]
				: Math.randomIn.apply(null, c[i][0]);
		else {
			if(c[i][0] != lastIndex || lastIndex == 0)
				lastVal = Math.round(Math.randomIn(lastIndex > 0 ? lastVal : 0, 255));
			lastIndex = c[i][0];
			ret[c[i][1]] = lastVal;
		}
	}
	return new Color(ret[0], ret[1], ret[2]);
};
Math.randomIn = function(min, max) {
	/// <summary>Generates a random number.</summary>
	/// <param name="min" type="Number" optional="true">
	///   Optional.  The minimum number that can be returned.  The default value
	///   is zero.
	/// </param>
	/// <param name="max" type="Number" optional="true">
	///   Optional.  The returned random number will always be less than this
	///   number.  The default value is one.
	/// </param>
	/// <returns type="Number">
	///   Returns a number that is greater than or equal to "min" and less than
	///   "max".
	/// </returns>
	min = min == null ? 0 : min;
	return Math.random() * ((max == null ? 1 : max) - min) + min;
};
})();

/* jQuery.cookie() */
;(function($){$.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1}var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000))}else{date=options.expires}expires='; expires='+date.toUTCString()}var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('')}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};})(jQuery);

/* jQuery.fn.rgb2Hex() */
;(function($){$.fn.rgb2Hex=function(rgb_string){rgb_string=rgb_string.replace(/\s/g,'');var rgb={};var comma1=rgb_string.indexOf(',');var comma2=rgb_string.lastIndexOf(',');rgb.r=parseInt(rgb_string.substring(rgb_string.indexOf('(')+1,comma1),10);rgb.g=parseInt(rgb_string.substring(comma1+1,comma2),10);rgb.b=parseInt(rgb_string.substring(comma2+1,rgb_string.indexOf(')')),10);var hex=[rgb.r.toString(16),rgb.g.toString(16),rgb.b.toString(16)];$.each(hex,function(nr,val){if(val.length==1){hex[nr]='0'+val}});return hex.join('')};})(jQuery);

;(function($) {$.fn.hasAttr = function(name) {return this.attr(name) !== undefined; };})(jQuery);

/**
 * jQuery.ScrollTo - Easy element scrolling using jQuery.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 */
;(function(d){var k=d.scrollTo=function(a,i,e){d(window).scrollTo(a,i,e)};k.defaults={axis:'xy',duration:parseFloat(d.fn.jquery)>=1.3?0:1};k.window=function(a){return d(window)._scrollable()};d.fn._scrollable=function(){return this.map(function(){var a=this,i=!a.nodeName||d.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!i)return a;var e=(a.contentWindow||a).document||a.ownerDocument||a;return d.browser.safari||e.compatMode=='BackCompat'?e.body:e.documentElement})};d.fn.scrollTo=function(n,j,b){if(typeof j=='object'){b=j;j=0}if(typeof b=='function')b={onAfter:b};if(n=='max')n=9e9;b=d.extend({},k.defaults,b);j=j||b.speed||b.duration;b.queue=b.queue&&b.axis.length>1;if(b.queue)j/=2;b.offset=p(b.offset);b.over=p(b.over);return this._scrollable().each(function(){var q=this,r=d(q),f=n,s,g={},u=r.is('html,body');switch(typeof f){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)){f=p(f);break}f=d(f,this);case'object':if(f.is||f.style)s=(f=d(f)).offset()}d.each(b.axis.split(''),function(a,i){var e=i=='x'?'Left':'Top',h=e.toLowerCase(),c='scroll'+e,l=q[c],m=k.max(q,i);if(s){g[c]=s[h]+(u?0:l-r.offset()[h]);if(b.margin){g[c]-=parseInt(f.css('margin'+e))||0;g[c]-=parseInt(f.css('border'+e+'Width'))||0}g[c]+=b.offset[h]||0;if(b.over[h])g[c]+=f[i=='x'?'width':'height']()*b.over[h]}else{var o=f[h];g[c]=o.slice&&o.slice(-1)=='%'?parseFloat(o)/100*m:o}if(/^\d+$/.test(g[c]))g[c]=g[c]<=0?0:Math.min(g[c],m);if(!a&&b.queue){if(l!=g[c])t(b.onAfterFirst);delete g[c]}});t(b.onAfter);function t(a){r.animate(g,j,b.easing,a&&function(){a.call(this,n,b)})}}).end()};k.max=function(a,i){var e=i=='x'?'Width':'Height',h='scroll'+e;if(!d(a).is('html,body'))return a[h]-d(a)[e.toLowerCase()]();var c='client'+e,l=a.ownerDocument.documentElement,m=a.ownerDocument.body;return Math.max(l[h],m[h])-Math.min(l[c],m[c])};function p(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

/* jQuery.moveToTop */
(function(e){e.moveToTop=function(t){function i(e,t){return e-t}var n={},t=e.extend(n,t),r=1;var s=document.getElementsByTagName("*");var o=[];o[0]=0;for(var u=0;u<s.length;u++){if(s[u].nodeType==1){if(document.all){if(s[u].currentStyle){mzI=s[u].currentStyle["zIndex"];if(!isNaN(mzI)){o.push(mzI)}}else if(window.getComputedStyle){mzI=document.defaultView.getComputedStyle(s[u],null).getPropertyValue("zIndex");if(!isNaN(mzI)){o.push(mzI)}}}else{if(s[u].currentStyle){mzI=s[u].currentStyle["z-index"];if(!isNaN(mzI)){o.push(mzI)}}else if(window.getComputedStyle){mzI=document.defaultView.getComputedStyle(s[u],null).getPropertyValue("z-index");if(!isNaN(mzI)){o.push(mzI)}}}}}o=o.sort(i);r=parseInt(o[o.length-1]);if(r==0){r=100}return r}})(jQuery)

;(function($) {
$.ctrl = function(key, callback, args) {
    $(document).keydown(function(e) {
        if(!args) args=[]; // IE barks when args is null 
        if(e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
            callback.apply(this, args);
            return false;
        }
    });
};
})(jQuery);

;(function($) {
$.console = function( options ) {  

	var options = $.extend({
		height			: '250'
	}, options);
	
	/* console (wrap) */
	var console = $('<div class="console-wrap"/>')
			.css({
				height		: options.height + 'px',
				position	: 'absolute',
				width		: '100%'
			})
			.appendTo(document.body),
		
		/* body */
		bd = $('<div class="bd"/>')
			.appendTo(console),
		
		/* log (window) */
		log = $('<div class="log"/>')
			.css({
				'height'		: options.height + 'px',
				'overflow-y'	: 'scroll'
			})
			.appendTo(bd);
	
	$(options.wrap).height(options.height);
	
	function update() {
		console.css({
			top : $(window).scrollTop() + (($(window).height() - 3) - console.height()) + 'px'
		});
	};
	
	$(window).bind('resize scroll', function () {
		update();
	});
	
	console.resizable({
		helper	: 'ui-resizable-helper',
		handles	: 'n',
		resize : function( e, ui ) {
			update();
		},
		stop : function( e, ui ) {
			var height = $(ui.element).height();
			$(log).css({
				height : height + 'px'
			});
			update();
		}
	});
	
	/* by default, the console is hidden so use CTRL+d to toggle show/hide */
	$.ctrl('D', function() {
		$('.console-wrap').toggle();
		return false;
	});
	
	update();
	
	
	/* public methods */
	var _console = {
		
		console	: console,
		
		log : function() {
			window.console.log(arguments);
			return;

			var str = '';
			$.each(arguments, function(i, arg) {
				$.each(arg, function(i, msg) {
					str += msg;
				});
			});
			$("#myDiv").animate({ scrollTop: $("#myDiv").attr("scrollHeight") }, 3000);
			var line = $('<p/>')
				.html(str)
				.appendTo($(log));
			
			/* have the log (window) scroll to the last line that was appended */
			//$(log).animate({
			//		scrollTop : $(log).prop('scrollHeight')
			//	}, 3000).stop();
			$(log).prop('scrollTop', $(log).prop('scrollHeight'));
			return line;
		},
		
		warn : function() {
			var p = _console.log(arguments);
			return $(p).addClass('warn').prepend('<img src="../console/images/ico-warn.png"/>\t');
		},
		
		error : function() {
			var p = _console.log(arguments);
			return $(p).addClass('error').prepend('<img src="../console/images/ico-error.png"/>\t');
		},
		
		info : function() {
			var p = _console.log(arguments);
			return $(p).addClass('info').prepend('<img src="../console/images/ico-info.png"/>\t');
		},
		
		clean : function() {
			var p = _console.log(arguments);
			return $(p).addClass('clean').prepend('<img src="../console/images/ico-clean.png"/>\t');
		},
		
		clear : function() {
			$(log).html('');
		}
	};
	
	return _console;
};
})(jQuery);

;(function($) {
$.fn.contextMenu = function(options) {
    var defaults = {
	    query			: '#context-menu',
    	opacity			: 1.0,
		help_section	: 'main-menu',
		module			: null
	};
	var options = $.extend(defaults, options);
	
	$(this).bind('contextmenu', function(e) {
		/* show the context menu */
		$(options.query)
			.data('help_section', options.help_section)
			.css({
				display		: 'block',
				top			: e.pageY + 'px',
				left		: e.pageX + 'px',
				position	: 'absolute',
				opacity		: options.opacity,
				zIndex		: $.moveToTop() + 1
			});
		if ( options.module ) {
			$('#context-menu .module-button').show();
			Celestia.module.current = options.module;
		}
		return false;
	});
};
})(jQuery);

(function( window, undefined ) {

/* # # # # # # # # # # # # # # # # # # # # # # Celestia # # # # # # # # # # # # # # # # # # # # # # */

if ( window.Celestia ) {
	return;
}
window.Celestia = {
	/* returns a timestamp of [example]: 'Sun Jan 01 2012 - 12:00:00'*/
	getTimeStamp	: function() {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var d = new Date();
		var DD = ( d.getDate().toString().length == 1 ? '0' + d.getDate() : d.getDate() ),
			HH = ( d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours() ),
			MM = ( d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes() ),
			SS = ( d.getSeconds().toString().length == 1 ? '0' + d.getSeconds() : d.getSeconds() );
		return days[d.getDay()] + ' '  + months[d.getMonth()] + ' '  + DD + ' '  + d.getFullYear() + '-' + HH + '-' + MM + '-' + SS;
	}
};

$.extend(Celestia, {
	
	error			: {
		api		: 'There was an error with an api call.'
	},
	
	api_path		: '../global/inc/api.php',
	
	time_stamp		: Celestia.getTimeStamp(),
	session			: $.cookie('celestia_session') || null,
	
	api : function( data, error, callback ) {
		$.ajax({
			type		: 'post',
			url			: Celestia.api_path,
			dataType	: 'html',
			data		: data,
			success		: function( data ) {
				callback.call(this, data);
			},
			error: function() {
				if ( Celestia.console ) {
					Celestia.console.error(error);
				} else {
					clog(error);
				}
			}
		});
	},
	
	stripTimeStamp : function( str ) {
		return str.indexOf('-@') != -1 ? str.substring(0, str.indexOf('-@')) : str;
	},
	
/********************/	
/* MISC COMMON LIBS */
/********************/

	isArray : function( obj ) {
		return obj && !(obj.propertyIsEnumerable('length')) && typeof obj === 'object' && typeof obj.length === 'number';
	},
	
	pastel : function() {
		var r = (Math.round(Math.random()* 127) + 127).toString(16);
		var g = (Math.round(Math.random()* 127) + 127).toString(16);
		var b = (Math.round(Math.random()* 127) + 127).toString(16);
		return '#' + r + g + b;
	},
	
	genHex : function() {
		var d = [];
		var color = '';
		c = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
		for ( i=0; i<6; i++ ) { d[i] = c[Math.round(Math.random() * 14)]; color = color + d[i]; }
		return '#' + color;
	},
	
	calcTextWidth : function( str, el ) {
		var h = 0, w = 0;
		var div = $('#text-width-wrap');
		$(div).html(str);
		var styles = ['font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing'];
		$(styles).each(function() {
			var s = this.toString();
			$(div).css(s, $(el).css(s));
		});
		h = $(div).outerHeight();
		w = $(div).outerWidth();
		return {
			height	: h,
			width	: w
		};
	},
	
	trim : function( str ) {
		s = str.replace(/(^\s*)|(\s*$)/gi, '');
		s = s.replace(/[ ]{2,}/gi, ' ');
		s = s.replace(/\n /, '\n');
		return s;
	},
	
	findPos : function( obj ) {
		var cl = ct = 0;
		if (obj.offsetParent) {
			cl = obj.offsetLeft;
			ct = obj.offsetTop;
			while (obj = obj.offsetParent) { cl += obj.offsetLeft; ct += obj.offsetTop; }
		}
		return [cl, ct];
	}
	
});

if ( !window.C ) {
	window.C = window.Celestia;
}

})(window);

/* END Celestia Core */


(function($) {
$.fn.json2HTML = function( obj ) {
    var defaults = {};
    var options = $.extend(defaults, options);
    return this.each(function(i) {
        var previousElement = this;
        function json2HTML( obj ) {
            for ( var i=0; i<obj.length; i++ ) {
                for ( prop in obj[i] ) {
		            var c = prop.indexOf('if') != -1 ? 'if' : prop;
                    switch ( c ) {
                        case 'eval': { eval(obj[i][prop]); break; }
                        case 'nodeName': {
                            var node = document.createElement(obj[i][prop]);
                            if ( obj[i][prop] != 'input' ) {
                                $(previousElement).append(node);
			                }
                            break;
                        }
                        case 'append': {
                            previousElement = node;
                            json2HTML(obj[i][prop]);
                            break;
                        }
                        case 'extend': {
                            var props = obj[i][prop];
                            for ( var x=0; x<props.length; x++ )
                                for ( y in props[x] )
                                    $.data(node, y, props[x][y]);
                            break;
                        }
                        case 'props': {
							$.each(obj[i][prop], function(p, v) {
								alert(p+":"+v);
								$(node)
							});
                            break;
                        }
                        case 'id': { $(node).attr('id', obj[i][prop]); break; }
                        case 'statement':
						case 'statements': {
							obj[i][prop].call(this, node);
							break;
						}
						case 'for': { break;}
                        case 'href': { $(node).attr('href', obj[i][prop]); break; }
                        case 'return': { return eval(obj[i][prop]); break; }
                        case 'addClass':
                        case 'val':
                        case 'text':
                        case 'html':
                        case 'attr':
                        case 'css': {
                            $(node)[prop](obj[i][prop]);
                            /*
                                Special case for input nodes, because the 'type' attrribute cannot
                                be changed after the input has been created
                            */
                            if ( prop == 'attr' ) {
								for (e_attr in obj[i][prop] ) {
									if ( e_attr == 'type' ) {
										$(previousElement).append(node);
									}
								}
							}
                            break;
                        }
                        case 'color': {
                            $(node).css('color', obj[i][prop]);
                            break;
                        }
                        /* default - click, mouseover, my_plugin */
                        default: {
			                $(node)[prop](obj[i][prop]);
			                break;
			            }
                    }
                }
                /*
                    this append will occur if the append: [property] is not used
                    and all of the props have been gone through
                */
            }
            if ( node )
                previousElement = node.parentNode.parentNode;
        };
        json2HTML(obj);
    });
};

$.extend(Celestia, {
	
	name	: 'Celestia Content Cleanser',
	version	: '1.0',
	
	error	: {
		loadValidations			: 'Error while loading validations: ',
		confirm					: 'Error with Dlg Confirmation (either prompt or confirm was missing)'
	},
	
	console			: null,
	
	site			: '',
	notifications	: [],
	tagged			: [],
	taggedClass		: 'tagged',
	
	loadValidations : function( callback ) {
		if ( Celestia.site ) {
			$.ajax({
				url			: '../sites/' + Celestia.site + '/const/validations.js',
				dataType	: 'text',
				success		: function( config ) {
					var config = eval('(' + config + ')') || null;
					
					if ( config ) {
						$.extend(Celestia, config);
						/* load any plugins for [site] */
						if ( Celestia.setupValidations ) {
							Celestia.setupValidations.call(this);
						}
						callback.call(this, config);
					}
				},
				error		: function( hxr, status, err ) {
					Celestia.console.error(Celestia.error['loadValidations'], [hxr, status, err]);
				}
			});
		}
	},
	
	validate : function( site ) {
		/* clear the log */
		Celestia.console.clear();
		
		if ( !site || site == undefined || site == '' ) {
			Celestia.info('No site was selected. Running universal process only.');
			var str = Celestia.cleanse(Celestia.sourceEditor.getValue(), false);
		} else {
			Celestia.site = site;
			/* load the site as promised and do some validating! */
			Celestia.loadValidations(function() {
				/* first run a string test */
				Celestia.cleanse(Celestia.sourceEditor.getValue(), true);
				/* we're done at this point, we can show a splash screen or something */
				Celestia.console.clean('Celestia Content Cleanser finished.');
			});
		}
	},
	
	cleanse : function( str, hasClient ) {
		
		var hasClient = hasClient != undefined ? hasClient : false;
		
		if ( !str || str == undefined || str == '' ) {
			alert('Input not found, exiting.');
			return false;
		}
		
		if ( hasClient ) {
			/* now that we've cleaned the html as a string, let's allow [site] to do some string cleaning/checking */
			if ( Celestia.cleanHTML ) {
				str = Celestia.cleanHTML.call(this, str);
			}
			
			/* once all of the string checks are complete we will allow the client [site] to any DOM manipulation */
			if ( Celestia.cleanDOM ) {
				$('#inject-wrap').html(Celestia.dirtyTags(str));
				Celestia.cleanDOM.call(this, str) || str;
			}
		}
		
		/* collect our string again */
		var str = $('#inject-wrap').children().length > 0
					? $('#inject-wrap').html()
					: str;
					
		
		/* clear the injection wrapper */
		$('#inject-wrap').html('');
		
		/* before we do anything we need to change all iframe tags to something else (do as little manipulations like these as possible) */
		//str = str.replace(/<iframe/g, '<c_iframe').replace(/<\/iframe/g, '</c_iframe');
				
		/*
			WE WANT TO DO AS MUCH WITH STRINGS AS POSSIBLE as it's faster
			the only down side is that for right now, we will be logging which is dom manip
			I don't really see a need to do any dom manipulation with Celestia right now,
			We'll just leave that up to the site


			initial clean up goes here
			--------------------------
			example:
				replace(/class="(.+)(\s+?)"/g, 'class="$1"')
				
			Trim leading and trailing spaces within an attribue (remember this is a full string of html)
			so what we are trimmg would be a possible portion of something like the following:
				'<div id="my-div"><p class="class-a  ">Hello World!</p></div>'
				or
				'<div id="my-div"><p class="   class-a  ">Hello World!</p></div>'
			so normal trim[l, s] won't work because the string starts and ends => '<div... .../div>'
			
			what we're doing here is taking the entire string and getting an array of matches
			(matches = [ATTR=".*"] - any attriibute along with the equal sign, quotes and possible value).
			After that we do an each on that array and trim leading and trailing spaces (if any) for said attribute
		*/
		if ( str.match(/\w+\s*=\s*"[^"]*"/g) ) {
			$.each(str.match(/\w+\s*=\s*"[^"]*"/g), function(i, e) {
				var trim = Celestia.trimAttrs(e);
				if ( e != trim.val ) {
					Celestia.console.error('Found attribute with leading/trailing spaces [' + e + '], removing spaces.');
				}
				str = str.replace(e, trim.val)
			});
		}
		if ( str.match(/\.html%20/g) ) {
			str = str.replace(/\.html%20/g, '.html');
			Celestia.console.log('Found anchors with href=".*[.html%20]", stripping %20.');
		}
		
		/* After we are satified with our cleanup, let's point out some human error (or machine error) - as best we can */
		
		var invalid_chars = {
			'’'				: '\'',
			'‘'				: '\'',
			'´'				: '\'',
			'“'				: '"',
			'”'				: '"',
			'…'				: '&hellip;',
			'—'				: '&mdash;',
			'–'				: '&mdash;'
		};
		
		$.each(invalid_chars, function(p, v) {
			if ( str.indexOf(p) != -1 ) {
				var occ = str.split(p).length - 1,
					r = new RegExp(p, 'g');
				str = str.replace(r, v);
				Celestia.console.error('Replacing invalid characters: ' + p + ' - ' + occ + ' occurances found');
			}
		});
		
		var checks = {
			'href=""'	: 'Empty anchors (href="")',
			'href="#"'	: 'Anchors referencing hash marks (href="#")'
		};
		
		$.each(checks, function(p, v) {
			var occ = str.split(p).length - 1;
			if ( occ > 0 ) {
				Celestia.console.warn(v + ': ' + occ + ' occurances found');
				return true;
			}
		});
		
		var emptyAttr = {
			'class=""'	: 'Empty class name attribute(s) found',
			'title=""'	: 'Empty title attribute(s) found',
			'alt=""'	: 'Empty alt attribute(s) found',
			'target=""'	: 'Empty target attribute(s) found'
		};
		
		$.each(emptyAttr, function(p, v) {
			var occ = str.split(p).length - 1;
			if ( occ > 0 ) {
				var re = new RegExp(' ' + p, 'g');
				if ( $('#chk-clean-attr').attr('checked') ) {
					str = str.replace(re, '');
					Celestia.console.log(v + ': ' + occ + ' occurances found');
				} else {
					Celestia.console.warn(v + ': ' + occ + ' occurances found');
				}
			}
		});
		
		/* render our fixes to the user */
		$('#txt-set-source').val(Celestia.cleanTags(str));
		
		Celestia.new_package = false;
		Celestia.setting_source = true;
		Celestia.franchise_name = $('#txt-set-source-franchise-name').val() != '' ? $('#txt-set-source-franchise-name').val() : ''; //New Franchise @' + Celestia.time_stamp;
		Celestia.package_name = $('#txt-set-source-package-name').val() != '' ? $('#txt-set-source-package-name').val() : 'New Package @' + Celestia.time_stamp;
		if ( Celestia.site != '' ) {
			Celestia.getConfig(Celestia.site, function() {
				Celestia.prepareSource(true);
				Celestia.setSession();
			});
		}
		return str;
	},
	
	dirtyTags: function( str ) {
		return str ? str.replace(/<script/g, '<cscript')
						.replace(/<\/script/g, '</cscript')
						.replace(/<iframe/g, '<ciframe')
						.replace(/<\/iframe/g, '</ciframe')
					: '';
	},
	
	cleanTags: function( str ) {
		return str ? str.replace(/<cscript/g, '<script')
						.replace(/<\/cscript/g, '</script')
						.replace(/<ciframe/g, '<iframe')
						.replace(/<\/ciframe/g, '</iframe')
						.replace(/clt|&lt;/g, '<')
						.replace(/cgt|&gt;/g, '>')
					: '';
	},
	
	trimAttrs : function( str ) {
		var strs = str.split('"', 3);
		return {
			val		: strs[0] + '"' + strs[1].replace(/^\s+|\s+$/g, '') + '"' + strs[2],
			attr	: strs[0].substring(0, strs[0].length - 1)
		};
	}
	
});

})(jQuery);


/* HTML5 File Drop */
(function($) {

function fileSelectHandler( e, callback ) {
	e.stopPropagation();
	e.preventDefault();
	/* FileList object. */
	var files = e.dataTransfer.files;
	/* files is a FileList of File objects. List some properties. */
	var output = [];
	for ( var i = 0, f; f = files[i]; i++ ) {
		if ( !f.type.match('text/html.*') ) {
			continue;
		}
		output.push(
			'<li><strong>',
			escape(f.name),
			'</strong> (', f.type || 'n/a', ') - ',
			f.size,
			' bytes, last modified: ',
			f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
			'</li>'
		);
	}
	callback.call(this, output);
};

function clickHandler(e, callback) {
	e.stopPropagation();
	e.preventDefault();
	callback.call(this);
};

function dragOverHandler(e, callback) {
	e.stopPropagation();
	e.preventDefault();
	/* Explicitly show this is a copy. */
	e.dataTransfer.dropEffect = 'copy';
	callback.call(this);
}

$.fn.fileDrop = function( options ) {  
	var options = $.extend({
		click : null,
		drop : null,
		over : null
	}, options);
	return this.each(function() {
		
		var el = this;
		el.addEventListener('click', function(e) {
			clickHandler(e, function() {
				if ( options.click ) {
					options.click.call(this);
				}
			});
		}, false);
		
		el.addEventListener('drop', function(e) {
			fileSelectHandler(e, function(output) {
				if ( options.drop ) {
					options.drop.call(this, el, output);
				}
			});
		}, false);
		
		el.addEventListener('dragover', function(e) {
			dragOverHandler(e, function() {
				if ( options.over ) {
					options.over.call(this);
				}
			});
		}, false);
	});
};

})(jQuery);