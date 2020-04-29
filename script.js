var storage = firebase.storage();
var storageRef = storage.ref();
var imagesRef = storageRef.child("images");

const fileUploadForm = document.querySelector("form");
const fileInput = document.querySelector("#image-upload");
const fileSubmitBtn = document.querySelector("button#submit-btn");
const imagesDiv = document.querySelector("#images");

imagesRef.listAll().then((res) => {
  res.items.forEach((itemRef) => {
    itemRef.getDownloadURL().then((downloadURL) => {
      imagesDiv.innerHTML += getImageDiv(downloadURL, itemRef.name);
    });
  });
});

// fileInput.onchange = fileInputChange;
fileUploadForm.onsubmit = onSubmitForm;

function fileInputChange(e) {
  let selectedFiles = [];
  let files = e.target.files;
  for (let i = 0; i < files.length; i++) {
    if (files[i].size / 1024 / 1024 > 1) {
      alert(
        `${files[i].name} has size greater than 1MB!\nPlease try again with files of size less than 1MB.`
      );
      fileUploadForm.elements[0].labels[0].textContent =
        "Choose image to upload...";
      fileUploadForm.reset();
      return;
    }
    selectedFiles.push(files.item(i));
  }
  let label = selectedFiles.map((file) => file.name).join();
  e.target.labels[0].textContent = label;
}

function onSubmitForm(e) {
  e.preventDefault();
  let files = e.target.elements[0].files;
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let progressId = Date.now().toString(16);
    let fileName = file.name + "-" + progressId;
    let uploadTask = imagesRef.child(fileName).put(file);
    addProgressBar(progressId);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        let progressBar = document.getElementById(`progress-bar-${progressId}`);
        let progress = parseInt(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
      },
      (err) => {},
      () => {
        //Successful
        setTimeout(() => {
          document.getElementById(progressId).remove();
        }, 200);
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log("File available at", downloadURL);
          imagesDiv.innerHTML += getImageDiv(downloadURL, fileName);
        });
      }
    );
  }
  fileUploadForm.elements[0].labels[0].textContent =
    "Choose image to upload...";
  fileUploadForm.reset();
}

function deleteItem(e, url) {
  e.preventDefault();
  const imageRef = storage.refFromURL(url);
  imageRef.delete().then(function () {
    console.log("Deleted");
    e.target.parentElement.remove();
  });
}

function addProgressBar(id) {
  let html = `<div class="progress mt-2" id="${id}">
    <div class="progress-bar" id="progress-bar-${id}" style="width: 0%">0%</div>
  </div>`;
  fileUploadForm.innerHTML += html;
}

function getImageDiv(url, name) {
  return `<div class="col-md-4 col-6 col-lg-3 mt-2 text-center border">
                <img src="${url}" alt="could not load ${name}" class="img-fluid" style="height: 200px"/><br>
                <button class="btn btn-danger btn-sm my-2" onclick="deleteItem(event, '${url}')">Delete</button>
            </div>`;
}
