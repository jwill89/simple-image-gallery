<?php

namespace Gallery\Collection;

use Imagick;
use ImagickException;
use OutOfBoundsException;
use Gallery\Storage\TagStorage;
use Gallery\Structure\Tag;

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
     * Gets an tag based on supplied tag ID.
     * 
     * @param integer $tag_id
     * @return Tag
     */
    public function get(int $tag_id): Tag
    {
        return $this->storage->retrieve($tag_id);
    }

    /**
     * Gets all tags.
     *
     * @return array
     */
    public function getAll(): array
    {
        return $this->storage->retrieve();
    }

    /**
     * Gets the total number of tags in the database.
     *
     * @return integer
     */
    public function totalTags(): int
    {
        return $this->storage->retrieveTotalTagCount();
    }

    /**
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
