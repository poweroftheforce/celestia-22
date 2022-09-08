{
	site			: 'hgtv',
	short_name		: 'hg',
	site_wrapper	: '#site-wrapper',
	icon_md			: '../sites/hgtv/images/hgtv-logo-md.jpg',
	script_word		: 'cscript',
	wells			: ['bd', 'w', 'ww', 'we', 'e'],
	module_re		: {
		current: /{module}|\{m}/g
	},
	
	source_input	: function( html ) {
		return '<div id="hg-bd">' + html + '</div>';
	},
	
	modules : [
		/* banner */
			'mini-lead',
		/* w rail */
			'intro',
			'hub',
			'three-feature',
			'generic-lead',
			'dynlead-vid-wrap',
			'crsl-w-four',
		/* we rail */
			'related-link',
			'gallery-tease',
			'feature-list',
		/* ww rail */
			'toi-v2',
			'qv-ww',
		/* e rail */
			'more-from-feature',
			'from-family',
			'mrec'
	],
	
	fixRawSource : function( html ) {
		var re = /<#.*Proc name="getTPBanner".*\/#>/;
		var banner_html = '<div class="mini-lead"><style>.mini-lead h1 { background-image: url("../sites/hgtv/images/mini-lead.jpg"); }</style><h1><a href="#"><span>Package Title</span></a></h1></div>';
		var banner = html.match(re);
		if ( banner && banner.length ) {
			html = html.replace(banner[0], banner_html);
		}
		return html;
	},
	
	loadPlugins : function() {
		/* you can pretty much anything you want here */
		
		/* I'm appending some CSS to the body to help with hg-we well */
		var d = $('<div id="hgtv-plugins"/>').appendTo(document.body);
		$('#hgtv-plugins').load('../sites/hgtv/const/fixes.htm', function() {
		});
	},
	
	buildTemplate : function( template ) {
		$.each(C.wells, function(i, well) {
			$('#hg-' + well + '-ul li').children().each(function(i, e) {
				var el = this;
				var classes = $(el).attr('class').split(' ');
				$.each(classes, function(n, class_name) {
					/* I think we actually NEED to include any bigbox or 300x150 to keep the layout in order in the right rail */
					if ( $.inArray(class_name, C.modules) != -1 ) {
						/* we should what moules we can shove into the template now (if listed in C.modules) */
						if ( class_name == 'mrec' ) {
							if ( $($(el).children()[0]).attr('id') == 'bigbox' ) {
								template.push({
									file_name	: 'bigbox.htm',
									well		: 'hg-' + well
								});
							} else {
								template.push({
									file_name	: '300x150.htm',
									well		: 'hg-' + well
								});
							}
						} else {
							template.push({
								file_name	: class_name + '.htm',
								well		: 'hg-' + well
							});
						}
					}
				});
			});
		});
		return template;
	},
	
	loadComplete : function() {
		$('<ul id="hg-bd-ul" class="sortable-well"></ul>').insertBefore('#editor #hg-bd-wrap');
		$('<ul id="hg-w-ul" class="sortable-well"></ul>').insertBefore($('#editor #hg-w').find('#hg-we'));
		$('#editor #hg-we').append('<ul id="hg-we-ul" class="sortable-well"></ul>');
		$('#editor #hg-ww').append('<ul id="hg-ww-ul" class="sortable-well"></ul>');
		$('#editor #hg-e').append('<ul id="hg-e-ul" class="sortable-well"></ul>');
		
		function newModule( module, well, is_east ) {
			/*
				go through the list of available modules (C.modules) that we (should) have files for
				and try to create an editable module for this module
			*/
			var is_east = is_east || false;
			$.each( C.modules, function(i, name) {
				if ( $(module).attr('id') === name || $(module).hasClass(name) ) {
					/* perform any checks via C.beforeNewModule within [site]/const/config.js */
					if ( is_east ) {
						if ( name == 'mrec' ) {
							if ( $($(module).children()[0]).attr('id') == 'bigbox' ) {
								name = 'bigbox';
							} else {
								name = '300x150';
							}
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
		
		$.each( $('#editor #hg-bd').children(), function() {
			if ( ( $(this).attr('id') != ('hg-bd-ul') )
					&& ( $(this).attr('id') != ('hg-bd-wrap') )
					&& (this.nodeName.toLowerCase() != C.script_word)
					&& (this.nodeName.toLowerCase() != 'link') ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#editor #hg-bd-ul');
				if ( $('#editor .mini-lead')[0] != null ) {
					C.getModule({
						module		: $('#editor .mini-lead')[0],
						file_name	: 'mini-lead.htm',
						well		: 'hg-bd'
					});
				}
			}
		});
		
		/* WEST */
		$.each( $('#site-wrapper #hg-w').children(), function() {
			/* create a module for ONLY '[short_name]-w' */
			if ( ($(this).attr('id') != 'hg-we')
					&& ($(this).attr('id') != 'hg-ww')
					&& ($(this).attr('id') != 'hg-w-ft')
					&& ($(this).attr('id') != 'hg-w-ul')
					&& (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-w-ul');
				newModule(this, 'hg-w');
			}
		});
		
		/* WEST / east */
		$.each( $('#site-wrapper #hg-we').children(), function() {
			if ( ($(this).attr('id') != 'hg-we-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-we-ul');
				newModule(this, 'hg-we');
			}
		});
		
		/* WEST / west */
		$.each( $('#site-wrapper #hg-ww').children(), function() {
			if ( ($(this).attr('id') != 'hg-ww-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-ww-ul');
				newModule(this, 'hg-ww');
			}
		});
		
		/* EAST */
		$.each( $('#site-wrapper #hg-e').children(), function() {
			if ( ($(this).attr('id') != 'hg-e-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				/* wrap each child in the east well within an LI to be sortable */
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-e-ul');
				newModule(this, 'hg-e', true);
			}
		});
		
		/* now that the east well is modulerized, let's create dummy images for the bigbox ads and anything else */
		$.each($('#site-wrapper .mrec'), function() {
			if ( $($(this).children()[0]).attr('id') != 'bigbox' ) {
				$(this).html('<img class="temp-300x150" src="../sites/hgtv/images/temp_300x150.jpg"/>');
			}
		});
		
		/* put in a dummy bigbox */
		$('#site-wrapper #bigbox').html('<img class="temp-bigbox" src="../sites/hgtv/images/temp_bigbox.jpg"/>');
		
		/* make sure the sponsor multilogo ad is blank */
		$('#site-wrapper .sponsor-multi-logo').html('');
	},
	
	beforeGetModule : function( skipLoad, options ) {
		/* is there already a banner on the page? */
		if ( options.file_name.indexOf('mini-lead') != -1 ) {
			if ( $('#site-wrapper .mini-lead')[0] ) {
				alert('There appears to already be a banner on the page. No additional banners ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a quick vote on the page? */
		if ( options.file_name.indexOf('qv-ww.htm') != -1 ) {
			if ( $('#site-wrapper #quick-vote-poll')[0] ) {
				alert('There appears to already be a Quick Vote poll on the page. No additional Quick Vote polls will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('bigbox.htm') != -1 ) {
			if ( $('#site-wrapper #bigbox')[0] ) {
				alert('There appears to already be a bigbox on the page. No additional bigbox ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a 300x150 on the page? */
		if ( options.file_name.indexOf('300x150.htm') != -1 ) {
			$.each($('#site-wrapper .mrec'), function() {
				if ( $($(this).children()[0]).attr('id') != 'bigbox' ) {
					alert('There appears to already be a 300x150 ad on the page. No additional 300x150 ads will be loaded.');
					skipLoad = true;
				}
			});
		}
		return skipLoad;
	},
	
	clientGetsource : function( wrap, module ) {
		var banner = '',
			has_banner = false;
		
		wrap.find('#bigbox').html('<cscript type="text/javascript">BigboxAd(5);</cscript>');
		wrap.find('.temp-300x150').parent().html('<cscript type="text/javascript">BigboxAd300x150(1);</cscript>');
		wrap.find('.sponsor-multi-logo').html('<cscript type="text/javascript">MultiLogoAd("LOGO",4);</cscript>');
		
		if ( module != 'file' && wrap.find('.mini-lead')[0] ) {
			wrap.find('.mini-lead').remove();
			has_banner = true;
		}
		
		if ( has_banner ) {
			/* create a Proc call for the banner (they're just text) */
			banner = '\n\t<#Proc name="getTPBanner"/#>\n';
		}
		
		var html = $('#temp-source #site-wrapper').children().eq($('#temp-source #site-wrapper').children().length - 1).html();

		return banner + html;
	},
	
	'anchorInputCreated': function( wrap, toggleWrap, label, input, options ) {
		if ( $(eval(options.selector)).children()[0] && $(eval(options.selector)).children()[0].nodeType == 1 && $(eval(options.selector)).children()[0].nodeName.toLowerCase() == 'img' ) {
			return;
		}
		/* create a checkbox for allowing video icons on anchors */
		var label = $('<label style="font:11px arial;margin-left:10px;position:relative;top:-5px"> :video icon?</label>').appendTo(toggleWrap);
		var chk = $('<input type="checkbox" style="position:relative;top:3px;"/>');
		$(chk)
			.attr('checked', $(eval(options.selector)).attr('target') == '_blank' ? 'checked' : '')
			.click(function() {
				var el = $(eval($.data(chk, 'selector')));
				if ( $(this).attr('checked') ) {
					el.addClass('video-link');
					el.append('<span class="video-icon"></span>');
				} else {
					el.removeClass('video-link');
					el.find('.video-icon').remove();
				}
			}).prependTo(label);
		$.data(chk, 'selector', options.selector);
	},
	
	/* TODO: need to check #fn-bd-wrap below */
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
					$('#fn-bd-wrap').prepend('<link type="text/css" href="' + file + '" rel="stylesheet"/>');
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
					$('#fn-bd-wrap').prepend('<cscript type="text/javascript" src="' + file + '"></cscript>');
				}
			}
		});
	}
	
}