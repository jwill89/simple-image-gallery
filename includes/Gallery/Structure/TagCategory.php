<?php

namespace Gallery\Structure;
/**
 * TagCategory class
 * This class represents a tag category in the gallery.
 * It contains properties for the category ID, name, and short name.
 */
class TagCategory extends AbstractStructure
{
    // Properties
    private int $category_id = 0;
    private string $category_name = '';
    private string $category_short = '';

    /**
     * Get the category ID.
     *
     * @return int The ID of the category.
     */
    public function getCategoryId(): int
    {
        return $this->category_id;
    }

    /**
     * Get the category name.
     *
     * @return string The name of the category.
     */
    public function getCategoryName(): string
    {
        return $this->category_name;
    }

    /**
     * Get the category short name.
     *
     * @return string The short name of the category.
     */
    public function getCategoryShort(): string
    {
        return $this->category_short;
    }

    /**
     * Set the category ID.
     *
     * @param int $category_id The ID of the category.
     * @return $this
     */
    public function setCategoryId(int $category_id): self
    {
        $this->category_id = $category_id;
        return $this;
    }

    /**
     * Set the category name.
     *
     * @param string $category_name The name of the category.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setCategoryName(string $category_name): self
    {
        $this->category_name = $category_name;
        return $this;
    }

    /**
     * Set the category short name.
     *
     * @param string $category_short The short name of the category.
     * 
     * @return $this Returns the current instance for method chaining.
     */
    public function setCategoryShort(string $category_short): self
    {
        $this->category_short = $category_short;
        return $this;
    }
}
