/**
 * @file gallery.js
 * @author MathDad <https://www.mathdad.me>
 * @license MIT
 * @version 1.0.1
 * @description This file contains the JavaScript code for the site. It handles the loading of images and videos, pagination, and tag management.
 */


/**
 * @const {number} PAGE_IMAGES - Defines if the page is displaying images
 * @const {number} PAGE_VIDEOS - Defines if the page is displaying videos
 * @const {string} API_BASE_URL - The API link for the gallery
 * @var {string} PAGE_TITLE - The title of the page
 * @var {Array} CURRENT_TAGS - The current tags for the page
 * @var {boolean} VIEW_ALL - If the page is viewing all images/videos
 * @var {number} CURRENT_PAGE - The current page number
 * @var {number} PAGE_TYPE - The type of page (images or videos)
 */
const PAGE_IMAGES = 1;
const PAGE_VIDEOS = 2;
const API_BASE_URL = '/api';
let PAGE_TITLE = 'Gallery';
let CURRENT_TAGS = {};
let VIEW_ALL = false;
let CURRENT_PAGE = 1;
let PAGE_TYPE = PAGE_IMAGES;

/** Events fired at page load */
$(function () {
    // Page Initialization
    PageInit();

    // Bind Element Events
    NavigationBindings();

    // Generate Default Content
    GalleryContent();
});

/**
 * @function PageInit
 * @description Initializes the page by setting the title, loading tags, and setting the total images/videos in the footer.
 */
