{
	site			: 'diy',
	short_name		: 'diy',
	site_wrapper	: '#site-wrapper',
	icon_md			: '../sites/diy/images/diy-logo-md.jpg',
	script_word		: 'cscript',
	wells			: ['bd', 'w', 'ww', 'we', 'e'],
	module_re			: {
		current: /{module}|\{m}/g
	},
	source_input	: function( html ) {
		return '<div id="diy-bd">' + html + '</div>';
	},
	
	skins : {
		'skin-ui'		: '../sites/' + Celestia.site + '/const/css/generic/ui.css',
		'skin-local'	: '../sites/' + Celestia.site + '/const/css/generic/local.css'
	},
	
	modules : [
		/* banner */
			'show-lead',
			'carousel-lead',
		
		/* w rail */
			'pack-title',
			'hub-tabs',
			'sponsor-lead',
			'generic-lead',
			'single-lead',
			'single-feature',
			'three-feature',
			'browse-all-rooms',
			'two-col',
			'lots-of-images',
			'featured-video',
			
			/* SWEEPS */
			'intro',
		
		/* we rail */
			'related-links',
		
		/* ww rail */
			'relevant',
			'gallery-tease',
		
		/* e rail */
			'project-pod',
			'bigboxad',
			'cartridge',
			'qa'
	],
	
	fixRawSource : function( html ) {
		var re = /<#.*Proc name="getTPBanner".*\/#>/;
		var banner_html = '<div class="show-lead"><style type="text/css">.show-lead h1.mini-lead {background: url("../sites/diy/images/mini-lead.jpg") no-repeat 0 0;}</style><h1 class="mini-lead">Package Title</h1></div>';
		var banner = html.match(re);
		if ( banner && banner.length ) {
			html = html.replace(banner[0], banner_html);
		}
		return html;
	},
	
	/*********************************************************************/
	/***************************** CALLBACKS *****************************/
	/*********************************************************************/
	
	beforeSave : function() {
		/*
			what we basically want to do is extend the file system config and stick the banner in there
			reason is because of the Proc call - since files get saved with a Proc call instead of banner html,
			AND on load/restore the Proc call is simply exchanged with show-lead.htm (no nav) we'll save the actual
			banner to [C.banner_html]
		*/
		/* get the banner */
		C.extendConfig({
			banner_html : $('#site-wrapper .show-lead')[0] ? $('#site-wrapper .show-lead').parent().html() : ''
		});
	},
	
	buildTemplate : function( template ) {
		$.each(C.wells, function(i, well) {
			$('#diy-' + well + '-ul li').children().each(function(i, e) {
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
									well		: 'diy-' + well
								});
							}
						} else {
							template.push({
								file_name	: class_name + '.htm',
								well		: 'diy-' + well
							});
						}
					}
				});
			});
		});
		return template;
	},
	
	loadComplete : function() {
		$('<ul id="diy-bd-ul" class="sortable-well"></ul>').insertBefore('#editor #diy-w');
		
		/* make sure diy-w contains diy-we, diy-ww and diy-w-ft respectively */
		if ( $('#diy-w #diy-we')[0] == undefined ) {
			$('#diy-w').append('<div id="diy-we"></div>');
		}
		
		if ( $('#diy-w #diy-ww')[0] == undefined ) {
			$('#diy-w').append('<div id="diy-ww"></div>');
		} else {
			$('#diy-w').append($('#diy-ww'));
			/* incase there was one, needs to after diy-we */
		}
		/* now simply add diy-w-ft */
		$('#diy-w-ft').remove();
		$('#diy-w').append('<div id="diy-w-ft" class="clr"></div>');
		
		/* insert a ul for module sorting */
		$('<ul id="diy-w-ul" class="sortable-well test"></ul>').insertBefore($('#editor #diy-w').find('#diy-we'));
		$('#editor #diy-we').append('<ul id="diy-we-ul" class="sortable-well"></ul>');
		$('#editor #diy-ww').append('<ul id="diy-ww-ul" class="sortable-well"></ul>');
		$('#editor #diy-e').append('<ul id="diy-e-ul" class="sortable-well"></ul>');

		function newModule( module, well, is_east, skipUndo ) {
			/*
				go through the list of available modules (C.modules) that we (should) have files for
				and try to create an editable module for this module
			*/
			var is_east = is_east || false,
				skipUndo = skipUndo != undefined ? skipUndo : false,
				module_found = false;
			
			$.each( C.modules, function(i, name) {
				
				if ( $(module).attr('id') === name || $(module).hasClass(name) ) {
					
					/* perform any checks via C.beforeNewModule within [site]/const/config.js */
					if ( is_east ) {
						
						if ( name == 'mrec' ) {
							
							if ( $($(module).children()[0]).attr('id') == 'bigbox' ) {
								name = 'bigbox';
								skipUndo = true;
							} else {
								name = '300x150';
								skipUndo = true;
							}
						}
					}
					C.getModule({
						module		: module,
						file_name	: name + '.htm',
						well		: well,
						skipUndo	: skipUndo
					});
					module_found = true;
				}
			});

			if ( !module_found ) {
				Celestia.tagModule(module, well);
			}
		};
		
		$.each( $('#editor #diy-bd').children(), function() {
			
			if ( ( $(this).attr('id') == ('diy-bd-ul') )
					|| ( $(this).attr('id') == ('diy-w') )
					|| ( $(this).attr('id') == ('diy-e') )
					|| (this.nodeName.toLowerCase() == C.script_word)
					|| (this.nodeName.toLowerCase() == 'link') ) {
			} else {
				var li = $('<li>')
					.append(this)
					.appendTo('#editor #diy-bd-ul');
				
				if ( $('#editor .show-lead')[0] != null ) {
					C.getModule({
						module		: $('#editor .show-lead')[0],
						file_name	: 'show-lead.htm',
						well		: 'diy-bd'
					});
				}
				
				if ( $('#editor .carousel-lead')[0] != null ) {
					C.getModule({
						module		: $('#editor .carousel-lead')[0],
						file_name	: 'carousel-lead.htm',
						well		: 'diy-bd'
					});
				}
			}
		});
		
		/* WEST */
		$.each( $('#site-wrapper #diy-w').children(), function() {
			
			/* create a module for ONLY "[short_name]-w" */
			if ( ($(this).attr('id') != 'diy-we')
					&& ($(this).attr('id') != 'diy-ww')
					&& ($(this).attr('id') != 'diy-w-ft')
					&& ($(this).attr('id') != 'diy-w-ul')
					&& (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #diy-w-ul');
					
				newModule(this, 'diy-w');
			}
		});
		
		/* WEST / east */
		$.each( $('#site-wrapper #diy-we').children(), function() {
			if ( ($(this).attr('id') != 'diy-we-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #diy-we-ul');
				newModule(this, 'diy-we');
			}
		});
		
		/* WEST / west */
		$.each( $('#site-wrapper #diy-ww').children(), function() {
			if ( ($(this).attr('id') != 'diy-ww-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #diy-ww-ul');
				newModule(this, 'diy-ww');
			}
		});
		
		/* EAST */
		$.each( $('#site-wrapper #diy-e').children(), function() {
			if ( ($(this).attr('id') != 'diy-e-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				/* wrap each child in the east well within an LI to be sortable */
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #diy-e-ul');
				newModule(this, 'diy-e', true);
			}
		});
		
		/* put in a dummy bigbox */
		$('#site-wrapper #bigbox').html('<img class="temp-bigbox" src="../sites/diy/images/temp_bigbox.jpg"/>');
		
		/* make sure the sponsor multilogo ad is blank */
		$('#editor #site-wrapper .sponsor-multi-logo').html('<img class="temp-multi-logo" src="../sites/diy/images/' + (C.config.logoSize != undefined ? C.config.logoSize : 'diy_multi_88x31') + '.jpg"/>');
		
		/* fill any homepageleads with dummy-player 266x233 (so far ONLY to any carousel lead lie crashers central) */
		$('#editor #site-wrapper .carousel-lead .media').append('<img class="dummy-player" src="../sites/diy/images/home-page-lead.jpg"/>');
		
		/* make all show/hide DIY left rail rule button false by defult */
		$('.show-hide-diy-left-rail-rule').each(function() {
			$.data(this, 'show', $('#diy-ww-border-css')[0] ? true : false);
		});
		/* load additional help file */
		var help = $('<div id="diy-additional-help"/>').load('../sites/diy/const/help.htm', '', function( html ) {
			if ( html ) {
				$('#dlg-help .bd').append(html);
			}
		});
	},
	
	beforeSave : function() {
		var logoSize = C.config.logoSize != undefined ? C.config.logoSize : '';
		
		if ( $('.sponsor-multi-logo img')[0] ) {
			
			if ( $('.sponsor-multi-logo img').attr('src') != undefined ) {
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('diy_multi_88x31') != -1 ) {
					logoSize = 'diy_multi_88x31';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('diy_multi_68x40') != -1 ) {
					logoSize = 'diy_multi_68x40';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('diy_multi_115x24') != -1 ) {
					logoSize = 'diy_multi_115x24';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('diy_multi_135x20') != -1 ) {
					logoSize = 'diy_multi_135x20';
				}
			}
		}
		C.extendConfig({
			logoSize : logoSize
		});
	},
	
	beforeNewModule : function( module, well, is_east, name ) {
		/* are we loading HGTV bigbox OR 300x150? */
//		if ( is_east ) {
//			if ( name == 'mrec' ) {
//				if ( $($(module).children()[0]).attr('id') == 'bigboxad' ) {
//					name = 'bigbox.htm';
//				}
//			}
//		}
		return name;
	},
	
	beforeGetModule : function( skipLoad, options ) {
		/* is there already a banner on the page? */
		if ( options.file_name.indexOf('show-lead') != -1 ) {
			if ( $('#site-wrapper .show-lead')[0] ) {
				alert('There appears to already be a banner on the page. No additional banners ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a quick vote on the page? */
		if ( options.file_name.indexOf('qv-ww') != -1 ) {
			if ( $('#site-wrapper #quick-vote-poll')[0] ) {
				alert('There appears to already be a Quick Vote poll on the page. No additional Quick Vote polls will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('bigboxad') != -1 ) {
			if ( $('#site-wrapper #bigbox')[0] ) {
				alert('There appears to already be a bigbox on the page. No additional bigbox ads will be loaded.');
				skipLoad = true;
			}
		}
		return skipLoad;
	},
	
	wellMenuComplete : function() {
		/* LOAD: dlg DIY CSS Color and initally close it */
		var d = $('<div/>').appendTo(document.body);
		$(d).load('../sites/diy/const/dlg-diy-color.htm', function() {
			$('#dlg-diy-css-color')
				.dialog({
					height		: 200,
					position	: ['center', 50],
					width		: 450
				}).dialog('close');
			$('#dlg-diy-css-color li').each(function() {
				$(this)
					.addClass('ui-state-default ui-corner-all')
					.click(function() {
						var btn = this,
							module = C.module.current;
						switch ( $('#dlg-diy-css-color').attr('module') ) {
							//case 'project-pod': {
							//	$(module).attr('class', 'pod project-pod ' + $($('a', btn)[0]).attr('color'));
							//	break;
							//}
							case 'sponsor-lead': {
								$(module).find('style').html('.sponsor h3 { color: ' + $($(btn)[0]).css('background-color') + '; }');
								break;
							}
							default : {
								var str = $('#dlg-diy-css-color').attr('module') + ' ' + $($('a', btn)[0]).attr('color');
								clog(str);
								$(module).attr('class', str);
								break;
							}
						}
						C.save();
					});
			});
		});
		
		/* setup clicks in the right rail (I'm pretty certain this script CAN go inside well-menu.htm) */
		$('.show-hide-diy-left-rail-rule').click(function() {
			$.data(this, 'show', !$.data(this, 'show'));
			$('#diy-ww-border-css').remove();
			if ( $.data(this, 'show') ) {
				$('#diy-ww').css('border-top', 'none');
				$('#diy-ww').append('<style id="diy-ww-border-css">#diy-ww {border-top:none;}</style>');
			} else {
				/* just incase the page was loaded with above style tag inserted, it will overwrite the global, so reset it (but via $().css) */
				$('#diy-ww').css('border-top', '1px solid #E1E1E1');
			}
			/* and... save */
			C.save();
		});
	},
	
	clientGetsource : function( wrap, module ) {
		var banner = '',
			has_banner = false;
		
		/* TRY and replace temp-bogbox with BIGBOX script */
		wrap.find('.temp-bigbox').each(function() {
			$(this).parent().html('<cscript type="text/javascript">BigboxAd(5);</cscript>');
		});
		
		wrap.find('.dummy-player').remove();
		
		wrap.find('#diy-ww-border-css').removeAttr('id');
		wrap.find('.temp-full-size-player').remove();
		
		/* TRY and replace temp-Multi-Logo with Multi-Logo script */
		wrap.find('.sponsor-multi-logo').each(function() {
			$(this).html('<cscript type="text/javascript">MultiLogoAd("LOGO",4);<\/cscript>');
		});
		
		if ( module != 'file' && wrap.find('.show-lead')[0] ) {
			wrap.find('.show-lead').remove();
			has_banner = true;
		}
		
		if ( has_banner ) {
			/* create a Proc call for the banner (they're just text) */
			banner = '\n\t<#Proc name="getTPBanner"/#>\n';
		}
		
		var html = $('#temp-source #site-wrapper').children().eq($('#temp-source #site-wrapper').children().length - 1).html();
		
		/* put some comments at the top of the page */
		var comment = '';
		/* get date and time for our comment */
		var date = new Date(),
			day = date.getDate(),
			month = (date.getMonth() + 1).toString().length == 1 ? '0' + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString(),
			year = date.getFullYear(),
			hour = date.getHours(),
			minute = date.getMinutes(),
			record_number = '000000';
		
		comment += '<!-- ' + month + '-' + day + '-' + year + ' ' + hour + ':' + minute + ' #' + C.record_number + '\n';
		if ( C.package_url != '' || C.package_url != undefined ) {
			comment += $('#txt-package-url').val() + '\n';
		}
		comment += '-->\n';
		
		comment = C.trim(comment);
		
		var comments = html.match(/<!--[\s\S]*?-->/g);
		if ( comments ) {
			var ct = comments[0].toString();
			/* DOUBLE_ESCAPE */
			if ( ct.match(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,4}\s.*\s#[0-9]{1,7}/g) ) {
				return banner + html.replace(ct, comment);
			} else {
				return comment + banner + html;
			}
		} else {
			return comment + banner + html;
		}

		return banner + html;
	},
	
	removalRestrictions : function( module ) {
		if ( $(module).find('#bigbox')[0] ) {
			alert('Sorry, the 300x250 ad unit cannot be deleted.');
			return true;
		}
		// possible for DIY to implement 300x150 ad unit
		//if ( $(module).find('.temp-300x150')[0] ) {
		//	alert('Sorry, the 300x150 (additional) ad unit cannot be deleted.');
		//	return true;
		//}
	},
	
	anchorInputCreated : function( wrap, toggleWrap, label, input, options ) {
		var anchor = $(eval(options.selector));
		if ( anchor.children()[0] && anchor.children()[0].nodeType == 1 && anchor.children()[0].nodeName.toLowerCase() == 'img' ) {
			return;
		}
		/* create a checkbox for allowing video icons on anchors */
		var label = $('<label style="font:11px arial;margin-left:10px;position:relative;top:-5px"> :video icon?</label>').appendTo(toggleWrap);
		var chk = $('<input type="checkbox" style="position:relative;top:3px;"/>');
		$(chk)
			.click(function() {
				var el = $(eval($.data(chk, 'selector')));
				if ( $(this).attr('checked') ) {
					el.addClass('video-link');
					el.append('<span class="video-icon"></span>');
				} else {
					el.removeClass('video-link');
					el.find('.video-icon').remove();
				}
				C.save();
			}).prependTo(label);
		
		if ( anchor.hasClass('video-link') ) {
			$(chk).attr('checked', 'checked');
		}
		
		$.data(chk, 'selector', options.selector);
	},
	
	/**********************************************************************/
	/***************************** PLUG - INS *****************************/
	/**********************************************************************/
	checkImageSize : function( input, value, size, msg ) {
		if ( !input || !value ) {
			return;
		}
		/* is this not the right size? */
		if ( value.indexOf(size) == -1 ) {
			$(input).addClass('warning');
			C.setInputMessage(input, msg);
		} else {
			$(input).removeClass('warning');
			C.clearInputMessage(input);
		}
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
					$('#diy-w').before('<link type="text/css" href="' + file + '" rel="stylesheet"/>');
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
					$('#diy-w').before('<cscript type="text/javascript" src="' + file + '"></cscript>');
				}
			}
		});
	}
	
}