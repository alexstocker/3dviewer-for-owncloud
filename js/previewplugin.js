(function (OCA, $) {

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

            $.each(mimes, function (key, value) {
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

        loadContainer: function (fileName, context) {
            var $container = $('<div/>', {
                id: 'Files_3dViewer'
            });

            var spinner = function () {
                return OC.imagePath('files_3dviewer', 'loading-spinner.gif');
            }

            // console.log(spinner);

            var $viewerOverlay = $('<div id="viewer_overlay"></div>');
            var $viewerContainer = $('<div id="viewer_container"></div>');
            var $canvasContainer = $('<div id="canvas_container"></div>');
            // var $loadingOverlay = $('<div id="loading_overlay"><img src="' + OC.imagePath('core', 'loading.gif') + '"></div>');
            // var $loadingOverlay = $('<div id="loading_overlay"><img src="../files_3dviewer/img/loading_spinner.gif"></div>');
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

            var camera_state = {
                "position": {"x": 100, "y": 100, "z": 74.39999999999999},
                "up": {"x": 100, "y": 1, "z": 1000},
                "target": {"x": 100, "y": 100, "z": 100}
            };

            var init_state = {
                "position": {"x": 0, "y": 0, "z": 0},
                "up": {"x": 0, "y": 0, "z": 0},
                "target": {"x": 0, "y": 0, "z": 0}
            };

            var stl_viewer = new StlViewer(
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
                                    rotationx: 0, rotationy: 0, rotationz: 1, msec: 1000, loop: false
                                },
                            }
                        }
                    ],
                    // jszip_path:"jszip.min.js",
                    // jszip_utils_path:"jszip-utils.min.js",
                    // load_three_files: "/",
                    loading_progress_callback: this._loadingProgress,
                    all_loaded_callback: this.init_orientation
                });
        },

        _loadingProgress: function (load_status, load_session) {
            var loaded = 0;
            var total = 0;

            Object.keys(load_status).forEach(function (model_id) {
                if (load_status[model_id].load_session == load_session) {
                    loaded += load_status[model_id].loaded;
                    total += load_status[model_id].total;
                }
            });

            document.getElementById("pbtotal").value = loaded / total;

            if (loaded === total) {
                $('#loading_overlay').fadeOut(1000, function () {
                    $(this).remove();
                });
                $('#progress_total').fadeOut(1000, function () {
                    $(this).remove();
                });
            }
        },

        init_orientation: function (stl_viewer) {
            var last_camera_state = this.get_camera_state();

            if (!last_camera_state) return;

            var distance = Math.max(Math.abs(this.camera.position.x), Math.abs(this.camera.position.y), Math.abs(this.camera.position.z));

            this.set_camera_state({
                position: {x: distance, y: distance, z: distance},
                up: {x: 0, y: 0, z: 1},
                target: last_camera_state.target
            });

            this.set_rotation(1, Math.PI / 10, -(Math.PI / 10), Math.PI, 0);
        },

        /**
         * Load the editor control bar
         */
        loadControls: function (file, context) {
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