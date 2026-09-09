const track = document.querySelector(".carousel-track1");
const slides = document.querySelectorAll(".teste");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

// slider automático com dois radios
let count = 1;
document.getElementById("radio1").checked = true;

setInterval(function(){
    count = (count === 2 ? 1 : count + 1);
    document.getElementById("radio"+count).checked = true;
}, 3000);