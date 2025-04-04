<?php
// Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Autoloader
require('vendor/autoload.php');

// DB and Image functions
use Gallery\Collection\{ImageCollection, VideoCollection};
use Gallery\Structure\{Image, Video};

// Set Time Limit for Script, 10 minutes
set_time_limit(600);

// Set Start Time
$start_time = microtime(true);

// Setup Collections
$image_collection = new ImageCollection();
$video_collection = new VideoCollection();

// Image Directory
$image_dir_full = ImageCollection::IMAGE_DIRECTORY_FULL;
$image_dir_thumbs = ImageCollection::IMAGE_DIRECTORY_THUMBNAILS;

// Video Directory
$video_dir_full = VideoCollection::VIDEO_DIRECTORY_FULL;
$video_dir_thumbs = VideoCollection::VIDEO_DIRECTORY_THUMBNAILS;

// Get the images in the folder
$images_in_folder = array_filter(scandir(ImageCollection::IMAGE_DIRECTORY), function($item) {
    return !is_dir(ImageCollection::IMAGE_DIRECTORY . $item);
});

// Sort images by date
usort($images_in_folder, function ($a, $b) {
    return filemtime(ImageCollection::IMAGE_DIRECTORY . $a) <=> filemtime(ImageCollection::IMAGE_DIRECTORY . $b);
});

// Get the images already in the database
$images_in_database = $image_collection->getAll();

// Get the videos in the folder
$videos_in_folder = array_filter(scandir(VideoCollection::VIDEO_DIRECTORY), function($item) {
    return !is_dir(VideoCollection::VIDEO_DIRECTORY . $item);
});

// Sort videos by date
usort($videos_in_folder, function ($a, $b) {
    return filemtime(VideoCollection::VIDEO_DIRECTORY . $a) <=> filemtime(VideoCollection::VIDEO_DIRECTORY . $b);
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
/** @var Image $img */

foreach($images_in_database as $img) {

    if (!file_exists($image_dir_full . $img->getFileName())) {

        // Delete from DB
        if ($image_collection->delete($img)) {
			$images_removed++;
		}

    } else {
		
		// Image Exists, add it to our hash array
		$hash_array[] = $img->getHash();
		
	}

}


/*
// Remove videos from the database that do not exist in the videos folder
foreach($videos_in_database as $key => $file_name) {
	
	if (!file_exists($video_directory . $file_name)) {
		
		// Delete from DB
		if ($db->deleteVideoByFilename($file_name)) {
			
			$videos_removed++;
			
		}
		
	}
	
}
*/

// Add New Images
foreach($images_in_folder as $file_name){

    // Check if the MD5 Hash already exists
    $image_md5 = md5_file(ImageCollection::IMAGE_DIRECTORY . $file_name);

    // Make sure the file doesn't already exist, check by MD5. Image Hash not necessary *yet*
    if (!in_array($image_md5, $hash_array)) {

        // Create the Image
		$image = new Image();
		$image->setFileName($file_name)
			->setFileTime(filemtime(ImageCollection::IMAGE_DIRECTORY . $file_name))
			->setHash($image_md5);
		
		// Save the image (auto-creates thumbnail on save)
		if ($image_collection->save($image) !== 0) {
			// Move the File to the full directory.
			rename(ImageCollection::IMAGE_DIRECTORY . $file_name, $image_dir_full . $file_name);

			// Increase the Images Added Count
			$images_added++;
		} else {
			// Increase the Images Not Added Count
			$images_not_added++;
		}

	} else {

		// Delete File
		$full_file = ImageCollection::IMAGE_DIRECTORY . $file_name;
		unlink($full_file);

		$images_not_added++;

		continue;

	}

}

// Loop Through Videos and GIFs
foreach ($videos_in_folder as $file_name) {
	
	// Ensure the Video Doesn't Exist
	if (!file_exists(VideoCollection::VIDEO_DIRECTORY_FULL . $file_name)) {
		
		// Create a new video
		$video = new Video();
		$video->setFileName($file_name)
			->setFileTime(filemtime(VideoCollection::VIDEO_DIRECTORY . $file_name));
	
		// Save the video
		if ($video_collection->save($video) !== 0) {
			// Move the File to the full directory.
			rename(VideoCollection::VIDEO_DIRECTORY . $file_name, $video_dir_full . $file_name);

			// Increase the Videos Added Count
			$videos_added++;
		} else {
			// Increase the Videos Not Added Count
			$videos_not_added++;
		}
	
	} else {
		
		// Delete File
        $full_file = VideoCollection::VIDEO_DIRECTORY . $file_name;
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