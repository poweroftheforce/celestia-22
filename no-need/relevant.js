var mpc = {
	tag				: 'diyRelevant',
	name			: 'All About',
	class_name		: '.relevant',
	insertable_node	: 'ul.topics',
	replacables: {
		"$(self){pod}.find('h4')" : { html: 'MPC-title' }
	},
	dyn_replacables: {
		"$(self){pod}.find('ul.topics').children().eq(i).find('a')" : { attr: { href: 'MPC-item1-href' }, html: 'MPC-item1-label' }
	},
	inputs: [{
		'mpc-diyww-relevant-main-section': {
			type			: 'section',
			label			: 'Main Section'
		},
		'MPC-title': {
			append			: '.mpc-diyww-relevant-main-section',
			default_value	: 'All About&hellip;',
			type			: 'text',
			label			: 'Title'
		}
	}],
	dyn_inputs: [{
		'mpc-diyww-relevant-list-item1-section': {
			type			: 'section',
			label			: 'List Item 1 Section'
		},
		'MPC-item1-label': {
			append			: '.mpc-diyww-relevant-list-item1-section',
			default_value	: 'List Item 1',
			type			: 'text',
			label			: 'List Item 1'
		},
		'MPC-item1-href': {
			append			: '.mpc-diyww-relevant-list-item1-section',
			default_value	: '#',
			type			: 'text',
			label			: 'List Item 1 Href'
		}
	}]	,
	buttons: [{
		'btn-toggle-module-sorting': {
			html	: 'Toggle Module Sorting',
			click	: function() {
				$.common.toggleControlsOpener(this);
				var ctrl = $.common.getControlsFromButton(this);
				var pod = ctrl.pod;
				$.common.toggleModuleSorting({
					pod			: pod,
					controls	: ctrl,
					sortables	: {
						"$(pod).find('.bd').find('ul.list')": {}
					}
				});
			}
		},
		'btn-add-list-item': {
			html	: 'Add List Item',
			click	: function() {
				addHTML({
					btn				: this,
					hasLastClass	: 'last',
					append			: 'ul.topics',
					html			: '<li><a href="MPC-item#mpc_inc-href">MPC-item#mpc_inc-label</a></li>',
					smart_words		: {
						'mpc-diyww-relevant-list-item#mpc_inc-section': {
							type			: 'section',
							label			: 'List Item #mpc_inc Section'
						},
						'MPC-item#mpc_inc-label': {
							append			: '.mpc-diyww-relevant-list-item#mpc_inc-section',
							default_value	: 'List Item #mpc_inc',
							type			: 'text',
							label			: 'List Item #mpc_inc'
						},
						'MPC-item#mpc_inc-href': {
							append			: '.mpc-diyww-relevant-list-item#mpc_inc-section',
							default_value	: '#',
							type			: 'text',
							label			: 'List Item #mpc_inc Href'
						}
					}
				});
			}
		},
		'btn-del-list-item': {
			html	: 'Del List Item',
			click	: function() { $.common.deleteHTML(this, 'ul.topics'); }
		}
	}]
};
