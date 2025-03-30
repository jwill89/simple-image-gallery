<?php

namespace Gallery\Collection;

use Imagick;
use ImagickException;
use OutOfBoundsException;
use Gallery\Storage\ImageStorage;
use Gallery\Structure\Image;

/**
 * ImageCollection class
 * This class is responsible for managing a collection of images and interacting with the database and filesystem.
 * It provides methods to retrieve, save, delete images, and create thumbnails.
 */
class ImageCollection
{
    // Directory where Images are stored
    public const string IMAGE_DIRECTORY = 'images/';
    public const string IMAGE_DIRECTORY_FULL = 'images/full/';
    public const string IMAGE_DIRECTORY_THUMBNAILS = 'images/thumbs/';
    
    // Image Database Storage Object
    private ImageStorage $storage;

    /**
     * ImageCollection constructor.
     * Initializes the ImageStorage object.
     */
    public function __construct()
    {
        if (!isset($this->storage)) {
            $this->storage = new ImageStorage();
        }
    }

    /**
     * Gets an image based on supplied image ID.
     * 
     * @param integer $image_id
     * @return Image
     */
    public function get(int $image_id): Image
    {
        return $this->storage->retrieve($image_id);
    }

    /**
     * Gets all images.
     *
     * @return array
     */
    public function getAll(): array
    {
        return $this->storage->retrieve();
    }

    /**
     * Gets a number of images based on the supplied page number.
     *
     * @param integer $page_number
     * @return array
     */
    public function getForPage(int $page_number): array
    {
        return $this->storage->retrieveForPage($page_number);
    }

    /**
     * Gets the total number of images in the database.
     *
     * @return integer
     */
    public function totalImages(): int
    {
        return $this->storage->retrieveTotalImageCount();
    }

    /**
     * @throws ImagickException
     */
    public function createThumbnail(Image $image_obj): void
    {
        // Max Width/Height of Thumbnail
        $max_size = 200;

        // Start New Thumbnail
        $image = new Imagick(self::IMAGE_DIRECTORY . $image_obj->getFilename());

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
        $image_filename = pathinfo($image->getImageFilename());

        // Extension fis the same as the original
        $ext = $image_filename['extension'];

        // Write Thumbnail
        $image->writeImage(self::IMAGE_DIRECTORY_THUMBNAILS . $image_filename['filename']. '.' . $ext);

        $image->clear();
    }

    /**
     * Saves an image to the database and generates a thumbnail.
     *
     * @param Image $image
     * @return int The ID of the newly saved image.
     */
    public function save(Image $image): int
    {
        // Save the image to the database
        $image_id = $this->storage->store($image);

        // If we have an ID, we can assume it was successful and generate a thumbnail
        if ($image_id > 0) {
            // Set the ID of the image object to the ID returned from the database
            $image->setId($image_id);

            // Create a thumbnail for the image
            $this->createThumbnail($image);
        }

        return $image->getId();
    }

    /**
     * Deletes an image from the database and the filesystem.
     *
     * @param Image $image
     * @return bool
     */
    public function delete(Image $image): bool
    {
        // Delete the image from the database
        $success = $this->storage->delete($image);

        // Delete the image and thumbnail from the filesystem
        if ($success) {
            $image_path = self::IMAGE_DIRECTORY . $image->getFilename();
            $thumbnail_path = self::IMAGE_DIRECTORY_THUMBNAILS . $image->getFilename();

            // Delete the image file
            if (file_exists($image_path)) {
                unlink($image_path);
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
