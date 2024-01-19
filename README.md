# 3dviewer-for-owncloud

3D model file viewer for owncloud

This application integrates the [viewstl.js](https://github.com/omrips/viewstl) library into ownCloud. Using this application users can view 3D models online without downloading the file.

**Supported Files**

* STL
* OBJ

## Install

### Owncloud Marketplace

* ... comming soon

### Manuall

1. Change into `apps` directory
2. `mkdir files_3dviewer`
3. `cd files_3dviewer`
3. `git clone https://github.com/alexstocker/3dviewer-for-owncloud.git .` (Attention: The `.` at the end is IMPORTANT)
4. `cd ../..`
5. `./occ app:enable files_3dviewer`

### Docker Development Environment

Please checkout [alexstocker/owncloud-docker-development at GitHub](https://github.com/alexstocker/owncloud-docker-development)

