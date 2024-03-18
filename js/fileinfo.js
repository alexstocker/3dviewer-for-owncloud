(function (OCA) {
    OCA.Files3dViewer = OCA.Files3dViewer || {};

    OCA.Files3dViewer.Extensions = [
        'stl',
        'obj',
        '3mf'
    ];

    /**
     * @namespace OCA.Files3dViewer.FileInfoPlugin
     */
    OCA.Files3dViewer.FileInfoPlugin = {
        attach: function (fileList) {
            var oldCreateRow = fileList._createRow;
            fileList._createRow = function(FileInfo) {
                var $tr = oldCreateRow.apply(this, arguments);
                var fileExtension = FileInfo.name.slice(FileInfo.name.lastIndexOf(".")).replace(/[.]+/, '');

                if (FileInfo.type === 'file' && OCA.Files3dViewer.Extensions.indexOf(fileExtension) !== -1) {
                    var $thumbnailDiv = $tr.find('div.thumbnail');

                    if (fileExtension === '3mf') {
                        fileExtension = 'ft-3mf'
                    }

                    $thumbnailDiv.addClass('icon_filetype ' +fileExtension);
                    FileInfo.icon = function () {
                        return OC.imagePath('files_3dviewer', 'filetypes/'+fileExtension);
                    }
                }
                return $tr;
            };
        },
    }
})(OCA);

OC.Plugins.register('OCA.Files.FileList', OCA.Files3dViewer.FileInfoPlugin);
