// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

window.addEventListener('DOMContentLoaded', () => {
	let proj_form = document.getElementById("proj");

	proj_form.onsubmit = (e) => {
		e.preventDefault();

		let ProjectName = proj_form.ProjectName;
		let Version = proj_form.Version;
		let Description = proj_form.Description;
		let Url = proj_form.Url;
		let Author = proj_form.Author;
		let License = proj_form.License;

		electron.submit(ProjectName, Version, Description, Url, Author, License);
	}
})