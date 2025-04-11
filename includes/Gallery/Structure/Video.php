<?php

namespace Gallery\Structure;

/**
 * Video class
 * This class represents a video in the gallery.
 * It contains properties for the video ID, file name, and file time.
 */
class Video extends AbstractStructure
{
    // Properties
    private int $video_id = 0;
    private string $file_name = '';
    private int $file_time = 0;
    private string $hash = '';

    /**
     * Get the ID of the video.
     * 
     * @return int The ID of the video.
     */
    public function getVideoId(): int
    {
        return $this->video_id;
    }

    /**
     * Get the file name of the video.
     *
     * @return string The file name of the video.
     */
    public function getFileName(): string
    {
        return $this->file_name;
    }

    /**
     * Get the file time of the video.
     *
     * @return int The file time as a Unix timestamp.
     */
    public function getFileTime(): int
    {
        return $this->file_time;
    }

    /**
     * Get the md5 hash of the video
     *
     * @return string The md5 hash of the video.
     */
    public function getHash(): string
    {
        return $this->hash;
    }

    /**
     * Set the ID of the video.
     *
     * @param int $id The ID to set.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setVideoId(int $video_id): self
    {
        $this->video_id = $video_id;
        return $this;
    }

    /**
     * Set the file name of the video.
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
     * Set the file time of the video.
     *
     * @param int $file_time The file time as a Unix timestamp.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setFileTime(int $file_time): self
    {
        $this->file_time = $file_time;
        return $this;
    }

    /**
     * Set the md5 hash of the video
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
}
