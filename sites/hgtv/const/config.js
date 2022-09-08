{
	site				: 'hgtv',
	short_name			: 'hg',
	
	site_wrapper		: '#site-wrapper',
	icon_md				: '../sites/hgtv/images/hgtv-logo-md.jpg',
	script_word			: 'cscript',
	wells				: ['bd', 'w', 'ww', 'we', 'e'],

	module_re			: {
		current : /{module}|{m}/g
	},
	
	seoComplete : function() {
		if ( $('.mini-lead')[0] ) {
			$('#txt-banner-url').val($('.mini-lead style').text().match(/\("*(.*?)"*\)/).length ? $('.mini-lead style').text().match(/\("*(.*?)"*\)/)[1] : C.banner_url);
			$('#txt-banner-text').val($('.mini-lead h1 span')[0] ? $('.mini-lead h1 span').text() : C.package_name);
			if ( $('.mini-lead a')[0] && $('.mini-lead a').attr('href') != '' ) {
				$('#txt-package-url').val($('.mini-lead a').attr('href'));
			} else {
				$('#txt-package-url').val(C.package_url);
			}
		}
	},
	
	skins : {
		'skin-ui'		: '../sites/' + Celestia.site + '/const/css/generic/ui.css',
		'skin-local'	: '../sites/' + Celestia.site + '/const/css/generic/local.css'
	},
	
	modules : [
		/* banner */
			'mini-lead',
			
		/* w rail */
			/* because DIV.prize-intro ALSO has class "intro" it needs to come first in this list */
			/* since that is the case, we will just put sweeps looks here */
			'spnsr-gallery',

			'hearst-ad',
			'calendar-app',
			/* SWEEPS */
			'welcome-back',
			'entry-form',
			'short-rules',
			
			/* GENERIC */
			'intro',
			'hub',
			'hub-tabs',
			'simple-copy',
			'generic-lead',
			'three-tall-lead',
			'two-across',
			'three-feature',
			'dynlead-vid-wrap',
			
		/* we rail */
			'related-link',
			'gallery-tease',
			'feature-list',
			
			/* SWEEPS */
			'enter-form',
			'rules',
			
		/* ww rail */
			'toi-v2',
			'qv-ww',
			'ww-sponsors',
		
		/* e rail */
			'more-from-feature',
			'social-toolbar',
			'from-family',
			'hearst-module-300x300',
			'rr-feature-list',
			'qv',
			'mrec'
	],
	
	refreshSource : function() {
		var html = C.getSource('user');
		$('#txt-cma-source').val(html);
		C.cmaEditor.setValue(html);
	},
	
	loadPlugins : function() {
		/* you can pretty much anything you want here */
		var checkUseBannerProc = $('<input type="checkbox" id="checkUseBannerProc" name="checkUseBannerProc"/>');
		checkUseBannerProc.click(function() {
			C.refreshSource();
		});
		
		var chkUseBannerProcWrap = $('<p/>').append($('<label/>').html('Use Banner Proc: ').append(checkUseBannerProc));
		$('#view-source .bd').prepend(chkUseBannerProcWrap);
	},
	
	buildTemplate : function( template ) {
		$.each(C.wells, function(i, well) {
			$('#hg-' + well + '-ul li').children().each(function(i, e) {
				var el = this;
				var classes = $(el).attr('class').split(' ');
				$.each(classes, function(n, class_name) {
					/* I think we actually NEED to include any bigbox or 300x150 to keep the layout in order in the right rail */
					if ( $.inArray(class_name, C.modules) != -1 ) {
						/* we should know what moules we can shove into the template now (if listed in C.modules) */
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
	
	fixRawSource : function( html ) {
		var re = /<#.*Proc name="getTPBanner".*\/#>/;
		var banner_html = '<div class="mini-lead"><style>.mini-lead h1 { background-image: url("../sites/hgtv/images/mini-lead.jpg"); }</style><h1><a href="#"><span>Package Title</span></a></h1></div>';
		var banner = html.match(re);
		if ( banner && banner.length ) {
			html = html.replace(banner[0], banner_html);
		}
		return html;
	},
	
	source_input		: function( html ) {
		return '<div id="hg-bd">' + html + '</div>';
	},
	
	loadComplete : function() {
		
		/* make sure diy-w contains diy-we, diy-ww and diy-w-ft respectively */
		if ( $('#hg-w #hg-we')[0] == undefined ) {
			$('#hg-w').append('<div id="hg-we"></div>');
		}
		
		if ( $('#hg-w #hg-ww')[0] == undefined ) {
			$('#hg-w').append('<div id="hg-ww"></div>');
		} else {
			$('#hg-w').append($('#hg-ww'));
			/* incase there was one, needs to after diy-we */
		}
		/* now simply add diy-w-ft */
		$('#hg-w-ft').remove();
		$('#hg-w').append('<div id="hg-w-ft"></div>');
		
		$('<ul id="hg-bd-ul" class="sortable-well"></ul>').insertBefore('#editor #hg-bd-wrap');
		$('<ul id="hg-w-ul" class="sortable-well"></ul>').insertBefore($('#editor #hg-w').find('#hg-we'));
		$('#editor #hg-we').append('<ul id="hg-we-ul" class="sortable-well"></ul>');
		$('#editor #hg-ww').append('<ul id="hg-ww-ul" class="sortable-well"></ul>');
		$('#editor #hg-e').append('<ul id="hg-e-ul" class="sortable-well"></ul>');
		
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
		$.each( $('#editor #site-wrapper #hg-w').children(), function() {
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
		$.each( $('#editor #site-wrapper #hg-we').children(), function() {
			if ( ($(this).attr('id') != 'hg-we-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-we-ul');
				newModule(this, 'hg-we');
			}
		});
		
		/* WEST / west */
		$.each( $('#editor #site-wrapper #hg-ww').children(), function() {
			if ( ($(this).attr('id') != 'hg-ww-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-ww-ul');
				newModule(this, 'hg-ww');
			}
		});
		
		/* EAST */
		$.each( $('#editor #site-wrapper #hg-e').children(), function() {
			if ( ($(this).attr('id') != 'hg-e-ul') && (this.nodeName.toLowerCase() != C.script_word) ) {
				/* wrap each child in the east well within an LI to be sortable */
				var li = $('<li>')
					.append(this)
					.appendTo('#site-wrapper #hg-e-ul');
				newModule(this, 'hg-e', true);
			}
		});
		
		/* now that the east well is modulerized, let's create dummy images for the bigbox ads and anything else */
		$.each($('#editor #site-wrapper .mrec'), function() {
			if ( $($(this).children()[0]).attr('id') != 'bigbox' ) {
				$(this).html('<img class="temp-300x150" src="../sites/hgtv/images/temp_300x150.jpg"/>');
			}
		});
		
		/* put in a dummy bigbox */
		$('#editor #site-wrapper #bigbox').html('<img class="temp-bigbox" src="../sites/hgtv/images/temp_bigbox.jpg"/>');
		
		/* make sure the sponsor multilogo ad is setup */
		$('#editor #site-wrapper .sponsor-multi-logo').html('<img class="temp-multi-logo" src="../sites/hgtv/images/' + (C.config.logoSize != undefined ? C.config.logoSize : 'hg_multi_88x31') + '.jpg"/>');
		
		$('#editor #site-wrapper .dynlead-vid-wrap').append('<img class="temp-full-size-player" src="../sites/hgtv/images/temp-full-size-player.jpg"/>');
		$('#editor #site-wrapper #cal-app').append('<img class="dummy-calendar" src="../sites/hgtv/images/dummy-calendar.jpg"/>');
		
		$('#editor #site-wrapper .hearst-ad div').html('<img class="hearst-sponsor-dummy" src="../sites/hgtv/images/hearst-ad.png"/>');
		$('#editor #site-wrapper .hearst-module-300x300 div').html('<img class="hearst-300x300-sponsor-dummy" src="../sites/hgtv/images/hearst-300x300.png"/>');
		
		$('#editor #site-wrapper .social-toolbar').append('<img class="dummy-image" src="../sites/hgtv/images/social-toolbar.jpg"/>');
		
		$('#editor #site-wrapper').prepend($('<div id="pushdown_adtag"><div id="brandscape"></div></div>'));
		
		$('#txt-brandscape').val('<style type="text/css">#pushdown_adtag { width:100%; text-align:center;}#site-wrapper { background: url("http://web.hgtv.com/webhgtv/2012/brandscaping/hhi/House-Hunters-Intl-10-2012-Brandscape_s1920x1080.jpg") top center no-repeat #5a7db6;}body { background-color: #5a7db6; }#brandscape-banner-spring-event { width: 100%; height: 182px; }#brandscape-banner-spring-event a { display: block; width: 100%; height: 182px; text-indent: -999em; }</style><div id="brandscape-banner-spring-event"><a href="http://adsremote.scrippsnetworks.com/event.ng/Type=click&FlightID=$FlightID$&AdID=$AdID$&TargetID=$TargetID$&Values=$Values$&Redirect=http:%2f%2fwww.hgtv.com/house-hunters-international/show/index.html?xp=hhi">House Hunters International</a></div><div id="brandscape"></div>');
		
		/* load additional help file */
		var help = $('<div id="hgtv-additional-help"/>').load('../sites/hgtv/const/help.htm', '', function( html ) {
			if ( html ) {
				$('#dlg-help .bd').append(html);
			}
		});
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
		if ( options.file_name.indexOf('mini-lead') != -1 ) {
			if ( $('#editor #site-wrapper .mini-lead')[0] ) {
				alert('There appears to already be a banner on the page. No additional banners ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a quick vote on the page? */
		if ( options.file_name.indexOf('qv-ww.htm') != -1 ) {
			if ( $('#editor #site-wrapper #quick-vote-poll')[0] ) {
				alert('There appears to already be a Quick Vote poll on the page. No additional Quick Vote polls will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a bigbox on the page? */
		if ( options.file_name.indexOf('bigbox.htm') != -1 ) {
			if ( $('#editor #site-wrapper #bigbox')[0] ) {
				alert('There appears to already be a bigbox on the page. No additional bigbox ads will be loaded.');
				skipLoad = true;
			}
		}
		
		/* is there already a 300x150 on the page? */
		if ( options.file_name.indexOf('300x150.htm') != -1 ) {
			$.each($('#editor #site-wrapper .mrec'), function() {
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
			has_banner = module != 'file' && wrap.find('.mini-lead')[0] ? true : false;
		
		wrap.find('#bigbox').html('<cscript type="text/javascript">BigboxAd(5);</cscript>');
		wrap.find('.temp-300x150').parent().html('<cscript type="text/javascript">BigboxAd300x150(1);</cscript>');
		wrap.find('.sponsor-multi-logo').html('<cscript type="text/javascript">MultiLogoAd("LOGO",4);</cscript>');
		
		//wrap.find('.hearst-ad').children('div').html('<cscript src="http://ads.hearstmags.com/ams/api.js?pos_name=AMS_HGT_HOST_HGTV_600X200_MAG_MAIN&amp;ha=1" type="text/javascript"></cscript>');
		//wrap.find('.hearst-module-300x300').children('div').html('<cscript src="http://ads.hearstmags.com/ams/api.js?pos_name=AMS_HGT_HOST_HGTV_300X300_MAG_MAIN&amp;ha=1" type="text/javascript"></cscript>');
		
		wrap.find('.temp-full-size-player').remove();
		wrap.find('.dummy-calendar').remove();
		
		wrap.find('.dummy-image').remove();
		
		/* handle short-form rules */
		var short_form_rules = wrap.find('.short-rules').parent().html();
		wrap.find('.short-rules').parent().remove();
		wrap.find('#hg-ww').after(short_form_rules);
		
		if ( has_banner && $('#checkUseBannerProc').attr('checked') == 'checked' ) {
			wrap.find('.mini-lead').remove();
			/* create a Proc call for the banner (they're just text) */
			banner = '\n<#Proc name="getTPBanner"/#>';
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
			minute = date.getMinutes();
		
		/* start the only comment that Celestia puts on a content page */
		comment += '<!--\n';
		/* put in the date, time and record number */
		comment += '\t' + month + '-' + day + '-' + year + ' ' + hour + ':' + minute + ' #' + C.record_number + '\n';
		
		if ( C.package_url != '' && C.package_url != undefined ) {
			/* add the url if given */
			comment += '\t' + $('#txt-package-url').val() + '\n';
		}
		comment += '-->';
		
		comment = C.trim(comment);
		
		/* small formatting fix if the .mini-lead is there */
		html = html.replace(/<div id="hg-bd-wrap">/, '\n<div id="hg-bd-wrap">');
		
		/* update any previous comments so we don't duplicate or overlap */
		var comments = html.match(/<!--[\s\S]*?-->/g);
		
		if ( comments ) {
			var ct = comments[0].toString();
			
			/* DOUBLE_ESCAPE */
			if ( ct.match(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,4}\s.*\s#[0-9]{1,7}/g) ) {
				//comment = ct;
				html = html.replace(ct, '');
			}
		}
		return comment + banner + html;
	},
	
	removalRestrictions : function( module ) {
		
		if ( $(module).find('#bigbox')[0] ) {
			alert('Sorry, the 300x250 ad unit cannot be deleted.');
			return true;
		}
		
		if ( $(module).find('.temp-300x150')[0] ) {
			alert('Sorry, the 300x150 (additional) ad unit cannot be deleted.');
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
					$('#hg-bd-wrap').prepend('<link type="text/css" href="' + file + '" rel="stylesheet"/>');
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
					$('#hg-bd-wrap').prepend('<cscript type="text/javascript" src="' + file + '"></cscript>');
				}
			}
		});
	},
	
	runJS : function( assets /* as Object { id: file } */ ) {
		$.each(assets, function(i, file) {
			var f = false;
			
			$('script').each(function() {
				
				if ( $(this).attr('src') == file ) {
					f = true;
				}
			});
			if ( !f ) {
				$(document.body).append('<script type="text/javascript" src="' + file + '"></script>');
			}
		});
	}
	
}