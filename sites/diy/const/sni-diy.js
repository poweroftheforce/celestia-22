/* sni-diy - Tue, 23 Mar 2010 18:43:39 -0400 */

/*! SWFObject v2.2 <http://code.google.com/p/swfobject/>
 Copyright (c) 2007-2008 Geoff Stearns, Michael Williams, and Bobby van der Sluis
 This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

var swfobject = function () {
    var UNDEF = "undefined",
        OBJECT = "object",
        SHOCKWAVE_FLASH = "Shockwave Flash",
        SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
        FLASH_MIME_TYPE = "application/x-shockwave-flash",
        EXPRESS_INSTALL_ID = "SWFObjectExprInst",
        ON_READY_STATE_CHANGE = "onreadystatechange",
        win = window,
        doc = document,
        nav = navigator,
        plugin = false,
        domLoadFnArr = [main],
        regObjArr = [],
        objIdArr = [],
        listenersArr = [],
        storedAltContent, storedAltContentId, storedCallbackFn, storedCallbackObj, isDomLoaded = false,
        isExpressInstallActive = false,
        dynamicStylesheet, dynamicStylesheetMedia, autoHideShow = true,
        ua = function () {
            var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
                u = nav.userAgent.toLowerCase(),
                p = nav.platform.toLowerCase(),
                windows = p ? /win/.test(p) : /win/.test(u),
                mac = p ? /mac/.test(p) : /mac/.test(u),
                webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                ie = !+"\v1",
                playerVersion = [0, 0, 0],
                d = null;
            if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
                    d = nav.plugins[SHOCKWAVE_FLASH].description;
                    if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                        plugin = true;
                        ie = false;
                        d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                        playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                        playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                        playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
                    }
                }
            else if (typeof win.ActiveXObject != UNDEF) {
                    try {
                        var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                        if (a) {
                            d = a.GetVariable("$version");
                            if (d) {
                                ie = true;
                                d = d.split(" ")[1].split(",");
                                playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                            }
                        }
                    }
                    catch (e) {}
                }
            return {
                    w3: w3cdom,
                    pv: playerVersion,
                    wk: webkit,
                    ie: ie,
                    win: windows,
                    mac: mac
                };
        }(),
        onDomLoad = function () {
            if (!ua.w3) {
                return;
            }
            if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) {
                callDomLoadFunctions();
            }
            if (!isDomLoaded) {
                if (typeof doc.addEventListener != UNDEF) {
                    doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
                }
                if (ua.ie && ua.win) {
                    doc.attachEvent(ON_READY_STATE_CHANGE, function () {
                        if (doc.readyState == "complete") {
                            doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
                            callDomLoadFunctions();
                        }
                    });
                    if (win == top) {
                        (function () {
                            if (isDomLoaded) {
                                return;
                            }
                            try {
                                doc.documentElement.doScroll("left");
                            }
                            catch (e) {
                                setTimeout(arguments.callee, 0);
                                return;
                            }
                            callDomLoadFunctions();
                        })();
                    }
                }
                if (ua.wk) {
                    (function () {
                        if (isDomLoaded) {
                            return;
                        }
                        if (!/loaded|complete/.test(doc.readyState)) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        callDomLoadFunctions();
                    })();
                }
                addLoadEvent(callDomLoadFunctions);
            }
        }();

    function callDomLoadFunctions() {
            if (isDomLoaded) {
                return;
            }
            try {
                var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
                t.parentNode.removeChild(t);
            }
            catch (e) {
                return;
            }
            isDomLoaded = true;
            var dl = domLoadFnArr.length;
            for (var i = 0; i < dl; i++) {
                domLoadFnArr[i]();
            }
        }

    function addDomLoadEvent(fn) {
            if (isDomLoaded) {
                fn();
            }
            else {
                domLoadFnArr[domLoadFnArr.length] = fn;
            }
        }

    function addLoadEvent(fn) {
            if (typeof win.addEventListener != UNDEF) {
                win.addEventListener("load", fn, false);
            }
            else if (typeof doc.addEventListener != UNDEF) {
                doc.addEventListener("load", fn, false);
            }
            else if (typeof win.attachEvent != UNDEF) {
                addListener(win, "onload", fn);
            }
            else if (typeof win.onload == "function") {
                var fnOld = win.onload;
                win.onload = function () {
                    fnOld();
                    fn();
                };
            }
            else {
                win.onload = fn;
            }
        }

    function main() {
            if (plugin) {
                testPlayerVersion();
            }
            else {
                matchVersions();
            }
        }

    function testPlayerVersion() {
            var b = doc.getElementsByTagName("body")[0];
            var o = createElement(OBJECT);
            o.setAttribute("type", FLASH_MIME_TYPE);
            var t = b.appendChild(o);
            if (t) {
                var counter = 0;
                (function () {
                    if (typeof t.GetVariable != UNDEF) {
                        var d = t.GetVariable("$version");
                        if (d) {
                            d = d.split(" ")[1].split(",");
                            ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                        }
                    }
                    else if (counter < 10) {
                        counter++;
                        setTimeout(arguments.callee, 10);
                        return;
                    }
                    b.removeChild(o);
                    t = null;
                    matchVersions();
                })();
            }
            else {
                matchVersions();
            }
        }

    function matchVersions() {
            var rl = regObjArr.length;
            if (rl > 0) {
                for (var i = 0; i < rl; i++) {
                    var id = regObjArr[i].id;
                    var cb = regObjArr[i].callbackFn;
                    var cbObj = {
                        success: false,
                        id: id
                    };
                    if (ua.pv[0] > 0) {
                        var obj = getElementById(id);
                        if (obj) {
                            if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) {
                                setVisibility(id, true);
                                if (cb) {
                                    cbObj.success = true;
                                    cbObj.ref = getObjectById(id);
                                    cb(cbObj);
                                }
                            }
                            else if (regObjArr[i].expressInstall && canExpressInstall()) {
                                var att = {};
                                att.data = regObjArr[i].expressInstall;
                                att.width = obj.getAttribute("width") || "0";
                                att.height = obj.getAttribute("height") || "0";
                                if (obj.getAttribute("class")) {
                                    att.styleclass = obj.getAttribute("class");
                                }
                                if (obj.getAttribute("align")) {
                                    att.align = obj.getAttribute("align");
                                }
                                var par = {};
                                var p = obj.getElementsByTagName("param");
                                var pl = p.length;
                                for (var j = 0; j < pl; j++) {
                                    if (p[j].getAttribute("name").toLowerCase() != "movie") {
                                        par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                                    }
                                }
                                showExpressInstall(att, par, id, cb);
                            }
                            else {
                                displayAltContent(obj);
                                if (cb) {
                                    cb(cbObj);
                                }
                            }
                        }
                    }
                    else {
                        setVisibility(id, true);
                        if (cb) {
                            var o = getObjectById(id);
                            if (o && typeof o.SetVariable != UNDEF) {
                                cbObj.success = true;
                                cbObj.ref = o;
                            }
                            cb(cbObj);
                        }
                    }
                }
            }
        }

    function getObjectById(objectIdStr) {
            var r = null;
            var o = getElementById(objectIdStr);
            if (o && o.nodeName == "OBJECT") {
                if (typeof o.SetVariable != UNDEF) {
                    r = o;
                }
                else {
                    var n = o.getElementsByTagName(OBJECT)[0];
                    if (n) {
                        r = n;
                    }
                }
            }
            return r;
        }

    function canExpressInstall() {
            return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
        }

    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
            isExpressInstallActive = true;
            storedCallbackFn = callbackFn || null;
            storedCallbackObj = {
                success: false,
                id: replaceElemIdStr
            };
            var obj = getElementById(replaceElemIdStr);
            if (obj) {
                if (obj.nodeName == "OBJECT") {
                    storedAltContent = abstractAltContent(obj);
                    storedAltContentId = null;
                }
                else {
                    storedAltContent = obj;
                    storedAltContentId = replaceElemIdStr;
                }
                att.id = EXPRESS_INSTALL_ID;
                if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) {
                    att.width = "310";
                }
                if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) {
                    att.height = "137";
                }
                doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
                var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
                    fv = "MMredirectURL=" + win.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
                if (typeof par.flashvars != UNDEF) {
                        par.flashvars += "&" + fv;
                    }
                else {
                        par.flashvars = fv;
                    }
                if (ua.ie && ua.win && obj.readyState != 4) {
                        var newObj = createElement("div");
                        replaceElemIdStr += "SWFObjectNew";
                        newObj.setAttribute("id", replaceElemIdStr);
                        obj.parentNode.insertBefore(newObj, obj);
                        obj.style.display = "none";
                        (function () {
                            if (obj.readyState == 4) {
                                obj.parentNode.removeChild(obj);
                            }
                            else {
                                setTimeout(arguments.callee, 10);
                            }
                        })();
                    }
                createSWF(att, par, replaceElemIdStr);
            }
        }

    function displayAltContent(obj) {
            if (ua.ie && ua.win && obj.readyState != 4) {
                var el = createElement("div");
                obj.parentNode.insertBefore(el, obj);
                el.parentNode.replaceChild(abstractAltContent(obj), el);
                obj.style.display = "none";
                (function () {
                    if (obj.readyState == 4) {
                        obj.parentNode.removeChild(obj);
                    }
                    else {
                        setTimeout(arguments.callee, 10);
                    }
                })();
            }
            else {
                obj.parentNode.replaceChild(abstractAltContent(obj), obj);
            }
        }

    function abstractAltContent(obj) {
            var ac = createElement("div");
            if (ua.win && ua.ie) {
                ac.innerHTML = obj.innerHTML;
            }
            else {
                var nestedObj = obj.getElementsByTagName(OBJECT)[0];
                if (nestedObj) {
                    var c = nestedObj.childNodes;
                    if (c) {
                        var cl = c.length;
                        for (var i = 0; i < cl; i++) {
                            if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                                ac.appendChild(c[i].cloneNode(true));
                            }
                        }
                    }
                }
            }
            return ac;
        }

    function createSWF(attObj, parObj, id) {
            var r, el = getElementById(id);
            if (ua.wk && ua.wk < 312) {
                return r;
            }
            if (el) {
                if (typeof attObj.id == UNDEF) {
                    attObj.id = id;
                }
                if (ua.ie && ua.win) {
                    var att = "";
                    for (var i in attObj) {
                        if (attObj[i] != Object.prototype[i]) {
                            if (i.toLowerCase() == "data") {
                                parObj.movie = attObj[i];
                            }
                            else if (i.toLowerCase() == "styleclass") {
                                att += ' class="' + attObj[i] + '"';
                            }
                            else if (i.toLowerCase() != "classid") {
                                att += ' ' + i + '="' + attObj[i] + '"';
                            }
                        }
                    }
                    var par = "";
                    for (var j in parObj) {
                        if (parObj[j] != Object.prototype[j]) {
                            par += '<param name="' + j + '" value="' + parObj[j] + '" />';
                        }
                    }
                    el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
                    objIdArr[objIdArr.length] = attObj.id;
                    r = getElementById(attObj.id);
                }
                else {
                    var o = createElement(OBJECT);
                    o.setAttribute("type", FLASH_MIME_TYPE);
                    for (var m in attObj) {
                        if (attObj[m] != Object.prototype[m]) {
                            if (m.toLowerCase() == "styleclass") {
                                o.setAttribute("class", attObj[m]);
                            }
                            else if (m.toLowerCase() != "classid") {
                                o.setAttribute(m, attObj[m]);
                            }
                        }
                    }
                    for (var n in parObj) {
                        if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") {
                            createObjParam(o, n, parObj[n]);
                        }
                    }
                    el.parentNode.replaceChild(o, el);
                    r = o;
                }
            }
            return r;
        }

    function createObjParam(el, pName, pValue) {
            var p = createElement("param");
            p.setAttribute("name", pName);
            p.setAttribute("value", pValue);
            el.appendChild(p);
        }

    function removeSWF(id) {
            var obj = getElementById(id);
            if (obj && obj.nodeName == "OBJECT") {
                if (ua.ie && ua.win) {
                    obj.style.display = "none";
                    (function () {
                        if (obj.readyState == 4) {
                            removeObjectInIE(id);
                        }
                        else {
                            setTimeout(arguments.callee, 10);
                        }
                    })();
                }
                else {
                    obj.parentNode.removeChild(obj);
                }
            }
        }

    function removeObjectInIE(id) {
            var obj = getElementById(id);
            if (obj) {
                for (var i in obj) {
                    if (typeof obj[i] == "function") {
                        obj[i] = null;
                    }
                }
                obj.parentNode.removeChild(obj);
            }
        }

    function getElementById(id) {
            var el = null;
            try {
                el = doc.getElementById(id);
            }
            catch (e) {}
            return el;
        }

    function createElement(el) {
            return doc.createElement(el);
        }

    function addListener(target, eventType, fn) {
            target.attachEvent(eventType, fn);
            listenersArr[listenersArr.length] = [target, eventType, fn];
        }

    function hasPlayerVersion(rv) {
            var pv = ua.pv,
                v = rv.split(".");
            v[0] = parseInt(v[0], 10);
            v[1] = parseInt(v[1], 10) || 0;
            v[2] = parseInt(v[2], 10) || 0;
            return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
        }

    function createCSS(sel, decl, media, newStyle) {
            if (ua.ie && ua.mac) {
                return;
            }
            var h = doc.getElementsByTagName("head")[0];
            if (!h) {
                return;
            }
            var m = (media && typeof media == "string") ? media : "screen";
            if (newStyle) {
                dynamicStylesheet = null;
                dynamicStylesheetMedia = null;
            }
            if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
                var s = createElement("style");
                s.setAttribute("type", "text/css");
                s.setAttribute("media", m);
                dynamicStylesheet = h.appendChild(s);
                if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
                    dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
                }
                dynamicStylesheetMedia = m;
            }
            if (ua.ie && ua.win) {
                if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
                    dynamicStylesheet.addRule(sel, decl);
                }
            }
            else {
                if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
                    dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
                }
            }
        }

    function setVisibility(id, isVisible) {
            if (!autoHideShow) {
                return;
            }
            var v = isVisible ? "visible" : "hidden";
            if (isDomLoaded && getElementById(id)) {
                getElementById(id).style.visibility = v;
            }
            else {
                createCSS("#" + id, "visibility:" + v);
            }
        }

    function urlEncodeIfNecessary(s) {
            var regex = /[\\\"<>\.;]/;
            var hasBadChars = regex.exec(s) != null;
            return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
        }
    var cleanup = function () {
            if (ua.ie && ua.win) {
                window.attachEvent("onunload", function () {
                    var ll = listenersArr.length;
                    for (var i = 0; i < ll; i++) {
                        listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
                    }
                    var il = objIdArr.length;
                    for (var j = 0; j < il; j++) {
                        removeSWF(objIdArr[j]);
                    }
                    for (var k in ua) {
                        ua[k] = null;
                    }
                    ua = null;
                    for (var l in swfobject) {
                        swfobject[l] = null;
                    }
                    swfobject = null;
                });
            }
        }();
    return {
            registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
                if (ua.w3 && objectIdStr && swfVersionStr) {
                    var regObj = {};
                    regObj.id = objectIdStr;
                    regObj.swfVersion = swfVersionStr;
                    regObj.expressInstall = xiSwfUrlStr;
                    regObj.callbackFn = callbackFn;
                    regObjArr[regObjArr.length] = regObj;
                    setVisibility(objectIdStr, false);
                }
                else if (callbackFn) {
                    callbackFn({
                        success: false,
                        id: objectIdStr
                    });
                }
            },
            getObjectById: function (objectIdStr) {
                if (ua.w3) {
                    return getObjectById(objectIdStr);
                }
            },
            embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
                var callbackObj = {
                    success: false,
                    id: replaceElemIdStr
                };
                if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                    setVisibility(replaceElemIdStr, false);
                    addDomLoadEvent(function () {
                        widthStr += "";
                        heightStr += "";
                        var att = {};
                        if (attObj && typeof attObj === OBJECT) {
                            for (var i in attObj) {
                                att[i] = attObj[i];
                            }
                        }
                        att.data = swfUrlStr;
                        att.width = widthStr;
                        att.height = heightStr;
                        var par = {};
                        if (parObj && typeof parObj === OBJECT) {
                            for (var j in parObj) {
                                par[j] = parObj[j];
                            }
                        }
                        if (flashvarsObj && typeof flashvarsObj === OBJECT) {
                            for (var k in flashvarsObj) {
                                if (typeof par.flashvars != UNDEF) {
                                    par.flashvars += "&" + k + "=" + flashvarsObj[k];
                                }
                                else {
                                    par.flashvars = k + "=" + flashvarsObj[k];
                                }
                            }
                        }
                        if (hasPlayerVersion(swfVersionStr)) {
                            var obj = createSWF(att, par, replaceElemIdStr);
                            if (att.id == replaceElemIdStr) {
                                setVisibility(replaceElemIdStr, true);
                            }
                            callbackObj.success = true;
                            callbackObj.ref = obj;
                        }
                        else if (xiSwfUrlStr && canExpressInstall()) {
                            att.data = xiSwfUrlStr;
                            showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                            return;
                        }
                        else {
                            setVisibility(replaceElemIdStr, true);
                        }
                        if (callbackFn) {
                            callbackFn(callbackObj);
                        }
                    });
                }
                else if (callbackFn) {
                    callbackFn(callbackObj);
                }
            },
            switchOffAutoHideShow: function () {
                autoHideShow = false;
            },
            ua: ua,
            getFlashPlayerVersion: function () {
                return {
                    major: ua.pv[0],
                    minor: ua.pv[1],
                    release: ua.pv[2]
                };
            },
            hasFlashPlayerVersion: hasPlayerVersion,
            createSWF: function (attObj, parObj, replaceElemIdStr) {
                if (ua.w3) {
                    return createSWF(attObj, parObj, replaceElemIdStr);
                }
                else {
                    return undefined;
                }
            },
            showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
                if (ua.w3 && canExpressInstall()) {
                    showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                }
            },
            removeSWF: function (objElemIdStr) {
                if (ua.w3) {
                    removeSWF(objElemIdStr);
                }
            },
            createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
                if (ua.w3) {
                    createCSS(selStr, declStr, mediaStr, newStyleBoolean);
                }
            },
            addDomLoadEvent: addDomLoadEvent,
            addLoadEvent: addLoadEvent,
            getQueryParamValue: function (param) {
                var q = doc.location.search || doc.location.hash;
                if (q) {
                    if (/\?/.test(q)) {
                        q = q.split("?")[1];
                    }
                    if (param == null) {
                        return urlEncodeIfNecessary(q);
                    }
                    var pairs = q.split("&");
                    for (var i = 0; i < pairs.length; i++) {
                        if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
                            return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
                        }
                    }
                }
                return "";
            },
            expressInstallCallback: function () {
                if (isExpressInstallActive) {
                    var obj = getElementById(EXPRESS_INSTALL_ID);
                    if (obj && storedAltContent) {
                        obj.parentNode.replaceChild(storedAltContent, obj);
                        if (storedAltContentId) {
                            setVisibility(storedAltContentId, true);
                            if (ua.ie && ua.win) {
                                storedAltContent.style.display = "block";
                            }
                        }
                        if (storedCallbackFn) {
                            storedCallbackFn(storedCallbackObj);
                        }
                    }
                    isExpressInstallActive = false;
                }
            }
        };
}();
if (typeof deconcept == "undefined") {
    var deconcept = new Object();
}
if (typeof deconcept.util == "undefined") {
    deconcept.util = new Object();
}
if (typeof deconcept.SWFObjectUtil == "undefined") {
    deconcept.SWFObjectUtil = new Object();
}
deconcept.SWFObject = function (_1, id, w, h, _5, c, _7, _8, _9, _a) {
    if (!document.getElementById) {
        return;
    }
    this.DETECT_KEY = _a ? _a : "detectflash";
    this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
    this.params = new Object();
    this.variables = new Object();
    this.attributes = new Array();
    if (_1) {
        this.setAttribute("swf", _1);
    }
    if (id) {
        this.setAttribute("id", id);
    }
    if (w) {
        this.setAttribute("width", w);
    }
    if (h) {
        this.setAttribute("height", h);
    }
    if (_5) {
        this.setAttribute("version", new deconcept.PlayerVersion(_5.toString().split(".")));
    }
    this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
    if (!window.opera && document.all && this.installedVer.major > 7) {
        deconcept.SWFObject.doPrepUnload = true;
    }
    if (c) {
        this.addParam("bgcolor", c);
    }
    var q = _7 ? _7 : "high";
    this.addParam("quality", q);
    this.setAttribute("useExpressInstall", false);
    this.setAttribute("doExpressInstall", false);
    var _c = (_8) ? _8 : window.location;
    this.setAttribute("xiRedirectUrl", _c);
    this.setAttribute("redirectUrl", "");
    if (_9) {
        this.setAttribute("redirectUrl", _9);
    }
};
deconcept.SWFObject.prototype = {
    useExpressInstall: function (_d) {
        this.xiSWFPath = !_d ? "expressinstall.swf" : _d;
        this.setAttribute("useExpressInstall", true);
    },
    setAttribute: function (_e, _f) {
        this.attributes[_e] = _f;
    },
    getAttribute: function (_10) {
        return this.attributes[_10];
    },
    addParam: function (_11, _12) {
        this.params[_11] = _12;
    },
    getParams: function () {
        return this.params;
    },
    addVariable: function (_13, _14) {
        this.variables[_13] = _14;
    },
    getVariable: function (_15) {
        return this.variables[_15];
    },
    getVariables: function () {
        return this.variables;
    },
    getVariablePairs: function () {
        var _16 = new Array();
        var key;
        var _18 = this.getVariables();
        for (key in _18) {
            _16[_16.length] = key + "=" + _18[key];
        }
        return _16;
    },
    getSWFHTML: function () {
        var _19 = "";
        if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "PlugIn");
                this.setAttribute("swf", this.xiSWFPath);
            }
            _19 = "<embed type=\"application/x-shockwave-flash\" src=\"" + this.getAttribute("swf") + "\" width=\"" + this.getAttribute("width") + "\" height=\"" + this.getAttribute("height") + "\" style=\"" + this.getAttribute("style") + "\"";
            _19 += " id=\"" + this.getAttribute("id") + "\" name=\"" + this.getAttribute("id") + "\" ";
            var _1a = this.getParams();
            for (var key in _1a) {
                _19 += [key] + "=\"" + _1a[key] + "\" ";
            }
            var _1c = this.getVariablePairs().join("&");
            if (_1c.length > 0) {
                _19 += "flashvars=\"" + _1c + "\"";
            }
            _19 += "/>";
        } else {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "ActiveX");
                this.setAttribute("swf", this.xiSWFPath);
            }
            _19 = "<object id=\"" + this.getAttribute("id") + "\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\"" + this.getAttribute("width") + "\" height=\"" + this.getAttribute("height") + "\" style=\"" + this.getAttribute("style") + "\">";
            _19 += "<param name=\"movie\" value=\"" + this.getAttribute("swf") + "\" />";
            var _1d = this.getParams();
            for (var key in _1d) {
                _19 += "<param name=\"" + key + "\" value=\"" + _1d[key] + "\" />";
            }
            var _1f = this.getVariablePairs().join("&");
            if (_1f.length > 0) {
                _19 += "<param name=\"flashvars\" value=\"" + _1f + "\" />";
            }
            _19 += "</object>";
        }
        return _19;
    },
    write: function (_20) {
        if (this.getAttribute("useExpressInstall")) {
            var _21 = new deconcept.PlayerVersion([6, 0, 65]);
            if (this.installedVer.versionIsValid(_21) && !this.installedVer.versionIsValid(this.getAttribute("version"))) {
                this.setAttribute("doExpressInstall", true);
                this.addVariable("MMredirectURL", escape(this.getAttribute("xiRedirectUrl")));
                document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                this.addVariable("MMdoctitle", document.title);
            }
        }
        if (this.skipDetect || this.getAttribute("doExpressInstall") || this.installedVer.versionIsValid(this.getAttribute("version"))) {
            var n = (typeof _20 == "string") ? document.getElementById(_20) : _20;
            n.innerHTML = this.getSWFHTML();
            return true;
        } else {
            if (this.getAttribute("redirectUrl") != "") {
                document.location.replace(this.getAttribute("redirectUrl"));
            }
        }
        return false;
    }
};
deconcept.SWFObjectUtil.getPlayerVersion = function () {
    var _23 = new deconcept.PlayerVersion([0, 0, 0]);
    if (navigator.plugins && navigator.mimeTypes.length) {
        var x = navigator.plugins["Shockwave Flash"];
        if (x && x.description) {
            _23 = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
        }
    } else {
        if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) {
            var axo = 1;
            var _26 = 3;
            while (axo) {
                try {
                    _26++;
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + _26);
                    _23 = new deconcept.PlayerVersion([_26, 0, 0]);
                } catch (e) {
                    axo = null;
                }
            }
        } else {
            try {
                var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            } catch (e) {
                try {
                    var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                    _23 = new deconcept.PlayerVersion([6, 0, 21]);
                    axo.AllowScriptAccess = "always";
                } catch (e) {
                    if (_23.major == 6) {
                        return _23;
                    }
                }
                try {
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                } catch (e) {}
            }
            if (axo != null) {
                _23 = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
            }
        }
    }
    return _23;
};
deconcept.PlayerVersion = function (_29) {
    this.major = _29[0] != null ? parseInt(_29[0]) : 0;
    this.minor = _29[1] != null ? parseInt(_29[1]) : 0;
    this.rev = _29[2] != null ? parseInt(_29[2]) : 0;
};
deconcept.PlayerVersion.prototype.versionIsValid = function (fv) {
    if (this.major < fv.major) {
        return false;
    }
    if (this.major > fv.major) {
        return true;
    }
    if (this.minor < fv.minor) {
        return false;
    }
    if (this.minor > fv.minor) {
        return true;
    }
    if (this.rev < fv.rev) {
        return false;
    }
    return true;
};
deconcept.util = {
    getRequestParameter: function (_2b) {
        var q = document.location.search || document.location.hash;
        if (_2b == null) {
            return q;
        }
        if (q) {
            var _2d = q.substring(1).split("&");
            for (var i = 0; i < _2d.length; i++) {
                if (_2d[i].substring(0, _2d[i].indexOf("=")) == _2b) {
                    return _2d[i].substring((_2d[i].indexOf("=") + 1));
                }
            }
        }
        return "";
    }
};
deconcept.SWFObjectUtil.cleanupSWFs = function () {
    var _2f = document.getElementsByTagName("OBJECT");
    for (var i = _2f.length - 1; i >= 0; i--) {
        _2f[i].style.display = "none";
        for (var x in _2f[i]) {
            if (typeof _2f[i][x] == "function") {
                _2f[i][x] = function () {};
            }
        }
    }
};
if (deconcept.SWFObject.doPrepUnload) {
    if (!deconcept.unloadSet) {
        deconcept.SWFObjectUtil.prepUnload = function () {
            __flash_unloadHandler = function () {};
            __flash_savedUnloadHandler = function () {};
            window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs);
        };
        window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
        deconcept.unloadSet = true;
    }
}
if (!document.getElementById && document.all) {
    document.getElementById = function (id) {
        return document.all[id];
    };
}
var getQueryParamValue = deconcept.util.getRequestParameter;
var FlashObject = deconcept.SWFObject;
var SWFObject = deconcept.SWFObject;

//(function ($) {
//    $.widget("ui.accordion", {
//        _init: function () {
//            var o = this.options,
//                self = this;
//            this.running = 0;
//            if (o.navigation) {
//                    var current = this.element.find("a").filter(o.navigationFilter);
//                    if (current.length) {
//                        if (current.filter(o.header).length) {
//                            this.active = current;
//                        } else {
//                            this.active = current.parent().parent().prev();
//                            current.addClass("ui-accordion-content-active");
//                        }
//                    }
//                }
//            this.element.addClass("ui-accordion ui-widget ui-helper-reset");
//            this.headers = this.element.find(o.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion", function () {
//                    $(this).addClass('ui-state-hover');
//                }).bind("mouseleave.accordion", function () {
//                    $(this).removeClass('ui-state-hover');
//                });
//            this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");
//            this.active = this._findActive(this.active || o.active).toggleClass("ui-state-default").toggleClass("ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");
//            this.active.next().addClass('ui-accordion-content-active');
//            $("<span/>").addClass("ui-icon " + o.icons.header).prependTo(this.headers);
//            this.active.find(".ui-icon").toggleClass(o.icons.header).toggleClass(o.icons.headerSelected);
//            this.resize();
//            this.element.attr('role', 'tablist');
//            this.headers.attr('role', 'tab').bind('keydown', function (event) {
//                    return self._keydown(event);
//                }).next().attr('role', 'tabpanel');
//            this.headers.not(this.active || "").attr('aria-expanded', 'false').attr("tabIndex", "-1").next().hide();
//            if (!this.active.length) {
//                    this.headers.eq(0).attr('tabIndex', '0');
//                } else {
//                    this.active.attr('aria-expanded', 'true').attr('tabIndex', '0');
//                }
//            if (!$.browser.safari) this.headers.find('a').attr('tabIndex', '-1');
//            if (o.event) {
//                    this.element.bind((o.event) + ".accordion", function (event) {
//                        return self._clickHandler.call(self, event);
//                    });
//                }
//        },
//        destroy: function () {
//            this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role").unbind('.accordion').removeData('accordion');
//            this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("tabindex");
//            this.headers.find("a").removeAttr("tabindex");
//            this.headers.children(".ui-icon").remove();
//            this.headers.next().removeClass("ui-accordion-content ui-accordion-content-active");
//        },
//        _keydown: function (event) {
//            var o = this.options,
//                keyCode = $.ui.keyCode;
//            if (o.disabled || event.altKey || event.ctrlKey) return;
//            var length = this.headers.length;
//            var currentIndex = this.headers.index(event.target);
//            var toFocus = false;
//            switch (event.keyCode) {
//                case keyCode.RIGHT:
//                case keyCode.DOWN:
//                    toFocus = this.headers[(currentIndex + 1) % length];
//                    break;
//                case keyCode.LEFT:
//                case keyCode.UP:
//                    toFocus = this.headers[(currentIndex - 1 + length) % length];
//                    break;
//                case keyCode.SPACE:
//                case keyCode.ENTER:
//                    return this._clickHandler({
//                        target: event.target
//                    });
//                }
//            if (toFocus) {
//                    $(event.target).attr('tabIndex', '-1');
//                    $(toFocus).attr('tabIndex', '0');
//                    toFocus.focus();
//                    return false;
//                }
//            return true;
//        },
//        resize: function () {
//            var o = this.options,
//                maxHeight;
//            if (o.fillSpace) {
//                    if ($.browser.msie) {
//                        var defOverflow = this.element.parent().css('overflow');
//                        this.element.parent().css('overflow', 'hidden');
//                    }
//                    maxHeight = this.element.parent().height();
//                    if ($.browser.msie) {
//                        this.element.parent().css('overflow', defOverflow);
//                    }
//                    this.headers.each(function () {
//                        maxHeight -= $(this).outerHeight();
//                    });
//                    var maxPadding = 0;
//                    this.headers.next().each(function () {
//                        maxPadding = Math.max(maxPadding, $(this).innerHeight() - $(this).height());
//                    }).height(maxHeight - maxPadding).css('overflow', 'auto');
//                } else if (o.autoHeight) {
//                    maxHeight = 0;
//                    this.headers.next().each(function () {
//                        maxHeight = Math.max(maxHeight, $(this).outerHeight());
//                    }).height(maxHeight);
//                }
//        },
//        activate: function (index) {
//            this._clickHandler({
//                target: this._findActive(index)[0]
//            });
//        },
//        _findActive: function (selector) {
//            return selector ? typeof selector == "number" ? this.headers.filter(":eq(" + selector + ")") : this.headers.not(this.headers.not(selector)) : selector === false ? $([]) : this.headers.filter(":eq(0)");
//        },
//        _clickHandler: function (event) {
//            var o = this.options;
//            if (o.disabled) return false;
//            if (!event.target && !o.alwaysOpen) {
//                this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
//                this.active.next().addClass('ui-accordion-content-active');
//                var toHide = this.active.next(),
//                    data = {
//                        options: o,
//                        newHeader: $([]),
//                        oldHeader: o.active,
//                        newContent: $([]),
//                        oldContent: toHide
//                    },
//                    toShow = (this.active = $([]));
//                this._toggle(toShow, toHide, data);
//                return false;
//            }
//            var clicked = $(event.target);
//            clicked = $(clicked.parents(o.header)[0] || clicked);
//            var clickedIsActive = clicked[0] == this.active[0];
//            if (this.running || (o.alwaysOpen && clickedIsActive)) {
//                return false;
//            }
//            if (!clicked.is(o.header)) {
//                return;
//            }
//            this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
//            this.active.next().addClass('ui-accordion-content-active');
//            if (!clickedIsActive) {
//                clicked.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").find(".ui-icon").removeClass(o.icons.header).addClass(o.icons.headerSelected);
//                clicked.next().addClass('ui-accordion-content-active');
//            }
//            var toShow = clicked.next(),
//                toHide = this.active.next(),
//                data = {
//                    options: o,
//                    newHeader: clickedIsActive && !o.alwaysOpen ? $([]) : clicked,
//                    oldHeader: this.active,
//                    newContent: clickedIsActive && !o.alwaysOpen ? $([]) : toShow.find('> *'),
//                    oldContent: toHide.find('> *')
//                },
//                down = this.headers.index(this.active[0]) > this.headers.index(clicked[0]);
//            this.active = clickedIsActive ? $([]) : clicked;
//            this._toggle(toShow, toHide, data, clickedIsActive, down);
//            return false;
//        },
//        _toggle: function (toShow, toHide, data, clickedIsActive, down) {
//            var o = this.options,
//                self = this;
//            this.toShow = toShow;
//            this.toHide = toHide;
//            this.data = data;
//            var complete = function () {
//                    if (!self) return;
//                    return self._completed.apply(self, arguments);
//                };
//            this._trigger("changestart", null, this.data);
//            this.running = toHide.size() === 0 ? toShow.size() : toHide.size();
//            if (o.animated) {
//                    var animOptions = {};
//                    if (!o.alwaysOpen && clickedIsActive) {
//                        animOptions = {
//                            toShow: $([]),
//                            toHide: toHide,
//                            complete: complete,
//                            down: down,
//                            autoHeight: o.autoHeight || o.fillSpace
//                        };
//                    } else {
//                        animOptions = {
//                            toShow: toShow,
//                            toHide: toHide,
//                            complete: complete,
//                            down: down,
//                            autoHeight: o.autoHeight || o.fillSpace
//                        };
//                    }
//                    if (!o.proxied) {
//                        o.proxied = o.animated;
//                    }
//                    if (!o.proxiedDuration) {
//                        o.proxiedDuration = o.duration;
//                    }
//                    o.animated = $.isFunction(o.proxied) ? o.proxied(animOptions) : o.proxied;
//                    o.duration = $.isFunction(o.proxiedDuration) ? o.proxiedDuration(animOptions) : o.proxiedDuration;
//                    var animations = $.ui.accordion.animations,
//                        duration = o.duration,
//                        easing = o.animated;
//                    if (!animations[easing]) {
//                            animations[easing] = function (options) {
//                                this.slide(options, {
//                                    easing: easing,
//                                    duration: duration || 700
//                                });
//                            };
//                        }
//                    animations[easing](animOptions);
//                } else {
//                    if (!o.alwaysOpen && clickedIsActive) {
//                        toShow.toggle();
//                    } else {
//                        toHide.hide();
//                        toShow.show();
//                    }
//                    complete(true);
//                }
//            toHide.prev().attr('aria-expanded', 'false').attr("tabIndex", "-1");
//            toShow.prev().attr('aria-expanded', 'true').attr("tabIndex", "0").focus();
//        },
//        _completed: function (cancel) {
//            var o = this.options;
//            this.running = cancel ? 0 : --this.running;
//            if (this.running) return;
//            if (o.clearStyle) {
//                this.toShow.add(this.toHide).css({
//                    height: "",
//                    overflow: ""
//                });
//            }
//            this._trigger('change', null, this.data);
//        }
//    });
//    $.extend($.ui.accordion, {
//        version: "1.6rc6",
//        defaults: {
//            active: null,
//            autoHeight: true,
//            alwaysOpen: true,
//            animated: 'slide',
//            clearStyle: false,
//            event: "click",
//            fillSpace: false,
//            header: "a",
//            icons: {
//                header: "ui-icon-triangle-1-e",
//                headerSelected: "ui-icon-triangle-1-s"
//            },
//            navigation: false,
//            navigationFilter: function () {
//                return this.href.toLowerCase() == location.href.toLowerCase();
//            }
//        },
//        animations: {
//            slide: function (options, additions) {
//                options = $.extend({
//                    easing: "swing",
//                    duration: 300
//                }, options, additions);
//                if (!options.toHide.size()) {
//                    options.toShow.animate({
//                        height: "show"
//                    }, options);
//                    return;
//                }
//                var hideHeight = options.toHide.height(),
//                    showHeight = options.toShow.height(),
//                    difference = showHeight / hideHeight,
//                    overflow = options.toShow.css('overflow'),
//                    showProps = {},
//                    hideProps = {},
//                    fxAttrs = ["height", "paddingTop", "paddingBottom"];
//                $.each(fxAttrs, function (i, prop) {
//                        hideProps[prop] = 'hide';
//                        showProps[prop] = parseFloat(options.toShow.css(prop));
//                    });
//                options.toShow.css({
//                        height: 0,
//                        overflow: 'hidden'
//                    }).show();
//                options.toHide.filter(":hidden").each(options.complete).end().filter(":visible").animate(hideProps, {
//                        step: function (now, settings) {
//                            if (!options.toShow[0]) {
//                                return;
//                            }
//                            var percentDone = settings.start != settings.end ? (settings.now - settings.start) / (settings.end - settings.start) : 0,
//                                current = percentDone * showProps[settings.prop];
//                            if ($.browser.msie || $.browser.opera) {
//                                    current = Math.ceil(current);
//                                }
//                            options.toShow[0].style[settings.prop] = current + 'px';
//                        },
//                        duration: options.duration,
//                        easing: options.easing,
//                        complete: function () {
//                            if (!options.autoHeight) {
//                                options.toShow.css("height", "auto");
//                            }
//                            options.toShow.css({
//                                overflow: overflow
//                            });
//                            options.complete();
//                        }
//                    });
//            },
//            bounceslide: function (options) {
//                this.slide(options, {
//                    easing: options.down ? "easeOutBounce" : "swing",
//                    duration: options.down ? 1000 : 200
//                });
//            },
//            easeslide: function (options) {
//                this.slide(options, {
//                    easing: "easeinout",
//                    duration: 700
//                });
//            }
//        }
//    });
//})(jQuery);
(function ($) {
    $.widget("ui.tabs", {
        _init: function () {
            this._tabify(true);
        },
        _setData: function (key, value) {
            if ((/^selected/).test(key)) this.select(value);
            else {
                this.options[key] = value;
                this._tabify();
            }
        },
        _tabId: function (a) {
            return a.title && a.title.replace(/\s/g, '_').replace(/[^A-Za-z0-9\-_:\.]/g, '') || this.options.idPrefix + $.data(a);
        },
        _sanitizeSelector: function (hash) {
            return hash.replace(/:/g, '\\:');
        },
        _cookie: function () {
            var cookie = this.cookie || (this.cookie = this.options.cookie.name || 'ui-tabs-' + $.data(this.list[0]));
            return $.cookie.apply(null, [cookie].concat($.makeArray(arguments)));
        },
        _ui: function (tab, panel) {
            return {
                tab: tab,
                panel: panel,
                index: this.$tabs.index(tab)
            };
        },
        _tabify: function (init) {
            this.list = this.element.is('div') ? this.element.children('ul:first, ol:first').eq(0) : this.element;
            this.$lis = $('li:has(a[href])', this.list);
            this.$tabs = this.$lis.map(function () {
                return $('a', this)[0];
            });
            this.$panels = $([]);
            var self = this,
                o = this.options;
            var fragmentId = /^#.+/;
            this.$tabs.each(function (i, a) {
                    var href = $(a).attr('href');
                    if (fragmentId.test(href)) self.$panels = self.$panels.add(self._sanitizeSelector(href));
                    else if (href != '#') {
                        $.data(a, 'href.tabs', href);
                        $.data(a, 'load.tabs', href.replace(/#.*$/, ''));
                        var id = self._tabId(a);
                        a.href = '#' + id;
                        var $panel = $('#' + id);
                        if (!$panel.length) {
                            $panel = $(o.panelTemplate).attr('id', id).addClass('ui-tabs-panel ui-widget-content ui-corner-bottom').insertAfter(self.$panels[i - 1] || self.list);
                            $panel.data('destroy.tabs', true);
                        }
                        self.$panels = self.$panels.add($panel);
                    }
                    else o.disabled.push(i + 1);
                });
            if (init) {
                    if (this.element.is('div')) {
                        this.element.addClass('ui-tabs ui-widget ui-widget-content ui-corner-all');
                    }
                    this.list.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');
                    this.$lis.addClass('ui-state-default ui-corner-top');
                    this.$panels.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom');
                    if (o.selected === undefined) {
                        if (location.hash) {
                            this.$tabs.each(function (i, a) {
                                if (a.hash == location.hash) {
                                    o.selected = i;
                                    return false;
                                }
                            });
                        }
                        else if (o.cookie) o.selected = parseInt(self._cookie(), 10);
                        else if (this.$lis.filter('.ui-tabs-selected').length) o.selected = this.$lis.index(this.$lis.filter('.ui-tabs-selected'));
                        else o.selected = 0;
                    }
                    else if (o.selected === null) o.selected = -1;
                    o.selected = ((o.selected >= 0 && this.$tabs[o.selected]) || o.selected < 0) ? o.selected : 0;
                    o.disabled = $.unique(o.disabled.concat($.map(this.$lis.filter('.ui-state-disabled'), function (n, i) {
                        return self.$lis.index(n);
                    }))).sort();
                    if ($.inArray(o.selected, o.disabled) != -1) o.disabled.splice($.inArray(o.selected, o.disabled), 1);
                    this.$panels.addClass('ui-tabs-hide');
                    this.$lis.removeClass('ui-tabs-selected ui-state-active');
                    if (o.selected >= 0 && this.$tabs.length) {
                        this.$panels.eq(o.selected).removeClass('ui-tabs-hide');
                        var classes = ['ui-tabs-selected ui-state-active'];
                        if (o.deselectable) classes.push('ui-tabs-deselectable');
                        this.$lis.eq(o.selected).addClass(classes.join(' '));
                        var onShow = function () {
                            self._trigger('show', null, self._ui(self.$tabs[o.selected], self.$panels[o.selected]));
                        };
                        if ($.data(this.$tabs[o.selected], 'load.tabs')) this.load(o.selected, onShow);
                        else onShow();
                    }
                    if (o.event != 'mouseover') {
                        var handleState = function (state, el) {
                            if (el.is(':not(.ui-state-disabled)')) el.toggleClass('ui-state-' + state);
                        };
                        this.$lis.bind('mouseover.tabs mouseout.tabs', function () {
                            handleState('hover', $(this));
                        });
                        this.$tabs.bind('focus.tabs blur.tabs', function () {
                            handleState('focus', $(this).parents('li:first'));
                        });
                    }
                    $(window).bind('unload', function () {
                        self.$lis.add(self.$tabs).unbind('.tabs');
                        self.$lis = self.$tabs = self.$panels = null;
                    });
                }
            else o.selected = this.$lis.index(this.$lis.filter('.ui-tabs-selected'));
            if (o.cookie) this._cookie(o.selected, o.cookie);
            for (var i = 0, li; li = this.$lis[i]; i++)
            $(li)[$.inArray(i, o.disabled) != -1 && !$(li).hasClass('ui-tabs-selected') ? 'addClass' : 'removeClass']('ui-state-disabled');
            if (o.cache === false) this.$tabs.removeData('cache.tabs');
            var hideFx, showFx;
            if (o.fx) {
                    if ($.isArray(o.fx)) {
                        hideFx = o.fx[0];
                        showFx = o.fx[1];
                    }
                    else hideFx = showFx = o.fx;
                }

            function resetStyle($el, fx) {
                    $el.css({
                        display: ''
                    });
                    if ($.browser.msie && fx.opacity) $el[0].style.removeAttribute('filter');
                }
            var showTab = showFx ?
            function (clicked, $show) {
                    $show.hide().removeClass('ui-tabs-hide').animate(showFx, 500, function () {
                        resetStyle($show, showFx);
                        self._trigger('show', null, self._ui(clicked, $show[0]));
                    });
                } : function (clicked, $show) {
                    $show.removeClass('ui-tabs-hide');
                    self._trigger('show', null, self._ui(clicked, $show[0]));

                };
            var hideTab = hideFx ?
            function (clicked, $hide, $show) {
                    $hide.animate(hideFx, hideFx.duration || 'normal', function () {
                        $hide.addClass('ui-tabs-hide');
                        resetStyle($hide, hideFx);
                        if ($show) showTab(clicked, $show);
                    });
                } : function (clicked, $hide, $show) {
                    $hide.addClass('ui-tabs-hide');
                    if ($show) showTab(clicked, $show);
                };

            function switchTab(clicked, $li, $hide, $show) {
                    var classes = ['ui-tabs-selected ui-state-active'];
                    if (o.deselectable) classes.push('ui-tabs-deselectable');
                    $li.removeClass('ui-state-default').addClass(classes.join(' ')).siblings().removeClass(classes.join(' ')).addClass('ui-state-default');
                    hideTab(clicked, $hide, $show);
                }
            this.$tabs.unbind('.tabs').bind(o.event + '.tabs', function () {
                    var $li = $(this).parents('li:eq(0)'),
                        $hide = self.$panels.filter(':visible'),
                        $show = $(self._sanitizeSelector(this.hash));
                    if (($li.hasClass('ui-state-active') && !o.deselectable) || $li.hasClass('ui-state-disabled') || $(this).hasClass('ui-tabs-loading') || self._trigger('select', null, self._ui(this, $show[0])) === false) {
                            this.blur();
                            return false;
                        }
                    o.selected = self.$tabs.index(this);
                    if (o.deselectable) {
                            if ($li.hasClass('ui-state-active')) {
                                o.selected = -1;
                                if (o.cookie) self._cookie(o.selected, o.cookie);
                                $li.removeClass('ui-tabs-selected ui-state-active ui-tabs-deselectable').addClass('ui-state-default');
                                self.$panels.stop();
                                hideTab(this, $hide);
                                this.blur();
                                return false;
                            } else if (!$hide.length) {
                                if (o.cookie) self._cookie(o.selected, o.cookie);
                                self.$panels.stop();
                                var a = this;
                                self.load(self.$tabs.index(this), function () {
                                    $li.addClass('ui-tabs-selected ui-state-active ui-tabs-deselectable').removeClass('ui-state-default');
                                    showTab(a, $show);
                                });
                                this.blur();
                                return false;
                            }
                        }
                    if (o.cookie) self._cookie(o.selected, o.cookie);
                    self.$panels.stop();
                    if ($show.length) {
                            var a = this;
                            self.load(self.$tabs.index(this), $hide.length ?
                            function () {
                                switchTab(a, $li, $hide, $show);
                            } : function () {
                                $li.addClass('ui-tabs-selected ui-state-active').removeClass('ui-state-default');
                                showTab(a, $show);
                            });
                        } else throw 'jQuery UI Tabs: Mismatching fragment identifier.';
                    if ($.browser.msie) this.blur();
                    return false;
                });
            if (o.event != 'click') this.$tabs.bind('click.tabs', function () {
                    return false;
                });
        },
        destroy: function () {
            var o = this.options;
            this.element.removeClass('ui-tabs ui-widget ui-widget-content ui-corner-all');
            this.list.unbind('.tabs').removeClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all').removeData('tabs');
            this.$tabs.each(function () {
                var href = $.data(this, 'href.tabs');
                if (href) this.href = href;
                var $this = $(this).unbind('.tabs');
                $.each(['href', 'load', 'cache'], function (i, prefix) {
                    $this.removeData(prefix + '.tabs');
                });
            });
            this.$lis.unbind('.tabs').add(this.$panels).each(function () {
                if ($.data(this, 'destroy.tabs')) $(this).remove();
                else $(this).removeClass('ui-state-default ' + 'ui-corner-top ' + 'ui-tabs-selected ' + 'ui-state-active ' + 'ui-tabs-deselectable ' + 'ui-state-disabled ' + 'ui-tabs-panel ' + 'ui-widget-content ' + 'ui-corner-bottom ' + 'ui-tabs-hide');
            });
            if (o.cookie) this._cookie(null, o.cookie);
        },
        add: function (url, label, index) {
            if (index == undefined) index = this.$tabs.length;
            var self = this,
                o = this.options;
            var $li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label));
            $li.addClass('ui-state-default ui-corner-top').data('destroy.tabs', true);
            var id = url.indexOf('#') == 0 ? url.replace('#', '') : this._tabId($('a:first-child', $li)[0]);
            var $panel = $('#' + id);
            if (!$panel.length) {
                    $panel = $(o.panelTemplate).attr('id', id).data('destroy.tabs', true);
                }
            $panel.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide');
            if (index >= this.$lis.length) {
                    $li.appendTo(this.list);
                    $panel.appendTo(this.list[0].parentNode);
                }
            else {
                    $li.insertBefore(this.$lis[index]);
                    $panel.insertBefore(this.$panels[index]);
                }
            o.disabled = $.map(o.disabled, function (n, i) {
                    return n >= index ? ++n : n
                });
            this._tabify();
            if (this.$tabs.length == 1) {
                    $li.addClass('ui-tabs-selected ui-state-active');
                    $panel.removeClass('ui-tabs-hide');
                    var href = $.data(this.$tabs[0], 'load.tabs');
                    if (href) this.load(0, function () {
                        self._trigger('show', null, self._ui(self.$tabs[0], self.$panels[0]));
                    });
                }
            this._trigger('add', null, this._ui(this.$tabs[index], this.$panels[index]));
        },
        remove: function (index) {
            var o = this.options,
                $li = this.$lis.eq(index).remove(),
                $panel = this.$panels.eq(index).remove();
            if ($li.hasClass('ui-tabs-selected') && this.$tabs.length > 1) this.select(index + (index + 1 < this.$tabs.length ? 1 : -1));
            o.disabled = $.map($.grep(o.disabled, function (n, i) {
                    return n != index;
                }), function (n, i) {
                    return n >= index ? --n : n
                });
            this._tabify();
            this._trigger('remove', null, this._ui($li.find('a')[0], $panel[0]));
        },
        enable: function (index) {
            var o = this.options;
            if ($.inArray(index, o.disabled) == -1) return;
            this.$lis.eq(index).removeClass('ui-state-disabled');
            o.disabled = $.grep(o.disabled, function (n, i) {
                return n != index;
            });
            this._trigger('enable', null, this._ui(this.$tabs[index], this.$panels[index]));
        },
        disable: function (index) {
            var self = this,
                o = this.options;
            if (index != o.selected) {
                    this.$lis.eq(index).addClass('ui-state-disabled');
                    o.disabled.push(index);
                    o.disabled.sort();
                    this._trigger('disable', null, this._ui(this.$tabs[index], this.$panels[index]));
                }
        },
        select: function (index) {
            if (typeof index == 'string') index = this.$tabs.index(this.$tabs.filter('[href$=' + index + ']'));
            this.$tabs.eq(index).trigger(this.options.event + '.tabs');
        },
        load: function (index, callback) {
            var self = this,
                o = this.options,
                $a = this.$tabs.eq(index),
                a = $a[0],
                bypassCache = callback == undefined || callback === false,
                url = $a.data('load.tabs');
            callback = callback ||
            function () {};
            if (!url || !bypassCache && $.data(a, 'cache.tabs')) {
                    callback();
                    return;
                }
            var inner = function (parent) {
                    var $parent = $(parent),
                        $inner = $parent.find('*:last');
                    return $inner.length && $inner.is(':not(img)') && $inner || $parent;
                };
            var cleanup = function () {
                    self.$tabs.filter('.ui-tabs-loading').removeClass('ui-tabs-loading').each(function () {
                        if (o.spinner) inner(this).parent().html(inner(this).data('label.tabs'));
                    });
                    self.xhr = null;
                };
            if (o.spinner) {
                    var label = inner(a).html();
                    inner(a).wrapInner('<em></em>').find('em').data('label.tabs', label).html(o.spinner);
                }
            var ajaxOptions = $.extend({}, o.ajaxOptions, {
                    url: url,
                    success: function (r, s) {
                        $(self._sanitizeSelector(a.hash)).html(r);
                        cleanup();
                        if (o.cache) $.data(a, 'cache.tabs', true);
                        self._trigger('load', null, self._ui(self.$tabs[index], self.$panels[index]));
                        try {
                            o.ajaxOptions.success(r, s);
                        }
                        catch (er) {}
                        callback();
                    }
                });
            if (this.xhr) {
                    this.xhr.abort();
                    cleanup();
                }
            $a.addClass('ui-tabs-loading');
            self.xhr = $.ajax(ajaxOptions);
        },
        url: function (index, url) {
            this.$tabs.eq(index).removeData('cache.tabs').data('load.tabs', url);
        },
        length: function () {
            return this.$tabs.length;
        }
    });
    $.extend($.ui.tabs, {
        version: '1.6rc6',
        getter: 'length',
        defaults: {
            ajaxOptions: null,
            cache: false,
            cookie: null,
            deselectable: false,
            disabled: [],
            event: 'click',
            fx: null,
            idPrefix: 'ui-tabs-',
            panelTemplate: '<div></div>',
            spinner: 'Loading&#8230;',
            tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a></li>'
        }
    });
    $.extend($.ui.tabs.prototype, {
        rotation: null,
        rotate: function (ms, continuing) {
            var self = this,
                t = this.options.selected;

            function rotate() {
                    clearTimeout(self.rotation);
                    self.rotation = setTimeout(function () {
                        t = ++t < self.$tabs.length ? t : 0;
                        self.select(t);
                    }, ms);
                }
            if (ms) {
                    this.element.bind('tabsshow', rotate);
                    this.$tabs.bind(this.options.event + '.tabs', !continuing ?
                    function (e) {
                        if (e.clientX) {
                            clearTimeout(self.rotation);
                            self.element.unbind('tabsshow', rotate);
                        }
                    } : function (e) {
                        t = self.options.selected;
                        rotate();
                    });
                    rotate();
                }
            else {
                    clearTimeout(self.rotation);
                    this.element.unbind('tabsshow', rotate);
                    this.$tabs.unbind(this.options.event + '.tabs', stop);
                }
        }
    });
})(jQuery);
/**
 * jQuery.query - Query String Modification and Creation for jQuery
 * Written in 2007 by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2008/02/08
 *
 * @author Blair Mitchelmore
 * @version 1.2
 * @url http://plugins.jquery.com/project/query-object
 **/

new
function (settings) {
    var $separator = settings.separator || '&';
    var $spaces = settings.spaces === false ? false : true;
    var $suffix = settings.suffix === false ? '' : '[]';
    jQuery.query = new
    function () {
        var queryObject = function (a) {
            var self = this;
            self.keys = {};
            if (a.queryObject) {
                jQuery.each(a.keys, function (key, val) {
                    self.destructiveSet(key, val);
                });
            } else {
                var q = "" + a;
                q = q.replace(/^\?/, '');
                q = q.replace(/[;&]$/, '');
                if ($spaces) q = q.replace('+', ' ');
                jQuery.each(q.split(/[&;]/), function () {
                    var key = this.split('=')[0];
                    var val = this.split('=')[1];
                    var temp, hashKey = null,
                        type = null;
                    if (/^-?[0-9]+\.[0-9]+$/.test(val)) val = parseFloat(val);
                    else if (/^-?[0-9]+$/.test(val)) val = parseInt(val);
                    if (/\[([^\] ]+)\]$/.test(key)) type = Object,
                    hashkey = key.replace(/^.+\[([^\] ]+)\]$/, "$1"),
                    key = key.replace(/\[([^\] ]+)\]$/, "");
                    else if (/\[\]$/.test(key)) type = Array,
                    key = key.replace(/\[\]$/, "");
                    val = val || true;
                    if (!type && self.has(key)) type = Array,
                    self.destructiveSet(key, self.has(key, Array) ? self.keys[key] : [self.keys[key]]);
                    if (!type) self.destructiveSet(key, val);
                    else if (type == Object) temp = self.keys[key] || {},
                    temp[hashkey] = val,
                    self.destructiveSet(key, temp);
                    else if (type == Array) temp = self.keys[key] || [],
                    temp.push(val),
                    self.destructiveSet(key, temp);
                });
            }
            return self;
        };
        queryObject.prototype = {
            queryObject: true,
            has: function (key, type) {
                var keys = this.keys;
                return !!type ? keys[key] != undefined && keys[key] !== null && keys[key].constructor == type : keys[key] != undefined && keys[key] !== null;
            },
            get: function (key) {
                var value = (key == undefined) ? this.keys : this.keys[key];
                if (value.constructor == Array) return value.slice(0);
                else if (value.constructor == Object) return jQuery.extend({}, value);
                else return value;
            },
            destructiveSet: function (key, val) {
                if (val == undefined || val === null) this.destructiveRemove(key);
                else this.keys[key] = val;
                return this;
            },
            set: function (key, val) {
                return this.copy().destructiveSet(key, val);
            },
            destructiveRemove: function (key) {
                if (typeof this.keys[key] != 'undefined') delete this.keys[key];
                return this;
            },
            remove: function (key) {
                return this.copy().destructiveRemove(key);
            },
            destructiveEmpty: function () {
                var self = this;
                jQuery.each(self.keys, function (key, value) {
                    delete self.keys[key];
                });
                return self;
            },
            copy: function () {
                return new queryObject(this);
            },
            empty: function (destructive) {
                return this.copy().destructiveEmpty();
            },
            toString: function () {
                var i = 0,
                    queryString = [],
                    self = this,
                    addFields = function (o, key, value) {
                        o.push(key);
                        if (value !== true) {
                            o.push("=");
                            o.push(encodeURIComponent(value));
                        }
                    };
                jQuery.each(this.keys, function (key, value) {
                        var o = [];
                        if (value !== false) {
                            if (i++ == 0) o.push("?");
                            if (self.has(key, Object)) {
                                var _o = []
                                jQuery.each(value, function (_key, _value) {
                                    var __o = [];
                                    addFields(__o, key + "[" + _key + "]", _value);
                                    _o.push(__o.join(""));
                                });
                                o.push(_o.join($separator));
                            } else if (self.has(key, Array)) {
                                var _o = []
                                jQuery.each(value, function (_key, _value) {
                                    var __o = [];
                                    addFields(__o, key + $suffix, _value);
                                    _o.push(__o.join(""));
                                });
                                o.push(_o.join($separator));
                            } else {
                                addFields(o, key, value);
                            }
                        }
                        queryString.push(o.join(""));
                    });
                return queryString.join($separator);
            }
        };
        return new queryObject(location.search);
    };
}(jQuery.query || {});
/* Dimensions plugin - helps to get the height/width of a container element
 * 
 * Copyright (c) 2007 Paul Bakaus (paul.bakaus@googlemail.com) and Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $LastChangedDate: 2007-12-20 08:46:55 -0600 (Thu, 20 Dec 2007) $
 * $Rev: 4259 $
 *
 * Version: 1.2
 *
 * Requires: jQuery 1.2+
 */

/* jQuery onReady plugin (allows non-id selectors)
 */


(function ($) {
    $.extend($.fn, {
        validate: function (options) {
            if (!this.length) {
                options && options.debug && window.console && console.warn("nothing selected, can't validate, returning nothing");
                return;
            }
            var validator = $.data(this[0], 'validator');
            if (validator) {
                return validator;
            }
            validator = new $.validator(options, this[0]);
            $.data(this[0], 'validator', validator);
            if (validator.settings.onsubmit) {
                this.find("input, button").filter(".cancel").click(function () {
                    validator.cancelSubmit = true;
                });
                this.submit(function (event) {
                    if (validator.settings.debug) event.preventDefault();

                    function handle() {
                        if (validator.settings.submitHandler) {
                            validator.settings.submitHandler.call(validator, validator.currentForm);
                            return false;
                        }
                        return true;
                    }
                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }
            return validator;
        },
        valid: function () {
            if ($(this[0]).is('form')) {
                return this.validate().form();
            } else {
                var valid = false;
                var validator = $(this[0].form).validate();
                this.each(function () {
                    valid |= validator.element(this);
                });
                return valid;
            }
        },
        removeAttrs: function (attributes) {
            var result = {},
                $element = this;
            $.each(attributes.split(/\s/), function (index, value) {
                    result[value] = $element.attr(value);
                    $element.removeAttr(value);
                });
            return result;
        },
        rules: function (command, argument) {
            var element = this[0];
            if (command) {
                var settings = $.data(element.form, 'validator').settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch (command) {
                case "add":
                    $.extend(existingRules, $.validator.normalizeRule(argument));
                    staticRules[element.name] = existingRules;
                    if (argument.messages) settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                    break;
                case "remove":
                    if (!argument) {
                        delete staticRules[element.name];
                        return existingRules;
                    }
                    var filtered = {};
                    $.each(argument.split(/\s/), function (index, method) {
                        filtered[method] = existingRules[method];
                        delete existingRules[method];
                    });
                    return filtered;
                }
            }
            var data = $.validator.normalizeRules($.extend({}, $.validator.metadataRules(element), $.validator.classRules(element), $.validator.attributeRules(element), $.validator.staticRules(element)), element);
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({
                    required: param
                }, data);
            }
            return data;
        }
    });
    $.extend($.expr[":"], {
        blank: function (a) {
            return !$.trim(a.value);
        },
        filled: function (a) {
            return !!$.trim(a.value);
        },
        unchecked: function (a) {
            return !a.checked;
        }
    });
    $.format = function (source, params) {
        if (arguments.length == 1) return function () {
            var args = $.makeArray(arguments);
            args.unshift(source);
            return $.format.apply(this, args);
        };
        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };
    $.validator = function (options, form) {
        this.settings = $.extend({}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };
    $.extend($.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: [],
            ignoreTitle: false,
            onfocusin: function (element) {
                this.lastActive = element;
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    this.settings.unhighlight && this.settings.unhighlight.call(this, element, this.settings.errorClass);
                    this.errorsFor(element).hide();
                }
            },
            onfocusout: function (element) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function (element) {
                if (element.name in this.submitted || element == this.lastElement) {
                    this.element(element);
                }
            },
            onclick: function (element) {
                if (element.name in this.submitted) this.element(element);
            },
            highlight: function (element, errorClass) {
                $(element).addClass(errorClass);
            },
            unhighlight: function (element, errorClass) {
                $(element).removeClass(errorClass);
            }
        },
        setDefaults: function (settings) {
            $.extend($.validator.defaults, settings);
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            dateDE: "Bitte geben Sie ein gÃ¼ltiges Datum ein.",
            number: "Please enter a valid number.",
            numberDE: "Bitte geben Sie eine Nummer ein.",
            digits: "Please enter only digits",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            accept: "Please enter a value with a valid extension.",
            maxlength: $.format("Please enter no more than {0} characters."),
            minlength: $.format("Please enter at least {0} characters."),
            rangelength: $.format("Please enter a value between {0} and {1} characters long."),
            range: $.format("Please enter a value between {0} and {1}."),
            max: $.format("Please enter a value less than or equal to {0}."),
            min: $.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: false,
        prototype: {
            init: function () {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var groups = (this.groups = {});
                $.each(this.settings.groups, function (key, value) {
                    $.each(value.split(/\s/), function (index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function (key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator");
                    validator.settings["on" + event.type] && validator.settings["on" + event.type].call(validator, this[0]);
                }
                $(this.currentForm).delegate("focusin focusout keyup", ":text, :password, :file, select, textarea", delegate).delegate("click", ":radio, :checkbox", delegate);
                if (this.settings.invalidHandler) $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
            },
            form: function () {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) $(this.currentForm).triggerHandler("invalid-form", [this]);
                this.showErrors();
                return this.valid();
            },
            checkForm: function () {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            },
            element: function (element) {
                element = this.clean(element);
                this.lastElement = element;
                this.prepareElement(element);
                this.currentElements = $(element);
                var result = this.check(element);
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if (!this.numberOfInvalids()) {
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            },
            showErrors: function (errors) {
                if (errors) {
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    this.successList = $.grep(this.successList, function (element) {
                        return !(element.name in errors);
                    });
                }
                this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors();
            },
            resetForm: function () {
                if ($.fn.resetForm) $(this.currentForm).resetForm();
                this.submitted = {};
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass);
            },
            numberOfInvalids: function () {
                return this.objectLength(this.invalid);
            },
            objectLength: function (obj) {
                var count = 0;
                for (var i in obj) count++;
                return count;
            },
            hideErrors: function () {
                this.addWrapper(this.toHide).hide();
            },
            valid: function () {
                return this.size() == 0;
            },
            size: function () {
                return this.errorList.length;
            },
            focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus();
                    } catch (e) {}
                }
            },
            findLastActive: function () {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function (n) {
                    return n.element.name == lastActive.name;
                }).length == 1 && lastActive;
            },
            elements: function () {
                var validator = this,
                    rulesCache = {};
                return $([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function () {
                        !this.name && validator.settings.debug && window.console && console.error("%o has no name assigned", this);
                        if (this.name in rulesCache || !validator.objectLength($(this).rules())) return false;
                        rulesCache[this.name] = true;
                        return true;
                    });
            },
            clean: function (selector) {
                return $(selector)[0];
            },
            errors: function () {
                return $(this.settings.errorElement + "." + this.settings.errorClass, this.errorContext);
            },
            reset: function () {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.formSubmitted = false;
                this.currentElements = $([]);
            },
            prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },
            prepareElement: function (element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },
            check: function (element) {
                element = this.clean(element);
                if (this.checkable(element)) {
                    element = this.findByName(element.name)[0];
                }
                var rules = $(element).rules();
                var dependencyMismatch = false;
                for (method in rules) {
                    var rule = {
                        method: method,
                        parameters: rules[method]
                    };
                    try {
                        var result = $.validator.methods[method].call(this, element.value.replace(/\r/g, ""), element, rule.parameters);
                        if (result == "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;
                        if (result == "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }
                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        this.settings.debug && window.console && console.log("exception occured when checking element " + element.id + ", check the '" + rule.method + "' method");
                        throw e;
                    }
                }
                if (dependencyMismatch) return;
                if (this.objectLength(rules)) this.successList.push(element);
                return true;
            },
            customMetaMessage: function (element, method) {
                if (!$.metadata) return;
                var meta = this.settings.meta ? $(element).metadata()[this.settings.meta] : $(element).metadata();
                return meta && meta.messages && meta.messages[method];
            },
            customMessage: function (name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor == String ? m : m[method]);
            },
            findDefined: function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) return arguments[i];
                }
                return undefined;
            },
            defaultMessage: function (element, method) {
                return this.findDefined(this.customMessage(element.name, method), this.customMetaMessage(element, method), !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>");
            },
            formatAndAdd: function (element, rule) {
                var message = this.defaultMessage(element, rule.method);
                if (typeof message == "function") message = message.call(this, rule.parameters, element);
                this.errorList.push({
                    message: message,
                    element: element
                });
                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },
            addWrapper: function (toToggle) {
                if (this.settings.wrapper) toToggle = toToggle.add(toToggle.parents(this.settings.wrapper));
                return toToggle;
            },
            defaultShowErrors: function () {
                for (var i = 0; this.errorList[i]; i++) {
                    var error = this.errorList[i];
                    this.settings.highlight && this.settings.highlight.call(this, error.element, this.settings.errorClass);
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (var i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (var i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },
            validElements: function () {
                return this.currentElements.not(this.invalidElements());
            },
            invalidElements: function () {
                return $(this.errorList).map(function () {
                    return this.element;
                });
            },
            showLabel: function (element, message) {
                var label = this.errorsFor(element);
                if (label.length) {
                    label.removeClass().addClass(this.settings.errorClass);
                    label.attr("generated") && label.html(message);
                } else {
                    label = $("<" + this.settings.errorElement + "/>").attr({
                        "for": this.idOrName(element),
                        generated: true
                    }).addClass(this.settings.errorClass).html(message || "");
                    if (this.settings.wrapper) {
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (!this.labelContainer.append(label).length) this.settings.errorPlacement ? this.settings.errorPlacement(label, $(element)) : label.insertAfter(element);
                }
                if (!message && this.settings.success) {
                    label.text("");
                    typeof this.settings.success == "string" ? label.addClass(this.settings.success) : this.settings.success(label);
                }
                this.toShow = this.toShow.add(label);
            },
            errorsFor: function (element) {
                return this.errors().filter("[for='" + this.idOrName(element) + "']");
            },
            idOrName: function (element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },
            checkable: function (element) {
                return /radio|checkbox/i.test(element.type);
            },
            findByName: function (name) {
                var form = this.currentForm;
                return $(document.getElementsByName(name)).map(function (index, element) {
                    return element.form == form && element.name == name && element || null;
                });
            },
            getLength: function (value, element) {
                switch (element.nodeName.toLowerCase()) {
                case 'select':
                    return $("option:selected", element).length;
                case 'input':
                    if (this.checkable(element)) return this.findByName(element.name).filter(':checked').length;
                }
                return value.length;
            },
            depend: function (param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },
            dependTypes: {
                "boolean": function (param, element) {
                    return param;
                },
                "string": function (param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function (param, element) {
                    return param(element);
                }
            },
            optional: function (element) {
                return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
            },
            startRequest: function (element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },
            stopRequest: function (element, valid) {
                this.pendingRequest--;
                if (this.pendingRequest < 0) this.pendingRequest = 0;
                delete this.pending[element.name];
                if (valid && this.pendingRequest == 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                } else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
            },
            previousValue: function (element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", previous = {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                });
            }
        },
        classRuleSettings: {
            required: {
                required: true
            },
            email: {
                email: true
            },
            url: {
                url: true
            },
            date: {
                date: true
            },
            dateISO: {
                dateISO: true
            },
            dateDE: {
                dateDE: true
            },
            number: {
                number: true
            },
            numberDE: {
                numberDE: true
            },
            digits: {
                digits: true
            },
            creditcard: {
                creditcard: true
            }
        },
        addClassRules: function (className, rules) {
            className.constructor == String ? this.classRuleSettings[className] = rules : $.extend(this.classRuleSettings, className);
        },
        classRules: function (element) {
            var rules = {};
            var classes = $(element).attr('class');
            classes && $.each(classes.split(' '), function () {
                if (this in $.validator.classRuleSettings) {
                    $.extend(rules, $.validator.classRuleSettings[this]);
                }
            });
            return rules;
        },
        attributeRules: function (element) {
            var rules = {};
            var $element = $(element);
            for (method in $.validator.methods) {
                var value = $element.attr(method);
                if (value) {
                    rules[method] = value;
                }
            }
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }
            return rules;
        },
        metadataRules: function (element) {
            if (!$.metadata) return {};
            var meta = $.data(element.form, 'validator').settings.meta;
            return meta ? $(element).metadata()[meta] : $(element).metadata();
        },
        staticRules: function (element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },
        normalizeRules: function (rules, element) {
            $.each(rules, function (prop, val) {
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                    case "string":
                        keepRule = !! $(val.depends, element.form).length;
                        break;
                    case "function":
                        keepRule = val.depends.call(element, element);
                        break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });
            $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });
            $.each(['minlength', 'maxlength', 'min', 'max'], function () {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function () {
                if (rules[this]) {
                    rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                }
            });
            if ($.validator.autoCreateRanges) {
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }
            if (rules.messages) {
                delete rules.messages
            }
            return rules;
        },
        normalizeRule: function (data) {
            if (typeof data == "string") {
                var transformed = {};
                $.each(data.split(/\s/), function () {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },
        addMethod: function (name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message;
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {
            required: function (value, element, param) {
                if (!this.depend(param, element)) return "dependency-mismatch";
                switch (element.nodeName.toLowerCase()) {
                case 'select':
                    var options = $("option:selected", element);
                    return options.length > 0 && (element.type == "select-multiple" || ($.browser.msie && !(options[0].attributes['value'].specified) ? options[0].text : options[0].value).length > 0);
                case 'input':
                    if (this.checkable(element)) return this.getLength(value, element) > 0;
                default:
                    return $.trim(value).length > 0;
                }
            },
            remote: function (value, element, param) {
                if (this.optional(element)) return "dependency-mismatch";
                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name]) this.settings.messages[element.name] = {};
                this.settings.messages[element.name].remote = typeof previous.message == "function" ? previous.message(value) : previous.message;
                param = typeof param == "string" && {
                    url: param
                } || param;
                if (previous.old !== value) {
                    previous.old = value;
                    var validator = this;
                    this.startRequest(element);
                    var data = {};
                    data[element.name] = value;
                    $.ajax($.extend(true, {
                        url: param,
                        mode: "abort",
                        port: "validate" + element.name,
                        dataType: "json",
                        data: data,
                        success: function (response) {
                            if (response) {
                                var submitted = validator.formSubmitted;
                                validator.prepareElement(element);
                                validator.formSubmitted = submitted;
                                validator.successList.push(element);
                                validator.showErrors();
                            } else {
                                var errors = {};
                                errors[element.name] = response || validator.defaultMessage(element, "remote");
                                validator.showErrors(errors);
                            }
                            previous.valid = response;
                            validator.stopRequest(element, response);
                        }
                    }, param));
                    return "pending";
                } else if (this.pending[element.name]) {
                    return "pending";
                }
                return previous.valid;
            },
            minlength: function (value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) >= param;
            },
            maxlength: function (value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) <= param;
            },
            rangelength: function (value, element, param) {
                var length = this.getLength($.trim(value), element);
                return this.optional(element) || (length >= param[0] && length <= param[1]);
            },
            min: function (value, element, param) {
                return this.optional(element) || value >= param;
            },
            max: function (value, element, param) {
                return this.optional(element) || value <= param;
            },
            range: function (value, element, param) {
                return this.optional(element) || (value >= param[0] && value <= param[1]);
            },
            email: function (value, element) {
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
            },
            url: function (value, element) {
                return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },
            date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
            },
            dateISO: function (value, element) {
                return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
            },
            dateDE: function (value, element) {
                return this.optional(element) || /^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value);
            },
            number: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
            },
            numberDE: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value);
            },
            digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },
            creditcard: function (value, element) {
                if (this.optional(element)) return "dependency-mismatch";
                if (/[^0-9-]+/.test(value)) return false;
                var nCheck = 0,
                    nDigit = 0,
                    bEven = false;
                value = value.replace(/\D/g, "");
                for (n = value.length - 1; n >= 0; n--) {
                        var cDigit = value.charAt(n);
                        var nDigit = parseInt(cDigit, 10);
                        if (bEven) {
                            if ((nDigit *= 2) > 9) nDigit -= 9;
                        }
                        nCheck += nDigit;
                        bEven = !bEven;
                    }
                return (nCheck % 10) == 0;
            },
            accept: function (value, element, param) {
                param = typeof param == "string" ? param : "png|jpe?g|gif";
                return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
            },
            equalTo: function (value, element, param) {
                return value == $(param).val();
            }
        }
    });
})(jQuery);;
(function ($) {
    var ajax = $.ajax;
    var pendingRequests = {};
    $.ajax = function (settings) {
        settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
        var port = settings.port;
        if (settings.mode == "abort") {
            if (pendingRequests[port]) {
                pendingRequests[port].abort();
            }
            return (pendingRequests[port] = ajax.apply(this, arguments));
        }
        return ajax.apply(this, arguments);
    };
})(jQuery);;
(function ($) {
    $.each({
        focus: 'focusin',
        blur: 'focusout'
    }, function (original, fix) {
        $.event.special[fix] = {
            setup: function () {
                if ($.browser.msie) return false;
                this.addEventListener(original, $.event.special[fix].handler, true);
            },
            teardown: function () {
                if ($.browser.msie) return false;
                this.removeEventListener(original, $.event.special[fix].handler, true);
            },
            handler: function (e) {
                arguments[0] = $.event.fix(e);
                arguments[0].type = fix;
                return $.event.handle.apply(this, arguments);
            }
        };
    });
    $.extend($.fn, {
        delegate: function (type, delegate, handler) {
            return this.bind(type, function (event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        },
        triggerEvent: function (type, target) {
            return this.triggerHandler(type, [$.event.fix({
                type: type,
                target: target
            })]);
        }
    })
})(jQuery);
/*
 * Autocomplete - jQuery plugin 1.0.2
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, JÃ¶rn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 5747 2008-06-25 18:30:55Z joern.zaefferer $
 *
 */

jQuery.autocomplete = function (input, options) {
    var me = this;
    var $input = $(input).attr("autocomplete", "off");
    if (options.inputClass) $input.addClass(options.inputClass);
    var results = document.createElement("div");
    var $results = $(results);
    $results.hide().addClass(options.resultsClass).css("position", "absolute");
    $results.attr({
        id: "asug"
    });
    if (options.width > 0) $results.css("width", options.width);
    $("#diy-masthead .search").after(results);
    input.autocompleter = me;
    var timeout = null;
    var prev = "";
    var active = -1;
    var cache = {};
    var keyb = false;
    var hasFocus = false;
    var lastKeyPressCode = null;

    function flushCache() {
        cache = {};
        cache.data = {};
        cache.length = 0;
    };
    flushCache();
    if (options.data != null) {
        var sFirstChar = "",
            stMatchSets = {},
            row = [];
        if (typeof options.url != "string") options.cacheLength = 1;
        for (var i = 0; i < options.data.length; i++) {
                row = ((typeof options.data[i] == "string") ? [options.data[i]] : options.data[i]);
                if (row[0].length > 0) {
                    sFirstChar = row[0].substring(0, 1).toLowerCase();
                    if (!stMatchSets[sFirstChar]) stMatchSets[sFirstChar] = [];
                    stMatchSets[sFirstChar].push(row);
                }
            }
        for (var k in stMatchSets) {
                options.cacheLength++;
                addToCache(k, stMatchSets[k]);
            }
    }
    $input.keydown(function (e) {
        lastKeyPressCode = e.keyCode;
        switch (e.keyCode) {
        case 38:
            e.preventDefault();
            moveSelect(-1);
            break;
        case 40:
            e.preventDefault();
            moveSelect(1);
            break;
        case 9:
        case 13:
            if (selectCurrent()) {
                $input.get(0).blur();
                e.preventDefault();
            }
            break;
        default:
            active = -1;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(function () {
                onChange();
            }, options.delay);
            break;
        }
    }).focus(function () {
        hasFocus = true;
    }).blur(function () {
        hasFocus = false;
        hideResults();
    });
    hideResultsNow();

    function onChange() {
        if (lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32)) return $results.hide();
        var v = $input.val();
        if (v == prev) return;
        prev = v;
        if (v.length >= options.minChars) {
            $input.addClass(options.loadingClass);
            requestData(v);
        } else {
            $input.removeClass(options.loadingClass);
            $results.hide();
        }
    };

    function moveSelect(step) {
        var lis = $("li", results);
        if (!lis) return;
        active += step;
        if (active < 0) {
            active = 0;
        } else if (active >= lis.size()) {
            active = lis.size() - 1;
        }
        lis.removeClass("ac_over");
        $(lis[active]).addClass("ac_over");
    };

    function selectCurrent() {
        var li = $("li.ac_over", results)[0];
        if (!li) {
            var $li = $("li", results);
            if (options.selectOnly) {
                if ($li.length == 1) li = $li[0];
            } else if (options.selectFirst) {
                li = $li[0];
            }
        }
        if (li) {
            selectItem(li);
            return true;
        } else {
            return false;
        }
    };

    function selectItem(li) {
        if (!li) {
            li = document.createElement("li");
            li.extra = [];
            li.selectValue = "";
        }
        var v = $.trim(li.selectValue ? li.selectValue : li.innerHTML);
        input.lastSelected = v;
        prev = v;
        $results.html("");
        $input.val(v);
        hideResultsNow();
        if (options.onItemSelect) setTimeout(function () {
            options.onItemSelect(li)
        }, 1);
    };

    function createSelection(start, end) {
        var field = $input.get(0);
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart("character", start);
            selRange.moveEnd("character", end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else {
            if (field.selectionStart) {
                field.selectionStart = start;
                field.selectionEnd = end;
            }
        }
        field.focus();
    };

    function autoFill(sValue) {
        if (lastKeyPressCode != 8) {
            $input.val($input.val() + sValue.substring(prev.length));
            createSelection(prev.length, sValue.length);
        }
    };

    function showResults() {
        var iWidth = (options.width > 0) ? options.width : $input.width();
        $results.css({
            width: parseInt(iWidth) + "px",
            top: "41px",
            left: "240px"
        }).show();
        $results.append("<div class='fly-ft'> </div>");
        $results.prepend("<div class='fly-hd'> </div>");
    };

    function hideResults() {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(hideResultsNow, 200);
    };

    function hideResultsNow() {
        if (timeout) clearTimeout(timeout);
        $input.removeClass(options.loadingClass);
        if ($results.is(":visible")) {
            $results.hide();
        }
        if (options.mustMatch) {
            var v = $input.val();
            if (v != input.lastSelected) {
                selectItem(null);
            }
        }
    };

    function receiveData(q, data) {
        if (data) {
            $input.removeClass(options.loadingClass);
            results.innerHTML = "";
            if (!hasFocus || data.length == 0) return hideResultsNow();
            if ($.browser.msie) {
                $results.append(document.createElement('iframe'));
            }
            results.appendChild(dataToDom(data));
            if (options.autoFill && ($input.val().toLowerCase() == q.toLowerCase())) autoFill(data[0][0]);
            showResults();
        } else {
            hideResultsNow();
        }
    };

    function parseData(data) {
        if (!data) return null;
        var parsed = [];
        var rows = data.split(options.lineSeparator);
        for (var i = 0; i < rows.length; i++) {
            var row = $.trim(rows[i]);
            if (row) {
                parsed[parsed.length] = row.split(options.cellSeparator);
            }
        }
        return parsed;
    };

    function dataToDom(data) {
        var div = document.createElement("div");
        $(div).addClass("fly-bd");
        var ul = document.createElement("ul");
        var num = data.length;
        if ((options.maxItemsToShow > 0) && (options.maxItemsToShow < num)) num = options.maxItemsToShow;
        for (var i = 0; i < num; i++) {
            var row = data[i];
            if (!row) continue;
            var li = document.createElement("li");
            if (options.formatItem) {
                li.innerHTML = options.formatItem(row, i, num);
                li.selectValue = row[0];
            } else {
                li.innerHTML = row[0];
                li.selectValue = row[0];
            }
            var extra = null;
            if (row.length > 1) {
                extra = [];
                for (var j = 1; j < row.length; j++) {
                    extra[extra.length] = row[j];
                }
            }
            li.extra = extra;
            ul.appendChild(li);
            $(li).hover(function () {
                $("li", ul).removeClass("ac_over");
                $(this).addClass("ac_over");
                active = $("li", ul).indexOf($(this).get(0));
            }, function () {
                $(this).removeClass("ac_over");
            }).click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectItem(this)
            });
        }
        $(div).append("<h3>Suggestions<span class='close'>x</span></h3>");
        div.appendChild(ul);
        return div;
    };

    function requestData(q) {
        if (!options.matchCase) q = q.toLowerCase();
        var data = options.cacheLength ? loadFromCache(q) : null;
        if (data) {
            receiveData(q, data);
        } else if ((typeof options.url == "string") && (options.url.length > 0)) {
            $.get(makeUrl(q), function (data) {
                data = parseData(data);
                addToCache(q, data);
                receiveData(q, data);
            });
        } else {
            $input.removeClass(options.loadingClass);
        }
    };

    function makeUrl(q) {
        var url = options.url + "?key=" + encodeURI(q);
        for (var i in options.extraParams) {
            url += "&" + i + "=" + encodeURI(options.extraParams[i]);
        }
        return url;
    };

    function loadFromCache(q) {
        if (!q) return null;
        if (cache.data[q]) return cache.data[q];
        if (options.matchSubset) {
            for (var i = q.length - 1; i >= options.minChars; i--) {
                var qs = q.substr(0, i);
                var c = cache.data[qs];
                if (c) {
                    var csub = [];
                    for (var j = 0; j < c.length; j++) {
                        var x = c[j];
                        var x0 = x[0];
                        if (matchSubset(x0, q)) {
                            csub[csub.length] = x;
                        }
                    }
                    return csub;
                }
            }
        }
        return null;
    };

    function matchSubset(s, sub) {
        if (!options.matchCase) s = s.toLowerCase();
        var i = s.indexOf(sub);
        if (i == -1) return false;
        return i == 0 || options.matchContains;
    };
    this.flushCache = function () {
        flushCache();
    };
    this.setExtraParams = function (p) {
        options.extraParams = p;
    };
    this.findValue = function () {
        var q = $input.val();
        if (!options.matchCase) q = q.toLowerCase();
        var data = options.cacheLength ? loadFromCache(q) : null;
        if (data) {
            findValueCallback(q, data);
        } else if ((typeof options.url == "string") && (options.url.length > 0)) {
            $.get(makeUrl(q), function (data) {
                data = parseData(data)
                addToCache(q, data);
                findValueCallback(q, data);
            });
        } else {
            findValueCallback(q, null);
        }
    }

    function findValueCallback(q, data) {
        if (data) $input.removeClass(options.loadingClass);
        var num = (data) ? data.length : 0;
        var li = null;
        for (var i = 0; i < num; i++) {
            var row = data[i];
            if (row[0].toLowerCase() == q.toLowerCase()) {
                li = document.createElement("li");
                if (options.formatItem) {
                    li.innerHTML = options.formatItem(row, i, num);
                    li.selectValue = row[0];
                } else {
                    li.innerHTML = row[0];
                    li.selectValue = row[0];
                }
                var extra = null;
                if (row.length > 1) {
                    extra = [];
                    for (var j = 1; j < row.length; j++) {
                        extra[extra.length] = row[j];
                    }
                }
                li.extra = extra;
            }
        }
        if (options.onFindValue) setTimeout(function () {
            options.onFindValue(li)
        }, 1);
    }

    function addToCache(q, data) {
        if (!data || !q || !options.cacheLength) return;
        if (!cache.length || cache.length > options.cacheLength) {
            flushCache();
            cache.length++;
        } else if (!cache[q]) {
            cache.length++;
        }
        cache.data[q] = data;
    };

    function findPos(obj) {
        var curleft = obj.offsetLeft || 0;
        var curtop = obj.offsetTop || 0;
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
        return {
            x: curleft,
            y: curtop
        };
    }
}
jQuery.fn.autocomplete = function (url, options, data) {
    options = options || {};
    options.url = url;
    options.data = ((typeof data == "object") && (data.constructor == Array)) ? data : null;
    options.inputClass = options.inputClass || "ac_input";
    options.resultsClass = options.resultsClass || "flyout fmed";
    options.lineSeparator = options.lineSeparator || ",";
    options.cellSeparator = options.cellSeparator || "|";
    options.minChars = options.minChars || 1;
    options.delay = options.delay || 400;
    options.matchCase = options.matchCase || 0;
    options.matchSubset = options.matchSubset || 1;
    options.matchContains = options.matchContains || 0;
    options.cacheLength = options.cacheLength || 1;
    options.mustMatch = options.mustMatch || 0;
    options.extraParams = options.extraParams || {};
    options.loadingClass = options.loadingClass || "ac_loading";
    options.selectFirst = options.selectFirst || false;
    options.selectOnly = options.selectOnly || false;
    options.maxItemsToShow = options.maxItemsToShow || 10;
    options.autoFill = options.autoFill || false;
    options.width = parseInt(options.width, 10) || 0;
    this.each(function () {
        var input = this;
        new jQuery.autocomplete(input, options);
    });
    return this;
}
jQuery.fn.autocompleteArray = function (data, options) {
    return this.autocomplete(null, options, data);
}
jQuery.fn.indexOf = function (e) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == e) return i;
    }
    return -1;
};

(function ($) {
    $.fn.jcarousel = function (o) {
        return this.each(function () {
            new $jc(this, o);
        });
    };
    var defaults = {
        vertical: false,
        start: 1,
        offset: 1,
        size: null,
        scroll: 3,
        visible: null,
        animation: 'normal',
        easing: 'swing',
        auto: 0,
        wrap: null,
        initCallback: null,
        reloadCallback: null,
        itemLoadCallback: null,
        itemFirstInCallback: null,
        itemFirstOutCallback: null,
        itemLastInCallback: null,
        itemLastOutCallback: null,
        itemVisibleInCallback: null,
        itemVisibleOutCallback: null,
        buttonNextHTML: '<div></div>',
        buttonPrevHTML: '<div></div>',
        buttonNextEvent: 'click',
        buttonPrevEvent: 'click',
        buttonNextCallback: null,
        buttonPrevCallback: null
    };
    $.jcarousel = function (e, o) {
        this.options = $.extend({}, defaults, o || {});
        this.locked = false;
        this.container = null;
        this.clip = null;
        this.list = null;
        this.buttonNext = null;
        this.buttonPrev = null;
        this.wh = !this.options.vertical ? 'width' : 'height';
        this.lt = !this.options.vertical ? 'left' : 'top';
        if (e.nodeName == 'UL' || e.nodeName == 'OL') {
            this.list = $(e);
            this.container = this.list.parent();
            if ($.className.has(this.container[0].className, 'jcarousel-clip')) {
                if (!$.className.has(this.container[0].parentNode.className, 'jcarousel-container')) this.container = this.container.wrap('<div></div>');
                this.container = this.container.parent();
            } else if (!$.className.has(this.container[0].className, 'jcarousel-container')) this.container = this.list.wrap('<div></div>').parent();
            var split = e.className.split(' ');
            for (var i = 0; i < split.length; i++) {
                if (split[i].indexOf('jcarousel-skin') != -1) {
                    this.list.removeClass(split[i]);
                    this.container.addClass(split[i]);
                    break;
                }
            }
        } else {
            this.container = $(e);
            this.list = $(e).children('ul,ol');
        }
        this.clip = this.list.parent();
        if (!this.clip.length || !$.className.has(this.clip[0].className, 'jcarousel-clip')) this.clip = this.list.wrap('<div></div>').parent();
        this.buttonPrev = $('.jcarousel-prev', this.container);
        if (this.buttonPrev.size() == 0 && this.options.buttonPrevHTML != null) this.buttonPrev = this.clip.before(this.options.buttonPrevHTML).prev();
        this.buttonPrev.addClass(this.className('jcarousel-prev'));
        this.buttonNext = $('.jcarousel-next', this.container);
        if (this.buttonNext.size() == 0 && this.options.buttonNextHTML != null) this.buttonNext = this.clip.before(this.options.buttonNextHTML).prev();
        this.buttonNext.addClass(this.className('jcarousel-next'));
        this.clip.addClass(this.className('jcarousel-clip'));
        this.list.addClass(this.className('jcarousel-list'));
        this.container.addClass(this.className('jcarousel-container'));
        var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
        var li = this.list.children('li');
        var self = this;
        if (li.size() > 0) {
            var wh = 0,
                i = this.options.offset;
            li.each(function () {
                    self.format(this, i++);
                    wh += self.dimension(this, di);
                });
            this.list.css(this.wh, wh + 'px');
            if (!o || o.size == undefined) this.options.size = li.size();
        }
        this.container.css('display', 'block');
        this.buttonNext.css('display', 'block');
        this.buttonPrev.css('display', 'block');
        this.funcNext = function () {
            self.next();
        };
        this.funcPrev = function () {
            self.prev();
        };
        $(window).bind('resize', function () {
            self.reload();
        });
        if (this.options.initCallback != null) this.options.initCallback(this, 'init');
        this.setup();
    };
    var $jc = $.jcarousel;
    $jc.fn = $jc.prototype = {
        jcarousel: '0.2.2'
    };
    $jc.fn.extend = $jc.extend = $.extend;
    $jc.fn.extend({
        setup: function () {
            this.first = null;
            this.last = null;
            this.prevFirst = null;
            this.prevLast = null;
            this.animating = false;
            this.timer = null;
            this.tail = null;
            this.inTail = false;
            if (this.locked) return;
            this.list.css(this.lt, this.pos(this.options.offset) + 'px');
            var p = this.pos(this.options.start);
            this.prevFirst = this.prevLast = null;
            this.animate(p, false);
        },
        reset: function () {
            this.list.empty();
            this.list.css(this.lt, '0px');
            this.list.css(this.wh, '0px');
            if (this.options.initCallback != null) this.options.initCallback(this, 'reset');
            this.setup();
        },
        reload: function () {
            if (this.tail != null && this.inTail) this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + this.tail);
            this.tail = null;
            this.inTail = false;
            if (this.options.reloadCallback != null) this.options.reloadCallback(this);
            if (this.options.visible != null) {
                var self = this;
                var di = Math.ceil(this.clipping() / this.options.visible),
                    wh = 0,
                    lt = 0;
                $('li', this.list).each(function (i) {
                        wh += self.dimension(this, di);
                        if (i + 1 < self.first) lt = wh;
                    });
                this.list.css(this.wh, wh + 'px');
                this.list.css(this.lt, -lt + 'px');
            }
            this.scroll(this.first, false);
        },
        lock: function () {
            this.locked = true;
            this.buttons();
        },
        unlock: function () {
            this.locked = false;
            this.buttons();
        },
        size: function (s) {
            if (s != undefined) {
                this.options.size = s;
                if (!this.locked) this.buttons();
            }
            return this.options.size;
        },
        has: function (i, i2) {
            if (i2 == undefined || !i2) i2 = i;
            for (var j = i; j <= i2; j++) {
                var e = this.get(j).get(0);
                if (!e || $.className.has(e, 'jcarousel-item-placeholder')) return false;
            }
            return true;
        },
        get: function (i) {
            return $('.jcarousel-item-' + i, this.list);
        },
        add: function (i, s) {
            var e = this.get(i),
                old = 0;
            if (e.length == 0) {
                    var c, e = this.create(i),
                        j = $jc.intval(i);
                    while (c = this.get(--j)) {
                            if (j <= 0 || c.length) {
                                j <= 0 ? this.list.prepend(e) : c.after(e);
                                break;
                            }
                        }
                } else old = this.dimension(e);
            e.removeClass(this.className('jcarousel-item-placeholder'));
            typeof s == 'string' ? e.html(s) : e.empty().append(s);
            var di = this.options.visible != null ? Math.ceil(this.clipping() / this.options.visible) : null;
            var wh = this.dimension(e, di) - old;
            if (i > 0 && i < this.first) this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + wh + 'px');
            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) + wh + 'px');
            return e;
        },
        remove: function (i) {
            var e = this.get(i);
            if (!e.length || (i >= this.first && i <= this.last)) return;
            var d = this.dimension(e);
            if (i < this.first) this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) + d + 'px');
            e.remove();
            this.list.css(this.wh, $jc.intval(this.list.css(this.wh)) - d + 'px');
        },
        next: function () {
            this.stopAuto();
            if (this.tail != null && !this.inTail) this.scrollTail(false);
            else this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'last') && this.options.size != null && this.last == this.options.size) ? 1 : this.first + this.options.scroll);
        },
        prev: function () {
            this.stopAuto();
            if (this.tail != null && this.inTail) this.scrollTail(true);
            else this.scroll(((this.options.wrap == 'both' || this.options.wrap == 'first') && this.options.size != null && this.first == 1) ? this.options.size : this.first - this.options.scroll);
        },
        scrollTail: function (b) {
            if (this.locked || this.animating || !this.tail) return;
            var pos = $jc.intval(this.list.css(this.lt));
            !b ? pos -= this.tail : pos += this.tail;
            this.inTail = !b;
            this.prevFirst = this.first;
            this.prevLast = this.last;
            this.animate(pos);
        },
        currentSelectedIndex: 1,
        currentSelectedIndex_callback: "",
        scroll: function (i, a, externallyCalled) {
            if (this.locked || this.animating) return;
            this.animate(this.pos(i), a);
            this.currentSelectedIndex = i;
            if (!externallyCalled) {
                eval(this.currentSelectedIndex_callback + "(" + this.currentSelectedIndex + ")");
            }
        },
        pos: function (i) {
            if (this.locked || this.animating) return;
            if (this.options.wrap != 'circular') i = i < 1 ? 1 : (this.options.size && i > this.options.size ? this.options.size : i);
            var back = this.first > i;
            var pos = $jc.intval(this.list.css(this.lt));
            var f = this.options.wrap != 'circular' && this.first <= 1 ? 1 : this.first;
            var c = back ? this.get(f) : this.get(this.last);
            var j = back ? f : f - 1;
            var e = null,
                l = 0,
                p = false,
                d = 0;
            while (back ? --j >= i : ++j < i) {
                    e = this.get(j);
                    p = !e.length;
                    if (e.length == 0) {
                        e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                        c[back ? 'before' : 'after'](e);
                    }
                    c = e;
                    d = this.dimension(e);
                    if (p) l += d;
                    if (this.first != null && (this.options.wrap == 'circular' || (j >= 1 && (this.options.size == null || j <= this.options.size)))) pos = back ? pos + d : pos - d;
                }
            var clipping = this.clipping();
            var cache = [];
            var visible = 0,
                j = i,
                v = 0;
            var c = this.get(i - 1);
            while (++visible) {
                    e = this.get(j);
                    p = !e.length;
                    if (e.length == 0) {
                        e = this.create(j).addClass(this.className('jcarousel-item-placeholder'));
                        c.length == 0 ? this.list.prepend(e) : c[back ? 'before' : 'after'](e);
                    }
                    c = e;
                    var d = this.dimension(e);
                    if (d == 0) {
                        return 0;
                    }
                    if (this.options.wrap != 'circular' && this.options.size !== null && j > this.options.size) cache.push(e);
                    else if (p) l += d;
                    v += d;
                    if (v >= clipping) break;
                    j++;
                }
            for (var x = 0; x < cache.length; x++) cache[x].remove();
            if (l > 0) {
                    this.list.css(this.wh, this.dimension(this.list) + l + 'px');
                    if (back) {
                        pos -= l;
                        this.list.css(this.lt, $jc.intval(this.list.css(this.lt)) - l + 'px');
                    }
                }
            var last = i + visible - 1;
            if (this.options.wrap != 'circular' && this.options.size && last > this.options.size) last = this.options.size;
            if (j > last) {
                    visible = 0,
                    j = last,
                    v = 0;
                    while (++visible) {
                        var e = this.get(j--);
                        if (!e.length) break;
                        v += this.dimension(e);
                        if (v >= clipping) break;
                    }
                }
            var first = last - visible + 1;
            if (this.options.wrap != 'circular' && first < 1) first = 1;
            if (this.inTail && back) {
                    pos += this.tail;
                    this.inTail = false;
                }
            this.tail = null;
            if (this.options.wrap != 'circular' && last == this.options.size && (last - visible + 1) >= 1) {
                    var m = $jc.margin(this.get(last), !this.options.vertical ? 'marginRight' : 'marginBottom');
                    if ((v - m) > clipping) this.tail = v - clipping - m;
                }
            while (i-- > first) pos += this.dimension(this.get(i));
            this.prevFirst = this.first;
            this.prevLast = this.last;
            this.first = first;
            this.last = last;
            return pos;
        },
        animate: function (p, a) {
            if (this.locked || this.animating) return;
            this.animating = true;
            var self = this;
            var scrolled = function () {
                self.animating = false;
                if (p == 0) self.list.css(self.lt, 0);
                if (self.options.wrap == 'both' || self.options.wrap == 'last' || self.options.size == null || self.last < self.options.size) self.startAuto();
                self.buttons();
                self.notify('onAfterAnimation');
            };
            this.notify('onBeforeAnimation');
            if (!this.options.animation || a == false) {
                this.list.css(this.lt, p + 'px');
                scrolled();
            } else {
                var o = !this.options.vertical ? {
                    'left': p
                } : {
                    'top': p
                };
                this.list.animate(o, this.options.animation, this.options.easing, scrolled);
            }
        },
        startAuto: function (s) {
            if (s != undefined) this.options.auto = s;
            if (this.options.auto == 0) return this.stopAuto();
            if (this.timer != null) return;
            var self = this;
            this.timer = setTimeout(function () {
                self.next();
            }, this.options.auto * 1000);
        },
        stopAuto: function () {
            if (this.timer == null) return;
            clearTimeout(this.timer);
            this.timer = null;
        },
        buttons: function (n, p) {
            if (n == undefined || n == null) {
                var n = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'first') || this.options.size == null || this.last < this.options.size);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'first') && this.options.size != null && this.last >= this.options.size) n = this.tail != null && !this.inTail;
            }
            if (p == undefined || p == null) {
                var p = !this.locked && this.options.size !== 0 && ((this.options.wrap && this.options.wrap != 'last') || this.first > 1);
                if (!this.locked && (!this.options.wrap || this.options.wrap == 'last') && this.options.size != null && this.first == 1) p = this.tail != null && this.inTail;
            }
            var self = this;
            this.buttonNext[n ? 'bind' : 'unbind'](this.options.buttonNextEvent, this.funcNext)[n ? 'removeClass' : 'addClass'](this.className('jcarousel-next-disabled')).attr('disabled', n ? false : true);
            this.buttonPrev[p ? 'bind' : 'unbind'](this.options.buttonPrevEvent, this.funcPrev)[p ? 'removeClass' : 'addClass'](this.className('jcarousel-prev-disabled')).attr('disabled', p ? false : true);
            if (this.buttonNext.length > 0 && (this.buttonNext[0].jcarouselstate == undefined || this.buttonNext[0].jcarouselstate != n) && this.options.buttonNextCallback != null) {
                this.buttonNext.each(function () {
                    self.options.buttonNextCallback(self, this, n);
                });
                this.buttonNext[0].jcarouselstate = n;
            }
            if (this.buttonPrev.length > 0 && (this.buttonPrev[0].jcarouselstate == undefined || this.buttonPrev[0].jcarouselstate != p) && this.options.buttonPrevCallback != null) {
                this.buttonPrev.each(function () {
                    self.options.buttonPrevCallback(self, this, p);
                });
                this.buttonPrev[0].jcarouselstate = p;
            }
        },
        notify: function (evt) {
            var state = this.prevFirst == null ? 'init' : (this.prevFirst < this.first ? 'next' : 'prev');
            this.callback('itemLoadCallback', evt, state);
            if (this.prevFirst != this.first) {
                this.callback('itemFirstInCallback', evt, state, this.first);
                this.callback('itemFirstOutCallback', evt, state, this.prevFirst);
            }
            if (this.prevLast != this.last) {
                this.callback('itemLastInCallback', evt, state, this.last);
                this.callback('itemLastOutCallback', evt, state, this.prevLast);
            }
            this.callback('itemVisibleInCallback', evt, state, this.first, this.last, this.prevFirst, this.prevLast);
            this.callback('itemVisibleOutCallback', evt, state, this.prevFirst, this.prevLast, this.first, this.last);
        },
        callback: function (cb, evt, state, i1, i2, i3, i4) {
            if (this.options[cb] == undefined || (typeof this.options[cb] != 'object' && evt != 'onAfterAnimation')) return;
            var callback = typeof this.options[cb] == 'object' ? this.options[cb][evt] : this.options[cb];
            if (!$.isFunction(callback)) return;
            var self = this;
            if (i1 === undefined) callback(self, state, evt);
            else if (i2 === undefined) this.get(i1).each(function () {
                callback(self, this, i1, state, evt);
            });
            else {
                for (var i = i1; i <= i2; i++) if (!(i >= i3 && i <= i4)) this.get(i).each(function () {
                    callback(self, this, i, state, evt);
                });
            }
        },
        create: function (i) {
            return this.format('<li></li>', i);
        },
        format: function (e, i) {
            var $e = $(e).addClass(this.className('jcarousel-item')).addClass(this.className('jcarousel-item-' + i));
            $e.attr('jcarouselindex', i);
            return $e;
        },
        className: function (c) {
            return c + ' ' + c + (!this.options.vertical ? '-horizontal' : '-vertical');
        },
        dimension: function (e, d) {
            var el = e.jquery != undefined ? e[0] : e;
            var old = !this.options.vertical ? el.offsetWidth + $jc.margin(el, 'marginLeft') + $jc.margin(el, 'marginRight') : el.offsetHeight + $jc.margin(el, 'marginTop') + $jc.margin(el, 'marginBottom');
            if (d == undefined || old == d) return old;
            var w = !this.options.vertical ? d - $jc.margin(el, 'marginLeft') - $jc.margin(el, 'marginRight') : d - $jc.margin(el, 'marginTop') - $jc.margin(el, 'marginBottom');
            $(el).css(this.wh, w + 'px');
            return this.dimension(el);
        },
        clipping: function () {
            return !this.options.vertical ? this.clip[0].offsetWidth - $jc.intval(this.clip.css('borderLeftWidth')) - $jc.intval(this.clip.css('borderRightWidth')) : this.clip[0].offsetHeight - $jc.intval(this.clip.css('borderTopWidth')) - $jc.intval(this.clip.css('borderBottomWidth'));
        },
        index: function (i, s) {
            if (s == undefined) s = this.options.size;
            return Math.round((((i - 1) / s) - Math.floor((i - 1) / s)) * s) + 1;
        }
    });
    $jc.extend({
        defaults: function (d) {
            $.extend(defaults, d);
        },
        margin: function (e, p) {
            if (!e) return 0;
            var el = e.jquery != undefined ? e[0] : e;
            if (p == 'marginRight' && $.browser.safari) {
                var old = {
                    'display': 'block',
                    'float': 'none',
                    'width': 'auto'
                },
                    oWidth, oWidth2;
                $.swap(el, old, function () {
                        oWidth = el.offsetWidth;
                    });
                old['marginRight'] = 0;
                $.swap(el, old, function () {
                        oWidth2 = el.offsetWidth;
                    });
                return oWidth2 - oWidth;
            }
            return $jc.intval($.css(el, p));
        },
        intval: function (v) {
            v = parseInt(v);
            return isNaN(v) ? 0 : v;
        }
    });
})(jQuery);
/*
 * jQuery UI Accordion
 * 
 * Copyright (c) 2007 Joern Zaefferer
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.accordion.js 5048 2008-03-17 09:23:12Z joern.zaefferer $
 *
 */

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

jQuery.easing['jswing'] = jQuery.easing['swing'];
jQuery.extend(jQuery.easing, {
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});

/*
 * Tabs 3 - New Wave Tabs
 *
 * Copyright (c) 2007 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */

if (typeof(SNI) == "undefined") {
    var SNI = {};
}


SNI.MetaData = {};
SNI.MetaData.Parameter = function () {
    var parameters = {};
    this.addParameter = function (key, value) {
        key = key.toUpperCase();
        if (!parameters[key]) {
            parameters[key] = [];
        }
        parameters[key].push(value);
    };
    this.getParameter = function (key, separator) {
        key = key.toUpperCase();
        if (!parameters[key]) {
            return;
        }
        return parameters[key].join(separator);
    };
    this.getKeys = function () {
        return parameters;
    };
    this.setParameter = function (key, value) {
        key = key.toUpperCase();
        parameters[key] = [];
        parameters[key].push(value);
    };
};
SNI.MetaData.Manager = function () {
    var m = new SNI.MetaData.Parameter();
    this.addParameter = m.addParameter;
    this.getParameter = m.getParameter;
    this.getKeys = m.getKeys;
    this.setParameter = m.setParameter;
    this.getParameterString = function (key) {
        var s = this.getParameter(key, " ");
        if (s == null) {
            s = "";
        }
        return s;
    };
    this.getPageType = function () {
        return this.getParameterString("Type");
    };
    this.getPageTitle = function () {
        return this.getParameterString("Title");
    };
    this.getSite = function () {
        return this.getParameterString("Site");
    };
    this.getSctnId = function () {
        return this.getParameterString("SctnId");
    };
    this.getSponsorship = function () {
        return this.getParameterString("Sponsorship");
    };
    this.getAbstract = function () {
        return this.getParameterString("Abstract");
    };
    this.getKeywords = function () {
        return this.getParameterString("Keywords");
    };
    this.getClassification = function () {
        return this.getParameterString("Classification");
    };
    this.getSctnDspName = function () {
        return this.getParameterString("SctnDspName");
    };
    this.getCategoryDspName = function () {
        return this.getParameterString("CategoryDspName");
    };
    this.getShowAbbr = function () {
        return this.getParameterString("Show_Abbr");
    };
    this.getRole = function () {
        return this.getParameterString("Role");
    };
    this.getDetailId = function () {
        return this.getParameterString("DetailId");
    };
    this.getPageNumber = function () {
        return this.getParameterString("PageNumber");
    };
    this.getUniqueId = function () {
        return this.getParameterString("UniqueId");
    };
    this.getUserId = function () {
        return this.getParameterString("UserId");
    };
    this.getUserIdEmail = function () {
        return this.getParameterString("UserIdEmail");
    };
    this.getUserIdCreateDt = function () {
        return this.getParameterString("UserIdCreateDt");
    };
    this.getUserIdVersion = function () {
        return this.getParameterString("UserIdVersion");
    };
    this.getFilters = function () {
        return this.getParameterString("Filters");
    };
    this.getMultimediaFlag = function () {
        return this.getParameterString("MultimediaFlag");
    };
    this.getChefName = function () {
        return this.getParameterString("ChefName");
    };
    this.getMealPart = function () {
        return this.getParameterString("MealPart");
    };
    this.getCuisine = function () {
        return this.getParameterString("Cuisine");
    };
    this.getOccasion = function () {
        return this.getParameterString("Occasion", " ");
    };
    this.getMainIngredient = function () {
        return this.getParameterString("MainIngredient");
    };
    this.getTechnique = function () {
        return this.getParameterString("Technique", " ");
    };
    this.getDish = function () {
        return this.getParameterString("Dish", " ");
    };
    this.getMealType = function () {
        return this.getParameterString("MealType", " ");
    };
    this.getNutrition = function () {
        return this.getParameterString("Nutrition", " ");
    };
    this.getDifficulty = function () {
        return this.getParameterString("Difficulty", " ");
    };
    this.getSearchTerm = function () {
        var args = parseQueryString();
        for (var arg in args) {
            var s = arg.toUpperCase();
            if (s == 'SEARCHSTRING') {
                return args[arg];
            }
        }
        return "";
    };
    this.setMultimediaFlag = function (flag) {
        if (flag != null) {
            this.addParameter("MultimediaFlag", flag);
        } else {
            this.addParameter("MultimediaFlag", "");
        }
    };
    this.parseQueryString = function (str) {
        str = str ? str : document.location.search;
        var query = str.charAt(0) == '?' ? str.substring(1) : str;
        var args = {};
        if (query) {
            var fields = query.split('&');
            for (var f = 0; f < fields.length; f++) {
                var field = fields[f].split('=');
                args[unescape(field[0].replace(/\+/g, ' '))] = unescape(field[1].replace(/\+/g, ' '));
            }
        }
        return args;
    };
};
var MetaDataManager = SNI.MetaData.Manager;
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/, '');
};
if (typeof(SNI.UR) == 'undefined') {
    SNI.UR = {};
}
var userIdCookieUserId;
var userIdEmail;
var userIdCookieCreateDt;
var userIdCookieVersion;
SNI.UR.IdCookie = function () {
    this.id = "";
    this.email = "";
    this.createDate = new Date();
    this.version = "2.0";
    this.domain = getPrimaryDomain();
    this.secure = "";
    this.path = "/";
    this.cookieName = 'userIdCookie';
    this.expirationDate = new Date(new Date().getTime() + (10000 * 1000 * 60 * 60 * 24));

    function getCookieKeyValue(cookie_value, key, delimeter) {
        if (cookie_value != null) {
            var keystring = key + delimeter;
            var thiscookie_start = cookie_value.indexOf(keystring) + keystring.length;
            var thiscookie_end = cookie_value.indexOf(delimeter, thiscookie_start);
            var keyvalue = cookie_value.substring(thiscookie_start, thiscookie_end);
            return keyvalue;
        }
        return null;
    }

    function getPrimaryDomain() {
        var theUrl = document.domain;
        var urlLength = theUrl.length;
        var firstDot = theUrl.lastIndexOf(".");
        var secondDot = theUrl.lastIndexOf(".", firstDot - 1);
        var primaryDomain = theUrl.substr(secondDot);
        return primaryDomain;
    }

    function getRandNumber(numDigits) {
        var randNum = "";
        var thisDigit = "";
        for (var i = 0; i < numDigits; i++) {
            thisDigit = Math.floor(Math.random() * 10);
            randNum = randNum + thisDigit;
        }
        return randNum;
    }

    function setGlobalValues() {
        userIdCookieUserId = this.id;
        userIdEmail = this.email;
        userIdCookieCreateDt = this.createDate;
        userIdCookieVersion = this.version;
    }
    this.createCookie = function (cookies, user) {
        var updtCookie = false;
        if (cookies['userIdCookie'] != undefined) {
            this.id = getCookieKeyValue(cookies['userIdCookie'], 'userId', 'ZZ');
            this.email = getCookieKeyValue(cookies['userIdCookie'], 'email', 'ZZ');
            this.createDate = getCookieKeyValue(cookies['userIdCookie'], 'createDate', 'ZZ');
            this.version = getCookieKeyValue(cookies['userIdCookie'], 'cookieVersion', 'ZZ');
        }
        if (user.isLoggedIn) {
            if (this.id != user.getUserId()) {
                this.id = user.getUserId();
                updtCookie = true;
            }
            if (this.email != user.getEmail()) {
                this.email = user.getEmail();
                updtCookie = true;
            }
        }
        if (this.id == "") {
            this.id = getRandNumber(10);
            updtCookie = true;
        }
        setGlobalValues();
        if (updtCookie) {
            this.writeCookie();
        }
    };
    this.writeCookie = function () {
        var cookieValue = 'userIdZZ' + this.id + 'ZZemailZZ' + this.email + 'ZZcreateDateZZ' + this.createDate + 'ZZcookieVersionZZ' + this.version + 'ZZ';
        document.cookie = this.cookieName + "=" + escape(cookieValue) + ((this.expirationDate) ? ";expires=" + this.expirationDate.toGMTString() : "") + ((this.path) ? ";path=" + this.path : "") + ((this.domain) ? ";domain=" + this.domain : "") + ((this.secure) ? ";secure=" : "");
    };
};
SNI.UR.ApplicationConfig = function () {
    this.applicationName = "";
    this.applicationCode = "";
    this.applicationEntryPage = "";
    this.applicationPath = "";
    this.loginServer = {
        "DEV": "",
        "STAGE": "",
        "PROD": ""
    };
    this.requiredRoles = [];
    this.requiresLogin = false;
    this.getLoginServer = function (env) {
        if (this.loginServer[env]) {
            return this.loginServer[env];
        }
        return null;
    };
    this.addRole = function (role) {
        this.requiredRoles.push(role);
    };
    this.urVersion = function () {
        return 1;
    };
};
SNI.UR.ApplicationRole = function (name, date) {
    this.name = name;
    this.date = date;
};
UrCookie = SNI.UR.UrCookie = function () {
    this.info = [];
    this.clear = this.clearInfo = function () {
        for (var i = 0; i < this.info.length; i++) {
            delete this.info[i];
        }
        this.info = [];
    };
    this.parse = this.parseCookie = function (cookie) {
        var cookieArray = cookie.split("|");
        for (var i = 0; i < cookieArray.length; i++) {
            var chips = cookieArray[i].split(":");
            this.info[chips[0]] = chips[1];
        }
    };
};
SNI.UR.ValueCookie = function () {
    this.info = new SNI.UR.UrCookie();
    this.clear = this.clearInfo = this.info.clear;
    this.parse = this.parseCookie = this.info.parse;
    this.getEmail = function () {
        return this.info['email'];
    };
    this.getBirthYear = function () {
        return this.info['birth_year'];
    };
    this.getCity = function () {
        return this.info['city'];
    };
    this.getConfirm = function () {
        return this.info['confirm'];
    };
    this.getFirstName = function () {
        return this.info['first_name'];
    };
    this.getGender = function () {
        return this.info['gender'];
    };
    this.getLastName = function () {
        return this.info['last_name'];
    };
    this.getParentEmail = function () {
        return this.info['parent_email'];
    };
    this.getPersist = function () {
        return this.info['persist'];
    };
    this.getPhone = function () {
        return this.info['phone'];
    };
    this.getPostalCode = function () {
        return this.info['postal_code'];
    };
    this.getStatus = function () {
        return this.info['status'];
    };
    this.getTransComplete = function () {
        return this.info['transcomplete'];
    };
    this.getUserId = function () {
        return this.info['user_id'];
    };
    this.getUserName = function () {
        return this.info['user_name'];
    };
    this.getUserType = function () {
        return this.info['usertype'];
    };
};
SNI.UR.RoleCookie = function () {
    this.info = new SNI.UR.UrCookie();
    this.clear = this.clearInfo = this.info.clear;
    this.parse = this.parseCookie = this.info.parse;
    this.getRoleByName = function (name) {
        return this.info[name];
    };
};
SNI.UR.UrLite = function () {
    function getPrimaryDomain() {
        var theUrl = document.domain;
        var urlLength = theUrl.length;
        var firstDot = theUrl.lastIndexOf(".");
        var secondDot = theUrl.lastIndexOf(".", firstDot - 1);
        var primaryDomain = theUrl.substr(secondDot);
        return primaryDomain;
    }
    this.login = function (urUser, applicationConfig) {
        var cookies = this.loadCookies();
        if (cookies['value']) {
            urUser.vignetteValueCookie.parse(cookies['value']);
        }
        if (cookies['UserLoginCookie']) {
            urUser.valueCookie.parse(cookies['UserLoginCookie']);
        }
        if (urUser.getUserId() == null || urUser.getUserId() < 0) {
            if (applicationConfig.requiresLogin == true) {
                writeIdCookie(cookies, urUser);
                this.redirectToUr(urUser, applicationConfig);
            }
        } else {
            urUser.isLoggedIn = true;
        }
        this.writeIdCookie(cookies, urUser);
        if (cookies['UserRoleCookie']) {
            urUser.roleCookie.parse(cookies['UserRoleCookie']);
        }
        if (cookies['role']) {
            urUser.vignetteRoleCookie.parse(cookies['role']);
        }
        if (applicationConfig.requiredRoles != null && applicationConfig.requiredRoles.length > 0 && applicationConfig.requiresLogin == true) {
            for (var i = 0; i < applicationConfig.requiredRoles.length; i++) {
                if (urUser.hasRoleByName(applicationConfig.requiredRoles[i]) == false) {
                    this.redirectToUr(urUser, applicationConfig);
                }
            }
        }
    };
    this.logout = function (urUser, applicationConfig) {
        var domain = getPrimaryDomain();
        this.deleteLoginCookie("value", "/", domain);
        this.deleteLoginCookie("role", "/", domain);
        this.deleteLoginCookie("userLoginCookie", "/", domain);
        this.deleteLoginCookie("userRoleCookie", "/", domain);
        urUser.valueCookie.clear();
        urUser.roleCookie.clear();
        urUser.vignetteValueCookie.clear();
        urUser.vignetteRoleCookie.clear();
        urUser.isLoggedIn = false;
    };
    this.deleteLoginCookie = function (name, path, domain) {
        document.cookie = name + "=" + "; path=" + path + "; domain=" + domain + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    };
    this.getEnvironment = function () {
        switch (document.location.hostname) {
        case "localhost":
        case "127.0.0.1":
        case "vdev2.scrippsnetworks.com":
            return "DEV";
        case "staging.scrippsweb.com":
            return "STAGE";
        default:
            return "PROD";
        }
    };
    this.redirectToUr = function (urUser, applicationConfig) {
        window.location = this.getLoginPath(applicationConfig);
    };
    this.getLoginPath = function (applicationConfig) {
        var loginPath;
        if (applicationConfig.urVersion() == "1") {
            loginPath = applicationConfig.loginServer[this.getEnvironment()] + applicationConfig.applicationPath + '?a=fflogin&url=' + escape(applicationConfig.applicationEntryPage) + '&an=' + escape(applicationConfig.applicationName) + '&ac=' + escape(applicationConfig.applicationCode);
        } else {
            loginPath = applicationConfig.loginServer[this.getEnvironment()] + applicationConfig.applicationPath + 'urValidation.html?applicationId=' + applicationConfig.applicationCode;
        }
        return loginPath;
    };
    this.loadCookies = function () {
        var cookies = [];
        if (document.cookie != '') {
            var cookieArray = document.cookie.split(';');
            for (var i = 0; i < cookieArray.length; i++) {
                var cookiesValues = cookieArray[i].split('=');
                cookies[cookiesValues[0].trim()] = cookiesValues[1];
            }
        }
        return cookies;
    };
    this.writeIdCookie = function (cookies, user) {
        var id = new SNI.UR.IdCookie();
        id.createCookie(cookies, user);
    };
};
SNI.UR.UrUser = function (appConfig) {
    this.valueCookie = new SNI.UR.ValueCookie();
    this.roleCookie = new SNI.UR.RoleCookie();
    this.vignetteValueCookie = new VignetteValueCookie();
    this.vignetteRoleCookie = new VignetteRoleCookie();
    this.applicationConfig = appConfig;
    this.urLite = new SNI.UR.UrLite();
    this.isLoggedIn = false;
    this.getBirthYear = function () {
        if (this.valueCookie.getBirthYear() != null) {
            return this.valueCookie.getBirthYear();
        }
        if (this.vignetteValueCookie.getBirthYear() != null) {
            return this.vignetteValueCookie.getBirthYear();
        }
    };
    this.getCity = function () {
        if (this.valueCookie.getCity() != null) {
            return this.valueCookie.getCity();
        }
        if (this.vignetteValueCookie.getCity() != null) {
            return this.vignetteValueCookie.getCity();
        }
    };
    this.getConfirm = function () {
        if (this.valueCookie.getConfirm() != null) {
            return this.valueCookie.getConfirm();
        }
        if (this.vignetteValueCookie.getConfirm() != null) {
            return this.vignetteValueCookie.getConfirm();
        }
    };
    this.getEmail = function () {
        if (this.valueCookie.getEmail() != null) {
            return this.valueCookie.getEmail();
        }
        if (this.vignetteValueCookie.getEmail() != null) {
            return this.vignetteValueCookie.getEmail();
        }
    };
    this.getFirstName = function () {
        if (this.valueCookie.getFirstName() != null) {
            return this.valueCookie.getFirstName();
        }
        if (this.vignetteValueCookie.getFirstName() != null) {
            return this.vignetteValueCookie.getFirstName();
        }
    };
    this.getFullName = function () {
        return this.getFirstName() + ' ' + this.getLastName();
    };
    this.getGender = function () {
        if (this.valueCookie.getGender() != null) {
            return this.valueCookie.getGender();
        }
        if (this.vignetteValueCookie.getGender() != null) {
            return this.vignetteValueCookie.getGender();
        }
    };
    this.getLastName = function () {
        if (this.valueCookie.getLastName() != null) {
            return this.valueCookie.getLastName();
        }
        if (this.vignetteValueCookie.getLastName() != null) {
            return this.vignetteValueCookie.getLastName();
        }
    };
    this.getParentEmail = function () {
        if (this.valueCookie.getParentEmail() != null) {
            return this.valueCookie.getParentEmail();
        }
        if (this.vignetteValueCookie.getParentEmail() != null) {
            return this.vignetteValueCookie.getParentEmail();
        }
    };
    this.getPersist = function () {
        if (this.valueCookie.getPersist() != null) {
            return this.valueCookie.getPersist();
        }
        if (this.vignetteValueCookie.getPersist() != null) {
            return this.vignetteValueCookie.getPersist();
        }
    };
    this.getPhone = function () {
        if (this.valueCookie.getPhone() != null) {
            return this.valueCookie.getPhone();
        }
        if (this.vignetteValueCookie.getPhone() != null) {
            return this.vignetteValueCookie.getPhone();
        }
    };
    this.getPostalCode = function () {
        if (this.valueCookie.getPostalCode() != null) {
            return this.valueCookie.getPostalCode();
        }
        if (this.vignetteValueCookie.getPostalCode() != null) {
            return this.vignetteValueCookie.getPostalCode();
        }
    };
    this.getStatus = function () {
        if (this.valueCookie.getStatus() != null) {
            return this.valueCookie.getStatus();
        }
        if (this.vignetteValueCookie.getStatus() != null) {
            return this.vignetteValueCookie.getStatus();
        }
    };
    this.getTransComplete = function () {
        if (this.valueCookie.getTransComplete() != null) {
            return this.valueCookie.getTransComplete();
        }
        if (this.vignetteValueCookie.getTransComplete() != null) {
            return this.vignetteValueCookie.getTransComplete();
        }
    };
    this.getUserId = function () {
        if (this.valueCookie.getUserId() != null) {
            return this.valueCookie.getUserId();
        }
        if (this.vignetteValueCookie.getUserId() != null) {
            return this.vignetteValueCookie.getUserId();
        }
    };
    this.getUserName = function () {
        if (this.valueCookie.getUserName() != null) {
            return this.valueCookie.getUserName();
        }
        if (this.vignetteValueCookie.getUserName() != null) {
            return this.vignetteValueCookie.getUserName();
        }
    };
    this.getUserType = function () {
        if (this.valueCookie.getUserId() != null) {
            return this.valueCookie.getUserId();
        }
        if (this.vignetteValueCookie.getUserType() != null) {
            return this.vignetteValueCookie.getUserType();
        }
    };
    this.hasRole = function (role) {
        if (this.roleCookie.getRoleByName(role.name) != null) {
            if (this.roleCookie.getRoleByName(role.name) >= role.date) {
                return true;
            }
            return false;
        }
        if (this.vignetteRoleCookie.getRoleByName(role.name) != null) {
            return true;
        }
        return false;
    };
    this.hasRoleById = function (roleId) {
        if (this.vignetteRoleCookie.getRoleById(roleId) != null) {
            return true;
        }
        return false;
    };
    this.logout = function () {
        if (this.isLoggedIn) {
            this.urLite.logout(this, this.applicationConfig);
        }
    };
    this.urLite.login(this, appConfig);
};
SNI.UR.VignetteCookie = function () {
    this.info = [];
    this.parse = parseCookie;
    this.parseCookie = parseCookie;
    this.parseSingleValueChip = parseSingleValueChip;
    this.parseMultiValueChip = parseMultiValueChip;
    this.cookieName = "";
    this.cookiePath = "/";
    this.cookieDomain = "";
    this.clear = clearInfo;

    function clearInfo() {
        for (var i = 0; i < this.info.length; i++) {
            delete this.info[i];
        }
        this.info = [];
    }

    function stripHeader(string) {
        return string.substring(23);
    }

    function stripTrailer(string) {
        return string.substring(0, string.length - 3);
    }

    function parseCookie(cookie) {
        cookie = stripHeader(cookie);
        cookie = stripTrailer(cookie);
        var cookieArray = cookie.split("ZZ%");
        for (var i = 0; i < cookieArray.length; ++i) {
            chip = cookieArray[i];
            chip = chip.substring(6);
            if (chip.substring(0, 1) == "s") {
                chip = chip.substring(1);
            } else {
                chip = chip.substring(3);
            }
            if (chip.match("\\+") == '+') {
                this.parseMultiValueChip(chip);
            } else {
                this.parseSingleValueChip(chip);
            }
        }
    }

    function parseSingleValueChip(chip) {
        chip = URLDecode(chip);
        var values = chip.split("ZZ");
        if (values.length < 2) {
            this.info[values[0]] = "";
        } else {
            this.info[values[0]] = values[1];
        }
    }

    function parseMultiValueChip(chip) {
        var multivalue = [];
        chip = URLDecode(chip);
        var key = chip.split("ZZ")[0];
        chip = chip.substring(key.length);
        chip = chip.replace(/ZZZZ/g, "ZZ");
        var chips = chip.split("+");
        for (var i = 0; i < chips.length; ++i) {
            part = chips[i];
            var parts = part.split("ZZ");
            multivalue[parts[1]] = parts[2];
        }
        this.info[key] = multivalue;
    }

    function URLDecode(encodedString) {
        var output = encodedString;
        var binVal, thisString;
        var myregexp = /(%.{2})/;
        while ((match = myregexp.exec(output)) != null && match.length > 1 && match[1] != '') {
            binVal = parseInt(match[1].substr(1), 16);
            thisString = String.fromCharCode(binVal);
            output = output.replace(match[1], thisString);
        }
        return output;
    }
};
VignetteValueCookie.prototype = new SNI.UR.VignetteCookie();

function VignetteValueCookie() {
    VignetteValueCookie.prototype = new SNI.UR.VignetteCookie();
    this.getEmail = function () {
        return this.info['email'];
    };
    this.getBirthYear = function () {
        return this.info['birth_year'];
    };
    this.getCity = function () {
        return this.info['city'];
    };
    this.getConfirm = function () {
        return this.info['confirm'];
    };
    this.getFirstName = function () {
        return this.info['first_name'];
    };
    this.getGender = function () {
        return this.info['gender'];
    };
    this.getLastName = function () {
        return this.info['last_name'];
    };
    this.getParentEmail = function () {
        return this.info['parent_email'];
    };
    this.getPersist = function () {
        return this.info['persist'];
    };
    this.getPhone = function () {
        return this.info['phone'];
    };
    this.getPostalCode = function () {
        return this.info['postal_code'];
    };
    this.getStatus = function () {
        return this.info['status'];
    };
    this.getTransComplete = function () {
        return this.info['transcomplete'];
    };
    this.getUserId = function () {
        return this.info['user_id'];
    };
    this.getUserName = function () {
        return this.info['user_name'];
    };
    this.getUserType = function () {
        return this.info['usertype'];
    };
}
VignetteRoleCookie.prototype = new SNI.UR.VignetteCookie();

function VignetteRoleCookie() {
    VignetteRoleCookie.prototype = new SNI.UR.VignetteCookie();
    this.getPersist = function () {
        return this.info['persist'];
    };
    this.getUserId = function () {
        return this.info['user_id'];
    };
    this.getRoleByName = function (name) {
        if (this.info['roles'] != undefined) {
            for (var i = 0; i < this.info['roles'].length; i++) {
                if (this.info['roles'][i] != undefined && this.info['roles'][i] == name) {
                    return this.info['roles'][i];
                }
            }
        }
    };
    this.getRoleById = function (id) {
        if (this.info['roles'] != undefined) return this.info['roles'][id];
    };
}
if (typeof(SNI.Ads) == 'undefined') {
    SNI.Ads = {
        _adServerHostname: "adsremote.scrippsnetworks.com"
    };
}
SNI.Ads.Url = function () {
    var p = new SNI.MetaData.Parameter();
    this.addParameter = p.addParameter;
    this.getParameter = p.getParameter;
    this.getKeys = p.getKeys;
    this.url = '';
    this.buildUrl = buildUrl;
    this.buildExpandedUrl = buildExpandedUrl;
    this.setUrl = setUrl;
    this.getUrl = getUrl;
    this.buildQueryStringValuePairs = buildQueryStringValuePairs;
    this.buildExpandedQueryStringValuePairs = buildExpandedQueryStringValuePairs;

    function setUrl(u) {
        this.url = u;
    }

    function getUrl() {
        return this.url;
    }

    function buildQueryStringValuePairs() {
        var queryString = "";
        for (key in this.getKeys()) {
            if (queryString !== "") {
                queryString += '&';
            }
            queryString += key + '=' + this.getParameter(key, ',');
        }
        return queryString;
    }

    function buildUrl() {
        return this.getUrl() + this.buildQueryStringValuePairs();
    }

    function buildExpandedQueryStringValuePairs() {
        var queryString = "";
        for (key in this.getKeys()) {
            var item = this.getParameter(key, ",");
            var iArray = item.split(",");
            for (i = 0; i < iArray.length; i++) {
                if (queryString !== "" && iArray[i] !== "" && iArray[i] !== undefined) {
                    queryString += '&';
                }
                if (iArray[i] !== "" && iArray[i] !== undefined) {
                    queryString += key + '=' + iArray[i];
                }
            }
        }
        return queryString;
    }

    function buildExpandedUrl() {
        var sJitterbug = "";
        if (window.location.hostname.indexOf("jitterbug") != (-1)) {
            sJitterbug = "&domain=jitterbug";
        }
        var sRSI = "";
        if ((SNI.Ads.UseRSI) && (segQS.length > 0)) {
            sRSI = segQS;
        }
        return this.getUrl() + this.buildExpandedQueryStringValuePairs() + sJitterbug + sRSI;
    }
};
Ad.prototype = new SNI.Ads.Url();

function Ad() {
    var url = new SNI.Ads.Url();
    this.addParameter = url.addParameter;
    this.getParameter = url.getParameter;
    this.getKeys = url.getKeys;
    this.buildUrl = url.buildUrl;
    this.buildExpandedUrl = url.buildExpandedUrl;
    var feature = new SNI.MetaData.Parameter();
    this.useFeature = useFeature;
    this.getFeature = getFeature;
    this.debug = debug;
    this.write = write;
    this.deferrable = 1;

    function useFeature(key) {
        feature.addParameter(key, "T");
    }

    function getFeature(key) {
        return feature.getParameter(key, ",");
    }

    function debug() {
        document.write('<div style="background:red;color:white;">' + this.buildExpandedUrl() + '</div>');
    }

    function write() {}
}
DartAd.prototype = new Ad();

function DartAd() {
    DartAd.prototype = new Ad();
    this.write = write;
    this.useFeature("site");
    this.useFeature("category");
    this.useFeature("vgncontent");
    this.useFeature("ord");
    this.useFeature("topic");
    this.useFeature("tile");
    this.useFeature("pagetype");
    this.useFeature("SECTION_ID");
    this.useFeature("SUBSECTION");
    this.useFeature("page");
    this.useFeature("uniqueid");
    this.useFeature("adkey1");
    this.useFeature("adkey2");
    this.useFeature("chef");
    this.useFeature("show");
    this.useFeature("delvfrmt");
    this.useFeature("source");
    this.useFeature("filter");
    this.useFeature("difficulty");
    this.useFeature("cuisine");
    this.useFeature("ingredient");
    this.useFeature("occasion");
    this.useFeature("mealpart");
    this.useFeature("technique");
    this.adClass = "AD_CLASS";

    function write() {
        if (navigator.userAgent.indexOf("#sni-loadtest#") !== -1) {
            return;
        }
        document.write('<script type="text/javascript" src="' + this.buildExpandedUrl() + '"></script>');
    }
}
AdUrl.prototype = new Ad();

function AdUrl() {
    AdUrl.prototype = new Ad();
    this.write = write;
    this.useFeature("site");
    this.useFeature("category");
    this.useFeature("vgncontent");
    this.useFeature("ord");
    this.useFeature("topic");
    this.useFeature("tile");
    this.useFeature("pagetype");
    this.useFeature("SECTION_ID");
    this.useFeature("SUBSECTION");
    this.useFeature("page");
    this.useFeature("uniqueid");
    this.useFeature("SearchKeywords");
    this.useFeature("SearchFilters");
    this.useFeature("adkey1");
    this.useFeature("adkey2");
    this.useFeature("chef");
    this.useFeature("show");
    this.useFeature("delvfrmt");
    this.useFeature("source");
    this.useFeature("filter");
    this.useFeature("difficulty");
    this.useFeature("cuisine");
    this.useFeature("ingredient");
    this.useFeature("occasion");
    this.useFeature("mealpart");
    this.useFeature("technique");

    function write() {}
}
DartAdvanceAd.prototype = new DartAd();

function DartAdvanceAd() {
    DartAdvanceAd.prototype = new DartAd();
    this.write = write;
    this.align = '';
    this.frameborder = 0;
    this.height = '';
    this.longdesc = '';
    this.marginheight = 0;
    this.marginwidth = 0;
    this.name = '';
    this.scrolling = 'no';
    this.width = '100%';
    this.useIframe = false;

    function write() {
        if (navigator.userAgent.indexOf("#sni-loadtest#") !== -1) {
            return;
        }
        if (this.useIframe == false) {
            this.setUrl("http://" + SNI.Ads._adServerHostname + "/js.ng/");
            document.write('<script type="text/javascript" src="' + this.buildExpandedUrl() + '"></script>');
        } else {
            this.setUrl("http://" + SNI.Ads._adServerHostname + "/html.ng/");
            document.write('<iframe src ="' + this.buildExpandedUrl() + '" align ="' + this.align + '" frameborder ="' + this.frameborder + '" height ="' + this.height + '" longdesc ="' + this.longdesc + '" marginheight ="' + this.marginheight + '" marginwidth ="' + this.marginwidth + '" name ="' + this.name + '" scrolling ="' + this.scrolling + '" width ="' + this.width + '"></iframe>');
        }
    }
}

function AdManager() {
    var p = new SNI.MetaData.Parameter();
    this.addParameter = p.addParameter;
    this.getParameter = p.getParameter;
    this.getKeys = p.getKeys;
    this.createAd = createAd;
    this.createDeferredAd = createDeferredAd;
    this.moveAds = moveAds;
    this.ads = [];
    this.defer = false;
    if (document.deferAds !== null && document.deferAds == 1 && document.deferEnabled !== null && document.deferEnabled == 1) {
        this.defer = true;
    }

    function createAd(ad) {
        for (key in this.getKeys()) {
            if (ad.getFeature(key) !== undefined) {
                ad.addParameter(key, this.getParameter(key, ','));
            }
        }
        if (document.debug == 1) {
            ad.debug();
        }
        ad.write();
    }

    function createDeferredAd(i) {}

    function moveAds() {}
}

function AdRestriction() {
    var p = new SNI.MetaData.Parameter();
    this.addParameter = p.addParameter;
    this.getParameter = p.getParameter;
    this.getKeys = p.getKeys;
    this.isActive = true;
    this.isIframe = false;
}

function AdDefault() {
    var p = new SNI.MetaData.Parameter();
    this.addParameter = p.addParameter;
    this.getParameter = p.getParameter;
    this.getKeys = p.getKeys;
    this.display = false;
}

function AdRestrictionManager() {
    this.restriction = [];
    this.adDefaults = [];
    this.isActive = isActive;
    this.isIframe = isIframe;
    this.isMatch = isMatch;
    this.startMatch = startMatch;

    function isActive(ad, mdm) {
        var value = false;
        var adDefaultMatch = false;
        var defaultReturnValue = true;
        for (var i = 0; i < this.adDefaults.length; i++) {
            adDefaultMatch = this.startMatch(ad, mdm, this.adDefaults[i]);
            if (adDefaultMatch == true) {
                defaultReturnValue = this.adDefaults[i].display;
                break;
            }
        }
        for (var i = 0; i < this.restriction.length; i++) {
            adRestriction = this.restriction[i];
            if (!adRestriction.isActive) {
                value = this.startMatch(ad, mdm, adRestriction);
            }
            if (value == true) {
                return !defaultReturnValue;
            }
        }
        return defaultReturnValue;
    }

    function isIframe(ad, mdm) {
        var value = false;
        for (var i = 0; i < this.restriction.length; i++) {
            adRestriction = this.restriction[i];
            if (adRestriction.isIframe) {
                value = this.startMatch(ad, mdm, adRestriction);
            }
        }
        return value;
    }

    function startMatch(ad, mdm, adRestriction) {
        var match = true;
        for (var key in adRestriction.getKeys()) {
            var restrictions = adRestriction.getParameter(key, ',');
            var value = mdm.getParameter(key, '----');
            match = this.isMatch(value, restrictions);
            if (!match) {
                value = ad.getParameter(key, '----');
                match = this.isMatch(value, restrictions);
            }
            if (!match) {
                return false;
            }
        }
        return match;
    }

    function isMatch(value, restrictions) {
        var match = false;
        if (value) {
            splitValue = value.split('----');
            for (var x = 0; x < splitValue.length; x++) {
                if (restrictions == splitValue[x]) {
                    match = true;
                }
                for (var a; a < restrictions.length; a++) {
                    if (splitValue[x] == restrictions[a]) {
                        return true;
                    }
                }
            }
        }
        return match;
    }
}

function initAdManager(adm, mdm) {
    function admAppendParam(key, val) {
        if (val != "") {
            val = val.replace(/-/g, "_");
            val = val.replace(/ /g, "_");
            s = val.split(',', 1);
            adm.addParameter(key, s);
        }
    }
    var ranNum = String(Math.round(Math.random() * 10000000000));
    var now = new Date();
    var ad_ord = now.getTime() % 10000000000;
    var amPageType = mdm.getPageType();
    var amSponsorship = mdm.getSponsorship();
    var amKeywords = mdm.getKeywords();
    amPageType = amPageType.replace(/-/g, "_");
    var amUniqueId = mdm.getUniqueId();
    amUniqueId = amUniqueId.replace(/-/g, "_");
    if (amSponsorship !== "" && amSponsorship !== undefined) {
        amSponsorship = amSponsorship.replace(/-/g, "_");
        amSponsorship = amSponsorship.replace(/ /g, "_");
    }
    if (amKeywords !== "" && amKeywords !== undefined) {
        amKeywords = amKeywords.replace(/,/g, "_");
    }
    amSctns = mdm.getClassification();
    amSctns = amSctns.split(",");
    if (amSctns.length > 1) {
        for (var i = 0; i < amSctns.length; i++) {
            if (i == (amSctns.length - 1)) {
                adm.addParameter("sitesection", amSctns[i]);
            } else if (i == (amSctns.length - 2)) {
                adm.addParameter("category", amSctns[i]);
            } else if (i == (amSctns.length - 3)) {
                adm.addParameter("vgncontent", amSctns[i]);
            } else {
                adm.addParameter("SUBSECTION", amSctns[i]);
            }
        }
    } else {
        var c = mdm.getClassification();
        adm.addParameter("category", c);
    }
    if (amPageType == 'SECTION') {
        if (!adm.getParameter("vgncontent", " ")) {
            adm.addParameter("page", "MAIN");
        }
    }
    var s = mdm.getSite();
    adm.addParameter("site", s);
    var gsId = mdm.getSctnId();
    adm.addParameter("tile", ranNum + gsId);
    adm.addParameter("ord", ad_ord);
    adm.addParameter("topic", amSponsorship);
    adm.addParameter("keywords", amKeywords);
    adm.addParameter("pagetype", amPageType);
    adm.addParameter("uniqueid", amUniqueId);
    var sId = mdm.getSctnId();
    adm.addParameter("SECTION_ID", sId);
    admAppendParam("adkey1", mdm.getParameterString("AdKey1").toUpperCase());
    admAppendParam("adkey2", mdm.getParameterString("AdKey2").toUpperCase());
    admAppendParam("delvfrmt", mdm.getParameterString("DelvFrmt"));
    admAppendParam("source", mdm.getParameterString("Source"));
    admAppendParam("filter", mdm.getParameterString("filter"));
    admAppendParam("chef", mdm.getParameterString("ChefName"));
    admAppendParam("show", mdm.getParameterString("Show_Abbr"));
    admAppendParam("difficulty", mdm.getParameterString("Difficulty"));
    admAppendParam("cuisine", mdm.getParameterString("Cuisine"));
    admAppendParam("ingredient", mdm.getParameterString("MainIngredient"));
    admAppendParam("occasion", mdm.getParameterString("Occasion"));
    admAppendParam("mealpart", mdm.getParameterString("MealPart"));
    admAppendParam("technique", mdm.getParameterString("Technique"));
}
if (typeof(SNI.Util) == "undefined") {
    SNI.Util = {};
}
SNI.Util.inputField = function (elem, defaultText, preventDefault) {
    var elem = $(elem);
    var preventDefault = preventDefault == null ? 'blank' : preventDefault;
    var hintClass = 'input-hint';
    if (elem.length > 0) {
        var input = elem.get(0);
        if (input.tagName.toLowerCase() == 'input' && input.type == 'text') {
            if ($.trim(elem.val()) === '') {
                elem.val(defaultText);
                elem.addClass(hintClass);
            }
            elem.blur(function () {
                if ($.trim(this.value) === '') {
                    this.value = defaultText;
                    elem.addClass(hintClass);
                }
            });
            elem.focus(function () {
                if (this.value == defaultText) {
                    this.value = '';
                }
                elem.removeClass(hintClass);
            });
            if (preventDefault === true || preventDefault == 'blank') {
                form = $(elem.get(0).form);
                if (form) {

                    form.submit(function (event) {
                        if ($.trim(elem.val()) == defaultText || $.trim(elem.val()) == "") {
                            if (preventDefault === true) {
                                event.preventDefault();
                                elem.focus();
                            } else {
                                elem.val('');
                            }
                        }
                        return true;
                    });
                }
            }
        }
    }
};
SNI.Util.popup = function (url, w, h, menu) {
    x = Math.floor((screen.width - w) / 2);
    y = Math.floor((screen.height - h) / 2);
    now = new Date();
    features = "screenx=" + x + ",screeny=" + y + ",left=" + x + ",top=" + y + ",width=" + w + ",height=" + h + ",location=no,resizable=yes" + ",directories=no,status=no,scrollbars=yes";
    if (menu != null) {
        features += ",menubar=yes,toolbar=yes";
    } else {
        features += ",menubar=no,toolbar=no";
    }
    window.open(url, "newwin", features);
};
SNI.Util.getUrlParam = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
};
SNI.Util.truncate = function (str, length, truncation) {
    length = length || 30;
    truncation = truncation == undefined ? '...' : truncation;
    return str.length > length ? str.slice(0, length - truncation.length) + truncation : str;
};
SNI.Util.hitCount = function () {
    var myURL;
    if (location.host == "www.diynetwork.com") {
        myURL = "http://images.diynetwork.com/webdiy/diy20/html/fixHits.html";
    } else {
        myURL = "http://frontend.scrippsnetworks.com/diy/js/fixHits.html";
    }
    if ($("#hitCounter").length > 0) {
        $("#hitCounter").remove();
    }
    $("head").append('<iframe id="hitCounter" src="' + myURL + '" width="0" height="0" frameborder="0" style="height:0; width:0; display:none;"></iframe>')
    return;
};
if (typeof(SNI.Util.Cookie) == "undefined") {
    SNI.Util.Cookie = {};
}
SNI.Util.Cookie = {
    SEARCH: 'S',
    UI: 'U',
    get: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    },
    set: function (name, value, days, path) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        if (!path) {
            path = '/';
        }
        document.cookie = name + "=" + value + expires + "; path=" + path;
    },
    remove: function (name) {
        this.set(name, "", -1);
    },
    persist: function (cookieName, key, value, days) {
        var cookie = this.get(cookieName);
        days = days || 30;
        if (typeof value == 'undefined') {
            if (cookie == null) {
                return null;
            } else {
                var values = this.getPersistValues(cookie);
                return values[key];
            }
        } else {
            if (cookie == null) {
                var values = {};
                values[key] = value;
            } else {
                var values = this.getPersistValues(cookie);
                values[key] = value;
            }
            this.set(cookieName, this.buildPersistString(values), days);
        }
    },
    getPersistValues: function (cookie) {
        var values = {};
        var temp = '';
        $.each(cookie.split('&'), function (k, v) {
            temp = v.split('=');
            if (temp[0]) {
                values[temp[0]] = unescape(temp[1]);
            }
        });
        return values;
    },
    buildPersistString: function (values) {
        var result = [];
        $.each(values, function (k, v) {
            if (v != null) {
                result.push(k + '=' + escape(v));
            }
        });
        return result.join('&');
    }
};
if (typeof(SNI) == "undefined") {
    SNI = {};
}
if (typeof(SNI.RSI) == "undefined") {
    SNI.RSI = {};
}
var segQS = "";
SNI.RSI.rdcookie = function () {
    var rsi_segs = [];
    var segs_beg = document.cookie.indexOf('rsi_segs=');
    if (segs_beg >= 0) {
        segs_beg = document.cookie.indexOf('=', segs_beg) + 1;
        if (segs_beg > 0) {
            var segs_end = document.cookie.indexOf(';', segs_beg);
            if (segs_end == -1) segs_end = document.cookie.length;
            rsi_segs = document.cookie.substring(segs_beg, segs_end).split('|');
        }
    }
    var segLen = 20;
    if (rsi_segs.length < segLen) {
        segLen = rsi_segs.length
    }
    for (var i = 0; i < segLen; i++) {
        segQS += ("&rsi" + "=" + rsi_segs[i])
    }
    SNI.Ads.UseRSI = true;
    return;
}
SNI.RSI.rdcookie();
SNI.RSI.setvars = function () {
    A09802.DM_cat(mdManager.getParameter("Classification").split(',').reverse().join(' > '));
    A09802.DM_addEncToLoc("keyword", mdManager.getParameter("searchTerm"));
    A09802.DM_tag();
}
if (typeof(SNI) == 'undefined') {
    SNI = {};
}
if (typeof(SNI.Community) == 'undefined') {
    SNI.Community = {};
}
if (typeof(SNI.Community.UR) == 'undefined') {
    SNI.Community.UR = {};
}
SNI.Community.UR.getCookie = function (name) {
    var cookies = document.cookie;
    if (cookies.indexOf(name) != -1) {
        var startpos = cookies.indexOf(name) + name.length + 1;
        var endpos = cookies.indexOf(';', startpos) - 1;
        if (endpos == -2) {
            endpos = cookies.length;
        }
        return unescape(cookies.substring(startpos, endpos));
    }
    else {
        return false;
    }
}
SNI.Community.xUrlPre = '';
if (location.hostname.toLowerCase().indexOf("dev") > -1) {
    SNI.Community.xUrlPre = "test1-";
}
else if (location.hostname.toLowerCase().indexOf("staging") > -1) {
    SNI.Community.xUrlPre = "test2-";
}
if ((SNI.Community.UR.getCookie('SMSESSION') == null) || (SNI.Community.UR.getCookie('SMSESSION') == '')) {
    var orig_domain = document.location.href.substring(0, document.location.href.indexOf(location.hostname) + location.hostname.length);
    var x = document.createElement('script');
    x.src = 'http://' + SNI.Community.xUrlPre + 'www.scrippscontroller.com/sso/checkcontrollercookie.html?DEST_URL=' + document.location.href + '&orig_domain=' + orig_domain;
    document.getElementsByTagName('head')[0].appendChild(x);
}
/* jQuery UI Date Picker v3.3 - previously jQuery Calendar
 Written by Marc Grabanski (m@marcgrabanski.com) and Keith Wood (kbwood@virginbroadband.com.au).
 
 Copyright (c) 2007 Marc Grabanski (http://marcgrabanski.com/code/ui-datepicker)
 Dual licensed under the MIT (MIT-LICENSE.txt)
 and GPL (GPL-LICENSE.txt) licenses.
 Date: 09-03-2007  */

/* Date picker manager.
 Use the singleton instance of this class, $.datepicker, to interact with the date picker.
 Settings for (groups of) date pickers are maintained in an instance object
 (DatepickerInstance), allowing multiple different settings on the same page. */

function Datepicker() {
    this.debug = false;
    this._nextId = 0;
    this._inst = [];
    this._curInst = null;
    this._disabledInputs = [];
    this._datepickerShowing = false;
    this._inDialog = false;
    this.regional = [];
    this.regional[''] = {
        clearText: 'Clear',
        clearStatus: 'Erase the current date',
        closeText: 'Close',
        closeStatus: 'Close without change',
        prevText: '&#x3c;Prev',
        prevStatus: 'Show the previous month',
        nextText: 'Next&#x3e;',
        nextStatus: 'Show the next month',
        currentText: 'Today',
        currentStatus: 'Show the current month',
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthStatus: 'Show a different month',
        yearStatus: 'Show a different year',
        weekHeader: 'Wk',
        weekStatus: 'Week of the year',
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'],
        dayStatus: 'Set DD as first week day',
        dateStatus: 'Select DD, M d',
        dateFormat: 'mm/dd/y',
        firstDay: 0,
        initStatus: 'Select a date',
        isRTL: false
    };
    this._defaults = {
        showOn: 'focus',
        showAnim: '',
        hideAnim: '',
        defaultDate: null,
        appendText: '',
        buttonText: '...',
        buttonImage: '',
        buttonImageOnly: false,
        closeAtTop: true,
        mandatory: true,
        hideIfNoPrevNext: false,
        changeMonth: true,
        changeYear: true,
        yearRange: '-10:+10',
        changeFirstDay: false,
        showOtherMonths: false,
        showWeeks: false,
        calculateWeek: this.iso8601Week,
        shortYearCutoff: '+10',
        showStatus: false,
        statusForDate: this.dateStatus,
        minDate: null,
        maxDate: null,
        speed: 'medium',
        beforeShowDay: null,
        beforeShow: null,
        onSelect: null,
        numberOfMonths: 1,
        stepMonths: 1,
        stepYears: 1,
        rangeSelect: false,
        rangeSeparator: ' - ',
        title: 'Select a Day',
        selectionType: 'day',
        highlightWeek: false,
        otherMonthsActive: false,
        printRange: false
    };
    $.extend(this._defaults, this.regional['']);
    this._datepickerDiv = $('<div id="datepicker"><div class="hd"></div><div class="bd"></div><div class="ft"></div></div>');
}
$.extend(Datepicker.prototype, {
    markerClassName: 'hasDatepicker',
    log: function () {
        if (this.debug) {
            console.log.apply('', arguments);
        }
    },
    _register: function (inst) {
        var id = this._nextId++;
        this._inst[id] = inst;
        return id;
    },
    _getInst: function (id) {
        return this._inst[id] || id;
    },
    setDefaults: function (settings) {
        extendRemove(this._defaults, settings || {});
        return this;
    },
    _doKeyDown: function (e) {
        var inst = $.datepicker._getInst(this._calId);
        if ($.datepicker._datepickerShowing) {
            switch (e.keyCode) {
            case 9:
                $.datepicker.hideDatepicker('');
                break;
            case 13:
                $.datepicker._selectDay(inst, inst._selectedMonth, inst._selectedYear, $('td.datepicker_daysCellOver', inst._datepickerDiv)[0]);
                return false;
            case 27:
                $.datepicker.hideDatepicker(inst._get('speed'));
                break;
            case 33:
                $.datepicker._adjustDate(inst, (e.ctrlKey ? -1 : -inst._get('stepMonths')), (e.ctrlKey ? 'Y' : 'M'));
                break;
            case 34:
                $.datepicker._adjustDate(inst, (e.ctrlKey ? +1 : +inst._get('stepMonths')), (e.ctrlKey ? 'Y' : 'M'));
                break;
            case 35:
                if (e.ctrlKey) {
                    $.datepicker._clearDate(inst);
                }
                break;
            case 36:
                if (e.ctrlKey) {
                    $.datepicker._gotoToday(inst);
                }
                break;
            case 37:
                if (e.ctrlKey) {
                    $.datepicker._adjustDate(inst, -1, 'D');
                }
                break;
            case 38:
                if (e.ctrlKey) {
                    $.datepicker._adjustDate(inst, -7, 'D');
                }
                break;
            case 39:
                if (e.ctrlKey) {
                    $.datepicker._adjustDate(inst, +1, 'D');
                }
                break;
            case 40:
                if (e.ctrlKey) {
                    $.datepicker._adjustDate(inst, +7, 'D');
                }
                break;
            }
        }
        else if (e.keyCode == 36 && e.ctrlKey) {
            $.datepicker.showFor(this);
        }
    },
    _doKeyPress: function (e) {
        var inst = $.datepicker._getInst(this._calId);
        var chars = $.datepicker._possibleChars(inst._get('dateFormat'));
        var chr = String.fromCharCode(e.charCode == undefined ? e.keyCode : e.charCode);
        return (chr < ' ' || !chars || chars.indexOf(chr) > -1);
    },
    _connectDatepicker: function (target, inst) {
        var input = $(target);
        if (this._hasClass(input, this.markerClassName)) {
            return;
        }
        var appendText = inst._get('appendText');
        var isRTL = inst._get('isRTL');
        if (appendText) {
            if (isRTL) {
                input.before('<span class="datepicker_append">' + appendText + '</span>');
            }
            else {
                input.after('<span class="datepicker_append">' + appendText + '</span>');
            }
        }
        var showOn = inst._get('showOn');
        if (showOn == 'focus' || showOn == 'both') {
            input.focus(this.showFor);
        }
        if (showOn == 'button' || showOn == 'both') {
            var buttonText = inst._get('buttonText');
            var buttonImage = inst._get('buttonImage');
            var buttonImageOnly = inst._get('buttonImageOnly');
            var trigger = $(buttonImageOnly ? '<img class="datepicker_trigger" src="' + buttonImage + '" alt="' + buttonText + '" title="' + buttonText + '"/>' : '<button type="button" class="datepicker_trigger">' + (buttonImage != '' ? '<img src="' + buttonImage + '" alt="' + buttonText + '" title="' + buttonText + '"/>' : buttonText) + '</button>');
            input.wrap('<span class="datepicker_wrap"></span>');
            if (isRTL) {
                input.before(trigger);
            }
            else {
                input.after(trigger);
            }
            trigger.click(this.showFor);
        }
        input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress);
        input[0]._calId = inst._id;
    },
    _inlineDatepicker: function (target, inst) {
        var input = $(target);
        if (this._hasClass(input, this.markerClassName)) {
            return;
        }
        input.addClass(this.markerClassName).append(inst._datepickerDiv);
        input[0]._calId = inst._id;
        this._updateDatepicker(inst);
    },
    _inlineShow: function (inst) {
        var numMonths = inst._getNumberOfMonths();
        inst._datepickerDiv.width(numMonths[1] * $('.datepicker', inst._datepickerDiv[0]).width());
    },
    _hasClass: function (element, className) {
        var classes = element.attr('class');
        return (classes && classes.indexOf(className) > -1);
    },
    dialogDatepicker: function (dateText, onSelect, settings, pos) {
        var inst = this._dialogInst;
        if (!inst) {
            inst = this._dialogInst = new DatepickerInstance({}, false);
            this._dialogInput = $('<input type="text" size="1" style="position: absolute; top: -100px;"/>');
            this._dialogInput.keydown(this._doKeyDown);
            $('body').append(this._dialogInput);
            this._dialogInput[0]._calId = inst._id;
        }
        extendRemove(inst._settings, settings || {});
        this._dialogInput.val(dateText);
        this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
        if (!this._pos) {
            var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
            this._pos = [(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
        }
        this._dialogInput.css('left', this._pos[0] + 'px').css('top', this._pos[1] + 'px');
        inst._settings.onSelect = onSelect;
        this._inDialog = true;
        this._datepickerDiv.addClass('datepicker_dialog');
        this.showFor(this._dialogInput[0]);
        if ($.blockUI) {
            $.blockUI(this._datepickerDiv);
        }
        return this;
    },
    showFor: function (control) {
        control = (control.jquery ? control[0] : (typeof control == 'string' ? $(control)[0] : control));
        var input = (control.nodeName && control.nodeName.toLowerCase() == 'input' ? control : this);
        if (input.nodeName.toLowerCase() != 'input') {
            input = $('input', input.parentNode)[0];
        }
        if ($.datepicker._lastInput == input) {
            return;
        }
        if ($(input).isDisabledDatepicker()) {
            return;
        }
        var inst = $.datepicker._getInst(input._calId);
        var beforeShow = inst._get('beforeShow');
        extendRemove(inst._settings, (beforeShow ? beforeShow.apply(input, [input, inst]) : {}));
        $.datepicker.hideDatepicker('');
        $.datepicker._lastInput = input;
        inst._setDateFromField(input);
        if ($.datepicker._inDialog) {
            input.value = '';
        }
        if (!$.datepicker._pos) {
            $.datepicker._pos = $.datepicker._findPos(input);
            $.datepicker._pos[1] += input.offsetHeight;
        }
        var isFixed = false;
        $(input).parents().each(function () {
            isFixed |= $(this).css('position') == 'fixed';
        });
        if (isFixed && $.browser.opera) {
            $.datepicker._pos[0] -= document.documentElement.scrollLeft;
            $.datepicker._pos[1] -= document.documentElement.scrollTop;
        }
        if (!$.datepicker._inDialog) {
            var iconOffset = 7;
            var horizontalOffset = $(inst._input).outerWidth() - $.datepicker._datepickerDiv.outerWidth() - iconOffset;
            $.datepicker._pos[0] = $.datepicker._pos[0] + horizontalOffset;
        }
        inst._datepickerDiv.css('position', ($.datepicker._inDialog && $.blockUI ? 'static' : (isFixed ? 'fixed' : 'absolute'))).css('left', $.datepicker._pos[0] + 'px').css('top', $.datepicker._pos[1] + 'px');
        $.datepicker._pos = null;
        $.datepicker._showDatepicker(inst);
        return this;
    },
    _showDatepicker: function (id) {
        var inst = this._getInst(id);
        inst._rangeStart = null;
        this._updateDatepicker(inst);
        if (!inst._inline) {
            var speed = inst._get('speed');
            var postProcess = function () {
                $.datepicker._datepickerShowing = true;
                $.datepicker._afterShow(inst);
            };
            inst._input.addClass('datepicker_open');
            var showAnim = inst._get('showAnim');
            if (showAnim) {
                inst._datepickerDiv[showAnim](speed, postProcess);
            } else {
                inst._datepickerDiv.show();
                speed = '';
            }
            if (speed == '') {
                postProcess();
            }
            if (inst._input[0].type != 'hidden') {
                inst._input[0].focus();
            }
            this._curInst = inst;
        }
    },
    _updateDatepicker: function (inst) {
        inst._datepickerBody.empty().append(inst._generateDatepicker());
        var numMonths = inst._getNumberOfMonths();
        if (numMonths[0] != 1 || numMonths[1] != 1) {
            inst._datepickerBody.addClass('datepicker_multi');
        }
        else {
            inst._datepickerBody.removeClass('datepicker_multi');
        }
        if (inst._get('isRTL')) {
            inst._datepickerBody.addClass('datepicker_rtl');
        }
        else {
            inst._datepickerBody.removeClass('datepicker_rtl');
        }
        if (inst._input && inst._input[0].type != 'hidden') {
            inst._input[0].focus();
        }
    },
    _afterShow: function (inst) {
        var numMonths = inst._getNumberOfMonths();
        var isFixed = inst._datepickerDiv.css('position') == 'fixed';
        var pos = inst._input ? $.datepicker._findPos(inst._input[0]) : null;
        var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var scrollX = (isFixed ? 0 : document.documentElement.scrollLeft || document.body.scrollLeft);
        var scrollY = (isFixed ? 0 : document.documentElement.scrollTop || document.body.scrollTop);
        if (inst._datepickerDiv.offset().left < 0) {
            inst._datepickerDiv.css('left', '5px');
        }
        if ((inst._datepickerDiv.offset().top + inst._datepickerDiv.height() - (isFixed && $.browser.msie ? document.documentElement.scrollTop : 0)) > (browserHeight + scrollY)) {
            inst._datepickerDiv.css('top', Math.max(scrollY, pos[1] - (this._inDialog ? 0 : inst._datepickerDiv.height()) - (isFixed && $.browser.opera ? document.documentElement.scrollTop : 0)) + 'px');
        }
    },
    _findPos: function (obj) {
        while (obj && (obj.type == 'hidden' || obj.nodeType != 1)) {
            obj = obj.nextSibling;
        }
        var curleft = 0;
        var curtop = 0;
        if (obj && obj.offsetParent) {
            curleft = obj.offsetLeft;
            curtop = obj.offsetTop;
            while (obj = obj.offsetParent) {
                var origcurleft = curleft;
                curleft += obj.offsetLeft;
                if (curleft < 0) {
                    curleft = origcurleft;
                }
                curtop += obj.offsetTop;
            }
        }
        return [curleft, curtop];
    },
    hideDatepicker: function (speed) {
        var inst = this._curInst;
        if (!inst) {
            return;
        }
        var rangeSelect = inst._get('rangeSelect');
        if (rangeSelect && this._stayOpen) {
            this._selectDate(inst, inst._formatDate(inst._currentDay, inst._currentMonth, inst._currentYear));
        }
        this._stayOpen = false;
        if (this._datepickerShowing) {
            speed = (speed != null ? speed : inst._get('speed'));
            inst._input.removeClass('datepicker_open');
            hideAnim = inst._get('hideAnim');
            if (hideAnim) {
                inst._datepickerDiv[hideAnim](speed, function () {
                    $.datepicker._tidyDialog(inst);
                });
            } else {
                inst._datepickerDiv.hide();
                speed = '';
            }
            if (speed === '') {
                this._tidyDialog(inst);
            }
            this._datepickerShowing = false;
            this._lastInput = null;
            inst._settings.prompt = null;
            if (this._inDialog) {
                this._dialogInput.css('position', 'absolute').css('left', '0px').css('top', '-100px');
                if ($.blockUI) {
                    $.unblockUI();
                    $('body').append(this._datepickerDiv);
                }
            }
            this._inDialog = false;
        }
        this._curInst = null;
    },
    _tidyDialog: function (inst) {
        inst._datepickerDiv.removeClass('datepicker_dialog');
        $('.datepicker_prompt', inst._datepickerDiv).remove();
    },
    _checkExternalClick: function (event) {
        if (!$.datepicker._curInst) {
            return;
        }
        var target = $(event.target);
        if ((target.parents("#datepicker").length == 0) && (target.attr('class') != 'datepicker_trigger') && $.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI)) {
            $.datepicker.hideDatepicker('');
        }
    },
    _adjustDate: function (id, offset, period) {
        var inst = this._getInst(id);
        inst._adjustDate(offset, period);
        this._updateDatepicker(inst);
    },
    _gotoToday: function (id) {
        var date = new Date();
        var inst = this._getInst(id);
        inst._selectedDay = date.getDate();
        inst._selectedMonth = date.getMonth();
        inst._selectedYear = date.getFullYear();
        this._adjustDate(inst);
    },
    _selectMonthYear: function (id, select, period) {
        var inst = this._getInst(id);
        inst._selectingMonthYear = false;
        inst[period == 'M' ? '_selectedMonth' : '_selectedYear'] = select.options[select.selectedIndex].value - 0;
        this._adjustDate(inst);
    },
    _clickMonthYear: function (id) {
        var inst = this._getInst(id);
        if (inst._input && inst._selectingMonthYear && !$.browser.msie) {
            inst._input[0].focus();
        }
        inst._selectingMonthYear = !inst._selectingMonthYear;
    },
    _changeFirstDay: function (id, day) {
        var inst = this._getInst(id);
        inst._settings.firstDay = day;
        this._updateDatepicker(inst);
    },
    _selectDay: function (id, month, year, td) {
        if (this._hasClass($(td), 'datepicker_unselectable')) {
            return;
        }
        var inst = this._getInst(id);
        var weekSelect = inst._get('selectionType') == 'week';
        var rangeSelect = inst._get('rangeSelect');
        var printRange = inst._get('printRange');
        if (rangeSelect) {
            if (!this._stayOpen) {
                $('.datepicker_table td').removeClass('datepicker_currentDay');
                $(td).addClass('datepicker_currentDay');
            }
            this._stayOpen = !this._stayOpen;
        }
        inst._currentDay = $('a', td).html();
        inst._currentMonth = month;
        inst._currentYear = year;
        this._selectDate(id, inst._formatDate(inst._currentDay, inst._currentMonth, inst._currentYear));
        if (printRange) {
            selectedDate = $.datepicker.parseDate(inst._get('dateFormat'), inst._formatDate(inst._currentDay, inst._currentMonth, inst._currentYear));
            selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
            inst._currentDay = selectedDate.getDate();
            inst._currentMonth = selectedDate.getMonth();
            inst._currentYear = selectedDate.getFullYear();
            inst._rangeStart = new Date(inst._currentYear, inst._currentMonth, inst._currentDay);
            endDate = new Date(inst._currentYear, inst._currentMonth, inst._currentDay);
            endDate.setDate(endDate.getDate() + 6);
            this._selectDate(id, inst._formatDate(endDate.getDate(), endDate.getMonth(), endDate.getFullYear()));
            inst._rangeStart = null;
        }
        else if (this._stayOpen) {
            inst._endDay = inst._endMonth = inst._endYear = null;
            inst._rangeStart = new Date(inst._currentYear, inst._currentMonth, inst._currentDay);
            this._updateDatepicker(inst);
        }
        else if (rangeSelect) {
            inst._endDay = inst._currentDay;
            inst._endMonth = inst._currentMonth;
            inst._endYear = inst._currentYear;
            inst._selectedDay = inst._currentDay = inst._rangeStart.getDate();
            inst._selectedMonth = inst._currentMonth = inst._rangeStart.getMonth();
            inst._selectedYear = inst._currentYear = inst._rangeStart.getFullYear();
            inst._rangeStart = null;
            if (inst._inline) {
                this._updateDatepicker(inst);
            }
        }
    },
    _clearDate: function (id) {
        var inst = this._getInst(id);
        this._stayOpen = false;
        inst._endDay = inst._endMonth = inst._endYear = inst._rangeStart = null;
        this._selectDate(inst, '');
    },
    _selectDate: function (id, dateStr) {
        var inst = this._getInst(id);
        dateStr = (dateStr != null ? dateStr : inst._formatDate());
        if (inst._rangeStart) {
            dateStr = inst._formatDate(inst._rangeStart) + inst._get('rangeSeparator') + dateStr;
        }
        if (inst._input) {
            inst._input.val(dateStr);
        }
        var onSelect = inst._get('onSelect');
        if (onSelect) {
            onSelect.apply((inst._input ? inst._input[0] : null), [dateStr, inst]);
        }
        else {
            if (inst._input) {
                inst._input.trigger('change');
            }
        }
        if (inst._inline) {
            this._updateDatepicker(inst);
        }
        else {
            if (!this._stayOpen) {
                this.hideDatepicker(inst._get('speed'));
                this._lastInput = inst._input[0];
                if (typeof(inst._input[0]) != 'object') {
                    inst._input[0].focus();
                }
                this._lastInput = null;
            }
        }
    },
    noWeekends: function (date) {
        var day = date.getDay();
        return [(day > 0 && day < 6), ''];
    },
    iso8601Week: function (date) {
        var checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var firstMon = new Date(checkDate.getFullYear(), 1 - 1, 4);
        var firstDay = firstMon.getDay() || 7;
        firstMon.setDate(firstMon.getDate() + 1 - firstDay);
        if (firstDay < 4 && checkDate < firstMon) {
            checkDate.setDate(checkDate.getDate() - 3);
            return $.datepicker.iso8601Week(checkDate);
        }
        else if (checkDate > new Date(checkDate.getFullYear(), 12 - 1, 28)) {
            firstDay = new Date(checkDate.getFullYear() + 1, 1 - 1, 4).getDay() || 7;
            if (firstDay > 4 && (checkDate.getDay() || 7) < firstDay - 3) {
                checkDate.setDate(checkDate.getDate() + 3);
                return $.datepicker.iso8601Week(checkDate);
            }
        }
        return Math.floor(((checkDate - firstMon) / 86400000) / 7) + 1;
    },
    dateStatus: function (date, inst) {
        return $.datepicker.formatDate(inst._get('dateStatus'), date, inst._getFormatConfig());
    },
    parseDate: function (format, value, settings) {
        if (format == null || value == null) {
            throw 'Invalid arguments';
        }
        value = (typeof value == 'object' ? value.toString() : value + '');
        if (value == '') {
            return null;
        }
        var shortYearCutoff = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff;
        var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
        var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
        var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
        var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
        var year = -1;
        var month = -1;
        var day = -1;
        var literal = false;
        var lookAhead = function (match) {
            var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
            if (matches) {
                iFormat++;
            }
            return matches;
        };
        var getNumber = function (match) {
            lookAhead(match);
            var size = (match == 'y' ? 4 : 2);
            var num = 0;
            while (size > 0 && iValue < value.length && value.charAt(iValue) >= '0' && value.charAt(iValue) <= '9') {
                num = num * 10 + (value.charAt(iValue++) - 0);
                size--;
            }
            if (size == (match == 'y' ? 4 : 2)) {
                throw 'Missing number at position ' + iValue;
            }
            return num;
        };
        var getName = function (match, shortNames, longNames) {
            var names = (lookAhead(match) ? longNames : shortNames);
            var size = 0;
            for (var j = 0; j < names.length; j++) {
                size = Math.max(size, names[j].length);
            }
            var name = '';
            var iInit = iValue;
            while (size > 0 && iValue < value.length) {
                name += value.charAt(iValue++);
                for (var i = 0; i < names.length; i++) {
                    if (name == names[i]) {
                        return i + 1;
                    }
                }
                size--;
            }
            throw 'Unknown name at position ' + iInit;
        };
        var checkLiteral = function () {
            if (value.charAt(iValue) != format.charAt(iFormat)) {
                throw 'Unexpected literal at position ' + iValue;
            }
            iValue++;
        };
        var iValue = 0;
        for (var iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                    literal = false;
                }
                else {
                    checkLiteral();
                }
            }
            else {
                switch (format.charAt(iFormat)) {
                case 'd':
                    day = getNumber('d');
                    break;
                case 'D':
                    getName('D', dayNamesShort, dayNames);
                    break;
                case 'm':
                    month = getNumber('m');
                    break;
                case 'M':
                    month = getName('M', monthNamesShort, monthNames);
                    break;
                case 'y':
                    year = getNumber('y');
                    break;
                case '\'':
                    if (lookAhead('\'')) {
                        checkLiteral();
                    }
                    else {
                        literal = true;
                    }
                    break;
                default:
                    checkLiteral();
                }
            }
        }
        if (year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 + (year <= shortYearCutoff ? 0 : -100);
        }
        var date = new Date(year, month - 1, day);
        if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
            throw 'Invalid date';
        }
        return date;
    },
    formatDate: function (format, date, settings) {
        if (!date) {
            return '';
        }
        var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
        var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
        var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
        var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
        var lookAhead = function (match) {
            var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
            if (matches) {
                iFormat++;
            }
            return matches;
        };
        var formatNumber = function (match, value) {
            return (lookAhead(match) && value < 10 ? '0' : '') + value;
        };
        var formatName = function (match, value, shortNames, longNames) {
            return (lookAhead(match) ? longNames[value] : shortNames[value]);
        };
        var output = '';
        var literal = false;
        if (date) {
            for (var iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                        literal = false;
                    }
                    else {
                        output += format.charAt(iFormat);
                    }
                }
                else {
                    switch (format.charAt(iFormat)) {
                    case 'd':
                        output += formatNumber('d', date.getDate());
                        break;
                    case 'D':
                        output += formatName('D', date.getDay(), dayNamesShort, dayNames);
                        break;
                    case 'm':
                        output += formatNumber('m', date.getMonth() + 1);
                        break;
                    case 'M':
                        output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
                        break;
                    case 'y':
                        output += (lookAhead('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                        break;
                    case '\'':
                        if (lookAhead('\'')) {
                            output += '\'';
                        }
                        else {
                            literal = true;
                        }
                        break;
                    default:
                        output += format.charAt(iFormat);
                    }
                }
            }
        }
        return output;
    },
    _possibleChars: function (format) {
        var chars = '';
        var literal = false;
        for (var iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                    literal = false;
                }
                else {
                    chars += format.charAt(iFormat);
                }
            }
            else {
                switch (format.charAt(iFormat)) {
                case 'd':
                case 'm':
                case 'y':
                    chars += '0123456789';
                    break;
                case 'D':
                case 'M':
                    return null;
                case '\'':
                    if (lookAhead('\'')) {
                        chars += '\'';
                    }
                    else {
                        literal = true;
                    }
                    break;
                default:
                    chars += format.charAt(iFormat);
                }
            }
        }
        return chars;
    }
});

function DatepickerInstance(settings, inline) {
    this._id = $.datepicker._register(this);
    this._selectedDay = 0;
    this._selectedMonth = 0;
    this._selectedYear = 0;
    this._input = null;
    this._inline = inline;
    this._datepickerDiv = (!inline ? $.datepicker._datepickerDiv : $('<div id="datepicker_' + this._id + '" class="datepicker_inline"></div>'));
    this._datepickerBody = this._datepickerDiv.find('.bd:first');
    this._settings = extendRemove({}, settings || {});
    if (inline) {
        this._setDate(this._getDefaultDate());
    }
}
$.extend(DatepickerInstance.prototype, {
    _get: function (name) {
        return (this._settings[name] != null ? this._settings[name] : $.datepicker._defaults[name]);
    },
    _setDateFromField: function (input) {
        this._input = $(input);
        var dateFormat = this._get('dateFormat');
        var dates = this._input ? this._input.val().split(this._get('rangeSeparator')) : null;
        this._endDay = this._endMonth = this._endYear = null;
        var date = defaultDate = this._getDefaultDate();
        if (dates.length > 0) {
            var settings = this._getFormatConfig();
            if (dates.length > 1) {
                date = $.datepicker.parseDate(dateFormat, dates[1], settings) || defaultDate;
                this._endDay = date.getDate();
                this._endMonth = date.getMonth();
                this._endYear = date.getFullYear();
            }
            try {
                date = $.datepicker.parseDate(dateFormat, dates[0], settings) || defaultDate;
            }
            catch (e) {
                $.datepicker.log(e);
                date = defaultDate;
            }
        }
        this._selectedDay = this._currentDay = date.getDate();
        this._selectedMonth = this._currentMonth = date.getMonth();
        this._selectedYear = this._currentYear = date.getFullYear();
        this._adjustDate();
    },
    _getDefaultDate: function () {
        return this._determineDate('defaultDate', new Date());
    },
    _determineDate: function (name, defaultDate) {
        var offsetNumeric = function (offset) {
            var date = new Date();
            date.setDate(date.getDate() + offset);
            return date;
        };
        var offsetString = function (offset, getDaysInMonth) {
            var date = new Date();
            var matches = /^([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?$/.exec(offset);
            if (matches) {
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDate();
                switch (matches[2] || 'd') {
                case 'd':
                case 'D':
                    day += (matches[1] - 0);
                    break;
                case 'w':
                case 'W':
                    day += (matches[1] * 7);
                    break;
                case 'm':
                case 'M':
                    month += (matches[1] - 0);
                    day = Math.min(day, getDaysInMonth(year, month));
                    break;
                case 'y':
                case 'Y':
                    year += (matches[1] - 0);
                    day = Math.min(day, getDaysInMonth(year, month));
                    break;
                }
                date = new Date(year, month, day);
            }
            return date;
        };
        var date = this._get(name);
        return (date == null ? defaultDate : (typeof date == 'string' ? offsetString(date, this._getDaysInMonth) : (typeof date == 'number' ? offsetNumeric(date) : date)));
    },
    _setDate: function (date, endDate) {
        this._selectedDay = this._currentDay = date.getDate();
        this._selectedMonth = this._currentMonth = date.getMonth();
        this._selectedYear = this._currentYear = date.getFullYear();
        if (this._get('rangeSelect') || this._get('selectionType') == 'week') {
            if (endDate) {
                this._endDay = endDate.getDate();
                this._endMonth = endDate.getMonth();
                this._endYear = endDate.getFullYear();
            }
            else {
                this._endDay = this._currentDay;
                this._endMonth = this._currentMonth;
                this._endYear = this._currentYear;
            }
        }
        this._adjustDate();
    },
    _getDate: function () {
        var startDate = (!this._currentYear || (this._input && this._input.val() == '') ? null : new Date(this._currentYear, this._currentMonth, this._currentDay));
        if (this._get('rangeSelect') || this._get('selectionType') == 'week') {
            return [startDate, (!this._endYear ? null : new Date(this._endYear, this._endMonth, this._endDay))];
        }
        else {
            return startDate;
        }
    },
    _generateDatepicker: function () {
        var today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var showStatus = this._get('showStatus');
        var isRTL = this._get('isRTL');
        var clear = (this._get('mandatory') ? '' : '<div class="datepicker_clear"><a href="javascript:void(0);" onclick="jQuery.datepicker._clearDate(' + this._id + ');"' + (showStatus ? this._addStatus(this._get('clearStatus') || '&#xa0;') : '') + '>' + this._get('clearText') + '</a></div>');
        var title = this._get('title');
        var controls = '<div class="datepicker_control">' + (isRTL ? '' : clear) + (title ? '<div class="datepicker_title">' + title + '</div>' : '') + '<div class="datepicker_close"><a href="javascript:void(0);" onclick="jQuery.datepicker.hideDatepicker();"' + (showStatus ? this._addStatus(this._get('closeStatus') || '&#xa0;') : '') + '>' + this._get('closeText') + '</a></div>' + (isRTL ? clear : '') + '</div>';
        var prompt = this._get('prompt');
        var closeAtTop = this._get('closeAtTop');
        var hideIfNoPrevNext = this._get('hideIfNoPrevNext');
        var numMonths = this._getNumberOfMonths();
        var stepMonths = this._get('stepMonths');
        var stepYears = this._get('stepYears');
        var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
        var minDate = this._getMinMaxDate('min', true);
        var maxDate = this._getMinMaxDate('max');
        var drawMonth = this._selectedMonth;
        var drawYear = this._selectedYear;
        if (maxDate) {
            var maxDraw = new Date(maxDate.getFullYear(), maxDate.getMonth() - numMonths[1] + 1, maxDate.getDate());
            maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
            while (new Date(drawYear, drawMonth, 1) > maxDraw) {
                drawMonth--;
                if (drawMonth < 0) {
                    drawMonth = 11;
                    drawYear--;
                }
            }
        }
        var html = (closeAtTop && !this._inline ? controls : '');
        var showWeeks = this._get('showWeeks');
        var highlightWeek = this._get('highlightWeek');
        for (var row = 0; row < numMonths[0]; row++) {
            for (var col = 0; col < numMonths[1]; col++) {
                var selectedDate = new Date(drawYear, drawMonth, this._selectedDay);
                html += '<div class="datepicker_oneMonth' + (col == 0 ? ' datepicker_newRow' : '') + '">' + this._generateMonthYearHeader(drawMonth, drawYear, minDate, maxDate, selectedDate, row > 0 || col > 0) + '<table class="datepicker_table" cellpadding="0" cellspacing="0"><thead>' + '<tr class="datepicker_titleRow">' + (showWeeks ? '<td>' + this._get('weekHeader') + '</td>' : '');
                var firstDay = this._get('firstDay');
                var changeFirstDay = this._get('changeFirstDay');
                var dayNames = this._get('dayNames');
                var dayNamesShort = this._get('dayNamesShort');
                var dayNamesMin = this._get('dayNamesMin');
                for (var dow = 0; dow < 7; dow++) {
                    var day = (dow + firstDay) % 7;
                    var status = this._get('dayStatus') || '&#xa0;';
                    status = (status.indexOf('DD') > -1 ? status.replace(/DD/, dayNames[day]) : status.replace(/D/, dayNamesShort[day]));
                    html += '<td' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="datepicker_weekEndCell"' : '') + '>' + (!changeFirstDay ? '<span' : '<a onclick="jQuery.datepicker._changeFirstDay(' + this._id + ', ' + day + ');"') + (showStatus ? this._addStatus(status) : '') + ' title="' + dayNames[day] + '">' + dayNamesMin[day] + (changeFirstDay ? '</a>' : '</span>') + '</td>';
                }
                html += '</tr></thead><tbody>';
                var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                if (drawYear == this._selectedYear && drawMonth == this._selectedMonth) {
                    this._selectedDay = Math.min(this._selectedDay, daysInMonth);
                }
                var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                var currentDate = new Date(this._currentYear, this._currentMonth, this._currentDay);
                var endDate = this._endDay ? new Date(this._endYear, this._endMonth, this._endDay) : currentDate;
                var defaultDate = this._get('defaultDate');
                if (currentDate != endDate && defaultDate) {
                    currentDate = defaultDate;
                }
                if (!highlightWeek) {
                    endDate = currentDate;
                }
                var printDate = new Date(drawYear, drawMonth, 1 - leadDays);
                var numRows = (isMultiMonth ? 6 : Math.ceil((leadDays + daysInMonth) / 7));
                var beforeShowDay = this._get('beforeShowDay');
                var showOtherMonths = this._get('showOtherMonths');
                var calculateWeek = this._get('calculateWeek') || $.datepicker.iso8601Week;
                var dateStatus = this._get('statusForDate') || $.datepicker.dateStatus;
                var weekSelect = this._get('selectionType') == 'week';
                var otherMonthsActive = this._get('otherMonthsActive');
                for (var dRow = 0; dRow < numRows; dRow++) {
                    html += '<tr class="datepicker_daysRow"';
                    if (weekSelect) {
                        html += ' onmouseover="jQuery(this).addClass(\'datepicker_daysRowOver\');" ' + 'onmouseout="jQuery(this).removeClass(\'datepicker_daysRowOver\');" ';
                    }
                    html += '>' + (showWeeks ? '<td class="datepicker_weekCol">' + calculateWeek(printDate) + '</td>' : '');
                    for (var dow = 0; dow < 7; dow++) {
                        var daySettings = (beforeShowDay ? beforeShowDay.apply((this._input ? this._input[0] : null), [printDate]) : [true, '']);
                        var otherMonth = (printDate.getMonth() != drawMonth);
                        var unselectable = otherMonthsActive ? false : (otherMonth || !daySettings[0] || (minDate && printDate < minDate) || (maxDate && printDate > maxDate));
                        html += '<td class="datepicker_daysCell' + ((dow + firstDay + 6) % 7 >= 5 ? ' datepicker_weekEndCell' : '') + (otherMonth ? ' datepicker_otherMonth' : '') + (unselectable ? ' datepicker_unselectable' : '') + (otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] + (printDate.getTime() >= currentDate.getTime() && printDate.getTime() <= endDate.getTime() ? ' datepicker_currentDay' : '') + (printDate.getTime() == today.getTime() ? ' datepicker_today' : '')) + '"' + (unselectable ? '' : ' onmouseover="jQuery(this).addClass(\'datepicker_daysCellOver\');' + (!showStatus || (otherMonth && !showOtherMonths) ? '' : 'jQuery(\'#datepicker_status_' + this._id + '\').html(\'' + (dateStatus.apply((this._input ? this._input[0] : null), [printDate, this]) || '&#xa0;') + '\');') + '"' + ' onmouseout="jQuery(this).removeClass(\'datepicker_daysCellOver\');' + (!showStatus || (otherMonth && !showOtherMonths) ? '' : 'jQuery(\'#datepicker_status_' + this._id + '\').html(\'&#xa0;\');') + '" onclick="jQuery.datepicker._selectDay(' + this._id + ',' + printDate.getMonth() + ',' + printDate.getFullYear() + ', this);"') + '>' + (otherMonth && !otherMonthsActive ? (showOtherMonths ? printDate.getDate() : '&#xa0;') : (unselectable ? printDate.getDate() : '<a href="javascript:void(0);">' + printDate.getDate() + '</a>')) + '</td>';
                        printDate.setDate(printDate.getDate() + 1);
                    }
                    html += '</tr>';
                }
                drawMonth++;
                if (drawMonth > 11) {
                    drawMonth = 0;
                    drawYear++;
                }
                html += '</tbody></table></div>';
            }
        }
        html += (showStatus ? '<div id="datepicker_status_' + this._id + '" class="datepicker_status">' + (this._get('initStatus') || '&#xa0;') + '</div>' : '') + (!closeAtTop && !this._inline ? controls : '')
        return html;
    },
    _generateMonthYearHeader: function (drawMonth, drawYear, minDate, maxDate, selectedDate, secondary) {
        minDate = (this._rangeStart && minDate && selectedDate < minDate ? selectedDate : minDate);
        var showStatus = this._get('showStatus');
        var hideIfNoPrevNext = this._get('hideIfNoPrevNext');
        var html = '<div class="datepicker_header">';
        var monthNames = this._get('monthNames');
        if (secondary || !this._get('changeMonth')) {
            html += monthNames[drawMonth] + '&#xa0;';
        }
        else {
            var monthName = monthNames[drawMonth];
            var stepMonths = this._get('stepMonths');
            var prevMonth = '<div class="datepicker_newMonth_prev">' + (this._canAdjustMonth(-1, drawYear, drawMonth) ? '<a href="javascript:void(0);" onclick="jQuery.datepicker._adjustDate(' + this._id + ', -' + stepMonths + ', \'M\');"' + (showStatus ? this._addStatus(this._get('prevStatus') || '&#xa0;') : '') + '>' + this._get('prevText') + '</a>' : (hideIfNoPrevNext ? '' : '<a href="javascript:void(0);" onclick="void(0);" class="disabled">' + this._get('prevText') + '</a>')) + '</div>';
            var nextMonth = '<div class="datepicker_newMonth_next">' + (this._canAdjustMonth(+1, drawYear, drawMonth) ? '<a href="javascript:void(0);" onclick="jQuery.datepicker._adjustDate(' + this._id + ', +' + stepMonths + ', \'M\');"' + (showStatus ? this._addStatus(this._get('nextStatus') || '&#xa0;') : '') + '>' + this._get('nextText') + '</a>' : (hideIfNoPrevNext ? '>' : '<a href="javascript:void(0);" onclick="void(0);" class="disabled">' + this._get('nextText') + '</a>')) + '</div>';
            html += '<div class="datepicker_newMonth">' + prevMonth + '<span class="datepicker_month_title">' + monthName + '</span>' + nextMonth + '</div>';
        }
        if (secondary || !this._get('changeYear')) {
            html += drawYear;
        }
        else {
            var stepYears = this._get('stepYears');
            var prevYear = '<div class="datepicker_newYear_prev">' + (this._canAdjustMonth(-1, drawYear, drawMonth) ? '<a href="javascript:void(0);" onclick="jQuery.datepicker._adjustDate(' + this._id + ', -' + stepYears + ', \'Y\');"' + (showStatus ? this._addStatus(this._get('prevStatus') || '&#xa0;') : '') + '>' + this._get('prevText') + '</a>' : (hideIfNoPrevNext ? '' : '<a href="javascript:void(0);" onclick="void(0);" class="disabled">' + this._get('prevText') + '</a>')) + '</div>';
            var nextYear = '<div class="datepicker_newYear_next">' + (this._canAdjustMonth(+1, drawYear, drawMonth) ? '<a href="javascript:void(0);" onclick="jQuery.datepicker._adjustDate(' + this._id + ', +' + stepYears + ', \'Y\');"' + (showStatus ? this._addStatus(this._get('nextStatus') || '&#xa0;') : '') + '>' + this._get('nextText') + '</a>' : (hideIfNoPrevNext ? '>' : '<a href="javascript:void(0);" onclick="void(0);" class="disabled">' + this._get('nextText') + '</a>')) + '</div>';
            html += '<div class="datepicker_newYear">' + prevYear + '<span class="datepicker_year_title">' + drawYear + '</span>' + nextYear + '</div>';
        }
        html += '</div>';
        return html;
    },
    _addStatus: function (text) {
        return ' onmouseover="jQuery(\'#datepicker_status_' + this._id + '\').html(\'' + text + '\');" ' + 'onmouseout="jQuery(\'#datepicker_status_' + this._id + '\').html(\'&#xa0;\');"';
    },
    _adjustDate: function (offset, period) {
        var year = this._selectedYear + (period == 'Y' ? offset : 0);
        var month = this._selectedMonth + (period == 'M' ? offset : 0);
        var day = Math.min(this._selectedDay, this._getDaysInMonth(year, month)) + (period == 'D' ? offset : 0);
        var date = new Date(year, month, day);
        var minDate = this._getMinMaxDate('min', true);
        var maxDate = this._getMinMaxDate('max');
        date = (minDate && date < minDate ? minDate : date);
        date = (maxDate && date > maxDate ? maxDate : date);
        this._selectedDay = date.getDate();
        this._selectedMonth = date.getMonth();
        this._selectedYear = date.getFullYear();
    },
    _getNumberOfMonths: function () {
        var numMonths = this._get('numberOfMonths');
        return (numMonths == null ? [1, 1] : (typeof numMonths == 'number' ? [1, numMonths] : numMonths));
    },
    _getMinMaxDate: function (minMax, checkRange) {
        var date = this._determineDate(minMax + 'Date', null);
        if (date) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        }
        return date || (checkRange ? this._rangeStart : null);
    },
    _getDaysInMonth: function (year, month) {
        return 32 - new Date(year, month, 32).getDate();
    },
    _getFirstDayOfMonth: function (year, month) {
        return new Date(year, month, 1).getDay();
    },
    _canAdjustMonth: function (offset, curYear, curMonth) {
        var numMonths = this._getNumberOfMonths();
        var date = new Date(curYear, curMonth + (offset < 0 ? offset : numMonths[1]), 1);
        if (offset < 0) {
            date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
        }
        return this._isInRange(date);
    },
    _isInRange: function (date) {
        var newMinDate = (!this._rangeStart ? null : new Date(this._selectedYear, this._selectedMonth, this._selectedDay));
        newMinDate = (newMinDate && this._rangeStart < newMinDate ? this._rangeStart : newMinDate);
        var minDate = newMinDate || this._getMinMaxDate('min');
        var maxDate = this._getMinMaxDate('max');
        return ((!minDate || date >= minDate) && (!maxDate || date <= maxDate));
    },
    _getFormatConfig: function () {
        var shortYearCutoff = this._get('shortYearCutoff');
        shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
        return {
            shortYearCutoff: shortYearCutoff,
            dayNamesShort: this._get('dayNamesShort'),
            dayNames: this._get('dayNames'),
            monthNamesShort: this._get('monthNamesShort'),
            monthNames: this._get('monthNames')
        };
    },
    _formatDate: function (day, month, year) {
        if (!day) {
            this._currentDay = this._selectedDay;
            this._currentMonth = this._selectedMonth;
            this._currentYear = this._selectedYear;
        }
        var date = (day ? (typeof day == 'object' ? day : new Date(year, month, day)) : new Date(this._currentYear, this._currentMonth, this._currentDay));
        return $.datepicker.formatDate(this._get('dateFormat'), date, this._getFormatConfig());
    }
});

function extendRemove(target, props) {
    $.extend(target, props);
    for (var name in props) {
        if (props[name] == null) {
            target[name] = null;
        }
    }
    return target;
};
$.fn.attachDatepicker = function (settings) {
    return this.each(function () {
        var inlineSettings = null;
        for (attrName in $.datepicker._defaults) {
            var attrValue = this.getAttribute('date:' + attrName);
            if (attrValue) {
                inlineSettings = inlineSettings || {};
                try {
                    inlineSettings[attrName] = eval(attrValue);
                }
                catch (err) {
                    inlineSettings[attrName] = attrValue;
                }
            }
        }
        var nodeName = this.nodeName.toLowerCase();
        if (nodeName == 'input') {
            var instSettings = (inlineSettings ? $.extend($.extend({}, settings || {}), inlineSettings || {}) : settings);
            var inst = (inst && !inlineSettings ? inst : new DatepickerInstance(instSettings, false));
            $.datepicker._connectDatepicker(this, inst);
        }
        else if (nodeName == 'div' || nodeName == 'span') {
            var instSettings = $.extend($.extend({}, settings || {}), inlineSettings || {});
            var inst = new DatepickerInstance(instSettings, true);
            $.datepicker._inlineDatepicker(this, inst);
        }
    });
};
$.fn.removeDatepicker = function () {
    var jq = this.each(function () {
        var $this = $(this);
        var nodeName = this.nodeName.toLowerCase();
        var calId = this._calId;
        this._calId = null;
        if (nodeName == 'input') {
            $this.siblings('.datepicker_append').replaceWith('');
            $this.siblings('.datepicker_trigger').replaceWith('');
            $this.removeClass($.datepicker.markerClassName).unbind('focus', $.datepicker.showFor).unbind('keydown', $.datepicker._doKeyDown).unbind('keypress', $.datepicker._doKeyPress);
            var wrapper = $this.parents('.datepicker_wrap');
            if (wrapper) {
                wrapper.replaceWith(wrapper.html());
            }
        }
        else if (nodeName == 'div' || nodeName == 'span') {
            $this.removeClass($.datepicker.markerClassName).empty();
        }
        if ($('input[_calId=' + calId + ']').length == 0) {
            $.datepicker._inst[calId] = null;
        }
    });
    if ($('input.hasDatepicker').length == 0) {
        $.datepicker._datepickerDiv.replaceWith('');
    }
    return jq;
};
$.fn.enableDatepicker = function () {
    return this.each(function () {
        this.disabled = false;
        $(this).siblings('button.datepicker_trigger').each(function () {
            this.disabled = false;
        });
        $(this).siblings('img.datepicker_trigger').css({
            opacity: '1.0',
            cursor: ''
        });
        var $this = this;
        $.datepicker._disabledInputs = $.map($.datepicker._disabledInputs, function (value) {
            return (value == $this ? null : value);
        });
    });
};
$.fn.disableDatepicker = function () {
    return this.each(function () {
        this.disabled = true;
        $(this).siblings('button.datepicker_trigger').each(function () {
            this.disabled = true;
        });
        $(this).siblings('img.datepicker_trigger').css({
            opacity: '0.5',
            cursor: 'default'
        });
        var $this = this;
        $.datepicker._disabledInputs = $.map($.datepicker._disabledInputs, function (value) {
            return (value == $this ? null : value);
        });
        $.datepicker._disabledInputs[$.datepicker._disabledInputs.length] = this;
    });
};
$.fn.isDisabledDatepicker = function () {
    if (this.length == 0) {
        return false;
    }
    for (var i = 0; i < $.datepicker._disabledInputs.length; i++) {
        if ($.datepicker._disabledInputs[i] == this[0]) {
            return true;
        }
    }
    return false;
};
$.fn.changeDatepicker = function (name, value) {
    var settings = name || {};
    if (typeof name == 'string') {
        settings = {};
        settings[name] = value;
    }
    return this.each(function () {
        var inst = $.datepicker._getInst(this._calId);
        if (inst) {
            extendRemove(inst._settings, settings);
            $.datepicker._updateDatepicker(inst);
        }
    });
};
$.fn.showDatepicker = function () {
    $.datepicker.showFor(this);
    return this;
};
$.fn.setDatepickerDate = function (date, endDate) {
    return this.each(function () {
        var inst = $.datepicker._getInst(this._calId);
        if (inst) {
            inst._setDate(date, endDate);
            $.datepicker._updateDatepicker(inst);
        }
    });
};
$.fn.getDatepickerDate = function () {
    var inst = (this.length > 0 ? $.datepicker._getInst(this[0]._calId) : null);
    return (inst ? inst._getDate() : null);
};
$(document).ready(function () {
    $.datepicker = new Datepicker();
    $(document.body).append($.datepicker._datepickerDiv).mousedown($.datepicker._checkExternalClick);
});

if (typeof(SNI.Common) == 'undefined') {
    SNI.Common = {};
}
SNI.Common.Carousel = function (element, config) {
    config = $.extend({
        pause: null,
        scroll: 1,
        animation: "slow",
        auto: 0,
        wrap: null,
        pagelink: null,
        pagetext: null,
        start: 1
    }, config);
    var crsl_itemFirstInCallback = function (carousel, item, idx, state) {
        if (config["pagelink"] == "text") {
            var tmpText = config["pagetext"];
            tmpText = tmpText.replace(/_current/ig, idx);
            tmpText = tmpText.replace(/_total/ig, carousel["options"]["size"]);
            carousel.container.find(".jcarousel-pagetext").html(tmpText);
        } else if (config["pagelink"] == "image") {
            carousel.container.find('.jcarousel-pageimg a.current').removeClass("current");
            link = carousel.container.find('.jcarousel-pageimg a')[idx - 1];
            jQuery(link).addClass("current");
        }
    };
    var crsl_initCallback = function (carousel, state) {
        if ((config["pagelink"] == "text") || (config["pagelink"] == "both")) {
            carousel.container.append('<div class="jcarousel-pagetext"></div>');
        } else if ((config["pagelink"] == "image") || (config["pagelink"] == "both")) {
            var imgLinks = "";
            for (var i = 1; i <= carousel["options"]["size"]; i++) {
                imgLinks += '<a href="#' + i + '">' + i + '</a>';
            }
            carousel.container.append('<div class="jcarousel-pageimg"></div>');
            carousel.container.find(".jcarousel-pageimg").append(imgLinks);
            carousel.container.find(".jcarousel-pageimg").css("left", parseInt(carousel.container.width()) / 2 - parseInt(carousel.container.find(".jcarousel-pageimg").width()) / 2);
            carousel.container.find('.jcarousel-pageimg a').bind('click', function () {
                carousel.scroll(jQuery.jcarousel.intval(jQuery(this).html()));
                return false;
            });
        }
    };
    return $(element).find('.crsl').jcarousel({
        scroll: config["scroll"],
        animation: config["slow"],
        auto: config["auto"],
        wrap: config["wrap"],
        itemFirstInCallback: crsl_itemFirstInCallback,
        initCallback: crsl_initCallback,
        start: config["start"]
    });
};

if (typeof(SNI.DIY) == "undefined") {
    SNI.DIY = {};
}

SNI.DIY.ANIMATION_SPEED = 150;


DIYApplicationConfig.prototype = new SNI.UR.ApplicationConfig();

function DIYApplicationConfig() {
    DIYApplicationConfig.prototype = new SNI.UR.ApplicationConfig();
}
if (typeof SNI.Community == 'undefined') {
    SNI.Community = {};
}
SNI.Community.UR = {
    init: function () {
        if (typeof SNI.Community.siteName == 'string') {
            if (typeof this.ViewingUserName == 'string') {
                this.logged_in = true;
            }
        } else {
            var user = new SNI.UR.UrUser(new DIYApplicationConfig());
            if (user.isLoggedIn == true) {
                this.ViewingUserId = user.getUserId();
                this.ViewingUserName = user.getEmail();
                this.ViewingUserDisplayName = user.getUserName();
                this.logged_in = true;
            }
        }
    },
    logout: function () {
        var host = window.location.hostname;
        var domain = 'http://my.diynetwork.com/';
        if (host.indexOf("dev") != -1) {
            domain = 'http://test1-my.diynetwork.com/';
        } else if (host.indexOf("staging") != -1) {
            domain = 'http://test2-my.diynetwork.com/';
        }
        window.location.href = domain + 'redirectors/logout_redirector.jsp?DEST_URL=' + escape(window.location.href);
    },
    displayName: function () {
        var name = this.ViewingUserDisplayName;
        if (typeof name != 'string' || name == '') {
            var email = this.ViewingUserName;
            if (typeof email == "string" && email.indexOf('@') != -1) {
                return email.substring(0, email.indexOf('@'));
            }
            return email;
        }
        return name;
    }
};
(function ($) {
    $.widget("ui.dropdown", {
        _init: function () {
            this.options.title = this.options.title || this.element.find('option.select-title').text();
            this.list = $.ui.dropdown.buildList(this.element, this.options);
            this.element.after(this.list);
            this.css = {
                position: this.element.css('position'),
                left: this.element.css('left')
            };
            this.element.hide();
            if (this.element.attr('disabled')) {
                this.disable();
            } else {
                this.enable();
            }
        },
        enable: function () {
            var $this = this;
            this.options.disabled = false;
            this.element.removeAttr('disabled');
            this.list.find('.disabled').removeClass('disabled');
            var handle = this.list.find('dt a');
            handle.mousedown(function () {
                $.ui.dropdown.hideDropDowns();
                $this.list.find('.fly-dd').show();
                $(this).parent('.fly-dt').addClass('active');
                $('body').bind("mousedown", $.ui.dropdown.bodyClicked);
                return false;
            });
            return this.element;
        },
        disable: function () {
            this.options.disabled = true;
            this.element.attr('disabled', 'disabled');
            this.list.find('dt').addClass('disabled');
            var handle = this.list.find('dt a');
            handle.unbind('mousedown');
            return this.element;
        },
        destroy: function () {
            this.element.removeData("dropdown");
            this.list.remove();
            this.element.show();
        },
        select: function () {
            if (this.element.get(0).selectedIndex > -1) {
                var html = '<em></em><span>' + this.element.get(0)[this.element.get(0).selectedIndex].text + '</span>';
                this.list.find('.fly-dt a').html(html);
            }
        }
    });
    $.ui.dropdown.buildList = function (element, options) {
        select = element.get(0);
        option = select.selectedIndex > -1 ? select[select.selectedIndex] : false;
        var selected = option ? option.text : '';
        var classNames = 'ui-dropdown ' + element.get(0).className;
        var ddList = '<dl class="' + classNames + '">';
        ddList += options.disabled ? '<dt class="fly-dt disabled">' : '<dt class="fly-dt">';
        ddList += '<a><em></em><span>' + selected + '</span></a></dt>';
        var ddClassName = options.ddClassName ? options.ddClassName + ' fly-dd ' : 'fly-dd ';
        ddList += '<dd style="display: none;" class="' + ddClassName + '">';
        ddList += '<div class="fly-hd"></div>';
        ddList += '<div class="fly-bd">';
        ddList += '<a class="close"></a>';
        if (options.title) {
            ddList += '<h3>' + options.title + '</h3>';
        }
        ddList += '</div>';
        ddList += '<div class="fly-ft"></div>';
        ddList += '</dd>';
        ddList += '</dl>';
        ddList = $(ddList);
        ddList.find('.close').click(function () {
            $.ui.dropdown.hideDropDowns();
            return false;
        });
        var list = $('<ul class="fly-ul"></ul>');
        element.children('option:not(.select-title)').each(function (index) {
            var linkText = $(this).text();
            var link = $('<a href="#">' + linkText + '</a>');
            var isSelected = element[0].options[element[0].selectedIndex].text == linkText;
            link.click(function () {
                $('li', list).removeClass("selected");
                $(this).parent().addClass("selected");
                if (!isSelected) {
                    ddList.find('.fly-dt a').html('<em></em><span>' + linkText + '</span>');
                    element.find('option:not(.select-title)')[index].selected = true;
                    $.ui.dropdown.hideDropDowns();
                    element.trigger('change');
                } else {
                    $.ui.dropdown.hideDropDowns();
                }
                return false;
            });
            var item = $('<li class="fly-li' + (isSelected ? ' selected' : '') + '"></li>').append(link);
            list.append(item);
        });
        ddList.find('.fly-bd').append(list);
        return ddList;
    };
    $.ui.dropdown.hideDropDowns = function (event) {
        $('dl.ui-dropdown .fly-dd').hide();
        $('dl.ui-dropdown .active').removeClass('active');
        $('body').unbind("mousedown", $.ui.dropdown.bodyClicked);
        return true;
    };
    $.ui.dropdown.bodyClicked = function (event) {
        var element = $(event.target);
        if (element.parents().is('.ui-dropdown')) {
            return false;
        }
        $.ui.dropdown.hideDropDowns();
    };
    $.ui.dropdown.defaults = {
        title: '',
        disabled: false,
        ddClassName: 'flyout'
    };
})(jQuery);
$.validator.setDefaults({
    errorElement: 'span',
    onfocusout: false,
    onkeyup: false,
    onclick: false,
    highlight: function (element, errorClass) {
        $(element).addClass(errorClass);
        $(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
    },
    unhighlight: function (element, errorClass) {
        $(element).removeClass(errorClass);
        $(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
    }
});
$.validator.addMethod("spaces", function (value, element) {
    return this.optional(element) || value.indexOf(' ') == -1;
}, "Spaces are not allowed");
$.validator.addMethod("multipleEmails", function (value, element) {
    if (this.optional(element)) {
        return true;
    }
    var friendsEmails = value.split(",");
    var isEmail = true;
    $.each(friendsEmails, function () {
        var patternTest = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test($.trim(this));
        if (patternTest == false) {
            isEmail = false;
        };
    });
    return isEmail;
}, "One of these is not a valid e-mail address");
SNI.DIY.GlobalHeader = {
    globalNav: function () {
        settings = ({
            navTimer: null,
            initializeMenu: "#diy-sub-nav li",
            flyoutTopOffset: $("#diy-hd .nav").height() - 8,
            navWidth: $("#diy-sub-nav").width(),
            padWest: 6,
            padEast: 23
        });
        hideAll();
        initMenu();

        function initMenu() {
            var menu = settings.initializeMenu;
            $(menu).find('h3:first span').click(function () {
                hideAll();
            });
            $(menu + "[class ^= 'nav-']").each(function (i) {
                menuItem = $(this);
                var flyOutWidth = menuItem.find('div.flyout').outerWidth();
                var tabWidth = menuItem.outerWidth();
                var divs = $(this).prevAll();
                var leftOffset = 0;
                $.each(divs, function () {
                    leftOffset = leftOffset + parseInt($(this).width());
                });
                if (menuItem.hasClass("nav-w")) {
                    leftOffset = (leftOffset) + (settings.padWest);
                } else {
                    if ($(this).hasClass("all-nav")) {
                        leftOffset = (settings.navWidth - flyOutWidth) + (settings.padEast);
                    } else {
                        leftOffset = (leftOffset - (flyOutWidth) + tabWidth) + (settings.padEast);
                    }
                }
                menuItem.find('div.flyout').css({
                    left: leftOffset + 'px',
                    top: settings.flyoutTopOffset + 'px'
                });
                menuItem.hover(function (e) {
                    hideAll();
                    var $this = $(this);
                    $this.addClass("nav-on");
                    settings.navTimer = setTimeout(function () {
                        $this.find('div.flyout').show();
                        navTimer = null;
                    }, 250);
                }, function (e) {
                    clearTimeout(settings.navTimer);
                    settings.navTimer = null;
                    var closeDiv = $(this);
                    settings.navTimer = setTimeout(function () {
                        closeDiv.removeClass("nav-on");
                        closeDiv.find('div.flyout').hide();
                        settings.navTimer = null;
                    }, 100);
                });
            });
        }

        function hideAll() {
            clearTimeout(settings.navTimer);
            settings.navTimer = null;
            $("#diy-sub-nav li[class ^= 'nav-']").each(function () {
                var navItem = $(this);
                navItem.removeClass("nav-on");
                navItem.find('div.flyout').hide();
            });
        }
    },
    globalSearch: function (element, autosuggest, searchInputTxt) {
        if (autosuggest === true) {
            function findValue(li) {
                if (li == null) {
                    return alert("No match!");
                } else {
                    $(element + ' form').submit();
                    return li.selectValue;
                }
            }

            function selectItem(li) {
                findValue(li);
            }

            function formatItem(row) {
                return row[0];
            }
            var host = window.location.hostname;
            if (host.indexOf("www.diynetwork.com") != -1 || host.indexOf("beta.diynetwork.com") != -1) {
                $(element + " input").autocomplete("/search/autosuggest.do", {
                    delay: 10,
                    width: 341,
                    minChars: 3,
                    matchSubset: 1,
                    matchContains: 0,
                    cacheLength: 10,
                    onItemSelect: selectItem,
                    onFindValue: findValue,
                    formatItem: formatItem,
                    autoFill: false
                });
            }
        }
        var gh = this;
        $(element + ' form').submit(function () {
            var form = $(this);
            var searchText = $.trim(form.find('input').val());
            var searchIn = $(form).find('option[selected]').attr('id');
            var searchAction = $(form).find('select').val();
            if (searchText == '' || searchText == searchInputTxt) {
                gh.noSearchPopup(form);
                return false;
            } else if (searchIn == 'tv') {
                $(this).attr('action', searchAction);
            } else if (searchIn == 'prod-tools') {
                searchText = searchText.replace(/\s+/, '+').toLowerCase();
                window.location.href = searchAction + searchText + '_keyword';
                return false;
            }
            return true;
        });
    },
    noSearchPopup: function (form) {
        var gh = this;
        if (typeof gh.noSearchHTML == 'undefined') {
            var html = '<div class="flyout flg fly-dd noscroll noquery">';
            html += ' <div class="fly-hd"></div>';
            html += ' <div class="fly-bd">';
            html += '  <a class="close"></a>';
            html += '  <div class="col1">&nbsp;</div>';
            html += '  <div class="col2">';
            html += '   <p>Please enter a term or phrase into the search field.<br />We recommend you search by:</p>';
            html += '   <ul class="list">';
            html += '    <li><strong>Space</strong> (e.g. <a href="#">bathroom</a>, <a href="#">bedroom</a>)</li>';
            html += '      <li><strong>Show</strong> (e.g. <a href="#">Cool Tools</a>, <a href="#">Knitty Gritty</a>)</li>';
            html += '      <li><strong>Project Focus</strong> (e.g. <a href="#">plumbing</a>, <a href="#">drywall</a>)</li>';
            html += '      <li><strong>Structure</strong> (e.g. <a href="#">fire pit</a>, <a href="#">pergolas</a>)</li>';
            html += '   </ul>';
            html += '  </div>';
            html += ' </div>';
            html += ' <div class="fly-ft"></div>';
            html += '</div>';
            html = $(html);
            gh.noSearchHTML = html;
            $('.list a', html).click(function () {
                form.find('input').val($(this).text());
                form.submit();
                return false;
            });
            $('.close', html).click(function () {
                form.find('input').focus();
                html.fadeOut('fast');
                return false;
            });
            $('body').bind("mousedown", function (event) {
                var element = $(event.target);
                if (element.parents().is('div.noquery')) {
                    return false;
                }
                html.fadeOut('fast');
                $('body').unbind("mousedown", this);
            });
            $('#diy-site-hd').append(html);
        } else {
            var html = gh.noSearchHTML;
        }
        html.fadeIn('fast');
    },
    init: function () {
        var searchInputTxt = "Find Projects, How-tos and Experts' Advice";
        SNI.Util.inputField("#diy-search-input", searchInputTxt);
        SNI.DIY.GlobalHeader.globalNav();
        SNI.DIY.GlobalHeader.globalSearch('#diy-masthead .search', true, searchInputTxt);
        SNI.DIY.GlobalHeader.signin();
        SNI.DIY.ProjectFinder.init();
    },
    signin: function () {
        SNI.Community.UR.init();
        if (SNI.Community.UR.logged_in === true) {
            var name = SNI.Community.UR.displayName();
            var signin = $('#sign-in');
            var flyout = $('.flyout', signin);
            signin.hover(function () {
                flyout.fadeIn();
            }, function () {
                var timer = setTimeout(function () {
                    flyout.hide();
                    clearTimeout(timer);
                    timer = null;
                }, 100);
            });
            $('.sign-out', signin).click(function () {
                SNI.Community.UR.logout();
                return false;
            });
            $('.close', signin).click(function () {
                flyout.hide();
                return false;
            });
            $('#sign-in .link').text('Hi, ' + name);
        }
    }
};
SNI.DIY.ProjectFinder = {
    isLoaded: false,
    items: null,
    itemsCache: {
        'all': null,
        'tv': null
    },
    selectedTab: 'all',
    expanded: false,
    init: function () {
        var pf = this;
        var bodyId = document.body.id;
        var hdPadDflt = (bodyId == 'blog-cabin') ? 82 : 40;
        var hdPadExpand = (bodyId == 'blog-cabin') ? 248 : 222;
        var pfWrap = $('#find-project-wrap');
        var win = $(window);
        var pfButton = $("#pf-btn");
        var floatDiv = $("#diy-site-hd");
        this.ajaxUrl = this.getAjaxUrl();
        SNI.DIY.Omniture.ClickTrack('#get-proj a', 'Project Finder');

        function fireOmnitureClick() {
            SNI.DIY.Omniture.ClickTrackFire(pfButton, 'Project Finder');
        }
        pfButton.toggle(function () {
            SNI.DIY.ProjectFinder.load();
            if (win.scrollTop() == 0) {
                growHeader();
            }
            pfButton.addClass('pf-btn-open').attr('rel', 'pf-open');
            fireOmnitureClick();
            pfWrap.animate({
                height: 167
            }, 750, 'easeOutBack', function () {
                $('.proj-pane ul', pfWrap).show();
                $('#pf-results', pfWrap).show();
            });
            $('.proj-pane', pfWrap).animate({
                height: 131
            }, 750, 'easeOutBack');
            pfButton.blur();
            pf.expanded = true;
            return false;
        }, function () {
            if (win.scrollTop() == 0) {
                shrinkHeader();
            }
            $('#pf-results', pfWrap).hide();
            $(".proj-pane ul", pfWrap).hide();
            pfButton.removeClass('pf-btn-open').attr('rel', 'pf-close');
            fireOmnitureClick();
            pfWrap.animate({
                height: 0
            }, 500, 'easeOutCubic', function () {
                pfWrap.hide();
            });
            pfButton.blur();
            pf.expanded = false;
            return false;
        });
        win.scroll(function () {
            if (win.scrollTop() == 0) {
                if (pf.expanded) {
                    growHeader();
                } else {
                    shrinkHeader();
                }
            }
        });

        function growHeader() {
            $('#diy-hd').animate({
                paddingTop: hdPadExpand
            }, 750, 'easeOutBack');
        }

        function shrinkHeader() {
            $('#diy-hd').animate({
                paddingTop: hdPadDflt
            }, 500, 'easeOutCubic');
        }
        if ($.browser.msie && (parseInt($.browser.version) < 7)) {
            floatDiv.css({
                position: 'absolute'
            });
            win.scroll(function () {
                floatDiv.css({
                    top: win.scrollTop()
                });
            });
        }
        var tabs = $('.proj-tabs h2', pfWrap);
        tabs.click(function () {
            if (this.id == 'pf-all-proj' && !pf.isAllProjects()) {
                tabs.removeClass('pf-tab-on');
                $(this).addClass('pf-tab-on');
                $('.proj-wrap:eq(2) h2', pfWrap).text('What Activity Do You Want To Do?');
                pf.loadAll();
            } else if (this.id == 'pf-tv-prog' && pf.isAllProjects()) {
                tabs.removeClass('pf-tab-on');
                $(this).addClass('pf-tab-on');
                $('.proj-wrap:eq(2) h2', pfWrap).text('When Was The Show On?');
                pf.loadTV();
            }
        });
    },
    open: function () {
        if (!this.expanded) {
            $("#pf-btn").click();
        }
    },
    load: function () {
        if (!this.isLoaded) {
            this.lists = [$('#proj-lst'), $('#work-lst'), $('#activity-lst')];
            this.isLoaded = true;
            this.loadAll();
        }
    },
    loadAll: function () {
        this.selectedTab = 'all';
        this.items = this.itemsCache[this.selectedTab];
        this.loadList([], this.lists, 0);
    },
    loadTV: function () {
        this.selectedTab = 'tv';
        this.items = this.itemsCache[this.selectedTab];
        this.loadList([], this.lists, 0);
    },
    loadList: function (keys, lists, level) {
        this.getItem(keys, lists, level);
    },
    displayList: function (item, keys, lists, level) {
        var pf = this;
        pf.setAvailableProjects(item.c);
        if (level >= lists.length) {
            return;
        }
        var list = lists[level];
        var html = '';
        $.each(item.i, function (key, value) {
            html += '<li rel="' + key + '"><a href="#">X</a>' + value.l + '</li>';
        });
        html = $(html);
        html.click(function () {
            var li = $(this);
            var key = li.attr('rel');
            if (!li.hasClass('sel')) {
                $('a', html).click(function (event) {
                    li.removeClass('sel');
                    pf.loadList(keys, lists, level);
                    $(this).unbind('click');
                    return false;
                });
            }
            html.removeClass('sel');
            li.addClass('sel');
            var newKeys = [];
            $.each(keys, function (i, value) {
                newKeys.push(value);
            });
            newKeys.push(key);
            pf.loadList(newKeys, lists, level + 1);
            return false;
        });
        for (var i = level + 1; i < lists.length; i++) {
            var emptyHtml = '';
            if (level == 0 && i == 1) {
                if (pf.isAllProjects()) {
                    emptyHtml = '<li class="empty-pane">Select<br />category</li>';
                } else {
                    emptyHtml = '<li class="empty-pane">Select a<br />TV Show</li>';
                }
            } else if (level == 1 && i == 2) {
                emptyHtml = '<li class="empty-pane">Select<br />an object</li>';
            }
            lists[i].removeClass('populated').html(emptyHtml);
        }
        lists[level].addClass('populated');
        lists[level].html(html);
        return html;
    },
    getItem: function (keys, lists, level) {
        var pf = this;
        var item = null;
        pf.abortPreviousRequests();
        if (pf.items) {
            var found = true;
            var tempItem = pf.items;
            var count = 0;
            $.each(keys, function (i, value) {
                if (tempItem && tempItem['i'] && tempItem['i'][value]) {
                    tempItem = tempItem['i'][value];
                } else {
                    found = false;
                }
                count++;
            });
            if (found && (count == 3 || tempItem['i'])) {
                item = tempItem;
            }
        }
        if (item) {
            pf.displayList(item, keys, lists, level);
            pf.updateSearchButton();
        } else {
            pf.showLoading(lists, level);
            try {
                pf.xhr = $.ajax({
                    dataType: 'script',
                    url: pf.buildAjaxUrl(),
                    success: function (result) {
                        if (typeof pfind == 'object') {
                            result = pfind;
                            item = pf.cacheItem(keys, result);
                            pf.displayList(item, keys, lists, level);
                            pf.updateSearchButton();
                        } else {
                            lists[0].html('<li class="empty-pane">Error Retrieving<br />Data</li>');
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        lists[0].html('<li class="empty-pane">' + textStatus + '</li>');
                    },
                    complete: function (request, textStatus) {
                        pf.xhr = null;
                    }
                });
            } catch (e) {
                lists[0].html('<li class="empty-pane">AJAX Request<br />Error</li>');
            }
        }
        return item;
    },
    abortPreviousRequests: function () {
        if (this.xhr) {
            this.xhr.abort();
        }
    },
    cacheItem: function (keys, item) {
        var size = keys.length;
        var result = null;
        if (size == 0) {
            this.items = item;
            result = this.items;
        } else if (size == 1) {
            this.items['i'][keys[0]]['i'] = item.i;
            result = this.items['i'][keys[0]];
        } else if (size == 2) {
            this.items['i'][keys[0]]['i'][keys[1]]['i'] = item.i;
            result = this.items['i'][keys[0]]['i'][keys[1]];
        }
        this.updateItemsCache();
        return result;
    },
    updateItemsCache: function () {
        this.itemsCache[this.selectedTab] = this.items;
    },
    showLoading: function (lists, level) {
        lists[level].removeClass('populated').html('<li class="loading"></li>');
        for (var i = level + 1; i < lists.length; i++) {
            lists[i].removeClass('populated').html('<li class="empty-pane"></li>');
        }
    },
    setAvailableProjects: function (num) {
        $('#avail-proj').text(this.formatNumber(num));
    },
    getAjaxUrl: function () {
        var domain = this.getDomain();
        return domain + 'diy/batchCache/easyProjectFinder/projectFinder.xsl/';
    },
    getDomain: function () {
        var host = window.location.hostname;
        var domain = 'http://www.diynetwork.com/';
        if (host.indexOf("staging-diynetwork.com") != -1) {
            domain = 'http://www.staging-diynetwork.com/';
        } else if (host.indexOf("dev-diynetwork.com") != -1) {
            domain = 'http://www.dev-diynetwork.com/';
        } else if (host.indexOf("beta.diynetwork.com") != -1) {
            domain = 'http://beta.diynetwork.com/';
        }
        return domain;
    },
    buildAjaxUrl: function () {
        var url = this.ajaxUrl;
        var count = 0;
        if (this.isAllProjects()) {
            url += 'projects';
        } else {
            url += 'shows';
        }
        $('#find-project-wrap li.sel').each(function (key, value) {
            var rel = $(value).attr('rel');
            url += '-' + rel;
            count++;
        });
        for (i = count; i < 5; i++) {
            url += '-0';
        }
        url += '.js';
        return url;
    },
    buildSearchUrl: function () {
        var domain = this.getDomain();
        var searchUrl = domain + 'search/results.do?easyProjectFinder=';
        if (this.isAllProjects()) {
            searchUrl += 'projects+'
        } else {
            searchUrl += 'shows+';
        }
        $('#find-project-wrap .proj-pane li.sel').each(function (key, value) {
            searchUrl += $(this).attr('rel') + '+';
        });
        return searchUrl.substring(0, searchUrl.length - 1);
    },
    updateSearchButton: function () {
        $('#get-proj a').attr('href', this.buildSearchUrl());
    },
    isAllProjects: function () {
        return this.selectedTab == 'all';
    },
    formatNumber: function (nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
};
SNI.DIY.Carousel = function (element, config) {
    SNI.Common.Carousel(element, config);
    $(window).load(function () {
        $("#pgallery .largeImage .imgpanel").css("left", "1px");
        $("#pgallery .largeImage .imgpanel").css("bottom", "1px");
        $("#pgallery .jcarousel-clip").css("position", "relative");
    });
};
SNI.DIY.CarouselGallery = function (carousel, options, photos) {
    carousel = SNI.Common.Carousel(carousel, options);
    photos = $(photos);
    var listItems = $('.crsl-group li', carousel);
    $('a', listItems).click(function () {
        var link = $(this);
        var item = link.parent().parent('li');
        var index = listItems.index(item);
        var photo = $(photos.get(index));
        if (photo && photo.is(':hidden')) {
            listItems.removeClass('active');
            item.addClass('active');
            photos.filter(':visible').fadeOut();
            photo.fadeIn();
        }
        return false;
    });
};
SNI.DIY.Tabs = function (element, config) {
    var tabs = $(element).tabs(config);
    if (!config || config.forcePositionCenter !== false) {
        var nav = tabs.data('tabs').element;
        var navWidth = 0;
        nav.children().each(function () {
            navWidth += $(this).outerWidth({
                margin: true
            });
        });
        var marginLeft = Math.round((nav.width() / 2.0) - (navWidth / 2.0));
        nav.css({
            position: 'absolute',
            'margin-left': marginLeft,
            zoom: '1'
        });
    }
};
SNI.DIY.Accordion = function (element, config) {
    SNI.DIY.Accordion.overflowFix = ($.browser.mozilla && parseFloat($.browser.version) <= 1.9);
    SNI.DIY.Accordion.dynamicFix = ($.browser.msie && parseInt($.browser.version) < 8);
    config = $.extend({
        autoheight: true,
        header: '.acco-link',
        change: SNI.DIY.Accordion.change,
        animated: 'easeOutSine'
    }, config);
    var acco = $(element).accordion(config);
    if (SNI.DIY.Accordion.overflowFix || SNI.DIY.Accordion.dynamicFix) {
        $(config.header, acco).click(function () {
            var link = $(this);
            if (!link.hasClass('ui-state-active')) {
                if (SNI.DIY.Accordion.dynamicFix) {
                    $('.ui-accordion-content .crsl', acco).hide();
                }
                if (SNI.DIY.Accordion.overflowFix) {
                    $('.ui-accordion-content .list, .ui-accordion-content .thumbs', acco).css('overflow', 'hidden');
                }
            }
        });
    }
};
SNI.DIY.Accordion.change = function (event, ui) {
    if (SNI.DIY.Accordion.dynamicFix) {
        $('.crsl', ui.newContent).show();
    }
    if (SNI.DIY.Accordion.overflowFix) {
        $('.list, .thumbs', ui.newContent).css('overflow', 'auto');
    }
};
SNI.DIY.Dynlead = {
    init: function (elem, config) {
        SNI.DIY.Dynlead.config = $.extend({
            delay: 4000,
            fadeSpeed: 'slow',
            changeOn: 'mouseover'
        }, config);
        SNI.DIY.Dynlead.timeout = null;
        SNI.DIY.Dynlead.activeItem = null;
        SNI.DIY.Dynlead.contents = $('.dl-content li', elem);
        SNI.DIY.Dynlead.nav = $('.dl-menu li', elem);
        $('.dl-content li:gt(0)', elem).hide();
        this.enable();
    },
    enable: function () {
        SNI.DIY.Dynlead.nav.bind(SNI.DIY.Dynlead.config.changeOn, function () {
            var item = $(this);
            var itemActive = item.hasClass('active');
            SNI.DIY.Dynlead.nextItem(item);
            return itemActive;
        });
        this.nextItem();
    },
    nextItem: function (nextItem) {
        clearTimeout(SNI.DIY.Dynlead.timeout);
        SNI.DIY.Dynlead.timeout = null;
        if (SNI.DIY.Dynlead.activeItem) {
            if (!nextItem.hasClass('active')) {
                var activeContent = SNI.DIY.Dynlead.itemContent(SNI.DIY.Dynlead.activeItem);
                activeContent.css({
                    opacity: 1
                });
                activeContent.stop();
                activeContent.fadeOut(SNI.DIY.Dynlead.config.fadeSpeed);
                SNI.DIY.Dynlead.itemContent(nextItem).fadeIn(SNI.DIY.Dynlead.config.fadeSpeed);
                SNI.DIY.Dynlead.nav.removeClass('active');
                nextItem.addClass('active');
                SNI.DIY.Dynlead.activeItem = nextItem;
            }
        } else {
            SNI.DIY.Dynlead.activeItem = SNI.DIY.Dynlead.nav.eq(0).addClass('active');
        }
        var activeIndex = SNI.DIY.Dynlead.nav.index(SNI.DIY.Dynlead.activeItem);
        var nextIndex = SNI.DIY.Dynlead.nextItemIndex(activeIndex);
        nextItem = SNI.DIY.Dynlead.nav.eq(nextIndex);
        SNI.DIY.Dynlead.timeout = setTimeout(function () {
            SNI.DIY.Dynlead.nextItem(nextItem);
        }, SNI.DIY.Dynlead.config.delay);
    },
    nextItemIndex: function (activeIndex) {
        return SNI.DIY.Dynlead.nav.length > activeIndex + 1 ? activeIndex + 1 : 0;
    },
    itemContent: function (item) {
        var index = SNI.DIY.Dynlead.nav.index(item);
        return SNI.DIY.Dynlead.contents.eq(index);
    }
};
SNI.DIY.Photogallery3 = {
    cbackHotSpotJSON: function () {
        if (SNI.DIY.Photogallery3.ImageData[ITMCUR].bhs) {
            SNI.DIY.Photogallery3.doHotSpots(ITMCUR);
        }
        SNI.DIY.Photogallery3.insertProdsTab();
        return;
    },
    doHotSpots: function (itmSel) {
        if (typeof SNI.DIY.Photogallery3.Hotspots == "undefined") {
            return;
        }
        imgId = $("#pgallery3 .pglnks li").eq(itmSel).find("a").attr("rel");
        for (i = 0; i < SNI.DIY.Photogallery3.Hotspots.images.length; ++i) {
            if (imgId == SNI.DIY.Photogallery3.Hotspots.images[i].id) {
                SNI.DIY.Photogallery3.applyHotSpots(SNI.DIY.Photogallery3.Hotspots.images[i], itmSel);
                break;
            }
        }
        return;
    },
    applyHotSpots: function (oHS, itmSel) {
        $imgCont = $("#pgallery3 #img-" + (itmSel));
        vi = '';
        vc = '';
        if ($imgCont.hasClass("vert-enl")) {
            vi = "-v";
            vc = " v";
        }
        $imgCont = $imgCont.find(".imgwrap");
        wImg = parseInt($imgCont.css("width"));
        hImg = parseInt($imgCont.css("height"));
        for (i = 0; i < oHS.hotspots.length; ++i) {
            hsID = "hs-" + itmSel + '-' + i + vi;
            hsRel = "hs-" + oHS.id + '-' + oHS.hotspots[i].id;
            sHS = '<span class="hs' + vc + '" id="' + hsID + '"><a href="' + oHS.hotspots[i].url + '" rel="' + hsRel + '">click</a><span>' + oHS.hotspots[i].name + '</span></span>';
            $imgCont.append(sHS);
            $jBtn = $imgCont.find("#" + hsID + " a");
            if (typeof wBtn == "undefined") {
                wBtn = parseInt($jBtn.css("width"));
                hBtn = parseInt($jBtn.css("height"));
            }
            xBtn = Math.round(wImg * oHS.hotspots[i].hotspotXPercent / 100 - wBtn / 2, 0);
            yBtn = Math.round(hImg * oHS.hotspots[i].hotspotYPercent / 100 - hBtn / 2, 0);
            $ePop = $jBtn.next();
            wPop = $ePop.width() + parseInt($ePop.css("padding-left")) + parseInt($ePop.css("padding-right"));
            hPop = $ePop.height() + parseInt($ePop.css("padding-top")) + parseInt($ePop.css("padding-bottom"));
            yPop = yBtn - 4 - hPop;
            if (yPop < 7) {
                yPop = Math.max(yBtn + (hBtn - hPop) / 2, 7);
                if (xBtn + wBtn / 2 > wImg / 2) {
                    xPop = xBtn - 4 - wPop;
                } else {
                    xPop = xBtn + wBtn + 4;
                }
            } else {
                xPop = xBtn + (wBtn - wPop) / 2;
                xPop = Math.min(Math.max(7, xPop), wImg - 7 - wPop);
            }
            $jBtn.css({
                "left": xBtn,
                "top": yBtn
            }).hover(function () {
                $(this).parent().find("span").addClass("on");
            }, function () {
                $(this).parent().find("span").removeClass("on");
            }).bind("click", {
                oHSthis: oHS.hotspots[i]
            }, function (e) {
                SNI.DIY.Omniture.HotSpotClick(e.data.oHSthis, "c");
                return SNI.DIY.Photogallery3.showProd($(this))
            }).parent().find("span").css({
                "left": xPop,
                "top": yPop
            });
        }
        return;
    },
    showProd: function ($hsLink) {
        aID = $hsLink.parent().attr("id").split("-");
        imgNum = parseInt(aID[1]);
        hsNum = parseInt(aID[2]);
        aRel = $hsLink.attr("rel").split("-");
        imgCMA = aRel[1];
        hsCMA = aRel[2];
        imgSel = "#pgallery3 #img-" + imgNum;
        prodSel = "#pgallery3 #prod-" + imgNum;
        bNew = false;
        if ($(prodSel).length == 0) {
            for (i = 0; i < SNI.DIY.Photogallery3.Hotspots.images.length; ++i) {
                if (imgCMA == SNI.DIY.Photogallery3.Hotspots.images[i].id) {
                    oHS = SNI.DIY.Photogallery3.Hotspots.images[i].hotspots;
                    hTabs = '<h4>Products From this Photo:</h4>\n<div class="tab-wrap">\n<ul class="tabs">\n';
                    hCont = '<ul class="cont">';
                    bMkt = true;
                    for (j = 0; j < oHS.length; ++j) {
                        hTabs += '<li><a href="' + oHS[j].url + '">' + oHS[j].name + '</a></li>\n';
                        hCont += '<li>\n<h4><a target="_blank" href="' + oHS[j].url + '">' + SNI.Util.strTrimEllips(oHS[j].name, 42) + '</a></h4>\n';
                        hCont += '<a class="pframe" target="_blank" href="' + oHS[j].url + '"><img width="266" height="200" src="' + oHS[j].imageURL + '"><span>More Info</span></a>';
                        hCont += '<p>' + SNI.Util.strTrimEllips(oHS[j].description, 180) + '</p>\n</li>';
                        bMkt = bMkt && (oHS[j].marketplaceId != "");
                    }
                    hTabs += "</ul>\n</div>\n";
                    hCont += "</ul>\n";
                    break;
                }
            }
            hOut = '<div class="prod clrfix" id="prod-' + imgNum + '">\n';
            hOut += '<div class="l clrfix">';
            hOut += '<a class="close" href="#"><img width="160" src="' + $(imgSel).find("img").attr("src") + '"></a>\n';
            hOut += '<p><a class="close" href="#">Back to Photo</a></p>'
            hOut += hTabs;
            hOut += '</div>\n';
            hOut += '<div class="r">';
            hOut += '<a href="#" class="close">Close</a>\n';
            hOut += hCont;
            if (bMkt) {
                hOut += SNI.DIY.Photogallery3.getProdYMAL();
            }
            hOut += '</div>\n';
            $("#pgallery3 .pglnkmask").before(hOut);
            bNew = true;
            $(prodSel + " .r ul.cont li").each(function (i) {
                $(this).find("a").bind("click", {
                    oHSthis: oHS[i]
                }, function (e) {
                    SNI.DIY.Omniture.HotSpotClick(e.data.oHSthis, "l");
                    return true;
                });
            });
            $(prodSel + " .l .tabs li a").click(function () {
                if ($(this).parent().hasClass("sel")) {
                    return false;
                };
                $(prodSel).find(".l .tabs li").removeClass("sel");
                $(prodSel).find(".r .cont li").removeClass("sel");
                $(this).parent().addClass("sel");
                $(prodSel).find(".r .cont li").eq($(prodSel).find(".l .tabs li").index($(prodSel).find(".l .tabs li.sel"))).addClass("sel");
                if ($(prodSel).find(".r .relProd").length > 0) {
                    $(prodSel).find(".r .relProd").replaceWith(SNI.DIY.Photogallery3.getProdYMAL());
                }
                return false;
            });
            $(prodSel + " a.close").click(function () {
                var $prodCont = $(this).parents(".prod");
                var aID = $prodCont.attr("id").split("-");
                var imgNum = parseInt(aID[1]);
                var imgSel = "#pgallery3 #img-" + imgNum;
                $prodCont.hide();
                $(imgSel).show();
                return false;
            });
        }
        $(prodSel + " .l .tabs li").removeClass("sel").eq(hsNum).addClass("sel");
        $(prodSel + " .r .cont li").removeClass("sel").eq(hsNum).addClass("sel");
        $(imgSel).hide();
        $(prodSel).show();
        if (bNew) {
            $(prodSel + " .tab-wrap").height($(prodSel).offset().top + $(prodSel).innerHeight() - parseInt($(prodSel).css("padding-bottom")) - $(prodSel + " .tab-wrap").offset().top);
        }
        return false;
    },
    getProdYMAL: function () {
        hRet = '';
        if (typeof SNI.DIY.ProductIdeas == "undefined") {
            return hRet;
        }
        iSrcLen = SNI.DIY.ProductIdeas.length;
        if (iSrcLen == 0) {
            return hRet;
        }
        aSrc = new Array(iSrcLen);
        for (i = 0; i < iSrcLen; ++i) {
            aSrc[i] = i;
        }
        iDrawnLen = Math.min(iSrcLen, 3);
        aDrawn = new Array(iDrawnLen);
        for (i = 0; i < iDrawnLen; ++i) {
            j = Math.floor(Math.random() * aSrc.length);
            aDrawn[i] = aSrc[j];
            aSrc.splice(j, 1);
        }
        hRet = '<div class="relProd clrfix">\n';
        hRet += '<a class="more" href="http://marketplace.hgtv.com/">More Products</a><h4>You Might Also Like:</h4>\n';
        hRet += '<ul class="clrfix">\n';
        itmClass = '';
        for (i = 0; i < iDrawnLen; ++i) {
            with(SNI.DIY.ProductIdeas[aDrawn[i]]) {
                if (i == iDrawnLen - 1) {
                    itmClass = ' class="last"';
                }
                hRet += '<li' + itmClass + '><a target="_blank" href="' + pURL + '"><img width="92" height="69" src="' + iURL + '" alt="' + iAlt + '" /><span>' + pName + '</span></a></li>\n';
            }
        }
        hRet += '</ul>\n';
        hRet += '</div>\n';
        return hRet;
    },
    insertProdsTab: function () {
        if (typeof SNI.DIY.Photogallery3.Hotspots == "undefined") {
            return;
        }
        hRet = "<ul>\n<h4>Products From This Gallery</h4>";
        for (i = 0; i < SNI.DIY.Photogallery3.Hotspots.images.length; ++i) {
            oHS = SNI.DIY.Photogallery3.Hotspots.images[i].hotspots;;
            for (j = 0; j < oHS.length; ++j) {
                hRet += '<li><a target="_blank" href="' + oHS[j].url + '"><img src="' + oHS[j].imageURL + '" alt="' + oHS[j].name + '" />';
                hRet += '<p class="first"><a target="_blank" href="' + oHS[j].url + '">' + oHS[j].name + '</a></p></li>\n';
            }
        }
        hRet += "</ul>\n";
        $("#pgallery3 .endframe .tab.shop").append(hRet);
        $("#pgallery3 .endframe .nav .shop").show();
    },
    init: function () {
        EF_IMG_HTML = '<img width="92" height="69" src="http://web.hgtv.com/webhgtv/hg20/imgs/email-share_sm.jpg" alt="Share or Email this Photo Gallery" />';
        ITMCUR = $("#pgallery3 .pglnks li").index($("#pgallery3 .pglnks li.sel"));
        BYLINE = "";
        if ($("#hg-w > .intro p.byline").length > 0) {
            BYLINE = $("#hg-w > .intro p.byline").text();
        }
        ITMPERPANEL = 9;
        XBASE = $("#pgallery3 .pglnks").position().left;
        ITMLAST = $("#pgallery3 .pglnks li").length - 1;
        ITMWIDTH = $("#pgallery3 .pglnks li").outerWidth();
        newwidth = (ITMLAST + 1) * ITMWIDTH;
        if (ITMLAST > ITMPERPANEL) {
            ++newwidth;
        }
        $("#pgallery3 .pglnks").css("width", newwidth);
        $("#pgallery3 .pglnkmask .leftctrl a").click(function () {
            if ($(this).hasClass("dis")) {
                return false;
            }
            itmBaseCur = Math.round((XBASE - $("#pgallery3 .pglnks").position().left) / ITMWIDTH);
            itmBaseNew = Math.max(0, itmBaseCur - ITMPERPANEL);
            if (itmBaseCur == ITMLAST - ITMPERPANEL) {
                $("#pgallery3 .pglnkmask .rightctrl a").removeClass("dis");
            }
            $("#pgallery3 .pglnks").animate({
                left: (XBASE - itmBaseNew * ITMWIDTH) + "px"
            }, SNI.DIY.ANIMATION_SPEED);
            if (itmBaseNew == 0) {
                $("#pgallery3 .pglnkmask .leftctrl a").addClass("dis");
            }
            return false;
        });
        $("#pgallery3 .pglnkmask .rightctrl a").click(function () {
            if ($(this).hasClass("dis")) {
                return false;
            }
            itmBaseCur = Math.round((XBASE - $("#pgallery3 .pglnks").position().left) / ITMWIDTH);
            itmBaseNew = Math.min(ITMLAST - ITMPERPANEL, itmBaseCur + ITMPERPANEL);
            if (itmBaseCur == 0) {
                $("#pgallery3 .pglnkmask .leftctrl a").removeClass("dis");
            }
            $("#pgallery3 .pglnks").animate({
                left: (XBASE - itmBaseNew * ITMWIDTH) + "px"
            }, SNI.DIY.ANIMATION_SPEED);
            if (itmBaseNew == ITMLAST - ITMPERPANEL) {
                $("#pgallery3 .pglnkmask .rightctrl a").addClass("dis");
            }
            return false;
        });
        $("#pgallery3 .pglnks li a").bind("mouseenter", function () {
            if ($(this).parent().hasClass("sel")) {
                return false;
            }
            $(this).parent().find(".tnframe").show();
            $(this).parents(".pglnkmask").addClass("popactive");
        }).bind("mouseleave", function () {
            $(this).parent().find(".tnframe").hide();
            $(this).parents(".pglnkmask").removeClass("popactive");
        });
        $("#pgallery3 .photonav .prevlnk a").click(function () {
            setImg((ITMCUR + ITMLAST) % (ITMLAST + 1));
            return false;
        });
        $("#pgallery3 .photonav .nextlnk a, #pgallery3 .largeImage a.bigimg").click(function () {
            setImg((ITMCUR + 1) % (ITMLAST + 1));
            return false;
        });
        $("#pgallery3 .pglnks a").click(function () {
            if (!$(this).parent().hasClass("sel")) {
                $(this).parent().find(".tnframe").hide();
                setImg($(this).text() - 1);
            }
            return false;
        });
        $("#pgallery3 .largeImage a.vtoggle.enl").click(function () {
            $myImgCont = $(this).parents(".largeImage");
            $myImgCont.removeClass("vert-shr").addClass("vert-enl");
            if ($myImgCont.find(" .hs.v").length == 0) {
                SNI.DIY.Photogallery3.doHotSpots(parseInt($(this).parents(".largeImage").attr("id").split("-")[1]))
            }
            return false;
        });
        $("#pgallery3 .largeImage a.vtoggle.shr").click(function () {
            $myImgCont = $(this).parents(".largeImage");
            $myImgCont.removeClass("vert-enl").addClass("vert-shr");
            return false;
        });
        $("#pgallery3 .largeImage .imgpanel a.open").click(function () {
            $myPanel = $(this).parent();
            $myPanel.find("a.open").hide();
            $myPanel.animate({
                bottom: "0"
            });
            $myPanel.find("a.close").show();
            return false;
        });
        $("#pgallery3 .largeImage .imgpanel a.close").click(function () {
            $myPanel = $(this).parent();
            myCollapseHt = parseInt(Math.max($myPanel.find("h2").outerHeight(), $myPanel.find("a.cap-lnk.close").outerHeight()) + parseInt($myPanel.css("padding-top")) - $myPanel.innerHeight()) + "px";
            $myPanel.find("a.close").hide();
            $myPanel.animate({
                bottom: myCollapseHt
            });
            $myPanel.find("a.open").show();
            return false;
        });

        function setImg(itmSel) {
            if (itmSel == ITMCUR) {
                return;
            }
            doDynOmni(itmSel);
            newImgCont = "#pgallery3 #img-" + itmSel;
            if ($(newImgCont).length > 0) {
                $("#pgallery3 .largeImage, #pgallery3 .prod").hide();
                $(newImgCont).show();
            } else {
                $("#pgallery3 .largeImage").eq(0).clone(true).attr("id", "img-" + itmSel).insertAfter("#pgallery3 .largeImage:last");
                $(newImgCont).hide();
                $("#pgallery3 .largeImage.loading").show();
                $(newImgCont).find(".hs").remove();
                $(newImgCont + " img").remove();
                myImg = new Image();
                if ($(newImgCont + " a.bigimg").length > 0) {
                    $(myImg).appendTo(newImgCont + " a.bigimg");
                } else {
                    $(myImg).appendTo(newImgCont + " .imgwrap");
                }
                $(myImg).load(function () {
                    $("#pgallery3 .largeImage, #pgallery3 .prod").hide();
                    $(newImgCont).show();
                    if (SNI.DIY.Photogallery3.ImageData[itmSel].bhs) {
                        SNI.DIY.Photogallery3.doHotSpots(itmSel);
                    }
                    $("#pgallery3 .largeImage.loading").hide();
                });
                setImgData(SNI.DIY.Photogallery3.ImageData[itmSel], $(newImgCont));
            }
            fixByLine(itmSel);
            if (itmSel == 0) {
                $("#pgallery3 .photonav .prevlnk").css("visibility", "hidden");
            }
            else if (ITMCUR == 0) {
                $("#pgallery3 .photonav .prevlnk").css("visibility", "visible");
            }
            $("#pgallery3 .photonav .pagen span").text(itmSel + 1);
            topPrev = "#pgallery3 .photonav .prevlnk";
            $(topPrev + " img").remove();
            $pgItmPrev = $("#pgallery3 .pglnks li").eq((itmSel + ITMLAST) % (ITMLAST + 1));
            if ($pgItmPrev.find("img").length > 0) {
                $pgItmPrev.find("img").clone().prependTo(topPrev + " a");
            }
            $(topPrev + " a").attr("href", $pgItmPrev.find("a").attr("href"));
            topNext = "#pgallery3 .photonav .nextlnk";
            $(topNext + " img").remove();
            $pgItmNext = $("#pgallery3 .pglnks li").eq((itmSel + 1) % (ITMLAST + 1));
            if ($pgItmNext.find("img").length > 0) {
                $pgItmNext.find("img").clone().prependTo(topNext + " a");
            }
            $(topNext + " a").attr("href", $pgItmNext.find("a").attr("href"));
            if ($(newImgCont + " a.bigimg").length > 0) {
                $(newImgCont + " a.bigimg").attr("href", $pgItmNext.find("a").attr("href"));
            }
            $("#pgallery3 .pglnks li").eq(ITMCUR).removeClass("sel");
            $("#pgallery3 .pglnks li").eq(itmSel).addClass("sel");
            ITMCUR = itmSel;
            SNI.DIY.DynAds.refresh();
            if ($("#print-select a.this").length > 0) {
                plink = $("#print-select a.this").attr("href");
                i = itmSel + 1;
                if (i < 10) {
                    i = '0' + parseInt(itmSel + 1);
                }
                plink = $("#print-select a.this").attr("href");
                plink = plink.replace(/(.*ARTICLE-PRINT-PHOTO-GALLERY-CURRENT).*?(,00.html)$/, "$1_" + i + "$2");
                $("#print-select a.this").attr("href", plink);
            }
            setPanel();
            SNI.Util.hitCount();
            return;
        }

        function doDynOmni(i) {
            ++i;
            if (mdManager.getParameterString("oUrl") == "") {
                mdManager.setParameter("oUrl", mdManager.getParameterString("Url"))
            }
            mdManager.setParameter("Url", mdManager.getParameter("oUrl") + "?i=" + parseInt(i));
            if (i < 10) {
                i = '0' + parseInt(i);
            }
            mdManager.setParameter("UniqueId", mdManager.getParameterString("UniqueId").replace(/(.*?)-([0-9]{1,2})$/, "$1-" + i));
            if (typeof s == "object") {
                s.t();
            }
            return;
        }

        function setImgData(imgData, $inImgCont) {
            if (imgData.bvert) {
                $inImgCont.removeClass("vert-enl").addClass("vert-shr");
            } else {
                $inImgCont.removeClass("vert-shr vert-enl");
            }
            $inImgCont.find("img").attr("src", imgData.iurl).attr("alt", imgData.ialt);
            $myPanel = $inImgCont.find(".imgpanel");
            $myPanel.find("h2").html(imgData.ititle);
            $myPanel.find("cite").html(imgData.icap);
            if ((imgData.rurl != "") && (imgData.rtxt != "")) {
                $myPanel.find(".lgbtn a").attr("href", imgData.rurl);
                $myPanel.find(".lgbtn .lgbtn-text").text(imgData.rtxt);
                $myPanel.find(".lgbtn").removeClass("hide");
            } else {
                $myPanel.find(".lgbtn").addClass("hide");
            }
            if ((imgData.ititle == "") && (imgData.icap == "") && (imgData.rurl == "") && (imgData.rtxt == "")) {
                $myPanel.addClass("hide");
            } else {
                $myPanel.find("a.open").hide();
                $myPanel.find("a.close").show();
                $myPanel.css({
                    bottom: "0"
                });
                $myPanel.removeClass("hide");
            }
            return;
        }

        function fixByLine(itmSel) {
            iCreator = "";
            if (itmSel < SNI.DIY.Photogallery3.ImageData.length) {
                iCreator = SNI.DIY.Photogallery3.ImageData[itmSel].creator;
            }
            if (iCreator != "") {
                if ($("#hg-w > .intro p.byline").length == 0) {
                    $("#hg-w > .intro").append("<p class=\"byline\"></p>");
                }
                $("#hg-w > .intro p.byline").addClass("pic").text("By " + iCreator);
            } else if ($("#hg-w > .intro p.byline.pic").length > 0) {
                if (BYLINE != "") {
                    $("#hg-w > .intro p.byline").removeClass("pic").text(BYLINE);
                } else {
                    $("#hg-w > .intro p.byline").remove();
                }
            }
            return;
        }
        $("#pgallery3 .endframe .nav a").click(function () {
            $("#pgallery3 .endframe .nav li.sel").removeClass("sel");
            $(".endframe .tab").hide();
            $(".endframe .tab." + $(this).parent().parent().attr("class")).show();
            $(this).parent().parent().addClass("sel");
            return false;
        });
        $("#pgallery3 .endframe div.share p#copylink a").click(function () {
            $("#embed_code").select();
            return false;
        });
        $("#pgallery3 .endframe .share .digg a").click(function () {
            window.open('http://digg.com/submit?url=' + encodeURIComponent(location.href) + '&title=' + encodeURIComponent(mdManager.getParameter('Title')));
            return false;
        });
        $("#pgallery3 .endframe .share .fb a").click(function () {
            window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(location.href) + '&t=' + encodeURIComponent(mdManager.getParameter('Title')), 'sharer', 'toolbar=0,status=0,width=626,height=436,resizable=yes');
            return false;
        });
        $("#pgallery3 .endframe .share .mysp a").click(function () {
            window.open('http://www.myspace.com/index.cfm?fuseaction=postto&' + 't=' + encodeURIComponent(mdManager.getParameter('Title')) + '&u=' + encodeURIComponent(location.href));
            return false;
        });
        $("#pgallery3 .endframe .share .deli a").click(function () {
            window.open('http://delicious.com/save?v=5&amp;noui&amp;jump=close&amp;url=' + encodeURIComponent(location.href) + '&amp;title=' + encodeURIComponent(mdManager.getParameter('Title')), 'delicious', 'toolbar=no,width=550,height=550,resizable=yes');
            return false;
        });

        function loadHotSpotJSON() {
            if (typeof SNI.DIY.Photogallery3.hsJSON == "undefined") {
                return;
            }
            myJSONurl = "http://" + location.hostname + SNI.DIY.Photogallery3.hsJSON;
            $.ajax({
                url: myJSONurl,
                dataType: "script",
                cache: true,
                timeout: 10000,
                success: successHotSpotJSON,
                error: errorHotSpotJSON,
                complete: completeHotSpotJSON
            });
            return;
        }

        function errorHotSpotJSON(oXHTTP, stat, oExc) {
            return;
        }

        function successHotSpotJSON(dta, stat) {
            $("#pgallery3").append('<script type="text/javascript">' + dta + '\n SNI.DIY.Photogallery3.cbackHotSpotJSON();</script>');
            return;
        }

        function completeHotSpotJSON(oXHTTP, stat) {
            if (stat == "success") {}
            return;
        }

        function setPanel() {
            itmBaseCur = Math.round((XBASE - $("#pgallery3 .pglnks").position().left) / ITMWIDTH);
            itmBaseNew = Math.max(0, Math.min(ITMLAST - ITMPERPANEL, Math.floor((ITMCUR - 1) / ITMPERPANEL) * ITMPERPANEL));
            if (itmBaseCur != itmBaseNew) {
                itmBaseNew = Math.max(0, Math.min(ITMLAST - ITMPERPANEL, Math.floor((ITMCUR - 1) / ITMPERPANEL) * ITMPERPANEL));
                $("#pgallery3 .pglnks").css("left", (XBASE - itmBaseNew * ITMWIDTH) + "px");
                if (itmBaseCur == 0) {
                    $("#pgallery3 .pglnkmask .leftctrl a").removeClass("dis");
                }
                if (itmBaseNew == 0) {
                    $("#pgallery3 .pglnkmask .leftctrl a").addClass("dis");
                }
                if (itmBaseCur == ITMLAST - ITMPERPANEL) {
                    $("#pgallery3 .pglnkmask .rightctrl a").removeClass("dis");
                }
                if (itmBaseNew == ITMLAST - ITMPERPANEL) {
                    $("#pgallery3 .pglnkmask .rightctrl a").addClass("dis");
                }
            }
        }

        function fixEndFrame() {
            if ($("#pgallery3 .endframe .tab.shop img").length == 0) {
                $("#pgallery3 .endframe .nav .shop").hide();
            }
            if ($("#pgallery3 .endframe .tab.ymal img").length == 0) {
                $("#pgallery3 .endframe .nav .ymal").hide();
                $("#pgallery3 .endframe .nav .email").addClass("sel");
                $("#pgallery3 .endframe .tab.email").show();
            }
            if ($("#pgallery3 .pglnks li:last img").length == 0) {
                $("#pgallery3 .pglnks li:last .tnframe").append(EF_IMG_HTML);
                if ((ITMCUR == ITMLAST) && ($("#pgallery3 .photonav .nextlnk img").length == 0)) {
                    $("#pgallery3 .photonav .nextlnk").prepend(EF_IMG_HTML);
                }
            }
            return;
        }
        bHS = false;
        for (i = 0; i < SNI.DIY.Photogallery3.ImageData.length; i++) {
            bHS = bHS || SNI.DIY.Photogallery3.ImageData[i].bhs;
        }
        if (bHS) {
            if (typeof SNI.DIY.Photogallery3.hsJSON != "undefined") {
                loadHotSpotJSON()
            }
        };
        if (ITMCUR < SNI.DIY.Photogallery3.ImageData.length) {
            if (typeof SNI.DIY.Photogallery3.hsJSON == "undefined") {
                if (SNI.DIY.Photogallery3.ImageData[ITMCUR].bhs) {
                    SNI.DIY.Photogallery3.doHotSpots(ITMCUR);
                }
                if (bHS) {
                    SNI.DIY.Photogallery3.insertProdsTab();
                }
            }
            fixByLine(ITMCUR);
        }
        $("#pgallery3 .photowrap").append('<div class="largeImage loading"><span></span><p>loading</p></div>');
        SNI.DIY.DynAds.init();
        var itmSel = ITMCUR;
        if ($.query.has('i')) {
            itmSel = parseInt($.query.get('i'));
            if (isNaN(itmSel) || (itmSel < 1) || (itmSel > ITMLAST + 1)) {
                itmSel = ITMCUR;
            } else {
                --itmSel;
            }
        }
        if (itmSel != ITMCUR) {
            setImg(itmSel);
        }
        setPanel();
        fixEndFrame();
        return;
    }
};
SNI.DIY.DynAds = {
    descr: {
        active: true,
        refreshRate: 3,
        interstitial: false
    },
    iparm: {
        iURL: "",
        iFmt: "",
        iHREF: "",
        iHeight: "",
        iWidth: "",
        iTrackURL: "",
        bURL: ""
    },
    impressionCt: 1,
    init: function () {
        myJSON = getDartEnterpriseUrl("PHOTO_DESCRIPTOR", 1);
        myJSON += "&params.styles=photoGallery&callback=?";
        $.getJSON(myJSON, SNI.DIY.DynAds.cback_descrJSON);
        return;
    },
    cback_descrJSON: function (oJSON) {
        if (typeof oJSON != "object") {
            return false;
        }
        if (oJSON.photo_descriptor == undefined) {
            return false;
        }
        oJSON = oJSON.photo_descriptor;
        if (oJSON.active == undefined) {
            return false;
        }
        if (oJSON.refreshRate == undefined) {
            return false;
        }
        if (oJSON.active != "true") {
            return false;
        }
        tmp = parseInt(oJSON.refreshRate);
        if (isNaN(tmp)) {
            return false;
        }
        if (tmp < 1 || tmp > 100) {
            return false;
        }
        SNI.DIY.DynAds.descr.active = true;
        SNI.DIY.DynAds.descr.refreshRate = tmp;
        if (oJSON.interstitial == undefined) {
            return false;
        }
        if (oJSON.interstitial == "true") {
            SNI.DIY.DynAds.descr.interstitial = true;
        }
        return true;
    },
    refresh: function () {
        if (!this.descr.active) {
            return;
        }
        $("#pgallery3 .interwrap").remove();
        this.impressionCt++;
        if (this.impressionCt == this.descr.refreshRate) {
            this.impressionCt = 0;
            if (this.descr.interstitial) {
                myJSON = getDartEnterpriseUrl("PHOTO_INTERSTITIAL", 1);
                myJSON += "&params.styles=photoGallery&callback=?";
                $.getJSON(myJSON, SNI.DIY.DynAds.cback_interJSON);
                return;
            } else {
                setDartEnterpriseBanner("BIGBOX", getDartEnterpriseUrl("BIGBOX", 5));
            }
        }
        return;
    },
    cback_interJSON: function (oJSON) {
        $.each(SNI.DIY.DynAds.iparm, function (key, val) {
            SNI.DIY.DynAds.iparm[key] = "";
        });
        if (typeof oJSON != "object") {
            return false;
        }
        if (typeof oJSON.scrippsads != "object") {
            return false;
        }
        if (typeof oJSON.scrippsads.ad != "object") {
            return false;
        }
        for (i = 0; i < oJSON.scrippsads.ad.length; ++i) {
            if (typeof oJSON.scrippsads.ad[i].position != "object") {
                return false;
            }
            with(oJSON.scrippsads.ad[i].position) {
                with(SNI.DIY.DynAds) {
                    if ((iparm.iURL == "") && (id == "interstitial")) {
                        iparm.iURL = media.src;
                        iparm.iFmt = media.format;
                        iparm.iHREF = media.href;
                        iparm.iHeight = media.height;
                        iparm.iWidth = media.width;
                        if (typeof media.tracking.audit == "object") {
                            iparm.iTrackURL = media.tracking.audit.src;
                        }
                    }
                    if ((iparm.bURL == "") && (id == "300syncBanner")) {
                        iparm.bURL = media.src;
                    }
                }
            }
        }
        with(SNI.DIY.DynAds) {
            if (iparm.iURL == "" || iparm.iFmt == "" || iparm.bURL == "") {
                return false;
            }
        }
        SNI.DIY.DynAds.gen_interstitial();
        return true;
    },
    gen_interstitial: function () {
        hRet = "";
        with(SNI.DIY.DynAds) {
            hRet += '<div class="interwrap">';
            hRet += '<a href="#" class="close"><span></span>Next Photo</a>';
            hRet += '<h6>Advertisement</h6>';
            if (iparm.iFmt.toLowerCase() == "swf") {
                hRet += '<div id="interad"></div>';
            } else {
                if (iHREF != "") {
                    hRet += '<a href="' + iparm.iHREF + '">';
                }
                hRet += '<img src ="' + iparm.iURL + '" />';
                if (iHREF != "") {
                    hRet += '</a>';
                }
            }
            hRet += '<iframe class="tracker" width="0" height="0" frameborder="0"></iframe>';
            hRet += '</div>';
            $myImgCont = $("#pgallery3 #img-" + ITMCUR);
            if ($myImgCont.hasClass("vert-enl")) {
                $myImgCont.removeClass("vert-enl").addClass("vert-shr");
            }
            $("#pgallery3 .photowrap").append(hRet);
            $("#pgallery3 .interwrap .close").click(function () {
                $("#pgallery3 .interwrap").remove();
                return false;
            });
            if (iparm.iFmt.toLowerCase() == "swf") {
                swfobject.embedSWF(iparm.iURL, "interad", iparm.iWidth, iparm.iHeight, "9", "http://common.scrippsnetworks.com/common/flash-express-install/expressInstall.swf", "", {
                    wmode: "opaque",
                    allowScriptAccess: "always",
                    quality: "high"
                });
            }
            setDartEnterpriseBanner("BIGBOX", iparm.bURL);
            $("#pgallery3 .interwrap .tracker").attr("src", iparm.iTrackURL);
        }
        return;
    }
};
SNI.DIY.Util = {
    moveToView: function (element, options) {
        options = $.extend({
            anchor: null,
            align: 'left',
            topOffset: 0,
            leftOffset: 0,
            positionInViewport: true
        }, options);
        element = $(element);
        if (options.anchor !== null) {
            var anchor = $(options.anchor);
            var offset = anchor.offset();
            if (options.align == 'right') {
                options.leftOffset += anchor.width();
            }
            options.topOffset += offset.top;
            options.leftOffset += offset.left;
        }
        element.css({
            top: options.topOffset,
            left: options.leftOffset
        });
        if (options.positionInViewport) {
            SNI.DIY.Util.positionInViewport(element);
        }
        element.fadeIn('fast');
    },
    getOffset: function (element) {
        element = $(element);
        var hidden = element.is(":hidden");
        if (hidden) {
            element.show();
        }
        var offset = element.offset();
        if (hidden) {
            element.hide();
        }
        return offset;
    },
    positionInViewport: function (element) {
        element = $(element);
        var windowOffset = 63;
        var offset = SNI.DIY.Util.getOffset(element);
        var width = element.width();
        var height = element.height();
        var win = $(window);
        var browserWidth = win.width();
        var browserHeight = win.height();
        var scrollX = win.scrollLeft();
        var scrollY = win.scrollTop() + windowOffset;
        if (offset.top < scrollY) {
            element.css({
                top: scrollY
            });
        } else if (offset.top + height > (scrollY - windowOffset) + browserHeight) {
            element.css({
                top: ((scrollY - windowOffset) + (browserHeight - height))
            });
        }
        if (offset.left < scrollX) {
            element.css({
                left: scrollX
            });
        } else if (offset.left + width > scrollX + browserWidth) {
            console.log('oh snap');
            element.css({
                left: ((scrollX + browserWidth) - width)
            });
        }
    },
    closeNotice: function () {
        $('.notice-msg .close').click(function () {
            $('.notice-msg').slideUp();
            return false;
        });
    },
    dropdownToLinks: function (select) {
        select = $(select);
        select.change(function () {
            var val = $.trim(select.val());
            if (val != '') {
                window.location.href = val;
            }
        });
    },
    jumpLinkScrollTo: function (e) {
        var winOffset = 70;
        if ($("#find-project-wrap").is(':visible')) {
            winOffset = winOffset + $("#find-project-wrap").height()
        }
        if ($(e).length) {
            var targetOffset = $(e).offset().top - winOffset;
            $('html,body').animate({
                scrollTop: targetOffset
            }, "fast");
            return false;
        }
    }
};
if (typeof(SNI.Player) == 'undefined') {
    SNI.Player = {};
}
SNI.Player.buildDefaultChannelFeedUrl = function (chId) {
    return 'http://www.diynetwork.com/diy/channel/xml/0,,' + chId + ',00.xml';
};
SNI.Player.SNAP = function (divId, cfg, channelId, videoId, playlistTitle, fcnBuildChannelUrl, fcnUserCallback) {
    if (!divId || !cfg) {
        alert("Error loading video player");
        return null;
    }
    if (typeof(mdManager) != undefined) {
        mdManager.addParameter("VideoPlayer", "SNAP");
    }
    if (channelId == undefined) {
        channelId = '';
    }
    if (videoId == undefined || videoId == '') {
        videoId = SNI.Util.getUrlParam('videoId');
    }
    if (fcnBuildChannelUrl == undefined || fcnBuildChannelUrl == '') {
        this.buildChannelFeedUrl = SNI.Player.buildDefaultChannelFeedUrl;
    } else {
        this.buildChannelFeedUrl = fcnBuildChannelUrl;
    }
    this.playerContainerId = divId;
    this.playerId = divId + '-instance';
    var swfUrl = "http://common.scrippsnetworks.com/common/snap/snap-portable-1.3.2.swf";
    var attributes = {
        id: this.playerId,
        name: this.playerId
    };
    this.getPlayerId = function () {
        return this.playerId;
    };
    this.getPlayerContainerId = function () {
        return this.playerContainerId;
    };
    this.loadPlaylist = function (chId, vidId) {
        if (chId == undefined) {
            chId = '';
        }
        if (vidId == undefined) {
            vidId = '';
        }
        var url = this.buildChannelFeedUrl(chId);
        var fl = document.getElementById(this.playerId);
        if (fl != undefined) {
            fl.setPlaylist(chId, url, vidId);
        }
    };
    var tmpChanUrl = '';
    if (channelId != '') {
        tmpChanUrl = this.buildChannelFeedUrl(channelId);
    }
    var flashvars = {
        config: cfg.flashvars.config,
        channel: channelId,
        channelurl: tmpChanUrl,
        videoid: videoId
    };
    if (playlistTitle != undefined) {
        flashvars.playlistTitle = escape(playlistTitle);
    }
    if (cfg.enableSyncAdFix != undefined && cfg.enableSyncAdFix) {
        getJSON = function (json) {
            return eval('(' + json + ')');
        }

        function fcnSystemCallback(eventType, eventInfo) {
            var eventJson = getJSON(eventInfo);
            if (eventType == 'playerReady') {
                var isAutoPlay = eventJson.isAutoPlay;
                var hasPreroll = eventJson.hasPreroll;
                if (isAutoPlay == 'false' || hasPreroll == 'false') {
                    setDefaultBigboxAd();
                }
            }
        }
        flashvars.systemEventHandler = fcnSystemCallback;
    }
    if (fcnUserCallback != undefined) {
        flashvars.userEventHandler = fcnUserCallback;
    }
    swfobject.embedSWF(swfUrl, this.playerContainerId, cfg.dimensions.width, cfg.dimensions.height, "9", "http://common.scrippsnetworks.com/common/flash-express-install/expressInstall.swf", flashvars, cfg.params, attributes);
};
if (typeof(SNI.DIY.Player) == 'undefined') {
    SNI.DIY.Player = {};
}
SNI.DIY.Player.Configs = {
    FullSize: {
        enableSyncAdFix: 1,
        dimensions: {
            width: '576',
            height: '645'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-fullsize.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "opaque",
            bgcolor: "#151615"
        }
    },
    FullSizeNoPlaylist: {
        enableSyncAdFix: 1,
        dimensions: {
            width: '576',
            height: '460'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-fullsize-noplaylist.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "opaque",
            bgcolor: "#151615"
        }
    },
    RightRail: {
        enableSyncAdFix: 0,
        dimensions: {
            width: '320',
            height: '360'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-rightrail.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "opaque",
            bgcolor: "#151615"
        }
    },
    RightRailNoPlaylist: {
        enableSyncAdFix: 0,
        dimensions: {
            width: '320',
            height: '263'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-rightrail-noplaylist.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "opaque",
            bgcolor: "#151615"
        }
    },
    Blog: {
        enableSyncAdFix: 1,
        dimensions: {
            width: '320',
            height: '263'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-blog.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "opaque",
            bgcolor: "#151615"
        }
    },
    Lead: {
        enableSyncAdFix: 1,
        dimensions: {
            width: '400',
            height: '300'
        },
        flashvars: {
            config: "http://images.diynetwork.com/webdiy/diy20/snap-configs/portable-config-lead.xml",
            channel: '',
            channelurl: '',
            videoid: ''
        },
        params: {
            menu: "false",
            scale: "noscale",
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "transparent"
        }
    }
};
SNI.DIY.Player.FullSize = function (divId, channelId, videoId, playlistTitle, fcnUserCallback) {
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.FullSize, channelId, videoId, playlistTitle, null, fcnUserCallback);
};
SNI.DIY.Player.Big = SNI.DIY.Player.FullSize;
SNI.DIY.Player.VideoLibrary = SNI.DIY.Player.FullSize;
SNI.DIY.Player.FullSizeNoPlaylist = function (divId, channelId, videoId, fcnUserCallback) {
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.FullSizeNoPlaylist, channelId, videoId, null, null, fcnUserCallback);
};
SNI.DIY.Player.VideoAsset = SNI.DIY.Player.FullSizeNoPlaylist;
SNI.DIY.Player.RightRail = function (divId, channelId, videoId) {
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.RightRail, channelId, videoId);
};
SNI.DIY.Player.RightRailNoPlaylist = function (divId, channelId, videoId) {
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.RightRailNoPlaylist, channelId, videoId);
};
SNI.DIY.Player.Blog = function (divId, channelId, videoId) {
    buildChannelFeedUrlForBlogs = function (chId) {
        return 'http://www.diynetwork.com/food/channel/xml/0,,' + chId + ',00.xml';
    };
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.Blog, channelId, videoId, '', buildChannelFeedUrlForBlogs);
};
SNI.DIY.Player.Lead = function (divId, channelId, videoId) {
    return new SNI.Player.SNAP(divId, SNI.DIY.Player.Configs.Lead, channelId, videoId);
};
SNI.DIY.Player.NowPlaying = function (eventType, eventInfo) {
    SNI.DIY.Player.NowPlayingExecute(eventType, eventInfo);
}
SNI.DIY.Player.NowPlayingExecute = function (eventType, eventInfo) {
    if (eventType == 'itemBegin') {
        var json = eval('(' + eventInfo + ')');
        if (json.itemType != 'ad') {
            var html = '<h3 class="sub-header">Now Playing</h3>';
            html += '<h4>' + json.videoTitle + ' <span>(' + json.videoDuration + ')</span></h4>';
            html += '<p>' + json.videoDescription + '</p>';
            $('#now-playing').html(html);
        }
    }
}
SNI.DIY.Player.RightRailPickle = function (divId, channelId, videoId, configId) {
    buildChannelFeedUrlForPickle = function (chId) {
        return 'http://www.diynetwork.com/diy/channel/xml/0,,' + chId + ',00.xml';
    };
    if (typeof(configId) == "undefined") {
        configId = '';
    }
    var cfgObj;
    switch (configId) {
    default:
        cfgObj = SNI.DIY.Player.Configs.RightRail;
        break;
    }
    return new SNI.Player.SNAP(divId, cfgObj, channelId, videoId, '', buildChannelFeedUrlForPickle);
};

function DiyAd(adtype, adsize, pos, keywords) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    if (keywords == undefined) {
        keywords = "";
    }
    var ad = new DartAd();
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/js.ng/");
    if (adtype == 'BIGBOX' && pos == 5) {
        ad.addParameter("adtype", 'BIGBOX');
    } else {
        ad.addParameter("adtype", adtype);
    }
    if (adtype == 'LEADERBOARD') {
        ad.addParameter("Params.styles", "SNI_LEADERBOARD");
    }
    if (adtype == 'LEADERBOARD' || adtype == 'PUSHDOWN') {
        ad.addParameter("Role", mdManager.getParameter("Role"));
    }
    ad.addParameter("adsize", adsize);
    ad.addParameter("PagePos", pos);
    ad.useFeature("tile");
    if (keywords != "") {
        var words = keywords.split(" ");
        for (i = 0; i < words.length; i++) {
            ad.addParameter("keyword", words[i]);
        }
    }
    switch (adtype) {
    default:
        writeAd(ad);
        break;
    }
}

function writeAd(ad) {
    if (typeof adRestrictionManager != 'undefined') {
        ad.useIframe = adRestrictionManager.isIframe(ad, mdManager);
        if (adRestrictionManager.isActive(ad, mdManager) != false) {
            adManager.createAd(ad);
        }
    } else {
        adManager.createAd(ad);
    }
}

function LeaderboardAd(pos) {
    if (pos < 0 || pos == undefined || pos == '') {
        pos = 1;
    }
    DiyAd('LEADERBOARD', '468x60', pos);
}

function PushdownAd(pos) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('PUSHDOWN', '', pos);
}

function GoogleBigboxAd(pos) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('GOOGLE_BIGBOX', '', pos);
}

function GoogleLeaderboardAd(pos) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('GOOGLE_LEADERBOARD', '', pos);
}

function BigboxAd(pos, keywords) {
    if (typeof(mdManager) != undefined && mdManager.getParameterString("VideoPlayer") == "") {
        if (pos < 0 || pos == undefined) {
            pos = 1;
        }
        DiyAd('BIGBOX', '', pos, keywords);
    }
}

function BigboxAd300x150(pos, keywords) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('SPONSORSHIP_CONTENT', '', pos, keywords);
}

function SuperstitialAd(pos) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('SUPERSTITIAL', '', pos);
}

function VideoPlayerAd(adtype, adsize, pos) {
    var ad = new AdUrl();
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/html.ng/");
    if (adtype != '') {
        ad.addParameter("adtype", adtype);
    }
    if (adsize != '') {
        ad.addParameter("adsize", adsize);
    }
    if (!pos || pos == '') {
        pos = 1;
    }
    ad.addParameter("PagePos", pos);
    ad.addParameter("Role", mdManager.getParameter("Role"));
    ad.useFeature("tile");
    writeAd(ad);
    return ad.buildExpandedUrl();
}

function PaintOverAd(pos) {
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    DiyAd('SPONSORSHIP_CONTENT', '', pos, 'GLIDDEN');
}

function getDartEnterpriseUrl(adtype, pos) {
    adtype = adtype.toUpperCase();
    var strUrl = VideoPlayerAd(adtype, '', pos);
    return strUrl;
}

function setDartEnterpriseBanner(adType, sync_banner) {
    if (adType == 'LEADERBOARD') {
        if ($("#leaderboard").length > 0) {
            boxW = 728;
            boxH = 90;
            $("#leaderboard").html("<iframe src='" + sync_banner + "\' width=\'" + boxW + "\' height=\'" + boxH + "\'" + "frameborder='0' scrolling='no' marginheight='0' marginwidth='0'></iframe>");
        }
    } else {
        if ($("#bigbox").length > 0) {
            boxW = 300;
            boxH = 250;
            if (sync_banner.indexOf("336x850") > -1) {
                boxW = 336;
                boxH = 850;
            } else if (sync_banner.indexOf("300x600") > -1) {
                boxW = 300;
                boxH = 600;
            }
            $("#bigbox").html("<iframe src='" + sync_banner + "\' width=\'" + boxW + "\' height=\'" + boxH + "\'" + "frameborder='0' scrolling='no' marginheight='0' marginwidth='0'></iframe>");
        }
    }
    return;
}

function setDefaultBigboxAd() {
    if (typeof(mdManager) != undefined && mdManager.getParameterString("VideoPlayer") == "") {
        return;
    }
    var default_ad = VideoPlayerAd('BIGBOX', '', 5);
    if ($("#bigbox").length > 0) {
        boxW = 300;
        boxH = 250;
        if (default_ad.indexOf("336x850") > -1) {
            boxW = 336;
            boxH = 850;
        } else if (default_ad.indexOf("300x600") > -1) {
            boxW = 300;
            boxH = 600;
        }
        $("#bigbox").html("<iframe src='" + default_ad + "\' width=\'" + boxW + "\' height=\'" + boxH + "\'" + "frameborder='0' scrolling='no' marginheight='0' marginwidth='0'></iframe>");
    }
}

function MultiLogoAd(adtype, logoNum) {
    var ad = new DartAd();
    if (logoNum == undefined || logoNum == '' || logoNum > 4 || logoNum < 1) {
        logoNum = 4;
    }
    if (adtype == undefined || adtype == '') {
        adtype = 'LOGO';
    }
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/snDigitalLogo" + logoNum + ".html?");
    ad.addParameter("adtype", adtype);
    ad.addParameter("PagePos", 1);
    if (logoNum > 0) {
        writeAd(ad);
        $(document).ready(function () {
            var sponsor = $('.sponsor-multi-logo');
            if ($('a img', sponsor).length > 0) {
                if (sponsor.parents("div").hasClass("generic-lead")) {
                    $(".generic-lead .hd").css({
                        "border-bottom": "1px solid #e3e3e3",
                        "padding": "5px"
                    });
                }
                if (($('em:first-child', sponsor).length <= 0) && (!(sponsor.parents("div").hasClass("section-title")))) {
                    if (sponsor.is(':only-child') || sponsor.siblings().is(':empty')) {
                        sponsor.prepend('<em class="solo">Sponsored by:</em>');
                    } else {
                        sponsor.prepend("<em>Sponsored by:</em>");
                    }
                }
            }
        });
    }
}

function sponsorTextLinks(adtype, linkNum) {
    var ad = new DartAd();
    if (linkNum == undefined || linkNum == '' || linkNum > 6 || linkNum < 1) {
        linkNum = 6;
    }
    if (adtype == undefined || adtype == '') {
        adtype = 'SPONSORLINKS';
    }
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/[NEW_SERVER_SIDE_FILENAME] " + linkNum + ".html?");
    ad.addParameter("adtype", adtype);
    ad.addParameter("PagePos", 1);
    if (linkNum > 0) {
        writeAd(ad);
    }
}

function sponsorLinks(adtype, linkNum) {
    var ad = new DartAd();
    if (linkNum == undefined || linkNum == '' || linkNum > 6 || linkNum < 1) {
        linkNum = 6;
    }
    if (adtype == undefined || adtype == '') {
        adtype = 'SPONSORLINKS';
    }
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/snd_dp_links" + linkNum + ".html?");
    ad.addParameter("adtype", adtype);
    ad.addParameter("PagePos", 1);
    if (linkNum > 0) {
        writeAd(ad);
    }
}

function WDGuidedNavSearchAds(adtype, pos, keywords, filters, pageNo) {
    var ad = new DartAd();
    if (pos < 0 || pos == undefined) {
        pos = 1;
    }
    if (pageNo > 0 && pageNo != undefined) {
        ad.addParameter("Page", pageNo);
    }
    ad.setUrl("http://" + SNI.Ads._adServerHostname + "/js.ng/");
    ad.addParameter("adtype", adtype);
    ad.addParameter("adsize", "");
    ad.addParameter("PagePos", pos);
    var words = keywords.split(" ");
    for (i = 0; i < words.length; i++) {
        ad.addParameter("keyword", words[i]);
    }
    var words = filters.split(" ");
    for (i = 0; i < words.length; i++) {
        ad.addParameter("filter", words[i]);
    }
    writeAd(ad);
}

function WDGuidedNavSiteAdAds(adtype, keywords, filters, pageNo) {
    WDGuidedNavSearchAds(adtype, 1, keywords, filters, pageNo);
}
if (typeof(SNI.DIY.Toolbar) == "undefined") {
    SNI.DIY.Toolbar = {};
}
SNI.DIY.Toolbar = {
    revealModule: function (trigger, module, container) {
        var containerEl = $("#toolbar");
        if (container != "") {
            containerEl = container;
        }
        $(containerEl).find(trigger).click(function () {
            module.fadeIn(SNI.DIY.ANIMATION_SPEED);
            $(this).addClass("active");
            return false;
        })
    },
    closeModule: function (trigger, module, speed) {
        if (speed == null) {
            speed = SNI.DIY.ANIMATION_SPEED;
        };
        module.fadeOut(speed);
        if ($(trigger).hasClass("active")) {
            $(trigger).removeClass("active");
        };
    },
    fontResize: function (element) {
        $(element).find("li:not(:first)").click(function () {
            var defaultSize = "100%";
            $(element).find("li").removeClass("active");
            $(this).addClass("active");
            if ($(this).hasClass("med")) {
                $("#diy-we, #commentsshell").css("font-size", defaultSize);
            } else if ($(this).hasClass("sm")) {
                $("#diy-we, #commentsshell").css("font-size", "85%");
            } else {
                $("#diy-we, #commentsshell").css("font-size", "116%");
            }
        });
    },
    emailAFriendCaptcha: function () {
        var module = $("#email-a-friend");
        var form = module.find("form");
        form.submit(function () {
            return false;
        });
        var null_value = "";
        var initMessage = form.find("textarea").val();

        function newCaptchaImg() {
            addtime = new Date().getTime();
        };
        $(".email").click(function () {
            form.find('#captcha-img').html('<img src="/app/emailservice2/captchaImg" height="30" width="93" />');
        });
        $("#captcha-request a, .toolbar .email").click(function () {
            newCaptchaImg();
            form.find('#captcha-img').html('<img src="/app/emailservice2/captchaImg?generateNew=true&t=' + addtime + '" height="30" width="93" />');
            return false;
        });
        $(".print").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
        });
        SNI.DIY.Toolbar.revealModule(".email", module);
        $(".close").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
        });
        $(".form-submit a").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
            return false;
        });
        if (mdManager.getPageTitle) {
            var page_title = mdManager.getPageTitle();
            var success_message = module.find('.success strong');
            success_message.text(page_title);
        } else {
            success_message.text('this page');
        };
        var captcha_msg = "Whoops. Please enter the characters in the image to verify you are human."
        form.validate({
            errorLabelContainer: module.find('.message'),
            wrapper: '',
            rules: {
                from_name: {
                    required: true
                },
                from_email: {
                    required: true,
                    email: true
                },
                to_emails: {
                    required: true,
                    multipleEmails: true
                },
                captcha_answer: {
                    required: true
                }
            },
            messages: {
                from_name: {
                    required: "Whoops. Please enter your name."
                },
                from_email: {
                    required: "Whoops. Please enter your e-mail address.",
                    email: "Whoops. Please check the format of your e-mail address and re-enter (i.e. joe@hgtv.com)."
                },
                to_emails: {
                    required: "Whoops. Please enter at least one friend e-mail address.",
                    multipleEmails: "Whoops. One or more of your friend e-mail addresses is not formatted correctly. Please check the format and re-enter (i.e. joe@hgtv.com)."
                },
                captcha_answer: {
                    required: captcha_msg
                }
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    module.find('.message').addClass('alert').text('');
                    element = $(errorList[0].element);
                    if (element.hasClass('isemail')) {
                        element.select();
                    }
                    this.errorList = [this.errorList[0]];
                    this.defaultShowErrors();
                }
            },
            submitHandler: function () {
                form.find('input[name="subject"]').val('Check out this page on DIYNetwork.com!')
                var txtarea = form.find('textarea[name="body"]');
                var txtarea_comment = txtarea.val();
                var page_title = mdManager.getPageTitle();
                var msg_body = form.find('input[name="from_name"]').val() + " thought you would be interested in this link to \"" + page_title + "\" on the DIY Network Web site:\n\n";
                msg_body += "http://" + location.hostname;
                msg_body += mdManager.getParameter("Url") + "\n\n";
                if (txtarea.val() != null_value) {
                    msg_body += "Comments from " + form.find('input[name="from_name"]').val() + ":\n";
                    msg_body += txtarea.val();
                };
                module.find('.message').hide().removeClass("alert");
                form.find('fieldset').hide();
                form.find("label").removeClass("error");
                form.find('button').addClass('disabled').attr('disabled', 'disabled');
                form.find('.cancel').addClass("disabled");
                form.find('.loading').show();
                txtarea.val(msg_body);
                var form_data = form.serialize();
                $.ajax({
                    type: "POST",
                    url: form.attr("action"),
                    dataType: 'json',
                    data: form_data,
                    cache: false,
                    success: function (data) {
                        form.find('.loading').hide();
                        var response = $(data);
                        var emailSent = data.emailSent;
                        var captchaCorrect = data.captchaAnswerValid;
                        if (!emailSent) {
                            txtarea.val(txtarea_comment);
                            form.find('fieldset').show();
                            form.find('button').removeClass('disabled').removeAttr('disabled');
                            form.find('.cancel').removeClass("disabled");
                            if (!captchaCorrect) {
                                form.find("label[for='captcha_answer']").addClass("error");
                                $("#captcha_answer").select();
                                module.find('.message').addClass("alert").text(captcha_msg).show();
                            } else {
                                form.find("label[for='friends-email']").addClass("error");
                                $("#friends-email").select();
                                module.find('.message').addClass("alert").text("Whoops. The e-mail could not be sent to one or more of your friends. Please check the format of their e-mail address and re-enter (i.e. joe@DIYNetwork.com).").show();
                            }
                        } else {
                            var success = module.find('.success');
                            var page_title = mdManager.getPageTitle();
                            form.hide();
                            success.show();
                            var timeout = setTimeout(function () {
                                SNI.DIY.Toolbar.closeModule(".email", module, 300);
                                module.hide();
                                success.hide();
                                txtarea.val(txtarea_comment);
                                module.find('.message').text("All fields are required.").show();
                                form.find("input:text").each(function () {
                                    $(this).val("");
                                });
                                form.find('button').removeClass('disabled').removeAttr('disabled');
                                form.find('.cancel').removeClass("disabled");
                                form.find('fieldset').show();
                                form.show();
                            }, 3000);
                            $(".close").click(function () {
                                clearTimeout(timeout);
                                SNI.DIY.Toolbar.closeModule(".email", module);
                                module.hide();
                                success.hide();
                                txtarea.val(txtarea_comment);
                                module.find('.message').text("All fields are required.").show();
                                form.find("input:text").each(function () {
                                    $(this).val("");
                                });
                                form.find('button').removeClass('disabled').removeAttr('disabled');
                                form.find('.cancel').removeClass("disabled");
                                form.find('fieldset').show();
                                form.show();
                            });
                        }
                    },
                    error: function () {
                        form.find('.loading').hide();
                        txtarea.val(txtarea_comment);
                        form.find('fieldset').show();
                        form.find('button').removeClass('disabled').removeAttr('disabled');
                        form.find('.cancel').removeClass("disabled");
                        module.find('.message').addClass("alert").text("Whoops. We encountered an error when trying to e-mail this page. Please wait a few moments and try again.").show();
                    }
                });
            }
        });
    },
    emailAFriend: function () {
        var module = $("#email-a-friend");
        var form = module.find("form");
        form.submit(function () {
            return false;
        });
        var null_value = "";
        var initMessage = form.find("textarea").val();
        $(".print").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
        });
        SNI.DIY.Toolbar.revealModule(".email", module);
        $(".close").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
        });
        $(".form-submit a").click(function () {
            SNI.DIY.Toolbar.closeModule(".email", module);
            return false;
        });
        if (mdManager.getPageTitle) {
            var page_title = mdManager.getPageTitle();
            var success_message = module.find('.success strong');
            success_message.text(page_title);
        } else {
            success_message.text('this page');
        };
        form.validate({
            errorLabelContainer: module.find('.message'),
            wrapper: '',
            rules: {
                from_name: {
                    required: true
                },
                from_email: {
                    required: true,
                    email: true
                },
                to_emails: {
                    required: true,
                    multipleEmails: true
                }
            },
            messages: {
                from_name: {
                    required: "Whoops. Please enter your name."
                },
                from_email: {
                    required: "Whoops. Please enter your e-mail address.",
                    email: "Whoops. Please check the format of your e-mail address and re-enter (i.e. joe@hgtv.com)."
                },
                to_emails: {
                    required: "Whoops. Please enter at least one friend e-mail address.",
                    multipleEmails: "Whoops. One or more of your friend e-mail addresses is not formatted correctly. Please check the format and re-enter (i.e. joe@hgtv.com)."
                }
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    module.find('.message').addClass('alert').text('');
                    element = $(errorList[0].element);
                    if (element.hasClass('isemail')) {
                        element.select();
                    }
                    this.errorList = [this.errorList[0]];
                    this.defaultShowErrors();
                }
            },
            submitHandler: function () {
                form.find('input[name="subject"]').val('Check out this page on DIYNetwork.com!')
                var txtarea = form.find('textarea[name="body"]');
                var txtarea_comment = txtarea.val();
                var page_title = mdManager.getPageTitle();
                var msg_body = form.find('input[name="from_name"]').val() + " thought you would be interested in this link to \"" + page_title + "\" on the DIY Network Web site:\n\n";
                msg_body += "http://" + location.hostname;
                msg_body += mdManager.getParameter("Url") + "\n\n";
                if (txtarea.val() != null_value) {
                    msg_body += "Comments from " + form.find('input[name="from_name"]').val() + ":\n";
                    msg_body += txtarea.val();
                };
                module.find('.message').hide().removeClass("alert");
                form.find('fieldset').hide();
                form.find("label").removeClass("error");
                form.find('button').addClass('disabled').attr('disabled', 'disabled');
                form.find('.cancel').addClass("disabled");
                form.find('.loading').show();
                txtarea.val(msg_body);
                var form_data = form.serialize();
                $.ajax({
                    type: "POST",
                    url: form.attr("action"),
                    cache: false,
                    data: form_data,
                    success: function (data) {
                        form.find('.loading').hide();
                        var response = $(data);
                        var emailSent = response.eq(7).text();
                        if (emailSent == "false") {
                            txtarea.val(txtarea_comment);
                            form.find('fieldset').show();
                            form.find('button').removeClass('disabled').removeAttr('disabled');
                            form.find('.cancel').removeClass("disabled");
                            form.find("label[for='friends-email']").addClass("error");
                            $("#friends-email").select();
                            module.find('.message').addClass("alert").text("Whoops. The e-mail could not be sent to one or more of your friends. Please check the format of their e-mail address and re-enter (i.e. joe@DIYNetwork.com).").show();
                        } else {
                            var success = module.find('.success');
                            var page_title = mdManager.getPageTitle();
                            form.hide();
                            success.show();
                            var timeout = setTimeout(function () {
                                SNI.DIY.Toolbar.closeModule(".email", module, 300);
                                module.hide();
                                success.hide();
                                txtarea.val(txtarea_comment);
                                module.find('.message').text("All fields are required.").show();
                                form.find("input:text").each(function () {
                                    $(this).val("");
                                });
                                form.find('button').removeClass('disabled').removeAttr('disabled');
                                form.find('.cancel').removeClass("disabled");
                                form.find('fieldset').show();
                                form.show();
                            }, 3000);
                            $(".close").click(function () {
                                clearTimeout(timeout);
                                SNI.DIY.Toolbar.closeModule(".email", module);
                                module.hide();
                                success.hide();
                                txtarea.val(txtarea_comment);
                                module.find('.message').text("All fields are required.").show();
                                form.find("input:text").each(function () {
                                    $(this).val("");
                                });
                                form.find('button').removeClass('disabled').removeAttr('disabled');
                                form.find('.cancel').removeClass("disabled");
                                form.find('fieldset').show();
                                form.show();
                            });
                        }
                    },
                    error: function () {
                        form.find('.loading').hide();
                        txtarea.val(txtarea_comment);
                        form.find('fieldset').show();
                        form.find('button').removeClass('disabled').removeAttr('disabled');
                        form.find('.cancel').removeClass("disabled");
                        module.find('.message').addClass("alert").text("Whoops. We encountered an error when trying to e-mail this page. Please wait a few moments and try again.").show();
                    }
                });
            }
        });
    },
    init: function () {
        SNI.DIY.Toolbar.fontResize(".font-resize");
        if ($("#email-a-friend").attr("name")) {
            SNI.DIY.Toolbar.emailAFriendCaptcha();
        }
        else {
            SNI.DIY.Toolbar.emailAFriend();
        }
    }
};
if (typeof(SNI.DIY.ImageEnlarge) == "undefined") {
    SNI.DIY.ImageEnlarge = {};
}
SNI.DIY.ImageEnlarge = {
    init: function (element, config) {
        config = $.extend({
            clickCtrl: ".img-enlarge",
            insertPoint: element,
            imgFrame: "#blow-up",
            closeCtrl: "#blow-up a.close",
            closeCtrlBtn: "#blow-up a.close-btn"
        }, config);
        $(config.clickCtrl).click(function () {
            $(config.insertPoint).prepend(SNI.DIY.ImageEnlarge.htmlImage(this.href));
            $(config.closeCtrl).click(SNI.DIY.ImageEnlarge.closeImg);
            $(config.closeCtrlBtn).click(SNI.DIY.ImageEnlarge.closeImg);
            return false;
        });
    },
    htmlImage: function (imgURL) {
        retHTML = "<div id='blow-up' class='clrfix'><div class=\"flyout fxlg\"><div class=\"fly-hd\"></div>";
        retHTML += "<div class=\"fly-bd\"><a class=\"close\" href=\"#\"></a><img width='616' src='" + imgURL + "'>";
        retHTML += "<p class=\"blow-up-btn clrfix\"><a href=\"#\" class=\"button close-btn\"><span>Close</span></a></p>";
        if ((typeof pgalurl) != "undefined") {
            retHTML += "<span class='pgal-link'>or <a href='" + pgalurl + "'>Go to Photo Gallery</a></span>";
        }
        retHTML += "</div><div class=\"fly-ft\"></div></div></div>";
        return retHTML;
    },
    closeImg: function (e) {
        $(this).parents().find("#blow-up").remove();
        return false;
    }
};
if (typeof(SNI.DIY.QuickVote) == "undefined") {
    SNI.DIY.QuickVote = {};
}
SNI.DIY.QuickVote = {
    inputLink: "#poll-input-link",
    resultLink: "#poll-result-link",
    submitLink: "#poll-submit-link",
    inputPanel: "#inputPanel",
    inputForm: "#quick-vote-poll",
    resultsPanel: "#resultsPanel",
    submittingPanel: ".poll .submitting",
    loadingPanel: ".poll .loading",
    validateOptions: {
        errorElement: "",
        highlight: "",
        rules: {
            Rating: "required"
        },
        messages: {
            Rating: ""
        },
        errorContainer: "#quick-vote-poll .errormsg"
    },
    voteURL: '',
    resURL: '',
    POLL_Cookie: '',
    oValidator: '',
    init: function (pollnum, voteURL, resURL) {
        SNI.DIY.QuickVote.voteURL = voteURL;
        SNI.DIY.QuickVote.resURL = resURL;
        SNI.DIY.QuickVote.POLL_Cookie = "DIY_poll_" + pollnum;
        SNI.DIY.QuickVote.oValidator = $(SNI.DIY.QuickVote.inputForm).validate(SNI.DIY.QuickVote.validateOptions);
        SNI.DIY.QuickVote.oValidator.resetForm();
        $(SNI.DIY.QuickVote.inputForm).get(0).reset();
        $(SNI.DIY.QuickVote.resultLink).click(function () {
            $(SNI.DIY.QuickVote.inputPanel).hide();
            SNI.DIY.QuickVote.showResults(resURL);
            return false;
        });
        $(SNI.DIY.QuickVote.inputPanel).submit(SNI.DIY.QuickVote.submitVote);
        if (SNI.Util.Cookie.get(SNI.DIY.QuickVote.POLL_Cookie) == "yes") {
            $(SNI.DIY.QuickVote.inputPanel).hide();
            SNI.DIY.QuickVote.showResults(resURL);
        }
        else {
            $(SNI.DIY.QuickVote.inputPanel).show();
        }
    },
    submitVote: function () {
        $(SNI.DIY.QuickVote.inputPanel).hide();
        $(SNI.DIY.QuickVote.submittingPanel).show();
        $.post(SNI.DIY.QuickVote.voteURL, $(SNI.DIY.QuickVote.inputForm).serialize(), SNI.DIY.QuickVote.afterSubmit);
        return false;
    },
    afterSubmit: function () {
        SNI.Util.Cookie.set(SNI.DIY.QuickVote.POLL_Cookie, "yes");
        $(SNI.DIY.QuickVote.submittingPanel).hide();
        SNI.DIY.QuickVote.showResults();
    },
    showResults: function () {
        $(SNI.DIY.QuickVote.loadingPanel).show();
        $(SNI.DIY.QuickVote.resultsPanel).load(SNI.DIY.QuickVote.resURL, '', SNI.DIY.QuickVote.resInit);
        return false;
    },
    resInit: function () {
        $(SNI.DIY.QuickVote.loadingPanel).hide();
        $(SNI.DIY.QuickVote.resultsPanel).show();
        $(SNI.DIY.QuickVote.inputLink).click(function () {
            SNI.DIY.QuickVote.showInputForm();
            return false;
        });
        return;
    },
    showInputForm: function () {
        $(SNI.DIY.QuickVote.resultsPanel).empty();
        $(SNI.DIY.QuickVote.resultsPanel).hide();
        SNI.DIY.QuickVote.oValidator.resetForm();
        $(SNI.DIY.QuickVote.inputForm).get(0).reset();
        $(SNI.DIY.QuickVote.inputPanel).show();
        return false;
    }
};
SNI.DIY.Search = {
    filters: function () {
        var mostUsed = 4;
        var filters = $('.filters .filter');
        filters.each(function (index, value) {
            var list = $('ul', value);
            var children = list.children();
            var total = children.length;
            if (total > mostUsed) {
                var title = list.prev('h5').text();
                if (title.substring(title.length - 1) == ':') {
                    title = title.substring(0, title.length - 1);
                }
                title = 'More ' + title;
                var items = '';
                var a = '';
                var em = '';
                var url = '';
                children.sort(filterCompare).each(function (i, v) {
                    a = $('a', v).text();
                    url = $('a', v).attr("href");
                    em = $('em', v).text();
                    items += '<li class="fly-li"><a href="' + url + '">' + a + ' <em>' + em + '</em></a></li>';
                });
                var classNames = 'flyout fly-dd' + (total <= 7 ? ' noscroll' : '');
                var flyout = '<div class="' + classNames + '">';
                flyout += '<div class="fly-hd"></div>';
                flyout += '<div class="fly-bd">';
                flyout += '<a class="close"></a>';
                flyout += '<h3>' + title + '</h3>';
                flyout += '<ul class="fly-ul">';
                flyout += items;
                flyout += '</ul>';
                flyout += '</div>';
                flyout += '<div class="fly-ft"></div>';
                flyout += '</div>';
                flyout = $(flyout);
                $('li:gt(' + (mostUsed - 1) + ')', list).remove();
                $('.close', flyout).click(function () {
                    hideAllFlyouts();
                    return false;
                });
                $('li a', flyout).click(function () {
                    hideAllFlyouts();
                    return true;
                });
                var moreLink = $('<p class="more"><a href="#">' + title + '</a> <em>(' + total + ')</em></p>');
                $('a', moreLink).click(function () {
                    SNI.DIY.Util.moveToView(flyout, {
                        anchor: moreLink,
                        topOffset: -30,
                        leftOffset: 85
                    });
                    $('body').bind("mousedown", bodyClicked);
                    return false;
                });
                list.after(flyout);
                list.after(moreLink);
            }
        });

        function hideAllFlyouts() {
            $('.filters .flyout').fadeOut('fast');
            $('body').unbind("mousedown", bodyClicked);
            return true;
        }

        function bodyClicked(event) {
            var element = $(event.target);
            if (element.parents().is('.flyout')) {
                return false;
            }
            hideAllFlyouts();
        }

        function filterCompare(a, b) {
            a = a.firstChild.innerHTML.toLowerCase();
            b = b.firstChild.innerHTML.toLowerCase();
            return a < b ? -1 : (a > b ? 1 : 0);
        }
    },
    tips: function (link, tips) {
        var link = $(link);
        var tips = $(tips);
        link.click(function () {
            tips.fadeIn();
            $('body').bind("mousedown", bodyClicked);
            return false;
        });
        $('.close', tips).click(hideTip);

        function hideTip() {
            tips.fadeOut('fast');
            $('body').unbind("mousedown", bodyClicked);
            return true;
        }

        function bodyClicked(event) {
            var element = $(event.target);
            if (element.parents().is('.flyout')) {
                return false;
            }
            hideTip();
        }
    },
    sortBy: function () {
        var select = $('.results-toolbar select');
        select.dropdown();
        select.change(function () {
            SNI.Util.Cookie.persist(SNI.Util.Cookie.SEARCH, 'sortOrder', select.val());
            this.form.submit();
        });
    },
    closeDYMNotice: function () {
        $('.notice-msg .close').click(function () {
            SNI.Util.Cookie.persist(SNI.Util.Cookie.SEARCH, 'hideDym', 'true');
            $('.notice-msg').slideUp();
            return false;
        });
    },
    hideDYMNotice: function () {
        SNI.Util.Cookie.persist(SNI.Util.Cookie.SEARCH, 'hideDym', null);
    }
};
SNI.DIY.Comments = function (element, config) {
    $("#comment-form a.toggle").click(function () {
        $("#comment-form form").toggle("fast");
        $("#comment-form a.toggle").toggleClass('open');
        return false;
    });
};
SNI.DIY.Medialibrary = function (element, config) {
    config = $.extend({
        crsl_class: ".crsl-media"
    }, config);
    togglelist = $(element).find('li.switch');
    togglelist.each(function () {
        var $this = $(this);
        var target = $this.find("h4");
        if (!$this.hasClass("active")) {
            $this.find(config.crsl_class).slideUp();
        };
        target.click(function () {
            if ($this.hasClass("active")) {
                $this.removeClass("active");
                $this.find(config.crsl_class).slideUp(250);
            } else {
                $this.addClass("active");
                $this.find(config.crsl_class).slideDown(250);
            }
        });
    });
};
SNI.DIY.Experts = function (element, config) {
    togglelist = $("#featured li .projectlist");
    togglelist.each(function () {
        var $this = $(this);
        var target = $this.find(".moreoptions");
        var pane = $this.find(".pane");
        target.click(function () {
            target.css("display", "none");
            pane.show("fast");
        });
    });
    featured = $("#featured").height();
    expertlist = $("#expertlist").height(featured);
};
SNI.DIY.FindProjectFromShow = {
    init: function () {
        $(document).ready(function () {
            $('#find-project-from-show .date-box input').attachDatepicker();
        });
    }
};
SNI.DIY.FindProjectOnTV = {
    init: function () {
        var showName = $('#find-a-project #show-name').dropdown();
        var expertName = $('#find-a-project #expert-name').dropdown();
        showName.change(function () {
            expertName.get(0).selectedIndex = 0;
            expertName.dropdown('select');
        });
        expertName.change(function () {
            showName.get(0).selectedIndex = 0;
            showName.dropdown('select');
        });
        $(document).ready(function () {
            $('#find-a-project .date-box input').attachDatepicker();
        });
    }
};
SNI.DIY.ProjectsBySpace = function (carouselElement, carouselOptions, dropdownElement, json, moduleName) {
    var dropdown = $(dropdownElement).dropdown();
    var carousel = SNI.Common.Carousel(carouselElement, carouselOptions);
    $(dropdown).change(function () {
        var content = null;
        if (json[this.value] && (content = json[this.value].content)) {
            var html = '<ul>';
            $.each(content, function (index, item) {
                var title = item[0];
                var link = item[1];
                var image = item[2];
                var alt = item[3];
                var rel = 'pbs-' + (index + 1);
                html += '<li>';
                html += '<a href="' + link + '" rel="' + rel + '"><img src="' + image + '" width="160" height="120" alt="' + alt + '" /></a>';
                html += '<p><a href="' + link + '" rel="' + rel + '">' + title + '</a></p>';
                html += '</li>';
            });
            html += '</ul>';
            html += '<p class="more"><a href="' + json[this.value].more[1] + '" rel="pbs-more">' + json[this.value].more[0] + '</a></p>';
            $(carousel).html(html);
            SNI.Common.Carousel(carouselElement, carouselOptions);
            var selectedSpace = dropdown[0].options[dropdown[0].selectedIndex].text;
            SNI.DIY.Omniture.ClickTrack(carousel, moduleName + ' (' + selectedSpace + ')');
        }
    });
};
SNI.DIY.Contact = function () {
    $('.contact select').dropdown();
    $(".contact form").validate({
        errorContainer: '.contact .form-errors',
        errorLabelContainer: '.contact .form-errors ul',
        wrapper: "li",
        rules: {
            optionaldata5: 'required',
            optionaldata6: 'required',
            email: {
                required: true,
                email: true
            },
            confirm: {
                required: true,
                equalTo: '#email'
            },
            fname: 'required',
            lname: 'required',
            optionaldata4: 'required',
            optionaldata7: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            optionaldata5: 'Please select a reason for contacting us',
            optionaldata6: 'Please select what this is regarding',
            email: {
                required: 'Please enter your e-mail address',
                email: 'Please check the format of your e-mail address and re-enter (i.e. joe@diynetwork.com)'
            },
            confirm: {
                required: 'Please confirm your e-mail address',
                equalTo: 'Please make sure your e-mail and confirmation e-mail match'
            },
            fname: 'Please enter your first name',
            lname: 'Please enter your last name',
            optionaldata4: 'Please enter your zip code',
            optionaldata7: {
                required: 'Please enter a message',
                minlength: 'Please make sure your message is at least 6 characters long'
            }
        }
    });
    $('.contact .form-errors .close').click(function () {
        $('.contact .form-errors').animate({
            opacity: 'toggle',
            height: 'toggle'
        });
    });
    $('.contact .submit a').click(function () {
        $('.contact form')[0].reset();
        return false;
    })
};
SNI.DIY.Newsletter = {
    subscribe: function () {
        SNI.DIY.Newsletter.moreNewsletters();
        SNI.DIY.Newsletter.checkAll();
        SNI.DIY.Newsletter.closeErrors();
        $('.newsletter form').validate({
            errorContainer: '.newsletter .form-errors',
            errorLabelContainer: '.newsletter .form-errors ul',
            wrapper: "li",
            rules: {
                newsletter: {
                    required: function (element) {
                        return $(".newsletter .choose input:checked").length < 1;
                    }
                },
                FIRST_NAME_: 'required',
                LAST_NAME_: 'required',
                email: {
                    required: true,
                    email: true
                },
                email_confirm: {
                    required: true,
                    equalTo: '#email'
                },
                POSTAL_CODE_: 'required'
            },
            messages: {
                newsletter: 'Please check the Newsletter you wish to receive',
                FIRST_NAME_: 'Please enter your first name',
                LAST_NAME_: 'Please enter your last name',
                email: {
                    required: 'Please enter your e-mail address',
                    email: 'Please check the format of your e-mail address and re-enter (i.e. joe@diynetwork.com)'
                },
                email_confirm: {
                    required: 'Please confirm your e-mail address',
                    equalTo: 'Please make sure your e-mail and confirmation e-mail match'
                },
                POSTAL_CODE_: 'Please enter your zip code'
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    if (errorMap.newsletter) {
                        $('.newsletter .newsletter-error').show();
                    } else {
                        $('.newsletter .newsletter-error').hide();
                    }
                    this.defaultShowErrors();
                    SNI.DIY.Newsletter.scrollTop();
                }
            }
        });
    },
    changeEmail: function () {
        SNI.DIY.Newsletter.closeErrors();
        $('.newsletter form').validate({
            errorContainer: '.newsletter .form-errors',
            errorLabelContainer: '.newsletter .form-errors ul',
            wrapper: "li",
            rules: {
                email: {
                    required: true,
                    email: true
                },
                emailnew: {
                    required: true,
                    email: true
                },
                emailnew_confirm: {
                    required: true,
                    equalTo: '#email'
                }
            },
            messages: {
                email: {
                    required: 'Please enter your old e-mail address',
                    email: 'Please check the format of your old e-mail address and re-enter (i.e. joe@diynetwork.com)'
                },
                emailnew: {
                    required: 'Please enter your e-mail address',
                    email: 'Please check the format of your e-mail address and re-enter (i.e. joe@diynetwork.com)'
                },
                emailnew_confirm: {
                    required: 'Please confirm your e-mail address',
                    equalTo: 'Please make sure your e-mail and confirmation e-mail match'
                }
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    this.defaultShowErrors();
                    SNI.DIY.Newsletter.scrollTop();
                }
            }
        });
    },
    unsubscribe: function () {
        SNI.DIY.Newsletter.moreNewsletters();
        SNI.DIY.Newsletter.checkAll();
        SNI.DIY.Newsletter.closeErrors();
        $('.newsletter form').validate({
            errorContainer: '.newsletter .form-errors',
            errorLabelContainer: '.newsletter .form-errors ul',
            wrapper: "li",
            rules: {
                newsletter: {
                    required: function (element) {
                        return $(".newsletter .choose input:checked").length < 1;
                    }
                },
                email: {
                    required: true,
                    email: true
                },
                email_confirm: {
                    required: true,
                    equalTo: '#email'
                }
            },
            messages: {
                newsletter: 'Please check the Newsletter you wish to unsubscribe from',
                email: {
                    required: 'Please enter your e-mail address',
                    email: 'Please check the format of your e-mail address and re-enter (i.e. joe@diynetwork.com)'
                },
                email_confirm: {
                    required: 'Please confirm your e-mail address',
                    equalTo: 'Please make sure your e-mail and confirmation e-mail match'
                }
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    if (errorMap.newsletter) {
                        $('.newsletter .newsletter-error').show();
                    } else {
                        $('.newsletter .newsletter-error').hide();
                    }
                    this.defaultShowErrors();
                    SNI.DIY.Newsletter.scrollTop();
                }
            }
        });
    },
    thanks: function () {
        SNI.DIY.Newsletter.moreNewsletters();
        SNI.DIY.Newsletter.checkAll();
    },
    closeErrors: function () {
        $('.newsletter .form-errors .close').click(function () {
            $('.newsletter .form-errors').slideUp();
        });
    },
    moreNewsletters: function () {
        $('.newsletter .more-newsletters h4 a').click(function () {
            var link = $(this);
            if (link.hasClass('active')) {
                link.removeClass('active')
                $('.newsletter .more-newsletters .bd').slideUp();
                link.blur();
            } else {
                link.addClass('active');
                $('.newsletter .more-newsletters .bd').slideDown();
                link.blur();
            }
            return false;
        });
    },
    checkAll: function () {
        $('.newsletter .more-newsletters .check-all').click(function () {
            var link = $(this);
            var text = link.find('span');
            if (text.text() == 'Check All') {
                text.text('Uncheck All');
                $('.newsletter .more-newsletters input').attr('checked', 'checked');
            } else {
                text.text('Check All');
                $('.newsletter .more-newsletters input').removeAttr('checked');
            }
            return false
        });
    },
    scrollTop: function () {
        var winOffset = 70;
        var win = $(window);
        var winTop = win.scrollTop() + winOffset;
        var errorTop = $('.newsletter .form-errors').offset().top;
        if (errorTop < winTop) {
            win.scrollTop(errorTop - winOffset);
        }
    }
};
SNI.DIY.Countdown = function (element, options) {
    options = $.extend({
        container: null,
        date: 'January 1, 2099 00:00:00',
        updateInterval: 0.5,
        wraps: null,
        onExpire: function () {}
    }, options);
    return $(element).each(function (i) {
        var obj = this;
        var today = new Date();
        var endDate = new Date(options.date);
        var ms = Math.floor(endDate.getTime() - today.getTime());

        function two(x) {
            return ((x > 9) ? "" : "0") + x;
        }

        function three(x) {
            return ((x > 99) ? "" : "0") + ((x > 9) ? "" : "0") + x;
        }

        function MS2DHMSMS(ms) {
            var nt = {};
            var sec = Math.floor(ms / 1000);
            ms = ms % 1000;
            nt.ms = three(ms).toString();
            var min = Math.floor(sec / 60);
            sec = sec % 60;
            nt.ss = two(sec).toString();
            var hr = Math.floor(min / 60);
            min = min % 60;
            nt.mm = two(min).toString();
            var day = Math.floor(hr / 24);
            hr = hr % 24;
            nt.hh = two(hr).toString();
            nt.dd = day.toString();
            return nt;
        }

        function getTimeLeft() {
            var today = new Date();
            var ms = Math.floor(endDate.getTime() - today.getTime());
            if (ms < 0) {
                options.onExpire.call(this, obj);
            }
            sLeft = MS2DHMSMS(ms).ss;
            mLeft = MS2DHMSMS(ms).mm;
            hLeft = MS2DHMSMS(ms).hh;
            dLeft = MS2DHMSMS(ms).dd;
            if (dLeft <= 0) {
                if (hLeft <= 0) {
                    if (mLeft <= 0) {
                        if (sLeft <= 0) {
                            options.onExpire.call(this, obj);
                        }
                    }
                }
            }
            if (options.wraps == null) {
                $(obj).html('<span class="jcdDays">' + dLeft + '</span>&nbsp;<span class="jcdDaysText">day' + s + '</span>&nbsp;<span class="jcdHours">' + hLeft + '</span>:<span class="jcdMinutes">' + mLeft + '</span>:<span class="jcdSeconds">' + sLeft + '</span>');
            } else {
                for (x in options.wraps) {
                    if (x == 'days') {
                        $(options.wraps[x]).html(dLeft);
                    }
                    if (x == 'hours') {
                        $(options.wraps[x]).html(hLeft);
                    }
                    if (x == 'minutes') {
                        $(options.wraps[x]).html(mLeft);
                    }
                    if (x == 'seconds') {
                        $(options.wraps[x]).html(sLeft);
                    }
                }
            }
        }
        if (options.container) {
            $(options.container).css('display', 'block');
            obj.container = options.container;
        }
        if (parseInt(MS2DHMSMS(ms).dd) < 0) {
            options.onExpire.call(this, obj);
        } else {
            if (options.updateInterval) {
                setInterval(function () {
                    getTimeLeft();
                }, options.updateInterval * 1000);
            } else {
                getTimeLeft();
            }
        }
    });
};
SNI.DIY.Topics = {
    topicNav: function () {
        $("#topicNav .nav li").each(function (i) {
            $(this).click(function () {
                $("#topicNav .active").removeClass("active");
                $(this).addClass("active");
                $("#topicNav .bbsctnt:eq(" + i + ")").addClass("active");
            });
            if ($(this).hasClass("active")) {
                $("#topicNav .bbsctnt:eq(" + i + ")").addClass("active");
            }
        });
        $("#topicNav .nav li a").click(function () {
            return false;
        });
    }
};
SNI.DIY.ProjectDetails = {
    jumpLinks: function (element) {
        $(element + ' a[href^=#]').click(function () {
            var target = $(this).attr('href');
            SNI.DIY.Util.jumpLinkScrollTo(target);
        });
    }
};
SNI.DIY.GalleryLibrary = {
    itemsPerPage: 8,
    columnsPerPage: 4,
    galleryUrl: '/diy/feeds/landing-content/json/0,,DIY_',
    itemTitle: 'Photos',
    errorMessage: 'Sorry we could not load the photo galleries.',
    init: function (sectionUrl) {
        this.sectionUrl = sectionUrl;
        this.loadSections();
    },
    loadSections: function () {
        var gl = this;
        gl.showLoading();
        $.ajax({
            dataType: 'script',
            url: gl.sectionUrl,
            success: function (result) {
                gl.hideLoading();
                if (typeof(sections) == "object") {
                    var html = '<ul>';
                    $.each(sections['items'], function (key, value) {
                        html += '<li>';
                        html += '<a href="#" data-section="' + key + '" title="' + value + '">' + SNI.Util.truncate(value, 21) + '</a>';
                        html += '</li>';
                    });
                    html += '</ul>';
                    html = $(html);
                    $('a', html).click(function () {
                        var items = $('.gallery-library .items');
                        $('.viewing', items).html('&nbsp;');
                        $('.pagination', items).html('&nbsp;');
                        gl.loadGallery($(this).attr('data-section'), 1);
                        return false;
                    });
                    $('.gallery-library .sections').html(html);
                    if (sections['default']) {
                        $(".gallery-library .sections ul a[data-section='" + sections['default'] + "']").click();
                    } else {
                        $('.gallery-library .sections ul a:first').click();
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $('.gallery-library .sections').html('<ul></ul>');
                gl.showError();
            }
        });
    },
    loadGallery: function (sectionId, page) {
        var gl = this;
        gl.abortPreviousRequests();
        gl.showLoading();
        var sections = $('.gallery-library .sections ul a');
        sections.removeClass('selected');
        sections.filter("[data-section='" + sectionId + "']").addClass('selected');
        gl.xhr = $.ajax({
            dataType: 'script',
            url: gl.buildGalleryUrl(sectionId, page),
            success: function (result) {
                gl.hideLoading();
                if (typeof(gallery) == "object") {
                    gl.updateViewing(gallery.current_page, gallery.total_pages, gallery.total_items, gallery.gallery_link, gallery.gallery_text);
                    gl.updateThumbs(gallery.items);
                    gl.updatePagination(gallery.current_page, gallery.total_pages);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                gl.showError();
            },
            complete: function (request, textStatus) {
                gl.xhr = null;
            }
        });
    },
    updateViewing: function (currentPage, totalPages, totalItems, galleryLink, sectionTitle) {
        var gl = this;
        var start = currentPage == 1 ? 1 : (gl.itemsPerPage * (currentPage - 1) + 1);
        var end = currentPage == totalPages ? totalItems : start + gl.itemsPerPage - 1;
        var html = start + '-' + end + ' of ' + totalItems;
        html += ' ' + sectionTitle + ' Photo Galleries';
        $('.gallery-library .items .viewing').html(html);
    },
    updateThumbs: function (items) {
        var gl = this;
        var count = 1;
        var html = '<ul>';
        $.each(items, function (key, value) {
            if (count % gl.columnsPerPage == 0) {
                html += '<li class="last">';
            } else {
                html += '<li>';
            }
            html += '<em>(' + value.count + ' ' + gl.itemTitle + ')</em>';
            html += '<a href="' + value.link + '"><img src="' + value.thumb + '" width="120" height="90" alt="' + value.alt_text + '" /></a>';
            html += '<a href="' + value.link + '">' + SNI.Util.truncate(value.title, 50) + '</a>';
            html += '</li>';
            count++;
        });
        for (var i = count; i <= gl.itemsPerPage; i++) {
            if (i % gl.columnsPerPage == 0) {
                html += '<li class="last"></li>';
            } else {
                html += '<li></li>';
            }
        }
        html += '</ul>';
        $('.gallery-library .items .thumbs').html(html);
    },
    updatePagination: function (currentPage, totalPages) {
        var gl = this;
        var html = '<div class="pagi clrfix">';
        if (currentPage > 1) {
            html += '<a class="nextprev prev" href="#">&laquo; Previous</a> ';
        } else {
            html += '<span class="nextprev prev">&laquo; Previous</span> ';
        }
        if (totalPages < 10) {
            html += gl.getPaginationHtml(1, totalPages, currentPage, totalPages);
        } else {
            if (currentPage < 6) {
                html += gl.getPaginationHtml(1, currentPage + 2, currentPage, totalPages);
            } else {
                html += gl.getPaginationHtml(1, 2, currentPage, totalPages);
                html += '<span>...</span>';
                html += gl.getPaginationHtml(currentPage - 2, currentPage + 2, currentPage, totalPages);
            }
            if (currentPage < totalPages - 4) {
                html += '<span>...</span>';
                html += gl.getPaginationHtml(totalPages - 1, totalPages, currentPage, totalPages);
            } else {
                html += gl.getPaginationHtml(currentPage + 3, totalPages, currentPage, totalPages);
            }
        }
        if (currentPage < totalPages) {
            html += '<a class="nextprev next" href="#">Next &raquo;</a>';
        } else {
            html += '<span class="nextprev next">Next &raquo;</span>';
        }
        html = $(html);
        var sectionId = $('.gallery-library .sections ul a.selected').attr('data-section');
        $('a.prev', html).click(function () {
            gl.loadGallery(sectionId, currentPage - 1);
            return false;
        });
        $('a.next', html).click(function () {
            gl.loadGallery(sectionId, currentPage + 1);
            return false;
        });
        $('a.page', html).click(function () {
            gl.loadGallery(sectionId, $(this).text());
            return false;
        });
        $('.gallery-library .items .pagination').html(html);
    },
    getPaginationHtml: function (fromPage, toPage, currentPage, totalPages) {
        var html = '';
        for (var i = fromPage; i <= toPage; i++) {
            if (i > 0 && i <= totalPages) {
                if (i == currentPage) {
                    html += '<span class="current">' + i + '</span> ';
                } else {
                    html += '<a href="#" class="page">' + i + '</a> ';
                }
            }
        }
        return html;
    },
    showError: function () {
        var gl = this;
        var html = $('<div class="viewing">&nbsp;</div><div class="thumbs"><div class="error"><strong>' + gl.errorMessage + '</strong><br />We are working to correct this. <a href="#">Please try again.</a></div></div><div class="pagination">&nbsp;</div>');
        $('a', html).click(function () {
            var selected = $('.gallery-library .sections ul a.selected');
            if (selected.length > 0) {
                selected.click();
            } else {
                gl.loadSections();
            }
            return false;
        });
        gl.hideLoading();
        $('.gallery-library .items').html(html);
    },
    showLoading: function () {
        $('.gallery-library .items .thumbs').html('<div class="loading">Loading Galleries</div>');
    },
    hideLoading: function () {
        $('.gallery-library .items .loading').remove();
    },
    buildGalleryUrl: function (sectionId, page) {
        return this.galleryUrl + sectionId + '_ARTICLE_' + this.itemsPerPage + '_' + page + '_IMAGE_ARTICLE-PHOTO-GALLERY_BC-PHOTO-GALLERY.json';
    },
    abortPreviousRequests: function () {
        if (this.xhr) {
            this.xhr.abort();
        }
    }
};
if (typeof(SNI.DIY.HowTos) == "undefined") {
    SNI.DIY.HowTos = {};
}
SNI.DIY.HowTos = {
    related: function () {
        var relatedContents = $('.step .rc-wrap');
        relatedContents.each(function () {
            var rc = $(this);
            var header = rc.find(" .sub-header");
            var flyout = rc.find(".rc");
            header.bind("mouseenter", function () {
                flyout.show("fast");
            });
            flyout.bind("mouseleave", function () {
                flyout.hide("fast");
            });
            rc.find('.close').click(function () {
                flyout.hide("fast");
            });
        });
    }
};
SNI.DIY.BrowserCheck = {
    init: function () {
        if ($.browser.msie && parseInt($.browser.version) < 7 && !window.XMLHttpRequest) {
            var bc = this;
            if (SNI.Util.Cookie.get('upgradeReminderSet') == null) {
                var html = '<div id="browser-msg" class="notice-msg clrfix"><a href="#" class="close">Close</a><div class="col1"><h4>We noticed you are using Internet Explorer 6.</h4><p>We detected your browser is out of date. For the best possible experience upgrade to the latest version of <a href="http://www.microsoft.com/windows/downloads/ie/">Internet Explorer</a>, or try one of these fine browsers: <a href="http://www.getfirefox.com/">Firefox</a> and <a href="http://www.apple.com/safari/download/">Safari</a>.</p></div><div class="col2"><p><a href="http://www.microsoft.com/windows/downloads/ie/" class="button"><span>Upgrade Internet Explorer</span></a></p>';
                if (SNI.Util.Cookie.get('upgradePreviouslyReminded') == '1') {
                    html += '<p class="remind"><a href="#" class="yes">Remind Me in 30 Days</a> or <a href="#" class="no">Don\'t Remind Me</a></p>';
                }
                html += '</div></div>';
                html = $(html);
                $('a.close, .remind a.yes', html).click(function () {
                    bc.setReminder(30);
                    html.slideUp();
                    SNI.DIY.Omniture.ClickTrackSingle(this, "UpgradeIE6 ", "DIY");
                    return false;
                });
                $('.remind a.no', html).click(function () {
                    bc.setReminder(365);
                    html.slideUp();
                    SNI.DIY.Omniture.ClickTrackSingle(this, "UpgradeIE6 ", "DIY");
                    return false;
                });
                $('#diy-bd').prepend(html);
                html.show();
                SNI.DIY.Omniture.ClickTrackSingle("#browser-msg .col1", "UpgradeIE6 ", "DIY");
                SNI.DIY.Omniture.ClickTrackSingle("#browser-msg .col2", "UpgradeIE6 ", "DIY");
                SNI.DIY.Omniture.ClickTrackSingle("#browser-msg .remind", "UpgradeIE6 ", "DIY");
            }
        }
    },
    setReminder: function (days) {
        SNI.Util.Cookie.set('upgradeReminderSet', '1', days);
        SNI.Util.Cookie.set('upgradePreviouslyReminded', '1', 365 * 2);
    }
};
$(document).ready(function () {
    SNI.DIY.BrowserCheck.init();
});
SNI.DIY.TakeOverHeader = {
    bodyHook: function () {
        var bodyClass = $('#body-hook').attr('rel');
        $('body').addClass(bodyClass);
    }
}

if (typeof(SNI.DIY.Omniture) == 'undefined') {
    SNI.DIY.Omniture = {};
}
SNI.DIY.Omniture.timeout = null;
SNI.DIY.Omniture.queue = [];
SNI.DIY.Omniture.ClickTrack = function (jsel, module, searchKey) {
    var $el = $(jsel);
    if ($el.length == 0) {
        return;
    }
    $el.click(function (e) {
        SNI.DIY.Omniture.ClickTrackFire(e.target, module, searchKey);
        e.stopPropagation();
    });
};
SNI.DIY.Omniture.ClickTrackFire = function (element, module, searchKey) {
    var originalElement = element;
    var element = $(element);
    var isLink = element.is("a");
    if (isLink) {
        var formId = element.parents().filter('form').attr("id");
        if (formId == 'hgSearchForm' || formId == 'hgFtSearchForm') {
            return;
        }
    }
    var parentElement = element.parent();
    var isParentLink = parentElement.is("a");
    var isSubmit = element.attr("type") == "submit";
    if (isLink || isParentLink || isSubmit) {
        if (isSubmit) {
            site = "DIY: " + element.parents().filter('form').attr("name") + " ";
        } else {
            site = "DIY: " + module + " ";
        }
        var s = {};
        s.linkTrackVars = 'prop14,eVar16,prop15,eVar18,prop16,eVar17,prop17,eVar19,prop18,prop19,eVar20,prop20';
        s.prop14 = site;
        s.eVar16 = s.prop14;
        var linkText = element.html();
        var thumbnail = false;
        if (linkText == '' && element.is("img")) {
            linkText = element.attr("alt");
            thumbnail = true;
        }
        s.prop15 = site + linkText;
        s.eVar18 = s.prop15;
        var relid = "relid?";
        var linkUrl = element.attr("href");
        if (isLink) {
            relid = element.attr("rel");
        } else if (isParentLink) {
            relid = parentElement.attr("rel");
            linkUrl = parentElement.attr("href");
        }
        s.prop16 = site + relid;
        s.eVar17 = s.prop16;
        s.prop17 = site + linkUrl;
        s.eVar19 = s.prop17;
        s.prop18 = site + mdManager.getParameter("Url");
        if (typeof(searchKey) !== 'undefined') {
            s.prop19 = "endeca: " + mdManager.getParameter(searchKey + "_name", " ");
            s.eVar20 = s.prop19;
            s.prop20 = "endeca: " + mdManager.getParameter(searchKey + "_style", " ");
        }
        s.element = originalElement;
        SNI.DIY.Omniture.ClickTrackTrigger(s);
    }
}
SNI.DIY.Omniture.ClickTrackTrigger = function (data) {
    if (typeof data == 'object') {
        SNI.DIY.Omniture.queue.push(data);
    }
    if (typeof s_gi == 'function') {
        if (SNI.DIY.Omniture.timeout !== null) {
            clearTimeout(SNI.DIY.Omniture.timeout);
            SNI.DIY.Omniture.timeout = null;
        }
    } else {
        SNI.DIY.Omniture.timeout = setTimeout(function () {
            clearTimeout(SNI.DIY.Omniture.timeout);
            SNI.DIY.Omniture.timeout = null;
            SNI.DIY.Omniture.ClickTrackTrigger();
        }, 1000);
        return false;
    }
    while (SNI.DIY.Omniture.queue.length > 0) {
        var d = SNI.DIY.Omniture.queue.pop();
        var s = s_gi(s_account);
        $.each(d, function (key, value) {
            if (key != 'element') {
                s[key] = value;
            }
        });
        s.tl(d.element, 'o', 'Link Name');
    }
}
SNI.DIY.Omniture.ClickTrackSingle = function (jsel, module, section) {
    var $el = $(jsel);
    if ($el.length == 0) {
        return;
    }
    $el.click(function (e) {
        var $clicked = $(e.target);
        if ($clicked.is("a") || $clicked.parent().is("a")) {
            var linkText = $clicked.html();
            if ((linkText == "") && ($clicked.is("img"))) {
                linkText = $clicked.attr("alt");
            }
            var s = {};
            s.linkTrackVars = 'prop26';
            s.prop26 = section + ": " + module + ": " + linkText;
            s.element = this;
            SNI.DIY.Omniture.ClickTrackTrigger(s);
            e.stopPropagation();
        }
    });
};
SNI.DIY.Omniture.TrackHPBuckets = function (buckets) {
    $.each(buckets, function (i, value) {
        SNI.DIY.Omniture.ClickTrackSingle("#" + value[0] + " h3", value[1], "HP");
        SNI.DIY.Omniture.ClickTrackSingle("#" + value[0] + " .related-feature", value[1], "HP");
        SNI.DIY.Omniture.ClickTrackSingle("#" + value[0] + " .relevant", value[1] + " : All About", "HP");
        SNI.DIY.Omniture.ClickTrackSingle("#" + value[0] + " .related-expert", value[1] + " : Expert", "HP");
    });
};
SNI.DIY.Omniture.TrackTabs = function (tab, tabModuleName) {
    $.each(tab, function (i, value) {
        SNI.DIY.Omniture.ClickTrackSingle("#" + value[0], value[1], "HP : " + tabModuleName);
    });
};

C.coreReady();