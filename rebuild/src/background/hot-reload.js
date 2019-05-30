/**
 * HotReload allows to automatically refresh whole extension
 */
class HotReload {
    constructor() {
        this.WATCH_INTERVAL_MS = HotReload.WATCH_INTERVAL_MS;
        this.HARD_RELOAD = HotReload.HARD_RELOAD;

        this.init();
    }

    static get HARD_RELOAD () { return false; }

    static get WATCH_INTERVAL_MS () { return 1000; }
    
    reload() {
        chrome.tabs.query ({ active: true, currentWindow: true }, tabs => { 

            if (this.HARD_RELOAD && tabs[0]) { 
                chrome.tabs.reload(tabs[0].id); 
            }
            chrome.runtime.reload();

        });
    }

    /**
     * Get all files from extension directory
     * @param   {Object} dir 
     * @returns {Promise}
     */
    getFilesInDirectory(dir) { 
        return new Promise(resolve => {

            dir.createReader().readEntries(entries => {
                Promise.all(entries.filter(e => e.name[0] !== '.').map(e =>
                    e.isDirectory
                        ? this.getFilesInDirectory(e)
                        : new Promise(resolve => e.file(resolve))
                ))
                .then(files => [].concat(...files))
                .then(resolve)
            });

        });
    }

    /**
     * Creates timestamp 'hash' with last modified date for every file in directory
     * @param   {Object} dir 
     * @returns {String}
     */
    async timestampForFilesInDirectory(dir) {
        console.log(this.getFilesInDirectory(dir))
        let files = await this.getFilesInDirectory(dir);

        return files.map(file => `${file.name} ${file.lastModifiedDate}`).join();
    }

    /**
     * Watching for changes in timestamps
     * @param {Object} dir 
     * @param {String} [lastTimestamp] 
     */
    watchForChanges(dir, lastTimestamp) {
        this.timestampForFilesInDirectory(dir).then(timestamp => {

            if (!lastTimestamp || (lastTimestamp === timestamp)) {
                setTimeout (() => this.watchForChanges(dir, timestamp), this.WATCH_INTERVAL_MS);
            } else {
                this.reload();
            }
      
        });
    }

    init() {
        chrome.management.getSelf(self => {
            if (self.installType === 'development') {
                chrome.runtime.getPackageDirectoryEntry(dir => this.watchForChanges(dir));
            }
        });
    }
}

new HotReload();