{
	/*
		cleanHTML( html )
			MUST return html [as String]
	*/	
	cleanHTML: function( html ) {
		
		var s_start = '',
			s_end = '',
			proc = '';
		
//		if ( html.indexOf('http://www.hgtv.com') != -1 ) {
//			var occ = html.split('http://www.hgtv.com').length - 1;
//			Celestia.console.warn('http://www.hgtv.com', 'error', 'Stripping "http://www.hgtv.com" - ' + occ + ' occurances found.');
//			html = html.replace(/http:\/\/www.hgtv.com/g, '');
//		}
//		
//		/* is there a proc tag on the page? if not we need to ask if one was intended */
//		if ( html.match(/<#.*Proc.*name="getTPBanner".*\/#>/) === null ) {
//			//html = C.confirm('It appears that there is no Proc call on the page to reference a banner, would you like to add one now?', function() {
//			proc = unescape('\n\tc_lt#Proc name="getTPBanner"/#c_gt');
//			//});
//		}
//		
//		/* get rid of omniture onclicks */
//		html = html.replace(/onClick=".*?"/g, '');
//		
//		var invalid_classNames = {
//			/* jquery ui */
//			'ui-sortable'	: '',
//			/* package builder */
//			'pb-current'			: '',
//			'pb-block-container'	: ''
//		};
//
//		$.each(invalid_classNames, function(p, v) {
//			if ( html.indexOf(p) != -1 ) {
//				var occ = html.split(p).length - 1,
//					r = new RegExp(p, 'g');
//				html = html.replace(r, v);
//				Celestia.error('Removing invalid class name: ' + p + ' - ' + occ + ' occurances found', {
//					result: v
//				});
//			}
//		});
		
		/* MUST return html [as String]*/
		return proc + s_start + html + s_end;
	},
	
	/* cleanDOM( html ) */
	cleanDOM: function( html ) {
		/* remove the banner (it's been replaced with the proc) */
//		$('.mini-lead').remove();
	}
	
}




