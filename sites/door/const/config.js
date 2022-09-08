{
	site				: 'door',
	short_name			: 'sni',
	site_wrapper		: '#article',
	icon_md				: '../sites/door/images/door-logo-md.jpg',
	script_word			: 'cscript',
	wells				: ['bd', 'w', 'ww', 'we', 'e'],
	module_re			: {
		current: /{module}|\{m}/g
	},
	source_input		: function( html ) {
		return html;
	},
	
	modules : [
		/* banner */
		/* w rail */
			'intro',
			'pkg-lead-single',
			'sponsor-area-1',
			'fd-search-wrap',
		/* we rail */
			'related-link',
		/* ww rail */
			'related-topics',
		/* e rail */
			'hp_gutter_box'
	],
	
	fixRawSource : function( html ) {
		return html;
	},
	
	loadPlugins : function() {
		/* you can pretty much anything you want here */
	},
	
	buildTemplate : function( template ) {
		$.each(C.wells, function(i, well) {
			$('#sni-' + well + '-ul li').children().each(function(i, e) {
				var el = this;
				var classes = $(el).attr('class').split(' ');
				$.each(classes, function(n, class_name) {
					/* I think we actually NEED to include any bigbox or 300x150 to keep the layout in order in the right rail */
					if ( $.inArray(class_name, C.modules) != -1 ) {
						/* we should what moules we can shove into the template now (if listed in C.modules) */
						if ( class_name == 'mrec' ) {
							template.push({
								file_name	: 'bigbox.htm',
								well		: 'sni-' + well
							});
						} else {
							template.push({
								file_name	: class_name + '.htm',
								well		: 'sni-' + well
							});
						}
					}
				});
			});
		});
		return template;
	},
	
	loadComplete : function() {
		$('<ul id="sni-hd-ul" class="sortable-well"></ul>').insertBefore($('#editor #sni-hd'));
		$('<ul id="sni-w-ul" class="sortable-well"></ul>').insertBefore($('#editor #sni-we'));
		$('#editor #sni-we').append('<ul id="sni-we-ul" class="sortable-well"></ul>');
		$('#editor #sni-ww').append('<ul id="sni-ww-ul" class="sortable-well"></ul>');
		$('#editor #sni-e').append('<ul id="sni-e-ul" class="sortable-well"></ul>');
		
		function newModule( module, well, is_east ) {
			/*
				go through the list of available modules (C.modules) that we (should)
				have files for and try to create an editable module for this module
			*/
			var is_east = is_east || false;
			$.each( C.modules, function(i, name) {
				if ( $(module).attr('id') === name || $(module).hasClass(name) ) {
					/* perform any checks via C.beforeNewModule within [site]/const/config.js */
					if ( is_east ) {
						if ( name == 'mrec' ) {
							name = 'bigbox';
						}
					}
					C.getModule({
						module		: module,
						file_name	: name + '.htm',
						well		: well
					});
				}
			});
		};
		
		/* WEST */
		$.each( $('#article #sni-w').children(), function() {
			/* create a module for ONLY '[short_name]-w' */
			if ( ($(this).attr('id') != 'sni-we')
					&& ($(this).attr('id') != 'sni-ww')
					&& ($(this).attr('id') != 'sni-w-ft')
					&& ($(this).attr('id') != 'sni-w-ul')
					&& (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#article #sni-w-ul');
				newModule(this, 'sni-w');
			}
		});
		
		/* WEST / east */
		$.each( $('#article #sni-we').children(), function() {
			if ( ($(this).attr('id') != 'sni-we-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#article #sni-we-ul');
				newModule(this, 'sni-we');
			}
		});
		
		/* WEST / west */
		$.each( $('#article #sni-ww').children(), function() {
			if ( ($(this).attr('id') != 'sni-ww-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#article #sni-ww-ul');
				newModule(this, 'sni-ww');
			}
		});
		
		/* EAST */
		$.each( $('#article #sni-e').children(), function() {
			if ( ($(this).attr('id') != 'sni-e-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				/* wrap each child in the east well within an LI to be sortable */
				var li = $('<li>')
					.append(this)
					.appendTo('#article #sni-e-ul');
				newModule(this, 'sni-e', true);
			}
		});
		
		/* put in a dummy bigbox */
		$('#article #bigbox').html('<img class="temp-bigbox" src="../sites/door/images/temp_bigbox.jpg"/>');
		
		/* make sure the sponsor multilogo ad is blank */
//		$('#article .sponsor-multi-logo').html('');
	},
	
	beforeGetModule : function( skipLoad, options ) {
		/* is there already a banner on the page? */
		if ( options.file_name.indexOf('mini-lead') != -1 ) {
			if ( $('#article .mini-lead')[0] ) {
				alert('There appears to already be a banner on the page. No additional banners ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('bigbox.htm') != -1 ) {
			if ( $('#article #bigbox')[0] ) {
				alert('There appears to already be a bigbox on the page. No additional bigbox ads will be loaded.');
				skipLoad = true;
			}
		}
		
		return skipLoad;
	},
	
	clientGetsource : function( wrap, module ) {
		/* fix script tags */
		wrap.find('#bigbox').html('<cscript>try{UnsizedAd(\'5\');}catch(ex){}</cscript>');
		wrap.find('.sponsor-multi-logo').html('<cscript type="text/javascript">MultiLogoAd("LOGO",4);</cscript>');
		
		
		//var html = $('#temp-source #article').children().eq($('#temp-source #article').children().length - 1).html();
		var html = $('#temp-source #article').html();

		return html;
	},
	
	removalRestrictions : function( module ) {
		if ( $(module).find('#bigbox')[0] ) {
			alert('Sorry, the 300x250 ad unit cannot be deleted.');
			return true;
		}
	},
	
	anchorInputCreated : function( wrap, toggleWrap, label, input, options ) {
		var anchor = $(eval(options.selector));
		if ( anchor.children()[0] && anchor.children()[0].nodeType == 1 && anchor.children()[0].nodeName.toLowerCase() == 'img' ) {
			return;
		}
//		/* create a checkbox for allowing video icons on anchors */
//		var label = $('<label style="font:11px arial;margin-left:10px;position:relative;top:-5px"> :video icon?</label>').appendTo(toggleWrap);
//		var chk = $('<input type="checkbox" style="position:relative;top:3px;"/>');
//		$(chk)
//			.click(function() {
//				var el = $(eval($.data(chk, 'selector')));
//				if ( $(this).attr('checked') ) {
//					el.addClass('video-link');
//					el.append('<span class="video-icon"></span>');
//				} else {
//					el.removeClass('video-link');
//					el.find('.video-icon').remove();
//				}
//			}).prependTo(label);
//		if ( anchor.hasClass('video-link') ) {
//			$(chk).attr('checked', 'checked');
//		}
//		$.data(chk, 'selector', options.selector);
	},
	
	loadAssets : function( assets /* as Object { id: file } */ ) {
		$.each(assets, function(i, file) {
			if ( file.indexOf('.css') != -1 ) {
				var f = false;
				$('link').each(function() {
					if ( $(this).attr('href') == file ) {
						f = true;
					}
				});
				if ( !f ) {
					$('#sni-hd').before('<link type="text/css" href="' + file + '" rel="stylesheet"/>');
				}
			}
			if ( file.indexOf('.js') != -1 ) {
				var f = false;
				$('cscript').each(function() {
					if ( $(this).attr('src') == file ) {
						f = true;
					}
				});
				if ( !f ) {
					$('#sni-hd').before('<cscript type="text/javascript" src="' + file + '"></cscript>');
				}
			}
		});
	}
	
}