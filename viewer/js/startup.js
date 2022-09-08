(function($) {

$.extend(Celestia, {
	
	name	: 'Celestia Content Viewer',
	version	: '1.0'
	
});

$(function() {
	
	$('.file a').click(function(e) {
		e.stopPropagation();
		window.open('viewer.php?s=' + $(this).attr('site') + '&f=' + $(this).attr('file') + '&p=' + $(this).attr('path'));
		return false;
	});

	/* dlg: Main Menu */
	var prefix = 'search';
	$('#main-menu').dialog({
		title		: 'Package Listings / Search',
		closeText	: 'hide',
		height		: $.cookie(prefix + '_height') != null ? eval($.cookie(prefix + '_height')) : 400,
		width		: $.cookie(prefix + '_width') != null ? eval($.cookie(prefix + '_width')) : 250,
		position	: $.cookie(prefix + '_position') != null ? eval('[' + $.cookie(prefix + '_position') + ']') : [412, 50],
		focus		: function( event, ui ) {
			$.cookie(prefix + 'Z', $(this).parent().css('zIndex').toString(), { expires: 365 });
		},
		resizeStop	: function( event, ui ) {
			$.cookie(prefix + '_width', ($(this).width() + 6).toString(), { expires: 365 });
			$.cookie(prefix + '_height', ($(this).height() + 49).toString(), { expires: 365 });
		},
		dragStop	: function( event, ui ) {
			$.cookie(prefix + '_position', [$(this).offset().left - 7, $(this).offset().top - 39].toString(), { expires: 365 });
		}
	});
	
	var found = [];
	$('#project-keywords').keyup(function() {
		$('span.highlight').each(function() {
			$(this).replaceWith($(this).text());
		});
		$.each(found, function(i) {
			$(found[i]).parents('.collapsable').find('.hitarea').click();
		});
		if ( $(this).val().length > 1 ) {
			var kw = $(this).val();
			found = [];
			function search( selector ) {
				/* get a reference to the previous node that was found */
				var o = null,
					s = $(selector);
				s.each(function( k, v ) {
					if ( $(v)[0] && $(v).text() != '' ) {
						if ( $(v).text().toLowerCase().indexOf(kw) != -1 && v != o ) {
							found.push(v);
							o = v;
						}
					}
				});
			};
			/* go through each .searchable and look for a match */
			search($('[text*="' + kw + '"]', $('#project-search')));
			for ( var i=0; i<found.length; i++ ) {
				var el = found[i],
					text = $(el).text(),
					s = text.toLowerCase().indexOf(kw),
					e = s + kw.length,
					o = text.substring(0, s),
					m = text.substring(s, e),
					n = text.substring(e, text.length);
				$(el).html(o + '<span class="highlight">' + m + '</span>' + n);
				$(el).parents('.expandable').find('.hitarea').click();
			}
		}
	});
	
	$('.tree-wrap').treeview({
		control		: '#links-wrap',
		persist		: 'cookie',
		collapsed	: true
	});
	
	/* make h2 elements expand/collapse the trees */
	$('.dir h2').click(function() {
		$(this).prev().click();
	});
	
});

})(jQuery);