let aircraftsObj = {
  "GreyL410УВПЭ3Siberia": {
    "name": "Grey L-410",
    "overPlaces": 18
  },
  "BlueL410УВПЭ3Ivanov": {
    "name": "Blue L-410",
    "overPlaces": 18
  },
  "TVS2МСRA07497": {
    "name": "TVS 07497",
    "overPlaces": 12
  }
  ,
  "AN-2": {
    "name": "AN-2",
    "overPlaces": 10
  },
  "": {
    "name": "NoName",
    "overPlaces": 0
  }
};

function getAircraftObj(planeName) {
    let norm = normalize(planeName);
    if (aircraftsObj.hasOwnProperty(norm)) {
        return aircraftsObj[norm];
    }
    return {
        "name": planeName,
        "overPlaces": 0
    }
}


function changeTab() {
  $(".loadsTab").toggle();
  $(".loadsPeo").toggle();
}

function ajaxLoads()
{
  var xhr = $.ajax({
    	url: 'ajax/getLoads.json?rnd='+Math.random().toString().substr(2, 8),
      // async: false,
      type: 'GET',
      dataType: 'json',
      beforeSend : function() {  
        let html = getTableCellItem("loading");
        // $("#flightSheduleTab").html(html);
        $("#loading").html(html);
        $("#loading").fadeIn("slow");
        $("#dateInfo span.topHeadDate").html(getDate("date"));
        $("#time span").html(getDate("time"));
        $("#timeTopHead span").html(getDate("time"));
      },
    	success: function(data) {
        $('.errorinfo').addClass("none");
    		// var tab = $("#flightSheduleTab");
    		$("#loading").fadeOut("slow");
    		if (data["loads"].length == 0)
    		{
          let html = getTableCellItem("noLoads");
          $("#flightSheduleTab").html(html);
          $("#flightSheduleTab td").fadeIn("slow");
          $("#dateInfo div").html("<span class=\"topHead topHeadDate\">" + getDate("date") + " " + "</span><span>0 flights</span>");
    		}
    		else
    		{
    			var html = "";
    			var sortedObj = sortObj(data["loads"]);
          var i;
          var countLoads = data["loads"].length;
          // var countLoads = sortedObj.length;

          var textCountLoads;
          switch (true) {
            case countLoads ===1:
              textCountLoads = countLoads + " flight";
              break;
            default:
              textCountLoads = countLoads + " flights";
          }

    			$("#dateInfo div").html("<span class=\"topHead\">" + getDate("date") + " " + "</span><span>" + textCountLoads + "</span>");
    			for(i = 0; i < countLoads; i++)
    			{
    				var ld = data["loads"][i];
            var objaircraft = getAircraftObj(ld["plane"]);
            // console.log("OBJ: " + objaircraft);
    				if (ld["freePlaces"] < 0) ld["freePlaces"] = 0;
            if (ld["date"].length === 0) ld["timeLeft"] = 999;
            if (!ld["timeLeft"]) ld["timeLeft"] = -999;
          html += getTableCellItem("info", objaircraft["name"], ld["number"], ld["timeLeft"], objaircraft["overPlaces"], ld["freePlaces"]);
    			}		
    		   	html = html + "</tbody></table>";
             $("#flightSheduleTab").html(html);
    		}       	
    	},
    	error: function() {
        $('.errorinfo').removeClass("none");
        // $('.errorinfo').toggleClass('error');
        var html = getTableCellItem("error");
        $("#flightSheduleTab").html(html);
      }

  });
  setTimeout(function() {xhr.abort();}, 2000);
  
}

/********************GET LIST PEOPLES IN BOARD**********************/


function ajaxPeople(boardNumber) {
  // let today = new Date();
  let formatDate = getDate();
  let xhr = $.ajax({
      url: 'ajax/getPeople_'+formatDate+'_'+boardNumber+'.json?rnd='+Math.random().toString().substr(2, 8),
      type: 'GET',
      // async: false,
      dataType: 'json',
      cache: false,
      beforeSend : function() {  
        let html = getTableCellItem("loading");
        $("#peopleSheduleTab").html('');
        $("#loading").html(html);
        $("#loading").fadeIn("slow");
      },
    	success: function(data) {
        $('.errorinfo').addClass("none");
        $("#loading").fadeOut("slow");
    		if (data["people"].length == 0)
    		{
          let html = "";
          html += getTableCellItem("noPeoples");
          $("#peopleSheduleTab").html(html);
          xhr = null;  
          changeTab();
          ajaxLoads();
          // let timerId = setTimeout(function() {changeTab(); ajaxLoads(); }, peopleLoadTime);
          // console.log("No people in board, timer 15 sec: " + timerId);
    		}
    		else
    		{
          let htmlLeft = "";
          let htmlRight = "";
          var countPeoples = data["people"].length;

              for(let i = 0; i < countPeoples; i++)
            {
              var ld = data["people"][i];
              if (i < 10) {
                htmlLeft += getTableCellItem("peoples",'','','','','', i + 1, ld["name"], ld["task"]);
              } else {
                htmlRight += getTableCellItem("peoples",'','','','','', i + 1, ld["name"], ld["task"]);
              }
            }	
            htmlRight += "</tbody></table>";
            if (countPeoples < 11) {
              $("#peopleSheduleTab").html(`<div class="d-flex width100 justify-content-center flex-grow-1"><font>Takeoff number ${boardNumber}</font></div><div class="flex-grow-1">${htmlLeft}</div>`);
            } else {
              $("#peopleSheduleTab").html(`<div class="d-flex width100 justify-content-center flex-grow-1"><font>Takeoff number ${boardNumber}</font></div><div class="flex-grow-1">${htmlLeft}</div><div class="flex-grow-1">${htmlRight}</div>`);
            }
        }       	 
    	},
    	error: function() {
        // $('.errorinfo').toggleClass('error');
        $('.errorinfo').removeClass("none");
        html = getTableCellItem("error");
        xhr = null;  
        changeTab();
        ajaxLoads();
      }
  });
  setTimeout(function() {xhr.abort();}, 2000); 
}