function PageInit() {
    // Set gallery title
    getPageTitle().then((title) => {
        PAGE_TITLE = title;
        SetPageTitle();
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
}

/**
 * @function GalleryContent
 * @description Generates the gallery content based on the current page and type (images or videos).
 */
function GalleryContent() {
    /**
     * @var {HTMLElement} gallerySection - The section of the page where the gallery content will be displayed
     * @var {HTMLElement} galleryDisplay - The div where the images/videos will be displayed
     * @var {Promise} galleryPromise - The promise that resolves when the images/videos are loaded
     */
    const gallerySection = $('#gallery-content');
    const galleryDisplay = $('#gallery-display');
    let galleryPromise;

    // Update the Page Title
    SetPageTitle();

    // Determine if we are viewing images or videos and get the corresponding promise
    if (PAGE_TYPE === PAGE_IMAGES) {
        galleryPromise = getImagesForPage(CURRENT_PAGE);
    }
    else {
        galleryPromise = getVideosForPage(CURRENT_PAGE);
    }

    // Resolve the promise and create the gallery content
    galleryPromise.then((items) => {

        // Create the Container
        /** @var {HTMLElement} columnDiv - The main column div containing the content */
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('column', 'is-full', 'is-align-content-end');

        // Parent Div
        const parentDiv = document.createElement('div');
        parentDiv.classList.add('parent');

        // Append to Parent
        columnDiv.appendChild(parentDiv);

        // Loop Through Images/Videos
        items.forEach(item => {

            let item_id,
                thumbnail_path,
                full_path;

            if (PAGE_TYPE === PAGE_IMAGES) {
                item_id = item.image_id;
                thumbnail_path = "images/thumbs/" + item.file_name;
                full_path = "images/full/" + item.file_name;
            } else {
                item_id = item.video_id;
                thumbnail_path = "videos/thumbs/" + item.file_name.split('.').slice(0, -1).join('.') + ".jpg";
                full_path = "videos/full/" + item.file_name;
            }

            // Flex Div
            const flexDiv = document.createElement('div');
            flexDiv.classList.add('is-flex', 'is-align-self-flex-end');

            // Card Div
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'child', 'has-border-white');

            // Card Content Div
            const cardContentDiv = document.createElement('div');
            cardContentDiv.classList.add('card-content', 'has-text-centered', 'has-background-grey-darker');

            // Card Figure
            const cardFigureDiv = document.createElement('figure');
            cardFigureDiv.classList.add('image');

            // Card Figure Image- Thumbnail
            const cardFigureImage = document.createElement('img');
            cardFigureImage.setAttribute('alt', '');
            cardFigureImage.setAttribute('src', thumbnail_path);

            // Card Footer
            const cardFooterDiv = document.createElement('footer');
            cardFooterDiv.classList.add('card-footer', 'has-background-light');

            // Card Footer - Link - Lightbox
            const cardFooterLinkLightbox = document.createElement('a');
            cardFooterLinkLightbox.classList.add('card-footer-item');
            cardFooterLinkLightbox.setAttribute('href', full_path);
            cardFooterLinkLightbox.setAttribute('data-lightbox', "page-items");
            cardFooterLinkLightbox.setAttribute('data-title', "Tags List Coming Soon");

            // Card Footer - Link - Lightbox - Span
            const cardFooterLinkLightboxSpan = document.createElement('span');
            cardFooterLinkLightboxSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Lightbox - Span - Icon
            const cardFooterLinkLightboxSpanIcon = document.createElement('i');
            cardFooterLinkLightboxSpanIcon.classList.add('fa-solid', 'fa-magnifying-glass-plus');
            cardFooterLinkLightboxSpanIcon.setAttribute('title', 'Zoom In');

            // Card Footer - Link - Full
            const cardFooterLinkFull = document.createElement('a');
            cardFooterLinkFull.classList.add('card-footer-item');
            cardFooterLinkFull.setAttribute('href', full_path);
            cardFooterLinkFull.setAttribute('target', '_blank');
            cardFooterLinkFull.setAttribute('id', 'item-full-' + item_id);

            // Card Footer - Link - Full - Span
            const cardFooterLinkFullSpan = document.createElement('span');
            cardFooterLinkFullSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Full - Span - Icon
            const cardFooterLinkFullSpanIcon = document.createElement('i');
            cardFooterLinkFullSpanIcon.classList.add('fa-solid', 'fa-up-right-from-square');
            cardFooterLinkFullSpanIcon.setAttribute('title', 'View Full Size in New Tab');

            // Card Footer - Link - Tags
            const cardFooterLinkTags = document.createElement('a');
            cardFooterLinkTags.classList.add('card-footer-item', 'link-tags-page');
            cardFooterLinkTags.setAttribute('data-id', item_id);

            // Card Footer - Link - Tags - Span
            const cardFooterLinkTagsSpan = document.createElement('span');
            cardFooterLinkTagsSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Tags - Span - Icon
            const cardFooterLinkTagsSpanIcon = document.createElement('i');
            cardFooterLinkTagsSpanIcon.classList.add('fa-solid', 'fa-tags');
            cardFooterLinkTagsSpanIcon.setAttribute('title', 'Add/View Tags');

            // Build Card
            flexDiv.appendChild(cardDiv);
            cardDiv.appendChild(cardContentDiv);
            cardContentDiv.appendChild(cardFigureDiv);
            cardFigureDiv.appendChild(cardFigureImage);
            cardDiv.appendChild(cardFooterDiv);
            cardFooterDiv.appendChild(cardFooterLinkLightbox);
            cardFooterLinkLightbox.appendChild(cardFooterLinkLightboxSpan);
            cardFooterLinkLightboxSpan.appendChild(cardFooterLinkLightboxSpanIcon);
            cardFooterDiv.appendChild(cardFooterLinkFull);
            cardFooterLinkFull.appendChild(cardFooterLinkFullSpan);
            cardFooterLinkFullSpan.appendChild(cardFooterLinkFullSpanIcon);
            cardFooterDiv.appendChild(cardFooterLinkTags);
            cardFooterLinkTags.appendChild(cardFooterLinkTagsSpan);
            cardFooterLinkTagsSpan.appendChild(cardFooterLinkTagsSpanIcon);

            // Append to Parent
            parentDiv.appendChild(flexDiv);

        });

        // Clear and Append New Page
        galleryDisplay.empty().append(columnDiv);

        // Show the Gallery Section
        gallerySection.removeClass('is-hidden');

        // Add Tag Bindings
        GalleryBindings();

        // Generate Pagination if not viewing all
        if (VIEW_ALL === false) {
            GalleryPagination();
        }

    });
}

/**
 * @function GalleryPagination
 * @description Generates the pagination for the gallery based on the current page and type (images or videos).
 */
function GalleryPagination() {
    const topDiv = $('#pagination-top');
    const bottomDiv = $('#pagination-bottom');
    let pagesPromise;

    if (PAGE_TYPE === PAGE_IMAGES) {
        pagesPromise = getTotalImagePages();
    } else {
        pagesPromise = getTotalVideoPages();
    }

    pagesPromise.then((result) => {
        const NextPage = CURRENT_PAGE + 1;
        const PreviousPage = CURRENT_PAGE - 1;
        const TotalPages = result;

        // Pagination - Navigation
        const paginationTop = document.createElement('nav');
        paginationTop.className = 'pagination is-centered';
        paginationTop.setAttribute('role', 'navigation');
        paginationTop.setAttribute('aria-label', 'pagination');

        // Pagination - Navigation - Link - Previous
        const previousLink = document.createElement('a');
        previousLink.innerHTML = 'Previous';

        // Do we have an enabled previous page? (Page > 1)
        previousLink.className = (CURRENT_PAGE > 1) ? 'pagination-previous' : 'pagination-previous is-disabled';

        // Pagination - Navigation - Link - Next
        const nextLink = document.createElement('a');
        nextLink.innerHTML = 'Next';

        // Do we have an enabled next page? (Page < Total Pages)
        nextLink.className = (CURRENT_PAGE < TotalPages) ? 'pagination-next' : 'pagination-next is-disabled';

        // Pagination - Navigation - Links - Pages List
        const pageNumberList = document.createElement('ul');
        pageNumberList.className = 'pagination-list';

        // Pagination - Navigation - Links - Pages List - Ellipsis
        const listItemEllipsesEarly = document.createElement('li');
        const listItemEllipsesSpan = document.createElement('span');
        listItemEllipsesSpan.className = 'pagination-ellipsis';
        listItemEllipsesSpan.innerHTML = '&hellip;';
        listItemEllipsesEarly.appendChild(listItemEllipsesSpan);
        const listItemEllipsesLate = listItemEllipsesEarly.cloneNode(true);

        // Pagination - Navigation - Links - Pages List - List Element - 1
        const listItemPage1 = document.createElement('li');
        const listItemPage1Link = document.createElement('a');
        listItemPage1Link.className = 'pagination-link';
        listItemPage1Link.setAttribute('data-page', '1');
        listItemPage1Link.setAttribute('aria-label', 'Goto page 1');
        listItemPage1Link.innerHTML = '1';
        listItemPage1.appendChild(listItemPage1Link);

        // Pagination - Navigation - Links - Pages List - List Element - Previous
        const listItemPagePrevious = document.createElement('li');
        const listItemPagePreviousLink = document.createElement('a');
        listItemPagePreviousLink.className = 'pagination-link';
        listItemPagePreviousLink.setAttribute('data-page', PreviousPage);
        listItemPagePreviousLink.setAttribute('aria-label', 'Goto page ' + PreviousPage);
        listItemPagePreviousLink.innerHTML = PreviousPage;
        listItemPagePrevious.appendChild(listItemPagePreviousLink);

        // Pagination - Navigation - Links - Pages List - List Element - Current
        const listItemPageCurrent = document.createElement('li');
        const listItemPageCurrentLink = document.createElement('a');
        listItemPageCurrentLink.className = 'pagination-link is-current';
        listItemPageCurrentLink.setAttribute('data-page', CURRENT_PAGE);
        listItemPageCurrentLink.setAttribute('aria-label', 'Page ' + CURRENT_PAGE);
        listItemPageCurrentLink.setAttribute('aria-current', 'page');
        listItemPageCurrentLink.innerHTML = CURRENT_PAGE;
        listItemPageCurrent.appendChild(listItemPageCurrentLink);

        // Pagination - Navigation - Links - Pages List - List Element - Next
        const listItemPageNext = document.createElement('li');
        const listItemPageNextLink = document.createElement('a');
        listItemPageNextLink.className = 'pagination-link';
        listItemPageNextLink.setAttribute('data-page', NextPage);
        listItemPageNextLink.setAttribute('aria-label', 'Goto page ' + NextPage);
        listItemPageNextLink.innerHTML = NextPage;
        listItemPageNext.appendChild(listItemPageNextLink);

        // Pagination - Navigation - Links - Pages List - List Element - Last
        const listItemPageLast = document.createElement('li');
        const listItemPageLastLink = document.createElement('a');
        listItemPageLastLink.className = 'pagination-link';
        listItemPageLastLink.setAttribute('data-page', TotalPages);
        listItemPageLastLink.setAttribute('aria-label', 'Goto page ' + TotalPages);
        listItemPageLastLink.innerHTML = TotalPages;
        listItemPageLast.appendChild(listItemPageLastLink);

        // BUild Pagination
        paginationTop.appendChild(previousLink);
        paginationTop.appendChild(nextLink);
        paginationTop.appendChild(pageNumberList);

        // Add Page 1 and Ellipses if We're on page 3 or more
        if (CURRENT_PAGE >= 3) {
            pageNumberList.appendChild(listItemPage1);
            pageNumberList.appendChild(listItemEllipsesEarly);
        }

        // Previous Page if page 2 or higher
        if (CURRENT_PAGE >= 2) {
            pageNumberList.appendChild(listItemPagePrevious);
        }

        // Current Page
        pageNumberList.appendChild(listItemPageCurrent);

        // Next Page if Page < Total Pages
        if (CURRENT_PAGE < TotalPages) {
            pageNumberList.appendChild(listItemPageNext);
        }

        // Add Ellipses and Last Page if We're on last page - 2
        if (CURRENT_PAGE <= (TotalPages - 2)) {
            pageNumberList.appendChild(listItemEllipsesLate);
            pageNumberList.appendChild(listItemPageLast);
        }

        // Finish Pagination
        paginationTop.appendChild(pageNumberList);

        // Clone for Button
        const paginationBottom = paginationTop.cloneNode(true);

        // Check to see if we have the elements
        topDiv.empty().append(paginationTop);
        bottomDiv.empty().append(paginationBottom);

        // Bind Pagination Links
        PaginationBindings();
    });
}

/**
 * @function TagContent
 * @description Generates the content for the tag page for an image or video.
 * @param {number} itemID 
 */
function TagContent(itemID) {
     // Get Tags for Item
     getTagsForItem(itemID).then((tags) => {
        const mediaContainer = $('#tags-page-media');
        const mediaURL = $(`#item-full-${itemID}`).prop('href');
        const mediaExtension = mediaURL.split('.').pop().toLowerCase();

        // If the Item is an Image or GIF
        if (PAGE_TYPE === PAGE_IMAGES || mediaExtension === 'gif') {
            const mediaItem = document.createElement('img');
            mediaItem.setAttribute('id', 'tag-image');
            mediaItem.setAttribute('alt', '');
            mediaItem.setAttribute('src', mediaURL);
            mediaContainer.empty().append(mediaItem);
        // If the Item is a Video
        } else {
            const mediaItem = document.createElement('video');
            mediaItem.setAttribute('id', 'tag-video');
            mediaItem.setAttribute('controls', 'controls');
            mediaItem.setAttribute('src', mediaURL);
            mediaItem.setAttribute('type', 'video/' + mediaExtension);
            mediaContainer.empty().append(mediaItem);
        }
        
        // Add the Tags
        tags.forEach((tag) => {
            const tagSpan = document.createElement('span');
            tagSpan.classList.add('tag', 'is-info');
            tagSpan.innerHTML = tag.tag_name;
            const tagDeleteButton = document.createElement('button');
            tagDeleteButton.classList.add('delete');
            tagDeleteButton.setAttribute('data-id', tag.tag_id);
            tagDeleteButton.setAttribute('aria-label', 'delete');
            tagSpan.appendChild(tagDeleteButton);
            $('#tag-list').append(tagSpan);
        });

        // Show the Tag Page
        $('#item-tags-content').removeClass('is-hidden');
        $('#gallery-content').addClass('is-hidden');
    });

    // Add Bindings for the Tag Page
    TagBindings();
}

/**
 * @function NavigationBindings
 * @description Binds the navigation links to their respective functions.
 */
function NavigationBindings() {
    // Navbar Mobile Burger Menu Toggle
    $('#nav_burger').on('click', function () {
        $('#nav_burger').toggleClass('is-active');
        $(".navbar-menu").toggleClass("is-active");
    });

    // Main Links - Images
    $('#view-images-link').on('click', function () {
        if (PAGE_TYPE === PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = false;
        PAGE_TYPE = PAGE_IMAGES;
        GalleryContent();
    });

    $('#view-all-images-link').on('click', function () {
        if (PAGE_TYPE === PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = true;
        PAGE_TYPE = PAGE_IMAGES;
        GalleryContent();
    });

    // Main Links - Videos
    $('#view-videos-link').on('click', function () {
        if (PAGE_TYPE === PAGE_IMAGES) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = false;
        PAGE_TYPE = PAGE_VIDEOS;
        GalleryContent();
    });

    $('#view-all-videos-link').on('click', function () {
        if (PAGE_TYPE === PAGE_IMAGES) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = true;
        PAGE_TYPE = PAGE_VIDEOS;
        GalleryContent();
    });
}

/**
 * @function GalleryBindings
 * @description Binds the gallery links to their respective functions.
 */
function GalleryBindings() {
    // Tag Links
    $('.link-tags-page').on('click', function () {
        const itemID = $(this).data('id');
        TagContent(itemID);       
    });
}

function PaginationBindings() {
    // Pagination Links
    $('.pagination-link').on('click', function () {
        CURRENT_PAGE = $(this).data('page');
        GalleryContent();
    });

    $('.pagination-next').on('click', function () {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE + 1;
            GalleryContent();
        }
    });

    $('.pagination-previous').on('click', function () {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE - 1;
            GalleryContent();
        }
    });
}

/**
 * @function TagBindings
 * @description Binds the tag links to their respective functions.
 */
function TagBindings() {
    // Tag Back - Back to Gallery
    $('#back-to-gallery').on('click', function () {
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

/**
 * @function SetPageTitle
 * @description Sets the page title based on the current page type (images or videos).
 */
function SetPageTitle() {
    let title;

    if (PAGE_TYPE === PAGE_VIDEOS) {
        title = `${PAGE_TITLE} - Videos`;
    } else {
        title = `${PAGE_TITLE} - Images`;
    }

    // Set Title
    document.title = title;
    $('#gallery-title').html(title);
}

/**
 * @function setTagList
 * @description Sets the tag list for the datalist elements.
 * @param {Array} currentTags 
 */
function setTagList(currentTags) {
    const tagLists = $('.datalist-for-tags');

    // Setup the Tag Lists
    tagLists.each(function () {
        // Empty the list
        $(this).empty();

        // Add the Tags
        currentTags.forEach(tag => {
            const datalistOption = document.createElement('option');
            datalistOption.setAttribute('value', tag.tag_name);
            $(this).append(datalistOption);
        });
    });
}

// Async - Page Title
async function getPageTitle() {
    const apiLink = `${API_BASE_URL}/pages/title/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    }
    catch (error){
        console.error(`Error fetching page title: ${error}`);
    }
}

// Async - Tags
async function getTags() {
    const apiLink = `${API_BASE_URL}/tag/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

// Async - Total Images
async function getTotalImages() {
    const apiLink = `${API_BASE_URL}/images/total/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total images:', error);
    }
}

// Async - Total Videos
async function getTotalVideos() {
    const apiLink = `${API_BASE_URL}/videos/total/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total videos:', error);
    }
}

// Async - Total Image Pages
async function getTotalImagePages() {
    const apiLink = `${API_BASE_URL}/pages/images/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total image pages:', error);
    }
}

// Async - Total Video Pages
async function getTotalVideoPages() {
    const apiLink = `${API_BASE_URL}/pages/videos/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total video pages:', error);
    }
}

// Async - Images for Page
async function getImagesForPage(page) {
    let apiLink;

    if (VIEW_ALL === false) {
        apiLink = `${API_BASE_URL}/images/page/${page}/`;
    } else {
        apiLink = `${API_BASE_URL}/images/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// Async - Videos for Page
async function getVideosForPage(page) {
    let apiLink;

    if (VIEW_ALL === false) {
        apiLink = `${API_BASE_URL}/videos/page/${page}/`;
    }
    else {
        apiLink = `${API_BASE_URL}/videos/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

// Async - Tags for Image or Video
async function getTagsForItem(itemID) {
    let apiLink;

    if (PAGE_TYPE === PAGE_IMAGES) {
        apiLink = `${API_BASE_URL}/tag/for/image/${itemID}/`;
    } else {
        apiLink = `${API_BASE_URL}/tag/for/video/${itemID}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching tags for item:', error);
    }
}