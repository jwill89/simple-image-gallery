/**
 * @file gallery.js
 * @author MathDad <https://www.mathdad.me>
 * @license MIT
 * @version 1.0.3
 * @description This file contains the JavaScript code for the site. It handles the loading of images and videos, pagination, and tag management.
 */

// For Linting
/* global DataTable */

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
let BASE_URL = '';
let API_BASE_URL = '';
let PAGE_TITLE = 'Gallery';
let CURRENT_TAGS = [];
let ALL_TAGS = [];
let CURRENT_PAGE = PAGE_IMAGES;
let PAGE_TYPE = PAGE_IMAGES;
let ITEMS_PER_PAGE = 40;
let BLUR_THUMBNAILS = false;
let SHOWING_MEDIA_TAGS = false;
let MEDIA_ID = null;

/**
 * @description This function is called when the page is loaded. It initializes the page by setting the title, loading tags, and setting the total images/videos in the footer.
*/
$(function () {
    // Site Initialization
    SiteInit();

    // Bind Site Events
    AddEventListenersToSite();

    // Bind Element Events
    AddEventListenersNavigation();

    // Generate Default Content
    RenderPageGallery();
});

/**
 * @function SiteInit
 * @description Initializes the site by setting the title, loading tags, and setting the total images/videos in the footer.
 */
function SiteInit() {
    // Set Base URL Information
    BASE_URL = window.location.origin;
    API_BASE_URL = `${BASE_URL}/api`;

    // Set gallery title
    getPageTitle().then((title) => {
        PAGE_TITLE = title;
        setPageTitle();
    });

    // Load all current tags
    RefreshTags();

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
                full_path,
                hash;

            if (PAGE_TYPE === PAGE_IMAGES) {
                item_id = item.image_id;
                thumbnail_path = `${BASE_URL}/images/thumbs/${item.file_name}`;
                full_path = `${BASE_URL}/images/full/${item.file_name}`;
                hash = item.hash;
            } else if (PAGE_TYPE === PAGE_VIDEOS) {
                item_id = item.video_id;
                thumbnail_path = `${BASE_URL}/videos/thumbs/${item.file_name.split('.').slice(0, -1).join('.')}.jpg`;
                full_path = `${BASE_URL}/videos/full/${item.file_name}`;
                hash = item.hash
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
            cardFooterLinkTags.setAttribute('data-hash', hash);

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
    // Define the Page Section
    const gallerySection = $('#gallery-content');

    // Define the Pagination Divs
    const topPagination = $('#pagination-top');
    const bottomPagination = $('#pagination-bottom');
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

        // Build Pagination
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
        topPagination.empty().append(paginationTop);
        bottomPagination.empty().append(paginationBottom);

        // Bind Pagination Links
        AddEventListenersGalleryPagination();

        // Bind Gallery Links
        AddEventListenersGallery();

        // Show the Page
        gallerySection.removeClass('is-hidden');
    });
}

/**
 * @function RenderPageMediaTags
 * @description Generates the content for the tag page for an image or video.
 * @param {number} itemID
 * @param {string} itemURL
 * @param {string} itemHash
 */
