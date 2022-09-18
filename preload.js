// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer, contextBridge } = require("electron")
const path = require("path");

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld("electron", {
    submit: (ProjectName, Version, Description, Url, Author, License) => {
        const data = {
            ProjectName: ProjectName.value,
            Version: Version.value,
            Description: Description.value,
            Url: Url.value,
            Author: Author.value,
            License: License.value
        }
        const result = ipcRenderer.sendSync("select-output-path", [data]);

        if (result == true) {
            ProjectName.value = "";
            Version.value = "";
            Description.value = "";
            Url.value = "";
            Author.value = "";
            License.value = "";
        }
    }
})