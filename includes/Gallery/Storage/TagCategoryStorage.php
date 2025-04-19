<?php

namespace Gallery\Storage;

use PDO;
use Gallery\Core\DatabaseConnection;
use Gallery\Structure\TagCategory;
use Gallery\Structure\Tag;

/**
 * TagCategoryStorage Class
 * This class is responsible for managing tag category storage in the database.
 */
class TagCategoryStorage
{
    // Table Constants
    private const string MAIN_TABLE = 'tag_categories';
    private const string TAGS_TABLE = 'tags';

    // Main Class Object Constant
    private const string OBJ_CLASS = TagCategory::class;

    // Database Connection
    private PDO $db;

    /**
     * Class constructor
     * Initializes the Database Connection.
     */
    public function __construct()
    {
        if (!isset($this->db)) {
            $this->db = DatabaseConnection::getInstance();
        }
    }

    /**
     * Retrieves a tag category or an array of tag categories from the database.
     *
     * @param integer|null $category_id The ID of the category to retrieve. If null, retrieves all categories.
     *
     * @return TagCategory|TagCategory[] An array of TagCategory objects or a single TagCategory object if an ID is provided.
     */
    public function retrieve(?int $category_id = null): TagCategory|array
    {
        // Initialize Categories
        $categories = [];

        // Check for Category ID for where clause
        $where = ($category_id !== null) ? " WHERE category_id = :category_id" : "";

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . "$where ORDER BY category_name ASC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // If we have a category id, bind it
            if ($category_id !== null) {
                $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
            }

            // Try executing
            if ($stmt->execute()) {
                $categories = $stmt->fetchAll(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // If we only have 1 category, then we got an ID
                if ($category_id !== null && count($categories) === 1) {
                    return $categories[0];
                }
            }

            $stmt->closeCursor();
        }

        return $categories;
    }

    /**
     * Retrieves a tag category from the database based on short or returns null if it doesn't exist
     *
     * @param string $short The shortcode of the tag category to retrieve.
     *
     * @return TagCategory|null The tag category object if found, null otherwise.
     */
    public function retrieveByShortcode(string $short): ?TagCategory
    {
        // Initialize Category
        $category = null;

        // Setup the Query
        $sql = "SELECT * FROM " . self::MAIN_TABLE . " WHERE category_short = :category_short";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind category shortcode
            $stmt->bindValue(':category_short', $short, PDO::PARAM_STR);

            // Try executing
            if ($stmt->execute()) {
                // Set fetch mode
                $stmt->setFetchMode(PDO::FETCH_CLASS, self::OBJ_CLASS);

                // Get the category, if it exists
                $category = $stmt->fetch();

                // If failure, reset
                if (!($category instanceof TagCategory)) {
                    $category = null;
                }
            }

            $stmt->closeCursor();
        }

        return $category;
    }

    /**
     * Get tags based on supplied category.
     *
     * @param TagCategory $category The tag category to retrieve tags for.
     *
     * @return Tag[] An array of Tag objects.
     */
    public function retrieveTagsForCategory(TagCategory $category): array
    {
        // Initialize Tags
        $tags = [];

        // Setup the Query
        $sql = "SELECT t.* FROM " . self::TAGS_TABLE . " t LEFT JOIN " . self::MAIN_TABLE .  " tc USING (category_id) WHERE tc.category_id = :category_id ORDER BY t.tag_name ASC";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind category id
            $stmt->bindValue(':category_id', $category->getCategoryId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                // Fetch results
                $tags = $stmt->fetchAll(PDO::FETCH_CLASS, Tag::class);
            }

            $stmt->closeCursor();
        }

        return $tags;
    }

    /**
     * Saves a tag category to the database.
     *
     * @param TagCategory $category The tag category to save.
     *
     * @return int The ID of the newly saved tag category.
     */
    public function store(TagCategory $category): int
    {
        // Check if already exists
        if (empty($category->getCategoryId())) {
            $sql = "INSERT INTO " . self::MAIN_TABLE . " (category_name, category_short) VALUES (:category_name, category_short)";

            // Prepare statement
            $stmt = $this->db->prepare($sql);

            // Bind parameters
            if ($stmt) {
                $stmt->bindValue(':category_name', $category->getCategoryName(), PDO::PARAM_STR);
                $stmt->bindValue(':category_short', $category->getCategoryShort(), PDO::PARAM_STR);

                // Execute statement
                if ($stmt->execute()) {
                    // Get the last inserted ID
                    $category->setCategoryId((int)$this->db->lastInsertId());
                }
            }
        }

        return $category->getCategoryId();
    }

    /**
     * Deletes a tag category from the database.
     *
     * @param TagCategory $category The tag category to delete.
     *
     * @return bool True if the category was deleted, false otherwise.
     */
    public function delete(TagCategory $category): bool
    {
        // Initialize Success
        $success = false;

        // Setup the Query
        $sql = "DELETE FROM " . self::MAIN_TABLE . " WHERE category_id = :category_id";

        // Prepare statement
        $stmt = $this->db->prepare($sql);

        // If prepared successfully
        if ($stmt) {
            // Bind the ID to the query
            $stmt->bindValue(':category_id', $category->getCategoryId(), PDO::PARAM_INT);

            // Try executing
            if ($stmt->execute()) {
                $success = true;
            }

            $stmt->closeCursor();
        }

        return $success;
    }
}
