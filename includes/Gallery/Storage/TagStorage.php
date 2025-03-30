<?php

namespace Gallery\Storage;

use PDO;
use PDOException;
use Gallery\Core\DatabaseConnection;
use Gallery\Structure\Tag;

/**
 * TagStorage Class
 * This class is responsible for managing tag storage in the database.
 */
class TagStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'tags';
    private const string IMAGE_TAG_TABLE = 'image_tags';
    private const string VIDEO_TAG_TABLE = 'video_tags';

    // Main Class Object Constant
    private const OBJ_CLASS = Tag::class;

    // Database Connection
    private PDO $db;

    /**
     * Class constructor
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
     * @param integer|null $tag_id
     * @return Tag|array
     */
    public function retrieve(?int $tag_id = null): Tag|array
    {
        // Initialize Tags
        $tags = [];

        // Check for Tag ID for where clause
        $where = ($tag_id !== null) ? " WHERE id = :tag_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY id DESC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // If we have an image id, bind it
            if ($tag_id !== null) {
                $stmt->bindParam(':tag_id', $tag_id, PDO::PARAM_INT);
            }

            // Try executing
            if ($stmt->execute()) {
                $tags = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // If we only have 1 image, then we got an ID
                if ($tag_id !== null && count($tags) === 1) {
                    return $tags[0];
                }
            }
            
            $stmt->closeCursor();
        }

        return $tags;
    }

    /**
     * Get image based on supplied file name.
     *
     * @param string $filename
     * @return Tag|null
     */
    public function retrieveByFilename(string $filename): ?Tag
    {
        // Initialize Tag
        $tag = null;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "WHERE filename = :filename";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind file name
            $stmt->bindParam(':filename', $filename, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Set Fetch Mode
                $stmt->setFetchMode(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // Fetch result
                $tag = $stmt->fetch();
            }
            
            $stmt->closeCursor();
        }

        return $tag;
    }

    /**
     * Gets the total number of images in the database.
     *
     * @return integer
     */
    public function retrieveTotalTagCount(): int
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
     * Check if a tag exists in the database based on tag title.
     * @param string $tag 
     * @return bool 
     * @throws PDOException 
     */
    public function tagExistsInDatabase(string $tag): bool
    {
        // Initialize In Database
        $in_database = false;

        // Define First Query
        $sql = "SELECT 1 FROM " . self::MAIN_TABLE . " WHERE tag = :tag LIMIT 1";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If statement prepared successfully
        if ($stmt) {
            // Bind parameters
            $stmt->bindParam(':tag', $tag, PDO::PARAM_STR);

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
     * @param Tag $tag
     * @return integer The ID of the newly saved tag.
     */
    public function store(Tag $tag): int
    {
        // Check if already exists
        if (empty($tag->getId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (tag) VALUES (:tag)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // Bind parameters
            if ($stmt) {
                $stmt->bindValue(':tag', $tag->getTag(), PDO::PARAM_STR);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $tag->setId((int)$this->db->lastInsertId());
                }
            }
        }

        return $tag->getId();
    }

    /**
     * Deletes an image from the database based on the supplied image.
     *
     * @param Tag $tag
     * @return boolean
     */
    public function delete(Tag $tag): bool
    {
        // Initialize Success
        $success = false;

        // Setup the Query
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE id = :tag_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the image ID to the query
            $stmt->bindValue(':tag_id', $tag->getId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
