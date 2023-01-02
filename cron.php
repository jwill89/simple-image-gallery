<?php
// Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Autoloader
require('vendor/autoload.php');

// DB and Image functions
use Gallery\Collections\{ImageCollection, VideoCollection};
use Gallery\Objects\{Image, Video};
use Gallery\Config;

// Set Time Limit for Script, 10 minutes
set_time_limit(600);

// Set Start Time
$start_time = microtime(true);

// Setup Collections
$image_collection = new ImageCollection();
$video_collection = new VideoCollection();

// Image Directory
$image_dir_full = Config::IMAGE_DIR . "full/";
$image_dir_thumbs = Config::IMAGE_DIR . "thumbs/";

// Video Directory
$video_dir_full = Config::VIDEO_DIR . "full/";
$video_dir_thumbs = Config::VIDEO_DIR . "thumbs/";

// Get the images in the folder
$images_in_folder = array_filter(scandir(Config::IMAGE_DIR), function($item) {
    return !is_dir(Config::IMAGE_DIR . $item);
});

// Sort images by date
usort($images_in_folder, function ($a, $b) {
    return filemtime(Config::IMAGE_DIR . $a) <=> filemtime(Config::IMAGE_DIR . $b);
});

// Get the images already in the database
$images_in_database = $image_collection->getAllImages();

// Get the videos in the folder
$videos_in_folder = array_filter(scandir(Config::VIDEO_DIR), function($item) {
    return !is_dir(Config::VIDEO_DIR . $item);
});

// Sort videos by date
usort($videos_in_folder, function ($a, $b) {
    return filemtime(Config::VIDEO_DIR . $a) <=> filemtime(Config::VIDEO_DIR . $b);
});

// Initialize Counters
$images_added = 0;
$images_removed = 0;
$images_not_added = 0;
$videos_added = 0;
$videos_not_added = 0;

// Initialize Image Hash Array
$image_hashes = [];

// Remove images from the database that do not exist in the images folder
foreach($images_in_database as $img) {

    if (!file_exists($image_dir_full . $img['filename'])) {

        // Delete from DB
        $image = new Image($img['filename']);
		$image->delete();

		$images_removed++;

    } else {
		
		// Image Exists, add it to our hash array
		$hash_array[] = $img['hash'];
		
	}

}

/*
// Remove videos from the database that do not exist in the videos folder
foreach($videos_in_database as $key => $filename) {
	
	if (!file_exists($video_directory . $filename)) {
		
		// Delete from DB
		if ($db->deleteVideoByFilename($filename)) {
			
			$videos_removed++;
			
		}
		
	}
	
}
*/

// Add New Images
foreach($images_in_folder as $filename){

    // Check if the MD5 Hash already exists
    $image_md5 = md5_file(Config::IMAGE_DIR . $filename);

    // Make sure the file doesn't already exist, check by MD5. Image Hash not necessary *yet*
    if (!in_array($image_md5, $hash_array)) {

        // Create the Image
		$image = new Image($filename);
		
		// Save the image (auto-creates thumbnail on save)
		if ($image->save() !== 0) {
			
			// Move the File to the full directory.
			rename(Config::IMAGE_DIR . $filename, $image_dir_full . $filename);

			// Increase the Images Added Count
			$images_added++;
			
		} else {
			
			$images_not_added++;
			
		}

	} else {

		// Delete File
		$full_file = Config::IMAGE_DIR . $filename;
		unlink($full_file);

		$images_not_added++;

		continue;

	}

}

// Loop Through Videos and GIFs
foreach ($videos_in_folder as $filename) {

	
	
	// Ensure the Video Doesn't Exist
	if (!file_exists(Config::VIDEO_DIR . $filename)) {
		
		// Create a new video
		$video = new Video($filename);
	
		// Save the Video
		$video->save();

		// Move the File to the full directory. This will save time not re-scanning all images.
		rename(Config::VIDEO_DIR . $filename, $video_dir_full . $filename);

		// Increase the Video Added Count
		$videos_added++;
	
	} else {
		
		// Delete File
        $full_file = Config::VIDEO_DIR . $filename;
        unlink($full_file);

        $videos_not_added++;

        continue;
		
	}

}


// End Script Time
$end_time = microtime(true);

// Execution Time
$execution_time = ($end_time - $start_time);

// Message. Yes I know I could make one echo.
echo "<strong>Images Added</strong>: {$images_added}</br>";
echo "<strong>Images Removed</strong>: {$images_removed}</br>";
echo "<strong>Images Not Added</strong>: {$images_not_added}</br>";
echo "<strong>Videos Added</strong>: {$videos_added}</br>";
echo "<strong>Videos Not Added</strong>: {$videos_not_added}</br>";
echo "<strong>Execution Time</strong>: {$execution_time}</br>";