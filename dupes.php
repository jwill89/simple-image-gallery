<?php

// Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '1024M');

// Autoloader
require('vendor/autoload.php');

use Jenssegers\ImageHash\Hash;
use Jenssegers\ImageHash\ImageHash;
use Jenssegers\ImageHash\Implementations\DifferenceHash;
use Gallery\Collection\ImageCollection;
use Gallery\Structure\Image;

// Set Time Limit for Script, 10 minutes
set_time_limit(0);

// Instruct PHP to continue execution
ignore_user_abort(true);

// Set Start Time
$start_time = microtime(true);

// Image Comparison Hasher
$hasher = new ImageHash(new DifferenceHash());

// Matches Array
$matches = [];

// Get the images already in the database
$image_collection = new ImageCollection();
$images_in_database = $image_collection->getAll();

// Loop Through the Images in the Database
/** @var Image $img */
foreach ($images_in_database as $img) {
    try {
        // Compare to every other image in the database
        /** @var Image $img2 */
        foreach ($images_in_database as $img2) {
            // Skip if the images are the same
            if ($img->getImageId() === $img2->getImageId()) {
                continue;
            }

            // Convert fingerprints back to has items
            $hash1 = Hash::fromBits($img->getBitsFingerprint());
            $hash2 = Hash::fromBits($img2->getBitsFingerprint());

            if ($hasher->distance($hash1, $hash2) <= 2) {
                // Check to see if the opposite is already in the array
                if (!in_array([$img2->getImageId(), $img->getImageId()], $matches)) {
                    // Add the potential duplicates to the array
                    $matches[] = [$img->getImageId(), $img2->getImageId()];
                }
            }
        }
    } catch (Exception $e) {
        // ignore Error, continue
        continue;
    }
}

// Save to File if we have matches
if (!empty($matches)) {
    $json_file = fopen('dupes/dupes-' . date('Y-m-d') . '.json', 'w');

    fwrite($json_file, json_encode($matches));

    fclose($json_file);
}
