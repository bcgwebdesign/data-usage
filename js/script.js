var remaining = getCookie('remaining');
var allowance = getCookie('allowance');
var reserve = getCookie('reserve');
var renewDate = getCookie('renewDate');
var reserveChecked = (getCookie('reserveChecked')  === 'true');
console.log(typeof(reserveChecked));
console.log("reserve cookie=" + reserveChecked);

// for keeping the page refreshing.
var myLoop;
var loadLoopDelay = 6000;
var submitLoopDelay = 1000;

// page load thingummy
window.onload = function() {
    remaining = getCookie('remaining');
    allowance = getCookie('allowance');
    reserve = getCookie('reserve');
    renewDate = getCookie('renewDate');
    reserveChecked = (getCookie('reserveChecked')  === 'true');

    var frm_remaining = document.getElementById('remaining');
    var frm_allowance = document.getElementById('allowance');
    var frm_reserve = document.getElementById('reserve');
    var frm_renewDate = document.getElementById('renew-date');
    var frm_usingReserve = document.getElementById('using-reserve');

    frm_remaining.value = remaining;
    frm_allowance.value = allowance;
    frm_reserve.value = reserve;
    frm_renewDate.value = renewDate; 
      
    frm_usingReserve.checked = reserveChecked;
    console.log(typeof(reserveChecked));

    console.log("reserve=" + reserveChecked);
    // do the calcs once and then loop it
    do_calculations(remaining, allowance, reserve, renewDate, reserveChecked);
    myLoop = setInterval( function() { do_calculations(remaining, allowance, reserve, renewDate, reserveChecked); }, loadLoopDelay );    

  };

document.addEventListener('submit', function (e) {
  

    var frm_remaining = document.getElementById('remaining').value;
    var frm_allowance = document.getElementById('allowance').value;
    var frm_reserve = document.getElementById('reserve').value;
    var frm_renewDate = document.getElementById('renew-date').value;
    var frm_usingReserve = (document.getElementById('using-reserve').checked);
    
    console.log(typeof(frm_usingReserve), frm_usingReserve);
    
    setCookie('remaining',frm_remaining, 30);
    setCookie('allowance',frm_allowance, 30);
    setCookie('reserve',frm_reserve, 30);
    setCookie('renewDate',frm_renewDate, 30);
    if(frm_usingReserve) {
      usingReserveString = 'true';
    } else {
      usingReserveString = 'false';
    }
    setCookie('reserveChecked',usingReserveString, 30);

    // stop existing loop
    clearInterval(myLoop);  

    // do calc one and then loop it
    do_calculations(frm_remaining, frm_allowance, frm_reserve, frm_renewDate, frm_usingReserve);
    myLoop = setInterval( function() { do_calculations(frm_remaining, frm_allowance, frm_reserve, frm_renewDate, frm_usingReserve); }, submitLoopDelay );
    
    e.preventDefault();
});

