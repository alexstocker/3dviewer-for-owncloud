<?php
namespace OCA\Files_3dViewer\AppInfo;

use OCP\AppFramework\App;
use OCA\Files_3dViewer\Controller\ViewController;
use OCP\AppFramework\IAppContainer;

class Application extends App {

	public function __construct(array $urlParams=[]){
		parent::__construct('Files_3dViewer', $urlParams);

		$container = $this->getContainer();
        $server = $container->getServer();

		/**
		 * Controllers
		 */
        $container->registerService('FileHandlingController', function (IAppContainer $c) use ($server) {
			return new ViewController(
                $c->getAppName(),
                $server->getRequest(),
                $server->getL10N($c->getAppName()),
                $server->getLogger(),
                $server->getShareManager(),
                $server->getUserSession(),
                $server->getRootFolder()
			);
		});
	}
}
