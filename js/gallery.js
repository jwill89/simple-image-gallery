/**
 * @file gallery.js
 * @author MathDad <https://www.mathdad.me>
 * @license MIT
 * @version 1.0.2
 * @description This file contains the JavaScript code for the site. It handles the loading of images and videos, pagination, and tag management.
 */


/**
 * @const {number} PAGE_IMAGES - Defines if the page is displaying images
 * @const {number} PAGE_VIDEOS - Defines if the page is displaying videos
 * @const {number} PAGE_TAGS - Defines if the page is displaying tags
 * @const {string} API_BASE_URL - The API link for the gallery
 * @var {string} PAGE_TITLE - The title of the page
 * @var {Array} CURRENT_TAGS - The current searched tags
 * @var {Array} ALL_TAGS - The list of all tags
 * @var {number} CURRENT_PAGE - The current page number
 * @var {number} PAGE_TYPE - The type of page (images or videos)
 */
const PAGE_IMAGES = 1;
const PAGE_VIDEOS = 2;
const PAGE_TAGS = 3;
const API_BASE_URL = '/api';
let PAGE_TITLE = 'Gallery';
let CURRENT_TAGS = [];
let ALL_TAGS = [];
let CURRENT_PAGE = PAGE_IMAGES;
let PAGE_TYPE = PAGE_IMAGES;
let ITEMS_PER_PAGE = 40;
let BLUR_THUMBNAILS = false;

/**
 * @description This function is called when the page is loaded. It initializes the page by setting the title, loading tags, and setting the total images/videos in the footer.
*/
$(function () {
    // Site Initialization
    SiteInit();

    // Bind Element Events
    AddEventListenersNavigation();

    // Add Bindings for the Tag Page (Permanent Hidden Items, Prevent Looping)
    AddEventListenersMediaTags();

    // Generate Default Content
    RenderPageGallery();
});

/**
 * @function SiteInit
 * @description Initializes the site by setting the title, loading tags, and setting the total images/videos in the footer.
 */
