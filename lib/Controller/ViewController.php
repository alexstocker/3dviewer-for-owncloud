<?php

namespace OCA\Files_3dViewer\Controller;

use OC\HintException;
use OC\User\NoUserException;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\NotFoundResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Files\File;
use OCP\Files\ForbiddenException;
use OCP\Files\IRootFolder;
use OCP\Files\Storage\IPersistentLockingStorage;
use OCP\IL10N;
use OCP\ILogger;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\Lock\LockedException;
use OCP\Lock\Persistent\ILock;
use OCP\Share\Exceptions\ShareNotFound;
use OCP\Share\IManager;
use Sabre\DAV\Exception\NotFound;


class ViewController extends Controller
{
    /** @var IL10N */
    private $l;

    /** @var ILogger */
    private $logger;

    /** @var IManager */
    private $shareManager;

    /** @var IUserSession */
    private $userSession;

    /** @var IRootFolder */
    private $root;

    /**
     * @NoAdminRequired
     *
     * @param string $AppName
     * @param IRequest $request
     * @param IL10N $l10n
     * @param ILogger $logger
     * @param IManager $shareManager
     * @param IUserSession $userSession
     * @param IRootFolder $root
     */
    public function __construct(
        $AppName,
        IRequest $request,
        IL10N $l10n,
        ILogger $logger,
        IManager $shareManager,
        IUserSession $userSession,
        IRootFolder $root
    )
    {
        parent::__construct($AppName, $request);
        $this->l = $l10n;
        $this->logger = $logger;
        $this->shareManager = $shareManager;
        $this->userSession = $userSession;
        $this->root = $root;
    }

    public function load($dir, $filename)
    {
        try {
            if (!empty($filename)) {
                $path = $dir . '/' . $filename;
                try {
                    $node = $this->getNode($path);
                } catch (ShareNotFound $e) {
                    return new DataResponse(
                        ['message' => $this->l->t('Invalid share token')],
                        Http::STATUS_BAD_REQUEST
                    );
                } catch (NoUserException $e) {
                    return new DataResponse(
                        ['message' => $this->l->t('No user found')],
                        Http::STATUS_BAD_REQUEST
                    );
                }

                // default of 4MB
                $maxSize = 4194304;
                if ($node->getSize() > $maxSize) {
                    return new DataResponse(['message' => (string)$this->l->t('This file is too big to be opened. Please download the file instead.')], Http::STATUS_BAD_REQUEST);
                }

                /** @var mixed $fileContents */
                $fileContents = $node->getContent();

                if ($fileContents !== false) {
                    $permissions = $this->getPermissions($node);

                    // handle locks
//                    $activePersistentLock = $this->getPersistentLock($node);
//                    if ($activePersistentLock && !$this->verifyPersistentLock($node, $activePersistentLock)) {
                    // there is lock existing on this file
                    // and thus this user cannot write to this file
//                        $writable = false;
//                    } else {
                    // check if permissions allow writing
//                        $writable = ($permissions & Constants::PERMISSION_UPDATE) === Constants::PERMISSION_UPDATE;
//                    }

//                    if ($writable) {
                    // get new/refresh write lock for the user
//                        $activePersistentLock = $this->acquirePersistentLock($node);
//                    }

                    $mime = $node->getMimeType();
                    $mTime = $node->getMTime();
                    $encoding = \mb_detect_encoding($fileContents . "a", "UTF-8, GB2312, GBK ,BIG5, WINDOWS-1252, SJIS-win, EUC-JP, ISO-8859-15, ISO-8859-1, ASCII", true);
                    if ($encoding !== 'UTF-8') {
                        $writable = false;
                        $fileContents = \iconv($encoding, "UTF-8", $fileContents);
                    }
                    if ($fileContents !== false) {
                        return new DataResponse(
                            [
                                'filecontents' => $fileContents,
                                'writeable' => $writable,
//                                'locked' => $activePersistentLock ? $activePersistentLock->getOwner() : null,
                                'mime' => $mime,
                                'mtime' => $mTime
                            ],
                            Http::STATUS_OK
                        );
                    } else {
//                        $this->releasePersistentLock($node, $activePersistentLock);
                        return new DataResponse(['message' => (string)$this->l->t('Cannot convert the encoding to UTF-8.')], Http::STATUS_BAD_REQUEST);
                    }
                } else {
                    return new DataResponse(['message' => (string)$this->l->t('Cannot read the file.')], Http::STATUS_BAD_REQUEST);
                }
            } else {
                return new DataResponse(['message' => (string)$this->l->t('Invalid file path supplied.')], Http::STATUS_BAD_REQUEST);
            }
        } catch (LockedException $e) {
            $message = (string)$this->l->t('The file is locked.');
            return new DataResponse(['message' => $message], Http::STATUS_BAD_REQUEST);
        } catch (ForbiddenException $e) {
            return new DataResponse(['message' => $e->getMessage()], Http::STATUS_BAD_REQUEST);
        } catch (HintException $e) {
            $message = (string)$e->getHint();
            return new DataResponse(['message' => $message], Http::STATUS_BAD_REQUEST);
        } catch (\Exception $e) {
            $message = (string)$this->l->t('An internal server error occurred.');
            return new DataResponse(['message' => $message], Http::STATUS_BAD_REQUEST);
        }
    }

