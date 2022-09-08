(function($) {

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) { size++; }
    }
    return size;
};

$.extend(Celestia, {
	
	name			: 'Celestia Content Builder',
	version			: '1.0',

	sites_root		: '../sites/',
	
	site			: '',
	short_name		: '',
	site_wrapper	: '',
	
	/* error list */
	errors: {
		GET_CONFIG						: 'Error while getting configuration file for site: ',
		GET_TEMPLATE					: 'Error getting template file.',
		GET_PACKAGES					: 'Error getting packages.',
		GET_SITES						: 'Error getting sites',
		GET_PACKAGE_FILES				: 'Error getting package files.',
		CHECK_FOLDER_EXIST				: 'Error while checking if a folder exist.',
		LOAD_FILE_ERROR					: 'Could not load file.',
		RESTORE_SUCCESS_ERROR			: 'err:102 - Could not restore session upon success. (?)',
		NO_SESSION_ERROR				: 'err:102a - No valid session was found or previous session is missing.',
		RESTORE_ERROR					: 'err:102b - Could not restore session.',
		MISSING_INPUT					: 'err:103 - Missing input when trying to create a new package.',
		MISSING_SITE_PACKAGE_NAME		: 'err:104 - Missing either Celestia.site or Celestia.package_name when trying to create a new package.',
		LOAD_COMPLETE_MISSING_HTML		: 'err:200 - No HTML found when loading',
		DRAW_CONTROLS_NO_DATA			: 'err:300 - No data (JSON) found for module'
	},
	
	session			: $.cookie('celestia_session') ? $.parseJSON($.cookie('celestia_session')) : {
		'site'				: '',
		'franchise_name'	: '',
		'package_name'		: '',
		'file_name'			: ''
	},
	file_name		: $.cookie('celestia_session') ? $.parseJSON($.cookie('celestia_session'))['file_name'] != undefined ? $.parseJSON($.cookie('celestia_session'))['file_name'] : '' : '',
	old_file_name	: '',
	package_name	: '',
	franchise_name	: '',
	
	record_number	: '00000',
	package_url		: '',
	
	banner_url		: '',
	
	keywords		: '',
	home_section	: '',
	seo				: '',
	sponsorship		: '',
	
	/* used to determine if we need to save on keyup every x interval */
	key_stroke_time	: 0,
	
	new_package		: true,
	restoring		: false,
	setting_source	: false,
	
	templates		: {},
	
	sorted			: false,
	
	/* TODO: create a button that toggles testing of links */
	test_links			: false,
	image_open			: false,
	image_timer			: null,
	show_module_images	: true,
	
	colors			: {},
	
	/* list of all possible modules */
	modules	: [],
	module	: {
		current		: null,
		last_edited	: null,
		data		: null
	},
	module_re		: {
		current	: /{module}|{m}/g
	},
	
	config : {
		'txt-record-number'		: '00000',
		'txt-franchise-name'	: '',
		'txt-package-name'		: '',
		'txt-package-url'		: '',
		'txt-banner-url'		: '',
		'txt-banner-text'		: '',
		'txt-keywords'			: '',
		'txt-home-section'		: '',
		'txt-seo'				: '',
		'txt-sponsorship'		: ''		
	},
	
	extendConfig	: function( options ) {
		return $.extend(Celestia.config, options);
	},
	
	undoManager		: new UndoManager(),
	
	console			: null,
	
	PLUGINS_LOADED	: false,
	
	/***********/
	/* METHODS */
	/***********/

	getConfig : function( site, callback, applyConfig ) {
		var applyConfig = applyConfig == undefined ? true : applyConfig;
		$.ajax({
			url			: Celestia.sites_root + site + '/const/config.js',
			dataType	: 'text',
			success		: function( config ) {
				var config = eval('(' + config + ')') || null;
				if ( applyConfig ) {
					/* do some assigning and setup */
					if ( config && config.short_name ) {
						$.extend(C, config);
						/* load any plugins for [site] */
						if ( Celestia.loadPlugins != undefined && !Celestia.PLUGINS_LOADED ) {
							Celestia.PLUGINS_LOADED = true;
							Celestia.loadPlugins.call(this);
						}
					}
				}
				if ( callback != undefined ) {
					callback.call(this, config);
				}
			},
			error		: function( hxr, status, err ) {
				Celestia.console.error(Celestia.errors['GET_CONFIG'], [hxr, status, err]);
			}
		});
	},
	
	getConfigs : function( callback ) {
		
		var method = 'method=getSites&site=' + Celestia.site + '&franchise_name=' + Celestia.franchise_name + '&package_name=' + Celestia.package_name + '&file_name=' + Celestia.file_name;
		Celestia.api(method, Celestia.errors['GET_SITES'], function( sites ) {
			$.each(eval(sites), function(i, site) {
				
				Celestia.getConfig(site, function( config ) {
					
					if ( callback != undefined ) {
						callback.call(this, config, i);
					}
				}, false);
			});
		});
	},
	
	newPackage : function( txt ) {
		if ( !txt ) {
			/* err:103 */
			Celestia.console.error(Celestia.errors['MISSING_INPUT']);
		}
		/* set the franchise name */
		Celestia.franchise_name = $('#txt-create-franchise').val();
		
		/* set the package name */
		Celestia.package_name = $(txt).val();
		
		/* if no name was specified when creating a new package -> exit */
		if ( Celestia.package_name === '' ) {
			alert('Please fill in the name of the new package');
			return false;
		}
		if ( Celestia.site && Celestia.package_name ) {
			/* try and create a new package */
			Celestia.new_package = true;
			
			Celestia.folderExists({
				success : function( data ) {
					/* ONLY close the "Create / Open" dialog if we're good to go */
					$('#dlg-create-open-package').dialog('close');
					Celestia.loadSite();
				},
				error : function( data ) {
					/*
					CURRENTLY NOT IMPLEMENTED
					alert('Package name already exists, listing package files.\n\nFound the following franchises/packages:\n\n' + data.folders.join('\n'));
					*/
					alert('Package name already exists, listing package files.');
					Celestia.highlightExistingPackage();
				}
			});
		} else {
			/* err:104 */
			Celestia.console.error(Celestia.errors['MISSING_SITE_PACKAGE_NAME']);
		}
	},
	
	highlightExistingPackage : function() {
		$.each($('#project-list-wrap .dir h2'), function() {
			$(this).removeClass('highlight');
			if ( $(this).text().toLowerCase() === $('#txt-create-package').val().toLowerCase() ) {
				$(this).addClass('highlight');
				if ( $(this).next().css('display') === 'none' ) {
					$(this).click();
				}
				$('#project-list-wrap').animate({
					scrollTop : ($(this).position().top + $("#project-list-wrap").scrollTop() ) - 70
				}, 2000);
			}
		});
	},
	
	folderExists : function( options ) {
		var options = $.extend({
			success	: null,
			error	: null
		}, options);
		var method = 'method=exists&site=' + Celestia.site + '&franchise_name=' + Celestia.franchise_name + '&package_name=' + Celestia.package_name + '&file_name=' + Celestia.file_name;
		Celestia.api(method, Celestia.errors['CHECK_FOLDER_EXIST'], function(data) {
			var data = eval(data);
			if ( data.exists ) {
				if ( options.error ) {
					options.error.call(this, data);
				}
			} else {
				if ( options.success ) {
					options.success.call(this, data);
				}
			}
			return;
		});
	},
	
	toTitleCase : function(str) {
		return str.replace(/(?:^|\s)\w/g, function(match) {
    	    return match.toUpperCase();
	    });
	},
	
	setupSEO : function() {
		
		Celestia.console.log('function:setupSEO - config: ');
		
		/* clear the seo box */
		$('#dlg-seo .seo-wrap').html('');
		/* setup SEO in the Main Controls */
		$.each(Celestia.config, function( name, value) {
			
			if ( name.indexOf('txt-') != -1 ) {
				var p = $('<li/>').appendTo($('#dlg-seo .seo-wrap')),
					label = $('<label/>').html('<span>' + Celestia.toTitleCase(name.replace('txt-', '').replace(/-/g, ' ')) + ':</span>').appendTo(p),
					input = $('<input/>');
				
				$(input)
					.attr('id', name)
					.keyup(function() {
						var obj = {};
						$.each($('#dlg-seo .seo-wrap input'), function() {
							obj[$(this).attr('id')] = $(this).val();
						});
						Celestia.extendConfig(obj);
						C.save();
					})
					.appendTo(label);
				
				$(input).val(
							name == 'txt-franchise-name' ? Celestia.franchise_name :
							name == 'txt-package-name' ? Celestia.package_name :
							name == 'txt-package-url' ? Celestia.package_url :
							value);
				
				if ( Celestia.seoComplete != undefined ) {
					Celestia.seoComplete.call(this);
				}
			}
		});
	},
	
	coreReady : function() {
		
		Celestia.console.log('function:coreReady - Celestia.restoring: ', Celestia.restoring, 'Celestia.new_package: ', Celestia.new_package, 'Celestia.site: ', Celestia.site);
		
		if ( !Celestia.restoring && Celestia.new_package && Celestia.site ) {
			
			/* load either the selected template or a default one */
			if ( $('#sel-template').val() != '' ) {
				Celestia.loadTemplate($('#sel-template').val());
			} else {
				Celestia.loadTemplate('__default');
			}
			
			/* wait a second and save */
			setTimeout(function() {
				Celestia.save();
			}, 1000);
		}
	},
	
	getTemplates : function() {
		
		Celestia.console.log('function:getTemplates - site: ' + Celestia.site, 'path: ' + Celestia.sites_root + Celestia.site + '/const/templates.js');
		
		/* get the templates for this site and asign them to Celestia.templates */
		$.ajax({
			url			: Celestia.sites_root + Celestia.site + '/const/templates.js',
			dataType	: 'json',
			success : function( data ) {
				Celestia.templates = data || {};
				/* fill #sel-template with any templates found */
				$.each(Celestia.templates, function(i, v) {
					if ( this.name != '__default' ) {
						$('#sel-template').append('<option value="' + this.name + '">' + this.name + '</option>');
					}
				});
			},
			error : function() {
				Celestia.console.error(Celestia.errors['GET_TEMPLATE']);
			}
		});
	},
	
	/*
		function() loadTemplate
		
			Loads a predefined template (if chosen) for the selected site when creating a new package
	*/
	loadTemplate : function( template_name ) {
		
		Celestia.console.log('function:loadTemplate - template: ', Celestia.templates);
		
		/* find our template and load it */
		$.each(Celestia.templates, function() {
			if ( this.name === template_name ) {
				$.each(this.template, function(n, v) {
					Celestia.getModule({
						file_name	: this.file_name,
						well		: this.well,
						skipUndo	: this.skipUndo != undefined ? this.skipUndo : false
					});
				});
			}
		});
		
	},
	
	saveTemplate : function( template_name ) {
		
		Celestia.console.log('function:saveTemplate - template name: ', template_name);
		
		/*
			build the template object
			structure: array[{
				"file_name"	: "filename.htm",
				"well"		: "well-id"
			}]
		*/
		/* go through each well */
		var template = [];
		
		if ( Celestia.buildTemplate != undefined ) {
			template = Celestia.buildTemplate.call(this, template);
		}
		
		var name_found = false,
			index = 0;
		/* does the name exist? */
		$.each(Celestia.templates, function(i, v) {
			if ( v.name.toLowerCase() === template_name.toLowerCase() ) {
				name_found = true;
				index = i;
			}
		});
		
		if ( name_found ) {
			/* open the dialog box */
			$('#dlg-confirmation .bd').append('<p>The template name entered exist, would you like to overwrite?</p>');
			$("#dlg-confirmation").dialog('option', 'buttons', {
				'No' : function() {
					$('#dlg-confirmation').dialog('close');
					$('#dlg-save-as').dialog('open');
				},
				'Yes' : function() {
					/* take that template out so it can be replaced */
					Celestia.templates.splice(index, 1, {
						name		: template_name,
						template	: template
					});
					Celestia.saveTemplateFile();
					$('#dlg-confirmation').dialog('close');
					$('#dlg-save-as').dialog('close');
				}
			}).dialog('open');
		} else {
			/* tack the new template to the end */
			Celestia.templates.push({
				name		: template_name,
				template	: template
			});
			Celestia.saveTemplateFile();
		}
	},
	
	saveTemplateFile : function() {
		/* save the file */
		$.ajax({
			type	: 'post',
			url		: Celestia.api_path,
			data	: 'method=save_template&site=' + Celestia.site + '&data=' + JSON.stringify(Celestia.templates, null, 4),
			success	: function() {}
		});
	},
	
	loadFile : function() {
		if ( Celestia.site != '' ) {
			var method = 'method=open&site=' + Celestia.site + '&franchise_name=' + Celestia.franchise_name + '&package_name=' + Celestia.package_name + '&file_name=' + Celestia.file_name;
			Celestia.api(method, Celestia.errors['LOAD_FILE_ERROR'], function( html ) {
				if ( html != '' && html != undefined ) {
					Celestia.setSource(html);
				}
			});
		}
	},
	
	/* reference error #4031 - restoring session */
	restoreSession : function() {
		
		Celestia.new_package = false;
		Celestia.restoring = true;
		
		var session = $.parseJSON($.cookie('celestia_session')) || {};
		
		if ( session ) {
			/* get the site, package name and file name */
			Celestia.site = session['site'];
			Celestia.franchise_name = session['franchise_name'];
			Celestia.package_name = session['package_name'];
			Celestia.file_name = session['file_name'];
			Celestia.old_file_name = Celestia.file_name;
			
			if ( Celestia.site != '' ) {
				/* get the config file for the site */
				Celestia.getConfig(Celestia.site, function() {
					
					/* called config file */
					if ( Celestia.skins != undefined ) {
						Celestia.loadSkin(Celestia.skins);
					}
			
					var method = 'method=open&site=' + Celestia.site +
									'&franchise_name=' + Celestia.franchise_name +
									'&package_name=' + Celestia.package_name +
									'&file_name=' + Celestia.file_name;
					Celestia.api(method, Celestia.errors['RESTORE_ERROR'], function( html ) {
						
						if ( html === 'error' ) {
							/* err:102 */
							Celestia.console.error(Celestia.errors['RESTORE_SUCCESS_ERROR']);
							return;
						}
						
						if ( html != '' && html != undefined ) {
							Celestia.file_name = Celestia.stripTimeStamp(session['file_name']);
							/*
								note: IT'S EASIER to go through Celestia.prepareSource because
								it needs to be wrapped with a wrapper but we don't know what site this is yet
								Celestia.prepareSource() - is used for setting the editor up when a site has not been chosen
							*/
							$('#txt-set-source').val(html);
							//Celestia.prepareSource();
							Celestia.setSource($('#txt-set-source').val());
						}
					}, false);
				});
			}
		} else {
			Celestia.console.error(Celestia.errors['NO_SESSION_ERROR']);
		}
	},
	
	/*
		prepareSource() - is used for setting the editor up when a site has not been chosen
		takes a URL or HTML
	*/
	prepareSource : function( set_source ) {

		var set_source = set_source != undefined ? set_source : false;
		
		Celestia.console.log('function:prepareSource');
		
		if ( $('#txt-set-source').val().toString().substring(0, 4) == 'http' ) {
//			var url = $('#txt-set-source').val();
//			if ( url != '' ) {
//				Celestia.site = url.substring(url.indexOf('www.') + 4, url.indexOf('.com'));
//				switch ( Celestia.site ) {
//					case 'hgtv': { Celestia.site = 'hgtv'; Celestia.short_name = 'hg'; break; }
//					case 'diynetwork': { Celestia.site = 'diy'; Celestia.short_name = 'diy'; break; }
//				}
//				$('#editor').load('../global/inc/' + Celestia.site + '_loader.php', '', function( data ) {
//					window.mace_popup = window.open('../global/inc/url_loader_html.php?url=' + url + '&save=true&site=' + Celestia.site + '&id_prefix=' + Celestia.short_name, 'maceChildWin', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1,height=1');
//				});
//			}
		} else {
			Celestia.folderExists({
				success : function ( data ) {
					Celestia.setSource($('#txt-set-source').val());
				},
				error : function( data ) {
					if ( set_source ) {
						/*
							I'm only utuilizing .folderExists to let the user know that they are setting the source
							code for an existing package
							a new revision will get created within said package
							
							unfortunately I am setting the source be it success or error here
						*/
						alert('Package name already exists.\nPlease note that only a new revision will get created within this package name.');
						Celestia.setSource($('#txt-set-source').val());
					}
				}
			});
		}
	},
	
	setSortable : function( selector ) {
		
		Celestia.console.log('function:setSortable - elements: ', selector);
		
		$(selector).sortable({
			cancel		: '.disabled',
			placeholder	: 'ui-state-highlight',
			sort : function( e, ui ) {
				/* make our sorting place-holder the same size as the module being sorted */
				$('.ui-state-highlight', this).css({
					'line-height'	: $(ui.item).outerHeight(true) + 'px',
					'height'		: $(ui.item).outerHeight(true) + 'px'
				});
			},
			stop : function(e, ui) {
				
				/*
					logic problem
					You can sort modules which involves mousedown and mouseup carried through sort.start and sort.stop
					You can also click on a module to open the controls dialog
					both cases #controls-opener (overlay) is over the module (irrelevant)
					
					What happens is sort.start and sort.stop both happen before controls-opener.click
					so I had to make a gate Celestia.sorted [true|false] to utilize @ #controls-opener.click
					
					referenced in function getModule()
				*/
				Celestia.sorted = true;
				/* make the current module the one theuser is sorting/dragging */
				Celestia.module.current = ui.item.children()[0];
				
				var line = Celestia.console.info('Sorted module: ', Celestia.module.current);
				$(line)
					.data('module', Celestia.module.current)
					.css('cursor', 'pointer')
					.on('mouseover', function() {
						var module = $(this).data('module');
						$('#controls-opener')
							.css({
								display		: 'block',
								filter		: 'alpha(opacity=' + 15 + ')',
								height		: $(module).outerHeight() + 'px',
								opacity		: 15 / 100,
								width		: ($(module).outerWidth(true) - parseInt($(module).css('padding-right'), 10)) + 'px'
							})
							.appendTo($(module).parent());
					})
					.on('mouseout', function() {
						Celestia.hideOverlay();
					});
				
				Celestia.save();
			}
		}).disableSelection();
	},
	
	loadSite : function() {
		
		Celestia.console.log('function:loadSite - site: ', Celestia.site);
		$('#editor')
			.load(Celestia.sites_root + Celestia.site + '/const/_loader.php', '', function( html ) {
				
				if ( html ) {
					
					Celestia.setSortable('.sortable-well');
					$('#dlg-main-menu')
						.dialog('open')
						.dialog('option', 'position', ['right', 'top']);
					$('#dlg-create-open-package').dialog('close');
					Celestia.save();
					Celestia.setupSEO();
					
					/* show the close button on dlg Create / Open */
					$('#dlg-create-open-package').prev().find('.ui-dialog-titlebar-close').css('display', 'block');
					$('#dlg-create-open-package').prev().find('.dialog-minimize, .dialog-restore').css('right', '0.6em');

					/* callback method for [site] ref #004 */
					if ( Celestia.siteLoaded != undefined ) {
						Celestia.siteLoaded.call(this);
					}
					Celestia.coreReady();
				}
			});
		Celestia.loadWellMenu();
		Celestia.setWellMenuItems();
	},
	
	setSource : function( html ) {
		
		Celestia.console.log('function:setSource - source: ');
		
		if ( html ) {
			
			if ( Celestia.site == '' || Celestia.short_name == '' ) {
				return;
			}
			
			Celestia.getTemplates();
			
			$('#editor')
				.load(Celestia.sites_root + Celestia.site + '/const/_loader.php', '', function() {
					
					html = Celestia.dirtyHTML(html);
					
					if ( Celestia.fixRawSource != undefined ) {
						html = Celestia.fixRawSource.call(this, html);
					}
					html = unescape(html);
					html = Celestia.source_input ? Celestia.source_input(html) : html;
					Celestia.loadingComplete(html);
				});
		}
	},
	
	/*
		loadingComplete
		
		this function should ONLY be utilized when loading HTML from some source (local file, saved packaged, setting the source etc...)
	*/
	/* note: this method is triggered by [site]_loader.php at the bottom */
	loadingComplete : function( html ) {
		
		Celestia.console.log('function:loadingComplete - html: ');
		
		var sn = Celestia.short_name;
		
		if ( html == '' ) {
			/* err:200 */
			Celestia.console.error(Celestia.errors['LOAD_COMPLETE_MISSING_HTML']);
			return false;
		}
		
		/* we're only hiding the one on dlg Create/Open, just show them all */
		$('.btn-set-source').show();
		$('#editor ' + Celestia.site_wrapper).html(html);
		
		if ( !Celestia.setting_source ) {
			/* get the seo from the config file and asign it to Celestia[SEO_VAR] */
			Celestia.getFileConfig(function( data ) {
				
				/* set some defaults */
				Celestia.package_name = data['txt-package-name'] != undefined && data['txt-package-name'] != '' ? data['txt-package-name'] : Celestia.package_name;
				Celestia.franchise_name = data['txt-franchise-name'] != undefined && data['txt-franchise-name'] != '' ? data['txt-franchise-name'] : Celestia.franchise_name;
				Celestia.record_number = data['txt-record-number'] != undefined && data['txt-record-number'] != '' ? data['txt-record-number'] : Celestia.record_number;
				Celestia.package_url = data['txt-package-url'] != undefined && data['txt-package-url'] != '' ? data['txt-package-url'] : Celestia.package_url;
				Celestia.banner_url = data['txt-banner-url'] != undefined && data['txt-banner-url'] != '' ? data['txt-banner-url'] : Celestia.banner_url;
				Celestia.keywords = data['txt-keywords'] != undefined && data['txt-keywords'] != '' ? data['txt-keywords'] : Celestia.keywords;
				Celestia.home_section = data['txt-home-section'] != undefined && data['txt-home-section'] != '' ? data['txt-home-section'] : Celestia.home_section;
				Celestia.seo = data['txt-seo'] != undefined && data['txt-seo'] != '' ? data['txt-seo'] : Celestia.seo;
				Celestia.sponsorship = data['txt-sponsorship'] != undefined && data['txt-sponsorship'] != '' ? data['txt-sponsorship'] : Celestia.sponsorship;
				
				Celestia.extendConfig(data);
				Celestia.save();
				Celestia.setupSEO();
			});
		} else {
			/* we're just restoring */
			Celestia.save();
			Celestia.setupSEO();
		}
		
		if ( Celestia.loadComplete != undefined ) {
			/*
				found within [site]/const/config.js => loadComplete
				
				when setting the source reference Celestia.loadComplete to detect modules for your site
			*/
			Celestia.loadComplete.call(this, html);
		}
		
		/* make everything sortable */
		Celestia.setSortable('.sortable-well');
		
		/* this will allow for the use of textarea tags to javascript into */
		/*
		$.each($('#editor cscript'), function(i) {
			if ( !$(this).attr('src') ) {
				$(this).html('<textarea id="txt-cscript' + i + '" class="c-script-area" rows="5" style="width:100%;" spellcheck="false">' + $(this).html() + '</textarea>');
			} else {
				$(this).html('<input type="text" id="txt-cscript' + i + '-src" value="' + $(this).attr('src') + '" style="width:100%;"/>');
			}
		});
		$.each($('.c-script-area'), function() {
			$(this).focus(function() { $(this).attr('rows', 15); }).blur(function() { $(this).attr('rows', 5); });
		});
		*/
		
		/* load the well menu for [site] */
		Celestia.loadWellMenu();
		Celestia.setWellMenuItems();
		
		/* make certain source setting elements are shut down */
		$('#dlg-set-source').dialog('close');
		/* popup is for getting the source from ... */
		if ( window.mace_popup ) {
			window.mace_popup.close();
		};
		
		
		
		/* last thing to do when loading a page from some source is open the main menu and close the create/open dialog and setup SEO */
		$('#dlg-main-menu')
			.dialog('open')
			.dialog('option', 'position', ['right', 'top']);
		
		$('#dlg-create-open-package').dialog('close');
		
		
		/* show the close button on dlg Create / Open incase the user click "New Package" */
		$('#dlg-create-open-package').prev().find('.ui-dialog-titlebar-close').css('display', 'block');
		$('#dlg-create-open-package').prev().find('.dialog-minimize, .dialog-restore').css('right', '0.6em');
		
	},
	
	/*
		getFileConfig( callback )
	*/
	getFileConfig : function( callback ) {
		if ( Celestia.site && Celestia.package_name ) {
			/* get the seo from the config file and asign it to Celestia[SEO_VAR] */
			var config_url = Celestia.sites_root + Celestia.site + '/packages/' + (Celestia.franchise_name != '' ? Celestia.franchise_name + '/' : '') + Celestia.package_name + '/' + (Celestia.restoring ? Celestia.old_file_name : Celestia.file_name) + '-config.js';
			return $.ajax({
				url			: config_url,
				dataType	: 'json',
				async		: false,
				success		: function( data ) {
					if ( callback != undefined ) {
						callback.call(this, data);
					}
				},
				error		: function() {
					/* err:50 */
					Celestia.console.error('err:50 - Could not load config file. url[' + config_url + ']');
				}
			});
		}
	},
	
	/*
		getModule( options )
	*/
	getModule : function( options ) {
		var options = $.extend({
			/* default to auto loading modules so leaves controls closed */
			openControls		: false,
			module				: null,
			file_name			: '',
			well				: null,
			fromMenu			: false,
			skipUndo			: false
		}, options);
		
		/* we need - what module and where to put it?! */
		if ( options.file_name != '' && options.well ) {
			
			if ( Celestia.new_package || options.fromMenu ) {
				
				var skipLoad = false;
				
				if ( Celestia.beforeGetModule != undefined ) {
					skipLoad = Celestia.beforeGetModule.call(this, skipLoad, options);
				}
				
				if ( skipLoad ) {
					return;
				}
			}
			/* get the module */
			$.ajax({
				url			: Celestia.sites_root + Celestia.site + '/modules/' + options.well + '/' + options.file_name,
				dataType	: 'html',
				data		: '',
				error : function( xhr, status, error ) {
					Celestia.console.log('getModule error ', xhr, status, error);
					return;
				},
				success : function( data ) {
					var module = null,
						module_data = {
							well		: options.well,
							file_name	: options.file_name,
							sortable	: true,
							editable	: true,
							sections	: []
						},
						_init = false;
					$.each($(data), function(i,v) {
						
						var el = this;
						
						/* handle the HTML */
						if ( el.nodeType === 1 && el.nodeName.toLowerCase() === 'div' ) {
							module = options.module
										? options.module
										: el;
							Celestia.module.current = module;
						}
						
						/* handle the JSON (ALWAYS) */
						if ( el.nodeType === 1 && el.nodeName.toLowerCase() === 'script' ) {
							if ( module ) {
								/* fill new module with data if available */
								$.extend(module_data, eval($(el).text()));
								$.data(module, 'data', module_data);
								if ( $.data(module, 'data').init ) {
									_init = true;
								}
							}
						}
					});
					/* utilize the dummy divs? */
					$('#' + options.well + '-ul .c-dummy').css('display', 'none');
					
					/* ONLY need to append if we're inserting as new AFTER we obtain the data */
					if ( !options.module ) {
						
						var li = $('<li/>').append(module);
						$('#' + options.well + '-ul').append(li);
						
						/*
							small bug where IF the controls were already open and a new module
							was injected that since Celestia.module.current becomes the newly injected
							module, the mouseover for the controls opener points to the new module etc.
							so we want to have dlg controls (that's already open) display the new modules
							editable data
						*/
						if ( options.openControls ) {
							//$.data(Celestia.module.current, 'data', null);
							Celestia.openControls();
						}
						Celestia.save();
					}
					/* we should have our module if everything loaded correctly */
					if ( module ) {
						if ( !module_data.sortable ) {
							$(module).parent().addClass('disabled');
						}
						$(module)
							.mouseover(function() {
								if ( module_data.editable ) {
									
									if ( $('#dlg-controls').dialog('isOpen') && module == Celestia.module.current ) {
										return false;
									}
									
									$('#controls-opener')
										.off('click')
										.css({
											display		: 'block',
											filter		: 'alpha(opacity=' + 15 + ')',
											height		: $(module).outerHeight() + 'px',
											opacity		: 15 / 100,
											width		: ($(module).outerWidth(true) - parseInt($(module).css('padding-right'), 10)) + 'px'
										})
										.mouseout(function() {
											Celestia.hideOverlay();
										})
										.click(function(e) {
											e.stopPropagation();
											if ( !Celestia.sorted ) {
												/* set the current module and data within Celestia.module and open the controls dialog */
												
												Celestia.module.current = $(module)[0];
												
												Celestia.openControls();
												Celestia.hideOverlay();
											} else {
												Celestia.sorted = false;
											}
										})
										/*
											you want the controls to be appended to same LI that the module is in
											so that when you are sorting (you will be on mouse over) - the LI is
											still sortable
										*/
										.appendTo($(module).parent())
										/*
											load a help section defined within the module data
											or .modules section by default
										*/
										.contextMenu({
											help_section	: $.data(module, 'data').help != undefined ? $.data(module, 'data').help : 'modules',
											module			: $(module)[0]
										});
								}
							})
							.contextMenu({
								help_section	: $.data(module, 'data').help != undefined ? $.data(module, 'data').help : 'modules',
								module			: $(module)[0]
							});
					}
					if ( _init ) {
						module_data.init.call(this, module, module_data);
					}
					if ( !options.skipUndo ) {
//						Celestia.undoManager.register(undefined, function() {
//							if ( module ) {
//								/* remove the module we just created */
//								$(module).remove();
//								/* make sure Dlg Controls are closed if we're removing the module we just created */
//								$('#dlg-controls').dialog('close');
//							}
//						}, [], 'Undo::getModule', undefined, Celestia.getModule, [options], 'Redo::getModule');
//						Celestia.undoManager.changed();
					}
				}
			});
		}
	},
	
	tagModule : function( module, well ) {
		
		if ( module && $(module)[0] != undefined ) {
			$(module)
				.mouseover(function() {
					if ( $('#dlg-controls').dialog('isOpen') && module == Celestia.module.current ) {
						return false;
					}
					$('#unknown-module')
						.off('click')
						.click(function(e) {
							
							e.stopPropagation();
							
							if ( !Celestia.sorted ) {
								
								/* set the current module and data within Celestia.module and open the controls dialog */
								Celestia.module.current = $(module)[0];
								Celestia.openControls();
								Celestia.hideOverlay(this);
							} else {
								Celestia.sorted = false;
							}
						})
						.css({
							display		: 'block',
							filter		: 'alpha(opacity=' + 15 + ')',
							height		: $(module).outerHeight() + 'px',
							opacity		: 15 / 100,
							width		: ($(module).outerWidth(true) - parseInt($(module).css('padding-right'), 10)) + 'px'
						})
						.mouseout(function() {
							Celestia.hideOverlay(this);
						})
						.appendTo($(this).parent());
				});
		}
	},
	
	confirm : function( msg /* as HTML */ ) {
		if ( msg != undefined && msg != '' ) {
			$('#dlg-confirmation .bd')
				.html('')
				.append(msg);
			$("#dlg-confirmation").dialog('option', 'buttons', {
				
				Cancel : function() {
					$('#dlg-confirmation').dialog('close');
				},
				Confirm	: function() {
					Celestia.removeModule(Celestia.module.current);
					
				}
			}).dialog('open');
		}
	},
	
	compareModules : function( a, b, sortArrays ) {
		function sort(object) {
			
			if (sortArrays === true && Array.isArray(object)) {
				return object.sort();
			} else if (typeof object !== "object" || object === null) {
				return object;
			}
			return Object.keys(object).sort().map(function(key) {
				return {
					key: key,
					value: sort(object[key])
				};
			});
		}
		return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
	},
	
	removeModule : function( module ) {
		var module = $(module),
			clone = $(module).clone(),
			parent = $(module).parent(),
			sortable_well = parent.parent(),
			/*
				because of the way jQuery().index() works, we need children
				the solution will be $( children ).index( parent );
			*/
			children = sortable_well.children(),
			rail = sortable_well.parent(),
			/* parent node LI */
			restrictions = Celestia.removalRestrictions != undefined ? Celestia.removalRestrictions.call(this, module) : false,
			/* have to redefine what the module is to reload */
			options = $.extend($.data(module[0], 'options'), { module: clone[0] }),
			/* get the position of the parent within the sortable_well */
			parent_pos = $(children).index(parent),
			/* is this module the first child or sibling to a previous? */
			sibling = parent_pos > 0 ? $(parent).prev() : null;
		
		if ( module.hasClass('ui-dialog') ) {
			/* TODO: move this error to the error list */
			Celestia.console.log('Error:Improper module [couldn\'t find module in question]');
			$('#dlg-controls').dialog('close');
			return;
		}
			
		if ( !restrictions ) {
			/* TODO: make a recycle bin */
			parent.remove();
	
			$('#dlg-confirmation, #dlg-controls').dialog('close');
			if ( children.length == 1 && sortable_well.find('.c-dummy')[0] ) {
				sortable_well.find('.c-dummy').css('display', 'block');
			}
			Celestia.save();
			
			Celestia.undoManager.register(undefined, function() {
				
				/* UNDO function */
				if ( sibling ) {
					/*
						what we will try to do here is place the deleted module back into it's original position
						This is NOT foolproof as we can only utilize elements on the page that NEVER get removed
						(such as UL.sortble-well) in addition to getting the module index / child position
					*/
					sortable_well.children().eq(parent_pos - 1).after( $('<li/>').append(clone) );
				} else {
					sortable_well.append($('<li/>').append(clone));
				}

				Celestia.getModule(options);
				Celestia.save();
			}, [], 'Undo::Delete Module', undefined, function() {
				/* REDO function */
				removeModule(clone);
			}, [], 'Redo::Delete Module');
		} else {
			$("#dlg-confirmation").dialog('close');
		}
	},
	
	loadWellMenu : function() {
		$('#well-menu-wrap').load(Celestia.sites_root + Celestia.site + '/const/well-menu.htm', function(data) {
			
			$('#well-menu-wrap ul a').each(function() {
				
				
				var well = $(this).parent().parent().attr('well'),
					file_name = $(this).attr('file'),
					help = $(this).attr('help'),
					src = $(this).attr('img');
				
				$(this)
					.attr('href', 'javascript:;')
					.on('click', function() {
						if ( !$(this).hasClass('no-module') ) {
							Celestia.getModule({
								openControls	: true,
								well			: well,
								file_name		: file_name,
								fromMenu		: true
							});
							
						}
					})
					.contextMenu({
						help_section : help
					});
				
				/* we'll need to load any image into the well menu links to get the width :-\ */
				if ( $(this).attr('img') != undefined ) {
					var img = $('<img src="' + src + '"/>');
					$(this).append(img);
					
					$(this)
						.on('mouseover', function() {
							
							var leftPad = !isNaN(parseInt($($(this).parents('.ui-accordion-content')[0]).css('padding-left'), 10)) ? parseInt($($(this).parents('.ui-accordion-content')[0]).css('padding-left'), 10) : 0;
							/* gate for toggling Celestia.show_module_images */
							if ( Celestia.show_module_images ) {
								
								if ( img && src != '' ) {
									
									$('#image-wrap').html('<img src="' + src + '"/>');
									clearTimeout(Celestia.image_timer);
									
									var width = $(this).find('img').width(),
										left = $('#image-wrap').position().left;
										
									$('#image-wrap').animate({
											'margin-left'	: ((left - width) - leftPad) + 'px',
											opacity			: 1,
											width			: width + 'px'
										}, 500);
									
									/* make sure it's in view */
									if ( !Celestia.image_open ) {
										Celestia.image_open = true;
									}
								}
							}
						})
						.on('mouseout', function() {
							Celestia.image_timer = setTimeout(function() {
								Celestia.hideWellImages();
							}, 5000);
						})
				}
			});
			/* make all of the well selections an accordion */
			$('#well-menu-wrap div:first-child')
				.accordion({
					header		: 'h3',
					autoHeight	: false,
					collapsable	: true,
					fillSpace	: true,
					active		: 1
				});
			/* well menu has completed loading */
			if ( Celestia.wellMenuComplete != undefined ) {
				Celestia.wellMenuComplete.call(this);
			}
		});
	},
	
	setWellMenuItems : function() {
		$('#mm-franchise-name').html('Franchise Name: ' + Celestia.franchise_name);
		$('#mm-package-name').html('Package Name: ' + Celestia.package_name);
		//$('#mm-file-name').html('File Name: ' + Celestia.stripTimeStamp(Celestia.file_name) + '&nbsp;');
		/* not really needed to give users the ability to change the filename */
		/*Celestia.createChangeFileNameLink();*/
	},
	
	createChangeFileNameLink : function() {
		var lnk = $('<a href="javascript:;"/>')
					.html('change')
					.click(function() {
						var div = $('<div id="dlg-change-file-name" title="Change File Name"/>')
								.appendTo(document.body)
								.dialog({
									buttons : {
										'Cancel' : function() {
											$('#dlg-change-file-name').dialog('close');
										},
										'Set' : function() {
											if ( $('#txt-change-file-name').val() != '' ) {
												Celestia.file_name = $('#txt-change-file-name').val() + '-@' + Celestia.time_stamp;
												$('#mm-file-name').html('File Name: ' + Celestia.stripTimeStamp(Celestia.file_name) + '&nbsp;');
												Celestia.createChangeFileNameLink();
												Celestia.save();
											}
											$('#dlg-change-file-name').dialog('close');
										}
									}
								});
						var input = $('<input id="txt-change-file-name" type="text"/>')
										.val(Celestia.stripTimeStamp(Celestia.file_name))
										.keyup(function(e) {
											if ( e.keyCode == 13 && $(this).val() != '' ) {
												Celestia.file_name = $(this).val() + '-@' + Celestia.time_stamp;
												$('#mm-file-name').html('File Name: ' + Celestia.stripTimeStamp(Celestia.file_name) + '&nbsp;');
												Celestia.createChangeFileNameLink();
												Celestia.save();
												$('#dlg-change-file-name').dialog('close');
											}
										})
										.appendTo(div);
						
					})
					.appendTo($('#mm-file-name'));
	},
	
	hideWellImages : function() {
		/* set our flag */
		Celestia.image_open = false;
		
		/* animate the image wrap to close up, fade out and display a default message upon complete */
		$('#image-wrap')
			.animate({
				'margin-left'	: '0px',
				opacity			: 0,
				width			: '0px'
			}, 500, function() {
				$('#image-wrap').html('<p>No image to display.</p>');
			});
	},
	
	setSession : function() {
		Celestia.session = {
			"site"				: Celestia.site,
			"franchise_name"	: Celestia.franchise_name,
			"package_name"		: Celestia.package_name,
			"file_name"			: Celestia.file_name
		};
		$.cookie('celestia_session', JSON.stringify(Celestia.session), { expires: 365 });
	},
	
	save : function( file_name ) {
		/* first we'll save the session to a cookie (this will be a string of values seperated by ::) */
		/* example: hgtv::my package name::*/
		var of = file_name;
		var file_name = file_name != undefined
				? file_name
				: Celestia.file_name != ''
					? Celestia.file_name
					: 'index';

		Celestia.file_name = Celestia.stripTimeStamp(file_name) + '-@' + Celestia.time_stamp;
		Celestia.setSession();
		
		/* get the source */
		var html = Celestia.getSource('file');
		
		/* if we have the source and the site then proceed */
		if ( html && Celestia.site != '' ) {
			
			if ( Celestia.beforeSave != undefined ) {
				Celestia.beforeSave.call(this);
			}

			$.ajax({
				type	: 'post',
				url		: Celestia.api_path,
				data	: 'method=save&site=' + Celestia.site + '&franchise_name=' + Celestia.franchise_name + '&package_name=' + Celestia.package_name + '&file_name=' + Celestia.file_name + '&html=' + encodeURIComponent(html.replace(/\\/g, '\\\\')) + '&data=' + JSON.stringify(Celestia.config, null, 4),
				success	: function() {}
			});
		}
	},
	
	/*
		function getSource( module ) - get the source code for either a module or the entire content area
	*/
	getSource : function( module ) {
		if ( !module || module == 'user' || module == 'file' ) {
			
			/* clone site-wrapper (our code) */
			//$('#temp-source').html($('#editor ' + Celestia.site_wrapper).clone(true));
			$('#temp-source').html('');
			$('#editor ' + Celestia.site_wrapper).clone().appendTo('#temp-source');
			
			/* get rid of the red box that overlays elements upon editing */
			$('#temp-source .editing-element').remove();
			$('.temp-source #unknown-module').remove();
			
			/* remove any dummy textareas for scrip tags */
			//$('#temp-source .c-script-area').parent().html('\n' + $('#temp-source .c-script-area').val());
			
			/* loop through all that needs to be removed */
			
			$.each([
				'#temp-source #controls-opener',
				], function(i, v) {
					$(v).remove();
				});
			
			var all = $('#temp-source')[0].getElementsByTagName('*');
			$(all).each(function(i, el) {
				
				var el = this;
				
				
				if ( $(this).hasClass('sortable-well') || $(this).hasClass('ui-sortable') ) {
					if ( $(this).children().length > 0 ) {
						var ul = this;
						/*
						find the last child of each LI within UL.ul-sortable
						and strip it out (as it should be a module EXCEPT for <div class"c-dummy"/>)
						and append it before the UL
						In a nutshell, all we are doing is pulling the pods out of the sortable uls
						and putting them in their respected wells
						*/
						$($(this).children()).each(function() {
							if ( $(this).children().length == 1 ) {
								var module = $(this).html();
								if ( (module.toString().indexOf('c-dummy') == -1) ) {
									$(ul).before(module);
								}
							} else if ( $(this).children().length > 1 ) {
								var module = $(this).html() + $(this).next().html();
								if ( module ) {
									if ( (module.toString().indexOf('c-dummy') == -1) ) {
										$(ul).before(module);
									}
								}
							}
						});
					}
					/* now get rid of of any ul.ul-sortable */
					$(this).remove();
				}
			});
			
			$('#temp-source').find('.c-dummy').parent().remove();
			$('#temp-source').find('a').removeAttr('onclick');
			
			$.each($('#temp-source *'), function() {
				var el = $(this)[0];
				
				/* remove some classes */
				var classes = [
					'ui-sortable-placeholder',
					'jcarousel-container',
					'jcarousel-container-horizontal',
					'jcarousel-item',
					'jcarousel-item-horizontal',
					'jcarousel-item-1',
					'ui-sortable'
				];
				$(el).removeClass(classes.join(' '));
				
				/* BEGIN - take care of some carousel stuff */
				//if ( $(el).hasClass('jcarousel-prev') || $(el).hasClass('jcarousel-next') || $(el).hasClass('jcarousel-pageimg') ) {
				var removes = [
					'.jcarousel-prev',
					'.jcarousel-next',
					'.jcarousel-pageimg'
				];
				
				if ( $(el).is(removes.join()) ) { /* this should work the same as above */
					$(el).remove();
				}
				
				if ( $(el).hasClass('jcarousel-clip') || $(el).hasClass('jcarousel-list') ) {
					$(el).parent().append($(el).html());
					$(el).remove();
				}
				
				/* END - take care of some carousel stuff */
				
				/* try to remove empty attributes */
				$.each(el.attributes, function(i, attr) {
					if ( attr ) {
						var val = attr.value;
						if ( val == '' || val === 'position: relative; left: 0px; top: 0px;' ) {
							$(el).removeAttr(attr.name);
						}
					}
				});
				
			});
			
			
			/* get the html no matter what */
			var html = $('#temp-source').html();
			
			/* the client [site] should get the source here (and manipulate) */
			if ( Celestia.clientGetsource != undefined ) {
				html = Celestia.clientGetsource.call(this, $('#temp-source'), module);
			}
			
			/* get rid of any unwanted yucky characters :-( */
			html = html
					.replace(/´/g, '\'')
					.replace(/“|”/g, '"')
					.replace(/&nbsp;/g, ' ')
					.replace(/ class=""/g, '');
			
			if ( $('#editor').html() != '' ) {
				if ( html != null ) {
					/* clear source back out */
					$('#temp-source').html('');
					return Celestia.cleanHTML(html);
				}
			}
		} else {
			/* just get the module source */
			var parent = $($(module).parent()).clone();
			if ( $(parent)[0] ) {
				$('.controls-opener', parent).remove();
				var html = Celestia.cleanHTML($(parent).html().toString());
				if ( $('#editor').html() != '' ) {
					$('#view-source').dialog('open');
					$('#txt-cma-source').val(html);
					//Celestia.selectRange({
					//	textbox		: $('#txt-cma-source')[0],
					//	start		: 0,
					//	length		: $('#txt-cma-source').val().length
					//});
				}
			}
		}
	},
	
	addHTML : function( options ) {

		var options = $.extend({
			pSelector			: '$(Celestia.module.current)',
			element				: null,
			newElSel			: '',
			hasLastClass		: '',
			carousel_per_page	: -1,
			html				: ''
		}, options);
		
		var module = Celestia.module.current,
			data = $.data(module, 'data'),
			//el = eval(options.data.selector.replace(Celestia.module_re.current, 'Celestia.module.current').replace(/{x}/g, '0'));

			el = eval(options.newElSel),
			hasClassLast = false;
		
		if ( $(el)[0] ) {
			
			/* does it have a last child with className 'last' or similar? */
			if ( el.children().eq(el.children().length - 1).hasClass('last') ) {
				el.children().eq(el.children().length - 1).removeClass('last');
				hasClassLast = true;
			}
			
			/* append the new element */
			el.append(options.html.replace(/{x}/g, el.children().length + 1));
			
			/*
				check to see if the config file for the module has a property called 'hasClass'
				if so then apply the class(es) (as comma seperated String for $.addClass)
			*/
			//if ( options.hasLastClass != '' && options.hasLastClass != undefined ) {
			//	for ( var i=1; i<el.children().length; i++ )
			//		$(el.children()[i]).removeClass(options.hasLastClass);
			//	$(el.children()[el.children().length - 1]).addClass(options.hasLastClass);
			//}
			
			if ( hasClassLast ) {
				el.children().eq(el.children().length - 1).addClass('last');
			}
			
			/* MODULE CALLBACK: for when dlg Controls has been opened */
			if ( $.data(module, 'data').htmlAdded != undefined ) {
				$.data(module, 'data').htmlAdded.call(this, el);
			}
			
		}
	},
	
	/*
		function swapContent( obj ) 
	*/
	swapContent : function( objs, options ) {
		
		var aryUndo = [],
			aryRedo = [];
		
		$.each(objs, function( i, obj ) {
			var oldHTML = obj.node != undefined ? $(obj.node).html() : null,
				html = obj.html != undefined ? obj.html : oldHTML;
			
				aryUndo[i] = {};
				aryRedo[i] = {};
			
			if ( oldHTML ) {
				
				aryUndo[i].node = obj.node;
				aryUndo[i].html = oldHTML;
				aryRedo[i].node = obj.node;
				aryRedo[i].html = html;
				
				
				$(obj.node).html('').append(html);
				Celestia.drawControls();
				Celestia.save();
				
				/* if the module in question has prop:checkModule -> then use it */
				if ( $.data(C.module.current, 'data').checkModule != undefined ) {
					$.data(C.module.current, 'data').checkModule.call(this);
				}
			}
		});
		
		Celestia.undoManager.register(undefined, function() {
			
			if ( options.beforeUndo != undefined ) {
				options.beforeUndo.call(this, aryUndo);
			}
			/* UNDO function */
			Celestia.swapContent(aryUndo, options);
			
			if ( options.afterUndo != undefined ) {
				options.afterUndo.call(this, aryUndo);
			}
		}, [], 'Undo::Celestia.swapContent()', undefined, function() {
			
			if ( options.beforeRedo != undefined ) {
				options.beforeRedo.call(this, aryRedo);
			}
			/* REDO function */
			Celestia.swapContent(aryRedo, options);
			if ( options.afterRedo != undefined ) {
				options.afterRedo.call(this, aryRedo);
			}
		}, [], 'Redo::Celestia.swapContent()');
		
	},
	
	createEditingElement : function( el, isa, max_width, left ) {
		/*
			TODO:
			
			I think el AND isa are always the same, investigate
		*/
		
		var div = $('<div class="editing-element"/>'),
			parent = $(el).parent(),
			a = $(el)[0].nodeName.toLowerCase() == 'a' ? true : false,
			/*
				is this element an anchor? and if so, is it an only child?
				used for creating the editing-element (overlay)
			*/
			a = ( a && $($(el).parent()).children().length == 1 );
		
		$(div).appendTo(a ? parent.parent() : parent);
		Celestia.positionEditingElement(el, isa, max_width, left);
		
		$.data(div[0], 'position', $(parent).css('position'));
	},
	
	positionEditingElement : function( el, isa, max_width, left ) {
		var parent = $(el).parent(),
			pos = parent.css('position'),
			selector = isa,
			isa = $(el)[0].nodeName.toLowerCase() == 'a' ? true : false,
			/*
				is this element an anchor? and if so, is it an only child?
				used for creating the editing-element (overlay)
			*/
			isa = ( isa && $($(el).parent()).children().length == 1 ),
			borderTopWidth = !isNaN(parseInt($(el).css('border-top-width'), 10)) ? parseInt($(el).css('border-left-width'), 10) : 0,
			borderRightWidth = !isNaN(parseInt($(el).css('border-right-width'), 10)) ? parseInt($(el).css('border-left-width'), 10) : 0,
			borderBottomWidth = !isNaN(parseInt($(el).css('border-bottom-width'), 10)) ? parseInt($(el).css('border-left-width'), 10) : 0,
			borderLeftWidth = !isNaN(parseInt($(el).css('border-left-width'), 10)) ? parseInt($(el).css('border-left-width'), 10) : 0,
			width = isa
					? max_width != '95%'
						? max_width
							: parent.outerWidth(true) - (borderLeftWidth + borderRightWidth) + 'px'
								: max_width != '95%' ? max_width : $(el).outerWidth(true) - (borderLeftWidth + borderRightWidth) + 'px';

		$('.editing-element')
			.css({
				filter		: 'alpha(opacity=' + 15 + ')',
				height		: isa ?
								parent.outerHeight() - (borderTopWidth + borderBottomWidth) + 'px' :
								$(el).outerHeight() - (borderTopWidth + borderBottomWidth) + 'px',
				left		: left != ''
								? left
								: isa ? parent.position().left - (borderLeftWidth + borderRightWidth / 2) + 'px' :
									//$(el).position().left - ( parseInt($(selector).css('padding-left'), 10) + parseInt($(selector).css('padding-right'), 10) ) + 'px',
									$(el).position().left - (borderLeftWidth + borderRightWidth / 2) + 'px',
				top			: isa ?
								parent.position().top - (borderTopWidth + borderBottomWidth / 2) + 'px' :
								$(el).position().top - (borderTopWidth + borderBottomWidth / 2) + 'px',
				width		: width
			});
	},
	
	hideOverlay : function( element ) {
		var element = element != undefined ? element : $('#controls-opener');
		$(element)
			.css({
				display	: 'none',
				height	: '0px',
				width	: '0px'
			})
			.unbind('click')
			.appendTo(document.body);
	},
	
	disableLinks : function() {
		var module = Celestia.module.current,
			data = $.data(module, 'data');
		
		if ( module && data ) {
			/*
				let's try and disable all anchors for said module at hand in case the user clicks on one
				not sure if I really care to renable them upon dialog close
			*/
			$(module).find('a').unbind('click').live('click', function(e) {
				e.preventDefault();
				return false;
			});
		}
	},
	
	/*
		this method handles all of the creation of all of the default controls for a module
	*/
	openControls : function() {
		
		var module = Celestia.module.current,
			data = $.data(Celestia.module.current, 'data');
		
		/* make sure we have the module and it's data */
		if ( module && data ) {
			
			if ( $('#dlg-controls').dialog('isOpen') ) {
				Celestia.drawControls();
			} else {
				
				Celestia.disableLinks();
				/*
					we're binding save on close for dlg controls here because on startup it actually opens
					and closes one time and will mess up the save process making it ::::::main-@Date...
					(if restore or set source was processed) because it doesn't have site and package name
				*/
				$('#dlg-controls')
					.unbind('dialogclose')
					.bind('dialogclose', function(e, ui) {
						setTimeout(function() { Celestia.save(); }, 500);
					});
				Celestia.drawControls();
				/* open the controls */
				Celestia.module.last_edited = module;
				$('#dlg-controls').dialog('open');
				
				/* MODULE CALLBACK: for when dlg Controls has been opened */
				if ( $.data(module, 'data').controlsOpened != undefined ) {
					$.data(module, 'data').controlsOpened.call(this);
				}
			}
			/* set the title of the dialog no matter what because it will be open at this point */
			$('#dlg-controls').dialog('option', 'title', 'Edit: ' + data.name != undefined ? data.name : 'Unknown Module');
		} else {
			
			if ( module && $(module).attr('id') != 'unknown-module' ) {
				Celestia.drawControls();
				Celestia.disableLinks();
				
				if ( !$('#dlg-controls').dialog('isOpen') ) {
					$('#dlg-controls').dialog('open');
				}
				$('#dlg-controls').dialog('option', 'title', 'Edit: Unknown Module');
			}
		}
	},
	
	getXPath : function(el) {
		var path = '';
		
		for (; el && el.nodeType == 1; el = el.parentNode) {
			var idx = $(el.parentNode).children(el.tagName).index(el) + 1;
			idx > 1 ? (idx = '[' + idx + ']') : (idx = '');
			path = '/' + el.tagName.toLowerCase() + idx + path;
		}
		return path;
	},
	
	scanModule : function() {
		var sections = [],
			
			module = Celestia.module.current,
			data = $.data(module, 'data'),
			module_xpath = Celestia.getXPath(module) + '/';
		$(module).find('*').each(function() {
			
			var tag_name = this.tagName.toLowerCase(),
				section = {
					name		: 'Section',
					elements	: []
				},
				elements = [],
				xpath = Celestia.getXPath(this).replace(module_xpath, ''),
				xpath_nodes = xpath.split('/'),
				str = '$({module})',
				num = 0,
				name = '',
				element = {
					name		: 'Unknown Element',
					selector	: '$({module})',
					editables	: [],
					options		: {
						affects			: '',
						can_target 		: true,
						extract	: ''
					}
				};
		
			$.each(xpath_nodes, function(i, n) {
				var eq = n.match(/\[.*\]/);
				if ( eq ) {
					n = n.replace(eq[0], '');
					num = parseInt(eq[0].replace(/\[|\]/g, ''), 10);
				}
				str += '.find("' + n + '").eq(' + (eq ? ( !isNaN(num) ? (num - 1) : 0) : 0) + ')';
			});
			
			/* gather element data */
			if ( ( $(this).text() != '' && $(this).children().length == 0 ) || tag_name == 'img' ) {
				
				element['name'] = tag_name;
				element['selector'] = str;
				
				switch ( tag_name ) {
					case 'img' : {
						name = 'Image';
						element['editables'] = [{
							alt	: {
								label	: 'Alt',
								value	: ''
							},
							src : {
								label	: 'URL',
								value	: $(this).attr('src')
							}
						}];
						break;
					}
					case 'a' : {
						name = 'Call to Action';
						element['editables'] = [{
							href : {
								label	: 'URL',
								value	: $(this).attr('href')
							},
							html : {
								label	: 'Text',
								value	: $(this).text()
							}
						}];
						break;
					}
					case 'style' : {
//						name = 'Layout';
//						element['options']['extract'] = /\("(.*?)"\)/;
//						element['editables'] = [{
//							html : {
//								label	: 'Text',
//								value	: $(this).text().match(/\("(.*?)"\)/)[1]
//							}
//						}];
						break;
					}
					/* a, p, li, span, etc */
					default : {
						name = 'Copy';
						element['editables'] = [{
							html : {
								label	: 'Text',
								value	: $(this).text()
							}
						}];
						break;
					}
				}
				//section['name'] = name;
				/* the commented code below works (just fancy) */
				section['name'] = name + ': &lt;' + tag_name + '&gt;';
				
				section['elements'].push(element);
				sections.push(section);
			} else {
				/*
					looking for anchors with children (e.g. <a href="#"><img/></a>)
					note: these anchors CAN target pages (checkbox)
				*/
				if ( this.tagName.toLowerCase() == 'a' && $(this).children().length > 0 ) {
					element['name'] = tag_name;
					element['selector'] = str;
					name = 'Call to Action';
					element['options']['can_target'] = false;
					element['editables'] = [{
						href : {
							label	: 'URL',
							value	: $(this).attr('href')
						}
					}];
					section['name'] = name + ': &lt;' + tag_name + '&gt;';
					section['elements'].push(element);
					sections.push(section);
				}
			}
		});
		data = $.extend(data, { sections: sections });
		$.data(module, 'data', data);
		Celestia.drawControls();
	},
	
	/*
		function() drawControls
			
			Draws / redraws the "Edit [module]" dialog box
	*/
	drawControls : function( section, scrollTo, start ) {
		
		var module = Celestia.module.current,
			data = $.data(module, 'data');
		
		if ( !data || data.sections.length == 0 ) {
			
			/* here we will bypass the drawing of an existing module and try to create one instead */
			Celestia.scanModule();
			
			/* err:300 */
			Celestia.console.error(Celestia.errors['DRAW_CONTROLS_NO_DATA']);
			return false;
		}
		
		/* make sure the dialog is clean */
		$.each($('#dlg-controls .controls').children(), function() {
			$(this).html('');
		});
		
		var resetColorsHeader = $('<h2>Can\'t see textbox values? - </h2>').appendTo('#dlg-controls .inputs-wrap'),
			resetColorsLink = $('<a href="javascript:void(0);">reset pastel background colors</a>');
		
		$(resetColorsLink).click(function() {
			var bgColor = '';
			
			$.each($('.controls-section-wrap'), function(i, el) {
				/* create a random pastel color */
				var color = new Color(Celestia.pastel());
				Celestia.gradientBackground(el, color, '#FFFFFF');
				Celestia.colors[$(this).attr('class').replace('controls-section-wrap ', '')] = color.toString();
				
				$.each($(el).find('.element-wrap, .dynamic-wrap'), function(j, el) {
					
					color = new Color(color);
					bgColor = color.getLighter(50);
					
					Celestia.gradientBackground(el, bgColor, '#FFFFFF');
				});
			});
		}).appendTo(resetColorsHeader);
		
		if ( data.menu ) {
			$('#dlg-controls .inputs-wrap').json2HTML(data.menu);
		}
		
		/* are there any buttons to be made? */
		if ( data.buttons ) {
			$.each(data.buttons, function() {
				$.each(this, function( name, prop ) {
					var wrap = $('<div>'),
						nodeName = this.nodeName != undefined ? this.nodeName : 'button',
						el = $('<' + nodeName + '/>');
					
					$(el)
						.addClass(name)
						.css({
							padding		: '0.2em 0.6em 0.3em',
							margin		: '0em 0.4em 0.5em 0',
							cursor		: 'pointer'
						})
						.addClass('ui-state-default ui-corner-all');
					
					$.each(this, function(j) {
						switch (j) {
							case 'addClass':
							case 'val':
							case 'text':
							case 'html':
							case 'attr':
							case 'css': {
								eval ('$(el).' + j + '("' + this + '");');
								break;
							}
							default: {
								eval ('$(el).' + j + '(' + this + ');');
								break;
							}
						}
					});
					
					$(wrap)
						.append(el)
						.appendTo('#dlg-controls .inputs-wrap');
					
				});
			});
		}
		
		var re = new RegExp('{x}', 'g'),
			getSections = function( wrap, sections ) {
				
				/* loop through each object within a section */
				$.each(sections, function(i, section) {
					var rc = Celestia.genHex(),
						/* generate a random color for the background of the section */
						backgroundColor = new Color(Celestia.pastel()),
						name = section.name != undefined ? section.name : 'Unknown Sectrion',
						className = section.name.toLowerCase().replace(/\s|\//g, '-').replace(/\(|\)/g, ''),
						strSelector = section.selector != undefined ? section.selector
//										.replace(/{parent}|{p}/g, pSelector)
										.replace(Celestia.module_re.current, '$(Celestia.module.current)')
										.replace(re, i) : '',
						selector = strSelector != '' ? eval(strSelector) : null;
					
						if ( $('#dlg-controls').dialog('isOpen') ) {
							if ( Celestia.colors[className] != undefined ) {
								backgroundColor = Celestia.colors[className];
							}
						}

					if ( section.selector != undefined ) {
						if ( !$(selector)[0] ) {
							return;
						}
					}
					
					/* create a section */
					var sectionWrap = Celestia.createSection({
						wrap			: wrap,
						class			: className,
						html			: section.name,
						backgroundColor	: backgroundColor
					});
	
					$.each(section, function( property, value) {
						switch ( property ) {
							case 'sections': {
								getSections(sectionWrap, value);
								break;
							}
							case 'elements': {
								getElements(sectionWrap, value, depth, backgroundColor);
								break;
							}
						}
					});
					
				});
			},
			bgColor = '',
			getElements = function( wrap, elements, counter, bg, parent, pSelector ) {
			
				function processSelector( obj, dynamic ) {
					var sections = obj.sections != undefined ? obj.sections : null,
						strSelector = obj.selector
										.replace(/{parent}|{p}/g, pSelector)
										.replace(Celestia.module_re.current, '$(Celestia.module.current)')
										.replace(re, counter),
						selector = eval(strSelector),
						editables = dynamic ? null : obj.editables,
						elements = dynamic ? obj.elements : null,
						markup = obj.markup != undefined ? obj.markup : null,
						loopOnce = obj.loopOnce != undefined ? obj.loopOnce : false,
						options = obj.options != undefined ? obj.options : true,
						prepend = obj.prepend != undefined ? obj.prepend : false,
						affects = obj.affects != undefined
										? obj.affects
											.replace(Celestia.module_re.current, '$(Celestia.module.current)')
											.replace(re, counter)
										: '',
						callback = obj.callback != undefined ? obj.callback : null;
						extract = obj.extract != undefined ? obj.extract : null;
					
					if ( sections ) {
						getSections(wrap, sections);
					}
					
					if ( selector[0] ) {
						
						Celestia.gradientBackground(elementWrap, bgColor, '#FFFFFF');
						Celestia.gradientBackground(hr, '#000000', '#FFFFFF');
						
						if ( dynamic ) {
							
							depth += 1;
							wrap = elementWrap;
							
							if ( !markup ) {
								Celestia.console.log('Dynamic content detected, no markup property');
							}
							
							var btnAddItem = $('<a href="javascript:;"/>')
												.html('Add Item')
												.click(function() {
													$('.editing-element').remove();
													Celestia.addHTML({
														pSelector	: pSelector,
														newElSel	: strSelector,
														element	: obj,
														html	: markup
													});
													Celestia.drawControls(null, $('#dlg-controls').scrollTop(), start);
													Celestia.save();
												})
												.appendTo($('<p/>').appendTo(elementWrap)),
								btnRemItem = $('<a href="javascript:;"/>')
												.html('Rem Item')
												.click(function() {
													if ( $(selector).children().length > 1 ) {
														$(selector).children(':last-child').remove();
														Celestia.drawControls(null, $('#dlg-controls').scrollTop(), start);
														Celestia.save();
													}
												})
												.appendTo($('<p/>').appendTo(elementWrap));
							/*
								for dynamic elements:
									- create a view
									- loop through parents children creating inputs for each child
							*/
							$.each( $(selector).children(), function(i) {
								
								getElements(wrap, elements, loopOnce && start != undefined ? start : i, bg, selector, strSelector);

								if ( loopOnce ) {
									return false;
								}
								
							});
							
							depth -= 1;
							wrap = $(elementWrap).parent().parent();
						}
						
						if ( editables ) {
							var input = null;
							
							$.each(editables, function( i, editable ) {
								
								/*
									editable = {
										id		: {
											label		: '',
											value		: ''
										},
										html	: {
											label		: '',
											value		: '',
											callback	: function() {},
											noHighlight	: true
										}
									}
								*/
								$.each(editable, function( property, value ) {
									
									var max_width = this.max_width != undefined ? this.max_width : '95%',
										left = this.left != undefined ? this.left : '',
										callback = this.callback != undefined ? this.callback : null,
										updateComplete = this.updateComplete != undefined ? this.updateComplete : null,
										required = this.required != undefined ? this.required : true,
										textbox_value = (property === 'html' || property === 'text') ?
															$(eval(selector)).children().length > 0 ?
																$(eval(selector)).html() :
																$(eval(selector)).text() :
																$(eval(selector)).attr(property);
									
									if ( extract ) {
										var otv = textbox_value,
											textbox_value = textbox_value.match(extract)[1] || textbox_value,
											replace_text = otv.replace(textbox_value, '{replace}');
									}
									
									input = Celestia.createInput({
										editable		: this,
										value			: this.value ? this.value : '',
										section			: section,
										type			: this.type != undefined ? this.type : 'text',
										selections		: this.selections != undefined ? this.selections : [],
										sub_section		: property,
										selector		: selector, /* what element to change? */
										affects			: affects, /* what element to change? */
										attr			: property, /* what will we need to change? */
										sec_wrap		: elementWrap,
										left			: left,
										max_width		: max_width,
										noHighlight		: this.noHighlight != undefined ? this.noHighlight : false,
										replace_text	: replace_text || '',
										callback		: callback,
										updateComplete	: updateComplete,
										txt_val			: textbox_value,
										required		: required,
										prepend			: prepend,
										onlyText		: this.onlyText != undefined ? this.onlyText : false,
										lbl_html		: this.label != undefined ? this.label.replace(re, counter + 1) : '(unknown label)',
										options			: options
									});
									
									/*
										?editable element within module :: click
										(selector) e.g. the element in which the input is being created for.
										we will give it a click event to have the controls dialog scroll to
										the associated input that gets created for this element
										
										We also preventDefault for all anchors (return false;) however this is controlled by Celestia.test_links
									*/
									$(eval(selector))
										.unbind('click')
										.click(function(e) {
											e.stopPropagation();
											$('.inputs-wrap .contenteditable').removeClass('current');
											$(input).addClass('current');
											Celestia.scrollTo($($(input)[0]).parent().parent());
											$('.editing-element').remove();
											if ( !this.noHighlight ) {
												Celestia.createEditingElement( this, selector, max_width, left );
											}
											if ( !Celestia.test_links ) {
												return false;
											}
										});
								});
							});
							
							if ( input && callback != undefined ) {
								callback.call(this, input, $(input).html());
							}
						}
					}
				};
				
				var counter = counter != undefined ? counter : 0,
					color = new Color(bg);
					bgColor = color.getLighter(50),
					parent = parent || Celestia.module.current,
					pSelector = pSelector || '$(Celestia.module.current)';
				
				$.each(elements, function(i, element) {
					
					var name = element.name.replace(re, counter + 1) || 'Element (unknown)',
						dynamic = element.elements != undefined ? true : false;
						
						
					
					if ( element.selector != undefined ) {
						var strSelector = element.selector
										.replace(/{parent}|{p}/g, pSelector)
										.replace(Celestia.module_re.current, '$(Celestia.module.current)')
										.replace(re, counter),
							selector = eval(strSelector);
						if ( !$(selector)[0] ) {
							return;
						}
					}
					
					if ( element.selectors != undefined ) {
						if ( element.selectors[0].selector != undefined ) {
							var strSelector = element.selectors[0].selector
										.replace(/{parent}|{p}/g, pSelector)
										.replace(Celestia.module_re.current, '$(Celestia.module.current)')
										.replace(re, counter),
								selector = eval(strSelector);
							if ( !$(selector)[0] ) {
								return;
							}
						}
					}

					elementWrap = $('<div class="' + (dynamic ? 'dynamic' : 'element') + '-wrap ' + name.toLowerCase().replace(/\s/g, '-') + '"/>').appendTo(wrap);
					
					hr = $('<div class="hr"/>').appendTo(wrap);
					h3 = $('<h3/>')
							.html(name)
							.click(function() {
								var self = this;
								$.each($($(this).parent()).children(), function() {
									if ( this != self ) {
										$(this).toggle();
									}
								});
							})
							.appendTo(elementWrap);

					if ( element.selectors ) {
						$.each(element.selectors, function(i, selector) {
							processSelector(this, dynamic);
						});
					} else {
						processSelector(element, dynamic);
					}
				});
				
			};
		
		/* depth isn't really being used but is good to keep in to log */
		var depth = 0;

		/* CALLBACK: for when dlg Controls has been opened */
		if ( $.data(module, 'data').beforeReadSections != undefined ) {
			$.data(module, 'data').beforeReadSections.call(this);
		}
		
		if ( data.sections ) {
			getSections($('.inputs-wrap'), data.sections);
		}
		
		/* ONLY IF there are no controls found for this module */
		if ( !data.sections && !data.buttons ) {
			$('#dlg-controls .inputs-wrap').html('<p class="info">No controls for this module.</p>');
		}
		
		/* CALLBACK: for when dlg Controls has been opened */
		if ( $.data(module, 'data').controlsDrawn != undefined ) {
			$.data(module, 'data').controlsDrawn.call(this);
		}
		
		/*
			ADDDED : 01-23-2013 if user clicks "add item" or "rem item" in the controls,
			try to scroll back to previous position
		*/
		if ( scrollTo != undefined ) {
			$('#dlg-controls').scrollTo(scrollTo);
		}
	},
		
	scrollTo : function( el ) {
		$('#dlg-controls, #dlg-main-menu').scrollTo(el, 1000);
	},
	
	gradientBackground : function( el, c1, c2 ) {
		$(el).css({
			background: $.browser.webkit ?
							'-webkit-gradient(linear, left top, right top, from(' + c1 + '), to(' + c2 + '))' :
							'-moz-linear-gradient(right center , ' + c2 + ' 50%, ' + c1 + ' 100%) repeat scroll 0 0 transparent'
		});
	},
	
	createSection : function( options ) {
		var options = $.extend({
			wrap			: '#dlg-controls .inputs-wrap',
			class			: '',
			html			: 'Section',
			backgroundColor	: 'transparent'
		}, options);

		var sec_wrap = document.createElement('div');
		
		$(sec_wrap)
			.addClass('controls-section-wrap ' + options.class)
			.appendTo(options.wrap);
			
		Celestia.colors[options.class] = options.backgroundColor;
			
		Celestia.gradientBackground(sec_wrap, options.backgroundColor, '#FFFFFF');
		$.data(sec_wrap, 'backgroundColor', options.backgroundColor);
		
		var label = $('<label>');
		$(label)
			.html(options.html)
			.click(function() {
				var self = this;
				$.each($($(this).parent()).children(), function() {
					if ( this != self ) {
						$(this).toggle();
					}
				});
			});
		$(sec_wrap).append(label);
		return sec_wrap;
	},
	
	setInputMessage : function( input, msg ) {
		$(input).parent().find('.msg').html(msg);
	},
	
	clearInputMessage : function( input ) {
		$(input).parent().find('.msg').html('');
	},
	
	getSelectionHtml : function() {
		var str = '';
		if (typeof window.getSelection != "undefined") {
			var sel = window.getSelection();
			if (sel.rangeCount) {
				var container = document.createElement("div");
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				str = container.innerHTML;
			}
		} else if (typeof document.selection != "undefined") {
			if (document.selection.type == "Text") {
				str = document.selection.createRange().htmlText;
			}
		}
		return str;
	},
	
	createInput : function( options ) {
		var options = $.extend({
			editable		: null,
			value			: '',
			section			: '',
			sub_section		: null,
			selector		: '',
			affects			: '',
			attr			: '',
			sec_wrap		: null,
			txt_val			: '',
			lbl_html		: '',
			left			: '',
			replace_text	: '',
			callback		: null,
			updateComplete	: null,
			required		: true,
			max_width		: '95%',
			can_target		: true,
			prepend			: false,
			noHighlight		: false,
			type			: 'text',
			onlyText		: false,
			selections		: [],
			options			: { can_target: true}
		}, options);
		
		if ( !$(eval(options.selector))[0] ) {
			Celestia.console.error('Error: !$(options.selector)[0] was not found - ' + options.selector);
			return false;
		}
		
		function getChildren() {
			var children = $(eval(options.selector)).children().length > 0 ? $($(eval(options.selector)).children()) : null;
			if ( children ) {
				$.each(children, function() {
					childrenText.push($(this).text().replace(/\?/g, '\\?'));
				});
			}
			return children;
		};
		
		/* create the inputs wrap */
		var wrap = $('<div class="' + options.sub_section + '"/>').appendTo($(options.sec_wrap));
		
		/* create the inputs label */
		var label = $('<label/>')
					.html(options.lbl_html)
					.click(function() {
						$(toggleWrap).toggle();
					})
					.appendTo(wrap);
		
		/* create a wrapper for the input textbox */
		var toggleWrap = $('<div/>').appendTo(wrap);
		
		var childrenText = [],
			children = getChildren(),
			re_ch = new RegExp(childrenText.join('|'), 'g');
		
		switch ( options.type ) {
			
			case 'select' : {
				
				var input = $('<select/>')
						.change(function() {
							clog('select combobox change ', $(this).val());
						})
						.appendTo(toggleWrap);
				
				$.each(options.selections, function( index, selection ) {
					var opt = $('<option value="' + selection.value + '">' + selection.name + '</option>').appendTo(input);
				});
				$(input).combobox({
					value		: options.selector.attr('class'),
					callback	: function( value ) {
						options.selector.attr('class', value);
					}
				});
				break;
			}
			default : {
				
//				clog('onlyText: ', options.onlyText, options.txt_val);
				
				/* create the textbox */
				var html = children
							? options.onlyText ? 
								$(eval(options.selector)).text() :
							options.txt_val.replace(/<((.|\n)*?)>/g, '[$1]')
							: options.txt_val,
					childrenText2 = '';
//				var html = children ?
//							options.txt_val.replace(/<((.|\n)*?)>/g, '[$1]') :
//							options.txt_val,
//					childrenText2 = '';
				
				if ( options.onlyText ) {
					childrenText2 = $(eval(options.selector)).html().replace($(eval(options.selector)).text(), '{childrenText2}');
				}
				
//				clog(childrenText2, options.selector)
				
				var input = $('<div class="contenteditable" contenteditable/>')
						.html(html)
						.addClass( ( options.txt_val == '' ) && options.required ? 'required' : options.txt_val == '#' ? 'warning' : '' )
						.css({
							minHeight		: ( options.lbl_html.toLowerCase() == 'alt'
												|| options.lbl_html.toLowerCase() == 'src'
												|| options.lbl_html.toLowerCase() == 'url'
												|| options.lbl_html.toLowerCase() == 'href'
												|| options.lbl_html.toLowerCase() == 'target' ) ? '20px' : $(eval(options.selector)).css('line-height'),
							maxWidth		: options.max_width,
							width			: '95%',
							fontFamily		: $(eval(options.selector)).css('font-family'),
							fontSize		: $(eval(options.selector)).css('font-size'),
							fontWeight		: $(eval(options.selector)).css('font-weight'),
							lineHeight		: ( options.lbl_html.toLowerCase() == 'alt'
												|| options.lbl_html.toLowerCase() == 'src'
												|| options.lbl_html.toLowerCase() == 'url'
												|| options.lbl_html.toLowerCase() == 'href'
												|| options.lbl_html.toLowerCase() == 'target' ) ? '20px' : $(eval(options.selector)).css('line-height'),
							paddingBottom	: $(eval(options.selector)).css('padding-bottom'),
							paddingLeft		: $(eval(options.selector)).css('padding-left'),
							paddingTop		: $(eval(options.selector)).css('padding-top'),
							paddingRight	: $(eval(options.selector)).css('padding-right'),
							textTransform	: $(eval(options.selector)).css('text-transform'),
							textAlign		: $(eval(options.selector)).css('text-align'),
							/* prevents textarea elemnts from being resizable */
							resize			: 'none'
						})
						.addClass('text ui-widget-content ui-corner-all')
						.focus(function() {
							
							var data = $.data(this, 'data') || null,
								options = data.options,
								self = this;
								
							$('.inputs-wrap .contenteditable').removeClass('current');
							$(this).addClass('current');
							
							/* if we have data and NOT IMG tag */
							if ( data && /*options.selector[0].nodeName.toLowerCase() != 'img' &&*/ options.selector[0].nodeName.toLowerCase() != 'script' && options.selector[0].nodeName.toLowerCase() != 'style' ) {
								/* create DIV#editing-element and fit it to the size and position of the element we're editing */
								/* make certain there are no editing elements */
								
								var el = options.selector;
								
								$('.editing-element').remove();
								if ( !options.noHighlight ) {
									Celestia.createEditingElement( el, options.selector, options.max_width, options.left );
								}
				
								/* also attach a toolbar for the textarea for HTML editing only */
								if ( options.attr == 'html' ) {
									if ( $('#textarea-toolbar-wrap')[0] ) {
										$('#textarea-toolbar-wrap').remove();
									}
									var wrap = $('<div id="textarea-toolbar-wrap"/>');
									
									$(wrap)
										.appendTo($(this).parent());
									var label = $('<label class="clrfix"/>').appendTo(wrap);
								}
							}
						})
						.blur(function() {
							$(this).removeClass('current');
							if ( $('.editing-element')[0] ) {
								var el = $.data(this, 'data')['selector'];
								$(el).parent().css('position', $.data($('.editing-element')[0], 'position'));
								$('.editing-element').remove();
							}
						})
						.keyup(function() {
							var data = $.data(this, 'data') || null,
								options = data.options;
							
							if ( data ) {
								var el = options.selector;
									children = $(eval(options.children)),
									parent = el.parent(),
									affects = $(eval(options.affects)),
									attr = options.attr,
									section = options.section,
									value = options.value,
									module_data = $.data(Celestia.module.current, 'data'),
									val = $(this).text(),
									callback = options.callback;
								
								clog('EL: ', el);
								
								if ( val == '#' ) {
									$(this).addClass('warning');
								} else {
									$(this).removeClass('warning');
								}
								
								if ( val == '' ) {
									$(this).addClass('required');
								} else {
									$(this).removeClass('required');
								}
								
								Celestia.positionEditingElement( el, options.selector, options.max_width, options.left );
									
								if ( callback ) {
									var skip = callback.call(this, this, val, data) || false;
								}
								
								if ( !skip ) {
									
									if ( options.replace_text ) {
										val = options.replace_text.replace(/{replace}/, val);
									}
									
									var children = getChildren(),
										childrenText = [],
										re_ch = new RegExp(childrenText.join('|'), 'g');
						
									if ( attr === 'html' ) {
										var v = children ? val.replace(/\[((.|\n)*?)\]/g, '<$1>') : val;
//										clog('data.childrenText2 ', data.childrenText2, v);
										el.html(data.childrenText2.replace(/{childrenText2}/g, v));
//										el.html(v);
									} else {
										el.attr(attr, val);
										
										/* does the HREF affect any other elements? */
										if ( attr === 'href' && affects[0] ) {
											
											/*
												try to determine if the anchor is within a list
												- if so, only allow the list item's anchor affect
												other HREF attributes
											*/
											if ( $(el).parents('ul')[0] ) {
												if ( $(el).closest('li').index() == 0 ) {
													affects.attr('href', val);
												}
											} else {
												affects.attr('href', val);
											}
										}
									}
								}
								clog('options.updateComplete: ', options.updateComplete);
								if ( options.updateComplete ) {
									options.updateComplete.call(this, this, val, data);
								}
								
								/* we don't want to pound the save on keyup */
								var t = new Date().getTime();
								if ( t > (Celestia.key_stroke_time + 1000) ) {
									/* incase the user typed a url into a field */
									Celestia.disableLinks();
									Celestia.save();
								}
								Celestia.key_stroke_time = t;
							}
						}).appendTo(toggleWrap);
				break;
			}
		}
				
		/* now we will create a message line for each input - will be directly under the input */
		var p = $('<p class="msg"/>').appendTo(toggleWrap);
		
		/* tell the input what element to look for and what to change */
		$.data(input[0], 'data', {
			options			: options,
			children		: children,
			childrenText2	: childrenText2
		});
		
		/* are we creating an anchor? */
		var node_name = $(eval(options.selector))[0].nodeName.toLowerCase();
		
		if ( node_name == 'a' && options.attr == 'href' && options.can_target ) {
			/* create a checkbox for allowing target on anchors */
			var label = $('<label style="font:11px arial;position:relative;top:-5px"> :new window</label>').appendTo(toggleWrap),
				chk = $('<input type="checkbox" style="position:relative;top:3px;"/>'),
				target = $(eval(options.selector)).hasAttr('target');
			
			$(chk)
				.click(function() {
					var el = $(eval($.data(chk, 'selector'))),
						affects = $(eval($.data(chk, 'affects')));
					el.add(affects).attr('target', $(this).attr('checked') ? '_blank' : '');
				}).prependTo(label);
			
			if ( target ) {
				$(chk).attr('checked', 'checked');
			}
			
			$.data(chk, 'selector', options.selector);
			$.data(chk, 'affects', options.affects);
			
			if ( Celestia.anchorInputCreated ) {
				Celestia.anchorInputCreated.call(this, wrap, toggleWrap, label, input, options);
			}
		}
		
		label.toggleWrap = toggleWrap;
		return input;
	},
	
	/* strips out unwanted information and cleans tags */
	cleanHTML : function( html ) {
		/* convert any {script_word} tags to script tags for usage */
		var script_word = new RegExp(Celestia.script_word, 'gi');
		return html
				.replace(script_word, 'script')
				.replace(/•/gi, '&bull;')
				.replace(/…/gi, '&hellip;');
	},
	
	dirtyHTML : function( html ) {
		var jscript_word = new RegExp('java' + Celestia.script_word + ':', 'gi');
		return html
			.replace(/(<\/?)script/gi, '$1' + Celestia.script_word)
			.replace(/&hellip;/gi, '&hellip;')
			.replace(jscript_word, 'javascript:');
	},
	
	
	/* special - that can be called from init (within a module) */

	/*
		this function can be called from a module's init()
		- pass in a selector to find within said module to make sortable
			- the advantage is that upon sort->stop the document is saved
			also if the user sorts an item (say a list item) - they have now reordered that list
			but if the controls dialog is open, the corosponding textboxes won't match the UL list
			so it will have to be reset
		
			note: this should be able to be achieved within the module solely just by calling Celestia.save()
	*/
	sortable : function( selectors, callbacks ) {
		
		Celestia.console.log('function:sortable - elements: ', selectors);
		
		var each = selectors != undefined ? $(selectors, Celestia.module.current) : $(Celestia.module.current);
		$.each(each, function() {
			$(this).sortable({
				sort: function(e, ui) {
					/* bwfore we save, let's see if there was a callback */
					if ( callbacks && callbacks.sort ) {
						callbacks.sort.call(this, e, ui);
					}
					
				},
				start: function(e, ui) {
					/* remove any instance of .editing-element */
					$('.editing-element').remove();
					
					/* bwfore we save, let's see if there was a callback */
					if ( callbacks && callbacks.start ) {
						callbacks.start.call(this, e, ui);
					}
					
					/* collect the classes for JUST below on sort stop */
					Celestia.hasFirst = false;
					Celestia.hasLast = false;
					Celestia.innerSortedEl = null;
					
					$(ui.item).parent().children().each(function(i, el) {
						var el = $(el)[0];
						
						if ( el && el.nodeType == 1 ) {
							
							if ( !$(el).is('.ui-sortable-placeholder') ) {
								
								if ( $(el).hasClass('first') ) {
									Celestia.innerSortedEl = el;
									Celestia.hasFirst = true;
								}
								
								if ( $(el).hasClass('last') ) {
									Celestia.innerSortedEl = el;
									Celestia.hasLast = true;
								}
							}
						}
					});
				},
				beforeStop : function(e, ui) {
					
					/* bwfore we save, let's see if there was a callback */
					if ( callbacks && callbacks.beforeStop ) {
						callbacks.beforeStop.call(this, e, ui);
					}
					
				},
				stop : function(e, ui) {
					
					Celestia.console.info('Sorted module items: ', ui.item);
					
					/* bwfore we save, let's see if there was a callback */
					if ( callbacks && callbacks.stop ) {
						callbacks.stop.call(this, e, ui);
					}
					
					/* re-assign the classes back in order as collected from above */
					if ( Celestia.hasFirst ) {
						$(Celestia.innerSortedEl).removeClass('first');
						$(ui.item).parent().children(':last-child').addClass('first');
					}
					if ( Celestia.hasLast ) {
						$(Celestia.innerSortedEl).removeClass('last');
						$(ui.item).parent().children(':last-child').addClass('last');
					}
					/*
						if the controls dialog is open and we just sorted something,
						we might need to readjust the textboxes values to match the
						newly reordered list (or what not) - we'll just loop through
						them all!
					*/
					setTimeout(function() { $('.editing-element').remove(); }, 500);
					Celestia.drawControls();
					Celestia.save();
				}
			});
		});
	},
	
	showHelp : function( section ) {
		/*
			fancy way to hide all .bd > children and then show either .main-menu or a section
			e.g. show => #dlg-help .bd .restore-session
		*/
		$('#dlg-help')
			.find('.bd > div').hide()
			.end()
			.find(section != undefined ? '.' + section : '.main-menu')
			.show()
			.end()
			.dialog('open');
		/* make certain to hide the context menu */
		Celestia.closeContext();
	},
	
	closeContext : function() {
		$('#context-menu .module-button').hide();
		$('#context-menu').hide();
	},
	
	loadSkin : function( options ) {
		var options = $.extend({}, options);
		
		if ( Celestia.site != '' ) {
			/* try and load some skins for [site] */
			$.each(options, function( name, url ) {
				$('.' + name).remove();
				$(document.body).append('<link class="' + name + '" type="text/css" href="' + url + '" rel="stylesheet"/>');
			});
		}
	}
	
});


/* START UP */

$(function() {


function isInvalid( str, invalid ) {
	for ( var i = 0; i < str.length; i++ ) {
		if ( invalid.indexOf(str.charAt(i)) != -1 ) {
			return true;
		}
	}
	return false;
};


/************/
/* Start Up */
/************/
Celestia.console = $.console();
Celestia.console.log('Starting ' + Celestia.name + ' ver:' + Celestia.version);

/* BEGIN: dlg Create / Open Package */

$('#dlg-create-open-package').dialog({
	closable	: false,
	resizable	: false,
	width		: 600
});
	
/* FIRST THINGS FIRST */
/* load up the sites we have (just getting icons for dlg Create/Open) */
Celestia.console.log('Getting site configs.');
Celestia.getConfigs(function(config, index) {
	
	if ( config && config.site && config.icon_md ) {
		
		Celestia.console.info('config found: ' + config.site);
		
		var li = $('<div/>'),
			a = $('<a class="site-loader" href="#" site="' + config.site + '"/>').appendTo(li),
			img = $('<img src="' + config.icon_md + '" height="50" width="75"/>').appendTo(a);
		
		$(a).click(function() {
			/* set the site */
			Celestia.site = $(this).attr('site');
			
			Celestia.getConfig(Celestia.site, function() {

				/* called config file */
				if ( Celestia.skins != undefined ) {
					Celestia.loadSkin(Celestia.skins);
				}
				
				/* we're only hiding the one on Dlg Create/Open, just show them all */
				$('.btn-set-source').show();
				$('#choose-site-wrap').fadeOut();
				$('#dlg-create-open-package .create-open-wrap').fadeIn();
				/* see if there are any existing packages */
				$('#sel-existing-packages').html('');
				var sel = $('#sel-existing-packages'),
					the_path = Celestia.site + (Celestia.franchise_name != '' ? '/packages/' + Celestia.franchise_name : '/packages'),
					param = 'method=getProjects&site=' + Celestia.site +
								'&franchise_name=' + Celestia.franchise_name +
								'&package_name=' + Celestia.package_name +
								'&file_name=' + Celestia.file_name +
								'&the_path=' + the_path;
				
				Celestia.console.log('api=>getProjects - site: ', Celestia.site, ' - path: ', the_path);
				Celestia.api(param, Celestia.errors['GET_PACKAGES'], function(data) {
					
					$('#project-list-wrap').append(data);
					$('.existing-packages-wrap').css('display', 'block');
					
					$('.file a').click(function(e) {
						e.stopPropagation();
						
						Celestia.new_package = false;
		
						var package_name = $(this).parents('.dir').attr('package_name'),
							file_name = $(this).attr('file'),
							site = $(this).attr('site');
						
						Celestia.franchise_name = $(this).parents('.dir').hasClass('sub') ? $(this).parents('.franchise-parent').attr('package_name') : Celestia.franchise_name;
						Celestia.package_name = package_name != undefined && package_name != '' ? package_name : Celestia.package_name;
						
						if ( Celestia.package_name != '' ) {
							file_name = file_name.replace(/\.htm/, '');
							Celestia.file_name = file_name;
							/* load the site */
							Celestia.loadFile();
						}
						
						return false;
					});
					
					$('.tree-wrap').treeview({
						control		: '#links-wrap',
						persist		: 'cookie',
						collapsed	: true
					});
					
					/* make h2 elements expand/collapse the trees */
					$('.dir h2, .franchise-parent h2').click(function() {
						$(this).prev().click();
					});
				});
				
				Celestia.getTemplates();
			});
		});
		
		$('#choose-site-wrap').append(li);		
		
		/* first make all anchors on the page null (before loading anything) */
		/* DO THIS AFTER THE ABOVE IS COMPLETE () */
		$('a').each(function() {
			$(this).attr('href', 'javascript:;');
		});
	} else {
		Celestia.console.error('Config not found for index ' + index);
	}
});

	$('#btn-back-to-choose-site').click(function() {
		$('.create-open-wrap').fadeOut();
		$('#choose-site-wrap').fadeIn();
	});

	/*
		BTN: Create Package
		TXT: Create Package
		try and create a package via
			any .btn-create-package[click] (via #txt-create-package) or
			#txt-create-package[keyup[enter]]
	*/
	$('.btn-create-package').click(function() {
		Celestia.newPackage('#txt-create-package');
	});
	
	$('#txt-create-package').keyup(function(e) {
		if ( e.keyCode == 13 ) {
			Celestia.newPackage('#txt-create-package');
		}
	});
	
/* END: dlg Create / Open Package */


/* BEGIN Dlg Main Menu */

	$('#dlg-main-menu').dialog({
		minimizable		: true,
		closable		: false,
		width			: 300,
		resizable		: false,
		position		: ['center'],
		closeOnEscape	: false
	});
	
	$('#btn-get-source').click(function() {
		var html = Celestia.getSource('user');
		$('#view-source').dialog('open');
		$('#txt-cma-source').val(html);
		Celestia.cmaEditor.setValue(html);
	});
	
	$('.btn-restore-session').click(function() {
		Celestia.restoreSession();
	}).contextMenu({
		help_section: 'restore-session'
	});
	
	
	$('.btn-set-source').click(function() {
		$('#dlg-set-source').dialog('open');
		$('#txt-set-source').focus();
	});
	
	$('#btn-toggle-header-footer').click(function() {
		$('*').each(function() {
			if ( $(this).hasClass('header-footer') ) {
				$(this).toggle(function() {
					$(this).css('display');
				});
			}
		});
	});
	
	$('#btn-brandscape').click(function() {
		$('#dlg-brandscape').dialog('open');
	});
	
	$('#btn-preview').click(function() {
		var preview = window.open('../viewer/viewer.php?s=' + Celestia.site + '&f=../sites/' + Celestia.site + '/packages/' + (Celestia.franchise_name != '' ? Celestia.franchise_name + '/' : '') + Celestia.package_name + '/' + Celestia.file_name + '.htm&p=..', 'preview');
	});
	
	$('#dlg-brandscape').dialog({
		height		: 500,
		width		: 600,
		position	: ['center', 'center'],
		buttons		: {
			'Cancel' : function() {
				$('#dlg-brandscape').dialog('close');
			},
			'Set' : function() {
				$('#editor #brandscape').html($('#txt-brandscape').val());
				$('#dlg-brandscape').dialog('close');
			}
		}
	});
	
	$('.btn-open-save-as').click(function() {
		$('#dlg-save-as').dialog('open');
		$('#txt-save-as-franchise-name').val(Celestia.franchise_name);
		$('#txt-save-as-package-name').val(Celestia.package_name);
		$('#txt-save-as-file-name').val('main');
		$('#dlg-save-as .' + $(this).attr('type')).show();
	});
	
	$('#dlg-set-source')
		.dialog({
			height		: 500,
			width		: 600,
			position	: ['center', 'center'],
			resize		: function(e, ui) {
				$('#dlg-set-source .CodeMirror').css({
					height	: ( ui.size.height - 190) + 'px',
					width	: ( ui.size.width - 20) + 'px'
				});
			},
			buttons		: {
				'Cancel'	: function() {
					$('#dlg-set-source').dialog('close');
				},
				'Ok'		: function() {
					$('#txt-set-source').val(Celestia.sourceEditor.getValue());
					Celestia.validate(Celestia.site);
				}
			}
		});
	
	$('#view-source')
		.dialog({
			height		: 500,
			width		: 600,
			resizable	: false,
			position	: ['center', 50],
			resize		: function(e, ui) {
				$('#view-source .CodeMirror').add('#view-source .CodeMirror-scroll').css({
					height	: ( ui.size.height - 75) + 'px',
					width	: ( ui.size.width - 20) + 'px'
				});
			}
		});
		
	$('.btn-get-quick-load-url').click(function() {
		alert('Copy the address below.\n\n' + window.location.href.replace(/#/g, '') + '?s=' + Celestia.site + '&f=' + Celestia.franchise_name + '&p=' + Celestia.package_name + '&fn=' + Celestia.file_name);
	});
	
	$('.btn-show-hide-module-image').click(function() {
		clearTimeout(Celestia.image_timer);
		Celestia.show_module_images = !Celestia.show_module_images;
		Celestia.hideWellImages();
	});
	
/* END Dlg Main Menu */

/* BEGIN dlg Save As */

	$('#dlg-save-as')
		.dialog({
			width		: 300,
			position	: ['center', 50]
		});
	
	$('#btn-save-as').click(function() {
		var invalid = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
		if ( isInvalid($('#txt-save-as-file-name').val(), invalid) ) {
			alert('The file name cannot contain any of the following characters - ' + invalid);
			return false;
		}
		/* go ahead and save to ANY package name / file name */
		Celestia.package_name = $('#txt-save-as-package-name').val();
		Celestia.franchise_name = $('#txt-save-as-franchise-name').val();
		Celestia.file_name = $('#txt-save-as-file-name').val();
		Celestia.save();
		$('#dlg-save-as').dialog('close');
	});
	
	$('#btn-save-template-as').click(function() {
		var invalid = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
		if ( isInvalid($('#txt-save-as-template-name').val(), invalid) ) {
			alert('The template name cannot contain any of the following characters - ' + invalid);
			return false;
		}
		Celestia.saveTemplate($('#txt-save-as-template-name').val());
		$('#dlg-save-as').dialog('close');
	});
	
	$('#txt-save-as-template-name').keyup(function(e) {
		if ( e.keyCode == 13 ) {
			var invalid = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
			if ( isInvalid($('#txt-save-as-template-name').val(), invalid) ) {
				alert('The template name cannot contain any of the following characters - ' + invalid);
				return false;
			}
			Celestia.saveTemplate($('#txt-save-as-template-name').val());
			$('#dlg-save-as').dialog('close');
		}
	});

/* END dlg Save As */

/* BEGIN Confirmation Dialog Box */

	$('#dlg-confirmation').dialog({
		width			: 300,
		minHeight		: 50,
		position		: 'center',
		modal			: true,
		closeOnEscape	: false,
		resizable		: false
	});
	
/* END Confirmation Dialog Box */

/* BEGIN: dlg Controls */

	$('#dlg-controls').dialog({
		width			: 500,
		height			: 400,
		position		: ['center', 50],
		closeOnEscape	: false,
		
		close : function() {
			$('.editing-element').remove();
			
			var data = Celestia.module.current ? $.data(Celestia.module.current, 'data') : null;
			if ( data && data.controlsClosed != undefined ) {
				data.controlsClosed.call(this);
			}
		},
		
		buttons: {
			
			/*'Pod Src': function() {
				Celestia.getSource(Celestia.module.current);
			},*/
			
			Close : function( e, ui ) {
				$('#dlg-controls').dialog('close');
			},
			
			Delete : function( e ) {
				e.preventDefault();
				var title = $('#dlg-controls')
						.dialog('option', 'title')
						.toString()
						.substring(6, $('#dlg-controls').dialog('option', 'title').length),
					msg = '<p>Are you sure you wish to delete module?</p><p>*' + title + '</p>';
				Celestia.confirm(msg);
			},
			
			Help : function( e, ui ) {
				Celestia.showHelp($.data(Celestia.module.current, 'data').help != undefined ? $.data(Celestia.module.current, 'data').help : 'modules' );
			}
		}
	});

/* END: dlg Controls */

/* BEGIN: dlg SEO */

$('#dlg-seo')
	.dialog({
		width		: 500,
		position	: ['center', 50]
	});
	
/* END: dlg SEO */

/* BEGIN: dlg Help */

$('#dlg-help')
	.dialog({
		position	: ['center', 50]
	});

/* END: dlg Help */

/* MISC */

$('.btn-open-dlg-create-open-package').click(function() {
	$('#choose-site-wrap').fadeIn();
	$('.create-open-wrap').fadeOut();
	$('#dlg-create-open-package').dialog('open');
});

/* BTN: open dlg-seo */
$('.btn-open-dlg-seo').click(function() {
	$('#dlg-seo')
		.dialog('open')
		.dialog('option', 'close', function() {
			/* save seo information (saveing everything else...) */
			Celestia.save();
		});
});

/* BEGIN: Context Menu */

/* give a context menu to the body (document) (by default show the main-menu) */
$(document).contextMenu();

$('#btn-context-close').click(function() {
	Celestia.closeContext();
});

$('#btn-context-help').click(function() {
	Celestia.showHelp($('#context-menu').data('help_section'));
});

$('#btn-context-delete-module').click(function() {
	Celestia.closeContext();
	Celestia.confirm('<p>Are you sure you wish to delete this module?</p>');
});

$('#btn-context-edit-module').click(function() {
	Celestia.closeContext();
	var data = $.data(Celestia.module.current, 'data'),
		sortable = data['sortable'] != undefined ? data['sortable'] : true,
		editable = data['editable'] != undefined ? data['editable'] : true;
	if ( editable ) {
		Celestia.openControls();
		Celestia.hideOverlay();
	} else {
		alert('Sorry, this module is not editable.');
	}
});

$('#btn-context-move-module-up').click(function() {
	Celestia.closeContext();
	if ( $(Celestia.module.current)[0] ) {
		if ( $(Celestia.module.current).parent().prev()[0] ) {
			$(Celestia.module.current).parent().prev().before($(Celestia.module.current).parent());
			Celestia.save();
		}
	}
});

$('#btn-context-move-module-down').click(function() {
	Celestia.closeContext();
	if ( $(Celestia.module.current)[0] ) {
		if ( $(Celestia.module.current).parent().next()[0] ) {
			$(Celestia.module.current).parent().next().after($(Celestia.module.current).parent());
			Celestia.save();
		}
	}
});

$('#btn-context-clone-module').click(function() {
	Celestia.closeContext();
	var data = $.data(Celestia.module.current, 'data'),
		module = Celestia.module.current,
		parent = null;
	
	if ( data && data.well && data.file_name ) {
		
		var well = data.well;
		
		if ( $(module).parents('#' + well + '-ul')[0] || $(module).parents('.' + well + '-ul')[0] ) {
			
			var newModule = $.clone(module),
				li = $('<li/>').append(newModule);
			
			$.data($(li).children().eq(0)[0], 'data', data);
			
			$(module).parents('#' + well + '-ul').append(li);
			$(module).parents('.' + well + '-ul').append(li);
			
			Celestia.getModule({
				module			: $(newModule)[0],
				openControls	: true,
				well			: data.well,
				file_name		: data.file_name
			});
		}
		Celestia.save();
	}
});

/* END: Context Menu */

/* UNDO / REDO */
$('.btn-undo').click(function() {
	if ( Celestia.undoManager.hasUndo() ) {
		Celestia.undoManager.undo();
		Celestia.undoManager.changed();
		Celestia.save();
	}
});

$('.btn-redo').click(function() {
	if ( Celestia.undoManager.hasRedo() ) {
		Celestia.undoManager.redo();
		Celestia.undoManager.changed();
		Celestia.save();
	}
});

/* code mirror */
Celestia.cmaEditor = CodeMirror.fromTextArea($('#txt-cma-source')[0], {
	'autoClearEmptyLines'	: true,
	'mode'					: 'application/x-ejs'
});

Celestia.sourceEditor = CodeMirror.fromTextArea($('#txt-set-source')[0], {
	'autoClearEmptyLines'	: true,
	'mode'					: 'application/x-ejs'
});

/* file dropping for site icons */
//$('.site-loader').fileDrop({
//	drop : function(el, file) {
//		document.getElementById('list').innerHTML = '<ul>' + op.join('') + '</ul>';
//	}
//});

/* close all dialogs initially */
$('.ui-dialog-content').dialog('close');


/* if we have a session, show .btn-restore-session */
if ( $.cookie('celestia_session') ) {
	$('.btn-restore-session').show();
}

/* let's do it */
$('#dlg-create-open-package').dialog('open');



var par = { s:'', f:'', p:'', fn:'' };
var match,
	pl     = /\+/g,  // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g,
	decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
	query  = window.location.search.substring(1);
while ( match = search.exec(query) ) {
	par[decode(match[1])] = decode(match[2]);
}

/* do we have a quick load cookie? if so, load it up! */
/*
	note: I did it this way so that the url gets cleared out.
	that way if during the session at some time does the user hit F5
	you're just refreshing the app.
*/
if ( $.cookie('pm_quick_load') && $.cookie('pm_quick_load') != '' ) {
	var ql = $.cookie('pm_quick_load').split('|');
	
	/* set the site */
	Celestia.site = ql[0];
	/* get the site config */
	Celestia.getConfig(Celestia.site, function( config ) {
		if ( config && config.short_name ) {
			Celestia.short_name = config.short_name;
			Celestia.new_package = false;
			Celestia.franchise_name = ql[1];
			Celestia.package_name = ql[2];
			Celestia.file_name = ql[3].replace(/\.htm/, '');
			/* load the site */
			Celestia.loadFile();
			/* null out the quick load cookie */
			$.cookie('pm_quick_load', '');
		}
	});
}

/* do we have a quick load url? */
if ( par.s != '' && par.p != '' && par.fn != '' ) {
	/* put it into a cookie */
	$.cookie('pm_quick_load', par.s + '|' + par.f + '|' + par.p + '|' + par.fn);
	window.location = window.location.href.split('?')[0];
}

/* so that the image preview for the main menu can be seen */
$('#dlg-main-menu').parents('.ui-dialog').add('#dlg-main-menu').css('overflow', 'visible');

$(window).scroll(function() {
	/*
		have the main menu and the module controls dialog boxes
		stay in view when the user scrolls the document window
	*/
	$($('#dlg-controls, #dlg-main-menu').parents('.ui-dialog'))
		.stop()
		.animate({
			'top' : ( $(window).scrollTop() + 30 ) + 'px'
		}, 'slow');
});

/* End Start Up */

});
})(jQuery);