<?php

namespace Routes;

use Gallery\Objects\Image;
use Gallery\Collections\ImageCollection;
use Slim\App;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

class Images
{
    private App $app;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function getImage(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/images/image/{id}/', function (Request $request, Response $response, $args) {
            $id = (int)$args['id'];

            // Error on invalid ID
            if (empty($id)) {
                $error_data = ['error' => 'Invalid id supplied. ID must be numeric and non-zero.'];
                $json = json_encode($error_data, JSON_THROW_ON_ERROR);

                // Write error to response
                $response->getBody()->write($json);

                // Return error response
                return $response->withHeader('Content-Type', 'application/json')
                    ->withStatus(404);
            }

            // Get image and encode
            $image = new Image($id);
            $json = json_encode($image, JSON_THROW_ON_ERROR);

            // Write image to response
            $response->getBody()->write($json);

            // Return image response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getImagesForPage(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/images/page/{page}/', function (Request $request, Response $response, $args) {
            $page = (int)$args['page'];

            // Error on invalid page
            if ($page < 0) {
                $error_data = ['error' => 'Invalid page supplied. Page must be numeric and non-negative.'];
                $json = json_encode($error_data, JSON_THROW_ON_ERROR);

                // Write error to response
                $response->getBody()->write($json);

                // Return error response
                return $response->withHeader('Content-Type', 'application/json')
                    ->withStatus(404);
            }

            // Setup Collection
            $collection = new ImageCollection();

            // Get images and encode
            $images = $collection->getImagesByPage($page);
            $json = json_encode($images, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getAllImages(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/images/all/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new ImageCollection();

            // Get images and encode
            $images = $collection->getAllImages();
            $json = json_encode($images, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getTotalImages(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/images/total/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new ImageCollection();

            // Get images and encode
            $total = $collection->getTotalImages();
            $json = json_encode($total, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }
}
