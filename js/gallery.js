// Constants
const PAGE_IMAGES = 1;
const PAGE_VIDEOS = 2;
const API_LINK = '/api';
let PAGE_TITLE = 'Gallery';
let CURRENT_TAGS = {};
let VIEW_ALL = false;
let CURRENT_PAGE = 1;
let PAGE_TYPE = PAGE_IMAGES;

$(document).ready(function () {
    // Page Initialization
    PageInit();

    // Menu Bindings
    MenuBindings();

    // Generate Default Content (Image Page)
    GalleryContent();

    // Bind Element Events
    GalleryBindings();
});

// Initialize the Page Data
function PageInit()
{
    // Set gallery title
    getPageTitle().then((title) => {
        PAGE_TITLE = title;
        $('#gallery-title').html(PAGE_TITLE);
        document.title = PAGE_TITLE + ' - Images';
    });

    // Load all current tags
    getTags().then((tags) => {
        CURRENT_TAGS = tags;
        setTagList(tags);
    });

    // Set total images in footer
    getTotalImages().then((total) => {
        $('#total-images').html(total);
    });

    // Set total videos in footer
    getTotalVideos().then((total) => {
        $('#total-videos').html(total);
    });

    // Set navbar bindings
    MenuBindings();
}

// Create Page
function GalleryContent()
{
    let gallerySection = $('#gallery-content');
    let galleryDisplay = $('#gallery-display');
    let totalSpan = $('#total');
    let content = "";
    let CurrentPage = CURRENT_PAGE

    // Clear the Old
    galleryDisplay.empty();

    if (PAGE_TYPE === PAGE_IMAGES) {
        // Get The Images for the Page
        getImagesForPage(CurrentPage).then((images) => {

            content += "" +
            "<div class='column is-full is-align-content-end'>" +
            "   <div class='parent'>";

            images.forEach(image => {
                content += "" +
                    "<div class='is-flex is-align-self-flex-end'>" +
                    "   <div class='card child has-border-white'>" +
                    "       <div class='card-content has-text-centered has-background-grey-darker'>" +
                    "           <figure class='image'>" +
                    "               <img alt='' src=\"images/thumbs/" + image.file_name + "\" />" +
                    "           </figure>" +
                    "       </div>" +
                    "       <footer class='card-footer has-background-light'>" +
                    "           <a href=\"images/full/" + image.file_name + "\" class='card-footer-item' data-lightbox=\"page-images\" data-title=\"Tags List Coming Soon\">" +
                    "               <span class='icon has-text-info-dark'>" +
                    "                   <i class='fa-solid fa-magnifying-glass-plus' title='Zoom In'></i>" +
                    "               </span>" +
                    "           </a>" +
                    "           <a href=\"images/full/" + image.file_name + "\" id='image-full-" + image.image_id + "' target='_blank' class='card-footer-item'>" +
                    "               <span class='icon has-text-info-dark'>" +
                    "                   <i class='fa-solid fa-up-right-from-square' title='View Full Size'></i>" +
                    "               </span>" +
                    "           </a>" +
                    "           <a data-id='" + image.image_id + "' class='card-footer-item link-tags-page'>" +
                    "               <span class='icon has-text-info-dark'>" +
                    "                   <i class='fa-solid fa-tags' title='Add/View Tags'></i>" +
                    "               </span>" +
                    "           </a>" +
                    "       </footer>" +
                    "   </div>" +
                    " </div>";
            });

            content += "" +
            "   </div>" +
            "</div>" +
            "<br/><br/>";

            // Add the content to the display
            galleryDisplay.append(content);

            // Show the section
            gallerySection.removeClass('is-hidden');
        });
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        // Get The Videos for the Page
        getVideosForPage(CurrentPage).then((videos) => {
            content += "" +
            "<div class='column'>" +
            "   <div class='parent'>";

            videos.forEach(video => {
                let thumbnail = video.file_name.split('.').slice(0, -1).join('.') + '.jpg';
                content += "" +
                    "   <div class='card child'>" +
                    "       <div class='card-image'>" +
                    "           <a href=\"videos/full/" + video.file_name + "\" data-lightbox=\"page-videos\" data-title=\"<a href='videos/full/" + video.file_name + "' target='_blank'>View Video in New Tab</a>\">" +
                    "           <img alt='' src=\"videos/thumbs/" + thumbnail + "\" /></a>" +
                    "       </div>" +
                    "       <footer class='card-footer'>" +
                    "           <a data-id='" + video.video_id + "' class='card-footer-item' style='padding:.1rem;'>Add Tags</a>" +
                    "       </footer>" +
                    "   </div>";
            })

            content += "" +
            "   </div>" +
            "</div>" +
            "<br/><br/>";

            // Add the content to the display
            galleryDisplay.append(content);

            // Show the section
            gallerySection.removeClass('is-hidden');
        });
    }

    // Generate Pagination if not viewing all
    if (VIEW_ALL === false) {
        GalleryPagination();
    }
}

