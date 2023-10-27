// PATH
const BLOGS_DATA_JSON_PATH = "./posts_data.json";

// DOM
const ALL_TOP_BUTTON_TAGS_CONTAINER_DOM = document.body.querySelector(
  ".all-top-button-tags-container"
);
const ALL_POSTS_CONTAINER_DOM = document.body.querySelector(
  ".all-posts-container"
);
const ADD_BUTTON_DOM = document.body.querySelector("#add-button");
const MIN_BUTTON_DOM = document.body.querySelector("#min-button");
const TOTAL_PAGE_NUMBER_DOM = document.body.querySelector(".total-page-number");
const PREV_BUTTON_DOM = document.body.querySelector("#prev-button");
const NEXT_BUTTON_DOM = document.body.querySelector("#next-button");
const PAGE_NUMBER_DOM = document.body.querySelector(".page-number");
const CURRENT_TAG_NAME_DOM = document.body.querySelector(".current-tag-name");

// SETTINGS
let postPerPageInt = 4;

// FUNCTIONALITIES
let openCloseLabelButtonsDomArray;
let allPostsArray; // need to wait for json to be fetched, then fill this with json content (array of array)
let allPostsDomArray; // need to wait for json to be fetched, build all DOM, then this exist. Fill it with DOM
let allChecksDomArray; // need to wait for json to be fetched, build all DOM, then this exist. Fill it with DOM
let isReading = false; // 2 states, some things are hidden during reading
let tags_set = new Set(); // to collect all possible tags when DOM is built

/**
 * after post DOM is created, the tags are created
 * index 0 tag will be set to current
 * based on the current tag, only certain post will be shown
 * those ones are added into this var
 * pagination will only manipulate this var when user click the prev / next button
 * selecting another tag will update this array
 */
let visiblePostDomArray = [];

// DATA -> UI
let pageNumberInt = 1;
let totalPageInt = 0;
let currentSelectedTagNameString = "";

/**
 * set TOTAL_PAGE_NUMBER_DOM.innerHTML with the postPerPageInt
 */
function updateTotalPageDom() {
  TOTAL_PAGE_NUMBER_DOM.innerHTML = `Posts per page: ${postPerPageInt}`;
}

/**
 * this adds the active class to the currently selected tag
 */
function addActiveClassToTagDom(tagButtonNameInnerHtml) {
  const TAG_BUTTON_DOM_ARRAY = Array.from(
    document.body.querySelectorAll(".tag-button")
  );

  TAG_BUTTON_DOM_ARRAY.map((oneTagButtonDom) => {
    oneTagButtonDom.classList.toggle(
      "active",
      oneTagButtonDom.innerHTML === tagButtonNameInnerHtml
    );
  });
}

/**
 * this is a helper because user have many ways to exit reading state:
 * - click the open/close label button again
 * - click one tag button
 */
function exitReadingState() {
  // update reading flag
  isReading = false;
  // show the page number, prev and next button
  PAGE_NUMBER_DOM.classList.remove("hide");
  PREV_BUTTON_DOM.classList.remove("hide");
  NEXT_BUTTON_DOM.classList.remove("hide");
  // show all the posts
  allPostsDomArray.forEach((post) => {
    post.classList.remove("hide");
    updatePostsPagination();
  });
}

/**
 * called by the onTagButtonDomClicked callback
 * clicking a tag also means exiting the reading state
 * this function uncheck all the posts and calls the exit reading state function
 */
function closeAllOpenedPost() {
  // iter all checkbox in dom
  allChecksDomArray.forEach((checkbox) => {
    // set checked to false
    checkbox.checked = false;
    // exit reading state
    exitReadingState();
  });
}

/**
 * set the CURRENT_TAG_NAME_DOM innerHTML with currentSelectedTagNameString
 */
function updatecurrentTagName() {
  CURRENT_TAG_NAME_DOM.innerHTML = `Current Tag: ${currentSelectedTagNameString}`;
}

/**
 * update total page with visiblePostDomArray.length and postPerPageInt
 * set PAGE_NUMBER_DOM.innerHTML with the pageNumberInt and totalPageInt
 */
