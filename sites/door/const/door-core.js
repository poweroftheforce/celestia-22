function gE(objId) {if(document.getElementById(objId)) {return document.getElementById(objId);}
return null;}
document.CanonicalURL=function() {var links=document.getElementsByTagName('link');for (var x=0; links[x]; x++) {var rel='';var href='';if(links[x].rel) {rel=links[x].rel;}
else if(links[x].getAttribute) {rel=links[x].getAttribute('rel');}
if(typeof (rel)=='string' && rel.toLowerCase().indexOf('canonical')>-1) {if(links[x].href) {href=links[x].href;}
else if(links[x].getAttribute) {href=links[x].getAttribute('href');}
if(href!='') {return href;}}}
return window.location.href;}
function OutputToConsole(strMessage) {if(window.console && window.console.log && strMessage.length!='undefined' && strMessage.length>0) {console.log(strMessage);}};var PERSONCOOKIE="FrontDoorUserPers";var PERSONCOOKIE_USERID="uid";var PERSONCOOKIE_USERTYPE="usrtp";var PERSONCOOKIE_NAME="fln";var PERSONCOOKIE_EMAIL="email";var PERSONCOOKIE_ZIP="zip";var PERSONCOOKIE_SEARCHCOUNT="scnt";var PERSONCOOKIE_LISTINGS="lid";var PERSONCOOKIE_ALERTS="alerts";var PERSONCOOKIE_LATESTLISTINGS="llid";var PERSONCOOKIE_LATESTSEARCHES="lsrs";var PERSONCOOKIE_LATESTVIDEOS="lvid";var PERSONCOOKIE_LATESTARTICLES="laid";var PERSONCOOKIE2="FrontDoorUserPers2";var PERSONCOOKIE_ARTICLES="aid";var PERSONCOOKIE_VIDEOS="vid";function stringFormat(){var a=arguments;if(a.length==0)
return null;var i=a[0];for(var b=1, cnt=a.length; b<cnt; b++)
i=i.replace(RegExp("\\{"+(b - 1)+"\\}", "gi"), a[b]);return i;}
function articleExists(articleID){var exists=false;arrArticles=readArticlesPersCookie();if(null!=arrArticles){if(inArray(articleID, arrArticles)!=-1){exists=true;}}
return exists;}
function videoExists(videoID){var exists=false;arrVideos=readVideosPersCookie();if(null!=arrArticles){if(inArray(videoID, arrVideos)!=-1){exists=true;}}
return exists;}
function listingExists(listingID){var exists=false;arrListings=readListingsPersCookie();if(null!=arrListings){if(inArray(listingID, arrListings)!=-1){exists=true;}}
return exists;}
function latestlistingExists(listing){var exists=false;arrLatListings=readLatestListingsPersCookie();if(null!=arrLatListings){if(inArray(listing, arrLatListings)!=-1){exists=true;}}
return exists;}
function readSearchCountPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_SEARCHCOUNT);if(arrResult){if(arrResult[0]!=""){return arrResult[0];}
else{return 0;}}
else{return 0;}}
function DisplayName(){if(readUserPersCookie(PERSONCOOKIE_NAME)==""){return readUserPersCookie(PERSONCOOKIE_EMAIL);}
else{return UrlDecode(readUserPersCookie(PERSONCOOKIE_NAME));}}
function readListingCountPersCookie(){if(readListingsPersCookie()!=undefined){if(readListingsPersCookie()[0]!=""){return readListingsPersCookie().length;}
else{return 0;}}
else{return 0;}}
function readArticleCountPersCookie (){if(readArticlesPersCookie()!=undefined){if(readArticlesPersCookie()[0]!=""){return readArticlesPersCookie().length;}
else{return 0;}}
else{return 0;}}
function readVideoCountPersCookie (){if(readVideosPersCookie()!=undefined){if(readVideosPersCookie()[0]!=""){return readVideosPersCookie().length;}
else{return 0;}}
else{return 0;}}
function readArticlesPersCookie(){var arrArticles=readPersonCookie(PERSONCOOKIE_ARTICLES);if(arrArticles){return arrArticles;}
else{return undefined;}}
function readVideosPersCookie(){var arrVideos=readPersonCookie(PERSONCOOKIE_VIDEOS);if(arrVideos){return arrVideos;}
else{return undefined;}}
function readListingsPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_LISTINGS);if(arrResult){return arrResult;}else{return undefined;}}
function readAlertsPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_ALERTS);if(arrResult){return arrResult;}else{return undefined;}}
function readLatestListingsPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_LATESTLISTINGS);if(arrResult){return arrResult;}else{return undefined;}}
function readLatestArticlesPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_LATESTARTICLES);if(arrResult){return arrResult;}else{return undefined;}}
function readLatestVideosPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_LATESTVIDEOS);if(arrResult){return arrResult;}else{return undefined;}}
function readLatestSearchesPersCookie(){var arrResult=readPersonCookie(PERSONCOOKIE_LATESTSEARCHES);if(arrResult){return arrResult;}else{return undefined;}}
function readUserPersCookie (key){var arrResult=readPersonCookie(key);if(arrResult){return arrResult[0];}else{return "";}}
function readPersonCookie(key){var myCookie;if((key==PERSONCOOKIE_ARTICLES)||(key==PERSONCOOKIE_VIDEOS)||(key==PERSONCOOKIE_LATESTARTICLES)||(key==PERSONCOOKIE_LATESTVIDEOS)){myCookie=readCookie(PERSONCOOKIE2);}
else{myCookie=readCookie(PERSONCOOKIE);}
if(myCookie){var value="";arrPersCookie=myCookie.split('&');for (var i=0; i<arrPersCookie.length; i++){var keyvalue=arrPersCookie[i].split('=');if(key==keyvalue[0]){value=keyvalue[1];var arrValues=value.split('|');return arrValues;}}}
else{return null;}}
function setHomeStyleCookie(objHomestyle, homeStyleIdKeyName, itemIdKeyName){document.cookie=stringFormat("TempC=uact=13&{0}={1}&{2}={3};path=/;",homeStyleIdKeyName, objHomestyle.idstyle, itemIdKeyName, objHomestyle.idlisting);}
function readTempCookie(key){var myCookie;myCookie=readCookie("TempC");if(myCookie){var value="";arrTempCookie=myCookie.split('&');for (var i=0; i<arrTempCookie.length; i++){var keyvalue=arrTempCookie[i].split('=');if(key==keyvalue[0]){value=keyvalue[1];var arrValues=value.split('|');return arrValues;}}}
else{return null;}}
function readCookie(name) {var nameEQ=name+"=";var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++) {var c=UrlDecode(ca[i]);while (c.charAt(0)==' ') c=c.substring(1,c.length);if(c.indexOf(nameEQ)==0) return c.substring(nameEQ.length,c.length);}
return null;}
function inArray(element, arr) {if(arr!=undefined){for (var i=0, arrl=arr.length; i<arrl; i++){if(arr[i].toUpperCase()==element.toUpperCase()){return i;}}}
return -1;}
function getBookmarkCookieValue() {var cookieVal="";var cookieExists=false;if(document.cookie.length>0){var c_start=document.cookie.indexOf("BMSuccessSuppressCookie=");if(c_start!=-1) {cookieExists=true;var c_end=document.cookie.indexOf(";", c_start);if(c_end==-1) {c_end=document.cookie.length;}
cookieVal=document.cookie.substring(c_start+"BMSuccessSuppressCookie=".length, c_end);}}
return cookieVal;}
function setBookmarkCookieValue(cookieVal) {var exdate=new Date();exdate.setDate(exdate.getDate()+365);document.cookie="BMSuccessSuppressCookie="+Number(cookieVal)+"; expires="+exdate.toGMTString()+"; path=/";}
function setRecommendationRequestDeleteCookie(cookieVal) {var exdate=new Date();exdate.setDate(exdate.getDate()+365);document.cookie="RecommendationRequestDeleteCookie="+cookieVal+"; expires="+exdate.toGMTString()+"; path=/";}
function setRecommendationResponseDeleteCookie(cookieVal) {var exdate=new Date();exdate.setDate(exdate.getDate()+365);document.cookie="RecommendationResponseDeleteCookie="+cookieVal+"; expires="+exdate.toGMTString()+"; path=/";}
function setSearchInteractionCookie(cookieVal) {var exdate=new Date();exdate.setDate(exdate.getDate()+1);document.cookie="SearchInteraction="+encodeURIComponent(cookieVal)+"; expires="+exdate.toGMTString()+"; path=/";}
function setDoNotShowRemoveAlert(cookieVal) {var exdate=new Date();exdate.setDate(exdate.getDate()+1);document.cookie="DoNotShowRemoveAlertModal="+encodeURIComponent(cookieVal)+"; expires="+exdate.toGMTString()+"; path=/";}
function UrlDecode(str) {return decodeURIComponent(str.replace(/\+/g,  " "));}
function UrlEncode(str) {return encodeURIComponent(str);}
function readCookieByKey(name, key) {var myCookie;myCookie=readCookie(name);if(myCookie) {var value="";arrTempCookie=myCookie.split('&');for (var i=0; i<arrTempCookie.length; i++) {var keyvalue=arrTempCookie[i].split('=');if(key==keyvalue[0]) {value=keyvalue[1];var arrValues=value.split('|');return arrValues;}}}else{return null;}};$.fn.listHandlers=function(events, outputFunction) {return this.each(function(i) {var elem=this,dEvents=$(this).data('events');if(!dEvents) { return; }
$.each(dEvents, function(name, handler) {if((new RegExp('^('+(events==='*' ? '.+' : events.replace(',', '|').replace(/^on/i, ''))+')$', 'i')).test(name)) {$.each(handler, function(i, handler) {outputFunction(elem, '\n'+i+': ['+name+'] : '+handler);});}});});};var Static=staticImgHostname;function LoadListingImage(img_ref, img_width, img_height, img_src, isCarouselImg, ix, isError, imageServer) {var timeout=0;window.setTimeout(function() {$(img_ref).removeAttr('onload');$(img_ref).removeAttr('onerror');var local_proxy_src=GetLocalProxySrc(img_src, imageServer);var ReloadFailImg=new GetReloadFailImages(img_width, img_height);var img=new Image();CopyAttributes(img_ref, img);$(img).load(function() {$(this).unbind('load');$(this).unbind('error');HandleSpan(img_ref, this, isCarouselImg, ix);if($.browser.msie) {AdjustImageSize(img_ref, this);}}).error(function() {$(this).unbind('error');$(this).unbind('load');$(img_ref).attr('src', ReloadFailImg.ReloadingImg);if(isError) {$(this).attr('src', ReloadFailImg.FailureImg);HandleSpan(img_ref, this, isCarouselImg, ix);if($.browser.msie) {AdjustImageSize(img_ref, this);}}else{LoadListingImage(img_ref, img_width, img_height, local_proxy_src, isCarouselImg, ix, true, imageServer);}})
$(img_ref).prev('span').html('').append(img);window.setTimeout(function() {$(img).attr('src', img_src);}, 100);}, timeout);}
function GetLocalProxySrc(img_src, imageServer) {var LocalProxyPath="/LocalImageReader.aspx";var ProxyPath="";if(imageServer)
ProxyPath="http://"+imageServer;else
ProxyPath="http://img-cdn.frontdoor.com";return img_src.replace(ProxyPath, LocalProxyPath);}
function GetReloadFailImages(width, height) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-90x60.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_90x60.gif";if(width==90 && height==60) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-90x60.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_90x60.gif";}
if(width==120 && height==90) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-120x90.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_120x90.gif";}
if(width==160 && height==110) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-160x110.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_160x110.gif";}
if(width==300 && height==225) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-300x225.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_160x110.gif";}
if(width==400 && height==300) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-400x300.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_160x110.gif";}
if(width==616 && height==462) {this.ReloadingImg=Static+"/images/v."+resourceVersion+"/ajax-loader-616x462.gif";this.FailureImg=Static+"/images/v."+resourceVersion+"/no_photo_160x110.gif";}}
function CopyAttributes(img_ref, new_img){if(img_ref.attributes) {$(img_ref.attributes).each(function(ix) {if(this.name!='onerror' && this.name!='onload' && this.name!='src' && this.valueOf!=null) {try {new_img.setAttribute(this.name, this.value);}
catch (err) { }}});}}
function AdjustImageSize(img_ref, new_img) {var size_definition=$(img_ref).attr('sizedefinition');$(new_img).removeAttr('width').removeAttr('height');if(size_definition==1) {$(new_img).attr('width', $(img_ref).attr('width'));} else if(size_definition==2) {$(new_img).attr('height', $(img_ref).attr('height'));}
else{$(new_img).attr('width', $(img_ref).attr('width'));$(new_img).attr('height', $(img_ref).attr('height'));}}
function HandleSpan(img_ref, new_img, isCarouselImg, ix){$(img_ref).hide();$(img_ref).attr('id', $(img_ref).attr('id')+'_disabled');var $spnImgContainer=$(img_ref).prev('span');$spnImgContainer.show();$(new_img).show();if(isCarouselImg) {new_img.index=ix;$(new_img).click(function(e) {frontdoorPageInstance.goTo(e);});}};(function(window){var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return!a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();var cloneObject=function(obj){var newObj=(obj instanceof Array)?[]:{};for(var i in obj){if(obj[i]&&typeof obj[i]=="object"){newObj[i]=cloneObject(obj[i]);}else newObj[i]=obj[i]}return newObj;};mergeObjects=function(trg,src){var lastArg=arguments[arguments.length-1];var deep=arguments.length>2&&typeof(lastArg)=='boolean'?lastArg:false;var result=cloneObject(trg);if(!src||typeof(src)!='object')return result;for(prop in src){if(typeof(trg[prop])=='undefined'||trg[prop].constructor==Array||typeof(trg[prop])!='object'||!deep){result[prop]=src[prop];continue;}
result[prop]=mergeObjects(trg[prop],src[prop],deep);}
return result;}
var SNI=SNI||{}
SNI.Player={};SNI.Player.Settings={snap_swf_url:"http://common.scrippsnetworks.com/common/snap/snap-3.2.10.swf",flash_express_install_url:"http://common.scrippsnetworks.com/common/flash-express-install/expressInstall.swf",flash_minimum_version:"9"};SNI.Player.UserInterfaceConfigs={FullSize:{enableSyncAdFix:1,dimensions:{width:'576',height:'636'},flashvars:{config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent",bgcolor:"#ffffff"}},FullSizeNoPlaylist:{enableSyncAdFix:1,dimensions:{width:'576',height:'460'},flashvars:{showCarousel:"false",config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style.xml,http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-config-std.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}},RightRail:{enableSyncAdFix:0,dimensions:{width:'320',height:'360'},flashvars:{config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style-rr.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-rightrail.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}},RightRailNoPlaylist:{enableSyncAdFix:0,dimensions:{width:'320',height:'263'},flashvars:{showCarousel:"false",config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style-rr.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-rightrail.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}},Blog:{enableSyncAdFix:1,dimensions:{width:'320',height:'263'},flashvars:{showCarousel:"false",config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style.xml,http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-config-std.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}},BlogNoPlaylist:{enableSyncAdFix:1,dimensions:{width:'320',height:'263'},flashvars:{showCarousel:"false",config:"http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-style.xml,http://frontend.scrippsnetworks.com/~jhung/snap2/configs/snap-config-std.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}},Interactive:{enableSyncAdFix:1,dimensions:{width:'630',height:'650'},flashvars:{showAds:"false",enableInteractiveMenu:"true",interactiveDataURL:"http://snap.scrippsnetworks.com/snap/intplayer/v2/xmls/",config:"http://common.scrippsnetworks.com/common/snap/config/snap-style.xml,http://common.scrippsnetworks.com/common/snap/config/snap-config-interactive.xml"},params:{menu:"false",scale:"noscale",allowFullScreen:"true",allowScriptAccess:"always",wmode:"transparent"}}};SNI.Player.getPlayerContainerDivId=function()
{return this.container_div_id;};SNI.Player.getPlayerInstanceId=function()
{return this.instance_id;};SNI.Player.loadPlaylist=function(channelId,playlistTitle,videoId)
{if(channelId=="undefined"){channelId='';}
if(playlistTitle=="undefined"){playlistTitle='';}
if(videoId=="undefined"){videoId='';}
var playlistUrl=this.getPlaylistUrl(channelId);var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{fl.setPlaylist(channelId,playlistUrl,escape(playlistTitle),videoId);}};SNI.Player.SNAP=function(config)
{if(typeof(config)=="undefined")
{alert("Error loading video player");return null;}
if(typeof(config.container_div_id)=="undefined")
{alert("Error loading video player");return null;}else{this.container_div_id=config.container_div_id;this.instance_id=config.container_div_id+'-instance';}
if(typeof(config.ui_config)=="undefined")
{alert("Error loading video player configuration");return null;}else{this.ui_config=config.ui_config;}
if(typeof(config.fcn_build_playlist_url)=="undefined"||config.fcn_build_playlist_url=='')
{this.getPlaylistUrl=SNI.Player.getPlaylistUrl;}else{this.getPlaylistUrl=config.fcn_build_playlist_url;}
if(typeof(config.channel_id)=="undefined")
{alert("No playlist specified.");return null;}
this.channel_id=config.channel_id;this.channel_url=this.getPlaylistUrl(this.channel_id);this.video_id=SNI.Player.getUrlParam('videoId');if(this.video_id=="")
{this.video_id==config.video_id||this.video_id;}
this.play=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.playerPlay){alert('play() not yet implemented');return;}
fl.playerPlay();}
return this;}
this.pause=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.playerPause){alert('pause() not yet implemented');return;}
fl.playerPause();}
return this;}
this.seek=function(mins,secs)
{if(mins=="undefined"){mins=0;}
if(secs=="undefined"){secs=0;}
var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.playerSeek){alert('seek() not yet implemented');return;}
fl.playerSeek((mins*60)+secs);}
return this;}
this.nextVideo=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.nextVideo){alert('nextVideo() not yet implemented');return;}
fl.nextVideo();}
return this;}
this.prevVideo=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.prevVideo){alert('prevVideo() not yet implemented');return;}
fl.prevVideo();}
return this;}
this.mute=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.mute){alert('mute() not yet implemented');return;}
fl.mute();}
return this;}
this.unmute=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.unmute){alert('unmute() not yet implemented');return;}
fl.unmute();}
return this;}
this.setPlaylistChannel=function(chId,url){if(chId=="undefined"){chId='';}
if(url=="undefined"){url='';}
var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{fl.setPlaylistChannel(chId,url);}}
this.setPlaylistTitle=function(ttl){if(ttl=="undefined"){ttl='';}
var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{fl.setPlaylistTitle(ttl);}}
this.setPlaylistVideo=function(videoId){if(videoId=="undefined"){videoId='';}
var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{fl.setPlaylistVideo(videoId);}}
this.fullScreen=function()
{var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.fullScreen){alert('fullScreen() not yet implemented');return;}
fl.fullScreen();}}
this.showMenu=function(tab)
{if(tab=="undefined"){tab='';}
var fl=document.getElementById(this.instance_id);if(fl!="undefined")
{if(!fl.showMenu){alert('showMenu() not yet implemented');return;}
fl.showMenu(tab);}}
if(typeof(mdManager)!="undefined")
{mdManager.addParameter("VideoPlayer","SNAP");}
var attributes={id:this.instance_id,name:this.instance_id+' Player'};var flashvars=this.ui_config.flashvars;flashvars.channel=this.channel_id,flashvars.channelurl=this.channel_url,flashvars.videoId=this.video_id,flashvars.snapDivId=this.container_div_id
if(typeof(config.playlist_title)!="undefined")
{flashvars.playlistTitle=escape(config.playlist_title);}
if(this.ui_config.enableSyncAdFix!="undefined"&&this.ui_config.enableSyncAdFix)
{flashvars.systemEventHandler="SNI.Player.callbackSystem";}
if(typeof(config.fcn_callback_user)!="undefined")
{flashvars.userEventHandler=config.fcn_callback_user;}
swfobject.embedSWF(SNI.Player.Settings.snap_swf_url,this.container_div_id,this.ui_config.dimensions.width,this.ui_config.dimensions.height,SNI.Player.Settings.flash_minimum_version,SNI.Player.Settings.flash_express_install_url,flashvars,this.ui_config.params,attributes);};SNI.Player.getPlaylistUrl=function(channelId)
{return'http://frontdoor-snap.gabriels.net/'+chId+'.xml';};SNI.Player.buildDefaultChannelFeedUrl=SNI.Player.getPlaylistUrl
SNI.Player.getUrlParam=function(paramName)
{paramName=paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS="[\\?&]"+paramName+"=([^&#]*)";var regex=new RegExp(regexS);var results=regex.exec(window.location.href);if(results==null){return"";}else{return results[1];}};SNI.Player.getJSON=function(json)
{return eval('('+json+')');};SNI.Player.callbackSystem=function(eventType,eventInfo)
{var eventJson=SNI.Player.getJSON(eventInfo);if(eventType=='playerReady')
{var isAutoPlay=eventJson.isAutoPlay;var hasPreroll=eventJson.hasPreroll;if(isAutoPlay=='false'||hasPreroll=='false')
{if(typeof(setDefaultBigboxAd)=="function")
{setDefaultBigboxAd();}}}}
SNI.Player.FullSize=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.Player.SNAP({"container_div_id":divId,"ui_config":mergeObjects(SNI.Player.UserInterfaceConfigs.FullSize,ui_config,true),"channel_id":channelId,"video_id":videoId,"fcn_callback_user":callback});};SNI.Player.FullSizeNoPlaylist=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.Player.SNAP({"container_div_id":divId,"ui_config":mergeObjects(SNI.Player.UserInterfaceConfigs.FullSizeNoPlaylist,ui_config,true),"channel_id":channelId,"video_id":videoId,"fcn_callback_user":callback});};SNI.Player.RightRail=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.Player.SNAP({"container_div_id":divId,"ui_config":mergeObjects(SNI.Player.UserInterfaceConfigs.RightRail,ui_config,true),"channel_id":channelId,"video_id":videoId,"fcn_callback_user":callback});};SNI.Player.RightRailNoPlaylist=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.Player.SNAP({"container_div_id":divId,"ui_config":mergeObjects(SNI.Player.UserInterfaceConfigs.RightRailNoPlaylist,ui_config,true),"channel_id":channelId,"video_id":videoId,"fcn_callback_user":callback});};return window.SNI=mergeObjects(mergeObjects({},window.SNI),SNI);})(window);(function(window){var SNI=window.SNI||{};var cloneObject=function(obj){var newObj=(obj instanceof Array)?[]:{};for(var i in obj){if(obj[i]&&typeof obj[i]=="object"){newObj[i]=cloneObject(obj[i]);}else newObj[i]=obj[i]}return newObj;};mergeObjects=function(trg,src){var lastArg=arguments[arguments.length-1];var deep=arguments.length>2&&typeof(lastArg)=='boolean'?lastArg:false;var result=cloneObject(trg);if(!src||typeof(src)!='object')return result;for(prop in src){if(typeof(trg[prop])=='undefined'||trg[prop].constructor==Array||typeof(trg[prop])!='object'||!deep){result[prop]=src[prop];continue;}
result[prop]=mergeObjects(trg[prop],src[prop],deep);}
return result;}
if(typeof(SNI.FDOOR)=='undefined'){SNI.FDOOR={};}
if(typeof(SNI.FDOOR.Player)=='undefined'){SNI.FDOOR.Player={};}
SNI.FDOOR.Player.Configs={FullSize:{dimensions:{width:'576',height:'648'},flashvars:{autoPlay:false,playerSize:"FullScreen",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"}},FullSizeNoPlaylist:{dimensions:{width:'576',height:'455'},flashvars:{playerSize:"FullScreen",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"}},FullSizeWide:{dimensions:{width:'576',height:'541'},flashvars:{autoPlay:false,playerSize:"FullScreenWide",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"}},FullSizeWideNoPlaylist:{dimensions:{width:'576',height:'347'},flashvars:{autoPlay:false,playerSize:"FullScreenWide",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"}},RightRail:{dimensions:{width:'320',height:'358'},flashvars:{playerSize:"RightRail",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style-rr.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-rightrail.xml"}},RightRailNoPlaylist:{flashvars:{showCarousel:"false",playerSize:"RightRail",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style-rr.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-rightrail.xml"}},HomepageLead:{dimensions:{width:'300',height:'169'},flashvars:{showCarousel:false,autoPlay:false,showMenu:false,enableNowPlayingOverlay:false,enableRelatedMenu:false,enableRelatedInfoIcon:false,enableEmail:false,enableShare:false,enableHomePageMode:true,playerSize:"Homepage",config:"http://images.frontdoor.com/FDOOR/snap/configs/snap-style.xml,http://images.frontdoor.com/FDOOR/staging/snap/configs/snap-player-fullsize.xml"}}};SNI.Player.UserInterfaceConfigs=mergeObjects(SNI.Player.UserInterfaceConfigs,SNI.FDOOR.Player.Configs,true);SNI.Player.getPlaylistUrl=function(chId){return'http://frontdoor-snap.gabriels.net/'+chId+'.xml';};SNI.FDOOR.Player.FullSize=SNI.Player.FullSize;SNI.FDOOR.Player.VideoLibrary=SNI.FDOOR.Player.FullSize;SNI.FDOOR.Player.FullSizeNoPlaylist=SNI.Player.FullSizeNoPlaylist;SNI.FDOOR.Player.VideoAsset=SNI.FDOOR.Player.FullSizeNoPlaylist;SNI.FDOOR.Player.RightRail=SNI.Player.RightRail;SNI.FDOOR.Player.RightRailNoPlaylist=SNI.Player.RightRailNoPlaylist
SNI.FDOOR.Player.FullSizeWide=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.FDOOR.Player.FullSize(divId,channelId,videoId,callback,mergeObjects(SNI.FDOOR.Player.Configs.FullSizeWide,ui_config))};SNI.FDOOR.Player.FullSizeWideNoPlaylist=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.FDOOR.Player.FullSizeNoPlaylist(divId,channelId,videoId,callback,mergeObjects(SNI.FDOOR.Player.Configs.FullSizeWideNoPlaylist,ui_config,true))};SNI.FDOOR.Player.HomepageLead=function(divId,channelId,videoId,callback,ui_config)
{return new SNI.FDOOR.Player.FullSizeNoPlaylist(divId,channelId,videoId,callback,mergeObjects(SNI.FDOOR.Player.Configs.HomepageLead,ui_config))};SNI.FDOOR.Player.Gallery=function(divId,channelId,videoId,callback,ui_config)
{if(typeof(snap)!="undefined"){snap.loadPlaylist(channelId,videoId);return snap;}
return new SNI.FDOOR.Player.FullSizeNoPlaylist(divId,channelId,videoId,callback,mergeObjects(SNI.FDOOR.Player.Configs.FullSizeWideNoPlaylist,mergeObjects({"dimensions":{"width":575,"height":455}},ui_config,true),true))};return window.SNI=mergeObjects(mergeObjects({},window.SNI,true),SNI,true);})(window);;


C.coreReady();