<?php

namespace Gallery\Structure;

/**
 * Image class
 * This class represents an image in the gallery.
 * It contains properties for the image ID, file name, file time, and md5 hash, and the hex fingerprint.
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
     * @return int
     */
    public function getImageId(): int
    {
        return $this->image_id;
    }

    /**
     * @return string
     */
    public function getFileName(): string
    {
        return $this->file_name;
    }

    /**
     * @return int
     */
    public function getFileTime(): int
    {
        return $this->file_time;
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        return $this->hash;
    }

    /**
     * @return string
     */
    public function getBitsFingerprint(): string
    {
        return $this->bits_fingerprint;
    }

    /**
     * @param int $image_id
     * @return Image
     */
    public function setImageId(int $image_id): self
    {
        $this->image_id = $image_id;
        return $this;
    }

    /**
     * @param string $file_name
     * @return Image
     */
    public function setFileName(string $file_name): self
    {
        $this->file_name = $file_name;
        return $this;
    }

    /**
     * @param int $file_time
     * @return Image
     */
    public function setFileTime(int $file_time): self
    {
        $this->file_time = $file_time;
        return $this;
    }

    /**
     * @param string $hash
     * @return Image
     */
    public function setHash(string $hash): self
    {
        $this->hash = $hash;
        return $this;
    }

    /**
     * @param string $bits_fingerprint
     * @return Image
     */
    public function setBitsFingerprint(string $bits_fingerprint): self
    {
        $this->bits_fingerprint = $bits_fingerprint;
        return $this;
    }
}
