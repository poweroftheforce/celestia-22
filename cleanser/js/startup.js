(function($) {

/* give Celestia an alias */
$(function() {

$('#btn-validate').click(function() {
	C.validate($('#sel-site').val());
});


$('#dlg-confirmation').dialog({
	width			: 300,
	minHeight		: 50,
	position		: 'center',
	modal			: true,
	closeOnEscape	: false,
	resizable		: false
});


Celestia.console = $.console();
Celestia.console.log('Starting ' + Celestia.name + ' ver:' + Celestia.version);

/* close all dialogs initially */
$('.ui-dialog-content').dialog('close');

/* setup our editor code mirror */
var default_text = '<!-- This is just sample code. just Paste your real code here.-->\n\n<div class=" test ">Hello World´s!</div><a href="#">link</a>\n<!--\n\tnote: empty spaces within class attribute, curly tick mark within\n\tthe phrase "Hello World\'s!" as well as the "#" symbol in the href attribute\n-->';
C.editor = CodeMirror.fromTextArea($('#txt-input')[0], {
	'autoClearEmptyLines'	: true,
	'mode'					: 'application/x-ejs'
});

C.editor.setValue(default_text);
$('.CodeMirror').click(function () {
	if ( C.editor.getValue() == default_text ) {
		C.editor.setValue('');
	}
});

$(window).bind('keydown', function (e) {
	if (e.ctrlKey && e.keyCode == 13) {
		C.validate($('#sel-site').val());
	}
});

});

})(jQuery);