function getWeather()
{
  $.ajax({
    	url: 'http://192.168.1.4/weather.php',
      type: 'POST',
      dataType: 'json',
    	success: function(data) {
        console.log(`weather: ${data.temp}`);
      }
  });
}

function getTableCellItem(topic, ...other) {
  var html;

  var [plane, number, timeLeft, overPlaces, freePlaces, n, pName] = other;
  timeLeft = Number.parseInt(timeLeft);
  let normolizeTimeLeft = (timeLeft < 0) ? "Departed": `${timeLeft} min`;
  if(timeLeft === 999) {normolizeTimeLeft = "? min"}
  let normolizeFreePlaces = ((overPlaces - freePlaces) < 0) ? `free: ${freePlaces}`: `${overPlaces - freePlaces} / ${overPlaces}`;
  normolizeFreePlaces = (overPlaces == 0 && (overPlaces - freePlaces) == 0) ? "Full": normolizeFreePlaces;
  switch (topic)
  {
    case "info":
      html = `
      <div class="boardItem shadow d-flex justify-content-space-between padding-0_2em padding-0_1em" data-boardnumber="${number}">
        <div class="d-flex flex-direction-column flex0_1_auto11">
          <div class="bold">
            № ${number}
          </div>
          <div class="color-grey">
            ${plane}
          </div>
        </div>
        <div class="d-flex">
          <div class="imgSkydive">
            <img src="images/skydiving-man-icon.png">
          </div>
          <div class="d-flex flex-direction-column flex-end flex0_1_em11 width3_2em">
            <div class="color-grey">
              ${normolizeTimeLeft}
            </div>
            <div class="d-flex flex-align-items-center color-grey">
              ${normolizeFreePlaces}
            </div>
          </div>
        </div>
      </div>`;
      break;
    case "peoples":
      html = `
      <div class="boardItem shadow d-flex padding-0_2em">
        <div class="d-flex width100">
          <div class="flex0_1_em bold"><font>${n}</font></div>
          <div class="flex0_1_auto"><font>${pName}</font></div>
        </div>
      </div>
      `;
      break;
    case "error":
      html = ` 
      <div class="d-flex justify-content-center flex1_1_auto flex-align-items-center flex-direction-column error-align-center ">
        <div><font class="font-size-5em">503</font></div>
        <div>Service Unavailable</div>
      </div>
      `;
      break;
    case "noLoads":
        html = `
        <div class="d-flex justify-content-center flex1_1_auto flex-align-items-center flex-direction-column error-align-center ">
          <div><font class="font-size-3em">No flights</font></div>
        </div>
        `;
        break;
    case "loading":
      html = `
      <div>
          <div class="dot-pulse"></div>
      </div>
      `;
      break;
    default:
      html = `
      <div class="d-flex justify-content-center flex1_1_auto flex-align-items-center flex-direction-column error-align-center ">
        <div><font class="font-size-3em">Flights is empty</font></div>
      </div>
      `;
      break;
  }
  
return html;
}

function getDate(dt) {
  var answer;
  var today = new Date();
  var dd = today.getDate();
  var dd0 = (dd < 10) ? "0" + dd : dd;
  var mm = today.getMonth() + 1;
  var mm0 = ((mm) < 10) ? "0" + mm : mm;
  var YYYY = today.getFullYear();
  var hh = today.getHours();
  var min = today.getMinutes();
  var MM = (min < 10) ? "0" + min : min;

  var  monthNames = ["", "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
        "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
      ];
  var  monthNamesAng = ["", "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
  var formatDate = dd + " " + monthNamesAng[mm] + " " + YYYY;
  var formatTime = hh + ":" +  MM;
  var dateToday = YYYY + "-" + mm0 + "-" + dd0;
  switch(dt) {
    case "date":
      answer = formatDate;
      break;
    case "time":
      answer = formatTime;
      break;
    default:
      answer = dateToday;
  }
  return answer;
}

function sortObj(arr) {
  return arr.sort((a, b) => (a.number > b.number) ? 1 : -1);
}

function normalize(name) {
  name = name.replace(/\s/g, '');
  return name;
}
/*/////////////////CLICK ON THE TABLO////////////////// */
$('#flightSheduleTab').on('click','.boardItem', function() {
    var id = $(this).get(0);
    var boardNumber = id.dataset.boardnumber;
    displayPeople(boardNumber)
});

function displayPeople(boardNumber) {
  ajaxPeople(boardNumber);
  changeTab();
};


$('.loadsPeo').on('click','', function() {
  changeTab();
});

function loadMessage(){
  $.ajax({
    url: '/ajax/message.json?rnd='+Math.random().toString().substr(2, 8) ,
    type:'get',
    datatype: 'json',
    success: function(data){
        showMessage(data);
    }
});
};

function showMessage(data) {
  let dateLeft = Number.parseInt(data.until);
  let today = new Date;
  let timeStamp = today.getTime() / 1000;
  if(data.msg.length === 0 || dateLeft < timeStamp) {
    $("#infoMessage").html('');
  } 
  if(data.msg.length !== 0 && dateLeft >= timeStamp) {
    $(".infoMessage").removeClass('bgColor-light-green');
    $(".infoMessage").addClass('bgColor-yellow');
    $("#infoMessage").html(data.msg);
  }
};