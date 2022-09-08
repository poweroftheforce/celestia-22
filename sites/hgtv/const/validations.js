{
	/*
		cleanHTML( html )
			MUST return html [as String]
	*/	
	cleanHTML : function( html ) {
		
		var s_start = '',
			s_end = '';
		
		
		var checks = {
			'http://www.hgtv.com'	: 'Stripping "http://www.hgtv.com"'
		};
		
		$.each(checks, function(p, v) {
			var occ = html.split(p).length - 1;
			if ( occ > 0 ) {
				Celestia.console.warn(v + ': ' + occ + ' occurances found');
				html = html.replace(/http:\/\/www.hgtv.com/g, '');
				return true;
			}
		});
		
		//if ( html.indexOf('http://www.hgtv.com') != -1 ) {
		//	var occ = html.split('http://www.hgtv.com').length - 1;
		//	Celestia.console.warn('http://www.hgtv.com', 'error', 'Stripping "http://www.hgtv.com" - ' + occ + ' occurances found.');
		//	html = html.replace(/http:\/\/www.hgtv.com/g, '');
		//}
		
		/* is there a proc tag on the page? if not we need to ask if one was intended */
		//if ( html.match(/<#.*Proc.*name="getTPBanner".*\/#>/) === null ) {
			//html = C.confirm('It appears that there is no Proc call on the page to reference a banner, would you like to add one now?', function() {
		//	proc = unescape('\n\tc_lt#Proc name="getTPBanner"/#c_gt');
			//});
		//}
		
		/* get rid of omniture onclicks */
		html = html.replace(/onclick=".*?"/ig, '');
		
		var invalid_classNames = {
			/* jquery ui */
			'ui-sortable'	: '',
			/* package builder */
			'pb-current'			: '',
			'pb-block-container'	: ''
		};

		$.each(invalid_classNames, function(p, v) {
			if ( html.indexOf(p) != -1 ) {
				var occ = html.split(p).length - 1,
					r = new RegExp(p, 'g');
				html = html.replace(r, v);
				Celestia.console.error('Removing invalid class name: ' + p + ' - ' + occ + ' occurances found');
			}
		});
		
		/* MUST return html [as String]*/
		return html;
	},
	
	/* cleanDOM( html ) */
	cleanDOM : function( html ) {
		/* remove the banner (it's been replaced with the proc) */
		
		$('#inject-wrap comment').remove();
		
		var c = 0,
			f = false;
		$.each($('h2'), function() {
			if ( $(this).html() == '' ) {
				c++;
				$(this).remove();
				f = true;
			}
		});
		
		if ( f ) {
			Celestia.console.error('Empty H2 tags found (removing): ' + c + ' occurances found');
		}
		
		c = 0,
		f = false;
		
		$.each($('h3'), function() {
			if ( $(this).html() == '' ) {
				c++;
				$(this).remove();
				f = true;
			}
		});
		
		if ( f ) {
			Celestia.console.error('Empty H3 tags found (removing): ' + c + ' occurances found');
		}
		
		/* possible BAD PB module .two-across */
		if ( $('#inject-wrap ul.two-across')[0] ) {
			Celestia.console.error('Bad module found: ul.two-across - ' + $('ul.two-across').length + ' occurances found');
			$('#inject-wrap ul.two-across').each(function() {
				var module = $(this).parent().parent();
				
				if ( module.hasClass('pod') ) {
					module.addClass('two-across');
					$(this).removeClass('two-across');
				}
			});
			/* for right now we will just make certain the correct styles are added for this module (AS changed) */
			//$('#hg-bd-wrap').before('<style>.two-across { margin: 10px 0 14px 14px; }.two-across .bd h3{margin-bottom:14px;}</style>');
		}
		
		/* possible BAD PB module .generic-lead (with DIV as copy tag) */
		/*
			struct should be
				.generic-lead
					.bd
						.feature
							H3
							A
								IMG
							P <- (package builder will produce a DIV here)
							P
								A
		*/
		if ( $('#inject-wrap .generic-lead')[0] ) {
			
			/* fix the bad parts */
			$('#inject-wrap .generic-lead .feature').each(function() {
				$(this).children().each(function(i) {
					if ( i == 2 && this.tagName.toLowerCase() == 'div' ) {
						$(this).before('<p>' + $(this).html() + '</p>').remove();
					}
				});
			});

			/* same thing */
			$('#inject-wrap .generic-lead .feature-cartridge').each(function() {
				$(this).find('.bd').children().each(function(i) {
					if ( i === 2 && this.tagName.toLowerCase() === 'div' ) {
						$(this).before('<p>' + $(this).html() + '</p>').remove();
					}
				});
			});
		}
		
		/* not needed (.two-across from PB has style="width: auto;") */
		if ( $('#inject-wrap #hg-w .two-across')[0] ) {
			$.each($('#inject-wrap #hg-w .two-across'), function() {
				
				/* attempt to add style tag if it's not found */
				if ( !$(this).find('style')[0] ) {
					$(this).prepend('<style>.two-across { margin: 10px 0 14px 14px; }.two-across .bd h3{margin-bottom:14px;}</style>');
				}
			});
			if ( $($('#inject-wrap #hg-w .two-across')[0]).find('.bd').attr('style') != undefined ) {
				Celestia.console.warn('Possible bad PB module detected with style attribute - removing attribute.');
				$('#inject-wrap #hg-w .two-across .bd').removeAttr('style');
			}
		}
		
		/* possible BAD PB heasrt module */
		$('#inject-wrap #hg-w #hearse-rr').parent().addClass('hearst-ad').end().removeAttr('id');
		$('#inject-wrap #hg-e #hearse-rr').parent().addClass('hearst-module-300x300').end().removeAttr('id');
		
		/*
			since More From This Feature module doesn't have a distinguishing className or id,
			we will have to try and dectect one and add it
		*/
		$.each($('#hg-e .pod'), function() {
			var module = this,
				hasHeader = false,
				hasBody = false;
			
			$.each($(this).children(), function(i) {
				
				if ( i === 0 && this.tagName.toLowerCase() === 'div' && $(this).hasClass('hd') ) {
					if ( $(this).html().indexOf('h4') != -1 ) {
						hasHeader = true;
					}
				}
				
				if ( hasHeader ) {

					if ( i === 1 && this.tagName.toLowerCase() === 'div' && $(this).hasClass('bd') ) {
						
						/* see if (module) > .bd has only 1 child and that it is a <ul class="list"> */
						if ( $(this).children().length == 1 && $(this).children()[0].tagName.toLowerCase() === 'ul' && $(this).children().hasClass('list') ) {
							/* looks like it might be a "More From This Feature" module */
							$(module).addClass('more-from-feature');
						}
					}
				}
			});
		});
		
		/* looking for target="_blank" && href=[relative_path] */
		if ( $('#inject-wrap a[href^="/"]').length > 0 ) {
			var c = 0;
			$('#inject-wrap a[href^="/"]').each(function(i) {
				if ( $(this).attr('target') === '_blank' ) {
					c += 1;
					$(this).removeAttr('target');
				}
			});
			Celestia.console.warn('Anchors with relative path && target attributes found: - ' + c + ' occurances found');
		}
		
	}
	
}