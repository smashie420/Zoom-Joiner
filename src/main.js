const { ipcRenderer, ipcMain } = require('electron');
const { fstat } = require('fs');
const fs = require('fs');
const { stringify } = require('querystring');
let classList = []
require("../jquery.timer");

// Add classess
let addClass = document.querySelector('#inputForm');
addClass.addEventListener('submit',function(e){
    e.preventDefault();
    const className = document.querySelector("#classAdded").value;
    ipcRenderer.send("classInfo", {className:className, classTime:"00:00", classLink:"zoom.com"})
    ipcRenderer.send("getClassList")
    window.location.reload();
})


ipcRenderer.on("getClassList-reply", (e, args)=>{
    classList = args;

    let classUpdate = document.querySelectorAll('.circle')
    classUpdate.forEach(toDel => {
        toDel.remove();
    });

    args.forEach((element, index) => {
      let name = element.className;
      if(name.length > 3){
        name =  name[0] + name[1] + name[2]
      }
        $('.classess').append(`
        <div class="circle" id="${index}" onclick="showSettings(this)">
            <h3>${name}</h3>
            <small>${element.classTime}</small>
        </div>
        `)

        $('.settings').append(`
        <div class="classSetting hidden" id="${index}">
          <div class="classSettingTitle">
            <div class="classSettingText">
              <h1>Class Settings</h1>
              <h2>${element.className}</h2>
            </div>
            
            <!--<span class="far fa-times-circle"></span>-->
          </div>
          <form id="classSetting">
            <div class="classSettingOptions">

                <div class="options">
                  <h1>Zoom Meeting Link</h1>
                  <input type="text" id="zoomLink" name="linkInput" value='${element.classLink}' required>
                </div>
                
                <div class="options">
                  <h1>Join Time</h1>
                  <input type="time" name="timeInput" value="${element.classTime}" required>
                </div>

                <div class="options">
                  <h1>Join Days</h1>
                  <div class="weekDays-selector">
                    <div>
                      <input type="checkbox" id="weekday-mon" class="weekday" name="mond" ${element.classDays.monday ? "checked" : ""}/>
                      <label for="weekday-mon">M</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-tue" class="weekday" name="tues" ${element.classDays.tuesday ? "checked" : ""}/>
                      <label for="weekday-tue">T</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-wed" class="weekday" name="wens" ${element.classDays.wensday ? "checked" : ""}/>
                      <label for="weekday-wed">W</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-thu" class="weekday" name="thur" ${element.classDays.thursday ? "checked" : ""}/>
                      <label for="weekday-thu">T</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-fri" class="weekday" name="frid" ${element.classDays.friday ? "checked" : ""}/>
                      <label for="weekday-fri">F</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-sat" class="weekday" name="satu" ${element.classDays.saterday ? "checked" : ""}/>
                      <label for="weekday-sat">S</label>
                    </div>

                    <div>
                      <input type="checkbox" id="weekday-sun" class="weekday" name="sund" ${element.classDays.sunday ? "checked" : ""}/>
                      <label for="weekday-sun">S</label>
                    </div>
                    
                    
                    
                    
                  </div>
                </div>
                
                
            </div>
            <div class="settingFooter">
              <div class="delete" id="delete" onclick=remove(this)>
                <span class="fas fa-trash" "></span>
              </div>
              <div class="checkmark" id="done">
                <button type="submit"><span class="fas fa-check"></span></button>
              </div>
            </div>
          </form>
        </div>
        `)
    });
    
    



})
function remove(element){
  let removeName =  element.parentElement.parentElement.parentElement.querySelector('h2').value
  let removeLink =  element.parentElement.parentElement.parentElement.querySelector('.options input').value
  let removeTime =  element.parentElement.parentElement.parentElement.querySelector('.options input[type=time]').value
  classList.splice(classList.indexOf({className:removeName, classList:removeLink, classTime:removeTime}), 1);
  element.parentElement.parentElement.parentElement.remove()
  ipcRenderer.send('updateList', classList)
  window.location.reload();
}

function showSettings(element){
  let settingsList = document.querySelectorAll('.settings div.classSetting');

  let settingtoShow = element.parentElement.parentElement.querySelector(`.settings div[id="${element.id}"]`)
  settingsList.forEach(setting => {
    if(setting.id == element.id){
      settingtoShow.classList.remove("hidden")
    }else{
      setting.classList.add('hidden')
    }
  });
  ipcRenderer.send('updateList', classList)
}


$(document).ready(function(){
    ipcRenderer.send("getClassList")
    ipcRenderer.on('getClassList-reply', (e, data) =>{
      console.log(data)
      classList = data;
    })
    setTimeout(function(){ // Wait for all the classess to load
        let settings = document.querySelectorAll('#classSetting');
        settings.forEach( (data, index)=>{
            data.addEventListener('submit',function(e){
                e.preventDefault();
                let formRes = $(data).serializeArray();
                let link = formRes[0].value
                let time = formRes[1].value
                
                
                let monday = false;
                let tuesday = false;
                let wensday = false;
                let thursday = false;
                let friday = false;
                let saterday = false;
                let sunday = false;

                for(var i = 1; i<formRes.length;i++){
                  formRes[i].name == "mond" ? monday = true : "";  
                  formRes[i].name == "tues" ? tuesday = true : "";  
                  formRes[i].name == "wens" ? wensday = true : "";  
                  formRes[i].name == "thur" ? thursday = true : "";  
                  formRes[i].name == "frid" ? friday = true : "";  
                  formRes[i].name == "satu" ? saterday = true : "";  
                  formRes[i].name == "sund" ? sunday = true : "";  
                }
                let days = {sunday:sunday, monday:monday,tuesday:tuesday,wensday:wensday,thursday:thursday,friday:friday,saterday:saterday};
               

             
                classList[index].classLink = link
                classList[index].classTime = time
                classList[index].classDays = days
                

                
                ipcRenderer.send('updateList', classList);
                window.location.reload();
                console.log("Ran")
            })
        })
    },100)
})


let timer = setInterval(loop,100)

function numToDayOfWeek(Day){
  if(Day == 0){
    return 'sunday'
  }
  if(Day == 1){
    return 'monday'
  }
  if(Day == 2){
    return 'tuesday'
  }
  if(Day == 3){
    return 'wensday'
  }
  if(Day == 4){
    return 'thursday'
  }
  if(Day == 5){
    return 'friday'
  }
  if(Day == 6){
    return 'saterday'
  }
}
let isCoolDown = false;
function loop(){
  console.log("Running");
  let date = new Date
  let currentTime = `${date.getHours()}:${date.getMinutes()}`
  let currentDay = `${numToDayOfWeek(date.getDay())}`
  classList.forEach(async classs => {
    let realTime = currentTime;
    if(!isNaN(realTime[1]) == false){
      realTime = `0${currentTime}`
    }    
    if(realTime.length < 5 && realTime[3] != 0){
      realTime = `${realTime[0]}${realTime[1]}:0${realTime[3]}`
    }

    if(classs.classDays[currentDay]){
      if(realTime == classs.classTime && !isCoolDown){
        console.log("Its time! " + classs.classLink);
        clearInterval(timer);
        if(!classs.classLink.includes('https://')){
          classs.classLink = `https://${classs.classLink}`
        }
        try {
          window.open(classs.classLink, '_blank');
        } catch (error) {
          console.log("Error couldnt open browser" + error)
        }
        isCoolDown = true;
        setTimeout(()=>{
          setInterval(loop, 100)
          isCoolDown = false;
        }, 70000)
      }
    }
  });
}

