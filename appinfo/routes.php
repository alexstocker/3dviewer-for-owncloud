<?php

namespace OCA\Files_3dViewer\AppInfo;

$application = new Application();
$application->registerRoutes(
    $this,
    [
        'routes' => [
            [
                'name' => 'view#load',
                'url' => '/loadfile',
                'verb' => 'GET'
            ],
        ]
    ]
);
