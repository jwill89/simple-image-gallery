<?php

namespace Gallery\Core;

use PDO;

class Configuration
{
    private const MAIN_TABLE = 'configuration';

    public static function itemsPerPage(?int $new_items_per_page = null): int
    {
        // Setup the DB Connection
        $db = DatabaseConnection::getInstance();

        // Check if new items per page is provided
        if ($new_items_per_page !== null) {
            // Update the items per page
            $sql = "UPDATE " . self::MAIN_TABLE . " SET items_per_page = :items_per_page";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':items_per_page', $new_items_per_page, PDO::PARAM_INT);
            
            // Return new items per page if the update is successful
            if ($stmt->execute()) {
                return $new_items_per_page;
            }
        }
        
        // Setup the Query
        $sql = "SELECT items_per_page FROM " . self::MAIN_TABLE;

        // Return Value
        return (int)$db->query($sql, PDO::FETCH_COLUMN, 0)->fetchColumn() ?? 40;
    }

    public static function galleryTitle(?string  $new_title = null): string
    {
        // Setup the DB Connection
        $db = DatabaseConnection::getInstance();

        // Check if new title is provided
        if ($new_title !== null) {
            // Update the Gallery Title
            $sql = "UPDATE " . self::MAIN_TABLE . " SET gallery_title = :gallery_title";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':gallery_title', $new_title, PDO::PARAM_STR);
            
            // Return new title if the update is successful
            if ($stmt->execute()) {
                return $new_title;
            }
        }
        
        // Setup the Query
        $sql = "SELECT gallery_title FROM " . self::MAIN_TABLE;

        // Return Value
        return $db->query($sql, PDO::FETCH_COLUMN, 0)->fetchColumn() ?? 'Gallery';
    }
}