function RenderPageMediaTags(itemID, itemURL, itemHash = null) {
    // Set our constants for use elsewhere
    SHOWING_MEDIA_TAGS = true;
    MEDIA_ID = itemID;

    // Update Page Title
    setPageTitle();

    // Define the Page Section
    const mediaTagsSection = $('#item-tags-content');
    const mediaExtension = itemURL.split('.').pop().toLowerCase();
    
     // Get Tags for Item
     getTagsForItem(itemID).then((tags) => {
        const mediaContainer = $('#tags-page-media');

        // If the Item is an Image or GIF
        if (PAGE_TYPE === PAGE_IMAGES || mediaExtension === 'gif') {
            const mediaItem = document.createElement('img');
            mediaItem.setAttribute('id', 'tag-image');
            mediaItem.setAttribute('data-id', itemID);
            mediaItem.setAttribute('alt', '');
            mediaItem.setAttribute('src', itemURL);
            mediaContainer.empty().append(mediaItem);
        // If the Item is a Video
        } else {
            const mediaItem = document.createElement('video');
            mediaItem.setAttribute('id', 'tag-video');
            mediaItem.setAttribute('data-id', itemID);
            mediaItem.setAttribute('controls', 'controls');
            mediaItem.setAttribute('src', itemURL);
            mediaItem.setAttribute('type', 'video/' + mediaExtension);
            mediaContainer.empty().append(mediaItem);
        }

        // Get the MD5 Hash
        if (itemHash !== null) {
            const hashDisplay = document.createElement('p');
            hashDisplay.classList.add('help');
            hashDisplay.setAttribute('id', 'hash-display');
            hashDisplay.innerHTML = `MD5 Hash: ${itemHash}`;
            mediaContainer.append(hashDisplay);
        }
        
        // Add the Tags
        tags.forEach((tag) => {
            const tagSpan = document.createElement('span');
            tagSpan.classList.add('tag', 'media-tag');
            let categoryClass;
            switch (tag.category_id) {
                case 1:
                    categoryClass = 'is-white';
                    break;
                case 2:
                    categoryClass = 'is-danger';
                    break;
                case 3:
                    categoryClass = 'is-success';
                    break;
                case 4:
                    categoryClass = 'is-warning';
                    break;
                case 5:
                    categoryClass = 'is-info';
                    break;
                default:
                    categoryClass = 'is-white';
                    break;
            }
            tagSpan.classList.add(categoryClass);
            tagSpan.innerHTML = tag.tag_name;
            const tagDeleteButton = document.createElement('button');
            tagDeleteButton.classList.add('delete');
            tagDeleteButton.setAttribute('data-id', tag.tag_id);
            tagDeleteButton.setAttribute('aria-label', 'delete');
            tagSpan.appendChild(tagDeleteButton);
            $('#tag-list').append(tagSpan);
        });

        // Add Bindings for the Tag Page
        AddEventListenersMediaTags();

        // Show the Tag Page
        mediaTagsSection.removeClass('is-hidden');
    });
}

/**
 * @function RenderPageTags
 * @description Generates the content for the tags page including rendering the DataTable.
 */
