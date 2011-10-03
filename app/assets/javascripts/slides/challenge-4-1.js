jQuery(function($) {

  var lesson = "4-1";

  question("Change the showFlights to use JSON, and use each / map to populate the table");
  // show JSON we're sending over

  // Tabbing and listing flights
  
  var fetchingFlights = null;

  function showFlights(active_div) {
    $("#tabs div").hide();
    if (fetchingFlights) {
      fetchingFlights.abort();
    }
    fetchingFlights = $.ajax('/flights.json', {  
      data: { date: active_div },
      cache: false, 
      beforeSend: function(result) {
        $('#tabs #loading').show();
      },
      complete: function(result) {
        $('#tabs #loading').hide();
        fetchingFlights = null;
      },
      success: function(flights) {
        $(active_div + ' tbody td').remove();
        
        // var rows = "";
        // $.each(flights, function(index, flight) {
        //   rows += "\
        //     <tr>\
        //       <td>" + flight.depart + "</td>\
        //       <td>" + flight.arrive + "</td>\
        //       <td>" + flight.flight + "</td>\
        //       <td>" + flight.routing + "</td>\
        //       <td><a href='#' data-flight='" + flight.flight + "' data-class='first_class'>" + flight.first_class + "</a></td>\
        //       <td><a href='#' data-flight='" + flight.flight + "' data-class='economy'>" + flight.economy + "</a></td>\
        //     </tr>";
        // });
        // $(active_div + ' tbody').html(rows);
        
        // Or we can use a map.
        var flight_rows = $.map(flights, function(flight) {
            return "<tr>" +
              "<td>" + flight.depart + "</td>" +
              "<td>" + flight.arrive + "</td>" +
              "<td>" + flight.flight + "</td>" +
              "<td>" + flight.routing + "</td>" +
              "<td><a href='#' data-flight='" + flight.flight + 
                "' data-class='first_class'>" + flight.first_class +
                "</a></td>" +
             "<td><a href='#' data-flight='" + flight.flight + 
               "' data-class='economy'>" + flight.economy + 
               "</a></td>" +
             "</tr>";
        });
        $(active_div + ' tbody').html(flight_rows.join(''));
        
        
        
        $('#tabs #error').hide();
        $(active_div).show();
      },
      error: function(result) {
        if (result.statusText != "abort") { 
          $('#tabs #error').show();
        }
      }
    });
  }

  function changeTab(e) {
    e.preventDefault();
    $("#tabs li a.active").removeClass("active").click(changeTab);
    $(e.target).addClass("active").unbind("click", changeTab);

    showFlights($(e.target).attr("href"));
  }

  // Tooltip methods
  
  function showNumberOfFlights(e) {
    var num_flights = $(e.target).data('flights');    
    $(e.target).append("<span class='tooltip'>"+ num_flights +" flights</span>");
    $("#tabs span.tooltip").delay(100).fadeIn();
  }

  function hideNumberOfFlights(a) {
    $("#tabs span.tooltip").stop().fadeOut(function(){ 
      $(this).remove(); 
    });
  }

  // Selecting a flight
  
  function selectFlight(e) {
    e.preventDefault();
    $("#tabs a.selected").removeClass('selected');
    $(e.target).toggleClass('selected');
    
    var flight = $(e.target).data('flight');
    var flightClass = $(e.target).data('class');
        
    $('#confirm').hide();
    
    $.ajax('/flights/' + flight, {
      data: { 'class': flightClass },
      dataType: 'json',
      success: showTotal
    });
  }
  
  function showTotal(json) {
    $('#price').text(json.price);
    $('#fees').text(json.fees);
    $('#total').text(json.total);
    $('#confirm').slideDown();
    $('#confirm').queue(function() {
      $(this).find("input[type=email]").focus();
      $(this).dequeue();
    });
  }
  
  // login and confirm button
  
  function login(e) {
    e.preventDefault();
    var form = $(e.target).serialize();
    
    $('#login').fadeOut();
    
    $.ajax('/login', {  
      data: form + "&lesson=3-5",
      dataType: 'script',
      type: 'post'
    });
  }
  
  
  // On load events to bind shit
    
  $("#tabs ul li a").bind({
    click: changeTab,
    mouseenter: showNumberOfFlights,
    mouseleave: hideNumberOfFlights
  });

  $("#tabs #error a").click(function (e){
    e.preventDefault();
    showFlights($("#tabs li a.active").attr("href"));
  });

  $("#tabs div").delegate('#flights a', 'click', selectFlight);
  $("#tabs ul li:eq(2) a").click();
  
  $('#confirm #login form').submit(login);
});