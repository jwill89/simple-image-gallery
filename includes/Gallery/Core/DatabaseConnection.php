<?php

namespace Gallery\Core;

use Exception, PDO;

/**
 * DatabaseConnection class
 * 
 * This class is responsible for creating a singleton instance of the database connection.
 * It uses the PDO extension to connect to a SQLite database.
 */
class DatabaseConnection
{
    // Path to the SQLite database file
    private const PATH_TO_SQLITE_DB = "../db/gallery.db";
    private const CRON_PATH_TO_SQLITE_DB = "db/gallery.db";

    // Access Through Connection
    private static PDO $conn;

    // Prevent New Object Instantiation
    private function __construct()
    {
    }

    // Prevent cloning
    private function __clone()
    {
    }

    /**
     * getInstance function
     *
     * This function returns a singleton instance of the database connection.
     * It checks if the connection is already established, and if not, it creates a new PDO instance.
     * It also handles exceptions in case the database file is not found.
     * @return PDO
     */
    public static function getInstance(): PDO
    {
        // If the connection isn't set, set it.
        if (!isset(self::$conn)) {

            try {

                // This is generally the correct path
                self::$conn = new PDO("sqlite:" . self::PATH_TO_SQLITE_DB);

            } catch (Exception $e) {

                // We're probably in the cron, use the other path
                self::$conn = new PDO("sqlite:" . self::CRON_PATH_TO_SQLITE_DB);

            }
        }

        return self::$conn;
    }
}
