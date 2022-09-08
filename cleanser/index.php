<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Celestia : Content Cleanser</title>

<link type="text/css" href="../global/css/custom-theme/jquery-ui-1.7.3.custom.css" rel="stylesheet"/>
<link type="text/css" href="../global/css/code-mirror.css" rel="stylesheet"/>
<link type="text/css" href="../global/css/core.css" rel="stylesheet"/>

<link type="text/css" href="css/local.css" rel="stylesheet"/>

<script type="text/javascript" src="../global/js/jquery-full-ui-1.8.20.js"></script>
<script type="text/javascript" src="../global/js/core.js"></script>
<script type="text/javascript" src="../global/js/codemirror-compressed.js"></script>
<script type="text/javascript" src="js/startup.js"></script>

</head>
<body>
	
	<div id="wrap">
	
		<!-- BEGIN: dlg Confirmation -->
		<div id="dlg-confirmation" title="Confirmation">
			<div class="bd"></div>
		</div>
		<!-- END: dlg Confirmation -->
		<style>
		#menu-wrap ul li { float: left; margin-left: 5px; }
		input[type="checkbox"] { vertical-align: text-bottom; }
		</style>
		<div id="validator">
			<div id="menu-wrap">
				<ul class="clrfix">
					<li>
						<select id="sel-site">
							<option value="">Select a Site</option>
							<option value="food">Food Network</option>
							<option value="diy">DIY Network</option>
							<option value="hgtv">HGTV</option>
							<option value="hgrm">HG Remodels</option>
						</select>
					</li>
					<li><a href=""></a></li>
					<li><label><input id="chk-clean-attr" type="checkbox"/>: clean empty attributes</label></li>
					<li><button id="btn-validate">Validate Site</button></li>
				</ul>
			</div>
			<div id="input-wrap">
				<div class="bd">
					<h3>Input</h3>
					<textarea id="txt-input"></textarea>
				</div>
			</div>
		</div>
		<!-- #inject-wrap - used for client DOM injection / manipulation -->
		<div id="inject-wrap"></div>

	</div>
	
	<div id="preview-window"></div>
	
</body>
</html>