/*  
 * Copyright (c) 2012-2013 Tim Burgess. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, white: true, debug: true */
/*global define, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    var COMMAND_ID = "timburgess.pagesuck.getpage";
    
    // Brackets modules
    var DocumentManager     = brackets.getModule("document/DocumentManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        Strings             = brackets.getModule("strings");
    
    // local modules
    var mainDialog       = require("text!htmlContent/dialog-template.html");
    var toolbar          = require("text!htmlContent/pagesuck-toolbar.html");
    
    
    
    /**
     * With html retrieved, creates a new untitled document and
     * put the html into it
     */
    function loadPage(html) {
        
        var counter = 1;
        var doc = DocumentManager.createUntitledDocument(counter, ".html");
        DocumentManager.setCurrentDocument(doc);
        doc.setText(html);        
    }
    
            
    /**
     * Show dialog for URL to suck
     */
    function showUrlDialog() {

        var templateVars = {
            title: "Enter a URL to get",
            label: "URL:",
            baseUrl: "http://",
            Strings: Strings
        };
        
        Dialogs.showModalDialogUsingTemplate(Mustache.render(mainDialog, templateVars), false);
        
        
        // add handlers and focus to input
        var $dlg = $(".pagesuck-dialog.instance");
        var $urlInput = $dlg.find("input.url");
        $urlInput.focus();
        $dlg.find(".dialog-button[data-button-id='cancel']").on("click", function() {
            Dialogs.cancelModalDialogIfOpen("pagesuck-dialog");
        });

        $dlg.find(".dialog-button[data-button-id='ok']").on("click", function() {
            
            // get input URL and retrieve content
            var baseUrlValue = $urlInput.val();
            console.log("Sucking " + baseUrlValue);
            $.ajax({
                url: baseUrlValue,
                dataType: 'html',
                success: function (html) {
                    // load the page then close the dialog
                    loadPage(html);
                    Dialogs.cancelModalDialogIfOpen("pagesuck-dialog");
                }
            });
            // change button text
            $(this).html($(this)[0].attributes['data-loading-text'].nodeValue);
        });
    }
    
    // load stylesheet
    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
    
    // add icon to toolbar and listen
    $("#main-toolbar .buttons").append(toolbar);
    $("#toolbar-pagesuck").on('click', function() {
        showUrlDialog();
    });
    
    // wegister with the wabbit
    CommandManager.register("PageSuck", COMMAND_ID, showUrlDialog);
    KeyBindingManager.addBinding(COMMAND_ID, "Alt-S", "mac");
    KeyBindingManager.addBinding(COMMAND_ID, "Alt-S", "win");
});
