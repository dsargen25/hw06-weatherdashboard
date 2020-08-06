$(document).ready(function() {

  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    $("#search-value").val("");
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  const apiKey = "403783a695c1e4ff5ef575194d5b11f9";
  var dateTime = moment();

  function searchWeather(searchValue) {
	var weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
    $.ajax({
      type: "GET",
      url: weatherURL +searchValue +"&units=imperial&appid=" +apiKey,
      dataType: "json",
      success: function(data) {
      
        localStorage.getItem("history");
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
          makeRow(searchValue);
        }
        
        $("#today").empty();

        var city = data.name; 
        var currentWeather = $("<div>");
        currentWeather.append($("<div>").addClass("row"));
        currentWeather.append($("<h2>").html(city +" | " +dateTime.format("LL")),
          $("<img>").attr("src", "https://openweathermap.org/img/wn/" +data.weather[0].icon +"@2x.png"));
        currentWeather.append($("<p>").html("<b>Temperature:</b> " +data.main.temp +" °F"));
        currentWeather.append($("<p>").html("<b>Humidity:</b> " +data.main.humidity +"%"));
        currentWeather.append($("<p>").html("<b>Wind Speed:</b> " +data.wind.speed +" mph"));
        $("#today").append(currentWeather);
        $('#today').css('padding-bottom', '1em');
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        
      }
    });
  }
  
  function getForecast(searchValue) {
	forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
    $.ajax({
      type: "GET",
      url: forecastURL +searchValue +"&units=imperial&appid=" +apiKey,
      dataType: "json",
      success: function(data) {

        $("#forecast").empty();

        $("#forecast").append($("<h3>").html("5 Day Forecast"), 
          $("<div>").addClass("row").attr("id", "fiveday-row"));

        for (var i = 0; i < data.list.length; i++) {
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            var fivedayCol = $("<div>").addClass("col-xs-6");
            fivedayCol.append($("<p>").html(dateTime.add(1,"days").format("l")), 
              $("<img>").attr("src", "https://openweathermap.org/img/wn/" +data.list[i].weather[0].icon+ "@2x.png"), 
              $("<p>").html("Temperature: " +data.list[i].main.temp+ " °F"), 
              $("<p>").html("Humidity: " +data.list[i].main.humidity+ "%"));

            $("#fiveday-row").append(fivedayCol);

          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
	uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid=";
    $.ajax({
      type: "GET",
      url: uvIndexURL +apiKey + "&lat=" +lat +"&lon=" +lon,
      dataType: "json",
      success: function(data) {

        var uvindex = $("<p>").html("<b>UV Index:</b> "); 
        var uvIndicator = $("<span>").addClass("btn btn-sm").text(data.value);
        uvIndicator.removeAttr("style");
        if(data.value > 8){    
          uvIndicator.addClass("btn-danger");
        } else if(data.value > 3 ){
          uvIndicator.addClass("btn-warning");
        } else {
          uvIndicator.addClass("btn-success");
        }
        
        uvindex.append(uvIndicator);
        $("#today").append(uvindex);
      }
    });
  }

  var history = JSON.parse(window.localStorage.getItem("history")) || [];
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});