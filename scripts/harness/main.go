// Harness: runs an extension folder through the real Gopeed downloader (goja runtime, Go fetch),
// exactly like the desktop app does when a user pastes a link.
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/GopeedLab/gopeed/pkg/base"
	"github.com/GopeedLab/gopeed/pkg/download"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("usage: harness <extension-dir> <url> [--download]")
		os.Exit(2)
	}
	extDir, url := os.Args[1], os.Args[2]
	doDownload := len(os.Args) > 3 && os.Args[3] == "--download"

	storageDir, _ := os.MkdirTemp("", "gopeed-harness")
	downloadDir := filepath.Join(storageDir, "downloads")
	_ = os.MkdirAll(downloadDir, 0o755)
	d := download.NewDownloader(&download.DownloaderConfig{
		Storage:    download.NewBoltStorage(storageDir),
		StorageDir: storageDir,
		DownloaderStoreConfig: &base.DownloaderStoreConfig{
			DownloadDir: downloadDir,
		},
	})
	if err := d.Setup(); err != nil {
		panic(err)
	}
	defer func() {
		if b, err := os.ReadFile(filepath.Join(storageDir, "logs", "extension.log")); err == nil {
			fmt.Println("---- extension.log ----")
			fmt.Println(strings.TrimSpace(string(b)))
		}
	}()

	ext, err := d.InstallExtensionByFolder(extDir, true)
	if err != nil {
		fmt.Println("install error:", err)
		return
	}
	fmt.Printf("installed %s v%s (%d scripts, %d settings)\n", ext.Identity, ext.Version, len(ext.Scripts), len(ext.Settings))
	settings := map[string]any{}
	if v := os.Getenv("TERABOX_COOKIE"); v != "" {
		settings["cookie"] = v
	}
	if v := os.Getenv("TERABOX_API"); v != "" {
		settings["apiBase"] = v
	}
	if v := os.Getenv("TERABOX_PWD"); v != "" {
		settings["password"] = v
	}
	if v := os.Getenv("TERABOX_MIRROR"); v != "" {
		settings["mirror"] = v
	}
	if len(settings) > 0 {
		if err := d.UpdateExtensionSettings(ext.Identity, settings); err != nil {
			fmt.Println("settings error:", err)
			return
		}
	}

	start := time.Now()
	rr, err := d.Resolve(&base.Request{URL: url}, nil)
	fmt.Printf("resolve took %s\n", time.Since(start).Round(time.Millisecond))
	if err != nil {
		fmt.Printf("resolve error (%T): %v\n", err, err)
		return
	}
	b, _ := json.MarshalIndent(rr.Res, "", "  ")
	fmt.Println(string(b))

	if doDownload && rr.Res != nil && len(rr.Res.Files) > 0 {
		file := rr.Res.Files[0]
		id, err := d.CreateDirect(file.Req, &base.Options{Path: downloadDir, Name: file.Name, Extra: map[string]any{"connections": 8}})
		if err != nil {
			fmt.Println("create error:", err)
			return
		}
		deadline := time.Now().Add(150 * time.Second)
		for time.Now().Before(deadline) {
			t := d.GetTask(id)
			if t == nil {
				break
			}
			var downloaded, size, speed int64
			if t.Progress != nil {
				downloaded, speed = t.Progress.Downloaded, t.Progress.Speed
			}
			if t.Meta != nil && t.Meta.Res != nil {
				size = t.Meta.Res.Size
			}
			fmt.Printf("task %s status=%s progress=%d/%d speed=%d url=%s\n", id, t.Status, downloaded, size, speed, t.Meta.Req.URL)
			if t.Status == base.DownloadStatusDone || t.Status == base.DownloadStatusError {
				break
			}
			time.Sleep(1 * time.Second)
		}
	}
	_ = d.Close()
}
