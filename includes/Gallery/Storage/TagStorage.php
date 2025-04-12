<?php

namespace Gallery\Storage;

use PDO;
use Gallery\Core\DatabaseConnection;
use Gallery\Collection\TagCategoryCollection;
use Gallery\Structure\Tag;
use Gallery\Structure\TagCategory;
use Gallery\Structure\Image;
use Gallery\Structure\Video;

/**
 * TagStorage Class
 * 
 * This class is responsible for managing tag storage in the database.
 * It provides methods to retrieve, create, update, and delete tags,
 * as well as associate tags with images and videos.
 */
class TagStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'tags';
    private const string IMAGE_TAG_TABLE = 'image_tags';
    private const string VIDEO_TAG_TABLE = 'video_tags';

    // Main Class Object Constant
    private const string OBJ_CLASS = Tag::class;

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
     * Retrieves a tag or an array of tag from the database.
     *
     * @param integer|null $tag_id Optional. The ID of the tag to retrieve. If null, retrieves all tags.
     * 
     * @return Tag|Tag[] An array of Tag objects or a single Tag object if an ID is provided.
     */
    public function retrieve(?int $tag_id = null): Tag|array
    {
        // Initialize Tags
        $tags = [];

        // Check for Tag ID for where clause
        $where = ($tag_id !== null) ? " WHERE tag_id = :tag_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY tag_name ASC";

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
     * Retrieves a tag from the database based on tag name or returns null if it doesn't exist
     *
     * @param string $tag_name The name of the tag to retrieve.
     * 
     * @return Tag|null The tag object if found, null otherwise.
     */
    public function retrieveByName(string $tag_name): ?Tag
    {
        // Initialize Tags
        $tag = null;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . " WHERE tag_name = :tag_name";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind tag name
            $stmt->bindValue(':tag_name', $tag_name, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Set fetch mode
                $stmt->setFetchMode(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // Get the tag, if it exists
                $tag = $stmt->fetch();

                // If failure, reset
                if (!($tag instanceof Tag)) {
                    $tag = null;
                }
            }
            
            $stmt->closeCursor();
        }

        return $tag;
    }

    /**
     * Retrieves a tag if it exists or creates it and stores it if it doesn't.
     *
     * @param string $tag_name The name of the tag to retrieve or create.
     * 
     * @return Tag The tag object.
     */
    public function retrieveOrCreate(string $tag_name): Tag
    {
        // First, split the tag name to see if a category shortcode was used.
        if (strpos($tag_name, ':') !== false) {
            // Split the tag name into category shortcode and actual tag name
            [$category_shortcode, $name] = array_map('trim', explode(':', $tag_name, 2));

            // Get a category repository and check for a valid category shortcode
            $category_repo = new TagCategoryCollection();
            $category = $category_repo->getByShortcode($category_shortcode);
            var_dump($category_shortcode, $name, $category); // Debugging line
        } else {
            $category = null;
        }

        // Check if we have a tag using the name based on if the category shortcode was valid
        $tag_exists = ($category instanceof TagCategory) ? $this->retrieveByName($name) : $this->retrieveByName($tag_name);

        // If we got a tag, return the tag
        if ($tag_exists instanceof Tag) {
            return $tag_exists;
        }

        // If we failed to get a tag, create one and save it.
        $tag = new Tag();

        // If we had a valid category shortcode, set the category ID and name
        if ($category instanceof TagCategory) {
            $tag->setTagName($name)
            ->setCategoryId($category->getCategoryId());
        } else {
            $tag->setTagName($tag_name)
            ->setCategoryId(1);
        }

        // Save the tag
        $tag_id = $this->store($tag);

        // Set the tag ID
        $tag->setTagId($tag_id);

        // Return the new tag
        return $tag;
    }

    /**
     * Get tags based on supplied image.
     *
     * @param Image $image The image to retrieve tags for.
     * 
     * @return Tag[] An array of Tag objects associated with the image.
     */
    public function retrieveTagsForImage(Image $image): array
    {
        // Initialize Tags
        $tags = [];

        // Setup the Query
        $sql = "SELECT tt.* FROM " . self::MAIN_TABLE . " tt LEFT JOIN " . self::IMAGE_TAG_TABLE .  " it USING (tag_id) WHERE it.image_id = :image_id ORDER BY tt.tag_name ASC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind image id
            $stmt->bindValue(':image_id', $image->getImageId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                // Fetch results
                $tags = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }
            
            $stmt->closeCursor();
        }

        return $tags;
    }

    /**
     * Get tags based on supplied video.
     *
     * @param Video $video_id The video to retrieve tags for.
     * 
     * @return Tag[] An array of Tag objects associated with the video.
     */
    public function retrieveTagsForVideo(Video $video): array
    {
        // Initialize Tags
        $tags = [];

        // Setup the Query
        $sql = "SELECT tt.* FROM " . self::MAIN_TABLE . " tt LEFT JOIN " . self::VIDEO_TAG_TABLE .  " vt USING (tag_id) WHERE vt.video_id = :video_id ORDER BY tt.tag_name ASC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind video id
            $stmt->bindValue(':video_id', $video->getVideoId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                // Fetch results
                $tags = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }
            
            $stmt->closeCursor();
        }

        return $tags;
    }

    /**
     * Add tags to an image.
     *
     * @param Image $image Image object to which tags will be added.
     * @param array $tag_ids Array of tag IDs to be added to the image.
     * 
     * @return bool True on success, false on failure.
     */
    public function addTagsToImage(Image $image, array $tag_ids): bool
    {
        // Setup the Query
        $sql = "INSERT INTO " . self::IMAGE_TAG_TABLE . " (image_id, tag_id) VALUES (:image_id, :tag_id)";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Prepare ID and Parameters for Execute
            $image_id = $image->getImageId();
            $params = [];

            foreach ($tag_ids as $tag_id) {
                $params[] = [
                    ':image_id' => $image_id,
                    ':tag_id' => $tag_id
                ];
            }

            // Try executing
            foreach ($params as $param) {
                if (!$stmt->execute($param)) {
                    return false;
                }
            }
            
            $stmt->closeCursor();
        }

        return true;
    }

    /**
     * Add tags to a video.
     *
     * @param Video $video Video object to which tags will be added.
     * @param array $tag_ids Array of tag IDs to be added to the video.
     * 
     * @return bool True on success, false on failure.
     */
    public function addTagsToVideo(Video $video, array $tag_ids): bool
    {
        // Setup the Query
        $sql = "INSERT INTO " . self::VIDEO_TAG_TABLE . " (video_id, tag_id) VALUES (:video_id, :tag_id)";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Prepare ID and Parameters for Execute
            $video_id = $video->getVideoId();
            $params = [];

            foreach ($tag_ids as $tag_id) {
                $params[] = [
                    ':video_id' => $video_id,
                    ':tag_id' => $tag_id
                ];
            }

            // Try executing
            foreach ($params as $param) {
                if (!$stmt->execute($param)) {
                    return false;
                }
            }
            
            $stmt->closeCursor();
        }

        return true;
    }

    /**
     * Removes a tag from an image.
     *
     * @param Image $image The image from which the tag will be removed.
     * @param Tag $tag The tag to be removed.
     * 
     * @return bool True on success, false on failure.
     */
    public function removeTagFromImage(Image $image, Tag $tag): bool
    {
        // Setup the Query
        $sql = "DELETE FROM " . self::IMAGE_TAG_TABLE . " WHERE image_id = :image_id AND tag_id = :tag_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind data
            $stmt->bindValue(':image_id', $image->getImageId(), PDO::PARAM_INT);
            $stmt->bindValue(':tag_id', $tag->getTagId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                return true;
            }
            
            $stmt->closeCursor();
        }

        return false;
    }

    /**
     * Removes a tag from a video
     *
     * @param Video $video The video from which the tag will be removed.
     * @param Tag $tag The tag to be removed.
     * 
     * @return bool True on success, false on failure.
     */
    public function removeTagFromVideo(Video $video, Tag $tag): bool
    {
        // Setup the Query
        $sql = "DELETE FROM " . self::VIDEO_TAG_TABLE . " WHERE video_id = :video_id AND tag_id = :tag_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind data
            $stmt->bindValue(':video_id', $video->getVideoId(), PDO::PARAM_INT);
            $stmt->bindValue(':tag_id', $tag->getTagId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                return true;
            }
            
            $stmt->closeCursor();
        }

        return false;
    }

    /**
     * Gets the total number of tags in the database.
     *
     * @return int The total number of tags.
     */
    public function retrieveTotalTagCount(): int
    {
        // Initialize Total Count
        $total = 0;

        // Setup the Query
        $sql = "SELECT COUNT(*) AS total_tags FROM " . self::MAIN_TABLE;

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
     * 
     * @param string $tag_name The name of the tag to check.
     * 
     * @return bool True if the tag exists, false otherwise.
     */
    public function tagExists(string $tag_name): bool
    {
        // Initialize In Database
        $in_database = false;

        // Define First Query
        $sql = "SELECT 1 FROM " . self::MAIN_TABLE . " WHERE tag_name = :tag_name LIMIT 1";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If statement prepared successfully
        if ($stmt) {
            // Bind parameters
            $stmt->bindParam(':tag_name', $tag_name, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Fetch the result
                $in_database = (int)$stmt->fetchColumn() === 1;
            }
        }

        return $in_database;
    }

    /**
     * Saves a tag to the database.
     *
     * @param Tag $tag The tag object to be saved.
     * 
     * @return int The ID of the newly saved tag.
     */
    public function store(Tag $tag): int
    {
        // Check if already exists
        if (empty($tag->getTagId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (category_id, tag_name) VALUES (:category_id, :tag_name)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // If the statement was prepared successfully
            if ($stmt) {
                // Bind parameters
                $stmt->bindValue(':category_id', $tag->getCategoryId(), PDO::PARAM_INT);
                $stmt->bindValue(':tag_name', $tag->getTagName(), PDO::PARAM_STR);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $tag->setTagId((int)$this->db->lastInsertId());
                }
            }
        }

        return $tag->getTagId();
    }

    /**
     * Deletes a tag from the database based on the supplied tag.
     *
     * @param Tag $tag The tag object to be deleted.
     * 
     * @return bool True on success, false on failure.
     */
    public function delete(Tag $tag): bool
    {
        // Initialize Success
        $success = false;

        // Setup the Query
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE tag_id = :tag_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the image ID to the query
            $stmt->bindValue(':tag_id', $tag->getTagId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
