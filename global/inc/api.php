<?php

/*
note: alterations are as follows:
remove reference discarding 'food'
*/

$root = '../../sites/';
$franchise_name = isset($_REQUEST['franchise_name']) ? $_REQUEST['franchise_name'] : '';
$package_name = isset($_REQUEST['package_name']) ? $_REQUEST['package_name'] : 'New Package';
$file_name = isset($_REQUEST['file_name']) ? $_REQUEST['file_name'] : 'index';
$method = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
$site = isset($_REQUEST['site']) ? $_REQUEST['site'] : '';
$osite = isset($_REQUEST['site']) ? $_REQUEST['site'] : '';
$html = isset($_REQUEST['html']) ? $_REQUEST['html'] : '';
$data = isset($_REQUEST['data']) ? $_REQUEST['data'] : '';


/* new var set */
$the_path = isset($_REQUEST['the_path']) ? $root . $_REQUEST['the_path'] : '';



$path = $root . $site . '/packages/' . $package_name;

$fileCounter = 0;

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
};

function convertTime( $time ) {
    $time = time() - $time; // to get the time since that moment
    $tokens = array (
        31536000 => 'year',
        2592000 => 'month',
        604800 => 'week',
        86400 => 'day',
        3600 => 'hour',
        60 => 'minute',
        1 => 'second'
    );
    foreach ( $tokens as $unit => $text ) {
        if ( $time < $unit ) {
			continue;
		}
        $numberOfUnits = floor($time / $unit);
        return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'');
    }
}

function newest($a, $b) {
    return (filemtime($a) > filemtime($b)) ? -1 : 1;
};

function getPackageFiles( $path = '.' ) {

	global $osite, $fileCounter;

	/* put all files in an array */
	$dir = glob($path . '/*');
	/* sort the array by calling newest() */
	uasort($dir, "newest");
	
	echo '<ul>';
	foreach ( $dir as $file ) {
		
		if ( strpos($file, '.js') === false ) {
			
			if ( $fileCounter >= 10 ) {
				break;
			}
			$name = preg_replace('/\s[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}\.htm/', '', basename($file));
			$name = preg_replace('/-@/', ' (', $name) . ')';
			
			$date = date("Y-m-d H:i:s.", filemtime($file));
			$time = strtotime($date);
			
			echo '<li class="file"><a href="#" path="' . $path . '" site="' . $osite . '" file="' . basename($file) . '">' . $name .'</a> - <span>' . convertTime($time) . '</span></li>';
			$fileCounter += 1;
		}
	}
	echo '</ul>';

};

function getProjects( $the_path = '.', $isSub = false, $count = -1 ) {
	global $fileCounter;
	if ( $handle = opendir($the_path) ) {
		echo '<ul>';
		while ( false !== ($entry = readdir($handle)) ) {
			if ( $entry != '.' && $entry != '..' && strpos($entry, '.js') === false ) {
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
				
				if ( $has_folders ) {
					echo '<li class="franchise-parent ' . strtolower(preg_replace('/\s/', '-', $entry)) . '" package_name="' . $entry . '"><h2 text="' . $entry . '">' . $entry . '</h2>';
					getProjects($the_path . '/' . $entry, true, null);
				} else {
					echo '<li class="dir' . ($isSub === true ? ' sub' : '') . '" package_name="' . $entry . '"><h2 text="' . $entry . '">' . $entry . '</h2>';
					$fileCounter = 0;
					getPackageFiles($the_path . '/' . $entry);
				}
			}
		}
		echo '</ul>';
		closedir($handle);
	}
};

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
	case 'exists':
		$exists = false;
		$folders = array();
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
	case 'delno':
//		unlink("../sites/hgrm/packages/Phs/test hgtv/main-@Fri Jun 29 2012-08-02-10-config.js");
//		$dir = "http://frontend.scrippsnetworks.com/~cengle/projects/celestia/sites/hgrm/packages/Phs/";
//		foreach (scandir($dir) as $item) {
//			if ($item == '.' || $item == '..') continue;
//			unlink($dir.DIRECTORY_SEPARATOR.$item);
//		}
//		rmdir($dir);
		break;
	case 'open' :
		$file = $path . '/' . $file_name . '.htm';
		$fh = fopen($file, 'r') or die('error');
		$contents = fread($fh, filesize($file));
		fclose($fh);
		echo $contents;
		break;
	case 'getProjects' : 
		ob_start();
		echo '<li><div class="root ' . $site . '"><div class="clrfix tree-wrap">';
		//listProjects($path, false, null);
		getProjects($the_path, false, null);
		echo '</div></div></li>';
		ob_flush();
		
		break;
}

?>

