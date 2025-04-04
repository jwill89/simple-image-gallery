<?php

namespace Routes\Internal;

use Psr\Container\ContainerInterface;
use Slim\Http\ServerRequest as Request;
use Slim\Http\Response;
use Gallery\Collection\ImageCollection;
use Gallery\Collection\VideoCollection;

/**
 * PageController class
 * This class is responsible for handling image-related requests for the API.
 */
class PageController extends AbstractController
{
    private const string SITE_TITLE = 'Image Gallery';
    private const int PER_PAGE = 40;

    // Collections
    private ImageCollection $image_collection;
    private VideoCollection $video_collection;

    /**
     * ImageController constructor
     * This function is used to initialize the ImageController class.
     * It sets up the image and tag collections for use in the class methods.
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        // Parent Constructor
        parent::__construct($container);

        // Set collections for use in class methods
        $this->image_collection = new ImageCollection();
        $this->video_collection = new VideoCollection();
    }

    /**
     * getTotalImagePages function
     * This function is used to get the total number of image pages based on the number of items per page.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTotalImagePages(Request $request, Response $response, array $args): Response
    {
        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // Get total images
        $total_images = $this->image_collection->totalImages();
        $total_pages = (int)ceil($total_images / self::PER_PAGE);

        // Set the return data
        $data = $total_pages;

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * getTotalVideoPages function
     * This function is used to get the total number of video pages based on the number of items per page.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTotalVideoPages(Request $request, Response $response, array $args): Response
    {
        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // Get total videos
        $total_videos = $this->video_collection->totalVideos();
        $total_pages = (int)ceil($total_videos / self::PER_PAGE);

        // Set the return data
        $data = $total_pages;

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * getGalleryTitle function
     * This function is used to get the title of the gallery.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getGalleryTitle(Request $request, Response $response, array $args): Response
    {
        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // Get total images
        $data = self::SITE_TITLE;

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }
}
