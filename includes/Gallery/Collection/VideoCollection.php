<?php

namespace Gallery\Collection;

use Imagick;
use ImagickException;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;
use OutOfBoundsException;
use Gallery\Storage\VideoStorage;
use Gallery\Structure\Video;

/**
 * VideoCollection class
 * This class is responsible for managing a collection of videos and interacting with the database and filesystem.
 * It provides methods to retrieve, save, delete videos, and create thumbnails.
 * It also handles the creation of thumbnails for the videos.
 */
class VideoCollection
{
    // Directory where Images are stored
    public const string VIDEO_DIRECTORY = 'videos/';
    public const string VIDEO_DIRECTORY_FULL = 'videos/full/';
    public const string VIDEO_DIRECTORY_THUMBNAILS = 'videos/thumbs/';
    
    // Video Database Storage Object
    private VIdeoStorage $storage;

    /**
     * VideoCollection constructor.
     * Initializes the VIdeoStorage object.
     */
    public function __construct()
    {
        if (!isset($this->storage)) {
            $this->storage = new VIdeoStorage();
        }
    }

    /**
     * Gets an video based on supplied video ID.
     * 
     * @param integer $video_id
     * @return Video
     */
    public function get(int $video_id): Video
    {
        return $this->storage->retrieve($video_id);
    }

    /**
     * Gets all videos.
     *
     * @return array
     */
    public function getAll(): array
    {
        return $this->storage->retrieve();
    }

    /**
     * Gets a number of videos based on the supplied page number.
     *
     * @param integer $page_number
     * @return array
     */
    public function getForPage(int $page_number): array
    {
        return $this->storage->retrieveForPage($page_number);
    }

    /**
     * Gets a number of videos based on the supplied page number and tag ID.
     *
     * @param array $tag_ids
     * @return array
     */
    public function getWithTags(array $tag_ids): array
    {
        return $this->storage->retrieveWithTags($tag_ids);
    }

    /**
     * Gets the total number of videos in the database.
     *
     * @return integer
     */
    public function totalVideos(): int
    {
        return $this->storage->retrieveTotalVideoCount();
    }

    /**
     * Saves an video to the database and generates a thumbnail.
     *
     * @param Video $video
     * @return int The ID of the newly saved video.
     */
    public function save(Video $video): int
    {
        // Save the video to the database
        $video_id = $this->storage->store($video);

        // If we have an ID, we can assume it was successful and generate a thumbnail
        if ($video_id > 0) {

            // Determine if we need to use Imagick or FFMpeg to make the Thumbnail
            if (pathinfo($video->getFileName(), PATHINFO_EXTENSION) === 'gif') {
                // Use Imagick to create a thumbnail for GIFs
                $this->createGifThumbnail($video);
            } else {
                // Use FFMpeg to create a thumbnail for other video formats
                $this->createThumbnail($video);
            }
        }

        return $video_id;
    }

    /**
     * Creates a thumbnail for the video if nog in GIF format.
     * It uses the PHP-FFMpeg library to generate a thumbnail image from the video.
     *
     * @param Video $video_obj
     * @return void
     */
    public function createThumbnail(Video $video_obj): void
    {
        // Create a new FFMpeg instance
        $ffmpeg = FFMpeg::create();

        // Open the video file
        $video = $ffmpeg->open(self::VIDEO_DIRECTORY . $video_obj->getFileName());

        // Set the thumbnail path and filename
        $thumbnail_path = self::VIDEO_DIRECTORY_THUMBNAILS . pathinfo($video_obj->getFileName(), PATHINFO_FILENAME) . '.jpg';

        // Take a screenshot at 1 second into the video
        $video->frame(TimeCode::fromSeconds(1))->save($thumbnail_path);

        // Resize Thumbnail
        if (file_exists($thumbnail_path)) {
            $this->resizeThumbnail($thumbnail_path);
        }
        
    }

    /**
     * Creates a thumbnail for GIFs using Imagick.
     * 
     * @throws ImagickException
     */
    public function createGifThumbnail(Video $video_obj): void
    {
        // Max Width/Height of Thumbnail
        $max_size = 200;

        // Start New Thumbnail
        $image = new Imagick(self::VIDEO_DIRECTORY . $video_obj->getFileName());
        $image->setImageDispose(Imagick::DISPOSE_NONE);
        $image->setImageGravity(Imagick::GRAVITY_CENTER);
        try {
            $image->optimizeImageLayers();
        } catch (ImagickException $e) {
            // NDo Not Optimize
        }
        


        // If the image is wider
        if ($image->getImageHeight() <= $image->getImageWidth()) {
            // Resize image using the lanczos resampling algorithm based on width
            $image->resizeImage($max_size, 0, Imagick::FILTER_LANCZOS, 1);

            // If the image is taller
        } else {
            // Resize image using the lanczos resampling algorithm based on height
            $image->resizeImage(0, $max_size, Imagick::FILTER_LANCZOS, 1);
        }

        // Set to use jpeg compression
        $image->setImageCompression(Imagick::COMPRESSION_JPEG);

        // Set compression level (1 lowest quality, 100 highest quality)
        $image->setImageCompressionQuality(75);

        // Strip out unneeded meta data
        $image->stripImage();

        // Start Thumbnail Write
        $image_file_name = pathinfo($image->getImageFilename());

        // Write Thumbnail
        $image->writeImage(self::VIDEO_DIRECTORY_THUMBNAILS . $image_file_name['filename']. '.' . 'jpg');

        $image->clear();
    }

    /**
     * Resizes a thumbnail if created via FFMpeg
     *
     * @param string $thumbnail_path
     * @return void
     */
    public function resizeThumbnail(string $thumbnail_path): void
    {
        // Max Width/Height of Thumbnail
        $max_size = 200;

        // Create a new Imagick instance
        $thumbnail = new Imagick($thumbnail_path);

        // If the image is wider
        if ($thumbnail->getImageHeight() <= $thumbnail->getImageWidth()) {
            // Resize image using the lanczos resampling algorithm based on width
            $thumbnail->resizeImage($max_size, 0, Imagick::FILTER_LANCZOS, 1);

            // If the image is taller
        } else {
            // Resize image using the lanczos resampling algorithm based on height
            $thumbnail->resizeImage(0, $max_size, Imagick::FILTER_LANCZOS, 1);
        }

        // Save the resized image
        $thumbnail->writeImage($thumbnail_path);

        // Clear the Imagick instance
        $thumbnail->clear();
    }

    /**
     * Deletes an video from the database and the filesystem.
     *
     * @param Video $video
     * @return bool
     */
    public function delete(Video $video): bool
    {
        // Delete the video from the database
        $success = $this->storage->delete($video);

        // Delete the video and thumbnail from the filesystem
        if ($success) {
            $video_path = self::VIDEO_DIRECTORY . $video->getFileName();
            $thumbnail_path = self::VIDEO_DIRECTORY_THUMBNAILS . $video->getFileName();

            // Delete the video file
            if (file_exists($video_path)) {
                unlink($video_path);
            }

            // Delete the thumbnail file
            if (file_exists($thumbnail_path)) {
                unlink($thumbnail_path);
            }
        } else {
            throw new OutOfBoundsException('Image not found in database.');
        }

        return $success;
    }
}
