var widget_button = document.getElementById("key-widget-icon");
widget_button.onclick = function() {
    self.port.emit("show");
};
