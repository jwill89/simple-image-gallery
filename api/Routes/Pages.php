<?php

namespace Routes;

use Gallery\Config;
use Gallery\Collections\ImageCollection;
use Gallery\Collections\VideoCollection;
use Slim\App;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

class Pages
{

    private App $app;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function getPageTitle(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/pages/title/', function (Request $request, Response $response) {

            // Encode page title
            $json = json_encode(Config::GALLERY_TITLE, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getImagePages(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/pages/images/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new ImageCollection();

            // Get Totals
            $total_images = $collection->getTotalImages();
            $total_pages = (int)ceil($total_images / Config::PER_PAGE);

            // Encode total pages
            $json = json_encode($total_pages, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getVideoPages(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/pages/videos/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new VideoCollection();

            // Get Totals
            $total_videos = $collection->getTotalVideos();
            $total_pages = ceil($total_videos / Config::PER_PAGE);

            // Encode total pages
            $json = json_encode($total_pages, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

}