function do_calculations(remaining, allowance, reserve, renewDate, reserveChecked) {
    var log = document.getElementById('log');

    renewDate = parseInt(renewDate);
    remaining = parseFloat(remaining);
    reserve = parseFloat(reserve);
    allowance = parseFloat(allowance);

    
    
    currentDate = new Date();  
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    if(day >= renewDate) {
        // started this month and renews next month 
        //console.log("day >= renewDate");
        fixedMonth = month + 1;
        fixedEndMonth = fixedMonth + 1;
        startDate = new Date(year + "-" + fixedMonth + "-" + renewDate);
        endDate = new Date(year + "-" + fixedEndMonth + "-" + renewDate);
        //console.log("startDate = " + startDate);
        //console.log("endDate = " + endDate);
    } else {        
        // started last month and renews this month
        console.log("day < renewDate");        
        fixedMonth = month;
        fixedEndMonth = fixedMonth + 1;
        startDate = new Date(year + "-" + fixedMonth + "-" + renewDate);
        endDate = new Date(year + "-" + fixedEndMonth + "-" + renewDate);
        //console.log("startDate = " + startDate);
        //console.log("endDate = " + endDate);
    }

    
    var totalRemaining = remaining + reserve;
    if (reserveChecked) {
      totalRemaining = remaining;
    }
    var used = allowance - remaining;
    var totalData = allowance + reserve;

    // how far gone into the month of data are we
    var goneMs = (currentDate - startDate);
    var goneMins = Math.round(goneMs/60000);
    var used_per_minute = (used * 1000) / goneMins;
    var used_per_hour = used_per_minute * 60;
    var used_per_day = used_per_hour * 24;  
    
    
    // how far until end of month
    var endMs = (endDate - currentDate);
    var endTotalMins = Math.round(endMs/60000);
    
    var endDays = Math.floor(endTotalMins / 60 / 24);
    var endHours = Math.floor((endTotalMins - (endDays * 24 * 60)) / 60 );
    var endMins = Math.floor(endTotalMins - (endHours * 60) - (endDays * 60 * 24) );  

    // and what should we aim for in the month on average
    var periodMs = (endDate - startDate);
    var periodMins = Math.round(periodMs/60000);
    var target_per_minute = (totalData * 1000) / periodMins;    
    var target_per_hour = target_per_minute * 60;
    var target_per_day = target_per_hour * 24;

    // calculate minutes left at current rate
    var remainingTotalMins = (totalRemaining * 1000) / used_per_minute;
    var remainingDays = Math.floor(remainingTotalMins / 60 / 24);
    var remainingHours = Math.floor((remainingTotalMins - (remainingDays * 24 * 60)) / 60 );
    var remainingMins = Math.floor(remainingTotalMins - (remainingHours * 60) - (remainingDays * 60 * 24) );
    
    // calculate when we will run out
    var runoutDateDiff = remainingTotalMins * 60000;
    var runoutDateMS = currentDate.getTime() + runoutDateDiff;
    var runoutDate = new Date(runoutDateMS);
    var runoutTime = formatTime(runoutDate);

    // and how much usage that should be
    var remaining_daily_target = (totalRemaining * 1000 ) / ((endTotalMins / 60 / 24));


    if (runoutDate < endDate) {
      var resultset = document.getElementById("resultset");
      resultset.classList.remove("underuse");
      resultset.classList.add("overuse");
    } else {
      var resultset = document.getElementById("resultset");
      resultset.classList.remove("overuse");
      resultset.classList.add("underuse");
    }

    // just to add the 00:00
    var endTime = formatTime(endDate);

    // how long without data will you have
    var noDataDate = endDate - runoutDate;
    var noDataTotalMins = noDataDate / 60000;
    var noDataDays = Math.floor(noDataTotalMins / 60 / 24);
    var noDataHours = Math.floor((noDataTotalMins - (noDataDays * 24 * 60)) / 60 );
    var noDataMins = Math.floor(noDataTotalMins - (noDataHours * 60) - (noDataDays * 60 * 24) );

    
    document.getElementById('remaining_per_day').textContent = remaining_daily_target.toFixed(2);
    // send the values to the page  
    document.getElementById('data_days_short').textContent = noDataDays;
    document.getElementById('data_hours_short').textContent = noDataHours;
    document.getElementById('data_mins_short').textContent = noDataMins;
    document.getElementById('data_renews_on').textContent = endDate.toLocaleDateString() + " " + endTime;
    document.getElementById('data_runsout_on').textContent = runoutDate.toLocaleDateString() + " " + runoutTime;
    document.getElementById('actual_data_remaining').textContent = totalRemaining.toFixed(2);
    document.getElementById('used_per_day').textContent = used_per_day.toFixed(2);
    document.getElementById('target_per_day').textContent = target_per_day.toFixed(2);
    document.getElementById('days_remaining').textContent = remainingDays;
    document.getElementById('hours_remaining').textContent = remainingHours;
    document.getElementById('mins_remaining').textContent = remainingMins;

    
    document.getElementById('end_days_remaining').textContent = endDays;
    document.getElementById('end_hours_remaining').textContent = endHours;
    document.getElementById('end_mins_remaining').textContent = endMins;
    
    //log.textContent = `Form Submitted! Timestamp:  ` + noDataDays;

}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }

// js needs stuff like this built in!
function formatTime(theDate) {
    sHours = theDate.getHours();
    sMinutes = theDate.getMinutes();
    if (sHours < 10) sHours = "0" + sHours;
    if (sMinutes < 10) sMinutes = "0" + sMinutes;

    return sHours+":"+sMinutes;
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
