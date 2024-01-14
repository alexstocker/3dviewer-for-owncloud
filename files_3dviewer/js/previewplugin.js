(function (OCA) {

    OCA.FilesStlViewer = OCA.FilesStlViewer || {};

    OCA.FilesStlViewer.FileInfoPlugin = {
        attach: function (fileList) {
            console.log('FileInfoPlugin');
            console.log(fileList);
        },
    }
    /**
     * @namespace OCA.FilesStlViewer.PreviewPlugin
     */
    OCA.FilesStlViewer.PreviewPlugin = {
        attach: function (fileList) {
            // console.log(fileList);
            this._extendFileActions(fileList.fileActions);
        },

        _extendFileActions: function (fileActions) {
            var self = this;
            fileActions.registerAction({
                name: 'FilesStlViewer',
                displayName: t('Files_3dViewer', 'Open in 3D Viewer'),
                mime: 'application/octet-stream',
                iconClass: 'icon-toggle',
                permissions: OC.PERMISSION_READ,
                actionHandler: function (fileName, context) {
                    self.loadContainer(fileName, context.dir);
                }
            });
            fileActions.setDefault('application/sla', 'FilesStlViewer');
        },

        loadContainer: function(fileName, context) {
            var container = $('<div/>', {
                id: 'Files_3dViewer'
            });

            container.html(
                '<div id="viewer_overlay"></div>'
                +'<div id="viewer_container"></div>'
                +'<div id="viewer_wrap">'
                +'<div id="viewer_preview_wrap"><div id="viewer_preview"></div></div></div></div>'
                );
            $('#content').append(container);

            this.loadFile(context,fileName);
        },

        loadFile: function(dir, filename, success, failure) {
            this.loadControls(filename, _self.currentContext);
            console.log(filename);
            console.log(dir);
            var stl_viewer=new StlViewer(document.getElementById("viewer_container"), { models: [ {id:0, filename:"/remote.php/webdav"+dir+"/"+filename} ] });
            // console.log(stl_viewer);
            return true;
            $.get(
                OC.generateUrl('/apps/Files_3dViewer/loadfile'),
                {
                    filename: filename,
                    dir: dir,
                    // sharingToken: $('#sharingToken').val()
                }
            ).done(function(data) {
                // Call success callback
                // OCA.Files_Texteditor.file.writeable = data.writeable;
                // OCA.Files_Texteditor.file.locked = data.locked;
                // OCA.Files_Texteditor.file.mime = data.mime;
                // OCA.Files_Texteditor.file.mtime = data.mtime;
                // var stl_viewer=new StlViewer(document.getElementById("stl_cont"), { models: [ {id:0, filename:"/remote.php/webdav/"+filename} ] });
                success(OCA.Files_Texteditor.file, data.filecontents);
            }).fail(function(jqXHR) {
                // failure(JSON.parse(jqXHR.responseText).message);
            });
        },

        bindControlBar: function() {
            var self = this;
            $('#viewer_close').on('click', _.bind(this._onCloseTrigger, this));
            $(window).resize(OCA.Files_Texteditor.setFilenameMaxLength);
            if(!$('html').hasClass('ie8')) {
                window.onpopstate = function (e) {
                    self._onCloseTrigger();
                }
            }
        },

        /**
         * Load the editor control bar
         */
        loadControls: function(file, context) {
            var html =
                '<small class="filename">'+escapeHTML(file)+'</small>'
                +'<small class="unsaved-star" style="display: none">*</small>'
                +'<small class="saving-message">'
                +'</small>'
                +'<button id="viewer_close" class="icon-close svg"></button>';
            var controlBar = $('<div id="viewer_controls"></div>').html(html);
            $('#viewer_container').append(controlBar);
            // // this.setFilenameMaxLength();
            // // this.bindControlBar();
            //
            $('#viewer_close').on('click', _.bind(this._onCloseTrigger, this));
            // $(window).resize(OCA.Files_Texteditor.setFilenameMaxLength);
            // if(!$('html').hasClass('ie8')) {
            //     window.onpopstate = function (e) {
            //         self._onCloseTrigger();
            //     }
            // }

            // if (!file.writeable && file.locked) {
            //     $('#viewer_controls small.saving-message')
            //         .text(t('Files_3dViewer', 'file is read-only, locked by {locked}', {locked: file.locked}))
            //         .show();
            // } else if (!file.writeable) {
            //     $('#viewer_controls small.saving-message')
            //         .text(t('Files_3dViewer', 'file is read-only'))
            //         .show();
            // }

        },

        _onCloseTrigger: function() {
            this.closeViewer();
        },

        closeViewer: function() {
            $('#Files_3dViewer').remove();
            // this.$container.html('').show();
            // this.unloadControlBar();
            // this.unBindVisibleActions();
            // if (this.fileInfoModel && this.file.size) {
            //     this.fileInfoModel.set({
            //         // temp dummy, until we can do a PROPFIND
            //         etag: this.fileInfoModel.get('id') + this.file.mtime,
            //         mtime: this.file.mtime * 1000,
            //         size: this.file.size
            //     });
            // }
            // document.title = this.oldTitle;
        },

        /**
         * Removes the control bar
         */
        unloadControlBar: function() {
            $('#viewer_controls').remove();
        },
    };



})(OCA);

// OC.Plugins.register('OCA.Files.FileInfo', OCA.FilesStlViewer.FileInfoPlugin);
OC.Plugins.register('OCA.Files.FileList', OCA.FilesStlViewer.PreviewPlugin);

$(document).ready(function () {
    // console.log('EHLO');
    var viewer = OCA.FilesStlViewer.PreviewPlugin;
});