<?php

namespace Gallery\Structure;
/**
 * Tag class
 * This class represents a tag in the gallery.
 * It contains properties for the tag ID and name.
 */
class Tag extends AbstractStructure
{
    // Properties
    private int $tag_id = 0;
    private string $tag_name = '';

    /**
     * Get the ID of the tag.
     *
     * @return int
     */
    public function getTagId(): int
    {
        return $this->tag_id;
    }

    /**
     * Get the tag name.
     *
     * @return string
     */
    public function getTagName(): string
    {
        return $this->tag_name;
    }

    /**
     * Set the ID of the tag.
     *
     * @param int $tag_id
     * @return Tag
     */
    public function setTagId(int $tag_id): self
    {
        $this->tag_id = $tag_id;
        return $this;
    }

    /**
     * Set the tag name.
     *
     * @param string $tag_name
     * @return Tag
     */
    public function setTagName(string $tag_name): self
    {
        $this->tag_name = $tag_name;
        return $this;
    }
}
