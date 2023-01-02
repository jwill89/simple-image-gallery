<?php

// Required Autoloader
require_once('../vendor/autoload.php');

use Slim\Factory\AppFactory;

// Setup the App and Log
$app = AppFactory::create();

// Set Base Path
$app->setBasePath("/api");

// Setup Routing Middleware
$app->addRoutingMiddleware();

// Setup Error Middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Images
$image_handler = new \Routes\Images($app);
$image_handler->getImage();
$image_handler->getImagesForPage();
$image_handler->getAllImages();
$image_handler->getTotalImages();

// Videos
$video_handler = new \Routes\Videos($app);
$video_handler->getVideo();
$video_handler->getVideosForPage();
$video_handler->getAllVideos();
$video_handler->getTotalVideos();

// Pages
$pages_handler = new \Routes\Pages($app);
$pages_handler->getPageTitle();
$pages_handler->getImagePages();
$pages_handler->getVideoPages();

// Run the app
$app->run();
