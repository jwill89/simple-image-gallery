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

    // Bind Element Events
    NavigationBindings();

    // Generate Default Content
    GalleryContent();
});

// Initialize the Page Data
function PageInit() {
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
}

// Create Page Test
function GalleryContent() {
    let gallerySection = $('#gallery-content');
    let galleryDisplay = $('#gallery-display');
    let galleryPromise;

    if (PAGE_TYPE === PAGE_IMAGES) {
        galleryPromise = getImagesForPage(CURRENT_PAGE);
    } else {
        galleryPromise = getVideosForPage(CURRENT_PAGE);
    }

    galleryPromise.then((items) => {

        // Create the Container
        // Column Div
        columnDiv = document.createElement('div');
        columnDiv.classList.add('column', 'is-full', 'is-align-content-end');

        // Parent Div
        parentDiv = document.createElement('div');
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
            flexDiv = document.createElement('div');
            flexDiv.classList.add('is-flex', 'is-align-self-flex-end');

            // Card Div
            cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'child', 'has-border-white');

            // Card Content Div
            cardContentDiv = document.createElement('div');
            cardContentDiv.classList.add('card-content', 'has-text-centered', 'has-background-grey-darker');

            // Card Figure
            cardFigureDiv = document.createElement('figure');
            cardFigureDiv.classList.add('image');

            // Card Figure Image- Thumbnail
            cardFigureImage = document.createElement('img');
            cardFigureImage.setAttribute('alt', '');
            cardFigureImage.setAttribute('src', thumbnail_path);

            // Card Footer
            cardFooterDiv = document.createElement('footer');
            cardFooterDiv.classList.add('card-footer', 'has-background-light');

            // Card Footer - Link - Lightbox
            cardFooterLinkLightbox = document.createElement('a');
            cardFooterLinkLightbox.classList.add('card-footer-item');
            cardFooterLinkLightbox.setAttribute('href', full_path);
            cardFooterLinkLightbox.setAttribute('data-lightbox', "page-items");
            cardFooterLinkLightbox.setAttribute('data-title', "Tags List Coming Soon");

            // Card Footer - Link - Lightbox - Span
            cardFooterLinkLightboxSpan = document.createElement('span');
            cardFooterLinkLightboxSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Lightbox - Span - Icon
            cardFooterLinkLightboxSpanIcon = document.createElement('i');
            cardFooterLinkLightboxSpanIcon.classList.add('fa-solid', 'fa-magnifying-glass-plus');
            cardFooterLinkLightboxSpanIcon.setAttribute('title', 'Zoom In');

            // Card Footer - Link - Full
            cardFooterLinkFull = document.createElement('a');
            cardFooterLinkFull.classList.add('card-footer-item');
            cardFooterLinkFull.setAttribute('href', full_path);
            cardFooterLinkFull.setAttribute('target', '_blank');
            cardFooterLinkFull.setAttribute('id', 'item-full-' + item_id);

            // Card Footer - Link - Full - Span
            cardFooterLinkFullSpan = document.createElement('span');
            cardFooterLinkFullSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Full - Span - Icon
            cardFooterLinkFullSpanIcon = document.createElement('i');
            cardFooterLinkFullSpanIcon.classList.add('fa-solid', 'fa-up-right-from-square');
            cardFooterLinkFullSpanIcon.setAttribute('title', 'View Full Size in New Tab');

            // Card Footer - Link - Tags
            cardFooterLinkTags = document.createElement('a');
            cardFooterLinkTags.classList.add('card-footer-item', 'link-tags-page');
            cardFooterLinkTags.setAttribute('data-id', item_id);

            // Card Footer - Link - Tags - Span
            cardFooterLinkTagsSpan = document.createElement('span');
            cardFooterLinkTagsSpan.classList.add('icon', 'has-text-info-dark');

            // Card Footer - Link - Tags - Span - Icon
            cardFooterLinkTagsSpanIcon = document.createElement('i');
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

function GalleryPagination() {
    let topDiv = $('#pagination-top');
    let bottomDiv = $('#pagination-bottom');
    let pagesPromise;

    if (PAGE_TYPE === PAGE_IMAGES) {
        pagesPromise = getTotalImagePages();
    } else {
        pagesPromise = getTotalVideoPages();
    }

    pagesPromise.then((result) => {
        let NextPage = CURRENT_PAGE + 1;
        let PreviousPage = CURRENT_PAGE - 1;
        let TotalPages = result;

        // Pagination - Navigation
        paginationTop = document.createElement('nav');
        paginationTop.className = 'pagination is-centered';
        paginationTop.setAttribute('role', 'navigation');
        paginationTop.setAttribute('aria-label', 'pagination');

        // Pagination - Navigation - Link - Previous
        previousLink = document.createElement('a');
        previousLink.innerHTML = 'Previous';

        // Do we have an enabled previous page? (Page > 1)
        previousLink.className = (CURRENT_PAGE > 1) ? 'pagination-previous' : 'pagination-previous is-disabled';

        // Pagination - Navigation - Link - Next
        nextLink = document.createElement('a');
        nextLink.innerHTML = 'Next';

        // Do we have an enabled next page? (Page < Total Pages)
        nextLink.className = (CURRENT_PAGE < TotalPages) ? 'pagination-next' : 'pagination-next is-disabled';

        // Pagination - Navigation - Links - Pages List
        pageNumberList = document.createElement('ul');
        pageNumberList.className = 'pagination-list';

        // Pagination - Navigation - Links - Pages List - Ellipsis
        listItemEllipsesEarly = document.createElement('li');
        listItemEllipsesSpan = document.createElement('span');
        listItemEllipsesSpan.className = 'pagination-ellipsis';
        listItemEllipsesSpan.innerHTML = '&hellip;';
        listItemEllipsesEarly.appendChild(listItemEllipsesSpan);
        listItemEllipsesLate = listItemEllipsesEarly.cloneNode(true);

        // Pagination - Navigation - Links - Pages List - List Element - 1
        listItemPage1 = document.createElement('li');
        listItemPage1Link = document.createElement('a');
        listItemPage1Link.className = 'pagination-link';
        listItemPage1Link.setAttribute('data-page', '1');
        listItemPage1Link.setAttribute('aria-label', 'Goto page 1');
        listItemPage1Link.innerHTML = '1';
        listItemPage1.appendChild(listItemPage1Link);

        // Pagination - Navigation - Links - Pages List - List Element - Previous
        listItemPagePrevious = document.createElement('li');
        listItemPagePreviousLink = document.createElement('a');
        listItemPagePreviousLink.className = 'pagination-link';
        listItemPagePreviousLink.setAttribute('data-page', PreviousPage);
        listItemPagePreviousLink.setAttribute('aria-label', 'Goto page ' + PreviousPage);
        listItemPagePreviousLink.innerHTML = PreviousPage;
        listItemPagePrevious.appendChild(listItemPagePreviousLink);

        // Pagination - Navigation - Links - Pages List - List Element - Current
        listItemPageCurrent = document.createElement('li');
        listItemPageCurrentLink = document.createElement('a');
        listItemPageCurrentLink.className = 'pagination-link is-current';
        listItemPageCurrentLink.setAttribute('data-page', CURRENT_PAGE);
        listItemPageCurrentLink.setAttribute('aria-label', 'Page ' + CURRENT_PAGE);
        listItemPageCurrentLink.setAttribute('aria-current', 'page');
        listItemPageCurrentLink.innerHTML = CURRENT_PAGE;
        listItemPageCurrent.appendChild(listItemPageCurrentLink);

        // Pagination - Navigation - Links - Pages List - List Element - Next
        listItemPageNext = document.createElement('li');
        listItemPageNextLink = document.createElement('a');
        listItemPageNextLink.className = 'pagination-link';
        listItemPageNextLink.setAttribute('data-page', NextPage);
        listItemPageNextLink.setAttribute('aria-label', 'Goto page ' + NextPage);
        listItemPageNextLink.innerHTML = NextPage;
        listItemPageNext.appendChild(listItemPageNextLink);

        // Pagination - Navigation - Links - Pages List - List Element - Last
        listItemPageLast = document.createElement('li');
        listItemPageLastLink = document.createElement('a');
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
        paginationBottom = paginationTop.cloneNode(true);

        // Check to see if we have the elements
        topDiv.empty().append(paginationTop);
        bottomDiv.empty().append(paginationBottom);

        // Bind Pagination Links
        PaginationBindings();
    });
}

function TagContent() {
    // TODO:: This function
}

function ImageTagContent(image_id) {
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

// Bind Navigation
function NavigationBindings() {
    // Navbar Mobile Burger Menu Toggle
    $('#nav_burger').on('click', function (event) {
        $('#nav_burger').toggleClass('is-active');
        $(".navbar-menu").toggleClass("is-active");
    });

    // Main Links - Images
    $('#view-images-link').on('click', function (event) {
        if (PAGE_TYPE === PAGE_VIDEOS) {
            CURRENT_PAGE = 1;
        }
        VIEW_ALL = false;
        PAGE_TYPE = PAGE_IMAGES;
        GalleryContent();
    });

    $('#view-all-images-link').on('click', function (event) {
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

    // Tag Back - Back to Gallery
    $('#back-to-gallery').on('click', function (event) {
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

function GalleryBindings() {
    // Tag Links
    $('.link-tags-page').on('click', function (event) {
        let itemID = $(this).data('id');

        // Get Tags for Item
        getTagsForItem(itemID).then((tags) => {
            $('#tag-image').prop('src', $('#item-full-' + itemID).prop('href'));
            tags.forEach((tag) => {
                $('#tag-list').append("<span class='tag is-info'>" + tag.tag_name + "<button class='delete' data-id='" + tag.tag_id + "' aria-label='delete'></button></span> ");
            });
            $('#item-tags-content').removeClass('is-hidden');
            $('#gallery-content').addClass('is-hidden');
        });
    });
}

function PaginationBindings() {
    // Pagination Links
    $('.pagination-link').on('click', function (event) {
        CURRENT_PAGE = $(this).data('page');
        GalleryContent();
    });

    $('.pagination-next').on('click', function (event) {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE + 1;
            GalleryContent();
        }
    });

    $('.pagination-previous').on('click', function (event) {
        if ($(this).hasClass('is-disabled') === false) {
            CURRENT_PAGE = CURRENT_PAGE - 1;
            GalleryContent();
        }
    });
}

// Set the Page Title
function SetPageTitle() {
    let title = PAGE_TITLE

    if (PAGE_TYPE === PAGE_VIDEOS) {
        title += ' - Videos';
    } else {
        title += ' - Images';
    }

    document.title = title;
}

// Set the Tag List for Search
function setTagList(currentTags) {
    let tagLists = $('.datalist-for-tags');

    // Setup the Tag Lists
    tagLists.each(function () {
        // Empty the list
        $(this).empty();

        // Add the Tags
        currentTags.forEach(tag => {
            $(this).append("<option value='" + tag.tag_name + "'></option>");
        });
    });


}

// Async - Page Title
async function getPageTitle() {
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
async function getTags() {
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
async function getTotalImages() {
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
async function getTotalVideos() {
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
async function getTotalImagePages() {
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
async function getTotalVideoPages() {
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
async function getImagesForPage(page) {
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
async function getVideosForPage(page) {
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
async function getTagsForItem(itemID) {
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