function GalleryPagination()
{
    let topDiv = $('#pagination-top');
    let bottomDiv = $('#pagination-bottom');
    let pagesPromise;

    if (PAGE_TYPE === PAGE_IMAGES) {
        pagesPromise = getTotalImagePages();
    } else {
        pagesPromise = getTotalVideoPages();
    }

    pagesPromise.then((result) => {
        let pagination = "";
        let NextPage = CURRENT_PAGE + 1;
        let LastPage = CURRENT_PAGE - 1;
        let TotalPages = result;

        // Start Pagination
        pagination = "<nav class='pagination is-centered' role='navigation' aria-label='pagination'>"

        // Do we have an enabled previous page? (Page > 1)
        if (CURRENT_PAGE > 1) {
            pagination += "<a id='page-prev' class='pagination-previous'>Previous</a>";
        } else {
            pagination += "<a class='pagination-previous' disabled>Previous</a>";
        }

        // Do we have an Enabled Next page? (Page < Total Pages)
        if (CURRENT_PAGE < TotalPages) {
            pagination += "<a id='page-next' class='pagination-next'>Next</a>";
        } else {
            pagination += "<a class='pagination-next' disabled>Next</a>";
        }

        // Continue Pagination
        pagination += "<ul class='pagination-list'>";

        // Add Page 1 and Ellipses if We're on page 3 or more
        if (CURRENT_PAGE >= 3) {
            pagination += "<li><a data-page='1' class='pagination-link' aria-label='Goto page 1'>1</a></li>";
            pagination += "<li><span class='pagination-ellipsis'>&hellip;</span></li>";
        }

        // Previous Page if page > 1
        if (CURRENT_PAGE >= 2) {
            pagination += "<li><a data-page='" + LastPage + "' class='pagination-link' aria-label='Goto page " + LastPage + "'>" + LastPage + "</a></li>"
        }

        // Current Page
        pagination += "<li><a data-page='" + CURRENT_PAGE + "' class='pagination-link is-current' aria-label='Page " + CURRENT_PAGE + "' aria-current='page'>" + CURRENT_PAGE + "</a></li>"

        // Next Page if Page < Total Pages
        if (CURRENT_PAGE < TotalPages) {
            pagination += "<li><a data-page='" + NextPage + "' class='pagination-link' aria-label='Goto page " + NextPage + "'>" + NextPage + "</a></li>"
        }

        // Add Ellipses and Last Page if We're on last page - 2
        if (CURRENT_PAGE <= (TotalPages - 2)) {
            pagination += "<li><span class='pagination-ellipsis'>&hellip;</span></li>";
            pagination += "<li><a data-page='" + TotalPages + "' class='pagination-link' aria-label='Goto page " + TotalPages + "'>" + TotalPages + "</a></li>"
        }

        // Finish Pagination
        pagination += "</ul>";
        pagination += "</nav>";

        // Render Pagination

        // Check to see if we have the elements
        if (topDiv.length > 0) {
            topDiv.replaceWith(pagination);
            bottomDiv.replaceWith(pagination);
        } else {
            $('nav.pagination').replaceWith(pagination);
        }

        // Bind Element Events
        GalleryBindings();
    });
}

function TagContent()
{

}

function ImageTagContent(image_id)
{
    let contentDiv = $('#content-display');
    let content = "";
    let apiLink = "/tag/";

    // Get Tags for Image
    $.ajax({
        url: API_LINK + apiLink,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            content += "<div class='tags'>";

            result.forEach((tag) => {
                content += "<span class='tag is-info'>" + tag.tag_name + "<button class='delete' data-id='" + tag.tag_id + "' aria-label='delete'></button></span> ";
            });

            content += "</div>";

            contentDiv.html(content).show();
        }
    });
}

function MenuBindings()
{
    // Navbar Mobile Burger Menu Toggle
    $('#nav_burger').on('click', function(event) {
        $('#nav_burger').toggleClass('is-active');
        $(".navbar-menu").toggleClass("is-active");
    });
}

