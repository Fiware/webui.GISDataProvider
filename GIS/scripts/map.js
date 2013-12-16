var xmlDoc;
var spinner;

(function() {
    var spinOpts = {
          lines: 30, // The number of lines to draw
          length: 20, // The length of each line
          width: 4, // The line thickness
          radius: 30, // The radius of the inner circle
          rotate: 0, // The rotation offset
          color: '#000', // #rgb or #rrggbb
          speed: 2, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: true, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 1000, // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        };
    spinner = new Spinner(spinOpts).spin();

    var baseUrl = "http://localhost:9090/geoserver/";
    // var baseUrl = "http://dev.cyberlightning.com:9091/geoserver/";
    var oldCoordinates = null;

    function parseServerCapabilities(response) {
        // console.log(response);

        xmlDoc = new DOMParser().parseFromString(response,'text/xml');
        var x = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/w3ds/0.4.0", "Layer");

        var combo = document.getElementById('selector');
        var option = document.createElement('option');
        option.text = "Select layer";
        option.value = "select_layer";
        try {
            combo.add(option, null); //Standard 
        } catch(error) {
            combo.add(option); // IE only
        }


        // console.log(x);
        for (i=0;i<x.length;i++)
        { 
            var combo = document.getElementById("selector");
            var option = document.createElement("option");
            option.text = x[i].getElementsByTagNameNS("http://www.opengis.net/ows/1.1", "Identifier")[0].childNodes[0].nodeValue;
            option.value = x[i].getElementsByTagNameNS("http://www.opengis.net/ows/1.1", "Identifier")[0].childNodes[0].nodeValue;
            try {
                combo.add(option, null); //Standard 
            } catch(error) {
                combo.add(option); // IE only
            }
        }

    }

    function getGeoserverCapabilities() {
        // console.log("getGeoserverCapabilities");
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new XDomainRequest();
        }

        // Set callback function
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                // console.log(xmlhttp.responseText);
                parseServerCapabilities(xmlhttp.responseText);
            }
        }

        xmlhttp.open("GET", baseUrl + "ows?service=w3ds&version=0.4.0&request=GetCapabilities" , true);
        xmlhttp.send();
    }


    // Traps selection list click event and launch layer detail fetching funtion
     $(function() {
        $("#selector").click(function(e) {
            // console.log("Selection list item: "+this.options[this.selectedIndex].value);
            e.preventDefault(); // if desired...
            if (this.options[this.selectedIndex].value === 'select_layer'){
                // Select layer-option pressed, do nothing
                console.log("select_layer");
                stopSpinner();

            }
            else{
                startSpinner();
                newLayer = true;
                getLayerDetails(baseUrl, this.options[this.selectedIndex].text);
            }
        });
      });

    // Traps camera movement, used for analyzing when new layer data should be requested
    $("#camera_player-camera").bind("DOMAttrModified", function() {
        // console.log("#camera_player-camera).bind(DOMAttrModified");
        // check flag if new layer is loaded, because in this case camera height needs to be adjusted 
        // and that operation tricks this function unneseccary. We want to see only camera movements after new layer is initialized
        // if (newLayer){
            var cam = document.getElementById("camera_player-camera");
            var coordinates = cam.getAttribute("position");
            if (!oldCoordinates && coordinates !== null){
                oldCoordinates = coordinates;
            }
            // console.log("oldCoordinates: "+oldCoordinates);
            // console.log("coordinates: "+coordinates);
            if ((coordinates != null) && (coordinates !==oldCoordinates)) {
                var coordSplit = coordinates.split(" ");
                var currentX = parseFloat(coordSplit[0]);
                var currentY = parseFloat(coordSplit[2]);
                calculateCurrentPosLayerBlock(currentX, currentY);        
                }
        // }
    })


    function init(){
        getGeoserverCapabilities();
    }
    window.onload = init();

    
}());

function startSpinner(){
        $("#loading").show();
        $("#loading").append(spinner.el);    
    };

function stopSpinner(){
    spinner.spin();
    $("#loading").hide(true);
};
