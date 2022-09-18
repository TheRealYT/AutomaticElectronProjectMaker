const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem, shell, BrowserView, screen } = require('electron')
const path = require('path')
const fs = require('fs')

let MainWindowId;
const ZipFilePath = path.join(__dirname, '\asset\/.data', 'ElectronApp.zip')

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 700,
		height: 700,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	MainWindowId = mainWindow.id;

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

ipcMain.on("select-output-path", (event, args) => {
	const data = args[0];
	dialog.showOpenDialog({ title: "Select Output Directory", properties: ["openDirectory"] }).then((value) => {
		if (!value.canceled) {
			// dialog.showMessageBox(BrowserWindow.fromId(MainWindowId), { message: `${value.filePaths}, ${data}`, buttons: ["Ok"] })

			const StreamZip = require('node-stream-zip');
			const zip = new StreamZip({ file: ZipFilePath });
			const finalPath = path.join(value.filePaths[0], data.ProjectName);

			let readFiles = [];
			let readList = [];
			const ignoreList = ['README.txt', 'replace.json'];

			zip.on("error", (er) => {
				console.error('ERROR: ' + er);
			});

			zip.on("ready", () => {
				const entries = zip.entries();

				const replace = JSON.parse(zip.entryDataSync('replace.json').toString());
				replace.forEach((replacement) => {
					replacement.files.forEach((filename) => {
						if (typeof readFiles[filename] == "undefined") {
							readFiles[filename] = zip.entryDataSync(filename).toString();
							readList[readList.length] = filename;
						}
						readFiles[filename] = readFiles[filename].replaceAll(replacement.key, data[replacement.key.substr(1, replacement.key.length - 2)])
					});
				});

				// mkdir => ProjectName
				fs.mkdirSync(finalPath)

				if (!fs.existsSync(finalPath)) return false;

				// extract all entries except => ignoreList[...] & 'readFiles[...]'
				for (const entry of Object.values(entries)) {
					if (typeof readFiles[entry.name] == "undefined" && !ignoreList.includes(entry.name)) {
						if (entry.isDirectory) {
							fs.mkdirSync(path.join(finalPath, entry.name))
						} else {
							let content = zip.entryDataSync(entry.name).toString();
							fs.writeFileSync(path.join(finalPath, entry.name), content);
						}
						console.log(`${path.join(finalPath, entry.name)} Extracted`);
					}
				}

				// write content from readFiles[...]
				readList.forEach(file => {
					fs.writeFileSync(path.join(finalPath, file), readFiles[file]);
				});

				zip.close();
			});

			event.returnValue = true;
		} else {
			event.returnValue = false;
		}
	})
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on("ready", () => {
	const menu = Menu.getApplicationMenu();
	if (menu == null) return;

	menu.append(new MenuItem(
		{
			label: "About",
			click: (menuItem, browserWindow, event) => {
				dialog.showMessageBoxSync(browserWindow, {
					title: "About",
					message: `${app.getName()} - ${app.getVersion()}\n`,
					type: "info",
				})
				shell.openExternal("https://github.com/TheRealYT/AutomaticElectronProjectMaker");
			}
		})
	)
})

// app.on("will-quit", () => {
// })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})