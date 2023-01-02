<?php

namespace Routes;

use Gallery\Objects\Video;
use Gallery\Collections\VideoCollection;
use Slim\App;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

class Videos
{
    private App $app;

    public function __construct(App $app)
    {
        $this->app = $app;
    }

    public function getVideo(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/videos/video/{id}/', function (Request $request, Response $response, $args) {
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
            $video = new Video($id);
            $json = json_encode($video, JSON_THROW_ON_ERROR);

            // Write image to response
            $response->getBody()->write($json);

            // Return image response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getVideosForPage(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/videos/page/{page}/', function (Request $request, Response $response, $args) {
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
            $collection = new VideoCollection();

            // Get images and encode
            $videos = $collection->getVideosByPage($page);
            $json = json_encode($videos, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getAllVideos(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/videos/all/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new VideoCollection();

            // Get images and encode
            $videos = $collection->getAllVideos();
            $json = json_encode($videos, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function getTotalVideos(): void
    {
        // Set app
        $app = $this->app;

        // Set the route
        $app->get('/videos/total/', function (Request $request, Response $response) {

            // Setup Collection
            $collection = new VideoCollection();

            // Get images and encode
            $total = $collection->getTotalVideos();
            $json = json_encode($total, JSON_THROW_ON_ERROR);

            // Write images to response
            $response->getBody()->write($json);

            // Return image array response
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

}
