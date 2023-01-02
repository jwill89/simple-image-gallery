<?php

namespace Gallery;

use Exception, PDO;

class DatabaseConnection
{
    // Path to DB
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
