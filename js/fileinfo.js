(function (OCA) {
    OCA.FilesStlViewer = OCA.FilesStlViewer || {};

    OCA.FilesStlViewer.FileInfoPlugin = {
        attach: function (fileList) {
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

            var oldCreateRow = fileList._createRow;
            fileList._createRow = function(fileData) {
                var $tr = oldCreateRow.apply(this, arguments);

                if (mimes.indexOf(fileData.mimetype) >= 0) {
                    var fileExtension = fileData.name.slice(fileData.name.lastIndexOf(".")).replace(/[.]+/, '');
                    var $thumbnailDiv = $tr.find('div.thumbnail');
                    $thumbnailDiv.addClass('icon_filetype ' +fileExtension);
                    fileData.icon = function () {
                        return OC.imagePath('files_3dviewer', 'filetypes/'+fileExtension);
                    }
                }
                return $tr;
            };
        },
    }
})(OCA);

OC.Plugins.register('OCA.Files.FileList', OCA.FilesStlViewer.FileInfoPlugin);
