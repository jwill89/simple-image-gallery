<?php

namespace Routes\Internal;

use Psr\Container\ContainerInterface;
use Slim\Http\ServerRequest as Request;
use Slim\Http\Response;
use Gallery\Collection\VideoCollection;
use Gallery\Collection\TagCollection;

/**
 * VideoController class
 * This class is responsible for handling video-related requests for the API.
 */
class VideoController extends AbstractController
{
    private VideoCollection $video_collection;
    private TagCollection $tag_collection;

    /**
     * VideoController constructor
     * This function is used to initialize the VideoController class.
     * It sets up the video and tag collections for use in the class methods.
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        // Parent Constructor
        parent::__construct($container);

        // Set collections for use in class methods
        $this->video_collection = new VideoCollection();
        $this->tag_collection = new TagCollection();
    }

    /**
     * getVideo function
     * This function is used to get an video or a collection of videos.
     * It can be used to get a single video by ID or all videos if no ID is provided.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getVideo(Request $request, Response $response, array $args): Response
    {
        // Initialize Video ID if provided
        $video_id = $this->parseParameters($args, 'video_id', null);

        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // If invalid ID provided, return error
        if (!empty($video_id) && (!is_numeric($video_id) || $video_id <= 0)) {
            $data = ['error' => 'InvalidVideoID'];
            $status = 400;
        // If video ID provided, get the video
        } elseif (!empty($video_id) && $video_id > 0) {
            $data = $this->video_collection->get($video_id);
        // If no video ID provided, get all videos
        } elseif ($video_id === null) {
            $data = $this->video_collection->getAll();
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * getVideosForPage function
     * This function is used to get a collection of videos for a specific page.
     * It can be used to paginate through the videos.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getVideosForPage(Request $request, Response $response, array $args): Response
    {
        // Initialize Page if provided
        $page = (int)$this->parseParameters($args, 'page', 0);

        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // Error on invalid page
        if ($page <= 0) {
            $data = ['error' => 'InvalidPageNumber'];
            $status = 400;
        // If valid page provided, get videos for that page
        } elseif ($page > 0) {
            // Get videos and encode
            $data = $this->video_collection->getForPage($page);
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    public function getVideosForTag(Request $request, Response $response, array $args): void
    {
       // TODO: Implement getVideosForTag method
    }

    /**
     * getTotalVideos function
     * This function is used to get the total number of videos in the database.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTotalVideos(Request $request, Response $response, array $args): Response
    {
        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // Get total videos
        $data = $this->video_collection->totalVideos();

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }
}
