// ==UserScript==
// @name         簡潔に！
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  下記のコード譜サイトの選択/コピー/右クリック/印刷の禁止を解除し印刷用に簡潔表示する
// @description  Enable disabled select/copy/right-click/print and fomat the page for printing on some japanese sites.
// @author       yobukodori
// @match        http*://music.j-total.net/data/*
// @match        http*://gakufu.gakki.me/m/data/*
// @match        http*://www.ufret.jp/song.php?*
// @match        http*://ja.chordwiki.org/wiki/*
// @grant        none
// ==/UserScript==

var opt_verbose; // = false;

function hide_element(e)
{
	if (e != null && e.style){
		e.style.display="none";
	}
}

function remove_element(e)
{
	if (e != null && e.parentNode != null){
		e.parentNode.removeChild(e);
	}
}

function hide_elder(e)
{
	if (e != null){
		while  (e = e.nextElementSibling){
			console.log("hide elder " + e2str(e));
			hide_element(e);
		}
	}
}

function remove_elder(e)
{
	if (e != null){
		e = e.nextElementSibling;
		while  (e){
			var next = e.nextElementSibling;
			console.log("remove elder " + e2str(e));
			remove_element(e);
			e = next;
		}
	}
}

function hide_younger(e)
{
	if (e != null){
		while  (e = e.previousElementSibling){
			console.log("hide younger " + e2str(e));
			hide_element(e);
		}
	}
}

function insert_stylesheet(rules)
{
	var d = document, e;
	e = d.createElement("style");
	e.type = "text/css";
	e.innerHTML = rules;
	console.log('append <style type="text/css">'+e.innerHTML+'</style> to the end of head');
	d.getElementsByTagName("head")[0].appendChild(e);
}