function SiteInit() {
    // Set gallery title
    getPageTitle().then((title) => {
        PAGE_TITLE = title;
        setPageTitle();
    });

    // Load all current tags
    getTags().then((tags) => {
        ALL_TAGS = tags;
        setTagList(ALL_TAGS);
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
 * @function RenderPageGallery
 * @description Generates the gallery content based on the current page and type (images or videos).
 */
function RenderPageGallery() {
    /**
     * @var {HTMLElement} gallerySection - The section of the page where the gallery content will be displayed
     * @var {HTMLElement} galleryDisplay - The div where the images/videos will be displayed
     * @var {Promise} galleryPromise - The promise that resolves when the images/videos are loaded
     */
    const gallerySection = $('#gallery-content');
    const galleryDisplay = $('#gallery-display');
    let galleryPromise;

    // Update the Page Title
    setPageTitle();

    // Determine if we are viewing images or videos and get the corresponding promise
    if (PAGE_TYPE === PAGE_IMAGES) {
        galleryPromise = getImagesForPage(CURRENT_PAGE);
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
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
            } else if (PAGE_TYPE === PAGE_VIDEOS) {
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
            cardFigureImage.classList.add('gallery-image');
            if (BLUR_THUMBNAILS) {
                cardFigureImage.classList.add('thumb-blur');
            }
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
        AddEventListenersGallery();

        // Generate Pagination
        RenderGalleryPagination();

        // Scroll to top of page
        document.body.scrollIntoView({behavior: "smooth"});
    });
}

/**
 * @function RenderGalleryPagination
 * @description Generates the pagination for the gallery based on the current page and type (images or videos).
 */
function RenderGalleryPagination() {
    const topDiv = $('#pagination-top');
    const bottomDiv = $('#pagination-bottom');
    let pagesPromise;

    if (PAGE_TYPE === PAGE_IMAGES) {
        pagesPromise = getTotalImagePages();
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
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
        AddEventListenersGalleryPagination();
    });
}

/**
 * @function RenderPageMediaTags
 * @description Generates the content for the tag page for an image or video.
 * @param {number} itemID 
 */
function RenderPageMediaTags(itemID) {
     // Get Tags for Item
     getTagsForItem(itemID).then((tags) => {
        const mediaContainer = $('#tags-page-media');
        const mediaURL = $(`#item-full-${itemID}`).prop('href');
        const mediaExtension = mediaURL.split('.').pop().toLowerCase();

        // If the Item is an Image or GIF
        if (PAGE_TYPE === PAGE_IMAGES || mediaExtension === 'gif') {
            const mediaItem = document.createElement('img');
            mediaItem.setAttribute('id', 'tag-image');
            mediaItem.setAttribute('data-id', itemID);
            mediaItem.setAttribute('alt', '');
            mediaItem.setAttribute('src', mediaURL);
            mediaContainer.empty().append(mediaItem);
        // If the Item is a Video
        } else {
            const mediaItem = document.createElement('video');
            mediaItem.setAttribute('id', 'tag-video');
            mediaItem.setAttribute('data-id', itemID);
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
}

/**
 * @function RenderPageTags
 * @description Generates the content for the tags page.
 * @todo Implement the RenderPageTags function
 */
function RenderPageTags() {
    // TODO: Implement the RenderPageTags function
}

/**
 * @function NavigationSetActive
 * @description Sets the appropriate link as active in the navigation bar.
 * @param {HTMLElement} activeLink 
 */
function NavigationSetActive(activeLink) {
    $('a.navbar-item').removeClass('is-selected');
    activeLink.addClass('is-selected');
}

/**
 * @function AddEventListenersNavigation
 * @description Binds the navigation links to their respective functions.
 */
function AddEventListenersNavigation() {
    // Navbar Mobile Burger Menu Toggle
    $('#nav_burger').on('click', function () {
        $('#nav_burger').toggleClass('is-active');
        $(".navbar-menu").toggleClass("is-active");
    });

    // Main Links - Images
    $('#nav-images-link').on('click', function () {
        if (PAGE_TYPE !== PAGE_IMAGES) {
            CURRENT_PAGE = 1;
        }
        PAGE_TYPE = PAGE_IMAGES;
        CURRENT_TAGS = [];
        NavigationSetActive($(this));
        RenderPageGallery();
    });

    // Main Links - Videos
    $('#nav-videos-link').on('click', function () {
        if (PAGE_TYPE !== PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        PAGE_TYPE = PAGE_VIDEOS;
        CURRENT_TAGS = [];
        NavigationSetActive($(this));
        RenderPageGallery();
    });

    // Main Links - Tags
    $('#nav-tags-link').on('click', function () {
        PAGE_TYPE = PAGE_TAGS;
        CURRENT_TAGS = [];
        RenderPageTags();
    });

    // Blur Images Button
    $('#blur-thumbs').on('click', function () {
        if (BLUR_THUMBNAILS) {
            BLUR_THUMBNAILS = false;
            $(this).removeClass('is-success');
            $(this).html('Blur: Off');
            $('.gallery-image').removeClass('thumb-blur');
        } else if (!BLUR_THUMBNAILS) {
            BLUR_THUMBNAILS = true;
            $(this).addClass('is-success');
            $(this).html('Blur: On');
            $('.gallery-image').addClass('thumb-blur');
        }
    });

    // Items Per-Page
    $('#items-per-page').on('change', function () {
        ITEMS_PER_PAGE = $(this).val();
        CURRENT_PAGE = 1;
        RenderPageGallery();
    });

    // Search Items with Tags
    $('#search-tags').on('click', function () {
        const searchTags = $('#nav_search_tags').val().split(',');
        CURRENT_TAGS = searchTags.map(tag => tag.trim());
        CURRENT_PAGE = 1;
        $(this).toggleClass('is-hidden');
        $('#reset-tags').toggleClass('is-hidden');
        RenderPageGallery();
    });

    // Reset Search Items with Tags
    $('#reset-tags').on('click', function () {
        $('#nav_search_tags').val('');
        CURRENT_TAGS = [];
        CURRENT_PAGE = 1;
        $(this).toggleClass('is-hidden');
        $('#search-tags').toggleClass('is-hidden');
        RenderPageGallery();
    });
}

/**
 * @function AddEventListenersGallery
 * @description Binds the gallery links to their respective functions.
 */
function AddEventListenersGallery() {
    // Tag Links
    $('.link-tags-page').on('click', function () {
        const itemID = $(this).data('id');
        RenderPageMediaTags(itemID);       
    });
}

/**
 * @function AddEventListenersGalleryPagination
 * @description Binds the pagination links to their respective functions.
 */
function AddEventListenersGalleryPagination() {
    // Pagination Links
    $('.pagination-link').on('click', function () {
        CURRENT_PAGE = $(this).data('page');
        RenderPageGallery();
    });

    // Pagination - Nest
    $('.pagination-next').on('click', function () {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE + 1;
            RenderPageGallery();
        }
    });

    // Pagination - Previous
    $('.pagination-previous').on('click', function () {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE - 1;
            RenderPageGallery();
        }
    });
}

/**
 * @function AddEventListenersMediaTags
 * @description Binds the tag links to their respective functions.
 */
function AddEventListenersMediaTags() {
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

    // Add Tags to Item
    $('#add-tags').on('click', function () {
        const tagsInput = $('#add_tag');
        const tags = tagsInput.val();
        const itemID = $('#tag-image').data('id');

        addTagsToItem(itemID, tags).then(() => {
            RenderPageMediaTags(itemID);
        });

        // Clear Tags Input
        tagsInput.val('');
    });
}

/**
 * @function setPageTitle
 * @description Sets the page title based on the current page type (images or videos).
 */
function setPageTitle() {
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

/**
 * @function getPageTitle
 * @description Fetches the page title from the API.
 * @async
 * @throws {Error} If there is an error fetching the page title.
 * @returns {Promise} A promise that resolves to the page title.
 */
async function getPageTitle() {
    const apiLink = `${API_BASE_URL}/config/title/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    }
    catch (error){
        console.error(`Error fetching page title: ${error}`);
    }
}

/**
 * @function getTags
 * @description Fetches the tags from the API.
 * @async
 * @throws {Error} If there is an error fetching the tags.
 * @returns {Promise} A promise that resolves to the tags.
 */
async function getTags() {
    const apiLink = `${API_BASE_URL}/tags/all/`;

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}

/**
 * @function getTotalImages
 * @description Fetches the total number of images from the API.
 * @async
 * @throws {Error} If there is an error fetching the total number of images.
 * @returns {Promise} A promise that resolves to the total number of images.
 */
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

/**
 * @function getTotalVideos
 * @description Fetches the total number of videos from the API.
 * @async
 * @throws {Error} If there is an error fetching the total number of videos.
 * @returns {Promise} A promise that resolves to the total number of videos.
 */
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

/**
 * @function getTotalImagePages
 * @description Fetches the total number of image pages from the API.
 * @async
 * @throws {Error} If there is an error fetching the total number of image pages.
 * @returns {Promise} A promise that resolves to the total number of image pages.
 */
async function getTotalImagePages() {
    let apiLink;

    if (CURRENT_TAGS.length > 0) {
        apiLink = `${API_BASE_URL}/pages/images/with-tags/${CURRENT_TAGS.join()}/${ITEMS_PER_PAGE}/`;
    } else {
        apiLink = `${API_BASE_URL}/pages/images/${ITEMS_PER_PAGE}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total image pages:', error);
    }
}

/**
 * @function getTotalVideoPages
 * @description Fetches the total number of video pages from the API.
 * @async
 * @throws {Error} If there is an error fetching the total number of video pages.
 * @returns {Promise} A promise that resolves to the total number of video pages.
 */
async function getTotalVideoPages() {
    let apiLink;

    if (CURRENT_TAGS.length > 0) {
        apiLink = `${API_BASE_URL}/pages/videos/with-tags/${CURRENT_TAGS.join()}/${ITEMS_PER_PAGE}/`;
    } else {
        apiLink = `${API_BASE_URL}/pages/videos/${ITEMS_PER_PAGE}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching total video pages:', error);
    }
}

/**
 * @function getImagesForPage
 * @description Fetches the images for a specific page from the API.
 * @async
 * @param {number} page The page number to fetch images for.
 * @throws {Error} If there is an error fetching the images for the page.
 * @returns {Promise} A promise that resolves to the images for the page.
 */
async function getImagesForPage(page) {
    let apiLink;

    if (CURRENT_TAGS.length > 0) {
        apiLink = `${API_BASE_URL}/images/with-tags/${CURRENT_TAGS.join()}/${CURRENT_PAGE}/${ITEMS_PER_PAGE}/`;
    } else {
        apiLink = `${API_BASE_URL}/images/page/${page}/${ITEMS_PER_PAGE}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

/**
 * @function getVideosForPage
 * @description Fetches the videos for a specific page from the API.
 * @async
 * @param {number} page The page number to fetch videos for.
 * @throws {Error} If there is an error fetching the videos for the page.
 * @returns {Promise} A promise that resolves to the videos for the page.
 */
async function getVideosForPage(page) {
    let apiLink;

    if (CURRENT_TAGS.length > 0) {
        apiLink = `${API_BASE_URL}/videos/with-tags/${CURRENT_TAGS.join()}/${CURRENT_PAGE}/${ITEMS_PER_PAGE}/`;
    } else {
        apiLink = `${API_BASE_URL}/videos/page/${page}/${ITEMS_PER_PAGE}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

/**
 * @function getTagsForItem
 * @description Fetches the tags for a specific image or video from the API.
 * @async
 * @param {number} itemID The ID of the image or video to fetch tags for.
 * @throws {Error} If there is an error fetching the tags for the item.
 * @returns {Promise} A promise that resolves to the tags for the item.
 */
async function getTagsForItem(itemID) {
    let apiLink;

    if (PAGE_TYPE === PAGE_IMAGES) {
        apiLink = `${API_BASE_URL}/tags/for/image/${itemID}/`;
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        apiLink = `${API_BASE_URL}/tags/for/video/${itemID}/`;
    }

    try {
        const response = await fetch(apiLink)
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching tags for item:', error);
    }
}

/**
 * @function addTagsToItem
 * @description Adds tags to a specific image or video.
 * @async
 * @param {number} itemID 
 * @param {string} tags 
 * @returns {Promise} A promise that resolves to the updated tags for the item.
 */
async function addTagsToItem(itemID, tags) {
    let apiLink;

    if (PAGE_TYPE === PAGE_IMAGES) {
        apiLink = `${API_BASE_URL}/tags/image/add/`;
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        apiLink = `${API_BASE_URL}/tags/video/add/`;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    try {
        const response = await fetch(apiLink, {
            method: 'PATCH',
            body: JSON.stringify({'item_id': itemID, 'tag_list': tags}),
            headers: myHeaders,
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error adding tags to item:', error);
    }
}