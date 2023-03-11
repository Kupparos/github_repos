import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GIT_TOKEN,
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const button = document.getElementById("button");
const wrapper = document.getElementById("wrapper");

button.addEventListener("click", searchRepos);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchRepos();
});

input.addEventListener("input", (event) => {
  if (event.key !== "Enter") {
    event.preventDefault();
    const noteElement = document.querySelector(".note");
    if (noteElement) {
      noteElement.remove();
    }
  }
});

async function searchRepos() {
  const query = input.value;
  const noteElement = document.querySelector(".note");

  if (!query || query.length < 1) {
    createNote(noteElement);
    return;
  }

  let response = await octokit.request("GET /search/repositories", {
    per_page: 10,
    q: query,
  });

  if (response.status === 200) {
    const repos = response.data.items;

    // remove bug with scrollIntoView in google chrome
    setTimeout(function () {
      form.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 0);

    input.value = "";
    wrapper.innerHTML = "";

    renderCards(repos);
  } else {
    console.log(`Error ${response.status}`);
  }
}

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };
  return date.toLocaleString("en-US", options);
}

function truncateText(text) {
  if (text.length > 80) {
    text = text.substring(0, 80);
    text = text + "...";
  }
  return text;
}

function createNote(noteElement) {
  if (noteElement === null) {
    let note = document.createElement("p");
    note.innerHTML = "Enter at least 1 character";

    let validateImage = document.createElement("img");
    validateImage.src = "https://api.iconify.design/mdi:close-outline.svg";
    validateImage.alt = "";

    let validation = document.createElement("div");
    validation.classList.add("note");

    validation.appendChild(validateImage);
    validation.appendChild(note);
    input.parentNode.insertBefore(validation, input);
  }
}

function renderCards(repos) {
  if (!repos.length) {
    const emptyEl = document.createElement("h2");
    emptyEl.innerHTML = "Nothing has been found";
    wrapper.appendChild(emptyEl);
    return;
  }
  repos.forEach((repo) => {
    const repoElement = document.createElement("div");
    repoElement.classList.add("card_repo");
    repoElement.innerHTML = `
        <a href=${repo.clone_url} target="_blank"><h2>${repo.name}</h2></a>
        <div class='description'>
        <p><b>Description:</b> ${
          repo.description ? truncateText(repo.description) : "-"
        }</p>
        <p><b>Owner:</b> ${repo.owner.login}</p>
        <p><b>Language:</b> ${repo.language}</p>
        <time><b>Pushed:</b> ${formatDate(new Date(repo.pushed_at))}</time>
        </div>
      `;
    wrapper.appendChild(repoElement);
  });
}