var site_data = {
	"music.j-total.net": {
		"event": ["selectstart contextmenu  scroll touchmove"],
		"nonSelectable": [],
		"PrintRules": [],
		"formatPage": function(){
			var d = document, tt, e, ee, i, e2move = [];
			tt = d.querySelector("tt");
			if (tt){
				hide_younger(tt);
				hide_younger(tt.parentElement);
				hide_elder(tt);
				chord_area = null;
				e = tt;
				while (e = e.parentElement){
					if (e.tagName == "TABLE" && e.bgColor == "#F4FAFF"){
						chord_area = e;
						break;
					}
				}
				if (chord_area){
					if (e = d.querySelector('iframe[src$="cpr.html"]')){
						e2move.push(e);
					}
					e2move.push(chord_area);
					for (var i = 0 ; i < e2move.length ; i++){
						d.body.insertBefore(e2move[i], d.body.firstChild);
					}
					remove_elder(e2move[0]);
					ee = chord_area.parentElement.querySelectorAll("table,tr,td");
					for(i=0 ; i < ee.length ; i++){
						e = ee[i];
						if (e.width)
							e.width = "";
						if (e.bgColor)
							e.bgColor = "";
						if (e.align)
							e.align = "";
					}
					ee = chord_area.querySelectorAll("font[color]");
					for(i=0 ; i < ee.length ; i++){
						e = ee[i];
						if (e.color)
							e.color = "";
					}
				}
			}
			insert_stylesheet("@media print{body{display:block!important}}");
		}
	},
	"gakufu.gakki.me": {
		"event": ["selectstart copy keydown contextmenu  scroll touchmove"],
		"nonSelectable": [],
		"PrintRules": [],
		"formatPage": function(){
			var d = document, chord, e, i, e2move = [];
			chord = d.querySelector('#code_area');
			if (chord){
				if (e = d.querySelector('#copyright')){
					e2move.push(e);
				}
				else if (e = d.querySelector('address')){
					e2move.push(e);
				}
				e2move.push(chord);
				if (e = d.querySelector('div.fumen_info_body > div.text')){
					e2move.push(e);
				}
				else if (e = d.querySelector('div.info')){
					e2move.push(e);
				}
				for (i = 0 ; i < e2move.length ; i++){
					d.body.insertBefore(e2move[i], document.body.firstChild);
				}
				remove_elder(e2move[0]);
				hide_element(d.querySelector("#divStayTopLeft"));
			}
			insert_stylesheet(
				"@media print{"
					+ "body{display:block!important}"
					+ "#pageTop2{display:none}"
				+ "}"
				+ "body{min-width:auto!important;text-align:left!important;background:transparent}"
				+ "#code_area{width:auto!important;text-align:left;border:none!important}"
				+ "#code_area p{margin:auto!important}"
				);
		}
	},
	"www.ufret.jp": {
		"pre": function(){
			try {
				if (flag){
					clearInterval(timerID);
					flag = false;
				}
			}catch(x){}
			var fnc = ["autoscroll", "n_noS_shtml", "i_noS_shtml", "bpr_shtml", "cEm_shtml"];
			for (var i = 0 ; i < fnc.length ; i++){
				window[fnc[i]] = function(){};
			}
		},
		"event": ["selectstart copy contextmenu dragstart mousedown beforeprint afterprint scroll touchmove"],
		"PrintRules": function(){
			console.log("search '@media print' in styleSheets");
			var ss = document.styleSheets;
			for(var  i = 0 ; i < ss.length ; i++){
				var s = ss[i], prefix = "document.styleSheets[" + i + "]", m = "";
				try {
					if (s.media && s.media.length > 0 && s.media.mediaText) {
						m = s.media.mediaText;
						console.log("## "+prefix+" @media " + m);
					}
					else {
						var rr = s.cssRules;
						for (var j = 0 ; j < rr.length ; j++){
							var r = rr[j];
							try {
								if (r.media && r.media.length > 0 && r.media.mediaText){
									if (r.media.mediaText == "print"){
										console.log("  ## "+prefix+".cssRules["+j+"]"+" @media " + r.media.mediaText);
										console.log("    cssText:" + r.cssText);
										m = "print";
									}
								}
							}catch(x){}
						}
					}
				}catch(x){}
				if (m == "print"){
					console.log("  ## disabled " + prefix);
					s.disabled = true;
				}
			}
			return [];
		},
		"formatPage": function(){
			var d = document, chord, e, ee, i, e2move = [];
			if (chord = d.querySelector('#original_box > div')){
				if (e = chord.querySelector('#blyodnijb'))
					chord = e;
			}
			else {
				chord = d.querySelector('div[onclick="autoscroll()"]');
			}
			if (chord){
				if (ee = d.querySelectorAll('div.card.card-body.bg-light.p-2 > p')){
					for (i = 0 ; i < ee.length ; i++){
						e = ee[i];
						if (/2013-20\d\d/.test(e.innerText)){
							e.style.textAlign = "";
							e2move.push(e);
							break;
						}
					}
				}
				e2move.push(chord);
				if (e = d.querySelector('div.card.card-body.bg-light.p-2 > div > div > h1')){
					e2move.push(e.parentElement);
				}
				for (var i = 0 ; i < e2move.length ; i++){
					d.body.insertBefore(e2move[i], d.body.firstChild);
				}
				remove_elder(e2move[0]);
				d.body.style.overflow = d.body.style.position = "";
				d.body.className = "";
			}
			insert_stylesheet(
				"@media print{"
					+ "body{display:block!important}"
				+ "}"
				+ "p.atfolhyds{"
					+ "margin-top:-20px!important;padding-top:10px!important;"
				+ "}"
				+ "span.krijcheug{line-height:20px!important}"
				);
		}
	},
	"ja.chordwiki.org": {
		"event": ["copy scroll touchmove"],
		"PrintRules": [],
		"formatPage": function(){
			var d = document, e, i, e2move = [];
			if (e = d.querySelector("div.footer")){
				e2move.push(e);
			}
			e = d.querySelector('div.main');
			if (e){
				e2move.push(e);
				for (var i = 0 ; i < e2move.length ; i++){
					d.body.insertBefore(e2move[i], d.body.firstChild);
				}
				remove_elder(e2move[0]);
			}
			insert_stylesheet(
				"@media print{"
					+ "span.word,span.wordtop{visibility:visible !important}"
					+ "p.line{padding-top:10px}"
				+ "}"
				+ "h1.title,h2.subtitle,div.footer{text-align:left !important}"
				+ "span.chord{top:-1.2em !important}"
				+ "div.main{margin:auto !important;line-height:1.8em !important}"
				);
		}
	},
	"template": {
		"event": [],
		"nonSelectable": [],
		"expose": [],
		"hide": [],
		"PrintRules": []
	}
};

function e2str(e)
{
	if (e == null)
		return "null";
	var s = e.tagName+(e.id?("#"+e.id):"");
	var className = e.className.baseVal != null ? e.className.baseVal : e.className;
	if (className){
		var a = className.split(" ");
		for (var i = 0 ; i < a.length ; i++){
			if (a[i])
				s += "." + a[i];
		}
	}
	return s;
}

