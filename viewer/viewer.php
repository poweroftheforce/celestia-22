<?php
error_reporting(E_ALL);

/**
 * Merges any number of arrays of any dimensions, the later overwriting
 * previous keys, unless the key is numeric, in whitch case, duplicated
 * values will not be added.
 *
 * The arrays to be merged are passed as arguments to the function.
 *
 * @access public
 * @return array Resulting array, once all have been merged
 */
function array_merge_replace_recursive() {
    // Holds all the arrays passed
    $params = & func_get_args ();
    // First array is used as the base, everything else overwrites on it
    $return = array_shift ( $params );
    // Merge all arrays on the first array
    foreach ( $params as $array ) {
        foreach ( $array as $key => $value ) {
            // Numeric keyed values are added (unless already there)
            if (is_numeric ( $key ) && (! in_array ( $value, $return ))) {
                if (is_array ( $value )) {
                    $return [] = array_merge_replace_recursive ( $return [$$key], $value );
                } else {
                    $return [] = $value;
                }
            // String keyed values are replaced
            } else {
                if (isset ( $return [$key] ) && is_array ( $value ) && is_array ( $return [$key] )) {
                    $return [$key] = array_merge_replace_recursive ( $return [$key], $value );
                } else {
                    $return [$key] = $value;
                }
            }
        }
    }
    return $return;
}

function rstrpos($haystack, $needle, $offset) {
	$size = strlen ($haystack);
	$pos = strpos (strrev($haystack), $needle, $size - $offset);
	if ($pos === false)
		return false;
	return $size - $pos;
}

function sanitize_FRODO($buffer) {
    $search = array(
        '/\>[^\S ]+/s', //strip whitespaces after tags, except space
        '/[^\S ]+\</s', //strip whitespaces before tags, except space
        '/(\s)+/s'  // shorten multiple whitespace sequences
        );
    $replace = array(
        '>',
        '<',
        '\\1'
        );
  $buffer = preg_replace($search, $replace, $buffer);
    return $buffer;
}

$debug = isset($_REQUEST['d']) ? $_REQUEST['d'] : 'false';
$site = isset($_REQUEST['s']) ? urldecode($_REQUEST['s']) : '';
$file = isset($_REQUEST['f']) ? urldecode($_REQUEST['f']) : '';
$html_file = $file;

function getConfig( $file = NULL ) {
	$config = NULL;
	if ( is_file($file) && ( $config = file_get_contents($file) ) === false ) {
		return NULL;
	}
	$config = preg_replace("/\s*\n+\s*/", " ",
		preg_replace("/\t/", "",
			preg_replace("/\\\\n\s+/", "\\n ",
				preg_replace("/\\\s*\n/im", "\\n", $config)
			)
		)
	);
	return json_decode($config, true);
}

$first_slash = strpos($file, '/') + 1;
$last_slash = rstrpos($file, '/', strlen($file)) - 1;
$hyphen = strpos($file, '-') - 1;
$folder = substr($file, $first_slash, $last_slash - $first_slash);
$file_name = substr($file, $last_slash + 1, strlen($file));

/* looking for config.js */
$config = substr($file, 0, $last_slash) . '/' . substr($file_name, 0,  strpos($file_name, '.htm')) . '-config.js';

$data = getConfig($config);

/* try and get the record number */
/*
$record = preg_replace('/\s/', '', substr($file, $last_slash + 1, $hyphen - $last_slash));
$record = is_numeric($record) ? $record : '000000';
*/


/* MAIN PAGE CRITERIA */
/*
	if the config file is used, only title might be different if there are more than one page in the folder
	so title would be dynamic and 1 of 2 things:
	?
		$data['title'] . ' : (' . $file_name . ')'
	:
		$site . ' - Untitled (missing config.js) : (' . $file_name . ')'
		
	
	note: In reference to SEO and UAT, the title would be: seo[title] + file_name	
*/
$title = isset($data['txt-package-name']) ? $data['txt-package-name'] . ' : (' . $file_name . ')' : $site . ' - Untitled (missing config.js) : (' . $file_name . ')';

$url = isset($data['txt-package-url']) ? $data['txt-package-url'] : '';

/* Record Number */
$record = isset($data['txt-record-number']) ? $data['txt-record-number'] : '00000';