    private function getNode(string $path): File
    {
        $sharingToken = $this->request->getParam('sharingToken');

        if ($sharingToken) {
            $share = $this->shareManager->getShareByToken($sharingToken);
            $node = $share->getNode();
            if (!($node instanceof File)) {
                $node = $node->get($path);
            }
        } else {
            $user = $this->userSession->getUser();
            if (!$user) {
                throw new NoUserException();
            }

            $node = $this->root->get('/' . $user->getUID() . '/files' . $path);
        }

        if (!($node instanceof File)) {
            throw new NotFound();
        }

        return $node;
    }

    private function getPermissions(File $node): int
    {
        $sharingToken = $this->request->getParam('sharingToken');

        if ($sharingToken) {
            $share = $this->shareManager->getShareByToken($sharingToken);
            return $share->getPermissions();
        }

        return $node->getPermissions();
    }

    private function acquirePersistentLock(File $file): ?ILock
    {
        $storage = $file->getStorage();
        if ($storage->instanceOfStorage(IPersistentLockingStorage::class)) {
            $sharingToken = $this->request->getParam('sharingToken');

            if ($sharingToken) {
                $accessToken = $this->getTokenForPublicLinkAccess(
                    $file->getId(),
                    $file->getParent()->getPath(),
                    $sharingToken
                );
                $owner = $this->l->t('Public Link User via Text Editor');
            } else {
                $user = $this->userSession->getUser();
                if (!$user) {
                    return null;
                }
                $accessToken = $this->getTokenForUserAccess(
                    $file->getId(),
                    $file->getParent()->getPath(),
                    $user->getUID()
                );
                $owner = $this->l->t('%s via Text Editor', [$user->getDisplayName()]);
            }

            /**
             * @var IPersistentLockingStorage $storage
             * @phpstan-ignore-next-line
             */
            '@phan-var IPersistentLockingStorage $storage';
            return $storage->lockNodePersistent($file->getInternalPath(), [
                'token' => $accessToken,
                'owner' => $owner
            ]);
        }

        return null;
    }

    private function getPersistentLock(File $file): ?ILock
    {
        $storage = $file->getStorage();
        if ($storage->instanceOfStorage(IPersistentLockingStorage::class)) {
            /**
             * @var IPersistentLockingStorage $storage
             * @phpstan-ignore-next-line
             */
            '@phan-var IPersistentLockingStorage $storage';
            $locks = $storage->getLocks($file->getInternalPath(), false);
            if (\count($locks) > 0) {
                // use active lock (first returned)
                return $locks[0];
            }
        }

        return null;
    }

    private function verifyPersistentLock(File $file, ILock $lock): bool
    {
        $storage = $file->getStorage();
        if ($storage->instanceOfStorage(IPersistentLockingStorage::class)) {
            $sharingToken = $this->request->getParam('sharingToken');

            if ($sharingToken) {
                $accessToken = $this->getTokenForPublicLinkAccess(
                    $file->getId(),
                    $file->getParent()->getPath(),
                    $sharingToken
                );
            } else {
                $user = $this->userSession->getUser();
                if (!$user) {
                    return false;
                }
                $accessToken = $this->getTokenForUserAccess(
                    $file->getId(),
                    $file->getParent()->getPath(),
                    $user->getUID()
                );
            }

            // token in the lock should match access token for this user/share
            return $lock->getToken() === $accessToken;
        }

        return false;
    }

    private function releasePersistentLock(File $file, ILock $lock): bool
    {
        $storage = $file->getStorage();
        if ($storage->instanceOfStorage(IPersistentLockingStorage::class)) {
            /**
             * @var IPersistentLockingStorage $storage
             * @phpstan-ignore-next-line
             */
            '@phan-var IPersistentLockingStorage $storage';
            return $storage->unlockNodePersistent($file->getInternalPath(), [
                'token' => $lock->getToken()
            ]);
        }

        return false;
    }

    private function getTokenForUserAccess(int $fileId, string $fileParentPath, string $userId): string
    {
        // as this app is not collaborative, the token is static
        return JWT::encode([
            'uid' => $userId,
            'st' => '',
            'fid' => $fileId,
            'fpp' => $fileParentPath,
        ], 'files_texteditor', 'HS256');
    }

    private function getTokenForPublicLinkAccess(int $fileId, string $fileParentPath, string $sharingToken): string
    {
        // as this app is not collaborative, the token is static
        return JWT::encode([
            'uid' => '',
            'st' => $sharingToken,
            'fid' => $fileId,
            'fpp' => $fileParentPath,
        ], 'files_texteditor', 'HS256');
    }
}
