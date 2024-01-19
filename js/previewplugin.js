(function (OCA) {

    OCA.Files3dViewer = OCA.Files3dViewer || {};

    /**
     * @namespace OCA.FilesStlViewer.PreviewPlugin
     */
    OCA.Files3dViewer.PreviewPlugin = {
        attach: function (fileList) {
            this._extendFileActions(fileList.fileActions);
        },

        _extendFileActions: function (fileActions) {
            var mimes = [
                'model/stl',
                'application/octet-stream',
                'model/obj',
                // 'application/vnd.ms-3mfdocument',
                // 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
                // 'application/vnd.ms-printing.printticket+xml',
                // 'model/3mf'
            ];

            var fileExtensions = [
                'stl',
                'obj',
                // '3mf'
            ];

            var self = this;

            $.each(mimes, function(key, value) {
                fileActions.registerAction({
                    name: 'Files3dViewer',
                    displayName: t('Files_3dViewer', '3D Viewer'),
                    mime: value,
                    iconClass: 'icon-toggle',
                    permissions: OC.PERMISSION_READ,
                    actionHandler: function (fileName, context) {
                        self.loadContainer(fileName, context.dir);
                    },
                    icon: function () {
                        return OC.imagePath('files_3dviewer', 'eye');
                    }
                });
                fileActions.setDefault(value, 'Files3dViewer');
            });

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
            var stl_viewer = new StlViewer(
                document.getElementById("viewer_container"),
                {
                            models: [
                                {
                                    id:0,
                                    filename:"/remote.php/webdav"+dir+"/"+filename}
                            ],
                    // jszip_path:"jszip.min.js",
                    // jszip_utils_path:"jszip-utils.min.js",
                });
            return true;
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
            $('#viewer_close').on('click', _.bind(this._onCloseTrigger, this));
        },

        _onCloseTrigger: function() {
            this.closeViewer();
        },

        closeViewer: function() {
            $('#Files_3dViewer').remove();
        },
    };
})(OCA);

OC.Plugins.register('OCA.Files.FileList', OCA.Files3dViewer.PreviewPlugin);