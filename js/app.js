$(document).ready(() => {
    $("#footer").load("/common/components.html #footer");
    $("#date").text(new Date().toDateString());
});