function prevent_listeners_preventing_usability(events)
{
	if (events == null)
		events = ["selectstart", "mousedown", "keydown","copy", "contextmenu","touchstart","touchend"];
	for (var i = 0 ; i < events.length ; i++){
		var a = events[i].split(" ");
		for (var j = 0 ; j < a.length ; j++){
			if (a[j]){
				document.addEventListener(a[j], function(event){event.stopImmediatePropagation();}, true);
				console.log("handling " + a[j] + " event");
			}
		}
	}
}

function enable_css_user_select(e, if_val_is_none)
{
	//-webkit-touch-callout:none -> default
	var prop = ["-moz-user-select", "-webkit-user-select", "-ms-user-select", "user-select"];
	for(var i = 0 ; i < prop.length ; i++){
		//cssでe{-moz-user-select:none}と設定してもe.style["-moz-user-select"]は初期値""のまま
		var pr = prop[i];
		if (e.style[pr] != null){
			if (! if_val_is_none || (e.style[prop[i]] && e.style[prop[i]] == "none")){
				var s = '("'+e2str(e)+'").style["'+pr+'"]: "' + e.style[pr] + '" -> "text"';
				console.log(s);
				e.style[pr] = "text";
			}
		}
	}
}

function get_rules(sht, prefix, indent)
{
	var ro = {rules:null, name:"cssRules"};
	try { // test broken sheet
		if (!(ro.rules = sht.cssRules)){
			if (!(ro.rules = sht.rules)){
				console.warn(indent + prefix + " no cssRules/rules");
				return;
			}
			ro.name = "rules";
			console.warn(indent + prefix + " using .rules");
		}
		return ro;
	}
	catch(e){
		console.warn(indent + prefix + " " + e);
	}
}

function traverse_rule_set(ruleSetList, prefix, depth, callback)
{
	var indent = "          ".substr(0, depth*2);
	for(var i = 0 ; i < ruleSetList.length ; i++){
		var o, r = ruleSetList[i], pfx = prefix + "[" + i + "]";
		//console.log(pfx + " type:" + r.type);
		if (r.type == 3){
			var sht = r.styleSheet;
			pfx = pfx + ".styleSheet";
			console.log(indent + pfx + ' @import "' + sht.href + '"');
			if (!(o = get_rules(sht, pfx, indent)))
				continue;
			traverse_rule_set(o.rules, pfx + "." + o.name, depth+1, callback);
			continue;
		}
		else if (r.type == 4){
			if (opt_verbose)console.log(indent + pfx + " @media " + r.media.mediaText);
			if (!(o = get_rules(r, pfx, indent)))
				continue;
			traverse_rule_set(o.rules, pfx + "." + o.name, depth+1, callback);
			continue;
		}
		else if (r.type != 1){
			if (opt_verbose)console.log(indent + pfx + " type:" + r.type + ": skip non-supported type " + r);
			continue;
		}
		callback(r, indent, pfx);
	}
}

function traverse_css(callback)
{
	var ss = document.styleSheets, i, s, prefix, m, o;
	for(i = 0 ; i < ss.length ; i++){
		s = ss[i];
		prefix = "document.styleSheets[" + i + "]";
		m = "";
		try {
			if (s.href)
				m += " href=" + s.href;
			if (s.media && s.media.mediaText)
				m += " @media " + s.media.mediaText;
		}
		catch(x){
			m += " " + x;
		}
		if (opt_verbose || s.href) console.log("# " + prefix + m);
		if (!(o = get_rules(s, prefix, "")))
			continue;
		traverse_rule_set(o.rules, prefix + "."+o.name, 1, callback);
	}
}

function traverse_css_and_enable_user_select()
{
	var prop = ["-moz-user-select", "-webkit-user-select", "-ms-user-select", "user-select"];
	traverse_css(function(rule, indent, prefix){
		var r = rule, pfx = prefix, s;
		for(var i = 0 ; i < prop.length ; i++){
			var pr = prop[i], v = r.style[pr], s;
			if (v != null){
				if (v == "none"){
					s = indent + "## " + pfx + ":\n  " + indent + r.selectorText + " {" + pr +": none}";
					console.log(s);
					var es = document.querySelectorAll(r.selectorText);
					for (var j = 0 ; j < es.length ; j++){
						var e = es[j], ev = e.style[pr];
						s = indent+"  ## "+(j+1)+") ("+e2str(e)+').style["'+pr+'"]: "' + ev + '"';
						if (!(ev && ev == "text")){
							s += ' -> "text"';
							e.style[pr] = "text";
						}
						console.log(s);
					}
				}
			}
		}
	});
}

function is_ascendant(parent, e)
{
	while (e.parentElement){
		if (e.parentElement === parent)
			return true;
		e = e.parentElement;
	}
	return false;
}

