<?php

namespace Gallery\Collection;

use Imagick;
use ImagickException;
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
     * @throws ImagickException
     */
    public function createThumbnail(Video $video_obj): void
    {
        // Max Width/Height of Thumbnail
        $max_size = 200;

        // Start New Thumbnail
        $video = new Imagick(self::VIDEO_DIRECTORY . $video_obj->getFileName());

        // If the video is wider
        if ($video->getImageHeight() <= $video->getImageWidth()) {
            // Resize video using the lanczos resampling algorithm based on width
            $video->resizeImage($max_size, 0, Imagick::FILTER_LANCZOS, 1);

            // If the video is taller
        } else {
            // Resize video using the lanczos resampling algorithm based on height
            $video->resizeImage(0, $max_size, Imagick::FILTER_LANCZOS, 1);
        }

        // Set to use jpeg compression
        $video->setImageCompression(Imagick::COMPRESSION_JPEG);

        // Set compression level (1 lowest quality, 100 highest quality)
        $video->setImageCompressionQuality(75);

        // Strip out unneeded meta data
        $video->stripImage();

        // Start Thumbnail Write
        $video_file_name = pathinfo($video->getImageFilename());

        // Extension fis the same as the original
        $ext = $video_file_name['extension'];

        // Write Thumbnail
        $video->writeImage(self::VIDEO_DIRECTORY_THUMBNAILS . $video_file_name['filename']. '.' . $ext);

        $video->clear();
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
        //if ($video_id > 0) {
        //    // Create a thumbnail for the video
        //    $this->createThumbnail($video);
        //}

        return $video_id;
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
