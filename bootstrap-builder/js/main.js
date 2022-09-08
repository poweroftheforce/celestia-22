(function(){
  var cache = {};
   
  this.tmpl = function tmpl(str, data){
    /* Figure out if we're getting a template, or if we need to */
    /* load the template - and be sure to cache the result. */
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
       
      /* Generate a reusable function that will serve as a template */
      /* generator (and which will be cached). */
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
         
        /* Introduce the data as local variables using with(){} */
        "with(obj){p.push('" +
         
        /* Convert the template into pure JavaScript */
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
     
    /* Provide some basic currying to the user */
    return data ? fn( data ) : fn;
  };
})();

(function ($) {

var module_current  = null;
var module_re		    = {
  current	: /{module}|{m}/g
};
var key_stroke_time = 0;

function makeColumnsSortableAndDroppable (row) {
  $(row).find('.col-md')
    .sortable({
      connectWith : '.col-md',
      handle      : '.component-controls-wrap',
      cancel      : '.portlet-toggle',
      placeholder : 'portlet-placeholder ui-corner-all',
      sort        : function (event, ui) {/* */},
      stop        : function (event, ui) {
        $(ui.item).parents('.row').find('.col-md').each(function () {
          var dummyHTML = tmpl('tmpl_dummy_html', {});

          if ($(this).children().length > 1) {
            $(this).children().each(function () {
              if ($(this).hasClass('c-dummy')) {
                $(this).remove();
              }
            });
          } else if ($(this).children().length === 0) {
            $(this).append(dummyHTML);
          }
        });
      }
    })
    .droppable({
      accept  : '.component-menu a',
      drop    : function (event, ui) {
        var file_name = $(ui.draggable).attr('file');

        $(this).removeClass('ui-state-highlight');
        getComponent({
          col       : this,
          file_name : file_name
        });
      },
      out    : function (event, ui) {
        $(this).removeClass('ui-state-highlight');
      },
      over    : function (event, ui) {
        $(this).addClass('ui-state-highlight');
      }
    });
}

function gradientBackground (el, c1, c2) {
  $(el).css({
    background: $.browser.webkit ?
            '-webkit-gradient(linear, left top, right top, from(' + c1 + '), to(' + c2 + '))' :
            '-moz-linear-gradient(right center , ' + c2 + ' 50%, ' + c1 + ' 100%) repeat scroll 0 0 transparent'
  });
}

function createSection (options) {
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
    
  // colors[options.class] = options.backgroundColor;
    
  // gradientBackground(sec_wrap, options.backgroundColor, '#FFFFFF');
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
};

function positionEditingElement (el, isa, max_width, left) {
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
}

function createEditingElement (el, isa, max_width, left) {
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
  positionEditingElement(el, isa, max_width, left);
  
  $.data(div[0], 'position', $(parent).css('position'));
}

function disableLinks () {
  var module = module_current,
    data = $.data(module, 'data');
  
  if ( module && data ) {
    /*
      let's try and disable all anchors for said module at hand in case the user clicks on one
      not sure if I really care to renable them upon dialog close
    */
    $(module).find('a').unbind('click').on('click', function (e) {
      e.preventDefault();
      return false;
    });
  }
}

function createInput (options) {
  var options = $.extend({
    editable		    : null,
    value			      : '',
    section			    : '',
    sub_section		  : null,
    selector	  	  : '',
    affects			    : '',
    attr		    	  : '',
    sec_wrap	  	  : null,
    txt_val			    : '',
    lbl_html		    : '',
    left			      : '',
    replace_text	  : '',
    callback	    	: null,
    updateComplete	: null,
    required		    : true,
    max_width		    : '95%',
    can_target		  : true,
    prepend			    : false,
    noHighlight		  : false,
    type			      : 'text',
    onlyText		    : false,
    selections		  : [],
    options			    : { can_target: true}
  }, options);
  
  if ( !$(eval(options.selector))[0] ) {
    console.error('Error: !$(options.selector)[0] was not found - ' + options.selector);
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
          // console.log('select combobox change ', $(this).val());
          options.callback.call(this, this, options.selector, $.data(module_current, 'data'), $(this).val());
        })
        .appendTo(toggleWrap);
      
      $.each(options.selections, function( index, selection ) {
        var opt = $('<option value="' + selection.value + '">' + selection.name + '</option>').appendTo(input);
      });
      // $(input).combobox({
      //   value		: options.selector.attr('class'),
      //   callback	: function(value) {
      //     // options.selector.attr('class', value);
      //     // options.selector.addClass(value);
      //     options.callback.call(this, options.selector, value);
      //   }
      // });
      break;
    }
    default : {
      
      /* create the textbox */
      var html = children ? options.onlyText ? $(eval(options.selector)).text() : options.txt_val.replace(/<((.|\n)*?)>/g, '[$1]') : options.txt_val;
      var childrenText2 = '';
      
      if ( options.onlyText ) {
        childrenText2 = $(eval(options.selector)).html().replace($(eval(options.selector)).text(), '{childrenText2}');
      }
      
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
            
            var data = $.data(this, 'data') || null;
            var options = data.options;
            var self = this;
              
            $('.inputs-wrap .contenteditable').removeClass('current');
            $(this).addClass('current');
            
            /* if we have data and NOT IMG tag */
            if ( data && /*options.selector[0].nodeName.toLowerCase() != 'img' &&*/ options.selector[0].nodeName.toLowerCase() != 'script' && options.selector[0].nodeName.toLowerCase() != 'style' ) {
              /* create DIV#editing-element and fit it to the size and position of the element we're editing */
              /* make certain there are no editing elements */
              
              var el = options.selector;
              
              $('.editing-element').remove();
              if ( !options.noHighlight ) {
                createEditingElement( el, options.selector, options.max_width, options.left );
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
                module_data = $.data(module_current, 'data'),
                val = $(this).text(),
                callback = options.callback;
              
              if (val === '#') {
                $(this).addClass('warning');
              } else {
                $(this).removeClass('warning');
              }
              
              if (val === '') {
                $(this).addClass('required');
              } else {
                $(this).removeClass('required');
              }
              
              positionEditingElement( el, options.selector, options.max_width, options.left );
                
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
                  // el.html(data.childrenText2.replace(/{childrenText2}/g, v));
                  el.html(v);
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

              console.log('options.updateComplete: ', options.updateComplete);
              if ( options.updateComplete ) {
                options.updateComplete.call(this, this, val, data);
              }
              
              /* we don't want to pound the save on keyup */
              var t = new Date().getTime();
              if (t > (key_stroke_time + 1000)) {
                /* incase the user typed a url into a field */
                disableLinks();
                // save();
              }
              key_stroke_time = t;
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
    
    // if ( anchorInputCreated ) {
    //   anchorInputCreated.call(this, wrap, toggleWrap, label, input, options);
    // }
  }
  
  label.toggleWrap = toggleWrap;
  return input;
}

function drawControls ( section, scrollTo, start ) {
  var module = module_current;
  var data = $.data(module, 'data');
  
  // if ( !data || data.sections.length == 0 ) {
    
  //   /* here we will bypass the drawing of an existing module and try to create one instead */
  //   scanModule();
    
  //   /* err:300 */
  //   console.error(errors['DRAW_CONTROLS_NO_DATA']);
  //   return false;
  // }
  
  /* make sure the dialog is clean */
  $.each($('#dlg-controls .controls').children(), function() {
    $(this).html('');
  });
  
  // var resetColorsHeader = $('<h2>Can\'t see textbox values? - </h2>').appendTo('#dlg-controls .inputs-wrap'),
  //   resetColorsLink = $('<a href="javascript:void(0);">reset pastel background colors</a>');
  
  // $(resetColorsLink).click(function() {
  //   var bgColor = '';
    
  //   $.each($('.controls-section-wrap'), function(i, el) {
  //     /* create a random pastel color */
  //     var color = new Color(pastel());
  //     gradientBackground(el, color, '#FFFFFF');
  //     colors[$(this).attr('class').replace('controls-section-wrap ', '')] = color.toString();
      
  //     $.each($(el).find('.element-wrap, .dynamic-wrap'), function(j, el) {
        
  //       color = new Color(color);
  //       bgColor = color.getLighter(50);
        
  //       gradientBackground(el, bgColor, '#FFFFFF');
  //     });
  //   });
  // }).appendTo(resetColorsHeader);
  
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
        // var rc = genHex();
        /* generate a random color for the background of the section */
        // var backgroundColor = new Color(pastel());
        var backgroundColor = 'blue';
        var name = section.name != undefined ? section.name : 'Unknown Sectrion';
        var className = section.name.toLowerCase().replace(/\s|\//g, '-').replace(/\(|\)/g, '');
        var strSelector = section.selector != undefined ? section.selector
                  .replace(module_re.current, '$(module_current)')
                  .replace(re, i) : '';
        var selector = strSelector != '' ? eval(strSelector) : null;
        
          if ( $('#dlg-controls').dialog('isOpen') ) {
            // if ( colors[className] != undefined ) {
            //   backgroundColor = colors[className];
            // }
          }

        if ( section.selector != undefined ) {
          if ( !$(selector)[0] ) {
            return;
          }
        }
        
        /* create a section */
        var sectionWrap = createSection({
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
                  .replace(module_re.current, '$(module_current)')
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
                    .replace(module_re.current, '$(module_current)')
                    .replace(re, counter)
                  : '',
          callback = obj.callback != undefined ? obj.callback : null;
          extract = obj.extract != undefined ? obj.extract : null;
        
        if ( sections ) {
          getSections(wrap, sections);
        }
        
        if ( selector[0] ) {
          
          gradientBackground(elementWrap, bgColor, '#FFFFFF');
          gradientBackground(hr, '#000000', '#FFFFFF');
          
          if ( dynamic ) {
            
            depth += 1;
            wrap = elementWrap;
            
            if ( !markup ) {
              console.log('Dynamic content detected, no markup property');
            }
            
            var btnAddItem = $('<a href="javascript:;"/>')
                      .html('Add Item')
                      .click(function() {
                        $('.editing-element').remove();
                        addHTML({
                          pSelector	: pSelector,
                          newElSel	: strSelector,
                          element	: obj,
                          html	: markup
                        });
                        drawControls(null, $('#dlg-controls').scrollTop(), start);
                        // save();
                      })
                      .appendTo($('<p/>').appendTo(elementWrap)),
              btnRemItem = $('<a href="javascript:;"/>')
                      .html('Rem Item')
                      .click(function() {
                        if ( $(selector).children().length > 1 ) {
                          $(selector).children(':last-child').remove();
                          drawControls(null, $('#dlg-controls').scrollTop(), start);
                          // save();
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
                
                input = createInput({
                  editable		  : this,
                  value			    : this.value ? this.value : '',
                  section			  : section,
                  type			    : this.type != undefined ? this.type : 'text',
                  selections		: this.selections != undefined ? this.selections : [],
                  sub_section		: property,
                  selector		  : selector, /* what element to change? */
                  affects			  : affects, /* what element to change? */
                  attr			    : property, /* what will we need to change? */
                  sec_wrap		  : elementWrap,
                  left			    : left,
                  max_width		  : max_width,
                  noHighlight		: this.noHighlight != undefined ? this.noHighlight : false,
                  replace_text	: replace_text || '',
                  callback		  : callback,
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
                  
                  We also preventDefault for all anchors (return false;) however this is controlled by test_links
                */
                $(eval(selector))
                  .unbind('click')
                  .click(function(e) {
                    e.stopPropagation();
                    $('.inputs-wrap .contenteditable').removeClass('current');
                    $(input).addClass('current');
                    scrollTo($($(input)[0]).parent().parent());
                    $('.editing-element').remove();
                    if ( !this.noHighlight ) {
                      createEditingElement( this, selector, max_width, left );
                    }
                    if ( !test_links ) {
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
        parent = parent || module_current,
        pSelector = pSelector || '$(module_current)';
      
      $.each(elements, function(i, element) {
        
        var name = element.name.replace(re, counter + 1) || 'Element (unknown)',
          dynamic = element.elements != undefined ? true : false;
          
          
        
        if ( element.selector != undefined ) {
          var strSelector = element.selector
                  .replace(/{parent}|{p}/g, pSelector)
                  .replace(module_re.current, '$(module_current)')
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
                  .replace(module_re.current, '$(module_current)')
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
}

function openControls () {
  var module = module_current;
  console.log(module);
	var data = $.data(module_current, 'data');
		
		/* make sure we have the module and it's data */
		// if ( module && data ) {
			
			if ( $('#dlg-controls').dialog('isOpen') ) {
				drawControls();
			} else {
				
				// disableLinks();
				/*
					we're binding save on close for dlg controls here because on startup it actually opens
					and closes one time and will mess up the save process making it ::::::main-@Date...
					(if restore or set source was processed) because it doesn't have site and package name
				*/
				$('#dlg-controls')
					.unbind('dialogclose')
					.bind('dialogclose', function(e, ui) {
						setTimeout(function() {
              // save();
            }, 500);
					});
				drawControls();
				/* open the controls */
				// module.last_edited = module;
				$('#dlg-controls').dialog('open');
				
				/* MODULE CALLBACK: for when dlg Controls has been opened */
				// if ( $.data(module, 'data').controlsOpened != undefined ) {
				// 	$.data(module, 'data').controlsOpened.call(this);
				// }
			}
			/* set the title of the dialog no matter what because it will be open at this point */
			$('#dlg-controls').dialog('option', 'title', 'Edit: ' + data.name != undefined ? data.name : 'Unknown Module');
		// } else {
			
		// 	if ( module && $(module).attr('id') != 'unknown-module' ) {
		// 		drawControls();
		// 		disableLinks();
				
		// 		if ( !$('#dlg-controls').dialog('isOpen') ) {
		// 			$('#dlg-controls').dialog('open');
		// 		}
		// 		$('#dlg-controls').dialog('option', 'title', 'Edit: Unknown Module');
		// 	}
		// }
}

function hideOverlay (element) {
  var element = element != undefined ? element : $('#controls-opener');
  $(element)
    .css({
      display	: 'none',
      height	: '0px',
      width	: '0px'
    })
    .unbind('click')
    .appendTo('body');
}

function getComponent (options) {
  var options = $.extend({
    /* default to auto loading modules so leaves controls closed */
    col             : null,
    openControls		: false,
    module				  : null,
    file_name			  : '',
    well				    : null,
    fromMenu			  : false,
    skipUndo			  : false
  }, options);

  if (options.col) {
    $.ajax({
      url			: 'components/' + options.file_name,
      dataType	: 'html',
      data		: '',
      error : function(xhr, status, error) {
        console.log('getModule error ', xhr, status, error);
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

        $.each($(data), function(i, v) {
          var el = this;

          /* handle the HTML */
          if ( el.nodeType === 1 && el.nodeName.toLowerCase() === 'div' ) {
            module = el;
            // module = options.module ? options.module : el;
            module_current = module;
          }
          
          /* handle the JSON (ALWAYS) */
          if (el.nodeType === 1 && el.nodeName.toLowerCase() === 'script') {
            if (module) {
              /* fill new module with data if available */
              $.extend(module_data, eval($(el).text()));
              $.data(module, 'data', module_data);
              if ( $.data(module, 'data').init ) {
                _init = true;
              }
            }
          }
        });

        if ( module ) {
        // $(options.col).append(data);
          $(module)
            .mouseover(function() {

              if ( module_data.editable ) {
                // if ( $('#dlg-components-menu').dialog('isOpen') && module == module_current ) {
                //   console.log('returning');
                //   return false;
                // }
                
                $('#controls-opener')
                  .off('click')
                  .css({
                    display		: 'block',
                    filter		: 'alpha(opacity=' + 15 + ')',
                    height		: $(module).outerHeight() + 'px',
                    left      : $(module).offset().left + 'px',
                    opacity		: 15 / 100,
                    top       : $(module).offset().top + 'px',
                    width		: ($(module).outerWidth(true) - parseInt($(module).css('padding-right'), 10)) + 'px'
                  })
                  .mouseout(function() {
                    hideOverlay();
                  })
                  .click(function(e) {
                    e.stopPropagation();
                    // if ( !sorted ) {
                      /* set the current module and data within module and open the controls dialog */
                      
                      module_current = $(module)[0];
                      
                      openControls();
                      // hideOverlay();
                    // } else {
                    //   sorted = false;
                    // }
                  })
                  /*
                    you want the controls to be appended to same LI that the module is in
                    so that when you are sorting (you will be on mouse over) - the LI is
                    still sortable
                  */
                  .appendTo('body');
              }
            })
            .appendTo(options.col);
        }
      }
    });
  }
}

/* DOM Ready */
$(function () {
  $('.container-fluid').sortable({
    handle      : '.row-controls-wrap',
    placeholder : 'portlet-placeholder ui-corner-all'
  });

  makeColumnsSortableAndDroppable('.row');

  var rowControlsHTML = tmpl('tmpl_row_controls', {
    removable  : false
  });
  $('.row').prepend(rowControlsHTML);

  $( '#dlg-components-menu' ).dialog({
    autoOpen  : false,
    resizable : false,
    height    : 'auto',
    width     : 400
  });

  /* BEGIN: dlg Controls */

	$('#dlg-controls').dialog({
		width			: 500,
		height			: 400,
		position		: ['center', 50],
		closeOnEscape	: false,
		
		close : function() {
			// $('.editing-element').remove();
			
			// var data = module.current ? $.data(module.current, 'data') : null;
			// if ( data && data.controlsClosed != undefined ) {
			// 	data.controlsClosed.call(this);
			// }
		},
		
		buttons: {
			
			/*'Pod Src': function() {
				getSource(module.current);
			},*/
			
			Close : function( e, ui ) {
				$('#dlg-controls').dialog('close');
			},
			
			Delete : function( e ) {
				// e.preventDefault();
				// var title = $('#dlg-controls')
				// 		.dialog('option', 'title')
				// 		.toString()
				// 		.substring(6, $('#dlg-controls').dialog('option', 'title').length),
				// 	msg = '<p>Are you sure you wish to delete module?</p><p>*' + title + '</p>';
				// confirm(msg);
			},
			
			Help : function( e, ui ) {
				// showHelp($.data(module.current, 'data').help != undefined ? $.data(module.current, 'data').help : 'modules' );
			}
		}
	});

/* END: dlg Controls */

  /* BTN ADD ROW */
  $(document).on('click', '.btn-add-row', function () {
    var rowHTML = tmpl('tmpl_row', {});
    var columnHTML = tmpl('tmpl_column', {});
    var dummyHTML = tmpl('tmpl_dummy_html', {});
    var rowControlsHTML = tmpl('tmpl_row_controls', {
      removable  : true
    });
    var row = '.row:last-child';

    $('.container-fluid')
      .append(rowHTML)
      .find(row)
        .prepend(rowControlsHTML)
        .append(columnHTML)
          .find('.col-md:last-child')
            .append(dummyHTML);
    
    makeColumnsSortableAndDroppable(row);
  });

  /* BTN REMOVE ROW */
  $(document).on('click', '.btn-remove-row', function () {
    $(this).parents('.row').remove();
  });

  /* BTN ADD COLUMN */
  $(document).on('click', '.btn-add-column', function () {
    var columnHTML = tmpl('tmpl_column', {});
    var dummyHTML = tmpl('tmpl_dummy_html', {});

    $(this).parents('.row')
      .append(columnHTML)
      .find('.col-md:last-child')
        .append(dummyHTML);

    makeColumnsSortableAndDroppable($(this).parents('.row'));
  });

  /* BTN REMOVE COLUMN */
  $(document).on('click', '.btn-remove-column', function () {
    $(this).parents('.col-md').remove();
  });

  /* BTN(s) COMPONENT */
  $('.component-menu a').draggable({
    revert: 'invalid',
    helper:'clone',
    appendTo: 'body',
    containment: 'DOM',
    zIndex: 1500,
    addClasses: false
  });

  /* BTN ADD COMPONENT */
  $(document).on('click', '.btn-add-component', function () {
    $( '#dlg-components-menu' ).dialog('open');
  });
});

})(jQuery);