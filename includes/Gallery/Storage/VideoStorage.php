<?php

namespace Gallery\Storage;

use PDO;
use PDOException;
use Gallery\Core\DatabaseConnection;
use Gallery\Structure\Video;
use Gallery\Structure\Tag;

/**
 * VideoStorage Class
 * This class is responsible for managing video storage in the database.
 */
class VideoStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'videos';
    private const string TAGS_TABLE = 'videos_tags';
    private const int PER_PAGE = 40;

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
        $where = ($video_id !== null) ? " WHERE id = :video_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY id DESC";

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
     * @param string $filename
     * @return Video|null
     */
    public function retrieveByFilename(string $filename): ?Video
    {
        // Initialize Video
        $video = null;

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
                $video = $stmt->fetch();
            }
            
            $stmt->closeCursor();
        }

        return $video;
    }

    /**
     * Returns an array of videos based on the supplied tag.
     *
     * @param Tag $tag
     * @return array
     */
    public function retrieveByTag(Tag $tag): array
    {
        // Initialize Videos
        $videos = [];

        // Setup the Query
        $sql = "SELECT vid.* FROM " . self::MAIN_TABLE . " vid LEFT JOIN " . self::TAGS_TABLE . " tag ON vid.id = tag.video_id WHERE tag.tag_id = :tag_id ORDER BY id DESC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the tag ID to the query
            $stmt->bindValue(':tag_id', $tag->getId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $videos = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);
            }

            $stmt->closeCursor();
        }

        return $videos;
    }

    /**
     * Retrieves a number of videos based on the supplied page number and the number of videos per page.
     *
     * @param integer $page_number
     * @return array
     */
    public function retrieveForPage(int $page_number): array
    {
        // Initialize Videos
        $videos = [];

        // Calculate the offset for pagination
        $offset = ($page_number - 1) * self::PER_PAGE;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . " ORDER BY id DESC LIMIT :limit OFFSET :offset";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the limit and offset parameters
            $stmt->bindValue(':limit', self::PER_PAGE, PDO::PARAM_INT);
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
     * Check if a video exists in the database based on filename.
     * @param string $filename 
     * @return bool 
     * @throws PDOException 
     */
    public function videoExistsInDatabase(string $filename): bool
    {
        // Initialize In Database
        $in_database = false;

        // Define First Query
        $sql = "SELECT 1 FROM " . self::MAIN_TABLE . " WHERE filename = :filename LIMIT 1";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If statement prepared successfully
        if ($stmt) {
            // Bind parameters
            $stmt->bindParam(':filename', $filename, PDO::PARAM_STR);

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
        if (empty($video->getId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (filename, filetime) VALUES (:filename, :filetime)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // Bind parameters
            if ($stmt) {
                $stmt->bindValue(':filename', $video->getFilename(), PDO::PARAM_STR);
                $stmt->bindValue(':filetime', $video->getFiletime(), PDO::PARAM_INT);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $video->setId((int)$this->db->lastInsertId());
                }
            }
        }

        return $video->getId();
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
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE id = :video_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the video ID to the query
            $stmt->bindValue(':video_id', $video->getId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
