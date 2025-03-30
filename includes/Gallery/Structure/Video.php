<?php

namespace Gallery\Structure;

/**
 * Video class
 * This class represents a video in the gallery.
 * It contains properties for the video ID, filename, filetime, and tags.
 */
class Video extends AbstractStructure
{
    // Properties
    private int $id = 0;
    private string $filename = '';
    private int $filetime = 0;
    private array $tags = [];

    /**
     * Get the ID of the video.
     * 
     * @return integer The ID of the video.
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Get the filename of the video.
     *
     * @return string The filename of the video.
     */
    public function getFilename(): string
    {
        return $this->filename;
    }

    /**
     * Get the filetime of the video.
     *
     * @return int The filetime as a Unix timestamp.
     */
    public function getFiletime(): int
    {
        return $this->filetime;
    }

    /**
     * Get the tags associated with the video.
     *
     * @return array An array of tags.
     */
    public function getTags(): array
    {
        return $this->tags;
    }

    /**
     * Set the ID of the video.
     *
     * @param int $id The ID to set.
     * @return Video Returns the current instance for method chaining.
     */
    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    /**
     * Set the filename of the video.
     *
     * @param string $filename The filename to set.
     * @return Video Returns the current instance for method chaining.
     */
    public function setFilename(string $filename): self
    {
        $this->filename = $filename;
        return $this;
    }

    /**
     * Set the filetime of the video.
     *
     * @param int $filetime The filetime as a Unix timestamp.
     * @return Video Returns the current instance for method chaining.
     */
    public function setFiletime(int $filetime): self
    {
        $this->filetime = $filetime;
        return $this;
    }

    /**
     * Set the tags associated with the video.
     *
     * @param array $tags An array of tags to set.
     * @return Video Returns the current instance for method chaining.
     */
    public function setTags(array $tags): self
    {
        $this->tags = $tags;
        return $this;
    }
}