function updatePageNumberDom() {
  totalPageInt = Math.ceil(visiblePostDomArray.length / postPerPageInt);
  PAGE_NUMBER_DOM.innerHTML = `${pageNumberInt}/${totalPageInt}`;
}

/**
 * slice the visiblePostDomArray with the pageNumberInt and postPerPageInt
 * show the posts in the sliced array
 */
function updatePostsPagination() {
  // update total page
  updatePageNumberDom();
  const START_INDEX_INT = (pageNumberInt - 1) * postPerPageInt;
  const END_INDEX_INT = START_INDEX_INT + postPerPageInt;
  const slicedVisiblePostDomArray = visiblePostDomArray.slice(
    START_INDEX_INT,
    END_INDEX_INT
  );
  // hide all first (the ones in visiblePostDomArray)
  visiblePostDomArray.forEach((onePostDom) => {
    onePostDom.classList.add("hide");
  });
  // show the sliced one
  slicedVisiblePostDomArray.forEach((onePostDom) => {
    onePostDom.classList.remove("hide");
  });
}

/**
 * update the pageNumberInt, then call updatePostsPagination()
 */
MIN_BUTTON_DOM.addEventListener("click", (event) => {
  event.stopPropagation();
  // prevent page from going out of bound
  if (postPerPageInt > 1) {
    // update pageNumberInt
    postPerPageInt--;
    updateTotalPageDom();
    // pageNumberInt updated, now show and hide the DOM in visiblePostDomArray
    updatePostsPagination();
  }
});

/**
 * update the pageNumberInt, then call updatePostsPagination()
 */
ADD_BUTTON_DOM.addEventListener("click", (event) => {
  event.stopPropagation();
  // update pageNumberInt
  postPerPageInt++;
  updateTotalPageDom();
  // pageNumberInt updated, now show and hide the DOM in visiblePostDomArray
  updatePostsPagination();
});

/**
 * update the pageNumberInt, then call updatePostsPagination()
 */
PREV_BUTTON_DOM.addEventListener("click", (event) => {
  event.stopPropagation();
  // prevent page from going out of bound
  if (pageNumberInt > 1) {
    // update pageNumberInt
    pageNumberInt--;
    // pageNumberInt updated, now show and hide the DOM in visiblePostDomArray
    updatePostsPagination();
  }
});

/**
 * update the pageNumberInt, then call updatePostsPagination()
 */
NEXT_BUTTON_DOM.addEventListener("click", (event) => {
  event.stopPropagation();
  // prevent page from going out of bound
  let totalPostsNumber = pageNumberInt * postPerPageInt;
  if (totalPostsNumber < visiblePostDomArray.length) {
    // update pageNumberInt
    pageNumberInt++;
    // pageNumberInt updated, now show and hide the DOM in visiblePostDomArray
    updatePostsPagination();
  }
});

/**
 * on tag button click callback (call this on first visit, make it as if the blogging button was clicked)
 */
function onTagButtonDomClicked(tagButtonNameInnerHtml) {
  // add active to current tag button
  addActiveClassToTagDom(tagButtonNameInnerHtml);
  // close any opened pages (clicking tag should be = clicking the open / close post button)
  closeAllOpenedPost();
  // update selected tag name
  currentSelectedTagNameString = tagButtonNameInnerHtml;
  updatecurrentTagName();
  // reset pageNumberInt
  pageNumberInt = 1;

  // collect the post id for posts that have the same tag with selected button
  let targetPostIdsArray = [];

  // iter allPostsDomArray
  allPostsArray.forEach((onePostArray) => {
    const onePostIdInt = onePostArray[0];
    const onePostTagArray = onePostArray[5];

    // iter onePostTagArray (one posts have multiple tags string)
    for (let i = 0; i < onePostTagArray.length; i++) {
      const oneTagString = onePostTagArray[i];

      // tag button inner html = one of this post tag?
      if (tagButtonNameInnerHtml === oneTagString) {
        // collect this post id and break to next post
        targetPostIdsArray.push(onePostIdInt);
        break;
      }
    }
  });

  // targetPostIdsArray filled now
  // iter allPostsDomArray
  allPostsDomArray.forEach((onePostDOM) => {
    // hide all first
    onePostDOM.classList.add("hide");
    // grab this post id
    const onePostDOMIDNumber = +onePostDOM.getAttribute("id");
    // iter targetPostIdsArray
    targetPostIdsArray.forEach((idNumber) => {
      // dom has same id as the collected one? show it
      if (idNumber === +onePostDOMIDNumber) {
        onePostDOM.classList.remove("hide");
      }
    });
  });
  // filtering is done here
  // some pages have hidden class
  // those that are not hidden - apply pagination on them
  // reset the array
  visiblePostDomArray = [];
  allPostsDomArray.forEach((onePostDOM) => {
    // find the ones not hidden, and fill the visiblePostDomArray
    if (onePostDOM.classList.contains("hide") === false) {
      visiblePostDomArray.push(onePostDOM);
    }
  });
  // visiblePostDomArray filled
  updatePostsPagination();
}

