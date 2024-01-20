<?php

namespace OCA\Files_3dViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

\OCP\Util::addScript('files_3dviewer', 'fileinfodetailview');
\OCP\Util::addScript('files_3dviewer', 'previewplugin');
\OCP\Util::addScript('files_3dviewer', 'fileinfo');
\OCP\Util::addStyle('files_3dviewer', 'style');

\OCP\Util::addScript('files_3dviewer', 'stl_viewer.min');
