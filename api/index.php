<?php

// Required Autoloader
require_once('../vendor/autoload.php');

use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;
use Routes\Internal\ImageController;
use Routes\Internal\VideoController;
use Routes\Internal\TagController;
use Routes\Internal\PageController;

// Create Container using PHP-DI
$container = new Container();

// Register Container
AppFactory::setContainer($container);

// Setup the App and Log
$app = AppFactory::create();

// Set Base Path
$app->setBasePath("/api");

// Setup Middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// Setup Error Middleware
$error_middleware = $app->addErrorMiddleware(true, true, true);

// Setup Allowables and Response Origins
$app->add(function($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        ->withHeader('X-Frame-Options', 'SAMEORIGIN');
});

// Image Controllers
$app->group('/images', function (RouteCollectorProxy $group) {
    $group->get('/page/{page}[/]', ImageController::class . ':getImagesForPage');
    $group->get('/with-tags[/]', ImageController::class . ':getImagesWithTags');
    $group->get('/total[/]', ImageController::class . ':getTotalImages');
    $group->get('/[{image_id}[/]]', ImageController::class . ':getImage');
});

// Video Controllers
$app->group('/videos', function (RouteCollectorProxy $group) {
    $group->get('/page/{page}[/]', VideoController::class . ':getVideosForPage');
    $group->get('/with-tags[/]', VideoController::class . ':getVideosWithTags');
    $group->get('/total[/]', VideoController::class . ':getTotalVideos');
    $group->get('/[{video_id}[/]]', VideoController::class . ':getVideo');
});

// Tag Controllers
$app->group('/tag', function (RouteCollectorProxy $group) {
    $group->get('/[{tag_id}[/]]', TagController::class . ':getTag');
    $group->get('/for/image/{image_id}[/]', TagController::class . ':getTagsForImage');
    $group->get('/for/video/{video_id}[/]', TagController::class . ':getTagsForVideo');
    $group->put('/image/add[/]', TagController::class . ':addTagToImage');
    $group->put('/image/remove[/]', TagController::class . ':removeTagFromImage');
    $group->put('/video/add[/]', TagController::class . ':addTagToVideo');
    $group->put('/video/remove[/]', TagController::class . ':removeTagFromVideo');
});

// Page Controllers
$app->group('/pages', function (RouteCollectorProxy $group) {
    $group->get('/images[/]', PageController::class . ':getTotalImagePages');
    $group->get('/videos[/]', PageController::class . ':getTotalVideoPages');
    $group->get('/title[/]', PageController::class . ':getGalleryTitle');
});

// Run the app
$app->run();
