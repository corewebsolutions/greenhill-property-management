document.addEventListener("DOMContentLoaded", function() {

  if (localStorage.authToken == null) {
    //run code if they are not logged in
    alert("You are not logged in");
    window.location.href = "/app/login";
  } else {
    authUser();
  }

});

/* Main App */

function initializeApp() {

  $('.modal__block').hide();
  /* --- Store Base URL ---*/

  /* Populate User Global Info */
  var firstName = localStorage.getItem('firstName');
  $('[data="first_name"]').text(firstName);

/* Global Ajax Errors Handling */
$(document).ajaxError(function(event, jqXHR, settings, thrownError) {
  // Handle the error here
  console.log("An AJAX error occurred:");
  console.log("Event:", event);
  console.log("XHR Object:", jqXHR);
  console.log("Settings:", settings);
  console.log("Error:", thrownError);

  // Retrieve the error code and response text
  var errorCode = jqXHR.status;
  var errorMessage = jqXHR.responseText; // assuming your API sends the error in the responseText

  // If the API response is JSON and you want to parse it
  try {
    var responseJson = JSON.parse(jqXHR.responseText);
    errorMessage = responseJson.message || responseJson.error || errorMessage; // Customize depending on your API response
  } catch (e) {
    // responseText wasn't JSON, use the raw responseText
  }

  // Check if the error is a 401 Unauthorized
  if (errorCode === 401 && errorMessage.includes("The token expired")) {
    // Redirect to the login page
    alert('Session Expired');
    window.location.href = '/app/login'; // Update '/login' to your login page URL
    localStorage.clear(); // clear local storage
  } else {
    // For all other errors, concatenate and alert the error code with the error message
    alert("Error " + errorCode + ": " + errorMessage);
  }
});


  /* ---  log out func ---- */
  $(".logout_button").on("click", function () {
    // Clear all local storage
    localStorage.clear();

    // Redirect user to /app/login
    window.location.href = "/app/login";
  });

  loadCurrentPage();
  urlRouting();
  userRoleInterface();
  loadUsersInFormSelectFields();



  /* ---- Modal Functionality ----- */

  $(document).on('click', '[element="modal"]', function() {
    // Show the .modal_block element and hide its children
    $('.modal__block').show().children().hide();
    
    // Read the modal attribute value from the clicked element
    var modalValue = $(this).attr('modal');
  
    // Show the modal with the corresponding ID
    $('#' + modalValue).show();
  });


  // close modal functionality
  $('.inverse-cta-bttn').on('click', function() {

    $('.modal__block').css('display', 'none');      // Hide .modal__block
    $('.modal__block').children().hide();           // Hide all children of .modal__block
  });

  
  /* -------- Element Dynamic Visibility ------- */

  if (localStorage.userRole === 'Admin') {
    $('[dynamic-visibility=admin-hidden]').remove();
  }

  if (localStorage.userRole === 'Employee') {
    $('[dynamic-visibility=employee-hidden]').remove();
  }

  if (localStorage.userRole === 'Landlord') {
    $('[dynamic-visibility=landlord-hidden]').remove();
  }

  if (localStorage.userRole === 'Tenant') {
    $('[dynamic-visibility=tenant-hidden]').remove();
  }

  if (localStorage.userRole === 'Employee' || localStorage.userRole === 'Landlord'|| localStorage.userRole === 'Tenant') 
      $('[dynamic-visibility=admin-only]').remove();
  
}

/* Utlity Functions */

function authUser() {

  const xanoBaseUrl = "https://xs9h-ivtd-slvk.n7c.xano.io/";
  localStorage.setItem('baseUrl', xanoBaseUrl);

  $.ajax({
    url: localStorage.baseUrl + "api:2yadJ61L/auth/me",
    type: "GET",
    headers: {
      'Content-Type': "application/json",
      'Authorization': "Bearer " + localStorage.authToken
    },
    success: function (data) {

      initializeApp();
    },
    error: function (error) {
      window.location.href = "/app/login";
    }
  });
}

function urlRouting() {
  

  /* This function updates the url, and saves the current page of the user as they browse */

  // get all the nav links
  let navLinks = Array.from(
    document.getElementsByClassName("main-tabs__button")
  ); //create an array to get all nav links

  // loop through each nav item
  navLinks.forEach((navLink) => {
    let navLinkId = navLink.id; // store the id of each nav link

    // click handler for nav links...
    navLink.addEventListener("click", (e) => {
      let adminPath = "/app/" + navLinkId; // add "/admin/" before the nav link ID
      history.pushState(navLinkId, null, adminPath); // log the click history of each nav link
      localStorage.setItem("pageId", navLinkId); // update page id storage
      $(".main-tabs__button").removeClass("active-tab");
      $(navLink).addClass("active-tab"); // Use `navLink` instead of `this` to add the active class
    });
  });

  /* monitor user click history pop state */

  window.addEventListener("popstate", function (event) {
    var path = window.location.pathname; // store the current URL path

    // click on the corresponding view every back button click
    var view = event.state; // store the state in a 'view'

    if (view) {
      // If there's a state, update pageId in local storage
      localStorage.setItem("pageId", view);
      $("#" + view).click(); // click on the corresponding view on state change
    }
  });
}

