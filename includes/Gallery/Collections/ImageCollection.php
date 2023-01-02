<?php

namespace Gallery\Collections;

use PDO;
use Gallery\Config;
use Gallery\DatabaseConnection;
use Gallery\Objects\Image;
use Gallery\Objects\Tag;

class ImageCollection
{
    private PDO $db;

    public function __construct()
    {
        if (!isset($this->db)) {
            $this->db = DatabaseConnection::getInstance();
        }
    }

    public function getImagesByPage(int $page): array
    {
        $images = [];

        $offset = ($page - 1) * Config::PER_PAGE;

        $sql = "SELECT * FROM " . Config::IMAGE_TABLE . " ORDER BY id DESC LIMIT " . Config::PER_PAGE . " OFFSET $offset";

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $images = $sth->fetchAll(PDO::FETCH_ASSOC);
            $sth->closeCursor();
        }

        return $images;
    }

    public function getImagesByTag(Tag $tag): array
    {
    }

    public function getAllImages(): array
    {
        $images = [];

        $sql = "SELECT * FROM " . Config::IMAGE_TABLE . " ORDER BY id DESC";

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $images = $sth->fetchAll(PDO::FETCH_ASSOC);
            $sth->closeCursor();
        }

        return $images;
    }

    public function getTotalImages(): int
    {
        $total = 0;

        $sql = "SELECT COUNT(*) AS total_images FROM " . Config::IMAGE_TABLE;

        $sth = $this->db->prepare($sql);

        if ($sth && $sth->execute()) {
            $total = $sth->fetchObject()->total_images;
            $sth->closeCursor();
        }

        return $total;
    }

}