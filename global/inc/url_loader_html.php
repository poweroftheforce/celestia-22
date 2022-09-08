<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<script type="text/javascript" src="global/js/jquery-full-ui-1.8.20.js"></script>
<script language="javascript" type="text/javascript">
$(function() {
	var save = '<?php echo(urldecode($_REQUEST['save'])); ?>';
	var site = '<?php echo(urldecode($_REQUEST['site'])); ?>';
	try {
		var str = 'http://10.76.19.199/celestia/global/inc/url_loader.php?url=<?php echo(urldecode($_REQUEST['url'])); ?>';
		$('#url_loader').attr('src', str);
	} catch(e) {};
});
</script>
</head>
<body><iframe id="url_loader" src="about:blank" width="100%" height="100%" frameborder="0"></iframe></body>
</html>
