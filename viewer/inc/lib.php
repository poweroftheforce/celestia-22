<?php
error_reporting( E_ALL );

function rstrpos($haystack, $needle, $offset) {
	$size = strlen ($haystack);
	$pos = strpos (strrev($haystack), $needle, $size - $offset);
	if ($pos === false)
		return false;
	return $size - $pos;
}

function getProjects( $path = '.', $count = -1 /* how many to list out */ ) {
	ob_start();
	listProjects($path, false, $count);
	ob_flush();
};

function listProjects( $path = '.', $deep = false, $count = -1 ) {
	
	static $counter = 0, $files;
	
	$ignore = array(
				'cgi-bin',
				'.',
				'..',
				'.svn',
				'_notes',
				'const',
				'comps',
				'docs',
				'css',
				'js',
				'img',
				'images',
				'backups',
				'no-need',
				'assets',
				'old',
				'config.js',
				'procs'
			);
    $dh = @opendir( $path );
	$sDir = explode( '/', $path);
	$sDir0 = $sDir[0];
	
	if ( count($sDir) > 1 ) {
		$site = $sDir[2];
	} else {
		$site = 'hgtv';
	}
	$c = 0;
	echo "<ul>\n";
    while ( false !== ($file = readdir($dh)) ) {
		if ( in_array($file, $ignore) ) {
			continue;
		}
		$config_pos = strrpos($file, '-config.js');
		if ( $config_pos > 0 ) {
			continue;
		}
		if ( is_dir( "$path/$file" ) ) {
			if ( !$deep ) {
				echo "<li class=\"dir parent " . strtolower(preg_replace('/\s/', '-', $file)) . "\"><h2 text=\"$file\">$file</h2>\n";
			} else {
				echo "<li class=\"dir sub\"><h2 text=\"$file\">$file</h2>\n";
			}
			$counter = 0;
			listProjects("$path/$file", true, $count );
			echo "</li>\n";
		} else {
			if ( $count != -1 ) {
				if ( $counter >= $count ) {
					break;
				}
			}
			$filename = addslashes("$path/$file");
			echo "<li class=\"file\"><a href=\"#\" path=\"$sDir0\" site=\"$site\" file=\"$filename\" text=\"$file\">$file</a></li>";
			$counter += 1;
		}
    }
	
	echo "</ul>\n";
    closedir($dh);
}

?>
