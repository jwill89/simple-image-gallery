<?php

namespace Gallery\Storage;

use PDO;
use Gallery\Core\DatabaseConnection;
use Gallery\Structure\Image;

/**
 * ImageStorage Class
 *
 * This class is responsible for managing image storage in the database.
 */
class ImageStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'images';
    private const string TAGS_TABLE = 'image_tags';

    // Main Class Object Constant
    private const string OBJ_CLASS = Image::class;

    // Database Connection
    private PDO $db;

    /**
     * Class constructor
     *
     * Initializes the Database Connection.
     */
    public function __construct()
    {
        if (!isset($this->db)) {
            $this->db = DatabaseConnection::getInstance();
        }
    }

    /**
     * Retrieves an image or an array of images from the database.
     *
     * @param int|null $image_id Optional. The ID of the image to retrieve. If null, retrieves all images.
     *
     * @return Image|Image[] An Image object if $image_id is provided, otherwise an array of Image objects.
     */
    public function retrieve(?int $image_id = null): Image|array
    {
        // Initialize Images
        $images = [];

        // Check for Image ID for where clause
        $where = ($image_id !== null) ? " WHERE image_id = :image_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY image_id DESC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // If we have an image id, bind it
            if ($image_id !== null) {
                $stmt->bindParam(':image_id', $image_id, PDO::PARAM_INT);
            }

            // Try executing
            if ($stmt->execute()) {
                $images = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // If we only have 1 image, then we got an ID
                if ($image_id !== null && count($images) === 1) {
                    return $images[0];
                }
            }

            $stmt->closeCursor();
        }

        return $images;
    }

    /**
     * Get image based on supplied file name.
     *
     * @param string $file_name The file name of the image to retrieve.
     *
     * @return Image|null An Image object if found, otherwise null.
     */
    public function retrieveByFilename(string $file_name): ?Image
    {
        // Initialize Image
        $image = null;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "WHERE file_name = :file_name";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind file name
            $stmt->bindParam(':file_name', $file_name, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Set Fetch Mode
                $stmt->setFetchMode(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // Fetch result
                $image = $stmt->fetch();
            }

            $stmt->closeCursor();
        }

        return $image;
    }

    /**
     * Returns an array of images based on the supplied tag ids.
     *
     * @param array $tag_ids The array of tag IDs to search for.
     * @param int $page_number The page number to retrieve.
     * @param int $items_per_page The number of items per page.
     *
     * @return Image[] An array of Image objects.
     */
    public function retrieveWithTags(array $tag_ids, int $page_number, int $items_per_page): array
    {
        // Initialize Images
        $images = [];

        // Count the number of tags
        $tag_count = count($tag_ids);

        // Calculate the offset for pagination
        $offset = ($page_number - 1) * $items_per_page;

        // Setup the Query
        $sql = "SELECT img.* FROM " . self::MAIN_TABLE . " img
                    LEFT JOIN " . self::TAGS_TABLE . " tag
                    USING (image_id)
                    WHERE tag.tag_id IN (" . implode(',', $tag_ids) . ")
                    GROUP BY img.image_id 
                    HAVING COUNT(DISTINCT tag.tag_id) = :tag_count
                    ORDER BY img.image_id DESC
                    LIMIT :limit OFFSET :offset";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the parameters to the query
            $stmt->bindParam(':tag_count', $tag_count, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $items_per_page, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $images = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }

            $stmt->closeCursor();
        }

        return $images;
    }

    /**
     * Retrieves a number of images based on the supplied page number and the number of images per page.
     *
     * @param integer $page_number The page number to retrieve.
     * @param integer $items_per_page The number of items per page.
     *
     * @return Image[] An array of Image objects.
     */
    public function retrieveForPage(int $page_number, int $items_per_page): array
    {
        // Initialize Images
        $images = [];

        // Calculate the offset for pagination
        $offset = ($page_number - 1) * $items_per_page;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . " ORDER BY image_id DESC LIMIT :limit OFFSET :offset";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the limit and offset parameters
            $stmt->bindValue(':limit', $items_per_page, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $images = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }

            $stmt->closeCursor();
        }

        return $images;
    }

    /**
     * Gets the total number of images in the database.
     *
     * @return integer The total number of images in the database.
     */
    public function retrieveTotalImageCount(): int
    {
        // Initialize Total Count
        $total = 0;

        // Setup the Query
        $sql = "SELECT COUNT(*) AS total_images FROM " . self::MAIN_TABLE;

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Try executing
            if ($stmt->execute()) {
                $total = (int)$stmt->fetchColumn();
            }

            $stmt->closeCursor();
        }

        return $total;
    }

    /**
     * Gets the total number of images in the database with specific tags.
     *
     * @param array $tag_ids The array of tag IDs to search for.
     *
     * @return int The total number of images with the specified tags.
     */
    public function retrieveTotalImageWithTagsCount(array $tag_ids): int
    {
        // Initialize Total Count
        $total = 0;

        // Count the number of tags
        $tag_count = count($tag_ids);

        // Setup the Query
        $sql = "SELECT COUNT(*) FROM (SELECT img.* FROM " . self::MAIN_TABLE . " img
                    LEFT JOIN " . self::TAGS_TABLE . " tag
                    USING (image_id)
                    WHERE tag.tag_id IN (" . implode(',', $tag_ids) . ")
                    GROUP BY img.image_id 
                    HAVING COUNT(DISTINCT tag.tag_id) = :tag_count)";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the parameters to the query
            $stmt->bindParam(':tag_count', $tag_count, PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $total = (int)$stmt->fetchColumn();
            }

            $stmt->closeCursor();
        }

        return $total;
    }

    /**
     * Check if an image exists in the database based on file name or md5 hash.
     *
     * @param string $file_name The file name of the image to check.
     * @param string $hash The md5 hash of the image to check.
     *
     * @return bool True if the image exists, false otherwise.
     */
    public function imageExistsInDatabase(string $file_name, string $hash): bool
    {
        // Initialize In Database
        $in_database = false;

        // Define First Query
        $sql = "SELECT 1 FROM " . self::MAIN_TABLE . " WHERE file_name = :file_name OR hash = :hash LIMIT 1";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If statement prepared successfully
        if ($stmt) {
            // Bind parameters
            $stmt->bindParam(':file_name', $file_name, PDO::PARAM_STR);
            $stmt->bindParam(':hash', $hash, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Fetch the result
                $in_database = (int)$stmt->fetchColumn() === 1;
            }
        }

        return $in_database;
    }

    /**
     * Saves an image to the database.
     *
     * @param Image $image The image object to save.
     *
     * @return int The ID of the newly saved image.
     */
    public function store(Image $image): int
    {
        // Check if already exists
        if (empty($image->getImageId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (file_name, file_time, hash, bits_fingerprint) VALUES (:file_name, :file_time, :hash, :bits_fingerprint)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // Bind parameters
            if ($stmt) {
                $stmt->bindValue(':file_name', $image->getFileName(), PDO::PARAM_STR);
                $stmt->bindValue(':file_time', $image->getFileTime(), PDO::PARAM_INT);
                $stmt->bindValue(':hash', $image->getHash(), PDO::PARAM_STR);
                $stmt->bindValue(':bits_fingerprint', $image->getBitsFingerprint(), PDO::PARAM_STR);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $image->setImageId((int)$this->db->lastInsertId());
                }
            }
        }

        return $image->getImageId();
    }

    /**
     * Deletes an image from the database based on the supplied image.
     *
     * @param Image $image The image object to delete.
     *
     * @return bool True if the image was deleted, false otherwise.
     */
    public function delete(Image $image): bool
    {
        // Initialize Success
        $success = false;

        // Setup the Query
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE image_id = :image_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the image ID to the query
            $stmt->bindValue(':image_id', $image->getImageId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
