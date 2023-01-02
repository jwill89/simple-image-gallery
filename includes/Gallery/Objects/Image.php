<?php

namespace Gallery\Objects;

use Imagick;
use ImagickException;
use OutOfBoundsException;
use PDO;
use Gallery\Config;
use Gallery\DatabaseConnection;

class Image
{
    // Properties
    private int $id;
    private string $filename;
    private int $filetime;
    private string $hash;
    private array $tags;

    public function __construct($filename_or_id = null)
    {
        if ($filename_or_id !== null) {
            // Setup Database info
            $db = DatabaseConnection::getInstance();

            // Check for numeric id
            if (is_numeric($filename_or_id)) {
                $filename_or_id = (int)$filename_or_id;

                // Get item based on ID
                $sql = "SELECT * FROM " . Config::IMAGE_TABLE . " WHERE id = :id";
                $sth = $db->prepare($sql);

                if ($sth) {
                    $sth->bindParam(':id', $data['id'], PDO::PARAM_INT);

                    if ($sth->execute()) {
                        $row = $sth->fetchObject();
                        $sth->closeCursor();

                        // If no image exists for that file, return null
                        if (!empty($row)) {
                            throw new OutOfBoundsException("No image exists for the supplied ID.");
                        }

                        $this->id = $filename_or_id;
                        $this->filename = (string)$row->filename;
                        $this->filetime = (int)$row->filetime;
                        $this->hash = $row->hash ? (string)$row->hash : '';
                    }
                }
            } else {
                $sql = "SELECT * FROM " . Config::IMAGE_TABLE . " WHERE filename = :filename";
                $sth = $db->prepare($sql);

                if ($sth) {
                    $sth->bindParam(':filename', $data['filename'], PDO::PARAM_STR);

                    if ($sth->execute()) {
                        $row = $sth->fetchObject();
                        $sth->closeCursor();

                        // This is a new image if we returned nothing
                        if (empty($row)) {
                            $this->filename = $filename_or_id;
                            $this->filetime = filemtime(Config::IMAGE_DIR . $filename_or_id);
                            $this->hash = md5_file(Config::IMAGE_DIR . $filename_or_id);

                        // The image already exists, grab it
                        } else {
                            $this->id = (int)$row->id;
                            $this->filename = (string)$row->filename;
                            $this->filetime = (int)$row->filetime;
                            $this->hash = $row->hash ? (string)$row->hash : '';
                        }
                    }
                }
            }
        }
    }

    /**
     * @return bool
     */
    private function inDatabase(): bool
    {
        // Setup DB
        $db = DatabaseConnection::getInstance();

        $sql1 = "SELECT EXISTS(SELECT 1 FROM " . Config::IMAGE_TABLE . " WHERE filename=:filename) as in_table";

        $sth1 = $db->prepare($sql1);

        if ($sth1) {
            $sth1->bindParam(':filename', $this->filename, PDO::PARAM_STR);

            if ($sth1->execute()) {
                $row1 = $sth1->fetchObject();
                $sth1->closeCursor();

                // If we got a hit, then the image exists
                if ($row1->in_table) {
                    return true;
                }

                // We didn't get a hit, check the MD5 hash
                $sql2 = "SELECT EXISTS(SELECT 1 FROM " . Config::IMAGE_TABLE . " WHERE hash=:hash) as in_table";

                $sth2 = $db->prepare($sql2);

                if ($sth2) {
                    $sth2->bindParam(':hash', $this->hash, PDO::PARAM_STR);

                    if ($sth2->execute()) {
                        $row2 = $sth2->fetchObject();
                        $sth2->closeCursor();

                        // If we got a hit, then the image exists
                        if ($row2->in_table) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * @throws ImagickException
     */
    private function createThumbnail(): void
    {
        // Max Width/Height of Thumbnail
        $max_size = 200;

        // Start New Thumbnail
        $image = new Imagick(Config::IMAGE_DIR . $this->filename);

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
        $image->writeImage(Config::IMAGE_DIR . 'thumbs/' .
            $image_filename['filename']. '.' . $ext);

        $image->destroy();
    }

    /**
     * @return int
     */
    public function save(): int
    {
        $db = DatabaseConnection::getInstance();

        // Check if already exists
        if (empty($this->id)) {
            $sql = "INSERT INTO " . Config::IMAGE_TABLE . " (filename,filetime,hash) VALUES (:filename,:filetime,:hash)";

            // Prepare
            $sth = $db->prepare($sql);

            // Bind
            if ($sth) {
                $sth->bindParam(':filename', $this->filename, PDO::PARAM_STR);
                $sth->bindParam(':filetime', $this->filetime, PDO::PARAM_INT);
                $sth->bindParam(':hash', $this->hash, PDO::PARAM_STR);

                // Execute
                if ($sth->execute()) {
                    // On success create thumbnail and return new image id
                    try {
                        $this->createThumbnail();
                    } catch (ImagickException $e) {
                        // Do nothing on exception, missing thumbnail will be obvious
                    }
                    $this->id = (int)$db->lastInsertId();
                    return $this->id;
                }

            }
        }

        return 0;
    }

    /**
     * @return bool
     */
    public function delete(): bool
    {
        $db = DatabaseConnection::getInstance();

        if (!empty($this->id)) {
            $sql = "DELETE FROM " . Config::IMAGE_TABLE . " WHERE id = :id";

            // Prepare
            $sth = $db->prepare($sql);

            // Bind
            if ($sth) {
                $sth->bindParam(':id', $this->id, PDO::PARAM_INT);

                // Execute
                if ($sth->execute()) {
                    return (bool)$sth->rowCount();
                }
            }
        } else {
            $sql = "DELETE FROM " . Config::IMAGE_TABLE . " WHERE filename = :filename";

            // Prepare
            $sth = $db->prepare($sql);

            // Bind
            if ($sth) {
                $sth->bindParam(':filename', $this->filename, PDO::PARAM_STR);

                // Execute
                if ($sth->execute()) {
                    return (bool)$sth->rowCount();
                }
            }
        }
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getFilename(): string
    {
        return $this->filename;
    }

    /**
     * @return false|int
     */
    public function getFiletime()
    {
        return $this->filetime;
    }

    /**
     * @return false|string
     */
    public function getHash()
    {
        return $this->hash;
    }

    /**
     * @return array
     */
    public function getTags(): array
    {
        return $this->tags;
    }
}
