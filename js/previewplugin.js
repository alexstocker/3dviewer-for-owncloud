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

            var $viewerOverlay = $('<div id="viewer_overlay"></div>');
            var $viewerContainer = $('<div id="viewer_container"></div>');
            var $canvasContainer = $('<div id="canvas_container"></div>');
            var $loadingOverlay = $('<div id="loading_overlay"><img src="' + OC.imagePath('core', 'loading.gif') + '"></div>');

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

            var camera_state={
                "position": {"x": 100, "y": 100, "z": 74.39999999999999},
                "up": {"x": 100, "y": 1, "z": 1000},
                "target": {"x": 100, "y": 100, "z": 100}
            };
            var stlViewer = new StlViewer(
                element,
                {
                    models: [
                        {
                            id: 1,
                            filename: "/remote.php/webdav" + dir + "/" + filename
                        }
                    ],
                    // jszip_path:"jszip.min.js",
                    // jszip_utils_path:"jszip-utils.min.js",
                    // load_three_files: "/",
                    loading_progress_callback: this._loadingProgress,
                    // set_camera_state: {"position":{"x":100,"y":100,"z":74.39999999999999},"up":{"x":100,"y":1,"z":1000},"target":{"x":100,"y":100,"z":100}},
                });

            // var_dump(stlViewer.camera);
            // this.init_orientation(stlViewer)
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

        var last_camera_state = stl_viewer.get_camera_state();
        // if (!last_camera_state) return;
        var s='';

        //rotate camera (whole scene)
        var distance=Math.max(Math.abs(stl_viewer.camera.position.x),Math.abs(stl_viewer.camera.position.y),Math.abs(stl_viewer.camera.position.z));

        stl_viewer.set_camera_state({position:{x:distance,y:distance,z:distance},up:{x:0,y:1,z:0},target:last_camera_state.target});
        scene_rotation=s;


        $id('orientation_icon').setAttribute('class', 'huge vs-font vs-'+s);
        $id('orientation_icon_menu').setAttribute('class', 'huge vs-font vs-'+s);
    },

        /**
         * Load the editor control bar
         */
        loadControls: function (file, context) {
            var html =
                '<small class="filename">' + escapeHTML(file) + '</small>'
                + '<small class="unsaved-star" style="display: none">*</small>'
                + '<small class="saving-message">'
                + '</small>'
                + '<button id="viewer_close" class="icon-close svg"></button>';

            var controlBar = $('<div id="viewer_controls"></div>').html(html);

            var $progressBarTotal = $('<div id="progress_total"><progress id="pbtotal" class="p-total" value="0" max="1"></progress></div>');

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