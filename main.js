/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";
    var COMMAND_ID = "getpage.getpage";
    
    // Brackets modules
    var EditorManager       = brackets.getModule("editor/EditorManager"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        CommandManager      = brackets.getModule("command/CommandManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        Strings                = brackets.getModule("strings");
    // local modules
    var mainDialog       = require("text!dialog.html");
    
    function getTitle(html) {
        var start = html.indexOf("<title>");
        if (start === -1) { return "untitled"; }
        var end = start += 7;
        while (html[end] !== '|' && html[end] !== '<') { end++; }
        return html.substring(start, end).trim();
    }
    
    /**
     * Tries to use page title as filename if it doesn't already exist
     */
    function getFilenameSuggestion(html, dir) {
        var result = new $.Deferred();
        var baseFileName = getTitle(html);
        var suggestedName = baseFileName + ".html";
        var dirEntry = new NativeFileSystem.DirectoryEntry(dir);
        
        result.progress(function attemptNewName(suggestedName, nextIndexToUse) {
            if (nextIndexToUse > 99) {
                // tried enough
                result.reject();
                return;
            }
            
            // check this name
            var successCallback = function (entry) {
                // file exists, notify to the next progress
                result.notify(baseFileName + "-" + nextIndexToUse + ".html", nextIndexToUse + 1);
            };
            var errorCallback = function (error) {
                // file not found - we can use this name
                result.resolve(suggestedName);
            };
            
            dirEntry.getFile(suggestedName, {}, successCallback, errorCallback);
        });
        
        // kick it off
        result.notify(baseFileName + ".html", 1);
        
        return result.promise();
    }
    
    /**
     * With html retrieved, creates a new file
     */
    function loadPage(html) {
        console.log('html retrieved');
        
        // Determine the directory to put the new file
        // If a file is currently selected, put it next to it.
        // If a directory is currently selected, put it in it.
        // If nothing is selected, put it at the root of the project
        var baseDir,
            pm,
            selected = ProjectManager.getSelectedItem() || ProjectManager.getProjectRoot();
        
        baseDir = selected.fullPath;
        if (selected.isFile) {
            baseDir = baseDir.substr(0, baseDir.lastIndexOf("/"));
        }
    
        var deferred = getFilenameSuggestion(html, baseDir);
        var createWithSuggestedName = function (suggestedName) {
            // we have a working filename so skip rename on create
            var entryDeferred = ProjectManager.createNewItem(baseDir, suggestedName, true, false);
//                .pipe(deferred.resolve, deferred.reject, deferred.notify)
            entryDeferred.done(function (entry) {
                // insert html into file, this will overwrite whatever content happens to be there already
                var docDeferred = DocumentManager.getDocumentForPath(entry.fullPath);
                docDeferred.done(function (doc) {
                    DocumentManager.setCurrentDocument(doc);
                    doc._masterEditor._codeMirror.setValue(html);

                });
            });

        };
        
        deferred.done(createWithSuggestedName);
        deferred.fail(function createWithDefault() { createWithSuggestedName("untitled.html"); });

    }
    
            
    
    function showUrlDialog() {
        console.log('enter URL');

        var $dlg,
            $title,
            $getUrlControl,
            dialogPromise;

        $dlg = $(mainDialog);
        Dialogs.showModalDialogUsingTemplate($dlg);
        // we implement our own OK button handler so we have
        // no interest in the returned promise
        
        // URL input
        $getUrlControl = $dlg.find(".get-url");
        
        // add OK button handler
        $dlg.one("click", ".dialog-button-ext", function (e) {
            $(this).html('Loading...');
            var getUrl = $getUrlControl.val();
            console.log("Sucking " + getUrl);
            $.ajax({
                url: getUrl,
                dataType: 'html',
                success: function (html) {
                    // dismiss modal            
                    $dlg.modal(true).hide();
                    $dlg.remove();
                    // load the page
                    loadPage(html);
                }
            });
        });
            
        // Error message - TODO
        //        if (errorMessage) {
        //            $dlg.find(".settings-list").append("<div class='alert-message' style='margin-bottom: 0'>" + errorMessage + "</div>");
        //        }

        // Give focus to first control
        $getUrlControl.focus();

        return dialogPromise;
    }
    
    
    CommandManager.register("Edit File", COMMAND_ID, showUrlDialog);
    KeyBindingManager.addBinding(COMMAND_ID, "Alt-G");
});
