{
	site			: 'hgrm',
	short_name		: 'sni',
	site_wrapper	: '.site-wrapper',
	icon_md			: '../sites/hgrm/images/hgrm-logo-md.png',
	script_word		: 'cscript',
	wells			: ['bd', 'w', 'e'],
	module_re		: {
		current: /{module}|\{m}/g
	},
	
	modules : [
		/* banner */
			'banner',
			'local-nav',
			
		/* w rail */
			'plain',
			'list',
			'generic',
			'three-across',
			'oops-msg',
			'rules',
			'short-rules',
			'spnsr-gallery',
			
		/* e rail */
			'toolbar',
			'bigbox',
			'bigbox300x150',
			'editorial-list',
			'editorial-image'
	],
	
	loadPlugins : function() {
		/* you can pretty much anything you want here */
		$(document.body).addClass('section');
	},
	
	skins : {
		'skin-local'	: '../sites/hgrm/const/css/generic/local.css'
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
							if ( $($(el).children()[0]).attr('id') == 'bigbox' ) {
								template.push({
									file_name	: 'bigbox.htm',
									well		: 'sni-e',
									skipUndo	: true
								});
							} else {
								template.push({
									file_name	: '300x150.htm',
									well		: 'sni-e',
									skipUndo	: true
								});
							}
						} else if ( class_name == 'toolbar' ) {
							if ( $(el).parent().hasClass('pod') && $(el).parent().parent().hasClass('sni-e') ) {
								template.push({
									file_name	: 'toolbar.htm',
									well		: 'sni-e',
									skipUndo	: true
								});
							}
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
	
	fixRawSource : function( html ) {
		var re = /<#.*Proc name="getBanner".*\/#>/,
			banner_html = '<div class="banner"><style type="text/css">.banner a {background: url("../sites/hgrm/images/banner.png") no-repeat 0 0;}</style><h1><a href="#">Package Title</a></h1></div>',
			banner = html.match(re);
		
		if ( banner && banner.length ) {
			html = html.replace(banner[0], banner_html);
		}
		
		return html;
	},
	
	source_input : function( html ) {
		return '<div class="iax_outer" id="pushdown_adtag"><div class="iax_inner"></div><div id="brandscape"></div></div>' + html;
	},
	
	loadComplete : function() {
		
		$('.site-wrapper #sni-bd').prepend('<ul id="sni-bd-ul" class="sortable-well"></ul>')
		$('.site-wrapper .sni-w').append('<ul id="sni-w-ul" class="sortable-well"></ul>');
		$('.site-wrapper .sni-e').append('<ul id="sni-e-ul" class="sortable-well"></ul>');
		
		function newModule( module, well, is_east, skipUndo ) {
			/*
				go through the list of available modules (C.modules) that we (should) have files for
				and try to create an editable module for this module
			*/
			var is_east = is_east || false,
				skipUndo = skipUndo != undefined ? skipUndo : false,
				module_found = false;
			
			$.each( C.modules, function(i, name) {
				
				if ( $(module).hasClass('pod') ) {
					
					if ( $(module).children('.bd').attr('id') === name || $(module).children('.bd').hasClass(name) ) {
						
						C.getModule({
							module		: module,
							file_name	: name + '.htm',
							well		: well,
							skipUndo	: skipUndo
						});
						module_found = true;
					}
					
					/* perform any checks via C.beforeNewModule within [site]/const/config.js */
					if ( is_east ) {
						
						//if ( name == 'bigbox' || name == 'bigbox300x150' || name == 'toolbar' ) {
							
							if ( $($(module).children()[0]).attr('id') == name || $($(module).children()[0]).hasClass(name) ) {
								C.getModule({
									module		: module,
									file_name	: name + '.htm',
									well		: well,
									skipUndo	: skipUndo
								});
								module_found = true;
							}
						//}
					}
					
					
				} else if ( $(module).attr('id') === name || $(module).hasClass(name) ) {
					
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
		
		$.each( $('#editor #sni-bd').children(), function() {
			if ( ( $(this).attr('id') != 'sni-bd-ul' )
					&& (this.nodeName.toLowerCase() != C.script_word)
					&& (this.nodeName.toLowerCase() != 'link') ) {
				if ( !$(this).hasClass('sni-w') && !$(this).hasClass('sni-e') ) {
					var li = $('<li>')
						.append(this)
						.appendTo('#editor #sni-bd-ul');
					if ( $('#editor .banner')[0] != null ) {
						C.getModule({
							module		: $('#editor .banner')[0],
							file_name	: 'banner.htm',
							well		: 'sni-bd'
						});
					}
					if ( $('#editor .local-nav')[0] != null ) {
						C.getModule({
							module		: $('#editor .local-nav')[0],
							file_name	: 'local-nav.htm',
							well		: 'sni-bd'
						});
					}
				}
			}
		});
		
		/* WEST */
		$.each( $('.site-wrapper .sni-w').children(), function() {
			/* create a module for ONLY "[short_name]-w" */
			if ( ($(this).attr('id') != 'sni-w-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('.site-wrapper #sni-w-ul');
				newModule(this, 'sni-w');
			}
		});
		
		/* EAST */
		$.each( $('.site-wrapper .sni-e').children(), function() {
			if ( ($(this).attr('id') != 'sni-e-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('.site-wrapper #sni-e-ul');
				newModule(this, 'sni-e', true);
			}
		});
		
		/* now that the east well is modulerized, let's create dummy images for the bigbox ads and anything else */
		$('#editor .site-wrapper #bigbox300x150').html('<img class="temp-300x150" src="../sites/hgrm/images/temp_300x150.jpg"/>');
		
		/* put in a dummy bigbox */
		$('#editor .site-wrapper #bigbox').html('<img class="temp-bigbox" src="../sites/hgrm/images/temp_bigbox.jpg"/><cite class="cap center">Advertisement</cite>');
		
		/* put in a dummy toolbar */
		$('#editor .site-wrapper .sni-e .pod .toolbar').html('<img class="temp-toolbar" src="../sites/hgrm/images/sni-e-toolbar.png"/>');
		
		/* make sure the sponsor multilogo ad is setup */
		$('#editor .site-wrapper .sponsor-multi-logo').html('<img class="temp-multi-logo" src="../sites/hgtv/images/' + (C.config.logoSize != undefined ? C.config.logoSize : 'hg_multi_88x31') + '.jpg"/>');
		
	},
	
	beforeSave : function() {
		var logoSize = C.config.logoSize != undefined ? C.config.logoSize : '';
		
		if ( $('.sponsor-multi-logo img')[0] ) {
			
			if ( $('.sponsor-multi-logo img').attr('src') != undefined ) {
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('hg_multi_88x31') != -1 ) {
					logoSize = 'hg_multi_88x31';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('hg_multi_68x40') != -1 ) {
					logoSize = 'hg_multi_68x40';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('hg_multi_115x24') != -1 ) {
					logoSize = 'hg_multi_115x24';
				}
				
				if ( $('.sponsor-multi-logo img').attr('src').indexOf('hg_multi_135x20') != -1 ) {
					logoSize = 'hg_multi_135x20';
				}
			}
		}
		C.extendConfig({
			logoSize : logoSize
		});
	},
	
	beforeGetModule : function( skipLoad, options ) {
		/* is there already a banner on the page? */
		if ( options.file_name.indexOf('banner') != -1 ) {
			if ( $('.site-wrapper .banner')[0] ) {
				alert('There appears to already be a banner on the page. No additional banners ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a quick vote on the page? */
		if ( options.file_name.indexOf('qv-ww.htm') != -1 ) {
			if ( $('.site-wrapper #quick-vote-poll')[0] ) {
				alert('There appears to already be a Quick Vote poll on the page. No additional Quick Vote polls will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('toolbar.htm') != -1 ) {
			if ( $('.site-wrapper .sni-e .toolbar')[0] ) {
				alert('There appears to already be a toolbar on the page. No additional toolbar ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('bigbox.htm') != -1 ) {
			if ( $('.site-wrapper #bigbox')[0] ) {
				alert('There appears to already be a bigbox on the page. No additional bigbox ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a 300x150 on the page? */
		if ( options.file_name.indexOf('300x150.htm') != -1 ) {
			$.each($('.site-wrapper .mrec'), function() {
				if ( $($(this).children()[0]).attr('id') != 'bigbox' ) {
					alert('There appears to already be a 300x150 ad on the page. No additional 300x150 ads will be loaded.');
					skipLoad = true;
				}
			});
		}
		return skipLoad;
	},
	
	clientGetsource : function( wrap, module ) {
		var secTagOpen = '<section id="sni-bd">',
			secTagClosed = '</section>',
			banner = '',
			has_banner = false;
		
		wrap.find('.temp-toolbar').parent().html('<div class="toolbar"><ul><li id="tb-email"></li><li id="tb-tweet"></li><li id="tb-facebook"></li></ul><div id="email-a-friend"></div><cscript type="text/javascript">SNI.Util.Toolbar();</cscript></div>');
		wrap.find('.temp-bigbox').parent().html('<cscript type="text/javascript">BigboxAd(5);</cscript>');
		wrap.find('.temp-300x150').parent().html('<cscript type="text/javascript">BigboxAd300x150(1);</cscript>');
		wrap.find('.sponsor-multi-logo').html('<cscript type="text/javascript">MultiLogoAd(\'LOGO\',4);</cscript>');
		
		if ( module != 'file' && wrap.find('.banner')[0] ) {
			wrap.find('.banner').remove();
			has_banner = true;
		}
		
		if ( has_banner ) {
			banner = '\n\t<#Proc name="getBanner"/#>\n';
		}

		var html = wrap.find('#sni-bd').html();
		
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
				return secTagOpen + banner + html.replace(ct, comment) + secTagClosed;
			} else {
				return comment + secTagOpen + banner + html + secTagClosed;
			}
		} else {
			return comment + secTagOpen + banner + html + secTagClosed;
		}
		
		/* create a Proc call for the banner (they're just text) */
		return secTagOpen + banner + html + secTagClosed;
	},
	
	removalRestrictions : function( module ) {
		if ( $(module).find('#bigbox')[0] ) {
			alert('Sorry, the 300x250 ad unit cannot be deleted.');
			return true;
		}
		if ( $(module).find('#bigbox300x150')[0] ) {
			alert('Sorry, the 300x150 (additional) ad unit cannot be deleted.');
			return true;
		}
		if ( $(module).find('.toolbar')[0] ) {
			alert('Sorry, social toolbar cannot be deleted.');
			return true;
		}
	},
	
	anchorInputCreated : function( wrap, toggleWrap, label, input, options ) {
		var anchor = $(eval(options.selector));
		if ( anchor.children()[0] && anchor.children()[0].nodeType == 1 && anchor.children()[0].nodeName.toLowerCase() == 'img' ) {
			return;
		}
		
		/* create a checkbox for allowing video icons on anchors */
		var label = $('<label style="font:11px arial;margin-left:10px;position:relative;top:-5px"> :video icon?</label>').appendTo(toggleWrap),
			chk = $('<input type="checkbox" style="position:relative;top:3px;"/>');
		
		$(chk)
			//.attr('checked', $(eval(options.selector)).attr('target') == '_blank' ? 'checked' : '')
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
					$('#sni-bd .sni-w').before('<link type="text/css" href="' + file + '" rel="stylesheet"/>');
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
					$('#sni-bd .sni-w').before('<cscript type="text/javascript" src="' + file + '"></cscript>');
				}
			}
		});
	}
	
}