<?php
// Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit','1024M');

// Autoloader
require('vendor/autoload.php');

use Jenssegers\ImageHash\ImageHash;
use Jenssegers\ImageHash\Implementations\DifferenceHash;
use Gallery\Collection\ImageCollection;

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
$collection = new ImageCollection();
$images_in_database = $collection->getAll();

// Get the images in the folder
$images_in_folder = array_filter(scandir(ImageCollection::IMAGE_DIRECTORY_FULL), function($item) {
	return !is_dir(ImageCollection::IMAGE_DIRECTORY_FULL . $item);
});

// Create folder hashes
$folder_hashes = [];

foreach ($images_in_folder as $key => $folder_filename) {
	
	try {
	
		$folder_hash = $hasher->hash(ImageCollection::IMAGE_DIRECTORY_FULL . $folder_filename);
		
		$folder_hashes[$key] = $folder_hash;
	
	} catch (Exception $e) {
    
		// ignore Error, continue
	
	}
	
}

foreach ($images_in_database as $img) {
	
	try {
	
		$database_hash = $hasher->hash(ImageCollection::IMAGE_DIRECTORY_FULL . $img->getFilename());
		
		foreach ($folder_hashes as $key => $folder_hash) {
					
			if ($hasher->distance($database_hash, $folder_hash) <= 2) {
				
				$matches[] = [$img->getFilename(), $images_in_folder[$key]];
				
			}
			
		}
		
	} catch (Exception $e) {
    
		// ignore Error, continue
	
	}
	
}

// We only want file names that aren't the same
$differences = [];

foreach ($matches as $item) {
	
	if ($item[0] !== $item[1]) {
		
		// Add to differences if it's opposite isn't already in the array
		if (!in_array([$item[1], $item[0]], $differences)) {
		
			$differences[] = $item;
			
		}
		
	}
	
}

// Save to File if we have matches
if (!empty($differences)) {
	
	$json_file = fopen('dupes/dupes-' . date('Y-m-d') . '.json', 'w');
	
	fwrite($json_file, json_encode($differences));
	
	fclose($json_file);
	
}