// Bind Buttons
function GalleryBindings()
{
    // Pagination Links
    $('.pagination-link').on('click', function (event) {
        CURRENT_PAGE = $(this).data('page');
        GalleryContent();
    });

    $('.pagination-next').on('click', function (event) {
        CURRENT_PAGE = CURRENT_PAGE + 1;
        GalleryContent();
    });

    $('.pagination-previous').on('click', function (event) {
        CURRENT_PAGE = CURRENT_PAGE - 1;
        GalleryContent();
    });

    // Main Links - Images
    $('#view-images-link').on('click', function (event) {
        event.preventDefault();
        if (PAGE_TYPE === PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = false;
        PAGE_TYPE = PAGE_IMAGES;
        GalleryContent();
    });

    $('#view-all-images-link').on('click', function (event) {
        event.preventDefault();
        if (PAGE_TYPE === PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = true;
        PAGE_TYPE = PAGE_IMAGES;
        GalleryContent();
    });
    // Main Links - Videos
    $('#view-videos-link').on('click', function (event) {
        if (PAGE_TYPE === PAGE_IMAGES) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = false;
        PAGE_TYPE = PAGE_VIDEOS;
        GalleryContent();
    });

    $('#view-all-videos-link').on('click', function (event) {
        if (PAGE_TYPE === PAGE_IMAGES) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = true;
        PAGE_TYPE = PAGE_VIDEOS;
        GalleryContent();
    });

    // Tag Links
    $('.link-tags-page').on('click', function (event) {
        event.preventDefault();
        let itemID = $(this).data('id');

        // Get Tags for Item
        getTagsForItem(itemID).then((tags) => {
            $('#tag-image').prop('src', $('#image-full-' + itemID).prop('href'));
            tags.forEach((tag) => {
                $('#tag-list').append("<span class='tag is-info'>" + tag.tag_name + "<button class='delete' data-id='" + tag.tag_id + "' aria-label='delete'></button></span> ");
            });
            $('#item-tags-content').removeClass('is-hidden');
            $('#gallery-content').addClass('is-hidden');
        });
    });

    // Tag Back - Back to Gallery
    $('#back-to-gallery').on('click', function (event) {
        event.preventDefault();
        // Clear Image Source
        $('#tag-image').prop('src', '');
        // Clear Tags
        $('#tag-list').empty();
        // Hide the Tag Page
        $('#item-tags-content').addClass('is-hidden');
        // Show the Gallery
        $('#gallery-content').removeClass('is-hidden');
    });
}

// Set the Page Title
function SetPageTitle()
{
    let title = PAGE_TITLE

    if (PAGE_TYPE === PAGE_VIDEOS) {
        title += ' - Videos';
    } else {
        title += ' - Images';
    }

    document.title = title;
}

// Set the Tag List for Search
function setTagList(currentTags)
{
    let tagLists = $('.datalist-for-tags');

    // Setup the Tag Lists
    tagLists.each(function() {
        // Empty the list
        $(this).empty();

        // Add the Tags
        currentTags.forEach(tag => {
            $(this).append("<option value='" + tag.tag_name + "'></option>");
        });
    });

    
}

// Async - Page Title
async function getPageTitle()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/pages/title/',
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching page title:', error);
    }
}

// Async - Tags
async function getTags()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/tag/',
            type: 'GET',
            dataType: 'json',
        });

        // Return Results
        return result;
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

// Async - Total Images
async function getTotalImages()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/images/total/',
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching total images:', error);
    }
}

// Async - Total Videos
async function getTotalVideos()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/videos/total/',
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching total videos:', error);
    }
}

// Async - Total Image Pages
async function getTotalImagePages()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/pages/images/',
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching total image pages:', error);
    }
}

// Async - Total Video Pages
async function getTotalVideoPages()
{
    let result;

    try {
        result = await $.ajax({
            url: API_LINK + '/pages/videos/',
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching total video pages:', error);
    }
}

// Async - Images for Page
async function getImagesForPage(page)
{
    let result;
    let apiLink;

    if (VIEW_ALL === false) {
        apiLink = "/images/page/" + page + "/";
    } else {
        apiLink = "/images/";
    }

    try {
        result = await $.ajax({
            url: API_LINK + apiLink,
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// Async - Videos for Page
async function getVideosForPage(page)
{
    let result;
    let apiLink;

    if (VIEW_ALL === false) {
        apiLink = "/videos/page/" + page + "/";
    } else {
        apiLink = "/videos/";
    }

    try {
        result = await $.ajax({
            url: API_LINK + apiLink,
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

// Async - Tags for Image or Video
async function getTagsForItem(itemID)
{
    let result;
    let apiLink = "/tag/for/";

    if (PAGE_TYPE === PAGE_IMAGES) {
        apiLink += "image/";
    } else {
        apiLink += "video/";
    }

    apiLink += itemID;

    try {
        result = await $.ajax({
            url: API_LINK + apiLink,
            type: 'GET',
            dataType: 'json',
        });

        return result;
    } catch (error) {
        console.error('Error fetching tags for item:', error);
    } 
}