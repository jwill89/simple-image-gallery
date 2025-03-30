$(document).ready(function () {
    // Initialize
    GalleryInit();

    // Set the Title
    SetGalleryTitle();

    // Generate Default Content (Image Page)
    GalleryContent();

    // Bind Element Events
    GalleryBindings();
});

// Constants
const PAGE_IMAGES = 1;
const PAGE_VIDEOS = 2;
const API_LINK = '/api';

// Initialize the Page
function GalleryInit()
{

    // Check for the page in session storage
    if (!window.sessionStorage.CurrentPage || window.sessionStorage.CurrentPage === 'undefined') {
        window.sessionStorage.CurrentPage = JSON.stringify(1);
    }

    // Check for the page type
    if (!window.sessionStorage.PageType || window.sessionStorage.PageType === 'undefined') {
        window.sessionStorage.PageType = JSON.stringify(PAGE_IMAGES);
    }

    // Check for the view all indicator
    if (!window.sessionStorage.ViewAll || window.sessionStorage.ViewAll === 'undefined') {
        window.sessionStorage.ViewAll = JSON.stringify(false);
    }

    // Check for the current tags
    if (!window.sessionStorage.CurrentTags || window.sessionStorage.CurrentTags === 'undefined') {
        window.sessionStorage.CurrentTags = JSON.stringify([]);
    }

    // Page Title
    $.ajax({
        url: API_LINK + '/pages/title/',
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            window.sessionStorage.PageTitle = result;
            document.title = result;
        }
    });
}

// Create Page
function GalleryContent()
{

    let contentDiv = $('#content-display');
    let totalSpan = $('#total');
    let content = "";
    let apiLink = "";
    let ViewAll = JSON.parse(window.sessionStorage.ViewAll);
    let PageType = JSON.parse(window.sessionStorage.PageType);
    let CurrentPage = JSON.parse(window.sessionStorage.CurrentPage);
    let totalAPI = "";

    if (PageType === PAGE_IMAGES) {
        // Total Images
        totalAPI = "/images/total/";
        $.ajax({
            url: API_LINK + totalAPI,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                totalSpan.html(result);
            }
        });

        if (ViewAll === false) {
            apiLink = "/images/page/" + CurrentPage + "/";
        } else {
            apiLink = "/images/";
        }
        $.ajax({
            url: API_LINK + apiLink,
            type: 'GET',
            dataType: 'json',
            success: function (results) {
                content += "" +
                    "<div class='column is-full is-align-content-end'>" +
                    "   <div class='parent'>";

                results.forEach((image) => {
                    content += "" +
                        "<div class='is-flex is-align-self-flex-end'>" +
                        "   <div class='card child has-border-white'>" +
                        "       <div class='card-content has-text-centered has-background-grey-darker'>" +
                        "           <figure class='image'>" +
                        "               <img alt='' src=\"images/thumbs/" + image.filename + "\" />" +
                        "           </figure>" +
                        "       </div>" +
                        "       <footer class='card-footer has-background-light'>" +
                        "           <a href=\"images/full/" + image.filename + "\" class='card-footer-item' data-lightbox=\"page-images\" data-title=\"Tags List Coming Soon\">" +
                        "               <span class='icon has-text-info-dark'>" +
                        "                   <i class='fa-solid fa-magnifying-glass-plus' title='Zoom In'></i>" +
                        "               </span>" +
                        "           </a>" +
                        "           <a href=\"images/full/" + image.filename + "\" target='_blank' class='card-footer-item'>" +
                        "               <span class='icon has-text-info-dark'>" +
                        "                   <i class='fa-solid fa-up-right-from-square' title='View Full Size'></i>" +
                        "               </span>" +
                        "           </a>" +
                        "           <a href='#' data-id='" + image.id + "' class='card-footer-item'>" +
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

                contentDiv.html(content).show();

                // Generate Pagination if not viewing all
                if (ViewAll === false) {
                    GalleryPagination();
                }

            }
        });
    } else if (PageType === PAGE_VIDEOS) {
        // Total Videos
        totalAPI = "/videos/total/";
        $.ajax({
            url: API_LINK + totalAPI,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                totalSpan.html(result);
            }
        });

        if (ViewAll === false) {
            apiLink = "/videos/page/" + CurrentPage + "/";
        } else {
            apiLink = "/videos/";
        }
        $.ajax({
            url: API_LINK + apiLink,
            type: 'GET',
            dataType: 'json',
            success: function (results) {
                content += "" +
                    "<div class='column'>" +
                    "   <div class='parent'>";

                results.forEach((video) => {
                    let thumbnail = video.filename.split('.').slice(0, -1).join('.') + '.jpg';
                    content += "" +
                        "   <div class='card child'>" +
                        "       <div class='card-image'>" +
                        "           <a href=\"videos/full/" + video.filename + "\" data-lightbox=\"page-videos\" data-title=\"<a href='videos/full/" + video.filename + "' target='_blank'>View Video in New Tab</a>\">" +
                        "           <img alt='' src=\"videos/thumbs/" + thumbnail + "\" /></a>" +
                        "       </div>" +
                        "       <footer class='card-footer'>" +
                        "           <a href='#' data-id='" + video.id + "' class='card-footer-item' style='padding:.1rem;'>Add Tags</a>" +
                        "       </footer>" +
                        "   </div>";
                });

                content += "" +
                    "   </div>" +
                    "</div>" +
                    "<br/><br/>";

                // Generate Pagination if not viewing all
                if (ViewAll === false) {
                    GalleryPagination();
                }

                contentDiv.html(content).show();

            }
        });
    }
}

