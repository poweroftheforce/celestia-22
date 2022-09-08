{
	/*
		cleanHTML( html )
			MUST return html [as String]
	*/	
	cleanHTML: function( html ) {
		
		var s_start = '',
			s_end = '',
			proc = '';
		
		if ( html.indexOf('http://www.hgtvremodels.com') != -1 ) {
			var occ = html.split('http://www.hgtvremodels.com').length - 1;
			C.console.warn('http://www.hgtvremodels.com', 'error', 'Stripping "http://www.hgtvremodels.com" - ' + occ + ' occurances found.');
			html = html.replace(/http:\/\/www.hgtvremodels.com/g, '');
		}
		
		/* first check for the section tag */
		if ( html.indexOf(/<section.*>/) == -1 ) {
			C.console.log('err', 'SECTION tag was missing <section>');
			s_start = '<section id="sni-bd">';
			s_end = '</section>';
		}
		
		/* is there a proc tag on the page? if not we need to ask if one was intended */
		//if ( html.match(/<#.*Proc.*name="getBanner".*\/#>/) === null ) {
			//html = C.confirm('It appears that there is no Proc call on the page to reference a banner, would you like to add one now?', function() {
			//proc = unescape('\n\tc_lt#Proc name="getBanner"/#c_gt<style>.banner a { height: 133px; }</style>');
			//});
		//}
		
		html = html.replace(/<div class="bd"> &nbsp;/g, '<div class="bd">');
		
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
				C.console.error('Removing invalid class name: ' + p + ' - ' + occ + ' occurances found', {
					result: v
				});
			}
		});
		
		/* MUST return html [as String]*/
		//return s_start + proc + html + s_end;
		return html;
	},
	
	/* cleanDOM( html ) */
	cleanDOM: function( html ) {
		/* look for the intro lead */
		$('#inject-wrap .lead').each(function() {
			if ( $($(this).children()[0]).hasClass('sponsor-multi-logo') ) {
				$($(this).children()[0]).html('<cscript type="text/javascript">MultiLogoAd(\'LOGO\',4);</cscript>');
				$('#inject-wrap .sni-w').prepend($(this));
			}
		});
		/* make sure there is a toolbar in the right rail */
		if ( !$('#tb-facebook')[0] ) {
			$('#inject-wrap .sni-e').prepend('<div class="toolbar"><ul><!--<li id="tb-print"><a target="_blank">Print</a></li>--><li id="tb-email"></li><li id="tb-tweet"></li><li id="tb-facebook"></li></ul><div id="email-a-friend"></div><cscript type="text/javascript">SNI.Util.Toolbar();</cscript></div>');
		} else {
			/* if there is, make sure it's clean */
			$('#inject-wrap .sni-e .toolbar').html('<ul><!--<li id="tb-print"><a target="_blank">Print</a></li>--><li id="tb-email"></li><li id="tb-tweet"></li><li id="tb-facebook"></li></ul><div id="email-a-friend"></div><cscript type="text/javascript">SNI.Util.Toolbar();</cscript>');
		}
		/* make sure there is a bigbox ad */
		if ( !$('#bigbox')[0] ) {
			$($('#inject-wrap .sni-e .toolbar')[0]).after('<div class="pod"><div id="bigbox"><cscript type="text/javascript">BigboxAd(5);</cscript><cite class="cap center">Advertisement</cite></div></div>');
		}
		/* make sure there is a 300x150 ad */
		if ( !$('#bigbox300x150')[0] ) {
			$($('#inject-wrap .sni-e #bigbox').parent()).after('<div class="pod mrec"><div id="bigbox300x150"><cscript type="text/javascript">BigboxAd300x150(1,\'\');</cscript></div></div>');
		}
	}
	
}




