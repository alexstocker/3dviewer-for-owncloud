<?php
namespace OCA\Files_3dViewer\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\IAppContainer;

class Application extends App {

	public function __construct(array $urlParams=[]){
		parent::__construct('Files_3dViewer', $urlParams);
	}
}