/* SEO */
$abstract = isset($data['txt-seo']) ? $data['txt-seo'] : '';
$keywords = isset($data['txt-keywords']) ? $data['txt-keywords'] : '';


$sponsorship = isset($data['txt-sponsorship']) ? $data['txt-sponsorship'] : '';
$home_section = isset($data['txt-home-section']) ? $data['txt-home-section'] : '';

/* BANNER */
$banner_url = isset($data['txt-banner-url']) ? $data['txt-banner-url'] : '';
$banner_text = isset($data['txt-package-name']) ? $data['txt-package-name'] : '';

/* NAV */
$nav = isset($data['nav']) ? $data['nav'] : '';

/* are we using a special header? */
$alt_header = isset($data['alt_header']) ? $data['alt_header'] : '';
$alternate_header = null;


/* TENTPOLE CRITERIA */
$tentpole_id = isset($data['tentpole-id']) ? $data['tentpole-id'] : '';
$procs = isset($data['procs']) ? $data['procs'] : '';

/* does this package have a sponsor? */
$has_sponsor = '';

if ( $sponsorship != '' ) {
	$has_sponsor = 'HGTV-TEXT-92139-1';
}


$header = '../sites/' . $site . '/const/viewer/header.php';
$footer = '../sites/' . $site . '/const/viewer/footer.php';


if ( $site == 'frontdoor' ) {
	/* download our site */
	$opt = array(
		'http' => array(
			'method' => 'GET',
			'header' => 'User-Agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11'
		)
	);
	$context = stream_context_create($opt);
	// call a page and set its source equal to strhtml (string html)
	$html = file_get_contents("http://www.frontdoor.com/buy/Urban-Oasis-Sweepstakes/55938", false, $context);
	
	
	
	/* get the header section */
	$header_pos = strpos($html, '<div id="article" class="article_template_package">');
	/* get the footer section */
	$footer_pos = strpos($html, '<div id="emailforms">');

	if ( $header_pos >= 0 ) {
		/* save a local version of the latest source code */
		$header = substr($html, 0, $header_pos);
		/* do some replacements */
		$patterns = array();
		$patterns[0] = '/adtag_globalPageSponsorship =.*"/';
		$patterns[1] = '/adtag_globalUniqueId =.*"/';
		$patterns[2] = '/<title>.*<\/title>/';
		$patterns[3] = '/src="\//';
		$patterns[4] = '/href="\//';
		$replacements = array();
		$replacements[0] = 'adtag_globalPageSponsorship = "' . $sponsorship . '"';
		$replacements[1] = 'adtag_globalUniqueId = "' . $has_sponsor . '"';
		$replacements[2] = '<title>' . $title . '</title>';
		$replacements[3] = 'src="http://www.frontdoor.com/';
		$replacements[4] = 'href="http://www.frontdoor.com/';
		$header = preg_replace($patterns, $replacements, $header);
		file_put_contents('../sites/frontdoor/const/viewer/header.php', $header . '<div id="article" class="article_template_package">');
		$header = '../sites/' . $site . '/const/viewer/header.php';
	} else {
		$header = '../sites/' . $site . '/const/viewer/header_backup.php';
	}
	
	
	if ( $footer_pos >= 0 ) {
	
		/* save a local version of the latest source code */
		$footer = substr($html, $footer_pos, strlen($html));
		$patterns = array();
		$patterns[0] = '/src="\//';
		$patterns[1] = '/href="\//';
		$replacements = array();
		$replacements[0] = 'src="http://www.frontdoor.com/';
		$replacements[1] = 'href="http://www.frontdoor.com/';
		$footer = preg_replace($patterns, $replacements, $footer);
		file_put_contents('../sites/frontdoor/const/viewer/footer.php', '</div>' . $footer);
		$footer = '../sites/' . $site . '/const/viewer/footer.php';
	} else {
		$footer = '../sites/' . $site . '/const/viewer/footer_backup.php';
	}

}



if ( $alt_header != '' ) {
	$alternate_header = 'packages/' . $site . '/const/' . $alt_header;
	if ( file_exists($alternate_header) ) {
		$alternate_header = file_get_contents($alternate_header);
	}
}


