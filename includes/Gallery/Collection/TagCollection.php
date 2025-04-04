<?php

namespace Gallery\Collection;

use OutOfBoundsException;
use Gallery\Storage\TagStorage;
use Gallery\Structure\Tag;
use Gallery\Structure\Image;
use Gallery\Structure\Video;

/**
 * TagCollection class
 * This class is responsible for managing a collection of tags and interacting with the database.
 */
class TagCollection
{
    // Tag Database Storage Object
    private TagStorage $storage;

    /**
     * TagCollection constructor.
     * Initializes the TagStorage object.
     */
    public function __construct()
    {
        if (!isset($this->storage)) {
            $this->storage = new TagStorage();
        }
    }

    /**
     * get function
     * Gets an tag based on supplied tag ID.
     * 
     * @param integer $tag_id
     * @return Tag|null
     */
    public function get(int $tag_id): ?Tag
    {
        $tag = $this->storage->retrieve($tag_id);

        //If we got an array, then there wasn't a valid tag, return null
        if (is_array($tag) && empty($tag)) {
            return null;
        }

        return $tag;
    }

    /**
     * getByName function
     * Gets a tag based on supplied tag name, if it exists
     *
     * @param string $tag_name
     * @return Tag|null
     */
    public function getByName(string $tag_name): ?Tag
    {
        return $this->storage->retrieveByName($tag_name);
    }

   /**
    * Retrieves a tag if it exists or creates one and returns it if it doesn't.
    *
    * @param string $tag_name
    * @return Tag
    */
    public function getOrCreate(string $tag_name): Tag
    {
        return $this->storage->retrieveOrCreate($tag_name);
    }

    /**
     * getAll function
     * Gets all tags.
     *
     * @return array
     */
    public function getAll(): array
    {
        return $this->storage->retrieve();
    }

    /**
     * getTagsForImage function
     * Get all tags for a given image
     *
     * @param Image $image
     * @return array
     */
    public function getTagsForImage(Image $image): array
    {
        return $this->storage->retrieveTagsForImage($image);
    }

    /**
     * getTagsForVideo function
     * Get all tags for a given video
     *
     * @param Video $video
     * @return array
     */
    public function getTagsForVideo(Video $video): array
    {
        return $this->storage->retrieveTagsForVideo($video);
    }

    /**
     * totalTags function
     * Gets the total number of tags in the database.
     *
     * @return integer
     */
    public function totalTags(): int
    {
        return $this->storage->retrieveTotalTagCount();
    }

    /**
     * addTagToImage function
     * Adds the supplied tag to the supplied image.
     *
     * @param Image $image
     * @param Tag $tag
     * @return boolean
     */
    public function addTagToImage(Image $image, Tag $tag): bool
    {
        return $this->storage->addTagToImage($image, $tag);
    }

    /**
     * addTagToVideo function
     * Adds the supplied tag to the supplied video.
     *
     * @param Video $video
     * @param Tag $tag
     * @return boolean
     */
    public function addTagToVideo(Video $video, Tag $tag): bool
    {
        return $this->storage->addTagToVideo($video, $tag);
    }

    /**
     * removeTagFromImage function
     * Removed the supplied tag from the supplied image.
     *
     * @param Image $image
     * @param Tag $tag
     * @return boolean
     */
    public function removeTagFromImage(Image $image, Tag $tag): bool
    {
        return $this->storage->removeTagFromImage($image, $tag);
    }

    /**
     * removeTagFromVideo function
     * Removed the supplied tag from the supplied video.
     *
     * @param Video $video
     * @param Tag $tag
     * @return boolean
     */
    public function removeTagFromVideo(Video $video, Tag $tag): bool
    {
        return $this->storage->removeTagFromVideo($video, $tag);
    }

    /**
     * save function
     * Saves an tag to the database and generates a thumbnail.
     *
     * @param Tag $tag
     * @return void
     */
    public function save(Tag $tag): int
    {
        // Save the tag to the database
        return $this->storage->store($tag);
        
    }

    /**
     * delete function
     * Deletes an tag from the database and the filesystem.
     *
     * @param Tag $tag
     * @return void
     */
    public function delete(Tag $tag): bool
    {
        // Delete the tag from the database
        $success = $this->storage->delete($tag);

        // Delete the tag and thumbnail from the filesystem
        if (!$success) {
            throw new OutOfBoundsException('Tag not found in database.');
        }

        return $success;
    }
}
