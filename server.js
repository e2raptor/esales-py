//************************************************************        
var basedir = '.'; //working dir
var pywsgi = basedir+'/server_app.py';
        
var startpage = 'http://127.0.0.1:5000/';
var pagecheck = 'http://127.0.0.1:5000/404'; //no side-effect page to check if webserver is running
//************************************************************        
var wsgi_process = null;
var spawn = require("child_process").spawn;
//------------------------------------------------------------
function StartWSGI(pyexec)
{
    console.log('StartWSGI');

    if (platform() == 'win32')
    {
        //pyexec = pyexec.replace('/','\\');
        pywsgi = pywsgi.replace('/','\\');
        basedir = basedir.replace('/','\\');
    }

    child = spawn(pyexec, [pywsgi,],{cwd:basedir});
    child.stdout.on("data", function(data) {
        return console.log("stdout:" + data);
        });
    child.stderr.on("data", function(data) {
        return console.log("ERROR: " + data);
        });

    child.on("exit", function(code) {
        return console.log("Encoding process exited with code: " + code);
        });	

    console.log("StartWSGI_End");

    wsgi_process = child;

    function transferComplete(evt) {
      InitMainWindow();
    }

    function transferFailed(evt) {
      document.getElementById("status").textContent = "Waiting...";
      checkServer();
    }

    function reqListener () {
      document.getElementById("status").textContent = "Launching...";
    };

    function checkServer()
    {
        var oReq = new XMLHttpRequest();    
        oReq.addEventListener("load", transferComplete, false);
        oReq.addEventListener("error", transferFailed, false);

        oReq.onload = reqListener;
        oReq.open("GET", pagecheck, true);
        oReq.send();
    }

    document.getElementById("status").textContent = "checking...";
    checkServer();

}
//------------------------------------------------------------
function InitMainWindow()
{
    var gui = require('nw.gui');

    // Get the current window
    var win = gui.Window.get();

    var new_win = 
        gui.Window.open(startpage, {
            position: 'center',
            width: 1366,
            height: 786,
            "toolbar": false,
            focus: true,
            //icon:
            //fullscreen: true,
            show: false
            });	

    // And listen to new window's focus event
    new_win.on('focus', function() {
        console.log('New window is focused-b');
        });

    // Release the 'win' object here after the new window is closed.
    new_win.on('closed', function() {
        console.log("mainclose");
        wsgi_process.kill();
        win.close();
        win = null;
        });

    new_win.on('loaded', function() {
        console.log('New window is loaded');
        win.hide(); 
        new_win.show();  	
        new_win.focus();

        var awin = gui.Window.get(this);
        awin = this.window;
        awin.onkeyup = function(e) {
             //console.log(e);
             if (e.keyIdentifier == "F5")
             {
                new_win.reload();
             }
             if (e.keyIdentifier == "F11")
             {
                new_win.toggleFullscreen();
             }
             if (e.keyIdentifier == "F12")
             {

                if (new_win.isDevToolsOpen())
                {
                    new_win.closeDevTools();
                }else{
                    new_win.showDevTools();
                }

             }         
            };	
        });

}
//======================================================================
