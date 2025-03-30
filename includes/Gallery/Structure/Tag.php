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
    private int $id = 0;
    private string $tag = '';

    /**
     * Get the ID of the tag.
     *
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Set the ID of the tag.
     *
     * @param int $id
     * @return Tag
     */
    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    /**
     * Get the tag name.
     *
     * @return string
     */
    public function getTag(): string
    {
        return $this->tag;
    }

    /**
     * Set the tag name.
     *
     * @param string $tag
     * @return Tag
     */
    public function setTag(string $tag): self
    {
        $this->tag = $tag;
        return $this;
    }
}
