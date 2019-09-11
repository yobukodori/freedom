/*
 * 47news link fix v.0.1.0
 * author: yobukodori
*/

(function(){
	if (window.ybkLinkFixed)
		return;
	window.ybkLinkFixed = true;
	let d = document;
	let ee = d.getElementsByTagName("a");
	for (let idx = 0 ; idx < ee.length ; idx++){
		let e = ee[idx], href = e.getAttribute("href");
		if (/\/\d+\.html/.test(href)){
			e.setAttribute("target", "_blank");
			e.setAttribute("style", "text-decoration: underline; touch-action: initial");
			fetch(e.href)
			  .then(function(response) {
				return response.text();
			  })
			  .then(function(html) {
				let sig = '<a class="read-more-button"';
				let i = html.indexOf(sig);
				if (i != -1){
					let s = html.substring(i, html.indexOf(">", i + sig.length) + 1)
					let r = s.match('href="(.+?)"');
					if (r){
						e.href = r[1];
					}
				}
			  });			
		}
	}
})()