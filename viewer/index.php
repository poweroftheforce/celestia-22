<?php
$root = '../sites';
$title = 'CDE Packages';
$site = '';
require_once('inc/lib.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Scripps Digital: Package Previewer: Christopher Engle</title>
<link type="text/css" href="themes/theme_001/css/custom-theme/jquery-ui-1.7.3.custom.css" rel="stylesheet"/>
<link rel="stylesheet" type="text/css" href="css/core.css"/>
<style>
span.highlight { background: #FF0; color: #00F; }
</style>
<script src="../global/js/jquery-full-ui-1.8.20.js"></script>
<script src="../global/js/core.js"></script>
<script src="../global/js/plugins.js"></script>
<script src="js/startup.js"></script>
</head>

<body>
	
	<div id="main-menu">	
		<div id="project-search">
			<form id="frm-search" method="post" action="javascript:void(0);">
				<p><label>search: <input type="search" id="project-keywords" name="project-keywords" autocomplete="off"/></label></p>
			</form>
			<div id="links-wrap">
				<a title="Collapse the entire tree below (may take a while with large trees)" href="javascript:;">Collapse All</a>&nbsp;|
				<a title="Expand the entire tree below (may take a while with large trees)" href="javascript:;">Expand All</a>
			</div>
			<ul id="project-list-wrap">
				<?php
				echo '<li><div class="root hgtv"><h3>HGTV</h3><div class="clrfix tree-wrap">';
				getProjects('../sites/hgtv/packages');
				echo '</div></div></li>';

				echo '<li><div class="root remodels"><h3>HGTV Remodels</h3><div class="clrfix tree-wrap">';
				getProjects('../sites/hgrm/packages');
				echo '</div></div></li>';

				echo '<li><div class="root food"><h3>Food Network</h3><div class="clrfix tree-wrap">';
				getProjects('../sites/food/packages');
				echo '</div></div></li>';

				echo '<li><div class="root diy"><h3>DIY Network</h3><div class="clrfix tree-wrap">';
				getProjects('../sites/diy/packages');
				echo '</div></div></li>';

				echo '<li><div class="root door"><h3>FrontDoor</h3><div class="clrfix tree-wrap">';
				getProjects('../sites/door/packages');
				echo '</div></div></li>';
				?>
			</ul>
		</div>
	</div>
	
</body>
</html>