function loadCurrentPage() {

  /* This function loads the correct screen if the user refreshes a page */
  let currentPage = localStorage.getItem("pageId");
  setTimeout(() => {
    $("#" + currentPage).click(); // open tab of page id
    history.pushState(currentPage, null, "/app/" + currentPage); // log history and update url

    // Check if the currentPage is "profile," "property," or "unit"
    if (["profile", "property", "unit"].includes(currentPage)) {
      // Get the value from local storage
      let pageRefreshParam = localStorage.getItem("pageRefreshParam");

      // Add the URL parameter to the history
      history.pushState(
        currentPage,
        null,
        "/app/" + currentPage + "?id=" + pageRefreshParam
      );
    }
  }, 100);


}

function userRoleInterface () {

  /* ----- This function updates the user interface depending on which user type is logged in */
  //--------------------------------------------------------------------------------------------

  // Get the user role from local storage


  let userRole = localStorage.userRole;

  // Update Nav Links
  if (userRole === 'Admin' || userRole ==='Employee') {
  
    // remove the nav links, not associated with the admins or employees
    $('#dashboard').remove();
    $('#my-profile').remove();
    $('#pay-rent').remove();

    } else if (userRole === 'Landlord') { 

      // remove the nav links, not associated with the landlords   
      $('#users').remove();
      $('#create-user').remove();
      $('#my-profile').remove();
      $('#pay-rent').remove();
      $('.top-nav__menu').remove();
      $('.top-nav__menu-drawer').remove();

    } else if (userRole === 'Tenant') {

      // remove the nav links, not associated with the Tenants
      $('#dashboard').remove();
      $('#users').remove();
      $('#create-user').remove();
      $('#properties').remove();
      $('#property').remove();
      $('#unit').remove();
      $('#profile').remove();
      $('#legal').remove();
      $('.top-nav__menu').remove();
      $('.top-nav__menu-drawer').remove();
      $('#calendar').remove();
      
    }


 }

function loadUsersInFormSelectFields(){

// Make API Call
$.ajax({

url: localStorage.baseUrl + "api:aJp1AxHb/select_users_property_form",
type: "GET",
data: {},
success: function (response) {
  
    /* Populate Landlord Select Field */
    // Clear previous options in the select field
    $('[select-field=landlords]').empty();

    // Add the placeholder to the select field
    $('[select-field=landlords]').append(
      $("<option>", {
        value: "",
        text: "Select a Landlord",
        selected: true,
        disabled: true
      })
    );

    // Loop through each landlord in the response
    $.each(response.landlords, function (index, landlord) {
        // Create the option text
        var optionText = landlord.first_name + " " + landlord.last_name;

        // Append the new option to the select field
        $('[select-field=landlords]').append(
          $("<option>", {
            value: landlord.id,
            text: optionText
          })
        );
    });


    /* Populate Employee Select Field */
    // Clear previous options in the select field
    $('[select-field=employees]').empty();

    // Add the placeholder to the select field
    $('[select-field=employees]').append(
      $("<option>", {
        value: "",
        text: "Select an Employee",
        selected: true,
        disabled: true
      })
    );

    // Loop through each landlord in the response
    $.each(response.employees, function (index, employee) {
        // Create the option text
        var optionText = employee.first_name + " " + employee.last_name;

        // Append the new option to the select field
        $('[select-field=employees]').append(
          $("<option>", {
            value: employee.id,
            text: optionText
          })
        );
      });

},
complete: function() {

  $('.loader').hide();

},
error: function (error) {

}
}); 

}

function formatDateToCustomFormat(dateString) {

  const dateObj = new Date(dateString);

  // Ensure the date is treated as UTC
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');  // +1 because months are 0-based
  const year = String(dateObj.getUTCFullYear()).slice(-2);  // Last two digits of the year

  // Get hours and minutes
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const amOrPm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12;  // If 0, make it 12

  return `${month}/${day}/${year} ${hours}:${minutes}${amOrPm}`;
}

function formatDateNoTime(dateString) {
  const dateObj = new Date(dateString);

  // Ensure the date is treated as UTC
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');  // +1 because months are 0-based
  const year = String(dateObj.getUTCFullYear()).slice(-2);  // Last two digits of the year

  return `${month}/${day}/${year}`;
}