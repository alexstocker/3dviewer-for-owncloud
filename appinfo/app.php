<?php

namespace OCA\Files_3dViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

\OCP\Util::addScript('files_3dviewer', 'fileinfodetailview');
\OCP\Util::addScript('files_3dviewer', 'previewplugin');
\OCP\Util::addScript('files_3dviewer', 'fileinfo');
\OCP\Util::addStyle('files_3dviewer', 'style');

\OCP\Util::addScript('files_3dviewer', 'stl_viewer.min');
\OCP\Util::addScript('files_3dviewer', 'parser.min');
\OCP\Util::addScript('files_3dviewer', 'load_stl.min');
\OCP\Util::addScript('files_3dviewer', 'webgl_detector');
\OCP\Util::addScript('files_3dviewer', 'CanvasRenderer');
\OCP\Util::addScript('files_3dviewer', 'OrbitControls');
\OCP\Util::addScript('files_3dviewer', 'TrackballControls');
\OCP\Util::addScript('files_3dviewer', 'Projector');
\OCP\Util::addScript('files_3dviewer', 'tree.min');
