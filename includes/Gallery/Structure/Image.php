<?php

namespace Gallery\Structure;

/**
 * Image class
 * This class represents an image in the gallery.
 * It contains properties for the image ID, file name, file time, and md5 hash, and the bit fingerprint.
 */
class Image extends AbstractStructure
{
    // Properties
    private int $image_id = 0;
    private string $file_name = '';
    private int $file_time = 0;
    private string $hash = '';
    private string $bits_fingerprint = '';

    /**
     * Get the ID of the image.
     * 
     * @return int The ID of the image.
     */
    public function getImageId(): int
    {
        return $this->image_id;
    }

    /**
     * Get the file name of the image.
     * 
     * @return string The file name of the image.
     */
    public function getFileName(): string
    {
        return $this->file_name;
    }

    /**
     * Get the file time of the image.
     * 
     * @return int The file time as a Unix timestamp.
     */
    public function getFileTime(): int
    {
        return $this->file_time;
    }

    /**
     * Get the md5 hash of the image
     * 
     * @return string The md5 hash of the image.
     */
    public function getHash(): string
    {
        return $this->hash;
    }

    /**
     * Get the bit fingerprint of the image
     * 
     * @return string The bit fingerprint of the image.
     */
    public function getBitsFingerprint(): string
    {
        return $this->bits_fingerprint;
    }

    /**
     * Set the ID of the image.
     * 
     * @param int $image_id The ID to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setImageId(int $image_id): self
    {
        $this->image_id = $image_id;
        return $this;
    }

    /**
     * Set the file name of the image.
     * 
     * @param string $file_name The file name to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setFileName(string $file_name): self
    {
        $this->file_name = $file_name;
        return $this;
    }

    /**
     * Set the file time of the image.
     * 
     * @param int $file_time The file time to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setFileTime(int $file_time): self
    {
        $this->file_time = $file_time;
        return $this;
    }

    /**
     * Set the md5 hash of the image
     * 
     * @param string $hash The md5 hash to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setHash(string $hash): self
    {
        $this->hash = $hash;
        return $this;
    }

    /**
     * Set the bit fingerprint of the image
     * 
     * @param string $bits_fingerprint The bit fingerprint to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setBitsFingerprint(string $bits_fingerprint): self
    {
        $this->bits_fingerprint = $bits_fingerprint;
        return $this;
    }
}
