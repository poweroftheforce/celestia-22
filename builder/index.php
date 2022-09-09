<?php

session_start();

/*echo phpinfo();*/

// disable magic quotes
if (get_magic_quotes_gpc()) {
    $process = array(&$_GET, &$_POST, &$_COOKIE, &$_REQUEST);
    while (list($key, $val) = each($process)) {
        foreach ($val as $k => $v) {
            unset($process[$key][$k]);
            if (is_array($v)) {
                $process[$key][stripslashes($k)] = $v;
                $process[] = &$process[$key][stripslashes($k)];
            } else {
                $process[$key][stripslashes($k)] = stripslashes($v);
            }
        }
    }
    unset($process);
}

$con = new mysqli("localhost:3306", "root", "json2html");
if ( !$con ) {
	die('Could not connect: ' . mysql_error());
}


// Create database
$sql = "CREATE DATABASE IF NOT EXISTS db_celestia";

if ($con->query($sql) === TRUE) {
	echo "Database created";
} else {
	echo "Error creating database: " . $con->error;
}

// Create table
$con->select_db("world");

$sql = "CREATE TABLE Users
(
id int(6) NOT NULL auto_increment,
username varchar(15),
password varchar(15),
name varchar(30),
email varchar(50),
PRIMARY KEY (id),
UNIQUE id (id),
KEY id_2 (id)
)";

// Execute query
// mysql_query($sql, $con);
$con->query($sql);

// mysqli_close($con);
$con->close();


// Connect to MySQL
$con = mysqli_connect('localhost:3306', 'root', 'json2html');
if ( !$con ) {
    die('Could not connect: ' . mysql_error());
}

// Make my_db the current database
$db_selected = mysqli_select_db($con, 'db_celestia');

if ( !$db_selected ) {
  // If we couldn't, then it either doesn't exist, or we can't see it.
  $sql = 'CREATE DATABASE db_celestia';

  if ( mysqli_query($con, $sql) ) {
      //echo "Database db_celestia created successfully\n";
  } else {
      //echo 'Error creating database: ' . mysql_error() . "\n";
  }
}


mysqli_select_db($con, 'db_celestia');
$sql = "CREATE TABLE IF NOT EXISTS Users
(
id int(6) NOT NULL auto_increment,
username varchar(15),
level int,
session text,
sessions text,
password varchar(15),
name varchar(30),
email varchar(50),
PRIMARY KEY (id),
UNIQUE id (id),
KEY id_2 (id)
)";

mysqli_query($con, $sql);

mysqli_close($con);

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Celestia : Content Builder</title>

<link type="text/css" href="../global/css/core.css" rel="stylesheet"/>
<link type="text/css" href="../global/css/code-mirror.css" rel="stylesheet"/>

<link type="text/css" href="../global/css/custom-theme/jquery-ui-1.7.3.custom.css" rel="stylesheet"/>
<link type="text/css" href="css/local.css" rel="stylesheet"/>

<!--<script src="../global/js/jquery-1.3.2.min.js"></script>-->

<!--<script src="../global/js/jquery-full-ui-1.8.20.js"></script>-->
<script src="http://code.jquery.com/jquery-1.8.3.js"></script>
<script src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script>

<script src="../global/js/codemirror-compressed.js"></script>

<script src="../global/js/json2.js"></script>
<script src="../global/js/core.js"></script>
<script src="../global/js/undo-manager.js"></script>
<script src="js/startup.js"></script>

<script>

/*

-------------------
-------------------
-------------------
	MENTAL NOTE

if 'a' pages styles seem out of whack,
make certain all modules are being loaded
-------------------
-------------------
-------------------


--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
	[site] config CALLBACKS
	
	loadPlugins()
		allow the [site] to perform actions upon startup - you can pretty much do anything you want here

	seoComplete()
		executes after seo has been setup

	wellMenuComplete()
		executes after the well menu (inside #dlg-main-menu) has been injected
	
	sortable_wells( html )
		return html;
	
	loadComplete( html )
		return html;
	
	beforeNewModule( module, well, is_east, name )
		return name [String];
		
	beforeGetModule( options )
		return skipLoad [Boolean];
		
	fixRawSource( html )
		Allows the raw source [String] to be manipulated before converting to HTML
		return html [String];
	
	fixSource( source [Selector] )
		return has_banner [Boolean];
		
	buildTemplate()
	
	extendFileConfig( config )
		Allows a site to extend the file config system ex: see DIY banners - gets called just before saving the page file
		Must be an object to be retrieved properly
		return config [Object];
		
	getFileConfig( callback [function( data )] )
		returns the config file upon callback
		note async is false for this method so that execution can flow after that ajax call
		
	
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
	MODULE CALLBACKS
	
	controlsOpened()
		called when dlg Controls has been opened
		

*/
</script>
</head>