/* try to include a header */
include $header;
?>
<script>var dt = new Date().getTime();</script>
<?php

/* try to load the page in question */
if ( file_exists($html_file) ) {
	$file = file_get_contents($html_file);
	
	if ( $site == 'frontdoor' || $site == 'door' ) {
		$file = sanitize_FRODO($file);
	}
	/*
		because we need to replace <#Proc/#> (which will be a string and not a DOM element),
		we will use file_get_contents()
		
		see if there might be a banner to get
	*/
	$banner = '../sites/' . $site . '/const/viewer/primary-banner.php';
	if ( file_exists($banner) ) {
		/* replace Proc::getTPBanner call with brands correct banner before output */
		$replacement_text = '';
		$se = array('{$banner_url}', '{$banner_text}', '{$title}', '{$url}');
		$re = array($banner_url, $banner_text, $title, $url);
		$primary_banner = file_get_contents($banner);
		$replacement_text = str_replace($se, $re, $primary_banner);
		$file = preg_replace('/<\#\s*Proc\s*name\s*=\s*"getTPBanner"\s*\/\#>/i', $replacement_text, $file);
		$file = preg_replace('/<\#\s*Proc\s*name\s*=\s*"getBanner"\s*\/\#>/i', $replacement_text, $file);
		$file = preg_replace('/<\#\s*Proc\s*name\s*=\s*"getTpHdFromShowAbbr"\s*param="XX"\s*\/\#>/i', $replacement_text, $file);
	}
	
	$super_lead = '../sites/' . $site . '/const/viewer/super-lead.php';
	if ( file_exists($super_lead) ) {
		/* replace Proc::getTPBanner call with brands correct banner before output */
		$replacement_text = '';
		$se = array('{$banner_url}', '{$banner_text}', '{$title}', '{$url}');
		$re = array($banner_url, $banner_text, $title, $url);
		$primary_banner = file_get_contents($super_lead);
		$replacement_text = str_replace($se, $re, $primary_banner);
		$file = preg_replace('/<\#\s*Proc\s*name\s*=\s*"getTPBanner"\s*.*param="TP_TENTPOLE_HEADER".*\s*\/\#>/i', $replacement_text, $file);
	}
	
	if ( $procs != '' ) {
		foreach ( $procs as $proc => $value ) {
			$fs = strpos($folder, '/');
			$ss = strpos($folder, '/', $fs + 1);
			if ( $ss ) {
				$proc_module = 'packages/' . $site . '/' . substr($folder, $fs + 1, $ss - ($fs+1)) . '/procs/' . $value;
			} else {
				$proc_module = 'packages/' . $site . '/' . substr($folder, $fs + 1, strlen($folder) - ($fs+1)) . '/procs/' . $value;
			}
			if ( file_exists($proc_module) ) {
				$proc_module = file_get_contents($proc_module);
				$file = str_replace($proc, $proc_module, $file);
			}
		}
	}

	echo $file;
}

/* try to include a footer */
include $footer;

?>

<link rel="stylesheet" type="text/css" href="css/preview-debug.css"/>
<!-- startup script -->
<script type="text/javascript" language="javascript">



/* make all paths absolute in local */
var site = '<?=$site?>'.toLowerCase(),
	tentpole_id = '<?=$tentpole_id?>'.toLowerCase(),
	alt_header = '<?=$alt_header?>',
	sites = {
		'diy'		: { domain: 'http://www.diynetwork.com', wrapper: '#site-wrapper #diy-bd' },
		'hgtv'		: { domain: 'http://www.hgtv.com', wrapper: '#site-wrapper #hg-bd' },
		'remodels'	: { domain: 'http://www.hgtvremodels.com', wrapper: '.site-wrapper' },
		'frontdoor'		: { domain: 'http://www.frontdoor.com', wrapper: '#site-wrapper' },
		'food'		: { domain: 'http://www.foodnetwork.com', wrapper: '#site-wrapper #fn-bd' }
	},
	issues = {
		loadTime					: 0,
		nonRelAnchors				: { total: 0, elements: [] },
		thirdPartyAnchors			: { total: 0, elements: [] },
		thirdPartyNoTargetAnchors	: { total: 0, elements: [] },
		percent20Anchors			: { total: 0, elements: [] }
	},
	debugMode = false;
	
	if ( tentpole_id != '' ) {
		$('body').attr('id', tentpole_id);
	}
	
	
	
	if ( site == 'diy' ) {
		/* for DIY nav */
		var pack_nav = <?=json_encode($nav);?> || null;
		if ( pack_nav ) {
			var ul = $('<ul id="hub-nav" class="menu button-nav clrfix"/>').appendTo($('#site-wrapper .show-lead')[0]);
			$.each(pack_nav, function(n, v) {
				/* append: <li><a href="#" class="selected"><span>Tab 1</span></a></li> */
				var li = $('<li/>').appendTo(ul),
					a = $('<a href="' + (v.href != undefined ? v.href : '') + '" class="' + (v.class_name != undefined ? v.class_name : '') + '"/>').appendTo(li),
					
					span = $('<span/>').html(v.text || ('Btn ' + n)).appendTo(a);
			});
		}
	}

