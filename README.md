# 3dviewer-for-owncloud

3D model file viewer for owncloud

This application integrates the [viewstl.js](https://github.com/omrips/viewstl) library into ownCloud. Using this application users can view 3D models online without downloading the file.

**Supported file types**

* STL
* OBJ

## Install

### Owncloud Marketplace

* [3D File Viewer](https://marketplace.owncloud.com/apps/files_3dviewer)

### Manuall

1. Change into `apps` directory
2. `mkdir files_3dviewer`
3. `cd files_3dviewer`
3. `git clone https://github.com/alexstocker/3dviewer-for-owncloud.git .` (Attention: The `.` at the end is IMPORTANT)
4. `cd ../..`
5. `./occ app:enable files_3dviewer`

### Docker Development Environment

* Please checkout [alexstocker/owncloud-docker-development at GitHub](https://github.com/alexstocker/owncloud-docker-development)

### Screenshots

![Screenshot 3D file viewer for owncloud context menu](https://www.html5live.at/wp-content/uploads/2024/01/3d-file-viewer-for-owncloud-context-menu.png)
![Screenshot 3D file viewer for owncloud ](https://www.html5live.at/wp-content/uploads/2024/01/3d-file-viewer-for-owncloud.png)

