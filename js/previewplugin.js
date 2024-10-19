(function (OCA, $) {

    OCA.Files3dViewer = OCA.Files3dViewer || {};

    /**
     * @namespace OCA.Files3dViewer.PreviewPlugin
     */
    OCA.Files3dViewer.PreviewPlugin = {
        attach: function (fileList) {
            this._extendFileActions(fileList.fileActions);
        },

        _extendFileActions: function (fileActions) {
            var self = this;
            fileActions.registerAction({
                name: 'Files3dViewer',
                displayName: t('Files_3dViewer', '3D Viewer'),
                mime: 'application/octet-stream',
                iconClass: 'icon-toggle',
                permissions: OC.PERMISSION_READ,
                actionHandler: function (fileName, context) {
                    self.loadContainer(fileName, context.dir);
                },
                icon: function () {
                    return OC.imagePath('files_3dviewer', 'eye');
                }
            });
            fileActions.setDefault('application/octet-stream', 'Files3dViewer');
        },

        loadContainer: function (fileName, context) {
            var $container = $('<div/>', {
                id: 'Files_3dViewer'
            });

            var $viewerOverlay = $('<div id="viewer_overlay"></div>');
            var $viewerContainer = $('<div id="viewer_container"></div>');
            var $canvasContainer = $('<div id="canvas_container"></div>');
            var $loadingOverlay = $('<div id="loading_overlay"><img src="' + OC.imagePath('files_3dviewer', 'loading_spinner.gif') + '"></div>');

            $viewerContainer.append($canvasContainer);
            $viewerContainer.append($loadingOverlay);

            $container.append($viewerOverlay);

            $container.append($viewerContainer);

            $('#content').append($container);

            this.loadFile(context, fileName);
        },

        loadFile: function (dir, filename, success, failure) {
            this.loadControls(filename, null);

            var element = document.getElementById("canvas_container");

            new StlViewer(
                element,
                {
                    models: [
                        {
                            id: 1,
                            filename: "/remote.php/webdav" + dir + "/" + filename,
                            view_edges: false,
                            opacity: 0.9,
                            display: "flat",
                            color: "#d7d7d7",
                            animation: {
                                delta: {
                                    rotationx: 0, rotationy: 0, rotationz: 1, msec: 2500, loop: true
                                },
                            }
                        }
                    ],
                    controls: 1,
                    all_loaded_callback: this.init_orientation
                });
        },

        init_orientation: function () {
            var last_camera_state = this.get_camera_state();

            if (!last_camera_state) return;

            var distance = Math.max(Math.abs(this.camera.position.x), Math.abs(this.camera.position.y), Math.abs(this.camera.position.z));

            this.set_camera_state({
                position: {x: distance, y: distance, z: distance},
                up: {x: 0, y: 0, z: 1},
                target: last_camera_state.target
            });

            this.set_rotation(1, Math.PI / 10, -(Math.PI / 10), Math.PI, 0);

            $('#loading_overlay').fadeOut(1000, function () {
                $(this).remove();
            });
            $('#progress_total').fadeOut(1000, function () {
                $(this).remove();
            });
        },

        /**
         * Load the editor control bar
         */
        loadControls: function (file) {
            var html =
                '<small class="filename">' + escapeHTML(file) + '</small>';

            var controlBar = $('<div id="viewer_controls"></div>').html(html);

            var $progressBarTotal = $('<div id="progress_total"><progress id="pbtotal" class="p-total" value="0" max="1"></progress></div>');

            var $closeBtn = $('<button/>', {
                id: 'viewer_close',
                class: 'icon-close svg',
            })

            controlBar.append($closeBtn);
            controlBar.append($progressBarTotal);

            $('#viewer_container').append(controlBar);
            $('#viewer_close').on('click', _.bind(this._onCloseTrigger, this));
        },

        _onCloseTrigger: function () {
            this.closeViewer();
        },

        closeViewer: function () {
            $('#Files_3dViewer').remove();
        },
    };
})(OCA, $);

OC.Plugins.register('OCA.Files.FileList', OCA.Files3dViewer.PreviewPlugin);