/* start up */
(function($) {
$(function() {
	/* put the page load timer first */
	//issues.loadTime = console.timeEnd('page_load');
	
	
	$('a[href^="http://"]', sites[site].wrapper).each(function() {
		issues.nonRelAnchors.total += 1;
		issues.nonRelAnchors.elements.push(this);
		if ( $(this).attr('href').indexOf(sites[site].domain) == -1 ) {
			issues.thirdPartyAnchors.total += 1;
			issues.thirdPartyAnchors.elements.push(this);
			if ( $(this).attr('target') != '_blank' ) {
				issues.thirdPartyNoTargetAnchors.total += 1;
				issues.thirdPartyNoTargetAnchors.elements.push(this);
			}
		}
	});
	
	$('a', sites[site].wrapper).each(function() {
		if ( $(this).attr('href') && $(this).attr('href') != '' && $(this).attr('href').indexOf('%20') != -1 ) {
			issues.percent20Anchors.total += 1;
			issues.percent20Anchors.elements.push(this);
		}
	});
	
	function debug( debug ) {
		if ( debug ) {
			$.each(issues.nonRelAnchors.elements, function() {
				$(this).addClass('non-rel-anchor');
			});
			$.each(issues.thirdPartyAnchors.elements, function() {
				$(this).addClass('third-party-anchor');
			});
			$.each(issues.thirdPartyNoTargetAnchors.elements, function() {
				$(this).addClass('third-party-no-target-anchor');
			});
			$.each(issues.percent20Anchors.elements, function() {
				$(this).addClass('percent-20-anchor');
			});
			//console.clear();
			console.info('page load time was: ' + issues.loadTime);
			console.warn('# non relative links: ', issues.nonRelAnchors.total, issues.nonRelAnchors);
			console.warn('# 3rd party links: ', issues.thirdPartyAnchors.total, issues.thirdPartyAnchors);
			console.warn('# 3rd party links (target != _blank): ', issues.thirdPartyNoTargetAnchors.total, issues.thirdPartyNoTargetAnchors);
			console.warn('# links ending with %20: ', issues.percent20Anchors.total, issues.percent20Anchors);
		} else {
			//console.clear();
			$('*').removeClass('non-rel-anchor third-party-anchor third-party-no-target-anchor');
			//console.clear();
		}
	};
	
	if ( console ) {
		debug(Boolean(eval(<?=$debug?>)));
		$(document).keyup(function(e) {
			if ( e.ctrlKey && e.shiftKey && e.altKey && e.keyCode === 68 ) {
				debug(debugMode = !debugMode);
			}
		});
	}
	
	//console.log(((new Date().getTime() - dt) / 1000) + ' seconds');
	/*
		this script makes relative links absolute to 'x' domain
		regardless if running on localhost or some server (e.g. frontend.scrippsnetworks.com)
		the urls will click through to their desired location
		
		it's recommended to have this be the last script that runs
	*/
	$('a[href^="/"]').each(function() {
		/* if "http://" is NOT found within the href string (e.g. a relative url) */
		if ( $(this).attr('href').indexOf('http://') == -1 ) {
			$(this).attr({
				'href'		: sites[site].domain + $(this).attr('href')/*,
				'target'	: '_blank'*/
			});
		}
	});
	
	
});
})(jQuery);

</script>