function get_zindex(e)
{
	try {
		// getPropertyValue()は"auto"などの文字列を返す場合もある
		// getPropertyValue() may return "auto"
		var z = getComputedStyle(e).getPropertyValue("z-index");
		return ! isNaN(z) ? z : (e.parentElement ? get_zindex(e.parentElement) : 0);
	}
	catch (e){
		console.error("get_zindex " + e);
		return 0;
	}
}

function expose_element(e)
{
    var e1 = e, e2, es, r1, r2, z1, z2, s, i, d = document;

	r1 = e1.getBoundingClientRect();
	z1 = get_zindex(e1);
	console.log("target z-index: " + z1);
	console.log("search overlapped elements");
	es = d.body.getElementsByTagName("*");
	for (i = 0 ; i < es.length ; i++){
		e2 = es[i];
		if (e2.hidden)
			continue;
		r2 = e2.getBoundingClientRect();
		z2 = get_zindex(e2);
		s = i + ") " + e2str(e2) + " z-index:" + z2;
		if (!(r1.left < r2.left || r1.right > r2.right || r1.top < r2.top || r1.bottom > r2.bottom)){
			if (is_ascendant(e2, e1)){
				s += " (ascendant)";
				console.log(s);
				continue;
			}
			else if (e2 === e1){
				//console.log("skip same element " + e2str(e2));
				s += " (target parent:'" + e2str(e2.parentElement) + "')";
				console.log(s);
				continue;
			}
			s = " hide " + s;
			if (is_ascendant(e1,e2))
				s += " (descendant)";
			else if (e1.parentElement === e2.parentElement)
				s += " (sibling parent:'" + e2str(e2.parentElement) + "')";
			else
				s += " (parent:'" + e2str(e2.parentElement) + "')";
			if (! isNaN(z1) && ! isNaN(z2) && z2 > z1)
				s = "Got shield!" + s;
			else
				s = "Suspicious!" + s;
			console.log("## " + s);
			e2.style.display = "none";
		}
	}
}

(function() {
    'use strict';
    var e, i, sd, sa, j, d = document;

    console.log("we got " + d.location);
	sd = site_data[d.location.host.toLowerCase()];

	if (sd && sd.pre){ 
		sd.pre();
	}

	prevent_listeners_preventing_usability(sd ? sd.event : null);

	if (sd && (sa = sd.nonSelectable) && sa.length){
		for (i = 0 ; i  < sa.length ; i++){
			console.log("# query non-selectable '" + sa[i] + "'");
			e = d.querySelectorAll(sa[i]);
			for (j = 0 ; j < e.length ; j++){
				console.log("# clear non-selectable '" + e2str(e[j]) + "'");
				enable_css_user_select(e[j]);
			}
		}
	}
	else {
		enable_css_user_select(d.body);

		console.log("search (-x-)user-select:none in all elements");
		e = d.body.getElementsByTagName("*");
		for (i = 0 ; i < e.length ; i++)
			enable_css_user_select(e[i], true);

		console.log("search (-x-)user-select:none in css");
		traverse_css_and_enable_user_select();
	}

	if (sd && (sa = sd.expose)){
		for (i = 0 ; i  < sa.length ; i++){
			console.log("query expose '" + sa[i] + "'");
			e = d.querySelectorAll(sa[i]);
			for (j = 0 ; j < e.length ; j++){
				console.log("## expose '" + e2str(e[j]) + "'");
				expose_element(e[j]);
			}
		}
	}

	if (sd && (sa = sd.hide)){
		for (i = 0 ; i  < sa.length ; i++){
			console.log("query hide '" + sa[i] + "'");
			e = d.querySelectorAll(sa[i]);
			for (j = 0 ; j < e.length ; j++){
				console.log("## hide '" + e2str(e[j]) + "'");
				e[j].style.display = "none";
			}
		}
	}

	// display:initial not work on ie. use block
	sa = sd && sd.PrintRules ? sd.PrintRules : ["body{display:block !important}"];
	if (typeof sa == "function")
		sa = sa();
	if (sa.length > 0){
		var rules = "";
		for (i = 0 ; i  < sa.length ; i++){
			rules += sa[i];
		}
		e = d.createElement("style");
		e.type = "text/css";
		e.innerHTML = "@media print{" + rules + "}";
		console.log('append <style type="text/css">'+e.innerHTML+'</style> to the end of head');
		d.getElementsByTagName("head")[0].appendChild(e);
	}

	if (sd && sd.more){ 
		sd.more();
	}
	
	if (sd && sd.formatPage){ 
		sd.formatPage();
	}

	console.log("# end #");
})();
