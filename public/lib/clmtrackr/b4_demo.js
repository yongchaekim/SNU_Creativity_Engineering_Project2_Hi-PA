// getUserMedia only works over https in Chrome 47+, so we redirect to https. Also notify user if running from file.
if (window.location.protocol == "file:") {
	alert("You seem to be running this example directly from a file. Note that these examples only work when served from a server or localhost due to canvas cross-domain restrictions.");
} else if (window.location.hostname !== "localhost" && window.location.protocol !== "https:"){
	window.location.protocol = "https";
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-32642923-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

