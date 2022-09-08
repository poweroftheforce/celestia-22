<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<script type="text/javascript" src="http://10.76.19.199/celestia/global/js/jquery-full-ui-1.8.20.js"></script>
<script language="javascript" type="text/javascript">
$(function() {
	var html = '';
	$(document.body).load('http://10.76.19.199/celestia/global/inc/url_getter.php?url=http://www.frontdoor.com', '', function(data) {
		$(parent.opener).html($(document.body).parent().html());
		window.stop();
	});
});
</script>
</head>
<body>
</body>
</html>