<body>

	<!-- empty DIV used for determining the width of strings -->
	<div id="text-width-wrap" style="position:absolute;top:-1000px;left:0;display:none;"></div>

	<!-- BEGIN: dlg Create / Open Package -->
	<div id="dlg-create-open-package" title="Create / Open Package">
		<div id="choose-site-wrap" class="choose-site-wrap clrfix"></div>
		<div class="create-open-wrap">
			<p class="sm"><a id="btn-back-to-choose-site" href="javascript:;">&laquo; Back</a></p>
			<ul class="clrfix">
				<li>
					<h3>Create a Package</h3>
					<div class="template-wrap">
						<p class="sm">Choose a template from below to start from.</p>
						<label>Templates: <select id="sel-template"><option value="">Blank / Default</option></select></label>
					</div>
					<label><p>Package Page Name:</p><input id="txt-create-package"/></label>
					<p>Is this part of a franchise?</p>
					<label><p>Franchise Name:</p><input id="txt-create-franchise"/></label>
					<p><button class="btn-create-package">Create</button></p>
				</li>
				<li class="mid">&nbsp;</li>
				<li>
					
					<div class="existing-packages-wrap">
						<h3>Select an Existing Package:</h3>
						<ul id="project-list-wrap"><!--<li><p>No Existing Packages</p>--></li></ul>
						<!--
						<select id="sel-existing-packages"></select>
						<div class="existing-franchises-wrap">
							<p>You selected a franchise, please choose a package to retrieve it's files</p>
							<select id="sel-existing-franchises"></select>
						</div>
						-->
					</div>
					<!--
					<div class="existing-files-wrap">
						<h3>Select an existing file:</h3>
						<select id="sel-existing-files">
							<option value="">Select File</option>
						</select>
						<p><button id="btn-load-existing-file">Load Selected/Latest</button></p>
					</div>
					-->
				</li>
			</ul>
		</div>
		<ul class="extra-links">
			<li><a class="btn-restore-session" href="javascript:;">Restore Session</a></li>
			<li><a class="btn-set-source" href="javascript:;">Set Source Code</a></li>
		</ul>
	</div>
	<!-- END: dlg Create / Open Package -->
	
	<!-- The Editor -->
	<div id="editor"></div>
	
	<!-- Overlay for modules to open dlg Module Controls -->
	<div id="controls-opener"></div>
	
	<!-- Overlay for modules that are unknown -->
	<div id="unknown-module"></div>
	
	<!-- BEGIN: dlg Module Controls -->
	<div id="dlg-controls" title="Edit Module">
		<div class="controls">
			<div class="inputs-wrap"></div>
			<div class="controls-wrap"></div>
		</div>
		<div id="raw-html"></div>
	</div>
	<div id="temp-source"></div>
	<!-- END: dlg Module Controls -->	
	
	<!-- BEGIN: dlg Set Source -->
	<div id="dlg-set-source" title="Source Code">
		<div class="bd">
			<div class="info">
				<p class="small">A new package will be created. Would you like to supply a name for this package?</p>
				<p><label><span>Franchise Name:</span><input type="text" id="txt-set-source-franchise-name"/></label></p>
				<p><label><span>Package Page Name:</span><input type="text" id="txt-set-source-package-name"/></label></p>
				<p class="small">paste your content HTML into the text area below.</p>
			</div>
			<p><textarea id="txt-set-source"></textarea></p>
		</div>
	</div>
	<!-- END: Set Source -->
	
	<!-- BEGIN: dlg Confirmation -->
	<div id="dlg-confirmation" title="Confirmation">
		<div class="bd"></div>
	</div>
	<!-- END: dlg Confirmation -->
	
	<!-- BEGIN: dlg View Source -->
	<div id="view-source" title="Source Code">
		<div class="bd">
			<p><textarea id="txt-cma-source" cols="35" rows="5"></textarea></p>
		</div>
	</div>
	<!-- END: dlg View Source -->
	
	<!-- BEGIN: dlg Save As -->
	<div id="dlg-save-as" title="Save As">
		<div class="package">
			<h3>Save As: [package name OR file name]</h3>
			<p>You may save this page to a different package name and or file name.</p>
			<ul>
				<li><label>Franchise Name: <input id="txt-save-as-franchise-name" type="text"/></label></li>
				<li><label>Package Page Name: <input id="txt-save-as-package-name" type="text"/></label></li>
				<li><label>File Name: <input id="txt-save-as-file-name" type="text"/></label></li>
			</ul>
			<p><button id="btn-save-as">Save</button></p>
			<p class="sm">Changing the file name is good for pacakages that incorporate more than one file such as sweeps.</p>
		</div>
		<div class="template">
			<h3>Save Layout as Template</h3>
			<ul>
				<li><label>Template Name: <input id="txt-save-as-template-name" type="text"/></label></li>
			</ul>
			<p><button id="btn-save-template-as">Save</button></p>
			<p class="sm">note: This will save the layout or module set you have chosen but not the copy.</p>
		</div>
	</div>
	<!-- END: dlg Save As -->
	
	<!-- BEGIN: dlg Main Menu -->
	<div id="dlg-main-menu" title="Dashboard">
		<div id="site-selector" class="clrfix">
			<div class="links-section small clrfix">
				<h2 id="mm-franchise-name"></h2>
				<h2 id="mm-package-name"></h2>
				<!--<h2 id="mm-file-name"></h2>-->
				<div class="hr"><hr/></div>
				<ul class="tools-bar clrfix">
					<li><a class="btn-open-dlg-create-open-package" href="javascript:;" title="Create A New Package"><img src="images/new-package.png"/></a></li>
					<li><a class="btn-open-dlg-seo" href="javascript:;" title="Setup SEO Information"><img src="images/seo-info.png"/></a></li>
					<li><a class="btn-set-source" href="javascript:;" title="Set Source Code"><img src="images/set-source.png"/></a></li>
					<li><a id="btn-get-source" href="javascript:;" title="Get Source Code For CMS"><img src="images/get-source.png"/></a></li>
					<li><a id="btn-toggle-header-footer" href="javascript:;" title="Toggle Header / Footer"><img src="images/toggle-header-footer.png"/></a></li>
					<li><a id="btn-brandscape" href="javascript:;" title="Brandscaping"><img src="images/brandscaping.png"/></a></li>
					<li><a id="btn-preview" href="javascript:;" title="Preview"><img src="images/preview.png"/></a></li>
					<li><div class="hr"><hr/></div></li>
				</ul>
				<ul>
					<li><a class="btn-get-quick-load-url" href="javascript:;">Get a Quick Load URL</a></li>
					<li><div class="hr"><hr/></div></li>
					<li><a class="btn-open-save-as" type="package" href="javascript:;">Save As</a></li>
					<li><a class="btn-undo disabled">undo</a></li>
					<li><a class="btn-redo disabled">redo</a></li>
					<li><a class="btn-open-save-as" type="template" href="javascript:;">Save layout as template</a></li>
					<li><a class="btn-show-hide-module-image" href="javascript:;">Show/Hide module preview images</a></li>
				</ul>
			</div>
		</div>
		<div id="image-wrap"></div>
		<div id="well-menu-wrap"></div>
	</div>
	<!-- END: dlg Main Menu -->
	
	<!-- BEGIN: dlg SEO -->
	<div id="dlg-seo" title="SEO Information">
		<div class="bd">
			<ul class="seo-wrap"><!-- SEO is dynamic --></ul>
			<p class="notice">You only need to fill in the seo information above. It will automatically be saved and restored.</p>
		</div>
	</div>
	<!-- END: dlg SEO -->
	
	<!-- BEGIN: dlg Help -->
	<div id="dlg-help" title="Help">
		<div class="bd"><?php include('help.php');?></div>
	</div>
	<!-- END: dlg Help -->
	
	<!-- BEGIN: dlg Brandscape -->
	<div id="dlg-brandscape">
		<div class="bd"><textarea id="txt-brandscape"></textarea></div>
	</div>
	<!-- END: dlg Brandscape -->
	
	<div id="context-menu">
		<div class="hd clrfix"><a id="btn-context-close" class="all" href="javascript:void(0);"></a></div>
		<div class="bd clrfix">
			<ul>
				<li><a id="btn-context-help" href="javascript:;">Help</a></li>
				<li class="module-button"><a id="btn-context-edit-module" href="javascript:;">Edit Module</a></li>
				<li class="module-button"><a id="btn-context-move-module-up" href="javascript:;">Move Module Up</a></li>
				<li class="module-button"><a id="btn-context-move-module-down" href="javascript:;">Move Module Down</a></li>
				<li class="module-button"><a id="btn-context-clone-module" href="javascript:;">Clone Module</a></li>
				<li class="module-button"><a id="btn-context-delete-module" href="javascript:;">Delete Module</a></li>
			</ul>
		</div>
		<div class="ft"></div>
	</div>
	
	<div id="inject-wrap"></div>
		
</body>
</html>
