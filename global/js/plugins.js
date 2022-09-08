/*
	$.toJSON extension
*/
(function($){var escapeable=/["\\\x00-\x1f\x7f-\x9f]/g,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};$.toJSON=typeof JSON==='object'&&JSON.stringify?JSON.stringify:function(o){if(o===null){return'null';}
var type=typeof o;if(type==='undefined'){return undefined;}
if(type==='number'||type==='boolean'){return''+o;}
if(type==='string'){return $.quoteString(o);}
if(type==='object'){if(typeof o.toJSON==='function'){return $.toJSON(o.toJSON());}
if(o.constructor===Date){var month=o.getUTCMonth()+1,day=o.getUTCDate(),year=o.getUTCFullYear(),hours=o.getUTCHours(),minutes=o.getUTCMinutes(),seconds=o.getUTCSeconds(),milli=o.getUTCMilliseconds();if(month<10){month='0'+month;}
if(day<10){day='0'+day;}
if(hours<10){hours='0'+hours;}
if(minutes<10){minutes='0'+minutes;}
if(seconds<10){seconds='0'+seconds;}
if(milli<100){milli='0'+milli;}
if(milli<10){milli='0'+milli;}
return'"'+year+'-'+month+'-'+day+'T'+
hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
if(o.constructor===Array){var ret=[];for(var i=0;i<o.length;i++){ret.push($.toJSON(o[i])||'null');}
return'['+ret.join(',')+']';}
var name,val,pairs=[];for(var k in o){type=typeof k;if(type==='number'){name='"'+k+'"';}else if(type==='string'){name=$.quoteString(k);}else{continue;}
type=typeof o[k];if(type==='function'||type==='undefined'){continue;}
val=$.toJSON(o[k]);pairs.push(name+':'+val);}
return'{'+pairs.join(',')+'}';}};$.evalJSON=typeof JSON==='object'&&JSON.parse?JSON.parse:function(src){return eval('('+src+')');};$.secureEvalJSON=typeof JSON==='object'&&JSON.parse?JSON.parse:function(src){var filtered=src.replace(/\\["\\\/bfnrtu]/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered)){return eval('('+src+')');}else{throw new SyntaxError('Error parsing JSON, source is not valid.');}};$.quoteString=function(string){if(string.match(escapeable)){return'"'+string.replace(escapeable,function(a){var c=meta[a];if(typeof c==='string'){return c;}
c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
return'"'+string+'"';};})(jQuery);


/**
*
* A jQuery UI plugin for snapping while resize
* 
* Version 0.9999
* January 15th, 2011
*
* Copyright (c) 2011 Artem Kuzmyk
* Free for everyone
* Developed with jQuery 1.4.4 and jQuery UI 1.8.9
* 
* use "snap" option as in draggable widget, snap : "#snaps" or snap : ".c-snaps" etc.
**/

$.ui.plugin.add("resizable", "snap", {
    start: function (event, ui) {
        var i = $(this).data("resizable"), o = i.options;
        i.snapElements = [];

        $(o.snap.constructor != String ? (o.snap.items || ':data(resizable)') : o.snap)
        .each(function () {
            var $t = $(this);
            var $o = $t.position();
            if (this != i.element[0])
                i.snapElements.push({
                    item: this,
                    width: $t.outerWidth(),
                    height: $t.outerHeight(),
                    top: $o.top,
                    left: $o.left 
                });
        });

    },
    resize: function (event, ui) {

        var inst = $(this).data("resizable"), o = inst.options;
        var d = o.snapTolerance;

        var x1 = ui.position.left, x2 = x1 + ui.size.width + (ui.helper.outerWidth() - ui.helper.width()),
			y1 = ui.position.top, y2 = y1 + ui.size.height + (ui.helper.outerHeight() - ui.helper.height());


        var candidateSizes = [];

        for (var i = inst.snapElements.length - 1; i >= 0; i--) {

            var tmpS = $.extend({}, ui.size);

            var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

            if (!(
            (l - d < x1 && x1 < r + d && t - d < y1 && y1 < b + d) ||
            (l - d < x1 && x1 < r + d && t - d < y2 && y2 < b + d) ||
            (l - d < x2 && x2 < r + d && t - d < y1 && y1 < b + d) ||
            (l - d < x2 && x2 < r + d && t - d < y2 && y2 < b + d))) {
                //if (inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
                inst.snapElements[i].snapping = false;
                continue;
            }

            if (o.snapMode != 'inner') {
                var ts = Math.abs(t - y2) <= d;
                var bs = Math.abs(b - y1) <= d;
                var ls = Math.abs(l - x2) <= d;
                var rs = Math.abs(r - x1) <= d;

                if (ts) tmpS.height += t - y2;
                if (bs) tmpS.height += b - y1;
                if (ls) tmpS.width += l - x2;
                if (rs) tmpS.width += r - x1;
            }

            var first = (ts || bs || ls || rs);

            if (o.snapMode != 'outer') {
                var ts = Math.abs(t - y1) <= d;
                var bs = Math.abs(b - y2) <= d;
                var ls = Math.abs(l - x1) <= d;
                var rs = Math.abs(r - x2) <= d;

                if (ts) tmpS.height += t - y1;
                if (bs) tmpS.height += b - y2;
                if (ls) tmpS.width += l - x1;
                if (rs) tmpS.width += r - x2;
            }

            /*if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
            (inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));*/
            inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

            if (ts || bs || ls || rs || first)
                candidateSizes.push(tmpS);
        };

        /*если есть кандитаты на новый размер то выбираем из них наименьший*/
        if (candidateSizes.length > 0) {
            var minSize = { height: Number.MAX_VALUE, width: Number.MAX_VALUE };

            for (var i = 0; i < candidateSizes.length; i++) {
                var cs = candidateSizes[i];
                minSize.height = Math.min(cs.height, minSize.height);
                minSize.width = Math.min(cs.width, minSize.width);
            }


            ui.size.height = minSize.height;
            ui.size.width = minSize.width;
        }

    }
});

/*
	Local Storage jQuery plug-in
	
	set(key, value)
	$.jStorage.set(key, value);
	
	get(key[, default])
	value = $.jStorage.get(key)
	value = $.jStorage.get(key, "default value")
	
	deleteKey(key)
	$.jStorage.deleteKey(key)
	
	flush()
	$.jStorage.flush()
	
	index()
	$.jStorage.index()
	Returns all the keys currently in use as an array.
	var index = $.jStorage.index();
	console.log(index); // ["key1","key2","key3"]
	
	storageSize()
	$.jStorage.storageSize()
	
	reInit()
	$.jStorage.reInit()
	Reloads the data from browser storage (for example if you have reasons to believe that the data has been altered in another tab etc.)
	
	storageAvailable()
	$.jStorage.storageAvailable()
	Returns true if storage is available
*/
(function(e){function k(){if(d.jStorage)try{c=l(String(d.jStorage))}catch(a){d.jStorage="{}"}else d.jStorage="{}";g=d.jStorage?String(d.jStorage).length:0}function h(){try{d.jStorage=m(c),b&&(b.setAttribute("jStorage",d.jStorage),b.save("jStorage")),g=d.jStorage?String(d.jStorage).length:0}catch(a){}}function i(a){if(!a||typeof a!="string"&&typeof a!="number")throw new TypeError("Key name must be string or numeric");return!0}if(!e||!e.toJSON&&!Object.toJSON&&!window.JSON)throw Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!");
var c={},d={jStorage:"{}"},b=null,g=0,m=e.toJSON||Object.toJSON||window.JSON&&(JSON.encode||JSON.stringify),l=e.evalJSON||window.JSON&&(JSON.decode||JSON.parse)||function(a){return String(a).evalJSON()},f=!1,j={isXML:function(a){return(a=(a?a.ownerDocument||a:0).documentElement)?a.nodeName!=="HTML":!1},encode:function(a){if(!this.isXML(a))return!1;try{return(new XMLSerializer).serializeToString(a)}catch(b){try{return a.xml}catch(c){}}return!1},decode:function(a){var b="DOMParser"in window&&(new DOMParser).parseFromString||
window.ActiveXObject&&function(a){var b=new ActiveXObject("Microsoft.XMLDOM");b.async="false";b.loadXML(a);return b};if(!b)return!1;a=b.call("DOMParser"in window&&new DOMParser||window,a,"text/xml");return this.isXML(a)?a:!1}};e.jStorage={version:"0.1.5.3",set:function(a,b){i(a);j.isXML(b)&&(b={_is_xml:!0,xml:j.encode(b)});c[a]=b;h();return b},get:function(a,b){i(a);return a in c?c[a]&&typeof c[a]=="object"&&c[a]._is_xml&&c[a]._is_xml?j.decode(c[a].xml):c[a]:typeof b=="undefined"?null:b},deleteKey:function(a){i(a);
return a in c?(delete c[a],h(),!0):!1},flush:function(){c={};h();return!0},storageObj:function(){function a(){}a.prototype=c;return new a},index:function(){var a=[],b;for(b in c)c.hasOwnProperty(b)&&a.push(b);return a},storageSize:function(){return g},currentBackend:function(){return f},storageAvailable:function(){return!!f},reInit:function(){var a;if(b&&b.addBehavior){a=document.createElement("link");b.parentNode.replaceChild(a,b);b=a;b.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(b);
b.load("jStorage");a="{}";try{a=b.getAttribute("jStorage")}catch(c){}d.jStorage=a;f="userDataBehavior"}k()}};(function(){if("localStorage"in window)try{if(window.localStorage)d=window.localStorage,f="localStorage"}catch(a){}else if("globalStorage"in window)try{window.globalStorage&&(d=window.globalStorage[window.location.hostname],f="globalStorage")}catch(c){}else if(b=document.createElement("link"),b.addBehavior){b.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(b);
b.load("jStorage");var e="{}";try{e=b.getAttribute("jStorage")}catch(g){}d.jStorage=e;f="userDataBehavior"}else{b=null;return}k()})()})(window.jQuery||window.$);

/*
	COLOR Picker
*/
(function(a){var b=function(){var b={},c,d=65,e,f='<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',g={eventName:"click",onShow:function(){},onBeforeShow:function(){},onHide:function(){},onChange:function(){},onSubmit:function(){},color:"ff0000",livePreview:true,flat:false},h=function(b,c){var d=O(b);a(c).data("colorpicker").fields.eq(1).val(d.r).end().eq(2).val(d.g).end().eq(3).val(d.b).end()},i=function(b,c){a(c).data("colorpicker").fields.eq(4).val(b.h).end().eq(5).val(b.s).end().eq(6).val(b.b).end()},j=function(b,c){a(c).data("colorpicker").fields.eq(0).val(Q(b)).end()},k=function(b,c){a(c).data("colorpicker").selector.css("backgroundColor","#"+Q({h:b.h,s:100,b:100}));a(c).data("colorpicker").selectorIndic.css({left:parseInt(150*b.s/100,10),top:parseInt(150*(100-b.b)/100,10)})},l=function(b,c){a(c).data("colorpicker").hue.css("top",parseInt(150-150*b.h/360,10))},m=function(b,c){a(c).data("colorpicker").currentColor.css("backgroundColor","#"+Q(b))},n=function(b,c){a(c).data("colorpicker").newColor.css("backgroundColor","#"+Q(b))},o=function(b){var c=b.charCode||b.keyCode||-1;if(c>d&&c<=90||c==32){return false}var e=a(this).parent().parent();if(e.data("colorpicker").livePreview===true){p.apply(this)}},p=function(b){var c=a(this).parent().parent(),d;if(this.parentNode.className.indexOf("_hex")>0){c.data("colorpicker").color=d=M(K(this.value))}else if(this.parentNode.className.indexOf("_hsb")>0){c.data("colorpicker").color=d=I({h:parseInt(c.data("colorpicker").fields.eq(4).val(),10),s:parseInt(c.data("colorpicker").fields.eq(5).val(),10),b:parseInt(c.data("colorpicker").fields.eq(6).val(),10)})}else{c.data("colorpicker").color=d=N(J({r:parseInt(c.data("colorpicker").fields.eq(1).val(),10),g:parseInt(c.data("colorpicker").fields.eq(2).val(),10),b:parseInt(c.data("colorpicker").fields.eq(3).val(),10)}))}if(b){h(d,c.get(0));j(d,c.get(0));i(d,c.get(0))}k(d,c.get(0));l(d,c.get(0));n(d,c.get(0));c.data("colorpicker").onChange.apply(c,[d,Q(d),O(d)])},q=function(b){var c=a(this).parent().parent();c.data("colorpicker").fields.parent().removeClass("colorpicker_focus")},r=function(){d=this.parentNode.className.indexOf("_hex")>0?70:65;a(this).parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus");a(this).parent().addClass("colorpicker_focus")},s=function(b){var c=a(this).parent().find("input").focus();var d={el:a(this).parent().addClass("colorpicker_slider"),max:this.parentNode.className.indexOf("_hsb_h")>0?360:this.parentNode.className.indexOf("_hsb")>0?100:255,y:b.pageY,field:c,val:parseInt(c.val(),10),preview:a(this).parent().parent().data("colorpicker").livePreview};a(document).bind("mouseup",d,u);a(document).bind("mousemove",d,t)},t=function(a){a.data.field.val(Math.max(0,Math.min(a.data.max,parseInt(a.data.val+a.pageY-a.data.y,10))));if(a.data.preview)p.apply(a.data.field.get(0),[true]);return false},u=function(b){p.apply(b.data.field.get(0),[true]);b.data.el.removeClass("colorpicker_slider").find("input").focus();a(document).unbind("mouseup",u);a(document).unbind("mousemove",t);return false},v=function(b){var c={cal:a(this).parent(),y:a(this).offset().top};c.preview=c.cal.data("colorpicker").livePreview;a(document).bind("mouseup",c,x);a(document).bind("mousemove",c,w)},w=function(a){p.apply(a.data.cal.data("colorpicker").fields.eq(4).val(parseInt(360*(150-Math.max(0,Math.min(150,a.pageY-a.data.y)))/150,10)).get(0),[a.data.preview]);return false},x=function(b){h(b.data.cal.data("colorpicker").color,b.data.cal.get(0));j(b.data.cal.data("colorpicker").color,b.data.cal.get(0));a(document).unbind("mouseup",x);a(document).unbind("mousemove",w);return false},y=function(b){var c={cal:a(this).parent(),pos:a(this).offset()};c.preview=c.cal.data("colorpicker").livePreview;a(document).bind("mouseup",c,A);a(document).bind("mousemove",c,z)},z=function(a){p.apply(a.data.cal.data("colorpicker").fields.eq(6).val(parseInt(100*(150-Math.max(0,Math.min(150,a.pageY-a.data.pos.top)))/150,10)).end().eq(5).val(parseInt(100*Math.max(0,Math.min(150,a.pageX-a.data.pos.left))/150,10)).get(0),[a.data.preview]);return false},A=function(b){h(b.data.cal.data("colorpicker").color,b.data.cal.get(0));j(b.data.cal.data("colorpicker").color,b.data.cal.get(0));a(document).unbind("mouseup",A);a(document).unbind("mousemove",z);return false},B=function(b){a(this).addClass("colorpicker_focus")},C=function(b){a(this).removeClass("colorpicker_focus")},D=function(b){var c=a(this).parent();var d=c.data("colorpicker").color;c.data("colorpicker").origColor=d;m(d,c.get(0));c.data("colorpicker").onSubmit(d,Q(d),O(d),c.data("colorpicker").el)},E=function(b){var c=a("#"+a(this).data("colorpickerId"));c.data("colorpicker").onBeforeShow.apply(this,[c.get(0)]);var d=a(this).offset();var e=H();var f=d.top+this.offsetHeight;var g=d.left;if(f+176>e.t+e.h)f-=this.offsetHeight+176;if(g+356>e.l+e.w)g-=356;c.css({left:g+"px",top:f+"px",zIndex:a.moveToTop()+1});if(c.data("colorpicker").onShow.apply(this,[c.get(0)])!=false)c.show();a(document).bind("mousedown",{cal:c},F);return false},F=function(b){if(!G(b.data.cal.get(0),b.target,b.data.cal.get(0))){if(b.data.cal.data("colorpicker").onHide.apply(this,[b.data.cal.get(0)])!=false)b.data.cal.hide();a(document).unbind("mousedown",F)}},G=function(a,b,c){if(a==b)return true;if(a.contains)return a.contains(b);if(a.compareDocumentPosition)return!!(a.compareDocumentPosition(b)&16);var d=b.parentNode;while(d&&d!=c){if(d==a)return true;d=d.parentNode}return false},H=function(){var a=document.compatMode=="CSS1Compat";return{l:window.pageXOffset||(a?document.documentElement.scrollLeft:document.body.scrollLeft),t:window.pageYOffset||(a?document.documentElement.scrollTop:document.body.scrollTop),w:window.innerWidth||(a?document.documentElement.clientWidth:document.body.clientWidth),h:window.innerHeight||(a?document.documentElement.clientHeight:document.body.clientHeight)}},I=function(a){return{h:Math.min(360,Math.max(0,a.h)),s:Math.min(100,Math.max(0,a.s)),b:Math.min(100,Math.max(0,a.b))}},J=function(a){return{r:Math.min(255,Math.max(0,a.r)),g:Math.min(255,Math.max(0,a.g)),b:Math.min(255,Math.max(0,a.b))}},K=function(a){var b=6-a.length;if(b>0){var c=[];for(var d=0;d<b;d++){c.push("0")}c.push(a);a=c.join("")}return a},L=function(a){var a=parseInt(a.indexOf("#")>-1?a.substring(1):a,16);return{r:a>>16,g:(a&65280)>>8,b:a&255}},M=function(a){return N(L(a))},N=function(a){var b={h:0,s:0,b:0};var c=Math.min(a.r,a.g,a.b);var d=Math.max(a.r,a.g,a.b);var e=d-c;b.b=d;if(d!=0){}b.s=d!=0?255*e/d:0;if(b.s!=0){if(a.r==d)b.h=(a.g-a.b)/e;else if(a.g==d)b.h=2+(a.b-a.r)/e;else b.h=4+(a.r-a.g)/e}else{b.h=-1}b.h*=60;if(b.h<0){b.h+=360}b.s*=100/255;b.b*=100/255;return b},O=function(a){var b={};var c=Math.round(a.h);var d=Math.round(a.s*255/100);var e=Math.round(a.b*255/100);if(d==0){b.r=b.g=b.b=e}else{var f=e;var g=(255-d)*e/255;var h=(f-g)*(c%60)/60;if(c==360)c=0;if(c<60){b.r=f;b.b=g;b.g=g+h}else if(c<120){b.g=f;b.b=g;b.r=f-h}else if(c<180){b.g=f;b.r=g;b.b=g+h}else if(c<240){b.b=f;b.r=g;b.g=f-h}else if(c<300){b.b=f;b.g=g;b.r=g+h}else if(c<360){b.r=f;b.g=g;b.b=f-h}else{b.r=0;b.g=0;b.b=0}}return{r:Math.round(b.r),g:Math.round(b.g),b:Math.round(b.b)}},P=function(b){var c=[b.r.toString(16),b.g.toString(16),b.b.toString(16)];a.each(c,function(a,b){if(b.length==1){c[a]="0"+b}});return c.join("")},Q=function(a){return P(O(a))},R=function(){var b=a(this).parent();var c=b.data("colorpicker").origColor;b.data("colorpicker").color=c;h(c,b.get(0));j(c,b.get(0));i(c,b.get(0));k(c,b.get(0));l(c,b.get(0));n(c,b.get(0))};return{init:function(b){b=a.extend({},g,b||{});if(typeof b.color=="string")b.color=M(b.color);else if(b.color.r!=undefined&&b.color.g!=undefined&&b.color.b!=undefined)b.color=N(b.color);else if(b.color.h!=undefined&&b.color.s!=undefined&&b.color.b!=undefined)b.color=I(b.color);else{return this}return this.each(function(){if(!a(this).data("colorpickerId")){var c=a.extend({},b);c.origColor=b.color;var d="collorpicker_"+parseInt(Math.random()*1e3);a(this).data("colorpickerId",d);var e=a(f).attr("id",d);if(c.flat)e.appendTo(this).show();else e.appendTo(document.body);c.fields=e.find("input").bind("keyup",o).bind("change",p).bind("blur",q).bind("focus",r);e.find("span").bind("mousedown",s).end().find(">div.colorpicker_current_color").bind("click",R);c.selector=e.find("div.colorpicker_color").bind("mousedown",y);c.selectorIndic=c.selector.find("div div");c.el=this;c.hue=e.find("div.colorpicker_hue div");e.find("div.colorpicker_hue").bind("mousedown",v);c.newColor=e.find("div.colorpicker_new_color");c.currentColor=e.find("div.colorpicker_current_color");e.data("colorpicker",c);e.find("div.colorpicker_submit").bind("mouseenter",B).bind("mouseleave",C).bind("click",D);h(c.color,e.get(0));i(c.color,e.get(0));j(c.color,e.get(0));l(c.color,e.get(0));k(c.color,e.get(0));m(c.color,e.get(0));n(c.color,e.get(0));if(c.flat)e.css({position:"relative",display:"block"});else a(this).bind(c.eventName,E)}})},showPicker:function(){return this.each(function(){if(a(this).data("colorpickerId")){E.apply(this)}})},hidePicker:function(){return this.each(function(){if(a(this).data("colorpickerId")){a("#"+a(this).data("colorpickerId")).hide()}})},setColor:function(b){if(typeof b=="string")b=M(b);else if(b.r!=undefined&&b.g!=undefined&&b.b!=undefined)b=N(b);else if(b.h!=undefined&&b.s!=undefined&&b.b!=undefined)b=I(b);else return this;return this.each(function(){if(a(this).data("colorpickerId")){var c=a("#"+a(this).data("colorpickerId"));c.data("colorpicker").color=b;c.data("colorpicker").origColor=b;h(b,c.get(0));i(b,c.get(0));j(b,c.get(0));l(b,c.get(0));k(b,c.get(0));m(b,c.get(0));n(b,c.get(0))}})}}}();a.fn.extend({ColorPicker:b.init,ColorPickerHide:b.hidePicker,ColorPickerShow:b.showPicker,ColorPickerSetColor:b.setColor})})(jQuery);$.fn.rgb2Hex=function(a){a=a.replace(/\s/g,"");var b={};var c=a.indexOf(",");var d=a.lastIndexOf(",");b.r=parseInt(a.substring(a.indexOf("(")+1,c),10);b.g=parseInt(a.substring(c+1,d),10);b.b=parseInt(a.substring(d+1,a.indexOf(")")),10);var e=[b.r.toString(16),b.g.toString(16),b.b.toString(16)];$.each(e,function(a,b){if(b.length==1)e[a]="0"+b});return e.join("")}

/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', {expires: 7, path: '/', domain: 'jquery.com', secure: true});
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/*
 * Treeview 1.5pre - jQuery plugin to hide and show branches of a tree
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 * http://docs.jquery.com/Plugins/Treeview
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.treeview.js 5759 2008-07-01 07:50:28Z joern.zaefferer $
 *
 */

;(function($) {

	// TODO rewrite as a widget, removing all the extra plugins
	$.extend($.fn, {
		swapClass: function(c1, c2) {
			var c1Elements = this.filter('.' + c1);
			this.filter('.' + c2).removeClass(c2).addClass(c1);
			c1Elements.removeClass(c1).addClass(c2);
			return this;
		},
		replaceClass: function(c1, c2) {
			return this.filter('.' + c1).removeClass(c1).addClass(c2).end();
		},
		hoverClass: function(className) {
			className = className || "hover";
			return this.hover(function() {
				$(this).addClass(className);
			}, function() {
				$(this).removeClass(className);
			});
		},
		heightToggle: function(animated, callback) {
			animated ?
				this.animate({ height: "toggle" }, animated, callback) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(":hidden") ? "show" : "hide" ]();
					if(callback)
						callback.apply(this, arguments);
				});
		},
		heightHide: function(animated, callback) {
			if (animated) {
				this.animate({ height: "hide" }, animated, callback);
			} else {
				this.hide();
				if (callback)
					this.each(callback);				
			}
		},
		prepareBranches: function(settings) {
			if (!settings.prerendered) {
				// mark last tree items
				this.filter(":last-child:not(ul)").addClass(CLASSES.last);
				// collapse whole tree, or only those marked as closed, anyway except those marked as open
				this.filter((settings.collapsed ? "" : "." + CLASSES.closed) + ":not(." + CLASSES.open + ")").find(">ul").hide();
			}
			// return all items with sublists
			return this.filter(":has(>ul)");
		},
		applyClasses: function(settings, toggler) {
			// TODO use event delegation
			this.filter(":has(>ul):not(:has(>a))").find(">span").unbind("click.treeview").bind("click.treeview", function(event) {
				// don't handle click events on children, eg. checkboxes
				if ( this == event.target )
					toggler.apply($(this).next());
			}).add( $("a", this) ).hoverClass();
			
			if (!settings.prerendered) {
				// handle closed ones first
				this.filter(":has(>ul:hidden)")
						.addClass(CLASSES.expandable)
						.replaceClass(CLASSES.last, CLASSES.lastExpandable);
						
				// handle open ones
				this.not(":has(>ul:hidden)")
						.addClass(CLASSES.collapsable)
						.replaceClass(CLASSES.last, CLASSES.lastCollapsable);
						
	            // create hitarea if not present
				var hitarea = this.find("div." + CLASSES.hitarea);
				if (!hitarea.length)
					hitarea = this.prepend("<div class=\"" + CLASSES.hitarea + "\"/>").find("div." + CLASSES.hitarea);
				hitarea.removeClass().addClass(CLASSES.hitarea).each(function() {
					var classes = "";
					$.each($(this).parent().attr("class").split(" "), function() {
						classes += this + "-hitarea ";
					});
					$(this).addClass( classes );
				})
			}
			
			// apply event to hitarea
			this.find("div." + CLASSES.hitarea).click( toggler );
		},
		treeview: function(settings) {
			
			settings = $.extend({
				cookieId: "treeview"
			}, settings);
			
			if ( settings.toggle ) {
				var callback = settings.toggle;
				settings.toggle = function() {
					return callback.apply($(this).parent()[0], arguments);
				};
			}
		
			// factory for treecontroller
			function treeController(tree, control) {
				// factory for click handlers
				function handler(filter) {
					return function() {
						// reuse toggle event handler, applying the elements to toggle
						// start searching for all hitareas
						toggler.apply( $("div." + CLASSES.hitarea, tree).filter(function() {
							// for plain toggle, no filter is provided, otherwise we need to check the parent element
							return filter ? $(this).parent("." + filter).length : true;
						}) );
						return false;
					};
				}
				// click on first element to collapse tree
				$("a:eq(0)", control).click( handler(CLASSES.collapsable) );
				// click on second to expand tree
				$("a:eq(1)", control).click( handler(CLASSES.expandable) );
				// click on third to toggle tree
				$("a:eq(2)", control).click( handler() ); 
			}
		
			// handle toggle event
			function toggler() {
				$(this)
					.parent()
					// swap classes for hitarea
					.find(">.hitarea")
						.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
						.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
					.end()
					// swap classes for parent li
					.swapClass( CLASSES.collapsable, CLASSES.expandable )
					.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
					// find child lists
					.find( ">ul" )
					// toggle them
					.heightToggle( settings.animated, settings.toggle );
				if ( settings.unique ) {
					$(this).parent()
						.siblings()
						// swap classes for hitarea
						.find(">.hitarea")
							.replaceClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
							.replaceClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
						.end()
						.replaceClass( CLASSES.collapsable, CLASSES.expandable )
						.replaceClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
						.find( ">ul" )
						.heightHide( settings.animated, settings.toggle );
				}
			}
			this.data("toggler", toggler);
			
			function serialize() {
				function binary(arg) {
					return arg ? 1 : 0;
				}
				var data = [];
				branches.each(function(i, e) {
					data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
				});
				$.cookie(settings.cookieId, data.join(""), settings.cookieOptions );
			}
			
			function deserialize() {
				var stored = $.cookie(settings.cookieId);
				if ( stored ) {
					var data = stored.split("");
					branches.each(function(i, e) {
						$(e).find(">ul")[ parseInt(data[i]) ? "show" : "hide" ]();
					});
				}
			}
			
			// add treeview class to activate styles
			this.addClass("treeview");
			
			// prepare branches and find all tree items with child lists
			var branches = this.find("li").prepareBranches(settings);
			
			switch(settings.persist) {
			case "cookie":
				var toggleCallback = settings.toggle;
				settings.toggle = function() {
					serialize();
					if (toggleCallback) {
						toggleCallback.apply(this, arguments);
					}
				};
				deserialize();
				break;
			case "location":
				var current = this.find("a").filter(function() {
					return this.href.toLowerCase() == location.href.toLowerCase();
				});
				if ( current.length ) {
					// TODO update the open/closed classes
					var items = current.addClass("selected").parents("ul, li").add( current.next() ).show();
					if (settings.prerendered) {
						// if prerendered is on, replicate the basic class swapping
						items.filter("li")
							.swapClass( CLASSES.collapsable, CLASSES.expandable )
							.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
							.find(">.hitarea")
								.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
								.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea );
					}
				}
				break;
			}
			
			branches.applyClasses(settings, toggler);
				
			// if control option is set, create the treecontroller and show it
			if ( settings.control ) {
				treeController(this, settings.control);
				$(settings.control).show();
			}
			
			return this;
		}
	});
	
	// classes used by the plugin
	// need to be styled via external stylesheet, see first example
	$.treeview = {};
	var CLASSES = ($.treeview.classes = {
		open: "open",
		closed: "closed",
		expandable: "expandable",
		expandableHitarea: "expandable-hitarea",
		lastExpandableHitarea: "lastExpandable-hitarea",
		collapsable: "collapsable",
		collapsableHitarea: "collapsable-hitarea",
		lastCollapsableHitarea: "lastCollapsable-hitarea",
		lastCollapsable: "lastCollapsable",
		lastExpandable: "lastExpandable",
		last: "last",
		hitarea: "hitarea"
	});
	
})(jQuery);

(function($) {
	var CLASSES = $.treeview.classes;
	var proxied = $.fn.treeview;
	$.fn.treeview = function(settings) {
		settings = $.extend({}, settings);
		if (settings.add) {
			return this.trigger("add", [settings.add]);
		}
		if (settings.remove) {
			return this.trigger("remove", [settings.remove]);
		}
		return proxied.apply(this, arguments).bind("add", function(event, branches) {
			$(branches).prev()
				.removeClass(CLASSES.last)
				.removeClass(CLASSES.lastCollapsable)
				.removeClass(CLASSES.lastExpandable)
			.find(">.hitarea")
				.removeClass(CLASSES.lastCollapsableHitarea)
				.removeClass(CLASSES.lastExpandableHitarea);
			$(branches).find("li").andSelf().prepareBranches(settings).applyClasses(settings, $(this).data("toggler"));
		}).bind("remove", function(event, branches) {
			var prev = $(branches).prev();
			var parent = $(branches).parent();
			$(branches).remove();
			prev.filter(":last-child").addClass(CLASSES.last)
				.filter("." + CLASSES.expandable).replaceClass(CLASSES.last, CLASSES.lastExpandable).end()
				.find(">.hitarea").replaceClass(CLASSES.expandableHitarea, CLASSES.lastExpandableHitarea).end()
				.filter("." + CLASSES.collapsable).replaceClass(CLASSES.last, CLASSES.lastCollapsable).end()
				.find(">.hitarea").replaceClass(CLASSES.collapsableHitarea, CLASSES.lastCollapsableHitarea);
			if (parent.is(":not(:has(>))") && parent[0] != this) {
				parent.parent().removeClass(CLASSES.collapsable).removeClass(CLASSES.expandable)
				parent.siblings(".hitarea").andSelf().remove();
			}
		});
	};
	
})(jQuery);

(function($) {

$.moveToTop = function( options ) {  
	var defaults = {};
	var options = $.extend(defaults, options);
	var highest = 1;
	function compareNums(a, b) { return a - b; };
	var all = document.getElementsByTagName('*');
	var mzs = [];
	mzs[0] = 0;
	for ( var i=0; i<all.length; i++ ) {
		if ( all[i].nodeType == 1 ) {
			if (document.all) { if (all[i].currentStyle) { mzI = all[i].currentStyle['zIndex']; if (!isNaN(mzI)) { mzs.push(mzI); } } else if (window.getComputedStyle) { mzI = document.defaultView.getComputedStyle(all[i], null).getPropertyValue('zIndex'); if (!isNaN(mzI)) { mzs.push(mzI); } }
			} else { if (all[i].currentStyle) { mzI = all[i].currentStyle['z-index']; if (!isNaN(mzI)) { mzs.push(mzI); } } else if (window.getComputedStyle) { mzI = document.defaultView.getComputedStyle(all[i], null).getPropertyValue('z-index'); if (!isNaN(mzI)) { mzs.push(mzI); } } }
		}
	}
	mzs = mzs.sort(compareNums);
	highest = parseInt(mzs[mzs.length - 1]);
	if ( highest == 0 ) {
		highest = 100;
	}
	return highest;
};

$.fn.showMenu = function(options) {
    var defaults = {
	    query			: document,
    	opacity			: 1.0,
		obj				: null,
		coloringObj		: null,
		show			: 'all'
	};
	var options = $.extend(defaults, options);
	
	$(this).bind('contextmenu', function(e) {
		
		$('#context-menu .cnvo-commands h3').hide();
		$(options.query).find('a').each(function() {
			$(this).parent().hide();
			if ( $(this).hasClass(options.show) || $(this).hasClass('all') ) {
				$.each($(this).parents(), function() {
					if ( $(this).hasClass('cnvo-commands') ) {
						$('#context-menu .cnvo-commands h3').show();
					}
				});
				$(this).parent().show();
			}
		});
		
		var previewHREF = manageHREF = editContentHREF = copyHREF = activeVersionHREF = editAttributesHREF = duplicateHREF = viewSourceHREF = '';
		/* team raiser vars */
		var editHREF = gH = fpH = tsH = tpH = poH = riH = sriH = wH = rsH = biH = cH = tyH = hpH = dppH = clpH = dcpH = tlpH = dtpH = tplpH = '';
		var siteid = $(options.obj).parents('.site-wrap').attr('siteid');
		
		if ( $(options.obj).hasClass('wrapper') ) {
			/* setup wrapper href's */
			var pwid = $(options.obj).attr('pwid');
			previewHREF = 'http://' + siteid + '.convio.net/site/PageServer?pw_id=' + pwid + '&pagewrapper=pw_list&pagename=page_wrapper_preview&s_locale=en_US&JServSessionIda004=n23mlw0tk1.app318d';
			activeVersionHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageWrapperEditor?pw_id=' + pwid + '&pagewrapper=pw_view1&action=view';
			editAttributesHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageWrapperEditor?pw_id=' + pwid + '&pagewrapper=pw_edit_top&action=edit_versions';
			manageHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageWrapperEditor?pw_id=' + pwid + '&pagewrapper=pw_version_list';
			duplicateHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageWrapperEditor?pw_id=' + pwid + '&pagewrapper=pw_copy&action=copy';
			viewSourceHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageWrapperEditor?pw_id=' + pwid + '&pagewrapper=pw_view_source&action=view_source';
		} else if ( $(options.obj).hasClass('reusable') ) {
			/* setup reusable href's */
			var pageid = $(options.obj).attr('pageid');
			var versionid = $(options.obj).attr('versionid');
			var pagename = $(options.obj).children('a.reusable-link').html();
			previewHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageBuilderPreviewPage?category=2&pagename=' + pagename;
			manageHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageBuilderAdmin?page_id=' + pageid + '&pagebuilder=page_manage&page_copy_insert=yes&action=manage';
			editContentHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageBuilderAdmin?page_id=' + pageid + '&pageaction=edit_contents&pagebuilder=edit_contents&origin_page=page_list&version_id=' + versionid + '&user_wrapper=';
			editAttributesHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageBuilderAdmin?page_id=' + pageid + '&pagebuilder=page_edit&version_id=' + versionid;
			copyHREF = 'https://secure3.convio.net/' + siteid + '/admin/PageBuilderAdmin?page_id=' + pageid + '&pagebuilder=page_copy&page_copy_insert=&version_id=' + versionid;
		} else if ( $(options.obj).hasClass('teamraiser') ) {
			/* setup team raiser href's */
			var frid = $(options.obj).attr('frid');
			editHREF = 'https://secure3.convio.net/vabc/admin/TREdit?tr=teamraiser_create_pa&action=action_create_campaign&fr_id=' + frid;
			copyHREF = 'https://secure3.convio.net/vabc/admin/TREdit?tr=teamraiser_copy_pa&action=action_copy_campaign&fr_id=' + frid;
			manageHREF = 'https://secure3.convio.net/vabc/admin/TREdit?tr=teamraiser_manage_pa&action=manage&fr_id=' + frid;
		}
		
		/* wrapper / reusable context items */
		$('#btn-context-preview').attr('href', previewHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-manage').attr('href', manageHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-edit-content').attr('href', editContentHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-active-version').attr('href', activeVersionHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-edit-attributes').attr('href', editAttributesHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-copy').attr('href', copyHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-duplicate').attr('href', duplicateHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-view-source').attr('href', viewSourceHREF).click(function() { $('#context-menu').hide(); });
		
		/* team raiser context items */
		$('#btn-context-tr-edit').attr('href', editHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-tr-manage').attr('href', manageHREF).click(function() { $('#context-menu').hide(); });
		$('#btn-context-tr-copy').attr('href', copyHREF).click(function() { $('#context-menu').hide(); });
	
		/* show the context menu */
		$(options.query)
			.prop('obj', options.obj)
			.prop('coloringObj', options.coloringObj)
			.css({
				display		: 'block',
				top			: e.pageY + 'px',
				left		: e.pageX + 'px',
				position	: 'absolute',
				opacity		: options.opacity,
				zIndex		: $.moveToTop() + 1
			});
		currentObj = $('#context-menu').prop('obj');
		coloringObj = $('#context-menu').prop('coloringObj');
		
		return false;
	});
};
})(jQuery);

(function($) {
	$.fn.setToViewport = function( options ) {  
		var defaults = {
			widthOffset		: 0,
			heightOffset	: 0
		};
		var options = $.extend(defaults, options);
		return this.each(function() {
			var viewportwidth;
			var viewportheight;
			if ( typeof window.innerWidth != 'undefined' ) {
				viewportwidth = window.innerWidth,
				viewportheight = window.innerHeight
			} else if ( typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0 ) {
				viewportwidth = document.documentElement.clientWidth,
				viewportheight = document.documentElement.clientHeight
			} else {
				viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
				viewportheight = document.getElementsByTagName('body')[0].clientHeight
			}
			viewportheight = viewportheight - 10;
			viewportwidth = viewportwidth - 10;
			$( this ).css({
				height	: (viewportheight + (options.heightOffset)) + 'px',
				width	: (viewportwidth + (options.widthOffset)) + 'px'
			});
		});
	};
})(jQuery);