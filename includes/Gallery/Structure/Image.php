<?php

namespace Gallery\Structure;

/**
 * Image class
 * This class represents an image in the gallery.
 * It contains properties for the image ID, filename, filetime, hash, and tags.
 */
class Image extends AbstractStructure
{
    // Properties
    private int $id = 0;
    private string $filename = '';
    private int $filetime = 0;
    private string $hash = '';
    private array $tags = [];

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
     * @return int
     */
    public function getFiletime(): int
    {
        return $this->filetime;
    }

    /**
     * @return string
     */
    public function getHash(): string
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

    /**
     * @param int $id
     * @return Image
     */
    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @param string $filename
     * @return Image
     */
    public function setFilename(string $filename): self
    {
        $this->filename = $filename;
        return $this;
    }

    /**
     * @param int $filetime
     * @return Image
     */
    public function setFiletime(int $filetime): self
    {
        $this->filetime = $filetime;
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
     * @param array $tags
     * @return Image
     */
    public function setTags(array $tags): self
    {
        $this->tags = $tags;
        return $this;
    }
}
