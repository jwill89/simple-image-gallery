<?php

namespace Gallery\Collections;

use PDO;
use Gallery\Config;
use Gallery\DatabaseConnection;
use Gallery\Objects\Video;
use Gallery\Objects\Tag;

class VideoCollection
{
    private PDO $db;

    public function __construct()
    {
        if (!isset($this->db)) {
            $this->db = DatabaseConnection::getInstance();
        }
    }

    public function getVideosByPage(int $page): array
    {
        $videos = [];

        $offset = ($page - 1) * Config::PER_PAGE;

        $sql = "SELECT * FROM " . Config::VIDEO_TABLE . " LIMIT " . Config::PER_PAGE . " OFFSET $offset";

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $videos = $sth->fetchAll(PDO::FETCH_ASSOC);
            $sth->closeCursor();
        }

        return $videos;
    }

    public function getVideosByTag(Tag $tag): array
    {
    }

    public function getAllVideos(): array
    {
        $images = [];

        $sql = "SELECT * FROM " . Config::VIDEO_TABLE;

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $images = $sth->fetchAll(PDO::FETCH_ASSOC);
            $sth->closeCursor();
        }

        return $images;
    }

    public function getTotalVideos(): int
    {
        $total = 0;

        $sql = "SELECT COUNT(*) AS total_videos FROM " . Config::VIDEO_TABLE;

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $total = $sth->fetchObject()->total_videos;
            $sth->closeCursor();
        }

        return $total;
    }

}