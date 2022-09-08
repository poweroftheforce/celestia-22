(function($) {
$(function() {
	$LAB
	.script("http://w.sharethis.com/button/sharethis.js#publisher=87e14ce7-dc4d-40d2-ada1-38b20bfad22c&amp;type=website&amp;post_services=email%2Cfacebook%2Ctwitter%2Cgbuzz%2Cmyspace%2Cdigg%2Csms%2Cwindows_live%2Cdelicious%2Cstumbleupon%2Creddit%2Cgoogle_bmarks%2Clinkedin%2Cbebo%2Cybuzz%2Cblogger%2Cyahoo_bmarks%2Cmixx%2Ctechnorati%2Cfriendfeed%2Cpropeller%2Cwordpress%2Cnewsvine&amp;button=false")
	.script(function(){
		if ( !window.JSON ) {
			return "http://web.hgtv.com/webhgtv/hg20/pkgs/js/json2.min.js";
		}
	})
	.script("http://web.hgtv.com/webhgtv/hg20/pkgs/js/futon2.js")
	.wait(function(){
		var voteUrl = "http://" + window.location.hostname + "/hgtv-urban-oasis-2012-giveaway/package/index.html";
		ftn.share( voteUrl, "HGTV Urban Oasis 2012 Giveaway" );
		
		//US Local Phone Number Validation Method for jQuery validation
		$.validator.addMethod("phoneUSLocal", function(phone_number, element) {
			phone_number = phone_number.replace(/\\s+/g, ""); 
			return this.optional(element) || phone_number.length >= 7 &&
			phone_number.match(/(?:\\d{3})(?:-{1})(?:\\d{4})/);
		}, "Please specify a valid phone number");
		
		//US Area Code Validation Method for jQuery validation
		$.validator.addMethod("phoneUSArea", function(areacode, element) {
			areacode = areacode.replace(/\\s+/g, ""); 
			return this.optional(element) || areacode.length == 3 &&
			areacode.match(/\\d{3}/);
		}, "Please specify a valid area code");
		
		//US Zip Code Validation Method for jQuery validation
		$.validator.addMethod("zipUS", function(zip_code, element) {
			zip_code = zip_code.replace(/\\s+/g, ""); 
			return this.optional(element) || zip_code.length > 4 &&
			zip_code.match(/^\\d{5}(-\\d{4})?$/);
		}, "Please specify a valid zip code");
	})
	.script("http://images.hgtv.com/webhgtv/hg20/pkgs/2012/urban-oasis/local.js")
	.wait(function(){
	    ftn.sweeps.init();
	});
});
})(jQuery);