function RenderPageTags() {
    // Define the Page Section
    const tagsSection = $('#tags-list-content');

    // Update the Page Title
    setPageTitle();

    // Get the Table
    const tagsSectionTable = $('#tag-list-page-table');

    // Set up the Tags Page DataTable
    tagsSectionTable.DataTable({
        ajax: {
            url: `${API_BASE_URL}/tags/display/`,
            dataSrc: ''
        },
        destroy: true,
        retrieve: true,
        processing: true,
        searching: true,
        autoWidth: true,
        paging: true,
        scrollCollapse: true,
        colReorder: true,
        fixedHeader: true,
        responsive: true,
        lengthMenu: [10, 25, 50, 100],
        pageLength: 10,
        order: [[1, 'asc']],
        rowId: 'tag_id',
        columns: [
            {
                // Tag ID - Used for Editing
                name: 'tag_id',
                data: 'tag_id',
                visible: false,
                searchable: false
            },
            {
                // Tag Name
                name: 'tag_name',
                data: 'tag_name',
                visible: true,
                searchable: true,
                render: function (data, type, row) {
                    let categoryClass = '';
                    switch (row.category_name) {
                        case 'General':
                            categoryClass = 'has-text-white';
                            break;
                        case 'Artist':
                            categoryClass = 'has-text-danger';
                            break;
                        case 'Character':
                            categoryClass = 'has-text-success';
                            break;
                        case 'Source':
                            categoryClass = 'has-text-warning';
                            break;
                        case 'Personal List':
                            categoryClass = 'has-text-info';
                            break;
                        default:
                            categoryClass = 'has-text-white';
                            break;
                    }
                    return `<span class="${categoryClass}">${data}</span>`;
                }
            },
            {
                // Category ID - Used for Editing
                name: 'category_id',
                data: 'category_id',
                visible: false,
                searchable: false
            },
            {
                name: 'category_name',
                data: 'category_name',
                visible: true,
                searchable: true,
                render: function (data) {
                    let categoryClass = '';
                    switch (data) {
                        case 'General':
                            categoryClass = 'is-white';
                            break;
                        case 'Artist':
                            categoryClass = 'is-danger';
                            break;
                        case 'Character':
                            categoryClass = 'is-success';
                            break;
                        case 'Source':
                            categoryClass = 'is-warning';
                            break;
                        case 'Personal List':
                            categoryClass = 'is-info';
                            break;
                        default:
                            categoryClass = 'is-white';
                            break;
                    }
                    return `<span class="tag is-medium ${categoryClass}">${data}</span>`;
                }
            },
            {   name: 'image_count',
                data: 'image_count',
                visible: true,
                searchable: true,
                render: function (data) {
                    return `<p class="has-text-center">${data}</p>`;
                }
            },
            {   
                name: 'video_count',
                data: 'video_count',
                visible: true,
                searchable: true,
                render: function (data) {
                    return `<p class="has-text-center">${data}</p>`;
                }
            }
        ]
    });

    // Add Event Listeners
    AddEventListenersToTagsList();

    // Show the Tags Section
    tagsSection.removeClass('is-hidden');
}

/**
 * @function ClearPages
 * @description Clears the content of all pages and hides them. Individual page render functions will show their pages
 */