/**
 * onOpenClosePostLabelButtonClick callback
 * update reading flag
 * hides page num, prev and next button
 * hides the posts that is not being read
 * calls exitReadingState when state is not reading
 */
function onOpenClosePostLabelButtonClick(event) {
  // event target is a label, its for attribute points to a chackbox
  const LABEL_TARGET_ID_INT = event.target.getAttribute("for");
  // update reading flag
  isReading = !isReading;
  // reading?
  if (isReading) {
    // hide page number, next and prev button
    PAGE_NUMBER_DOM.classList.add("hide");
    PREV_BUTTON_DOM.classList.add("hide");
    NEXT_BUTTON_DOM.classList.add("hide");
    // iter all posts DOM
    allPostsDomArray.forEach((post) => {
      // post id != clicked label button id?
      const POST_ID_INT = post.getAttribute("id");
      if (LABEL_TARGET_ID_INT !== POST_ID_INT) {
        // hide the post
        post.classList.add("hide");
      }
    });
  } else {
    // not reading anymore?
    exitReadingState();
  }
}

/**
 * connect each open/close label button signal to onOpenClosePostLabelButtonClick callback
 */
function connectLabelButtonCloseOpenDom() {
  openCloseLabelButtonsDomArray.forEach((ONE_OPEN_CLOSE_LABEL_BUTTON_DOM) => {
    ONE_OPEN_CLOSE_LABEL_BUTTON_DOM.addEventListener("click", (event) => {
      event.stopPropagation();
      onOpenClosePostLabelButtonClick(event);
    });
  });
}

/**
 * return inner html for one post
 */
function createHtmlPost(
  ID_INT,
  TITLE_STR,
  FEATURED_IMAGE_PATH_STR,
  CONTENT_ARRAY,
  DATE_STR,
  TAG_ARRAY
) {
  // build the inner html
  let innerHTML = `<input class="toggle-checkbox" type="checkbox" id="${ID_INT}"><div id="${ID_INT}" class="post-container"><img class="featured-img" src=${FEATURED_IMAGE_PATH_STR} alt=""><div class="post-body-container"><h2>${TITLE_STR}</h2><p>${DATE_STR}</p><div class="post-tag-container">`;

  // building the tag content
  TAG_ARRAY.forEach((TAG_ITEM) => {
    innerHTML += `<button class="tag-button">${TAG_ITEM}</button>`;
  });
  innerHTML += `</div>`;

  // building the post content here
  innerHTML += `<label class="toggle-checkbox-label" for="${ID_INT}">Open / Close</label><div class="post-content-container">`;
  CONTENT_ARRAY.forEach((contentItemArray) => {
    const TYPE = contentItemArray[0];
    const CONTENT = contentItemArray[1];
    switch (TYPE) {
      case "h3":
        innerHTML += `<h3>${CONTENT}</h3>`;
        break;
      case "p":
        innerHTML += `<p>${CONTENT}</p>`;
        break;
      case "img":
        innerHTML += `<img src=${CONTENT} alt="">`;
        break;
      case "ul":
        innerHTML += `<ul>`;
        for (let i = 1; i < contentItemArray.length; i++) {
          const ITEM = contentItemArray[i];
          innerHTML += `<li>${ITEM}</li>`;
        }
        innerHTML += `</ul>`;
        break;
      case "ol":
        innerHTML += `<ol>`;
        for (let i = 1; i < contentItemArray.length; i++) {
          const ITEM = contentItemArray[i];
          innerHTML += `<li>${ITEM}</li>`;
        }
        innerHTML += `</ol>`;
        break;
    }
  });

  // close the post container and the post content container
  innerHTML += `</div></div></div>`;

  // content built
  return innerHTML;
}

