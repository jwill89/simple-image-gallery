<?php

namespace Routes\Internal;

use Psr\Container\ContainerInterface;
use Slim\Http\ServerRequest as Request;
use Slim\Http\Response;
use Gallery\Collection\TagCollection;
use Gallery\Collection\ImageCollection;
use Gallery\Collection\VideoCollection;
use Gallery\Structure\Image;
use Gallery\Structure\Video;
use Gallery\Structure\Tag;

/**
 * TagController class
 * This class is responsible for handling tag-related requests for the API.
 */
class TagController extends AbstractController
{
    private TagCollection $tag_collection;
    private ImageCollection $image_collection;
    private VideoCollection $video_collection;

    /**
     * TagController constructor
     * This function is used to initialize the TagController class.
     * It sets up the tag collection for use in the class methods.
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        // Parent Constructor
        parent::__construct($container);

        // Set collections for user in class methods
        $this->tag_collection = new TagCollection();
        $this->image_collection = new ImageCollection();
        $this->video_collection = new VideoCollection();
    }

    /**
     * getTag function
     * This function is used to get a tag or a collection of tags.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTag(Request $request, Response $response, array $args): Response
    {
        // Initialize Tag ID if provided
        $tag_id = $this->parseParameters($args, 'tag_id', null);

        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // If invalid ID provided, return error
        if (!empty($tag_id) && (!is_numeric($tag_id) || $tag_id <= 0)) {
            $data = ['error' => 'InvalidTagID'];
            $status = 400;
        // If tag ID provided, get the tag
        } elseif (!empty($tag_id) && $tag_id > 0) {
            $data = $this->tag_collection->get($tag_id);
        // If no tag ID provided, get all tags
        } elseif ($tag_id === null) {
            $data = $this->tag_collection->getAll();
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * getTagsForImage function
     * This function is used to get the tags for a specific image.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTagsForImage(Request $request, Response $response, array $args): Response
    {
        // Initialize Image ID if provided
        $image_id = $this->parseParameters($args, 'image_id', 0);

        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // If invalid ID provided, return error
        if (!empty($image_id) && (!is_numeric($image_id) || $image_id <= 0)) {
            $data = ['error' => 'InvalidImageID'];
            $status = 400;
        // If image ID provided, get the tags
        } elseif (!empty($image_id) && $image_id > 0) {
            // Get the image
            $image = $this->image_collection->get($image_id);
            // Get the tags for the image
            $data = $this->tag_collection->getTagsForImage($image);
        
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * getTagsForVideo function
     * This function is used to get the tags for a specific video.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function getTagsForVideo(Request $request, Response $response, array $args): Response
    {
        // Initialize Video ID if provided
        $video_id = $this->parseParameters($args, 'video_id', 0);

        // Assume status OK
        $status = 200;

        // Default Data
        $data = [];

        // If invalid ID provided, return error
        if (!empty($video_id) && (!is_numeric($video_id) || $video_id <= 0)) {
            $data = ['error' => 'InvalidVideoID'];
            $status = 400;
        // If video ID provided, get the tags
        } elseif (!empty($video_id) && $video_id > 0) {
            // Get the video
            $video = $this->video_collection->get($video_id);
            // Get the tags for the video
            $data = $this->tag_collection->getTagsForVideo($video);
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * addTagToImage function
     * This function is used to add a tag to a specific image.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function addTagToImage(Request $request, Response $response, array $args): Response
    {
        // Initialize Required Variables
        $params = $request->getParsedBody();
        $image_id = (int)$this->parseParameters($params, 'image_id', 0);
        $tag_name = $this->parseParameters($params, 'tag_name', '');

        // Assume OK status
        $status = 200;

        // Return Tags for Image
        $data = [];

        // Check for valid image id
        if ($image_id <= 0) {
            $data = ['error' => 'InvalidImageID'];
            $status = 400;
        } else {
            // Get the image
            $image = $this->image_collection->get($image_id);

            // Validate it's an image
            if (!($image instanceof Image)) {
                $data = ['error' => 'ImageDoesNotExist'];
                $status = 404;
            } else {
                // Check for valid tag name
                if ($tag_name === '') {
                    $data = ['error' => 'InvalidTagName'];
                    $status = 404;
                } else {
                    // Get/Create the tag
                    $tag = $this->tag_collection->getOrCreate($tag_name);

                    // Check for valid tag.
                    if (!($tag instanceof Tag)) {
                        $data = ['error' => 'CouldNotFindOrCreateTag'];
                        $status = 404;
                    } else {
                        // Add the tag to the image tags
                        $tag_added = $this->tag_collection->addTagToImage($image, $tag);

                        // If tag not added, set error
                        if (!$tag_added) {
                            $data = ['error' => 'CouldNotAddTagToImage'];
                            $status = 404;
                        } else {
                            // Get the tags for the image now that we updated them
                            $data = $this->tag_collection->getTagsForImage($image);
                        }
                    }
                }
            }
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * addTagToVideo function
     * This function is used to add a tag to a specific video.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function addTagToVideo(Request $request, Response $response, array $args): Response
    {
        // Initialize Required Variables
        $params = $request->getParsedBody();
        $video_id = (int)$this->parseParameters($params, 'video_id', 0);
        $tag_name = $this->parseParameters($params, 'tag_name', '');

        // Assume OK status
        $status = 200;

        // Return Tags for Video
        $data = [];

        // Check for valid video id
        if ($video_id <= 0) {
            $data = ['error' => 'InvalidVideoID'];
            $status = 400;
        } else {
            // Get the video
            $video = $this->video_collection->get($video_id);

            // Validate it's an video
            if (!($video instanceof Video)) {
                $data = ['error' => 'VideoDoesNotExist'];
                $status = 404;
            } else {
                // Check for valid tag name
                if ($tag_name === '') {
                    $data = ['error' => 'InvalidTagName'];
                    $status = 404;
                } else {
                    // Get/Create the tag
                    $tag = $this->tag_collection->getOrCreate($tag_name);

                    // Check for valid tag.
                    if (!($tag instanceof Tag)) {
                        $data = ['error' => 'CouldNotFindOrCreateTag'];
                        $status = 404;
                    } else {
                        // Add the tag to the video tags
                        $tag_added = $this->tag_collection->addTagToVideo($video, $tag);

                        // If tag not added, set error
                        if (!$tag_added) {
                            $data = ['error' => 'CouldNotAddTagToVideo'];
                            $status = 404;
                        } else {
                            // Get the tags for the video now that we updated them
                            $data = $this->tag_collection->getTagsForVideo($video);
                        }
                    }
                }
            }
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * removeTagFromImage function
     * This function is used to remove a tag from a specific image.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function removeTagFromImage(Request $request, Response $response, array $args): Response
    {
        // Initialize Required Variables
        $params = $request->getParsedBody();
        $image_id = (int)$this->parseParameters($params, 'image_id', 0);
        $tag_id = (int)$this->parseParameters($params, 'tag_id', 0);

        // Assume OK status
        $status = 200;

        // Return Tags for Image
        $data = [];

        // Check for valid image id
        if ($image_id <= 0) {
            $data = ['error' => 'InvalidImageID'];
            $status = 400;
        } else {
            // Get the image
            $image = $this->image_collection->get($image_id);

            // Validate it's an image
            if (!($image instanceof Image)) {
                $data = ['error' => 'ImageDoesNotExist'];
                $status = 404;
            } else {
                // Check for valid tag name
                if ($$tag_id <= 0) {
                    $data = ['error' => 'InvalidTagID'];
                    $status = 404;
                } else {
                    // Get the tag
                    $tag = $this->tag_collection->get($tag_id);

                    // Check for valid tag.
                    if (!($tag instanceof Tag)) {
                        $data = ['error' => 'CouldNotFindTag'];
                        $status = 404;
                    } else {
                        // Remove the tag from the image tags
                        $tag_removed = $this->tag_collection->removeTagFromImage($image, $tag);

                        // If tag not removed, set error
                        if (!$tag_removed) {
                            $data = ['error' => 'CouldNotRemoveTagFromImage'];
                            $status = 404;
                        } else {
                            // Get the tags for the image now that we updated them
                            $data = $this->tag_collection->getTagsForImage($image);
                        }
                    }
                }
            }
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }

    /**
     * fromTagFromVideo function
     * This function is used to remove a tag from a specific video.
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function fromTagFromVideo(Request $request, Response $response, array $args): Response
    {
        // Initialize Required Variables
        $params = $request->getParsedBody();
        $video_id = (int)$this->parseParameters($params, 'video_id', 0);
        $tag_id = (int)$this->parseParameters($params, 'tag_id', 0);

        // Assume OK status
        $status = 200;

        // Return Tags for Video
        $data = [];

        // Check for valid video id
        if ($video_id <= 0) {
            $data = ['error' => 'InvalidVideoID'];
            $status = 400;
        } else {
            // Get the image
            $video = $this->video_collection->get($video_id);

            // Validate it's an image
            if (!($video instanceof Video)) {
                $data = ['error' => 'VideoDoesNotExist'];
                $status = 404;
            } else {
                // Check for valid tag name
                if ($$tag_id <= 0) {
                    $data = ['error' => 'InvalidTagID'];
                    $status = 404;
                } else {
                    // Get the tag
                    $tag = $this->tag_collection->get($tag_id);

                    // Check for valid tag.
                    if (!($tag instanceof Tag)) {
                        $data = ['error' => 'CouldNotFindTag'];
                        $status = 404;
                    } else {
                        // Remove the tag from the video tags
                        $tag_removed = $this->tag_collection->removeTagFromVideo($video, $tag);

                        // If tag not removed, set error
                        if (!$tag_removed) {
                            $data = ['error' => 'CouldNotRemoveTagFromVideo'];
                            $status = 404;
                        } else {
                            // Get the tags for the video now that we updated them
                            $data = $this->tag_collection->getTagsForVideo($video);
                        }
                    }
                }
            }
        }

        // Return data as json with HTTP status response
        return $response->withJson($data, $status);
    }
}
