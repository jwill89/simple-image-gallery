<?php

namespace Gallery\Storage;

use PDO;
use PDOException;
use Gallery\Core\DatabaseConnection;
use Gallery\Structure\Video;

/**
 * VideoStorage Class
 * This class is responsible for managing video storage in the database.
 */
class VideoStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'videos';
    private const string TAGS_TABLE = 'videos_tags';

    // Main Class Object Constant
    private const OBJ_CLASS = Video::class;

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
     * Retrieves a video or an array of videos from the database.
     *
     * @param integer|null $video_id
     * @return Video|array
     */
    public function retrieve(?int $video_id = null): Video|array
    {
        // Initialize Videos
        $videos = [];

        // Check for Video ID for where clause
        $where = ($video_id !== null) ? " WHERE video_id = :video_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY video_id DESC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // If we have an video id, bind it
            if ($video_id !== null) {
                $stmt->bindParam(':video_id', $video_id, PDO::PARAM_INT);
            }

            // Try executing
            if ($stmt->execute()) {
                $videos = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // If we only have 1 video, then we got an ID
                if ($video_id !== null && count($videos) === 1) {
                    return $videos[0];
                }
            }
            
            $stmt->closeCursor();
        }

        return $videos;
    }

    /**
     * Get video based on supplied file name.
     *
     * @param string $file_name
     * @return Video|null
     */
    public function retrieveByFilename(string $file_name): ?Video
    {
        // Initialize Video
        $video = null;

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
                $video = $stmt->fetch();
            }
            
            $stmt->closeCursor();
        }

        return $video;
    }

    /**
     * Returns an array of videos based on the supplied tag ids.
     *
     * @param array $tag_ids
     * @return array
     */
    public function retrieveWithTags(array $tag_ids): array
    {
        // Initialize Videos
        $images = [];

        // Count the number of tags
        $tag_count = count($tag_ids);

        // Setup the Query
        $sql = "SELECT vid.* FROM " . self::MAIN_TABLE . " vid
                    LEFT JOIN " . self::TAGS_TABLE . " tag
                    USING (video_id)
                    WHERE tag.tag_id IN (" . implode(',', $tag_ids) . ")
                    GROUP BY vid.video_id 
                    HAVING COUNT(DISTINCT tag.tag_id) = :tag_count
                    ORDER BY vid.video_id DESC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the tag count to the query
            $stmt->bindParam(':tag_count', $tag_count, PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $images = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }

            $stmt->closeCursor();
        }

        return $images;
    }

    /**
     * Retrieves a number of videos based on the supplied page number and the number of videos per page.
     *
     * @param integer $page_number - The page number to retrieve.
     * @param integer $items_per_page - The number of items per page.
     * @return array
     */
    public function retrieveForPage(int $page_number, int $items_per_page): array
    {
        // Initialize Videos
        $videos = [];

        // Calculate the offset for pagination
        $offset = ($page_number - 1) * $items_per_page;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . " ORDER BY video_id DESC LIMIT :limit OFFSET :offset";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the limit and offset parameters
            $stmt->bindValue(':limit', $items_per_page, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $videos = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }

            $stmt->closeCursor();
        }

        return $videos;
    }

    /**
     * Gets the total number of videos in the database.
     *
     * @return integer
     */
    public function retrieveTotalVideoCount(): int
    {
        // Initialize Total Count
        $total = 0;

        // Setup the Query
        $sql = "SELECT COUNT(*) AS total_videos FROM " . self::MAIN_TABLE;

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
     * Gets the total number of videos with specific tags in the database.
     *
     * @param array $tag_ids - The tag IDs to filter videos by.
     * @return integer
     */
    public function retrieveTotalVideoWithTagsCount(array $tag_ids): int
    {
        // Initialize Total Count
        $total = 0;

        // Count the number of tags
        $tag_count = count($tag_ids);

        // Setup the Query
        $sql = "SELECT COUNT(*) FROM (SELECT vid.* FROM " . self::MAIN_TABLE . " vid
                    LEFT JOIN " . self::TAGS_TABLE . " tag
                    USING (video_id)
                    WHERE tag.tag_id IN (" . implode(',', $tag_ids) . ")
                    GROUP BY vid.video_id 
                    HAVING COUNT(DISTINCT tag.tag_id) = :tag_count)";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the tag count to the query
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
     * Check if a video exists in the database based on file name.
     * @param string $file_name 
     * @return bool 
     * @throws PDOException 
     */
    public function videoExistsInDatabase(string $file_name): bool
    {
        // Initialize In Database
        $in_database = false;

        // Define First Query
        $sql = "SELECT 1 FROM " . self::MAIN_TABLE . " WHERE file_name = :file_name LIMIT 1";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If statement prepared successfully
        if ($stmt) {
            // Bind parameters
            $stmt->bindParam(':file_name', $file_name, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Fetch the result
                $in_database = (int)$stmt->fetchColumn() === 1;
            }
        }

        return $in_database;
    }

    /**
     * Saves a video to the database.
     *
     * @param Video $video
     * @return integer
     */
    public function store(Video $video): int
    {
        // Check if already exists
        if (empty($video->getVideoId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (file_name, file_time, hash) VALUES (:file_name, :file_time, :hash)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // Bind parameters
            if ($stmt) {
                $stmt->bindValue(':file_name', $video->getFileName(), PDO::PARAM_STR);
                $stmt->bindValue(':file_time', $video->getFileTime(), PDO::PARAM_INT);
                $stmt->bindValue(':hash', $video->getHash(), PDO::PARAM_STR);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $video->setVideoId((int)$this->db->lastInsertId());
                }
            }
        }

        return $video->getVideoId();
    }

    /**
     * Deletes a video from the database based on the supplied video.
     *
     * @param Video $video
     * @return boolean
     */
    public function delete(Video $video): bool
    {
        // Initialize Success
        $success = false;

        // Setup the Query
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE video_id = :video_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the video ID to the query
            $stmt->bindValue(':video_id', $video->getVideoId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
