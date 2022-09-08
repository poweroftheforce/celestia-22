<?php

/*
note: alterations are as follows:
remove reference discarding 'food'
*/

$root = '../../sites/';
$franchise_name = isset($_REQUEST['franchise_name']) ? $_REQUEST['franchise_name'] : '';
$package_name = isset($_REQUEST['package_name']) ? $_REQUEST['package_name'] : 'main';
$file_name = isset($_REQUEST['file_name']) ? $_REQUEST['file_name'] : '';
$method = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
$site = isset($_REQUEST['site']) ? $_REQUEST['site'] : '';
$html = isset($_REQUEST['html']) ? $_REQUEST['html'] : '';
$data = isset($_REQUEST['data']) ? $_REQUEST['data'] : '';


/* new var set */
$the_path = isset($_REQUEST['the_path']) ? $root . $_REQUEST['the_path'] : '';



$path = $root . $site . '/packages/' . $package_name;
/*
right now you CAN have packname under root AND inside one or more franchises at the same time.
so let's just readjust our path if we have to and keep our functions the same

sample struct:

root/packname
root/franchise/packname
root/franchise2/packname
*/
if ( $franchise_name != '' ) {
	$path = $root . $site . '/packages/' . $franchise_name . '/' . $package_name;
}

switch ( $method ) {
	case 'getSites':
		$ret = array();
		if ( $handle = opendir($root) ) {
			while ( false !== ($entry = readdir($handle)) ) {
				if ( $entry != '.' && $entry != '..' && $entry != 'food' ) {
					$ret[] = $entry;
				}
			}
			closedir($handle);
		}
		echo json_encode($ret);
		break;
	case 'getPacks':
		$ret = array();
		if ( $handle = opendir($the_path) ) {
			while ( false !== ($entry = readdir($handle)) ) {
				if ( $entry != '.' && $entry != '..' ) {
					$has_folders = false;
					if ( $handle2 = opendir($the_path . '/' . $entry) ) {
						while ( false !== ($entry2 = readdir($handle2)) ) {
							if ( $entry2 != '.' && $entry2 != '..' ) {
								if ( is_dir($the_path . '/' . $entry . '/' . $entry2) ) {
									$has_folders = true;
									break;
								}
							}
						}
					}
					$ret[] = array('folder_name'=>$entry, 'has_folders'=>$has_folders);
				}
			}
			closedir($handle);
		}
		echo json_encode($ret);
		break;
	case 'getPackageFiles':
		$ret = array();
		if ($handle = opendir($path)) {
			while ( false !== ($file = readdir($handle)) ) {
				if ( $file != '.' && $file != '..' && strpos($file, '.js') === false ) {
					$ret[] = $file;
				}
			}
			closedir($handle);
		}
		echo '(' . json_encode($ret) . ')';
		break;
	case 'exists':
		$exists = false;
		$folders = array();
		/*
		CURRENTLY NOT IMPLEMENTED
		$p = '../sites/' . $site . '/packages';
		if ( $franchise_name == '' ) {
			if ( is_dir($p . '/' . $package_name) ) {
				$exists = true;
				$folders[] = $package_name;
			}
		}
		if ( $handle = opendir($p) ) {
			while ( false !== ($entry = readdir($handle)) ) {
				if ( $entry != '.' && $entry != '..' ) {
					if ( is_dir($p . '/' . $entry . '/' . $package_name) && $entry == $franchise_name ) {
						$folders[] = $entry;
						$exists = true;
					}
				}
			}
		}
		*/
		if ( is_dir($path) ) {
			$exists = true;
		}
		echo '(' . json_encode(array('exists'=>$exists, 'folders'=>$folders)) . ')';
		break;
	case 'save_template':
		file_put_contents($root . $site . '/const/templates.js', <<<CONFIG
$data
CONFIG
);
		break;
	case 'save':
		if ( !file_exists($path) ) {
			mkdir($path, 0777, true);
		}
		$file = $path . '/' . $file_name . '.htm';
		$jsfile = $path . '/' . $file_name . '-config.js';
		$fh = fopen($file, 'w+') or die('error');
		$stringData = rawurldecode($html);
		fwrite($fh, stripslashes($stringData));
		fclose($fh);
		file_put_contents($jsfile, <<<CONFIG
$data
CONFIG
);
		break;
	case 'open':
		$file = $path . '/' . $file_name . '.htm';
		$fh = fopen($file, 'r') or die('error');
		$contents = fread($fh, filesize($file));
		fclose($fh);
		echo $contents;
		break;
}

?>

