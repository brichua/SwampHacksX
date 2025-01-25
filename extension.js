
function test(){
    console.log("button clicked");
}

function openTab(tabName) {
    console.log(tabName);
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
  }

function cardDisplay(cardName){
    const card = document.getElementById(cardName);
    if(card.style.display == "none"){
        card.style.display = "block";
    }else{
        card.style.display = "none";
    }
}

const taskBtn = document.getElementsByClassName("tabBtn")[0];
const scheduleBtn = document.getElementsByClassName("tabBtn")[1];
const progressBtn = document.getElementsByClassName("tabBtn")[2];


scheduleBtn.addEventListener("click", function() {
    openTab("Scheduling");
  });
progressBtn.addEventListener("click", function() {
    openTab("Progress");
  });
taskBtn.addEventListener("click", function() {
    openTab("Tasks");
  });

const taskFormBtn = document.getElementById("taskFormBtn");
const cancelTaskBtn = document.getElementById("cancelTask");
taskFormBtn.addEventListener("click", function() {
    cardDisplay("taskForm");
  });
cancelTaskBtn.addEventListener("click", function() {
    cardDisplay("taskForm");
  });