function GalleryPagination()
{
    let topDiv = $('#pagination-top');
    let bottomDiv = $('#pagination-bottom');
    let pagination = "";
    let PageType = JSON.parse(window.sessionStorage.PageType);
    let CurrentPage = JSON.parse(window.sessionStorage.CurrentPage);
    let NextPage = CurrentPage + 1;
    let LastPage = CurrentPage - 1;
    let TotalPages = 0;
    
    let apiLink = "";

    if (PageType === PAGE_VIDEOS) {
        apiLink = '/pages/videos/';
    } else {
        apiLink = '/pages/images/';
    }

    $.ajax({
        url: API_LINK + apiLink,
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            TotalPages = result;

            // Start Pagination
            pagination = "<nav class='pagination is-centered' role='navigation' aria-label='pagination'>"

            // Do we have an enabled previous page? (Page > 1)
            if (CurrentPage > 1) {
                pagination += "<a href='#' id='page-prev' class='pagination-previous'>Previous</a>";
            } else {
                pagination += "<a class='pagination-previous' disabled>Previous</a>";
            }

            // Do we have an Enabled Next page? (Page < Total Pages)
            if (CurrentPage < TotalPages) {
                pagination += "<a href='#' id='page-next' class='pagination-next'>Next</a>";
            } else {
                pagination += "<a class='pagination-next' disabled>Next</a>";
            }

            // Continue Pagination
            pagination += "<ul class='pagination-list'>";

            // Add Page 1 and Ellipses if We're on page 3 or more
            if (CurrentPage >= 3) {
                pagination += "<li><a href='#' data-page='1' class='pagination-link' aria-label='Goto page 1'>1</a></li>";
                pagination += "<li><span class='pagination-ellipsis'>&hellip;</span></li>";
            }

            // Previous Page if page > 1
            if (CurrentPage >= 2) {
                pagination += "<li><a href='#' data-page='" + LastPage + "' class='pagination-link' aria-label='Goto page " + LastPage + "'>" + LastPage + "</a></li>"
            }

            // Current Page
            pagination += "<li><a class='pagination-link is-current' aria-label='Page " + CurrentPage + "' aria-current='page'>" + CurrentPage + "</a></li>"

            // Next Page if Page < Total Pages
            if (CurrentPage < TotalPages) {
                pagination += "<li><a href='#' data-page='" + NextPage + "' class='pagination-link' aria-label='Goto page " + NextPage + "'>" + NextPage + "</a></li>"
            }

            // Add Ellipses and Last Page if We're on last page - 2
            if (CurrentPage <= (TotalPages - 2)) {
                pagination += "<li><span class='pagination-ellipsis'>&hellip;</span></li>";
                pagination += "<li><a href='#' data-page='" + TotalPages + "' class='pagination-link' aria-label='Goto page " + TotalPages + "'>" + TotalPages + "</a></li>"
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

        }
    });

}

// Bind Buttons
function GalleryBindings()
{
    // Pagination Links
    $('.pagination-link').off('click').on('click', function (event) {
        window.sessionStorage.CurrentPage = $(this).data('page');
        GalleryContent();
    });

    $('.pagination-next').off('click').on('click', function (event) {
        window.sessionStorage.CurrentPage = JSON.parse(window.sessionStorage.CurrentPage) + 1;
        GalleryContent();
    });

    $('.pagination-previous').off('click').on('click', function (event) {
        window.sessionStorage.CurrentPage = JSON.parse(window.sessionStorage.CurrentPage) - 1;
        GalleryContent();
    });

    // Main Links
    $('#view-images-link').off('click').on('click', function (event) {
        if (JSON.parse(window.sessionStorage.PageType) === PAGE_VIDEOS) {
            window.sessionStorage.CurrentPage = 1;
        }
        window.sessionStorage.ViewAll = false;
        window.sessionStorage.PageType = PAGE_IMAGES;
        GalleryContent();
    });

    // Main Links
    $('#view-all-images-link').off('click').on('click', function (event) {
        if (JSON.parse(window.sessionStorage.PageType) === PAGE_VIDEOS) {
            window.sessionStorage.CurrentPage = 1;
        }
        window.sessionStorage.ViewAll = true;
        window.sessionStorage.PageType = PAGE_IMAGES;
        GalleryContent();
    });

    $('#view-videos-link').off('click').on('click', function (event) {
        if (JSON.parse(window.sessionStorage.PageType) === PAGE_IMAGES) {
            window.sessionStorage.CurrentPage = 1;
        }
        window.sessionStorage.ViewAll = false;
        window.sessionStorage.PageType = PAGE_VIDEOS;
        GalleryContent();
    });

    // Main Links
    $('#view-all-videos-link').off('click').on('click', function (event) {
        if (JSON.parse(window.sessionStorage.PageType) === PAGE_IMAGES) {
            window.sessionStorage.CurrentPage = 1;
        }
        window.sessionStorage.ViewAll = true;
        window.sessionStorage.PageType = PAGE_VIDEOS;
        GalleryContent();
    });
}
function SetGalleryTitle()
{
    let title = window.sessionStorage.PageTitle;
    let PageType = JSON.parse(window.sessionStorage.PageType);

    if (PageType === PAGE_VIDEOS) {
        title += ' - Videos';
    } else {
        title += ' - Images';
    }

    document.title = title;
}