function ClearPages() {
    // Gallery Page
    const gallerySection = $('#gallery-content');
    const gallerySectionTopPagination = $('#pagination-top');
    const gallerySectionBottomPagination = $('#pagination-bottom');
    const gallerySectionContent = $('#gallery-display');

    // Media Item Tags Page
    const mediaTagsSection = $('#item-tags-content');
    const mediaTagsSectionMediaItem = $('#tags-page-media');
    const mediaTagsSectionTags = $('#tag-list');

    // Tag List Page
    const tagsSection = $('#tags-list-content');
    const tagsSectionTable = $('#tag-list-page-table');
    const tagsSectionTableBody = $('#tag-list-page-table-body');

    // Clear the Gallery Page
    gallerySectionTopPagination.empty();
    gallerySectionBottomPagination.empty();
    gallerySectionContent.empty();

    // Clear the Media Item Tags Page
    mediaTagsSectionMediaItem.empty();
    mediaTagsSectionTags.empty();

    // Clear the Tag List Page & DataTable
    if (DataTable.isDataTable('#tag-list-page-table')) {
        tagsSectionTable.DataTable().clear().destroy();
        tagsSectionTableBody.empty();
    }

    // Hide All Pages (Sections)
    gallerySection.addClass('is-hidden');
    mediaTagsSection.addClass('is-hidden');
    tagsSection.addClass('is-hidden');
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
 * @function SetCurrentURL
 * @description Sets the current URL in the browser to the new page type and number.
 */
function SetCurrentURL() {
    // Get the base URL
    const currentURL = window.location.href.split('/')[0];

    // Initialize new url
    let newURL,
        pageType;

    // Set Page Type based on the current page type
    switch (PAGE_TYPE) {
        case PAGE_IMAGES:
            pageType = 'images';
            break;
        case PAGE_VIDEOS:
            pageType = 'videos';
            break;
        case PAGE_TAGS:
            pageType = 'tags';
            break;
    }

    // Set new URL base on page type and if we have a page number
    if (SHOWING_MEDIA_TAGS) {
        newURL = `${currentURL}/${pageType}/${MEDIA_ID}/tags/`;
    } else if (PAGE_TYPE !== PAGE_TAGS) {
        newURL = `${currentURL}/${pageType}/${CURRENT_PAGE}/`;
    } else {
        newURL = `${currentURL}/${pageType}/`;
    }

    // Set the new URL in the browser
    window.history.pushState({path: newURL}, '', newURL);
}

/**
 * @function AddEventListenersToSite
 * @description Binds site-wide listeners to their needed elements
 */
function AddEventListenersToSite() {
    // Close All Modals - Buttons
    $('.modal-close').on('click', function () {
        CloseModal();
    });

    // Close All Modals - Buttons
    $('.modal-delete').on('click', function () {
        CloseModal();
    });

    // Close Modal - Background
    $('.modal-background').on('click', function () {
        CloseModal();
    });

    // Close Modal - Escape Key
    $(document).on('keyup', function (event) {
        if (event.key === 'Escape') {
            CloseModal();
        }
    });
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
        CURRENT_PAGE = 1;
        PAGE_TYPE = PAGE_IMAGES;
        CURRENT_TAGS = [];
        NavigationSetActive($(this));
        ClearPages();
        RenderPageGallery();
    });

    // Main Links - Videos
    $('#nav-videos-link').on('click', function () {
        CURRENT_PAGE = 1;
        PAGE_TYPE = PAGE_VIDEOS;
        CURRENT_TAGS = [];
        NavigationSetActive($(this));
        ClearPages();
        RenderPageGallery();
    });

    // Main Links - Tags
    $('#nav-tags-link').on('click', function () {
        PAGE_TYPE = PAGE_TAGS;
        CURRENT_TAGS = [];
        NavigationSetActive($(this));
        ClearPages();
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
    $('.link-tags-page').on('click', function (event) {
        event.stopImmediatePropagation();
        const itemID = $(this).data('id');
        const itemHash = $(this).data('hash');
        const itemURL = $(`#item-full-${itemID}`).prop('href');
        ClearPages();
        RenderPageMediaTags(itemID, itemURL, itemHash);       
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
    $('#back-to-gallery').on('click', function (event) {
        // Prevent repeated calls
        event.stopImmediatePropagation();

        SHOWING_MEDIA_TAGS = false;
        MEDIA_ID = null;
        ClearPages();
        RenderPageGallery();
    });

    // Tag Category Shortcode Help Modal
    $('#help-shortcode').on('click', function (event) {
        // Prevent repeated calls
        event.stopImmediatePropagation();

        OpenModal('help-modal-shortcodes');
    });

    // Tag List - Enter Key
    $('#add_tag').on('keyup', function (event) {
        // Prevent repeated calls
        event.stopImmediatePropagation();

        if (event.key === 'Enter') {
            AddTagsToMedia();
        }
    });

    // Add Tags - Button
    $('#add-tags').on('click', function (event) {
        // Prevent repeated calls
        event.stopImmediatePropagation();

        AddTagsToMedia();
    });

    // Tags - Remove Tag "X"
    $('.media-tag').find('.delete').on('click', function (event) {
        // Prevent repeated calls
        event.stopImmediatePropagation();

        // Get the tag ID
        const tagID = $(this).data('id');

        // Confirm we want to remove
        if (confirm('Are you sure you want to remove this tag?')) {
            // Remove the tag
            RemoveTagFromMedia(tagID);
        }
    });
}

/**
 * @function AddEventListenersTagsList
 * @description Binds the tag list page items to their respective functions.
 */
function AddEventListenersToTagsList() {
    // Get Elements
    const formHeader = $('#tag-list-new-tag-form-header');
    const tagNameInput = $('#new_tag_tag_name');
    const tagCategorySelect = $('#new_tag_category_select');
    const tagEditID = $('#new_tag_edit_id');
    const tagSubmitButton = $('#new_tag_btn_submit');
    const tagResetButton = $('#new_tag_btn_reset');
    const helpText = $('#new_tag_tag_name_help');
    const tagTable = $('#tag-list-page-table');

    // Get the DataTable
    const tagTableDataTable = tagTable.DataTable();

    // Double-Click to Edit Tag
    $('#tag-list-page-table tbody').on('dblclick', 'tr', function () {
        // Get the row data from the DataTable
        const rowData = tagTableDataTable.row(this).data();

        // Set the tag id of the tag being edited.
        tagEditID.val(rowData.tag_id);

        // Set the other values
        tagNameInput.val(rowData.tag_name);
        tagCategorySelect.val(rowData.category_id);

        // Set the help text and other indicators you are editing
        formHeader.html('Edit Tag Form');
        tagNameInput.addClass('is-warning');
        tagNameInput.removeClass('is-success is-danger');
        helpText.html(`You are currently editing the tag:<br/>${rowData.tag_name}`);
        helpText.addClass('is-warning');
        helpText.removeClass('is-hidden is-success is-danger');
    });

    // New Tag Name - Keyup Check Existing
    tagNameInput.on('keyup', function (event) {
        // Get the current tag info
        const tagName = tagNameInput.val();

        // Get the existing tags from the DataTable
        const existingTags = tagTableDataTable.column(1).data().toArray();

        // Do not trigger on enter
        if (event.key !== 'Enter') {

            // If we are editing, ignore all of this
            if (tagEditID.val() !== '') {
                return;
            }

            // Check if the tag name already exists
            if (existingTags.includes(tagName)) {
                tagNameInput.addClass('is-danger');
                tagNameInput.removeClass('is-success');
                helpText.html('Tag already exists.');
                helpText.addClass('is-danger');
                helpText.removeClass('is-hidden is-success');
            } else if (tagName.length > 0) {
                tagNameInput.addClass('is-success');
                tagNameInput.removeClass('is-danger');
                helpText.html('Tag is available.');
                helpText.addClass('is-success');
                helpText.removeClass('is-hidden is-danger');
            } else {
                tagNameInput.removeClass('is-danger is-success');
                helpText.html('');
                helpText.addClass('is-hidden');
                helpText.removeClass('is-danger is-success');
            }
        } else {
            // Check if we are editing or adding a new tag
            if (tagEditID.val() !== '') {
                EditExistingTag();
            } else {
                AddNewTag();
            }
        }
    });

    // New Tag - Submit Button
    tagSubmitButton.on('click', function () {
        // Check if we are editing or adding a new tag
        if (tagEditID.val() !== '') {
            EditExistingTag();
        } else {
            AddNewTag();
        }
    });

    // New Tag - Reset Button
    tagResetButton.on('click', function () {
        // Reset Header
        formHeader.html('New Tag Form');

        // Clear the inputs
        tagNameInput.val('');
        tagNameInput.removeClass('is-danger is-success is-warning');
        tagCategorySelect.prop('selectedIndex', 0);
        tagEditID.val('');

        // Clear the help text
        helpText.html('');
        helpText.addClass('is-hidden');
        helpText.removeClass('is-danger is-success is-warning');
    });
}

/**
 * @function AddNewTag
 * @description Adds a new tag to the database and refreshes the tag list.
 */
function AddNewTag() {
    // Get Elements
    const tagNameInput = $('#new_tag_tag_name');
    const tagCategorySelect = $('#new_tag_category_select');
    const helpText = $('#new_tag_tag_name_help');
    const tagTable = $('#tag-list-page-table').DataTable();

    // Get the current tag info
    const tagName = tagNameInput.val();
    const tagCategory = tagCategorySelect.val();

    // Get the existing tags from the DataTable
    const existingTags = tagTable.column(1).data().toArray();

    // Check if the tag name is valid
    if (tagName.length > 0 && existingTags.includes(tagName) === false) {
        addTag(tagName, tagCategory).then(() => {
            // Clear the input
            tagNameInput.val('');
            tagNameInput.removeClass('is-danger is-success');
            tagCategorySelect.prop('selectedIndex', 0);

            // Clear the help text
            helpText.html('');
            helpText.addClass('is-hidden');
            helpText.removeClass('is-danger is-success');

            // Refresh the tags list
            RefreshTags();

            // Refresh the DataTable
            tagTable.ajax.reload();
        });
    } else {
        helpText.html('You cannot submit an empty tag or a tag that already exists.');
        helpText.addClass('is-danger');
        tagNameInput.addClass('is-danger');
    }
}

/**
 * @function EditExistingTag
 * @description Edits an existing tag in the database and refreshes the tag list.
 */
function EditExistingTag() {
    // Get Elements
    const formHeader = $('#tag-list-new-tag-form-header');
    const tagEditID = $('#new_tag_edit_id');
    const tagNameInput = $('#new_tag_tag_name');
    const tagCategorySelect = $('#new_tag_category_select');
    const helpText = $('#new_tag_tag_name_help');
    const tagTable = $('#tag-list-page-table').DataTable();

    // Get the new tag info
    const tagID = tagEditID.val();
    const tagName = tagNameInput.val();
    const tagCategory = tagCategorySelect.val();

    // Check or valid tag name
    if (tagName.length > 0) {
        editTag(tagID, tagName, tagCategory).then(() => {
            // Reset the Header
            formHeader.html('New Tag Form');

            // Clear the input
            tagNameInput.val('');
            tagNameInput.removeClass('is-danger is-success is-warning');
            tagCategorySelect.prop('selectedIndex', 0);
            tagEditID.val('');

            // Clear the help text
            helpText.html('');
            helpText.addClass('is-hidden');
            helpText.removeClass('is-danger is-success is-warning');

            // Refresh the tags list
            RefreshTags();

            // Refresh the DataTable
            tagTable.ajax.reload();
        });
    } else {
        alert('You cannot submit an empty tag.');
    }
}

/**
 * @function AddTagsToMedia
 * @description Adds tags to the media item currently being viewed.
 */
function AddTagsToMedia() {
    // Get the tags from the input
    const tagsInput = $('#add_tag');
    const tags = tagsInput.val();

    // Initialize variables
    let itemID, itemURL;

    // Check page type and set itemID and itemURL accordingly
    if (PAGE_TYPE === PAGE_IMAGES) {
        itemID = $('#tag-image').data('id');
        itemURL = $('#tag-image').prop('src');
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        itemID = $('#tag-video').data('id');
        itemURL = $('#tag-video').prop('src');
    }

    // Set item MD5 hash
    const itemHash = $('#hash-display').html().replace('MD5 Hash: ', '');

    // Add the tags to the item
    addTagsToItem(itemID, tags).then(() => {
        // Clear existing tags
        $('#tag-list').empty();

        // Get the new tags
        RenderPageMediaTags(itemID, itemURL, itemHash);

        // Refresh Tag List Globally in case of new tags
        RefreshTags();
    });

    // Clear Tags Input
    tagsInput.val('');
}

/**
 * @function RemoveTagFromMedia
 * @description Removes a tag from the media item currently being viewed.
 * @param {number} tagID 
 */
function RemoveTagFromMedia(tagID) {
    // Initialize variables
    let itemID, itemURL;

    // Check page type and set itemID and itemURL accordingly
    if (PAGE_TYPE === PAGE_IMAGES) {
        itemID = $('#tag-image').data('id');
        itemURL = $('#tag-image').prop('src');
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        itemID = $('#tag-video').data('id');
        itemURL = $('#tag-video').prop('src');
    }

    // Set item MD5 hash
    const itemHash = $('#hash-display').html().replace('MD5 Hash: ', '');

    removeTagFromItem(itemID, tagID).then(() => {
        // Clear existing tags
        $('#tag-list').empty();

        // Get the new tags
        RenderPageMediaTags(itemID, itemURL, itemHash);
    });
}

/**
 * @function OpenModal
 * @description Opens a modal with the specified name.
 * @param {string} modalID 
 */
function OpenModal(modalID) {
    const modal = $(`#${modalID}`);
    modal.addClass('is-active');
}

/**
 * @function CloseModal
 * @description Opens a modal with the specified name.
 * @param {string} modalID 
 */
function CloseModal(modalID = null) {
    let modal, modals;
    if (modalID !== null) {
        modal = $(`#${modalID}`);
        modal.removeClass('is-active');
    } else {
        modals = $('.modal');
        modals.each(function () {
            $(this).removeClass('is-active');
        });
    }
}

/**
 * @function RefreshTags
 * @description Refreshes the tags by fetching them from the API and updating the tag list.
 */
function RefreshTags() {
    getTags().then((tags) => {
        ALL_TAGS = tags;
        setTagList(ALL_TAGS);
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
    } else if (PAGE_TYPE === PAGE_IMAGES) {
        title = `${PAGE_TITLE} - Images`;
    } else if (PAGE_TYPE === PAGE_TAGS) {
        title = `${PAGE_TITLE} - Tags`;
    } else {
        title = PAGE_TITLE;
    }

    // Set Title
    document.title = title;
    $('#gallery-title').html(title);
}

/**
 * @function setTagList
 * @description Sets the tag list for the datalist elements.
 * @param {Array} tagsList 
 */
function setTagList(tagsList) {
    const tagLists = $('.datalist-for-tags');

    // Setup the Tag Lists
    tagLists.each(function () {
        // Empty the list
        $(this).empty();

        // Add the Tags
        tagsList.forEach(tag => {
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

/**
 * @function removeTagFromItem
 * @description Removes a tag from a specific image or video.
 * @async
 * @param {number} itemID 
 * @param {number} tagID 
 * @returns {Promise} A promise that resolves to the updated tags for the item.
 */
async function removeTagFromItem(itemID, tagID) {
    let apiLink;

    if (PAGE_TYPE === PAGE_IMAGES) {
        apiLink = `${API_BASE_URL}/tags/image/remove/`;
    } else if (PAGE_TYPE === PAGE_VIDEOS) {
        apiLink = `${API_BASE_URL}/tags/video/remove/`;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    try {
        const response = await fetch(apiLink, {
            method: 'PATCH',
            body: JSON.stringify({'item_id': itemID, 'tag_id': tagID}),
            headers: myHeaders,
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error removing tag from item:', error);
    }
}

/**
 * @function addTag
 * @description Adds a new tag to the database.
 * @async
 * @param {string} tagName The name of the tag to add.
 * @param {number} tagCategory The category ID of the tag.
 * @returns {Promise} A promise that resolves to true on success.
 */
async function addTag(tagName, tagCategory) {
    const apiLink = `${API_BASE_URL}/tags/add/`;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    try {
        const response = await fetch(apiLink, {
            method: 'POST',
            body: JSON.stringify({'tag_name': tagName, 'category_id': tagCategory}),
            headers: myHeaders,
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error adding tag:', error);
    }
}

/**
 * @function editTag
 * @description Edits an existing tag in the database.
 * @async
 * @param {number} tagID The ID of the tag to edit.
 * @param {string} tagName The new name of the tag.
 * @param {number} tagCategory The new category ID of the tag.
 * @returns {Promise} A promise that resolves to true on success.
 */
async function editTag(tagID, tagName, tagCategory) {
    const apiLink = `${API_BASE_URL}/tags/edit/${tagID}/`;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    try {
        const response = await fetch(apiLink, {
            method: 'PUT',
            body: JSON.stringify({'tag_name': tagName, 'category_id': tagCategory}),
            headers: myHeaders,
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error editing tag:', error);
    }
}