/**
 * return inner html for all tags
 */
function createHtmlTag() {
  // convert set to array
  const TAGS_ARRAY = Array.from(tags_set);

  // build the inner html
  let innerHTML = ``;
  TAGS_ARRAY.forEach((oneTagString) => {
    innerHTML += `<button class="tag-button")">${oneTagString}</button>`;
  });
  // content built
  return innerHTML;
}

/**
 * callback once json is fetched
 * allPostsArray = array of array
 * Each post is an array
 */
function onJsonFetched() {
  // iter each posts
  allPostsArray.forEach((onePostArray) => {
    // what onePostArray looks like
    // [
    //   1,
    //   "Introduction to Blogging",
    //   "./images/red_hound.webp",
    //   [
    //     ["p", "Welcome to my blog!"],
    //     ["img", "./images/red_hound.webp"],
    //     ["ul", "item 1", "item 2", "item 3"],
    //     ["ol", "item 1", "item 2", "item 3"]
    //   ],
    //   "2023-11-01T09:00:00Z",
    //   ["blogging", "introduction"]
    // ]

    // unpack for readability
    const ID_INT = onePostArray[0];
    const TITLE_STR = onePostArray[1];
    const FEATURED_IMAGE_PATH_STR = onePostArray[2];
    const CONTENT_ARRAY = onePostArray[3];
    const DATE_STR = onePostArray[4];
    const TAG_ARRAY = onePostArray[5];

    // fill the html ALL_POSTS_CONTAINER_DOM
    const ONE_POST_HTML_TAG_STR = createHtmlPost(
      ID_INT,
      TITLE_STR,
      FEATURED_IMAGE_PATH_STR,
      CONTENT_ARRAY,
      DATE_STR,
      TAG_ARRAY
    );
    ALL_POSTS_CONTAINER_DOM.innerHTML += ONE_POST_HTML_TAG_STR;

    // collect all the possible tags (set datatype does not have duplicates)
    TAG_ARRAY.forEach((oneTagString) => {
      tags_set.add(oneTagString);
    });
  });

  // get all the checkbox DOM
  allChecksDomArray = document.body.querySelectorAll(".toggle-checkbox");

  // get all the open/close label button DOM
  openCloseLabelButtonsDomArray = document.querySelectorAll(
    ".toggle-checkbox-label"
  );

  // store all of the posts DOM
  allPostsDomArray =
    ALL_POSTS_CONTAINER_DOM.querySelectorAll(".post-container");

  // connect the label click signal
  connectLabelButtonCloseOpenDom();

  // tags_set are filled now, use it to build the top tag buttons DOM
  const ALL_TAGS_HTML_TAG_STR = createHtmlTag(tags_set);
  // fill the html ALL_TOP_BUTTON_TAGS_CONTAINER_DOM
  ALL_TOP_BUTTON_TAGS_CONTAINER_DOM.innerHTML = ALL_TAGS_HTML_TAG_STR; // store all tag buttons
  const ALL_TAG_BUTTONS_ARRAY = document.body.querySelectorAll(".tag-button"); // want to select the buttons on the posts too
  // connect the tag buttons click signal
  ALL_TAG_BUTTONS_ARRAY.forEach((oneTagButtonDom) => {
    const oneTagButtonNameInnerHtml = oneTagButtonDom.innerHTML;
    oneTagButtonDom.addEventListener("click", (event) => {
      event.stopPropagation();
      onTagButtonDomClicked(oneTagButtonNameInnerHtml);
    });
  });
  // call the callback manually to init the pages
  const FIRST_TAG = ALL_TAG_BUTTONS_ARRAY[0].innerHTML;
  onTagButtonDomClicked(FIRST_TAG);

  // update total page UI
  updateTotalPageDom();
}

// fetch json, once fetched call the callback onJsonFetched
fetch(BLOGS_DATA_JSON_PATH)
  .then((res) => {
    return res.json();
  })
  .then((receivedDataArray) => {
    allPostsArray = receivedDataArray;
    onJsonFetched();
  });
